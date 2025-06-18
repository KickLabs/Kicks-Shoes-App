import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image
} from "react-native";
import CustomCheckbox from "./CustomCheckbox";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const navigation = useNavigation();

  const handleRegister = () => {
    navigation.navigate("Register" as never);
  };

  const handleLogin = () => {
    navigation.navigate("Profile" as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TouchableOpacity>
        <Text style={styles.forgot}>Forgot your password?</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.checkboxRow}>
        <CustomCheckbox value={keepLoggedIn} onValueChange={setKeepLoggedIn} />
        <Text style={styles.checkboxText}>
          Keep me logged in - applies to all log in options below. More info
        </Text>
      </View>
      <TouchableOpacity onPress={handleLogin} style={styles.loginBtn}>
        <Text style={styles.loginBtnText}>EMAIL LOGIN</Text>
        <Ionicons
          name="arrow-forward"
          size={20}
          color="#fff"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={require("../../../assets/images/google-logo.png")}
            style={{ width: 22, height: 22, resizeMode: "contain" }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <FontAwesome name="apple" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={require("../../../assets/images/facebook-logo.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.registerRow}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.terms}>
        By clicking 'Log In' you agree to our website KicksClub Terms &
        Conditions, Kicks Privacy Notice and Terms & Conditions.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 4
  },
  forgot: {
    color: "#222",
    textDecorationLine: "underline",
    marginBottom: 10,
    fontWeight: "500"
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff"
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  checkboxText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#222",
    flex: 1
  },
  loginBtn: {
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 12
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  socialBtn: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    marginHorizontal: 4,
    padding: 8,
    backgroundColor: "#fff"
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8
  },
  registerText: {
    fontSize: 14,
    color: "#222"
  },
  registerLink: {
    fontSize: 14,
    color: "#222",
    fontWeight: "bold",
    textDecorationLine: "underline"
  },
  terms: {
    fontSize: 12,
    color: "#222",
    marginTop: 8
  }
});

export default LoginForm;
