import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
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

type PpobProduct = {
  id?: string;
  sku_code?: string;
  code?: string;
  product_name?: string;
  name?: string;
  category: string;
  brand?: string;
  selling_price?: number;
  price?: number;
  status?: string;
};

type Category = { key: string; label: string; icon: keyof typeof import("@expo/vector-icons/Feather").glyphMap };

const CATEGORIES: Category[] = [
  { key: "all", label: "Semua", icon: "grid" },
  { key: "pulsa", label: "Pulsa", icon: "phone" },
  { key: "data", label: "Data", icon: "wifi" },
  { key: "pln", label: "PLN", icon: "zap" },
  { key: "game", label: "Game", icon: "monitor" },
  { key: "voucher", label: "Voucher", icon: "gift" },
];

function productPrice(p: PpobProduct) {
  return p.selling_price ?? p.price ?? 0;
}
function productName(p: PpobProduct) {
  return p.product_name ?? p.name ?? "Produk";
}
function productCode(p: PpobProduct) {
  return p.sku_code ?? p.code ?? "";
}

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState("");
  const [selected, setSelected] = useState<PpobProduct | null>(null);
  const [ordering, setOrdering] = useState(false);

  const s = styles(colors, insets);

  const load = useCallback(async (cat = category) => {
    try {
      const path = cat === "all" ? "/ppob-products" : `/ppob-products?type=${cat}`;
      const data = await apiGet<{ products?: PpobProduct[]; data?: PpobProduct[] }>(path);
      setProducts(data.products ?? (data as any).data ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => { load(category); }, [category]);

  const filtered = products.filter((p) =>
    !search || productName(p).toLowerCase().includes(search.toLowerCase())
  );

  async function handleOrder() {
    if (!selected || !target.trim()) {
      Alert.alert("Lengkapi Data", "Pilih produk dan masukkan nomor tujuan.");
      return;
    }
    setOrdering(true);
    try {
      await apiPost("/ppob-order", {
        sku_code: productCode(selected),
        target: target.trim(),
        product_name: productName(selected),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Berhasil!", "Order PPOB berhasil dibuat. Cek halaman Orders.");
      setSelected(null);
      setTarget("");
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Gagal", err?.message || "Order gagal. Coba lagi.");
    } finally {
      setOrdering(false);
    }
  }

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Produk Digital</Text>
        <View style={s.searchBar}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="Cari produk..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catList}
        style={{ maxHeight: 52 }}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            style={[s.catChip, category === cat.key && s.catChipActive]}
            onPress={() => { setCategory(cat.key); setSearch(""); }}
          >
            <Feather name={cat.icon} size={14} color={category === cat.key ? "#101315" : colors.mutedForeground} />
            <Text style={[s.catLabel, category === cat.key && s.catLabelActive]}>{cat.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Selected product order form */}
      {selected && (
        <View style={s.orderForm}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={s.selectedName} numberOfLines={1}>{productName(selected)}</Text>
            <Pressable onPress={() => setSelected(null)}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <Text style={s.selectedPrice}>{rupiah(productPrice(selected))}</Text>
          <TextInput
            style={s.targetInput}
            placeholder="Nomor tujuan / ID"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="default"
            value={target}
            onChangeText={setTarget}
          />
          <Pressable
            style={({ pressed }) => [s.orderBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleOrder}
            disabled={ordering}
          >
            {ordering ? (
              <ActivityIndicator color="#101315" />
            ) : (
              <Text style={s.orderBtnText}>Beli Sekarang</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Products list */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.lime} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => productCode(item) || String(i)}
          contentContainerStyle={s.list}
          scrollEnabled={!!filtered.length}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(category); }} tintColor={colors.lime} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Feather name="package" size={40} color={colors.mutedForeground} />
              <Text style={s.emptyText}>Tidak ada produk ditemukan</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                s.productCard,
                selected && productCode(selected) === productCode(item) && s.productCardSelected,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelected(item);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.productName} numberOfLines={2}>{productName(item)}</Text>
                {item.brand && <Text style={s.productBrand}>{item.brand}</Text>}
              </View>
              <Text style={s.productPrice}>{rupiah(productPrice(item))}</Text>
            </Pressable>
          )}
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
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 12 },
    searchBar: {
      flexDirection: "row", alignItems: "center", gap: 10,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      paddingHorizontal: 14, paddingVertical: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.foreground, fontFamily: "Inter_400Regular" },
    catList: { paddingHorizontal: 20, gap: 8, paddingVertical: 8 },
    catChip: {
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
    },
    catChipActive: { backgroundColor: colors.lime, borderColor: colors.lime },
    catLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    catLabelActive: { color: "#101315" },
    orderForm: {
      margin: 16,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16, gap: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    selectedName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, flex: 1 },
    selectedPrice: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.lime },
    targetInput: {
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 14, color: colors.foreground,
      fontFamily: "Inter_400Regular",
      borderWidth: 1, borderColor: colors.border,
    },
    orderBtn: {
      backgroundColor: colors.lime,
      borderRadius: colors.radius,
      paddingVertical: 14, alignItems: "center",
    },
    orderBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#101315" },
    list: {
      paddingHorizontal: 16, paddingTop: 8,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
      gap: 8,
    },
    productCard: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14, gap: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    productCardSelected: { borderColor: colors.lime, borderWidth: 2 },
    productName: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    productBrand: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    productPrice: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
  });
