// src/lib/models/plantonista.ts
// Modelo para interação com a tabela de plantonistas

import { dbClient } from '../db';

export interface Plantonista {
  id: number;
  usuario_id?: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  chamados_atendidos: number;
  tempo_medio: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export class PlantonistaModel {
  // Obter todos os plantonistas com filtros opcionais
  static async getAll(filters: {
    status?: string;
    q?: string;
  } = {}): Promise<Plantonista[]> {
    // Se o banco de dados não estiver disponível, retorna dados simulados
    if (!dbClient.isAvailable()) {
      return this.getSimulatedData(filters);
    }

    let sql = `
      SELECT p.*, u.nome as usuario_nome
      FROM plantonistas p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.status) {
      if (filters.status.toLowerCase() === 'ativo' || filters.status.toLowerCase() === 'inativo') {
        const isAtivo = filters.status.toLowerCase() === 'ativo';
        sql += ` AND p.ativo = ?`;
        params.push(isAtivo ? 1 : 0);
      } else {
        sql += ` AND p.status = ?`;
        params.push(filters.status);
      }
    }

    if (filters.q) {
      sql += ` AND (p.nome LIKE ? OR p.email LIKE ? OR p.telefone LIKE ?)`;
      const searchTerm = `%${filters.q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY p.nome ASC`;

    try {
      return await dbClient.query<Plantonista>(sql, params);
    } catch (error) {
      console.error('Erro ao buscar plantonistas:', error);
      return [];
    }
  }

  // Obter um plantonista pelo ID
  static async getById(id: number): Promise<Plantonista | null> {
    if (!dbClient.isAvailable()) {
      const simulatedData = this.getSimulatedData();
      return simulatedData.find(p => p.id === id) || null;
    }

    const sql = `
      SELECT p.*, u.nome as usuario_nome
      FROM plantonistas p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `;

    try {
      return await dbClient.queryOne<Plantonista>(sql, [id]);
    } catch (error) {
      console.error(`Erro ao buscar plantonista ${id}:`, error);
      return null;
    }
  }

  // Criar um novo plantonista
  static async create(plantonista: Omit<Plantonista, 'id' | 'criado_em' | 'atualizado_em'>): Promise<{ success: boolean; id?: number }> {
    if (!dbClient.isAvailable()) {
      // Simulação de criação bem-sucedida
      return { success: true, id: Math.floor(Math.random() * 1000) };
    }

    // Verificar se já existe um plantonista com o mesmo email
    const existingPlantonista = await dbClient.queryOne<Plantonista>(
      'SELECT * FROM plantonistas WHERE email = ?', 
      [plantonista.email]
    );
    
    if (existingPlantonista) {
      return { success: false };
    }

    const sql = `
      INSERT INTO plantonistas (
        usuario_id, nome, email, telefone, status, chamados_atendidos, tempo_medio, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      plantonista.usuario_id || null,
      plantonista.nome,
      plantonista.email,
      plantonista.telefone,
      plantonista.status || 'Disponível',
      plantonista.chamados_atendidos || 0,
      plantonista.tempo_medio || 0,
      plantonista.ativo ? 1 : 0
    ];

    try {
      const result = await dbClient.execute(sql, params);
      return { 
        success: result.success, 
        id: result.lastInsertId 
      };
    } catch (error) {
      console.error('Erro ao criar plantonista:', error);
      return { success: false };
    }
  }

  // Atualizar um plantonista existente
  static async update(id: number, plantonista: Partial<Plantonista>): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de atualização bem-sucedida
      return true;
    }

    // Verificar se está tentando alterar o email para um que já existe
    if (plantonista.email) {
      const existingPlantonista = await dbClient.queryOne<Plantonista>(
        'SELECT * FROM plantonistas WHERE email = ? AND id != ?', 
        [plantonista.email, id]
      );
      
      if (existingPlantonista) {
        return false;
      }
    }

    // Construir a consulta SQL dinamicamente com base nos campos fornecidos
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(plantonista).forEach(([key, value]) => {
      // Ignorar campos que não devem ser atualizados
      if (['id', 'criado_em', 'atualizado_em'].includes(key)) return;
      
      fields.push(`${key} = ?`);
      params.push(value);
    });

    // Adicionar atualizado_em
    fields.push('atualizado_em = CURRENT_TIMESTAMP');

    // Adicionar o ID ao final dos parâmetros
    params.push(id);

    const sql = `UPDATE plantonistas SET ${fields.join(', ')} WHERE id = ?`;

    try {
      const result = await dbClient.execute(sql, params);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao atualizar plantonista ${id}:`, error);
      return false;
    }
  }

  // Excluir um plantonista
  static async delete(id: number): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de exclusão bem-sucedida
      return true;
    }

    const sql = 'DELETE FROM plantonistas WHERE id = ?';

    try {
      const result = await dbClient.execute(sql, [id]);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao excluir plantonista ${id}:`, error);
      return false;
    }
  }

  // Dados simulados para desenvolvimento
  private static getSimulatedData(filters: any = {}): Plantonista[] {
    const plantonistas: Plantonista[] = [
      {
        id: 1,
        nome: 'Aurélio',
        email: 'aurelio@w3fmaster.com.br',
        telefone: '+5511977123444',
        status: 'Disponível',
        chamados_atendidos: 42,
        tempo_medio: 1.5,
        ativo: true,
        criado_em: '2025-04-24T10:30:00',
        atualizado_em: '2025-04-24T10:30:00'
      },
      {
        id: 2,
        nome: 'Caio',
        email: 'caio@w3fmaster.com.br',
        telefone: '(11) 98765-4321',
        status: 'Em Atendimento',
        chamados_atendidos: 38,
        tempo_medio: 1.8,
        ativo: true,
        criado_em: '2025-04-24T11:30:00',
        atualizado_em: '2025-04-24T11:30:00'
      },
      {
        id: 3,
        nome: 'Carlos',
        email: 'carlos@w3fmaster.com.br',
        telefone: '(11) 97654-3210',
        status: 'Folga',
        chamados_atendidos: 35,
        tempo_medio: 2.0,
        ativo: true,
        criado_em: '2025-04-24T12:30:00',
        atualizado_em: '2025-04-24T12:30:00'
      },
      {
        id: 4,
        nome: 'Flávio',
        email: 'flavio@w3fmaster.com.br',
        telefone: '(11) 96543-2109',
        status: 'Disponível',
        chamados_atendidos: 40,
        tempo_medio: 1.7,
        ativo: true,
        criado_em: '2025-04-24T13:30:00',
        atualizado_em: '2025-04-24T13:30:00'
      },
      {
        id: 5,
        nome: 'Igor',
        email: 'igor@w3fmaster.com.br',
        telefone: '(11) 95432-1098',
        status: 'Em Atendimento',
        chamados_atendidos: 37,
        tempo_medio: 1.9,
        ativo: true,
        criado_em: '2025-04-24T14:30:00',
        atualizado_em: '2025-04-24T14:30:00'
      },
      {
        id: 6,
        nome: 'Pedro',
        email: 'pedro@w3fmaster.com.br',
        telefone: '(11) 94321-0987',
        status: 'Disponível',
        chamados_atendidos: 39,
        tempo_medio: 1.6,
        ativo: true,
        criado_em: '2025-04-24T15:30:00',
        atualizado_em: '2025-04-24T15:30:00'
      },
      {
        id: 7,
        nome: 'Plantão',
        email: 'plantao@w3fmaster.com.br',
        telefone: '(11) 93210-9876',
        status: 'Folga',
        chamados_atendidos: 30,
        tempo_medio: 2.2,
        ativo: true,
        criado_em: '2025-04-24T16:30:00',
        atualizado_em: '2025-04-24T16:30:00'
      }
    ];

    // Aplicar filtros
    let result = [...plantonistas];

    if (filters.status) {
      if (filters.status.toLowerCase() === 'ativo' || filters.status.toLowerCase() === 'inativo') {
        const isAtivo = filters.status.toLowerCase() === 'ativo';
        result = result.filter(p => p.ativo === isAtivo);
      } else {
        result = result.filter(p => p.status.toLowerCase() === filters.status.toLowerCase());
      }
    }

    if (filters.q) {
      const query = filters.q.toLowerCase();
      result = result.filter(p => 
        p.nome.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.telefone.includes(query)
      );
    }

    return result;
  }
}
