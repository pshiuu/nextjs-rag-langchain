import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { styles } = await req.json();
    const chatbotId = params.id;

    if (!chatbotId) {
      return Response.json(
        { error: "Chatbot ID is required" },
        { status: 400 }
      );
    }

    if (!styles) {
      return Response.json(
        { error: "Styles data is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this chatbot
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the chatbot's custom styles
    const { error } = await supabase
      .from("chatbots")
      .update({ custom_styles: JSON.stringify(styles) })
      .eq("id", chatbotId)
      .eq("user_id", user.id); // Ensure user can only update their own chatbots

    if (error) {
      console.error("Error updating chatbot styles:", error);
      return Response.json({ error: "Failed to save styles" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (e: any) {
    console.error("Error in styles API:", e);
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const chatbotId = params.id;

    if (!chatbotId) {
      return Response.json(
        { error: "Chatbot ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this chatbot
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the chatbot's custom styles
    const { data: chatbot, error } = await supabase
      .from("chatbots")
      .select("custom_styles")
      .eq("id", chatbotId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching chatbot styles:", error);
      return Response.json(
        { error: "Failed to fetch styles" },
        { status: 500 }
      );
    }

    if (!chatbot) {
      return Response.json({ error: "Chatbot not found" }, { status: 404 });
    }

    const styles = chatbot.custom_styles
      ? JSON.parse(chatbot.custom_styles)
      : null;

    return Response.json({ styles });
  } catch (e: any) {
    console.error("Error in styles API:", e);
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
