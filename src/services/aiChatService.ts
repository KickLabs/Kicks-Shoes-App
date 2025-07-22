import AsyncStorage from "@react-native-async-storage/async-storage";
import { AI_CONFIG } from "@/constants/config";

interface AIMessage {
  content: string;
  sender: string;
  timestamp: Date;
  isAI: boolean;
}

class AIChatService {
  private conversationId: string | null = null;
  private storageKey: string = "ai_chat_messages";
  private userId: string | null = null;

  constructor() {
    this.validateConfig();
  }

  /**
   * Validate AI configuration
   */
  private validateConfig(): void {
    if (!AI_CONFIG.ENABLE_MOCK_AI) {
      const requiredFields = [
        "AI_API_URL",
        "AI_TOKEN",
        "BOT_ID",
        "GEMINI_API_KEY",
      ];
      const missingFields = requiredFields.filter(
        (field) => !AI_CONFIG[field as keyof typeof AI_CONFIG]
      );

      if (missingFields.length > 0) {
        console.warn(
          "[AIChatService] Missing required AI configuration:",
          missingFields
        );
        console.warn(
          "[AIChatService] Falling back to mock responses. Set EXPO_PUBLIC_ENABLE_MOCK_AI=false to use real AI."
        );
      }
    }
  }

  /**
   * Set user ID để tạo storage key riêng cho mỗi user
   */
  setUserId(userId: string) {
    this.userId = userId;
    this.storageKey = `ai_chat_messages_${userId}`;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Lưu tin nhắn vào AsyncStorage
   */
  async saveMessages(messages: AIMessage[]): Promise<void> {
    try {
      console.log(
        "[AIChatService] Saving messages to AsyncStorage with key:",
        this.storageKey
      );
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error(
        "[AIChatService] Error saving messages to AsyncStorage:",
        error
      );
    }
  }

  /**
   * Lấy tin nhắn từ AsyncStorage
   */
  async loadMessages(): Promise<AIMessage[]> {
    try {
      console.log(
        "[AIChatService] Loading messages from AsyncStorage with key:",
        this.storageKey
      );
      const messages = await AsyncStorage.getItem(this.storageKey);
      const parsedMessages = messages ? JSON.parse(messages) : [];
      console.log("[AIChatService] Loaded messages:", parsedMessages);
      return parsedMessages;
    } catch (error) {
      console.error(
        "[AIChatService] Error loading messages from AsyncStorage:",
        error
      );
      return [];
    }
  }

  /**
   * Xóa tin nhắn từ AsyncStorage
   */
  async clearMessages(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error(
        "[AIChatService] Error clearing messages from AsyncStorage:",
        error
      );
    }
  }

  /**
   * Send a message to the AI and handle streaming response
   */
  async sendMessage(
    message: string,
    onStream: (chunk: string) => void,
    onComplete: (finalResponse: string, fullData?: any) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // Check if should use mock responses
      if (AI_CONFIG.ENABLE_MOCK_AI || !this.hasValidConfig()) {
        console.log("[AIChatService] Using mock AI responses");
        return this.sendMockMessage(message, onStream, onComplete, onError);
      }

      console.log("[AIChatService] Sending real AI request");
      return this.sendRealMessage(message, onStream, onComplete, onError);
    } catch (error) {
      console.error("[AIChatService] AI Chat API Error:", error);
      onError(error as Error);
    }
  }

  /**
   * Check if AI configuration is valid for real API calls
   */
  private hasValidConfig(): boolean {
    return !!(
      AI_CONFIG.AI_API_URL &&
      AI_CONFIG.AI_TOKEN &&
      AI_CONFIG.BOT_ID &&
      AI_CONFIG.GEMINI_API_KEY
    );
  }

  /**
   * Send message to real AI API
   */
  private async sendRealMessage(
    message: string,
    onStream: (chunk: string) => void,
    onComplete: (finalResponse: string, fullData?: any) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // Tạo context cho AI tư vấn sản phẩm giày
      const productContext = `Bạn là AI tư vấn sản phẩm giày chuyên nghiệp. Bạn có kiến thức sâu rộng về:
      - Các loại giày: sneaker, boot, sandal, loafer, oxford, etc.
      - Các thương hiệu nổi tiếng: Nike, Adidas, Puma, Converse, Vans, etc.
      - Chất liệu giày: da, vải, cao su, mesh, etc.
      - Kích thước và cách chọn giày phù hợp
      - Phong cách thời trang và cách phối đồ với giày
      - Giá cả và chất lượng sản phẩm
      
      Hãy tư vấn một cách thân thiện, chuyên nghiệp và hữu ích. Nếu không biết thông tin cụ thể, hãy đề xuất cách tìm hiểu thêm.
      
      Câu hỏi của khách hàng: ${message}`;

      const formData = new FormData();
      formData.append("query", productContext);
      formData.append("bot_id", AI_CONFIG.BOT_ID);
      formData.append("conversation_id", this.conversationId || "");
      formData.append("model_name", AI_CONFIG.AI_MODEL);
      formData.append("api_key", AI_CONFIG.GEMINI_API_KEY);

      console.log("[AIChatService] Sending AI message:", {
        query: message,
        bot_id: AI_CONFIG.BOT_ID,
        conversation_id: this.conversationId || "",
        model_name: AI_CONFIG.AI_MODEL,
      });

      const response = await fetch(AI_CONFIG.AI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_CONFIG.AI_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      let fullResponse = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.type === "message") {
              // Handle streaming message
              fullResponse += data.content;
              onStream(data.content);
            } else if (data.type === "final") {
              // Handle final response
              const finalResponse = data.content.final_response;
              this.conversationId =
                data.content.conversation_id || this.conversationId;
              console.log(
                "[AIChatService] AI response completed:",
                finalResponse
              );
              onComplete(finalResponse, data.content);
              return;
            }
          } catch (parseError) {
            console.warn(
              "[AIChatService] Failed to parse JSON line:",
              line,
              parseError
            );
          }
        }
      }
    } catch (error) {
      console.error("[AIChatService] Real AI API Error:", error);
      onError(error as Error);
    }
  }

  /**
   * Send mock message for development
   */
  private async sendMockMessage(
    message: string,
    onStream: (chunk: string) => void,
    onComplete: (finalResponse: string, fullData?: any) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const mockResponse = this.generateMockAIResponse(message);

      // Simulate streaming response
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < mockResponse.length) {
          const chunk = mockResponse.slice(
            currentIndex,
            currentIndex + AI_CONFIG.STREAM_CHUNK_SIZE
          );
          onStream(chunk);
          currentIndex += AI_CONFIG.STREAM_CHUNK_SIZE;
        } else {
          clearInterval(streamInterval);
          onComplete(mockResponse, { conversation_id: this.conversationId });
        }
      }, AI_CONFIG.STREAM_DELAY);
    } catch (error) {
      console.error("[AIChatService] Mock AI Error:", error);
      onError(error as Error);
    }
  }

  /**
   * Generate mock AI response for development
   */
  private generateMockAIResponse(message: string): string {
    // Context-aware mock responses
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("nike") || lowerMessage.includes("adidas")) {
      return "Cả Nike và Adidas đều là những thương hiệu giày nổi tiếng với chất lượng tuyệt vời! Nike thường nổi bật với công nghệ Air và thiết kế thể thao, trong khi Adidas có công nghệ Boost và phong cách đặc trưng với 3 sọc. Bạn có sở thích nào đặc biệt về thiết kế hay công nghệ không?";
    }

    if (lowerMessage.includes("size") || lowerMessage.includes("cỡ")) {
      return "Việc chọn size giày rất quan trọng! Tôi khuyên bạn nên đo chân vào buổi chiều khi chân hơi phồng tự nhiên. Nên để khoảng 1cm trống ở mũi giày và thử cả hai chân vì có thể khác size. Bạn có biết size chân hiện tại của mình không?";
    }

    if (lowerMessage.includes("chạy") || lowerMessage.includes("running")) {
      return "Đối với giày chạy bộ, tôi khuyên bạn chọn những đôi có đệm tốt, thoáng khí và phù hợp với dáng chân. Một số lựa chọn tốt là Nike Air Zoom, Adidas Ultraboost, hay ASICS Gel series. Bạn thường chạy trên địa hình nào và tần suất như thế nào?";
    }

    const generalResponses = [
      "Cảm ơn bạn đã hỏi về giày! Tôi rất vui được hỗ trợ bạn tìm kiếm đôi giày phù hợp. Bạn có thể cho tôi biết thêm về sở thích và nhu cầu sử dụng của bạn không?",
      "Đó là một câu hỏi tuyệt vời về giày! Để tư vấn chính xác nhất, tôi cần biết thêm về phong cách bạn yêu thích, ngân sách và mục đích sử dụng. Bạn có thể chia sẻ thêm không?",
      "Tôi hiểu nhu cầu của bạn về giày. Dựa trên kinh nghiệm tư vấn, tôi khuyên bạn nên xem xét các yếu tố như chất liệu, size, và thương hiệu. Bạn có câu hỏi cụ thể nào khác không?",
      "Rất vui được tư vấn cho bạn! Trong thế giới giày dép, có rất nhiều lựa chọn tuyệt vời. Hãy cho tôi biết bạn đang tìm kiếm loại giày nào để tôi có thể đưa ra gợi ý phù hợp nhất.",
    ];

    return generalResponses[
      Math.floor(Math.random() * generalResponses.length)
    ];
  }

  /**
   * Set conversation ID for context continuity
   */
  setConversationId(conversationId: string): void {
    this.conversationId = conversationId;
  }

  /**
   * Get current conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }

  /**
   * Reset conversation (clear conversation ID)
   */
  resetConversation(): void {
    this.conversationId = null;
  }
}

// Create singleton instance
const aiChatService = new AIChatService();
export default aiChatService;
