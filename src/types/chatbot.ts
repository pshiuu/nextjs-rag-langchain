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

  // Button styling
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;
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
};
