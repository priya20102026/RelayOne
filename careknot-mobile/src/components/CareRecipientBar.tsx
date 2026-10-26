import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { CareRecipient, MemberId } from "../types";

interface Props {
  recipient: CareRecipient;
  currentMemberId: MemberId;
  /** Only the primary caregiver gets Check-In Today / I Need Help — everyone
   * else just sees who they're caring for. */
  isPrimaryCaregiver: boolean;
  onCheckIn: () => void;
  onNeedHelp: () => void;
}

export default function CareRecipientBar({ recipient, isPrimaryCaregiver, onCheckIn, onNeedHelp }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.wrap}>
      {/* Just the person's name — no diagnosis up top, so the app reads as
          support for any family sharing daily care, not one condition. */}
      <View style={styles.info}>
        <Text style={styles.name}>Caring for {recipient.name}</Text>
      </View>
      {isPrimaryCaregiver && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onCheckIn}>
            <Text style={styles.secondaryButtonText}>Check-In Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onNeedHelp}>
            <Text style={styles.primaryButtonText}>Ask the Circle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    // Solid background + stacking order so scrolling content never shows through.
    wrap: { backgroundColor: theme.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12, position: "relative", zIndex: 1 },
    info: { gap: 2 },
    name: { fontSize: 16, fontWeight: "700", color: theme.text },
    note: { fontSize: 13, color: theme.muted },
    actions: { flexDirection: "row", gap: 10 },
    button: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
    primaryButton: { backgroundColor: theme.danger },
    primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    secondaryButton: { backgroundColor: theme.primarySoft },
    secondaryButtonText: { color: theme.primary, fontWeight: "700", fontSize: 13 },
  });
