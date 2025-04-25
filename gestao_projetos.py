import os
import sqlite3
import pandas as pd
from flask import Flask, request, jsonify, render_template, redirect, url_for

app = Flask(__name__)

# Configuração do banco de dados
DB_PATH = 'chamados.db'

def get_db_connection():
    """Cria uma conexão com o banco de dados"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Rotas para gestão de projetos
@app.route('/projetos')
def listar_projetos():
    """Lista todos os projetos cadastrados"""
    conn = get_db_connection()
    projetos = conn.execute('SELECT * FROM projeto ORDER BY sigla').fetchall()
    conn.close()
    
    # Converter para lista de dicionários
    projetos_list = [dict(projeto) for projeto in projetos]
    
    return jsonify({
        'status': 'success',
        'projetos': projetos_list
    })

@app.route('/projetos/novo', methods=['POST'])
def criar_projeto():
    """Cria um novo projeto"""
    data = request.json
    
    # Validação básica
    required_fields = ['sigla', 'nome', 'gerente']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({
                'status': 'error',
                'message': f'Campo obrigatório não fornecido: {field}'
            }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO projeto (sigla, nome, descricao, gerente, email_gerente, telefone_gerente)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data['sigla'],
            data['nome'],
            data.get('descricao', ''),
            data['gerente'],
            data.get('email_gerente', ''),
            data.get('telefone_gerente', '')
        ))
        
        conn.commit()
        
        # Retorna o ID do projeto criado
        projeto_id = cursor.lastrowid
        
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Projeto criado com sucesso',
            'id_projeto': projeto_id
        })
        
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            'status': 'error',
            'message': 'Já existe um projeto com esta sigla'
        }), 400

@app.route('/projetos/<int:id_projeto>', methods=['GET'])
def obter_projeto(id_projeto):
    """Obtém detalhes de um projeto específico"""
    conn = get_db_connection()
    projeto = conn.execute('SELECT * FROM projeto WHERE id_projeto = ?', (id_projeto,)).fetchone()
    
    if projeto is None:
        conn.close()
        return jsonify({
            'status': 'error',
            'message': 'Projeto não encontrado'
        }), 404
    
    # Busca chamados associados a este projeto
    chamados = conn.execute('''
        SELECT c.id_chamado, c.data_hora, c.status, cl.nome as cliente, 
               p.nome as plantonista, c.descricao
        FROM chamado c
        JOIN cliente cl ON c.id_cliente = cl.id_cliente
        JOIN plantonista p ON c.id_plantonista = p.id_plantonista
        WHERE c.id_projeto = ?
        ORDER BY c.data_hora DESC
    ''', (id_projeto,)).fetchall()
    
    conn.close()
    
    # Converter para dicionários
    projeto_dict = dict(projeto)
    chamados_list = [dict(chamado) for chamado in chamados]
    
    return jsonify({
        'status': 'success',
        'projeto': projeto_dict,
        'chamados': chamados_list
    })

@app.route('/projetos/<int:id_projeto>', methods=['PUT'])
def atualizar_projeto(id_projeto):
    """Atualiza informações de um projeto existente"""
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifica se o projeto existe
    projeto = cursor.execute('SELECT * FROM projeto WHERE id_projeto = ?', (id_projeto,)).fetchone()
    
    if projeto is None:
        conn.close()
        return jsonify({
            'status': 'error',
            'message': 'Projeto não encontrado'
        }), 404
    
    # Campos que podem ser atualizados
    campos_atualizaveis = [
        'nome', 'descricao', 'gerente', 'email_gerente', 
        'telefone_gerente', 'ativo'
    ]
    
    # Constrói a query de atualização dinamicamente
    campos = []
    valores = []
    
    for campo in campos_atualizaveis:
        if campo in data:
            campos.append(f"{campo} = ?")
            valores.append(data[campo])
    
    if not campos:
        conn.close()
        return jsonify({
            'status': 'error',
            'message': 'Nenhum campo para atualizar'
        }), 400
    
    # Adiciona o ID do projeto aos valores
    valores.append(id_projeto)
    
    # Executa a atualização
    cursor.execute(f"""
        UPDATE projeto
        SET {', '.join(campos)}
        WHERE id_projeto = ?
    """, valores)
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'status': 'success',
        'message': 'Projeto atualizado com sucesso'
    })

@app.route('/projetos/<int:id_projeto>', methods=['DELETE'])
def desativar_projeto(id_projeto):
    """Desativa um projeto (não exclui do banco)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifica se o projeto existe
    projeto = cursor.execute('SELECT * FROM projeto WHERE id_projeto = ?', (id_projeto,)).fetchone()
    
    if projeto is None:
        conn.close()
        return jsonify({
            'status': 'error',
            'message': 'Projeto não encontrado'
        }), 404
    
    # Desativa o projeto em vez de excluí-lo
    cursor.execute('UPDATE projeto SET ativo = 0 WHERE id_projeto = ?', (id_projeto,))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'status': 'success',
        'message': 'Projeto desativado com sucesso'
    })

@app.route('/projetos/estatisticas', methods=['GET'])
def estatisticas_projetos():
    """Retorna estatísticas dos projetos"""
    conn = get_db_connection()
    
    # Total de chamados por projeto
    chamados_por_projeto = conn.execute('''
        SELECT p.sigla, p.nome, COUNT(c.id_chamado) as total_chamados
        FROM projeto p
        LEFT JOIN chamado c ON p.id_projeto = c.id_projeto
        GROUP BY p.id_projeto
        ORDER BY total_chamados DESC
    ''').fetchall()
    
    # Tempo médio de atendimento por projeto
    tempo_medio_por_projeto = conn.execute('''
        SELECT p.sigla, p.nome, AVG(c.tempo_atendimento) as tempo_medio
        FROM projeto p
        LEFT JOIN chamado c ON p.id_projeto = c.id_projeto
        WHERE c.tempo_atendimento IS NOT NULL
        GROUP BY p.id_projeto
        ORDER BY tempo_medio DESC
    ''').fetchall()
    
    # Status dos chamados por projeto
    status_por_projeto = conn.execute('''
        SELECT p.sigla, c.status, COUNT(c.id_chamado) as total
        FROM projeto p
        LEFT JOIN chamado c ON p.id_projeto = c.id_projeto
        WHERE c.id_chamado IS NOT NULL
        GROUP BY p.id_projeto, c.status
        ORDER BY p.sigla, c.status
    ''').fetchall()
    
    conn.close()
    
    # Converter para dicionários
    chamados_por_projeto_list = [dict(item) for item in chamados_por_projeto]
    tempo_medio_por_projeto_list = [dict(item) for item in tempo_medio_por_projeto]
    status_por_projeto_list = [dict(item) for item in status_por_projeto]
    
    return jsonify({
        'status': 'success',
        'chamados_por_projeto': chamados_por_projeto_list,
        'tempo_medio_por_projeto': tempo_medio_por_projeto_list,
        'status_por_projeto': status_por_projeto_list
    })

@app.route('/projetos/exportar', methods=['GET'])
def exportar_projetos():
    """Exporta a lista de projetos para CSV"""
    conn = get_db_connection()
    
    # Busca todos os projetos
    projetos = conn.execute('''
        SELECT p.sigla, p.nome, p.gerente, p.email_gerente, p.telefone_gerente,
               COUNT(c.id_chamado) as total_chamados
        FROM projeto p
        LEFT JOIN chamado c ON p.id_projeto = c.id_projeto
        WHERE p.ativo = 1
        GROUP BY p.id_projeto
        ORDER BY p.sigla
    ''').fetchall()
    
    conn.close()
    
    # Converte para DataFrame do pandas
    df = pd.DataFrame([dict(projeto) for projeto in projetos])
    
    # Cria diretório para exportações se não existir
    if not os.path.exists('exportacoes'):
        os.makedirs('exportacoes')
    
    # Salva como CSV
    csv_path = 'exportacoes/projetos.csv'
    df.to_csv(csv_path, index=False, encoding='utf-8-sig')
    
    return jsonify({
        'status': 'success',
        'message': 'Projetos exportados com sucesso',
        'file_path': csv_path
    })

# Função para inicializar o aplicativo
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
