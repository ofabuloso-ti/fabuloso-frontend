// src/components/Interno/FuncionarioDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import djangoApi from '../../api/djangoApi';
import dayjs from 'dayjs';
import logoDesktop from '/assets/home/logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HeaderFuncionario from './HeaderFuncionario';
import FuncionarioCadastroForm from '../Funcionario/FuncionarioCadastroForm';

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

  // Relatórios
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funcionários (motoboy / atendente)
  const [funcionarios, setFuncionarios] = useState([]);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);
  const [errorFuncionarios, setErrorFuncionarios] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editFuncionario, setEditFuncionario] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Pega aba vinda do navigate(..., { state: { tab } })
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  // Carrega relatórios ao montar
  useEffect(() => {
    fetchRelatorios();
  }, []);

  // Carrega funcionários quando entra na aba Funcionários
  useEffect(() => {
    if (activeTab === 'funcionarios') {
      fetchFuncionarios();
    }
  }, [activeTab]);

  // ================== RELATÓRIOS ==================
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
    const now = dayjs();
    const reportDayjs = dayjs(dataString);
    return now.diff(reportDayjs, 'hour') < 24;
  };

  const handleRealizarInventario = () => navigate('/relatorio');

  const handleAtualizarInventario = (id) => {
    const relatorio = relatorios.find((r) => r.id === id);
    if (!relatorio) return;

    navigate('/relatorio', {
      state: { existingRelatorio: relatorio },
    });
  };

  // ================== FUNCIONÁRIOS ==================
  const fetchFuncionarios = async () => {
    setLoadingFuncionarios(true);
    setErrorFuncionarios(null);
    try {
      const { data } = await djangoApi.get('/users/');
      const filtrados = data.filter(
        (f) =>
          String(f.loja) === String(user.loja) &&
          (f.user_type === 'atendente' || f.user_type === 'motoboy'),
      );
      setFuncionarios(filtrados);
    } catch (err) {
      console.error('Erro ao carregar funcionários', err);
      setErrorFuncionarios('Erro ao carregar funcionários.');
    } finally {
      setLoadingFuncionarios(false);
    }
  };

  const abrirNovoFuncionario = () => {
    setEditFuncionario(null);
    setShowForm(true);
  };

  const handleEditarFuncionario = (func) => {
    setEditFuncionario(func);
    setShowForm(true);
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setEditFuncionario(null);
  };

  const handleFuncionarioSalvo = (salvo) => {
    if (editFuncionario) {
      // edição
      setFuncionarios((prev) =>
        prev.map((f) => (f.id === salvo.id ? salvo : f)),
      );
    } else {
      // novo
      setFuncionarios((prev) => [...prev, salvo]);
    }
    setShowForm(false);
    setEditFuncionario(null);
  };

  const handleExcluirFuncionario = async (id) => {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este funcionário?',
    );
    if (!confirmar) return;

    try {
      await djangoApi.delete(`/users/${id}/`);
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Erro ao excluir funcionário:', err);
      alert('Erro ao excluir funcionário.');
    }
  };

  const labelCargo = (tipo) => {
    if (tipo === 'atendente') return 'Atendente';
    if (tipo === 'motoboy') return 'Motoboy';
    if (tipo === 'funcionario') return 'Funcionário';
    if (tipo === 'admin') return 'Administrador';
    return tipo || '—';
  };

  // ================== PDF ==================
  const gerarPdfRelatorio = async (relatorioId) => {
    try {
      const { data: detalhe } = await djangoApi.get(
        `/relatorios-diarios/${relatorioId}/`,
      );

      const lojaNome = detalhe?.loja?.nome || `Loja #${detalhe?.loja}`;
      const dataRelatorio = detalhe?.data
        ? dayjs(detalhe.data).format('DD/MM/YYYY HH:mm')
        : '—';

      const doc = new jsPDF();
      doc.setFillColor(100, 19, 5);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);

      doc.setFontSize(16);
      doc.text('Relatório Diário', 14, 18);

      try {
        const blob = await fetch(logoDesktop).then((r) => r.blob());
        const base64 = await new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64, 'PNG', 170, 6, 30, 18);
      } catch {}

      let cursorY = 40;

      const section = (title) => {
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 14, cursorY);
        cursorY += 8;
      };

      const renderTable = (head, body) => {
        autoTable(doc, {
          startY: cursorY,
          head: [head],
          body,
          styles: { fontSize: 10 },
        });
        cursorY = doc.lastAutoTable.finalY + 10;
      };

      section('Resumo');
      renderTable(
        ['Campo', 'Valor'],
        [
          ['Retiradas', detalhe.pedidos_porta],
          ['Entregas', detalhe.pedidos_entrega],
          ['Faturamento', detalhe.faturamento],
        ],
      );

      if (detalhe.motoboys?.length > 0) {
        section('Motoboys');
        renderTable(
          ['Nome', 'Entregas', 'Taxa'],
          detalhe.motoboys.map((m) => [
            m.nome_motoboy,
            m.quantidade_entregas,
            m.valor_entregas,
          ]),
        );
      }

      if (detalhe.nao_conformidades?.length > 0) {
        section('Não conformidades');
        renderTable(
          ['Item', 'Detalhes', 'Qtd'],
          detalhe.nao_conformidades.map((n) => [
            n.item_nao_conforme,
            n.detalhes,
            n.quantidade,
          ]),
        );
      }

      if (detalhe.cancelamentos?.length > 0) {
        section('Cancelamentos');
        renderTable(
          ['Motivo', 'Tipo', 'Prejuízo?', 'Valor', 'Ação'],
          detalhe.cancelamentos.map((c) => [
            c.motivo_cancelamento,
            c.tipo_cancelamento,
            c.gerou_prejuizo ? 'Sim' : 'Não',
            c.valor_prejuizo,
            c.acao_tomada,
          ]),
        );
      }

      const nomeArquivo = `Relatorio_${lojaNome}.pdf`;
      doc.save(nomeArquivo);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF.');
    }
  };

  // ================== FILTROS E GRÁFICOS ==================
  const relatoriosLoja = useMemo(
    () => relatorios.filter((r) => String(r.loja) === String(user.loja)),
    [relatorios, user.loja],
  );

  const ultimoRelatorio =
    relatoriosLoja.sort((a, b) => new Date(b.data) - new Date(a.data))[0] ||
    null;

  const vendasData = useMemo(() => {
    const dias = {};

    relatoriosLoja.forEach((r) => {
      const dia = dayjs(r.data).format('YYYY-MM-DD');
      if (!dias[dia]) dias[dia] = { data: dia, porta: 0, entrega: 0 };
      dias[dia].porta += Number(r.pedidos_porta) || 0;
      dias[dia].entrega += Number(r.pedidos_entrega) || 0;
    });

    return Object.values(dias);
  }, [relatoriosLoja]);

  const cancelamentosHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    const mapa = {};

    relatoriosLoja.forEach((rel) => {
      if (dayjs(rel.data).format('YYYY-MM-DD') === hoje) {
        (rel.cancelamentos || []).forEach((c) => {
          mapa[c.tipo_cancelamento] = (mapa[c.tipo_cancelamento] || 0) + 1;
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

  const errosHistorico = useMemo(() => {
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

  const errosHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    const mapa = {};

    relatoriosLoja.forEach((rel) => {
      if (dayjs(rel.data).format('YYYY-MM-DD') === hoje) {
        (rel.nao_conformidades || []).forEach((n) => {
          mapa[n.item_nao_conforme] =
            (mapa[n.item_nao_conforme] || 0) + Number(n.quantidade || 0);
        });
      }
    });

    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [relatoriosLoja]);

  // ================== RENDER ==================
  if (loading) return <div className="p-4 text-center">Carregando...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderFuncionario activeTab={activeTab} onLogout={onLogout} />

      <div className="p-4">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <h2 className="text-3xl font-extrabold mb-6 text-[#d20000]">
              Dashboard
            </h2>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
              {ultimoRelatorio ? (
                <>
                  <div className="bg-white p-4 rounded shadow text-center">
                    <h3>Total de Pedidos</h3>
                    <p className="text-3xl font-bold text-[#d20000]">
                      {(ultimoRelatorio.pedidos_porta || 0) +
                        (ultimoRelatorio.pedidos_entrega || 0)}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded shadow text-center">
                    <h3>Entregas</h3>
                    <p className="text-3xl font-bold text-[#d20000]">
                      {ultimoRelatorio.pedidos_entrega}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded shadow text-center">
                    <h3>Faturamento</h3>
                    <p className="text-3xl font-bold text-[#2a9d8f]">
                      {(ultimoRelatorio.faturamento || 0).toLocaleString(
                        'pt-BR',
                        { style: 'currency', currency: 'BRL' },
                      )}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded shadow text-center">
                    <h3>Cancelamentos</h3>
                    <p className="text-3xl font-bold text-[#a8382e]">
                      {(ultimoRelatorio.cancelamentos || []).length}
                    </p>
                  </div>
                </>
              ) : (
                <p>Nenhum relatório encontrado.</p>
              )}
            </div>

            {/* 1 — Gráfico de vendas */}
            <div className="bg-white p-4 rounded shadow mb-8">
              <h3 className="font-bold mb-2">Pedidos — Histórico</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vendasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="porta" stroke="#d20000" />
                  <Line type="monotone" dataKey="entrega" stroke="#2a9d8f" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 2 — Pizza: Cancelamentos HOJE */}
            <div className="bg-white p-4 rounded shadow mb-8">
              <h3 className="font-bold mb-2">Cancelamentos — Hoje</h3>
              {cancelamentosHoje.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cancelamentosHoje}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      {cancelamentosHoje.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600">Nenhum cancelamento hoje.</p>
              )}
            </div>

            {/* 3 — Histórico de cancelamentos */}
            <div className="bg-white p-4 rounded shadow mb-8">
              <h3 className="font-bold mb-2">Cancelamentos — Histórico</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cancelamentosHistorico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="cancelamentos"
                    stroke="#a8382e"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 4 — Pizza: Erros HOJE */}
            <div className="bg-white p-4 rounded shadow mb-8">
              <h3 className="font-bold mb-2">Não conformidades — Hoje</h3>
              {errosHoje.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errosHoje}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      {errosHoje.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600">Nenhum erro hoje.</p>
              )}
            </div>

            {/* 5 — Histórico de erros */}
            <div className="bg-white p-4 rounded shadow mb-8">
              <h3 className="font-bold mb-2">Não conformidades — Histórico</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={errosHistorico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="erros" stroke="#e76f51" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
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
              <p className="text-gray-600">Nenhum relatório encontrado.</p>
            ) : (
              <table className="w-full border-collapse shadow rounded bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Data</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {relatoriosLoja.map((rel) => {
                    const editable = podeEditarRelatorio(rel.data);
                    const status =
                      rel.status === 'concluido' || !editable
                        ? 'Concluído'
                        : 'Rascunho';

                    return (
                      <tr key={rel.id} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">
                          {formatarDataPorExtenso(rel.data)}
                        </td>

                        <td className="border px-4 py-2">{status}</td>

                        <td className="border px-4 py-2 text-center space-x-2">
                          {editable ? (
                            <button
                              onClick={() => handleAtualizarInventario(rel.id)}
                              className="bg-[#d20000] text-white px-3 py-1 rounded"
                            >
                              Editar
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">
                              Edição Expirada
                            </span>
                          )}

                          <button
                            onClick={() => gerarPdfRelatorio(rel.id)}
                            className="bg-[#d20000] text-white px-3 py-1 rounded"
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* FUNCIONÁRIOS */}
        {activeTab === 'funcionarios' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Funcionários</h2>

              {!showForm && (
                <button
                  onClick={abrirNovoFuncionario}
                  className="bg-[#d20000] text-white px-4 py-2 rounded-md hover:opacity-90 transition"
                >
                  Novo Funcionário
                </button>
              )}
            </div>

            {showForm ? (
              <FuncionarioCadastroForm
                onSave={handleFuncionarioSalvo}
                onCancel={handleCancelarForm}
              />
            ) : (
              <>
                {loadingFuncionarios ? (
                  <p className="text-gray-600">Carregando funcionários...</p>
                ) : errorFuncionarios ? (
                  <p className="text-red-600">{errorFuncionarios}</p>
                ) : funcionarios.length === 0 ? (
                  <p className="text-gray-600">
                    Nenhum funcionário cadastrado para sua loja.
                  </p>
                ) : (
                  <table className="w-full border-collapse shadow rounded bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Nome</th>
                        <th className="border px-4 py-2">Cargo</th>
                        <th className="border px-4 py-2 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funcionarios.map((f) => (
                        <tr key={f.id} className="hover:bg-gray-50">
                          <td className="border px-4 py-2">{f.username}</td>
                          <td className="border px-4 py-2">
                            {labelCargo(f.user_type)}
                          </td>
                          <td className="border px-4 py-2 text-center space-x-2">
                            <button
                              onClick={() => handleEditarFuncionario(f)}
                              className="bg-[#d20000] text-white px-3 py-1 rounded"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleExcluirFuncionario(f.id)}
                              className="bg-[#d20000] text-white px-3 py-1 rounded"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default FuncionarioDashboard;
