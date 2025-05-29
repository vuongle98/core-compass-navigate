
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import KeycloakService from '@/services/KeycloakService';
import { toast } from 'sonner';

interface KeycloakContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: any;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasResourceRole: (resource: string, role: string) => boolean;
  token: string | undefined;
  initializationFailed: boolean;
}

const KeycloakContext = createContext<KeycloakContextType | null>(null);

interface KeycloakProviderProps {
  children: ReactNode;
  config: {
    url: string;
    realm: string;
    clientId: string;
  };
}

export function KeycloakProvider({ children, config }: KeycloakProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [initializationFailed, setInitializationFailed] = useState(false);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        console.log('KeycloakContext: Starting initialization...');
        const authenticated = await KeycloakService.init(config);
        
        console.log('KeycloakContext: Init result - authenticated:', authenticated);
        setIsAuthenticated(authenticated);
        setInitializationFailed(KeycloakService.hasInitializationFailed());
        
        if (authenticated) {
          // Get user info after successful authentication
          const userInfoData = KeycloakService.getUserInfo();
          console.log('KeycloakContext: User info loaded:', userInfoData);
          setUserInfo(userInfoData);
        } else {
          console.log('KeycloakContext: Not authenticated, clearing user info');
          setUserInfo(null);
        }

        if (KeycloakService.hasInitializationFailed()) {
          console.warn('Keycloak initialization failed - running in development mode');
          toast.warning('Authentication service unavailable', {
            description: 'Running in development mode. Some features may be limited.',
          });
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
        setInitializationFailed(true);
        setIsAuthenticated(false);
        setUserInfo(null);
        toast.error('Failed to initialize authentication', {
          description: 'Running in development mode. Please check your Keycloak configuration.',
        });
      } finally {
        console.log('KeycloakContext: Initialization complete, setting loading to false');
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, [config]);

  const login = async () => {
    if (initializationFailed) {
      toast.info('Authentication unavailable', {
        description: 'Please configure Keycloak to enable authentication.',
      });
      return;
    }

    try {
      console.log('KeycloakContext: Starting login...');
      await KeycloakService.login();
      
      // After login, update state
      const authenticated = KeycloakService.isAuthenticated();
      console.log('KeycloakContext: Post-login authenticated state:', authenticated);
      
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userInfoData = KeycloakService.getUserInfo();
        console.log('KeycloakContext: Post-login user info:', userInfoData);
        setUserInfo(userInfoData);
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed');
    }
  };

  const logout = async () => {
    if (initializationFailed) {
      return;
    }

    try {
      console.log('KeycloakContext: Starting logout...');
      await KeycloakService.logout();
      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  const hasRole = (role: string): boolean => {
    return KeycloakService.hasRole(role);
  };

  const hasResourceRole = (resource: string, role: string): boolean => {
    return KeycloakService.hasResourceRole(resource, role);
  };

  const token = KeycloakService.getToken();

  console.log('KeycloakContext render state:', {
    isAuthenticated,
    isLoading,
    userInfo: userInfo ? 'present' : 'null',
    initializationFailed
  });

  return (
    <KeycloakContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userInfo,
        login,
        logout,
        hasRole,
        hasResourceRole,
        token,
        initializationFailed,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloak() {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }
  return context;
}
