import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

type Category = {
  name: string;
  image: any;
  onPress: () => void;
};

type CategorySectionProps = {
  categories: Category[];
  onPrev: () => void;
  onNext: () => void;
};

const CategorySection = ({
  categories,
  onPrev,
  onNext,
}: CategorySectionProps) => (
  <View style={styles.container}>
    <View style={styles.headerRow}>
      <Text style={styles.title}>Categories</Text>
      <View style={styles.sliderBtns}>
        <TouchableOpacity onPress={onPrev} style={styles.sliderBtn}>
          <Text style={styles.sliderBtnText}>{"<"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={styles.sliderBtn}>
          <Text style={styles.sliderBtnText}>{">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
    {categories.map((cat, idx) => (
      <TouchableOpacity
        key={idx}
        style={[
          styles.catCard,
          idx === 0 && {
            borderTopLeftRadius: 32,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
          idx === categories.length - 1 && {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 0,
            marginBottom: 0,
          },
          idx !== 0 && idx !== categories.length - 1 && { borderRadius: 0 },
          idx !== categories.length - 1
            ? { marginBottom: 0 }
            : { marginBottom: 0 },
          { backgroundColor: "#F5F6F8", marginHorizontal: 0, width: "100%" },
        ]}
        onPress={cat.onPress}
      >
        <Image
          source={cat.image}
          style={[
            styles.catImage,
            idx === 0 && {
              borderTopLeftRadius: 32,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
            idx === categories.length - 1 && {
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 0,
            },
            idx !== 0 && idx !== categories.length - 1 && { borderRadius: 0 },
          ]}
        />
        <Text style={styles.catName}>{cat.name}</Text>
        <View style={styles.arrowBtn}>
          <Text style={styles.arrowText}>↗</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.black,
    padding: 0,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: "Rubik-SemiBold",
    marginBottom: 0,
  },
  sliderBtns: {
    flexDirection: "row",
  },
  sliderBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 4,
    padding: 6,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderBtnText: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: "Rubik-Medium",
  },
  catCard: {
    backgroundColor: "#F5F6F8",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 24,
    marginTop: 0,
    padding: 0,
    flexDirection: "column",
    alignItems: "flex-start",
    overflow: "hidden",
    marginHorizontal: 0,
    width: "100%",
  },
  catImage: {
    width: "100%",
    height: 250,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    resizeMode: "cover",
  },
  catName: {
    fontSize: 26,
    color: "#222",
    fontFamily: "Rubik-SemiBold",
    marginTop: 18,
    marginBottom: 24,
    marginLeft: 18,
    textAlign: "left",
  },
  arrowBtn: {
    backgroundColor: COLORS.black,
    borderRadius: 10,
    paddingBottom: 8,
    paddingTop: 4,
    paddingHorizontal: 12,
    position: "absolute",
    right: 18,
    bottom: 18,
  },
  arrowText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CategorySection;
