// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import djangoApi from '../../api/djangoApi';
import AdminDashboardCompleto from './AdminDashboardCompleto';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
// PDF libs
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Logo
import logoDesktop from '/assets/home/logo.png';

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [relatorios, setRelatorios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // ---------- Fetch data ----------
  useEffect(() => {
    fetchRelatorios();
    fetchUsuarios();
    fetchLojas();
  }, []);

  const fetchRelatorios = async () => {
    try {
      const response = await djangoApi.get('/relatorios-diarios/');
      setRelatorios(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await djangoApi.get('/users/');
      setUsuarios(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchLojas = async () => {
    try {
      const response = await djangoApi.get('/lojas/');
      setLojas(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
    }
  };

  // ---------- Helpers ----------
  const isEditable = (reportDate) => {
    const reportDayjs = dayjs(reportDate);
    const now = dayjs();
    return now.diff(reportDayjs, 'hour') < 24;
  };

  const editar = (tipo, id) => {
    if (tipo === 'Loja') navigate(`/loja/editar/${id}`);
    else if (tipo === 'Funcionário') navigate(`/funcionario/editar/${id}`);
    else if (tipo === 'Relatório') navigate(`/relatorio/editar/${id}`);
    else alert(`Editar ${tipo} com ID: ${id}`);
  };

  const criarNovo = (tipo) => {
    if (tipo === 'Loja') navigate('/loja/novo');
    else if (tipo === 'Funcionário') navigate('/funcionario/novo');
    else if (tipo === 'Relatório') navigate('/relatorio/novo');
    else alert(`Criar novo ${tipo}`);
  };

  const excluir = async (tipo, id) => {
    if (!window.confirm(`Confirma exclusão do ${tipo} ID ${id}?`)) return;

    try {
      let endpoint = '';
      if (tipo === 'Loja') endpoint = '/lojas/';
      else if (tipo === 'Funcionário') endpoint = '/users/';
      else if (tipo === 'Relatório') endpoint = '/relatorios-diarios/';
      else return alert('Tipo inválido para exclusão');

      await djangoApi.delete(`${endpoint}${id}/`);

      if (tipo === 'Loja')
        setLojas((prev) => prev.filter((item) => item.id !== id));
      else if (tipo === 'Funcionário')
        setUsuarios((prev) => prev.filter((item) => item.id !== id));
      else if (tipo === 'Relatório')
        setRelatorios((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(`Erro ao excluir ${tipo} ID ${id}:`, error);
      alert(`Erro ao excluir ${tipo}. Tente novamente.`);
    }
  };

  const moeda = (v) =>
    (Number(v) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  const resolveLojaNome = (lojaField) => {
    const lojaId =
      typeof lojaField === 'object' && lojaField ? lojaField.id : lojaField;
    const found = lojas.find((l) => String(l.id) === String(lojaId));
    return found ? found.nome : lojaId ? `Loja #${lojaId}` : '—';
  };

  const beautifyLabel = (key) => {
    const map = {
      loja: 'Loja',
      data: 'Data do Relatório',
      status: 'Status',
      responsavel_username: 'Responsável',
      pedidos_porta: 'Retiradas (porta a porta)',
      pedidos_entrega: 'Entregas',
      faturamento: 'Faturamento',
      observacoes: 'Observações',
      created_at: 'Criado em',
      updated_at: 'Atualizado em',
    };
    if (map[key]) return map[key];
    return key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined) return '—';

    // datas
    if (
      /data|_at$/.test(key) &&
      (typeof value === 'string' || typeof value === 'number')
    ) {
      return dayjs(value).isValid()
        ? dayjs(value).format('DD/MM/YYYY HH:mm')
        : String(value);
    }

    // dinheiro
    if (/faturamento|valor|preco/i.test(key) && !isNaN(value)) {
      return moeda(value);
    }

    // arrays: mostra só um resumo
    if (Array.isArray(value)) return `${value.length} item(ns)`;

    // objeto simples
    if (typeof value === 'object') return JSON.stringify(value);

    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';

    return String(value);
  };

  // ---------- PDF ----------
  const gerarPdfRelatorio = async (relatorioId) => {
    try {
      const { data: detalhe } = await djangoApi.get(
        `/relatorios-diarios/${relatorioId}/`,
      );

      const lojaNome = resolveLojaNome(detalhe?.loja);
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
      let lastWasTable = false;

      // helpers
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
        lastWasTable = false;
      };
      const renderTable = (head, body, columnStyles) => {
        autoTable(doc, {
          startY: cursorY,
          head: [head],
          body,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [42, 157, 143] },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          margin: { top: 40, bottom: 20 },
          ...(columnStyles ? { columnStyles } : {}),
          didDrawPage: addFooter,
        });
        cursorY = doc.lastAutoTable.finalY + 8;
        lastWasTable = true;
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
        const linhasResumo = possiveisResumo.map(([campo, valor]) => [
          campo,
          formatValue(campo, valor),
        ]);
        renderTable(['Campo', 'Valor'], linhasResumo, {
          0: { cellWidth: 70 },
          1: { cellWidth: 'auto' },
        });
      }

      // ---------- Motoboys ----------
      const motoboys = Array.isArray(detalhe?.motoboys) ? detalhe.motoboys : [];
      if (motoboys.length > 0) {
        sectionTitle('Motoboys');
        const body = motoboys.map((m) => [
          m.nome_motoboy || '—',
          m.quantidade_entregas ?? 0,
          moeda(m.valor_entregas ?? 0),
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
          n.detalhes || n.observacoes || '—',
          n.quantidade ?? 0,
        ]);
        renderTable(['Não conformidade', 'Detalhes', 'Quantidade'], body);
      }

      // ---------- Registro de Cancelamentos ----------
      const cancelamentos = Array.isArray(detalhe?.cancelamentos)
        ? detalhe.cancelamentos
        : [];
      if (cancelamentos.length > 0) {
        sectionTitle('Registro de Cancelamentos');
        const body = cancelamentos.map((c) => [
          c.motivo_cancelamento || '—',
          c.tipo_cancelamento || '—',
          c.gerou_prejuizo ? 'Sim' : 'Não',
          c.valor_prejuizo ? moeda(c.valor_prejuizo) : '—',
          c.acao_tomada || '—',
        ]);
        renderTable(
          [
            'Motivo do Cancelamento',
            'Tipo',
            'Gerou Prejuízo?',
            'Valor do Prejuízo',
            'Ação Tomada / Solução',
          ],
          body,
          {
            0: { cellWidth: 50 },
            1: { cellWidth: 25 },
            2: { cellWidth: 25 },
            3: { cellWidth: 35 },
            4: { cellWidth: 'auto' },
          },
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
        const pageH = doc.internal.pageSize.height;
        const bottom = 20;
        const lines = doc.splitTextToSize(String(detalhe.erros_detalhes), 182);

        for (const line of lines) {
          if (cursorY > pageH - bottom) {
            doc.addPage();
            addFooter();
            cursorY = 20;
          }
          doc.text(line, 14, cursorY);
          cursorY += 5;
        }
        lastWasTable = false;
      }

      if (!lastWasTable) addFooter();

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

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-white p-4 rounded-md shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg
              className="w-8 h-8 text-[#d20000]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <Link to="/home">
            <img src={logoDesktop} alt="Logo" className="h-12 cursor-pointer" />
          </Link>
        </div>

        <nav className="hidden md:flex space-x-6 font-semibold text-gray-700">
          {['dashboard', 'relatorios', 'usuarios', 'lojas', 'entregas'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === tab
                    ? 'bg-[#d20000] text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                {tab === 'dashboard'
                  ? 'Dashboard'
                  : tab === 'relatorios'
                  ? 'Relatórios'
                  : tab === 'usuarios'
                  ? 'Funcionários'
                  : tab === 'lojas'
                  ? 'Lojas'
                  : 'Entregas'}
              </button>
            ),
          )}
        </nav>

        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition ml-2"
        >
          Sair
        </button>
      </header>

      {/* Menu mobile */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full bg-white shadow-md z-40 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="p-4 space-y-4 pt-20">
          {['dashboard', 'relatorios', 'usuarios', 'lojas', 'entregas'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md font-semibold transition ${
                  activeTab === tab
                    ? 'bg-[#d20000] text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                {tab === 'dashboard'
                  ? 'Dashboard'
                  : tab === 'relatorios'
                  ? 'Relatórios'
                  : tab === 'usuarios'
                  ? 'Funcionários'
                  : tab === 'lojas'
                  ? 'Lojas'
                  : 'Entregas'}
              </button>
            ),
          )}
          <button
            onClick={() => {
              onLogout();
              setMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 transition"
          >
            Sair
          </button>
        </div>
      </div>

      <main className="p-4">
        {activeTab === 'dashboard' && <AdminDashboardCompleto />}

        {activeTab === 'relatorios' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Relatórios</h2>
              <button
                onClick={() => criarNovo('Relatório')}
                className="bg-[#d20000] text-white px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Novo Relatório
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Nome</th>
                    <th className="border px-4 py-2">Data</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorios.map(
                    ({ id, responsavel_username, data, status }) => {
                      const editable = isEditable(data);
                      return (
                        <tr
                          key={id}
                          className="even:bg-gray-100 hover:bg-gray-200 transition"
                        >
                          <td className="border px-4 py-2">
                            {responsavel_username}
                          </td>
                          <td className="border px-4 py-2">
                            {dayjs(data).format('DD/MM/YYYY HH:mm')}
                          </td>
                          <td className="border px-4 py-2">
                            {editable ? status : 'Concluído'}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            <button
                              onClick={() => editar('Relatório', id)}
                              disabled={!editable}
                              className={`px-3 py-1 rounded text-white transition ${
                                editable
                                  ? 'bg-[#d20000] hover:opacity-90'
                                  : 'bg-gray-400 cursor-not-allowed'
                              }`}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => excluir('Relatório', id)}
                              className="bg-red-600 text-white px-3 py-1 rounded ml-2 hover:opacity-90 transition"
                            >
                              Excluir
                            </button>
                            <button
                              onClick={() => gerarPdfRelatorio(id)}
                              className="bg-emerald-600 text-white px-3 py-1 rounded ml-2 hover:opacity-90 transition"
                              title="Gerar PDF do relatório"
                            >
                              PDF
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'usuarios' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Funcionários</h2>
              <button
                onClick={() => criarNovo('Funcionário')}
                className="bg-[#d20000] text-white px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Novo Funcionário
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Nome</th>
                    <th className="border px-4 py-2">Loja</th>
                    <th className="border px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(({ id, username, loja }) => {
                    const lojaObj = lojas.find((l) => l.id === loja);
                    const lojaNome = lojaObj ? lojaObj.nome : 'Sem loja';
                    return (
                      <tr
                        key={id}
                        className="even:bg-gray-100 hover:bg-gray-200 transition"
                      >
                        <td className="border px-4 py-2">{username}</td>
                        <td className="border px-4 py-2">{lojaNome}</td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            onClick={() => editar('Funcionário', id)}
                            className="bg-[#d20000] text-white px-3 py-1 rounded hover:opacity-90 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => excluir('Funcionário', id)}
                            className="bg-red-600 text-white px-3 py-1 rounded ml-2 hover:opacity-90 transition"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'lojas' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Lojas</h2>
              <button
                onClick={() => criarNovo('Loja')}
                className="bg-[#d20000] text-white px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Nova Loja
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Nome</th>
                    <th className="border px-4 py-2">Endereço</th>
                    <th className="border px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lojas.map(({ id, nome, endereco }) => (
                    <tr
                      key={id}
                      className="even:bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <td className="border px-4 py-2">{nome}</td>
                      <td className="border px-4 py-2">{endereco || '—'}</td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => editar('Loja', id)}
                          className="bg-[#d20000] text-white px-3 py-1 rounded hover:opacity-90 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluir('Loja', id)}
                          className="bg-red-600 text-white px-3 py-1 rounded ml-2 hover:opacity-90 transition"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'entregas' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Entregas</h2>
            <Link
              to="/entregas"
              className="bg-[#d20000] text-white px-4 py-2 rounded-md hover:opacity-90 transition"
            >
              Abrir Módulo de Entregas
            </Link>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
