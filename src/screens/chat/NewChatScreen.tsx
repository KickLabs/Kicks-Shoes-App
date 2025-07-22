import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useChat } from "@/contexts/ChatContext";
import { RootStackParamList } from "@/types";
import { COLORS } from "@/constants/theme";
import AuthGuard from "@/components/auth/AuthGuard";

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ChatTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
  subject: string;
}

const chatTopics: ChatTopic[] = [
  {
    id: "order",
    title: "Order Support",
    icon: "bag-outline",
    description: "Questions about your orders, tracking, or delivery",
    subject: "Order Support Request",
  },
  {
    id: "product",
    title: "Product Information",
    icon: "information-circle-outline",
    description: "Product details, sizes, availability, or recommendations",
    subject: "Product Information Request",
  },
  {
    id: "payment",
    title: "Payment & Billing",
    icon: "card-outline",
    description: "Payment issues, refunds, or billing questions",
    subject: "Payment & Billing Support",
  },
  {
    id: "account",
    title: "Account Help",
    icon: "person-outline",
    description: "Profile, login issues, or account settings",
    subject: "Account Support Request",
  },
  {
    id: "technical",
    title: "Technical Issues",
    icon: "settings-outline",
    description: "App problems, bugs, or technical difficulties",
    subject: "Technical Support Request",
  },
  {
    id: "general",
    title: "General Support",
    icon: "help-circle-outline",
    description: "Any other questions or feedback",
    subject: "General Support Request",
  },
];

const NewChatScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { createNewConversation, loading } = useChat();

  const [selectedTopic, setSelectedTopic] = useState<ChatTopic | null>(null);
  const [customSubject, setCustomSubject] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const handleTopicSelect = (topic: ChatTopic) => {
    setSelectedTopic(topic);
    if (topic.id !== "general") {
      setCustomSubject(topic.subject);
    } else {
      setCustomSubject("");
    }
  };

  const handleCreateConversation = async () => {
    if (!message.trim()) {
      Alert.alert(
        "Missing Message",
        "Please enter your message to start the conversation."
      );
      return;
    }

    const subject =
      customSubject.trim() ||
      selectedTopic?.subject ||
      "General Support Request";

    try {
      setCreating(true);
      await createNewConversation(message.trim(), subject);

      Alert.alert(
        "Conversation Started",
        "Your conversation has been created. Our support team will respond shortly.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Chat" as any),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      Alert.alert("Error", "Failed to create conversation. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AuthGuard>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Conversation</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeSection}>
            <Ionicons name="chatbubbles" size={48} color={COLORS.primary} />
            <Text style={styles.welcomeTitle}>How can we help you?</Text>
            <Text style={styles.welcomeSubtitle}>
              Select a topic below or describe your issue, and our support team
              will assist you.
            </Text>
          </View>

          <View style={styles.topicsSection}>
            <Text style={styles.sectionTitle}>Select a Topic</Text>
            <View style={styles.topicsGrid}>
              {chatTopics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicCard,
                    selectedTopic?.id === topic.id && styles.selectedTopicCard,
                  ]}
                  onPress={() => handleTopicSelect(topic)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={topic.icon as any}
                    size={32}
                    color={
                      selectedTopic?.id === topic.id
                        ? COLORS.primary
                        : COLORS.gray
                    }
                  />
                  <Text
                    style={[
                      styles.topicTitle,
                      selectedTopic?.id === topic.id &&
                        styles.selectedTopicTitle,
                    ]}
                  >
                    {topic.title}
                  </Text>
                  <Text style={styles.topicDescription}>
                    {topic.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedTopic && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Conversation Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.textInput}
                  value={customSubject}
                  onChangeText={setCustomSubject}
                  placeholder="Enter conversation subject"
                  placeholderTextColor={COLORS.gray}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Message *</Text>
                <TextInput
                  style={[styles.textInput, styles.messageInput]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe your issue or question in detail..."
                  placeholderTextColor={COLORS.gray}
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {message.length}/1000 characters
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!message.trim() || creating) && styles.createButtonDisabled,
                ]}
                onPress={handleCreateConversation}
                disabled={!message.trim() || creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.createButtonText}>
                      Start Conversation
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Response Time</Text>
                <Text style={styles.infoText}>
                  Our support team typically responds within 1-2 hours during
                  business hours.
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.success}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Secure & Private</Text>
                <Text style={styles.infoText}>
                  Your conversations are encrypted and kept confidential.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  topicsSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 16,
  },
  topicsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  topicCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedTopicCard: {
    backgroundColor: "#e3f2fd",
    borderColor: COLORS.primary,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  selectedTopicTitle: {
    color: COLORS.primary,
  },
  topicDescription: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 16,
  },
  formSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    color: COLORS.black,
  },
  messageInput: {
    height: 120,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "right",
    marginTop: 4,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
});

export default NewChatScreen;
