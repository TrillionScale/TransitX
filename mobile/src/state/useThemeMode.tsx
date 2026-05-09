import React, { createContext, useContext, useMemo, useState } from 'react';

type Mode = 'light' | 'dark';

type Ctx = {
  mode: Mode;
  toggle: () => void;
};

const ThemeModeContext = createContext<Ctx>({ mode: 'light', toggle: () => {} });

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('light');
  const toggle = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));
  return (
    <ThemeModeContext.Provider value={{ mode, toggle }}>{children}</ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);

/**
 * 모드에 따라 변하는 색만 반환. 다크에선 페일 배경에 쓰던 어두운 텍스트가 흰톤으로 뒤집힘.
 */
export const useDynamicColors = () => {
  const { mode } = useThemeMode();
  return useMemo(() => {
    const isDark = mode === 'dark';
    return {
      textOnLight: isDark ? '#F5F7FF' : '#0E1116',
      textOnLightMuted: isDark ? 'rgba(245,247,255,0.7)' : 'rgba(14,17,22,0.62)',
      textOnLightFaint: isDark ? 'rgba(245,247,255,0.45)' : 'rgba(14,17,22,0.38)',
    };
  }, [mode]);
};
