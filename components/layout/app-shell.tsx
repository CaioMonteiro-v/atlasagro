"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Beef,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Sprout,
  X,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { FarmSwitcher } from "@/components/layout/farm-switcher";
import { cn } from "@/lib/utils";
import type { Fazenda } from "@/lib/types";

const NAV = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/talhoes", label: "Talhões e plantios", icon: Sprout },
  { href: "/lotes", label: "Lotes e sanidade", icon: Beef },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/alertas", label: "Alertas", icon: Bell },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  email,
  alertCount,
  fazendas,
  fazendaAtualId,
  children,
}: {
  email: string;
  alertCount: number;
  fazendas: Fazenda[];
  fazendaAtualId: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-white/15 text-white"
                : "text-brand-100 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/alertas" && alertCount > 0 ? (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
                {alertCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-earth-50">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:bg-brand-800 lg:px-5 lg:py-6">
        <Brand />
        <FarmSwitcher fazendas={fazendas} atualId={fazendaAtualId} />
        {nav}
        <UserFooter email={email} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-50 flex h-full w-72 flex-col bg-brand-800 px-5 py-6">
            <div className="mb-2 flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FarmSwitcher fazendas={fazendas} atualId={fazendaAtualId} />
            {nav}
            <UserFooter email={email} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200 bg-earth-50/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-stone-700 hover:bg-white"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="truncate font-semibold text-brand-800">
            {fazendas.find((fazenda) => fazenda.id === fazendaAtualId)?.nome ?? "Atlas Agro"}
          </span>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="mb-8 flex items-center gap-3 text-white">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-brand-900">
        <Sprout className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-base font-bold leading-tight">Atlas Agro</span>
        <span className="block text-xs text-brand-200">Gestão da propriedade</span>
      </span>
    </Link>
  );
}

function UserFooter({ email }: { email: string }) {
  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <p className="truncate px-1 text-xs text-brand-200">{email}</p>
      <form action={logout}>
        <button
          type="submit"
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-brand-100 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </form>
    </div>
  );
}
