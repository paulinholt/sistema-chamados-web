// src/lib/consulta-historica.ts
// Utilitário para consulta histórica de chamados

import { Chamado } from './models/chamado';
import { dbClient } from './db';

// Interface para resultado de consulta
export interface ResultadoConsulta {
  chamados: Chamado[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

// Classe para consulta histórica
export class ConsultaHistorica {
  // Buscar chamados por termo
  static async buscarPorTermo(
    termo: string, 
    pagina: number = 1, 
    itensPorPagina: number = 10
  ): Promise<ResultadoConsulta> {
    // Se o banco de dados não estiver disponível, retorna dados simulados
    if (!dbClient.isAvailable()) {
      return this.getSimulatedResults(termo, pagina, itensPorPagina);
    }

    const offset = (pagina - 1) * itensPorPagina;
    
    // Consulta para obter total de resultados
    const countSql = `
      SELECT COUNT(*) as total
      FROM chamados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN plantonistas p ON c.plantonista_id = p.id
      LEFT JOIN projetos pr ON c.projeto_id = pr.id
      WHERE 
        c.descricao LIKE ? OR 
        c.analise LIKE ? OR 
        c.solucao LIKE ? OR 
        c.id LIKE ? OR
        cl.nome LIKE ? OR
        pr.sigla LIKE ?
    `;
    
    const searchTerm = `%${termo}%`;
    const countParams = [
      searchTerm, searchTerm, searchTerm, 
      searchTerm, searchTerm, searchTerm
    ];
    
    // Consulta para obter os chamados
    const sql = `
      SELECT c.*, cl.nome as cliente_nome, p.nome as plantonista_nome, pr.sigla as projeto_sigla
      FROM chamados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN plantonistas p ON c.plantonista_id = p.id
      LEFT JOIN projetos pr ON c.projeto_id = pr.id
      WHERE 
        c.descricao LIKE ? OR 
        c.analise LIKE ? OR 
        c.solucao LIKE ? OR 
        c.id LIKE ? OR
        cl.nome LIKE ? OR
        pr.sigla LIKE ?
      ORDER BY c.data_hora DESC
      LIMIT ? OFFSET ?
    `;
    
    const params = [
      ...countParams,
      itensPorPagina,
      offset
    ];
    
    try {
      // Obter total de resultados
      const countResult = await dbClient.queryOne<{ total: number }>(countSql, countParams);
      const total = countResult?.total || 0;
      
      // Obter chamados
      const chamados = await dbClient.query<Chamado>(sql, params);
      
      return {
        chamados,
        total,
        pagina,
        totalPaginas: Math.ceil(total / itensPorPagina)
      };
    } catch (error) {
      console.error('Erro ao buscar chamados por termo:', error);
      return {
        chamados: [],
        total: 0,
        pagina: 1,
        totalPaginas: 0
      };
    }
  }
  
  // Buscar chamados por cliente
  static async buscarPorCliente(
    clienteId: number,
    pagina: number = 1, 
    itensPorPagina: number = 10
  ): Promise<ResultadoConsulta> {
    // Se o banco de dados não estiver disponível, retorna dados simulados
    if (!dbClient.isAvailable()) {
      return this.getSimulatedResults(`cliente_${clienteId}`, pagina, itensPorPagina);
    }

    const offset = (pagina - 1) * itensPorPagina;
    
    // Consulta para obter total de resultados
    const countSql = `
      SELECT COUNT(*) as total
      FROM chamados
      WHERE cliente_id = ?
    `;
    
    // Consulta para obter os chamados
    const sql = `
      SELECT c.*, cl.nome as cliente_nome, p.nome as plantonista_nome, pr.sigla as projeto_sigla
      FROM chamados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN plantonistas p ON c.plantonista_id = p.id
      LEFT JOIN projetos pr ON c.projeto_id = pr.id
      WHERE c.cliente_id = ?
      ORDER BY c.data_hora DESC
      LIMIT ? OFFSET ?
    `;
    
    try {
      // Obter total de resultados
      const countResult = await dbClient.queryOne<{ total: number }>(countSql, [clienteId]);
      const total = countResult?.total || 0;
      
      // Obter chamados
      const chamados = await dbClient.query<Chamado>(sql, [clienteId, itensPorPagina, offset]);
      
      return {
        chamados,
        total,
        pagina,
        totalPaginas: Math.ceil(total / itensPorPagina)
      };
    } catch (error) {
      console.error('Erro ao buscar chamados por cliente:', error);
      return {
        chamados: [],
        total: 0,
        pagina: 1,
        totalPaginas: 0
      };
    }
  }
  
  // Buscar chamados por projeto
  static async buscarPorProjeto(
    projetoId: number,
    pagina: number = 1, 
    itensPorPagina: number = 10
  ): Promise<ResultadoConsulta> {
    // Se o banco de dados não estiver disponível, retorna dados simulados
    if (!dbClient.isAvailable()) {
      return this.getSimulatedResults(`projeto_${projetoId}`, pagina, itensPorPagina);
    }

    const offset = (pagina - 1) * itensPorPagina;
    
    // Consulta para obter total de resultados
    const countSql = `
      SELECT COUNT(*) as total
      FROM chamados
      WHERE projeto_id = ?
    `;
    
    // Consulta para obter os chamados
    const sql = `
      SELECT c.*, cl.nome as cliente_nome, p.nome as plantonista_nome, pr.sigla as projeto_sigla
      FROM chamados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN plantonistas p ON c.plantonista_id = p.id
      LEFT JOIN projetos pr ON c.projeto_id = pr.id
      WHERE c.projeto_id = ?
      ORDER BY c.data_hora DESC
      LIMIT ? OFFSET ?
    `;
    
    try {
      // Obter total de resultados
      const countResult = await dbClient.queryOne<{ total: number }>(countSql, [projetoId]);
      const total = countResult?.total || 0;
      
      // Obter chamados
      const chamados = await dbClient.query<Chamado>(sql, [projetoId, itensPorPagina, offset]);
      
      return {
        chamados,
        total,
        pagina,
        totalPaginas: Math.ceil(total / itensPorPagina)
      };
    } catch (error) {
      console.error('Erro ao buscar chamados por projeto:', error);
      return {
        chamados: [],
        total: 0,
        pagina: 1,
        totalPaginas: 0
      };
    }
  }
  
  // Buscar soluções para problemas similares
  static async buscarSolucoes(
    problema: string,
    pagina: number = 1, 
    itensPorPagina: number = 10
  ): Promise<ResultadoConsulta> {
    // Se o banco de dados não estiver disponível, retorna dados simulados
    if (!dbClient.isAvailable()) {
      return this.getSimulatedResults(`solucao_${problema}`, pagina, itensPorPagina);
    }

    const offset = (pagina - 1) * itensPorPagina;
    
    // Consulta para obter total de resultados
    const countSql = `
      SELECT COUNT(*) as total
      FROM chamados
      WHERE 
        descricao LIKE ? OR 
        analise LIKE ? OR 
        solucao LIKE ?
    `;
    
    const searchTerm = `%${problema}%`;
    const countParams = [searchTerm, searchTerm, searchTerm];
    
    // Consulta para obter os chamados
    const sql = `
      SELECT c.*, cl.nome as cliente_nome, p.nome as plantonista_nome, pr.sigla as projeto_sigla
      FROM chamados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN plantonistas p ON c.plantonista_id = p.id
      LEFT JOIN projetos pr ON c.projeto_id = pr.id
      WHERE 
        c.descricao LIKE ? OR 
        c.analise LIKE ? OR 
        c.solucao LIKE ?
      ORDER BY c.data_hora DESC
      LIMIT ? OFFSET ?
    `;
    
    const params = [
      ...countParams,
      itensPorPagina,
      offset
    ];
    
    try {
      // Obter total de resultados
      const countResult = await dbClient.queryOne<{ total: number }>(countSql, countParams);
      const total = countResult?.total || 0;
      
      // Obter chamados
      const chamados = await dbClient.query<Chamado>(sql, params);
      
      return {
        chamados,
        total,
        pagina,
        totalPaginas: Math.ceil(total / itensPorPagina)
      };
    } catch (error) {
      console.error('Erro ao buscar soluções:', error);
      return {
        chamados: [],
        total: 0,
        pagina: 1,
        totalPaginas: 0
      };
    }
  }
  
  // Dados simulados para desenvolvimento
  private static getSimulatedResults(
    termo: string, 
    pagina: number, 
    itensPorPagina: number
  ): ResultadoConsulta {
    // Gerar chamados simulados
    const chamados: Chamado[] = [];
    
    // Total simulado
    const total = 25;
    
    // Número de chamados a gerar
    const numChamados = Math.min(itensPorPagina, total - ((pagina - 1) * itensPorPagina));
    
    for (let i = 0; i < numChamados; i++) {
      const index = ((pagina - 1) * itensPorPagina) + i + 1;
      
      chamados.push({
        id: `RAC${index.toString().padStart(4, '0')}`,
        cliente_id: Math.floor(Math.random() * 3) + 1,
        plantonista_id: Math.floor(Math.random() * 7) + 1,
        categoria_id: Math.floor(Math.random() * 5) + 1,
        projeto_id: Math.floor(Math.random() * 3) + 1,
        data_hora: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        tipo: Math.random() > 0.5 ? 'Incidente' : 'Requisição',
        prioridade: ['Baixa', 'Média', 'Alta'][Math.floor(Math.random() * 3)],
        descricao: `Problema relacionado a ${termo} - ${index}`,
        ambiente: ['Produção', 'Homologação', 'Desenvolvimento'][Math.floor(Math.random() * 3)],
        tempo_ocorrencia: Math.floor(Math.random() * 120),
        analise: `Análise do problema ${termo} - ${index}`,
        procedimentos: `Procedimentos realizados para ${termo} - ${index}`,
        solucao: `Solução aplicada para ${termo} - ${index}`,
        status: ['Aberto', 'Pendente', 'Resolvido'][Math.floor(Math.random() * 3)],
        tempo_atendimento: Math.floor(Math.random() * 180),
        observacoes: `Observações sobre ${termo} - ${index}`,
        recomendacoes: `Recomendações para ${termo} - ${index}`,
        data_fechamento: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString() : undefined,
        criado_em: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        atualizado_em: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return {
      chamados,
      total,
      pagina,
      totalPaginas: Math.ceil(total / itensPorPagina)
    };
  }
}
