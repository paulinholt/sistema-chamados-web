import os
import sqlite3
import jinja2
from datetime import datetime
from weasyprint import HTML, CSS

class LogoManager:
    def __init__(self):
        self.static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/img')
        
        # Cria o diretório se não existir
        if not os.path.exists(self.static_dir):
            os.makedirs(self.static_dir)
        
        # Caminhos para os logos
        self.logo_left_path = os.path.join(self.static_dir, 'logo_left.png')
        self.logo_right_path = os.path.join(self.static_dir, 'logo_right.png')
        
        # Verifica se os logos existem, caso contrário cria logos padrão
        self.check_and_create_default_logos()
    
    def check_and_create_default_logos(self):
        """Verifica se os logos existem e cria logos padrão se necessário"""
        import base64
        from PIL import Image, ImageDraw, ImageFont
        
        # Logo esquerdo (WEF)
        if not os.path.exists(self.logo_left_path):
            # Cria uma imagem simples com texto "WEF"
            img = Image.new('RGB', (150, 60), color=(255, 255, 255))
            d = ImageDraw.Draw(img)
            # Tenta usar uma fonte padrão
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
            except:
                font = ImageFont.load_default()
            
            d.text((30, 10), "WEF", fill=(0, 51, 102), font=font)
            img.save(self.logo_left_path)
        
        # Logo direito (KISS)
        if not os.path.exists(self.logo_right_path):
            # Cria uma imagem simples com texto "KISS"
            img = Image.new('RGB', (150, 60), color=(255, 255, 255))
            d = ImageDraw.Draw(img)
            # Tenta usar uma fonte padrão
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
            except:
                font = ImageFont.load_default()
            
            d.text((30, 10), "KISS", fill=(0, 102, 153), font=font)
            img.save(self.logo_right_path)

# Inicializa os logos
logo_manager = LogoManager()

def criar_diretorio_relatorios():
    """Cria o diretório para armazenar os relatórios PDF"""
    relatorios_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'relatorios')
    if not os.path.exists(relatorios_dir):
        os.makedirs(relatorios_dir)
    return relatorios_dir

def get_db_connection():
    """Cria uma conexão com o banco de dados"""
    conn = sqlite3.connect('chamados.db')
    conn.row_factory = sqlite3.Row
    return conn

def obter_dados_chamado(id_chamado):
    """Obtém todos os dados de um chamado específico"""
    conn = get_db_connection()
    
    # Consulta que une as tabelas para obter todas as informações do chamado
    chamado = conn.execute("""
        SELECT 
            c.id_chamado, c.data_hora, c.tipo, c.prioridade, 
            c.descricao, c.ambiente, c.tempo_ocorrencia,
            c.analise, c.procedimentos, c.solucao, c.status,
            c.tempo_atendimento, c.observacoes, c.recomendacoes,
            c.data_fechamento,
            cl.nome as cliente, cl.cnpj_cpf, cl.contato, cl.telefone, cl.email,
            p.nome as plantonista,
            cat.nome as categoria,
            proj.sigla as projeto_sigla, proj.nome as projeto_nome,
            proj.gerente as gerente_projeto, proj.email_gerente, proj.telefone_gerente
        FROM chamado c
        JOIN cliente cl ON c.id_cliente = cl.id_cliente
        JOIN plantonista p ON c.id_plantonista = p.id_plantonista
        LEFT JOIN categoria cat ON c.id_categoria = cat.id_categoria
        LEFT JOIN projeto proj ON c.id_projeto = proj.id_projeto
        WHERE c.id_chamado = ?
    """, (id_chamado,)).fetchone()
    
    conn.close()
    
    if chamado is None:
        return None
    
    # Converte o objeto Row para dicionário
    chamado_dict = dict(chamado)
    
    # Formata as datas para exibição
    if chamado_dict['data_hora']:
        data_hora = datetime.strptime(chamado_dict['data_hora'], '%Y-%m-%d %H:%M:%S')
        chamado_dict['data_formatada'] = data_hora.strftime('%d/%m/%Y')
        chamado_dict['hora_inicio'] = data_hora.strftime('%H:%M')
    else:
        chamado_dict['data_formatada'] = 'N/A'
        chamado_dict['hora_inicio'] = 'N/A'
    
    if chamado_dict['data_fechamento']:
        data_fechamento = datetime.strptime(chamado_dict['data_fechamento'], '%Y-%m-%d %H:%M:%S')
        chamado_dict['hora_fim'] = data_fechamento.strftime('%H:%M')
    else:
        chamado_dict['hora_fim'] = 'N/A'
    
    # Calcula o tempo de atendimento formatado
    if chamado_dict['tempo_atendimento']:
        horas = chamado_dict['tempo_atendimento'] // 60
        minutos = chamado_dict['tempo_atendimento'] % 60
        chamado_dict['tempo_formatado'] = f"{horas}h {minutos}min"
    else:
        chamado_dict['tempo_formatado'] = 'N/A'
    
    return chamado_dict

def gerar_relatorio_pdf(id_chamado):
    """Gera um relatório PDF para um chamado específico"""
    # Obtém os dados do chamado
    chamado_data = obter_dados_chamado(id_chamado)
    
    if chamado_data is None:
        raise ValueError(f"Chamado não encontrado: {id_chamado}")
    
    # Configura o ambiente Jinja2
    templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
    env = jinja2.Environment(loader=jinja2.FileSystemLoader(templates_dir))
    
    # Carrega o template
    template = env.get_template('relatorio_template.html')
    
    # Renderiza o HTML com os dados do chamado
    html_content = template.render(chamado=chamado_data)
    
    # Define o caminho de saída do PDF
    relatorios_dir = criar_diretorio_relatorios()
    rac_id = chamado_data['id_chamado']
    output_path = os.path.join(relatorios_dir, f"{rac_id}.pdf")
    
    # Gera o PDF
    HTML(string=html_content).write_pdf(
        output_path,
        stylesheets=[
            CSS(string='''
                @page {
                    size: A4;
                    margin: 2cm;
                    @top-center {
                        content: "Relatório de Atendimento ao Cliente";
                        font-size: 10pt;
                    }
                    @bottom-right {
                        content: "Página " counter(page) " de " counter(pages);
                        font-size: 9pt;
                    }
                }
                body {
                    font-family: "Noto Sans", sans-serif;
                    font-size: 11pt;
                    line-height: 1.4;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logos {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .logo-left, .logo-right {
                    max-width: 150px;
                    max-height: 60px;
                }
                .title {
                    font-size: 18pt;
                    font-weight: bold;
                    margin: 10px 0;
                    color: #003366;
                }
                .rac-number {
                    font-size: 14pt;
                    margin-bottom: 20px;
                }
                .section {
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                }
                .section-header {
                    background-color: #f0f0f0;
                    padding: 8px;
                    font-weight: bold;
                }
                .section-content {
                    padding: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                table, th, td {
                    border: 1px solid #ddd;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f0f0f0;
                    width: 30%;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 9pt;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
            ''')
        ]
    )
    
    # Registra o relatório no banco de dados
    registrar_relatorio(id_chamado, output_path)
    
    return output_path

def registrar_relatorio(id_chamado, pdf_path):
    """Registra o relatório gerado no banco de dados"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifica se já existe um relatório para este chamado
    cursor.execute("SELECT id_relatorio FROM relatorio WHERE id_chamado = ?", (id_chamado,))
    relatorio = cursor.fetchone()
    
    if relatorio is None:
        # Insere novo registro
        cursor.execute("""
            INSERT INTO relatorio (id_chamado, caminho_pdf, data_geracao)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """, (id_chamado, pdf_path))
    else:
        # Atualiza registro existente
        cursor.execute("""
            UPDATE relatorio
            SET caminho_pdf = ?, data_geracao = CURRENT_TIMESTAMP
            WHERE id_chamado = ?
        """, (pdf_path, id_chamado))
    
    conn.commit()
    conn.close()

def gerar_relatorios_pendentes():
    """Gera relatórios para todos os chamados resolvidos sem relatório"""
    conn = get_db_connection()
    
    # Busca chamados resolvidos que não têm relatório
    chamados = conn.execute("""
        SELECT c.id_chamado
        FROM chamado c
        LEFT JOIN relatorio r ON c.id_chamado = r.id_chamado
        WHERE c.status = 'Resolvido' AND r.id_relatorio IS NULL
    """).fetchall()
    
    conn.close()
    
    relatorios_gerados = []
    
    for chamado in chamados:
        try:
            pdf_path = gerar_relatorio_pdf(chamado['id_chamado'])
            relatorios_gerados.append({
                'id_chamado': chamado['id_chamado'],
                'pdf_path': pdf_path
            })
        except Exception as e:
            print(f"Erro ao gerar relatório para chamado {chamado['id_chamado']}: {str(e)}")
    
    return relatorios_gerados

# Função para testar a geração de relatórios
if __name__ == "__main__":
    try:
        # Tenta gerar um relatório para o chamado com ID 1
        pdf_path = gerar_relatorio_pdf(1)
        print(f"Relatório gerado com sucesso: {pdf_path}")
        
        # Gera relatórios pendentes
        relatorios = gerar_relatorios_pendentes()
        print(f"Relatórios pendentes gerados: {len(relatorios)}")
        for relatorio in relatorios:
            print(f"- Chamado {relatorio['id_chamado']}: {relatorio['pdf_path']}")
    except Exception as e:
        print(f"Erro: {str(e)}")
