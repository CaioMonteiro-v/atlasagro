import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-earth-900">Registro não encontrado</h1>
      <p className="mt-2 text-sm text-stone-600">
        Esse talhão, plantio ou lote pode ter sido excluído.
      </p>
      <Link href="/" className="btn-primary mt-4">
        Voltar ao início
      </Link>
    </div>
  );
}
