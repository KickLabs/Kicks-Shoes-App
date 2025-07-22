import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import { Formik } from "formik";
import CustomCheckbox from "../../components/login/CustomCheckbox";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import authService from "@/services/auth";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-root-toast";

interface RegisterFormProps {
  onRegister: (name: string, email: string, password: string) => void;
  onNavigateToLogin: () => void;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 4,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 8,
  },
  socialBtn: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    marginHorizontal: 4,
    padding: 8,
    backgroundColor: "#fff",
  },
  orText: {
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 8,
    color: "#222",
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#222",
    flex: 1,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  passwordDesc: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  registerText: {
    fontSize: 14,
    color: "#222",
  },
  registerLink: {
    fontSize: 14,
    color: "#222",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  loginBtn: {
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 12,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

const RegisterForm: React.FC = () => {
  const [gender, setGender] = useState("");
  const [agree, setAgree] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const handleRegister = async (formData: any) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(formData);
      setLoading(false);
      Toast.show(
        "Registration successful! Please check your email to verify your account.",
        { duration: Toast.durations.LONG }
      );
      navigation.navigate("Login" as never);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Register failed. Please try again.");
    }
  };

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        username: "",
        phone: "",
        address: "",
        email: "",
        password: "",
        confirmPassword: "",
      }}
      onSubmit={(values) => {
        if (!agree) return;
        if (values.password !== values.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        handleRegister({
          fullName: values.firstName + " " + values.lastName,
          username: values.username,
          email: values.email,
          password: values.password,
          phone: values.phone,
          address: values.address,
        });
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Register</Text>
          <Text style={{ color: "#222", marginBottom: 4 }}>Sign up with</Text>
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
          <Text style={styles.orText}>OR</Text>

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={values.firstName}
            onChangeText={handleChange("firstName")}
            onBlur={handleBlur("firstName")}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={values.lastName}
            onChangeText={handleChange("lastName")}
            onBlur={handleBlur("lastName")}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={values.username}
            onChangeText={handleChange("username")}
            onBlur={handleBlur("username")}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={values.phone}
            onChangeText={handleChange("phone")}
            onBlur={handleBlur("phone")}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={values.address}
            onChangeText={handleChange("address")}
            onBlur={handleBlur("address")}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={styles.genderOption}
                onPress={() => setGender(g)}
              >
                <CustomCheckbox
                  value={gender === g}
                  onValueChange={() => setGender(g)}
                />
                <Text style={{ marginLeft: 8 }}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Login Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={values.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={values.password}
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={values.confirmPassword}
            onChangeText={handleChange("confirmPassword")}
            onBlur={handleBlur("confirmPassword")}
            secureTextEntry
          />
          <Text style={styles.passwordDesc}>
            Minimum 8 characters with at least one uppercase, one lowercase, one
            special character and a number
          </Text>

          <View style={styles.termsRow}>
            <CustomCheckbox value={agree} onValueChange={setAgree} />
            <Text style={styles.checkboxText}>
              By clicking 'Log In' you agree to our website KicksClub Terms &
              Conditions, Kicks Privacy Notice and Terms & Conditions.
            </Text>
          </View>
          <View style={styles.termsRow}>
            <CustomCheckbox
              value={keepLoggedIn}
              onValueChange={setKeepLoggedIn}
            />
            <Text style={styles.checkboxText}>
              Keep me logged in - applies to all log in options below. More info
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit as any}
            style={styles.loginBtn}
            disabled={loading || !agree}
          >
            {loading ? (
              <Ionicons
                name="reload"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
            ) : null}
            <Text style={styles.loginBtnText}>REGISTER</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
          {error && (
            <Text
              style={{ color: "red", textAlign: "center", marginBottom: 8 }}
            >
              {error}
            </Text>
          )}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login" as never)}
            >
              <Text style={styles.registerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Formik>
  );
};

export default RegisterForm;
