import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/common/button/custom.button";

const EditProfileScreen = ({ navigation }: { navigation: any }) => {
  const [name, setName] = useState("Tran Phuc Tien");
  const [email, setEmail] = useState("tranphuctien@email.com");
  const [phone, setPhone] = useState("090-123-4567");

  const handleSaveChanges = () => {
    console.log("Saved:", { name, email, phone });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="camera-outline" size={48} color="#bbb" />
          </View>
          <TouchableOpacity>
            <Text style={styles.changeAvatarText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter your email"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
          />
        </View>

        <CustomButton
          title="Save Changes"
          onPress={handleSaveChanges}
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    position: "relative",
  },
  backButton: {
    padding: 8,
    marginRight: 0,
    zIndex: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginLeft: -32,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 28,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  changeAvatarText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  form: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 18,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#222",
    marginBottom: 2,
  },
  saveButton: {
    backgroundColor: "#222",
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 32,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default EditProfileScreen;
