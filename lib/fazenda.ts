import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Fazenda } from "@/lib/types";
import { castRows } from "@/lib/utils";

export const FAZENDA_COOKIE = "atlasagro_fazenda";

export function getFazendaCookieId() {
  return cookies().get(FAZENDA_COOKIE)?.value ?? null;
}

export function setFazendaCookie(id: string) {
  cookies().set(FAZENDA_COOKIE, id, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
  });
}

export async function listFazendas() {
  const supabase = createClient();
  const { data } = await supabase.from("fazendas").select("*").order("nome");
  return castRows<Fazenda>(data);
}

export async function resolveFazenda() {
  const fazendas = await listFazendas();
  const cookieId = getFazendaCookieId();
  const atual = fazendas.find((fazenda) => fazenda.id === cookieId) ?? fazendas[0] ?? null;
  return { fazendas, atual };
}

export async function requireFazendaId() {
  const { atual } = await resolveFazenda();
  if (!atual) {
    redirect("/fazendas/nova");
  }
  return atual.id;
}
