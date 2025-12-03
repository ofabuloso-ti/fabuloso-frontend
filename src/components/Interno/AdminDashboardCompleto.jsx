// src/components/AdminDashboardCompleto.jsx
import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import djangoApi from '../../api/djangoApi';

// Cores MUITO diferentes e fortes
const COLORS = [
  '#FF0000', // vermelho
  '#0055FF', // azul
  '#00AA22', // verde
  '#FF8800', // laranja
  '#AA00FF', // roxo
  '#00DDD0', // turquesa
  '#DD00AA', // magenta
  '#2222FF', // azul escuro
  '#009977', // verde oceano
  '#FF5599', // rosa
];

// Lista fixa de motivos de cancelamento — sempre aparecem
const MOTIVOS_CANCELAMENTO = [
  'Pedido duplicado',
  'Erro no sistema',
  'Cliente desistiu',
  'Produto indisponível',
  'Produto incorreto',
  'Atraso na entrega',
  'Problema de qualidade',
  'Pedido fraudulento',
  'Erro no cadastro do cliente',
  'Política interna / ajuste operacional',
];

// Não conformidades (já estavam certas)
const MOTIVOS_NC = [
  'Salgados amassado',
  'Salgados mal empanados',
  'Salgado encharcado',
  'Salgado queimado',
  'Salgado estourado',
  'Salgado mal frito',
  'Pastel grudado',
  'Pastel estourado',
  'Pastel queimado',
];

const AdminDashboardCompleto = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [vendasData, setVendasData] = useState([]);
  const [faturamentoData, setFaturamentoData] = useState([]);
  const [selectedLoja, setSelectedLoja] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarFaturamento, setMostrarFaturamento] = useState(false);

  const moeda = (valor) =>
    (Number(valor) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  const asStrDate = (d) => dayjs(d).format('YYYY-MM-DD');

  // -------------------- Buscar Lojas --------------------
  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const res = await djangoApi.get('/lojas/');
        const lista = Array.isArray(res.data) ? res.data : [];
        setLojas(lista);

        if (!selectedLoja && lista.length > 0) {
          setSelectedLoja(String(lista[0].id));
        }
      } catch (err) {
        console.error('Erro ao buscar lojas:', err);
        setLojas([]);
      }
    };
    fetchLojas();
  }, []);

  // -------------------- Buscar Dados --------------------
  useEffect(() => {
    const fetchAll = async () => {
      if (!selectedLoja) return;

      setLoading(true);
      try {
        const [relRes, usrRes, venRes, fatRes] = await Promise.all([
          djangoApi.get(`/relatorios-diarios/?loja=${selectedLoja}`),
          djangoApi.get('/users/'),
          djangoApi.get(`/vendas/?loja=${selectedLoja}`),
          djangoApi.get(`/faturamento/?loja=${selectedLoja}`),
        ]);

        let rels = Array.isArray(relRes.data) ? relRes.data : [];

        rels = rels.filter((r) => {
          const lojaId = r?.loja?.id || r?.loja;
          return String(lojaId) === String(selectedLoja);
        });

        setRelatorios(rels);
        setUsuarios(Array.isArray(usrRes.data) ? usrRes.data : []);

        // ----------- Vendas por dia -----------
        const vendasRaw = Array.isArray(venRes.data) ? venRes.data : [];
        const vendasPorDia = {};

        vendasRaw.forEach((v) => {
          const dia = asStrDate(v.data);
          if (!vendasPorDia[dia])
            vendasPorDia[dia] = { data: dia, porta: 0, entrega: 0 };

          if (typeof v.porta === 'number' || typeof v.entrega === 'number') {
            vendasPorDia[dia].porta += Number(v.porta) || 0;
            vendasPorDia[dia].entrega += Number(v.entrega) || 0;
          } else if (v.tipo && typeof v.total !== 'undefined') {
            if (v.tipo === 'porta_a_porta')
              vendasPorDia[dia].porta += Number(v.total) || 0;
            if (v.tipo === 'entrega')
              vendasPorDia[dia].entrega += Number(v.total) || 0;
          }
        });

        setVendasData(
          Object.values(vendasPorDia).sort((a, b) =>
            a.data > b.data ? 1 : -1,
          ),
        );

        // ----------- Faturamento por dia -----------
        const fatRaw = Array.isArray(fatRes.data) ? fatRes.data : [];
        setFaturamentoData(
          fatRaw.map((i) => ({
            data: asStrDate(i.data),
            faturamento: Number(i.faturamento) || 0,
          })),
        );
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [selectedLoja]);

  // -------------------- Cancelamentos por Dia --------------------
  const cancelamentosPorDia = useMemo(() => {
    const mapa = {};

    relatorios.forEach((rel) => {
      const dia = dayjs(rel.data).format('YYYY-MM-DD');

      // base zerada com TODOS motivos
      if (!mapa[dia]) {
        mapa[dia] = { data: dia };
        MOTIVOS_CANCELAMENTO.forEach((m) => (mapa[dia][m] = 0));
      }

      // soma reais
      rel.cancelamentos?.forEach((c) => {
        const motivo = c.motivo_cancelamento;
        if (MOTIVOS_CANCELAMENTO.includes(motivo)) {
          mapa[dia][motivo] += 1;
        }
      });
    });

    return Object.values(mapa).sort((a, b) => (a.data > b.data ? 1 : -1));
  }, [relatorios]);

  // As chaves são fixas — nunca dá erro
  const todasAsChavesCancelamento = MOTIVOS_CANCELAMENTO;

  // -------------------- Cancelamentos de HOJE --------------------
  const cancelamentosHoje = useMemo(() => {
    const hoje =
      relatorios.length > 0
        ? dayjs(relatorios[0].data).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');

    const mapa = {};

    MOTIVOS_CANCELAMENTO.forEach((m) => (mapa[m] = 0));

    relatorios.forEach((rel) => {
      if (dayjs(rel.data).format('YYYY-MM-DD') === hoje) {
        rel.cancelamentos?.forEach((c) => {
          const motivo = c.motivo_cancelamento;
          if (MOTIVOS_CANCELAMENTO.includes(motivo)) {
            mapa[motivo] += 1;
          }
        });
      }
    });

    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [relatorios]);

  // -------------------- Prejuízo --------------------
  const prejuizoTotal30Dias = useMemo(() => {
    const limite = dayjs().subtract(30, 'day');
    let total = 0;

    relatorios.forEach((rel) => {
      if (dayjs(rel.data).isAfter(limite)) {
        rel.cancelamentos?.forEach((c) => {
          if (c.gerou_prejuizo) total += Number(c.valor_prejuizo) || 0;
        });
      }
    });

    return total;
  }, [relatorios]);

  // -------------------- Status --------------------
  const pieData = useMemo(() => {
    const porStatus = relatorios.reduce((acc, rel) => {
      const key = rel.status || 'Indefinido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(porStatus).map(([name, value]) => ({
      name,
      value,
    }));
  }, [relatorios]);

  // -------------------- Erro do dia --------------------
  const erroHoje = useMemo(() => {
    const hoje =
      relatorios.length > 0
        ? dayjs(relatorios[0].data).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');

    const relHoje = relatorios.find(
      (r) => dayjs(r.data).format('YYYY-MM-DD') === hoje,
    );

    return relHoje?.erros_detalhes || null;
  }, [relatorios]);

  // -------------------- Não Conformidades HOJE --------------------
  const errosDataHoje = useMemo(() => {
    const hoje =
      relatorios.length > 0
        ? dayjs(relatorios[0].data).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');

    const mapa = {};

    relatorios.forEach((rel) => {
      if (dayjs(rel.data).format('YYYY-MM-DD') === hoje) {
        rel.nao_conformidades?.forEach((n) => {
          mapa[n.item_nao_conforme] =
            (mapa[n.item_nao_conforme] || 0) + Number(n.quantidade || 0);
        });
      }
    });

    return Object.entries(mapa).map(([name, value]) => ({
      name,
      value,
    }));
  }, [relatorios]);

  // -------------------- Histórico Não Conformidades --------------------
  const errosHistoricoData = useMemo(() => {
    const mapa = {};

    relatorios.forEach((rel) => {
      const dia = dayjs(rel.data).format('YYYY-MM-DD');

      if (!mapa[dia]) {
        mapa[dia] = { data: dia };
        MOTIVOS_NC.forEach((m) => (mapa[dia][m] = 0));
      }

      rel.nao_conformidades?.forEach((n) => {
        const motivo = n.item_nao_conforme;
        const qtd = Number(n.quantidade) || 0;

        if (motivo && mapa[dia][motivo] !== undefined) {
          mapa[dia][motivo] += qtd;
        }
      });
    });

    return Object.values(mapa).sort((a, b) => (a.data > b.data ? 1 : -1));
  }, [relatorios]);

  // ==============================================================

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-[#641305]">
        Dashboard
      </h2>

      {/* -------------------- Filtro -------------------- */}
      <div className="mb-6 flex justify-center">
        <select
          className="p-2 border rounded-lg shadow min-w-[180px]"
          value={selectedLoja}
          onChange={(e) => setSelectedLoja(String(e.target.value))}
        >
          {lojas.length === 0 ? (
            <option value="" disabled>
              Carregando lojas...
            </option>
          ) : (
            lojas.map((loja) => (
              <option key={loja.id} value={String(loja.id)}>
                {loja.nome}
              </option>
            ))
          )}
        </select>
      </div>

      {loading && (
        <div className="mb-6 text-center text-sm text-gray-500">
          Atualizando dados da loja #{selectedLoja}...
        </div>
      )}

      {/* -------------------- Cards -------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              title: 'Total de Relatórios',
              value: relatorios.length,
              color: '#d20000',
            },
            {
              title: 'Total de Funcionários',
              value: usuarios.length,
              color: '#d20000',
            },
            {
              title: 'Total de Lojas',
              value: lojas.length,
              color: '#d20000',
            },
            {
              title: 'Faturamento Total',
              isMoney: true,
              value: faturamentoData.reduce((sum, f) => sum + f.faturamento, 0),
              color: '#2a9d8f',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center"
            >
              <h3 className="text-gray-700 text-md sm:text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                {card.title}

                {/* ÍCONE OLHO */}
                {card.isMoney && (
                  <button
                    onClick={() => setMostrarFaturamento(!mostrarFaturamento)}
                    className="transition"
                  >
                    {mostrarFaturamento ? (
                      // Ícone "olho aberto"
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-700 hover:text-gray-900"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      // Ícone "olho fechado"
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-700 hover:text-gray-900"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.223-3.592M9.88 9.88a3 3 0 104.24 4.24M6.18 6.18L3 3m18 18l-3.18-3.18"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </h3>

              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: card.color }}
              >
                {card.isMoney
                  ? mostrarFaturamento
                    ? moeda(card.value) // mostra valor real
                    : '••••••••' // ocultado
                  : card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- Gráficos -------------------- */}
      <div className="flex flex-col gap-6 mb-10">
        {/* -------- Faturamento Diário -------- */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
            Faturamento Diário
          </h3>
          <div className="min-w-[600px] sm:min-w-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={faturamentoData}>
                <XAxis dataKey="data" stroke="#d20000" />
                <YAxis stroke="#d20000" />
                <Tooltip formatter={(v) => moeda(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="faturamento"
                  stroke="#f4a261"
                  name="Faturamento"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------- Vendas Diário -------- */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
            Vendas Retiradas e Entregas por Dia
          </h3>
          <div className="min-w-[600px] sm:min-w-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vendasData}>
                <XAxis dataKey="data" stroke="#d20000" />
                <YAxis allowDecimals={false} stroke="#d20000" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="porta"
                  stroke="#d20000"
                  name="Retirada"
                />
                <Line
                  type="monotone"
                  dataKey="entrega"
                  stroke="#2a9d8f"
                  name="Entrega"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------- CANCELAMENTOS POR DIA -------- */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
            Cancelamentos por Dia
          </h3>

          {cancelamentosPorDia.length === 0 ? (
            <p className="text-center text-gray-500">
              Nenhum cancelamento registrado.
            </p>
          ) : (
            <div className="min-w-[600px] sm:min-w-full">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cancelamentosPorDia}>
                  <XAxis dataKey="data" stroke="#d20000" />
                  <YAxis allowDecimals={false} stroke="#d20000" />
                  <Tooltip />
                  <Legend />

                  {MOTIVOS_CANCELAMENTO.map((motivo, i) => (
                    <Line
                      key={motivo}
                      type="monotone"
                      dataKey={motivo}
                      stroke={COLORS[i]}
                      name={motivo}
                      dot={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* -------- CANCELAMENTOS HOJE -------- */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
            Cancelamentos de Hoje
          </h3>
          {cancelamentosHoje.length === 0 ? (
            <p className="text-center text-gray-500">
              Nenhum cancelamento registrado hoje 🎉
            </p>
          ) : (
            <div className="min-w-[400px] sm:min-w-full">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={cancelamentosHoje}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {cancelamentosHoje.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* -------- Erros -------- */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
            Erros do Dia
          </h3>
          {erroHoje ? (
            <div className="p-4 border border-gray-300 rounded-md bg-gray-50 whitespace-pre-line">
              {erroHoje}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Nenhum erro registrado hoje.
            </p>
          )}
        </div>

        {/* -------- Não Conformidades HOJE -------- */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
            Não Conformidades (Hoje)
          </h3>

          {errosDataHoje.length === 0 ? (
            <p className="text-center text-gray-500">Não houve erros hoje 🎉</p>
          ) : (
            <div className="min-w-[400px] sm:min-w-full">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={errosDataHoje}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {errosDataHoje.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* -------- Histórico NC -------- */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
            Histórico de Não Conformidades
          </h3>
          {errosHistoricoData.length === 0 ? (
            <p className="text-center text-gray-500">
              Nenhum erro registrado até agora.
            </p>
          ) : (
            <div className="min-w-[600px] sm:min-w-full">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={errosHistoricoData}>
                  <XAxis dataKey="data" stroke="#d20000" />
                  <YAxis allowDecimals={false} stroke="#d20000" />
                  <Tooltip />
                  <Legend />

                  {MOTIVOS_NC.map((motivo, i) => (
                    <Line
                      key={motivo}
                      type="monotone"
                      dataKey={motivo}
                      stroke={COLORS[i]}
                      name={motivo}
                      dot={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardCompleto;
