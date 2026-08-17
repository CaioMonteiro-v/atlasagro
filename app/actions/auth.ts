"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/auth-errors";
import { getSiteOrigin } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { field } from "@/lib/utils";

function enterApp(): never {
  revalidatePath("/", "layout");
  redirect("/");
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = field(formData, "email");
  const password = field(formData, "password");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: authErrorMessage(error) };
  }

  enterApp();
}

export async function signup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = field(formData, "email");
  const password = field(formData, "password");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const supabase = createClient();
  const origin = getSiteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: origin
      ? { emailRedirectTo: `${origin}/auth/callback` }
      : undefined,
  });

  if (error) {
    return { error: authErrorMessage(error) };
  }

  if (data.user?.identities && data.user.identities.length === 0) {
    return { error: "Este e-mail já tem conta. Use a aba Entrar." };
  }

  if (data.session) {
    enterApp();
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError) {
    enterApp();
  }

  if (signInError?.code === "email_not_confirmed" || signInError?.message?.toLowerCase().includes("email not confirmed")) {
    return {
      error: null,
      message:
        "Conta criada. O Supabase está pedindo confirmação de e-mail, então ainda não dá para entrar. Desmarque Confirm email em Authentication → Providers → Email e tente Entrar com o mesmo e-mail e senha.",
    };
  }

  return { error: authErrorMessage(signInError) };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
