// src/lib/whatsapp-integration.ts
// Utilitário para integração com WhatsApp

import { Chamado } from './models/chamado';
import { Cliente } from './models/cliente';
import { Plantonista } from './models/plantonista';
import { Projeto } from './models/projeto';
import { RelatorioModel } from './models/relatorio';

// Interface para configuração do WhatsApp
export interface WhatsAppConfig {
  apiUrl: string;
  phoneNumber: string;
  apiKey?: string;
}

// Interface para mensagem do WhatsApp
export interface WhatsAppMessage {
  to: string;
  message: string;
  mediaUrl?: string;
}

// Classe para integração com WhatsApp
export class WhatsAppIntegration {
  private config: WhatsAppConfig;
  
  constructor(config: WhatsAppConfig) {
    this.config = config;
  }
  
  // Enviar mensagem via WhatsApp
  async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; error?: string }> {
    try {
      // Em um ambiente real, isso faria uma chamada à API do WhatsApp
      // Aqui estamos apenas simulando o envio
      console.log('Enviando mensagem via WhatsApp:', message);
      
      // Simular sucesso
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar mensagem via WhatsApp:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
  
  // Enviar relatório via WhatsApp
  async sendRelatorio(relatorioId: number, telefone: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Obter relatório
      const relatorio = await RelatorioModel.getById(relatorioId);
      if (!relatorio) {
        return { 
          success: false, 
          error: 'Relatório não encontrado' 
        };
      }
      
      // Enviar mensagem com o relatório
      const message: WhatsAppMessage = {
        to: telefone,
        message: `Relatório de Atendimento ao Cliente - ${relatorio.chamado_id}`,
        mediaUrl: relatorio.caminho_pdf
      };
      
      const result = await this.sendMessage(message);
      
      // Se o envio for bem-sucedido, atualizar o relatório
      if (result.success) {
        await RelatorioModel.marcarComoEnviado(relatorioId, 'whatsapp');
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao enviar relatório via WhatsApp:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
  
  // Processar mensagem recebida do WhatsApp
  async processIncomingMessage(from: string, message: string): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      // Verificar se é um comando para novo chamado
      if (message.toLowerCase().trim() === 'novo chamado') {
        return {
          success: true,
          response: 'Iniciando registro de novo chamado. Por favor, informe o nome do cliente:'
        };
      }
      
      // Verificar se é um comando de consulta
      if (message.toLowerCase().startsWith('consultar ')) {
        const termo = message.substring('consultar '.length).trim();
        return {
          success: true,
          response: `Buscando chamados com o termo "${termo}"...`
        };
      }
      
      // Verificar se é um comando para buscar cliente
      if (message.toLowerCase().startsWith('cliente ')) {
        const nomeCliente = message.substring('cliente '.length).trim();
        return {
          success: true,
          response: `Buscando chamados do cliente "${nomeCliente}"...`
        };
      }
      
      // Verificar se é um comando para buscar projeto
      if (message.toLowerCase().startsWith('projeto ')) {
        const sigla = message.substring('projeto '.length).trim();
        return {
          success: true,
          response: `Buscando chamados do projeto "${sigla}"...`
        };
      }
      
      // Verificar se é um comando para buscar solução
      if (message.toLowerCase().startsWith('solução ') || message.toLowerCase().startsWith('solucao ')) {
        const problema = message.toLowerCase().startsWith('solução ') 
          ? message.substring('solução '.length).trim()
          : message.substring('solucao '.length).trim();
        return {
          success: true,
          response: `Buscando soluções para "${problema}"...`
        };
      }
      
      // Mensagem não reconhecida
      return {
        success: true,
        response: 'Comando não reconhecido. Comandos disponíveis: "Novo chamado", "consultar [termo]", "cliente [nome]", "projeto [sigla]", "solução [problema]"'
      };
    } catch (error) {
      console.error('Erro ao processar mensagem do WhatsApp:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
}

// Instância singleton da integração com WhatsApp
export const whatsappIntegration = new WhatsAppIntegration({
  apiUrl: 'https://api.whatsapp.com/send',
  phoneNumber: '+5511977123444'
});
