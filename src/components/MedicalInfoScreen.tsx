import React, { useState } from "react";
import { dial } from "../dial";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Linking, Alert } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { CalendarEvent, CareRecipient, InsuranceInfo, MedicalVisit, PrimaryCarePhysician } from "../types";
import { addAppointmentToDeviceCalendar } from "../calendarSync";

interface Props {
  recipient: CareRecipient;
  events: CalendarEvent[];
  onUpdateInsurance: (updates: InsuranceInfo) => void;
  onUpdatePhysician: (updates: PrimaryCarePhysician) => void;
  onAddVisit: (visit: { date: string; providerName: string; reason: string; notes: string }) => void;
}

const EMPTY_INSURANCE: InsuranceInfo = {
  providerName: "",
  memberName: "",
  policyNumber: "",
  groupNumber: "",
  insurancePhone: "",
};

const EMPTY_PHYSICIAN: PrimaryCarePhysician = {
  name: "",
  specialty: "",
  phone: "",
  officeAddress: "",
};

export default function MedicalInfoScreen({ recipient, events, onUpdateInsurance, onUpdatePhysician, onAddVisit }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [showPolicy, setShowPolicy] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(false);
  const [insuranceDraft, setInsuranceDraft] = useState<InsuranceInfo>(recipient.insurance ?? EMPTY_INSURANCE);

  const [editingPhysician, setEditingPhysician] = useState(false);
  const [physicianDraft, setPhysicianDraft] = useState<PrimaryCarePhysician>(
    recipient.primaryCarePhysician ?? EMPTY_PHYSICIAN
  );

  const [addingVisit, setAddingVisit] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitProvider, setVisitProvider] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [visitNotes, setVisitNotes] = useState("");

  const [syncingEventId, setSyncingEventId] = useState<string | null>(null);

  const saveInsurance = () => {
    onUpdateInsurance(insuranceDraft);
    setEditingInsurance(false);
  };

  const savePhysician = () => {
    onUpdatePhysician(physicianDraft);
    setEditingPhysician(false);
  };

  const submitVisit = () => {
    if (!visitDate.trim() || !visitReason.trim()) return;
    onAddVisit({
      date: visitDate.trim(),
      providerName: visitProvider.trim() || recipient.primaryCarePhysician?.name || "Unknown provider",
      reason: visitReason.trim(),
      notes: visitNotes.trim(),
    });
    setVisitDate("");
    setVisitProvider("");
    setVisitReason("");
    setVisitNotes("");
    setAddingVisit(false);
  };

  const handleCall = (phone?: string) => {
    if (!phone) return;
    dial(phone);
  };

  const handleSyncToDevice = async (event: CalendarEvent) => {
    setSyncingEventId(event.id);
    const result = await addAppointmentToDeviceCalendar({
      title: event.title,
      dateLabel: event.dateLabel,
      startTime: event.startTime,
      endTime: event.endTime,
      notes: "Added from RelayOne",
    });
    setSyncingEventId(null);

    if (result === "added") {
      Alert.alert("Added to your calendar", `"${event.title}" is now on your phone's calendar.`);
    } else if (result === "unsupported") {
      Alert.alert("Not available here", "Syncing to your phone's calendar only works in the installed app, not on web.");
    } else if (result === "denied") {
      Alert.alert("Permission needed", "Allow calendar access in your phone's settings to sync appointments.");
    } else {
      Alert.alert("Couldn't sync", "Something went wrong adding this to your phone's calendar. The event is still saved in RelayOne.");
    }
  };

  const upcoming = events; // Shared calendar already only holds upcoming/today events in this build.
  const visits: MedicalVisit[] = recipient.medicalVisits ?? [];

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Care Hub — {recipient.name}</Text>
      <Text style={styles.screenSubtitle}>
        Care contacts, appointments, and notes the whole family can find in one place.
      </Text>
      <Text style={styles.disclaimer}>Sample data only. Don't enter real medical or insurance details.</Text>
      <Text style={styles.disclaimer}>
        RelayOne helps families stay organized. It does not provide medical advice or act as an
        official medical record.
      </Text>

      {/* Insurance */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Insurance Card</Text>
          {!editingInsurance && (
            <TouchableOpacity onPress={() => { setInsuranceDraft(recipient.insurance ?? EMPTY_INSURANCE); setEditingInsurance(true); }}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editingInsurance ? (
          <View style={{ gap: 8 }}>
            <LabeledInput theme={theme} label="Provider" value={insuranceDraft.providerName} onChangeText={(v) => setInsuranceDraft((d) => ({ ...d, providerName: v }))} />
            <LabeledInput theme={theme} label="Member name" value={insuranceDraft.memberName} onChangeText={(v) => setInsuranceDraft((d) => ({ ...d, memberName: v }))} />
            <LabeledInput theme={theme} label="Policy number" value={insuranceDraft.policyNumber} onChangeText={(v) => setInsuranceDraft((d) => ({ ...d, policyNumber: v }))} />
            <LabeledInput theme={theme} label="Group number" value={insuranceDraft.groupNumber} onChangeText={(v) => setInsuranceDraft((d) => ({ ...d, groupNumber: v }))} />
            <LabeledInput theme={theme} label="Insurance phone" value={insuranceDraft.insurancePhone} onChangeText={(v) => setInsuranceDraft((d) => ({ ...d, insurancePhone: v }))} keyboardType="phone-pad" />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditingInsurance(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={saveInsurance}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : recipient.insurance ? (
          <View style={{ gap: 4 }}>
            <InfoRow theme={theme} label="Provider" value={recipient.insurance.providerName} />
            <InfoRow theme={theme} label="Member" value={recipient.insurance.memberName} />
            <InfoRow
              theme={theme}
              label="Policy #"
              value={showPolicy ? recipient.insurance.policyNumber : maskValue(recipient.insurance.policyNumber)}
            />
            <TouchableOpacity onPress={() => setShowPolicy((v) => !v)}>
              <Text style={styles.editLink}>{showPolicy ? "Hide policy #" : "Show policy #"}</Text>
            </TouchableOpacity>
            <InfoRow theme={theme} label="Group #" value={recipient.insurance.groupNumber} />
            <TouchableOpacity onPress={() => handleCall(recipient.insurance?.insurancePhone)}>
              <InfoRow theme={theme} label="Insurance line" value={recipient.insurance.insurancePhone} highlight />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.emptyNote}>No insurance info saved yet. Tap Edit to add it.</Text>
        )}
      </View>

      {/* Primary Care Physician */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Primary Care Physician</Text>
          {!editingPhysician && (
            <TouchableOpacity onPress={() => { setPhysicianDraft(recipient.primaryCarePhysician ?? EMPTY_PHYSICIAN); setEditingPhysician(true); }}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editingPhysician ? (
          <View style={{ gap: 8 }}>
            <LabeledInput theme={theme} label="Name" value={physicianDraft.name} onChangeText={(v) => setPhysicianDraft((d) => ({ ...d, name: v }))} />
            <LabeledInput theme={theme} label="Specialty" value={physicianDraft.specialty} onChangeText={(v) => setPhysicianDraft((d) => ({ ...d, specialty: v }))} />
            <LabeledInput theme={theme} label="Phone" value={physicianDraft.phone} onChangeText={(v) => setPhysicianDraft((d) => ({ ...d, phone: v }))} keyboardType="phone-pad" />
            <LabeledInput theme={theme} label="Office address" value={physicianDraft.officeAddress} onChangeText={(v) => setPhysicianDraft((d) => ({ ...d, officeAddress: v }))} />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditingPhysician(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={savePhysician}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : recipient.primaryCarePhysician ? (
          <View style={{ gap: 4 }}>
            <InfoRow theme={theme} label="Name" value={recipient.primaryCarePhysician.name} />
            <InfoRow theme={theme} label="Specialty" value={recipient.primaryCarePhysician.specialty} />
            <TouchableOpacity onPress={() => handleCall(recipient.primaryCarePhysician?.phone)}>
              <InfoRow theme={theme} label="Phone" value={recipient.primaryCarePhysician.phone} highlight />
            </TouchableOpacity>
            <InfoRow theme={theme} label="Office" value={recipient.primaryCarePhysician.officeAddress} />
          </View>
        ) : (
          <Text style={styles.emptyNote}>No physician info saved yet. Tap Edit to add it.</Text>
        )}
      </View>

      {/* Upcoming appointments */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming</Text>
        {upcoming.length === 0 && <Text style={styles.emptyNote}>Nothing on the calendar yet.</Text>}
        {upcoming.map((e) => (
          <View key={e.id} style={styles.appointmentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.appointmentTitle}>{e.title}</Text>
              <Text style={styles.appointmentMeta}>
                {e.dateLabel}
                {e.startTime ? ` · ${e.startTime}${e.endTime ? `–${e.endTime}` : ""}` : ""}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Visit history */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Appointment Notes</Text>
          {!addingVisit && (
            <TouchableOpacity onPress={() => setAddingVisit(true)}>
              <Text style={styles.editLink}>+ Add a note</Text>
            </TouchableOpacity>
          )}
        </View>

        {addingVisit && (
          <View style={{ gap: 8, marginBottom: 12 }}>
            <LabeledInput theme={theme} label="Date" value={visitDate} onChangeText={setVisitDate} placeholder="e.g. Oct 14, 2026" />
            <LabeledInput theme={theme} label="Provider" value={visitProvider} onChangeText={setVisitProvider} placeholder={recipient.primaryCarePhysician?.name ?? "Provider name"} />
            <LabeledInput theme={theme} label="Reason" value={visitReason} onChangeText={setVisitReason} placeholder="e.g. Follow-up check-up" />
            <LabeledInput theme={theme} label="Notes" value={visitNotes} onChangeText={setVisitNotes} placeholder="What happened, next steps…" multiline />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setAddingVisit(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={submitVisit}>
                <Text style={styles.primaryButtonText}>Save note</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {visits.length === 0 && !addingVisit && <Text style={styles.emptyNote}>No appointment notes yet.</Text>}
        {visits.map((v) => (
          <View key={v.id} style={styles.visitRow}>
            <View style={styles.visitTopRow}>
              <Text style={styles.visitReason}>{v.reason}</Text>
              <Text style={styles.visitDate}>{v.date}</Text>
            </View>
            <Text style={styles.visitProvider}>{v.providerName}</Text>
            {!!v.notes && <Text style={styles.visitNotes}>{v.notes}</Text>}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function maskValue(v: string): string {
  if (!v) return "";
  return "••••" + v.slice(-3);
}

function InfoRow({ theme, label, value, highlight }: { theme: ThemeColors; label: string; value: string; highlight?: boolean }) {
  const styles = makeStyles(theme);
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: theme.primary, fontWeight: "700" }]}>{value || "—"}</Text>
    </View>
  );
}

function LabeledInput({
  theme,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  theme: ThemeColors;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "phone-pad" | "default";
  multiline?: boolean;
}) {
  const styles = makeStyles(theme);
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 70, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: theme.canvas },
    content: { padding: 16, paddingBottom: 48, gap: 14 },
    disclaimer: { fontSize: 11, color: theme.muted, fontStyle: "italic", marginTop: -8 },
    screenTitle: { fontSize: 18, fontWeight: "700", color: theme.text },
    screenSubtitle: { fontSize: 13, color: theme.muted, marginTop: -8, marginBottom: 2 },
    card: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border, gap: 10 },
    cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontSize: 14, fontWeight: "700", color: theme.text },
    editLink: { fontSize: 12, fontWeight: "700", color: theme.primary },
    emptyNote: { fontSize: 12, color: theme.muted },
    infoRow: { flexDirection: "row", justifyContent: "space-between" },
    infoLabel: { fontSize: 12, color: theme.muted },
    infoValue: { fontSize: 13, color: theme.text, fontWeight: "600" },
    inputLabel: { fontSize: 11, fontWeight: "700", color: theme.muted, textTransform: "uppercase" },
    input: { backgroundColor: theme.canvas, borderRadius: 10, padding: 10, color: theme.text, borderWidth: 1, borderColor: theme.border, fontSize: 16 },
    editActions: { flexDirection: "row", gap: 10, marginTop: 4 },
    secondaryButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.canvas, alignItems: "center" },
    secondaryButtonText: { fontSize: 12, fontWeight: "700", color: theme.text },
    primaryButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.primary, alignItems: "center" },
    primaryButtonText: { fontSize: 12, fontWeight: "700", color: "#fff" },
    appointmentRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border },
    appointmentTitle: { fontSize: 13, fontWeight: "600", color: theme.text },
    appointmentMeta: { fontSize: 12, color: theme.muted },
    syncButton: { backgroundColor: theme.primarySoft, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
    syncButtonText: { fontSize: 11, fontWeight: "700", color: theme.primary },
    visitRow: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.border, gap: 2 },
    visitTopRow: { flexDirection: "row", justifyContent: "space-between" },
    visitReason: { fontSize: 13, fontWeight: "700", color: theme.text },
    visitDate: { fontSize: 12, color: theme.muted },
    visitProvider: { fontSize: 12, color: theme.muted },
    visitNotes: { fontSize: 12, color: theme.text, marginTop: 2 },
  });
