import os
import sqlite3
import json
from datetime import datetime

class ConsultaHistorica:
    def __init__(self, db_path='chamados.db'):
        self.db_path = db_path
    
    def get_db_connection(self):
        """Cria uma conexão com o banco de dados"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def buscar_por_texto(self, termo_busca, limite=20):
        """Busca chamados que contenham o termo em vários campos"""
        conn = self.get_db_connection()
        
        # Prepara o termo de busca para LIKE
        termo = f"%{termo_busca}%"
        
        # Busca em vários campos relevantes
        chamados = conn.execute("""
            SELECT 
                c.id_chamado, c.data_hora, c.status,
                cl.nome as cliente, cl.contato as solicitante,
                p.nome as plantonista,
                c.descricao, c.analise, c.solucao,
                proj.sigla as projeto_sigla
            FROM chamado c
            JOIN cliente cl ON c.id_cliente = cl.id_cliente
            JOIN plantonista p ON c.id_plantonista = p.id_plantonista
            LEFT JOIN projeto proj ON c.id_projeto = proj.id_projeto
            WHERE 
                c.descricao LIKE ? OR
                c.ambiente LIKE ? OR
                c.analise LIKE ? OR
                c.procedimentos LIKE ? OR
                c.solucao LIKE ? OR
                c.observacoes LIKE ? OR
                c.recomendacoes LIKE ? OR
                cl.nome LIKE ? OR
                cl.contato LIKE ?
            ORDER BY c.data_hora DESC
            LIMIT ?
        """, (termo, termo, termo, termo, termo, termo, termo, termo, termo, limite)).fetchall()
        
        conn.close()
        
        # Converte para lista de dicionários
        resultados = []
        for chamado in chamados:
            chamado_dict = dict(chamado)
            
            # Formata a data para exibição
            if chamado_dict['data_hora']:
                data_hora = datetime.strptime(chamado_dict['data_hora'], '%Y-%m-%d %H:%M:%S')
                chamado_dict['data_formatada'] = data_hora.strftime('%d/%m/%Y %H:%M')
            else:
                chamado_dict['data_formatada'] = 'N/A'
            
            resultados.append(chamado_dict)
        
        return resultados
    
    def buscar_por_cliente(self, nome_cliente, limite=20):
        """Busca chamados de um cliente específico"""
        conn = self.get_db_connection()
        
        # Prepara o termo de busca para LIKE
        termo = f"%{nome_cliente}%"
        
        # Busca chamados do cliente
        chamados = conn.execute("""
            SELECT 
                c.id_chamado, c.data_hora, c.status,
                cl.nome as cliente, cl.contato as solicitante,
                p.nome as plantonista,
                c.descricao, c.analise, c.solucao,
                proj.sigla as projeto_sigla
            FROM chamado c
            JOIN cliente cl ON c.id_cliente = cl.id_cliente
            JOIN plantonista p ON c.id_plantonista = p.id_plantonista
            LEFT JOIN projeto proj ON c.id_projeto = proj.id_projeto
            WHERE cl.nome LIKE ?
            ORDER BY c.data_hora DESC
            LIMIT ?
        """, (termo, limite)).fetchall()
        
        conn.close()
        
        # Converte para lista de dicionários
        resultados = []
        for chamado in chamados:
            chamado_dict = dict(chamado)
            
            # Formata a data para exibição
            if chamado_dict['data_hora']:
                data_hora = datetime.strptime(chamado_dict['data_hora'], '%Y-%m-%d %H:%M:%S')
                chamado_dict['data_formatada'] = data_hora.strftime('%d/%m/%Y %H:%M')
            else:
                chamado_dict['data_formatada'] = 'N/A'
            
            resultados.append(chamado_dict)
        
        return resultados
    
    def buscar_por_projeto(self, sigla_projeto, limite=20):
        """Busca chamados de um projeto específico"""
        conn = self.get_db_connection()
        
        # Busca chamados do projeto
        chamados = conn.execute("""
            SELECT 
                c.id_chamado, c.data_hora, c.status,
                cl.nome as cliente, cl.contato as solicitante,
                p.nome as plantonista,
                c.descricao, c.analise, c.solucao,
                proj.sigla as projeto_sigla
            FROM chamado c
            JOIN cliente cl ON c.id_cliente = cl.id_cliente
            JOIN plantonista p ON c.id_plantonista = p.id_plantonista
            JOIN projeto proj ON c.id_projeto = proj.id_projeto
            WHERE proj.sigla = ?
            ORDER BY c.data_hora DESC
            LIMIT ?
        """, (sigla_projeto, limite)).fetchall()
        
        conn.close()
        
        # Converte para lista de dicionários
        resultados = []
        for chamado in chamados:
            chamado_dict = dict(chamado)
            
            # Formata a data para exibição
            if chamado_dict['data_hora']:
                data_hora = datetime.strptime(chamado_dict['data_hora'], '%Y-%m-%d %H:%M:%S')
                chamado_dict['data_formatada'] = data_hora.strftime('%d/%m/%Y %H:%M')
            else:
                chamado_dict['data_formatada'] = 'N/A'
            
            resultados.append(chamado_dict)
        
        return resultados
    
    def buscar_solucoes_similares(self, descricao_problema, limite=5):
        """Busca soluções para problemas similares"""
        conn = self.get_db_connection()
        
        # Prepara o termo de busca para LIKE
        termo = f"%{descricao_problema}%"
        
        # Busca chamados com problemas similares
        chamados = conn.execute("""
            SELECT 
                c.id_chamado, c.descricao, c.solucao,
                cl.nome as cliente,
                c.data_hora
            FROM chamado c
            JOIN cliente cl ON c.id_cliente = cl.id_cliente
            WHERE 
                c.descricao LIKE ? AND
                c.solucao IS NOT NULL AND
                c.status = 'Resolvido'
            ORDER BY c.data_hora DESC
            LIMIT ?
        """, (termo, limite)).fetchall()
        
        conn.close()
        
        # Converte para lista de dicionários
        resultados = []
        for chamado in chamados:
            chamado_dict = dict(chamado)
            
            # Formata a data para exibição
            if chamado_dict['data_hora']:
                data_hora = datetime.strptime(chamado_dict['data_hora'], '%Y-%m-%d %H:%M:%S')
                chamado_dict['data_formatada'] = data_hora.strftime('%d/%m/%Y %H:%M')
            else:
                chamado_dict['data_formatada'] = 'N/A'
            
            resultados.append(chamado_dict)
        
        return resultados
    
    def processar_consulta_whatsapp(self, mensagem):
        """Processa uma consulta recebida via WhatsApp"""
        # Verifica se é uma consulta
        if mensagem.lower().startswith('consultar '):
            # Extrai o termo de busca
            termo = mensagem[10:].strip()
            
            # Realiza a busca
            resultados = self.buscar_por_texto(termo)
            
            # Formata a resposta
            if resultados:
                resposta = f"Encontrei {len(resultados)} chamados relacionados a '{termo}':\n\n"
                
                for i, resultado in enumerate(resultados[:5], 1):
                    resposta += f"{i}. {resultado['id_chamado']} - {resultado['data_formatada']}\n"
                    resposta += f"   Cliente: {resultado['cliente']}\n"
                    resposta += f"   Problema: {resultado['descricao'][:100]}...\n"
                    if resultado['solucao']:
                        resposta += f"   Solução: {resultado['solucao'][:100]}...\n"
                    resposta += "\n"
                
                if len(resultados) > 5:
                    resposta += f"E mais {len(resultados) - 5} resultados. Refine sua busca para resultados mais específicos."
            else:
                resposta = f"Não encontrei chamados relacionados a '{termo}'. Tente outros termos."
            
            return resposta
        
        # Verifica se é uma busca por cliente
        elif mensagem.lower().startswith('cliente '):
            # Extrai o nome do cliente
            nome_cliente = mensagem[8:].strip()
            
            # Realiza a busca
            resultados = self.buscar_por_cliente(nome_cliente)
            
            # Formata a resposta
            if resultados:
                resposta = f"Encontrei {len(resultados)} chamados para o cliente '{nome_cliente}':\n\n"
                
                for i, resultado in enumerate(resultados[:5], 1):
                    resposta += f"{i}. {resultado['id_chamado']} - {resultado['data_formatada']}\n"
                    resposta += f"   Problema: {resultado['descricao'][:100]}...\n"
                    resposta += f"   Status: {resultado['status']}\n\n"
                
                if len(resultados) > 5:
                    resposta += f"E mais {len(resultados) - 5} chamados."
            else:
                resposta = f"Não encontrei chamados para o cliente '{nome_cliente}'."
            
            return resposta
        
        # Verifica se é uma busca por projeto
        elif mensagem.lower().startswith('projeto '):
            # Extrai a sigla do projeto
            sigla_projeto = mensagem[8:].strip()
            
            # Realiza a busca
            resultados = self.buscar_por_projeto(sigla_projeto)
            
            # Formata a resposta
            if resultados:
                resposta = f"Encontrei {len(resultados)} chamados para o projeto '{sigla_projeto}':\n\n"
                
                for i, resultado in enumerate(resultados[:5], 1):
                    resposta += f"{i}. {resultado['id_chamado']} - {resultado['data_formatada']}\n"
                    resposta += f"   Cliente: {resultado['cliente']}\n"
                    resposta += f"   Problema: {resultado['descricao'][:100]}...\n"
                    resposta += f"   Status: {resultado['status']}\n\n"
                
                if len(resultados) > 5:
                    resposta += f"E mais {len(resultados) - 5} chamados."
            else:
                resposta = f"Não encontrei chamados para o projeto '{sigla_projeto}'."
            
            return resposta
        
        # Verifica se é uma busca por solução
        elif mensagem.lower().startswith('solucao ') or mensagem.lower().startswith('solução '):
            # Extrai a descrição do problema
            problema = mensagem[8:].strip()
            
            # Realiza a busca
            resultados = self.buscar_solucoes_similares(problema)
            
            # Formata a resposta
            if resultados:
                resposta = f"Encontrei {len(resultados)} soluções para problemas similares:\n\n"
                
                for i, resultado in enumerate(resultados, 1):
                    resposta += f"{i}. {resultado['id_chamado']} - {resultado['data_formatada']}\n"
                    resposta += f"   Problema: {resultado['descricao'][:100]}...\n"
                    resposta += f"   Solução: {resultado['solucao'][:150]}...\n\n"
            else:
                resposta = f"Não encontrei soluções para problemas similares a '{problema}'."
            
            return resposta
        
        # Se não for uma consulta válida
        else:
            return """
            Para consultar o histórico, use um dos seguintes formatos:
            
            - consultar [termo]: Busca chamados com o termo especificado
            - cliente [nome]: Busca chamados de um cliente específico
            - projeto [sigla]: Busca chamados de um projeto específico
            - solução [problema]: Busca soluções para problemas similares
            """

# Função para testar a consulta histórica
def test_consulta_historica():
    consulta = ConsultaHistorica()
    
    # Testa busca por texto
    print("=== Teste de busca por texto ===")
    resultados = consulta.buscar_por_texto("servidor")
    print(f"Encontrados {len(resultados)} resultados para 'servidor'")
    for resultado in resultados[:2]:
        print(f"- {resultado['id_chamado']} - {resultado['cliente']} - {resultado['descricao'][:50]}...")
    
    # Testa processamento de consulta via WhatsApp
    print("\n=== Teste de processamento de consulta via WhatsApp ===")
    mensagens_teste = [
        "consultar servidor",
        "cliente Dias Branco",
        "projeto SUP",
        "solução servidor travado",
        "ajuda"
    ]
    
    for mensagem in mensagens_teste:
        print(f"\nMensagem: {mensagem}")
        resposta = consulta.processar_consulta_whatsapp(mensagem)
        print(f"Resposta: {resposta[:150]}...")

if __name__ == "__main__":
    test_consulta_historica()
