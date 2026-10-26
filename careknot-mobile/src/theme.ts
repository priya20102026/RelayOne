export interface ThemeColors {
  canvas: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  primarySoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
}

export const classicTheme: ThemeColors = {
  canvas: "#F7F8FA",
  surface: "#FFFFFF",
  border: "#E4E7EC",
  text: "#1F2430",
  muted: "#7A8290",
  primary: "#0E9F8E",
  primarySoft: "#E3F5F2",
  danger: "#E0515B",
  dangerSoft: "#FCE8E9",
  success: "#2DA44E",
  successSoft: "#E6F6EA",
  warning: "#D97706",
  warningSoft: "#FDF1DE",
};

export const neutralTheme: ThemeColors = {
  canvas: "#F4F4F5",
  surface: "#FFFFFF",
  border: "#D4D4D8",
  text: "#18181B",
  muted: "#71717A",
  primary: "#3F3F46",
  primarySoft: "#E4E4E7",
  danger: "#3F3F46",
  dangerSoft: "#E4E4E7",
  success: "#27272A",
  successSoft: "#E4E4E7",
  warning: "#52525B",
  warningSoft: "#E4E4E7",
};

export type ThemeName = "classic" | "neutral";

export const themes: Record<ThemeName, ThemeColors> = {
  classic: classicTheme,
  neutral: neutralTheme,
};
