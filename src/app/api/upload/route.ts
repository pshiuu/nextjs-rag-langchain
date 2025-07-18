import { createClient } from "@supabase/supabase-js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: "documents",
      queryName: "match_documents",
    });

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    const chatbotId = data.get("chatbotId") as string;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!chatbotId) {
      return Response.json({ error: "chatbotId is required" }, { status: 400 });
    }

    console.log("Processing file:", file.name, "for chatbot:", chatbotId);

    const loader = new PDFLoader(file);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await splitter.splitDocuments(docs);

    // Add chatbot metadata to each document chunk
    const docsWithMetadata = chunkedDocs.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        chatbot_id: chatbotId,
        file_name: file.name,
        upload_date: new Date().toISOString(),
      },
    }));

    const result = await vectorStore.addDocuments(docsWithMetadata);

    return Response.json({ result });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
