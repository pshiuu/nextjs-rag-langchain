"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
  console.log("Attempting to log in...");
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  console.log("Login data:", data.email);

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login error:", error.message);
    redirect("/error");
  }

  console.log("Login successful, redirecting to /chatbots");
  revalidatePath("/", "layout");
  redirect("/chatbots");
}

export async function signup(formData: FormData) {
  console.log("Attempting to sign up...");
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  console.log("Signup data:", data.email);

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.error("Signup error:", error.message);
    redirect("/error");
  }

  console.log("Signup successful, redirecting to /chatbots");
  revalidatePath("/", "layout");
  redirect("/chatbots");
}
