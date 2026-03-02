import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';

const authFile = fileURLToPath(new URL('../playwright/.auth/user.json', import.meta.url));

/**
 * Global authentication setup for Azure Static Web Apps CLI emulator
 * 
 * This setup navigates to the SWA CLI authentication emulator login page,
 * fills in the mock user profile form, and saves the authenticated state
 * for reuse across all test projects.
 * 
 * The SWA CLI emulator provides a simple form at /.auth/login/<provider>
 * that allows developers to mock user authentication without requiring
 * actual Azure AD or other identity providers during local testing.
 */
setup('authenticate', async ({ page }) => {
  // Navigate to the SWA CLI authentication emulator (using Azure AD provider)
  await page.goto('/.auth/login/aad?post_login_redirect_uri=/dashboard');

  // Fill in the mock user profile form
  // Note: identityProvider is already set to 'aad' from the URL and the field is disabled
  
  // User ID - matches the seeded Michael Law user (AuthId from UserSeedData.cs)
  await page.locator('input[name="userId"]').clear();
  await page.locator('input[name="userId"]').fill('00000001000000000000000000000101');
  await page.locator('input[name="userId"]').dispatchEvent('keyup');
  
  // User details - display name for the seeded user
  await page.locator('input[name="userDetails"]').clear();
  await page.locator('input[name="userDetails"]').fill('Michael Law');
  await page.locator('input[name="userDetails"]').dispatchEvent('keyup');
  
  // User roles - one per line. The 'authenticated' role is required by staticwebapp.config.json
  // Note: 'authenticated' and 'anonymous' are added automatically by SWA CLI if not provided
  await page.locator('textarea[name="userRoles"]').clear();
  await page.locator('textarea[name="userRoles"]').fill('authenticated\ncoach\nplayer');
  await page.locator('textarea[name="userRoles"]').dispatchEvent('keyup');
  
  // User claims - JSON array of claims matching the seeded Michael Law user
  const claims = [
    { typ: 'name', val: 'Michael Law' },
    { typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name', val: 'Michael Law' },
    { typ: 'email', val: 'michael@michaellaw.me' },
    { typ: 'emails', val: 'michael@michaellaw.me' },
    { typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress', val: 'michael@michaellaw.me' },
    { typ: 'preferred_username', val: 'michael@michaellaw.me' },
    { typ: 'given_name', val: 'Michael' },
    { typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname', val: 'Michael' },
    { typ: 'family_name', val: 'Law' },
    { typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname', val: 'Law' }
  ];
  await page.locator('textarea[name="claims"]').clear();
  await page.locator('textarea[name="claims"]').fill(JSON.stringify(claims, null, 2));
  await page.locator('textarea[name="claims"]').dispatchEvent('keyup');
  
  // Submit the authentication form and wait for redirect
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Wait for redirect after authentication - accept any path on localhost:4280
  await page.waitForURL('http://localhost:4280/**', { timeout: 20000 });
  
  // Give the app a moment to fully load
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  // Verify authentication by checking /.auth/me endpoint
  const response = await page.goto('/.auth/me');
  expect(response?.ok()).toBeTruthy();
  
  // Parse and validate the authentication response
  const authInfo = await response?.json();
  
  // Debug logging to see what we're actually getting
  console.log('Auth response:', JSON.stringify(authInfo, null, 2));
  
  // Make assertions more defensive - check if properties exist before asserting their values
  expect(authInfo).toHaveProperty('clientPrincipal');
  expect(authInfo.clientPrincipal).toBeTruthy();
  
  // Check userId exists
  expect(authInfo.clientPrincipal.userId).toBeTruthy();
  
  // Check roles exist and include authenticated
  expect(authInfo.clientPrincipal.userRoles).toBeDefined();
  expect(authInfo.clientPrincipal.userRoles).toContain('authenticated');
  
  // Log the full response for debugging
  console.log('✓ Authentication successful:', JSON.stringify(authInfo.clientPrincipal, null, 2));
  
  // Save the authenticated state (including cookies) to disk
  // This will be reused by all test projects to avoid re-authenticating
  await page.context().storageState({ path: authFile });
  
  console.log('✓ Authenticated state saved to:', authFile);
});
