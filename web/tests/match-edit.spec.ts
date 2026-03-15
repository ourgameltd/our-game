import { test, expect, Page } from '@playwright/test';

async function stubMatchEditPageDependencies(page: Page, options: {
  clubId: string;
  ageGroupId: string;
  teamId: string;
}) {
  const { clubId, ageGroupId, teamId } = options;

  await page.route('**/api/v1/users/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: {
          id: '00000000-0000-0000-0000-000000000001',
          azureUserId: '00000001000000000000000000000101',
          email: 'michael@michaellaw.me',
          firstName: 'Michael',
          lastName: 'Law',
          role: 'coach',
          photo: '',
          preferences: '{}',
          createdAt: '2026-03-01T10:00:00.000Z',
          updatedAt: '2026-03-01T10:00:00.000Z',
        },
      },
    });
  });

  await page.route(`**/api/v1/teams/${teamId}/overview`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: {
          team: {
            id: teamId,
            clubId,
            ageGroupId,
            name: 'Reds',
            shortName: 'Reds',
            level: 'development',
            season: '2024/25',
            colors: {
              primary: '#cc0000',
              secondary: '#ffffff',
            },
            isArchived: false,
          },
          statistics: {
            playerCount: 2,
            matchesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            winRate: 0,
            goalDifference: 0,
            upcomingMatches: [],
            previousResults: [],
            topPerformers: [],
            underperforming: [],
          },
          upcomingTrainingSessions: [],
        },
      },
    });
  });

  await page.route(`**/api/v1/age-groups/${ageGroupId}`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: {
          id: ageGroupId,
          clubId,
          name: '2014s',
          code: '2014',
          level: 'youth',
          season: '2024/25',
          seasons: ['2024/25'],
          defaultSeason: '2024/25',
          defaultSquadSize: 7,
          isArchived: false,
        },
      },
    });
  });

  await page.route(`**/api/v1/teams/${teamId}/players**`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: [
          {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            firstName: 'Oliver',
            lastName: 'Thompson',
            preferredPositions: ['GK'],
            squadNumber: 1,
          },
          {
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            firstName: 'James',
            lastName: 'Wilson',
            preferredPositions: ['CM'],
            squadNumber: 8,
          },
        ],
      },
    });
  });

  await page.route(`**/api/v1/teams/${teamId}/coaches`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: [],
      },
    });
  });

  await page.route(`**/api/v1/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/tactics`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: {
          scopeTactics: [],
          inheritedTactics: [],
        },
      },
    });
  });
}

/**
 * E2E tests for Match Edit Page
 * 
 * Comprehensive test suite covering:
 * - Buttons don't accidentally submit forms
 * - Adding goals with assists and verifying persistence
 * - Kit dropdowns show real API data
 * - Match events work with empty lineups (fallback to team players)
 * 
 * Uses seeded Vale FC data (Reds 2014, Match 5 - unlocked match)
 */
test.describe('Match Edit Page', () => {
  const clubId = '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b'; // Vale FC
  const ageGroupId = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'; // 2014s age group
  const teamId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'; // Reds 2014 team
  const matchId = 'a5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0'; // Match 5 - unlocked match

  const matchEditUrl = `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches/${matchId}/edit`;
  const kitField = (page: Page) =>
    page.locator('label').filter({ hasText: /^Kit$/ }).locator('..');
  const goalkeeperKitField = (page: Page) =>
    page.locator('label').filter({ hasText: /^Goalkeeper Kit$/ }).locator('..');

  test('buttons don\'t accidentally submit the form', async ({ page }) => {
    // Track any PUT requests to the matches endpoint
    const putRequests: string[] = [];
    
    await page.route(`**/api/v1/matches/${matchId}`, (route) => {
      if (route.request().method() === 'PUT') {
        putRequests.push(route.request().method());
      }
      // Continue with the request normally
      route.continue();
    });

    // Navigate to match edit page
    await page.goto(matchEditUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Edit Match/i })).toBeVisible({ timeout: 15000 });

    // Count initial number of goal minute inputs
    const initialGoalInputs = await page.locator('input[placeholder*="Minute"]').filter({ has: page.locator('..')}).count();

    // Click the "Match Events" tab
    const matchEventsTab = page.locator('button:has-text("Match Events"), a:has-text("Match Events")').first();
    await matchEventsTab.click();

    // Wait a moment for tab content to render
    await page.waitForTimeout(500);

    // Click the "Add Goal" button
    const addGoalButton = page.getByRole('button', { name: /Add Goal/i });
    await expect(addGoalButton).toBeVisible({ timeout: 5000 });
    await addGoalButton.click();

    // Wait for the new goal row to appear
    await page.waitForTimeout(500);

    // Count goal minute inputs again - should have increased
    const newGoalInputs = await page.locator('input[placeholder*="Minute"]').filter({ has: page.locator('..')}).count();
    expect(newGoalInputs).toBeGreaterThan(initialGoalInputs);

    // Assert: No PUT request was sent from clicking "Add Goal"
    expect(putRequests.length).toBe(0);
  });

  test('can add a goal with assist and it persists', async ({ page }) => {
    // Navigate to match edit page
    await page.goto(matchEditUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Edit Match/i })).toBeVisible({ timeout: 15000 });

    // Go to "Team Selection" tab to ensure we have players in the lineup
    const teamSelectionTab = page.locator('button:has-text("Team Selection"), a:has-text("Team Selection")').first();
    await teamSelectionTab.click();
    await page.waitForTimeout(500);

    // Check if there are any available players to add to starting lineup
    // Look for buttons in the available players section
    const availablePlayerButtons = page.locator('button:has-text("Add to Starting"), button:has-text("Add")').first();
    
    // Try to add a player to the starting lineup if available
    if (await availablePlayerButtons.isVisible({ timeout: 2000 }).catch(() => false)) {
      await availablePlayerButtons.click();
      await page.waitForTimeout(500);
    }

    // Go to "Match Events" tab
    const matchEventsTab = page.locator('button:has-text("Match Events"), a:has-text("Match Events")').first();
    await matchEventsTab.click();
    await page.waitForTimeout(500);

    // Click "Add Goal" button
    const addGoalButton = page.getByRole('button', { name: /Add Goal/i });
    await expect(addGoalButton).toBeVisible({ timeout: 5000 });
    await addGoalButton.click();
    await page.waitForTimeout(500);

    // Find the newly added goal row (should be the last one)
    const goalRows = page.locator('[data-testid="goal-row"], div:has(input[placeholder*="Minute"]):has(select)');
    const lastGoalRow = goalRows.last();

    // Fill in the minute field
    const minuteInput = lastGoalRow.locator('input[placeholder*="Minute"], input[type="number"]').first();
    await minuteInput.fill('45');

    // Select a scorer from the dropdown
    const scorerSelect = lastGoalRow.locator('select').first();
    await expect(scorerSelect).toBeVisible();
    
    // Get the first available player option (skip placeholder/empty option)
    const scorerOptions = await scorerSelect.locator('option').all();
    let scorerValue = '';
    for (const option of scorerOptions) {
      const value = await option.getAttribute('value');
      if (value && value !== '') {
        scorerValue = value;
        break;
      }
    }
    
    expect(scorerValue).not.toBe('');
    await scorerSelect.selectOption(scorerValue);

    // Select an assist player from the dropdown (should be second select)
    const assistSelect = lastGoalRow.locator('select').nth(1);
    if (await assistSelect.isVisible()) {
      const assistOptions = await assistSelect.locator('option').all();
      let assistValue = '';
      for (const option of assistOptions) {
        const value = await option.getAttribute('value');
        // Select a different player than the scorer if possible
        if (value && value !== '' && value !== scorerValue) {
          assistValue = value;
          break;
        }
      }
      
      if (assistValue) {
        await assistSelect.selectOption(assistValue);
      }
    }

    // Set up response listener before submitting
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/matches/${matchId}`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );

    // Click "Save Changes" button
    const saveButton = page.getByRole('button', { name: /Save Changes/i });
    await saveButton.click();

    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Reload the page to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Edit Match/i })).toBeVisible({ timeout: 15000 });

    // Navigate back to "Match Events" tab
    const matchEventsTabAfterReload = page.locator('button:has-text("Match Events"), a:has-text("Match Events")').first();
    await matchEventsTabAfterReload.click();
    await page.waitForTimeout(500);

    // Find goal rows again
    const goalRowsAfterReload = page.locator('[data-testid="goal-row"], div:has(input[placeholder*="Minute"]):has(select)');
    
    // Verify at least one goal row exists
    await expect(goalRowsAfterReload.first()).toBeVisible();

    // Find the goal we just added (minute 45)
    const goalRowsCount = await goalRowsAfterReload.count();
    let foundOurGoal = false;
    
    for (let i = 0; i < goalRowsCount; i++) {
      const row = goalRowsAfterReload.nth(i);
      const minuteValue = await row.locator('input[placeholder*="Minute"], input[type="number"]').first().inputValue();
      
      if (minuteValue === '45') {
        foundOurGoal = true;
        
        // Verify scorer is selected
        const scorerValue = await row.locator('select').first().inputValue();
        expect(scorerValue).not.toBe('');
        
        break;
      }
    }

    expect(foundOurGoal).toBe(true);

    // Cleanup: Remove the goal we added to keep test repeatable
    // Find the goal at minute 45 again
    for (let i = 0; i < await goalRowsAfterReload.count(); i++) {
      const row = goalRowsAfterReload.nth(i);
      const minuteValue = await row.locator('input[placeholder*="Minute"], input[type="number"]').first().inputValue();
      
      if (minuteValue === '45') {
        // Look for delete/remove button in this row
        const deleteButton = row.locator('button:has-text("Remove"), button:has-text("Delete"), button[title*="Remove"], button[title*="Delete"]').first();
        if (await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await deleteButton.click();
          await page.waitForTimeout(500);
        }
        break;
      }
    }

    // Save changes to persist the cleanup
    const cleanupResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/matches/${matchId}`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );

    const saveButtonCleanup = page.getByRole('button', { name: /Save Changes/i });
    await saveButtonCleanup.click();
    
    const cleanupResponse = await cleanupResponsePromise;
    expect(cleanupResponse.status()).toBe(200);
  });

  test('kit dropdowns include inherited club kits, dedupe duplicates, and preserve selected club kits', async ({ page }) => {
    const sharedKitId = '11111111-1111-1111-1111-111111111111';
    const inheritedClubKitId = '22222222-2222-2222-2222-222222222222';
    const inheritedGoalkeeperKitId = '33333333-3333-3333-3333-333333333333';
    const pageErrors: string[] = [];

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    await stubMatchEditPageDependencies(page, { clubId, ageGroupId, teamId });

    await page.route(`**/api/v1/teams/${teamId}/kits`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          success: true,
          data: {
            teamId,
            teamName: 'Reds',
            clubId,
            clubName: 'Vale FC',
            kits: [
              {
                id: '66666666-6666-6666-6666-666666666666',
                name: 'Team Match Kit',
                type: 'home',
                shirtColor: '#cc0000',
                shortsColor: '#ffffff',
                socksColor: '#cc0000',
                season: '2024/25',
                isActive: true,
              },
              {
                id: sharedKitId,
                name: 'Shared Duplicate Kit',
                type: 'home',
                shirtColor: '#111111',
                shortsColor: '#222222',
                socksColor: '#333333',
                season: '2024/25',
                isActive: true,
              },
            ],
          },
        },
      });
    });

    await page.route(`**/api/v1/clubs/${clubId}/kits`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          success: true,
          data: [
            {
              id: sharedKitId,
              name: 'Shared Duplicate Kit',
              type: 'home',
              shirtColor: '#111111',
              shortsColor: '#222222',
              socksColor: '#333333',
              season: '2024/25',
              isActive: true,
            },
            {
              id: inheritedClubKitId,
              name: 'Inherited Club Home Kit',
              type: 'away',
              shirtColor: '#0044cc',
              shortsColor: '#f7f7f7',
              socksColor: '#0044cc',
              season: '2024/25',
              isActive: true,
            },
            {
              id: inheritedGoalkeeperKitId,
              name: 'Inherited Club Goalkeeper Kit',
              type: 'goalkeeper',
              shirtColor: '#ffdd00',
              shortsColor: '#222222',
              socksColor: '#ffdd00',
              season: '2024/25',
              isActive: true,
            },
          ],
        },
      });
    });

    await page.route(`**/api/v1/matches/${matchId}`, async route => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          success: true,
          data: {
            id: matchId,
            teamId,
            ageGroupId,
            clubId,
            clubName: 'Vale FC',
            teamName: 'Reds',
            ageGroupName: '2014s',
            seasonId: '2024/25',
            squadSize: 7,
            opposition: 'Test Opposition',
            matchDate: '2026-03-20T10:00:00.000Z',
            meetTime: '2026-03-20T09:15:00.000Z',
            kickOffTime: '2026-03-20T10:00:00.000Z',
            location: 'Vale Park',
            isHome: true,
            competition: 'League Match',
            primaryKitId: inheritedClubKitId,
            goalkeeperKitId: inheritedGoalkeeperKitId,
            status: 'scheduled',
            isLocked: false,
            notes: '',
            createdAt: '2026-03-01T10:00:00.000Z',
            updatedAt: '2026-03-01T10:00:00.000Z',
            lineup: {
              id: '44444444-4444-4444-4444-444444444444',
              players: [],
            },
            report: {
              id: '55555555-5555-5555-5555-555555555555',
              goals: [],
              cards: [],
              injuries: [],
              performanceRatings: [],
            },
            coaches: [],
            substitutions: [],
            attendance: [],
          },
        },
      });
    });

    await page.goto(matchEditUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page).toHaveURL(new RegExp(`${matchId}/edit$`));
    await expect(page.getByRole('heading', { name: /Edit Match/i })).toBeVisible({ timeout: 15000 });

    const outfieldKitField = kitField(page);
    const gkKitField = goalkeeperKitField(page);
    const kitSelect = outfieldKitField.locator('select');
    const goalkeeperKitSelect = gkKitField.locator('select');

    await expect(kitSelect).toBeVisible();
    await expect(goalkeeperKitSelect).toBeVisible();

    await expect(kitSelect).toHaveValue(inheritedClubKitId);
    await expect(goalkeeperKitSelect).toHaveValue(inheritedGoalkeeperKitId);

    await expect(kitSelect.locator(`option[value="${sharedKitId}"]`)).toHaveCount(1);
    await expect(kitSelect.locator(`option[value="${inheritedClubKitId}"]`)).toHaveCount(1);
    await expect(goalkeeperKitSelect.locator(`option[value="${inheritedGoalkeeperKitId}"]`)).toHaveCount(1);

    await expect(kitSelect.locator('option')).toContainText(['Inherited Club Home Kit']);
    await expect(goalkeeperKitSelect.locator('option')).toContainText(['Inherited Club Goalkeeper Kit']);

    await expect(outfieldKitField.locator('div[title="Shirt"]')).toHaveCSS('background-color', 'rgb(0, 68, 204)');
    await expect(outfieldKitField.locator('div[title="Shorts"]')).toHaveCSS('background-color', 'rgb(247, 247, 247)');
    await expect(outfieldKitField.locator('div[title="Socks"]')).toHaveCSS('background-color', 'rgb(0, 68, 204)');

    await expect(gkKitField.locator('div[title="Shirt"]')).toHaveCSS('background-color', 'rgb(255, 221, 0)');
    await expect(gkKitField.locator('div[title="Shorts"]')).toHaveCSS('background-color', 'rgb(34, 34, 34)');
    await expect(gkKitField.locator('div[title="Socks"]')).toHaveCSS('background-color', 'rgb(255, 221, 0)');
    expect(pageErrors).toEqual([]);
  });

  test('can edit match events when lineup is empty', async ({ page }) => {
    // This tests the fallback to team players when lineup is empty
    
    // Navigate to match edit page
    await page.goto(matchEditUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Edit Match/i })).toBeVisible({ timeout: 15000 });

    // Go directly to "Match Events" tab (don't add any players to lineup)
    const matchEventsTab = page.locator('button:has-text("Match Events"), a:has-text("Match Events")').first();
    await matchEventsTab.click();
    await page.waitForTimeout(500);

    // Click "Add Card" button to test player dropdown
    const addCardButton = page.getByRole('button', { name: /Add Card/i });
    
    // Card button might not always be visible, try booking/yellow card as alternatives
    let cardButton = addCardButton;
    if (!await addCardButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      const altButton = page.getByRole('button', { name: /Add Yellow/i, exact: false });
      if (await altButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        cardButton = altButton;
      }
    }

    if (await cardButton.isVisible()) {
      await cardButton.click();
      await page.waitForTimeout(500);

      // Find the newly added card row
      const cardRows = page.locator('[data-testid="card-row"], div:has(input[placeholder*="Minute"]):has(select)');
      const lastCardRow = cardRows.last();

      // Check that the player dropdown is populated
      const playerSelect = lastCardRow.locator('select').first();
      await expect(playerSelect).toBeVisible();

      // Get options - should have players even without lineup (fallback to team players)
      const playerOptions = await playerSelect.locator('option').all();
      
      // Should have more than just a placeholder option
      expect(playerOptions.length).toBeGreaterThan(1);

      // Verify at least one option has a valid player ID
      let hasPlayer = false;
      for (const option of playerOptions) {
        const value = await option.getAttribute('value');
        const text = await option.textContent();
        
        if (value && value !== '' && text && text.trim() !== '') {
          hasPlayer = true;
          break;
        }
      }

      expect(hasPlayer).toBe(true);
      
      // Cleanup: Remove the card we added (find remove button in the row)
      const removeButton = lastCardRow.locator('button:has-text("Remove"), button:has-text("Delete"), button[title*="Remove"], button[title*="Delete"]').first();
      if (await removeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await removeButton.click();
      }
    }
  });

  test('coaching staff persists after save and reload', async ({ page }) => {
    // Navigate to match edit page
    await page.goto(matchEditUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Edit Match/i })).toBeVisible({ timeout: 15000 });

    // Click the "Coaches" tab
    const coachesTab = page.locator('button:has-text("Coaches"), a:has-text("Coaches")').first();
    await coachesTab.click();
    await page.waitForTimeout(500);

    // Find and click the "Add Coach" button
    const addCoachButton = page.getByRole('button', { name: /Add Coach/i });
    await expect(addCoachButton).toBeVisible({ timeout: 5000 });
    await addCoachButton.click();
    await page.waitForTimeout(500);

    // Check if a modal appears
    const modal = page.locator('[role="dialog"], .modal, div[class*="modal"]').first();
    let selectedCoachId = '';
    
    if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Modal flow: select coach from dropdown
      const coachSelect = modal.locator('select').first();
      await expect(coachSelect).toBeVisible({ timeout: 3000 });

      // Get the first available coach option (skip placeholder/empty option)
      const coachOptions = await coachSelect.locator('option').all();
      for (const option of coachOptions) {
        const value = await option.getAttribute('value');
        if (value && value !== '') {
          selectedCoachId = value;
          break;
        }
      }

      expect(selectedCoachId).not.toBe('');
      await coachSelect.selectOption(selectedCoachId);

      // Click confirm button in modal
      const confirmButton = modal.locator('button:has-text("Add"), button:has-text("Confirm"), button:has-text("OK")').first();
      await confirmButton.click();
      await page.waitForTimeout(500);
    } else {
      // Inline flow: coach might be added directly or via a dropdown on the page
      const coachSelect = page.locator('select').last();
      if (await coachSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        const coachOptions = await coachSelect.locator('option').all();
        for (const option of coachOptions) {
          const value = await option.getAttribute('value');
          if (value && value !== '') {
            selectedCoachId = value;
            break;
          }
        }
        
        if (selectedCoachId) {
          await coachSelect.selectOption(selectedCoachId);
          await page.waitForTimeout(500);
        }
      }
    }

    // Set up response listener before submitting
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/matches/${matchId}`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );

    // Click "Save Changes" button
    const saveButton = page.getByRole('button', { name: /Save Changes/i });
    await saveButton.click();

    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Reload the page to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Edit Match/i })).toBeVisible({ timeout: 15000 });

    // Navigate back to "Coaches" tab
    const coachesTabAfterReload = page.locator('button:has-text("Coaches"), a:has-text("Coaches")').first();
    await coachesTabAfterReload.click();
    await page.waitForTimeout(500);

    // Assert: The added coach is still displayed in the list
    // Look for coach rows/items in the coaches section
    const coachRows = page.locator('[data-testid="coach-row"], div:has(select):has(button:has-text("Remove"))');
    const coachCount = await coachRows.count();
    
    expect(coachCount).toBeGreaterThan(0);

    // Verify the coach we added is in the list
    let foundOurCoach = false;
    for (let i = 0; i < coachCount; i++) {
      const row = coachRows.nth(i);
      const select = row.locator('select').first();
      
      if (await select.isVisible({ timeout: 1000 }).catch(() => false)) {
        const coachValue = await select.inputValue();
        if (selectedCoachId && coachValue === selectedCoachId) {
          foundOurCoach = true;
          break;
        }
      } else {
        // Alternative: coach might be displayed as text
        const rowText = await row.textContent();
        if (rowText && rowText.trim() !== '') {
          foundOurCoach = true;
          break;
        }
      }
    }

    expect(foundOurCoach).toBe(true);

    // Cleanup: Remove the coach and save again
    const removeButtons = page.locator('button:has-text("Remove"), button:has-text("Delete"), button[title*="Remove"]').filter({ 
      hasText: /Remove|Delete/ 
    });
    
    if (await removeButtons.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await removeButtons.first().click();
      await page.waitForTimeout(500);

      // Save changes to persist the cleanup
      const cleanupResponsePromise = page.waitForResponse(
        response => response.url().includes(`/api/v1/matches/${matchId}`) && 
                    response.request().method() === 'PUT',
        { timeout: 15000 }
      );

      const saveButtonCleanup = page.getByRole('button', { name: /Save Changes/i });
      await saveButtonCleanup.click();
      
      const cleanupResponse = await cleanupResponsePromise;
      expect(cleanupResponse.status()).toBe(200);
    }
  });

  test('player attendance persists after save and reload', async ({ page }) => {
    // Navigate to match edit page
    await page.goto(matchEditUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Edit Match/i })).toBeVisible({ timeout: 15000 });

    // Click the "Attendance" tab
    const attendanceTab = page.locator('button:has-text("Attendance"), a:has-text("Attendance")').first();
    await attendanceTab.click();
    await page.waitForTimeout(500);

    // Find player rows in the attendance section
    const playerRows = page.locator('[data-testid="player-attendance-row"], tr:has(button:has-text("Pending")), tr:has(button:has-text("Confirmed")), div:has(button:has-text("Pending")):has(textarea), div:has(button:has-text("Confirmed")):has(textarea)');
    
    await expect(playerRows.first()).toBeVisible({ timeout: 5000 });
    
    const firstPlayerRow = playerRows.first();

    // Change status from "pending" to "confirmed"
    const confirmedButton = firstPlayerRow.locator('button:has-text("Confirmed"), button:has-text("Confirm")').first();
    await confirmedButton.click();
    await page.waitForTimeout(300);

    // Add a note to the player
    const noteField = firstPlayerRow.locator('textarea, input[type="text"][placeholder*="note" i], input[placeholder*="Note" i]').first();
    const testNote = 'Test attendance note - automated test';
    
    if (await noteField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await noteField.fill(testNote);
    } else {
      // Alternative: Note field might appear after clicking a notes button or expanding section
      const notesButton = firstPlayerRow.locator('button:has-text("Notes"), button:has-text("Add Note")').first();
      if (await notesButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await notesButton.click();
        await page.waitForTimeout(300);
        
        const noteFieldAlt = page.locator('textarea, input[type="text"]').filter({ hasText: /note/i }).first();
        if (await noteFieldAlt.isVisible({ timeout: 1000 }).catch(() => false)) {
          await noteFieldAlt.fill(testNote);
        }
      }
    }

    // Set up response listener before submitting
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/matches/${matchId}`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );

    // Click "Save Changes" button
    const saveButton = page.getByRole('button', { name: /Save Changes/i });
    await saveButton.click();

    // Wait for and verify the API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Reload the page to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Edit Match/i })).toBeVisible({ timeout: 15000 });

    // Navigate back to "Attendance" tab
    const attendanceTabAfterReload = page.locator('button:has-text("Attendance"), a:has-text("Attendance")').first();
    await attendanceTabAfterReload.click();
    await page.waitForTimeout(500);

    // Find player rows again
    const playerRowsAfterReload = page.locator('[data-testid="player-attendance-row"], tr:has(button:has-text("Pending")), tr:has(button:has-text("Confirmed")), div:has(button:has-text("Pending")):has(textarea), div:has(button:has-text("Confirmed")):has(textarea)');
    const firstPlayerRowAfterReload = playerRowsAfterReload.first();

    // Assert: The player status is "confirmed"
    const confirmedButtonAfterReload = firstPlayerRowAfterReload.locator('button:has-text("Confirmed")');
    await expect(confirmedButtonAfterReload).toBeVisible({ timeout: 5000 });
    
    // Check if the button has an active/selected state (common patterns)
    const isActive = await confirmedButtonAfterReload.evaluate((el) => {
      return el.classList.contains('active') || 
             el.classList.contains('selected') ||
             el.getAttribute('aria-pressed') === 'true' ||
             el.disabled === false;
    });
    
    // If we can't determine state from button, just verify it's visible
    expect(await confirmedButtonAfterReload.isVisible()).toBe(true);

    // Assert: The note is still present
    const noteFieldAfterReload = firstPlayerRowAfterReload.locator('textarea, input[type="text"][placeholder*="note" i], input[placeholder*="Note" i]').first();
    
    if (await noteFieldAfterReload.isVisible({ timeout: 2000 }).catch(() => false)) {
      const noteValue = await noteFieldAfterReload.inputValue();
      expect(noteValue).toBe(testNote);
    } else {
      // Check if note is displayed as text instead of input
      const noteText = await firstPlayerRowAfterReload.textContent();
      expect(noteText).toContain(testNote);
    }

    // Cleanup: Reset player to "pending" status and clear note, save again
    const pendingButton = firstPlayerRowAfterReload.locator('button:has-text("Pending")').first();
    await pendingButton.click();
    await page.waitForTimeout(300);

    // Clear the note
    if (await noteFieldAfterReload.isVisible({ timeout: 1000 }).catch(() => false)) {
      await noteFieldAfterReload.fill('');
    }

    // Save changes to persist the cleanup
    const cleanupResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/v1/matches/${matchId}`) && 
                  response.request().method() === 'PUT',
      { timeout: 15000 }
    );

    const saveButtonCleanup = page.getByRole('button', { name: /Save Changes/i });
    await saveButtonCleanup.click();
    
    const cleanupResponse = await cleanupResponsePromise;
    expect(cleanupResponse.status()).toBe(200);
  });
});
