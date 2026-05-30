export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/[0.06]">
      {/* Top gradient accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--mc-primary)]/15 to-transparent" />

      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs mc-text-dim lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>
          © {new Date().getFullYear()} Grupo MedCof. Ferramenta interna para
          geração de posts de editais de residência médica.
        </p>
        <p className="lg:text-right">
          Conteúdo gerado por IA exige revisão humana antes da publicação.
        </p>
      </div>
    </footer>
  );
}
