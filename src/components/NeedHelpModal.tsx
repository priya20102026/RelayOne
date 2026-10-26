import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { TaskCategory } from "../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    category: TaskCategory;
    durationLabel: string;
    urgent: boolean;
    startTime?: string;
    endTime?: string;
  }) => void;
}

const CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: "meals", label: "Meals" },
  { id: "transport", label: "Transport" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "household", label: "Household" },
  { id: "companionship", label: "Companionship" },
  { id: "other", label: "Other" },
];

export default function NeedHelpModal({ visible, onClose, onSubmit }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("other");
  const [durationLabel, setDurationLabel] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const reset = () => {
    setTitle("");
    setCategory("other");
    setDurationLabel("");
    setUrgent(false);
    setStartTime("");
    setEndTime("");
  };

  const submit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      category,
      durationLabel: durationLabel.trim() || "—",
      urgent,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    });
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.title}>Ask the Circle</Text>
            <Text style={styles.subtitle}>Post a task for the family circle to see and claim.</Text>

            <Text style={styles.label}>What do you need?</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Pick up groceries" placeholderTextColor={theme.muted} />

            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, category === c.id && { backgroundColor: theme.primary }]}
                  onPress={() => setCategory(c.id)}
                >
                  <Text style={[styles.chipText, category === c.id && { color: "#fff" }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>About how long?</Text>
            <TextInput style={styles.input} value={durationLabel} onChangeText={setDurationLabel} placeholder="~30 min" placeholderTextColor={theme.muted} />

            <Text style={styles.label}>When (optional — adds it to the Calendar too)</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="Start, e.g. 4:00 PM" placeholderTextColor={theme.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="End, e.g. 5:00 PM" placeholderTextColor={theme.muted} />
              </View>
            </View>

            <View style={styles.urgentRow}>
              <Text style={styles.label}>Mark as urgent</Text>
              <Switch value={urgent} onValueChange={setUrgent} trackColor={{ true: theme.primary }} />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={submit}>
                <Text style={styles.submitText}>Post to circle</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
    sheet: { backgroundColor: theme.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "88%" },
    title: { fontSize: 17, fontWeight: "700", color: theme.text },
    subtitle: { fontSize: 12, color: theme.muted, marginTop: 2, marginBottom: 6 },
    label: { fontSize: 12, fontWeight: "600", color: theme.muted, marginBottom: 6, marginTop: 14 },
    input: { backgroundColor: theme.canvas, borderRadius: 10, padding: 10, color: theme.text, borderWidth: 1, borderColor: theme.border, fontSize: 16 },
    chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: theme.primarySoft },
    chipText: { fontSize: 13, fontWeight: "600", color: theme.text },
    row: { flexDirection: "row", gap: 10 },
    urgentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
    actions: { flexDirection: "row", gap: 10, marginTop: 20 },
    cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: theme.canvas },
    cancelText: { color: theme.text, fontWeight: "700" },
    submitButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: theme.primary },
    submitText: { color: "#fff", fontWeight: "700" },
  });
