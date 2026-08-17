import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
      <p className="text-base font-semibold text-stone-800">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="btn-primary mt-4">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
