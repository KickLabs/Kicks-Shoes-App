import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";

const icons = [
  { name: "home", label: "Home", route: "Home" },
  { name: "cart-outline", label: "Cart", route: "Cart" },
  { name: "heart-outline", label: "Wishlist", route: "Wishlist" },
  { name: "time-outline", label: "Orders", route: "OrderHistory" },
  { name: "person-outline", label: "Profile", route: "Profile" },
];

const Footer: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  if (!state) return null;
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        {icons.map((item, idx) => {
          const isFocused = state.index === idx;
          return (
            <TouchableOpacity
              key={item.route}
              style={styles.item}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: state.routes[idx].key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(item.route);
                }
              }}
            >
              <Ionicons
                name={item.name as any}
                size={22}
                color={isFocused ? "#232321" : "#888"}
              />
              <Text
                style={[
                  styles.label,
                  isFocused && { color: "#232321", fontWeight: "600" },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 6,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  item: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
});

export default Footer;
