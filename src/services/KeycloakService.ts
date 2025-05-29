
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
      
      // If authenticated, load user profile
      if (authenticated && this.keycloak.authenticated) {
        try {
          await this.keycloak.loadUserProfile();
          console.log('User profile loaded successfully');
        } catch (error) {
          console.error('Failed to load user profile:', error);
        }
      }
      
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
   * Get user info - combines tokenParsed and profile data
   */
  getUserInfo(): any {
    if (this.initializationFailed || !this.keycloak) {
      return null;
    }
    
    // Combine token parsed data with profile data
    const tokenParsed = this.keycloak.tokenParsed;
    const profile = this.keycloak.profile;
    
    if (!tokenParsed) {
      return null;
    }
    
    return {
      ...tokenParsed,
      ...profile,
      // Ensure we have the essential fields
      sub: tokenParsed.sub,
      preferred_username: tokenParsed.preferred_username || profile?.username,
      email: tokenParsed.email || profile?.email,
      name: tokenParsed.name || profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : undefined,
      given_name: tokenParsed.given_name || profile?.firstName,
      family_name: tokenParsed.family_name || profile?.lastName,
      realm_access: tokenParsed.realm_access,
    };
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
