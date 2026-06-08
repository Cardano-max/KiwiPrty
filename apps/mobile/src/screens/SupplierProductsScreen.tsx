import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { api } from "../api";
import { inr } from "../format";
import { colors } from "../theme";
import { Loading } from "../components";

export default function SupplierProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .supplierProducts()
      .then((d) => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={products}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ padding: 12, gap: 8 }}
      ListEmptyComponent={<Text style={styles.empty}>No products yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.img} />
          ) : (
            <View style={[styles.img, { alignItems: "center", justifyContent: "center" }]}>
              <Text>🎁</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.meta}>
              {inr(item.pricePaise)}/{item.unitLabel} · MOQ {item.moq} · {item.views} views
            </Text>
          </View>
          <View style={styles.stockBox}>
            <Text style={styles.stock}>{item.stock}</Text>
            <Text style={styles.stockLabel}>stock</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 10 },
  img: { width: 48, height: 48, borderRadius: 8, backgroundColor: colors.kiwiLight },
  name: { fontWeight: "600", color: colors.text },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  stockBox: { alignItems: "center" },
  stock: { fontWeight: "800", color: colors.kiwiDark },
  stockLabel: { fontSize: 10, color: colors.muted },
  empty: { textAlign: "center", color: colors.muted, padding: 30 },
});
