import './globals.css';

export const metadata = {
  title: 'Sistema de Gerenciamento de Chamados via WhatsApp',
  description: 'Sistema para gerenciamento de chamados de suporte técnico via WhatsApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
