import { useParams } from 'react-router-dom';

/**
 * GUID/UUID validation regex pattern
 * Matches standard UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Options for route parameter validation
 */
interface RouteParamValidationOptions {
  /**
   * Whether to validate that the value is a valid GUID/UUID
   * @default true (since all IDs in this app should be GUIDs)
   */
  requireGuid?: boolean;

  /**
   * Custom error message to throw when validation fails
   */
  errorMessage?: string;

  /**
   * If true, returns null instead of throwing when validation fails
   * @default false
   */
  returnNullOnError?: boolean;
}

/**
 * Validates a route parameter value, rejecting invalid values like:
 * - undefined
 * - null
 * - Empty strings ""
 * - String literals "undefined" and "null"
 * - Optionally, non-GUID values (if requireGuid is true)
 *
 * @param value - The route parameter value to validate
 * @param paramName - Name of the parameter (for error messages)
 * @returns The validated string value
 * @throws Error if validation fails
 *
 * @example
 * ```ts
 * const clubId = validateRouteParam(params.clubId, 'clubId');
 * // Returns validated GUID string or throws
 * ```
 */
export function validateRouteParam(
  value: string | undefined,
  paramName: string
): string;

/**
 * Validates a route parameter value with options
 *
 * @param value - The route parameter value to validate
 * @param paramName - Name of the parameter (for error messages)
 * @param options - Validation options (with returnNullOnError false or omitted)
 * @returns The validated string value
 * @throws Error if validation fails
 */
export function validateRouteParam(
  value: string | undefined,
  paramName: string,
  options: Omit<RouteParamValidationOptions, 'returnNullOnError'> & { returnNullOnError?: false }
): string;

/**
 * Validates a route parameter value, returning null on failure
 *
 * @param value - The route parameter value to validate
 * @param paramName - Name of the parameter (for error messages)
 * @param options - Validation options with returnNullOnError set to true
 * @returns The validated string value, or null if validation fails
 */
export function validateRouteParam(
  value: string | undefined,
  paramName: string,
  options: Omit<RouteParamValidationOptions, 'returnNullOnError'> & { returnNullOnError: true }
): string | null;

/**
 * Validates a route parameter value with optional validation options
 *
 * @param value - The route parameter value to validate
 * @param paramName - Name of the parameter (for error messages)
 * @param options - Optional validation options
 * @returns The validated string value, or null if returnNullOnError is true
 */
export function validateRouteParam(
  value: string | undefined,
  paramName: string,
  options?: RouteParamValidationOptions
): string | null;

// Implementation
export function validateRouteParam(
  value: string | undefined,
  paramName: string,
  options?: RouteParamValidationOptions
): string | null {
  const { requireGuid = true, errorMessage, returnNullOnError = false } = options || {};

  // Check for undefined, null, empty string, or string literals "undefined"/"null"
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    value === 'undefined' ||
    value === 'null'
  ) {
    const error = errorMessage || `Route parameter "${paramName}" is required but was not provided or is invalid`;
    if (returnNullOnError) {
      return null as any;
    }
    throw new Error(error);
  }

  // Optionally validate GUID format
  if (requireGuid && !GUID_PATTERN.test(value)) {
    const error = errorMessage || `Route parameter "${paramName}" must be a valid GUID but got "${value}"`;
    if (returnNullOnError) {
      return null as any;
    }
    throw new Error(error);
  }

  return value as any;
}

/**
 * Custom hook that extracts and validates a single required route parameter
 *
 * @param paramName - Name of the route parameter to extract
 * @returns The validated parameter value
 * @throws Error if the parameter is invalid
 *
 * @example
 * ```tsx
 * function TeamPage() {
 *   const clubId = useRequiredParam('clubId');
 *   const teamId = useRequiredParam('teamId');
 *
 *   // clubId and teamId are guaranteed to be valid GUIDs
 *   const teamData = useTeamOverview(teamId);
 *   // ...
 * }
 * ```
 */
export function useRequiredParam(paramName: string): string;

/**
 * Custom hook with options (returnNullOnError false or omitted)
 */
export function useRequiredParam(
  paramName: string,
  options: Omit<RouteParamValidationOptions, 'returnNullOnError'> & { returnNullOnError?: false }
): string;

/**
 * Custom hook with options (returnNullOnError true)
 */
export function useRequiredParam(
  paramName: string,
  options: Omit<RouteParamValidationOptions, 'returnNullOnError'> & { returnNullOnError: true }
): string | null;

// Implementation
export function useRequiredParam(
  paramName: string,
  options?: RouteParamValidationOptions
): string | null {
  const params = useParams();
  const value = params[paramName];
  return validateRouteParam(value, paramName, options) as any;
}

/**
 * Custom hook that extracts and validates multiple required route parameters
 *
 * @param paramNames - Array of route parameter names to extract
 * @returns Object mapping parameter names to their validated values
 * @throws Error if any parameter is invalid
 *
 * @example
 * ```tsx
 * function PlayerPage() {
 *   const { clubId, ageGroupId, playerId } = useRequiredParams([
 *     'clubId',
 *     'ageGroupId',
 *     'playerId'
 *   ]);
 *
 *   // All IDs are guaranteed to be valid GUIDs
 *   const playerData = usePlayer(playerId);
 *   // ...
 * }
 * ```
 */
export function useRequiredParams<T extends string>(
  paramNames: readonly T[]
): Record<T, string>;

/**
 * Custom hook with options (returnNullOnError false or omitted)
 */
export function useRequiredParams<T extends string>(
  paramNames: readonly T[],
  options: Omit<RouteParamValidationOptions, 'returnNullOnError'> & { returnNullOnError?: false }
): Record<T, string>;

/**
 * Custom hook with options (returnNullOnError true)
 */
export function useRequiredParams<T extends string>(
  paramNames: readonly T[],
  options: Omit<RouteParamValidationOptions, 'returnNullOnError'> & { returnNullOnError: true }
): Record<T, string | null>;

// Implementation
export function useRequiredParams<T extends string>(
  paramNames: readonly T[],
  options?: RouteParamValidationOptions
): Record<T, string> | Record<T, string | null> {
  const params = useParams();
  const result = {} as any;

  for (const paramName of paramNames) {
    const value = params[paramName];
    result[paramName] = validateRouteParam(value, paramName, options) as any;
  }

  return result;
}

/**
 * Type-safe hook for extracting and validating route parameters with a typed interface
 *
 * @param options - Validation options (applied to all parameters)
 * @returns Object containing the validated route parameters
 * @throws Error if any parameter is invalid and returnNullOnError is false
 *
 * @example
 * ```tsx
 * function MatchPage() {
 *   const { clubId, ageGroupId, teamId, matchId } = useTypedParams<{
 *     clubId: string;
 *     ageGroupId: string;
 *     teamId: string;
 *     matchId: string;
 *   }>();
 *
 *   // TypeScript knows the exact shape of the returned object
 *   // All IDs are guaranteed to be valid GUIDs
 *   const matchData = useMatch(matchId);
 *   // ...
 * }
 * ```
 */
export function useTypedParams<T extends Record<string, string>>(
  options: RouteParamValidationOptions = {}
): T {
  const params = useParams();
  const result = {} as T;

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      const validated = validateRouteParam(value, key, options) as string | null;
      if (validated !== null) {
        result[key as keyof T] = validated as T[keyof T];
      }
    }
  }

  return result;
}

/**
 * Convenience hook for optional route parameters that may not always be present
 * Returns null if the parameter is missing or invalid, instead of throwing
 *
 * @param paramName - Name of the route parameter to extract
 * @param options - Validation options (returnNullOnError is forced to true)
 * @returns The validated parameter value, or null if invalid/missing
 *
 * @example
 * ```tsx
 * function TeamEditPage() {
 *   const teamId = useOptionalParam('teamId');
 *
 *   if (!teamId) {
 *     // Creating a new team
 *     return <NewTeamForm />;
 *   } else {
 *     // Editing an existing team
 *     return <EditTeamForm teamId={teamId} />;
 *   }
 * }
 * ```
 */
export function useOptionalParam(
  paramName: string,
  options: Omit<RouteParamValidationOptions, 'returnNullOnError'> = {}
): string | null {
  return useRequiredParam(paramName, { ...options, returnNullOnError: true });
}

/**
 * Convenience hook for optional route parameters that may not always be present
 * Returns an object with null values for missing/invalid parameters
 *
 * @param paramNames - Array of route parameter names to extract
 * @param options - Validation options (returnNullOnError is forced to true)
 * @returns Object mapping parameter names to their validated values (or null)
 *
 * @example
 * ```tsx
 * function ReportPage() {
 *   const { reportId, playerId } = useOptionalParams(['reportId', 'playerId']);
 *
 *   if (!reportId) {
 *     // Creating a new report
 *     return <NewReportForm playerId={playerId} />;
 *   } else {
 *     // Viewing/editing an existing report
 *     return <EditReportForm reportId={reportId} playerId={playerId} />;
 *   }
 * }
 * ```
 */
export function useOptionalParams<T extends string>(
  paramNames: readonly T[],
  options: Omit<RouteParamValidationOptions, 'returnNullOnError'> = {}
): Record<T, string | null> {
  return useRequiredParams(paramNames, { ...options, returnNullOnError: true });
}
