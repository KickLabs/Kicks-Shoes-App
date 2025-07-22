import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ShareInput from "@/components/common/input/share.input";
import ProductCard from "@/components/common/ProductCard";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "@/constants/theme";
import { StackNavigationProp } from "@/types/navigation";
import { RootStackParamList } from "@/types/navigation";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/constants/api";
import { formatVND } from "@/utils/currency";

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.PRODUCTS);
        setProducts(res.data.data?.products || res.data.products || []);
      } catch (err: any) {
        setError(err.message || "Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) => p.name && p.name.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <ShareInput
            title={undefined}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.blue}
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
          {error}
        </Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.resultsContainer}
        >
          {filteredProducts.length === 0 ? (
            <Text style={styles.noResult}>No products found.</Text>
          ) : (
            <View style={styles.productsWrap}>
              {filteredProducts.map((p) => {
                // Tính toán tag hiển thị
                let tag = undefined;
                if (p.isNew) {
                  tag = "New";
                } else if (
                  typeof p.price === "object" &&
                  p.price.isOnSale &&
                  p.price.discountPercent
                ) {
                  tag = `${p.price.discountPercent}% off`;
                }

                return (
                  <ProductCard
                    key={String(p.id)}
                    image={{
                      uri: String(
                        p.mainImage || p.inventory?.[0]?.images?.[0] || ""
                      ),
                    }}
                    name={String(p.name || "")}
                    price={formatVND(
                      p.discountedPrice ||
                        (typeof p.price === "object"
                          ? p.price.regular
                          : p.price)
                    )}
                    tag={tag}
                    onPress={() =>
                      navigation.navigate("ProductDetails", {
                        productId: String(p.id),
                      })
                    }
                  />
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrap: {
    flex: 1,
    marginLeft: 12,
  },
  resultsContainer: {
    padding: 16,
  },
  productsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  noResult: {
    textAlign: "center",
    color: COLORS.gray,
    marginTop: 40,
    fontSize: 16,
  },
});

export default SearchScreen;
