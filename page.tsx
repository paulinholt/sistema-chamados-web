import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <div className="flex items-center justify-center">
            <span className="text-lg font-bold">Sistema de Gerenciamento de Chamados</span>
          </div>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-4xl font-bold text-center">
          Bem-vindo ao Sistema de Gerenciamento de Chamados
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-3 lg:text-left gap-8">
        <div className="card group">
          <h2 className="mb-3 text-2xl font-semibold">
            Registre Chamados
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80">
            Registre e acompanhe chamados técnicos de forma eficiente e organizada.
          </p>
          <div className="mt-4">
            <Link href="/login" className="btn-primary inline-block">
              Acessar Sistema
            </Link>
          </div>
        </div>

        <div className="card group">
          <h2 className="mb-3 text-2xl font-semibold">
            Gere Relatórios
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80">
            Crie relatórios detalhados em PDF e envie automaticamente para seus clientes.
          </p>
          <div className="mt-4">
            <Link href="/login" className="btn-primary inline-block">
              Acessar Sistema
            </Link>
          </div>
        </div>

        <div className="card group">
          <h2 className="mb-3 text-2xl font-semibold">
            Consulte Histórico
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80">
            Acesse o histórico completo de atendimentos e encontre soluções rapidamente.
          </p>
          <div className="mt-4">
            <Link href="/login" className="btn-primary inline-block">
              Acessar Sistema
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm opacity-70">
          © 2025 Sistema de Gerenciamento de Chamados - Todos os direitos reservados
        </p>
      </div>
    </main>
  );
}
