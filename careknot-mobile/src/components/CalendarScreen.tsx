import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { CalendarEvent, FamilyMember } from "../types";

interface Props {
  events: CalendarEvent[];
  members: FamilyMember[];
  onAddEvent: () => void;
}

export default function CalendarScreen({ events, members, onAddEvent }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    acc[e.dateLabel] = acc[e.dateLabel] || [];
    acc[e.dateLabel].push(e);
    return acc;
  }, {});

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Shared Calendar</Text>
        <TouchableOpacity onPress={onAddEvent}>
          <Text style={styles.addLink}>+ Add event</Text>
        </TouchableOpacity>
      </View>

      {Object.entries(grouped).map(([day, dayEvents]) => (
        <View key={day} style={{ gap: 8 }}>
          <Text style={styles.dayLabel}>{day}</Text>
          {dayEvents.map((e) => {
            const member = members.find((m) => m.id === e.memberId);
            const color = member?.color ?? theme.muted;
            return (
              <View key={e.id} style={[styles.eventCard, { borderLeftColor: color }]}>
                <View style={styles.eventTop}>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  {e.startTime && e.endTime && (
                    <Text style={styles.eventTime}>{e.startTime}–{e.endTime}</Text>
                  )}
                </View>
                <View style={styles.assigneeRow}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={[styles.assigneeText, { color }]}>
                    {member ? member.name : "Unassigned"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      {events.length === 0 && <Text style={styles.empty}>No events yet.</Text>}
    </ScrollView>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: theme.canvas },
    content: { padding: 16, gap: 16 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 18, fontWeight: "700", color: theme.text },
    addLink: { color: theme.primary, fontWeight: "700", fontSize: 13 },
    dayLabel: { fontSize: 13, fontWeight: "700", color: theme.muted, textTransform: "uppercase" },
    eventCard: { backgroundColor: theme.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4, gap: 6 },
    eventTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    eventTitle: { fontSize: 14, fontWeight: "600", color: theme.text, flex: 1 },
    eventTime: { fontSize: 12, color: theme.muted },
    assigneeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    dot: { width: 7, height: 7, borderRadius: 3.5 },
    assigneeText: { fontSize: 12, fontWeight: "700" },
    empty: { fontSize: 13, color: theme.muted },
  });
