import Link from "next/link";

type Crumb = { href?: string; label: string };

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {crumbs && crumbs.length > 0 ? (
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-sm text-stone-500">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? <span>/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-brand-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-stone-700">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-earth-900">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-stone-600">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
