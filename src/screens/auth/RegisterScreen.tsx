import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import ShareInput from "@/components/input/share.input";
import { registerAPI } from "@/services/api";
import { RootStackParamList } from "@/types/navigation";
import { APP_COLOR } from "@/utils/constant";
import { LoginSchema } from "@/utils/validate.schema";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    gap: 10
  }
});

type RegisterProps = {
  route: RouteProp<RootStackParamList, "Register">;
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

const RegisterScreen: React.FC<RegisterProps> = ({ route, navigation }) => {
  const [name, setName] = useState<string>("");

  const handleSignUp = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const res = await registerAPI(name, email, password);
      if (res.data) {
        navigation.replace("Verify");
      } else {
        Toast.show(Array.isArray(res.message) ? res.message[0] : res.message, {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1 // tham so cua thu vien. opacity là độ mờ của backgourd mặc định là 0.8
        });
      }
    } catch (error) {
      console.log("err: ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        validationSchema={LoginSchema}
        initialValues={{ name: "", email: "", password: "" }}
        onSubmit={(values) =>
          handleSignUp(values.name, values.email, values.password)
        }
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
          <View style={styles.container}>
            <View style={{ padding: 5 }}>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: 600,
                  marginVertical: 30
                }}
              >
                Đăng ký tài khoản
              </Text>
            </View>

            <ShareInput
              title="Họ tên"
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              value={values.name}
              error={errors.name}
            />
            <ShareInput
              title="Email"
              keyboardType="email-address"
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
              error={errors.email}
            />
            <ShareInput
              title="Password"
              secureTextEntry={true}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              value={values.password}
              error={errors.password}
            />
            <View style={{ marginVertical: 10 }}></View>

            <ShareButton
              title="ĐĂNG KÝ"
              onPress={handleSubmit}
              textStyle={{ color: "#fff", paddingVertical: 5 }}
              btnStyle={{
                justifyContent: "center",
                borderRadius: 30,
                marginHorizontal: 35,
                paddingVertical: 12,
                backgroundColor: APP_COLOR.ORANGE,
                borderWidth: 1,
                borderColor: "#505050",
                width: "82%"
              }}
              pressStyle={{ alignSelf: "stretch" }}
            />
            <View
              style={{
                marginVertical: 15,
                flexDirection: "row",
                gap: 10,
                justifyContent: "center"
              }}
            >
              <Text style={{ textAlign: "center", color: "black" }}>
                Đã có tài khoản?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text
                  style={{ textDecorationLine: "underline", color: "black" }}
                >
                  Đăng nhập.
                </Text>
              </TouchableOpacity>
            </View>
            <SocialButton title="Đăng ký với" />
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default RegisterScreen;
