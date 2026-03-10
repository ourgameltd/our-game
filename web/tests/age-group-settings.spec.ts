import { test, expect } from '@playwright/test';

/**
 * E2E tests for Age Group Settings
 * 
 * Comprehensive test suite covering:
 * - Create age group
 * - Edit age group
 * - Seasons array field serialization (critical - proving proper array handling)
 * - Archive functionality
 * - Verification of existing seeded data
 * 
 * Uses seeded Vale FC data and creates test age groups with unique identifiers
 * to avoid collisions across test runs.
 */
test.describe('Age Group Settings', () => {
  const clubId = '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b'; // Vale FC seeded club ID
  
  // Generate unique identifiers for test age group to avoid collisions
  const timestamp = Date.now();
  const uniqueCode = `E2E${timestamp}`;
  const uniqueName = `E2E Test Age Group ${timestamp}`;
  
  // Store created age group ID for reuse across tests
  let createdAgeGroupId: string;

  test('should create a new age group successfully', async ({ page }) => {
    // Navigate to new age group page
    const newAgeGroupUrl = `/dashboard/${clubId}/age-groups/new`;
    await page.goto(newAgeGroupUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load and verify heading
    await expect(page.getByRole('heading', { name: /Create Age Group/i })).toBeVisible({ timeout: 15000 });
    
    // Fill form fields
    await page.locator('input[name="name"]').fill(uniqueName);
    await page.locator('input[name="code"]').fill(uniqueCode);
    
    // Select level (assuming a select or input field)
    const levelField = page.locator('select[name="level"], input[name="level"]').first();
    if (await levelField.evaluate(el => el.tagName) === 'SELECT') {
      await levelField.selectOption('Youth');
    } else {
      await levelField.fill('Youth');
    }
    
    // Fill season field
    await page.locator('input[name="season"], input[placeholder*="Season"]').fill('2024/25');
    
    // Set up response listener before submitting
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/clubs/${clubId}/age-groups`) && 
                  response.request().method() === 'POST',
      { timeout: 15000 }
    );
    
    // Submit form
    await page.getByRole('button', { name: /Create|Save/i }).click();
    
    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    
    // Capture created age group ID from response
    const responseBody = await response.json();
    createdAgeGroupId = responseBody.id || responseBody.ageGroupId;
    expect(createdAgeGroupId).toBeTruthy();
    
    // Verify navigation to age group overview page
    await expect(page).toHaveURL(new RegExp(`/dashboard/${clubId}/age-groups/${createdAgeGroupId}`), { timeout: 10000 });
    
    // Verify age group name appears on overview page
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 15000 });
  });

  test('should edit age group successfully', async ({ page }) => {
    // Skip if no age group was created
    test.skip(!createdAgeGroupId, 'No age group created in previous test');
    
    // Navigate to edit page
    const editUrl = `/dashboard/${clubId}/age-groups/${createdAgeGroupId}/edit`;
    await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Edit Age Group/i })).toBeVisible({ timeout: 15000 });
    
    // Change the name
    const updatedName = `${uniqueName} Updated`;
    const nameInput = page.locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill(updatedName);
    
    // Set up response listener before submitting
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/age-groups/${createdAgeGroupId}`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    // Submit form
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    
    // Verify navigation back to overview
    await expect(page).toHaveURL(new RegExp(`/dashboard/${clubId}/age-groups/${createdAgeGroupId}`), { timeout: 10000 });
    
    // Verify updated name appears on overview page
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 15000 });
  });

  test('should properly serialize and deserialize seasons array', async ({ page }) => {
    // Skip if no age group was created
    test.skip(!createdAgeGroupId, 'No age group created in previous test');
    
    // Navigate to settings page
    const settingsUrl = `/dashboard/${clubId}/age-groups/${createdAgeGroupId}/settings`;
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Age Group Settings|Settings/i })).toBeVisible({ timeout: 15000 });
    
    // Verify initial season is present (2024/25)
    await expect(page.getByText('2024/25')).toBeVisible();
    
    // Add a second season
    const addSeasonInput = page.locator('input[placeholder*="Add Season"], input[placeholder*="season"]').last();
    await addSeasonInput.fill('2023/24');
    
    // Click Add Season button (or press Enter if no button)
    const addButton = page.getByRole('button', { name: /Add Season/i });
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.click();
    } else {
      await addSeasonInput.press('Enter');
    }
    
    // Wait for the second season to appear in the list
    await expect(page.getByText('2023/24')).toBeVisible({ timeout: 5000 });
    
    // Set 2023/24 as default season
    // Look for the "Set Default" button in the row containing "2023/24"
    const season2023Row = page.locator('tr, div, li').filter({ hasText: '2023/24' });
    const setDefaultButton = season2023Row.getByRole('button', { name: /Set Default/i }).first();
    await setDefaultButton.click();
    
    // Wait for default badge to appear on 2023/24
    await expect(season2023Row.getByText(/Default/i)).toBeVisible({ timeout: 5000 });
    
    // Set up response listener before saving
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/age-groups/${createdAgeGroupId}`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    // Click Save Changes button
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    
    // Reload the settings page to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for page to load after reload
    await expect(page.getByRole('heading', { name: /Age Group Settings|Settings/i })).toBeVisible({ timeout: 15000 });
    
    // CRITICAL: Verify both seasons are present as separate list items
    // This proves the field is a proper array, not a broken string serialization
    const seasonsContainer = page.locator('ul, table, div').filter({ hasText: '2024/25' });
    await expect(seasonsContainer.getByText('2024/25', { exact: true })).toBeVisible();
    await expect(seasonsContainer.getByText('2023/24', { exact: true })).toBeVisible();
    
    // Verify the default badge is on 2023/24
    const season2023RowAfterReload = page.locator('tr, div, li').filter({ hasText: '2023/24' });
    await expect(season2023RowAfterReload.getByText(/Default/i)).toBeVisible();
    
    // Verify the values don't contain JSON artifacts (no brackets, quotes, etc.)
    const pageContent = await page.content();
    expect(pageContent).not.toContain('["2024/25"');
    expect(pageContent).not.toContain('"2024/25"');
    expect(pageContent).not.toContain('[&quot;');
  });

  test('should archive age group and toggle visibility', async ({ page }) => {
    // Skip if no age group was created
    test.skip(!createdAgeGroupId, 'No age group created in previous test');
    
    // Navigate to settings page
    const settingsUrl = `/dashboard/${clubId}/age-groups/${createdAgeGroupId}/settings`;
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Age Group Settings|Settings/i })).toBeVisible({ timeout: 15000 });
    
    // Register dialog handler to accept confirmation
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain(/archive/i);
      dialog.accept();
    });
    
    // Set up response listener before archiving
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/age-groups/${createdAgeGroupId}/archive`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );
    
    // Click archive button
    const archiveButton = page.getByRole('button', { name: /Archive/i });
    await archiveButton.click();
    
    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(204);
    
    // Verify archived state is shown (banner, badge, or notification)
    await expect(page.getByText(/Archived|This age group is archived/i)).toBeVisible({ timeout: 10000 });
    
    // Verify Save Changes button is disabled
    const saveButton = page.getByRole('button', { name: /Save Changes/i });
    await expect(saveButton).toBeDisabled();
    
    // Navigate to age groups list page
    const listUrl = `/dashboard/${clubId}/age-groups`;
    await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Age Groups/i })).toBeVisible({ timeout: 15000 });
    
    // Verify archived age group is NOT visible by default
    await expect(page.getByText(`${uniqueName} Updated`)).not.toBeVisible({ timeout: 5000 });
    
    // Toggle "Show Archived Age Groups" filter
    const showArchivedToggle = page.locator('input[type="checkbox"]').filter({ hasText: /Show Archived|Archived/i }).or(
      page.getByRole('checkbox', { name: /Show Archived|Archived/i })
    );
    
    // If the toggle exists as a checkbox input, click it
    if (await showArchivedToggle.count() > 0) {
      await showArchivedToggle.first().check();
    } else {
      // Otherwise look for a button or switch
      const showArchivedButton = page.getByRole('button', { name: /Show Archived|Archived/i }).or(
        page.getByText(/Show Archived|Include Archived/i)
      );
      await showArchivedButton.first().click();
    }
    
    // Wait a moment for the filter to apply
    await page.waitForTimeout(1000);
    
    // Verify the archived age group NOW appears in the list
    await expect(page.getByText(`${uniqueName} Updated`)).toBeVisible({ timeout: 10000 });
    
    // Verify archived badge or indicator is shown
    const ageGroupRow = page.locator('tr, div, li').filter({ hasText: `${uniqueName} Updated` });
    await expect(ageGroupRow.getByText(/Archived/i)).toBeVisible();
  });

  test('should display existing seeded age group seasons without JSON artifacts', async ({ page }) => {
    // Use a known seeded age group from Vale FC (2014s age group)
    // This ID should match one from the seeder data
    const seededAgeGroupId = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'; // Replace with actual seeded ID if known
    
    // Navigate to a seeded age group's settings page
    // If we don't know the exact ID, navigate to the list first
    const listUrl = `/dashboard/${clubId}/age-groups`;
    await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Age Groups/i })).toBeVisible({ timeout: 15000 });
    
    // Click on the first age group in the list (should be a seeded one)
    const firstAgeGroup = page.locator('a, button').filter({ hasText: /2014|2015|2016|Youth/i }).first();
    
    // Skip test if no seeded age groups found
    if (await firstAgeGroup.count() === 0) {
      test.skip(true, 'No seeded age groups found to test');
      return;
    }
    
    await firstAgeGroup.click();
    
    // Wait for overview page to load
    await page.waitForURL(/\/age-groups\/[a-f0-9-]+$/, { timeout: 10000 });
    
    // Navigate to settings from overview
    const settingsLink = page.getByRole('link', { name: /Settings/i });
    if (await settingsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await settingsLink.click();
    } else {
      // Construct settings URL from current URL
      const currentUrl = page.url();
      await page.goto(`${currentUrl}/settings`, { waitUntil: 'domcontentloaded' });
    }
    
    // Wait for settings page to load
    await expect(page.getByRole('heading', { name: /Age Group Settings|Settings/i })).toBeVisible({ timeout: 15000 });
    
    // Verify seasons are displayed (if present)
    const pageContent = await page.content();
    
    // Check for seasons section
    const seasonsSection = page.locator('section, div').filter({ hasText: /Season/i }).first();
    
    if (await seasonsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      // CRITICAL: Verify no JSON artifacts in the displayed content
      expect(pageContent).not.toContain('["');
      expect(pageContent).not.toContain('"]');
      expect(pageContent).not.toContain('[&quot;');
      expect(pageContent).not.toContain('&quot;]');
      
      // Verify seasons are displayed as clean text (e.g., "2024/25", "2023/24")
      // Look for season patterns without brackets or quotes
      const seasonPattern = /\d{4}\/\d{2}/;
      const hasSeasonText = seasonPattern.test(await seasonsSection.textContent() || '');
      
      if (hasSeasonText) {
        // If seasons exist, verify they're displayed cleanly
        const seasonsText = await seasonsSection.textContent();
        expect(seasonsText).toMatch(seasonPattern);
        expect(seasonsText).not.toContain('"');
        expect(seasonsText).not.toContain('[');
        expect(seasonsText).not.toContain(']');
      }
    }
  });
});
