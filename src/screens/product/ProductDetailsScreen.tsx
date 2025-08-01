import React, { useEffect, useState } from "react";
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
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation.d";
import ProductCard from "../../components/common/ProductCard";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/api";
import { API_BASE_URL } from "../../constants/config";
import { formatVND } from "../../utils/currency";
import cartService from "../../services/cart";
import { wishlistService } from "../../services/wishlist";

const ProductDetailsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, "ProductDetails">>();
  const productId = route.params?.productId;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [product, setProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [favourite, setFavourite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(
          `${API_ENDPOINTS.PRODUCT_DETAILS(productId)}`
        );
        const prod = (res.data as any).data || (res.data as any);
        setProduct(prod);
        setSelectedColor(
          prod.variants?.colors?.[0] || prod.inventory?.[0]?.color || ""
        );
        setSelectedSize(
          prod.variants?.sizes?.[0] || prod.inventory?.[0]?.size || ""
        );
        setSelectedImage(prod.inventory?.[0]?.images?.[0] || "");

        // Check if product is in wishlist
        checkWishlistStatus();
      } catch (err: any) {
        setError(err.message || "Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const checkWishlistStatus = async () => {
    try {
      const wishlistItems = await wishlistService.getWishlist();
      const isInWishlist = wishlistItems.some(
        (item: any) =>
          item.product?.id === productId || item.product?._id === productId
      );
      setFavourite(isInWishlist);
    } catch (error) {
      // Silently fail - wishlist status is not critical
      console.log("Error checking wishlist status:", error);
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) return;

      try {
        const res = await api.get(API_ENDPOINTS.PRODUCTS);
        const all =
          (res.data as any).data?.products || (res.data as any).products || [];
        setRecommendations(
          all
            .filter(
              (p: any) => p.id !== productId && p.inventory?.[0]?.images?.[0]
            )
            .slice(0, 4)
        );
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };
    fetchRecommendations();
  }, [productId]);

  if (!productId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Product ID is missing</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error || !product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>
          {error || "Không tìm thấy sản phẩm"}
        </Text>
      </View>
    );
  }

  const images =
    product?.inventory?.find((item: any) => item.color === selectedColor)
      ?.images ||
    product?.inventory?.[0]?.images ||
    [];

  const unavailableSizes =
    product?.inventory
      ?.filter((item: any) => !item.isAvailable || item.quantity === 0)
      ?.map((item: any) => item.size.toString()) || [];

  const getPrice = () => {
    return {
      regular: product.price?.regular,
      discounted:
        product.discountedPrice ||
        (product.price?.isOnSale
          ? product.price.regular * (1 - product.price.discountPercent / 100)
          : null),
    };
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      Alert.alert("Lỗi", "Vui lòng chọn kích cỡ và màu sắc");
      return;
    }

    const selectedVariant = product?.inventory?.find(
      (item: any) => item.size === selectedSize && item.color === selectedColor
    );

    if (
      !selectedVariant ||
      !selectedVariant.isAvailable ||
      selectedVariant.quantity === 0
    ) {
      Alert.alert("Lỗi", "Sản phẩm không có sẵn với lựa chọn này");
      return;
    }

    try {
      setAddingToCart(true);
      const price = getPrice().discounted || getPrice().regular;

      // Get image for selected color
      const selectedColorImage = images[imageIndex] || selectedImage;

      await cartService.addToCart(
        productId,
        1,
        selectedSize,
        selectedColor,
        price,
        selectedColorImage
      );
      Alert.alert("Success", "Add product to cart successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Cannot add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize || !selectedColor) {
      Alert.alert("Error", "Please select a size and color");
      return;
    }

    const selectedVariant = product?.inventory?.find(
      (item: any) => item.size === selectedSize && item.color === selectedColor
    );

    if (
      !selectedVariant ||
      !selectedVariant.isAvailable ||
      selectedVariant.quantity === 0
    ) {
      Alert.alert("Error", "Product is not available with this selection");
      return;
    }

    try {
      setAddingToCart(true);
      const price = getPrice().discounted || getPrice().regular;

      // Get image for selected color
      const selectedColorImage = images[imageIndex] || selectedImage;

      await cartService.addToCart(
        productId,
        1,
        selectedSize,
        selectedColor,
        price,
        selectedColorImage
      );
      // Navigate to cart screen
      (navigation as any).navigate("Cart");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Cannot add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!productId) {
      Alert.alert("Error", "Can not find product");
      return;
    }

    try {
      setAddingToWishlist(true);

      if (favourite) {
        await wishlistService.removeFromWishlist(productId);
        setFavourite(false);
        Alert.alert("Success", "Removed from wishlist");
      } else {
        await wishlistService.addToWishlist(productId);
        setFavourite(true);
        Alert.alert("Success", "Added to wishlist");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Cannot update wishlist status");
    } finally {
      setAddingToWishlist(false);
    }
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
                onPress={() => Alert.alert("Share", "Share this product!")}
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
              {images.map((_: any, idx: number) => (
                <View
                  key={idx}
                  style={[styles.dot, imageIndex === idx && styles.activeDot]}
                />
              ))}
            </View>
          </View>
          <View style={styles.thumbnailContainerNew}>
            {images.map((img: string, idx: number) => (
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
            {(product?.isNew ||
              (product?.tags && product?.tags.length > 0)) && (
              <View style={styles.tagBox}>
                <Text style={styles.tagText}>
                  {product?.isNew ? "New Release" : product?.tags?.[0]}
                </Text>
              </View>
            )}
            <Text style={styles.productName}>
              {(product?.name || "").toUpperCase()}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>
                {getPrice().discounted
                  ? formatVND(getPrice().discounted)
                  : formatVND(getPrice().regular)}
              </Text>
              {getPrice().discounted && (
                <Text style={styles.originalPrice}>
                  {formatVND(getPrice().regular)}
                </Text>
              )}
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitleNew}>Color</Text>
            </View>
            <View style={styles.colorContainerNew}>
              {(product?.variants?.colors || []).map((color: string) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color.toLowerCase() },
                    selectedColor === color && styles.selectedColorCircle,
                  ]}
                  onPress={() => {
                    setSelectedColor(color);
                    const newVariant = product?.inventory?.find(
                      (item: any) => item.color === color
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
              {(product?.variants?.sizes || []).map((size: string) => (
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
                style={[
                  styles.addToCartButtonNew,
                  addingToCart && styles.disabledButton,
                ]}
                onPress={handleAddToCart}
                disabled={addingToCart}
              >
                <Text style={styles.addToCartTextNew}>
                  {addingToCart ? "ĐANG THÊM..." : "ADD TO CART"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.heartButton,
                  addingToWishlist && styles.disabledButton,
                ]}
                onPress={handleToggleWishlist}
                disabled={addingToWishlist}
              >
                <Ionicons
                  name={favourite ? "heart" : "heart-outline"}
                  size={24}
                  color={favourite ? COLORS.error : COLORS.white}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.buyNowButton,
                addingToCart && styles.disabledButton,
              ]}
              onPress={handleBuyNow}
              disabled={addingToCart}
            >
              <Text style={styles.buyNowText}>
                {addingToCart ? "ĐANG XỬ LÝ..." : "BUY IT NOW"}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitleNew, { marginTop: 32 }]}>
              ABOUT THE PRODUCT
            </Text>
            <Text style={styles.productDesc}>{product?.description}</Text>

            {/* You May Also Like Section - styled like HomeScreen */}
            <View style={styles.mayAlsoLikeSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderTitle}>You May Also Like</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllButtonText}>SEE ALL</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recommendationsGrid}>
                {recommendations.map((item) => (
                  <ProductCard
                    key={item.id}
                    image={{ uri: item.inventory[0]?.images[0] || "" }}
                    name={item.name || ""}
                    price={formatVND(
                      item.discountedPrice || item.price?.regular || item.price
                    )}
                    tag={
                      item.isNew
                        ? "New"
                        : item.discountedPrice
                          ? "Sale"
                          : undefined
                    }
                    onPress={() =>
                      navigation.navigate("ProductDetails", {
                        productId: item.id,
                      })
                    }
                  />
                ))}
              </View>
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: "Rubik-Bold",
    fontSize: 22,
    color: COLORS.blue,
    marginRight: 8,
  },
  originalPrice: {
    fontFamily: "Rubik-Medium",
    fontSize: 18,
    color: COLORS.gray,
    textDecorationLine: "line-through",
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
    fontSize: 24,
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
  mayAlsoLikeSection: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 24,
    fontFamily: "Rubik-SemiBold",
    color: COLORS.black,
  },
  seeAllButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  seeAllButtonText: {
    color: COLORS.white,
    fontFamily: "Rubik-Medium",
    fontSize: 15,
    textTransform: "uppercase",
  },
  recommendationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  disabledButton: {
    opacity: 0.6,
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
