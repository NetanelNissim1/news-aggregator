"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'cyberpunk' | 'ocean' | 'forest' | 'sunset' | 'dracula';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  articlesPerTab: number;
  setArticlesPerTab: (num: number) => void;
  disabledSources: string[];
  setDisabledSources: (sources: string[]) => void;
  disabledTabs: string[];
  setDisabledTabs: (tabs: string[]) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  refreshInterval: number;
  setRefreshInterval: (minutes: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [articlesPerTab, setArticlesPerTabState] = useState<number>(10);
  const [disabledSources, setDisabledSourcesState] = useState<string[]>([]);
  const [disabledTabs, setDisabledTabsState] = useState<string[]>([]);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>('');
  const [refreshInterval, setRefreshIntervalState] = useState<number>(0); // 0 = never
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setThemeState(savedTheme);

    const savedArticles = localStorage.getItem('articlesPerTab');
    if (savedArticles) setArticlesPerTabState(parseInt(savedArticles, 10));

    const savedDisabledSources = localStorage.getItem('disabledSources');
    if (savedDisabledSources) setDisabledSourcesState(JSON.parse(savedDisabledSources));

    const savedDisabledTabs = localStorage.getItem('disabledTabs');
    if (savedDisabledTabs) setDisabledTabsState(JSON.parse(savedDisabledTabs));

    const savedGeminiApiKey = localStorage.getItem('geminiApiKey');
    if (savedGeminiApiKey) setGeminiApiKeyState(savedGeminiApiKey);

    const savedRefreshInterval = localStorage.getItem('refreshInterval');
    if (savedRefreshInterval) setRefreshIntervalState(parseInt(savedRefreshInterval, 10));

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme to document body
    document.body.className = `theme-${theme} min-h-full flex flex-col`;
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setArticlesPerTab = (num: number) => {
    const validNum = Math.max(5, Math.min(30, num));
    setArticlesPerTabState(validNum);
    localStorage.setItem('articlesPerTab', validNum.toString());
  };

  const setDisabledSources = (sources: string[]) => {
    setDisabledSourcesState(sources);
    localStorage.setItem('disabledSources', JSON.stringify(sources));
  };

  const setDisabledTabs = (tabs: string[]) => {
    setDisabledTabsState(tabs);
    localStorage.setItem('disabledTabs', JSON.stringify(tabs));
  };

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    localStorage.setItem('geminiApiKey', key);
  };

  const setRefreshInterval = (minutes: number) => {
    setRefreshIntervalState(minutes);
    localStorage.setItem('refreshInterval', minutes.toString());
  };

  // Prevent hydration mismatch by not rendering context children until mounted if they depend on local storage
  // But we can just render them and let the client take over. To avoid flashes, we render children always.
  
  return (
    <SettingsContext.Provider value={{ 
      theme, setTheme, 
      articlesPerTab, setArticlesPerTab, 
      disabledSources, setDisabledSources,
      disabledTabs, setDisabledTabs,
      geminiApiKey, setGeminiApiKey,
      refreshInterval, setRefreshInterval
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
