import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";
import { PrimaryButton, LoginPrompt } from "../components";
import { useAuth } from "../auth";

export default function AccountScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();

  if (!user)
    return <LoginPrompt message="Log in to your Kiwi Party account." onLogin={() => navigation.navigate("Login")} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <View style={styles.card}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.meta}>
          {user.phone} · {user.role}
        </Text>
      </View>

      <View style={{ height: 16 }} />
      {user.role === "supplier" && (
        <>
          <PrimaryButton title="🏭 Supplier dashboard" onPress={() => navigation.navigate("SupplierDashboard")} />
          <View style={{ height: 10 }} />
        </>
      )}
      <PrimaryButton title="My orders" onPress={() => navigation.navigate("Orders")} variant="outline" />
      <View style={{ height: 10 }} />
      <PrimaryButton title="AI assistant" onPress={() => navigation.navigate("Assistant")} variant="outline" />
      <View style={{ height: 10 }} />
      <PrimaryButton title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 20, alignItems: "center" },
  avatar: { fontSize: 44 },
  name: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 8 },
  meta: { color: colors.muted, marginTop: 2, textTransform: "capitalize" },
});
