import { test, expect } from '@playwright/test';

/**
 * E2E tests for club settings update flow
 * 
 * Tests the ability to update club settings including founded year
 * without encountering 500 errors. Uses seeded Vale FC data.
 */
test.describe('Club Settings', () => {
  const clubId = '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b'; // Vale FC seeded club ID
  const settingsUrl = `/dashboard/${clubId}/settings`;
  const overviewUrl = `/dashboard/${clubId}`;

  test('should load club settings page successfully', async ({ page }) => {
    // Navigate to club settings page
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load and verify heading
    await expect(page.getByRole('heading', { name: 'Club Settings' })).toBeVisible({ timeout: 15000 });
    
    // Verify form fields are present
    await expect(page.locator('input[name="venue"]')).toBeVisible();
    await expect(page.locator('input[name="founded"]')).toBeVisible();
  });

  test('should update club settings successfully', async ({ page }) => {
    // Navigate to club settings page
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Club Settings' })).toBeVisible({ timeout: 15000 });
    
    // Store original venue value for restoration later
    const venueInput = page.locator('input[name="venue"]');
    const originalVenue = await venueInput.inputValue();
    
    // Edit the venue field with a test value
    const testVenue = 'Test Stadium - E2E Test';
    await venueInput.clear();
    await venueInput.fill(testVenue);
    
    // Ensure founded year has a valid value
    const foundedInput = page.locator('input[name="founded"]');
    const currentFounded = await foundedInput.inputValue();
    
    // If founded is empty or invalid, set a valid value
    if (!currentFounded || parseInt(currentFounded) < 1800) {
      await foundedInput.clear();
      await foundedInput.fill('1950');
    }
    
    // Set up request/response listener before clicking save
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/clubs/${clubId}`) && response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    // Click Save Changes button
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    
    // Verify navigation back to club overview page
    await expect(page).toHaveURL(overviewUrl, { timeout: 10000 });
    
    // Verify club overview page loaded successfully
    await expect(page.getByRole('heading', { name: /Vale FC/i })).toBeVisible({ timeout: 15000 });
    
    // Navigate back to settings to restore original value for test repeatability
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Club Settings' })).toBeVisible({ timeout: 15000 });
    
    // Verify the test venue was saved
    await expect(venueInput).toHaveValue(testVenue);
    
    // Restore original venue value
    await venueInput.clear();
    await venueInput.fill(originalVenue);
    
    // Save the restoration
    const restoreResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/clubs/${clubId}`) && response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    await page.getByRole('button', { name: /Save Changes/i }).click();
    const restoreResponse = await restoreResponsePromise;
    expect(restoreResponse.status()).toBe(200);
  });

  test('should validate founded year is a number', async ({ page }) => {
    // Navigate to club settings page
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Club Settings' })).toBeVisible({ timeout: 15000 });
    
    // Try to enter invalid founded year
    const foundedInput = page.locator('input[name="founded"]');
    await foundedInput.clear();
    await foundedInput.fill('invalid');
    
    // Verify input type="number" prevents non-numeric input or rejects it
    const foundedValue = await foundedInput.inputValue();
    
    // The input field might be empty or have a valid number, but not "invalid"
    expect(foundedValue).not.toBe('invalid');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Navigate to club settings page
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Club Settings' })).toBeVisible({ timeout: 15000 });
    
    // Set founded to an extreme value that might cause validation errors
    const foundedInput = page.locator('input[name="founded"]');
    await foundedInput.clear();
    await foundedInput.fill('9999');
    
    // Set up request/response listener
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/clubs/${clubId}`) && response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    // Click Save Changes
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    // Wait for response (might be 200 or 400 depending on validation)
    const response = await responsePromise;
    
    // Verify response is not a 500 error
    expect(response.status()).not.toBe(500);
    
    // If we got a success response, restore a reasonable value
    if (response.status() === 200) {
      await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await expect(page.getByRole('heading', { name: 'Club Settings' })).toBeVisible({ timeout: 15000 });
      
      await foundedInput.clear();
      await foundedInput.fill('1950');
      
      await page.getByRole('button', { name: /Save Changes/i }).click();
      await page.waitForURL(overviewUrl, { timeout: 10000 });
    }
  });
});
