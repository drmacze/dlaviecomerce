import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { apiGet, rupiah } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type Profile = {
  id?: string;
  email?: string | null;
  display_name?: string | null;
  vip_level?: string | null;
  is_vip?: boolean | null;
  d_balance?: number | null;
  d_points?: number | null;
  l_points?: number | null;
  referral_code?: string | null;
  affiliate_rank?: string | null;
};

const VIP_COLORS: Record<string, string> = {
  free: "#8a9e8a",
  silver: "#c0c0c0",
  gold: "#ffd700",
  platinum: "#e5e4e2",
  black: "#1a1a1a",
};

type MenuItem = {
  label: string;
  icon: keyof typeof import("@expo/vector-icons/Feather").glyphMap;
  onPress: () => void;
  danger?: boolean;
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const s = styles(colors, insets);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ profile: Profile }>("/profile");
      setProfile(data.profile);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSignOut() {
    Alert.alert("Keluar", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  }

  const menuItems: MenuItem[] = [
    { label: "Rewards & Points", icon: "star", onPress: () => {} },
    { label: "Referral", icon: "users", onPress: () => {} },
    { label: "Checkin Harian", icon: "check-circle", onPress: () => {} },
    { label: "Keamanan", icon: "shield", onPress: () => {} },
    { label: "Perangkat Terpercaya", icon: "smartphone", onPress: () => {} },
  ];

  const vipLevel = profile?.vip_level || "free";
  const vipColor = VIP_COLORS[vipLevel] || VIP_COLORS.free;
  const name = profile?.display_name || user?.email?.split("@")[0] || "Member";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.lime} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Profil</Text>
      </View>

      {/* Profile card */}
      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator color={colors.lime} />
          ) : (
            <>
              <Text style={s.displayName} numberOfLines={1}>{name}</Text>
              <Text style={s.emailText} numberOfLines={1}>{user?.email || ""}</Text>
              <View style={[s.vipBadge, { borderColor: vipColor + "66", backgroundColor: vipColor + "22" }]}>
                <Text style={[s.vipText, { color: vipLevel === "free" ? colors.mutedForeground : vipColor }]}>
                  {vipLevel.toUpperCase()}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Stats */}
      {profile && (
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{rupiah(profile.d_balance ?? 0)}</Text>
            <Text style={s.statLabel}>D-Balance</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{(profile.d_points ?? 0).toLocaleString("id-ID")}</Text>
            <Text style={s.statLabel}>D-Points</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{(profile.l_points ?? 0).toLocaleString("id-ID")}</Text>
            <Text style={s.statLabel}>L-Points</Text>
          </View>
        </View>
      )}

      {/* Referral code */}
      {profile?.referral_code && (
        <View style={s.referralCard}>
          <Feather name="users" size={16} color={colors.lime} />
          <View style={{ flex: 1 }}>
            <Text style={s.referralLabel}>Kode Referral</Text>
            <Text style={s.referralCode}>{profile.referral_code}</Text>
          </View>
          <Feather name="copy" size={16} color={colors.mutedForeground} />
        </View>
      )}

      {/* Menu */}
      <View style={s.menuSection}>
        {menuItems.map((item, i) => (
          <Pressable
            key={i}
            style={({ pressed }) => [s.menuItem, { opacity: pressed ? 0.7 : 1 }]}
            onPress={item.onPress}
          >
            <View style={[s.menuIcon, { backgroundColor: item.danger ? colors.red + "22" : colors.muted }]}>
              <Feather name={item.icon} size={18} color={item.danger ? colors.red : colors.foreground} />
            </View>
            <Text style={[s.menuLabel, item.danger && { color: colors.red }]}>{item.label}</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      {/* Sign out */}
      <Pressable
        style={({ pressed }) => [s.signOutBtn, { opacity: pressed ? 0.85 : 1 }]}
        onPress={handleSignOut}
      >
        <Feather name="log-out" size={16} color={colors.red} />
        <Text style={[s.signOutText]}>Keluar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof import("@/hooks/useColors").useColors>, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    content: {
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
    },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground },
    profileCard: {
      flexDirection: "row", alignItems: "center", gap: 16,
      marginHorizontal: 20, marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 20, padding: 20,
      borderWidth: 1, borderColor: colors.border,
    },
    avatar: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: colors.lime,
      alignItems: "center", justifyContent: "center",
    },
    avatarText: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#101315" },
    displayName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    emailText: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    vipBadge: {
      alignSelf: "flex-start",
      borderRadius: 999, borderWidth: 1,
      paddingHorizontal: 8, paddingVertical: 2, marginTop: 6,
    },
    vipText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
    statsRow: {
      flexDirection: "row",
      marginHorizontal: 20, marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: colors.border,
    },
    statItem: { flex: 1, alignItems: "center" },
    statValue: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground },
    statLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
    referralCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      marginHorizontal: 20, marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius, padding: 16,
      borderWidth: 1, borderColor: colors.lime + "44",
    },
    referralLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    referralCode: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.lime, letterSpacing: 2 },
    menuSection: {
      marginHorizontal: 20, marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 16, overflow: "hidden",
      borderWidth: 1, borderColor: colors.border,
    },
    menuItem: {
      flexDirection: "row", alignItems: "center", gap: 14,
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    menuLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground },
    signOutBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      marginHorizontal: 20, marginBottom: 20,
      backgroundColor: colors.red + "18",
      borderRadius: colors.radius, paddingVertical: 14,
      borderWidth: 1, borderColor: colors.red + "33",
    },
    signOutText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.red },
  });
