import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";

interface Props {
  onOpenInThisMoment: () => void;
  onOpenWanderingSafety: () => void;
  onOpenBoxBreathing: () => void;
}

// Two fast-access tiles for Robert's Home screen — both open an instant,
// fully local flow (no loading, works offline). Calm teal, not red: red is
// reserved for the genuine escalation points inside each flow.
export default function QuickActionTiles({ onOpenInThisMoment, onOpenWanderingSafety, onOpenBoxBreathing }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.tile} onPress={onOpenInThisMoment}>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.label}>In This Moment</Text>
          <Text style={styles.sub}>Fast support, right now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tile} onPress={onOpenWanderingSafety}>
          <Text style={styles.icon}>🧭</Text>
          <Text style={styles.label}>Wandering Safety</Text>
          <Text style={styles.sub}>Ready-to-send alert</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.tile, styles.wideTile]} onPress={onOpenBoxBreathing}>
        <Text style={styles.icon}>🫁</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Box Breathing</Text>
          <Text style={styles.sub}>A calm 3-minute reset: in 4 · hold 4 · out 4 · hold 4</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: "row", gap: 10 },
    tile: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      gap: 2,
    },
    wideTile: { flex: 0, flexDirection: "row", alignItems: "center", gap: 12 },
    icon: { fontSize: 22, marginBottom: 4 },
    label: { fontSize: 13, fontWeight: "700", color: theme.text },
    sub: { fontSize: 11, color: theme.muted },
  });
