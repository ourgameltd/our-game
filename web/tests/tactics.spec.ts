import { test, expect, Page } from '@playwright/test';

const clubId = '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b';
const createdTacticId = '11111111-2222-3333-4444-555555555555';

const tacticsListUrl = `/dashboard/${clubId}/tactics`;
const newTacticUrl = `/dashboard/${clubId}/tactics/new`;
const tacticDetailUrl = `/dashboard/${clubId}/tactics/${createdTacticId}`;
const invalidEditUrl = `/dashboard/${clubId}/tactics/not-a-valid-id/edit`;

const systemFormations = [
  {
    id: 'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb',
    name: '4-3-3 Press',
    system: '4-3-3',
    squadSize: 11,
    summary: 'Front-foot pressing shape for 11-a-side.',
    tags: ['pressing', 'attacking'],
    positions: [
      { positionIndex: 0, position: 'GK', x: 50, y: 90, direction: 'N' },
      { positionIndex: 1, position: 'RB', x: 80, y: 72, direction: 'N' },
      { positionIndex: 2, position: 'CB', x: 60, y: 74, direction: 'N' },
      { positionIndex: 3, position: 'CB', x: 40, y: 74, direction: 'N' },
      { positionIndex: 4, position: 'LB', x: 20, y: 72, direction: 'N' },
      { positionIndex: 5, position: 'CM', x: 30, y: 50, direction: 'N' },
      { positionIndex: 6, position: 'CM', x: 50, y: 45, direction: 'N' },
      { positionIndex: 7, position: 'CM', x: 70, y: 50, direction: 'N' },
      { positionIndex: 8, position: 'RW', x: 78, y: 24, direction: 'N' },
      { positionIndex: 9, position: 'ST', x: 50, y: 18, direction: 'N' },
      { positionIndex: 10, position: 'LW', x: 22, y: 24, direction: 'N' },
    ],
  },
  {
    id: 'cccccccc-4444-5555-6666-dddddddddddd',
    name: '2-3-1 Build Out',
    system: '2-3-1',
    squadSize: 7,
    summary: 'Seven-a-side build-out shape.',
    tags: ['possession'],
    positions: [
      { positionIndex: 0, position: 'GK', x: 50, y: 90, direction: 'N' },
      { positionIndex: 1, position: 'CB', x: 32, y: 66, direction: 'N' },
      { positionIndex: 2, position: 'CB', x: 68, y: 66, direction: 'N' },
      { positionIndex: 3, position: 'CM', x: 24, y: 42, direction: 'N' },
      { positionIndex: 4, position: 'CM', x: 50, y: 36, direction: 'N' },
      { positionIndex: 5, position: 'CM', x: 76, y: 42, direction: 'N' },
      { positionIndex: 6, position: 'ST', x: 50, y: 18, direction: 'N' },
    ],
  },
];

const clubDetail = {
  id: clubId,
  name: 'Vale FC',
  shortName: 'Vale',
  logo: '',
  colors: {
    primary: '#cc0000',
    secondary: '#ffffff',
    accent: '#111827',
  },
  location: {
    city: 'Cardiff',
    country: 'Wales',
    venue: 'Vale Ground',
    address: '1 Football Way',
  },
  founded: 1950,
  history: 'Community club.',
  ethos: 'Football for everyone.',
  principles: ['Work hard', 'Be brave'],
};

const scopeTactic = {
  id: createdTacticId,
  name: 'High Press 4-3-3',
  summary: 'Aggressive press from the front line.',
  style: 'pressing',
  squadSize: 11,
  parentFormationId: systemFormations[0].id,
  parentFormationName: systemFormations[0].name,
  scope: {
    type: 'club',
    clubId,
  },
  tags: ['pressing', 'wide'],
  createdAt: '2026-03-19T10:00:00.000Z',
  updatedAt: '2026-03-19T10:00:00.000Z',
};

const createdTacticDetail = {
  id: createdTacticId,
  name: scopeTactic.name,
  parentFormationId: systemFormations[0].id,
  parentFormationName: systemFormations[0].name,
  squadSize: 11,
  summary: scopeTactic.summary,
  style: 'pressing',
  tags: ['pressing', 'wide'],
  scope: {
    clubIds: [clubId],
    ageGroupIds: [],
    teamIds: [],
  },
  positionOverrides: [],
  principles: [],
  resolvedPositions: systemFormations[0].positions.map((position) => ({
    positionId: `resolved-position-${position.positionIndex}`,
    positionIndex: position.positionIndex,
    position: position.position,
    x: position.x,
    y: position.y,
    direction: position.direction,
    sourceFormationId: systemFormations[0].id,
    overriddenBy: [],
  })),
};

async function mockClubShell(page: Page) {
  await page.route(`**/api/v1/clubs/${clubId}`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: clubDetail,
      },
    });
  });
}

async function mockSystemFormations(page: Page, tracker?: { count: number }) {
  await page.route('**/api/v1/formations/system', async route => {
    tracker && (tracker.count += 1);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: systemFormations,
      },
    });
  });
}

async function mockClubTacticsList(page: Page) {
  await page.route(`**/api/v1/clubs/${clubId}/tactics`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: {
          scopeTactics: [scopeTactic],
          inheritedTactics: [],
        },
      },
    });
  });
}

async function mockCreatedTacticDetail(page: Page) {
  await page.route(`**/api/v1/tactics/${createdTacticId}`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        data: createdTacticDetail,
      },
    });
  });
}

test.describe('Tactics', () => {
  test('tactics list page heading says Tactics', async ({ page }) => {
    await mockClubShell(page);
    await mockClubTacticsList(page);

    await page.goto(tacticsListUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await expect(page.getByRole('heading', { name: 'Tactics' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('High Press 4-3-3')).toBeVisible();
  });

  test('add page renders backend-backed formations from the system formations endpoint', async ({ page }) => {
    const formationRequests = { count: 0 };

    await mockClubShell(page);
    await mockSystemFormations(page, formationRequests);

    await page.goto(newTacticUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await expect(page.getByRole('heading', { name: 'New Tactic' })).toBeVisible({ timeout: 15000 });

    const formationSelect = page.locator('select').first();
    await expect(formationSelect).toBeVisible();
    await expect(page.locator('select optgroup[label="11v11"]')).toHaveCount(1);
    await expect(page.locator('select optgroup[label="7v7"]')).toHaveCount(1);
    await expect(formationSelect.locator('option', { hasText: '4-3-3 Press' })).toHaveCount(1);
    await expect(formationSelect.locator('option', { hasText: '2-3-1 Build Out' })).toHaveCount(1);

    expect(formationRequests.count).toBeGreaterThan(0);
  });

  test('detail page renders the full resolved lineup from the API', async ({ page }) => {
    await mockClubShell(page);
    await mockCreatedTacticDetail(page);

    await page.goto(tacticDetailUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await expect(page.getByRole('heading', { name: 'High Press 4-3-3' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('4-3-3 Press • pressing')).toBeVisible();

    const renderedPositionMarkers = page
      .locator('span')
      .filter({ hasText: /^(GK|RB|CB|LB|CM|RW|ST|LW)$/ });

    await expect(renderedPositionMarkers).toHaveCount(11);
    await expect(renderedPositionMarkers.filter({ hasText: /^GK$/ })).toHaveCount(1);
    await expect(renderedPositionMarkers.filter({ hasText: /^RB$/ })).toHaveCount(1);
    await expect(renderedPositionMarkers.filter({ hasText: /^LB$/ })).toHaveCount(1);
    await expect(renderedPositionMarkers.filter({ hasText: /^ST$/ })).toHaveCount(1);
    await expect(renderedPositionMarkers.filter({ hasText: /^CB$/ })).toHaveCount(2);
    await expect(renderedPositionMarkers.filter({ hasText: /^CM$/ })).toHaveCount(3);
  });

  test('double submit on create still issues only one POST', async ({ page }) => {
    let createRequestCount = 0;

    await mockClubShell(page);
    await mockSystemFormations(page);
    await mockCreatedTacticDetail(page);

    await page.route('**/api/v1/tactics', async route => {
      createRequestCount += 1;

      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject({
        name: 'Counter Press',
        parentFormationId: systemFormations[0].id,
        scope: {
          type: 'club',
          clubId,
        },
      });

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        json: {
          success: true,
          data: createdTacticDetail,
        },
      });
    });

    await page.goto(newTacticUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'New Tactic' })).toBeVisible({ timeout: 15000 });

    await page.getByPlaceholder('e.g., High Press 4-4-2').fill('Counter Press');

    const createButton = page.getByRole('button', { name: /Create Tactic/i });
    await expect(createButton).toBeVisible();

    await createButton.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });

    await expect(page).toHaveURL(new RegExp(`/dashboard/${clubId}/tactics/${createdTacticId}$`), { timeout: 15000 });
    expect(createRequestCount).toBe(1);
  });

  test('invalid edit URLs do not render a saveable form', async ({ page }) => {
    const tacticFetches = { count: 0 };

    await mockClubShell(page);
    await mockSystemFormations(page);
    await page.route('**/api/v1/tactics/**', async route => {
      tacticFetches.count += 1;
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        json: {
          success: false,
          error: {
            message: 'Tactic not found',
            statusCode: 404,
          },
        },
      });
    });

    await page.goto(invalidEditUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await expect(page.getByRole('heading', { name: 'Edit Tactic' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('The tactic ID in the URL is invalid, so this tactic cannot be loaded for editing.')).toBeVisible();
    await expect(page.locator('form')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Save Changes|Create Tactic|Saving/i })).toHaveCount(0);

    expect(tacticFetches.count).toBe(0);
  });
});