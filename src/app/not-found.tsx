import Link from 'next/link';
import type { Metadata, Viewport } from 'next';

// Configuração correta para o Viewport
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

// Metadados da página
export const metadata: Metadata = {
  title: "Página Não Encontrada",
  description: "O conteúdo que você procurava não foi encontrado.",
};

export default function NotFound() {
  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '50px' }}>
      <h1>404 - Página Não Encontrada</h1>
      <p>Desculpe, não conseguimos encontrar a página que você está procurando.</p>
      <Link href="/" style={{ color: '#6A44C4', textDecoration: 'underline' }}>
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}