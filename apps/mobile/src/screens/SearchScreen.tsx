import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, Text, StyleSheet } from "react-native";
import { api, ApiProduct } from "../api";
import { colors } from "../theme";
import { ProductCard, Loading } from "../components";

export default function SearchScreen({ navigation, route }: { navigation: any; route: any }) {
  const [q, setQ] = useState<string>(route?.params?.q ?? "");
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function run(query: string) {
    setLoading(true);
    setSearched(true);
    try {
      const d = await api.products({ q: query });
      setItems(d.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    run("");
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.bar}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search e.g. baby shower under 5000"
          placeholderTextColor={colors.muted}
          onSubmitEditing={() => run(q)}
          returnKeyType="search"
          style={styles.input}
        />
      </View>
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(i) => i.id}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 12 }}
          contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
          ListEmptyComponent={
            searched ? <Text style={styles.empty}>No products found.</Text> : null
          }
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => navigation.navigate("Product", { slug: item.slug })} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { padding: 12, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  input: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
  },
  empty: { textAlign: "center", color: colors.muted, padding: 30 },
});
