from flask import Flask, request, jsonify
import sqlite3
import os
import datetime
import json
import re

app = Flask(__name__)

# Configuração do banco de dados
DB_PATH = 'chamados.db'

def init_db():
    """Inicializa o banco de dados com o schema definido"""
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        with open('schema.sql', 'r') as f:
            conn.executescript(f.read())
        conn.close()
        print("Banco de dados inicializado com sucesso!")

def get_db_connection():
    """Cria uma conexão com o banco de dados"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def gerar_id_chamado():
    """Gera um ID único para o chamado no formato RAC+número sequencial"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Obtém o último ID de chamado
    cursor.execute("SELECT MAX(id_chamado) FROM chamado")
    result = cursor.fetchone()[0]
    
    conn.close()
    
    # Se não houver chamados, começa do 1
    if result is None:
        return "RAC0001"
    
    # Extrai o número do último RAC e incrementa
    ultimo_numero = int(result.replace("RAC", ""))
    novo_numero = ultimo_numero + 1
    
    # Formata o novo ID com zeros à esquerda
    return f"RAC{novo_numero:04d}"

# Rotas da API para o sistema de chamados

@app.route('/api/chamado/novo', methods=['POST'])
def iniciar_chamado():
    """Inicia um novo chamado com as informações básicas"""
    data = request.json
    
    # Verifica se o cliente já existe
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id_cliente FROM cliente WHERE nome = ?", (data['cliente'],))
    cliente = cursor.fetchone()
    
    # Se o cliente não existir, cria um novo
    if cliente is None:
        cursor.execute("""
            INSERT INTO cliente (nome, contato, telefone, email)
            VALUES (?, ?, ?, ?)
        """, (data['cliente'], data['solicitante'], data.get('telefone', ''), data.get('email', '')))
        id_cliente = cursor.lastrowid
    else:
        id_cliente = cliente[0]
    
    # Busca o ID do plantonista
    cursor.execute("SELECT id_plantonista FROM plantonista WHERE nome = ?", (data['plantonista'],))
    plantonista = cursor.fetchone()
    
    # Se o plantonista não existir, cria um novo
    if plantonista is None:
        cursor.execute("""
            INSERT INTO plantonista (nome, email, telefone)
            VALUES (?, ?, ?)
        """, (data['plantonista'], data.get('email_plantonista', ''), data.get('telefone_plantonista', '')))
        id_plantonista = cursor.lastrowid
    else:
        id_plantonista = plantonista[0]
    
    # Busca o ID da categoria
    cursor.execute("SELECT id_categoria FROM categoria WHERE nome = ?", (data['categoria'],))
    categoria = cursor.fetchone()
    id_categoria = categoria[0] if categoria else 1  # Usa categoria padrão se não encontrar
    
    # Gera o ID do chamado
    id_chamado = gerar_id_chamado()
    
    # Cria o novo chamado
    cursor.execute("""
        INSERT INTO chamado (
            id_chamado, id_cliente, id_plantonista, id_categoria,
            tipo, prioridade, descricao, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        id_chamado, id_cliente, id_plantonista, id_categoria,
        data.get('tipo', 'Suporte Técnico'), 
        data.get('prioridade', 'Média'),
        data['motivo'],
        'Aberto'
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'status': 'success',
        'message': 'Chamado iniciado com sucesso',
        'id_chamado': id_chamado
    })

@app.route('/api/chamado/<id_chamado>/atualizar', methods=['POST'])
def atualizar_chamado(id_chamado):
    """Atualiza as informações de um chamado existente"""
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Campos que podem ser atualizados
    campos_atualizaveis = [
        'ambiente', 'tempo_ocorrencia', 'analise', 
        'procedimentos', 'solucao', 'status',
        'observacoes', 'recomendacoes'
    ]
    
    # Constrói a query de atualização dinamicamente
    campos = []
    valores = []
    
    for campo in campos_atualizaveis:
        if campo in data:
            campos.append(f"{campo} = ?")
            valores.append(data[campo])
    
    if not campos:
        return jsonify({
            'status': 'error',
            'message': 'Nenhum campo para atualizar'
        }), 400
    
    # Adiciona o ID do chamado aos valores
    valores.append(id_chamado)
    
    # Executa a atualização
    cursor.execute(f"""
        UPDATE chamado
        SET {', '.join(campos)}
        WHERE id_chamado = ?
    """, valores)
    
    # Se o status for alterado para 'Resolvido', atualiza a data de fechamento
    if 'status' in data and data['status'] == 'Resolvido':
        cursor.execute("""
            UPDATE chamado
            SET data_fechamento = CURRENT_TIMESTAMP
            WHERE id_chamado = ? AND data_fechamento IS NULL
        """, (id_chamado,))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'status': 'success',
        'message': 'Chamado atualizado com sucesso'
    })

@app.route('/api/chamado/<id_chamado>', methods=['GET'])
def obter_chamado(id_chamado):
    """Obtém os detalhes de um chamado específico"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Consulta que une as tabelas para obter todas as informações do chamado
    cursor.execute("""
        SELECT 
            c.id_chamado, c.data_hora, c.tipo, c.prioridade, 
            c.descricao, c.ambiente, c.tempo_ocorrencia,
            c.analise, c.procedimentos, c.solucao, c.status,
            c.tempo_atendimento, c.observacoes, c.recomendacoes,
            c.data_fechamento,
            cl.nome as cliente, cl.cnpj_cpf, cl.contato, cl.telefone, cl.email,
            p.nome as plantonista,
            cat.nome as categoria
        FROM chamado c
        JOIN cliente cl ON c.id_cliente = cl.id_cliente
        JOIN plantonista p ON c.id_plantonista = p.id_plantonista
        JOIN categoria cat ON c.id_categoria = cat.id_categoria
        WHERE c.id_chamado = ?
    """, (id_chamado,))
    
    chamado = cursor.fetchone()
    conn.close()
    
    if chamado is None:
        return jsonify({
            'status': 'error',
            'message': 'Chamado não encontrado'
        }), 404
    
    # Converte o objeto Row para dicionário
    chamado_dict = dict(chamado)
    
    return jsonify({
        'status': 'success',
        'chamado': chamado_dict
    })

@app.route('/api/chamados', methods=['GET'])
def listar_chamados():
    """Lista todos os chamados com filtros opcionais"""
    # Parâmetros de filtro
    cliente = request.args.get('cliente')
    status = request.args.get('status')
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Constrói a query com filtros
    query = """
        SELECT 
            c.id_chamado, c.data_hora, c.status,
            cl.nome as cliente, 
            p.nome as plantonista,
            c.descricao
        FROM chamado c
        JOIN cliente cl ON c.id_cliente = cl.id_cliente
        JOIN plantonista p ON c.id_plantonista = p.id_plantonista
    """
    
    filtros = []
    parametros = []
    
    if cliente:
        filtros.append("cl.nome LIKE ?")
        parametros.append(f"%{cliente}%")
    
    if status:
        filtros.append("c.status = ?")
        parametros.append(status)
    
    if data_inicio:
        filtros.append("date(c.data_hora) >= date(?)")
        parametros.append(data_inicio)
    
    if data_fim:
        filtros.append("date(c.data_hora) <= date(?)")
        parametros.append(data_fim)
    
    if filtros:
        query += " WHERE " + " AND ".join(filtros)
    
    query += " ORDER BY c.data_hora DESC"
    
    cursor.execute(query, parametros)
    chamados = cursor.fetchall()
    conn.close()
    
    # Converte a lista de objetos Row para lista de dicionários
    chamados_list = [dict(chamado) for chamado in chamados]
    
    return jsonify({
        'status': 'success',
        'chamados': chamados_list
    })

@app.route('/api/busca', methods=['GET'])
def buscar_chamados():
    """Busca chamados por palavras-chave no histórico"""
    termo = request.args.get('termo')
    
    if not termo:
        return jsonify({
            'status': 'error',
            'message': 'Termo de busca não fornecido'
        }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Busca em vários campos relevantes
    cursor.execute("""
        SELECT 
            c.id_chamado, c.data_hora, c.status,
            cl.nome as cliente, 
            p.nome as plantonista,
            c.descricao, c.solucao
        FROM chamado c
        JOIN cliente cl ON c.id_cliente = cl.id_cliente
        JOIN plantonista p ON c.id_plantonista = p.id_plantonista
        WHERE 
            c.descricao LIKE ? OR
            c.ambiente LIKE ? OR
            c.analise LIKE ? OR
            c.procedimentos LIKE ? OR
            c.solucao LIKE ? OR
            c.observacoes LIKE ? OR
            c.recomendacoes LIKE ?
        ORDER BY c.data_hora DESC
    """, tuple([f"%{termo}%"] * 7))
    
    resultados = cursor.fetchall()
    conn.close()
    
    # Converte a lista de objetos Row para lista de dicionários
    resultados_list = [dict(resultado) for resultado in resultados]
    
    return jsonify({
        'status': 'success',
        'resultados': resultados_list
    })

# Inicializa o aplicativo
if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
