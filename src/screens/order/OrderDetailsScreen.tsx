import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import orderService from "@/services/order";

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        console.log("Order details:", data);
        setOrder(data);
      } catch (err: any) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F57C00";
      case "processing":
        return "#1976D2";
      case "shipped":
        return "#388E3C";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#D32F2F";
      case "refunded":
        return "#9C27B0";
      default:
        return "#757575";
    }
  };

  const formatPrice = (price: number) => {
    return `đ${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelOrder = async () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await orderService.cancelOrder(
              orderId,
              "User requested cancellation"
            );
            Alert.alert("Success", "Order cancelled successfully", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            Alert.alert("Error", "Failed to cancel order");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
            <Text style={[styles.errorText, { color: "#ff6b6b" }]}>
              {error}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content}>
          {/* Order Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.orderNumber}>
                Order #{order?.orderNumber || order?._id || "Unknown"}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColor(order?.status || "unknown"),
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {(order?.status || "unknown").toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>
              Placed on{" "}
              {order?.createdAt ? formatDate(order.createdAt) : "Unknown Date"}
            </Text>
          </View>
          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            {order?.items && order.items.length > 0 ? (
              order.items.map((item: any, index: number) => (
                <View key={index} style={styles.itemCard}>
                  <Image
                    source={{
                      uri:
                        item.product?.mainImage ||
                        item.mainImage ||
                        item.product?.image,
                    }}
                    style={styles.itemImage}
                    defaultSource={require("../../../assets/images/welcome.png")}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      {item.product?.name || item.name || "Unknown Product"}
                    </Text>
                    <Text style={styles.itemDetails}>
                      Quantity: {item.quantity || 0}
                      {item.size ? <Text> • Size: {item.size}</Text> : null}
                      {item.color ? <Text> • Color: {item.color}</Text> : null}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {formatPrice(item.price || 0)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.itemName}>No items found</Text>
            )}
          </View>
          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <Text style={styles.addressText}>
              {order?.shippingAddress || "No shipping address provided"}
            </Text>
          </View>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(order?.subtotal || order?.totalPrice || 0)}
              </Text>
            </View>
            {order?.shippingCost && order.shippingCost > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(order.shippingCost)}
                </Text>
              </View>
            )}
            {order?.tax && order.tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(order.tax)}
                </Text>
              </View>
            )}
            {order?.discount && order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount:</Text>
                <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                  -{formatPrice(order.discount)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {formatPrice(order?.totalPrice || 0)}
              </Text>
            </View>
          </View>
          {/* Actions */}
          {order?.status === "pending" && (
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelOrder}
              >
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    marginTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Rubik-Medium",
  },
  content: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F5F5F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Rubik-Medium",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  orderDate: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Rubik-Regular",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Rubik-Medium",
    color: "#333",
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F5F5F5",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Rubik-Regular",
    color: "#333",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Rubik-Regular",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Rubik-Medium",
    color: "#4A69E2",
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Rubik-Regular",
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  actionSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  cancelButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OrderDetailsScreen;
