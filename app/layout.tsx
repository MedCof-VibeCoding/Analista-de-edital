import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedCof — Editor de Editais",
  description:
    "Gere posts editoriais a partir de editais de residência médica em PDF, com pipeline de IA multi-provider.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
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
