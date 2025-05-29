import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import featureFlagService from "@/services/FeatureFlagService";
import { User } from "@/types/Auth";
import ServiceRegistry from "@/services/ServiceRegistry";
import { useKeycloak } from "@/contexts/KeycloakContext";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  updateUserProfile: (data: Partial<User>) => void;
  resetPassword: (username: string) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const keycloak = useKeycloak();

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext: initAuth called with state:', {
        keycloakLoading: keycloak.isLoading,
        keycloakAuthenticated: keycloak.isAuthenticated,
        keycloakUserInfo: keycloak.userInfo ? 'present' : 'null',
        initializationFailed: keycloak.initializationFailed
      });

      // Wait for Keycloak to finish loading
      if (keycloak.isLoading) {
        console.log('AuthContext: Keycloak still loading, waiting...');
        return;
      }

      setIsLoading(true);
      try {
        if (keycloak.isAuthenticated && keycloak.userInfo) {
          console.log('AuthContext: User is authenticated with userInfo:', keycloak.userInfo);
          
          // Convert Keycloak user info to our User type
          const userData: User = {
            id: keycloak.userInfo.sub || keycloak.userInfo.preferred_username || "unknown",
            username: keycloak.userInfo.preferred_username || keycloak.userInfo.name || "user",
            email: keycloak.userInfo.email || "",
            roles: keycloak.userInfo.realm_access?.roles || [],
            name: keycloak.userInfo.name,
            firstName: keycloak.userInfo.given_name,
            lastName: keycloak.userInfo.family_name,
          };
          
          console.log('AuthContext: Setting user data:', userData);
          setUser(userData);
          ServiceRegistry.updateCurrentUser(userData);
          
          // Refresh feature flags after login
          await featureFlagService.refreshFlags();
        } else if (keycloak.isAuthenticated && !keycloak.userInfo) {
          // User is authenticated but userInfo is not available
          console.log('AuthContext: User authenticated but userInfo not available');
          // Don't set user yet, wait for userInfo to be loaded
        } else {
          // Not authenticated or initialization failed
          console.log('AuthContext: User not authenticated, clearing user data');
          setUser(null);
          ServiceRegistry.updateCurrentUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Auth initialization error:", error);
        setUser(null);
        ServiceRegistry.updateCurrentUser(null);
      } finally {
        // Only set loading to false when we have a definitive state
        if (!keycloak.isAuthenticated || keycloak.userInfo || keycloak.initializationFailed) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
  }, [keycloak.isLoading, keycloak.isAuthenticated, keycloak.userInfo, keycloak.initializationFailed]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    // For Keycloak, we redirect to the login page
    // This method is kept for compatibility but will use Keycloak login
    try {
      console.log('AuthContext: Starting login...');
      await keycloak.login();
      return true;
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      toast.error("Login failed", {
        description: "Please try again.",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('AuthContext: Starting logout...');
      await keycloak.logout();
      setUser(null);
      ServiceRegistry.updateCurrentUser(null);
    } catch (error) {
      console.error("AuthContext: Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      ServiceRegistry.updateCurrentUser(updatedUser);
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    updateUser(data);
  };

  const resetPassword = async (username: string): Promise<boolean> => {
    try {
      // Keycloak handles password reset through its own flow
      toast.info("Password reset", {
        description: "Please use the Keycloak admin console to reset your password",
      });
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to reset password");
      return false;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      // Keycloak handles password changes through its own flow
      toast.info("Change password", {
        description: "Please use the Keycloak account console to change your password",
      });
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Failed to change password");
      return false;
    }
  };

  console.log('AuthContext render state:', {
    user: user ? 'present' : 'null',
    isAuthenticated: keycloak.isAuthenticated,
    isLoading: isLoading || keycloak.isLoading
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: keycloak.isAuthenticated,
        isLoading: isLoading || keycloak.isLoading,
        login,
        logout,
        updateUser,
        updateUserProfile,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
