import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const KicksPlusPromo = () => {
  const [email, setEmail] = useState("");
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join our KicksPlus Club & get 15% off</Text>
      <Text style={styles.desc}>Sign up for free! Join the community.</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>SUBMIT</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.logo}>KICKS</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4F6DF5",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  desc: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 8,
    flex: 1,
    marginRight: 8,
  },
  submitBtn: {
    backgroundColor: "#222",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logo: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 28,
    letterSpacing: 2,
    marginTop: 8,
  },
});

export default KicksPlusPromo;
