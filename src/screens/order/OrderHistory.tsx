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
import orderService from "@/services/order";

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
  actionButtonContainer: ViewStyle;
  detailsButton: ViewStyle;
  detailsButtonText: TextStyle;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch orders with higher limit to get all orders
        const data = await orderService.getOrders(1, 100);
        console.log("Orders data received:", data);

        // Handle different response structures
        let ordersArray = [];
        if (Array.isArray(data)) {
          ordersArray = data;
        } else if (data && (data as any).orders) {
          ordersArray = (data as any).orders;
        } else if (data && (data as any).data) {
          const dataObj = (data as any).data;
          ordersArray = Array.isArray(dataObj) ? dataObj : dataObj.orders || [];
        }

        console.log("Processed orders array:", ordersArray);
        console.log("Total orders fetched:", ordersArray.length);
        console.log("First order sample:", ordersArray[0]);
        if (ordersArray[0]?.items?.[0]) {
          console.log("First item sample:", ordersArray[0].items[0]);
          console.log(
            "Product in first item:",
            ordersArray[0].items[0].product
          );
        }
        setOrders(ordersArray);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders based on selected status
  const filteredOrders = orders.filter(
    (order) => order.status === selectedStatus
  );

  // Đặt sau khai báo styles
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order History</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Loading orders...</Text>
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
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order History</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
            <Text
              style={[styles.emptyText, { color: "#ff6b6b", marginBottom: 10 }]}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setLoading(true);
                // Re-fetch orders
                const fetchOrders = async () => {
                  try {
                    const data = await orderService.getOrders(1, 100);
                    console.log("Orders data received:", data);

                    let ordersArray = [];
                    if (Array.isArray(data)) {
                      ordersArray = data;
                    } else if (data && (data as any).orders) {
                      ordersArray = (data as any).orders;
                    } else if (data && (data as any).data) {
                      const dataObj = (data as any).data;
                      ordersArray = Array.isArray(dataObj)
                        ? dataObj
                        : dataObj.orders || [];
                    }

                    console.log("Total orders fetched:", ordersArray.length);
                    setOrders(ordersArray);
                  } catch (err: any) {
                    console.error("Error fetching orders:", err);
                    setError("Failed to load orders");
                  } finally {
                    setLoading(false);
                  }
                };
                fetchOrders();
              }}
              style={{
                backgroundColor: "#007AFF",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId, "User requested cancellation");
      // Refresh orders after cancellation with higher limit
      const data = await orderService.getOrders(1, 100);
      let ordersArray = [];
      if (Array.isArray(data)) {
        ordersArray = data;
      } else if (data && (data as any).orders) {
        ordersArray = (data as any).orders;
      } else if (data && (data as any).data) {
        const dataObj = (data as any).data;
        ordersArray = Array.isArray(dataObj) ? dataObj : dataObj.orders || [];
      }
      console.log("Orders refreshed after cancel:", ordersArray.length);
      setOrders(ordersArray);
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const handleRefundOrder = async (orderId: string) => {
    try {
      // Add refund logic here
      console.log("Refund order:", orderId);
    } catch (error) {
      console.error("Error refunding order:", error);
    }
  };

  const handleReviewOrder = (orderId: string) => {
    console.log("Review order:", orderId);
    // Navigate to review screen
    // navigation.navigate("ReviewOrder", { orderId });
  };

  const renderActionButton = (order: Order) => {
    return (
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={[styles.buyAgainButton, styles.detailsButton]}
          onPress={() =>
            navigation.navigate("OrderDetails", { orderId: order._id })
          }
        >
          <Text style={[styles.buyAgainText, styles.detailsButtonText]}>
            View Details
          </Text>
        </TouchableOpacity>

        {order.status === "pending" && (
          <TouchableOpacity
            style={[styles.buyAgainButton, styles.cancelButton]}
            onPress={() => handleCancelOrder(order._id)}
          >
            <Text style={[styles.buyAgainText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}

        {order.status === "shipped" && (
          <TouchableOpacity
            style={[styles.buyAgainButton, styles.refundButton]}
            onPress={() => handleRefundOrder(order._id)}
          >
            <Text style={[styles.buyAgainText, styles.refundButtonText]}>
              Refund
            </Text>
          </TouchableOpacity>
        )}

        {order.status === "delivered" && (
          <TouchableOpacity
            style={[styles.buyAgainButton, styles.reviewButton]}
            onPress={() => handleReviewOrder(order._id)}
          >
            <Text style={[styles.buyAgainText, styles.reviewButtonText]}>
              Review
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
          {filteredOrders.map((order) => {
            // Validate order data
            if (!order || !order._id) {
              console.warn("Invalid order data:", order);
              return null;
            }

            return (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.storeHeader}>
                  <View>
                    <Text style={styles.storeName}>
                      Order #{order.orderNumber || order._id || "Unknown"}
                    </Text>
                    <Text style={styles.orderDate}>
                      {order.createdAt
                        ? formatDate(order.createdAt)
                        : "Unknown Date"}
                    </Text>
                    <Text style={styles.orderDate}>
                      By:{" "}
                      {(order.user as any)?.fullName ||
                        (order.user as any)?.name ||
                        "Unknown User"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.orderStatus,
                      getStatusStyle(order.status || "unknown"),
                    ]}
                  >
                    {capitalizeFirstLetter(order.status || "unknown")}
                  </Text>
                </View>

                {order.items?.map((item: any, index: number) => {
                  if (!item) {
                    console.warn("Invalid item data:", item);
                    return null;
                  }

                  return (
                    <View key={index} style={styles.productContainer}>
                      <Image
                        source={{
                          uri:
                            item.product?.mainImage ||
                            item.mainImage ||
                            item.product?.image,
                        }}
                        style={styles.productImage}
                        defaultSource={require("../../../assets/images/welcome.png")}
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>
                          {item.product?.name || item.name || "Unknown Product"}
                        </Text>
                        <View style={styles.productDetails}>
                          <Text style={styles.quantity}>
                            x{item.quantity || 0}
                          </Text>
                          {item.size && (
                            <Text style={styles.sizeText}>
                              Size: {item.size}
                            </Text>
                          )}
                          {item.color && (
                            <Text style={styles.colorText}>
                              Color: {item.color}
                            </Text>
                          )}
                        </View>
                        <View style={styles.priceContainer}>
                          <Text style={styles.price}>
                            {formatPrice(item.price || 0)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }) || null}

                <View style={styles.orderFooter}>
                  <Text style={styles.totalText}>
                    Total {order.items?.length || 0} item
                    {(order.items?.length || 0) > 1 && "s"}:
                  </Text>
                  <Text style={styles.totalPrice}>
                    {formatPrice(order.totalPrice || 0)}
                  </Text>
                </View>

                {renderActionButton(order)}
              </View>
            );
          })}

          {filteredOrders.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                No {selectedStatus} orders found
              </Text>
              <Text
                style={[
                  styles.emptyText,
                  { fontSize: 14, color: "#999", marginTop: 5 },
                ]}
              >
                Try selecting a different status
              </Text>
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
  actionButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  detailsButton: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
    flex: 1,
    minWidth: 100,
  },
  detailsButtonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default OrderHistory;
