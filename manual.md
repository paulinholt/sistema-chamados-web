# Manual do Sistema de Gerenciamento de Chamados via WhatsApp

## Visão Geral

O Sistema de Gerenciamento de Chamados via WhatsApp é uma solução completa para registro, acompanhamento e documentação de atendimentos técnicos. O sistema permite que plantonistas registrem chamados através do WhatsApp, gera relatórios em PDF automaticamente e os envia aos clientes, além de oferecer funcionalidades de consulta ao histórico de atendimentos.

## Componentes do Sistema

O sistema é composto pelos seguintes módulos:

1. **Bot do WhatsApp**: Interface para registro de chamados via WhatsApp
2. **Banco de Dados**: Armazenamento estruturado de chamados, clientes, projetos e relatórios
3. **Gerador de PDF**: Criação automática de relatórios no formato RAC
4. **Módulo de Envio**: Envio de relatórios por email ou WhatsApp
5. **Consulta Histórica**: Busca de chamados anteriores e soluções
6. **Interface Web**: Gerenciamento de projetos e visualização de estatísticas

## Requisitos do Sistema

- Python 3.10 ou superior
- SQLite 3
- Bibliotecas: Flask, WeasyPrint, Jinja2, Pillow, Pandas
- Acesso à internet para envio de emails e mensagens WhatsApp

## Instalação

1. Clone o repositório ou extraia os arquivos para uma pasta
2. Instale as dependências:
   ```
   pip3 install flask weasyprint jinja2 pillow pandas requests
   ```
3. Execute o script de inicialização:
   ```
   ./run.sh
   ```

## Uso do Sistema

### Registro de Chamados via WhatsApp

Para registrar um novo chamado, o plantonista deve enviar a mensagem "Novo chamado" no grupo do WhatsApp. O sistema iniciará um diálogo para coletar as informações necessárias:

1. Nome do cliente
2. Nome do solicitante
3. Sigla do projeto
4. Motivo da solicitação
5. Prioridade
6. Diagnóstico e solução

Após confirmar os dados, o sistema registra o chamado, gera um relatório PDF e o envia ao cliente.

### Comandos de Consulta via WhatsApp

O sistema permite consultar o histórico de chamados através dos seguintes comandos:

- `consultar [termo]`: Busca chamados com o termo especificado
- `cliente [nome]`: Busca chamados de um cliente específico
- `projeto [sigla]`: Busca chamados de um projeto específico
- `solução [problema]`: Busca soluções para problemas similares

### Interface Web

A interface web permite gerenciar projetos e visualizar estatísticas. Para acessá-la:

1. Execute o servidor web através do script `run.sh` (opção 1)
2. Acesse http://localhost:5000 no navegador

Na interface web, você pode:
- Cadastrar novos projetos
- Visualizar estatísticas de chamados por projeto
- Exportar dados para CSV
- Gerenciar informações de gerentes e contatos

## Estrutura de Arquivos

- `app_completo.py`: Aplicação web principal
- `whatsapp_bot_fixed.py`: Bot para interação via WhatsApp
- `pdf_generator.py`: Gerador de relatórios PDF
- `relatorio_sender.py`: Módulo de envio de relatórios
- `consulta_historica.py`: Funcionalidade de consulta ao histórico
- `schema.sql` e `schema_projeto.sql`: Esquemas do banco de dados
- `templates/`: Modelos HTML para relatórios e interface web
- `static/`: Arquivos estáticos (CSS, imagens)
- `relatorios/`: Diretório onde os PDFs são armazenados
- `exportacoes/`: Diretório para arquivos exportados
- `test_sistema.py`: Testes unitários e de integração
- `run.sh`: Script de execução com menu interativo

## Configuração

### Configuração de Email

Para configurar o envio de emails, edite o arquivo `relatorio_sender.py` e atualize as seguintes informações:

```python
self.email_config = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'username': 'seu_email@gmail.com',
    'password': 'sua_senha_ou_token',
    'from_email': 'seu_email@gmail.com',
    'from_name': 'Sistema de Chamados'
}
```

### Configuração do WhatsApp

Para configurar a integração com o WhatsApp Business API, edite o arquivo `relatorio_sender.py` e atualize:

```python
self.whatsapp_config = {
    'api_url': 'https://api.whatsapp.com/send',
    'phone_number': '+5511977123444'  # Seu número
}
```

## Personalização

### Logotipos

Para personalizar os logotipos nos relatórios PDF:

1. Substitua os arquivos em `static/img/logo_left.png` e `static/img/logo_right.png`
2. Os logotipos devem ter tamanho aproximado de 150x60 pixels

### Formato do Relatório

Para personalizar o formato do relatório PDF, edite o arquivo `templates/relatorio_template.html`.

## Solução de Problemas

### Erro ao gerar PDF

Se ocorrerem erros na geração de PDFs, verifique:
- Se a biblioteca WeasyPrint está instalada corretamente
- Se os diretórios `relatorios/` e `static/img/` existem e têm permissões de escrita
- Se o template HTML está correto

### Erro ao enviar relatórios

Se ocorrerem erros no envio de relatórios, verifique:
- As configurações de email (servidor SMTP, porta, credenciais)
- A conexão com a internet
- Se o cliente tem email ou telefone cadastrado

### Erro na consulta histórica

Se a consulta histórica não retornar resultados esperados, verifique:
- Se há dados suficientes no banco de dados
- Se os termos de busca estão corretos
- Se o banco de dados não está corrompido

## Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

© 2025 Sistema de Gerenciamento de Chamados via WhatsApp
