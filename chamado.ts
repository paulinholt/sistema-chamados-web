// src/lib/models/chamado.ts
// Modelo para interação com a tabela de chamados

import { dbClient } from '../db';

export interface Chamado {
  id: string;
  cliente_id: number;
  plantonista_id: number;
  categoria_id?: number;
  projeto_id?: number;
  data_hora: string;
  tipo?: string;
  prioridade?: string;
  descricao: string;
  ambiente?: string;
  tempo_ocorrencia?: number;
  analise?: string;
  procedimentos?: string;
  solucao?: string;
  status: string;
  tempo_atendimento?: number;
  observacoes?: string;
  recomendacoes?: string;
  data_fechamento?: string;
  criado_em: string;
  atualizado_em: string;
}

export class ChamadoModel {
  // Obter todos os chamados com filtros opcionais
  static async getAll(filters: {
    status?: string;
    projeto?: string;
    cliente_id?: number;
    plantonista_id?: number;
    q?: string;
  } = {}): Promise<Chamado[]> {
    // Se o banco de dados não estiver disponível, retorna dados simulados
    if (!dbClient.isAvailable()) {
      return this.getSimulatedData(filters);
    }

    let sql = `
      SELECT c.*, cl.nome as cliente_nome, p.nome as plantonista_nome, pr.sigla as projeto_sigla
      FROM chamados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN plantonistas p ON c.plantonista_id = p.id
      LEFT JOIN projetos pr ON c.projeto_id = pr.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.status) {
      sql += ` AND c.status = ?`;
      params.push(filters.status);
    }

    if (filters.projeto) {
      sql += ` AND pr.sigla = ?`;
      params.push(filters.projeto);
    }

    if (filters.cliente_id) {
      sql += ` AND c.cliente_id = ?`;
      params.push(filters.cliente_id);
    }

    if (filters.plantonista_id) {
      sql += ` AND c.plantonista_id = ?`;
      params.push(filters.plantonista_id);
    }

    if (filters.q) {
      sql += ` AND (c.descricao LIKE ? OR c.id LIKE ? OR cl.nome LIKE ?)`;
      const searchTerm = `%${filters.q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY c.data_hora DESC`;

    try {
      return await dbClient.query<Chamado>(sql, params);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      return [];
    }
  }

  // Obter um chamado pelo ID
  static async getById(id: string): Promise<Chamado | null> {
    if (!dbClient.isAvailable()) {
      const simulatedData = this.getSimulatedData();
      return simulatedData.find(c => c.id === id) || null;
    }

    const sql = `
      SELECT c.*, cl.nome as cliente_nome, p.nome as plantonista_nome, pr.sigla as projeto_sigla
      FROM chamados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN plantonistas p ON c.plantonista_id = p.id
      LEFT JOIN projetos pr ON c.projeto_id = pr.id
      WHERE c.id = ?
    `;

    try {
      return await dbClient.queryOne<Chamado>(sql, [id]);
    } catch (error) {
      console.error(`Erro ao buscar chamado ${id}:`, error);
      return null;
    }
  }

  // Criar um novo chamado
  static async create(chamado: Omit<Chamado, 'id' | 'criado_em' | 'atualizado_em'>): Promise<{ success: boolean; id?: string }> {
    if (!dbClient.isAvailable()) {
      // Simulação de criação bem-sucedida
      return { success: true, id: `RAC${Math.floor(1000 + Math.random() * 9000)}` };
    }

    // Obter o próximo ID
    const lastChamado = await dbClient.queryOne<{ id: string }>('SELECT id FROM chamados ORDER BY id DESC LIMIT 1');
    let nextId = 1;
    
    if (lastChamado) {
      const lastIdNumber = parseInt(lastChamado.id.replace('RAC', ''));
      nextId = lastIdNumber + 1;
    }
    
    const id = `RAC${nextId.toString().padStart(4, '0')}`;

    const sql = `
      INSERT INTO chamados (
        id, cliente_id, plantonista_id, categoria_id, projeto_id, 
        data_hora, tipo, prioridade, descricao, ambiente, 
        tempo_ocorrencia, analise, procedimentos, solucao, status, 
        tempo_atendimento, observacoes, recomendacoes, data_fechamento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      chamado.cliente_id,
      chamado.plantonista_id,
      chamado.categoria_id || null,
      chamado.projeto_id || null,
      chamado.data_hora || new Date().toISOString(),
      chamado.tipo || null,
      chamado.prioridade || null,
      chamado.descricao,
      chamado.ambiente || null,
      chamado.tempo_ocorrencia || null,
      chamado.analise || null,
      chamado.procedimentos || null,
      chamado.solucao || null,
      chamado.status || 'Aberto',
      chamado.tempo_atendimento || null,
      chamado.observacoes || null,
      chamado.recomendacoes || null,
      chamado.data_fechamento || null
    ];

    try {
      const result = await dbClient.execute(sql, params);
      return { success: result.success, id };
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      return { success: false };
    }
  }

  // Atualizar um chamado existente
  static async update(id: string, chamado: Partial<Chamado>): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de atualização bem-sucedida
      return true;
    }

    // Construir a consulta SQL dinamicamente com base nos campos fornecidos
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(chamado).forEach(([key, value]) => {
      // Ignorar campos que não devem ser atualizados
      if (['id', 'criado_em', 'atualizado_em'].includes(key)) return;
      
      fields.push(`${key} = ?`);
      params.push(value);
    });

    // Adicionar atualizado_em
    fields.push('atualizado_em = CURRENT_TIMESTAMP');

    // Adicionar o ID ao final dos parâmetros
    params.push(id);

    const sql = `UPDATE chamados SET ${fields.join(', ')} WHERE id = ?`;

    try {
      const result = await dbClient.execute(sql, params);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao atualizar chamado ${id}:`, error);
      return false;
    }
  }

  // Excluir um chamado
  static async delete(id: string): Promise<boolean> {
    if (!dbClient.isAvailable()) {
      // Simulação de exclusão bem-sucedida
      return true;
    }

    const sql = 'DELETE FROM chamados WHERE id = ?';

    try {
      const result = await dbClient.execute(sql, [id]);
      return result.success && (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Erro ao excluir chamado ${id}:`, error);
      return false;
    }
  }

  // Dados simulados para desenvolvimento
  private static getSimulatedData(filters: any = {}): Chamado[] {
    const chamados: Chamado[] = [
      {
        id: 'RAC0001',
        cliente_id: 1,
        plantonista_id: 1,
        categoria_id: 2,
        projeto_id: 1,
        data_hora: '2025-04-24T10:30:00',
        tipo: 'Incidente',
        prioridade: 'Alta',
        descricao: 'Sistema fora do ar para testes',
        ambiente: 'Produção',
        tempo_ocorrencia: 60,
        analise: 'Servidor travado durante testes',
        procedimentos: 'Verificação de logs e reinicialização',
        solucao: 'Reinicialização do servidor resolveu o problema',
        status: 'Resolvido',
        tempo_atendimento: 120,
        observacoes: 'Cliente satisfeito com o atendimento',
        recomendacoes: 'Monitorar o servidor para evitar novos travamentos',
        data_fechamento: '2025-04-24T12:30:00',
        criado_em: '2025-04-24T10:30:00',
        atualizado_em: '2025-04-24T12:30:00'
      },
      {
        id: 'RAC0002',
        cliente_id: 2,
        plantonista_id: 2,
        categoria_id: 3,
        projeto_id: 2,
        data_hora: '2025-04-24T14:00:00',
        tipo: 'Requisição',
        prioridade: 'Média',
        descricao: 'Problema de conectividade com o servidor',
        ambiente: 'Homologação',
        tempo_ocorrencia: 30,
        analise: 'Firewall bloqueando conexões',
        procedimentos: 'Verificação de regras de firewall',
        solucao: 'Liberação de porta no firewall',
        status: 'Pendente',
        tempo_atendimento: 90,
        observacoes: 'Aguardando confirmação do cliente',
        criado_em: '2025-04-24T14:00:00',
        atualizado_em: '2025-04-24T15:30:00'
      }
    ];

    // Aplicar filtros
    let result = [...chamados];

    if (filters.status) {
      result = result.filter(c => c.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.projeto) {
      result = result.filter(c => c.projeto_id === filters.projeto);
    }

    if (filters.cliente_id) {
      result = result.filter(c => c.cliente_id === filters.cliente_id);
    }

    if (filters.plantonista_id) {
      result = result.filter(c => c.plantonista_id === filters.plantonista_id);
    }

    if (filters.q) {
      const query = filters.q.toLowerCase();
      result = result.filter(c => 
        c.descricao.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
      );
    }

    return result;
  }
}
