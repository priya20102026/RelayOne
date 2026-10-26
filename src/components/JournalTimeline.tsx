import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { FamilyMember, JournalEntry, MemberId } from "../types";

interface Props {
  entries: JournalEntry[];
  members: FamilyMember[];
  currentMemberId: MemberId;
  onAddEntry: (text: string) => void;
}

export default function JournalTimeline({ entries, members, onAddEntry }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    onAddEntry(draft.trim());
    setDraft("");
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Care Journal</Text>
      <Text style={styles.subtitle}>
        A family log, shared with everyone in the circle. (Check-In Today is separate — it only
        updates your own Load Score.)
      </Text>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Share a quick update with the family circle…"
          placeholderTextColor={theme.muted}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <TouchableOpacity style={styles.postButton} onPress={submit}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 10 }}>
        {entries.map((e) => {
          const author = members.find((m) => m.id === e.authorId);
          return (
            <View key={e.id} style={styles.entry}>
              <View style={styles.entryHeader}>
                <View style={[styles.dot, { backgroundColor: author?.color ?? theme.muted }]} />
                <Text style={styles.author}>{author?.name ?? "Someone"}</Text>
                <Text style={styles.timestamp}>{e.timestamp}</Text>
              </View>
              <Text style={styles.text}>{e.text}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: 12 },
    title: { fontSize: 16, fontWeight: "700", color: theme.text },
    subtitle: { fontSize: 12, color: theme.muted, marginTop: -6 },
    composer: { backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 10, gap: 8 },
    input: { minHeight: 44, color: theme.text, fontSize: 16 },
    postButton: { alignSelf: "flex-end", backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9 },
    postButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    entry: { backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 12, gap: 4 },
    entryHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    author: { fontSize: 12, fontWeight: "700", color: theme.text },
    timestamp: { fontSize: 11, color: theme.muted, marginLeft: "auto" },
    text: { fontSize: 13, color: theme.text },
  });
