import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";
import { AntDesign, Feather } from "@expo/vector-icons"; // dùng icon đẹp

interface OrderItem {
  name: string;
  description: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

const OrderItem: React.FC<OrderItem> = ({
  name,
  description,
  color,
  size,
  quantity,
  price,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Order Detail</Text>

      <View style={styles.container}>
        <Image
          source={{
            uri: "https://sneakernews.com/wp-content/uploads/2020/12/adidas-Ultra-Boost-1.0-DNA-H68156-8.jpg?w=1140",
          }}
          style={styles.image}
        />
        <View style={styles.details}>
          <Text style={styles.name}>{name.toUpperCase()}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.color}>{color}</Text>
          <View style={styles.row}>
            <Text style={styles.meta}>Size {size}</Text>
            <Text style={styles.meta}>Quantity {quantity}</Text>
          </View>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.icon}>
            <AntDesign name="hearto" size={20} color={COLORS.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}>
            <Feather name="trash-2" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1F1ED",
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 2,
  },
  color: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: COLORS.gray,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F55D4", // xanh đậm
  },
  actions: {
    marginLeft: 8,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    padding: 6,
  },
});

export default OrderItem;
