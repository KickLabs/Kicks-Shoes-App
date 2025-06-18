import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { COLORS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/layout/Header";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { products as mockProducts } from "../../mockData";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";

const ProductDetailsScreen = () => {
  const route =
    useRoute<RouteProp<{ params: { productId: string } }, "params">>();
  const productId = route.params?.productId;
  const product =
    mockProducts.find((p) => p.sku === productId) || mockProducts[0];
  const recommendations = mockProducts
    .filter((p) => p.sku !== product.sku && p.inventory?.[0]?.images?.[0])
    .slice(0, 4);
  const [selectedImage, setSelectedImage] = useState(
    product.inventory?.[0]?.images?.[0] || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    product.variants?.colors?.[0] || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    product.variants?.sizes?.[0] || ""
  );
  const [favourite, setFavourite] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const unavailableSizes = product.inventory
    .filter((item) => !item.isAvailable || item.quantity === 0)
    .map((item) => item.size.toString());

  const getPrice = () => {
    return {
      regular: product.price.regular,
      discounted: product.price.isOnSale
        ? product.price.regular * (1 - product.price.discountPercent / 100)
        : null,
    };
  };

  const handleAddToCart = () => {
    const selectedVariant = product.inventory.find(
      (item) => item.size === selectedSize && item.color === selectedColor
    );

    if (
      !selectedVariant ||
      !selectedVariant.isAvailable ||
      selectedVariant.quantity === 0
    ) {
      Alert.alert("Error", "Selected variant is not available");
      return;
    }

    // TODO: Thêm vào giỏ hàng
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ paddingTop: 90 }}></View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginLeft: 8, alignSelf: "flex-start", zIndex: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color="#232321" />
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: selectedImage }}
          style={styles.image}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setFavourite(!favourite)}
        >
          <Ionicons
            name={favourite ? "heart" : "heart-outline"}
            size={24}
            color={favourite ? COLORS.error : COLORS.black}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.thumbnailContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={
            product.inventory.find((item) => item.color === selectedColor)
              ?.images || []
          }
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.thumbnailButton,
                selectedImage === item && styles.selectedThumbnail,
              ]}
              onPress={() => setSelectedImage(item)}
            >
              <Image source={{ uri: item }} style={styles.thumbnail} />
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${getPrice().regular}</Text>
          {getPrice().discounted && (
            <Text style={styles.discountedPrice}>
              ${getPrice().discounted!.toFixed(2)}
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Select Color</Text>
        <View style={styles.colorContainer}>
          {product.variants.colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color.toLowerCase() },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => {
                setSelectedColor(color);
                const newVariant = product.inventory.find(
                  (item) => item.color === color
                );
                if (newVariant) {
                  setSelectedImage(newVariant.images[0]);
                }
              }}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Select Size</Text>
        <View style={styles.sizeContainer}>
          {product.variants.sizes.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeButton,
                selectedSize === size && styles.selectedSize,
                unavailableSizes.includes(size.toString()) &&
                  styles.unavailableSize,
              ]}
              onPress={() =>
                !unavailableSizes.includes(size.toString()) &&
                setSelectedSize(size)
              }
              disabled={unavailableSizes.includes(size.toString())}
            >
              <Text
                style={[
                  styles.sizeText,
                  selectedSize === size && styles.selectedSizeText,
                  unavailableSizes.includes(size.toString()) &&
                    styles.unavailableSizeText,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          You May Also Like
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={recommendations}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recommendationCard}
              onPress={() =>
                navigation.replace("ProductDetails", { id: item.sku! })
              }
            >
              <Image
                source={{ uri: item.inventory[0].images[0] }}
                style={styles.recommendationImage}
              />
              <Text style={styles.recommendationName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.recommendationPrice}>
                ${item.price.regular}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  thumbnailContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  thumbnailButton: {
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedThumbnail: {
    borderColor: COLORS.primary,
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  detailsContainer: {
    padding: 15,
  },
  brand: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 5,
    fontFamily: "Rubik-Regular",
  },
  name: {
    fontSize: 24,
    color: COLORS.black,
    marginBottom: 10,
    fontFamily: "Rubik-Bold",
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 15,
    lineHeight: 20,
    fontFamily: "Rubik-Regular",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  price: {
    fontSize: 24,
    color: COLORS.black,
    fontFamily: "Rubik-Bold",
    marginRight: 10,
  },
  discountedPrice: {
    fontSize: 20,
    color: COLORS.gray,
    textDecorationLine: "line-through",
    fontFamily: "Rubik-Regular",
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.black,
    marginBottom: 10,
    fontFamily: "Rubik-Medium",
  },
  colorContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  sizeButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
  },
  selectedSize: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unavailableSize: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.lightGray,
  },
  sizeText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: "Rubik-Regular",
  },
  selectedSizeText: {
    color: COLORS.white,
  },
  unavailableSizeText: {
    color: COLORS.gray,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: "Rubik-Medium",
  },
  recommendationCard: {
    width: 150,
    marginRight: 15,
  },
  recommendationImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  recommendationName: {
    fontSize: 14,
    color: COLORS.black,
    marginTop: 5,
    fontFamily: "Rubik-Regular",
  },
  recommendationPrice: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 5,
    fontFamily: "Rubik-Medium",
  },
});

export default ProductDetailsScreen;
