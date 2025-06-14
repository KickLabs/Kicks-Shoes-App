// import LoadingOverlay from "@/components/loading/overlay";
// import { resendCodeAPI, verifyCodeAPI } from "@/services/api";
// import { RootStackParamList } from "@/types/navigation";
// import { APP_COLOR } from "@/utils/constant";
// import { RouteProp } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { useEffect, useRef, useState } from "react";
// import { Keyboard, StyleSheet, Text, View } from "react-native";
// import OTPTextView from "react-native-otp-textinput";
// import Toast from "react-native-root-toast";

// const styles = StyleSheet.create({
//   container: {
//     paddingVertical: 30,
//     paddingHorizontal: 20
//   },
//   heading: {
//     fontSize: 25,
//     fontWeight: "600",
//     marginVertical: 20
//   }
// });

// type VerifyProps = {
//   route: RouteProp<RootStackParamList, "Verify">;
//   navigation: NativeStackNavigationProp<RootStackParamList, "Verify">;
// };

// const VerifyPage: React.FC<VerifyProps> = ({ route, navigation }) => {
//   const [isSubmit, setIsSubmit] = useState<boolean>(false);
//   const otpRef = useRef<OTPTextView>(null);
//   const [code, setCode] = useState<string>("");
//   const { email, isLogin } = route.params;

//   const verifyCode = async () => {
//     setIsSubmit(true);
//     Keyboard.dismiss();
//     const res = await verifyCodeAPI(email as string, code);
//     setIsSubmit(false);
//     if (res.data) {
//       //succes
//       alert("succes");
//       otpRef?.current?.clear();
//       Toast.show("Kích hoạt tài khoản thành công", {
//         duration: Toast.durations.LONG,
//         textColor: "white",
//         backgroundColor: APP_COLOR.ORANGE,
//         opacity: 1 // tham so cua thu vien. opacity là độ mờ của backgourd mặc định là 0.8
//       });

//       if (isLogin) {
//         navigation.replace("Home");
//       } else navigation.replace("Login"); // replace để không back lại được
//     } else {
//       Toast.show(Array.isArray(res.message) ? res.message[0] : res.message, {
//         duration: Toast.durations.LONG,
//         textColor: "white",
//         backgroundColor: APP_COLOR.ORANGE,
//         opacity: 1 // tham so cua thu vien. opacity là độ mờ của backgourd mặc định là 0.8
//       });
//     }
//   };
//   useEffect(() => {
//     if (code && code.length === 6) {
//       verifyCode();
//     }
//   }, [code]);

//   const handleResendCode = async () => {
//     otpRef?.current?.clear();
//     //call api
//     const res = await resendCodeAPI(email as string);
//     const m = res.data ? "Resend code thanh cong" : res.message;
//     Toast.show(m as string, {
//       duration: Toast.durations.LONG,
//       textColor: "white",
//       backgroundColor: APP_COLOR.ORANGE,
//       opacity: 1 // tham so cua thu vien. opacity là độ mờ của backgourd mặc định là 0.8
//     });
//   };

//   return (
//     <>
//       <View style={styles.container}>
//         <Text style={styles.heading}>Xác thực tài khoản</Text>
//         <Text style={{ marginVertical: 10 }}>
//           Vui lòng nhập mã xác nhận đã được gửi tới địa chỉ{" "}
//         </Text>
//         <View style={{ marginVertical: 20 }}>
//           <OTPTextView
//             ref={otpRef}
//             handleTextChange={setCode}
//             autoFocus
//             inputCount={6}
//             inputCellLength={1}
//             tintColor={APP_COLOR.ORANGE}
//             textInputStyle={{
//               borderWidth: 1,
//               borderColor: APP_COLOR.GREY,
//               borderBottomWidth: 1,
//               borderRadius: 5,
//               // @ts-ignore: next-line, // djt me ao vl comment code ma` fix dc color
//               color: APP_COLOR.ORANGE
//             }}
//           />
//         </View>
//         <View style={{ flexDirection: "row", marginVertical: 10 }}>
//           <Text>Không nhận được mã xác nhận,</Text>
//           <Text
//             style={{ textDecorationLine: "underline" }}
//             onPress={handleResendCode}
//           >
//             {" "}
//             gửi lại
//           </Text>
//         </View>
//       </View>
//       {isSubmit && <LoadingOverlay />}
//     </>
//   );
// };

// export default VerifyPage;
