import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { products as mockProducts, getProducts } from "../../mockData";
import ProductCard from "../../components/common/ProductCard";
import CustomHeader from "@/components/layout/CustomHeader";
import Footer from "@/components/layout/CustomFooter";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { StackNavigationProp } from "@react-navigation/stack";

const screenWidth = Dimensions.get("window").width;

const CheckoutScreen = () => {
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

  return (
    <View style={{ flexDirection: "row", flex: 1, paddingTop: 70}}>
      <CustomHeader/>
      <View style={{ flex: 1, padding: 16 }}>
        <FlatList
          data={currentProducts}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              image={{ uri: item.images[0] }}
              name={item.name}
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
  productId: item.id.toString(),
})
}
            />
          )}
        />

        {/* Pagination Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
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
        {/* <Footer/> */}
      </View>
      
    </View>
  );
};

export default CheckoutScreen;
