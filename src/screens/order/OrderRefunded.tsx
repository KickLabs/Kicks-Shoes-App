import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
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

const refundedOrders = (orders as Order[]).filter(
  (order) => order.customer === "John Doe" && order.status === "refunded"
);

const OrderRefunded = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={{ paddingTop: 90 }}></View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8, alignSelf: 'flex-start', zIndex: 10 }}>
        <Ionicons name="arrow-back" size={28} color="#232321" />
      </TouchableOpacity>
      <Text style={styles.title}>Refunded Orders</Text>
      <FlatList
        data={refundedOrders}
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
        ListEmptyComponent={<Text>No refunded orders.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default OrderRefunded; 