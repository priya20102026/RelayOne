import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { CareTask, FamilyMember, MemberId, TaskStatus } from "../types";
import TaskCard from "./TaskCard";

interface Props {
  tasks: CareTask[];
  members: FamilyMember[];
  currentMemberId: MemberId;
  primaryCaregiver: FamilyMember;
  onClaim: (taskId: string) => void;
  onMarkDone: (taskId: string) => void;
  onAddTask: () => void;
}

type FilterId = "all" | "open" | "claimed" | "done";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Unassigned" },
  { id: "claimed", label: "Claimed" },
  { id: "done", label: "Done" },
];

export default function TaskBoard({ tasks, members, currentMemberId, onClaim, onMarkDone, onAddTask }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [filter, setFilter] = useState<FilterId>("all");

  const visibleTasks = tasks.filter((t) => (filter === "all" ? true : t.status === (filter as TaskStatus)));

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Task Board</Text>
        <TouchableOpacity onPress={onAddTask}>
          <Text style={styles.addLink}>+ Add task</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && { backgroundColor: theme.primary }]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterText, filter === f.id && { color: "#fff" }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {visibleTasks.length === 0 ? (
        <Text style={styles.empty}>Nothing here right now.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {visibleTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              members={members}
              currentMemberId={currentMemberId}
              onClaim={onClaim}
              onMarkDone={onMarkDone}
            />
          ))}
        </View>
      )}

      {filter === "done" && visibleTasks.length > 0 && (
        <Text style={styles.hint}>Completed tasks clear themselves 24 hours after they're marked done.</Text>
      )}
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: 12 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 16, fontWeight: "700", color: theme.text },
    addLink: { color: theme.primary, fontWeight: "700", fontSize: 13 },
    filters: { flexDirection: "row", gap: 8 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.primarySoft },
    filterText: { fontSize: 12, fontWeight: "600", color: theme.text },
    empty: { fontSize: 13, color: theme.muted, paddingVertical: 8 },
    hint: { fontSize: 11, color: theme.muted, marginTop: 2 },
  });
