import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { api } from "../api";
import { colors } from "../theme";
import { PrimaryButton } from "../components";
import { useAuth } from "../auth";

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState("9000000001");
  const [otp, setOtp] = useState("123456");
  const [busy, setBusy] = useState(false);

  async function sendOtp() {
    try {
      const r = await api.requestOtp(phone);
      if (r.devOtp) {
        setOtp(r.devOtp);
        Alert.alert("OTP", `Dev code: ${r.devOtp}`);
      } else {
        Alert.alert("OTP sent", "Check your SMS.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }

  async function doLogin() {
    setBusy(true);
    try {
      await login(phone, otp);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Login failed", e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.label}>Mobile number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          placeholderTextColor={colors.muted}
        />
        <View style={{ height: 8 }} />
        <PrimaryButton title="Send OTP" onPress={sendOtp} variant="outline" />
        <Text style={[styles.label, { marginTop: 14 }]}>OTP</Text>
        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor={colors.muted}
        />
        <View style={{ height: 14 }} />
        <PrimaryButton title={busy ? "Logging in…" : "Login"} onPress={doLogin} disabled={busy} />
      </View>

      <View style={styles.demo}>
        <Text style={styles.demoTitle}>Demo accounts (OTP 123456)</Text>
        <Text style={styles.demoLine}>🛍️ Buyer: 9000000001</Text>
        <Text style={styles.demoLine}>🏭 Supplier: 9000000010</Text>
        <Text style={styles.demoLine}>🛠️ Admin: 9000000099</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 18 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 10 },
  label: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  input: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  demo: { marginTop: 16, backgroundColor: colors.kiwiLight, borderRadius: 12, padding: 14 },
  demoTitle: { fontWeight: "700", color: colors.kiwiDark, marginBottom: 6 },
  demoLine: { color: colors.kiwiDark, marginTop: 2 },
});
