import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api";
import { inr } from "../format";
import { colors } from "../theme";
import { Loading, LoginPrompt } from "../components";
import { useAuth } from "../auth";

export default function OrdersScreen({ navigation }: { navigation: any }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .orders()
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!token)
    return <LoginPrompt message="Log in to see your orders." onLogin={() => navigation.navigate("Login")} />;
  if (loading) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.id}>Order #{item.id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.total}>{inr(item.totalPaise)}</Text>
            </View>
            <Text style={styles.meta}>
              {new Date(item.placedAt).toLocaleDateString()} · {item.supplierOrders.length} supplier order(s)
            </Text>
            {item.supplierOrders.map((so: any) => (
              <Text key={so.id} style={styles.line}>
                🏭 {so.supplier.companyName} · {so.status}
                {so.invoice ? ` · ${so.invoice.number}` : ""}
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  id: { fontWeight: "700", color: colors.text },
  total: { fontWeight: "800", color: colors.kiwiDark },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  line: { color: "#374151", fontSize: 13, marginTop: 6 },
  empty: { textAlign: "center", color: colors.muted, padding: 30 },
});
