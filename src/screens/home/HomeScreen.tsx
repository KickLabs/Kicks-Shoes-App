import React, { useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import Banner from "../../components/common/Banner";
import ProductCard from "../../components/common/ProductCard";
import CategorySection from "../../components/common/CategorySection";
import ReviewCard from "../../components/common/ReviewCard";
import { COLORS } from "../../constants/theme";
import { products as mockProducts } from "../../mockData";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";

const bannerProduct = mockProducts[0];
const bannerImages = bannerProduct?.inventory?.[0]?.images || [];

const newProducts = mockProducts
  .filter((p) => p.inventory?.[0]?.images?.[0])
  .slice(0, 4);

const brandMap: { [key: string]: (typeof mockProducts)[0] } = {};
mockProducts.forEach((p) => {
  if (p.inventory?.[0]?.images?.[0] && !brandMap[p.brand as string])
    brandMap[p.brand as string] = p;
});
const categories = (Object.values(brandMap) as typeof mockProducts)
  .slice(0, 2)
  .map((p) => ({
    name: p.brand + " Shoes",
    image: { uri: p.inventory[0].images[0] },
    onPress: () => {},
  }));

const reviews = [
  {
    avatar: { uri: newProducts[0]?.inventory[0]?.images[0] },
    name: newProducts[0]?.name || "Good Quality",
    rating: newProducts[0]?.rating || 5.0,
    content:
      newProducts[0]?.description || "I highly recommend shopping from kicks",
    productImage: { uri: newProducts[0]?.inventory[0]?.images[0] },
  },
];

const HomeScreen = () => {
  const [bannerIdx, setBannerIdx] = useState(0);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleShopNow = () => {};
  const handleBannerThumb = (idx: number) => setBannerIdx(idx);
  const handleCategoryPrev = () => {};
  const handleCategoryNext = () => {};

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ paddingTop: 80 }}>
        {bannerProduct && (
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
          {newProducts.map((p) => (
            <ProductCard
              key={p.sku}
              image={{ uri: p.inventory[0].images[0] }}
              name={p.name!}
              price={`$${p.price.regular}`}
              tag={
                p.isNew
                  ? "New"
                  : p.price.isOnSale
                    ? `${p.price.discountPercent}% off`
                    : undefined
              }
              onPress={() =>
                navigation.navigate("ProductDetails", { productId: p.sku! })
              }
            />
          ))}
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
    </ScrollView>
  );
};

export default HomeScreen;
