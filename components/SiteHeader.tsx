import Image from "next/image";
import { Building2, Newspaper } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const EXTERNAL_LINKS = [
  {
    href: "https://www.grupomedcof.com.br/",
    label: "Grupo MedCof",
    shortLabel: "Grupo",
    title: "Abrir o site do Grupo MedCof em nova aba",
    Icon: Building2,
  },
  {
    href: "https://www.grupomedcof.com.br/blog/",
    label: "Blog MedCof",
    shortLabel: "Blog",
    title: "Abrir o Blog MedCof em nova aba",
    Icon: Newspaper,
  },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--mc-border)] bg-[rgba(10,13,20,0.78)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/medcof-logo.png"
            alt="MedCof"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-lg"
          />
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight">
              Med<span className="mc-gradient-text">Cof</span>
            </div>
            <div className="text-[11px] uppercase tracking-[0.14em] mc-text-dim">
              Editor de Editais
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {EXTERNAL_LINKS.map(({ href, label, shortLabel, title, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="mc-focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--mc-primary)]/40 bg-[var(--mc-primary-soft)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--mc-primary)]/30 hover:border-[var(--mc-primary)]"
            >
              <Icon className="h-3.5 w-3.5 text-[#ff4d6d]" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </a>
          ))}
          <span className="mc-pill hidden md:inline-flex">Beta</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
