import os
from flask import Flask, request, jsonify, render_template
import sqlite3
import datetime
import json
from werkzeug.utils import secure_filename

# Classe para simular integração com WhatsApp
class WhatsAppIntegration:
    def __init__(self):
        self.conversation_state = {}
        self.current_form = {}
    
    def process_message(self, sender, message):
        """Processa mensagens recebidas do WhatsApp"""
        # Verifica se é um novo chamado
        if message.lower() == "novo chamado":
            # Inicia um novo formulário
            self.conversation_state[sender] = "cliente"
            self.current_form[sender] = {}
            return "Por favor, informe o nome do cliente:"
        
        # Se já existe uma conversa em andamento
        if sender in self.conversation_state:
            current_state = self.conversation_state[sender]
            
            # Processa a resposta de acordo com o estado atual
            if current_state == "cliente":
                self.current_form[sender]['cliente'] = message
                self.conversation_state[sender] = "solicitante"
                return "Informe o nome do solicitante:"
            
            elif current_state == "solicitante":
                self.current_form[sender]['solicitante'] = message
                self.conversation_state[sender] = "projeto"
                return "Informe a sigla do projeto (ex: SUP, DEV, INFRA):"
            
            elif current_state == "projeto":
                self.current_form[sender]['projeto'] = message
                self.conversation_state[sender] = "motivo"
                return "Descreva o motivo da solicitação:"
            
            elif current_state == "motivo":
                self.current_form[sender]['motivo'] = message
                self.conversation_state[sender] = "prioridade"
                return "Qual a prioridade? (Baixa, Média, Alta, Crítica):"
            
            elif current_state == "prioridade":
                self.current_form[sender]['prioridade'] = message
                self.conversation_state[sender] = "diagnostico"
                return "Informe o diagnóstico e solução aplicada:"
            
            elif current_state == "diagnostico":
                self.current_form[sender]['diagnostico'] = message
                self.conversation_state[sender] = "confirmar"
                
                # Prepara resumo para confirmação
                form = self.current_form[sender]
                resumo = f"""
                *Resumo do Chamado:*
                
                *Cliente:* {form.get('cliente', '')}
                *Solicitante:* {form.get('solicitante', '')}
                *Projeto:* {form.get('projeto', '')}
                *Motivo:* {form.get('motivo', '')}
                *Prioridade:* {form.get('prioridade', '')}
                *Diagnóstico/Solução:* {form.get('diagnostico', '')}
                
                Os dados estão corretos? Responda 'sim' para confirmar ou 'não' para corrigir.
                """
                return resumo
            
            elif current_state == "confirmar":
                if message.lower() == "sim":
                    # Finaliza o chamado e salva no banco de dados
                    chamado = self.current_form[sender]
                    chamado_id = self.salvar_chamado(chamado)
                    
                    # Limpa o estado da conversa
                    del self.conversation_state[sender]
                    del self.current_form[sender]
                    
                    return f"Chamado registrado com sucesso! ID: {chamado_id}\nO relatório será gerado e enviado automaticamente."
                
                elif message.lower() == "não":
                    # Reinicia o formulário
                    self.conversation_state[sender] = "cliente"
                    return "Vamos recomeçar. Por favor, informe o nome do cliente:"
                
                else:
                    return "Por favor, responda 'sim' para confirmar ou 'não' para corrigir."
        
        # Se não há conversa em andamento e não é um comando conhecido
        return "Para iniciar um novo chamado, envie 'Novo chamado'.\nPara consultar o histórico, envie 'Consultar [termo de busca]'."
    
    def salvar_chamado(self, chamado):
        """Salva o chamado no banco de dados e retorna o ID gerado"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se o cliente já existe
        cursor.execute("SELECT id_cliente FROM cliente WHERE nome = ?", (chamado['cliente'],))
        cliente = cursor.fetchone()
        
        # Se o cliente não existir, cria um novo
        if cliente is None:
            cursor.execute("""
                INSERT INTO cliente (nome, contato)
                VALUES (?, ?)
            """, (chamado['cliente'], chamado['solicitante']))
            id_cliente = cursor.lastrowid
        else:
            id_cliente = cliente[0]
        
        # Verifica se o projeto existe
        cursor.execute("SELECT id_projeto FROM projeto WHERE sigla = ?", (chamado['projeto'],))
        projeto = cursor.fetchone()
        id_projeto = projeto[0] if projeto else None
        
        # Busca o ID do plantonista (usando o remetente como plantonista neste exemplo)
        plantonista_nome = "Plantonista de Plantão"  # Em um sistema real, seria identificado pelo número do WhatsApp
        cursor.execute("SELECT id_plantonista FROM plantonista WHERE nome = ?", (plantonista_nome,))
        plantonista = cursor.fetchone()
        
        # Se o plantonista não existir, cria um novo
        if plantonista is None:
            cursor.execute("""
                INSERT INTO plantonista (nome)
                VALUES (?)
            """, (plantonista_nome,))
            id_plantonista = cursor.lastrowid
        else:
            id_plantonista = plantonista[0]
        
        # Gera o ID do chamado
        id_chamado = gerar_id_chamado()
        
        # Cria o novo chamado
        cursor.execute("""
            INSERT INTO chamado (
                id_chamado, id_cliente, id_plantonista, id_projeto,
                prioridade, descricao, analise, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            id_chamado, id_cliente, id_plantonista, id_projeto,
            chamado.get('prioridade', 'Média'),
            chamado['motivo'],
            chamado['diagnostico'],
            'Resolvido'  # Assumindo que o chamado já está resolvido quando registrado
        ))
        
        conn.commit()
        conn.close()
        
        return id_chamado

# Funções auxiliares para o banco de dados
def get_db_connection():
    """Cria uma conexão com o banco de dados"""
    conn = sqlite3.connect('chamados.db')
    conn.row_factory = sqlite3.Row
    return conn

def gerar_id_chamado():
    """Gera um ID único para o chamado no formato RAC+número sequencial"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Obtém o último ID de chamado
    cursor.execute("SELECT id_chamado FROM chamado ORDER BY id_chamado DESC LIMIT 1")
    result = cursor.fetchone()
    
    conn.close()
    
    # Se não houver chamados, começa do 1
    if result is None:
        return "RAC0001"
    
    # Extrai o número do último RAC e incrementa
    ultimo_id = result[0]
    if ultimo_id.startswith('RAC'):
        ultimo_numero = int(ultimo_id[3:])
        novo_numero = ultimo_numero + 1
        return f"RAC{novo_numero:04d}"
    else:
        return "RAC0001"  # Fallback se o formato não for o esperado

# Simulação de interação com WhatsApp
def simular_conversa():
    whatsapp = WhatsAppIntegration()
    
    # Simula uma conversa
    print("=== Simulação de Conversa no WhatsApp ===")
    
    sender = "+5585999999999"  # Número fictício do plantonista
    
    # Inicia um novo chamado
    message = "Novo chamado"
    response = whatsapp.process_message(sender, message)
    print(f"Plantonista: {message}")
    print(f"Bot: {response}\n")
    
    # Fornece informações do cliente
    message = "Dias Branco - FFT"
    response = whatsapp.process_message(sender, message)
    print(f"Plantonista: {message}")
    print(f"Bot: {response}\n")
    
    # Fornece nome do solicitante
    message = "Marcos"
    response = whatsapp.process_message(sender, message)
    print(f"Plantonista: {message}")
    print(f"Bot: {response}\n")
    
    # Fornece sigla do projeto
    message = "SUP"
    response = whatsapp.process_message(sender, message)
    print(f"Plantonista: {message}")
    print(f"Bot: {response}\n")
    
    # Fornece motivo da solicitação
    message = "Sistema supervisório estava fora do ar"
    response = whatsapp.process_message(sender, message)
    print(f"Plantonista: {message}")
    print(f"Bot: {response}\n")
    
    # Fornece prioridade
    message = "Alta"
    response = whatsapp.process_message(sender, message)
    print(f"Plantonista: {message}")
    print(f"Bot: {response}\n")
    
    # Fornece diagnóstico e solução
    message = "Ao acessar remotamente, foi visto que o servidor estava completamente travado. O servidor é virtualizado, no CIT de fortaleza. WEF não detém dos dados para reinicialização ou qualquer tipo de manutenção no servidor primário, sendo assim, solicitamos a reinicialização ao CIT Mdias. Após procedimento, servidor voltou ao seu funcionamento e a operação pôde prosseguir."
    response = whatsapp.process_message(sender, message)
    print(f"Plantonista: {message}")
    print(f"Bot: {response}\n")
    
    # Confirma os dados
    message = "sim"
    response = whatsapp.process_message(sender, message)
    print(f"Plantonista: {message}")
    print(f"Bot: {response}\n")
    
    print("=== Fim da Simulação ===")

# Função para inicializar o banco de dados
def init_db():
    """Inicializa o banco de dados com o schema definido"""
    if not os.path.exists('chamados.db'):
        conn = sqlite3.connect('chamados.db')
        
        # Executa o schema principal
        with open('schema.sql', 'r') as f:
            conn.executescript(f.read())
        
        # Executa o schema de projetos
        with open('schema_projeto.sql', 'r') as f:
            conn.executescript(f.read())
            
        conn.close()
        print("Banco de dados inicializado com sucesso!")

# Função principal para testar o sistema
if __name__ == "__main__":
    # Inicializa o banco de dados
    init_db()
    
    # Simula uma conversa no WhatsApp
    simular_conversa()
