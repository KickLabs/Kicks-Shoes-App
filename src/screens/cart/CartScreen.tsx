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

const newProducts = mockProducts.slice(0, 4);

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
      <CheckoutButton onPress={goToCheckoutScreen} />
      <Text style={styles.title}>You may also like</Text>

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
            name={p.name || "Name"}
            price={`$${p.price.regular}`}
            tag={
              p.isNew
                ? "New"
                : p.price.isOnSale
                  ? `${p.price.discountPercent}% off`
                  : undefined
            }
            onPress={() =>
              navigation
                .getParent()
                ?.navigate("ProductDetails", { productId: p.sku })
            }
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
  },
  title: {
    fontSize: 24,
    fontFamily: "Rubik-SemiBold",
    color: COLORS.black,
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 16,
  },
});

export default CartScreen;
