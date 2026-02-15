import { createContext, useContext, useState, ReactNode } from 'react';

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

  const toggleDesktopNav = () => {
    setIsDesktopOpen(!isDesktopOpen);
  };

  const setEntityName = (type: string, id: string, name: string) => {
    const key = `${type}:${id}`;
    setEntityNames(prev => ({ ...prev, [key]: name }));
  };

  const getEntityName = (type: string, id: string): string | undefined => {
    const key = `${type}:${id}`;
    return entityNames[key];
  };

  return (
    <NavigationContext.Provider value={{ 
      isDesktopOpen, 
      setIsDesktopOpen, 
      toggleDesktopNav,
      setEntityName,
      getEntityName
    }}>
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
