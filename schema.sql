-- Criação do esquema do banco de dados SQLite para o Sistema de Gerenciamento de Chamados

-- Tabela: cliente
CREATE TABLE cliente (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj_cpf TEXT UNIQUE,
    contato TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: plantonista
CREATE TABLE plantonista (
    id_plantonista INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE,
    telefone TEXT,
    status TEXT CHECK (status IN ('Ativo', 'Inativo')) DEFAULT 'Ativo',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: categoria
CREATE TABLE categoria (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT
);

-- Tabela: chamado
CREATE TABLE chamado (
    id_chamado INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_plantonista INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo TEXT,
    prioridade TEXT CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Crítica')),
    descricao TEXT NOT NULL,
    ambiente TEXT,
    tempo_ocorrencia TEXT,
    analise TEXT,
    procedimentos TEXT,
    solucao TEXT,
    status TEXT CHECK (status IN ('Aberto', 'Em Andamento', 'Resolvido', 'Pendente', 'Escalado')) DEFAULT 'Aberto',
    tempo_atendimento INTEGER,
    observacoes TEXT,
    recomendacoes TEXT,
    data_fechamento DATETIME,
    FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente),
    FOREIGN KEY (id_plantonista) REFERENCES plantonista (id_plantonista),
    FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria)
);

-- Tabela: anexo
CREATE TABLE anexo (
    id_anexo INTEGER PRIMARY KEY AUTOINCREMENT,
    id_chamado INTEGER NOT NULL,
    nome_arquivo TEXT NOT NULL,
    tipo_arquivo TEXT,
    caminho TEXT NOT NULL,
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_chamado) REFERENCES chamado (id_chamado)
);

-- Tabela: relatorio
CREATE TABLE relatorio (
    id_relatorio INTEGER PRIMARY KEY AUTOINCREMENT,
    id_chamado INTEGER NOT NULL,
    caminho_pdf TEXT NOT NULL,
    data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    enviado BOOLEAN DEFAULT 0,
    metodo_envio TEXT CHECK (metodo_envio IN ('Email', 'WhatsApp', 'Ambos')),
    data_envio DATETIME,
    FOREIGN KEY (id_chamado) REFERENCES chamado (id_chamado)
);

-- Índices para otimização de consultas
CREATE INDEX idx_chamado_cliente ON chamado (id_cliente);
CREATE INDEX idx_chamado_plantonista ON chamado (id_plantonista);
CREATE INDEX idx_chamado_categoria ON chamado (id_categoria);
CREATE INDEX idx_chamado_status ON chamado (status);
CREATE INDEX idx_chamado_data ON chamado (data_hora);
CREATE INDEX idx_anexo_chamado ON anexo (id_chamado);
CREATE INDEX idx_relatorio_chamado ON relatorio (id_chamado);

-- Inserção de categorias padrão
INSERT INTO categoria (nome, descricao) VALUES 
('Suporte Técnico', 'Problemas técnicos com hardware ou software'),
('Manutenção', 'Serviços de manutenção preventiva ou corretiva'),
('Consultoria', 'Orientações e recomendações técnicas'),
('Instalação', 'Instalação de equipamentos ou softwares'),
('Treinamento', 'Capacitação e treinamento de usuários');

-- Trigger para atualizar data_fechamento quando status mudar para Resolvido
CREATE TRIGGER atualiza_data_fechamento
AFTER UPDATE OF status ON chamado
WHEN NEW.status = 'Resolvido' AND OLD.status != 'Resolvido'
BEGIN
    UPDATE chamado SET data_fechamento = CURRENT_TIMESTAMP WHERE id_chamado = NEW.id_chamado;
END;

-- Trigger para calcular tempo_atendimento quando chamado for fechado
CREATE TRIGGER calcula_tempo_atendimento
AFTER UPDATE OF data_fechamento ON chamado
WHEN NEW.data_fechamento IS NOT NULL AND OLD.data_fechamento IS NULL
BEGIN
    UPDATE chamado 
    SET tempo_atendimento = ROUND((JULIANDAY(NEW.data_fechamento) - JULIANDAY(data_hora)) * 1440)
    WHERE id_chamado = NEW.id_chamado;
END;
