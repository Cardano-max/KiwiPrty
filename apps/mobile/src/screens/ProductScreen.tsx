import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Image, StyleSheet, Alert } from "react-native";
import { api, ApiProductDetail } from "../api";
import { inr } from "../format";
import { colors } from "../theme";
import { PrimaryButton, Loading } from "../components";
import { useAuth } from "../auth";

export default function ProductScreen({ navigation, route }: { navigation: any; route: any }) {
  const { slug } = route.params as { slug: string };
  const { token } = useAuth();
  const [p, setP] = useState<ApiProductDetail | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.product(slug).then(setP).catch(() => setP(null));
  }, [slug]);

  async function addToCart() {
    if (!p) return;
    if (!token) {
      navigation.navigate("Login");
      return;
    }
    setBusy(true);
    try {
      await api.addToCart(p.id, p.moq);
      Alert.alert("Added to cart", `${p.moq} × ${p.name}`);
    } catch (e: any) {
      Alert.alert("Couldn't add", e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!p) return <Loading />;
  const inStock = p.stock > 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      {p.images[0] ? (
        <Image source={{ uri: p.images[0] }} style={styles.img} />
      ) : (
        <View style={[styles.img, { alignItems: "center", justifyContent: "center" }]}>
          <Text style={{ fontSize: 56 }}>🎁</Text>
        </View>
      )}
      <View style={{ padding: 16 }}>
        <Text style={styles.name}>{p.name}</Text>
        <Text style={styles.cat}>{p.category}</Text>
        <Text style={styles.price}>
          {inr(p.pricePaise)} <Text style={styles.unit}>/ {p.unitLabel} · +{p.gstPercent}% GST</Text>
        </Text>
        <View style={styles.row}>
          <Info label="MOQ" value={`${p.moq} ${p.unitLabel}`} />
          <Info label="Multiples of" value={`${p.quantityMultiple}`} />
          <Info label="Stock" value={inStock ? `${p.stock}` : "Out"} />
        </View>
        {p.city ? <Text style={styles.meta}>Ships from {p.city}</Text> : null}
        {p.description ? <Text style={styles.desc}>{p.description}</Text> : null}

        {p.priceSlabs.length > 0 && (
          <View style={styles.slabs}>
            <Text style={styles.slabTitle}>Quantity price slabs</Text>
            {p.priceSlabs.map((s, i) => (
              <View key={i} style={styles.slabRow}>
                <Text style={styles.slabQty}>
                  {s.minQty}
                  {s.maxQty ? `–${s.maxQty}` : "+"} {p.unitLabel}
                </Text>
                <Text style={styles.slabPrice}>{inr(s.unitPricePaise)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.supplier}>
          <Text style={styles.supplierName}>🏭 {p.supplier.name}</Text>
          <Text style={styles.meta}>
            {p.supplier.city} · trusted supplier
          </Text>
        </View>

        <View style={{ marginTop: 16 }}>
          {inStock ? (
            <PrimaryButton title={busy ? "Adding…" : `Add to cart (${p.moq})`} onPress={addToCart} disabled={busy} />
          ) : (
            <Text style={styles.oos}>Out of stock</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoVal}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { width: "100%", height: 260, backgroundColor: colors.kiwiLight },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  cat: { color: colors.muted, marginTop: 2 },
  price: { marginTop: 10, fontSize: 22, fontWeight: "800", color: colors.kiwiDark },
  unit: { fontSize: 12, fontWeight: "400", color: colors.muted },
  row: { flexDirection: "row", gap: 10, marginTop: 14 },
  info: { flex: 1, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 10, alignItems: "center" },
  infoVal: { fontWeight: "800", color: colors.text },
  infoLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  meta: { color: colors.muted, marginTop: 8 },
  desc: { color: "#374151", marginTop: 12, lineHeight: 20 },
  slabs: { marginTop: 16, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  slabTitle: { fontWeight: "700", color: colors.text, padding: 10, backgroundColor: colors.kiwiLight },
  slabRow: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderTopWidth: 1, borderTopColor: colors.border },
  slabQty: { color: colors.text },
  slabPrice: { fontWeight: "700", color: colors.text },
  supplier: { marginTop: 16, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12 },
  supplierName: { fontWeight: "700", color: colors.text },
  oos: { textAlign: "center", color: "#b91c1c", fontWeight: "700", padding: 12 },
});
