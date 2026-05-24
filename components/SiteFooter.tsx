export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--mc-border)] bg-[rgba(10,13,26,0.6)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs mc-text-dim lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>
          © {new Date().getFullYear()} Grupo MedCof. Ferramenta interna para
          geração de posts de editais de residência médica.
        </p>
        <p>
          Conteúdo gerado por IA exige revisão humana antes da publicação.
        </p>
      </div>
    </footer>
  );
}
