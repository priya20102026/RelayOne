import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ScreenId = "home" | "chat" | "calendar" | "medical" | "settings";

const TABS: { id: ScreenId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "chat", label: "Chat" },
  { id: "calendar", label: "Calendar" },
  { id: "medical", label: "Care Hub" },
  { id: "settings", label: "Settings" },
];

interface Props {
  active: ScreenId;
  onChange: (id: ScreenId) => void;
}

export default function TabBar({ active, onChange }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  // Keeps the labels clear of the iPhone home indicator, Android gesture bar,
  // and mobile-browser toolbars so "Care Hub" / "Settings" never get clipped.
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) + 14 }]}>
      {TABS.map((t) => (
        <TouchableOpacity key={t.id} style={styles.tab} onPress={() => onChange(t.id)}>
          <View style={[styles.indicator, active === t.id && { backgroundColor: theme.primary }]} />
          <Text style={[styles.label, active === t.id && { color: theme.primary, fontWeight: "700" }]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 6,
      paddingBottom: 10,
    },
    tab: { flex: 1, alignItems: "center", gap: 4 },
    indicator: { width: 24, height: 3, borderRadius: 2, backgroundColor: "transparent" },
    label: { fontSize: 12, color: theme.muted },
  });
