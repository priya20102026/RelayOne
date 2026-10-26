import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { useTheme, useThemeSetting } from "../ThemeContext";
import { ThemeColors } from "../theme";
import CrisisResources from "./CrisisResources";
import { CircleInvite, FamilyMember, MemberId } from "../types";

interface Props {
  invite: CircleInvite;
  members: FamilyMember[];
  currentMemberId: MemberId;
  primaryCaregiverId: MemberId;
  onGenerateNewCode: () => void;
  onJoinWithCode: (code: string) => void;
  onUpdateRole: (memberId: MemberId, role: string) => void;
  onAddMember: (payload: { name: string; role: string }) => void;
  onRemoveMember: (memberId: MemberId) => void;
}

export default function SettingsScreen({
  invite,
  members,
  currentMemberId,
  primaryCaregiverId,
  onGenerateNewCode,
  onJoinWithCode,
  onUpdateRole,
  onAddMember,
  onRemoveMember,
}: Props) {
  const theme = useTheme();
  const { themeName, setThemeName } = useThemeSetting();
  const styles = makeStyles(theme);
  const [joinCode, setJoinCode] = useState("");
  const [roleDraft, setRoleDraft] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");

  const currentMember = members.find((m) => m.id === currentMemberId)!;

  const startEditingRole = () => setRoleDraft(currentMember.role);
  const saveRole = () => {
    if (roleDraft && roleDraft.trim()) {
      onUpdateRole(currentMemberId, roleDraft.trim());
    }
    setRoleDraft(null);
  };

  const submitNewMember = () => {
    if (!newName.trim()) return;
    onAddMember({ name: newName.trim(), role: newRole.trim() || "Circle member" });
    setNewName("");
    setNewRole("");
    setAddingMember(false);
  };

  const confirmRemove = (member: FamilyMember) => {
    Alert.alert("Remove from circle?", `${member.name} will lose access to this circle. Their past tasks and messages stay, but any open tasks become unassigned.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onRemoveMember(member.id) },
    ]);
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    onJoinWithCode(joinCode.trim());
    Alert.alert("Request sent", `Looking for a circle matching code "${joinCode.trim()}".`);
    setJoinCode("");
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Theme</Text>
        <View style={styles.themeRow}>
          <TouchableOpacity
            style={[styles.themeOption, themeName === "classic" && { borderColor: theme.primary, borderWidth: 2 }]}
            onPress={() => setThemeName("classic")}
          >
            <View style={styles.swatchRow}>
              <View style={[styles.swatch, { backgroundColor: "#0E9F8E" }]} />
              <View style={[styles.swatch, { backgroundColor: "#F7F8FA" }]} />
            </View>
            <Text style={styles.themeLabel}>Default</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeOption, themeName === "neutral" && { borderColor: theme.primary, borderWidth: 2 }]}
            onPress={() => setThemeName("neutral")}
          >
            <View style={styles.swatchRow}>
              <View style={[styles.swatch, { backgroundColor: "#3F3F46" }]} />
              <View style={[styles.swatch, { backgroundColor: "#F4F4F5" }]} />
            </View>
            <Text style={styles.themeLabel}>Black &amp; White</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>People in this circle</Text>
      <View style={styles.card}>
        {members.map((m) => {
          const isMe = m.id === currentMemberId;
          const isPrimary = m.id === primaryCaregiverId;
          const isEditing = isMe && roleDraft !== null;
          // Guardrails: never remove yourself, never remove the primary
          // caregiver, and never leave the circle with only one person.
          const canRemove = !isMe && !isPrimary && members.length > 1;
          return (
            <View key={m.id} style={styles.memberRow}>
              <View style={[styles.avatar, { backgroundColor: m.color }]}>
                <Text style={styles.avatarText}>{m.avatarInitial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>
                  {m.name}
                  {isMe ? " (you)" : ""}
                </Text>
                {isEditing ? (
                  <View style={styles.roleEditRow}>
                    <TextInput
                      style={styles.roleInput}
                      value={roleDraft ?? ""}
                      onChangeText={setRoleDraft}
                      placeholder="e.g. Primary caregiver"
                      placeholderTextColor={theme.muted}
                      autoFocus
                    />
                    <TouchableOpacity onPress={saveRole}>
                      <Text style={styles.roleSaveLink}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.memberRole}>{m.role}</Text>
                )}
              </View>
              {isMe && !isEditing && (
                <TouchableOpacity onPress={startEditingRole}>
                  <Text style={styles.roleEditLink}>Edit role</Text>
                </TouchableOpacity>
              )}
              {canRemove && (
                <TouchableOpacity onPress={() => confirmRemove(m)}>
                  <Text style={styles.removeMemberLink}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {addingMember ? (
          <View style={styles.addMemberForm}>
            <TextInput
              style={styles.roleInputFull}
              value={newName}
              onChangeText={setNewName}
              placeholder="Name"
              placeholderTextColor={theme.muted}
              autoFocus
            />
            <TextInput
              style={[styles.roleInputFull, { marginTop: 8 }]}
              value={newRole}
              onChangeText={setNewRole}
              placeholder="Role (e.g. Grandson, Neighbor helper)"
              placeholderTextColor={theme.muted}
            />
            <View style={[styles.inviteActions, { marginTop: 10 }]}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setAddingMember(false);
                  setNewName("");
                  setNewRole("");
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addMemberButton} onPress={submitNewMember}>
                <Text style={styles.addMemberButtonText}>Add to circle</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addMemberLink} onPress={() => setAddingMember(true)}>
            <Text style={styles.addMemberLinkText}>+ Add a person to this circle</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Circle</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>{invite.circleName}</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{invite.code}</Text>
        </View>
        <View style={styles.inviteActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Alert.alert("Invite code copied", `${invite.code} copied to clipboard (demo).`)}
          >
            <Text style={styles.secondaryButtonText}>Share code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onGenerateNewCode}>
            <Text style={styles.secondaryButtonText}>Generate new code</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.cardLabel, { marginTop: 18 }]}>Join another circle</Text>
        <View style={styles.joinRow}>
          <TextInput
            style={styles.joinInput}
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="Enter invite code"
            placeholderTextColor={theme.muted}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Help & Resources</Text>
      <View style={styles.card}>
        <CrisisResources />
      </View>
    </ScrollView>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: theme.canvas },
    content: { padding: 16, paddingBottom: 48, gap: 10 },
    sectionTitle: { fontSize: 13, fontWeight: "700", color: theme.muted, textTransform: "uppercase", marginTop: 10 },
    card: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, gap: 10 },
    cardLabel: { fontSize: 13, fontWeight: "700", color: theme.text },
    themeRow: { flexDirection: "row", gap: 12 },
    themeOption: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 12, alignItems: "center", gap: 8 },
    swatchRow: { flexDirection: "row", gap: 4 },
    swatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: theme.border },
    themeLabel: { fontSize: 12, fontWeight: "600", color: theme.text },
    memberRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
    avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "700" },
    memberName: { fontSize: 14, fontWeight: "700", color: theme.text },
    memberRole: { fontSize: 12, color: theme.muted },
    roleEditLink: { fontSize: 12, fontWeight: "700", color: theme.primary },
    roleEditRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
    roleInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingVertical: 2,
    },
    roleSaveLink: { fontSize: 12, fontWeight: "700", color: theme.primary },
    removeMemberLink: { fontSize: 12, fontWeight: "700", color: theme.danger, marginLeft: 10 },
    addMemberLink: { paddingVertical: 10, alignItems: "center", marginTop: 4 },
    addMemberLinkText: { fontSize: 13, fontWeight: "700", color: theme.primary },
    addMemberForm: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border },
    roleInputFull: { backgroundColor: theme.canvas, borderRadius: 10, padding: 10, color: theme.text, borderWidth: 1, borderColor: theme.border, fontSize: 16 },
    addMemberButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.primary, alignItems: "center" },
    addMemberButtonText: { fontSize: 12, fontWeight: "700", color: "#fff" },
    codeBox: { backgroundColor: theme.primarySoft, borderRadius: 10, padding: 14, alignItems: "center" },
    codeText: { fontSize: 20, fontWeight: "800", letterSpacing: 2, color: theme.primary },
    inviteActions: { flexDirection: "row", gap: 10 },
    secondaryButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.canvas, alignItems: "center" },
    secondaryButtonText: { fontSize: 12, fontWeight: "700", color: theme.text },
    joinRow: { flexDirection: "row", gap: 8 },
    joinInput: { flex: 1, backgroundColor: theme.canvas, borderRadius: 10, padding: 10, color: theme.text, borderWidth: 1, borderColor: theme.border, fontSize: 16 },
    joinButton: { backgroundColor: theme.primary, paddingHorizontal: 16, borderRadius: 10, justifyContent: "center" },
    joinButtonText: { color: "#fff", fontWeight: "700" },
  });
