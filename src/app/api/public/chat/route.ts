import {
  Message as VercelChatMessage,
  StreamingTextResponse,
  createStreamDataTransformer,
} from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { RunnableSequence, RunnableLambda } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
// Use the anon client for public access
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: Request) {
  try {
    const { messages, apiKey } = await req.json();

    if (!apiKey) {
      return Response.json({ error: "apiKey is required" }, { status: 400 });
    }

    // Create an anon client to interact with the database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch the chatbot configuration using the public API key
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("id, prompt, model, temperature")
      .eq("public_api_key", apiKey)
      .single();

    if (chatbotError || !chatbot) {
      return Response.json(
        { error: "Chatbot not found or invalid API key" },
        { status: 404 }
      );
    }

    const instruction = chatbot.prompt.replace(/Context:.*$/gim, "").trim();
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const RAG_PROMPT_TEMPLATE = `${instruction}
  ==============================
  Context: {context}
  ==============================
  Current conversation: {chat_history}
  
  user: {question}
  assistant:`;

    const prompt = ChatPromptTemplate.fromTemplate(RAG_PROMPT_TEMPLATE);

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: chatbot.model,
      temperature: chatbot.temperature,
      streaming: true,
      verbose: true,
    });

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const retriever = new RunnableLambda({
      func: async (question: string) => {
        const { data: documents, error } = await supabase.rpc(
          "match_documents",
          {
            query_embedding: await embeddings.embedQuery(question),
            p_chatbot_id: chatbot.id, // Use the fetched chatbot ID
            match_count: 5,
          }
        );
        if (error) {
          throw new Error(`Error fetching documents: ${error.message}`);
        }
        return documents.map((doc: { content: string }) => ({
          pageContent: doc.content,
        }));
      },
    });

    const parser = new HttpResponseOutputParser();

    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: async (input) => {
          const relevantDocs = await retriever.invoke(input.question);
          return formatDocumentsAsString(relevantDocs);
        },
      },
      prompt,
      model,
      parser,
    ]);

    const stream = await chain.stream({
      question: currentMessageContent,
      chat_history: formattedPreviousMessages.join("\n"),
    });

    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer())
    );
  } catch (e: any) {
    console.error("Public Chat API Error:", e);
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
