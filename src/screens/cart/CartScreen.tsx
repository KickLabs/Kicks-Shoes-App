import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import CartHeader from "./CartHeader";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummaryWithPromo";
import CheckoutButton from "./CheckoutButton";
import { COLORS } from "../../constants/theme";
import { products as mockProducts } from "../../mockData";
import ProductCard from "@/components/common/ProductCard";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { StackNavigationProp } from "@react-navigation/stack";

const newProducts = mockProducts.filter((p) => p.isNew).slice(0, 4);

const CartScreen: React.FC = () => {
  type NavigationProp = StackNavigationProp<RootStackParamList>;
    const navigation = useNavigation<NavigationProp>();
    const goToCheckoutScreen = () => {
      navigation.getParent()?.navigate("CheckoutScreen");
    };
  return (
    <ScrollView style={styles.container}>
      <View style={{ paddingTop: 90 }}></View>
      <CartHeader />
      <CartItem
        name="DROPSET TRAINER SHOES"
        description="Men's Road Running Shoes"
        color="Enamel Blue / University White"
        size="10"
        quantity={1}
        price={130.0}
      />
      <OrderSummary
        itemCount={1}
        subtotal={130.0}
        delivery={6.99}
        total={130.0}
      />
      <CheckoutButton onPress={goToCheckoutScreen}/>
      <Text style={styles.title}>You may also like</Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
        {newProducts.map((p, idx) => (
          <ProductCard
            key={p.id}
            image={{ uri: p.images[0] }}
            name={p.name}
            price={`$${p.price.regular}`}
            tag={
              p.isNew
                ? "New"
                : p.price.isOnSale
                  ? `${p.price.discountPercent}% off`
                  : undefined
            }
            onPress={() => {}}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
  },
  recommendationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16, // khoảng cách giữa các hàng
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },
});

export default CartScreen;
