
import Keycloak from 'keycloak-js';
import LoggingService from './LoggingService';

class KeycloakService {
  private keycloak: Keycloak | null = null;
  private initialized = false;
  private initializationFailed = false;

  /**
   * Initialize Keycloak
   */
  async init(config: {
    url: string;
    realm: string;
    clientId: string;
  }): Promise<boolean> {
    try {
      console.log('Initializing Keycloak with config:', config);
      
      this.keycloak = new Keycloak({
        url: config.url,
        realm: config.realm,
        clientId: config.clientId,
      });

      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
        pkceMethod: 'S256'
      });

      this.initialized = true;
      this.initializationFailed = false;
      LoggingService.info('keycloak', 'init_success', 'Keycloak initialized successfully');
      
      return authenticated;
    } catch (error) {
      this.initializationFailed = true;
      LoggingService.error('keycloak', 'init_failed', 'Failed to initialize Keycloak', error);
      console.error('Keycloak initialization failed:', error);
      console.warn('Running in development mode without Keycloak authentication');
      return false;
    }
  }

  /**
   * Check if initialization failed
   */
  hasInitializationFailed(): boolean {
    return this.initializationFailed;
  }

  /**
   * Login to Keycloak
   */
  async login(): Promise<void> {
    if (!this.keycloak) {
      if (this.initializationFailed) {
        console.warn('Keycloak not available - using development mode');
        return;
      }
      throw new Error('Keycloak not initialized');
    }

    try {
      await this.keycloak.login();
      LoggingService.info('keycloak', 'login_success', 'User logged in successfully');
    } catch (error) {
      LoggingService.error('keycloak', 'login_failed', 'Login failed', error);
      throw error;
    }
  }

  /**
   * Logout from Keycloak
   */
  async logout(): Promise<void> {
    if (!this.keycloak) {
      if (this.initializationFailed) {
        console.warn('Keycloak not available - using development mode');
        return;
      }
      throw new Error('Keycloak not initialized');
    }

    try {
      await this.keycloak.logout();
      LoggingService.info('keycloak', 'logout_success', 'User logged out successfully');
    } catch (error) {
      LoggingService.error('keycloak', 'logout_failed', 'Logout failed', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (this.initializationFailed) {
      // In development mode without Keycloak, return false
      return false;
    }
    return this.keycloak?.authenticated ?? false;
  }

  /**
   * Get user token
   */
  getToken(): string | undefined {
    if (this.initializationFailed) {
      return undefined;
    }
    return this.keycloak?.token;
  }

  /**
   * Get user info
   */
  getUserInfo(): any {
    if (this.initializationFailed) {
      return null;
    }
    return this.keycloak?.tokenParsed;
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<boolean> {
    if (!this.keycloak || this.initializationFailed) {
      return false;
    }

    try {
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        LoggingService.info('keycloak', 'token_refreshed', 'Token refreshed successfully');
      }
      return refreshed;
    } catch (error) {
      LoggingService.error('keycloak', 'token_refresh_failed', 'Token refresh failed', error);
      return false;
    }
  }

  /**
   * Get Keycloak instance
   */
  getKeycloak(): Keycloak | null {
    return this.keycloak;
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    if (this.initializationFailed) {
      return false;
    }
    return this.keycloak?.hasRealmRole(role) ?? false;
  }

  /**
   * Check if user has resource role
   */
  hasResourceRole(resource: string, role: string): boolean {
    if (this.initializationFailed) {
      return false;
    }
    return this.keycloak?.hasResourceRole(role, resource) ?? false;
  }
}

const keycloakService = new KeycloakService();
export default keycloakService;
