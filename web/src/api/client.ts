/**
 * API Client Configuration
 * 
 * This module configures the generated TypeScript API client with the correct base URL
 * for both local development (SWA CLI proxy) and production (Azure Static Web Apps).
 */

// Import the generated client (will be created after running npm run generate:api)
// import { OurGameApiClient } from './generated/client';

/**
 * Get the API base URL based on the environment
 */
export function getApiBaseUrl(): string {
  // In development with SWA CLI, the API is proxied through /api
  // In production, Azure Static Web Apps automatically routes /api to the Function App
  return import.meta.env.VITE_API_BASE_URL || '/api';
}

/**
 * Create a configured API client instance
 * 
 * Usage:
 * ```typescript
 * import { createApiClient } from '@/api/client';
 * 
 * const api = createApiClient();
 * const clubs = await api.getAllClubs();
 * ```
 */
export function createApiClient() {
  const baseUrl = getApiBaseUrl();
  
  // Uncomment after generating the client:
  // return new OurGameApiClient(baseUrl);
  
  // Placeholder for now
  return {
    baseUrl,
    // Add methods here after client generation
  };
}

/**
 * Default API client instance
 * Import this for convenience in components
 */
export const apiClient = createApiClient();
