import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test('should load and update profile successfully', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible({ timeout: 15000 });
    
    // Click Edit Profile
    await page.getByTitle('Edit Profile').click();
    
    // Verify form is in edit mode
    await expect(page.getByPlaceholder('First Name')).toBeVisible();
    
    // Fill out the form
    await page.getByPlaceholder('First Name').fill('Michael');
    await page.getByPlaceholder('Last Name').fill('Law');
    await page.locator('input[type="email"]').fill('michael@michaellaw.me');
    
    // Submit
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    // Verify success message appears
    await expect(page.getByText('Profile updated successfully!')).toBeVisible({ timeout: 10000 });
    
    // Verify we're back in read-only mode
    await expect(page.getByTitle('Edit Profile')).toBeVisible();
  });
  
  test('should cancel edit mode without saving', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible({ timeout: 15000 });
    
    // Enter edit mode
    await page.getByTitle('Edit Profile').click();
    await expect(page.getByPlaceholder('First Name')).toBeVisible();
    
    // Make a change
    await page.getByPlaceholder('First Name').fill('Different Name');
    
    // Cancel
    await page.getByRole('button', { name: /Cancel/i }).click();
    
    // Verify we're back in read-only mode
    await expect(page.getByTitle('Edit Profile')).toBeVisible();
  });
});
