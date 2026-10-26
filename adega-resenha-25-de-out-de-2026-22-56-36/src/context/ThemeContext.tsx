import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.ts';
import { ThemeEvent } from '../types.ts';

export type ThemeType = 'padrao' | 'halloween' | 'neon' | 'festa_roxa' | 'aniversario' | 'verao';

interface ThemeContextType {
  activeTheme: ThemeType;
  previewTheme: ThemeType | null;
  effectiveTheme: ThemeType;
  themeEvent?: ThemeEvent;
  isHalloween: boolean;
  isNeon: boolean;
  isFestaRoxa: boolean;
  reason: string;
  nowSaoPaulo: string;
  refreshTheme: () => Promise<void>;
  setPreviewMode: (theme: ThemeType | null) => void;
  setManualOverride: (override: 'auto' | 'padrao' | 'halloween' | 'neon' | 'festa_roxa') => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeType>('padrao');
  const [previewTheme, setPreviewTheme] = useState<ThemeType | null>(null);
  const [themeEvent, setThemeEvent] = useState<ThemeEvent | undefined>(undefined);
  const [reason, setReason] = useState<string>('');
  const [nowSaoPaulo, setNowSaoPaulo] = useState<string>('');

  const refreshTheme = useCallback(async () => {
    try {
      const data = await api.getActiveTheme();
      if (data && data.activeTheme) {
        setActiveTheme(data.activeTheme as ThemeType);
        setReason(data.reason || '');
        setThemeEvent(data.event);
        setNowSaoPaulo(data.nowSaoPaulo || '');
      }
    } catch (err) {
      console.error('Failed to fetch active theme', err);
    }
  }, []);

  useEffect(() => {
    refreshTheme();
    // Automatic periodic check every 30 seconds to support live calendar midnight date transitions
    const interval = setInterval(refreshTheme, 30000);
    return () => clearInterval(interval);
  }, [refreshTheme]);

  const setManualOverride = async (override: 'auto' | 'padrao' | 'halloween' | 'neon' | 'festa_roxa') => {
    await api.setThemeOverride(override);
    setPreviewTheme(null);
    await refreshTheme();
  };

  const effectiveTheme: ThemeType = previewTheme || activeTheme;
  const isHalloween = effectiveTheme === 'halloween';
  const isNeon = effectiveTheme === 'neon';
  const isFestaRoxa = effectiveTheme === 'festa_roxa';

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        previewTheme,
        effectiveTheme,
        themeEvent,
        isHalloween,
        isNeon,
        isFestaRoxa,
        reason,
        nowSaoPaulo,
        refreshTheme,
        setPreviewMode: setPreviewTheme,
        setManualOverride,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
