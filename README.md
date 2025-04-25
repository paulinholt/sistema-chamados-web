# Sistema de Gerenciamento de Chamados via WhatsApp

Este é um projeto Next.js para gerenciamento de chamados de suporte técnico via WhatsApp, permitindo que plantonistas registrem e acompanhem chamados, gerem relatórios em PDF e consultem o histórico de atendimentos.

## Estrutura do Projeto

O projeto segue a estrutura moderna do Next.js com App Router:

```
src/
├── app/                  # Páginas e rotas da aplicação
│   ├── page.tsx          # Página inicial
│   ├── layout.tsx        # Layout principal
│   ├── globals.css       # Estilos globais
│   ├── login/            # Página de login
│   ├── dashboard/        # Dashboard principal
│   ├── chamados/         # Gerenciamento de chamados
│   ├── projetos/         # Gerenciamento de projetos
│   ├── clientes/         # Gerenciamento de clientes
│   └── plantonistas/     # Gerenciamento de plantonistas
├── components/           # Componentes reutilizáveis
├── lib/                  # Utilitários e funções
│   ├── db.ts             # Conexão com banco de dados
│   ├── auth.ts           # Autenticação
│   ├── pdf-generator.ts  # Geração de PDFs
│   └── whatsapp-integration.ts # Integração com WhatsApp
```

## Funcionalidades

- Registro de chamados via WhatsApp
- Banco de dados para armazenar atendimentos
- Geração de relatórios em PDF no formato RAC
- Envio automático de relatórios por email ou WhatsApp
- Consulta ao histórico de atendimentos
- Interface web responsiva para gerenciamento

## Como Executar

1. Instale as dependências:
```
npm install
```

2. Execute o servidor de desenvolvimento:
```
npm run dev
```

3. Acesse a aplicação em http://localhost:3000

## Deploy na Vercel

Este projeto está configurado para ser facilmente implantado na Vercel:

1. Faça push do código para um repositório GitHub
2. Importe o repositório na Vercel
3. A Vercel detectará automaticamente que é um projeto Next.js
4. Clique em "Deploy" para implantar o projeto

## Configuração do WhatsApp

Para configurar a integração com WhatsApp:

1. Obtenha uma chave de API do WhatsApp Business API
2. Configure as credenciais no arquivo .env.local
3. Teste a conexão usando a página de teste em /test

## Suporte

Para suporte ou dúvidas, entre em contato com a equipe de desenvolvimento.
