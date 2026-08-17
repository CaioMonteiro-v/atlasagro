"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h2 className="text-lg font-semibold text-earth-900">Algo deu errado</h2>
      <p className="mt-2 text-sm text-stone-600">
        Confira se o Supabase está configurado e se o schema.sql já foi executado.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-4">
        Tentar de novo
      </button>
    </div>
  );
}
