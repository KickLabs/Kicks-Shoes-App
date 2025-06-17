import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
// @ts-ignore
import { orders } from "../../mockData";

interface Order {
  id: number;
  customer: string;
  date: string;
  amount: number;
  status: string;
  items: { productId: number; name: string; quantity: number; price: number }[];
}

const shippedOrders = (orders as Order[]).filter(
  (order) => order.customer === "John Doe" && order.status === "shipped"
);

const OrderShipped = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Shipped Orders</Text>
    <FlatList
      data={shippedOrders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.orderItem}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text>Date: {item.date}</Text>
          <Text>Amount: ${item.amount}</Text>
          <Text style={styles.productsTitle}>Products:</Text>
          {item.items.map((product, idx) => (
            <View key={idx} style={styles.productItem}>
              <Text>- {product.name} (x{product.quantity}) - ${product.price}</Text>
            </View>
          ))}
        </View>
      )}
      ListEmptyComponent={<Text>No shipped orders.</Text>}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    backgroundColor: "#e7e7e3",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
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

export default OrderShipped; 