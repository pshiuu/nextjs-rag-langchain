"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import * as cheerio from "cheerio";

export async function updateChatbotSettings(
  previousState: any,
  formData: FormData
) {
  const chatbotId = formData.get("chatbotId") as string;
  const name = formData.get("name") as string;
  const instruction = formData.get("instruction") as string;
  const model = formData.get("model") as string;
  const temperature = parseFloat(formData.get("temperature") as string);

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("chatbots")
    .update({ name, prompt: instruction, model, temperature })
    .eq("id", chatbotId);

  if (error) {
    console.error("Error updating chatbot settings:", error);
    return { error: "Failed to update settings." };
  }

  revalidatePath(`/chatbots/edit/${chatbotId}`);
  return { success: true, message: "Settings updated successfully." };
}

export async function addKnowledge(previousState: any, formData: FormData) {
  const chatbotId = formData.get("chatbotId") as string;
  const text = formData.get("text") as string;

  if (!text) {
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

    const documentsToInsert = await Promise.all(
      documents.map(async (doc) => ({
        chatbot_id: chatbotId,
        content: doc.pageContent,
        embedding: await embeddings.embedQuery(doc.pageContent),
      }))
    );

    const { error } = await supabase
      .from("documents")
      .insert(documentsToInsert);

    if (error) {
      throw error;
    }

    revalidatePath(`/chatbots/edit/${chatbotId}`);
    return { success: true, message: "Knowledge added successfully." };
  } catch (error: any) {
    console.error("Error adding knowledge:", error);
    return { error: "Failed to add knowledge." };
  }
}

export async function addKnowledgeFromURL(
  previousState: any,
  formData: FormData
) {
  const chatbotId = formData.get("chatbotId") as string;
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "URL is required." };
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL. Status: ${response.status}`);
    }
    const html = await response.text();

    const $ = cheerio.load(html);

    // Extract structured data from JSON-LD scripts
    let jsonLdContent = "";
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const scriptContent = $(el).html();
        if (scriptContent) {
          jsonLdContent += JSON.stringify(JSON.parse(scriptContent)) + "\n";
        }
      } catch (e) {
        console.warn("Could not parse JSON-LD script content.");
      }
    });

    // Extract meta tag content
    let metaContent = "";
    $("meta").each((i, el) => {
      const name = $(el).attr("name") || $(el).attr("property");
      const content = $(el).attr("content");
      if (name && content) {
        metaContent += `${name}: ${content}.\n`;
      }
    });

    // Remove noisy tags from the body before extracting text
    $("body script, body style, nav, footer, header, noscript, aside").remove();
    const bodyContent = $("body").text();

    // Combine all extracted content
    const combinedText = `${metaContent}\n${jsonLdContent}\n${bodyContent}`;
    const cleanedText = combinedText.replace(/\s\s+/g, " ").trim();

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

    const documentsToInsert = await Promise.all(
      documents.map(async (doc) => ({
        chatbot_id: chatbotId,
        content: doc.pageContent,
        embedding: await embeddings.embedQuery(doc.pageContent),
      }))
    );

    const { error } = await supabase
      .from("documents")
      .insert(documentsToInsert);
    if (error) {
      throw error;
    }

    revalidatePath(`/chatbots/edit/${chatbotId}`);
    return { success: true, message: "Website content added successfully." };
  } catch (error: any) {
    console.error("Error adding knowledge from URL:", error);
    return { error: `Failed to process URL: ${error.message}` };
  }
}

export async function deleteKnowledge(formData: FormData) {
  const documentId = formData.get("documentId") as string;
  const chatbotId = formData.get("chatbotId") as string;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    console.error("Error deleting knowledge:", error);
    return { error: "Failed to delete knowledge." };
  }

  revalidatePath(`/chatbots/edit/${chatbotId}`);
  return { success: true };
}
