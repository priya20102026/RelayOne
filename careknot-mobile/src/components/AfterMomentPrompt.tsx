import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { MomentOutcome } from "../types";

interface Props {
  onAnswer: (outcome: MomentOutcome) => void;
  onDismiss: () => void;
}

// Optional, never-forced follow-up — a plain dismissable banner, not a popup.
export default function AfterMomentPrompt({ onAnswer, onDismiss }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>How did that moment go?</Text>
        <TouchableOpacity onPress={onDismiss}>
          <Text style={styles.dismiss}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.option} onPress={() => onAnswer("resolved")}>
          <Text style={styles.optionText}>Resolved calmly</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => onAnswer("tough")}>
          <Text style={styles.optionText}>Still tough</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => onAnswer("needed_backup")}>
          <Text style={styles.optionText}>Needed backup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: { backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 14, gap: 10 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 13, fontWeight: "700", color: theme.text },
    dismiss: { fontSize: 13, color: theme.muted, paddingHorizontal: 4 },
    row: { flexDirection: "row", gap: 8 },
    option: { flex: 1, backgroundColor: theme.primarySoft, borderRadius: 10, paddingVertical: 9, alignItems: "center" },
    optionText: { fontSize: 11, fontWeight: "700", color: theme.primary, textAlign: "center" },
  });
