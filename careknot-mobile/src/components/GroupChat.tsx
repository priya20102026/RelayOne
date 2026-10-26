import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";
import { ChatMessage, FamilyMember, MemberId } from "../types";

interface Props {
  circleName: string;
  messages: ChatMessage[];
  members: FamilyMember[];
  currentMemberId: MemberId;
  onSend: (text: string) => void;
}

export default function GroupChat({ circleName, messages, members, currentMemberId, onSend }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{circleName} — Chat</Text>
      </View>

      <ScrollView contentContainerStyle={styles.messages}>
        {messages.map((m) => {
          const author = members.find((a) => a.id === m.authorId);
          const mine = m.authorId === currentMemberId;
          return (
            <View key={m.id} style={[styles.bubbleRow, mine && { alignSelf: "flex-end" }]}>
              {!mine && <View style={[styles.avatarDot, { backgroundColor: author?.color ?? theme.muted }]} />}
              <View style={[styles.bubble, mine ? { backgroundColor: theme.primary } : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
                {!mine && <Text style={styles.bubbleAuthor}>{author?.name}</Text>}
                <Text style={[styles.bubbleText, mine && { color: "#fff" }]}>{m.text}</Text>
                <Text style={[styles.bubbleTime, mine && { color: "#ffffffaa" }]}>{m.timestamp}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Message the circle…"
          placeholderTextColor={theme.muted}
          value={draft}
          onChangeText={setDraft}
        />
        <TouchableOpacity style={styles.sendButton} onPress={submit}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: theme.canvas },
    header: { padding: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
    title: { fontSize: 15, fontWeight: "700", color: theme.text },
    messages: { padding: 16, gap: 10 },
    bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, maxWidth: "85%" },
    avatarDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
    bubble: { borderRadius: 14, padding: 10, gap: 2 },
    bubbleAuthor: { fontSize: 11, fontWeight: "700", color: theme.muted },
    bubbleText: { fontSize: 14, color: theme.text },
    bubbleTime: { fontSize: 10, color: theme.muted, marginTop: 2 },
    composer: { flexDirection: "row", gap: 8, padding: 12, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
    input: { flex: 1, backgroundColor: theme.canvas, borderRadius: 10, paddingHorizontal: 12, color: theme.text },
    sendButton: { backgroundColor: theme.primary, paddingHorizontal: 16, borderRadius: 10, justifyContent: "center" },
    sendButtonText: { color: "#fff", fontWeight: "700" },
  });
