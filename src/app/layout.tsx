import type { Metadata } from "next";
import "./globals.css";

// Este objeto é lido pelo Next.js para criar a tag <head>
export const metadata: Metadata = {
  title: "GenIAtividades",
  description: "Gerador de atividades personalizadas com Inteligência Artificial",
  viewport: "width=device-width, initial-scale=1.0", // <-- AQUI ESTÁ A CONFIGURAÇÃO ESSENCIAL
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}