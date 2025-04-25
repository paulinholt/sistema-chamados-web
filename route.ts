import { NextRequest, NextResponse } from 'next/server';

// Simulação de banco de dados em memória
let chamados = [
  {
    id_chamado: 'RAC0001',
    cliente: 'Empresa Teste',
    contato: 'Contato Teste',
    descricao: 'Sistema fora do ar para testes',
    projeto_sigla: 'TST',
    data_hora: '2025-04-24T10:30:00',
    status: 'Resolvido',
    plantonista: 'Aurélio',
    analise: 'Servidor travado durante testes',
    solucao: 'Reinicialização do servidor resolveu o problema',
    tempo_atendimento: 120
  }
];

// Listar todos os chamados
export async function GET(request: NextRequest) {
  // Parâmetros de consulta para filtros
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const projeto = searchParams.get('projeto');
  const query = searchParams.get('q');
  
  let filteredChamados = [...chamados];
  
  // Aplicar filtros se fornecidos
  if (status) {
    filteredChamados = filteredChamados.filter(chamado => 
      chamado.status.toLowerCase() === status.toLowerCase()
    );
  }
  
  if (projeto) {
    filteredChamados = filteredChamados.filter(chamado => 
      chamado.projeto_sigla.toLowerCase() === projeto.toLowerCase()
    );
  }
  
  if (query) {
    filteredChamados = filteredChamados.filter(chamado => 
      chamado.descricao.toLowerCase().includes(query.toLowerCase()) ||
      chamado.cliente.toLowerCase().includes(query.toLowerCase()) ||
      chamado.id_chamado.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  return NextResponse.json({ 
    status: 'success',
    chamados: filteredChamados
  });
}

// Criar novo chamado
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validação básica
    if (!data.cliente || !data.descricao) {
      return NextResponse.json({ 
        status: 'error',
        message: 'Cliente e descrição são obrigatórios'
      }, { status: 400 });
    }
    
    // Gerar ID sequencial
    const nextId = chamados.length > 0 
      ? parseInt(chamados[chamados.length - 1].id_chamado.replace('RAC', '')) + 1 
      : 1;
    
    const novoChamado = {
      id_chamado: `RAC${nextId.toString().padStart(4, '0')}`,
      data_hora: new Date().toISOString(),
      status: 'Aberto',
      ...data
    };
    
    chamados.push(novoChamado);
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Chamado criado com sucesso',
      chamado: novoChamado
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Erro ao processar a requisição'
    }, { status: 500 });
  }
}
