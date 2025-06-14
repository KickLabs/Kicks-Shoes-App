import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import ShareInput from "@/components/input/share.input";
// import { useCurrentApp } from "@/context/app.context";
import { loginAPI } from "@/services/api";
import { RootStackParamList } from "@/types/navigation";
import { APP_COLOR } from "@/utils/constant";
import { LoginSchema } from "@/utils/validate.schema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    gap: 10
  }
});

const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState<boolean>(false);
  // const { setAppState } = useCurrentApp();

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await loginAPI(email, password);
      setLoading(false);
      if (res.data) {
        await AsyncStorage.setItem(
          "access_token",
          res.data.tokens.access_token
        );
        // setAppState(res.data);
        navigation.replace("Home");
      } else {
        const m = Array.isArray(res.message) ? res.message[0] : res.message;
        Toast.show(m, {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1 // tham so cua thu vien. opacity là độ mờ của backgourd mặc định là 0.8
        });

        if (res.statusCode === 400) {
          navigation.replace("Home");
        }
      }
    } catch (error: any) {
      setLoading(false);
      console.log(">>> check err.message: ", error?.message);
      console.log(">>> check err.response: ", error?.response?.data);

      Toast.show("Đăng nhập thất bại. Vui lòng thử lại!", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        validationSchema={LoginSchema}
        initialValues={{ email: "", password: "" }}
        onSubmit={(values) => handleLogin(values.email, values.password)}
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
                Đăng nhập
              </Text>
            </View>

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
              loading={loading}
              title="ĐĂNG NHẬP"
              // onPress={handleLogin as any}
              onPress={handleSubmit as any}
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
                Chưa có tài khoản?
              </Text>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text
                  style={{ textDecorationLine: "underline", color: "black" }}
                >
                  Đăng ký
                </Text>
              </Pressable>
            </View>
            <SocialButton title="Đăng nhập với" />
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default LoginScreen;
