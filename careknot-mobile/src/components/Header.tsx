import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { FamilyMember, MemberId } from "../types";

interface Props {
  members: FamilyMember[];
  currentMemberId: MemberId;
  onSwitchMember: (id: MemberId) => void;
}

export default function Header({ members, currentMemberId, onSwitchMember }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [pickerOpen, setPickerOpen] = useState(false);
  const current = members.find((m) => m.id === currentMemberId)!;

  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        <View style={[styles.logoKnot, { borderColor: theme.primary }]} />
        <Text style={styles.title}>RelayOne</Text>
      </View>

      <TouchableOpacity style={styles.memberButton} onPress={() => setPickerOpen(true)}>
        <View style={[styles.avatar, { backgroundColor: current.color }]}>
          <Text style={styles.avatarText}>{current.avatarInitial}</Text>
        </View>
        <View>
          <Text style={styles.memberName}>{current.name}</Text>
          <Text style={styles.memberRole}>{current.role}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Viewing as</Text>
            {members.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.memberRow, m.id === currentMemberId && { backgroundColor: theme.primarySoft }]}
                onPress={() => {
                  onSwitchMember(m.id);
                  setPickerOpen(false);
                }}
              >
                <View style={[styles.avatar, { backgroundColor: m.color }]}>
                  <Text style={styles.avatarText}>{m.avatarInitial}</Text>
                </View>
                <View>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberRole}>{m.role}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      // Solid background + stacking order so scrolling content never shows through.
      position: "relative",
      zIndex: 2,
    },
    brand: { flexDirection: "row", alignItems: "center", gap: 8 },
    logoKnot: { width: 18, height: 18, borderRadius: 9, borderWidth: 3 },
    title: { fontSize: 18, fontWeight: "700", color: theme.text },
    memberButton: { flexDirection: "row", alignItems: "center", gap: 8 },
    avatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "700" },
    memberName: { fontSize: 13, fontWeight: "600", color: theme.text, textAlign: "right" },
    memberRole: { fontSize: 11, color: theme.muted, textAlign: "right" },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" },
    sheet: { backgroundColor: theme.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, gap: 4 },
    sheetTitle: { fontSize: 13, color: theme.muted, marginBottom: 6, fontWeight: "600" },
    memberRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 12 },
  });
