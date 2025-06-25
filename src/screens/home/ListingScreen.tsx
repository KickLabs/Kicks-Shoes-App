import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { products as mockProducts, getProducts } from "../../mockData";
import ProductCard from "../../components/common/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { StackNavigationProp } from "@react-navigation/stack";

const screenWidth = Dimensions.get("window").width;

const ListingScreen = () => {
  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const totalProducts = mockProducts.length;
  const currentProducts = getProducts(currentPage, pageSize);

  const totalPages = Math.ceil(totalProducts / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  type NavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();

  const renderHeader = () => (
    <>
      {/* Banner */}
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

      {/* Filter + Sort */}
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

      {/* Title + count */}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>
        Life Style Shoes
      </Text>
      <Text style={{ marginBottom: 16, color: "#555" }}>
        {totalProducts} items
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
      <FlatList
        data={currentProducts}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <ProductCard
            image={{ uri: item.mainImage }}
            name={item.name || "Name"}
            price={`$${item.price.regular}`}
            tag={
              item.isNew
                ? "New"
                : item.price.isOnSale
                  ? `${item.price.discountPercent}% off`
                  : undefined
            }
            onPress={() =>
              navigation.navigate("ProductDetails", {
                productId: String(item.sku),
              })
            }
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 100,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: "#fff",
        }}
      />
    </View>
  );
};

export default ListingScreen;
