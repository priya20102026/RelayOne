import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { FamilyMember, MemberId } from "../types";

interface Props {
  visible: boolean;
  members: FamilyMember[];
  onClose: () => void;
  onSubmit: (payload: { title: string; dateLabel: string; startTime?: string; endTime?: string; memberId: MemberId | null }) => void;
}

export default function AddEventModal({ visible, members, onClose, onSubmit }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [title, setTitle] = useState("");
  const [dateLabel, setDateLabel] = useState("Today");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [memberId, setMemberId] = useState<MemberId | null>(null);

  const reset = () => {
    setTitle("");
    setDateLabel("Today");
    setStartTime("");
    setEndTime("");
    setMemberId(null);
  };

  const submit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), dateLabel, startTime: startTime || undefined, endTime: endTime || undefined, memberId });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.title}>Add calendar event</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Dentist appointment" placeholderTextColor={theme.muted} />

            <Text style={styles.label}>Day</Text>
            <TextInput style={styles.input} value={dateLabel} onChangeText={setDateLabel} placeholder="Today / Tomorrow / Oct 10" placeholderTextColor={theme.muted} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Start</Text>
                <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="4:00 PM" placeholderTextColor={theme.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>End</Text>
                <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="5:00 PM" placeholderTextColor={theme.muted} />
              </View>
            </View>

            <Text style={styles.label}>Assign to</Text>
            <View style={styles.memberRow}>
              {members.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.memberChip, memberId === m.id && { backgroundColor: m.color }]}
                  onPress={() => setMemberId(memberId === m.id ? null : m.id)}
                >
                  <Text style={[styles.memberChipText, memberId === m.id && { color: "#fff" }]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={submit}>
                <Text style={styles.submitText}>Add event</Text>
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
    sheet: { backgroundColor: theme.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%" },
    title: { fontSize: 17, fontWeight: "700", color: theme.text, marginBottom: 12 },
    label: { fontSize: 12, fontWeight: "600", color: theme.muted, marginBottom: 4, marginTop: 10 },
    input: { backgroundColor: theme.canvas, borderRadius: 10, padding: 10, color: theme.text, borderWidth: 1, borderColor: theme.border },
    row: { flexDirection: "row", gap: 10 },
    memberRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    memberChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: theme.primarySoft },
    memberChipText: { fontSize: 13, fontWeight: "600", color: theme.text },
    actions: { flexDirection: "row", gap: 10, marginTop: 20 },
    cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: theme.canvas },
    cancelText: { color: theme.text, fontWeight: "700" },
    submitButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: theme.primary },
    submitText: { color: "#fff", fontWeight: "700" },
  });
