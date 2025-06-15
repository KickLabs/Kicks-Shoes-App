import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

type Props = {
  categories: string[];
  onSelect: (category: string) => void;
};

const HomeCategories = ({ categories, onSelect }: Props) => (
  <View style={styles.categories}>
    <Text style={styles.sectionTitle}>Categories</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={styles.categoryItem}
          onPress={() => onSelect(category)}
        >
          <Text style={styles.categoryText}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  categories: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h2,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  categoryItem: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base,
  },
  categoryText: {
    color: COLORS.black,
    fontSize: SIZES.body3,
  },
});

export default HomeCategories;
