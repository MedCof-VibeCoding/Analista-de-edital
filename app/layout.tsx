import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedCof — Transforme editais médicos em posts com IA",
  description:
    "Envie o PDF do edital de residência médica, concurso ou prova de título e receba conteúdo estruturado, tabelas de vagas, cronograma e SEO pronto para publicação em minutos.",
  openGraph: {
    title: "MedCof — IA para editais médicos",
    description:
      "Transforme PDFs de editais de residência médica, concurso médico e prova de título em posts prontos para publicação com IA.",
    type: "website",
    locale: "pt_BR",
    siteName: "MedCof",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedCof — IA para editais médicos",
    description:
      "Transforme PDFs de editais em posts prontos para publicação com IA.",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          richColors
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--mc-surface-raised)",
              border: "1px solid var(--mc-border-strong)",
              color: "var(--mc-text)",
            },
          }}
        />
      </body>
    </html>
  );
}
