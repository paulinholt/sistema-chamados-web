# Arquitetura da Aplicação Web - Sistema de Gerenciamento de Chamados

## Visão Geral da Arquitetura

A arquitetura da aplicação web será baseada em um modelo cliente-servidor moderno, utilizando Next.js como framework principal. Esta escolha permite uma experiência de usuário rica e responsiva, com renderização do lado do servidor (SSR) para melhor SEO e performance inicial, além de funcionalidades de aplicativo de página única (SPA) para interações fluidas.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Cliente (Navegador)                      │
│                                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                  Next.js (Frontend + Backend)               │
│                                                             │
│  ┌─────────────────┐        ┌──────────────────────────┐    │
│  │                 │        │                          │    │
│  │  React (UI)     │◄─────►│  API Routes (Backend)     │    │
│  │                 │        │                          │    │
│  └─────────────────┘        └──────────────┬───────────┘    │
│                                            │                │
└────────────────────────────────────────────┼────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                   Cloudflare D1 Database                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### 1. Frontend (Next.js + React)

#### Estrutura de Diretórios
```
src/
├── app/                  # Rotas e páginas da aplicação
│   ├── (auth)/           # Rotas protegidas por autenticação
│   │   ├── dashboard/    # Dashboard principal
│   │   ├── chamados/     # Gestão de chamados
│   │   ├── projetos/     # Gestão de projetos
│   │   ├── clientes/     # Gestão de clientes
│   │   ├── plantonistas/ # Gestão de plantonistas
│   │   ├── relatorios/   # Geração e visualização de relatórios
│   │   └── configuracoes/# Configurações do sistema
│   ├── api/              # Endpoints da API
│   ├── login/            # Página de login
│   └── registro/         # Página de registro (se aplicável)
├── components/           # Componentes reutilizáveis
│   ├── ui/               # Componentes de interface básicos
│   ├── forms/            # Componentes de formulário
│   ├── layout/           # Componentes de layout
│   ├── charts/           # Componentes de gráficos e visualizações
│   └── modals/           # Modais e diálogos
├── hooks/                # Hooks personalizados do React
├── lib/                  # Funções utilitárias
│   ├── auth.js           # Lógica de autenticação
│   ├── api.js            # Cliente API
│   └── utils.js          # Utilitários gerais
└── styles/               # Estilos globais
```

#### Tecnologias Frontend
- **Next.js**: Framework React com SSR e rotas
- **Tailwind CSS**: Framework CSS utilitário
- **React Hook Form**: Gerenciamento de formulários
- **Recharts**: Biblioteca de gráficos
- **SWR**: Para busca e cache de dados
- **Lucide Icons**: Ícones modernos e consistentes

### 2. Backend (Next.js API Routes)

#### Estrutura de API
```
src/app/api/
├── auth/                 # Endpoints de autenticação
│   ├── login/            # Login de usuários
│   ├── logout/           # Logout de usuários
│   └── refresh/          # Renovação de tokens
├── chamados/             # CRUD de chamados
├── projetos/             # CRUD de projetos
├── clientes/             # CRUD de clientes
├── plantonistas/         # CRUD de plantonistas
├── relatorios/           # Geração de relatórios
│   ├── gerar/            # Gerar novo relatório
│   ├── enviar/           # Enviar relatório
│   └── [id]/             # Obter relatório específico
├── dashboard/            # Dados para o dashboard
│   ├── stats/            # Estatísticas gerais
│   └── charts/           # Dados para gráficos
└── whatsapp/             # Integração com WhatsApp
    ├── webhook/          # Webhook para mensagens
    └── enviar/           # Enviar mensagens
```

#### Tecnologias Backend
- **Next.js API Routes**: Endpoints serverless
- **JWT**: Autenticação baseada em tokens
- **bcrypt**: Hash de senhas
- **zod**: Validação de dados
- **D1 ORM**: Interação com banco de dados Cloudflare D1

### 3. Banco de Dados (Cloudflare D1)

#### Esquema do Banco de Dados
```sql
-- Usuários do sistema
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'admin', 'plantonista', 'gerente'
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projetos
CREATE TABLE projetos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sigla TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  gerente_id INTEGER,
  email_gerente TEXT,
  telefone_gerente TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gerente_id) REFERENCES usuarios(id)
);

-- Clientes
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj_cpf TEXT UNIQUE,
  contato TEXT,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plantonistas
CREATE TABLE plantonistas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Categorias de chamados
CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true
);

-- Chamados
CREATE TABLE chamados (
  id TEXT PRIMARY KEY, -- formato RAC0001
  cliente_id INTEGER NOT NULL,
  plantonista_id INTEGER NOT NULL,
  categoria_id INTEGER,
  projeto_id INTEGER,
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tipo TEXT,
  prioridade TEXT,
  descricao TEXT NOT NULL,
  ambiente TEXT,
  tempo_ocorrencia INTEGER,
  analise TEXT,
  procedimentos TEXT,
  solucao TEXT,
  status TEXT DEFAULT 'Aberto',
  tempo_atendimento INTEGER,
  observacoes TEXT,
  recomendacoes TEXT,
  data_fechamento TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (plantonista_id) REFERENCES plantonistas(id),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);

-- Relatórios
CREATE TABLE relatorios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chamado_id TEXT NOT NULL,
  caminho_pdf TEXT,
  data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  enviado BOOLEAN DEFAULT false,
  metodo_envio TEXT,
  data_envio TIMESTAMP,
  FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);

-- Histórico de ações
CREATE TABLE historico_acoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  chamado_id TEXT,
  acao TEXT NOT NULL,
  detalhes TEXT,
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);
```

### 4. Autenticação e Segurança

#### Fluxo de Autenticação
1. Usuário fornece credenciais (email/senha)
2. Backend valida credenciais e gera token JWT
3. Token é armazenado no cliente (localStorage/cookie seguro)
4. Requisições subsequentes incluem o token no cabeçalho
5. API valida o token antes de processar requisições

#### Segurança
- Senhas armazenadas com hash (bcrypt)
- HTTPS para todas as comunicações
- Proteção contra CSRF
- Validação de entrada em todas as APIs
- Rate limiting para prevenir ataques de força bruta
- Sanitização de dados para prevenir XSS

### 5. Integração com WhatsApp

A integração com WhatsApp será mantida através de um webhook que receberá mensagens e as processará de acordo com o formato:

```
┌─────────────────┐      ┌───────────────────┐      ┌─────────────────┐
│                 │      │                   │      │                 │
│    WhatsApp     │─────►│  Webhook Handler  │─────►│  Database       │
│    Business API │      │                   │      │                 │
│                 │◄─────│                   │◄─────│                 │
└─────────────────┘      └───────────────────┘      └─────────────────┘
```

## Fluxos Principais

### 1. Fluxo de Criação de Chamado (Web)
1. Usuário autentica-se na plataforma
2. Navega até "Novo Chamado"
3. Preenche formulário com detalhes do chamado
4. Sistema valida e salva os dados
5. Gera automaticamente relatório PDF
6. Oferece opção de envio imediato

### 2. Fluxo de Criação de Chamado (WhatsApp)
1. Plantonista envia "Novo chamado" no grupo
2. Bot inicia diálogo para coletar informações
3. Dados são validados e salvos no banco
4. Sistema gera relatório PDF
5. Relatório é enviado ao cliente e armazenado

### 3. Fluxo de Consulta Histórica
1. Usuário busca por termo específico
2. Sistema consulta banco de dados
3. Resultados são exibidos com opções de filtro
4. Usuário pode visualizar detalhes ou exportar dados

## Implantação

A aplicação será implantada na infraestrutura Cloudflare, aproveitando:

- **Cloudflare Pages**: Para hospedagem do frontend
- **Cloudflare Workers**: Para execução do backend serverless
- **Cloudflare D1**: Como banco de dados SQL distribuído
- **Cloudflare KV**: Para cache e armazenamento de sessões

### Processo de Implantação
1. Código fonte versionado no GitHub
2. CI/CD configurado para build e testes automáticos
3. Implantação automática em ambiente de produção após aprovação
4. Monitoramento contínuo de performance e erros

## Considerações de Escalabilidade

- Arquitetura serverless para escalar automaticamente
- Cache de dados frequentemente acessados
- Otimização de consultas ao banco de dados
- Lazy loading de componentes para melhor performance inicial
- Paginação de resultados para conjuntos grandes de dados
