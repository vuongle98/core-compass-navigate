
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

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await KeycloakService.init(config);
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          setUserInfo(KeycloakService.getUserInfo());
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
        toast.error('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, [config]);

  const login = async () => {
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
