import React from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
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

const deliveredOrders = (orders as Order[]).filter(
  (order) => order.customer === "John Doe" && order.status === "delivered"
);

const OrderDelivered = () => {
  const navigation = useNavigation();

  const handleRefund = (orderId: number) => {
    Alert.alert(
      "Refund Confirmation",
      "Are you sure you want to refund this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            // Chỉ hiển thị thông báo xác nhận, không cập nhật status và không chuyển trang
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivered Orders</Text>
      <FlatList
        data={deliveredOrders}
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
            <View style={styles.refundBtn}>
              <Button title="Refund" color="#1976d2" onPress={() => handleRefund(item.id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No delivered orders.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  refundBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: 100,
  },
});

export default OrderDelivered; 