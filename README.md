# README.md - Sistema de Gerenciamento de Chamados

## Visão Geral

O Sistema de Gerenciamento de Chamados é uma aplicação web completa para gerenciar chamados de suporte técnico, com integração ao WhatsApp para facilitar a comunicação entre plantonistas e clientes. O sistema permite registrar chamados, gerar relatórios em PDF, consultar histórico de atendimentos e gerenciar projetos, clientes e plantonistas.

## Funcionalidades Principais

- **Registro de Chamados via WhatsApp**: Plantonistas podem iniciar novos chamados diretamente do grupo de WhatsApp usando o comando "Novo chamado"
- **Banco de Dados Estruturado**: Armazenamento organizado de chamados, clientes, projetos e plantonistas
- **Geração de Relatórios PDF**: Criação automática de relatórios no formato RAC (Relatório de Atendimento ao Cliente)
- **Envio Automático de Relatórios**: Envio de relatórios por email ou WhatsApp para clientes e gerentes de projeto
- **Consulta Histórica**: Busca de chamados anteriores por termo, cliente, projeto ou solução
- **Interface Web Responsiva**: Acesso ao sistema via navegador em qualquer dispositivo
- **Autenticação Segura**: Sistema de login com JWT e controle de acesso baseado em perfis

## Tecnologias Utilizadas

- **Frontend**: Next.js com Tailwind CSS
- **Backend**: API RESTful com Next.js API Routes
- **Banco de Dados**: Cloudflare D1 (SQLite distribuído)
- **Autenticação**: JWT (JSON Web Tokens)
- **Geração de PDF**: WeasyPrint
- **Integração WhatsApp**: API de mensagens do WhatsApp
- **Implantação**: Cloudflare Workers

## Estrutura do Projeto

```
sistema_chamados_web/
├── migrations/            # Migrações do banco de dados
├── src/
│   ├── app/              # Páginas e rotas da aplicação
│   │   ├── api/          # Endpoints da API
│   │   ├── dashboard/    # Dashboard administrativo
│   │   ├── chamados/     # Gerenciamento de chamados
│   │   ├── projetos/     # Gerenciamento de projetos
│   │   ├── clientes/     # Gerenciamento de clientes
│   │   ├── plantonistas/ # Gerenciamento de plantonistas
│   │   ├── test/         # Páginas de teste
│   │   └── login/        # Autenticação
│   ├── components/       # Componentes reutilizáveis
│   └── lib/              # Bibliotecas e utilitários
│       ├── models/       # Modelos de dados
│       ├── auth.ts       # Autenticação e segurança
│       ├── db.ts         # Conexão com banco de dados
│       ├── pdf-generator.ts # Geração de PDFs
│       ├── whatsapp-integration.ts # Integração com WhatsApp
│       └── consulta-historica.ts # Consulta histórica
├── public/               # Arquivos estáticos
└── wrangler.toml         # Configuração do Cloudflare Workers
```

## Implantação

O sistema está configurado para implantação no Cloudflare Workers, que oferece:

- **Escalabilidade**: Adaptação automática ao volume de uso
- **Disponibilidade**: Alta disponibilidade com distribuição global
- **Segurança**: Proteção contra ataques DDoS e outras ameaças
- **Baixo Custo**: Modelo de preços baseado em uso

Para instruções detalhadas de implantação, consulte o arquivo [DEPLOYMENT.md](DEPLOYMENT.md).

## Fluxo de Trabalho

1. **Registro de Chamado**:
   - Plantonista envia "Novo chamado" no grupo do WhatsApp
   - Sistema solicita informações do cliente, projeto e problema
   - Chamado é registrado no banco de dados

2. **Atendimento**:
   - Plantonista realiza o atendimento e registra a solução
   - Sistema gera relatório em PDF no formato RAC
   - Relatório é enviado automaticamente ao cliente e gerente do projeto

3. **Consulta Histórica**:
   - Usuários podem consultar chamados anteriores usando comandos como "consultar", "cliente", "projeto" ou "solução"
   - Sistema retorna informações relevantes para auxiliar em novos atendimentos

4. **Gestão via Interface Web**:
   - Administradores podem acessar o dashboard para visualizar estatísticas
   - Gerentes podem cadastrar e gerenciar projetos
   - Plantonistas podem visualizar e atualizar chamados

## Acesso ao Sistema

A aplicação está disponível em:
- **URL de Produção**: https://sistema-chamados.example.com
- **Usuários de Teste**:
  - Admin: admin@w3fmaster.com.br / admin123
  - Plantonista: aurelio@w3fmaster.com.br / plantonista123
  - Gerente: gerente@w3fmaster.com.br / gerente123

## Próximos Passos

- Integração com sistemas de monitoramento
- Implementação de chatbot para atendimento automatizado
- Aplicativo móvel para plantonistas
- Análise avançada de dados e relatórios gerenciais

## Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.
