
import KeycloakService from "./KeycloakService";

/**
 * Get the access token from Keycloak
 */
export const getAccessToken = (): string | null => {
  return KeycloakService.getToken() || null;
};

/**
 * Set the access token - not applicable for Keycloak as it manages tokens internally
 */
export const setAccessToken = (token: string): void => {
  console.warn("setAccessToken called but Keycloak manages tokens internally");
};

/**
 * Remove the access token - handled by Keycloak logout
 */
export const removeAccessToken = (): void => {
  console.warn("removeAccessToken called but should use Keycloak logout");
};

/**
 * Check if a user is authenticated using Keycloak
 */
export const isAuthenticated = (): boolean => {
  return KeycloakService.isAuthenticated();
};

// For backward compatibility with code that uses TokenService as default import
const TokenService = {
  getToken: getAccessToken,
  setToken: setAccessToken,
  removeToken: removeAccessToken,
  isAuthenticated,
  refreshToken: async (): Promise<boolean> => {
    return await KeycloakService.refreshToken();
  },
};

export default TokenService;
