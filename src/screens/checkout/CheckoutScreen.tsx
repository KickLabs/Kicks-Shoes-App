import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import CustomCheckbox from "@/components/common/CustomCheckbox";
import CartHeader from "./OrderHeader";
import OrderItem from "./OrderItem";
import OrderSummary from "./OrderSummaryWithPromo";
import CheckoutButton from "./CheckoutButton";
import { COLORS } from "../../constants/theme";
import ProductCard from "@/components/common/ProductCard";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { StackNavigationProp } from "@react-navigation/stack";
import Header from "@/components/layout/Header";
import { Ionicons } from "@expo/vector-icons";
import cartService, { CartItem } from "@/services/cart";
import { formatVND } from "@/utils/currency";
import orderService from "@/services/order";
import userService from "@/services/user";

interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  [key: string]: any;
}

const CheckoutScreen: React.FC = () => {
  type NavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [sameInfo, setSameInfo] = useState(true);
  const [is13Plus, setIs13Plus] = useState(true);
  const [subscribeNews, setSubscribeNews] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "collect">(
    "standard"
  );

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [itemLoading, setItemLoading] = useState<{ [id: string]: boolean }>({});

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await cartService.getCart();
      setCartItems(cartData.items);
      setCartTotal(cartData.total);
      setItemCount(cartData.itemCount);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart data. Please try again.");
      // Fallback to empty cart
      setCartItems([]);
      setCartTotal(0);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const profile: UserProfile = await userService.getProfile();
      setUserProfile(profile);

      // Auto-fill form with user data
      if (profile) {
        const fullName = profile.fullName || profile.name || "";
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setFormData((prev) => ({
          ...prev,
          email: profile.email || "",
          firstName: firstName,
          lastName: lastName,
          phone: profile.phone || "",
          address: profile.address || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Don't show error for profile fetch, just continue without pre-filled data
    } finally {
      setProfileLoading(false);
    }
  };

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchCartData();
    fetchUserProfile();
  }, []);

  const deliveryFee = deliveryMethod === "standard" ? 30000 : 0;
  const totalWithDelivery = cartTotal + deliveryFee;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.black} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCartData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate("Home" as any)}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleIncrease = async (item: CartItem) => {
    setItemLoading((prev) => ({ ...prev, [item.id]: true }));
    try {
      await cartService.updateCartItem(item.id, item.quantity + 1);
      await fetchCartData();
    } catch (err) {
      Alert.alert("Error", "Failed to update quantity");
    } finally {
      setItemLoading((prev) => ({ ...prev, [item.id]: false }));
    }
  };
  const handleDecrease = async (item: CartItem) => {
    if (item.quantity <= 1) return;
    setItemLoading((prev) => ({ ...prev, [item.id]: true }));
    try {
      await cartService.updateCartItem(item.id, item.quantity - 1);
      await fetchCartData();
    } catch (err) {
      Alert.alert("Error", "Failed to update quantity");
    } finally {
      setItemLoading((prev) => ({ ...prev, [item.id]: false }));
    }
  };
  const handleRemove = async (item: CartItem) => {
    setItemLoading((prev) => ({ ...prev, [item.id]: true }));
    try {
      await cartService.removeFromCart(item.id);
      await fetchCartData();
    } catch (err) {
      Alert.alert("Error", "Failed to remove item");
    } finally {
      setItemLoading((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // Basic validation
    if (!formData.firstName.trim()) {
      Alert.alert("Error", "First name is required");
      return;
    }
    if (!formData.lastName.trim()) {
      Alert.alert("Error", "Last name is required");
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert("Error", "Address is required");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Error", "Phone number is required");
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      await orderService.createOrder({
        address: formData.address,
        phone: formData.phone,
        deliveryMethod: deliveryMethod,
      });
      setCheckoutLoading(false);
      // Navigate to order success/history screen
      Alert.alert("Order Success", "Your order has been placed!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("OrderHistory" as any),
        },
      ]);
    } catch (err: any) {
      setCheckoutLoading(false);
      setCheckoutError(err?.message || "Checkout failed. Please try again.");
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      <View style={{ paddingTop: 40 }} />
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {profileLoading && (
        <View style={styles.profileLoadingContainer}>
          <ActivityIndicator size="small" color={COLORS.black} />
          <Text style={styles.profileLoadingText}>Loading profile...</Text>
        </View>
      )}

      <CartHeader />

      {/* Cart Items */}
      {cartItems.map((item) => (
        <OrderItem
          key={item.id}
          id={item.id}
          name={item.name}
          description={`Size: ${item.size || "N/A"} | Color: ${item.color || "N/A"}`}
          color={item.color || "N/A"}
          size={item.size || "N/A"}
          quantity={item.quantity}
          price={item.price}
          image={item.image}
          onIncrease={() => handleIncrease(item)}
          onDecrease={() => handleDecrease(item)}
          onRemove={() => handleRemove(item)}
          loading={!!itemLoading[item.id]}
        />
      ))}

      <OrderSummary
        itemCount={itemCount}
        subtotal={cartTotal}
        delivery={deliveryFee}
        total={totalWithDelivery}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Details</Text>
        <Text style={styles.description}>
          We will use these details to keep you inform about your delivery.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => updateFormField("email", text)}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name*"
          value={formData.firstName}
          onChangeText={(text) => updateFormField("firstName", text)}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name*"
          value={formData.lastName}
          onChangeText={(text) => updateFormField("lastName", text)}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Find Delivery Address*"
          value={formData.address}
          onChangeText={(text) => updateFormField("address", text)}
          multiline
          numberOfLines={2}
        />
        <Text style={styles.hint}>
          Start typing your street address or zip code for suggestion
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number*"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => updateFormField("phone", text)}
        />
        <Text style={styles.hint}>E.g. (123) 456-7890</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>

        {/* Delivery Methods */}
        <TouchableOpacity
          style={[
            styles.deliveryBox,
            deliveryMethod === "standard" && styles.selectedBox,
          ]}
          onPress={() => setDeliveryMethod("standard")}
        >
          <View>
            <Text style={styles.deliveryTitle}>Standard Delivery</Text>
            <Text style={styles.deliveryDescription}>
              Enter your address to get your order
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.priceText}>{formatVND(30000)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deliveryBox,
            deliveryMethod === "collect" && styles.selectedBox,
          ]}
          onPress={() => setDeliveryMethod("collect")}
        >
          <View>
            <Text style={styles.deliveryTitle}>Collect in store</Text>
            <Text style={styles.deliveryDescription}>
              Pay now, collect in store
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.priceText}>Free</Text>
          </View>
        </TouchableOpacity>

        {/* Checkboxes */}
        <View style={styles.checkboxContainer}>
          <CustomCheckbox value={sameInfo} onChange={setSameInfo} />
          <Text style={styles.checkboxLabel}>
            My billing and delivery information are the same
          </Text>
        </View>

        <View style={styles.checkboxContainer}>
          <CustomCheckbox value={is13Plus} onChange={setIs13Plus} />
          <Text style={styles.checkboxLabel}>I'm 13+ year old</Text>
        </View>

        <Text style={[styles.sectionTitle, { fontSize: 14 }]}>
          Also want product updates with our newsletter?
        </Text>
        <View style={styles.checkboxContainer}>
          <CustomCheckbox value={subscribeNews} onChange={setSubscribeNews} />
          <Text style={styles.checkboxLabel}>
            Yes, I'd like to receive emails about exclusive sales and more.
          </Text>
        </View>
      </View>

      {/* REVIEW AND PAY Button */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={handleCheckout}
        disabled={checkoutLoading}
      >
        {checkoutLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Text style={styles.payButtonText}>REVIEW AND PAY</Text>
            <Text style={styles.arrow}>→</Text>
          </>
        )}
      </TouchableOpacity>
      {checkoutError && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          {checkoutError}
        </Text>
      )}
    </ScrollView>
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
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.black,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    textTransform: "uppercase",
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
  },
  backButton: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
  },
  profileLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.black,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
  },
  deliveryBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectedBox: {
    borderColor: COLORS.black,
    backgroundColor: "#e8f0fe",
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.black,
  },
  deliveryDescription: {
    fontSize: 13,
    color: "#666",
  },
  priceText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
  },
  payButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    margin: 20,
    borderRadius: 8,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  arrow: {
    color: COLORS.white,
    fontSize: 20,
    marginLeft: 10,
  },
});

export default CheckoutScreen;
