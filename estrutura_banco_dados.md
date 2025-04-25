# Estrutura do Banco de Dados - Sistema de Gerenciamento de Chamados

## Diagrama Entidade-Relacionamento

```
+----------------+       +----------------+       +----------------+
|    CLIENTE     |       |    CHAMADO     |       | PLANTONISTA    |
+----------------+       +----------------+       +----------------+
| id_cliente     |<----->| id_chamado     |<----->| id_plantonista |
| nome           |       | id_cliente     |       | nome           |
| cnpj_cpf       |       | id_plantonista |       | email          |
| contato        |       | data_hora      |       | telefone       |
| telefone       |       | tipo           |       | status         |
| email          |       | prioridade     |       | data_cadastro  |
| endereco       |       | descricao      |       +----------------+
| data_cadastro  |       | ambiente       |
+----------------+       | tempo_ocorrencia|       +----------------+
                         | analise        |       |   CATEGORIA    |
                         | procedimentos  |<----->+----------------+
                         | solucao        |       | id_categoria   |
                         | status         |       | nome           |
                         | tempo_atendimento|     | descricao      |
                         | observacoes    |       +----------------+
                         | recomendacoes  |
                         | data_fechamento|       +----------------+
                         +----------------+       |    ANEXO       |
                                                  +----------------+
                                                  | id_anexo       |
                                                  | id_chamado     |
                                                  | nome_arquivo   |
                                                  | tipo_arquivo   |
                                                  | caminho        |
                                                  | data_upload    |
                                                  +----------------+
```

## Definição das Tabelas

### 1. Tabela: cliente
Armazena informações sobre os clientes atendidos.

| Campo         | Tipo         | Descrição                                |
|---------------|--------------|------------------------------------------|
| id_cliente    | INTEGER      | Identificador único (PK)                 |
| nome          | TEXT         | Nome completo da empresa ou pessoa física|
| cnpj_cpf      | TEXT         | Documento de identificação               |
| contato       | TEXT         | Nome da pessoa de contato                |
| telefone      | TEXT         | Número para contato direto               |
| email         | TEXT         | Endereço de email                        |
| endereco      | TEXT         | Endereço físico                          |
| data_cadastro | DATETIME     | Data e hora do cadastro                  |

### 2. Tabela: plantonista
Armazena informações sobre os plantonistas da empresa.

| Campo          | Tipo         | Descrição                               |
|----------------|--------------|------------------------------------------|
| id_plantonista | INTEGER      | Identificador único (PK)                |
| nome           | TEXT         | Nome completo do plantonista            |
| email          | TEXT         | Email corporativo                       |
| telefone       | TEXT         | Número de telefone                      |
| status         | TEXT         | Ativo/Inativo                           |
| data_cadastro  | DATETIME     | Data e hora do cadastro                 |

### 3. Tabela: categoria
Armazena as categorias de atendimento.

| Campo         | Tipo         | Descrição                                |
|---------------|--------------|------------------------------------------|
| id_categoria  | INTEGER      | Identificador único (PK)                 |
| nome          | TEXT         | Nome da categoria                        |
| descricao     | TEXT         | Descrição detalhada                      |

### 4. Tabela: chamado
Tabela principal que armazena os dados dos chamados.

| Campo             | Tipo         | Descrição                                |
|-------------------|--------------|------------------------------------------|
| id_chamado        | INTEGER      | Identificador único (PK)                 |
| id_cliente        | INTEGER      | Referência ao cliente (FK)               |
| id_plantonista    | INTEGER      | Referência ao plantonista (FK)           |
| id_categoria      | INTEGER      | Referência à categoria (FK)              |
| data_hora         | DATETIME     | Data e hora de abertura                  |
| tipo              | TEXT         | Tipo de atendimento                      |
| prioridade        | TEXT         | Baixa, Média, Alta, Crítica              |
| descricao         | TEXT         | Descrição detalhada do problema          |
| ambiente          | TEXT         | Sistemas ou equipamentos afetados        |
| tempo_ocorrencia  | TEXT         | Desde quando o problema está ocorrendo   |
| analise           | TEXT         | Análise técnica da causa                 |
| procedimentos     | TEXT         | Procedimentos realizados                 |
| solucao           | TEXT         | Solução aplicada                         |
| status            | TEXT         | Resolvido, Pendente, Escalado            |
| tempo_atendimento | INTEGER      | Duração do atendimento em minutos        |
| observacoes       | TEXT         | Informações complementares               |
| recomendacoes     | TEXT         | Sugestões para evitar problemas futuros  |
| data_fechamento   | DATETIME     | Data e hora de fechamento                |

### 5. Tabela: anexo
Armazena informações sobre arquivos anexados aos chamados.

| Campo         | Tipo         | Descrição                                |
|---------------|--------------|------------------------------------------|
| id_anexo      | INTEGER      | Identificador único (PK)                 |
| id_chamado    | INTEGER      | Referência ao chamado (FK)               |
| nome_arquivo  | TEXT         | Nome original do arquivo                 |
| tipo_arquivo  | TEXT         | Tipo/extensão do arquivo                 |
| caminho       | TEXT         | Caminho de armazenamento                 |
| data_upload   | DATETIME     | Data e hora do upload                    |

### 6. Tabela: relatorio
Armazena informações sobre os relatórios gerados.

| Campo         | Tipo         | Descrição                                |
|---------------|--------------|------------------------------------------|
| id_relatorio  | INTEGER      | Identificador único (PK)                 |
| id_chamado    | INTEGER      | Referência ao chamado (FK)               |
| caminho_pdf   | TEXT         | Caminho do arquivo PDF                   |
| data_geracao  | DATETIME     | Data e hora de geração                   |
| enviado       | BOOLEAN      | Indica se foi enviado ao cliente         |
| metodo_envio  | TEXT         | Email ou WhatsApp                        |
| data_envio    | DATETIME     | Data e hora do envio                     |

## Índices e Restrições

- Chaves primárias em todas as tabelas (id_*)
- Chaves estrangeiras para manter integridade referencial
- Índices em campos frequentemente consultados (data_hora, status, id_cliente)
- Restrições NOT NULL em campos obrigatórios
- Restrições CHECK para validar valores em campos como prioridade e status

## Considerações de Implementação

- Utilizar SQLite para armazenamento local dos dados
- Implementar transações para garantir integridade dos dados
- Criar triggers para atualização automática de campos como data_fechamento
- Implementar backup automático do banco de dados
- Considerar criptografia para dados sensíveis
