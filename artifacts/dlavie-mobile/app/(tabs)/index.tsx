import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { apiGet, rupiah } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

type Profile = {
  display_name?: string | null;
  email?: string | null;
  d_balance?: number | null;
  d_points?: number | null;
  vip_level?: string | null;
  is_vip?: boolean | null;
};

type PpobOrder = {
  id: string;
  public_order_id: string;
  status: string;
  amount: number;
  created_at: string;
};

const SERVICES = [
  { key: "pulsa", label: "Pulsa", icon: "phone" as const, color: "#dfff4f" },
  { key: "data", label: "Data", icon: "wifi" as const, color: "#45d5ff" },
  { key: "pln", label: "PLN", icon: "zap" as const, color: "#f8ffbd" },
  { key: "game", label: "Game", icon: "monitor" as const, color: "#b497cf" },
  { key: "voucher", label: "Voucher", icon: "gift" as const, color: "#e728ff" },
  { key: "wallet", label: "E-Wallet", icon: "credit-card" as const, color: "#7cff67" },
];

function greeting() {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return "Selamat pagi";
  if (h >= 11 && h < 15) return "Selamat siang";
  if (h >= 15 && h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentOrders, setRecentOrders] = useState<PpobOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const s = styles(colors, insets);

  const load = useCallback(async () => {
    try {
      const [profileRes, ordersRes] = await Promise.allSettled([
        apiGet<{ profile: Profile }>("/profile"),
        apiGet<{ orders: PpobOrder[] }>("/ppob/orders"),
      ]);
      if (profileRes.status === "fulfilled") setProfile(profileRes.value.profile);
      if (ordersRes.status === "fulfilled") setRecentOrders(ordersRes.value.orders?.slice(0, 3) || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const statusColor = (status: string) => {
    if (status === "success") return colors.green;
    if (status === "failed") return colors.red;
    return colors.orange;
  };

  if (loading) {
    return (
      <View style={[s.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.lime} size="large" />
      </View>
    );
  }

  const name = profile?.display_name || user?.email?.split("@")[0] || "Member";
  const balance = profile?.d_balance ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lime} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>{greeting()},</Text>
          <Text style={s.name} numberOfLines={1}>{name}</Text>
        </View>
        <Pressable style={s.notifBtn} onPress={() => router.push("/(tabs)/profile")}>
          <Feather name="bell" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Balance Card */}
      <View style={s.balanceCard}>
        <View style={s.balanceGlow} />
        <Text style={s.balanceLabel}>D-Balance</Text>
        <Text style={s.balanceAmount}>{rupiah(balance)}</Text>
        <View style={s.balanceActions}>
          <Pressable
            style={s.balanceBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/wallet"); }}
          >
            <Feather name="plus" size={16} color="#101315" />
            <Text style={s.balanceBtnText}>Top Up</Text>
          </Pressable>
          <Pressable
            style={[s.balanceBtn, { backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }]}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <Feather name="clock" size={16} color="#f0f5f0" />
            <Text style={[s.balanceBtnText, { color: "#f0f5f0" }]}>Riwayat</Text>
          </Pressable>
        </View>
        {profile?.vip_level && profile.vip_level !== "free" && (
          <View style={s.vipBadge}>
            <Text style={s.vipText}>{profile.vip_level.toUpperCase()}</Text>
          </View>
        )}
      </View>

      {/* Services Grid */}
      <Text style={s.sectionTitle}>Layanan Digital</Text>
      <View style={s.servicesGrid}>
        {SERVICES.map((svc) => (
          <Pressable
            key={svc.key}
            style={({ pressed }) => [s.serviceItem, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/products"); }}
          >
            <View style={[s.serviceIcon, { backgroundColor: svc.color + "22" }]}>
              <Feather name={svc.icon} size={20} color={svc.color} />
            </View>
            <Text style={s.serviceLabel}>{svc.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Transaksi Terakhir</Text>
            <Pressable onPress={() => router.push("/(tabs)/orders")}>
              <Text style={s.seeAll}>Lihat semua</Text>
            </Pressable>
          </View>
          {recentOrders.map((order) => (
            <View key={order.id} style={s.orderRow}>
              <View style={s.orderIcon}>
                <Feather name="zap" size={16} color={colors.lime} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.orderId} numberOfLines={1}>{order.public_order_id}</Text>
                <Text style={s.orderDate}>{new Date(order.created_at).toLocaleDateString("id-ID")}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.orderAmount}>{rupiah(order.amount)}</Text>
                <View style={[s.statusDot, { backgroundColor: statusColor(order.status) }]} />
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof import("@/hooks/useColors").useColors>, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
      paddingHorizontal: 20,
    },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    greeting: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    name: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2 },
    notifBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      alignItems: "center", justifyContent: "center",
    },
    balanceCard: {
      backgroundColor: "#1a2019",
      borderRadius: 20,
      padding: 24,
      marginBottom: 28,
      overflow: "hidden",
      position: "relative",
    },
    balanceGlow: {
      position: "absolute", top: -40, right: -40,
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: "#dfff4f",
      opacity: 0.08,
    },
    balanceLabel: { fontSize: 13, color: "#8a9e8a", fontFamily: "Inter_400Regular", marginBottom: 4 },
    balanceAmount: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#f0f5f0", marginBottom: 20 },
    balanceActions: { flexDirection: "row", gap: 10 },
    balanceBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: "#dfff4f",
      paddingHorizontal: 16, paddingVertical: 10,
      borderRadius: 10,
    },
    balanceBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#101315" },
    vipBadge: {
      position: "absolute", top: 16, right: 16,
      backgroundColor: "#dfff4f22",
      borderWidth: 1, borderColor: "#dfff4f44",
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    },
    vipText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#dfff4f", letterSpacing: 1 },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 12 },
    sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    seeAll: { fontSize: 13, color: colors.lime, fontFamily: "Inter_500Medium" },
    servicesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
    serviceItem: { width: "30%", alignItems: "center", gap: 8 },
    serviceIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    serviceLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center" },
    orderRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14, marginBottom: 8,
      borderWidth: 1, borderColor: colors.border,
    },
    orderIcon: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.lime + "22",
      alignItems: "center", justifyContent: "center",
    },
    orderId: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    orderDate: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    orderAmount: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, alignSelf: "flex-end" },
  });
