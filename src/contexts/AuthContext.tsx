
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService, { User } from '@/services/AuthService';
import { toast } from 'sonner';
import featureFlagService from '@/services/FeatureFlagService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  resetPassword: (username: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Check if user is already authenticated
        if (AuthService.isAuthenticated()) {
          // Get user info from the token or stored user data
          const currentUser = AuthService.getCurrentUser();
          setUser(currentUser);
          
          // Refresh feature flags after login
          await featureFlagService.refreshFlags();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // If there's an error, ensure user is logged out
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Call the login method from AuthService
      const userData = await AuthService.login(username, password);
      if (userData) {
        setUser(userData);
        
        // Refresh feature flags after login
        await featureFlagService.refreshFlags();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed", {
        description: "Please check your credentials and try again."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      // Update stored user data in AuthService
      AuthService.updateCurrentUser(updatedUser);
    }
  };

  const resetPassword = async (username: string): Promise<boolean> => {
    try {
      await AuthService.resetPassword(username);
      toast.success("Password reset email sent", {
        description: "Please check your inbox for instructions"
      });
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error("Failed to send reset email", {
        description: "Please try again later"
      });
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await AuthService.changePassword({ 
        currentPassword, 
        newPassword, 
        confirmPassword: newPassword 
      });
      toast.success("Password changed successfully");
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      toast.error("Failed to change password", {
        description: "Please check your current password and try again"
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUserProfile,
        resetPassword,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
