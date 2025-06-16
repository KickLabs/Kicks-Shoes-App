import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

type ReviewCardProps = {
  avatar: any;
  name: string;
  rating: number;
  content: string;
  productImage: any;
};

const ReviewCard = ({
  avatar,
  name,
  rating,
  content,
  productImage,
}: ReviewCardProps) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.content}>{content}</Text>
        <View style={styles.ratingRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Text key={i} style={styles.star}>
              ★
            </Text>
          ))}
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
      <Image source={avatar} style={styles.avatar} />
    </View>
    <Image source={productImage} style={styles.productImage} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 0,
    marginBottom: 0,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 24,
    paddingBottom: 0,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginLeft: 16,
  },
  name: {
    fontFamily: "Rubik-Bold",
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 0,
  },
  content: {
    fontFamily: "Rubik-Regular",
    fontSize: 16,
    color: "#888",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  star: {
    color: "#FFA800",
    fontSize: 22,
    marginRight: 2,
    marginBottom: 10,
  },
  ratingText: {
    fontFamily: "Rubik-Medium",
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 8,
  },
  productImage: {
    width: "100%",
    height: 220,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginTop: 0,
  },
});

export default ReviewCard;
