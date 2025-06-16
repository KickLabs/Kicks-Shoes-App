import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

interface CartItemProps {
  name: string;
  description: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

const CartItem: React.FC<CartItemProps> = ({ name, description, color, size, quantity, price }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/100x120" }} // Replace with actual image URL
        style={styles.image}
      />
      <View style={styles.details}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.color}>{color}</Text>
        <Text style={styles.size}>Size {size}</Text>
        <Text style={styles.quantity}>Quantity {quantity}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.heart}>
        {/* Replace with proper icon from @expo/vector-icons */}
        <Text>♥</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  image: {
    width: 100,
    height: 120,
    resizeMode: "contain",
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.black,
  },
  description: {
    fontSize: 12,
    color: COLORS.gray,
  },
  color: {
    fontSize: 12,
    color: COLORS.gray,
  },
  size: {
    fontSize: 12,
    color: COLORS.gray,
  },
  quantity: {
    fontSize: 12,
    color: COLORS.gray,
  },
  price: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 4,
  },
  heart: {
    padding: 8,
  },
});

export default CartItem;