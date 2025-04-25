export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Sistema de Gerenciamento de Chamados
        </h1>
        <p className="mt-3 text-2xl">
          Bem-vindo ao sistema de gerenciamento de chamados via WhatsApp
        </p>
        <div className="mt-6">
          <a
            href="/login"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Acessar o Sistema
          </a>
        </div>
      </main>
    </div>
  );
}
