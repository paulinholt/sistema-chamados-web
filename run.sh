#!/bin/bash

# Script para executar o sistema de gerenciamento de chamados

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Sistema de Gerenciamento de Chamados via WhatsApp ===${NC}"
echo -e "${YELLOW}Inicializando componentes...${NC}"

# Verifica se o banco de dados existe
if [ ! -f "chamados.db" ]; then
    echo -e "${YELLOW}Banco de dados não encontrado. Inicializando...${NC}"
    
    # Cria o banco de dados com o schema
    echo -e "${BLUE}Criando banco de dados...${NC}"
    sqlite3 chamados.db < schema.sql
    sqlite3 chamados.db < schema_projeto.sql
    
    echo -e "${GREEN}Banco de dados inicializado com sucesso!${NC}"
else
    echo -e "${GREEN}Banco de dados encontrado.${NC}"
fi

# Cria diretórios necessários
mkdir -p relatorios
mkdir -p exportacoes
mkdir -p static/img

# Verifica se as dependências estão instaladas
echo -e "${BLUE}Verificando dependências...${NC}"
pip3 install flask weasyprint jinja2 pillow pandas requests

# Menu de opções
while true; do
    echo -e "\n${BLUE}=== Menu Principal ===${NC}"
    echo "1. Iniciar servidor web"
    echo "2. Simular conversa no WhatsApp"
    echo "3. Gerar relatórios pendentes"
    echo "4. Processar envio de relatórios"
    echo "5. Testar consulta histórica"
    echo "6. Executar testes do sistema"
    echo "7. Sair"
    
    read -p "Escolha uma opção: " opcao
    
    case $opcao in
        1)
            echo -e "${YELLOW}Iniciando servidor web na porta 5000...${NC}"
            echo -e "${YELLOW}Acesse http://localhost:5000 no navegador${NC}"
            echo -e "${YELLOW}Pressione Ctrl+C para parar o servidor${NC}"
            python3 app_completo.py
            ;;
        2)
            echo -e "${YELLOW}Simulando conversa no WhatsApp...${NC}"
            python3 whatsapp_bot_fixed.py
            ;;
        3)
            echo -e "${YELLOW}Gerando relatórios pendentes...${NC}"
            python3 pdf_generator.py
            ;;
        4)
            echo -e "${YELLOW}Processando envio de relatórios...${NC}"
            python3 relatorio_sender.py
            ;;
        5)
            echo -e "${YELLOW}Testando consulta histórica...${NC}"
            python3 consulta_historica.py
            ;;
        6)
            echo -e "${YELLOW}Executando testes do sistema...${NC}"
            python3 -m unittest test_sistema.py
            ;;
        7)
            echo -e "${GREEN}Encerrando o sistema. Até logo!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Opção inválida. Tente novamente.${NC}"
            ;;
    esac
done
