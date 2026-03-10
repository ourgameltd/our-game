import { test, expect } from '@playwright/test';

/**
 * E2E tests for Team Settings - Squad Number Management
 * 
 * Comprehensive test suite covering:
 * - Swapping squad numbers between two players
 * - Clearing a player's squad number
 * - Preventing duplicate squad numbers (validation)
 * - Verifying persistence after page reload
 * 
 * Uses seeded Vale FC data (Reds 2014 team) with 6 players having squad numbers:
 * - Oliver Thompson (#1)
 * - James Wilson (#4)
 * - Lucas Martinez (#7)
 * - Ethan Davies (#9)
 * - Noah Anderson (#10)
 * - Charlie Roberts (#11)
 */
test.describe('Team Settings - Squad Numbers', () => {
  const clubId = '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b'; // Vale FC
  const ageGroupId = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'; // 2014s age group
  const teamId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'; // Reds 2014 team
  
  const teamSettingsUrl = `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/settings`;

  test('should swap two players squad numbers successfully', async ({ page }) => {
    // Navigate to team settings page
    await page.goto(teamSettingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load - verify Squad Numbers section is visible
    await expect(page.getByRole('heading', { name: /Squad Numbers/i })).toBeVisible({ timeout: 15000 });
    
    // Find the input fields for Lucas Martinez (#7) and Noah Anderson (#10)
    // Strategy: Find the player's container div, then find the input within it
    const lucasMartinezRow = page.locator('div:has-text("Lucas Martinez")').filter({ has: page.locator('input[type="number"]') }).first();
    const noahAndersonRow = page.locator('div:has-text("Noah Anderson")').filter({ has: page.locator('input[type="number"]') }).first();
    
    const lucasInput = lucasMartinezRow.locator('input[type="number"]');
    const noahInput = noahAndersonRow.locator('input[type="number"]');
    
    // Verify initial values
    await expect(lucasInput).toHaveValue('7');
    await expect(noahInput).toHaveValue('10');
    
    // Swap the numbers
    await lucasInput.clear();
    await lucasInput.fill('10');
    await noahInput.clear();
    await noahInput.fill('7');
    
    // Verify inputs show the swapped values
    await expect(lucasInput).toHaveValue('10');
    await expect(noahInput).toHaveValue('7');
    
    // Set up response listener before submitting
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/teams/${teamId}/squad-numbers`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    // Click Save Changes button
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    
    // Wait for navigation or success indication
    await page.waitForTimeout(1000);
    
    // Reload the page to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Squad Numbers/i })).toBeVisible({ timeout: 15000 });
    
    // Find the input fields again after reload
    const lucasRowAfterReload = page.locator('div:has-text("Lucas Martinez")').filter({ has: page.locator('input[type="number"]') }).first();
    const noahRowAfterReload = page.locator('div:has-text("Noah Anderson")').filter({ has: page.locator('input[type="number"]') }).first();
    
    const lucasInputAfterReload = lucasRowAfterReload.locator('input[type="number"]');
    const noahInputAfterReload = noahRowAfterReload.locator('input[type="number"]');
    
    // Assert the swapped numbers persisted
    await expect(lucasInputAfterReload).toHaveValue('10');
    await expect(noahInputAfterReload).toHaveValue('7');
    
    // Clean up: Swap back to original values for other tests
    await lucasInputAfterReload.clear();
    await lucasInputAfterReload.fill('7');
    await noahInputAfterReload.clear();
    await noahInputAfterReload.fill('10');
    
    const cleanupResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/teams/${teamId}/squad-numbers`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await cleanupResponsePromise;
    await page.waitForTimeout(500);
  });

  test('should clear a player squad number successfully', async ({ page }) => {
    // Navigate to team settings page
    await page.goto(teamSettingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Squad Numbers/i })).toBeVisible({ timeout: 15000 });
    
    // Find Charlie Roberts who has #11
    const charlieRobertsRow = page.locator('div:has-text("Charlie Roberts")').filter({ has: page.locator('input[type="number"]') }).first();
    const charlieInput = charlieRobertsRow.locator('input[type="number"]');
    
    // Verify initial value
    await expect(charlieInput).toHaveValue('11');
    
    // Clear the squad number
    await charlieInput.clear();
    
    // Verify input is empty
    await expect(charlieInput).toHaveValue('');
    
    // Set up response listener before submitting
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/teams/${teamId}/squad-numbers`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    // Click Save Changes button
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    
    // Wait for success indication
    await page.waitForTimeout(1000);
    
    // Reload the page to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Squad Numbers/i })).toBeVisible({ timeout: 15000 });
    
    // Find the input field again after reload
    const charlieRowAfterReload = page.locator('div:has-text("Charlie Roberts")').filter({ has: page.locator('input[type="number"]') }).first();
    const charlieInputAfterReload = charlieRowAfterReload.locator('input[type="number"]');
    
    // Assert the number is still cleared
    await expect(charlieInputAfterReload).toHaveValue('');
    
    // Clean up: Restore the original squad number for other tests
    await charlieInputAfterReload.fill('11');
    
    const cleanupResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/teams/${teamId}/squad-numbers`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await cleanupResponsePromise;
    await page.waitForTimeout(500);
  });

  test('should prevent duplicate squad numbers with validation error', async ({ page }) => {
    // Navigate to team settings page
    await page.goto(teamSettingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Squad Numbers/i })).toBeVisible({ timeout: 15000 });
    
    // Find two different players to give the same number
    const jamesWilsonRow = page.locator('div:has-text("James Wilson")').filter({ has: page.locator('input[type="number"]') }).first();
    const ethanDaviesRow = page.locator('div:has-text("Ethan Davies")').filter({ has: page.locator('input[type="number"]') }).first();
    
    const jamesInput = jamesWilsonRow.locator('input[type="number"]');
    const ethanInput = ethanDaviesRow.locator('input[type="number"]');
    
    // Verify initial values (James #4, Ethan #9)
    await expect(jamesInput).toHaveValue('4');
    await expect(ethanInput).toHaveValue('9');
    
    // Change Ethan's number to match James's (#4)
    await ethanInput.clear();
    await ethanInput.fill('4');
    
    // Both inputs should now show #4
    await expect(jamesInput).toHaveValue('4');
    await expect(ethanInput).toHaveValue('4');
    
    // Wait for validation error message to appear
    await expect(page.getByText(/Duplicate squad numbers detected/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/4/)).toBeVisible(); // The duplicate number should be listed
    
    // Verify that the Save Changes button is disabled
    const saveButton = page.getByRole('button', { name: /Save Changes/i });
    await expect(saveButton).toBeDisabled();
    
    // Verify the duplicate inputs have error styling
    // The inputs should have a red border (border-red-500 class)
    await expect(jamesInput).toHaveClass(/border-red-500/);
    await expect(ethanInput).toHaveClass(/border-red-500/);
    
    // Fix the duplicate by changing Ethan's number back to 9
    await ethanInput.clear();
    await ethanInput.fill('9');
    
    // Wait for error message to disappear
    await expect(page.getByText(/Duplicate squad numbers detected/i)).not.toBeVisible({ timeout: 5000 });
    
    // Verify Save Changes button is now enabled
    await expect(saveButton).toBeEnabled();
    
    // Verify the error styling is removed
    await expect(jamesInput).not.toHaveClass(/border-red-500/);
    await expect(ethanInput).not.toHaveClass(/border-red-500/);
  });

  test('should handle squad number updates with mixed changes', async ({ page }) => {
    // Navigate to team settings page
    await page.goto(teamSettingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Squad Numbers/i })).toBeVisible({ timeout: 15000 });
    
    // Perform multiple changes at once:
    // - Change Oliver Thompson from #1 to #99
    // - Change James Wilson from #4 to #1 (take Oliver's old number)
    
    const oliverRow = page.locator('div:has-text("Oliver Thompson")').filter({ has: page.locator('input[type="number"]') }).first();
    const jamesRow = page.locator('div:has-text("James Wilson")').filter({ has: page.locator('input[type="number"]') }).first();
    
    const oliverInput = oliverRow.locator('input[type="number"]');
    const jamesInput = jamesRow.locator('input[type="number"]');
    
    // Verify initial values
    await expect(oliverInput).toHaveValue('1');
    await expect(jamesInput).toHaveValue('4');
    
    // Make the changes
    await oliverInput.clear();
    await oliverInput.fill('99');
    await jamesInput.clear();
    await jamesInput.fill('1');
    
    // Verify new values
    await expect(oliverInput).toHaveValue('99');
    await expect(jamesInput).toHaveValue('1');
    
    // Set up response listener before submitting
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/teams/${teamId}/squad-numbers`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    // Click Save Changes button
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    
    // Wait for success indication
    await page.waitForTimeout(1000);
    
    // Reload the page to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Squad Numbers/i })).toBeVisible({ timeout: 15000 });
    
    // Find the input fields again after reload
    const oliverRowAfterReload = page.locator('div:has-text("Oliver Thompson")').filter({ has: page.locator('input[type="number"]') }).first();
    const jamesRowAfterReload = page.locator('div:has-text("James Wilson")').filter({ has: page.locator('input[type="number"]') }).first();
    
    const oliverInputAfterReload = oliverRowAfterReload.locator('input[type="number"]');
    const jamesInputAfterReload = jamesRowAfterReload.locator('input[type="number"]');
    
    // Assert the changes persisted
    await expect(oliverInputAfterReload).toHaveValue('99');
    await expect(jamesInputAfterReload).toHaveValue('1');
    
    // Clean up: Restore original values
    await oliverInputAfterReload.clear();
    await oliverInputAfterReload.fill('1');
    await jamesInputAfterReload.clear();
    await jamesInputAfterReload.fill('4');
    
    const cleanupResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/teams/${teamId}/squad-numbers`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await cleanupResponsePromise;
    await page.waitForTimeout(500);
  });
});
