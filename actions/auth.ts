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
  const userName = formData.get("username") as string;
  const firstName = formData.get("firstname") as string;
  const lastName = formData.get("lastname") as string;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_name: userName,
        display_name: firstName+' '+lastName
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase.auth.getUser();
    return data.user || null;
}

export const handleChangePassword = async (newPassword:string) => {
  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      console.error("Error changing password", error);
    }
  } catch (error) {
    console.error("Unexpected error while changing password", error);
  }
};

export const checkPermission = async (table: string, id: string): Promise<boolean> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(table)
    .select('user_id')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching document:', error);
    return false;
  }

  return data.user_id === await getUid();
};
