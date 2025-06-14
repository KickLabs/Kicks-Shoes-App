import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ClubInfo = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Join Kicks Club Get Rewarded Today.</Text>
    <Text style={styles.desc}>
      As kicks club member you get rewarded with what you love for doing what
      you love. Sign up today and receive immediate access to these Level 1
      benefits:
    </Text>
    <View style={styles.benefits}>
      <Text style={styles.benefit}>• Free shipping</Text>
      <Text style={styles.benefit}>
        • A 15% off voucher for your next purchase
      </Text>
      <Text style={styles.benefit}>
        • Access to Members Only products and sales
      </Text>
      <Text style={styles.benefit}>
        • Access to adidas Running and Training apps
      </Text>
      <Text style={styles.benefit}>• Special offers and promotions</Text>
    </View>
    <Text style={styles.desc}>
      Join now to start earning points, reach new levels and unlock more rewards
      and benefits from adiClub.
    </Text>
    <TouchableOpacity style={styles.joinBtn}>
      <Text style={styles.joinBtnText}>JOIN THE CLUB</Text>
      <Ionicons
        name="arrow-forward"
        size={20}
        color="#fff"
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
  },
  desc: {
    color: "#222",
    fontSize: 14,
    marginBottom: 6,
  },
  benefits: {
    marginBottom: 6,
  },
  benefit: {
    fontSize: 14,
    color: "#222",
  },
  joinBtn: {
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 8,
  },
  joinBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ClubInfo;
