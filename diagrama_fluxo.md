# Diagrama de Fluxo do Sistema

```
+---------------------+     +----------------------+     +---------------------+
| Grupo de WhatsApp   |     | Sistema de Chamados  |     | Banco de Dados      |
+---------------------+     +----------------------+     +---------------------+
         |                           |                            |
         |                           |                            |
         |  "Novo chamado"           |                            |
         |-------------------------->|                            |
         |                           |                            |
         |  Solicita informações     |                            |
         |<--------------------------|                            |
         |                           |                            |
         |  Fornece dados do cliente |                            |
         |-------------------------->|                            |
         |                           |---> Verifica/Registra ---->|
         |                           |<---- Retorna dados --------|
         |                           |                            |
         |  Solicita detalhes        |                            |
         |<--------------------------|                            |
         |                           |                            |
         |  Fornece detalhes         |                            |
         |-------------------------->|                            |
         |                           |---> Registra chamado ----->|
         |                           |<---- Confirma registro ----|
         |                           |                            |
         |  Solicita diagnóstico     |                            |
         |<--------------------------|                            |
         |                           |                            |
         |  Fornece diagnóstico      |                            |
         |-------------------------->|                            |
         |                           |---> Atualiza chamado ----->|
         |                           |<---- Confirma atualização -|
         |                           |                            |
         |  Resumo para confirmação  |                            |
         |<--------------------------|                            |
         |                           |                            |
         |  Confirma dados           |                            |
         |-------------------------->|                            |
         |                           |---> Finaliza chamado ----->|
         |                           |<---- Confirma finalização -|
         |                           |                            |
         |                           |---> Gera relatório PDF     |
         |                           |                            |
         |  Relatório gerado         |                            |
         |<--------------------------|                            |
         |                           |                            |
         |                           |---> Envia ao cliente       |
         |                           |                            |
         |  Confirmação de envio     |                            |
         |<--------------------------|                            |
         |                           |                            |
```

## Fluxo de Interação com o Usuário

1. **Iniciação do Chamado**
   - Plantonista envia "Novo chamado" no grupo do WhatsApp
   - Sistema identifica o comando e inicia o processo de registro

2. **Coleta de Informações do Cliente**
   - Sistema solicita informações do cliente (nome, CNPJ/CPF, contato)
   - Plantonista fornece os dados solicitados
   - Sistema verifica se o cliente já existe no banco de dados
   - Se existir, recupera informações; se não, registra novo cliente

3. **Detalhes do Problema**
   - Sistema solicita descrição do problema, tipo de atendimento, prioridade
   - Plantonista fornece os detalhes solicitados
   - Sistema registra as informações no banco de dados

4. **Diagnóstico e Solução**
   - Sistema solicita análise técnica, procedimentos realizados, solução
   - Plantonista fornece as informações de diagnóstico e solução
   - Sistema atualiza o registro do chamado no banco de dados

5. **Confirmação e Finalização**
   - Sistema apresenta resumo das informações para confirmação
   - Plantonista confirma ou solicita correções
   - Sistema finaliza o registro do chamado

6. **Geração e Envio de Relatório**
   - Sistema gera automaticamente relatório em PDF
   - Sistema envia o relatório ao cliente via email ou WhatsApp
   - Sistema confirma o envio e atualiza o status no banco de dados

7. **Consulta Histórica**
   - Usuários podem consultar histórico de chamados anteriores
   - Sistema busca informações no banco de dados
   - Sistema apresenta resultados relevantes baseados na consulta
