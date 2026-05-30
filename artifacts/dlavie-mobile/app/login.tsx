import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const s = styles(colors, insets);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (tab === "signin") {
        const result = await signIn(email.trim(), password);
        if (result.error) {
          setError(result.error);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/(tabs)");
        }
      } else {
        const result = await signUp(email.trim(), password);
        if (result.error) {
          setError(result.error);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          setSuccess("Pendaftaran berhasil! Cek email untuk konfirmasi.");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <View style={s.logoMark}>
              <Text style={s.logoText}>DL</Text>
            </View>
            <Text style={s.brand}>DLAVIE</Text>
            <Text style={s.tagline}>Digital Commerce Platform</Text>
          </View>

          {/* Tab switcher */}
          <View style={s.tabs}>
            <Pressable
              style={[s.tabBtn, tab === "signin" && s.tabBtnActive]}
              onPress={() => { setTab("signin"); setError(""); setSuccess(""); }}
            >
              <Text style={[s.tabLabel, tab === "signin" && s.tabLabelActive]}>
                Masuk
              </Text>
            </Pressable>
            <Pressable
              style={[s.tabBtn, tab === "signup" && s.tabBtnActive]}
              onPress={() => { setTab("signup"); setError(""); setSuccess(""); }}
            >
              <Text style={[s.tabLabel, tab === "signup" && s.tabLabelActive]}>
                Daftar
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={s.form}>
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {!!error && <Text style={s.errorText}>{error}</Text>}
            {!!success && <Text style={s.successText}>{success}</Text>}

            <Pressable
              style={({ pressed }) => [s.btn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={s.btnText}>
                  {tab === "signin" ? "Masuk" : "Daftar Sekarang"}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = (colors: ReturnType<typeof import("@/hooks/useColors").useColors>, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    root: { flex: 1 },
    scroll: {
      flexGrow: 1,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40),
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
      paddingHorizontal: 24,
    },
    header: { alignItems: "center", marginBottom: 40 },
    logoMark: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor: colors.lime,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    logoText: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.primaryForeground === colors.lime ? colors.foreground : "#101315",
    },
    brand: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: 3,
    },
    tagline: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 4,
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 4,
      marginBottom: 28,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: colors.radius - 4,
      alignItems: "center",
    },
    tabBtnActive: { backgroundColor: colors.card },
    tabLabel: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    tabLabelActive: { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    form: { gap: 12 },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    errorText: {
      color: colors.red,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
    },
    successText: {
      color: colors.green,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
    },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 4,
    },
    btnText: {
      color: colors.primaryForeground,
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
  });
