import React, { useEffect, useRef, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Box breathing: breathe in 4s, hold 4s, breathe out 4s, hold 4s — repeated for
// 3 minutes. Pure local timer + animation; nothing is stored or sent anywhere.
const TOTAL_SECONDS = 180;
const PHASE_SECONDS = 4;
const CYCLE_SECONDS = PHASE_SECONDS * 4;

const PHASES = [
  { label: "Breathe in", chip: "In" },
  { label: "Hold", chip: "Hold" },
  { label: "Breathe out", chip: "Out" },
  { label: "Hold", chip: "Hold" },
];

// The square grows while breathing in, stays big on the hold, shrinks while
// breathing out, and stays small on the hold.
const SCALE_SMALL = 0.62;
const SCALE_BIG = 1;
const PHASE_TARGET_SCALE = [SCALE_BIG, SCALE_BIG, SCALE_SMALL, SCALE_SMALL];

const BOX_SIZE = 200;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BoxBreathingModal({ visible, onClose }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const scale = useRef(new Animated.Value(SCALE_SMALL)).current;
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;

  const done = elapsed >= TOTAL_SECONDS;
  const phaseIndex = Math.floor((elapsed % CYCLE_SECONDS) / PHASE_SECONDS);
  const secondsLeftInPhase = PHASE_SECONDS - (elapsed % PHASE_SECONDS);

  // Fresh session every time the sheet opens.
  useEffect(() => {
    if (visible) {
      setElapsed(0);
      setRunning(false);
      scale.setValue(SCALE_SMALL);
    } else {
      setRunning(false);
    }
  }, [visible, scale]);

  // One tick per second while running.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed((e) => Math.min(e + 1, TOTAL_SECONDS));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Stop automatically at 3:00.
  useEffect(() => {
    if (running && elapsed >= TOTAL_SECONDS) setRunning(false);
  }, [elapsed, running]);

  // Animate the square toward this phase's target for however long is left in the phase.
  useEffect(() => {
    if (!running) {
      scale.stopAnimation();
      return;
    }
    const remainingInPhase = PHASE_SECONDS - (elapsedRef.current % PHASE_SECONDS);
    Animated.timing(scale, {
      toValue: PHASE_TARGET_SCALE[phaseIndex],
      duration: remainingInPhase * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [running, phaseIndex, scale]);

  const handleStartPause = () => {
    if (done) return;
    setRunning((r) => !r);
  };

  const handleRestart = () => {
    setRunning(false);
    setElapsed(0);
    scale.setValue(SCALE_SMALL);
  };

  const started = elapsed > 0;
  const mainLabel = done ? "Well done" : !started && !running ? "Ready?" : PHASES[phaseIndex].label;
  const subLabel = done
    ? "3 minutes complete"
    : !started && !running
    ? "Press Start"
    : running
    ? `${secondsLeftInPhase}`
    : "Paused";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Box Breathing</Text>
          <Text style={styles.subtitle}>
            In 4 · hold 4 · out 4 · hold 4 — a calm 3-minute reset for the caregiver.
          </Text>

          <View style={styles.stage}>
            <Animated.View style={[styles.box, { transform: [{ scale }] }]} />
            <View style={styles.stageText} pointerEvents="none">
              <Text style={styles.mainLabel}>{mainLabel}</Text>
              <Text style={styles.subLabel}>{subLabel}</Text>
            </View>
          </View>

          <View style={styles.chipRow}>
            {PHASES.map((p, i) => {
              const active = running && !done && i === phaseIndex;
              return (
                <View key={i} style={[styles.chip, active && { backgroundColor: theme.primary }]}>
                  <Text style={[styles.chipText, active && { color: "#fff" }]}>{p.chip}</Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.timer}>
            {done ? "0:00" : formatTime(TOTAL_SECONDS - elapsed)} remaining
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRestart}>
              <Text style={styles.secondaryText}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, done && { opacity: 0.4 }]}
              onPress={handleStartPause}
              disabled={done}
            >
              <Text style={styles.primaryText}>{running ? "Pause" : started && !done ? "Resume" : "Start"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>{done ? "Done" : "Close"}</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Breathe gently. If you feel dizzy or uncomfortable, stop and breathe normally. This is a
            relaxation aid, not medical advice.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 32,
      alignItems: "center",
    },
    title: { fontSize: 17, fontWeight: "700", color: theme.text },
    subtitle: { fontSize: 12, color: theme.muted, marginTop: 2, textAlign: "center" },
    stage: { width: BOX_SIZE + 20, height: BOX_SIZE + 20, alignItems: "center", justifyContent: "center", marginVertical: 14 },
    box: {
      position: "absolute",
      width: BOX_SIZE,
      height: BOX_SIZE,
      borderRadius: 28,
      backgroundColor: theme.primarySoft,
      borderWidth: 3,
      borderColor: theme.primary,
    },
    stageText: { alignItems: "center", gap: 4 },
    mainLabel: { fontSize: 20, fontWeight: "800", color: theme.text },
    subLabel: { fontSize: 16, color: theme.muted, fontWeight: "600" },
    chipRow: { flexDirection: "row", gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.primarySoft },
    chipText: { fontSize: 12, fontWeight: "700", color: theme.text },
    timer: { fontSize: 13, color: theme.muted, marginTop: 12, fontWeight: "600" },
    actions: { flexDirection: "row", gap: 10, marginTop: 16, width: "100%" },
    secondaryButton: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: "center", backgroundColor: theme.canvas },
    secondaryText: { color: theme.text, fontWeight: "700" },
    primaryButton: { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: "center", backgroundColor: theme.primary },
    primaryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    closeButton: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 20 },
    closeText: { color: theme.muted, fontWeight: "700" },
    note: { fontSize: 11, color: theme.muted, textAlign: "center", marginTop: 6, fontStyle: "italic" },
  });
