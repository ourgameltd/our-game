import { test, expect, Page } from '@playwright/test';

const clubId = '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b';
const ageGroupId = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d';
const teamName = 'Black';
const coachName = 'Andy Campbell';
const originalAssociationId = 'seed-assoc-andy-campbell';
const updatedAssociationId = 'seed-assoc-andy-campbell-e2e';
const fallbackDateOfBirth = '1988-01-01';
const associationIdLabelPattern = /(?:Association ID|FA Registration ID)/i;

async function goToBlackTeamCoachesPage(page: Page) {
  const teamsResponsePromise = page.waitForResponse(
    response => response.url().includes(`/api/v1/age-groups/${ageGroupId}/teams`) && response.request().method() === 'GET',
    { timeout: 15000 }
  );

  await page.goto(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await expect(page.getByRole('heading', { name: /2014s Teams/i })).toBeVisible({ timeout: 15000 });

  const teamsResponse = await teamsResponsePromise;
  const teamsPayload = await teamsResponse.json();
  const blackTeam = teamsPayload.data?.find((team: { id: string; name: string }) => team.name === teamName);

  expect(blackTeam?.id).toBeTruthy();

  await page.goto(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${blackTeam.id}/coaches`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await expect(page.getByRole('heading', { name: /Coaching Staff/i })).toBeVisible({ timeout: 15000 });
}

async function openCoachProfileFromTeamCoaches(page: Page, name: string) {
  const coachLink = page.locator('a').filter({ hasText: name }).first();

  await Promise.all([
    page.waitForURL(/\/coaches\/[^/]+$/, { timeout: 15000 }),
    coachLink.click(),
  ]);

  await expect(page.getByRole('main').getByRole('heading', { name }).first()).toBeVisible({ timeout: 15000 });
}

async function openCoachSettings(page: Page) {
  if (/\/settings$/.test(page.url())) {
    await expect(page.getByRole('heading', { name: /Coach Settings/i })).toBeVisible({ timeout: 15000 });
    return;
  }

  const coachSettingsControl = page
    .getByRole('link', { name: /Settings/i })
    .or(page.getByRole('button', { name: /Settings/i }))
    .or(page.locator('a[title="Coach Settings"], button[title="Coach Settings"]'))
    .first();

  await expect(coachSettingsControl).toBeVisible({ timeout: 15000 });

  await Promise.all([
    page.waitForURL(/\/settings$/, { timeout: 15000 }),
    coachSettingsControl.click(),
  ]);

  await expect(page.getByRole('heading', { name: /Coach Settings/i })).toBeVisible({ timeout: 15000 });
}

async function saveCoachAssociationId(page: Page, associationId: string) {
  const associationIdInput = page.getByPlaceholder('e.g., SFA-12345');
  const dateOfBirthInput = page.locator('input[type="date"]').first();

  if ((await dateOfBirthInput.inputValue()) === '') {
    await dateOfBirthInput.fill(fallbackDateOfBirth);
    await expect(dateOfBirthInput).toHaveValue(fallbackDateOfBirth);
  }

  await associationIdInput.fill(associationId);
  await expect(associationIdInput).toHaveValue(associationId);

  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/v1/coaches/') && response.request().method() === 'PUT',
    { timeout: 15000 }
  );

  await page.getByRole('button', { name: /Save Changes/i }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Coaching Staff/i })).toBeVisible({ timeout: 15000 });
}

test.describe('Coach Settings - Association IDs', () => {
  test('should persist coach association ID changes through the settings flow and reflect them on coach pages', async ({ page }) => {
    let restoreOriginalAssociationId = false;

    try {
      await goToBlackTeamCoachesPage(page);

      await openCoachProfileFromTeamCoaches(page, coachName);
      await expect(page.getByText(associationIdLabelPattern)).toBeVisible();
      await expect(page.getByText(originalAssociationId)).toBeVisible();

      await openCoachSettings(page);

      const associationIdInput = page.getByPlaceholder('e.g., SFA-12345');
      await expect(associationIdInput).toHaveValue(originalAssociationId);

      restoreOriginalAssociationId = true;
      await saveCoachAssociationId(page, updatedAssociationId);

      await openCoachProfileFromTeamCoaches(page, coachName);
      await expect(page.getByText(associationIdLabelPattern)).toBeVisible();
      await expect(page.getByText(updatedAssociationId)).toBeVisible();
    } finally {
      if (restoreOriginalAssociationId) {
        await openCoachSettings(page);
        await saveCoachAssociationId(page, originalAssociationId);
      }
    }
  });
});