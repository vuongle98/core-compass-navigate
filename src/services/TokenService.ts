
/**
 * Service for handling authentication tokens
 */
const TOKEN_KEY = 'token';

/**
 * Get the access token from local storage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set the access token in local storage
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the access token from local storage
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if a user is authenticated by verifying token presence
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// For backward compatibility with code that uses TokenService as default import
const TokenService = {
  getToken: getAccessToken,
  setToken: setAccessToken,
  removeToken: removeAccessToken,
  isAuthenticated,
  refreshToken: async (): Promise<boolean> => {
    // This is a placeholder - actual implementation would depend on your auth flow
    console.warn('TokenService.refreshToken() called but not fully implemented');
    return false;
  }
};

export default TokenService;
