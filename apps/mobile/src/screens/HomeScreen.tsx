import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { api, ApiProduct } from "../api";
import { colors } from "../theme";
import { ProductCard, Loading } from "../components";

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .products({ sort: "popular" })
      .then((d) => setItems(d.items))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(i) => i.id}
        columnWrapperStyle={{ gap: 10, paddingHorizontal: 12 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>🎈 Kiwi Party</Text>
              <Text style={styles.heroSub}>India's AI party-supplies marketplace</Text>
              <Pressable style={styles.assistantBtn} onPress={() => navigation.navigate("Assistant")}>
                <Text style={styles.assistantText}>🤖 Ask the AI assistant</Text>
              </Pressable>
            </View>
            <Text style={styles.section}>Trending products</Text>
            {err ? (
              <Text style={styles.err}>
                {err}
                {"\n"}Set EXPO_PUBLIC_API_URL to your backend URL.
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={loading && !err ? <Loading /> : null}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => navigation.navigate("Product", { slug: item.slug })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.kiwi, padding: 20, paddingBottom: 24 },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  heroSub: { color: "#e9e5ff", marginTop: 4 },
  assistantBtn: {
    marginTop: 14,
    backgroundColor: "#ffffff22",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  assistantText: { color: "#fff", fontWeight: "700" },
  section: { fontSize: 16, fontWeight: "700", color: colors.text, paddingHorizontal: 12, paddingTop: 14 },
  err: { color: "#b91c1c", paddingHorizontal: 12, paddingTop: 8 },
});
