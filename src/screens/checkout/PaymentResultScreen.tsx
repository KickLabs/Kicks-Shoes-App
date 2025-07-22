import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Define colors locally
const COLORS = {
  black: "#000000",
  gray: "#666666",
  green: "#28a745",
  red: "#dc3545",
};

interface PaymentResultParams {
  success: string;
  message: string;
  txnRef: string;
  amount: string;
  responseCode: string;
  orderId?: string;
  orderNumber?: string;
  orderStatus?: string;
  paymentStatus?: string;
}

const PaymentResultScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as PaymentResultParams;

  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentResultParams | null>(
    null
  );

  useEffect(() => {
    if (params) {
      setIsSuccess(params.success === "true");
      setPaymentInfo(params);
      console.log("[PaymentResult] Received params:", params);
    }
  }, [params]);

  const handleBackToHome = () => {
    (navigation as any).navigate("Home");
  };

  const handleViewOrder = () => {
    if (paymentInfo?.orderId) {
      (navigation as any).navigate("OrderDetails", {
        orderId: paymentInfo.orderId,
      });
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseInt(amount) || 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  if (!paymentInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Đang xử lý kết quả thanh toán...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Status Icon */}
        <View
          style={[
            styles.iconContainer,
            isSuccess ? styles.successBg : styles.errorBg,
          ]}
        >
          <Ionicons
            name={isSuccess ? "checkmark-circle" : "close-circle"}
            size={80}
            color={isSuccess ? COLORS.green : COLORS.red}
          />
        </View>

        {/* Status Message */}
        <Text
          style={[
            styles.statusTitle,
            isSuccess ? styles.successText : styles.errorText,
          ]}
        >
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại!"}
        </Text>

        <Text style={styles.statusMessage}>
          {paymentInfo.message ||
            (isSuccess
              ? "Giao dịch đã được xử lý thành công"
              : "Có lỗi xảy ra trong quá trình thanh toán")}
        </Text>

        {/* Payment Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Chi tiết giao dịch</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã giao dịch:</Text>
            <Text style={styles.detailValue}>{paymentInfo.txnRef}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tiền:</Text>
            <Text style={styles.detailValue}>
              {formatAmount(paymentInfo.amount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã phản hồi:</Text>
            <Text style={styles.detailValue}>{paymentInfo.responseCode}</Text>
          </View>

          {paymentInfo.orderNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số đơn hàng:</Text>
              <Text style={styles.detailValue}>{paymentInfo.orderNumber}</Text>
            </View>
          )}

          {paymentInfo.paymentStatus && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trạng thái thanh toán:</Text>
              <Text
                style={[
                  styles.detailValue,
                  isSuccess ? styles.successText : styles.errorText,
                ]}
              >
                {paymentInfo.paymentStatus === "paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isSuccess && paymentInfo.orderId && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewOrder}
            >
              <Text style={styles.primaryButtonText}>Xem đơn hàng</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.secondaryButton, !isSuccess && styles.primaryButton]}
            onPress={handleBackToHome}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                !isSuccess && styles.primaryButtonText,
              ]}
            >
              Về trang chủ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  successBg: {
    backgroundColor: "#e8f5e8",
  },
  errorBg: {
    backgroundColor: "#fdeaea",
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  successText: {
    color: COLORS.green || "#28a745",
  },
  errorText: {
    color: COLORS.red || "#dc3545",
  },
  statusMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 20,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.black,
    flex: 1,
    textAlign: "right",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PaymentResultScreen;
