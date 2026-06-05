/**
 * Authentication Context
 * 
 * Provides authentication state and user information throughout the application
 * using Azure Static Web Apps built-in authentication.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserInfo, ClientPrincipal, getUserEmail, getUserDisplayName, getUserGivenName, getUserSurname, hasRole } from '@/api/auth';
import { apiClient } from '@/api/client';

interface AuthContextType {
  user: ClientPrincipal | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  email: string | undefined;
  displayName: string | undefined;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ClientPrincipal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const userInfo = await getUserInfo();
      setUser(userInfo);

      if (userInfo) {
        const claimHeaders: Record<string, string> = {};
        const email = getUserEmail(userInfo);
        const givenName = getUserGivenName(userInfo);
        const surname = getUserSurname(userInfo);
        if (email) claimHeaders['x-user-email'] = email;
        if (givenName) claimHeaders['x-user-given-name'] = givenName;
        if (surname) claimHeaders['x-user-surname'] = surname;
        await apiClient.users.getCurrentUser(Object.keys(claimHeaders).length > 0 ? claimHeaders : undefined);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin: hasRole(user, 'admin'),
    email: getUserEmail(user),
    displayName: getUserDisplayName(user),
    refreshUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
