import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { MainStackParamList } from "../../types";

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Kicks Shoes</Text>
      </View>

      <View style={styles.categories}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["Running", "Casual", "Sports", "Formal"].map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.categoryItem}
              onPress={() => {
                // Handle category selection
              }}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.featured}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <View style={styles.productGrid}>
          {[1, 2, 3, 4].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.productCard}
              onPress={() => {
                navigation.navigate("ProductDetails", {
                  productId: item.toString(),
                });
              }}
            >
              <View style={styles.productImage} />
              <Text style={styles.productName}>Product {item}</Text>
              <Text style={styles.productPrice}>$99.99</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: SIZES.h1,
    color: COLORS.white,
    fontWeight: "bold",
  },
  categories: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h2,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  categoryItem: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base,
  },
  categoryText: {
    color: COLORS.black,
    fontSize: SIZES.body3,
  },
  featured: {
    padding: SIZES.padding,
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

export default HomeScreen;
