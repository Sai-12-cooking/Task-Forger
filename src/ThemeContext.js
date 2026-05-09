import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, DEFAULT_THEME_ID } from './styles';

const ThemeContext = createContext({ theme: THEMES[DEFAULT_THEME_ID], themeId: DEFAULT_THEME_ID, setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);

  useEffect(() => {
    AsyncStorage.getItem('@theme_id').then(saved => {
      if (saved && THEMES[saved]) setThemeId(saved);
    }).catch(() => {});
  }, []);

  const setTheme = (id) => {
    if (!THEMES[id]) return;
    setThemeId(id);
    AsyncStorage.setItem('@theme_id', id).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
