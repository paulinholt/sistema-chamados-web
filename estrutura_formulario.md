# Estrutura do Formulário Padronizado para Chamados

## Formato de Inicialização
Para iniciar um novo chamado, o plantonista deve enviar a mensagem "Novo chamado" no grupo do WhatsApp.

## Campos do Formulário

### Informações do Cliente
1. **Nome do Cliente**: Nome completo da empresa ou pessoa física
2. **CNPJ/CPF**: Documento de identificação do cliente
3. **Contato Principal**: Nome da pessoa de contato
4. **Telefone**: Número para contato direto
5. **Email**: Endereço para envio do relatório

### Informações do Chamado
6. **ID do Chamado**: Gerado automaticamente pelo sistema (formato: DATA-SEQUENCIAL)
7. **Data e Hora**: Registro automático do momento da abertura
8. **Plantonista Responsável**: Nome do colaborador que está atendendo
9. **Tipo de Atendimento**: Categorias predefinidas (ex: Suporte Técnico, Manutenção, Consultoria)
10. **Prioridade**: Baixa, Média, Alta, Crítica

### Detalhes do Problema
11. **Descrição do Problema**: Relato detalhado da situação reportada
12. **Sintomas Observados**: Manifestações específicas do problema
13. **Ambiente Afetado**: Sistemas, equipamentos ou áreas impactadas
14. **Tempo de Ocorrência**: Desde quando o problema está acontecendo

### Diagnóstico e Solução
15. **Análise Técnica**: Avaliação técnica da causa do problema
16. **Procedimentos Realizados**: Passos executados durante o atendimento
17. **Solução Aplicada**: Descrição da resolução implementada
18. **Status Final**: Resolvido, Pendente, Escalado

### Informações Adicionais
19. **Tempo de Atendimento**: Duração total do atendimento
20. **Observações**: Informações complementares relevantes
21. **Recomendações**: Sugestões para evitar problemas futuros
22. **Anexos**: Opção para incluir imagens ou documentos relacionados

## Fluxo de Preenchimento

1. Plantonista envia "Novo chamado" no grupo
2. Sistema responde solicitando as informações em sequência
3. Plantonista preenche cada campo conforme solicitado
4. Sistema permite edição de campos anteriores se necessário
5. Ao finalizar, sistema apresenta resumo para confirmação
6. Após confirmação, sistema gera o relatório em PDF
7. Sistema envia o relatório ao cliente e armazena no banco de dados

## Considerações de Usabilidade

- Interface conversacional simples e intuitiva
- Comandos de atalho para agilizar o preenchimento
- Opção de cancelar o preenchimento a qualquer momento
- Possibilidade de usar templates para problemas recorrentes
- Validação de dados para garantir qualidade das informações
