import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { FamilyMember, LoadSnapshot, MemberId } from "../types";

interface Props {
  snapshot: LoadSnapshot;
  currentMemberId: MemberId;
  primaryCaregiver: FamilyMember;
  currentMember: FamilyMember;
}

const statusLabel: Record<LoadSnapshot["status"], string> = {
  steady: "Steady",
  elevated: "Elevated",
  high: "High",
};

export default function LoadScoreCard({ snapshot, primaryCaregiver, currentMember }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const statusColor =
    snapshot.status === "high" ? theme.danger : snapshot.status === "elevated" ? theme.warning : theme.success;
  const statusSoft =
    snapshot.status === "high" ? theme.dangerSoft : snapshot.status === "elevated" ? theme.warningSoft : theme.successSoft;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Caregiver Load — {primaryCaregiver.name}</Text>
        <View style={[styles.badge, { backgroundColor: statusSoft }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel[snapshot.status]}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: statusColor }]}>{snapshot.score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${snapshot.score}%`, backgroundColor: statusColor }]} />
      </View>

      <View style={styles.subScores}>
        <SubScore label="Personal strain" value={snapshot.wellbeingBurden} theme={theme} />
        <SubScore label="Task load" value={snapshot.taskVolume} theme={theme} />
        <SubScore label="Support gap" value={Math.max(0, Math.min(100, 100 - snapshot.supportRelief))} theme={theme} />
      </View>
      <Text style={{ fontSize: 11, color: theme.muted, marginTop: -4 }}>Higher = heavier load</Text>

      <View style={styles.factors}>
        {snapshot.factors.map((f, i) => (
          <View key={i} style={styles.factorRow}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.factorLabel}>{f.label}</Text>
              <Text style={styles.factorDetail}>{f.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.updated}>Last updated {snapshot.lastUpdated}</Text>
    </View>
  );
}

function SubScore({ label, value, theme }: { label: string; value: number; theme: ThemeColors }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 11, color: theme.muted, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>{value}</Text>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    card: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, gap: 12 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 14, fontWeight: "700", color: theme.text, flex: 1, marginRight: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "700" },
    scoreRow: { flexDirection: "row", alignItems: "flex-end" },
    score: { fontSize: 36, fontWeight: "800" },
    scoreMax: { fontSize: 14, color: theme.muted, marginLeft: 4, marginBottom: 6 },
    barTrack: { height: 8, backgroundColor: theme.border, borderRadius: 999, overflow: "hidden" },
    barFill: { height: 8, borderRadius: 999 },
    subScores: { flexDirection: "row", gap: 16 },
    factors: { gap: 10 },
    factorRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
    factorLabel: { fontSize: 13, fontWeight: "600", color: theme.text },
    factorDetail: { fontSize: 12, color: theme.muted },
    updated: { fontSize: 11, color: theme.muted },
  });
