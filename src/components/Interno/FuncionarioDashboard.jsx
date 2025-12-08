// src/components/FuncionarioDashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import djangoApi from '../../api/djangoApi';
import dayjs from 'dayjs';
import logoDesktop from '/assets/home/logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const navigate = useNavigate();

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
      console.error('Erro ao buscar relatórios:', err.response?.data || err);
      setError('Erro ao carregar relatórios.');
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
    setMenuOpen(false);
  };

  const handleAtualizarInventario = (id) => {
    const relatorioParaEditar = relatorios.find((r) => r.id === id);
    if (!relatorioParaEditar) return;

    navigate('/relatorio', {
      state: { existingRelatorio: relatorioParaEditar },
    });
    setMenuOpen(false);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // --- GERAR PDF COMPLETO ---
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

      // ---------- Cabeçalho ----------
      doc.setFillColor(100, 19, 5);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('Relatório Diário', 14, 18);

      // Logo
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

      // ---------- Dados principais ----------
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

      // ---------- Resumo ----------
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

      // ---------- Motoboys ----------
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

      // ---------- Não Conformidades ----------
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

      // ---------- Cancelamentos ----------
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

      // ---------- Estoques ----------
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

      // ---------- Erros ----------
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
      console.error('Erro ao gerar PDF do relatório:', err);
      alert('Não foi possível gerar o PDF deste relatório.');
    }
  };

  // --- Relatórios apenas da loja do funcionário ---
  const relatoriosLoja = useMemo(
    () => relatorios.filter((r) => String(r.loja) === String(user.loja)),
    [relatorios, user.loja],
  );

  // --- Último relatório ---
  const ultimoRelatorio =
    relatoriosLoja.sort((a, b) => new Date(b.data) - new Date(a.data))[0] ||
    null;

  // --- Vendas por dia ---
  const vendasData = useMemo(() => {
    const porDia = {};
    relatoriosLoja.forEach((r) => {
      const dia = dayjs(r.data).format('YYYY-MM-DD');
      if (!porDia[dia]) porDia[dia] = { data: dia, porta: 0, entrega: 0 };
      porDia[dia].porta += Number(r.pedidos_porta) || 0;
      porDia[dia].entrega += Number(r.pedidos_entrega) || 0;
    });
    return Object.values(porDia).sort((a, b) => (a.data > b.data ? 1 : -1));
  }, [relatoriosLoja]);

  // --- Erros do dia ---
  const erroHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    const relHoje = relatoriosLoja.find(
      (r) => dayjs(r.data).format('YYYY-MM-DD') === hoje,
    );
    return relHoje?.erros_detalhes || null;
  }, [relatoriosLoja]);

  // --- Não conformidades de hoje ---
  const errosDataHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    const errosMap = {};
    relatoriosLoja.forEach((rel) => {
      const dataRel = dayjs(rel.data).format('YYYY-MM-DD');
      if (dataRel === hoje && Array.isArray(rel.nao_conformidades)) {
        rel.nao_conformidades.forEach((n) => {
          errosMap[n.item_nao_conforme] =
            (errosMap[n.item_nao_conforme] || 0) + (Number(n.quantidade) || 0);
        });
      }
    });
    return Object.entries(errosMap).map(([name, value]) => ({ name, value }));
  }, [relatoriosLoja]);

  // --- Histórico de não conformidades ---
  const errosHistoricoData = useMemo(() => {
    const porDia = {};
    relatoriosLoja.forEach((rel) => {
      const dia = dayjs(rel.data).format('YYYY-MM-DD');
      if (!porDia[dia]) porDia[dia] = { data: dia, erros: 0 };
      if (Array.isArray(rel.nao_conformidades)) {
        rel.nao_conformidades.forEach((n) => {
          porDia[dia].erros += Number(n.quantidade) || 0;
        });
      }
    });
    return Object.values(porDia).sort((a, b) => (a.data > b.data ? 1 : -1));
  }, [relatoriosLoja]);

  // --- Cancelamentos de hoje ---
  const cancelamentosHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    const cancMap = {};
    relatoriosLoja.forEach((rel) => {
      const dataRel = dayjs(rel.data).format('YYYY-MM-DD');
      if (dataRel === hoje && Array.isArray(rel.cancelamentos)) {
        rel.cancelamentos.forEach((c) => {
          const motivo = c.tipo_cancelamento || 'Outros';
          cancMap[motivo] = (cancMap[motivo] || 0) + 1;
        });
      }
    });
    return Object.entries(cancMap).map(([name, value]) => ({ name, value }));
  }, [relatoriosLoja]);

  // --- Histórico de cancelamentos ---
  const cancelamentosHistorico = useMemo(() => {
    const porDia = {};
    relatoriosLoja.forEach((rel) => {
      const dia = dayjs(rel.data).format('YYYY-MM-DD');
      if (!porDia[dia]) porDia[dia] = { data: dia, cancelamentos: 0 };
      if (Array.isArray(rel.cancelamentos)) {
        porDia[dia].cancelamentos += rel.cancelamentos.length;
      }
    });
    return Object.values(porDia).sort((a, b) => (a.data > b.data ? 1 : -1));
  }, [relatoriosLoja]);

  // --- Total de cancelamentos do último relatório ---
  const totalCancelamentosUltimo = useMemo(() => {
    if (!ultimoRelatorio || !Array.isArray(ultimoRelatorio.cancelamentos))
      return 0;
    return ultimoRelatorio.cancelamentos.length;
  }, [ultimoRelatorio]);
  if (loading)
    return (
      <div className="p-4 text-center text-gray-600">
        Carregando painel do funcionário...
      </div>
    );
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-white p-4 shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3 relative">
          {/* Hamburger mobile */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            {menuOpen ? (
              <svg
                className="w-6 h-6 text-[#d20000]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-[#d20000]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          <Link to="/home">
            <img src={logoDesktop} alt="Logo" className="h-12 cursor-pointer" />
          </Link>

          {/* MENU MOBILE DROPDOWN */}
          {menuOpen && (
            <nav className="absolute top-14 left-0 w-48 bg-white shadow-lg rounded-md flex flex-col py-2 md:hidden z-50">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setMenuOpen(false);
                }}
                className={`px-4 py-2 text-left ${
                  activeTab === 'dashboard'
                    ? 'bg-[#d20000] text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => {
                  setActiveTab('relatorios');
                  setMenuOpen(false);
                }}
                className={`px-4 py-2 text-left ${
                  activeTab === 'relatorios'
                    ? 'bg-[#d20000] text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                Relatórios
              </button>

              <button
                onClick={() => {
                  navigate('/entregas');
                  setMenuOpen(false);
                }}
                className="px-4 py-2 text-left hover:bg-gray-100"
              >
                Entregas
              </button>

              <button
                onClick={() => {
                  onLogout();
                  setMenuOpen(false);
                }}
                className="px-4 py-2 text-left text-red-600 hover:bg-gray-100"
              >
                Sair
              </button>
            </nav>
          )}
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex space-x-6 font-semibold text-gray-700">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === 'dashboard'
                ? 'bg-[#d20000] text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('relatorios')}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === 'relatorios'
                ? 'bg-[#d20000] text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            Relatórios
          </button>

          <button
            onClick={() => navigate('/entregas')}
            className="px-3 py-1 rounded-md hover:bg-gray-200 transition"
          >
            Entregas
          </button>
        </nav>

        {/* Logout desktop */}
        <button
          onClick={onLogout}
          className="hidden md:inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          Sair
        </button>
      </header>

      {/* Conteúdo */}
      <div className="p-4">
        {activeTab === 'dashboard' && (
          <section>
            <h2 className="text-3xl font-extrabold mb-6 text-[#d20000]">
              Dashboard
            </h2>

            {/* Cards rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
              {ultimoRelatorio ? (
                <>
                  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
                    <h3 className="text-gray-700 text-md sm:text-lg font-semibold mb-2">
                      Total de Pedidos (Último Relatório)
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-[#d20000]">
                      {(Number(ultimoRelatorio.pedidos_porta) || 0) +
                        (Number(ultimoRelatorio.pedidos_entrega) || 0)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
                    <h3 className="text-gray-700 text-md sm:text-lg font-semibold mb-2">
                      Total de Entregas (Último Relatório)
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-[#d20000]">
                      {Number(ultimoRelatorio.pedidos_entrega) || 0}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
                    <h3 className="text-gray-700 text-md sm:text-lg font-semibold mb-2">
                      Faturamento Total (Último Relatório)
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-[#2a9d8f]">
                      {(
                        Number(ultimoRelatorio.faturamento) || 0
                      ).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
                    <h3 className="text-gray-700 text-md sm:text-lg font-semibold mb-2">
                      Cancelamentos (Último Relatório)
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-[#a8382e]">
                      {totalCancelamentosUltimo}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 col-span-4 text-center">
                  Nenhum relatório encontrado ainda.
                </p>
              )}
            </div>

            {/* Gráficos */}
            <div className="flex flex-col gap-6 mb-10">
              {/* Vendas por dia */}
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

              {/* Cancelamentos do Dia */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
                  Motivos de Cancelamento (Hoje)
                </h3>
                {cancelamentosHoje.length === 0 ? (
                  <p className="text-center text-gray-500">
                    Nenhum cancelamento hoje 🎉
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
                              key={`cell-cancel-${index}`}
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

              {/* Histórico de Cancelamentos */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
                  Histórico de Cancelamentos
                </h3>
                {cancelamentosHistorico.length === 0 ? (
                  <p className="text-center text-gray-500">
                    Nenhum cancelamento registrado até agora.
                  </p>
                ) : (
                  <div className="min-w-[600px] sm:min-w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={cancelamentosHistorico}>
                        <XAxis dataKey="data" stroke="#d20000" />
                        <YAxis allowDecimals={false} stroke="#d20000" />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="cancelamentos"
                          stroke="#a8382e"
                          name="Cancelamentos"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Erros do Dia */}
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

              {/* Não conformidades do dia */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#d20000]">
                  Não Conformidades (Hoje)
                </h3>
                {errosDataHoje.length === 0 ? (
                  <p className="text-center text-gray-500">
                    Não houve erros hoje 🎉
                  </p>
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

              {/* Histórico de Não Conformidades */}
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
                        <Line
                          type="monotone"
                          dataKey="erros"
                          stroke="#e76f51"
                          name="Quantidade de Erros"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Aba de Relatórios */}
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
