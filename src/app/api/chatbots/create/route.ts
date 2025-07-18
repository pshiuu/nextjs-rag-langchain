import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { name, instruction, model, temperature } = await req.json();

    if (!name || !instruction) {
      return Response.json(
        { error: "Name and instruction are required." },
        { status: 400 }
      );
    }

    const prompt = `${instruction} Context: {context}`;

    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .insert([{ name, prompt, model, temperature }])
      .select("id")
      .single();

    if (chatbotError) {
      console.error("Error creating chatbot:", chatbotError);
      return Response.json({ error: chatbotError.message }, { status: 500 });
    }

    return Response.json({ chatbotId: chatbot.id });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
