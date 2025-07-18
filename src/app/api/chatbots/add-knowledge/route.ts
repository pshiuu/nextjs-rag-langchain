import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { chatbotId, text } = await req.json();

    if (!chatbotId || !text || text.trim() === "") {
      return Response.json({ message: "No knowledge to add." });
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = [
      new Document({ pageContent: text, metadata: { source: "text-input" } }),
    ];
    const chunkedDocs = await splitter.splitDocuments(docs);

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const vectors = await embeddings.embedDocuments(
      chunkedDocs.map((doc) => doc.pageContent)
    );

    const rowsToInsert = vectors.map((vector, i) => ({
      chatbot_id: chatbotId,
      content: chunkedDocs[i].pageContent,
      embedding: vector,
    }));

    const { error } = await supabase.from("documents").insert(rowsToInsert);

    if (error) {
      console.error("Error adding knowledge:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ message: "Knowledge added successfully." });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
