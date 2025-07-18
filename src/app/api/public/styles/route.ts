import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    console.log("Public styles API: Request received");
    const { apiKey } = await req.json();
    console.log("Public styles API: apiKey =", apiKey);

    if (!apiKey) {
      console.log("Public styles API: No apiKey provided");
      return Response.json({ error: "apiKey is required" }, { status: 400 });
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
      return Response.json(
        {
          error: "Invalid API key or chatbot not found",
          details: chatbotError?.message,
        },
        { status: 401 }
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
    return Response.json({ styles });
  } catch (e: any) {
    console.error("Error in public styles API:", e);
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
