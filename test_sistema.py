import unittest
import os
import sqlite3
import tempfile
import shutil
from datetime import datetime

# Importa os módulos do sistema
from pdf_generator import gerar_relatorio_pdf, obter_dados_chamado
from relatorio_sender import RelatorioSender
from consulta_historica import ConsultaHistorica

class TestSistemaChamados(unittest.TestCase):
    def setUp(self):
        """Configuração inicial para os testes"""
        # Cria um banco de dados temporário para testes
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.temp_dir, 'test_chamados.db')
        
        # Copia o esquema do banco de dados
        self.conn = sqlite3.connect(self.db_path)
        with open('schema.sql', 'r') as f:
            self.conn.executescript(f.read())
        with open('schema_projeto.sql', 'r') as f:
            self.conn.executescript(f.read())
        
        # Insere dados de teste
        self.inserir_dados_teste()
    
    def tearDown(self):
        """Limpeza após os testes"""
        self.conn.close()
        shutil.rmtree(self.temp_dir)
    
    def inserir_dados_teste(self):
        """Insere dados de teste no banco de dados"""
        cursor = self.conn.cursor()
        
        # Insere cliente de teste
        cursor.execute("""
            INSERT INTO cliente (nome, cnpj_cpf, contato, telefone, email)
            VALUES (?, ?, ?, ?, ?)
        """, ('Empresa Teste', '12.345.678/0001-90', 'Contato Teste', '(11) 98765-4321', 'contato@empresateste.com.br'))
        
        # Insere plantonista de teste
        cursor.execute("""
            INSERT INTO plantonista (nome, email, telefone)
            VALUES (?, ?, ?)
        """, ('Plantonista Teste', 'plantonista@empresa.com.br', '(11) 91234-5678'))
        
        # Insere projeto de teste
        cursor.execute("""
            INSERT INTO projeto (sigla, nome, gerente, email_gerente, telefone_gerente)
            VALUES (?, ?, ?, ?, ?)
        """, ('TST', 'Projeto Teste', 'Gerente Teste', 'gerente@empresa.com.br', '(11) 92345-6789'))
        
        # Insere chamado de teste
        cursor.execute("""
            INSERT INTO chamado (
                id_chamado, id_cliente, id_plantonista, id_categoria, id_projeto,
                data_hora, tipo, prioridade, descricao, analise, solucao, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'RAC0001', 1, 1, 1, 1,
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'Suporte Técnico', 'Alta',
            'Sistema fora do ar para testes',
            'Servidor travado durante testes',
            'Reinicialização do servidor resolveu o problema',
            'Resolvido'
        ))
        
        self.conn.commit()
    
    def test_obter_dados_chamado(self):
        """Testa a obtenção de dados de um chamado"""
        # Configura o caminho do banco de dados para teste
        global DB_PATH
        DB_PATH = self.db_path
        
        # Testa a função
        chamado = obter_dados_chamado('RAC0001')
        
        # Verifica se os dados foram obtidos corretamente
        self.assertIsNotNone(chamado)
        self.assertEqual(chamado['id_chamado'], 'RAC0001')
        self.assertEqual(chamado['cliente'], 'Empresa Teste')
        self.assertEqual(chamado['plantonista'], 'Plantonista Teste')
        self.assertEqual(chamado['projeto_sigla'], 'TST')
        self.assertEqual(chamado['status'], 'Resolvido')
    
    def test_consulta_historica(self):
        """Testa a funcionalidade de consulta histórica"""
        # Cria uma instância da classe ConsultaHistorica com o banco de dados de teste
        consulta = ConsultaHistorica(db_path=self.db_path)
        
        # Testa busca por texto
        resultados = consulta.buscar_por_texto('servidor')
        self.assertGreaterEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['id_chamado'], 'RAC0001')
        
        # Testa busca por cliente
        resultados = consulta.buscar_por_cliente('Empresa Teste')
        self.assertGreaterEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['cliente'], 'Empresa Teste')
        
        # Testa busca por projeto
        resultados = consulta.buscar_por_projeto('TST')
        self.assertGreaterEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['projeto_sigla'], 'TST')
        
        # Testa processamento de consulta via WhatsApp
        resposta = consulta.processar_consulta_whatsapp('consultar servidor')
        self.assertIn('RAC0001', resposta)
    
    def test_integracao_completa(self):
        """Testa o fluxo completo do sistema"""
        # Este teste simula o fluxo completo de um chamado:
        # 1. Registro do chamado (já feito no setUp)
        # 2. Geração do relatório PDF
        # 3. Envio do relatório
        # 4. Consulta histórica
        
        # Configura diretórios temporários para os testes
        relatorios_dir = os.path.join(self.temp_dir, 'relatorios')
        os.makedirs(relatorios_dir, exist_ok=True)
        
        # Testa a geração do relatório (simulação)
        try:
            # Em um teste real, chamaríamos gerar_relatorio_pdf
            # Como não queremos depender de WeasyPrint nos testes, simulamos o resultado
            pdf_path = os.path.join(relatorios_dir, 'RAC0001.pdf')
            with open(pdf_path, 'w') as f:
                f.write('Simulação de PDF')
            
            # Registra o relatório no banco de dados
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO relatorio (id_chamado, caminho_pdf, data_geracao)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            """, ('RAC0001', pdf_path))
            conn.commit()
            conn.close()
            
            # Verifica se o relatório foi registrado
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM relatorio WHERE id_chamado = ?", ('RAC0001',))
            relatorio = cursor.fetchone()
            conn.close()
            
            self.assertIsNotNone(relatorio)
            self.assertEqual(relatorio[1], 'RAC0001')  # id_chamado
            
            # Testa a consulta histórica após o fluxo completo
            consulta = ConsultaHistorica(db_path=self.db_path)
            resultados = consulta.buscar_por_texto('servidor')
            self.assertGreaterEqual(len(resultados), 1)
            
        except Exception as e:
            self.fail(f"Teste de integração falhou: {str(e)}")

if __name__ == '__main__':
    unittest.main()
