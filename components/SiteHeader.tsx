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
    <header className="sticky top-0 z-30 border-b border-[var(--mc-border)] bg-[rgba(10,13,20,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2.5">
          <Image
            src="/medcof-logo.png"
            alt="MedCof"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-md"
          />
          <span className="text-sm font-bold tracking-tight">
            Med<span className="mc-gradient-text">Cof</span>
          </span>
          <span className="mc-pill hidden sm:inline-flex">Beta</span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1.5">
          {EXTERNAL_LINKS.map(({ href, label, shortLabel, title, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="mc-focus-ring inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium mc-text-muted transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </a>
          ))}
          <div className="ml-1 border-l border-[var(--mc-border)] pl-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
