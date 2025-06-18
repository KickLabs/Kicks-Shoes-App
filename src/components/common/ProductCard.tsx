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
          <Text style={styles.buttonText}>VIEW PRODUCT</Text>
          <Text style={styles.price}>
            {" "}
            - ${Math.round(Number(price.toString().replace(/[^\d.]/g, "")))}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;
