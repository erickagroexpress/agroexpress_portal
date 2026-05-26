import { useState } from 'react'

import { useEffect, useMemo, useState } from 'react'

export default function AgroExpressPortal() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  const [busca, setBusca] = useState('')
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbwA8byyMD4HwkXxDfV0VX1YTIfZ_2mnUlGQJcacjm4y4ZnZx9eSuD0m7ozF4WwGcdzMhg/exec'
        )

        const data = await response.json()

        const produtosFormatados = data.map((item, index) => ({
          id: index + 1,
          produto: item.PRODUTO || item.Produto || 'Sem nome',
          estoque: Number(item.QNTD || item.ESTOQUE || 0),
          validade: item.VALIDADE || '-',
          preco: item.PREÇO || item.PRECO || '-',
          menorPreco: item['MENOR PREÇO'] || item.MENOR_PRECO || '-',
          marca: item.MARCA || '-',
          empresa: item.EMPRESA || '-',
          ingrediente: item['INGREDIENTE ATIVO'] || item.INGREDIENTE || '-',
          finalidade:
            item['INFO SOBRE O PROD.'] || item.FINALIDADE || '-',
          similares: item.SIMILARES
            ? String(item.SIMILARES).split(',')
            : [],
          status: validarStatus(item.VALIDADE)
        }))

        setProdutos(produtosFormatados)
      } catch (error) {
        console.error(error)
        setErro(true)
      } finally {
        setCarregando(false)
      }
    }

    carregarProdutos()
  }, [])

  function validarStatus(validade) {
    if (!validade) return 'ok'

    const texto = String(validade).toLowerCase()

    if (texto.includes('26')) return 'vencendo'
    if (texto.includes('27')) return 'alerta'

    return 'ok'
  }

  const produtosFiltrados = produtos.filter((item) =>
    item.produto.toLowerCase().includes(busca.toLowerCase()) ||
    item.marca.toLowerCase().includes(busca.toLowerCase()) ||
    item.ingrediente.toLowerCase().includes(busca.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-700'
      case 'alerta':
        return 'bg-yellow-100 text-yellow-700'
      case 'vencendo':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-green-800 rounded-3xl p-8 text-white shadow-2xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">AGROEXPRESS</h1>
              <p className="text-green-100 mt-2 text-lg">
                Portal Comercial de Estoque e Preços
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-green-100">Última atualização</p>
              <p className="text-xl font-semibold">26/05/2026 - 08:12</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <p className="text-gray-500 text-sm">Produtos</p>
            <h2 className="text-3xl font-bold mt-2">{produtos.length}</h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <p className="text-gray-500 text-sm">Estoque Total</p>
            <h2 className="text-3xl font-bold mt-2">
              {produtos
                .reduce((acc, item) => acc + Number(item.estoque || 0), 0)
                .toLocaleString('pt-BR')}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-yellow-400">
            <p className="text-gray-500 text-sm">Validade Atenção</p>
            <h2 className="text-3xl font-bold mt-2">
              {produtos.filter((item) => item.status === 'alerta').length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Vencendo</p>
            <h2 className="text-3xl font-bold mt-2">
              {produtos.filter((item) => item.status === 'vencendo').length}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Consulta Rápida
              </h2>
              <p className="text-gray-500">
                Busque produtos, marcas ou empresas
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Buscar produto, ingrediente ou marca..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-green-700"
              />

              <select className="border border-gray-300 rounded-xl px-4 py-3">
                <option>Todas Marcas</option>
                <option>BAYER</option>
                <option>SML</option>
                <option>CORTEVA</option>
              </select>
            </div>
          </div>

          {carregando && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-2xl mb-6 font-semibold">
              Carregando produtos da planilha...
            </div>
          )}

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 font-semibold">
              Erro ao conectar com a planilha Google.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-800 text-white text-left">
                  <th className="p-4 rounded-l-2xl">Produto</th>
                  <th className="p-4">Estoque</th>
                  <th className="p-4">Validade</th>
                  <th className="p-4">Maior Preço</th>
                  <th className="p-4">Menor Preço</th>
                  <th className="p-4">Marca</th>
                  <th className="p-4">Empresa</th>
                  <th className="p-4 rounded-r-2xl">Status</th>
                </tr>
              </thead>

              <tbody>
                {produtosFiltrados.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-green-50 transition cursor-pointer"
                    onClick={() => setProdutoSelecionado(item)}
                  >
                    <td className="p-4 font-semibold text-gray-800">
                      {item.produto}
                    </td>

                    <td className="p-4 text-gray-700">
                      {item.estoque.toLocaleString('pt-BR')}
                    </td>

                    <td className="p-4 text-gray-700">
                      {item.validade}
                    </td>

                    <td className="p-4 font-bold text-green-700">
                      {item.preco}
                    </td>

                    <td className="p-4 font-bold text-red-600">
                      {item.menorPreco}
                    </td>

                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {item.marca}
                      </span>
                    </td>

                    <td className="p-4 text-gray-700">
                      {item.empresa}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(item.status)}`}
                      >
                        {item.status === 'ok'
                          ? 'OK'
                          : item.status === 'alerta'
                          ? 'ATENÇÃO'
                          : 'VENCENDO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {produtoSelecionado && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-2 border-green-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {produtoSelecionado.produto}
                </h2>
                <p className="text-gray-500 mt-1">
                  Informações técnicas do produto
                </p>
              </div>

              <button
                onClick={() => setProdutoSelecionado(null)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-2 text-green-800">
                  Ingrediente Ativo
                </h3>
                <p className="text-gray-700 text-lg">
                  {produtoSelecionado.ingrediente}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-2 text-green-800">
                  Para que serve
                </h3>
                <p className="text-gray-700 text-lg">
                  {produtoSelecionado.finalidade}
                </p>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
              <h3 className="font-bold text-lg mb-4 text-yellow-800">
                Produtos Similares
              </h3>

              <div className="flex flex-wrap gap-3">
                {produtoSelecionado.similares.map((similar, index) => (
                  <span
                    key={index}
                    className="bg-yellow-200 text-yellow-900 px-4 py-2 rounded-full font-semibold"
                  >
                    {similar}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <h3 className="font-bold text-lg mb-3 text-blue-800">
                Integração futura com Agrolink
              </h3>

              <p className="text-gray-700 leading-relaxed">
                O sistema poderá puxar automaticamente:
                bula, culturas registradas, classificação toxicológica,
                dosagem média, modo de ação e informações técnicas
                diretamente da base Agrolink.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Produtos Mais Buscados
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4">
                <div>
                  <p className="font-semibold">CONNECT</p>
                  <p className="text-sm text-gray-500">SML</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-700">592</p>
                  <p className="text-sm text-gray-500">unidades</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4">
                <div>
                  <p className="font-semibold">COSAVET</p>
                  <p className="text-sm text-gray-500">CORTEVA</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-700">10.799</p>
                  <p className="text-sm text-gray-500">unidades</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Próximas Melhorias
            </h3>

            <div className="space-y-3">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                ✅ Integração automática com SIAGRI
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                ✅ Login para vendedores
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                ✅ Dashboard comercial
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                ✅ Alertas automáticos de validade
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
