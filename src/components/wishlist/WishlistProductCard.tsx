import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";

interface WishlistProductCardProps {
  image: string;
  name: string;
  price: number;
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercent?: number;
  onPress: () => void;
  onRemove: () => void;
  onAddToCart: () => void;
}

const WishlistProductCard: React.FC<WishlistProductCardProps> = ({
  image,
  name,
  price,
  isNew,
  isOnSale,
  discountPercent,
  onPress,
  onRemove,
  onAddToCart,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.imageBox} onPress={onPress}>
        {(isNew || isOnSale) && (
          <View
            style={[styles.tag, isNew ? styles.tagNew : styles.tagDiscount]}
          >
            <Text style={styles.tagText}>
              {isNew ? "NEW" : isOnSale ? `-${discountPercent}%` : ""}
            </Text>
          </View>
        )}
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
          {name}
        </Text>
        <TouchableOpacity style={styles.iconButton} onPress={onRemove}>
          <Ionicons name="heart" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.button} onPress={onAddToCart}>
          <Text style={styles.buttonText}>
            ADD TO CART<Text style={styles.price}> - ${Math.round(price)}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 0,
    alignItems: "center",
    marginBottom: 10,
    marginRight: 0,
    marginLeft: 0,
    width: "48%",
    minWidth: 150,
    maxWidth: 200,
  },
  imageBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginTop: 14,
    marginBottom: 0,
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  tag: {
    position: "absolute",
    top: 0,
    left: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingVertical: 2,
    paddingHorizontal: 10,
    zIndex: 2,
  },
  tagNew: {
    left: 6,
    borderTopLeftRadius: 10,
    backgroundColor: COLORS.blue,
  },
  tagDiscount: {
    left: 6,
    borderTopLeftRadius: 10,
    backgroundColor: "#FFB800",
  },
  tagText: {
    color: "#fff",
    fontFamily: "Rubik-Medium",
    fontSize: 13,
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: "contain",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 18,
    marginBottom: 0,
    paddingHorizontal: 8,
  },
  name: {
    fontFamily: "Rubik-Bold",
    fontSize: 18,
    color: COLORS.black,
    textAlign: "left",
    height: 48,
    flex: 1,
    marginRight: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.black,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 0,
    marginBottom: 0,
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Rubik-Medium",
    fontSize: 14,
    textAlign: "center",
  },
  price: {
    color: "#FFB800",
    fontFamily: "Rubik-Bold",
    fontSize: 14,
    marginLeft: 10,
    fontWeight: "bold",
  },
});

export default WishlistProductCard;
