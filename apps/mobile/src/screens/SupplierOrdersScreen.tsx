import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api";
import { inr } from "../format";
import { colors } from "../theme";
import { Loading } from "../components";

const NEXT: Record<string, string> = {
  new: "accepted",
  accepted: "packed",
  packed: "dispatched",
  dispatched: "delivered",
};

export default function SupplierOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .supplierOrders()
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function advance(o: any) {
    const next = NEXT[o.status];
    if (!next) return;
    try {
      await api.setOrderStatus(o.id, next);
      load();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }

  if (loading) return <Loading />;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: 12, gap: 10 }}
      ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.shop}>{item.shop}</Text>
            <Text style={styles.total}>{inr(item.totalPaise)}</Text>
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {item.items.map((i: any) => `${i.name} ×${i.qty}`).join(", ")}
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
            {NEXT[item.status] ? (
              <Pressable style={styles.advanceBtn} onPress={() => advance(item)}>
                <Text style={styles.advanceText}>Mark {NEXT[item.status]} →</Text>
              </Pressable>
            ) : (
              <Text style={styles.done}>✓ {item.status}</Text>
            )}
          </View>
          {item.invoice ? <Text style={styles.invoice}>Invoice {item.invoice}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  shop: { fontWeight: "700", color: colors.text },
  total: { fontWeight: "800", color: colors.kiwiDark },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  badge: { backgroundColor: colors.kiwiLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: colors.kiwiDark, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  advanceBtn: { backgroundColor: colors.kiwi, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  advanceText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  done: { color: colors.green, fontWeight: "700" },
  invoice: { color: colors.muted, fontSize: 11, marginTop: 6 },
  empty: { textAlign: "center", color: colors.muted, padding: 30 },
});
