"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { field, optionalInt } from "@/lib/utils";

export async function createLote(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nome = field(formData, "nome");
  if (!nome) return { error: "Informe o nome do lote." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("lotes")
    .insert({
      nome,
      especie: field(formData, "especie") || null,
      quantidade_animais: optionalInt(field(formData, "quantidade_animais")),
      observacoes: field(formData, "observacoes") || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível cadastrar o lote." };
  }

  revalidatePath("/lotes");
  revalidatePath("/");
  redirect(`/lotes/${data.id}`);
}

export async function updateLote(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");
  const nome = field(formData, "nome");
  if (!id || !nome) return { error: "Informe o nome do lote." };

  const supabase = createClient();
  const { error } = await supabase
    .from("lotes")
    .update({
      nome,
      especie: field(formData, "especie") || null,
      quantidade_animais: optionalInt(field(formData, "quantidade_animais")),
      observacoes: field(formData, "observacoes") || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar as alterações." };

  revalidatePath("/lotes");
  revalidatePath(`/lotes/${id}`);
  revalidatePath("/");
  redirect(`/lotes/${id}`);
}

export async function deleteLote(formData: FormData) {
  const id = field(formData, "id");
  const supabase = createClient();
  await supabase.from("lotes").delete().eq("id", id);
  revalidatePath("/lotes");
  revalidatePath("/");
  revalidatePath("/alertas");
  redirect("/lotes");
}
