import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { COLORS } from "../../constants/theme";
import { formatVND } from "../../utils/currency";

interface OrderSummaryWithPromoProps {
  itemCount: number;
  subtotal: number;
  delivery: number;
  total: number;
  discount?: DiscountValidationResult | null;
}

const OrderSummaryWithPromo: React.FC<OrderSummaryWithPromoProps> = ({
  itemCount,
  subtotal,
  delivery,
  total,
  discount,
}) => {
  const [showPromoInput, setShowPromoInput] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      <View style={styles.row}>
        <Text>
          {itemCount} ITEM{itemCount > 1 ? "S" : ""}
        </Text>
        <Text>{formatVND(subtotal)}</Text>
      </View>
      <View style={styles.row}>
        <Text>Delivery</Text>
        <Text>{delivery === 0 ? "Free" : formatVND(delivery)}</Text>
      </View>
      {discount && discount.isValid && (
        <View style={styles.row}>
          <Text style={styles.discountText}>
            Discount ({discount.discount.code})
          </Text>
          <Text style={styles.discountText}>
            -{formatVND(discount.discountAmount)}
          </Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalText}>{formatVND(total)}</Text>
      </View>
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
    fontSize: 24,
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
  discountText: {
    color: "#16a34a",
    fontWeight: "600",
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
