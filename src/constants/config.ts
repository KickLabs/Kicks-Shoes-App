// Sử dụng IP hiện tại từ các file khác để nhất quán
export const API_BASE_URL = "http://192.168.1.85:3000";

export const APP_CONFIG = {
  name: "KicksApp",
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development",
};

// Chat Configuration
export const CHAT_CONFIG = {
  // Socket.IO server URL (không có /api)
  SOCKET_URL: "http://192.168.1.85:3000",
  // Timeout cho chat requests (ms)
  CHAT_TIMEOUT: 30000,
  // Max file size cho chat attachments (bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  // Supported file types
  SUPPORTED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ],
};

// AI Chat Configuration
export const AI_CONFIG = {
  // AI API URL (FTES API endpoint)
  AI_API_URL:
    process.env.EXPO_PUBLIC_AI_API_URL ||
    "https://api.ftes.ai/v1/chat/completions",
  // AI Authentication Token
  AI_TOKEN: process.env.EXPO_PUBLIC_AI_TOKEN || "",
  // Bot ID for AI service
  BOT_ID: process.env.EXPO_PUBLIC_BOT_ID || "",
  // Gemini API Key
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
  // AI Model name
  AI_MODEL:
    process.env.EXPO_PUBLIC_AI_MODEL || "gemini-2.5-flash-preview-05-20",
  // Enable mock responses for development
  ENABLE_MOCK_AI: process.env.EXPO_PUBLIC_ENABLE_MOCK_AI === "true",
  // Streaming settings
  STREAM_CHUNK_SIZE: 10, // Characters per chunk
  STREAM_DELAY: 50, // Milliseconds between chunks
};

export const ROUTES = {
  INTRO: "Intro",
  WELCOME: "Welcome",
  HOME: "Home",
};
