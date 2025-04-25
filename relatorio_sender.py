import os
import smtplib
import sqlite3
import requests
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from datetime import datetime

class RelatorioSender:
    def __init__(self, db_path='chamados.db'):
        self.db_path = db_path
        self.relatorios_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'relatorios')
        
        # Configurações de email (devem ser definidas pelo usuário)
        self.email_config = {
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'username': 'seu_email@gmail.com',
            'password': 'sua_senha_ou_token',
            'from_email': 'seu_email@gmail.com',
            'from_name': 'Sistema de Chamados'
        }
        
        # Configurações do WhatsApp (usando API externa)
        self.whatsapp_config = {
            'api_url': 'https://api.whatsapp.com/send',
            'phone_number': '+5511977123444'  # Número fornecido pelo usuário
        }
    
    def get_db_connection(self):
        """Cria uma conexão com o banco de dados"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def get_pending_reports(self):
        """Obtém relatórios pendentes de envio"""
        conn = self.get_db_connection()
        
        # Busca relatórios gerados mas não enviados
        relatorios = conn.execute("""
            SELECT r.id_relatorio, r.id_chamado, r.caminho_pdf, 
                   c.id_cliente, cl.nome as cliente, cl.email, cl.telefone,
                   c.id_projeto, p.email_gerente
            FROM relatorio r
            JOIN chamado c ON r.id_chamado = c.id_chamado
            JOIN cliente cl ON c.id_cliente = cl.id_cliente
            LEFT JOIN projeto p ON c.id_projeto = p.id_projeto
            WHERE r.enviado = 0
        """).fetchall()
        
        conn.close()
        
        # Converte para lista de dicionários
        return [dict(relatorio) for relatorio in relatorios]
    
    def send_report_by_email(self, relatorio):
        """Envia relatório por email"""
        try:
            # Verifica se o cliente tem email cadastrado
            if not relatorio.get('email'):
                return {
                    'success': False,
                    'message': f"Cliente {relatorio['cliente']} não possui email cadastrado"
                }
            
            # Verifica se o arquivo existe
            pdf_path = relatorio['caminho_pdf']
            if not os.path.exists(pdf_path):
                return {
                    'success': False,
                    'message': f"Arquivo não encontrado: {pdf_path}"
                }
            
            # Configura a mensagem
            msg = MIMEMultipart()
            msg['From'] = f"{self.email_config['from_name']} <{self.email_config['from_email']}>"
            msg['To'] = relatorio['email']
            msg['Subject'] = f"Relatório de Atendimento - {relatorio['id_chamado']}"
            
            # Corpo do email
            body = f"""
            Prezado(a) {relatorio['cliente']},
            
            Segue em anexo o Relatório de Atendimento ao Cliente (RAC) referente ao chamado {relatorio['id_chamado']}.
            
            Agradecemos pela confiança em nossos serviços.
            
            Atenciosamente,
            Equipe de Suporte
            """
            msg.attach(MIMEText(body, 'plain'))
            
            # Anexa o PDF
            with open(pdf_path, 'rb') as file:
                attachment = MIMEApplication(file.read(), _subtype="pdf")
                attachment.add_header('Content-Disposition', 'attachment', filename=os.path.basename(pdf_path))
                msg.attach(attachment)
            
            # Envia o email
            with smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port']) as server:
                server.starttls()
                server.login(self.email_config['username'], self.email_config['password'])
                server.send_message(msg)
            
            # Adiciona o gerente em cópia se existir
            if relatorio.get('email_gerente'):
                msg['To'] = relatorio['email_gerente']
                msg['Subject'] = f"[Cópia] Relatório de Atendimento - {relatorio['id_chamado']}"
                
                with smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port']) as server:
                    server.starttls()
                    server.login(self.email_config['username'], self.email_config['password'])
                    server.send_message(msg)
            
            return {
                'success': True,
                'message': f"Email enviado com sucesso para {relatorio['email']}"
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f"Erro ao enviar email: {str(e)}"
            }
    
    def send_report_by_whatsapp(self, relatorio):
        """Envia relatório por WhatsApp (simulação)"""
        try:
            # Verifica se o cliente tem telefone cadastrado
            if not relatorio.get('telefone'):
                return {
                    'success': False,
                    'message': f"Cliente {relatorio['cliente']} não possui telefone cadastrado"
                }
            
            # Verifica se o arquivo existe
            pdf_path = relatorio['caminho_pdf']
            if not os.path.exists(pdf_path):
                return {
                    'success': False,
                    'message': f"Arquivo não encontrado: {pdf_path}"
                }
            
            # Em um ambiente real, aqui seria implementada a integração com a API do WhatsApp Business
            # Como estamos em um ambiente de simulação, apenas logamos a ação
            
            # Formata o número de telefone (remove caracteres não numéricos)
            telefone = ''.join(filter(str.isdigit, relatorio['telefone']))
            
            # Simula o envio
            print(f"[SIMULAÇÃO] Enviando relatório {relatorio['id_chamado']} por WhatsApp para {telefone}")
            print(f"[SIMULAÇÃO] Arquivo: {pdf_path}")
            
            # Em um ambiente real, usaríamos algo como:
            # response = requests.post(
            #     self.whatsapp_config['api_url'],
            #     headers={'Authorization': f"Bearer {self.whatsapp_config['api_token']}"},
            #     json={
            #         'phone': telefone,
            #         'message': f"Relatório de Atendimento - {relatorio['id_chamado']}",
            #         'document': {'url': pdf_path}
            #     }
            # )
            # response.raise_for_status()
            
            return {
                'success': True,
                'message': f"WhatsApp enviado com sucesso para {telefone} (simulação)"
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f"Erro ao enviar WhatsApp: {str(e)}"
            }
    
    def mark_as_sent(self, id_relatorio, metodo_envio):
        """Marca o relatório como enviado no banco de dados"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE relatorio
            SET enviado = 1, metodo_envio = ?, data_envio = CURRENT_TIMESTAMP
            WHERE id_relatorio = ?
        """, (metodo_envio, id_relatorio))
        
        conn.commit()
        conn.close()
    
    def process_pending_reports(self):
        """Processa todos os relatórios pendentes de envio"""
        relatorios = self.get_pending_reports()
        resultados = []
        
        for relatorio in relatorios:
            # Tenta enviar por email
            if relatorio.get('email'):
                resultado_email = self.send_report_by_email(relatorio)
                if resultado_email['success']:
                    self.mark_as_sent(relatorio['id_relatorio'], 'Email')
                    resultados.append({
                        'id_relatorio': relatorio['id_relatorio'],
                        'id_chamado': relatorio['id_chamado'],
                        'metodo': 'Email',
                        'resultado': resultado_email
                    })
                    continue
            
            # Se não conseguiu enviar por email ou não tem email, tenta por WhatsApp
            if relatorio.get('telefone'):
                resultado_whatsapp = self.send_report_by_whatsapp(relatorio)
                if resultado_whatsapp['success']:
                    self.mark_as_sent(relatorio['id_relatorio'], 'WhatsApp')
                    resultados.append({
                        'id_relatorio': relatorio['id_relatorio'],
                        'id_chamado': relatorio['id_chamado'],
                        'metodo': 'WhatsApp',
                        'resultado': resultado_whatsapp
                    })
                    continue
            
            # Se não conseguiu enviar por nenhum método
            resultados.append({
                'id_relatorio': relatorio['id_relatorio'],
                'id_chamado': relatorio['id_chamado'],
                'metodo': 'Falha',
                'resultado': {
                    'success': False,
                    'message': 'Não foi possível enviar por nenhum método'
                }
            })
        
        return resultados

# Função para testar o envio de relatórios
def test_report_sending():
    sender = RelatorioSender()
    
    # Obtém relatórios pendentes
    relatorios = sender.get_pending_reports()
    print(f"Relatórios pendentes: {len(relatorios)}")
    
    # Processa os relatórios pendentes
    resultados = sender.process_pending_reports()
    print(f"Resultados do processamento:")
    for resultado in resultados:
        print(f"- Relatório {resultado['id_chamado']} enviado por {resultado['metodo']}: {resultado['resultado']['message']}")

if __name__ == "__main__":
    test_report_sending()
