import React, { useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { api, ApiProduct } from "../api";
import { inr } from "../format";
import { colors } from "../theme";

interface Msg {
  role: "user" | "assistant";
  text: string;
  products?: ApiProduct[];
}

export default function AssistantScreen({ navigation }: { navigation: any }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi! Tell me what you're sourcing — e.g. 'balloon arch for a baby shower' or 'Diwali decoration under ₹500'.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const d = await api.chat(q);
      setMessages((m) => [...m, { role: "assistant", text: d.text, products: d.products }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", text: e.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        renderItem={({ item }) => (
          <View style={{ alignItems: item.role === "user" ? "flex-end" : "flex-start" }}>
            <View style={[styles.bubble, item.role === "user" ? styles.user : styles.bot]}>
              <Text style={item.role === "user" ? styles.userText : styles.botText}>{item.text}</Text>
            </View>
            {item.products?.map((p) => (
              <Pressable key={p.slug} style={styles.chip} onPress={() => navigation.navigate("Product", { slug: p.slug })}>
                <Text style={styles.chipText}>
                  {p.name} · {inr(p.pricePaise)}/{p.unitLabel}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        ListFooterComponent={loading ? <Text style={styles.thinking}>Thinking…</Text> : null}
      />
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask the assistant…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "85%", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  user: { backgroundColor: colors.kiwi },
  bot: { backgroundColor: "#eef0f2" },
  userText: { color: "#fff" },
  botText: { color: colors.text },
  chip: { marginTop: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 12, color: colors.text },
  thinking: { color: colors.muted, padding: 8 },
  inputBar: { flexDirection: "row", gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  input: { flex: 1, backgroundColor: colors.bg, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, color: colors.text },
  sendBtn: { backgroundColor: colors.kiwi, borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "700" },
});
