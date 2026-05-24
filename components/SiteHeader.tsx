import Image from "next/image";
import { LogoutButton } from "./LogoutButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--mc-border)] bg-[rgba(10,13,20,0.78)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
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

        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="#gerador"
            className="rounded-lg px-3 py-1.5 text-sm font-medium mc-text-muted hover:bg-white/5 hover:text-white"
          >
            Gerador
          </a>
          <a
            href="https://www.grupomedcof.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-1.5 text-sm font-medium mc-text-muted hover:bg-white/5 hover:text-white"
          >
            grupomedcof.com.br
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <span className="mc-pill">Beta</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
