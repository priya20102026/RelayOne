import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { CareTask, FamilyMember, MemberId } from "../types";

interface Props {
  task: CareTask;
  members: FamilyMember[];
  currentMemberId: MemberId;
  onClaim: (taskId: string) => void;
  onMarkDone: (taskId: string) => void;
}

function memberColor(members: FamilyMember[], id: MemberId | null, fallback: string) {
  if (!id) return fallback;
  return members.find((m) => m.id === id)?.color ?? fallback;
}

export default function TaskCard({ task, members, currentMemberId, onClaim, onMarkDone }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const isDone = task.status === "done";
  const isClaimed = task.status === "claimed";
  const assignee = members.find((m) => m.id === task.assignedTo);
  const accentColor = memberColor(members, task.assignedTo, theme.border);

  return (
    <View style={[styles.card, (isClaimed || isDone) && { borderLeftWidth: 4, borderLeftColor: accentColor }]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, isDone && styles.titleDone]}>{task.title}</Text>
        {task.urgent && !isDone && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>Urgent</Text>
          </View>
        )}
      </View>

      <Text style={[styles.description, isDone && styles.titleDone]}>{task.description}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{task.durationLabel}</Text>
        {task.startTime && task.endTime && (
          <Text style={styles.meta}>• {task.startTime}–{task.endTime}</Text>
        )}
      </View>

      {assignee && (
        <View style={[styles.assigneeBadge, { backgroundColor: accentColor + "22", borderColor: accentColor }]}>
          <View style={[styles.assigneeDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.assigneeText, { color: accentColor }]}>
            {isDone ? "Done by" : "Claimed by"} {assignee.name}
          </Text>
        </View>
      )}

      {!isDone && (
        <View style={styles.actions}>
          {task.status === "open" && (
            <TouchableOpacity style={[styles.button, styles.claimButton]} onPress={() => onClaim(task.id)}>
              <Text style={styles.claimButtonText}>Claim this</Text>
            </TouchableOpacity>
          )}
          {isClaimed && task.assignedTo === currentMemberId && (
            <TouchableOpacity style={[styles.button, styles.doneButton]} onPress={() => onMarkDone(task.id)}>
              <Text style={styles.doneButtonText}>Mark done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    card: { backgroundColor: theme.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border, gap: 8 },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
    title: { fontSize: 15, fontWeight: "700", color: theme.text, flex: 1 },
    titleDone: { color: theme.muted, textDecorationLine: "line-through" },
    description: { fontSize: 13, color: theme.muted },
    urgentBadge: { backgroundColor: theme.dangerSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    urgentText: { color: theme.danger, fontSize: 11, fontWeight: "700" },
    metaRow: { flexDirection: "row", gap: 6 },
    meta: { fontSize: 12, color: theme.muted },
    assigneeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
    },
    assigneeDot: { width: 7, height: 7, borderRadius: 3.5 },
    assigneeText: { fontSize: 12, fontWeight: "700" },
    actions: { flexDirection: "row", gap: 8, marginTop: 4 },
    button: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    claimButton: { backgroundColor: theme.primary },
    claimButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    doneButton: { backgroundColor: theme.successSoft },
    doneButtonText: { color: theme.success, fontWeight: "700", fontSize: 13 },
  });
