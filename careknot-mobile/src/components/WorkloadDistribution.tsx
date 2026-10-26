import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { FamilyMember, MemberId } from "../types";

interface Props {
  members: FamilyMember[];
  currentMemberId: MemberId;
}

// Fixed illustrative split so the bar and cards have something to show —
// in a real build this comes from counting each member's claimed tasks.
const SHARE: Record<MemberId, number> = { robert: 55, david: 25, sarah: 20 };

export default function WorkloadDistribution({ members, currentMemberId }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Family Workload</Text>
      <View style={styles.bar}>
        {members.map((m) => (
          <View key={m.id} style={{ flex: SHARE[m.id] || 1, backgroundColor: m.color }} />
        ))}
      </View>
      <View style={styles.rows}>
        {members.map((m) => (
          <View key={m.id} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: m.color }]} />
            <Text style={[styles.name, m.id === currentMemberId && { fontWeight: "700" }]}>{m.name}</Text>
            <Text style={styles.pct}>{SHARE[m.id] || 0}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    card: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, gap: 12 },
    title: { fontSize: 14, fontWeight: "700", color: theme.text },
    bar: { flexDirection: "row", height: 10, borderRadius: 999, overflow: "hidden" },
    rows: { gap: 8 },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    name: { flex: 1, fontSize: 13, color: theme.text },
    pct: { fontSize: 13, color: theme.muted, fontWeight: "600" },
  });
