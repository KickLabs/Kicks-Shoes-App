import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
// @ts-ignore
import { orders } from "../../mockData";

const statuses = [
  {
    label: "Pending",
    route: "OrderPending",
    status: "pending",
    icon: "time-outline",
  },
  {
    label: "Processing",
    route: "OrderProcessing",
    status: "processing",
    icon: "sync-outline",
  },
  {
    label: "Shipped",
    route: "OrderShipped",
    status: "shipped",
    icon: "cube-outline",
  },
  {
    label: "Delivered",
    route: "OrderDelivered",
    status: "delivered",
    icon: "checkmark-done-outline",
  },
  {
    label: "Cancelled",
    route: "OrderCancelled",
    status: "cancelled",
    icon: "close-circle-outline",
  },
  {
    label: "Refunded",
    route: "OrderRefunded",
    status: "refunded",
    icon: "cash-outline",
  },
];

const getCount = (status: string) =>
  (orders as any[]).filter(
    (order) => order.customer === "John Doe" && order.status === status
  ).length;

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price Asc", value: "priceAsc" },
  { label: "Price Desc", value: "priceDesc" },
];

const sortOrders = (orders: any[], sort: string) => {
  switch (sort) {
    case "newest":
      return [...orders].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    case "oldest":
      return [...orders].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    case "priceAsc":
      return [...orders].sort((a, b) => a.amount - b.amount);
    case "priceDesc":
      return [...orders].sort((a, b) => b.amount - a.amount);
    default:
      return orders;
  }
};

const OrderHistory = () => {
  const navigation = useNavigation();
  const [sort, setSort] = useState("newest");

  const johnOrders = (orders as any[]).filter(
    (order) => order.customer === "John Doe"
  );
  const sortedOrders = sortOrders(johnOrders, sort);

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: 90 }}></View>
      <Text style={styles.title}>Order History</Text>
      <View style={styles.buttonContainer}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status.route}
            style={styles.button}
            onPress={() => navigation.navigate(status.route as never)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name={status.icon as any} size={28} color="#fff" />
              {getCount(status.status) > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {getCount(status.status)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.buttonText}>{status.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.sortContainer}>
        {sortOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortBtn, sort === opt.value && styles.sortBtnActive]}
            onPress={() => setSort(opt.value)}
          >
            <Text
              style={
                sort === opt.value ? styles.sortTextActive : styles.sortText
              }
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Amount: ${item.amount}</Text>
            <Text style={styles.productsTitle}>Products:</Text>
            {item.items.map((product: any, idx: number) => (
              <View key={idx} style={styles.productItem}>
                <Text>
                  - {product.name} (x{product.quantity}) - ${product.price}
                </Text>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={<Text>No orders found.</Text>}
        style={{ marginTop: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#232321",
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 10,
    marginBottom: 10,
    width: "15%",
    alignItems: "center",
    position: "relative",
    marginHorizontal: 0,
  },
  iconWrapper: {
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -16,
    backgroundColor: "#e53935",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    zIndex: 2,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 9,
  },
  buttonText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "500",
    marginTop: 2,
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#eee",
    marginHorizontal: 4,
    marginBottom: 4,
  },
  sortBtnActive: {
    backgroundColor: "#232321",
  },
  sortText: {
    color: "#232321",
    fontWeight: "500",
  },
  sortTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  orderItem: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderId: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  productsTitle: {
    marginTop: 8,
    fontWeight: "bold",
  },
  productItem: {
    marginLeft: 8,
  },
});

export default OrderHistory;
