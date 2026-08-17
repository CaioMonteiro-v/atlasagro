export function authErrorMessage(error: { message?: string; code?: string } | null) {
  const code = error?.code ?? "";
  const message = (error?.message ?? "").toLowerCase();

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Conta criada, mas o e-mail ainda não foi confirmado. No Supabase, abra Authentication → Providers → Email e desmarque Confirm email. Depois entre de novo.";
  }

  if (code === "user_already_exists" || message.includes("already registered")) {
    return "Este e-mail já tem conta. Use a aba Entrar.";
  }

  if (code === "signup_disabled" || message.includes("signups not allowed") || message.includes("signup is disabled")) {
    return "O cadastro de novas contas está desativado no Supabase.";
  }

  if (message.includes("invalid login") || code === "invalid_credentials") {
    return "E-mail ou senha inválidos.";
  }

  if (message.includes("password")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  return error?.message || "Não foi possível autenticar. Tente de novo.";
}
