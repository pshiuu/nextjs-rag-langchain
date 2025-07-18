import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return Response.json({ error: "apiKey is required" }, { status: 400 });
    }

    // Create admin Supabase client for public API
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify API key and get chatbot styles
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("custom_styles")
      .eq("public_api_key", apiKey)
      .single();

    if (chatbotError || !chatbot) {
      return Response.json(
        { error: "Invalid API key or chatbot not found" },
        { status: 401 }
      );
    }

    const styles = chatbot.custom_styles
      ? JSON.parse(chatbot.custom_styles)
      : null;

    return Response.json({ styles });
  } catch (e: any) {
    console.error("Error in public styles API:", e);
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
