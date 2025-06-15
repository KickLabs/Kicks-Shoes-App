import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

type Product = {
  id: string;
  name: string;
  price: string;
};

type Props = {
  products: Product[];
  onProductPress: (id: string) => void;
};

const FeaturedProducts = ({ products, onProductPress }: Props) => (
  <View style={styles.featured}>
    <Text style={styles.sectionTitle}>Featured Products</Text>
    <View style={styles.productGrid}>
      {products.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.productCard}
          onPress={() => onProductPress(item.id)}
        >
          <View style={styles.productImage} />
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  featured: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h2,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    ...SHADOWS.medium,
  },
  productImage: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
  },
  productName: {
    fontSize: SIZES.body3,
    color: COLORS.black,
    marginBottom: SIZES.base / 2,
  },
  productPrice: {
    fontSize: SIZES.body4,
    color: COLORS.primary,
    fontWeight: "bold",
  },
});

export default FeaturedProducts;
