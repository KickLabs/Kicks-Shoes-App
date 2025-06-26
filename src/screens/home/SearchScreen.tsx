import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ShareInput from "@/components/common/input/share.input";
import ProductCard from "@/components/common/ProductCard";
import { useNavigation } from "@react-navigation/native";
import * as mockData from "@/mockData";
import { COLORS } from "@/constants/theme";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/types/navigation";

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [keyword, setKeyword] = useState("");

  const filteredProducts = mockData.products.filter(
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.resultsContainer}
      >
        {filteredProducts.length === 0 ? (
          <Text style={styles.noResult}>No products found.</Text>
        ) : (
          <View style={styles.productsWrap}>
            {filteredProducts.map((p) => (
              <ProductCard
                key={String(p.sku)}
                image={{
                  uri: String(
                    p.mainImage || p.inventory?.[0]?.images?.[0] || ""
                  ),
                }}
                name={String(p.name || "")}
                price={`$${p.price.regular}`}
                tag={
                  p.isNew
                    ? "New"
                    : p.price.isOnSale
                      ? `${p.price.discountPercent}% off`
                      : undefined
                }
                onPress={() =>
                  navigation.navigate("ProductDetails", {
                    productId: String(p.sku),
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
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
