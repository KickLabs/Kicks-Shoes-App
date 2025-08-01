import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/theme";

interface ProductCardProps {
  image: any;
  name: string;
  price: string;
  tag?: string;
  onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  name,
  price,
  tag,
  onPress,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        {tag && (
          <View
            style={[
              styles.tag,
              tag === "New" ? styles.tagNew : styles.tagDiscount,
            ]}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        )}
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
        {name.toUpperCase()}
      </Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <View style={styles.buttonTextRow}>
          <Text style={styles.buttonText}>DETAILS</Text>
          <Text style={styles.price}> - {price}</Text>
        </View>
      </TouchableOpacity>
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
    backgroundColor: COLORS.blue,
  },
  tagDiscount: {
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
  name: {
    fontFamily: "Rubik-Bold",
    fontSize: 18,
    color: COLORS.black,
    marginTop: 18,
    marginBottom: 0,
    textAlign: "left",
    height: 48,
  },
  button: {
    backgroundColor: COLORS.black,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 0,
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Rubik-Medium",
    fontSize: 13,
    textAlign: "center",
  },
  buttonTextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  price: {
    color: "#FFB800",
    fontFamily: "Rubik-Bold",
    fontSize: 13,
  },
});

export default ProductCard;
