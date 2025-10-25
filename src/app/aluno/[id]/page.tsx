import type { Metadata, Viewport } from 'next';
import ClientPage from './client-page'; // Verifique se o nome do arquivo importado está correto

// Configuração correta para o Viewport (roda no servidor)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

// Metadados da página (roda no servidor)
export const metadata: Metadata = {
  title: "Responder Atividade - GenIAtividades",
  description: "Página para responder a uma atividade gerada pela plataforma.",
};

// Esta é a página que o servidor vai montar
// A função DEVE ser um componente React que retorna JSX
export default function Page() {
  // Ela simplesmente renderiza o nosso componente de cliente
  return <ClientPage />;
}