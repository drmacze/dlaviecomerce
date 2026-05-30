import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { apiGet, apiPost, rupiah } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

type WalletTx = {
  id: string;
  type: string;
  amount: number;
  status: string;
  provider?: string | null;
  created_at: string;
};

type WalletData = {
  d_balance?: number;
  transactions?: WalletTx[];
};

type TopupMethod = {
  id: string;
  label: string;
  min: number;
  fee: number;
};

const AMOUNTS = [20000, 50000, 100000, 200000, 500000];
const TOPUP_METHODS: TopupMethod[] = [
  { id: "midtrans", label: "Transfer Bank / QRIS", min: 10000, fee: 0 },
  { id: "manual", label: "Transfer Manual", min: 10000, fee: 0 },
];

function txTypeLabel(type: string) {
  const map: Record<string, string> = {
    topup: "Top Up",
    purchase: "Pembelian",
    reward: "Reward",
    refund: "Refund",
    debit: "Debit",
  };
  return map[type] || type;
}

function txStatusColor(status: string, colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  if (status === "success") return colors.green;
  if (["failed", "rejected"].includes(status)) return colors.red;
  return colors.orange;
}

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [wallet, setWallet] = useState<WalletData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<TopupMethod>(TOPUP_METHODS[0]);
  const [topping, setTopping] = useState(false);

  const s = styles(colors, insets);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<WalletData>("/wallet");
      setWallet(data);
    } catch {
      setWallet({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleTopup() {
    const parsed = parseInt(amount.replace(/\D/g, ""), 10);
    if (!parsed || parsed < method.min) {
      Alert.alert("Nominal Tidak Valid", `Minimal top up ${rupiah(method.min)}`);
      return;
    }
    setTopping(true);
    try {
      const res = await apiPost<{ payment_url?: string; snap_token?: string; message?: string }>("/wallet/topup-auto", {
        amount: parsed,
        method: method.id,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Top Up Dibuat", res.message || "Silakan selesaikan pembayaran.");
      setAmount("");
      load();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Gagal", err?.message || "Top up gagal. Coba lagi.");
    } finally {
      setTopping(false);
    }
  }

  const balance = wallet.d_balance ?? 0;
  const transactions = wallet.transactions || [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.lime} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Wallet</Text>
      </View>

      {/* Balance Card */}
      <View style={s.balanceCard}>
        <View style={s.balanceGlow} />
        <Text style={s.balanceLabel}>D-Balance</Text>
        {loading ? (
          <ActivityIndicator color={colors.lime} style={{ marginVertical: 8 }} />
        ) : (
          <Text style={s.balanceAmount}>{rupiah(balance)}</Text>
        )}
      </View>

      {/* Top Up Form */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Top Up Saldo</Text>

        {/* Quick amounts */}
        <View style={s.amountsRow}>
          {AMOUNTS.map((a) => (
            <Pressable
              key={a}
              style={[s.amountChip, amount === String(a) && s.amountChipActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAmount(String(a)); }}
            >
              <Text style={[s.amountChipText, amount === String(a) && s.amountChipTextActive]}>
                {a >= 1000 ? `${a / 1000}K` : String(a)}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={s.input}
          placeholder="Atau masukkan nominal lain..."
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
          value={amount ? rupiah(parseInt(amount, 10)) : ""}
          onChangeText={(v) => setAmount(v.replace(/\D/g, ""))}
        />

        {/* Method selector */}
        <View style={s.methodRow}>
          {TOPUP_METHODS.map((m) => (
            <Pressable
              key={m.id}
              style={[s.methodBtn, method.id === m.id && s.methodBtnActive]}
              onPress={() => setMethod(m)}
            >
              <Feather
                name={m.id === "midtrans" ? "credit-card" : "send"}
                size={14}
                color={method.id === m.id ? "#101315" : colors.mutedForeground}
              />
              <Text style={[s.methodText, method.id === m.id && s.methodTextActive]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [s.topupBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleTopup}
          disabled={topping}
        >
          {topping ? (
            <ActivityIndicator color="#101315" />
          ) : (
            <Text style={s.topupBtnText}>Top Up Sekarang</Text>
          )}
        </Pressable>
      </View>

      {/* Transaction History */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Riwayat Transaksi</Text>
        {loading ? (
          <ActivityIndicator color={colors.lime} />
        ) : transactions.length === 0 ? (
          <View style={s.empty}>
            <Feather name="activity" size={32} color={colors.mutedForeground} />
            <Text style={s.emptyText}>Belum ada transaksi</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={s.txRow}>
              <View style={[s.txIcon, {
                backgroundColor: ["topup", "reward", "refund"].includes(tx.type)
                  ? colors.green + "22"
                  : colors.red + "22",
              }]}>
                <Feather
                  name={["topup", "reward", "refund"].includes(tx.type) ? "arrow-down-left" : "arrow-up-right"}
                  size={16}
                  color={["topup", "reward", "refund"].includes(tx.type) ? colors.green : colors.red}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.txType}>{txTypeLabel(tx.type)}</Text>
                {tx.provider && <Text style={s.txProvider}>{tx.provider}</Text>}
                <Text style={s.txDate}>{new Date(tx.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[s.txAmount, {
                  color: ["topup", "reward", "refund"].includes(tx.type) ? colors.green : colors.red,
                }]}>
                  {["topup", "reward", "refund"].includes(tx.type) ? "+" : "-"}{rupiah(tx.amount)}
                </Text>
                <Text style={[s.txStatus, { color: txStatusColor(tx.status, colors) }]}>
                  {tx.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
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
      paddingBottom: 8,
    },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground },
    balanceCard: {
      margin: 16,
      backgroundColor: "#1a2019",
      borderRadius: 20,
      padding: 24,
      overflow: "hidden",
      position: "relative",
    },
    balanceGlow: {
      position: "absolute", top: -40, right: -40,
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: "#35cf72",
      opacity: 0.08,
    },
    balanceLabel: { fontSize: 13, color: "#8a9e8a", fontFamily: "Inter_400Regular", marginBottom: 4 },
    balanceAmount: { fontSize: 34, fontFamily: "Inter_700Bold", color: "#f0f5f0" },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 14 },
    amountsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    amountChip: {
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
    },
    amountChipActive: { backgroundColor: colors.lime, borderColor: colors.lime },
    amountChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    amountChipTextActive: { color: "#101315" },
    input: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 15, color: colors.foreground,
      fontFamily: "Inter_400Regular",
      marginBottom: 12,
    },
    methodRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
    methodBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", gap: 6,
      paddingHorizontal: 10, paddingVertical: 10,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
    },
    methodBtnActive: { backgroundColor: colors.lime, borderColor: colors.lime },
    methodText: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, flex: 1 },
    methodTextActive: { color: "#101315" },
    topupBtn: {
      backgroundColor: colors.lime,
      borderRadius: colors.radius,
      paddingVertical: 16, alignItems: "center",
    },
    topupBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#101315" },
    txRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      marginBottom: 10,
    },
    txIcon: {
      width: 38, height: 38, borderRadius: 12,
      alignItems: "center", justifyContent: "center",
    },
    txType: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    txProvider: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 },
    txDate: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 },
    txAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
    txStatus: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
    empty: { alignItems: "center", paddingVertical: 32, gap: 10 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
  });
