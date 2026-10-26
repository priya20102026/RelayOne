import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";

interface Props {
  onGetStarted: () => void;
}

const FEATURES: { icon: string; label: string }[] = [
  { icon: "✅", label: "Shared Task Board: claim tasks and rebalance caregiving duties across the family" },
  { icon: "📅", label: "Calendar Sync: claim a task to automatically sync it with your phone's calendar" },
  { icon: "📇", label: "Care Hub: caregiver contacts and care details, ready in one tap" },
  { icon: "📊", label: "Track caregiver fatigue on a 0–100 scale to know exactly when to pass the baton" },
  { icon: "💬", label: "\"In This Moment\" scripts for hard caregiving moments" },
  { icon: "🧭", label: "A ready-to-send Wandering Safety alert" },
  { icon: "🫁", label: "Box Breathing: a guided 3-minute calm-down for the caregiver" },
];

// The front page shown once at launch — a quick pitch for demos (judges,
// family members seeing it for the first time) before entering the app.
export default function WelcomeScreen({ onGetStarted }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [showSignInNote, setShowSignInNote] = useState(false);

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoKnot} />
        <Text style={styles.title}>Relay<Text style={{ color: theme.primary }}>One</Text></Text>
        <Text style={styles.tagline}>Share the care. Prevent burnout.</Text>

        <Text style={styles.pitch}>
          Caregiving is a marathon no one should run alone. RelayOne brings the whole
          family into one circle — passing the baton on tasks, appointments, and care
          details so no single person carries the burden. Built especially for families
          supporting a loved one who needs daily help — including Alzheimer's and
          dementia — organized and effortless. Powered by a simple, transparent fatigue-tracking
          algorithm — clear numbers your family can trust.
        </Text>

        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted}>
          <Text style={styles.getStartedText}>Continue as Guest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signInButton} onPress={() => setShowSignInNote(true)}>
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>
        {showSignInNote && (
          <Text style={styles.signInNote}>
            Accounts are coming soon. For now, continue as a guest to explore the full demo.
          </Text>
        )}
        <Text style={styles.demoNote}>Final draft v5c (Apple Health import) — all data shown is sample data.</Text>
      </View>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: theme.canvas },
    content: { flexGrow: 1, padding: 28, paddingTop: 64, alignItems: "center" },
    logoKnot: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 6,
      borderColor: theme.primary,
      marginBottom: 18,
    },
    title: { fontSize: 32, fontWeight: "800", color: theme.text, marginBottom: 6 },
    tagline: { fontSize: 14, color: theme.muted, marginBottom: 24, textAlign: "center" },
    pitch: { fontSize: 14, color: theme.text, lineHeight: 21, textAlign: "center", marginBottom: 28 },
    featureList: { width: "100%", gap: 14 },
    featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    featureIcon: { fontSize: 20 },
    featureLabel: { flex: 1, fontSize: 13, color: theme.text, lineHeight: 18 },
    footer: { padding: 24, gap: 10 },
    getStartedButton: { backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
    getStartedText: { color: "#fff", fontWeight: "800", fontSize: 16 },
    signInButton: { borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
    signInText: { color: theme.text, fontWeight: "700", fontSize: 15 },
    signInNote: { fontSize: 12, color: theme.muted, textAlign: "center" },
    demoNote: { fontSize: 11, color: theme.muted, textAlign: "center" },
  });
