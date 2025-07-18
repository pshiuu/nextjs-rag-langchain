"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import * as cheerio from "cheerio";

export async function createChatbot(previousState: any, formData: FormData) {
  console.log("--- ACTION: createChatbot ---");
  const name = formData.get("name") as string;
  const instruction = formData.get("instruction") as string;
  const model = formData.get("model") as string;
  const temperature = parseFloat(formData.get("temperature") as string);
  console.log("Received data:", { name, instruction, model, temperature });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("chatbots")
    .insert({ name, prompt: instruction, model, temperature })
    .select("id, public_api_key")
    .single();

  if (error) {
    console.error("Error creating chatbot:", error);
    return { error: "Failed to create chatbot." };
  }

  console.log("Successfully created chatbot with ID:", data.id);
  return { success: true, chatbotId: data.id };
}

export async function addKnowledge(previousState: any, formData: FormData) {
  console.log("--- ACTION: addKnowledge (from text) ---");
  const chatbotId = formData.get("chatbotId") as string;
  const text = formData.get("text") as string;
  console.log("Received data for chatbotId:", chatbotId);

  if (!text) {
    console.log("Validation failed: Text content is required.");
    return { error: "Text content is required." };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const documents = await splitter.createDocuments([text]);
    console.log(`Split text into ${documents.length} documents.`);

    const documentsToInsert = await Promise.all(
      documents.map(async (doc) => ({
        chatbot_id: chatbotId,
        content: doc.pageContent,
        embedding: await embeddings.embedQuery(doc.pageContent),
      }))
    );
    console.log(`Created ${documentsToInsert.length} embeddings.`);

    const { error } = await supabase
      .from("documents")
      .insert(documentsToInsert);

    if (error) {
      throw error;
    }

    console.log("Successfully inserted documents into database.");
    return { success: true, message: "Text knowledge added successfully." };
  } catch (error: any) {
    console.error("Error adding knowledge:", error);
    return { error: "Failed to add knowledge." };
  }
}

export async function addKnowledgeFromURL(
  previousState: any,
  formData: FormData
) {
  console.log("--- ACTION: addKnowledgeFromURL ---");
  const chatbotId = formData.get("chatbotId") as string;
  const url = formData.get("url") as string;
  console.log("Received data:", { chatbotId, url });

  if (!url) {
    console.log("Validation failed: URL is required.");
    return { error: "URL is required." };
  }

  try {
    console.log(`Fetching content from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL. Status: ${response.status}`);
    }
    const html = await response.text();
    console.log("Successfully fetched URL content.");

    const $ = cheerio.load(html);
    $("script, style, nav, footer, header, noscript").remove();
    const textContent = $("body").text();
    const cleanedText = textContent.replace(/\s\s+/g, " ").trim();
    console.log(`Extracted and cleaned text. Length: ${cleanedText.length}`);

    if (!cleanedText) {
      return { error: "Could not extract any text content from the URL." };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const documents = await splitter.createDocuments([cleanedText]);
    console.log(`Split URL content into ${documents.length} documents.`);

    const documentsToInsert = await Promise.all(
      documents.map(async (doc) => ({
        chatbot_id: chatbotId,
        content: doc.pageContent,
        embedding: await embeddings.embedQuery(doc.pageContent),
      }))
    );
    console.log(
      `Created ${documentsToInsert.length} embeddings for URL content.`
    );

    const { error } = await supabase
      .from("documents")
      .insert(documentsToInsert);
    if (error) {
      throw error;
    }

    console.log("Successfully inserted URL documents into database.");
    return { success: true, message: "Website content added successfully." };
  } catch (error: any) {
    console.error("Error adding knowledge from URL:", error);
    return { error: `Failed to process URL: ${error.message}` };
  }
}
