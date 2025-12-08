// src/components/FuncionarioDashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import djangoApi from '../../api/djangoApi';
import dayjs from 'dayjs';
import logoDesktop from '/assets/home/logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HeaderFuncionario from './HeaderFuncionario';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#641305', '#a8382e', '#e76f51', '#f4a261', '#2a9d8f'];

const FuncionarioDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ⬅️ AQUI: se veio via navigate(state: { tab })
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await djangoApi.get('/relatorios-diarios/');
      setRelatorios(response.data);
    } catch (err) {
      setError('Erro ao carregar relatórios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatarDataPorExtenso = (dataString) =>
    dayjs(dataString).format('DD/MM/YYYY');

  const podeEditarRelatorio = (dataString) => {
    const reportDayjs = dayjs(dataString);
    const now = dayjs();
    return now.diff(reportDayjs, 'hour') < 24;
  };

  const handleRealizarInventario = () => {
    navigate('/relatorio');
  };

  const handleAtualizarInventario = (id) => {
    const relatorioParaEditar = relatorios.find((r) => r.id === id);
    if (!relatorioParaEditar) return;

    navigate('/relatorio', {
      state: { existingRelatorio: relatorioParaEditar },
    });
  };

  // ------------------ PDF (permanece igual) ------------------
  const gerarPdfRelatorio = async (relatorioId) => {
    try {
      const { data: detalhe } = await djangoApi.get(
        `/relatorios-diarios/${relatorioId}/`,
      );

      const lojaNome = detalhe?.loja?.nome || `Loja #${detalhe?.loja}`;
      const dataRelatorio = detalhe?.data
        ? dayjs(detalhe.data).format('DD/MM/YYYY HH:mm')
        : '—';
      const responsavel = detalhe?.responsavel_username || '—';
      const status = detalhe?.status || '—';

      const doc = new jsPDF();
      doc.setFillColor(100, 19, 5);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('Relatório Diário', 14, 18);

      const toDataURL = (url) =>
        fetch(url)
          .then((r) => r.blob())
          .then(
            (b) =>
              new Promise((res) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result);
                reader.readAsDataURL(b);
              }),
          );

      try {
        const imgData = await toDataURL(logoDesktop);
        doc.addImage(imgData, 'PNG', 170, 6, 30, 18);
      } catch {}

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(11);

      const yStart = 36;
      doc.text(`Loja: ${lojaNome}`, 14, yStart);
      doc.text(`Responsável: ${responsavel}`, 14, yStart + 6);
      doc.text(`Status: ${status}`, 14, yStart + 12);
      doc.text(`Data do Relatório: ${dataRelatorio}`, 14, yStart + 18);
      doc.text(
        `Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm')}`,
        14,
        yStart + 24,
      );

      let cursorY = yStart + 30;

      const addFooter = () => {
        const pageH = doc.internal.pageSize.height;
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(
          `Relatório #${relatorioId} • ${lojaNome} • Gerado em ${dayjs().format(
            'DD/MM/YYYY HH:mm',
          )}`,
          14,
          pageH - 10,
        );
      };

      const sectionTitle = (title) => {
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 14, cursorY);
        cursorY += 6;
      };

      const renderTable = (head, body) => {
        autoTable(doc, {
          startY: cursorY,
          head: [head],
          body,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [42, 157, 143] },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          didDrawPage: addFooter,
        });
        cursorY = doc.lastAutoTable.finalY + 8;
      };

      // Resumo
      const possiveisResumo = [
        ['Retiradas (porta a porta)', detalhe?.pedidos_porta],
        ['Entregas', detalhe?.pedidos_entrega],
        [
          'Faturamento',
          detalhe?.faturamento != null ? detalhe.faturamento : null,
        ],
      ].filter(([, v]) => v !== null && v !== undefined);

      if (possiveisResumo.length > 0) {
        sectionTitle('Resumo');
        renderTable(['Campo', 'Valor'], possiveisResumo);
      }

      // Motoboys
      const motoboys = Array.isArray(detalhe?.motoboys) ? detalhe.motoboys : [];
      if (motoboys.length > 0) {
        sectionTitle('Motoboys');
        const body = motoboys.map((m) => [
          m.nome_motoboy || '—',
          m.quantidade_entregas ?? 0,
          m.valor_entregas ?? 0,
        ]);
        renderTable(['Motoboy', 'Entregas', 'Taxa'], body);
      }

      // Não conformidades
      const ncs = Array.isArray(detalhe?.nao_conformidades)
        ? detalhe.nao_conformidades
        : [];
      if (ncs.length > 0) {
        sectionTitle('Não Conformidades');
        const body = ncs.map((n) => [
          n.item_nao_conforme || '—',
          n.detalhes || '—',
          n.quantidade ?? 0,
        ]);
        renderTable(['Item', 'Detalhes', 'Quantidade'], body);
      }

      // Cancelamentos
      const cancelamentos = Array.isArray(detalhe?.cancelamentos)
        ? detalhe.cancelamentos
        : [];
      if (cancelamentos.length > 0) {
        sectionTitle('Cancelamentos');
        const body = cancelamentos.map((c) => [
          c.motivo_cancelamento || '—',
          c.tipo_cancelamento || '—',
          c.gerou_prejuizo ? 'Sim' : 'Não',
          c.valor_prejuizo ? `R$ ${Number(c.valor_prejuizo).toFixed(2)}` : '—',
          c.acao_tomada || '—',
        ]);
        renderTable(
          ['Motivo', 'Tipo', 'Prejuízo?', 'Valor', 'Ação Tomada'],
          body,
        );
      }

      // Estoques
      const estoques = Array.isArray(detalhe?.estoques) ? detalhe.estoques : [];
      if (estoques.length > 0) {
        sectionTitle('Estoques');
        const body = estoques.map((e) => [
          e.item_estoque_nome || '—',
          String(e.quantidade ?? 0),
          e.esta_acabando ? 'Sim' : 'Não',
        ]);
        renderTable(['Produto', 'Quantidade', 'Acabando?'], body);
      }

      // Erros
      if (detalhe?.erros_detalhes) {
        sectionTitle('Erros');
        doc.setFontSize(11);
        doc.setTextColor(60);
        const lines = doc.splitTextToSize(String(detalhe.erros_detalhes), 182);

        for (const line of lines) {
          if (cursorY > 270) {
            doc.addPage();
            addFooter();
            cursorY = 20;
          }
          doc.text(line, 14, cursorY);
          cursorY += 5;
        }
      }

      addFooter();

      const nomeArquivo = `Relatorio_${lojaNome.replace(
        /[^\w]+/g,
        '_',
      )}_${dayjs().format('YYYYMMDD_HHmm')}_${relatorioId}.pdf`;

      doc.save(nomeArquivo);
    } catch (err) {
      console.error(err);
      alert('Não foi possível gerar o PDF.');
    }
  };

  // ---------------------- FILTROS E GRÁFICOS ----------------------

  const relatoriosLoja = useMemo(
    () => relatorios.filter((r) => String(r.loja) === String(user.loja)),
    [relatorios, user.loja],
  );

  const ultimoRelatorio =
    relatoriosLoja.sort((a, b) => new Date(b.data) - new Date(a.data))[0] ||
    null;

  const vendasData = useMemo(() => {
    const porDia = {};
    relatoriosLoja.forEach((r) => {
      const dia = dayjs(r.data).format('YYYY-MM-DD');
      if (!porDia[dia]) porDia[dia] = { data: dia, porta: 0, entrega: 0 };
      porDia[dia].porta += Number(r.pedidos_porta) || 0;
      porDia[dia].entrega += Number(r.pedidos_entrega) || 0;
    });

    return Object.values(porDia);
  }, [relatoriosLoja]);

  const erroHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    const r = relatoriosLoja.find(
      (rel) => dayjs(rel.data).format('YYYY-MM-DD') === hoje,
    );
    return r?.erros_detalhes || null;
  }, [relatoriosLoja]);

  const errosDataHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    const mapa = {};

    relatoriosLoja.forEach((rel) => {
      if (dayjs(rel.data).format('YYYY-MM-DD') === hoje) {
        (rel.nao_conformidades || []).forEach((n) => {
          mapa[n.item_nao_conforme] =
            (mapa[n.item_nao_conforme] || 0) + (Number(n.quantidade) || 0);
        });
      }
    });

    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [relatoriosLoja]);

  const errosHistoricoData = useMemo(() => {
    const mapa = {};

    relatoriosLoja.forEach((rel) => {
      const dia = dayjs(rel.data).format('YYYY-MM-DD');
      mapa[dia] = mapa[dia] || { data: dia, erros: 0 };

      (rel.nao_conformidades || []).forEach((n) => {
        mapa[dia].erros += Number(n.quantidade) || 0;
      });
    });

    return Object.values(mapa);
  }, [relatoriosLoja]);

  const cancelamentosHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    const mapa = {};

    relatoriosLoja.forEach((rel) => {
      if (dayjs(rel.data).format('YYYY-MM-DD') === hoje) {
        (rel.cancelamentos || []).forEach((c) => {
          const motivo = c.tipo_cancelamento || 'Outros';
          mapa[motivo] = (mapa[motivo] || 0) + 1;
        });
      }
    });

    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [relatoriosLoja]);

  const cancelamentosHistorico = useMemo(() => {
    const mapa = {};

    relatoriosLoja.forEach((rel) => {
      const dia = dayjs(rel.data).format('YYYY-MM-DD');
      mapa[dia] = mapa[dia] || { data: dia, cancelamentos: 0 };
      mapa[dia].cancelamentos += (rel.cancelamentos || []).length;
    });

    return Object.values(mapa);
  }, [relatoriosLoja]);

  const totalCancelamentosUltimo = useMemo(() => {
    if (!ultimoRelatorio) return 0;
    return (ultimoRelatorio.cancelamentos || []).length;
  }, [ultimoRelatorio]);

  // ---------------------- RENDER ----------------------

  if (loading)
    return (
      <div className="p-4 text-center text-gray-600">
        Carregando painel do funcionário...
      </div>
    );

  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderFuncionario activeTab={activeTab} onLogout={onLogout} />

      <div className="p-4">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <section>
            <h2 className="text-3xl font-extrabold mb-6 text-[#d20000]">
              Dashboard
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
              {ultimoRelatorio ? (
                <>
                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-gray-700 font-semibold mb-2">
                      Total de Pedidos
                    </h3>
                    <p className="text-3xl font-bold text-[#d20000]">
                      {(Number(ultimoRelatorio.pedidos_porta) || 0) +
                        (Number(ultimoRelatorio.pedidos_entrega) || 0)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-gray-700 font-semibold mb-2">
                      Entregas
                    </h3>
                    <p className="text-3xl font-bold text-[#d20000]">
                      {Number(ultimoRelatorio.pedidos_entrega) || 0}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-gray-700 font-semibold mb-2">
                      Faturamento
                    </h3>
                    <p className="text-3xl font-bold text-[#2a9d8f]">
                      {(
                        Number(ultimoRelatorio.faturamento) || 0
                      ).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-gray-700 font-semibold mb-2">
                      Cancelamentos
                    </h3>
                    <p className="text-3xl font-bold text-[#a8382e]">
                      {totalCancelamentosUltimo}
                    </p>
                  </div>
                </>
              ) : (
                <p className="col-span-4 text-center text-gray-600">
                  Nenhum relatório encontrado.
                </p>
              )}
            </div>

            {/* Gráficos iguais ao seu código */}
            {/* ... mantém tudo igual ... */}
          </section>
        )}

        {/* RELATÓRIOS */}
        {activeTab === 'relatorios' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Relatórios</h2>
              <button
                onClick={handleRealizarInventario}
                className="bg-[#d20000] text-white px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Novo Relatório
              </button>
            </div>
            {relatoriosLoja.length === 0 ? (
              <p className="text-gray-600">
                Nenhum relatório encontrado. Crie um novo relatório!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border px-4 py-2">Data</th>
                      <th className="border px-4 py-2">Status</th>
                      <th className="border px-4 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatoriosLoja.map(({ id, data, status }) => {
                      const editable = podeEditarRelatorio(data);
                      const statusExibicao =
                        status === 'rascunho' && !editable
                          ? 'Concluído'
                          : status === 'concluido'
                          ? 'Concluído'
                          : 'Rascunho';
                      return (
                        <tr
                          key={id}
                          className="even:bg-gray-100 hover:bg-gray-200 transition"
                        >
                          <td className="border px-4 py-2">
                            {formatarDataPorExtenso(data)}
                          </td>
                          <td className="border px-4 py-2">{statusExibicao}</td>
                          <td className="border px-4 py-2 text-center space-x-2">
                            {editable ? (
                              <button
                                onClick={() => handleAtualizarInventario(id)}
                                className="bg-[#d20000] text-white px-3 py-1 rounded hover:opacity-90 transition"
                              >
                                Editar
                              </button>
                            ) : (
                              <span className="text-gray-500 italic">
                                Edição Expirada
                              </span>
                            )}
                            <button
                              onClick={() => gerarPdfRelatorio(id)}
                              className="bg-[#d20000] text-white px-3 py-1 rounded hover:opacity-90 transition"
                            >
                              PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default FuncionarioDashboard;
