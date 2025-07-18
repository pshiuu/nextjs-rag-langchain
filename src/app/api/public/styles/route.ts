import { createClient } from "@supabase/supabase-js";
import { ChatSecurity } from "@/utils/security";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    console.log("Public styles API: Request received");

    // Basic rate limiting for styles API (less strict than chat)
    const ip = ChatSecurity.getClientIP(req);
    const sessionId = ChatSecurity.generateSessionId(req);

    // Simple validation for styles API (no message content to validate)
    const securityResult = await ChatSecurity.validateRequest({
      ip,
      sessionId,
      apiKey: "styles-request", // Placeholder for styles requests
      message: "styles-request", // Placeholder message
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    // For styles API, we'll be more lenient but still apply some rate limiting
    if (
      !securityResult.allowed &&
      securityResult.reason?.includes("Rate limit")
    ) {
      console.log(
        `Styles API rate limited for IP ${ip}: ${securityResult.reason}`
      );
      return ChatSecurity.createErrorResponse(
        securityResult.reason || "Rate limit exceeded",
        429
      );
    }

    // Parse request with size limit
    let requestBody;
    try {
      const text = await req.text();
      if (text.length > 1000) {
        // 1KB limit for styles requests
        return ChatSecurity.createErrorResponse("Request too large", 413);
      }
      requestBody = JSON.parse(text);
    } catch (error) {
      return ChatSecurity.createErrorResponse("Invalid JSON", 400);
    }

    const { apiKey } = requestBody;
    console.log("Public styles API: apiKey =", apiKey);

    if (!apiKey || typeof apiKey !== "string" || apiKey.length > 100) {
      console.log("Public styles API: Invalid apiKey provided");
      return ChatSecurity.createErrorResponse("Valid apiKey is required", 400);
    }

    // Create admin Supabase client for public API
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log(
      "Public styles API: Querying database for chatbot with apiKey:",
      apiKey
    );

    // Verify API key and get chatbot styles
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("id, name, custom_styles")
      .eq("public_api_key", apiKey)
      .single();

    console.log("Public styles API: Database query result:", {
      chatbot,
      error: chatbotError,
    });

    if (chatbotError || !chatbot) {
      console.log(
        "Public styles API: Chatbot not found or error:",
        chatbotError
      );
      return ChatSecurity.createErrorResponse(
        "Invalid API key or chatbot not found",
        401
      );
    }

    console.log(
      "Public styles API: Found chatbot:",
      chatbot.name,
      "ID:",
      chatbot.id
    );
    console.log(
      "Public styles API: Raw custom_styles value:",
      chatbot.custom_styles
    );

    let styles = null;
    if (chatbot.custom_styles) {
      try {
        styles = JSON.parse(chatbot.custom_styles);
        console.log(
          "Public styles API: Parsed custom styles successfully:",
          styles
        );
      } catch (parseError) {
        console.error(
          "Public styles API: Error parsing custom_styles JSON:",
          parseError
        );
        console.log(
          "Public styles API: Raw custom_styles that failed to parse:",
          chatbot.custom_styles
        );
      }
    } else {
      console.log("Public styles API: No custom_styles found (null/undefined)");
    }

    console.log("Public styles API: Returning styles:", styles);

    const response = Response.json({ styles });

    // Add security headers
    if (securityResult.headers) {
      Object.entries(securityResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  } catch (e: any) {
    console.error("Error in public styles API:", e);
    return ChatSecurity.createErrorResponse("Internal server error", 500);
  }
}
