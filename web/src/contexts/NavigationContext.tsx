import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface NavigationContextType {
  isDesktopOpen: boolean;
  setIsDesktopOpen: (isOpen: boolean) => void;
  toggleDesktopNav: () => void;
  setEntityName: (type: string, id: string, name: string) => void;
  getEntityName: (type: string, id: string) => string | undefined;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [entityNames, setEntityNames] = useState<Record<string, string>>({});

  const toggleDesktopNav = useCallback(() => {
    setIsDesktopOpen(prev => !prev);
  }, []);

  const setEntityName = useCallback((type: string, id: string, name: string) => {
    const key = `${type}:${id}`;
    setEntityNames(prev => {
      // Idempotent: only update if the value is different
      if (prev[key] === name) {
        return prev;
      }
      return { ...prev, [key]: name };
    });
  }, []);

  const getEntityName = useCallback((type: string, id: string): string | undefined => {
    const key = `${type}:${id}`;
    return entityNames[key];
  }, [entityNames]);

  const value = useMemo(() => ({
    isDesktopOpen, 
    setIsDesktopOpen, 
    toggleDesktopNav,
    setEntityName,
    getEntityName
  }), [isDesktopOpen, toggleDesktopNav, setEntityName, getEntityName]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
