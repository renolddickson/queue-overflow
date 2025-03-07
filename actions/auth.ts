"use server";

import { ApiSingleResponse, User } from "@/types/api";
import { createClient } from "@/utils/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  redirect("/")
}

export async function checkUsernameAvailability(name: string) {
  const supabase = await createClient()
  return await supabase
    .from("users")
    .select("user_name")
    .eq("user_name", name)
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const userName = formData.get("username") as string; // Use a field name like "userName"

  // 1. Check if the username already exists in your "users" table
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('user_name')
    .eq('user_name', userName);

  if (checkError) {
    console.error("Error checking username:", checkError);
    return { error: "Error checking username uniqueness" };
  }
  
  if (existingUsers && existingUsers.length > 0) {
    return { error: "Username already exists" };
  }

  // 2. Sign up the user with the custom metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_name: userName
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Optionally, revalidate your paths or redirect as needed
  revalidatePath("/");
  return { success: "Check your email to confirm your account" };
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/auth")
}

export async function fetchUserData(id: string): Promise<ApiSingleResponse<User>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('users').select('*').eq('user_id', id).maybeSingle();
  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return { success: true, data: data as User };
}

export async function getUid() {
  return (await getUser())?.id || null;
}

export async function getUser() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw new Error(`Error fetching User: ${error.message}`);
    return data.user || null;
}
