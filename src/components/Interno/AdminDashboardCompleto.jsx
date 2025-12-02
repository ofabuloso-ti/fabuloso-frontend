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
const COLORS = [
  '#FF0000', // Vermelho
  '#0066FF', // Azul
  '#00AA00', // Verde
  '#FF8800', // Laranja
  '#AA00FF', // Roxo
  '#00CCC0', // Turquesa
  '#CC00AA', // Magenta
  '#7755FF', // Azul claro
  '#009944', // Verde escuro
  '#CC6600', // Marrom alaranjado
];

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

      // cria a base do dia com TODOS motivos zerados
      if (!mapa[dia]) {
        mapa[dia] = { data: dia };
        MOTIVOS_CANCELAMENTO.forEach((m) => (mapa[dia][m] = 0));
      }

      // soma valores reais
      rel.cancelamentos?.forEach((c) => {
        const motivo = c.motivo_cancelamento;
        if (MOTIVOS_CANCELAMENTO.includes(motivo)) {
          mapa[dia][motivo] += 1;
        }
      });
    });

    return Object.values(mapa).sort((a, b) => (a.data > b.data ? 1 : -1));
  }, [relatorios]);

  // ------------- EXTRAÇÃO DAS CHAVES (motivos) -------------

  // -------------------- Cancelamentos de HOJE --------------------
  const cancelamentosHoje = useMemo(() => {
    const hoje =
      relatorios.length > 0
        ? dayjs(relatorios[0].data).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');

    const mapa = {};

    relatorios.forEach((rel) => {
      const dia = dayjs(rel.data).format('YYYY-MM-DD');
      if (dia === hoje && Array.isArray(rel.cancelamentos)) {
        rel.cancelamentos.forEach((c) => {
          const motivo = c.motivo_cancelamento || 'Não informado';
          mapa[motivo] = (mapa[motivo] || 0) + 1;
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

    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [relatorios]);

  // -------------------- Histórico de Não Conformidades (por motivo) --------------------
  const errosHistoricoData = useMemo(() => {
    const mapa = {};

    relatorios.forEach((rel) => {
      const dia = dayjs(rel.data).format('YYYY-MM-DD');

      // cria objeto base com todos os motivos zerados
      if (!mapa[dia]) {
        mapa[dia] = { data: dia };
        MOTIVOS_NC.forEach((m) => (mapa[dia][m] = 0));
      }

      // soma quantidades reais
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
  // ========================   JSX   ==============================
  // ==============================================================

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-[#641305]">
        Dashboard
      </h2>

      {/* -------------------- Filtro de Lojas -------------------- */}
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
                {loja.nome || loja.name || loja.titulo || `Loja ${loja.id}`}
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

      {/* -------------------- Cards Rápidos -------------------- */}
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
          { title: 'Total de Lojas', value: lojas.length, color: '#d20000' },
          {
            title: 'Faturamento Total',
            value: moeda(
              faturamentoData.reduce((sum, f) => sum + f.faturamento, 0),
            ),
            color: '#2a9d8f',
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center"
          >
            <h3 className="text-gray-700 text-md sm:text-lg font-semibold mb-2">
              {card.title}
            </h3>
            <p
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: card.color }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* -------------------- Gráficos -------------------- */}
      <div className="flex flex-col gap-6 mb-10">
        {/* -------- Faturamento Diário -------- */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
            Faturamento Diário
          </h3>
          <div className="min-w-[600px] sm:min-w-full">
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
                      stroke={COLORS[i % COLORS.length]}
                      name={motivo}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
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

        {/* -------- CANCELAMENTOS POR DIA (Linha) -------- */}
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
                      stroke={COLORS[i % COLORS.length]}
                      name={motivo}
                      dot={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* -------- CANCELAMENTOS HOJE (PIE) -------- */}
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* -------- Erros do dia -------- */}
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* -------- Histórico Não Conformidades -------- */}
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
                {MOTIVOS_NC.map((motivo, i) => (
                  <Line
                    key={motivo}
                    type="monotone"
                    dataKey={motivo}
                    stroke={COLORS[i % COLORS.length]}
                    name={motivo}
                  />
                ))}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardCompleto;
