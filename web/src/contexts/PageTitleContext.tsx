import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { formatTitle, getRouteContextParts, getRoutePageLabel } from '@/utils/pageTitles';

interface PageTitleContextValue {
  setFallbackTitle: (title: string) => void;
  setOverrideTitle: (title: string | null) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | undefined>(undefined);

interface PageTitleProviderProps {
  children: React.ReactNode;
}

export function PageTitleProvider({ children }: PageTitleProviderProps) {
  const [fallbackTitle, setFallbackTitleState] = useState('Our Game');
  const [overrideTitle, setOverrideTitleState] = useState<string | null>(null);

  const setFallbackTitle = useCallback((title: string) => {
    setFallbackTitleState(title);
  }, []);

  const setOverrideTitle = useCallback((title: string | null) => {
    setOverrideTitleState(title);
  }, []);

  useEffect(() => {
    document.title = overrideTitle ?? fallbackTitle;
  }, [fallbackTitle, overrideTitle]);

  const value = useMemo(
    () => ({
      setFallbackTitle,
      setOverrideTitle,
    }),
    [setFallbackTitle, setOverrideTitle],
  );

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>;
}

function usePageTitleContext() {
  const context = useContext(PageTitleContext);

  if (!context) {
    throw new Error('usePageTitle must be used inside PageTitleProvider');
  }

  return context;
}

export function usePageTitle(parts: Array<string | null | undefined>, enabled = true) {
  const { setOverrideTitle } = usePageTitleContext();
  const location = useLocation();
  const partsKey = parts.map(part => part ?? '').join('||');
  const formattedTitle = useMemo(() => {
    const normalizedParts = parts
      .map(part => (part ?? '').trim())
      .filter(part => part.length > 0);

    if (normalizedParts.length === 1 && location.pathname.startsWith('/dashboard')) {
      const contextParts = getRouteContextParts(location.pathname);
      const routePageLabel = getRoutePageLabel(location.pathname);
      return formatTitle([...contextParts, routePageLabel]);
    }

    return formatTitle(parts);
  }, [location.pathname, partsKey]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setOverrideTitle(formattedTitle);

    return () => {
      setOverrideTitle(null);
    };
  }, [enabled, formattedTitle, setOverrideTitle]);
}

export function usePageTitleFallback(title: string) {
  const { setFallbackTitle } = usePageTitleContext();

  useEffect(() => {
    setFallbackTitle(title);
  }, [setFallbackTitle, title]);
}
