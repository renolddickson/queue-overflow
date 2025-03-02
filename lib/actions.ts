"use server"

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

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const userName = formData.get("lastName") as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_name: userName
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: "Check your email to confirm your account" }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/auth")
}

