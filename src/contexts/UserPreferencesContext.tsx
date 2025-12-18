import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NavigationStyle = 'classic' | 'modern';

interface UserPreferences {
  navigationStyle: NavigationStyle;
  notifications: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setNavigationStyle: (style: NavigationStyle) => void;
  setNotifications: (enabled: boolean) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const STORAGE_KEY = 'userPreferences';

const defaultPreferences: UserPreferences = {
  navigationStyle: 'classic',
  notifications: true,
};

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Load preferences from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Failed to parse user preferences:', e);
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setNavigationStyle = (style: NavigationStyle) => {
    setPreferences(prev => ({ ...prev, navigationStyle: style }));
  };

  const setNotifications = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, notifications: enabled }));
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        setNavigationStyle,
        setNotifications,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
