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
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: Request) {
  try {
    console.log("--- NEW CHAT REQUEST ---");
    const { messages, chatbotId } = await req.json();
    console.log("Request received with chatbotId:", chatbotId);
    console.log("Messages:", messages);

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("Unauthorized request: No user found.");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!chatbotId) {
      console.log("Bad request: chatbotId is required.");
      return Response.json({ error: "chatbotId is required" }, { status: 400 });
    }

    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("prompt, model, temperature")
      .eq("id", chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      console.log("Chatbot not found:", chatbotError?.message);
      return Response.json(
        { error: "Chatbot not found or access denied" },
        { status: 404 }
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
            p_chatbot_id: chatbotId,
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

    // Get relevant documents first
    const relevantDocs = await retriever.invoke(currentMessageContent);
    const formattedDocs = formatDocumentsAsString(relevantDocs);
    console.log("Chain: Formatted context:", formattedDocs);

    const parser = new HttpResponseOutputParser();

    // @ts-ignore - LangChain typing issue with RunnableSequence
    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: () => formattedDocs,
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
    console.error("--- CHAT API ERROR ---", e);
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
