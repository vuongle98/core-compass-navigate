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
      
      console.log('Keycloak init result - authenticated:', authenticated);
      console.log('Keycloak instance authenticated property:', this.keycloak.authenticated);
      console.log('Keycloak token:', this.keycloak.token ? 'present' : 'null');
      
      // The init method's return value might not be reliable, use the instance properties
      const actuallyAuthenticated = this.keycloak.authenticated && !!this.keycloak.token;
      console.log('Actually authenticated (token + flag):', actuallyAuthenticated);
      
      // If authenticated, load user profile
      if (actuallyAuthenticated) {
        try {
          console.log('Loading user profile...');
          await this.keycloak.loadUserProfile();
          console.log('User profile loaded successfully:', this.keycloak.profile);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Don't fail completely if profile loading fails
        }
      }
      
      LoggingService.info('keycloak', 'init_success', 'Keycloak initialized successfully');
      
      return actuallyAuthenticated;
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
      console.log('Starting Keycloak login...');
      await this.keycloak.login();
      
      // After successful login, load user profile
      if (this.keycloak.authenticated && this.keycloak.token) {
        try {
          await this.keycloak.loadUserProfile();
          console.log('User profile loaded after login:', this.keycloak.profile);
        } catch (error) {
          console.error('Failed to load user profile after login:', error);
        }
      }
      
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
      console.log('Starting Keycloak logout...');
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
    // Use the actual authenticated property and token presence
    const authenticated = !!(this.keycloak?.authenticated && this.keycloak?.token);
    console.log('isAuthenticated check:', {
      keycloakAuthenticated: this.keycloak?.authenticated,
      hasToken: !!this.keycloak?.token,
      result: authenticated
    });
    return authenticated;
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
      console.log('getUserInfo: Initialization failed or no keycloak instance');
      return null;
    }
    
    // Check if we have a token and are actually authenticated
    if (!this.keycloak.token || !this.keycloak.authenticated) {
      console.log('getUserInfo: No token available or not authenticated');
      return null;
    }
    
    const tokenParsed = this.keycloak.tokenParsed;
    const profile = this.keycloak.profile;
    
    console.log('getUserInfo - token present:', !!this.keycloak.token);
    console.log('getUserInfo - authenticated flag:', this.keycloak.authenticated);
    console.log('getUserInfo - tokenParsed:', tokenParsed);
    console.log('getUserInfo - profile:', profile);
    
    if (!tokenParsed) {
      console.log('getUserInfo: No token parsed data available');
      return null;
    }
    
    // Create user info from available data
    const userInfo = {
      ...tokenParsed,
      ...profile,
      // Ensure we have the essential fields
      sub: tokenParsed.sub,
      preferred_username: tokenParsed.preferred_username || profile?.username,
      email: tokenParsed.email || profile?.email,
      name: tokenParsed.name || (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : undefined),
      given_name: tokenParsed.given_name || profile?.firstName,
      family_name: tokenParsed.family_name || profile?.lastName,
      realm_access: tokenParsed.realm_access,
    };
    
    console.log('getUserInfo result:', userInfo);
    return userInfo;
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
