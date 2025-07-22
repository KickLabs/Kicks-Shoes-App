import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import CartHeader from "./CartHeader";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummaryWithPromo";
import CheckoutButton from "./CheckoutButton";
import DiscountInput from "@/components/cart/DiscountInput";
import { COLORS } from "../../constants/theme";
import { products as mockProducts } from "../../mockData";
import ProductCard from "@/components/common/ProductCard";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { StackNavigationProp } from "@react-navigation/stack";
import cartService, { CartItem as CartItemType } from "@/services/cart";
import { DiscountValidationResult } from "@/services/discount";
import { Ionicons } from "@expo/vector-icons";
import { formatVND } from "../../utils/currency";
import AuthGuard from "../../components/auth/AuthGuard";
import { runNetworkDiagnostics } from "../../utils/network";
import NetworkStatusBanner from "../../components/common/NetworkStatusBanner";
import { useDiscount } from "@/contexts/DiscountContext";

const newProducts = mockProducts.slice(0, 4);

const CartScreen: React.FC = () => {
  type NavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();

  // Local state for cart data
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Use global discount context
  const { discount, setDiscount, clearDiscount } = useDiscount();

  const fetchCartData = async () => {
    try {
      setError(null);
      const cartData = await cartService.getCart();
      setCartItems(cartData.items || []);
      setTotal(cartData.total || 0);
      setItemCount(cartData.itemCount || 0);
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart");
      setCartItems([]);
      setTotal(0);
      setItemCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCartData();
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await cartService.removeFromCart(itemId);
      } else {
        await cartService.updateCartItem(itemId, newQuantity);
      }
      await fetchCartData(); // Refresh cart data
    } catch (err: any) {
      console.error("Error updating cart item:", err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartService.removeFromCart(itemId);
      await fetchCartData();
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove item from cart");
    }
  };

  const handleDiscountApplied = (discountResult: DiscountValidationResult) => {
    setDiscount(discountResult);
    console.log("Discount applied:", discountResult);
  };

  const handleDiscountRemoved = () => {
    clearDiscount();
    console.log("Discount removed");
  };

  const calculateFinalTotal = () => {
    const deliveryFee = total > 500000 ? 0 : 30000;
    const subtotal = total + deliveryFee;

    if (discount && discount.isValid) {
      return Math.max(0, subtotal - discount.discountAmount);
    }

    return subtotal;
  };

  const goToCheckoutScreen = () => {
    if (cartItems.length === 0) {
      // Show alert that cart is empty
      return;
    }
    navigation.getParent()?.navigate("CheckoutScreen");
  };

  if (loading) {
    return (
      <AuthGuard>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your cart...</Text>
          </View>
        </SafeAreaView>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
        >
          <View style={styles.header}>
            <CartHeader />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add some items to your cart to get started
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.bagHeader}>
                <Text style={styles.bagTitle}>Your Bag</Text>
                <Text style={styles.bagSubtitle}>
                  Items in your bag not reserved - check out now to make them
                  yours.
                </Text>
              </View>

              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description="High-quality shoes"
                  color={item.color || ""}
                  size={item.size || ""}
                  quantity={item.quantity}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  image={item.image}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}

              <DiscountInput
                cartTotal={total}
                cartItems={cartItems}
                onDiscountApplied={handleDiscountApplied}
                onDiscountRemoved={handleDiscountRemoved}
                appliedDiscount={discount}
              />

              <OrderSummary
                itemCount={itemCount}
                subtotal={total}
                delivery={total > 500000 ? 0 : 30000}
                total={calculateFinalTotal()}
                discount={discount}
              />

              <View style={styles.checkoutContainer}>
                <CheckoutButton
                  onPress={() => {
                    // Pass discount data through navigation params or global state
                    navigation.getParent()?.navigate("CheckoutScreen");
                  }}
                />
              </View>
            </>
          )}

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
                price={formatVND(p.price.regular)}
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
      </SafeAreaView>
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 150 : 90,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffebee",
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#d32f2f",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Rubik-SemiBold",
    color: COLORS.black,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  checkoutContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bagHeader: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  bagTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  bagSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  title: {
    fontSize: 24,
    fontFamily: "Rubik-SemiBold",
    color: COLORS.black,
    marginLeft: 16,
    marginTop: 16,
  },
  productWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
});

export default CartScreen;
