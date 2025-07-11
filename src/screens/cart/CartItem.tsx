import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { COLORS, SIZES } from "../../constants/theme";
import { AntDesign, Feather } from "@expo/vector-icons";
import { formatVND } from "../../utils/currency";

interface CartItemProps {
  id: string;
  name: string;
  description: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  description,
  color,
  size,
  quantity,
  price,
  image,
  onQuantityChange,
  onRemove,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityIncrease = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    await onQuantityChange(id, quantity + 1);
    setIsUpdating(false);
  };

  const handleQuantityDecrease = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    if (quantity === 1) {
      // Show confirmation dialog
      Alert.alert(
        "Remove Item",
        "Are you sure you want to remove this item from your cart?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            onPress: () => onRemove(id),
            style: "destructive",
          },
        ]
      );
    } else {
      await onQuantityChange(id, quantity - 1);
    }
    setIsUpdating(false);
  };

  const handleRemove = () => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => onRemove(id),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          defaultSource={require("../../../assets/images/welcome.png")}
        />
        <View style={styles.details}>
          <Text style={styles.name}>{name.toUpperCase()}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.color}>{color}</Text>
          <View style={styles.row}>
            <Text style={styles.meta}>Size {size}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={handleQuantityDecrease}
                disabled={isUpdating}
                style={[
                  styles.quantityButton,
                  isUpdating && styles.disabledButton,
                ]}
              >
                <AntDesign name="minus" size={16} color={COLORS.black} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={handleQuantityIncrease}
                disabled={isUpdating}
                style={[
                  styles.quantityButton,
                  isUpdating && styles.disabledButton,
                ]}
              >
                <AntDesign name="plus" size={16} color={COLORS.black} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.price}>{formatVND(price * quantity)}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.icon}>
            <AntDesign name="hearto" size={20} color={COLORS.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon} onPress={handleRemove}>
            <Feather name="trash-2" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
    fontFamily: "Rubik-SemiBold",
  },
  description: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
    fontFamily: "Rubik-Regular",
  },
  color: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
    fontFamily: "Rubik-Regular",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Rubik-Regular",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.blue,
    fontFamily: "Rubik-Bold",
    marginTop: 4,
  },
  actions: {
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 8,
    height: 80,
  },
  icon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginHorizontal: 8,
    minWidth: 16,
    textAlign: "center",
    fontFamily: "Rubik-Medium",
  },
});

export default CartItem;
