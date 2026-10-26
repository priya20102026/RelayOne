import React, { createContext, useContext, useState } from "react";
import { ThemeColors, ThemeName, themes } from "./theme";

interface ThemeSettingContextValue {
  theme: ThemeColors;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const ThemeSettingContext = createContext<ThemeSettingContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("classic");
  const theme = themes[themeName];

  return (
    <ThemeSettingContext.Provider value={{ theme, themeName, setThemeName }}>
      {children}
    </ThemeSettingContext.Provider>
  );
}

/** Most components just need the active color palette. */
export function useTheme(): ThemeColors {
  const ctx = useContext(ThemeSettingContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx.theme;
}

/** Settings screen needs the name + setter too. */
export function useThemeSetting() {
  const ctx = useContext(ThemeSettingContext);
  if (!ctx) throw new Error("useThemeSetting must be used within a ThemeProvider");
  return ctx;
}
