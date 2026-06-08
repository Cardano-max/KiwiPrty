import React from "react";
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { ApiProduct } from "./api";
import { inr } from "./format";
import { colors } from "./theme";

export function ProductCard({ product, onPress }: { product: ApiProduct; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.img} />
      ) : (
        <View style={[styles.img, styles.center]}>
          <Text style={{ fontSize: 32 }}>🎁</Text>
        </View>
      )}
      <View style={{ padding: 8 }}>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          {inr(product.pricePaise)} <Text style={styles.unit}>/ {product.unitLabel}</Text>
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          MOQ {product.moq} · {product.supplier.name}
        </Text>
      </View>
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        variant === "outline" ? styles.btnOutline : styles.btnPrimary,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.btnText, variant === "outline" && { color: colors.kiwi }]}>{title}</Text>
    </Pressable>
  );
}

export function Loading() {
  return (
    <View style={[styles.center, { flex: 1, padding: 40 }]}>
      <ActivityIndicator color={colors.kiwi} />
    </View>
  );
}

export function LoginPrompt({ onLogin, message }: { onLogin: () => void; message: string }) {
  return (
    <View style={[styles.center, { flex: 1, padding: 24, backgroundColor: colors.bg }]}>
      <Text style={{ fontSize: 40, marginBottom: 8 }}>🔒</Text>
      <Text style={{ fontSize: 16, color: colors.muted, marginBottom: 16, textAlign: "center" }}>
        {message}
      </Text>
      <PrimaryButton title="Login" onPress={onLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  img: { width: "100%", height: 120, backgroundColor: colors.kiwiLight },
  name: { fontSize: 13, fontWeight: "600", color: colors.text },
  price: { marginTop: 4, fontSize: 15, fontWeight: "800", color: colors.kiwiDark },
  unit: { fontSize: 11, fontWeight: "400", color: colors.muted },
  meta: { marginTop: 2, fontSize: 11, color: colors.muted },
  btn: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 18, alignItems: "center" },
  btnPrimary: { backgroundColor: colors.kiwi },
  btnOutline: { borderWidth: 1, borderColor: colors.kiwi, backgroundColor: "transparent" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
