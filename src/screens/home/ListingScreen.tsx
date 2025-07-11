import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import ProductCard from "../../components/common/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FilterModal from "@/components/common/FilterModal";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList, Product } from "@/types";
import { StackNavigationProp } from "@react-navigation/stack";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/api";
import { formatVND } from "../../utils/currency";

const screenWidth = Dimensions.get("window").width;

const ListingScreen = () => {
  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    sizes: [] as string[],
    colors: [] as string[],
    categories: [] as string[],
    brands: [] as string[],
    price: 500,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(API_ENDPOINTS.PRODUCTS);
        console.log("API Response:", res.status);
        console.log("Response data:", res.data);

        // Since the backend returns { success: true, data: { products: [...], total: number } }
        // we need to access res.data.data.products
        let productsData = [];
        if (res.data?.data?.products) {
          productsData = res.data.data.products;
        } else if (res.data?.products) {
          productsData = res.data.products;
        } else if (Array.isArray(res.data)) {
          productsData = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          productsData = res.data.data;
        }

        console.log("Products data:", productsData);
        console.log("Number of products:", productsData.length);

        if (productsData.length > 0) {
          console.log("First product:", productsData[0]);
        }

        setProducts(productsData);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Lỗi tải sản phẩm");
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filterProducts = (products: Product[]) => {
    console.log("filterProducts called with:", products?.length, "products");

    if (!products || !Array.isArray(products)) {
      console.log("Products is not an array or undefined");
      return [];
    }

    // For now, let's return all products without filtering to see if they render
    if (
      filters.sizes.length === 0 &&
      filters.colors.length === 0 &&
      filters.categories.length === 0 &&
      filters.brands.length === 0
    ) {
      console.log("No filters applied, returning all products");
      return products;
    }

    const filtered = products.filter((product) => {
      // Handle case where product.inventory might be undefined
      if (!product.inventory || !Array.isArray(product.inventory)) {
        console.log("Product has no inventory:", product.name);
        // Don't filter out products without inventory, just check other criteria
        const matchesCategory =
          filters.categories.length === 0 ||
          (product.category && filters.categories.includes(product.category));
        const matchesBrand =
          filters.brands.length === 0 ||
          (product.brand && filters.brands.includes(product.brand));
        const matchesPrice = (() => {
          if (typeof product.price === "number") {
            return product.price <= filters.price * 1000000; // Convert to VND
          } else if (product.price && typeof product.price === "object") {
            return (product.price as any).regular <= filters.price * 1000000;
          }
          return true;
        })();

        return matchesCategory && matchesBrand && matchesPrice;
      }

      const matchesInventory = product.inventory.some((inventoryItem) => {
        const matchesSize =
          filters.sizes.length === 0 ||
          (inventoryItem.size &&
            filters.sizes.includes(inventoryItem.size.toString()));
        const matchesColor =
          filters.colors.length === 0 ||
          (inventoryItem.color &&
            filters.colors.includes(inventoryItem.color.toLowerCase()));
        return matchesSize && matchesColor && inventoryItem.isAvailable;
      });

      const matchesCategory =
        filters.categories.length === 0 ||
        (product.category && filters.categories.includes(product.category));
      const matchesBrand =
        filters.brands.length === 0 ||
        (product.brand && filters.brands.includes(product.brand));
      const matchesPrice = (() => {
        if (typeof product.price === "number") {
          return product.price <= filters.price * 1000000; // Convert to VND
        } else if (product.price && typeof product.price === "object") {
          return (product.price as any).regular <= filters.price * 1000000;
        }
        return true;
      })();

      const passes =
        matchesInventory && matchesCategory && matchesBrand && matchesPrice;
      if (!passes) {
        console.log("Product filtered out:", product.name, {
          matchesInventory,
          matchesCategory,
          matchesBrand,
          matchesPrice,
        });
      }

      return passes;
    });

    console.log("Filtered products count:", filtered.length);
    return filtered;
  };

  const totalPages = Math.ceil((products || []).length / pageSize);

  const currentProducts = (products || []).slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  type NavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();

  const renderHeader = () => (
    <>
      <View
        style={{
          height: 180,
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 16,
          position: "relative",
          marginTop: Platform.OS === "ios" ? 30 : 0,
        }}
      >
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          }}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "cover",
            position: "absolute",
          }}
        />
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
        <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
          <Text style={{ color: "#ccc", fontSize: 14 }}>Limited time only</Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: "bold",
              marginVertical: 4,
            }}
          >
            Get 30% off
          </Text>
          <Text style={{ color: "#eee", fontSize: 14, lineHeight: 20 }}>
            Sneakers made with your comfort in mind so you can put all of your
            focus into your next session.
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
            flex: 1,
            marginRight: 8,
          }}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={{ fontWeight: "500" }}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
            flex: 1,
            justifyContent: "space-between",
            marginLeft: 8,
          }}
        >
          <Text style={{ fontWeight: "500" }}>Trending</Text>
          <Text style={{ fontSize: 12 }}>▼</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>
        Life Style Shoes
      </Text>
      <Text style={{ marginBottom: 16, color: "#555" }}>
        {(products || []).length} items
      </Text>
    </>
  );

  const renderFooter = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
        marginBottom: 40,
      }}
    >
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <TouchableOpacity
          key={page}
          onPress={() => handlePageChange(page)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 15,
            margin: 5,
            backgroundColor: currentPage === page ? "#333" : "#ccc",
            borderRadius: 5,
          }}
        >
          <Text style={{ color: currentPage === page ? "#fff" : "#000" }}>
            {page}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#333" />
          <Text style={{ marginTop: 16, color: "#666" }}>
            Loading products...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: "red", textAlign: "center" }}>
            Error: {error}
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 16,
              backgroundColor: "#333",
              padding: 12,
              borderRadius: 8,
            }}
            onPress={() => {
              // Retry fetching
              setLoading(true);
              setError("");
              // You could extract the fetch logic to a separate function and call it here
            }}
          >
            <Text style={{ color: "white" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key="products-single-column"
          data={(() => {
            const filteredProducts = filterProducts(products);
            const paginatedProducts = filteredProducts.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            );
            console.log("Filtered products count:", filteredProducts.length);
            console.log("Paginated products count:", paginatedProducts.length);
            console.log("Current page:", currentPage);
            return paginatedProducts;
          })()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            console.log("Rendering item:", item.name);
            const price =
              typeof item.price === "number"
                ? item.price
                : (item.price as any)?.regular || 0;

            // Get the image from mainImage or from the first inventory item
            let imageUri = item.mainImage;
            if (!imageUri && item.inventory && item.inventory.length > 0) {
              const firstInventoryItem = item.inventory[0];
              if (
                firstInventoryItem.images &&
                firstInventoryItem.images.length > 0
              ) {
                imageUri = firstInventoryItem.images[0];
              }
            }

            console.log("Image URI for", item.name, ":", imageUri);

            return (
              <View style={{ 
                width: "100%", // Full width for listing cards
                marginBottom: 16,
              }}>
                <ProductCard
                  image={{
                    uri: imageUri || "https://via.placeholder.com/300x300",
                  }}
                  name={item.name}
                  price={formatVND(price)}
                  tag={
                    (item.price as any)?.isOnSale &&
                    (item.price as any)?.discountPercent > 0
                      ? `${(item.price as any).discountPercent}% off`
                      : undefined
                  }
                  onPress={() => {
                    // Navigate to ProductDetails screen
                    const parentNavigation = navigation.getParent();
                    if (parentNavigation) {
                      parentNavigation.navigate("ProductDetails", {
                        productId: item.id,
                      });
                    }
                  }}
                />
              </View>
            );
          }}
          numColumns={1}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 100,
            paddingHorizontal: 16,
            paddingBottom: 16,
            backgroundColor: "#fff",
          }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(selectedFilters: any) => {
          setFilters(selectedFilters);
          setFilterVisible(false);
        }}
      />
    </View>
  );
};

export default ListingScreen;
