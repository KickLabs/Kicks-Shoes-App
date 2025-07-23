import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as adminService from "../../services/adminService";

interface OrderDetailsModalProps {
  visible: boolean;
  orderId: string | null;
  onClose: () => void;
  onStatusUpdate: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  visible,
  orderId,
  onClose,
  onStatusUpdate,
}) => {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusDraft, setStatusDraft] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (visible && orderId) {
      fetchOrderDetails();
    }
  }, [visible, orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const details = await adminService.getOrderDetails(orderId);
      setOrderDetails(details);
      setStatusDraft(details.status || "pending");
    } catch (error) {
      console.error("Error fetching order details:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!orderId || !statusDraft) return;

    try {
      setUpdating(true);
      await adminService.updateOrderStatus(orderId, statusDraft);
      onStatusUpdate();
      onClose();
      Alert.alert("Success", "Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₫${amount.toLocaleString("vi-VN")}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "processing":
        return "#3B82F6";
      case "shipped":
        return "#8B5CF6";
      case "delivered":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      case "refunded":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "failed":
        return "#EF4444";
      case "refunded":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
          ) : orderDetails ? (
            <ScrollView
              style={{}}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={true}
            >
              {/* Order Summary */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Order Number:</Text>
                    <Text style={styles.value}>
                      #{orderDetails.orderNumber}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Created:</Text>
                    <Text style={styles.value}>
                      {formatDate(orderDetails.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Updated:</Text>
                    <Text style={styles.value}>
                      {formatDate(orderDetails.updatedAt)}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(orderDetails.status),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {orderDetails.status?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Payment Status:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getPaymentStatusColor(
                            orderDetails.paymentStatus
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {orderDetails.paymentStatus?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Total Amount:</Text>
                    <Text
                      style={[
                        styles.value,
                        { color: "#10B981", fontWeight: "bold" },
                      ]}
                    >
                      {formatCurrency(orderDetails.totalPrice || 0)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Customer Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <View style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>
                      {typeof orderDetails.user === "string"
                        ? orderDetails.user
                        : orderDetails.user?.fullName || "N/A"}
                    </Text>
                  </View>
                  {orderDetails.user?.email && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Email:</Text>
                      <Text style={styles.value}>
                        {orderDetails.user.email}
                      </Text>
                    </View>
                  )}
                  {orderDetails.user?.phone && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Phone:</Text>
                      <Text style={styles.value}>
                        {orderDetails.user.phone}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Shipping Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shipping Information</Text>
                <View style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={[styles.value, { flex: 1 }]}>
                      {orderDetails.shippingAddress || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Method:</Text>
                    <Text style={styles.value}>
                      {orderDetails.shippingMethod || "standard"}
                    </Text>
                  </View>
                  {orderDetails.shippingCost > 0 && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Shipping Cost:</Text>
                      <Text style={styles.value}>
                        {formatCurrency(orderDetails.shippingCost)}
                      </Text>
                    </View>
                  )}
                  {orderDetails.trackingNumber && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Tracking:</Text>
                      <Text style={styles.value}>
                        {orderDetails.trackingNumber}
                      </Text>
                    </View>
                  )}
                  {orderDetails.estimatedDelivery && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Est. Delivery:</Text>
                      <Text style={styles.value}>
                        {formatDate(orderDetails.estimatedDelivery)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Payment Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Information</Text>
                <View style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Method:</Text>
                    <Text style={styles.value}>
                      {orderDetails.paymentMethod || "N/A"}
                    </Text>
                  </View>
                  {orderDetails.paymentDate && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Payment Date:</Text>
                      <Text style={styles.value}>
                        {formatDate(orderDetails.paymentDate)}
                      </Text>
                    </View>
                  )}
                  {orderDetails.transactionId && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Transaction ID:</Text>
                      <Text style={styles.value}>
                        {orderDetails.transactionId}
                      </Text>
                    </View>
                  )}
                  {orderDetails.vnpTxnRef && (
                    <View style={styles.row}>
                      <Text style={styles.label}>VNPay Ref:</Text>
                      <Text style={styles.value}>{orderDetails.vnpTxnRef}</Text>
                    </View>
                  )}
                  {orderDetails.vnpBankCode && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Bank Code:</Text>
                      <Text style={styles.value}>
                        {orderDetails.vnpBankCode}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Order Items */}
              {orderDetails.items && orderDetails.items.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Order Items</Text>
                  {orderDetails.items.map((item: any, index: number) => (
                    <View key={index} style={styles.itemCard}>
                      <Image
                        source={{
                          uri:
                            item.product?.mainImage ||
                            item.product?.image ||
                            "",
                        }}
                        style={styles.itemImage}
                        defaultSource={require("../../../assets/images/welcome.png")}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>
                          {item.product?.name || "Unknown Product"}
                        </Text>
                        <Text style={styles.itemDetails}>
                          Size: {item.size} • Color: {item.color}
                        </Text>
                        <Text style={styles.itemDetails}>
                          Quantity: {item.quantity} ×{" "}
                          {formatCurrency(item.price)}
                        </Text>
                        <Text style={styles.itemSubtotal}>
                          Subtotal:{" "}
                          {formatCurrency(
                            item.subtotal || item.quantity * item.price
                          )}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Financial Summary */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Financial Summary</Text>
                <View style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Subtotal:</Text>
                    <Text style={styles.value}>
                      {formatCurrency(orderDetails.subtotal || 0)}
                    </Text>
                  </View>
                  {orderDetails.shippingCost > 0 && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Shipping:</Text>
                      <Text style={styles.value}>
                        {formatCurrency(orderDetails.shippingCost)}
                      </Text>
                    </View>
                  )}
                  {orderDetails.tax > 0 && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Tax:</Text>
                      <Text style={styles.value}>
                        {formatCurrency(orderDetails.tax)}
                      </Text>
                    </View>
                  )}
                  {orderDetails.discount > 0 && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Discount:</Text>
                      <Text style={[styles.value, { color: "#10B981" }]}>
                        -{formatCurrency(orderDetails.discount)}
                      </Text>
                    </View>
                  )}
                  {orderDetails.discountCode && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Discount Code:</Text>
                      <Text style={styles.value}>
                        {orderDetails.discountCode}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.row,
                      {
                        borderTopWidth: 1,
                        borderTopColor: "#E5E7EB",
                        paddingTop: 8,
                        marginTop: 8,
                      },
                    ]}
                  >
                    <Text style={[styles.label, { fontWeight: "bold" }]}>
                      Total:
                    </Text>
                    <Text
                      style={[
                        styles.value,
                        { fontWeight: "bold", color: "#10B981" },
                      ]}
                    >
                      {formatCurrency(orderDetails.totalPrice || 0)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Notes */}
              {orderDetails.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <View style={styles.card}>
                    <Text style={styles.notesText}>{orderDetails.notes}</Text>
                  </View>
                </View>
              )}

              {/* Refund Information */}
              {(orderDetails.refundedAt ||
                orderDetails.refundReason ||
                orderDetails.refundAmount) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Refund Information</Text>
                  <View style={styles.card}>
                    {orderDetails.refundedAt && (
                      <View style={styles.row}>
                        <Text style={styles.label}>Refunded At:</Text>
                        <Text style={styles.value}>
                          {formatDate(orderDetails.refundedAt)}
                        </Text>
                      </View>
                    )}
                    {orderDetails.refundAmount && (
                      <View style={styles.row}>
                        <Text style={styles.label}>Refund Amount:</Text>
                        <Text style={styles.value}>
                          {formatCurrency(orderDetails.refundAmount)}
                        </Text>
                      </View>
                    )}
                    {orderDetails.refundReason && (
                      <View style={styles.row}>
                        <Text style={styles.label}>Reason:</Text>
                        <Text style={[styles.value, { flex: 1 }]}>
                          {orderDetails.refundReason}
                        </Text>
                      </View>
                    )}
                    {orderDetails.refundTransactionNo && (
                      <View style={styles.row}>
                        <Text style={styles.label}>Transaction No:</Text>
                        <Text style={styles.value}>
                          {orderDetails.refundTransactionNo}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Status Update Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Update Order Status</Text>
                <View style={styles.card}>
                  <Text style={styles.pickerLabel}>
                    Current Status: {orderDetails.status}
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={statusDraft}
                      onValueChange={setStatusDraft}
                      style={styles.picker}
                    >
                      <Picker.Item label="Pending" value="pending" />
                      <Picker.Item label="Processing" value="processing" />
                      <Picker.Item label="Shipped" value="shipped" />
                      <Picker.Item label="Delivered" value="delivered" />
                      <Picker.Item label="Cancelled" value="cancelled" />
                      <Picker.Item label="Refunded" value="refunded" />
                    </Picker>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={styles.errorText}>Failed to load order details</Text>
            </View>
          )}

          {/* Footer Actions */}
          {orderDetails && (
            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStatusUpdate}
                style={[styles.saveButton, updating && styles.disabledButton]}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Status</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "92%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "400",
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
    marginTop: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  pickerLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  picker: {
    height: 50,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
});

export default OrderDetailsModal;
