import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Toast from "react-native-root-toast";
import authService from "@/services/auth";
import { useNavigation } from "@react-navigation/native";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    if (!email) {
      Toast.show("Please enter your email.", {
        duration: Toast.durations.SHORT,
      });
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      Toast.show("A password reset link has been sent.", {
        duration: Toast.durations.LONG,
      });
      navigation.goBack();
    } catch (err: any) {
      Toast.show(
        err?.message || "Failed to send reset email. Please try again.",
        { duration: Toast.durations.LONG }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.desc}>
        Enter your email address and we'll send you a link to reset your
        password.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: "stretch",
    marginTop: 30,
  },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    color: "#222",
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#222",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backText: {
    color: "#222",
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 8,
  },
});

export default ForgotPasswordScreen;
