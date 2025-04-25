# Sistema de Gerenciamento de Chamados - Configuração de Implantação

Este documento descreve os passos necessários para implantar o Sistema de Gerenciamento de Chamados em produção usando o Cloudflare Workers e D1 Database.

## Pré-requisitos

- Conta no Cloudflare
- Node.js 18+ instalado
- Wrangler CLI instalado (`npm install -g wrangler`)

## Estrutura de Arquivos para Implantação

```
sistema_chamados_web/
├── migrations/
│   └── 0001_initial.sql       # Migração inicial do banco de dados
├── src/
│   ├── app/                   # Páginas e componentes Next.js
│   ├── lib/                   # Bibliotecas e utilitários
│   └── index.ts               # Ponto de entrada para o Cloudflare Workers
├── public/                    # Arquivos estáticos
├── package.json               # Dependências e scripts
└── wrangler.toml              # Configuração do Cloudflare Workers
```

## Passos para Implantação

### 1. Autenticação no Cloudflare

```bash
wrangler login
```

### 2. Criar o Banco de Dados D1

```bash
wrangler d1 create sistema_chamados_db
```

Após criar o banco de dados, atualize o arquivo `wrangler.toml` com o ID do banco de dados retornado pelo comando acima.

### 3. Aplicar Migrações do Banco de Dados

```bash
wrangler d1 execute sistema_chamados_db --file=migrations/0001_initial.sql
```

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `wrangler.toml` para configurar as variáveis de ambiente necessárias:

- `JWT_SECRET`: Chave secreta para assinatura de tokens JWT
- `WHATSAPP_API_URL`: URL da API do WhatsApp
- `WHATSAPP_PHONE`: Número de telefone do WhatsApp

### 5. Construir a Aplicação

```bash
npm run build
```

### 6. Publicar no Cloudflare Workers

```bash
wrangler publish
```

## Configuração de Domínio Personalizado

Para configurar um domínio personalizado para a aplicação:

1. Adicione o domínio à sua conta do Cloudflare
2. Configure o registro DNS para apontar para o Workers
3. Atualize o arquivo `wrangler.toml` com o padrão de rota e nome da zona

```toml
[routes]
pattern = "sistema-chamados.seudominio.com/*"
zone_name = "seudominio.com"
```

## Monitoramento e Manutenção

- Acesse o painel do Cloudflare para monitorar o uso da aplicação
- Configure alertas para erros e problemas de desempenho
- Faça backup regular do banco de dados D1

## Atualizações

Para atualizar a aplicação:

1. Faça as alterações necessárias no código
2. Execute os testes para garantir que tudo está funcionando corretamente
3. Construa a aplicação com `npm run build`
4. Publique as alterações com `wrangler publish`

## Rollback

Em caso de problemas após uma atualização:

1. Identifique a versão anterior estável
2. Faça checkout para essa versão no repositório
3. Construa e publique a versão anterior
