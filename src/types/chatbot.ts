export interface ChatbotStyle {
  // Colors
  primaryColor: string;
  backgroundColor: string;
  userMessageColor: string;
  botMessageColor: string;
  textColor: string;
  borderColor: string;

  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;

  // Layout & Spacing
  borderRadius: string;
  padding: string;
  maxWidth: string;
  height: string;

  // Message specific styling
  messageSpacing: string;
  messagePadding: string;

  // Input styling
  inputBackgroundColor: string;
  inputBorderColor: string;
  inputTextColor: string;

  // Button styling (Send button)
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;

  // Toggle button styling (Chat bubble)
  toggleButtonBackgroundColor: string;
  toggleButtonTextColor: string;
  toggleButtonHoverColor: string;
  toggleButtonSize: string;
  toggleButtonBorderRadius: string;

  // Toggle button close state styling (When chat is open)
  toggleButtonCloseBackgroundColor: string;
  toggleButtonCloseTextColor: string;
  toggleButtonCloseHoverColor: string;

  // Text Customization
  sendButtonText: string;
  placeholderText: string;

  // Initial Message Settings
  showInitialMessage: boolean;
  initialMessage: string;

  // Header Settings
  showHeader: boolean;
  headerTitle: string;
  showOnlineStatus: boolean;

  // Auto-open Behavior
  autoOpen: "never" | "immediately" | "delayed";
  autoOpenDelay: number; // in seconds for delayed auto-open
}

export interface ChatbotWithStyle {
  id: string;
  name: string;
  prompt: string;
  model: string;
  temperature: number;
  public_api_key: string;
  created_at: string;
  custom_styles: ChatbotStyle | null;
}

export const defaultChatbotStyle: ChatbotStyle = {
  // Colors - Using CSS custom properties that work with Tailwind
  primaryColor: "#0f172a", // slate-900
  backgroundColor: "#ffffff",
  userMessageColor: "#f8fafc", // slate-50
  botMessageColor: "#0f172a", // slate-900
  textColor: "#0f172a", // slate-900
  borderColor: "#e2e8f0", // slate-200

  // Typography
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "14px",
  fontWeight: "400",

  // Layout & Spacing
  borderRadius: "12px",
  padding: "16px",
  maxWidth: "48rem", // 768px
  height: "600px",

  // Message specific styling
  messageSpacing: "16px",
  messagePadding: "16px",

  // Input styling
  inputBackgroundColor: "#ffffff",
  inputBorderColor: "#e2e8f0",
  inputTextColor: "#0f172a",

  // Button styling
  buttonBackgroundColor: "#0f172a",
  buttonTextColor: "#ffffff",
  buttonHoverColor: "#334155", // slate-700

  // Toggle button styling
  toggleButtonBackgroundColor: "#0f172a", // slate-900
  toggleButtonTextColor: "#ffffff",
  toggleButtonHoverColor: "#334155", // slate-700
  toggleButtonSize: "60px",
  toggleButtonBorderRadius: "50%", // circular by default

  // Toggle button close state styling
  toggleButtonCloseBackgroundColor: "#0f172a", // slate-900
  toggleButtonCloseTextColor: "#ffffff",
  toggleButtonCloseHoverColor: "#334155", // slate-700

  // Text Customization
  sendButtonText: "Send",
  placeholderText: "Type your message...",

  // Initial Message Settings
  showInitialMessage: true,
  initialMessage: "Hello! How can I help you today?",

  // Header Settings
  showHeader: true,
  headerTitle: "Chatbot",
  showOnlineStatus: true,

  // Auto-open Behavior
  autoOpen: "never",
  autoOpenDelay: 0, // in seconds for delayed auto-open
};
