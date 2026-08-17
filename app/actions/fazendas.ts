"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setFazendaCookie } from "@/lib/fazenda";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { field } from "@/lib/utils";

export async function createFazenda(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nome = field(formData, "nome");
  if (!nome) return { error: "Informe o nome da fazenda." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("fazendas")
    .insert({
      nome,
      municipio: field(formData, "municipio") || null,
      uf: field(formData, "uf") || null,
      observacoes: field(formData, "observacoes") || null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível cadastrar a fazenda. Confira se o schema.sql foi atualizado." };
  }

  setFazendaCookie(data.id);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateFazenda(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");
  const nome = field(formData, "nome");
  if (!id || !nome) return { error: "Informe o nome da fazenda." };

  const supabase = createClient();
  const { error } = await supabase
    .from("fazendas")
    .update({
      nome,
      municipio: field(formData, "municipio") || null,
      uf: field(formData, "uf") || null,
      observacoes: field(formData, "observacoes") || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar as alterações." };

  revalidatePath("/", "layout");
  revalidatePath("/fazendas");
  redirect("/fazendas");
}

export async function switchFazenda(formData: FormData) {
  const id = field(formData, "fazenda_id");
  if (!id) return;
  setFazendaCookie(id);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function deleteFazenda(formData: FormData) {
  const id = field(formData, "id");
  const supabase = createClient();
  await supabase.from("fazendas").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/fazendas");
}
