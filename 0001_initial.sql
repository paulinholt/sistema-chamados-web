-- Arquivo de migração inicial para o banco de dados do Sistema de Gerenciamento de Chamados
-- Este arquivo cria todas as tabelas necessárias para o funcionamento do sistema

-- Tabela de usuários do sistema
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'admin', 'plantonista', 'gerente'
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de projetos
CREATE TABLE projetos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sigla TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  gerente_id INTEGER,
  email_gerente TEXT,
  telefone_gerente TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gerente_id) REFERENCES usuarios(id)
);

-- Tabela de clientes
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj_cpf TEXT UNIQUE,
  contato TEXT,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de plantonistas
CREATE TABLE plantonistas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  telefone TEXT,
  status TEXT DEFAULT 'Disponível',
  chamados_atendidos INTEGER DEFAULT 0,
  tempo_medio REAL DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de categorias de chamados
CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true
);

-- Tabela de chamados
CREATE TABLE chamados (
  id TEXT PRIMARY KEY, -- formato RAC0001
  cliente_id INTEGER NOT NULL,
  plantonista_id INTEGER NOT NULL,
  categoria_id INTEGER,
  projeto_id INTEGER,
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tipo TEXT,
  prioridade TEXT,
  descricao TEXT NOT NULL,
  ambiente TEXT,
  tempo_ocorrencia INTEGER,
  analise TEXT,
  procedimentos TEXT,
  solucao TEXT,
  status TEXT DEFAULT 'Aberto',
  tempo_atendimento INTEGER,
  observacoes TEXT,
  recomendacoes TEXT,
  data_fechamento TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (plantonista_id) REFERENCES plantonistas(id),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);

-- Tabela de relatórios
CREATE TABLE relatorios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chamado_id TEXT NOT NULL,
  caminho_pdf TEXT,
  data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  enviado BOOLEAN DEFAULT false,
  metodo_envio TEXT,
  data_envio TIMESTAMP,
  FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);

-- Tabela de histórico de ações
CREATE TABLE historico_acoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  chamado_id TEXT,
  acao TEXT NOT NULL,
  detalhes TEXT,
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);

-- Inserir dados iniciais

-- Usuários
INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES 
('Administrador', 'admin@w3fmaster.com.br', '$2a$12$1234567890123456789012uGfLnP5Fvtl0Vy8JMZa9rKQdCCvZkO2', 'admin'),
('Aurélio', 'aurelio@w3fmaster.com.br', '$2a$12$1234567890123456789012uGfLnP5Fvtl0Vy8JMZa9rKQdCCvZkO2', 'plantonista'),
('Gerente Teste', 'gerente@w3fmaster.com.br', '$2a$12$1234567890123456789012uGfLnP5Fvtl0Vy8JMZa9rKQdCCvZkO2', 'gerente');

-- Projetos
INSERT INTO projetos (sigla, nome, descricao, email_gerente, telefone_gerente) VALUES 
('TST', 'Projeto Teste', 'Projeto para testes do sistema', 'gerente@w3fmaster.com.br', '(11) 92345-6789'),
('PROJ-A', 'Projeto A', 'Descrição do Projeto A', 'gerentea@w3fmaster.com.br', '(11) 91234-5678'),
('PROJ-B', 'Projeto B', 'Descrição do Projeto B', 'gerenteb@w3fmaster.com.br', '(11) 93456-7890');

-- Clientes
INSERT INTO clientes (nome, cnpj_cpf, contato, telefone, email) VALUES 
('Empresa 1', '12345678901234', 'Contato 1', '(11) 91234-5678', 'contato1@empresa1.com.br'),
('Empresa 2', '23456789012345', 'Contato 2', '(11) 92345-6789', 'contato2@empresa2.com.br'),
('Empresa 3', '34567890123456', 'Contato 3', '(11) 93456-7890', 'contato3@empresa3.com.br');

-- Plantonistas
INSERT INTO plantonistas (nome, email, telefone, status, chamados_atendidos, tempo_medio) VALUES 
('Aurélio', 'aurelio@w3fmaster.com.br', '+5511977123444', 'Disponível', 42, 1.5),
('Caio', 'caio@w3fmaster.com.br', '(11) 98765-4321', 'Em Atendimento', 38, 1.8),
('Carlos', 'carlos@w3fmaster.com.br', '(11) 97654-3210', 'Folga', 35, 2.0),
('Flávio', 'flavio@w3fmaster.com.br', '(11) 96543-2109', 'Disponível', 40, 1.7),
('Igor', 'igor@w3fmaster.com.br', '(11) 95432-1098', 'Em Atendimento', 37, 1.9),
('Pedro', 'pedro@w3fmaster.com.br', '(11) 94321-0987', 'Disponível', 39, 1.6),
('Plantão', 'plantao@w3fmaster.com.br', '(11) 93210-9876', 'Folga', 30, 2.2);

-- Categorias
INSERT INTO categorias (nome, descricao) VALUES 
('Hardware', 'Problemas relacionados a equipamentos físicos'),
('Software', 'Problemas relacionados a programas e sistemas'),
('Rede', 'Problemas relacionados a conectividade e rede'),
('Banco de Dados', 'Problemas relacionados a bancos de dados'),
('Outros', 'Outros tipos de problemas');

-- Chamado inicial
INSERT INTO chamados (id, cliente_id, plantonista_id, categoria_id, projeto_id, descricao, status, analise, solucao, tempo_atendimento) VALUES 
('RAC0001', 1, 1, 2, 1, 'Sistema fora do ar para testes', 'Resolvido', 'Servidor travado durante testes', 'Reinicialização do servidor resolveu o problema', 120);

-- Relatório inicial
INSERT INTO relatorios (chamado_id, caminho_pdf, enviado, metodo_envio, data_envio) VALUES 
('RAC0001', '/relatorios/RAC0001.pdf', true, 'email', CURRENT_TIMESTAMP);
