// src/lib/pdf-generator.ts
// Utilitário para geração de relatórios em PDF

import { Chamado } from './models/chamado';
import { Cliente } from './models/cliente';
import { Plantonista } from './models/plantonista';
import { Projeto } from './models/projeto';
import { RelatorioModel } from './models/relatorio';
import fs from 'fs';
import path from 'path';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';

// Importação dinâmica de WeasyPrint (será usada apenas no servidor)
let WeasyPrint: any;
if (typeof window === 'undefined') {
  try {
    // Simulação de importação do módulo WeasyPrint
    WeasyPrint = {
      generatePDF: async (html: string, options: any) => {
        // Em um ambiente real, isso usaria a biblioteca WeasyPrint
        // Aqui estamos apenas simulando a geração do PDF
        console.log('Gerando PDF com WeasyPrint...');
        return Buffer.from('PDF simulado');
      }
    };
  } catch (error) {
    console.error('Erro ao importar WeasyPrint:', error);
  }
}

// Interface para os dados do relatório
export interface RelatorioData {
  chamado: Chamado;
  cliente: Cliente;
  plantonista: Plantonista;
  projeto?: Projeto;
}

// Componente React para o template do relatório
function RelatorioTemplate(props: RelatorioData) {
  const { chamado, cliente, plantonista, projeto } = props;
  
  return createElement('html', null,
    createElement('head', null,
      createElement('meta', { charSet: 'utf-8' }),
      createElement('title', null, `RAC${chamado.id} - Relatório de Atendimento ao Cliente`),
      createElement('style', null, `
        body {
          font-family: "Noto Sans CJK SC", "WenQuanYi Zen Hei", sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 10px;
        }
        .logo {
          height: 60px;
        }
        .title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
        }
        .info-section {
          margin-bottom: 20px;
        }
        .info-section h2 {
          background-color: #0066cc;
          color: white;
          padding: 5px 10px;
          font-size: 16px;
          margin-bottom: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .info-item {
          margin-bottom: 5px;
        }
        .info-label {
          font-weight: bold;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
      `)
    ),
    createElement('body', null,
      createElement('div', { className: 'header' },
        createElement('img', { className: 'logo', src: '/static/img/logo_left.png', alt: 'Logo Esquerda' }),
        createElement('div', { className: 'title' }, 'RELATÓRIO DE ATENDIMENTO AO CLIENTE'),
        createElement('img', { className: 'logo', src: '/static/img/logo_right.png', alt: 'Logo Direita' })
      ),
      
      createElement('div', { className: 'info-section' },
        createElement('h2', null, 'INFORMAÇÕES DO CHAMADO'),
        createElement('div', { className: 'info-grid' },
          createElement('div', { className: 'info-item' },
            createElement('span', { className: 'info-label' }, 'Número do RAC: '),
            createElement('span', null, chamado.id)
          ),
          createElement('div', { className: 'info-item' },
            createElement('span', { className: 'info-label' }, 'Data/Hora: '),
            createElement('span', null, new Date(chamado.data_hora).toLocaleString('pt-BR'))
          ),
          createElement('div', { className: 'info-item' },
            createElement('span', { className: 'info-label' }, 'Cliente: '),
            createElement('span', null, cliente.nome)
          ),
          createElement('div', { className: 'info-item' },
            createElement('span', { className: 'info-label' }, 'Contato: '),
            createElement('span', null, cliente.contato || '-')
          ),
          createElement('div', { className: 'info-item' },
            createElement('span', { className: 'info-label' }, 'Projeto: '),
            createElement('span', null, projeto ? projeto.sigla : '-')
          ),
          createElement('div', { className: 'info-item' },
            createElement('span', { className: 'info-label' }, 'Status: '),
            createElement('span', null, chamado.status)
          ),
          createElement('div', { className: 'info-item full-width' },
            createElement('span', { className: 'info-label' }, 'Descrição: '),
            createElement('span', null, chamado.descricao)
          )
        )
      ),
      
      createElement('div', { className: 'info-section' },
        createElement('h2', null, 'ANÁLISE E SOLUÇÃO'),
        createElement('div', { className: 'info-grid' },
          createElement('div', { className: 'info-item full-width' },
            createElement('span', { className: 'info-label' }, 'Análise: '),
            createElement('span', null, chamado.analise || '-')
          ),
          createElement('div', { className: 'info-item full-width' },
            createElement('span', { className: 'info-label' }, 'Procedimentos: '),
            createElement('span', null, chamado.procedimentos || '-')
          ),
          createElement('div', { className: 'info-item full-width' },
            createElement('span', { className: 'info-label' }, 'Solução: '),
            createElement('span', null, chamado.solucao || '-')
          )
        )
      ),
      
      createElement('div', { className: 'info-section' },
        createElement('h2', null, 'INFORMAÇÕES ADICIONAIS'),
        createElement('div', { className: 'info-grid' },
          createElement('div', { className: 'info-item' },
            createElement('span', { className: 'info-label' }, 'Plantonista: '),
            createElement('span', null, plantonista.nome)
          ),
          createElement('div', { className: 'info-item' },
            createElement('span', { className: 'info-label' }, 'Tempo de Atendimento: '),
            createElement('span', null, chamado.tempo_atendimento ? `${chamado.tempo_atendimento} minutos` : '-')
          ),
          createElement('div', { className: 'info-item full-width' },
            createElement('span', { className: 'info-label' }, 'Observações: '),
            createElement('span', null, chamado.observacoes || '-')
          ),
          createElement('div', { className: 'info-item full-width' },
            createElement('span', { className: 'info-label' }, 'Recomendações: '),
            createElement('span', null, chamado.recomendacoes || '-')
          )
        )
      ),
      
      createElement('div', { className: 'footer' },
        createElement('p', null, `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`),
        createElement('p', null, 'Sistema de Gerenciamento de Chamados - © 2025')
      )
    )
  );
}

// Classe para geração de PDFs
export class PDFGenerator {
  // Diretório para salvar os PDFs
  private outputDir: string;
  
  constructor(outputDir: string = '/tmp/relatorios') {
    this.outputDir = outputDir;
    
    // Criar diretório se não existir
    if (typeof window === 'undefined' && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }
  
  // Gerar PDF para um chamado
  async generatePDF(data: RelatorioData): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Renderizar o template para HTML
      const html = renderToString(createElement(RelatorioTemplate, data));
      
      // Gerar o PDF
      if (!WeasyPrint) {
        return { 
          success: false, 
          error: 'WeasyPrint não disponível' 
        };
      }
      
      const pdfBuffer = await WeasyPrint.generatePDF(html, {
        pageSize: 'A4',
        marginTop: '1cm',
        marginRight: '1cm',
        marginBottom: '1cm',
        marginLeft: '1cm'
      });
      
      // Criar nome do arquivo
      const fileName = `${data.chamado.id}.pdf`;
      const filePath = path.join(this.outputDir, fileName);
      
      // Salvar o PDF
      fs.writeFileSync(filePath, pdfBuffer);
      
      // Registrar o relatório no banco de dados
      const relatorio = {
        chamado_id: data.chamado.id,
        caminho_pdf: filePath,
        data_geracao: new Date().toISOString(),
        enviado: false
      };
      
      await RelatorioModel.create(relatorio);
      
      return { 
        success: true, 
        filePath 
      };
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
}

// Instância singleton do gerador de PDF
export const pdfGenerator = new PDFGenerator();
