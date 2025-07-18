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
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: Request) {
  try {
    console.log("--- NEW PUBLIC CHAT REQUEST ---");
    const { messages, apiKey } = await req.json();
    console.log("Request received with apiKey:", apiKey);
    console.log("Messages:", messages);

    if (!apiKey) {
      console.log("Bad request: apiKey is required.");
      return Response.json({ error: "apiKey is required" }, { status: 400 });
    }

    // Create admin Supabase client for public API
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify API key and get chatbot
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("id, prompt, model, temperature")
      .eq("public_api_key", apiKey)
      .single();

    if (chatbotError || !chatbot) {
      console.log("Chatbot not found:", chatbotError?.message);
      return Response.json(
        { error: "Invalid API key or chatbot not found" },
        { status: 401 }
      );
    }
    console.log("Chatbot config loaded:", chatbot);

    const instruction = chatbot.prompt.replace(/Context:.*$/gim, "").trim();
    console.log("Sanitized instruction:", instruction);

    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    console.log("Current user question:", currentMessageContent);
    console.log("Formatted history:", formattedPreviousMessages);

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
        console.log("Retriever: Invoked with question:", question);
        const { data: documents, error } = await supabase.rpc(
          "match_documents",
          {
            query_embedding: await embeddings.embedQuery(question),
            p_chatbot_id: chatbot.id,
            match_count: 5,
          }
        );
        if (error) {
          console.error("Retriever: Error from match_documents RPC:", error);
          throw new Error(`Error fetching documents: ${error.message}`);
        }
        console.log("Retriever: Found documents:", documents.length);
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
          const formattedDocs = formatDocumentsAsString(relevantDocs);
          console.log("Chain: Formatted context:", formattedDocs);
          return formattedDocs;
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
    console.log("Stream created. Returning response.");

    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer())
    );
  } catch (e: any) {
    console.error("--- PUBLIC CHAT API ERROR ---", e);
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
