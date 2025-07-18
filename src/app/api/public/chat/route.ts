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
import { ChatSecurity } from "@/utils/security";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: NextRequest) {
  try {
    console.log("--- NEW PUBLIC CHAT REQUEST ---");

    // Parse request body with size limit
    let requestBody;
    try {
      const text = await req.text();
      if (text.length > 10000) {
        // 10KB limit
        return ChatSecurity.createErrorResponse("Request too large", 413);
      }
      requestBody = JSON.parse(text);
    } catch (error) {
      return ChatSecurity.createErrorResponse("Invalid JSON", 400);
    }

    const { messages, apiKey } = requestBody;
    console.log("Request received with apiKey:", apiKey);
    console.log("Messages count:", messages?.length);

    if (!apiKey) {
      console.log("Bad request: apiKey is required.");
      return ChatSecurity.createErrorResponse("apiKey is required", 400);
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return ChatSecurity.createErrorResponse(
        "Valid messages array is required",
        400
      );
    }

    // Get the current user message
    const currentMessage = messages[messages.length - 1];
    if (!currentMessage || !currentMessage.content) {
      return ChatSecurity.createErrorResponse(
        "Message content is required",
        400
      );
    }

    // Generate security context
    const ip = ChatSecurity.getClientIP(req);
    const sessionId = ChatSecurity.generateSessionId(req);
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Perform comprehensive security validation
    const securityResult = await ChatSecurity.validateRequest({
      ip,
      sessionId,
      apiKey,
      message: currentMessage.content,
      userAgent,
    });

    if (!securityResult.allowed) {
      console.log(
        `Security check failed for IP ${ip}: ${securityResult.reason}`
      );
      return ChatSecurity.createErrorResponse(
        securityResult.reason || "Request blocked",
        429
      );
    }

    // Sanitize the message content
    const sanitizedMessage = ChatSecurity.sanitizeMessage(
      currentMessage.content
    );
    messages[messages.length - 1].content = sanitizedMessage;

    // Create a secure, admin-level Supabase client for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Verify API key and get chatbot
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("id, prompt, model, temperature, custom_styles")
      .eq("public_api_key", apiKey)
      .single();

    if (chatbotError || !chatbot) {
      console.log("Chatbot not found:", chatbotError?.message);
      return ChatSecurity.createErrorResponse(
        "Invalid API key or chatbot not found",
        401
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
          "match_documents_public",
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
      question: sanitizedMessage,
      chat_history: formattedPreviousMessages.join("\n"),
    });
    console.log("Stream created. Returning response.");

    const response = new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer())
    );

    // Add security headers to streaming response
    if (securityResult.headers) {
      Object.entries(securityResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  } catch (e: any) {
    console.error("--- PUBLIC CHAT API ERROR ---", e);
    return ChatSecurity.createErrorResponse(
      "Internal server error",
      e.status ?? 500
    );
  }
}
