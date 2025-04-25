// src/lib/models/relatorio.ts
// Modelo para interação com a tabela de relatórios

import { dbClient } from '../db';

export interface Relatorio {
  id: number;
  chamado_id: string;
  caminho_pdf: string;
  data_geracao: string;
  enviado: boolean;
  metodo_envio?: string;
  data_envio?: string;
}

export class RelatorioModel {
  // Obter todos os relatórios com filtros opcionais
  static async getAll(filters: {
    chamado_id?: string;
    enviado?: boolean;
  } = {}): Promise<Relatorio[]> {
    // Se o banco de dados não estiver disponível, retorna dados simulados
    if (!dbClient.isAvailable()) {
      return this.getSimulatedData(filters);
    }

    let sql = `
      SELECT r.*, c.descricao as chamado_descricao
      FROM relatorios r
      LEFT JOIN chamados c ON r.chamado_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.chamado_id) {
      sql += ` AND r.chamado_id = ?`;
      params.push(filters.chamado_id);
    }

    if (filters.enviado !== undefined) {
      sql += ` AND r.enviado = ?`;
      params.push(filters.enviado ? 1 : 0);
    }

    sql += ` ORDER BY r.data_geracao DESC`;

    try {
      return await dbClient.query<Relatorio>(sql, params);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      return [];
    }
  }

  // Obter um relatório pelo ID
  static async getById(id: number): Promise<Relatorio | null> {
    if (!dbClient.isAvailable()) {
      const simulatedData = this.getSimulatedData();
      return simulatedData.find(r => r.id === id) || null;
    }

    const sql = `
      SELECT r.*, c.descricao as chamado_descricao
      FROM relatorios r
      LEFT JOIN chamados c ON r.chamado_id = c.id
      WHERE r.id = ?
    `;

    try {
      return await dbClient.queryOne<Relatorio>(sql, [id]);
    } catch (error) {
      console.error(`Erro ao buscar relatório ${id}:`, error);
      return null;
    }
  }

  // Obter relatórios por ID do chamado
  static async getByChamadoId(chamadoId: string): Promise<Relatorio[]> {
    if (!dbClient.isAvailable()) {
      const simulatedData = this.getSimulatedData();
      return simulatedData.filter(r => r.chamado_id === chamadoId);
    }

    const sql = `
      SELECT r.*, c.descricao as chamado_descricao
      FROM relatorios r
      LEFT JOIN chamados c ON r.chamado_id = c.id
      WHERE r.chamado_id = ?
      ORDER BY r.data_geracao DESC
    `;

    try {
      return await dbClient.query<Relatorio>(sql, [chamadoId]);
    } catch (error) {
      console.error(`Erro ao buscar relatórios para chamado ${chamadoId}:`, error);
      return [];
    }
  }

  // Criar um novo relatório
  static async create(relatorio: Omit<Relatorio, 'id'>): Promise<{ success: boolean; id?: number }> {
    if (!dbClient.isAvailable()) {
      // Simulação de criação bem-sucedida
      return { success: true, id: Math.floor(Math.random() * 1000) };
    }

    const sql = `
      INSERT INTO relatorios (
        chamado_id, caminho_pdf, data_geracao, enviado, metodo_envio, data_envio
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      relatorio.chamado_id,
      relatorio.caminho_pdf,
      relatorio.data_geracao || new Date().toISOString(),
      relatorio.enviado ? 1 : 0,
      relatorio.metodo_envio || null,
      relatorio.data_envio || null
    ];

    try {
      const result = await dbClient.execute(sql, params);
      return { 
        success: result.success, 
        id: result.lastInsertId 
      };
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      return { success: false };
    }
  }

  // Atualizar um relatório existente
  static async update(id: number, relatorio: Partial<Relatorio>): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de atualização bem-sucedida
      return true;
    }

    // Construir a consulta SQL dinamicamente com base nos campos fornecidos
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(relatorio).forEach(([key, value]) => {
      // Ignorar campos que não devem ser atualizados
      if (['id'].includes(key)) return;
      
      fields.push(`${key} = ?`);
      params.push(value);
    });

    // Adicionar o ID ao final dos parâmetros
    params.push(id);

    const sql = `UPDATE relatorios SET ${fields.join(', ')} WHERE id = ?`;

    try {
      const result = await dbClient.execute(sql, params);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao atualizar relatório ${id}:`, error);
      return false;
    }
  }

  // Marcar relatório como enviado
  static async marcarComoEnviado(id: number, metodoEnvio: string): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de atualização bem-sucedida
      return true;
    }

    const sql = `
      UPDATE relatorios 
      SET enviado = 1, metodo_envio = ?, data_envio = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    try {
      const result = await dbClient.execute(sql, [metodoEnvio, id]);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao marcar relatório ${id} como enviado:`, error);
      return false;
    }
  }

  // Excluir um relatório
  static async delete(id: number): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de exclusão bem-sucedida
      return true;
    }

    const sql = 'DELETE FROM relatorios WHERE id = ?';

    try {
      const result = await dbClient.execute(sql, [id]);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao excluir relatório ${id}:`, error);
      return false;
    }
  }

  // Dados simulados para desenvolvimento
  private static getSimulatedData(filters: any = {}): Relatorio[] {
    const relatorios: Relatorio[] = [
      {
        id: 1,
        chamado_id: 'RAC0001',
        caminho_pdf: '/relatorios/RAC0001.pdf',
        data_geracao: '2025-04-24T12:30:00',
        enviado: true,
        metodo_envio: 'email',
        data_envio: '2025-04-24T12:35:00'
      },
      {
        id: 2,
        chamado_id: 'RAC0002',
        caminho_pdf: '/relatorios/RAC0002.pdf',
        data_geracao: '2025-04-24T15:45:00',
        enviado: false
      }
    ];

    // Aplicar filtros
    let result = [...relatorios];

    if (filters.chamado_id) {
      result = result.filter(r => r.chamado_id === filters.chamado_id);
    }

    if (filters.enviado !== undefined) {
      result = result.filter(r => r.enviado === filters.enviado);
    }

    return result;
  }
}
