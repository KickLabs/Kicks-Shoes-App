import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/common/button/custom.button";
import userService from "@/services/user";
const EditProfileScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [aboutMe, setAboutMe] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      console.log("Profile data in edit screen:", data);
      setProfile(data);
      // Set form values
      setFullName((data as any)?.fullName || "");
      setEmail((data as any)?.email || "");
      setPhone((data as any)?.phone || "");
      setAddress((data as any)?.address || "");
      setAboutMe((data as any)?.aboutMe || "");
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const updateData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        aboutMe: aboutMe.trim(),
      };
      console.log("Updating profile with:", updateData);
      await userService.updateProfile(updateData);
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#222" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.container}
      >
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
            {profile?.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={{ width: 110, height: 110, borderRadius: 55 }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="camera-outline" size={48} color="#bbb" />
            )}
          </View>
          <TouchableOpacity>
            <Text style={styles.changeAvatarText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
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

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
            multiline={true}
            numberOfLines={2}
          />

          <Text style={styles.label}>About Me</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={aboutMe}
            onChangeText={setAboutMe}
            placeholder="Tell us about yourself"
            multiline={true}
            numberOfLines={3}
          />
        </View>

        <CustomButton
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSaveChanges}
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
        />
        {saving && (
          <View style={styles.savingContainer}>
            <ActivityIndicator size="small" color="#222" />
            <Text style={styles.savingText}>Updating profile...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
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
  backButton: { padding: 8, marginRight: 0, zIndex: 2 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginLeft: -32,
  },
  avatarSection: { alignItems: "center", marginVertical: 28 },
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
  form: { paddingHorizontal: 20, marginTop: 8 },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  savingText: { marginLeft: 8, fontSize: 14, color: "#666" },
});
export default EditProfileScreen;
