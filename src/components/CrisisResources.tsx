import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { dial } from "../dial";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { CRISIS_RESOURCES } from "../momentScripts";

interface Props {
  emergencyContactPhone?: string;
  emergencyContactName?: string;
}


// Shared help block: used in Settings → Help & Resources and behind
// "This feels bigger than I can handle" in In This Moment.
export default function CrisisResources({ emergencyContactPhone, emergencyContactName }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={{ gap: 10 }}>
      <TouchableOpacity style={styles.emergency} onPress={() => dial("911")}>
        <Text style={styles.emergencyText}>Call 911</Text>
      </TouchableOpacity>
      <Text style={styles.disclaimer}>{CRISIS_RESOURCES.disclaimer}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Alzheimer's Association 24/7 Helpline</Text>
        <TouchableOpacity onPress={() => dial("+18002723900")}>
          <Text style={styles.number}>{CRISIS_RESOURCES.alzheimersHelpline}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>For your own crisis: 988 Suicide & Crisis Lifeline (call or text)</Text>
        <TouchableOpacity onPress={() => dial("988")}>
          <Text style={styles.number}>{CRISIS_RESOURCES.suicideLifeline}</Text>
        </TouchableOpacity>
      </View>

      {emergencyContactPhone ? (
        <View style={styles.card}>
          <Text style={styles.label}>Your saved emergency contact{emergencyContactName ? `: ${emergencyContactName}` : ""}</Text>
          <TouchableOpacity onPress={() => dial(emergencyContactPhone)}>
            <Text style={styles.number}>{emergencyContactPhone}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    disclaimer: { fontSize: 13, color: theme.text, lineHeight: 19 },
    card: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 14, gap: 4 },
    label: { fontSize: 13, color: theme.muted, fontWeight: "600" },
    number: { fontSize: 20, fontWeight: "800", color: theme.primary },
    emergency: { backgroundColor: theme.danger, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    emergencyText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  });
