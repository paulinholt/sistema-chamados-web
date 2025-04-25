import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalChamados: 0,
    chamadosAbertos: 0,
    chamadosFechados: 0,
    chamadosHoje: 0
  });

  useEffect(() => {
    // Simulação de dados - em produção, isso viria de uma API
    setStats({
      totalChamados: 142,
      chamadosAbertos: 23,
      chamadosFechados: 119,
      chamadosHoje: 5
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-gray-500 text-sm font-medium">Total de Chamados</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.totalChamados}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-gray-500 text-sm font-medium">Chamados Abertos</h2>
          <p className="text-3xl font-bold text-green-600">{stats.chamadosAbertos}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-gray-500 text-sm font-medium">Chamados Fechados</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.chamadosFechados}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-gray-500 text-sm font-medium">Chamados Hoje</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.chamadosHoje}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Chamados Recentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">RAC0142</td>
                <td className="px-6 py-4 whitespace-nowrap">Empresa ABC</td>
                <td className="px-6 py-4 whitespace-nowrap">PROJ-01</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Concluído</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">24/04/2025</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">RAC0141</td>
                <td className="px-6 py-4 whitespace-nowrap">Empresa XYZ</td>
                <td className="px-6 py-4 whitespace-nowrap">PROJ-02</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Em andamento</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">23/04/2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
