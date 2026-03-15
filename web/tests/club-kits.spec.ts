import { test, expect } from '@playwright/test';

test.describe('Club Kits', () => {
  const clubId = '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b';
  const clubKitsUrl = `/dashboard/${clubId}/kits`;

  test('club kit changes persist across reloads', async ({ page }) => {
    const suffix = Date.now().toString();
    const createdKitName = `E2E Club Kit ${suffix}`;
    const updatedKitName = `E2E Club Kit Updated ${suffix}`;

    const createKit = async (name: string, shirtColor: string, shortsColor: string, socksColor: string) => {
      const builder = page.locator('form').first();

      await builder.locator('input[placeholder="e.g., Home Kit, Away Kit"]').fill(name);
      await builder.locator('select').first().selectOption('away');
      await builder.locator('input[type="text"]').nth(1).fill(shirtColor);
      await builder.locator('input[type="text"]').nth(2).fill(shortsColor);
      await builder.locator('input[type="text"]').nth(3).fill(socksColor);
    };

    const findKitCard = (name: string) =>
      page.locator('div.card-hover').filter({ has: page.getByRole('heading', { name }) }).first();

    await page.goto(clubKitsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Vale FC - Kit Management/i })).toBeVisible({ timeout: 15000 });

    const createButton = page.getByTitle('Create Kit');
    await expect(createButton).toBeVisible();
    await createButton.click();

    await expect(page.getByRole('heading', { name: 'Create New Kit' })).toBeVisible();
    await createKit(createdKitName, '#123456', '#654321', '#abcdef');

    const createResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/clubs/${clubId}/kits`) && response.request().method() === 'POST',
      { timeout: 15000 }
    );

    await page.getByRole('button', { name: 'Create Kit' }).click();

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);

    const createdCard = findKitCard(createdKitName);
    await expect(createdCard).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Create New Kit' })).not.toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Vale FC - Kit Management/i })).toBeVisible({ timeout: 15000 });
    await expect(findKitCard(createdKitName)).toBeVisible({ timeout: 15000 });

    await findKitCard(createdKitName).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Kit' })).toBeVisible();

    const editForm = page.locator('form').first();
    await editForm.locator('input[placeholder="e.g., Home Kit, Away Kit"]').fill(updatedKitName);
    await editForm.locator('input[type="text"]').nth(1).fill('#224466');

    const updateResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/clubs/${clubId}/kits/`) && response.request().method() === 'PUT',
      { timeout: 15000 }
    );

    await page.getByRole('button', { name: 'Update Kit' }).click();

    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(200);

    await expect(findKitCard(updatedKitName)).toBeVisible({ timeout: 15000 });

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Vale FC - Kit Management/i })).toBeVisible({ timeout: 15000 });
    await expect(findKitCard(updatedKitName)).toBeVisible({ timeout: 15000 });

    page.once('dialog', dialog => dialog.accept());

    const deleteResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/clubs/${clubId}/kits/`) && response.request().method() === 'DELETE',
      { timeout: 15000 }
    );

    await findKitCard(updatedKitName).getByRole('button', { name: 'Delete' }).click();

    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.status()).toBe(204);

    await expect(findKitCard(updatedKitName)).not.toBeVisible({ timeout: 15000 });

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Vale FC - Kit Management/i })).toBeVisible({ timeout: 15000 });
    await expect(findKitCard(updatedKitName)).not.toBeVisible();
  });
});