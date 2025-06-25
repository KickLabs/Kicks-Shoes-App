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
import ProductCard from "../../components/common/ProductCard";

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
  const [imageIndex, setImageIndex] = useState(0);
  const images =
    product.inventory.find((item) => item.color === selectedColor)?.images ||
    [];

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
    <>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.container}
      >
        <View style={{ paddingTop: Platform.OS === "ios" ? 110 : 90 }}>
          <View style={styles.mainImageWrapper}>
            <View style={styles.topButtonsRow}>
              <TouchableOpacity
                style={styles.backButtonOverlay}
                onPress={() => navigation.goBack()}
              >
                <Ionicons
                  name="arrow-back"
                  size={35}
                  color="#232321"
                  style={styles.iconWithStroke}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButtonOverlay}
                onPress={() => Alert.alert("Share", "Chia sẻ sản phẩm!")}
              >
                <Ionicons
                  name="arrow-redo-outline"
                  size={35}
                  color="#232321"
                  style={styles.iconWithStroke}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.mainImageBox}>
              <Image
                source={{ uri: images[imageIndex] || selectedImage }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.sliderDots}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, imageIndex === idx && styles.activeDot]}
                />
              ))}
            </View>
          </View>
          <View style={styles.thumbnailContainerNew}>
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.thumbnailButtonNew,
                  imageIndex === idx && styles.selectedThumbnailNew,
                ]}
                onPress={() => {
                  setImageIndex(idx);
                  setSelectedImage(img);
                }}
              >
                <Image source={{ uri: img }} style={styles.thumbnailNew} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.detailsContainerNew}>
            {(product.isNew || (product.tags && product.tags.length > 0)) && (
              <View style={styles.tagBox}>
                <Text style={styles.tagText}>
                  {product.isNew ? "New Release" : product.tags[0]}
                </Text>
              </View>
            )}
            <Text style={styles.productName}>
              {(product.name || "").toUpperCase()}
            </Text>
            <Text style={styles.productPrice}>${getPrice().regular}</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitleNew}>Color</Text>
            </View>
            <View style={styles.colorContainerNew}>
              {product.variants.colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color.toLowerCase() },
                    selectedColor === color && styles.selectedColorCircle,
                  ]}
                  onPress={() => {
                    setSelectedColor(color);
                    const newVariant = product.inventory.find(
                      (item) => item.color === color
                    );
                    if (newVariant) {
                      setSelectedImage(newVariant.images[0]);
                      setImageIndex(0);
                    }
                  }}
                />
              ))}
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitleNew}>Size</Text>
              <TouchableOpacity>
                <Text style={styles.sizeChart}>SIZE CHART</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sizeContainerNew}>
              {product.variants.sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeBox,
                    selectedSize === size && styles.selectedSizeBox,
                    unavailableSizes.includes(size.toString()) &&
                      styles.unavailableSizeBox,
                  ]}
                  onPress={() =>
                    !unavailableSizes.includes(size.toString()) &&
                    setSelectedSize(size)
                  }
                  disabled={unavailableSizes.includes(size.toString())}
                >
                  <Text
                    style={[
                      styles.sizeTextNew,
                      selectedSize === size && styles.selectedSizeTextNew,
                      unavailableSizes.includes(size.toString()) &&
                        styles.unavailableSizeTextNew,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.addToCartButtonNew}
                onPress={handleAddToCart}
              >
                <Text style={styles.addToCartTextNew}>ADD TO CART</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => setFavourite(!favourite)}
              >
                <Ionicons
                  name={favourite ? "heart" : "heart-outline"}
                  size={24}
                  color={favourite ? COLORS.error : COLORS.white}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.buyNowButton}>
              <Text style={styles.buyNowText}>BUY IT NOW</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitleNew, { marginTop: 32 }]}>
              ABOUT THE PRODUCT
            </Text>
            <Text style={styles.productDesc}>{product.description}</Text>
            <Text style={[styles.sectionTitleNew, { marginTop: 24 }]}>
              You May Also Like
            </Text>
            <View style={styles.recommendationsGrid}>
              {recommendations.map((item) => (
                <ProductCard
                  key={item.sku}
                  image={{ uri: item.inventory[0]?.images[0] || "" }}
                  name={item.name || ""}
                  price={item.price.regular.toString()}
                  onPress={() =>
                    navigation.replace("ProductDetails", {
                      productId: item.sku!,
                    })
                  }
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e7e7e3" },
  mainImageWrapper: { alignItems: "center", paddingTop: 70 },
  mainImageBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    width: "95%",
    alignSelf: "center",
    height: 420,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  mainImage: {
    width: "100%",
    height: 380,
    borderRadius: 12,
    resizeMode: "contain",
  },
  sliderDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 2,
  },
  activeDot: { backgroundColor: "#4A69E2" },
  thumbnailContainerNew: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 8,
    marginLeft: 24,
  },
  thumbnailButtonNew: {
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  selectedThumbnailNew: { borderColor: "#4A69E2" },
  thumbnailNew: { width: 48, height: 48, borderRadius: 8 },
  detailsContainerNew: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    marginHorizontal: 12,
    padding: 18,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tagBox: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 8,
  },
  tagText: { color: COLORS.white, fontFamily: "Rubik-Medium", fontSize: 13 },
  productName: {
    fontFamily: "Rubik-Bold",
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  productPrice: {
    fontFamily: "Rubik-Bold",
    fontSize: 22,
    color: COLORS.blue,
    marginBottom: 8,
  },
  productDesc: {
    fontFamily: "Rubik-Regular",
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionTitleNew: {
    fontFamily: "Rubik-Medium",
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  colorContainerNew: { flexDirection: "row", marginBottom: 16 },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.gray,
    marginRight: 12,
  },
  selectedColorCircle: { borderColor: "#4A69E2", borderWidth: 3 },
  sizeContainerNew: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  sizeBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  selectedSizeBox: { borderColor: "#4A69E2", backgroundColor: "#4A69E2" },
  unavailableSizeBox: { backgroundColor: "#D2D1D3", borderColor: "#D2D1D3" },
  sizeTextNew: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: "Rubik-Regular",
  },
  selectedSizeTextNew: { color: COLORS.white, fontFamily: "Rubik-Bold" },
  unavailableSizeTextNew: { color: COLORS.gray },
  sizeChart: {
    color: COLORS.gray,
    fontSize: 13,
    fontFamily: "Rubik-Medium",
    textDecorationLine: "underline",
  },
  actionRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  addToCartButtonNew: {
    flex: 1,
    backgroundColor: COLORS.black,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 8,
    height: 56,
    justifyContent: "center",
  },
  addToCartTextNew: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: "Rubik-Medium",
  },
  heartButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.black,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  buyNowButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  buyNowText: { color: COLORS.white, fontSize: 16, fontFamily: "Rubik-Medium" },
  recommendationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  topButtonsRow: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButtonOverlay: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 23,
    padding: 4,
  },
  shareButtonOverlay: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 23,
    padding: 4,
  },
  iconWithStroke: {
    textShadowColor: "#232321",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
});

export default ProductDetailsScreen;
