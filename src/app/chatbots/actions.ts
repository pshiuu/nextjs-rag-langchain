"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteChatbot(formData: FormData) {
  const chatbotId = formData.get("chatbotId") as string;

  if (!chatbotId) {
    return { error: "Chatbot ID is required." };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // RLS policies will ensure the user can only delete their own chatbots.
  const { error } = await supabase
    .from("chatbots")
    .delete()
    .eq("id", chatbotId);

  if (error) {
    console.error("Error deleting chatbot:", error);
    // A more user-friendly error could be returned here
    return { error: "Failed to delete chatbot." };
  }

  // Revalidate the page to show the updated list immediately
  revalidatePath("/chatbots");

  return { success: true };
}
