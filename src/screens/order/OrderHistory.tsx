import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import * as mockData from "../../mockData";

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  mainImage: string;
  size?: number;
  color?: string;
}

interface User {
  _id: string;
  name: string;
}

interface Order {
  _id: string;
  user: User;
  items: OrderItem[];
  status: string;
  totalPrice: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
  notes?: string;
  isActive?: boolean;
  shippingMethod?: string;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  subtotal?: number;
  __v?: number;
}

type OrderHistoryNavigationProp = StackNavigationProp<any>;

interface OrderHistoryProps {
  navigation: OrderHistoryNavigationProp;
}

type Styles = {
  safeArea: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  headerTitle: TextStyle;
  statusBarContainer: ViewStyle;
  statusBar: ViewStyle;
  statusTab: ViewStyle;
  statusTabActive: ViewStyle;
  statusText: TextStyle;
  statusTextActive: TextStyle;
  ordersContainer: ViewStyle;
  orderCard: ViewStyle;
  storeHeader: ViewStyle;
  storeName: TextStyle;
  orderDate: TextStyle;
  orderStatus: TextStyle;
  productContainer: ViewStyle;
  productImage: ImageStyle;
  productInfo: ViewStyle;
  productName: TextStyle;
  productDetails: ViewStyle;
  quantity: TextStyle;
  sizeText: TextStyle;
  colorText: TextStyle;
  priceContainer: ViewStyle;
  price: TextStyle;
  orderFooter: ViewStyle;
  totalText: TextStyle;
  totalPrice: TextStyle;
  buyAgainButton: ViewStyle;
  buyAgainText: TextStyle;
  cancelButton: ViewStyle;
  cancelButtonText: TextStyle;
  refundButton: ViewStyle;
  refundButtonText: TextStyle;
  reviewButton: ViewStyle;
  reviewButtonText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
};

const getStatusStyle = (status: string): TextStyle => {
  switch (status) {
    case "pending":
      return {
        backgroundColor: "#FFF3E0",
        color: "#F57C00",
      };
    case "processing":
      return {
        backgroundColor: "#E3F2FD",
        color: "#1976D2",
      };
    case "shipped":
    case "delivered":
      return {
        backgroundColor: "#E8F5E9",
        color: "#388E3C",
      };
    case "cancelled":
      return {
        backgroundColor: "#FFEBEE",
        color: "#D32F2F",
      };
    default:
      return {
        backgroundColor: "#E0E0E0",
        color: "#757575",
      };
  }
};

const OrderHistory: React.FC<OrderHistoryProps> = ({ navigation }) => {
  const [selectedStatus, setSelectedStatus] = useState("delivered");
  const [orders, setOrders] = useState<Order[]>([]);

  const statuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    // Get orders from mock data
    const allOrders = mockData.orders;
    setOrders(allOrders);
  }, []);

  // Filter orders based on selected status
  const filteredOrders = orders.filter(
    (order) => order.status === selectedStatus
  );

  const formatPrice = (price: number) => {
    return `đ${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleCancelOrder = (orderId: string) => {
    console.log("Cancel order:", orderId);
    // Add cancel order logic here
  };

  const handleRefundOrder = (orderId: string) => {
    console.log("Refund order:", orderId);
    // Add refund order logic here
  };

  const handleReviewOrder = (orderId: string) => {
    console.log("Review order:", orderId);
    // Add review order logic here
  };

  const renderActionButton = (order: Order) => {
    switch (order.status) {
      case "pending":
        return (
          <TouchableOpacity
            style={[styles.buyAgainButton, styles.cancelButton]}
            onPress={() => handleCancelOrder(order._id)}
          >
            <Text style={[styles.buyAgainText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        );
      case "shipped":
        return (
          <TouchableOpacity
            style={[styles.buyAgainButton, styles.refundButton]}
            onPress={() => handleRefundOrder(order._id)}
          >
            <Text style={[styles.buyAgainText, styles.refundButtonText]}>
              Refund
            </Text>
          </TouchableOpacity>
        );
      case "delivered":
        return (
          <TouchableOpacity
            style={[styles.buyAgainButton, styles.reviewButton]}
            onPress={() => handleReviewOrder(order._id)}
          >
            <Text style={[styles.buyAgainText, styles.reviewButtonText]}>
              Review
            </Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Purchases</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.statusBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusBar}
          >
            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setSelectedStatus(status)}
                style={[
                  styles.statusTab,
                  selectedStatus === status && styles.statusTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    selectedStatus === status && styles.statusTextActive,
                  ]}
                >
                  {capitalizeFirstLetter(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.ordersContainer}>
          {filteredOrders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.storeHeader}>
                <View>
                  <Text style={styles.storeName}>
                    Order #{order.orderNumber}
                  </Text>
                  <Text style={styles.orderDate}>
                    {formatDate(order.createdAt)}
                  </Text>
                  <Text style={styles.orderDate}>By: {order.user.name}</Text>
                </View>
                <Text
                  style={[styles.orderStatus, getStatusStyle(order.status)]}
                >
                  {capitalizeFirstLetter(order.status)}
                </Text>
              </View>

              {order.items.map((item, index) => (
                <View key={index} style={styles.productContainer}>
                  <Image
                    source={{ uri: item.mainImage }}
                    style={styles.productImage}
                    defaultSource={require("../../../assets/images/welcome.png")}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <View style={styles.productDetails}>
                      <Text style={styles.quantity}>x{item.quantity}</Text>
                      {item.size && (
                        <Text style={styles.sizeText}>Size: {item.size}</Text>
                      )}
                      {item.color && (
                        <Text style={styles.colorText}>
                          Color: {item.color}
                        </Text>
                      )}
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>
                        {formatPrice(item.price)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <View style={styles.orderFooter}>
                <Text style={styles.totalText}>
                  Total {order.items.length} item
                  {order.items.length > 1 ? "s" : ""}:
                </Text>
                <Text style={styles.totalPrice}>
                  {formatPrice(order.totalPrice)}
                </Text>
              </View>

              {renderActionButton(order)}
            </View>
          ))}

          {filteredOrders.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<Styles>({
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
  statusBarContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  statusBar: {
    backgroundColor: "white",
  },
  statusTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  statusTabActive: {
    borderBottomColor: "#4A69E2",
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Rubik-Regular",
    color: "#666666",
  },
  statusTextActive: {
    color: "#4A69E2",
    fontFamily: "Rubik-Medium",
  },
  ordersContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F5F5F5",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  storeName: {
    fontSize: 14,
    fontFamily: "Rubik-Medium",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Rubik-Regular",
  },
  orderStatus: {
    fontSize: 14,
    fontFamily: "Rubik-Regular",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  productContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: "#F5F5F5",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontFamily: "Rubik-Regular",
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  quantity: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Rubik-Regular",
    marginRight: 12,
  },
  sizeText: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Rubik-Regular",
    marginRight: 12,
  },
  colorText: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Rubik-Regular",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    color: "#4A69E2",
    fontFamily: "Rubik-Medium",
    marginRight: 8,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
  },
  totalText: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Rubik-Regular",
    marginRight: 8,
  },
  totalPrice: {
    fontSize: 16,
    color: "#4A69E2",
    fontFamily: "Rubik-Medium",
  },
  buyAgainButton: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#4A69E2",
  },
  buyAgainText: {
    fontSize: 14,
    color: "#4A69E2",
    fontFamily: "Rubik-Regular",
  },
  cancelButton: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  cancelButtonText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  refundButton: {
    borderColor: "#FFA726",
    backgroundColor: "#FFF8E1",
  },
  refundButtonText: {
    color: "#FFA726",
    fontWeight: "600",
  },
  reviewButton: {
    borderColor: "#66BB6A",
    backgroundColor: "#F1F8E9",
  },
  reviewButtonText: {
    color: "#66BB6A",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    fontFamily: "Rubik-Regular",
  },
});

export default OrderHistory;
