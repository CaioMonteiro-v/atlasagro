"use client";

import { useFormState } from "react-dom";
import { login, signup } from "@/app/actions/auth";
import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { useState } from "react";
import { Sprout } from "lucide-react";

const initial: { error: string | null } = { error: null };

function AuthForm({
  mode,
}: {
  mode: "login" | "signup";
}) {
  const [state, formAction] = useFormState(mode === "login" ? login : signup, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="voce@fazenda.com"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
          className="input"
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <FormError error={state.error} />
      <SubmitButton pendingLabel={mode === "login" ? "Entrando..." : "Criando conta..."}>
        {mode === "login" ? "Entrar" : "Criar conta"}
      </SubmitButton>
    </form>
  );
}

export function LoginForm({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="card mx-auto w-full max-w-md p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Sprout className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-earth-900">Atlas Agro</h1>
          <p className="text-sm text-stone-600">Entre para registrar o manejo da fazenda</p>
        </div>
      </div>

      {!configured ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Configure o arquivo <strong>.env.local</strong> com a URL e a chave do
          Supabase antes de entrar. Veja o README.
        </p>
      ) : null}

      <div className="mb-4 grid grid-cols-2 rounded-xl bg-stone-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg px-3 py-2 ${mode === "login" ? "bg-white shadow-sm" : "text-stone-600"}`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-lg px-3 py-2 ${mode === "signup" ? "bg-white shadow-sm" : "text-stone-600"}`}
        >
          Criar conta
        </button>
      </div>

      <AuthForm key={mode} mode={mode} />
    </div>
  );
}
