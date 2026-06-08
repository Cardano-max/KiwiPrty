import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api";
import { inr } from "../format";
import { colors } from "../theme";
import { PrimaryButton, Loading, LoginPrompt } from "../components";
import { useAuth } from "../auth";

export default function CartScreen({ navigation }: { navigation: any }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<{ items: any[]; split: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .cart()
      .then(setCart)
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function checkout() {
    setBusy(true);
    try {
      await api.checkout();
      Alert.alert("Order placed 🎉", "Your order is confirmed with a GST invoice per supplier.");
      navigation.navigate("Orders");
      load();
    } catch (e: any) {
      Alert.alert("Checkout failed", e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!token)
    return <LoginPrompt message="Log in to view your cart and order." onLogin={() => navigation.navigate("Login")} />;
  if (loading) return <Loading />;

  const items = cart?.items ?? [];
  const split = cart?.split;

  if (items.length === 0)
    return (
      <View style={[styles.center, { flex: 1, backgroundColor: colors.bg }]}>
        <Text style={{ fontSize: 40 }}>🛒</Text>
        <Text style={{ color: colors.muted, marginTop: 8 }}>Your cart is empty.</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.productId}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {item.supplier} · Qty {item.quantity}
              </Text>
            </View>
          </View>
        )}
      />
      <View style={styles.summary}>
        <View style={styles.sumRow}>
          <Text style={{ color: colors.muted }}>Subtotal</Text>
          <Text>{inr(split?.subtotalPaise ?? 0)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={{ color: colors.muted }}>GST</Text>
          <Text>{inr(split?.gstPaise ?? 0)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={{ fontWeight: "800" }}>Total</Text>
          <Text style={{ fontWeight: "800", color: colors.kiwiDark }}>{inr(split?.totalPaise ?? 0)}</Text>
        </View>
        <Text style={styles.note}>
          {split?.supplierOrders?.length ?? 0} supplier order(s) · one GST invoice each
        </Text>
        <PrimaryButton title={busy ? "Placing…" : "Place order & pay"} onPress={checkout} disabled={busy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  item: { backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12, flexDirection: "row" },
  itemName: { fontWeight: "600", color: colors.text },
  itemMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  summary: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, padding: 16, gap: 6 },
  sumRow: { flexDirection: "row", justifyContent: "space-between" },
  note: { color: colors.muted, fontSize: 12, marginBottom: 6 },
});
