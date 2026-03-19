/**
 * Azure Static Web Apps Authentication Helper
 * 
 * This module provides utilities to access user information from Azure Static Web Apps
 * built-in authentication. SWA automatically injects user claims via the /.auth/me endpoint.
 * 
 * Reference: https://learn.microsoft.com/en-us/azure/static-web-apps/user-information
 */

export interface UserClaim {
  typ: string;
  val: string;
}

export interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims?: UserClaim[];
}

export interface AuthInfo {
  clientPrincipal: ClientPrincipal | null;
}

/**
 * Fetch the current user's authentication information from Azure SWA
 * @returns The user's client principal or null if not authenticated
 */
export async function getUserInfo(): Promise<ClientPrincipal | null> {
  try {
    const response = await fetch('/.auth/me');
    if (!response.ok) {
      console.warn('Failed to fetch user info:', response.status);
      return null;
    }

    const authInfo: AuthInfo = await response.json();
    return authInfo.clientPrincipal;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

/**
 * Get a specific claim value from the user's claims
 * @param claims - Array of user claims
 * @param claimType - The claim type to search for (e.g., 'emails', 'name', 'preferred_username')
 * @returns The claim value or undefined if not found
 */
export function getClaimValue(claims: UserClaim[] | undefined, claimType: string): string | undefined {
  if (!claims) return undefined;
  const claim = claims.find(c => c.typ === claimType);
  return claim?.val;
}

/**
 * Check if the user has a specific role
 * @param principal - The user's client principal
 * @param role - The role to check for
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(principal: ClientPrincipal | null, role: string): boolean {
  if (!principal) return false;
  return principal.userRoles.includes(role);
}

/**
 * Get user email from claims (works with Azure AD)
 * @param principal - The user's client principal
 * @returns The user's email or undefined
 */
export function getUserEmail(principal: ClientPrincipal | null): string | undefined {
  if (!principal?.claims) return undefined;
  return getClaimValue(principal.claims, 'emails') || 
         getClaimValue(principal.claims, 'email') ||
         getClaimValue(principal.claims, 'preferred_username');
}

/**
 * Get user display name from claims
 * @param principal - The user's client principal
 * @returns The user's display name or undefined
 */
export function getUserDisplayName(principal: ClientPrincipal | null): string | undefined {
  if (!principal) return undefined;

  const claims = principal.claims;

  const fullName = claims
    ? getClaimValue(claims, 'name') ||
      getClaimValue(claims, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name')
    : undefined;

  if (fullName?.trim()) {
    return fullName.trim();
  }

  const givenName = claims
    ? getClaimValue(claims, 'given_name') ||
      getClaimValue(claims, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')
    : undefined;

  const familyName = claims
    ? getClaimValue(claims, 'family_name') ||
      getClaimValue(claims, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')
    : undefined;

  const splitName = [givenName, familyName]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(value => value.trim())
    .join(' ');

  if (splitName) {
    return splitName;
  }

  return principal.userDetails || getUserEmail(principal) || principal.userId;
}
