import React, { useEffect, useRef, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { MOMENT_SITUATIONS } from "../momentScripts";
import { Situation } from "../types";
import CrisisResources from "./CrisisResources";

type Step = "picker" | "response" | "breathe" | "crisis";

interface Props {
  visible: boolean;
  /** Phone number for the crisis screen's one-tap emergency call. */
  emergencyContactPhone?: string;
  emergencyContactName?: string;
  onClose: () => void;
}

export default function InThisMomentModal({ visible, emergencyContactPhone, emergencyContactName, onClose }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [step, setStep] = useState<Step>("picker");
  const [situationId, setSituationId] = useState<Situation | null>(null);
  const [useAlt, setUseAlt] = useState(false);

  const situation = MOMENT_SITUATIONS.find((s) => s.id === situationId);

  const reset = () => {
    setStep("picker");
    setSituationId(null);
    setUseAlt(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pick = (id: Situation) => {
    setSituationId(id);
    setUseAlt(false);
    setStep("response");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {step === "picker" && (
            <PickerScreen theme={theme} styles={styles} onPick={pick} onClose={handleClose} />
          )}

          {step === "response" && situation && (
            <ResponseScreen
              theme={theme}
              styles={styles}
              situation={situation}
              useAlt={useAlt}
              onTryAnother={() => setUseAlt((v) => !v)}
              onBreathe={() => setStep("breathe")}
              onBack={() => setStep("picker")}
              onEscalate={() => setStep("crisis")}
              onClose={handleClose}
            />
          )}

          {step === "breathe" && (
            <BreatheScreen theme={theme} styles={styles} onDone={() => setStep("response")} />
          )}

          {step === "crisis" && (
            <CrisisScreen
              theme={theme}
              styles={styles}
              emergencyContactPhone={emergencyContactPhone}
              emergencyContactName={emergencyContactName}
              onBack={() => setStep(situationId ? "response" : "picker")}
              onClose={handleClose}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function PickerScreen({
  theme,
  styles,
  onPick,
  onClose,
}: {
  theme: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
  onPick: (id: Situation) => void;
  onClose: () => void;
}) {
  return (
    <View>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>In This Moment</Text>
          <Text style={styles.subtitle}>What's happening right now?</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeLink}>Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardGrid}>
        {MOMENT_SITUATIONS.map((s) => (
          <TouchableOpacity key={s.id} style={styles.situationCard} onPress={() => onPick(s.id)}>
            <Text style={styles.situationIcon}>{s.icon}</Text>
            <Text style={styles.situationLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ResponseScreen({
  theme,
  styles,
  situation,
  useAlt,
  onTryAnother,
  onBreathe,
  onBack,
  onEscalate,
  onClose,
}: {
  theme: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
  situation: (typeof MOMENT_SITUATIONS)[number];
  useAlt: boolean;
  onTryAnother: () => void;
  onBreathe: () => void;
  onBack: () => void;
  onEscalate: () => void;
  onClose: () => void;
}) {
  return (
    <View>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.closeLink}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeLink}>Close</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.situationLabelSmall}>{situation.icon} {situation.label}</Text>

      <View style={styles.scriptCard}>
        <Text style={styles.scriptText}>{useAlt ? situation.altScript : situation.script}</Text>
      </View>

      {situation.showBreathe && (
        <TouchableOpacity style={styles.breatheButton} onPress={onBreathe}>
          <Text style={styles.breatheButtonText}>🫁 Breathe with me</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.altLink} onPress={onTryAnother}>
        <Text style={styles.altLinkText}>{useAlt ? "Back to first approach" : "Try another approach"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.escalateButton} onPress={onEscalate}>
        <Text style={styles.escalateButtonText}>This feels bigger than I can handle</Text>
      </TouchableOpacity>
    </View>
  );
}

function BreatheScreen({
  theme,
  styles,
  onDone,
}: {
  theme: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
  onDone: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [cycle, setCycle] = useState(1);
  const TOTAL_CYCLES = 3;

  useEffect(() => {
    let cancelled = false;

    const runCycle = (n: number) => {
      if (cancelled) return;
      setCycle(n);
      setPhase("in");
      Animated.timing(scale, { toValue: 1.4, duration: 4000, useNativeDriver: true }).start(() => {
        if (cancelled) return;
        setPhase("out");
        Animated.timing(scale, { toValue: 1, duration: 4000, useNativeDriver: true }).start(() => {
          if (cancelled) return;
          if (n < TOTAL_CYCLES) runCycle(n + 1);
          else onDone();
        });
      });
    };

    runCycle(1);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.breatheWrap}>
      <Animated.View style={[styles.breatheCircle, { transform: [{ scale }] }]} />
      <Text style={styles.breatheInstruction}>{phase === "in" ? "Breathe in…" : "Breathe out…"}</Text>
      <Text style={styles.breatheCycle}>Breath {cycle} of {TOTAL_CYCLES}</Text>
      <TouchableOpacity onPress={onDone}>
        <Text style={styles.closeLink}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

function CrisisScreen({
  theme,
  styles,
  emergencyContactPhone,
  emergencyContactName,
  onBack,
  onClose,
}: {
  theme: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
  emergencyContactPhone?: string;
  emergencyContactName?: string;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <View>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.closeLink}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeLink}>Close</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Crisis Resources</Text>

      <CrisisResources emergencyContactPhone={emergencyContactPhone} emergencyContactName={emergencyContactName} />
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
    sheet: { backgroundColor: theme.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "90%" },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
    title: { fontSize: 19, fontWeight: "800", color: theme.text },
    subtitle: { fontSize: 13, color: theme.muted, marginTop: 2 },
    closeLink: { fontSize: 13, fontWeight: "700", color: theme.primary },
    cardGrid: { gap: 10 },
    situationCard: {
      minHeight: 64,
      backgroundColor: theme.primarySoft,
      borderRadius: 14,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    situationIcon: { fontSize: 26 },
    situationLabel: { fontSize: 15, fontWeight: "700", color: theme.text, flex: 1 },
    situationLabelSmall: { fontSize: 14, fontWeight: "700", color: theme.muted, marginBottom: 10 },
    scriptCard: { backgroundColor: theme.primarySoft, borderRadius: 16, padding: 18, marginBottom: 16 },
    scriptText: { fontSize: 19, lineHeight: 26, color: theme.text, fontWeight: "600" },
    breatheButton: { backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
    breatheButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    altLink: { alignItems: "center", paddingVertical: 10 },
    altLinkText: { color: theme.primary, fontWeight: "700", fontSize: 13 },
    escalateButton: {
      backgroundColor: theme.danger,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 16,
    },
    escalateButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    breatheWrap: { alignItems: "center", paddingVertical: 30, gap: 14 },
    breatheCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.primarySoft, borderWidth: 2, borderColor: theme.primary },
    breatheInstruction: { fontSize: 18, fontWeight: "700", color: theme.text, marginTop: 10 },
    breatheCycle: { fontSize: 13, color: theme.muted },
  });
