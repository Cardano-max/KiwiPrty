import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { api } from "../api";
import { inr } from "../format";
import { colors } from "../theme";
import { PrimaryButton, Loading } from "../components";

export default function SupplierDashboardScreen({ navigation }: { navigation: any }) {
  const [data, setData] = useState<{ stats: any; recentOrders: any[]; recentInquiries: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .supplierSummary()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  const s = data?.stats;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 14, gap: 12 }}>
      <View style={styles.grid}>
        <Stat label="Products" value={String(s?.productCount ?? 0)} />
        <Stat label="Orders" value={String(s?.ordersCount ?? 0)} />
        <Stat label="Inquiries" value={String(s?.inquiriesCount ?? 0)} />
        <Stat label="Views" value={String(s?.totalViews ?? 0)} />
      </View>
      <View style={styles.salesCard}>
        <Text style={styles.salesValue}>{inr(s?.totalSalesPaise ?? 0)}</Text>
        <Text style={styles.salesLabel}>Total sales</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <PrimaryButton title="My products" onPress={() => navigation.navigate("SupplierProducts")} variant="outline" />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton title="Orders" onPress={() => navigation.navigate("SupplierOrders")} variant="outline" />
        </View>
      </View>

      <Text style={styles.section}>Recent orders</Text>
      {(data?.recentOrders ?? []).length === 0 ? (
        <Text style={styles.muted}>No orders yet.</Text>
      ) : (
        data!.recentOrders.map((o) => (
          <View key={o.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{o.shop}</Text>
              <Text style={styles.muted}>
                {o.items} item(s) · {o.status}
              </Text>
            </View>
            <Text style={styles.rowAmount}>{inr(o.totalPaise)}</Text>
          </View>
        ))
      )}

      <Text style={styles.section}>Recent leads</Text>
      {(data?.recentInquiries ?? []).length === 0 ? (
        <Text style={styles.muted}>No inquiries yet.</Text>
      ) : (
        data!.recentInquiries.map((i) => (
          <View key={i.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {i.shop} {i.score === "hot" ? "🔥" : i.score === "warm" ? "⭐" : "⚪"}
              </Text>
              <Text style={styles.muted} numberOfLines={1}>
                {i.product} — “{i.message}”
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: { width: "47%", backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14 },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.kiwiDark },
  statLabel: { fontSize: 12, color: colors.muted },
  salesCard: { backgroundColor: colors.kiwi, borderRadius: 12, padding: 16 },
  salesValue: { fontSize: 24, fontWeight: "800", color: "#fff" },
  salesLabel: { color: "#e9e5ff" },
  section: { fontSize: 15, fontWeight: "700", color: colors.text, marginTop: 6 },
  muted: { color: colors.muted, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12 },
  rowTitle: { fontWeight: "600", color: colors.text },
  rowAmount: { fontWeight: "800", color: colors.kiwiDark },
});
