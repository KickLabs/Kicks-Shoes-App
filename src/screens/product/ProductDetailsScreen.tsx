import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { COLORS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/layout/Header";
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { products as mockProducts } from '../../mockData';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

const ProductDetailsScreen = () => {
  const route = useRoute<RouteProp<{ params: { productId: number } }, 'params'>>();
  const productId = route.params?.productId;
  const product = mockProducts.find(p => String(p.id) === String(productId)) || mockProducts[0];
  const recommendations = mockProducts.filter(p => p.id !== product.id).slice(0, 4);
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.variants.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.variants.sizes[0]);
  const [favourite, setFavourite] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Xác định size nào không khả dụng (ví dụ: size lẻ, hoặc size nào đó tuỳ ý, ở đây demo cho size 39, 40)
  const unavailableSizes = ["39", "40"];

  const getPrice = (p: any) => typeof p.price === 'object' ? p.price.regular : p.price;

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <Header />
      <ScrollView style={styles.container}>
        {/* Ảnh sản phẩm */}
        <View style={styles.imageGalleryBox}>
          <View style={styles.imageLargeBox}>
            <Image source={{ uri: selectedImage }} style={styles.mainImage} resizeMode="contain" />
            <View style={styles.imageIndicatorRow}>
              {product.images.map((img: string, idx: number) => (
                <View
                  key={idx}
                  style={[styles.imageIndicatorDot, selectedImage === img && styles.imageIndicatorDotActive]}
                />
              ))}
            </View>
          </View>
          <View style={styles.thumbnailRowGallery}>
            {product.images.map((img: string, idx: number) => (
              <TouchableOpacity key={idx} onPress={() => setSelectedImage(img)}>
                <Image source={{ uri: img }} style={[styles.thumbnailGallery, selectedImage === img && styles.selectedThumbGallery]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tên, giá, màu, size */}
        <View style={styles.infoBox}>
          {product.isNew && <View style={styles.newReleaseTag}><Text style={styles.newReleaseText}>New Release</Text></View>}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${Number(getPrice(product)).toFixed(2)}</Text>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {product.variants.colors.map((color: string, idx: number) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorCircle, { backgroundColor: color.toLowerCase() }, selectedColor === color && styles.selectedColor]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
          {/* Size label và size chart cùng hàng */}
          <View style={styles.sizeRowHeader2}>
            <Text style={styles.sizeLabel}>SIZE</Text>
            <TouchableOpacity>
              <Text style={styles.sizeChartLink}>SIZE CHART</Text>
            </TouchableOpacity>
          </View>
          {/* Grid chọn size */}
          <View style={styles.sizeGrid}>
            {product.variants.sizes.map((size: string, idx: number) => {
              const isUnavailable = unavailableSizes.includes(size);
              const isSelected = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeBox,
                    isSelected && styles.selectedSize,
                    isUnavailable && styles.unavailableSize,
                  ]}
                  onPress={() => !isUnavailable && setSelectedSize(size)}
                  disabled={isUnavailable}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      isSelected && styles.sizeTextSelected,
                      isUnavailable && styles.sizeTextUnavailable,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {/* Nút Add to cart và Favourite */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.addToCartBtn}>
              <Text style={styles.btnText}>ADD TO CART</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.favouriteBtn}
              onPress={() => setFavourite((prev) => !prev)}
            >
              <Ionicons
                name={favourite ? "heart" : "heart-outline"}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.buyNowBtn}>
            <Text style={styles.btnText}>BUY IT NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Thông tin sản phẩm */}
        <View style={styles.productDescBox}>
          <Text style={styles.sectionTitle}>ABOUT THE PRODUCT</Text>
          <Text style={styles.description}>{product.summary || product.description}</Text>
          {product.description && <Text style={styles.detailItem}>• {product.description}</Text>}
        </View>

        {/* Gợi ý sản phẩm */}
        <Text style={styles.sectionTitle}>You may also like</Text>
        <FlatList
          data={recommendations}
          horizontal
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <View style={styles.recommendCard}>
              <Image source={{ uri: item.images[0] }} style={styles.recommendImage} />
              <Text style={styles.recommendName}>{item.name}</Text>
              <Text style={styles.recommendPrice}>${Number(getPrice(item)).toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.recommendBtn}
                onPress={() => navigation.navigate('ProductDetails', { productId: String(item.id) })}
              >
                <Text style={styles.recommendBtnText}>VIEW PRODUCT - ${Number(getPrice(item)).toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#f7f7f7', flex: 1, padding: 12 },
  imageGalleryBox: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLargeBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainImage: {
    width: 320,
    height: 180,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  imageIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  imageIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  imageIndicatorDotActive: {
    backgroundColor: '#4A69E2',
  },
  thumbnailRowGallery: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  thumbnailGallery: {
    width: 70,
    height: 70,
    borderRadius: 16,
    marginHorizontal: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedThumbGallery: {
    borderColor: '#4A69E2',
    borderWidth: 2,
  },
  infoBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 12 },
  newReleaseTag: { alignSelf: 'flex-start', backgroundColor: '#2e5bff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 },
  newReleaseText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  name: { fontWeight: 'bold', fontSize: 16, marginTop: 2, marginBottom: 2 },
  price: { color: '#2e5bff', fontWeight: 'bold', fontSize: 18, marginVertical: 4 },
  label: { marginTop: 10, fontWeight: '600', color: '#444' },
  colorRow: { flexDirection: 'row', marginVertical: 8 },
  colorCircle: { width: 28, height: 28, borderRadius: 14, marginRight: 10, borderWidth: 2, borderColor: '#eee' },
  selectedColor: { borderColor: '#2e5bff' },
  sizeRowHeader2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 0,
  },
  sizeLabel: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#232321',
    letterSpacing: 0.5,
  },
  sizeChartLink: {
    color: '#232321',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    gap: 10,
  },
  sizeBox: {
    borderWidth: 2,
    borderColor: '#232321',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    margin: 4,
    minWidth: 48,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedSize: {
    backgroundColor: '#232321',
    borderColor: '#232321',
  },
  unavailableSize: {
    backgroundColor: '#e0e0e0',
    borderColor: '#e0e0e0',
  },
  sizeText: {
    color: '#232321',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sizeTextSelected: {
    color: '#fff',
  },
  sizeTextUnavailable: {
    color: '#aaa',
    fontWeight: 'normal',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#232321',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 12,
  },
  favouriteBtn: {
    width: 56,
    height: 56,
    backgroundColor: '#232321',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowBtn: {
    backgroundColor: '#4A69E2',
    padding: 18,
    borderRadius: 14,
    marginTop: 0,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  productDescBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 18, marginBottom: 8 },
  sectionTitle: { fontWeight: 'bold', fontSize: 15, marginTop: 24, marginBottom: 6 },
  description: { color: '#444', marginBottom: 6 },
  detailItem: { color: '#666', fontSize: 13, marginBottom: 2 },
  recommendCard: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginRight: 12, width: 160 },
  recommendImage: { width: '100%', height: 80, borderRadius: 8, marginBottom: 6 },
  recommendName: { fontWeight: 'bold', fontSize: 13, marginBottom: 2 },
  recommendPrice: { color: '#2e5bff', fontWeight: 'bold', marginBottom: 4 },
  recommendBtn: { backgroundColor: '#222', borderRadius: 6, padding: 6, alignItems: 'center' },
  recommendBtnText: { color: '#fff', fontSize: 12 },
});

export default ProductDetailsScreen;
