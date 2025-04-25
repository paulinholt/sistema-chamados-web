-- Adição da tabela de projetos ao esquema do banco de dados

-- Tabela: projeto
CREATE TABLE projeto (
    id_projeto INTEGER PRIMARY KEY AUTOINCREMENT,
    sigla TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    descricao TEXT,
    gerente TEXT NOT NULL,
    email_gerente TEXT,
    telefone_gerente TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT 1
);

-- Adicionar campo id_projeto à tabela chamado
ALTER TABLE chamado ADD COLUMN id_projeto INTEGER REFERENCES projeto(id_projeto);

-- Criar índice para otimizar consultas por projeto
CREATE INDEX idx_chamado_projeto ON chamado (id_projeto);

-- Inserir alguns projetos de exemplo
INSERT INTO projeto (sigla, nome, gerente, email_gerente, telefone_gerente) VALUES 
('SUP', 'Suporte Geral', 'Aurélio Muniz', 'aurelio.muniz@empresa.com.br', '(85) 98765-4321'),
('DEV', 'Desenvolvimento', 'Carlos Silva', 'carlos.silva@empresa.com.br', '(85) 98765-1234'),
('INFRA', 'Infraestrutura', 'Mariana Costa', 'mariana.costa@empresa.com.br', '(85) 98765-5678');

-- Atualizar a trigger de atualização de data_fechamento para incluir notificação ao gerente
DROP TRIGGER IF EXISTS atualiza_data_fechamento;
CREATE TRIGGER atualiza_data_fechamento
AFTER UPDATE OF status ON chamado
WHEN NEW.status = 'Resolvido' AND OLD.status != 'Resolvido'
BEGIN
    UPDATE chamado SET data_fechamento = CURRENT_TIMESTAMP WHERE id_chamado = NEW.id_chamado;
    -- A lógica de notificação será implementada na aplicação
END;
