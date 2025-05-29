import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [initializationFailed, setInitializationFailed] = useState(false);

  const login = async () => {
    if (initializationFailed) {
      toast.info('Authentication unavailable', {
        description: 'Please configure Keycloak to enable authentication.',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('KeycloakContext: Starting login/init...');
      const authenticated = await KeycloakService.init(config);

      if (authenticated) {
        setIsAuthenticated(true);
        const info = KeycloakService.getUserInfo();
        setUserInfo(info);
        console.log('KeycloakContext: Authenticated user info:', info);
      } else {
        console.log('KeycloakContext: Not authenticated, triggering login redirect...');
        await KeycloakService.login();
      }
    } catch (error) {
      console.error('KeycloakContext: Login/init failed', error);
      setInitializationFailed(true);
      toast.error('Authentication failed', {
        description: 'Keycloak login/init error.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (initializationFailed) return;

    try {
      console.log('KeycloakContext: Logging out...');
      await KeycloakService.logout();
      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (error) {
      console.error('KeycloakContext: Logout failed', error);
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

  console.log('KeycloakContext state:', {
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
