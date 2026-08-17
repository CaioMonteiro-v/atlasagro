export function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
      {error}
    </p>
  );
}
