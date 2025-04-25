// src/lib/models/cliente.ts
// Modelo para interação com a tabela de clientes

import { dbClient } from '../db';

export interface Cliente {
  id: number;
  nome: string;
  cnpj_cpf?: string;
  contato?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export class ClienteModel {
  // Obter todos os clientes com filtros opcionais
  static async getAll(filters: {
    status?: string;
    q?: string;
  } = {}): Promise<Cliente[]> {
    // Se o banco de dados não estiver disponível, retorna dados simulados
    if (!dbClient.isAvailable()) {
      return this.getSimulatedData(filters);
    }

    let sql = `
      SELECT *
      FROM clientes
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.status) {
      const isAtivo = filters.status.toLowerCase() === 'ativo';
      sql += ` AND ativo = ?`;
      params.push(isAtivo ? 1 : 0);
    }

    if (filters.q) {
      sql += ` AND (nome LIKE ? OR cnpj_cpf LIKE ? OR contato LIKE ? OR email LIKE ?)`;
      const searchTerm = `%${filters.q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY nome ASC`;

    try {
      return await dbClient.query<Cliente>(sql, params);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  }

  // Obter um cliente pelo ID
  static async getById(id: number): Promise<Cliente | null> {
    if (!dbClient.isAvailable()) {
      const simulatedData = this.getSimulatedData();
      return simulatedData.find(c => c.id === id) || null;
    }

    const sql = `SELECT * FROM clientes WHERE id = ?`;

    try {
      return await dbClient.queryOne<Cliente>(sql, [id]);
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      return null;
    }
  }

  // Criar um novo cliente
  static async create(cliente: Omit<Cliente, 'id' | 'criado_em' | 'atualizado_em'>): Promise<{ success: boolean; id?: number }> {
    if (!dbClient.isAvailable()) {
      // Simulação de criação bem-sucedida
      return { success: true, id: Math.floor(Math.random() * 1000) };
    }

    // Verificar se já existe um cliente com o mesmo CNPJ/CPF
    if (cliente.cnpj_cpf) {
      const existingCliente = await dbClient.queryOne<Cliente>(
        'SELECT * FROM clientes WHERE cnpj_cpf = ?', 
        [cliente.cnpj_cpf]
      );
      
      if (existingCliente) {
        return { success: false };
      }
    }

    const sql = `
      INSERT INTO clientes (
        nome, cnpj_cpf, contato, telefone, email, ativo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      cliente.nome,
      cliente.cnpj_cpf || null,
      cliente.contato || null,
      cliente.telefone || null,
      cliente.email || null,
      cliente.ativo ? 1 : 0
    ];

    try {
      const result = await dbClient.execute(sql, params);
      return { 
        success: result.success, 
        id: result.lastInsertId 
      };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return { success: false };
    }
  }

  // Atualizar um cliente existente
  static async update(id: number, cliente: Partial<Cliente>): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de atualização bem-sucedida
      return true;
    }

    // Verificar se está tentando alterar o CNPJ/CPF para um que já existe
    if (cliente.cnpj_cpf) {
      const existingCliente = await dbClient.queryOne<Cliente>(
        'SELECT * FROM clientes WHERE cnpj_cpf = ? AND id != ?', 
        [cliente.cnpj_cpf, id]
      );
      
      if (existingCliente) {
        return false;
      }
    }

    // Construir a consulta SQL dinamicamente com base nos campos fornecidos
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(cliente).forEach(([key, value]) => {
      // Ignorar campos que não devem ser atualizados
      if (['id', 'criado_em', 'atualizado_em'].includes(key)) return;
      
      fields.push(`${key} = ?`);
      params.push(value);
    });

    // Adicionar atualizado_em
    fields.push('atualizado_em = CURRENT_TIMESTAMP');

    // Adicionar o ID ao final dos parâmetros
    params.push(id);

    const sql = `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`;

    try {
      const result = await dbClient.execute(sql, params);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      return false;
    }
  }

  // Excluir um cliente
  static async delete(id: number): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de exclusão bem-sucedida
      return true;
    }

    const sql = 'DELETE FROM clientes WHERE id = ?';

    try {
      const result = await dbClient.execute(sql, [id]);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao excluir cliente ${id}:`, error);
      return false;
    }
  }

  // Dados simulados para desenvolvimento
  private static getSimulatedData(filters: any = {}): Cliente[] {
    const clientes: Cliente[] = [
      {
        id: 1,
        nome: 'Empresa 1',
        cnpj_cpf: '12345678901234',
        contato: 'Contato 1',
        telefone: '(11) 91234-5678',
        email: 'contato1@empresa1.com.br',
        ativo: true,
        criado_em: '2025-04-24T10:30:00',
        atualizado_em: '2025-04-24T10:30:00'
      },
      {
        id: 2,
        nome: 'Empresa 2',
        cnpj_cpf: '23456789012345',
        contato: 'Contato 2',
        telefone: '(11) 92345-6789',
        email: 'contato2@empresa2.com.br',
        ativo: true,
        criado_em: '2025-04-24T11:30:00',
        atualizado_em: '2025-04-24T11:30:00'
      },
      {
        id: 3,
        nome: 'Empresa 3',
        cnpj_cpf: '34567890123456',
        contato: 'Contato 3',
        telefone: '(11) 93456-7890',
        email: 'contato3@empresa3.com.br',
        ativo: true,
        criado_em: '2025-04-24T12:30:00',
        atualizado_em: '2025-04-24T12:30:00'
      }
    ];

    // Aplicar filtros
    let result = [...clientes];

    if (filters.status) {
      const isAtivo = filters.status.toLowerCase() === 'ativo';
      result = result.filter(c => c.ativo === isAtivo);
    }

    if (filters.q) {
      const query = filters.q.toLowerCase();
      result = result.filter(c => 
        c.nome.toLowerCase().includes(query) ||
        (c.cnpj_cpf && c.cnpj_cpf.includes(query)) ||
        (c.contato && c.contato.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query))
      );
    }

    return result;
  }
}
