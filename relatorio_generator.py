import os
import sqlite3
from datetime import datetime
from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader

class RelatorioGenerator:
    def __init__(self, db_path='chamados.db'):
        self.db_path = db_path
        self.templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
        self.output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'relatorios')
        
        # Cria o diretório de saída se não existir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        
        # Configura o ambiente Jinja2
        self.env = Environment(loader=FileSystemLoader(self.templates_dir))
    
    def get_db_connection(self):
        """Cria uma conexão com o banco de dados"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def get_chamado_data(self, id_chamado):
        """Obtém todos os dados de um chamado específico"""
        conn = self.get_db_connection()
        
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
            JOIN categoria cat ON c.id_categoria = cat.id_categoria
            LEFT JOIN projeto proj ON c.id_projeto = proj.id_projeto
            WHERE c.id_chamado = ?
        """, (id_chamado,)).fetchone()
        
        conn.close()
        
        if chamado is None:
            return None
        
        # Converte o objeto Row para dicionário
        return dict(chamado)
    
    def generate_pdf(self, id_chamado):
        """Gera um relatório PDF para um chamado específico"""
        # Obtém os dados do chamado
        chamado_data = self.get_chamado_data(id_chamado)
        
        if chamado_data is None:
            raise ValueError(f"Chamado não encontrado: {id_chamado}")
        
        # Formata as datas para exibição
        if chamado_data['data_hora']:
            data_hora = datetime.strptime(chamado_data['data_hora'], '%Y-%m-%d %H:%M:%S')
            chamado_data['data_formatada'] = data_hora.strftime('%d/%m/%Y')
            chamado_data['hora_inicio'] = data_hora.strftime('%H:%M')
        else:
            chamado_data['data_formatada'] = 'N/A'
            chamado_data['hora_inicio'] = 'N/A'
        
        if chamado_data['data_fechamento']:
            data_fechamento = datetime.strptime(chamado_data['data_fechamento'], '%Y-%m-%d %H:%M:%S')
            chamado_data['hora_fim'] = data_fechamento.strftime('%H:%M')
        else:
            chamado_data['hora_fim'] = 'N/A'
        
        # Calcula o tempo de atendimento formatado
        if chamado_data['tempo_atendimento']:
            horas = chamado_data['tempo_atendimento'] // 60
            minutos = chamado_data['tempo_atendimento'] % 60
            chamado_data['tempo_formatado'] = f"{horas}h {minutos}min"
        else:
            chamado_data['tempo_formatado'] = 'N/A'
        
        # Carrega o template
        template = self.env.get_template('relatorio_template.html')
        
        # Renderiza o HTML com os dados do chamado
        html_content = template.render(chamado=chamado_data)
        
        # Define o caminho de saída do PDF
        rac_id = id_chamado if isinstance(id_chamado, str) else f"RAC{id_chamado:04d}"
        output_path = os.path.join(self.output_dir, f"{rac_id}.pdf")
        
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
                    .logo {
                        max-width: 200px;
                        max-height: 80px;
                    }
                    h1 {
                        font-size: 18pt;
                        margin: 10px 0;
                        color: #003366;
                    }
                    .section {
                        margin-bottom: 15px;
                        border: 1px solid #ddd;
                        padding: 10px;
                    }
                    .section-title {
                        background-color: #f0f0f0;
                        padding: 5px;
                        margin-bottom: 10px;
                        font-weight: bold;
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
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 9pt;
                        color: #666;
                    }
                ''')
            ]
        )
        
        return output_path
    
    def generate_all_pending_reports(self):
        """Gera relatórios para todos os chamados resolvidos sem relatório"""
        conn = self.get_db_connection()
        
        # Busca chamados resolvidos que não têm relatório
        chamados = conn.execute("""
            SELECT c.id_chamado
            FROM chamado c
            LEFT JOIN relatorio r ON c.id_chamado = r.id_chamado
            WHERE c.status = 'Resolvido' AND r.id_relatorio IS NULL
        """).fetchall()
        
        conn.close()
        
        generated_reports = []
        
        for chamado in chamados:
            try:
                pdf_path = self.generate_pdf(chamado['id_chamado'])
                
                # Registra o relatório no banco de dados
                self.register_report(chamado['id_chamado'], pdf_path)
                
                generated_reports.append({
                    'id_chamado': chamado['id_chamado'],
                    'pdf_path': pdf_path
                })
            except Exception as e:
                print(f"Erro ao gerar relatório para chamado {chamado['id_chamado']}: {str(e)}")
        
        return generated_reports
    
    def register_report(self, id_chamado, pdf_path):
        """Registra o relatório gerado no banco de dados"""
        conn = self.get_db_connection()
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

# Função para testar a geração de relatórios
def test_report_generation():
    generator = RelatorioGenerator()
    
    # Testa com um ID de chamado específico
    try:
        pdf_path = generator.generate_pdf(1)  # Usando o ID 1 como exemplo
        print(f"Relatório gerado com sucesso: {pdf_path}")
    except Exception as e:
        print(f"Erro ao gerar relatório: {str(e)}")
    
    # Gera relatórios pendentes
    try:
        reports = generator.generate_all_pending_reports()
        print(f"Relatórios pendentes gerados: {len(reports)}")
        for report in reports:
            print(f"- Chamado {report['id_chamado']}: {report['pdf_path']}")
    except Exception as e:
        print(f"Erro ao gerar relatórios pendentes: {str(e)}")

if __name__ == "__main__":
    test_report_generation()
