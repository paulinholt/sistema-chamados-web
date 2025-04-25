// src/lib/db.ts
// Utilitário para interação com o banco de dados Cloudflare D1

import { D1Database } from '@cloudflare/workers-types';

// Interface para o contexto do Cloudflare
export interface CloudflareContext {
  DB: D1Database;
}

// Função para obter o contexto do Cloudflare
export function getCloudflareContext(): CloudflareContext | null {
  // @ts-ignore - Acesso ao contexto global do Cloudflare
  const ctx = process.env.CLOUDFLARE_CONTEXT;
  if (!ctx) return null;
  return ctx as CloudflareContext;
}

// Classe para interação com o banco de dados
export class DatabaseClient {
  private db: D1Database | null = null;

  constructor() {
    const ctx = getCloudflareContext();
    if (ctx) {
      this.db = ctx.DB;
    }
  }

  // Verifica se o banco de dados está disponível
  isAvailable(): boolean {
    return this.db !== null;
  }

  // Executa uma consulta SQL
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      console.warn('Banco de dados não disponível, usando dados simulados');
      return [];
    }

    try {
      const result = await this.db.prepare(sql).bind(...params).all();
      return result.results as T[];
    } catch (error) {
      console.error('Erro ao executar consulta SQL:', error);
      throw error;
    }
  }

  // Executa uma consulta SQL e retorna um único resultado
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) {
      console.warn('Banco de dados não disponível, usando dados simulados');
      return null;
    }

    try {
      const result = await this.db.prepare(sql).bind(...params).first();
      return result as T;
    } catch (error) {
      console.error('Erro ao executar consulta SQL:', error);
      throw error;
    }
  }

  // Executa uma consulta SQL de modificação (INSERT, UPDATE, DELETE)
  async execute(sql: string, params: any[] = []): Promise<{ success: boolean; lastInsertId?: number; changes?: number }> {
    if (!this.db) {
      console.warn('Banco de dados não disponível, usando dados simulados');
      return { success: false };
    }

    try {
      const result = await this.db.prepare(sql).bind(...params).run();
      return { 
        success: true, 
        lastInsertId: result.meta?.last_row_id,
        changes: result.meta?.changes
      };
    } catch (error) {
      console.error('Erro ao executar SQL:', error);
      throw error;
    }
  }
}

// Instância singleton do cliente de banco de dados
export const dbClient = new DatabaseClient();
