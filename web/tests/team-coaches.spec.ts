import { test, expect, Page } from '@playwright/test';

const clubId = '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b';
const ageGroupId = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d';
const teamName = 'Black';
const coachName = 'Chris Boult';
const coachAssociationId = 'seed-assoc-chris-boult';

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

test.describe('Team Coaches - Association IDs', () => {
  test('should show a seeded coach association ID on the team coaches page', async ({ page }) => {
    await goToBlackTeamCoachesPage(page);

    const coachRow = page.locator('a').filter({ hasText: coachName }).first();

    await expect(coachRow).toContainText(coachName);
    await expect(coachRow).toContainText(`FA ID: ${coachAssociationId}`);
  });
});