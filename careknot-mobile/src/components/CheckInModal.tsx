import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { CheckIn } from "../loadEngine";
import { HEALTH_IMPORT_AVAILABLE, readLastNightSleep } from "../healthSync";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (checkIn: CheckIn) => void;
}

function Scale({ value, onChange, theme }: { value: number; onChange: (n: number) => void; theme: ThemeColors }) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange(n)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: n === value ? theme.primary : theme.canvas,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ color: n === value ? "#fff" : theme.text, fontWeight: "700" }}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function CheckInModal({ visible, onClose, onSubmit }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [sleepHours, setSleepHours] = useState("7");
  const [nightAwakenings, setNightAwakenings] = useState("0");
  const [stress, setStress] = useState(2);
  const [energy, setEnergy] = useState(4);
  const [careHoursToday, setCareHoursToday] = useState("3");

  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  const importFromHealth = async () => {
    setImporting(true);
    setImportMessage("");
    const result = await readLastNightSleep();
    setImporting(false);
    if (result.status === "ok") {
      setSleepHours(String(result.sleepHours));
      setNightAwakenings(String(result.awakenings));
      setImportMessage("Filled in from Apple Health. You can still edit these.");
    } else if (result.status === "nodata") {
      setImportMessage("No sleep found for last night (or access wasn't allowed). Type it in below.");
    } else if (result.status === "unsupported") {
      setImportMessage("Apple Health isn't available in this version of the app. Type it in below.");
    } else {
      setImportMessage("Couldn't read Apple Health. Type it in below.");
    }
  };

  const submit = () => {
    // Keep entries realistic so a typo (e.g. 70 hours of sleep) can't skew the score.
    const bound = (n: number, max: number) => Math.min(max, Math.max(0, n));
    onSubmit({
      sleepHours: bound(parseFloat(sleepHours) || 0, 24),
      nightAwakenings: bound(parseInt(nightAwakenings, 10) || 0, 10),
      stress,
      energy,
      careHoursToday: bound(parseFloat(careHoursToday) || 0, 24),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.title}>Check-In Today</Text>
            <Text style={styles.subtitle}>A couple of quick questions — this updates your Caregiver Load score.</Text>

            {HEALTH_IMPORT_AVAILABLE ? (
              <>
                <TouchableOpacity style={styles.importButton} onPress={importFromHealth} disabled={importing}>
                  <Text style={styles.importText}>{importing ? "Reading Apple Health…" : "Import last night from Apple Health"}</Text>
                </TouchableOpacity>
                {importMessage ? <Text style={styles.hint}>{importMessage}</Text> : null}
              </>
            ) : (
              <Text style={styles.hint}>
                Tip: your Health app or watch shows last night's sleep — type those numbers here.
              </Text>
            )}

            <Text style={styles.label}>Hours of sleep last night</Text>
            <TextInput style={styles.input} value={sleepHours} onChangeText={setSleepHours} keyboardType="numeric" />

            <Text style={styles.label}>Times woken up overnight</Text>
            <TextInput style={styles.input} value={nightAwakenings} onChangeText={setNightAwakenings} keyboardType="numeric" />

            <Text style={styles.label}>Stress level today (1 = calm, 5 = overwhelmed)</Text>
            <Scale value={stress} onChange={setStress} theme={theme} />

            <Text style={styles.label}>Energy level today (1 = exhausted, 5 = great)</Text>
            <Scale value={energy} onChange={setEnergy} theme={theme} />

            <Text style={styles.label}>Hours of direct care today</Text>
            <TextInput style={styles.input} value={careHoursToday} onChangeText={setCareHoursToday} keyboardType="numeric" />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={submit}>
                <Text style={styles.submitText}>Submit check-in</Text>
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
    importButton: { marginTop: 10, paddingVertical: 11, borderRadius: 10, alignItems: "center", backgroundColor: theme.primarySoft },
    importText: { color: theme.primary, fontWeight: "700", fontSize: 13 },
    hint: { fontSize: 11, color: theme.muted, fontStyle: "italic", marginTop: 6 },
    label: { fontSize: 12, fontWeight: "600", color: theme.muted, marginBottom: 6, marginTop: 14 },
    input: { backgroundColor: theme.canvas, borderRadius: 10, padding: 10, color: theme.text, borderWidth: 1, borderColor: theme.border },
    actions: { flexDirection: "row", gap: 10, marginTop: 22 },
    cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: theme.canvas },
    cancelText: { color: theme.text, fontWeight: "700" },
    submitButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: theme.primary },
    submitText: { color: "#fff", fontWeight: "700" },
  });
