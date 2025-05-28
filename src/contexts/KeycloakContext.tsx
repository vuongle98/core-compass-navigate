
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
        const authenticated = await KeycloakService.init(config);
        setIsAuthenticated(authenticated);
        setInitializationFailed(KeycloakService.hasInitializationFailed());
        
        if (authenticated) {
          setUserInfo(KeycloakService.getUserInfo());
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
        toast.error('Failed to initialize authentication', {
          description: 'Running in development mode. Please check your Keycloak configuration.',
        });
      } finally {
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
      await KeycloakService.login();
      setIsAuthenticated(true);
      setUserInfo(KeycloakService.getUserInfo());
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
