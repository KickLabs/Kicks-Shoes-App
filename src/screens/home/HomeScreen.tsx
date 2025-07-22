import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import Banner from "../../components/common/Banner";
import ProductCard from "../../components/common/ProductCard";
import CategorySection from "../../components/common/CategorySection";
import ReviewCard from "../../components/common/ReviewCard";
import { COLORS } from "../../constants/theme";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/api";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import { Product } from "../../types";
import { formatVND } from "../../utils/currency";
import RoleSwitcher from "../../components/debug/RoleSwitcher";
import NavigationTest from "../../components/debug/NavigationTest";

const HomeScreen = () => {
  type NavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const goToListingScreen = () => {
    navigation.getParent()?.navigate("ListingScreen");
  };

  const [bannerIdx, setBannerIdx] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
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

  const handleShopNow = () => {};
  const handleBannerThumb = (idx: number) => setBannerIdx(idx);
  const handleCategoryPrev = () => {};
  const handleCategoryNext = () => {};

  // Lấy sản phẩm đầu tiên làm banner
  const bannerProduct = products[0];
  // Ưu tiên lấy mainImage, nếu không có thì lấy inventory[0].images[0]
  const bannerImages = bannerProduct
    ? bannerProduct.inventory?.[0]?.images?.length > 0
      ? bannerProduct.inventory[0].images
      : bannerProduct.mainImage
        ? [bannerProduct.mainImage]
        : []
    : [];

  // Lấy 4 sản phẩm mới nhất
  const newProducts = products.slice(0, 4);

  // Lấy brand đại diện cho category
  const brandMap: { [key: string]: Product } = {};
  products.forEach((p) => {
    if (p.inventory?.[0]?.images?.[0] && !brandMap[p.brand as string])
      brandMap[p.brand as string] = p;
  });
  const categories = (Object.values(brandMap) as Product[])
    .slice(0, 2)
    .map((p) => ({
      name: p.brand + " Shoes",
      image: { uri: p.inventory[0].images[0] },
      onPress: () => {},
    }));

  // Dummy reviews
  const reviews = [
    {
      avatar: {
        uri:
          newProducts[0]?.mainImage ||
          newProducts[0]?.inventory?.[0]?.images?.[0],
      },
      name: newProducts[0]?.name || "Good Quality",
      rating: newProducts[0]?.rating || 5.0,
      content:
        newProducts[0]?.description || "I highly recommend shopping from kicks",
      productImage: {
        uri:
          newProducts[0]?.mainImage ||
          newProducts[0]?.inventory?.[0]?.images?.[0],
      },
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={{ flex: 1 }}
    >
      <View style={{ paddingTop: 80 }}>
        {bannerProduct && bannerImages.length > 0 && (
          <Banner
            title="DO IT RIGHT"
            subtitle={`${bannerProduct.brand}\n${bannerProduct.description}`}
            image={{ uri: bannerImages[bannerIdx] }}
            tag="New product of this year"
            onShopNow={handleShopNow}
            thumbnails={bannerImages.map((img) => ({ uri: img }))}
            onThumbnailPress={handleBannerThumb}
            selectedThumbnail={bannerIdx}
          />
        )}
        {/* New Drops */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              maxWidth: "55%",
              marginBottom: 0,
              color: COLORS.black,
              fontSize: 26,
              fontFamily: "Rubik-SemiBold",
            }}
            numberOfLines={2}
          >
            {`Don't miss out\nnew drops`}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.blue,
              borderRadius: 10,
              paddingHorizontal: 24,
              paddingVertical: 12,
              marginLeft: 12,
            }}
            onPress={goToListingScreen}
          >
            <Text
              style={{
                color: COLORS.white,
                fontFamily: "Rubik-Medium",
                fontSize: 15,
                textTransform: "uppercase",
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              NEW DROPS
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: 16,
          }}
        >
          {loading ? (
            <Text>Loading product...</Text>
          ) : error ? (
            <Text style={{ color: "red" }}>{error}</Text>
          ) : (
            newProducts.map((p: Product) => {
              // Lấy giá ưu tiên: discountedPrice > price.regular > price
              const originalPrice =
                p.discountedPrice ||
                (typeof p.price === "object" ? p.price.regular : p.price);
              const formattedPrice = formatVND(originalPrice);

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
                  key={p.id}
                  image={{
                    uri:
                      p.mainImage ||
                      p.images?.[0] ||
                      p.inventory?.[0]?.images?.[0],
                  }}
                  name={p.name}
                  price={formattedPrice}
                  tag={tag}
                  onPress={() =>
                    navigation.navigate("ProductDetails", { productId: p.id })
                  }
                />
              );
            })
          )}
        </View>
        {/* Categories Section */}
        <CategorySection
          categories={categories}
          onPrev={handleCategoryPrev}
          onNext={handleCategoryNext}
        />
        {/* Reviews Section */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Rubik-SemiBold",
              color: COLORS.black,
            }}
          >
            Reviews
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.blue,
              borderRadius: 10,
              paddingHorizontal: 24,
              paddingVertical: 12,
              marginLeft: 12,
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontFamily: "Rubik-Medium",
                fontSize: 15,
                textTransform: "uppercase",
              }}
            >
              SEE ALL
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: 16 }}>
          {reviews.map((review, index) => (
            <ReviewCard key={index} {...review} />
          ))}
        </View>
      </View>

      {/* Debug: Role Switcher for testing */}
      <RoleSwitcher />

      {/* Debug: Navigation Test */}
      <NavigationTest />
    </ScrollView>
  );
};

export default HomeScreen;
