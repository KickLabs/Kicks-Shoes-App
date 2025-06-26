import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import CustomCheckbox from "@/components/common/CustomCheckbox";
import CartHeader from "./OrderHeader";
import OrderItem from "./OrderItem";
import OrderSummary from "./OrderSummaryWithPromo";
import CheckoutButton from "./CheckoutButton";
import { COLORS } from "../../constants/theme";
import { products as mockProducts } from "../../mockData";
import ProductCard from "@/components/common/ProductCard";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { StackNavigationProp } from "@react-navigation/stack";
import Header from "@/components/layout/Header";
import { Ionicons } from "@expo/vector-icons";

const newProducts = mockProducts.slice(0, 4);

const CheckoutScreen: React.FC = () => {
  type NavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const goToCheckoutScreen = () => {
    navigation.getParent()?.navigate("CheckoutScreen");
  };

  const [sameInfo, setSameInfo] = useState(true);
  const [is13Plus, setIs13Plus] = useState(true);
  const [subscribeNews, setSubscribeNews] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "collect">(
    "standard"
  );

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
      <CartHeader />
      <OrderItem
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
        delivery={deliveryMethod === "standard" ? 6.99 : 0}
        total={130.0 + (deliveryMethod === "standard" ? 6.99 : 0)}
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
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <TextInput style={styles.input} placeholder="First Name*" />
        <TextInput style={styles.input} placeholder="Last Name*" />
        <TextInput style={styles.input} placeholder="Find Delivery Address*" />
        <Text style={styles.hint}>
          Start typing your street address or zip code for suggestion
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number*"
          keyboardType="phone-pad"
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
            <Text style={styles.priceText}>$6.99</Text>
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
      <TouchableOpacity style={styles.payButton}>
        <Text style={styles.payButtonText}>REVIEW AND PAY</Text>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
