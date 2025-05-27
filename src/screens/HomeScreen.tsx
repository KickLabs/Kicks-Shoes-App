import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import Header from "@/components/Header";
import { useExample } from "@/hooks/useExample";

const HomeScreen = () => {
  const { data, loading } = useExample();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Home" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to KicksApp</Text>
        {loading ? <Text>Loading...</Text> : <Text>{data?.message}</Text>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});

export default HomeScreen;
