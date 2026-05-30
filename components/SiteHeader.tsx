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
    <header className="sticky top-0 z-30">
      {/* Premium red background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #b52222 0%, #ad1f1f 60%, #961a1a 100%)" }} />

      {/* Subtle bottom shadow for separation from content */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/20" />

      <div className="relative mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5 lg:px-8">

        {/* Logo + wordmark */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/medcof-logo.png"
            alt="Blog Express"
            width={38}
            height={38}
            priority
            className="h-9 w-9 rounded-xl object-cover"
          />
          <span className="font-[family-name:var(--font-poppins)] text-base font-bold tracking-tight text-white">
            Blog Express
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/90">
            Beta
          </span>
        </div>

        {/* Nav + logout */}
        <div className="flex flex-1 items-center justify-end gap-0.5">
          {EXTERNAL_LINKS.map(({ href, label, shortLabel, title, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="mc-focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition-all duration-150 hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </a>
          ))}
          <div className="ml-1.5 border-l border-white/20 pl-2.5">
            <LogoutButton />
          </div>
        </div>

      </div>
    </header>
  );
}
