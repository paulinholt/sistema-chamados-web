# Formato do Relatório PDF

## Estrutura do Relatório

### 1. Cabeçalho
- Logo da empresa
- Título: "RELATÓRIO DE ATENDIMENTO TÉCNICO"
- Número do chamado (ID formatado)
- Data e hora de geração do relatório

### 2. Informações do Cliente
- Nome da empresa/cliente
- CNPJ/CPF
- Contato principal
- Telefone e email
- Endereço

### 3. Detalhes do Chamado
- Data e hora de abertura
- Plantonista responsável
- Tipo de atendimento
- Categoria
- Prioridade
- Status atual

### 4. Descrição do Problema
- Descrição detalhada do problema reportado
- Ambiente afetado
- Tempo de ocorrência

### 5. Diagnóstico e Solução
- Análise técnica realizada
- Procedimentos executados
- Solução aplicada
- Tempo total de atendimento

### 6. Recomendações
- Sugestões para evitar problemas futuros
- Observações adicionais

### 7. Rodapé
- Informações de contato da empresa
- Data e hora de fechamento do chamado (se aplicável)
- Página X de Y

## Design Visual

- Cores corporativas da empresa
- Fontes legíveis e profissionais
- Formatação clara com espaçamento adequado
- Seções bem delimitadas
- Tabelas para organizar informações quando necessário

## Exemplo de Layout

```
+--------------------------------------------------+
|  [LOGO]          RELATÓRIO DE ATENDIMENTO        |
|                                                  |
|  Chamado: #2025-0001        Data: 24/04/2025     |
+--------------------------------------------------+
|                                                  |
|  CLIENTE                                         |
|  Nome: Empresa ABC Ltda                          |
|  CNPJ: 12.345.678/0001-90                        |
|  Contato: João Silva                             |
|  Tel: (11) 98765-4321                            |
|  Email: joao.silva@empresaabc.com.br             |
+--------------------------------------------------+
|                                                  |
|  DETALHES DO CHAMADO                             |
|  Abertura: 24/04/2025 10:30                      |
|  Plantonista: Maria Oliveira                     |
|  Tipo: Suporte Técnico                           |
|  Categoria: Manutenção                           |
|  Prioridade: Alta                                |
|  Status: Resolvido                               |
+--------------------------------------------------+
|                                                  |
|  DESCRIÇÃO DO PROBLEMA                           |
|  [Texto detalhado da descrição do problema]      |
|                                                  |
|  Ambiente: Servidor principal                    |
|  Tempo de ocorrência: 2 horas                    |
+--------------------------------------------------+
|                                                  |
|  DIAGNÓSTICO E SOLUÇÃO                           |
|  [Texto detalhado da análise técnica]            |
|                                                  |
|  Procedimentos:                                  |
|  [Lista de procedimentos executados]             |
|                                                  |
|  Solução:                                        |
|  [Descrição da solução aplicada]                 |
|                                                  |
|  Tempo de atendimento: 45 minutos                |
+--------------------------------------------------+
|                                                  |
|  RECOMENDAÇÕES                                   |
|  [Texto com recomendações e observações]         |
|                                                  |
+--------------------------------------------------+
|  Empresa de Suporte Técnico Ltda                 |
|  contato@suportetecnico.com.br | (11) 1234-5678  |
|  Fechamento: 24/04/2025 11:15                    |
|                                     Página 1 de 1 |
+--------------------------------------------------+
```

## Implementação Técnica

O relatório será gerado utilizando a biblioteca WeasyPrint, que permite criar PDFs a partir de HTML/CSS. Esta abordagem oferece:

1. Flexibilidade no design
2. Suporte a elementos visuais como logotipos
3. Formatação avançada com CSS
4. Boa compatibilidade com caracteres especiais

O processo de geração seguirá estas etapas:
1. Consultar dados do chamado no banco de dados
2. Gerar template HTML com os dados
3. Aplicar estilos CSS para formatação
4. Converter para PDF usando WeasyPrint
5. Salvar o arquivo no sistema e registrar no banco de dados
