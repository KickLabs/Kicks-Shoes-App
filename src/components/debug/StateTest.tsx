import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const StateTest = () => {
  try {
    // Test Redux state access
    const { user, token } = useSelector((state: RootState) => state.auth);

    console.log("🔍 State Test - Redux auth state:", {
      user: user ? user.name : "null",
      token: token ? "exists" : "null",
    });

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Redux State Test</Text>
        <Text>User: {user ? user.name : "null"}</Text>
        <Text>Token: {token ? "exists" : "null"}</Text>
        <Text>
          Loading:{" "}
          {useSelector((state: RootState) => state.auth.loading).toString()}
        </Text>
        <Text>
          Error: {useSelector((state: RootState) => state.auth.error) || "none"}
        </Text>
      </View>
    );
  } catch (error) {
    console.error("🚨 State Test Error:", error);
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          State mapping error: {(error as Error).message}
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f0",
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  error: {
    color: "red",
    fontSize: 14,
  },
});

export default StateTest;
