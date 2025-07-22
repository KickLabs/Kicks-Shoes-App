import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import discountService, {
  DiscountValidationResult,
  ValidateDiscountPayload,
} from "@/services/discount";

interface DiscountInputProps {
  cartTotal: number;
  cartItems: any[];
  onDiscountApplied: (discount: DiscountValidationResult) => void;
  onDiscountRemoved: () => void;
  appliedDiscount?: DiscountValidationResult | null;
}

const DiscountInput: React.FC<DiscountInputProps> = ({
  cartTotal,
  cartItems,
  onDiscountApplied,
  onDiscountRemoved,
  appliedDiscount,
}) => {
  const [discountCode, setDiscountCode] = useState(
    appliedDiscount?.discount.code || ""
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      Alert.alert("Error", "Please enter a discount code");
      return;
    }

    if (!discountService.isValidCodeFormat(discountCode)) {
      Alert.alert("Error", "Invalid discount code format");
      return;
    }

    try {
      setLoading(true);

      const payload: ValidateDiscountPayload = {
        code: discountService.formatDiscountCode(discountCode),
        cartTotal,
        cartItems: cartItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      };

      const result = await discountService.validateDiscount(payload);

      if (result.isValid) {
        onDiscountApplied(result);
        setExpanded(false);
        Alert.alert(
          "Success!",
          `Discount applied! You saved ${formatCurrency(result.discountAmount)}`
        );
      } else {
        Alert.alert(
          "Invalid Code",
          result.message || "Discount code is not valid"
        );
      }
    } catch (error: any) {
      console.error("Error applying discount:", error);
      Alert.alert("Error", error.message || "Failed to apply discount code");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode("");
    onDiscountRemoved();
    Alert.alert("Removed", "Discount code removed");
  };

  const formatCurrency = (amount: number): string => {
    return `đ${amount.toLocaleString()}`;
  };

  if (appliedDiscount && appliedDiscount.isValid) {
    return (
      <View style={styles.appliedContainer}>
        <View style={styles.appliedHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.appliedTitle}>Discount Applied</Text>
        </View>

        <View style={styles.appliedDetails}>
          <View style={styles.appliedRow}>
            <Text style={styles.appliedLabel}>Code:</Text>
            <Text style={styles.appliedCode}>
              {appliedDiscount.discount.code}
            </Text>
          </View>
          <View style={styles.appliedRow}>
            <Text style={styles.appliedLabel}>Discount:</Text>
            <Text style={styles.appliedDiscount}>
              -{formatCurrency(appliedDiscount.discountAmount)}
            </Text>
          </View>
          {appliedDiscount.discount.description && (
            <Text style={styles.appliedDescription}>
              {appliedDiscount.discount.description}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemoveDiscount}
        >
          <Ionicons name="close-circle" size={16} color="#ef4444" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="pricetag-outline" size={20} color="#3b82f6" />
          <Text style={styles.headerTitle}>Have a discount code?</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748b"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={discountCode}
              onChangeText={setDiscountCode}
              placeholder="Enter discount code"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
              maxLength={50}
            />
            <TouchableOpacity
              style={[
                styles.applyButton,
                loading && styles.applyButtonDisabled,
              ]}
              onPress={handleApplyDiscount}
              disabled={loading || !discountCode.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.applyButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>
            Enter your discount code to save on this order
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
  },

  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#ffffff",
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  applyButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  applyButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  helpText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
  appliedContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  appliedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  appliedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    marginLeft: 8,
  },
  appliedDetails: {
    marginBottom: 12,
  },
  appliedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  appliedLabel: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "500",
  },
  appliedCode: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "700",
    fontFamily: "monospace",
  },
  appliedDiscount: {
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "700",
  },
  appliedDescription: {
    fontSize: 12,
    color: "#16a34a",
    fontStyle: "italic",
    marginTop: 4,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  removeButtonText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default DiscountInput;
