# E2E Testing with Playwright

## Setup

Playwright is already installed as a dev dependency. To install browsers for testing:

```bash
npx playwright install
```

## Running Tests

### Run all tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/example.spec.ts
```

### Run tests for specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

```
tests/
├── auth.setup.ts          # Authentication setup (runs before other tests)
├── example.spec.ts        # Example test file
└── .gitignore            # Ignore test results and reports
```

## Authentication

The test suite uses Azure Static Web Apps CLI authentication emulator to authenticate once and reuse the authentication state across all tests. This improves test performance and reliability.

### How It Works

1. **Setup Phase**: The `auth.setup.ts` file runs before all tests
   - Navigates to `/.auth/login/aad` (SWA CLI auth emulator)
   - Fills in mock user profile form with test credentials
   - Submits the form and verifies authentication via `/.auth/me`
2. **Storage State**: Authentication state (cookies, localStorage) is saved to `playwright/.auth/user.json`
3. **Test Reuse**: All test projects depend on the setup project and use the saved auth state
4. **No Re-authentication**: Tests run faster without repeated login flows

### Test User Profile

The default test user has the following profile:

```json
{
  "userId": "test-user-001",
  "userDetails": "test.user@ourgame.com",
  "identityProvider": "aad",
  "userRoles": ["authenticated", "coach", "player"],
  "claims": [
    { "typ": "name", "val": "Test User" },
    { "typ": "email", "val": "test.user@ourgame.com" }
  ]
}
```

### Customizing the Test User

To modify the test user profile (roles, claims, etc.), edit `auth.setup.ts`:

```typescript
// Change user roles
await page.fill('textarea[name="userRoles"]', 'authenticated\nadmin\ncoach');

// Add custom claims
const claims = [
  { typ: 'name', val: 'Custom User' },
  { typ: 'email', val: 'custom@example.com' }
];
await page.fill('textarea[name="claims"]', JSON.stringify(claims, null, 2));
```

### Prerequisites

- **SWA CLI must be running** at `http://localhost:4280`
- Start it with: `swa start` or `npm run start` (if configured)
- The authentication emulator is only available in local development

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- **Base URL**: `http://localhost:4280` (SWA CLI port)
- **Test Directory**: `./tests`
- **Browsers**: Chromium, Firefox, WebKit (desktop and mobile)
- **Reporters**: HTML report and list output
- **Trace**: Collected on first retry
- **Screenshots**: Taken only on failure

## Best Practices

1. **Start the dev server before running tests**:
   ```bash
   swa start
   ```
   Or use the `webServer` option in `playwright.config.ts` to start automatically.

2. **Use Page Object Model (POM)** for complex pages:
   - Create classes that represent pages
   - Encapsulate selectors and actions
   - Make tests more maintainable

3. **Use test fixtures** for shared setup:
   - Create custom fixtures for common operations
   - Keep tests DRY (Don't Repeat Yourself)

4. **Use data-testid attributes** for stable selectors:
   - Add `data-testid` attributes to important elements
   - Less brittle than CSS class or text selectors

5. **Avoid hardcoded waits**:
   - Use Playwright's auto-waiting features
   - Use explicit waits for specific conditions when needed

## View Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Debugging

- Use `--debug` flag to run tests in debug mode
- Use `page.pause()` to pause test execution
- Use VS Code Playwright extension for debugging

## CI/CD Integration

The configuration is CI-ready:
- Retries failed tests twice on CI
- Runs tests serially on CI (workers: 1)
- Forbids `.only` on CI to prevent accidentally skipping tests

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Authentication Guide](https://playwright.dev/docs/auth)
