import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { COLORS } from "../../constants/theme";

interface OrderSummaryWithPromoProps {
  itemCount: number;
  subtotal: number;
  delivery: number;
  total: number;
}

const OrderSummaryWithPromo: React.FC<OrderSummaryWithPromoProps> = ({
  itemCount,
  subtotal,
  delivery,
  total,
}) => {
  const [showPromoInput, setShowPromoInput] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      <View style={styles.row}>
        <Text>{itemCount} ITEM</Text>
        <Text>${subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text>Delivery</Text>
        <Text>${delivery.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalText}>${total.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        onPress={() => setShowPromoInput(!showPromoInput)}
        style={styles.promoLabel}
      >
        <Text style={styles.promoText}>User a promo code</Text>
      </TouchableOpacity>
      {showPromoInput && (
        <TextInput style={styles.input} placeholder="Enter promo code" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  promoLabel: {
    marginTop: 8,
  },
  promoText: {
    fontSize: 12,
    color: COLORS.gray,
    textDecorationLine: "underline",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
});

export default OrderSummaryWithPromo;
