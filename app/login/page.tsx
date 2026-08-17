import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  const configured = hasSupabaseEnv();
  const banner =
    searchParams.erro === "confirmacao"
      ? "Não foi possível confirmar o e-mail. Desmarque Confirm email no Supabase (Authentication → Providers → Email) e entre de novo."
      : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-800">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-amber-400 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-brand-500 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-4 py-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-lg text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
            Propriedade rural
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight">
            Tudo o que era conversa no WhatsApp, agora fica registrado.
          </h2>
          <p className="mt-4 text-brand-100">
            Plantio, adubação, vacina e vermífugo com data, talhão ou lote — e
            relatórios na hora de conferir o que foi feito.
          </p>
        </div>
        <LoginForm configured={configured} banner={banner} />
      </div>
    </div>
  );
}
