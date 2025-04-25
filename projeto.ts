// src/lib/models/projeto.ts
// Modelo para interação com a tabela de projetos

import { dbClient } from '../db';

export interface Projeto {
  id: number;
  sigla: string;
  nome: string;
  descricao?: string;
  gerente_id?: number;
  email_gerente: string;
  telefone_gerente: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export class ProjetoModel {
  // Obter todos os projetos com filtros opcionais
  static async getAll(filters: {
    status?: string;
    q?: string;
  } = {}): Promise<Projeto[]> {
    // Se o banco de dados não estiver disponível, retorna dados simulados
    if (!dbClient.isAvailable()) {
      return this.getSimulatedData(filters);
    }

    let sql = `
      SELECT p.*, u.nome as gerente_nome
      FROM projetos p
      LEFT JOIN usuarios u ON p.gerente_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.status) {
      const isAtivo = filters.status.toLowerCase() === 'ativo';
      sql += ` AND p.ativo = ?`;
      params.push(isAtivo ? 1 : 0);
    }

    if (filters.q) {
      sql += ` AND (p.nome LIKE ? OR p.sigla LIKE ? OR p.email_gerente LIKE ?)`;
      const searchTerm = `%${filters.q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY p.sigla ASC`;

    try {
      return await dbClient.query<Projeto>(sql, params);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
  }

  // Obter um projeto pelo ID
  static async getById(id: number): Promise<Projeto | null> {
    if (!dbClient.isAvailable()) {
      const simulatedData = this.getSimulatedData();
      return simulatedData.find(p => p.id === id) || null;
    }

    const sql = `
      SELECT p.*, u.nome as gerente_nome
      FROM projetos p
      LEFT JOIN usuarios u ON p.gerente_id = u.id
      WHERE p.id = ?
    `;

    try {
      return await dbClient.queryOne<Projeto>(sql, [id]);
    } catch (error) {
      console.error(`Erro ao buscar projeto ${id}:`, error);
      return null;
    }
  }

  // Obter um projeto pela sigla
  static async getBySigla(sigla: string): Promise<Projeto | null> {
    if (!dbClient.isAvailable()) {
      const simulatedData = this.getSimulatedData();
      return simulatedData.find(p => p.sigla.toLowerCase() === sigla.toLowerCase()) || null;
    }

    const sql = `
      SELECT p.*, u.nome as gerente_nome
      FROM projetos p
      LEFT JOIN usuarios u ON p.gerente_id = u.id
      WHERE p.sigla = ?
    `;

    try {
      return await dbClient.queryOne<Projeto>(sql, [sigla]);
    } catch (error) {
      console.error(`Erro ao buscar projeto com sigla ${sigla}:`, error);
      return null;
    }
  }

  // Criar um novo projeto
  static async create(projeto: Omit<Projeto, 'id' | 'criado_em' | 'atualizado_em'>): Promise<{ success: boolean; id?: number }> {
    if (!dbClient.isAvailable()) {
      // Simulação de criação bem-sucedida
      return { success: true, id: Math.floor(Math.random() * 1000) };
    }

    // Verificar se já existe um projeto com a mesma sigla
    const existingProjeto = await this.getBySigla(projeto.sigla);
    if (existingProjeto) {
      return { success: false };
    }

    const sql = `
      INSERT INTO projetos (
        sigla, nome, descricao, gerente_id, email_gerente, telefone_gerente, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      projeto.sigla,
      projeto.nome,
      projeto.descricao || null,
      projeto.gerente_id || null,
      projeto.email_gerente,
      projeto.telefone_gerente,
      projeto.ativo ? 1 : 0
    ];

    try {
      const result = await dbClient.execute(sql, params);
      return { 
        success: result.success, 
        id: result.lastInsertId 
      };
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      return { success: false };
    }
  }

  // Atualizar um projeto existente
  static async update(id: number, projeto: Partial<Projeto>): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de atualização bem-sucedida
      return true;
    }

    // Verificar se está tentando alterar a sigla para uma que já existe
    if (projeto.sigla) {
      const existingProjeto = await this.getBySigla(projeto.sigla);
      if (existingProjeto && existingProjeto.id !== id) {
        return false;
      }
    }

    // Construir a consulta SQL dinamicamente com base nos campos fornecidos
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(projeto).forEach(([key, value]) => {
      // Ignorar campos que não devem ser atualizados
      if (['id', 'criado_em', 'atualizado_em'].includes(key)) return;
      
      fields.push(`${key} = ?`);
      params.push(value);
    });

    // Adicionar atualizado_em
    fields.push('atualizado_em = CURRENT_TIMESTAMP');

    // Adicionar o ID ao final dos parâmetros
    params.push(id);

    const sql = `UPDATE projetos SET ${fields.join(', ')} WHERE id = ?`;

    try {
      const result = await dbClient.execute(sql, params);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao atualizar projeto ${id}:`, error);
      return false;
    }
  }

  // Excluir um projeto
  static async delete(id: number): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de exclusão bem-sucedida
      return true;
    }

    const sql = 'DELETE FROM projetos WHERE id = ?';

    try {
      const result = await dbClient.execute(sql, [id]);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao excluir projeto ${id}:`, error);
      return false;
    }
  }

  // Dados simulados para desenvolvimento
  private static getSimulatedData(filters: any = {}): Projeto[] {
    const projetos: Projeto[] = [
      {
        id: 1,
        sigla: 'TST',
        nome: 'Projeto Teste',
        descricao: 'Projeto para testes do sistema',
        email_gerente: 'gerente@w3fmaster.com.br',
        telefone_gerente: '(11) 92345-6789',
        ativo: true,
        criado_em: '2025-04-24T10:30:00',
        atualizado_em: '2025-04-24T10:30:00'
      },
      {
        id: 2,
        sigla: 'PROJ-A',
        nome: 'Projeto A',
        descricao: 'Descrição do Projeto A',
        email_gerente: 'gerentea@w3fmaster.com.br',
        telefone_gerente: '(11) 91234-5678',
        ativo: true,
        criado_em: '2025-04-24T11:30:00',
        atualizado_em: '2025-04-24T11:30:00'
      },
      {
        id: 3,
        sigla: 'PROJ-B',
        nome: 'Projeto B',
        descricao: 'Descrição do Projeto B',
        email_gerente: 'gerenteb@w3fmaster.com.br',
        telefone_gerente: '(11) 93456-7890',
        ativo: true,
        criado_em: '2025-04-24T12:30:00',
        atualizado_em: '2025-04-24T12:30:00'
      }
    ];

    // Aplicar filtros
    let result = [...projetos];

    if (filters.status) {
      const isAtivo = filters.status.toLowerCase() === 'ativo';
      result = result.filter(p => p.ativo === isAtivo);
    }

    if (filters.q) {
      const query = filters.q.toLowerCase();
      result = result.filter(p => 
        p.nome.toLowerCase().includes(query) ||
        p.sigla.toLowerCase().includes(query) ||
        p.email_gerente.toLowerCase().includes(query)
      );
    }

    return result;
  }
}
