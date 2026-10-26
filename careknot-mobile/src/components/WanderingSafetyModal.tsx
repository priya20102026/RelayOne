import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Share, Linking, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { CareRecipient, FamilyMember } from "../types";

type Step = "card" | "edit" | "alert";

interface Props {
  visible: boolean;
  recipient: CareRecipient;
  members: FamilyMember[];
  onClose: () => void;
  onSave: (updates: Partial<CareRecipient>) => void;
}

function buildAlertText(recipient: CareRecipient, members: FamilyMember[]) {
  const places = recipient.wanderToPlaces.length > 0 ? recipient.wanderToPlaces.join(", ") : "nearby familiar places";
  const contacts = members
    .map((m) => `${m.name} (${m.phone})`)
    .concat(recipient.extraContactName && recipient.extraContactPhone ? [`${recipient.extraContactName} (${recipient.extraContactPhone})`] : [])
    .join(" or ");

  return `${recipient.name}, ${recipient.age}, has ${recipient.conditionNote.split("—")[0].trim()} and has wandered from home. ${
    recipient.physicalDescription
  } She may be headed toward: ${places}. Please call ${contacts} if seen.`;
}

export default function WanderingSafetyModal({ visible, recipient, members, onClose, onSave }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [step, setStep] = useState<Step>("card");

  const [draftDescription, setDraftDescription] = useState(recipient.physicalDescription);
  const [draftPlaces, setDraftPlaces] = useState<string[]>(recipient.wanderToPlaces);
  const [newPlace, setNewPlace] = useState("");
  const [draftContactName, setDraftContactName] = useState(recipient.extraContactName ?? "");
  const [draftContactPhone, setDraftContactPhone] = useState(recipient.extraContactPhone ?? "");

  const handleClose = () => {
    setStep("card");
    onClose();
  };

  const startEdit = () => {
    setDraftDescription(recipient.physicalDescription);
    setDraftPlaces(recipient.wanderToPlaces);
    setDraftContactName(recipient.extraContactName ?? "");
    setDraftContactPhone(recipient.extraContactPhone ?? "");
    setStep("edit");
  };

  const saveEdit = () => {
    onSave({
      physicalDescription: draftDescription,
      wanderToPlaces: draftPlaces,
      extraContactName: draftContactName,
      extraContactPhone: draftContactPhone,
    });
    setStep("card");
  };

  const addPlace = () => {
    if (!newPlace.trim()) return;
    setDraftPlaces((prev) => [...prev, newPlace.trim()]);
    setNewPlace("");
  };

  const removePlace = (i: number) => setDraftPlaces((prev) => prev.filter((_, idx) => idx !== i));

  const alertText = buildAlertText(recipient, members);

  const copyAlert = async () => {
    await Clipboard.setStringAsync(alertText);
    Alert.alert("Copied", "Alert text copied to clipboard.");
  };

  const shareAlert = async () => {
    try {
      await Share.share({ message: alertText });
    } catch {
      // user cancelled the share sheet — nothing to do
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView>
            {step === "card" && (
              <View>
                <View style={styles.headerRow}>
                  <Text style={styles.title}>Wandering Safety Card</Text>
                  <View style={{ flexDirection: "row", gap: 14 }}>
                    <TouchableOpacity onPress={startEdit}>
                      <Text style={styles.closeLink}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClose}>
                      <Text style={styles.closeLink}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.photoRow}>
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoInitial}>{recipient.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipientName}>{recipient.name}, {recipient.age}</Text>
                    <Text style={styles.recipientNote}>{recipient.conditionNote}</Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Physical description</Text>
                <Text style={styles.sectionBody}>{recipient.physicalDescription || "Not added yet — tap Edit."}</Text>

                <Text style={styles.sectionLabel}>Likely wander-to places</Text>
                <View style={styles.chipWrap}>
                  {recipient.wanderToPlaces.length === 0 && <Text style={styles.sectionBody}>Not added yet — tap Edit.</Text>}
                  {recipient.wanderToPlaces.map((p, i) => (
                    <View key={i} style={styles.chip}>
                      <Text style={styles.chipText}>{p}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Emergency contacts</Text>
                {members.map((m) => (
                  <Text key={m.id} style={styles.contactLine}>{m.name} — {m.phone}</Text>
                ))}
                {recipient.extraContactName && recipient.extraContactPhone && (
                  <Text style={styles.contactLine}>{recipient.extraContactName} — {recipient.extraContactPhone}</Text>
                )}

                <TouchableOpacity style={styles.generateButton} onPress={() => setStep("alert")}>
                  <Text style={styles.generateButtonText}>Generate Alert</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === "edit" && (
              <View>
                <View style={styles.headerRow}>
                  <Text style={styles.title}>Edit Safety Info</Text>
                  <TouchableOpacity onPress={() => setStep("card")}>
                    <Text style={styles.closeLink}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Photo</Text>
                <Text style={styles.hint}>Photo upload isn't wired up in this build yet — the card shows an initial instead.</Text>

                <Text style={styles.label}>Physical description</Text>
                <TextInput
                  style={[styles.input, { minHeight: 70 }]}
                  value={draftDescription}
                  onChangeText={setDraftDescription}
                  multiline
                  placeholder="Height, build, hair, typical clothing…"
                  placeholderTextColor={theme.muted}
                />

                <Text style={styles.label}>Wander-to places</Text>
                {draftPlaces.map((p, i) => (
                  <View key={i} style={styles.placeRow}>
                    <Text style={styles.placeText}>{p}</Text>
                    <TouchableOpacity onPress={() => removePlace(i)}>
                      <Text style={styles.removeLink}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={newPlace}
                    onChangeText={setNewPlace}
                    placeholder="Add a place"
                    placeholderTextColor={theme.muted}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addPlace}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Extra emergency contact (optional, e.g. a neighbor)</Text>
                <TextInput style={styles.input} value={draftContactName} onChangeText={setDraftContactName} placeholder="Name" placeholderTextColor={theme.muted} />
                <TextInput style={[styles.input, { marginTop: 8 }]} value={draftContactPhone} onChangeText={setDraftContactPhone} placeholder="Phone number" placeholderTextColor={theme.muted} keyboardType="phone-pad" />

                <TouchableOpacity style={styles.generateButton} onPress={saveEdit}>
                  <Text style={styles.generateButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === "alert" && (
              <View>
                <View style={styles.headerRow}>
                  <TouchableOpacity onPress={() => setStep("card")}>
                    <Text style={styles.closeLink}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClose}>
                    <Text style={styles.closeLink}>Close</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.title}>Generated Alert</Text>

                <View style={styles.alertBox}>
                  <Text style={styles.alertText}>{alertText}</Text>
                </View>

                <View style={styles.row}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={copyAlert}>
                    <Text style={styles.secondaryButtonText}>Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryButton} onPress={shareAlert}>
                    <Text style={styles.secondaryButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.hint}>Wandering can be dangerous — don't hesitate to call if there's real risk.</Text>
                <TouchableOpacity style={styles.escalateButton} onPress={() => Linking.openURL("tel:911")}>
                  <Text style={styles.escalateButtonText}>Call 911</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
    sheet: { backgroundColor: theme.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "90%" },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    title: { fontSize: 18, fontWeight: "800", color: theme.text },
    closeLink: { fontSize: 13, fontWeight: "700", color: theme.primary },
    photoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    photoPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center" },
    photoInitial: { color: "#fff", fontSize: 22, fontWeight: "800" },
    recipientName: { fontSize: 16, fontWeight: "700", color: theme.text },
    recipientNote: { fontSize: 12, color: theme.muted },
    sectionLabel: { fontSize: 12, fontWeight: "700", color: theme.muted, marginTop: 14, marginBottom: 4, textTransform: "uppercase" },
    sectionBody: { fontSize: 14, color: theme.text, lineHeight: 20 },
    chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    chip: { backgroundColor: theme.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
    chipText: { fontSize: 12, color: theme.primary, fontWeight: "600" },
    contactLine: { fontSize: 13, color: theme.text, marginBottom: 2 },
    generateButton: { backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 20 },
    generateButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    label: { fontSize: 12, fontWeight: "600", color: theme.muted, marginTop: 14, marginBottom: 6 },
    hint: { fontSize: 11, color: theme.muted, marginBottom: 6 },
    input: { backgroundColor: theme.canvas, borderRadius: 10, padding: 10, color: theme.text, borderWidth: 1, borderColor: theme.border },
    row: { flexDirection: "row", gap: 10 },
    placeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
    placeText: { fontSize: 13, color: theme.text, flex: 1 },
    removeLink: { fontSize: 12, color: theme.danger, fontWeight: "700" },
    addButton: { backgroundColor: theme.primary, paddingHorizontal: 16, borderRadius: 10, justifyContent: "center" },
    addButtonText: { color: "#fff", fontWeight: "700" },
    alertBox: { backgroundColor: theme.primarySoft, borderRadius: 14, padding: 16, marginBottom: 16 },
    alertText: { fontSize: 15, lineHeight: 22, color: theme.text },
    secondaryButton: { flex: 1, backgroundColor: theme.canvas, borderRadius: 10, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: theme.border },
    secondaryButtonText: { fontSize: 13, fontWeight: "700", color: theme.text },
    escalateButton: { backgroundColor: theme.danger, borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 14 },
    escalateButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  });
