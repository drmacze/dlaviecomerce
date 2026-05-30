import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { apiGet, rupiah } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

type Order = {
  id: string;
  public_order_id?: string;
  status: string;
  amount: number;
  created_at: string;
  product_name?: string;
  target?: string;
  buyer_email?: string;
};

function statusLabel(status: string) {
  const map: Record<string, string> = {
    success: "Berhasil",
    fulfilled: "Selesai",
    paid: "Dibayar",
    pending: "Diproses",
    pending_fulfillment: "Diproses",
    failed: "Gagal",
    cancelled: "Dibatalkan",
    rejected: "Ditolak",
  };
  return map[status] || status;
}

function statusColor(status: string, colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  if (["success", "fulfilled", "paid"].includes(status)) return colors.green;
  if (["failed", "cancelled", "rejected"].includes(status)) return colors.red;
  return colors.orange;
}

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"ppob" | "digital">("ppob");
  const [ppobOrders, setPpobOrders] = useState<Order[]>([]);
  const [digitalOrders, setDigitalOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const s = styles(colors, insets);

  const load = useCallback(async () => {
    try {
      const [ppob, digital] = await Promise.allSettled([
        apiGet<{ orders: Order[] }>("/ppob/orders"),
        apiGet<{ orders: Order[] }>("/orders/my"),
      ]);
      if (ppob.status === "fulfilled") setPpobOrders(ppob.value.orders || []);
      if (digital.status === "fulfilled") setDigitalOrders(digital.value.orders || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const data = tab === "ppob" ? ppobOrders : digitalOrders;

  const renderItem = ({ item }: { item: Order }) => (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <View style={[s.statusDot, { backgroundColor: statusColor(item.status, colors) }]} />
        <View style={{ flex: 1 }}>
          <Text style={s.orderId} numberOfLines={1}>
            {item.public_order_id || item.id.slice(0, 16) + "…"}
          </Text>
          {item.product_name && (
            <Text style={s.productName} numberOfLines={1}>{item.product_name}</Text>
          )}
          {item.target && (
            <Text style={s.targetText} numberOfLines={1}>{item.target}</Text>
          )}
          <Text style={s.dateText}>{new Date(item.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.amount}>{rupiah(item.amount)}</Text>
        <View style={[s.statusBadge, { backgroundColor: statusColor(item.status, colors) + "22" }]}>
          <Text style={[s.statusText, { color: statusColor(item.status, colors) }]}>
            {statusLabel(item.status)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Riwayat Order</Text>
        <View style={s.tabs}>
          <Pressable
            style={[s.tabBtn, tab === "ppob" && s.tabBtnActive]}
            onPress={() => setTab("ppob")}
          >
            <Text style={[s.tabLabel, tab === "ppob" && s.tabLabelActive]}>PPOB</Text>
          </Pressable>
          <Pressable
            style={[s.tabBtn, tab === "digital" && s.tabBtnActive]}
            onPress={() => setTab("digital")}
          >
            <Text style={[s.tabLabel, tab === "digital" && s.tabLabelActive]}>Digital</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.lime} size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          scrollEnabled={!!data.length}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.lime} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Feather name="inbox" size={40} color={colors.mutedForeground} />
              <Text style={s.emptyText}>Belum ada order</Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof import("@/hooks/useColors").useColors>, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 14 },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 4,
    },
    tabBtn: {
      flex: 1, paddingVertical: 8,
      borderRadius: colors.radius - 4,
      alignItems: "center",
    },
    tabBtnActive: { backgroundColor: colors.card },
    tabLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    tabLabelActive: { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    list: {
      paddingHorizontal: 16, paddingTop: 12,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
      gap: 10,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      borderWidth: 1, borderColor: colors.border,
    },
    cardLeft: { flexDirection: "row", gap: 12, flex: 1, marginRight: 12 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
    orderId: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    productName: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    targetText: { fontSize: 12, color: colors.blue, fontFamily: "Inter_400Regular", marginTop: 2 },
    dateText: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 4 },
    amount: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground },
    statusBadge: {
      borderRadius: 999,
      paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
    },
    statusText: { fontSize: 11, fontFamily: "Inter_500Medium" },
    empty: { alignItems: "center", paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
  });
