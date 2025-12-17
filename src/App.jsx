// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';
import djangoApi from './api/djangoApi';

// Interno
import DashboardAtendente from './components/Atendente/AtendenteDashboard';
import AtendenteEntregas from './components/Atendente/AtendenteHeader';
import FuncionarioDashboard from './components/Interno/FuncionarioDashboard';
import AdminDashboard from './components/Interno/AdminDashboard';
import RelatorioDiarioForm from './components/Interno/RelatorioDiarioForm';
import LojaForm from './components/Interno/LojaForm';
import FuncionarioForm from './components/Interno/FuncionarioForm';

// Entregas
import ListaEntregas from './components/Interno/Entregas/ListaEntregas';
import MotoboyDashboard from './components/Interno/Entregas/MotoboyDashboard';

// Login
import {
  LoginPageDesktop,
  LoginPageMobile,
} from './components/Interno/LoginPage';

// Landing
import Home from './components/Landing/Home';
import About from './components/Landing/About';
import Franquia from './components/Landing/Franquia';
import Lojas from './components/Landing/Lojas';
import Revendas from './components/Landing/Revendas';

/* -------------------------------------------------------------------------- */
/*                                WRAPPERS                                     */
/* -------------------------------------------------------------------------- */

function RelatorioFormWrapper({ isEdit }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [relatorio, setRelatorio] = React.useState(null);
  const [loading, setLoading] = React.useState(isEdit);

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          const res = await djangoApi.get(`/relatorios-diarios/${id}/`);
          setRelatorio(res.data);
        } catch {
          setRelatorio(null);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [isEdit, id]);

  if (loading) return <div className="loading-container">Carregando...</div>;

  return (
    <RelatorioDiarioForm
      existingRelatorio={isEdit ? relatorio : null}
      onSave={() => navigate('/admin')}
      onCancel={() => navigate('/admin')}
    />
  );
}

function RelatorioFormFuncionarioWrapper({ currentUserLojaId }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <RelatorioDiarioForm
      currentUserLojaId={currentUserLojaId}
      existingRelatorio={location.state?.existingRelatorio || null}
      onSave={() => navigate('/funcionario')}
      onCancel={() => navigate('/funcionario')}
    />
  );
}

function LojaFormWrapper({ isEdit }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loja, setLoja] = React.useState(null);
  const [loading, setLoading] = React.useState(isEdit);

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          const res = await djangoApi.get(`/lojas/${id}/`);
          setLoja(res.data);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [isEdit, id]);

  if (loading) return <div className="loading-container">Carregando...</div>;

  return (
    <LojaForm
      existingLoja={isEdit ? loja : null}
      onSave={() => navigate('/admin')}
      onCancel={() => navigate('/admin')}
    />
  );
}

function FuncionarioFormWrapper({ isEdit }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [funcionario, setFuncionario] = React.useState(null);
  const [loading, setLoading] = React.useState(isEdit);

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          const res = await djangoApi.get(`/users/${id}/`);
          setFuncionario(res.data);
        } catch {
          setFuncionario(null);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [isEdit, id]);

  if (loading) return <div className="loading-container">Carregando...</div>;

  return (
    <FuncionarioForm
      existingFuncionario={isEdit ? funcionario : null}
      onSave={() => navigate('/admin')}
      onCancel={() => navigate('/admin')}
    />
  );
}
/* -------------------------------------------------------------------------- */
/*                                APP PRINCIPAL                                */
/* -------------------------------------------------------------------------- */
function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await djangoApi.get('auth/current_user/');
        if (mounted) setUser(res.data);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async (username, password) => {
    setError('');
    try {
      const res = await djangoApi.post('auth/login/', { username, password });
      setUser(res.data);
      console.log('TIPO RECEBIDO:', res.data.user_type);

      const tipo = res.data.user_type?.trim().toLowerCase();

      if (tipo === 'admin') navigate('/admin');
      else if (tipo === 'motoboy') navigate('/motoboy');
      else if (tipo === 'atendente') navigate('/atendente');
      else navigate('/funcionario');
    } catch {
      setError('Nome de usuário ou senha incorretos.');
    }
  };

  const handleLogout = async () => {
    try {
      await djangoApi.post('auth/logout/');
      setUser(null);
      navigate('/login');
    } catch {
      setError('Erro ao tentar fazer logout.');
    }
  };

  if (loading) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <>
              <div className="desktop-view">
                <LoginPageDesktop onLogin={handleLogin} error={error} />
              </div>
              <div className="mobile-view">
                <LoginPageMobile onLogin={handleLogin} error={error} />
              </div>
            </>
          }
        />
        <Route path="*" element={<div>Carregando…</div>} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/franquia" element={<Franquia />} />
      <Route path="/lojas" element={<Lojas />} />
      <Route path="/revendas" element={<Revendas />} />

      {/* Login */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={
                user.user_type === 'admin'
                  ? '/admin'
                  : user.user_type === 'motoboy'
                  ? '/motoboy'
                  : user.user_type === 'atendente'
                  ? '/atendente'
                  : '/funcionario'
              }
            />
          ) : (
            <>
              <div className="desktop-view">
                <LoginPageDesktop onLogin={handleLogin} error={error} />
              </div>
              <div className="mobile-view">
                <LoginPageMobile onLogin={handleLogin} error={error} />
              </div>
            </>
          )
        }
      />

      {/* ----------------------------- ENTREGAS ----------------------------- */}

      {/* Lista de pedidos (funcionário + atendente) */}
      <Route
        path="/entregas"
        element={
          user &&
          (user.user_type === 'funcionario' ||
            user.user_type === 'atendente') ? (
            <ListaEntregas />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Painel Motoboy */}
      <Route
        path="/motoboy"
        element={
          user && user.user_type === 'motoboy' ? (
            <MotoboyDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* ---------------------------- RELATÓRIOS ----------------------------- */}

      <Route
        path="/relatorio/novo"
        element={
          user && user.user_type === 'admin' ? (
            <RelatorioFormWrapper isEdit={false} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/relatorio/editar/:id"
        element={
          user && user.user_type === 'admin' ? (
            <RelatorioFormWrapper isEdit={true} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/relatorio"
        element={
          user && user.user_type === 'funcionario' ? (
            <RelatorioFormFuncionarioWrapper currentUserLojaId={user.loja} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* ------------------------------ ADMIN ------------------------------- */}

      <Route
        path="/admin"
        element={
          user && user.user_type === 'admin' ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/loja/novo"
        element={
          user && user.user_type === 'admin' ? (
            <LojaFormWrapper isEdit={false} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/loja/editar/:id"
        element={
          user && user.user_type === 'admin' ? (
            <LojaFormWrapper isEdit={true} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/funcionario/novo"
        element={
          user && user.user_type === 'admin' ? (
            <FuncionarioFormWrapper isEdit={false} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/funcionario/editar/:id"
        element={
          user && user.user_type === 'admin' ? (
            <FuncionarioFormWrapper isEdit={true} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Dashboard Funcionário */}
      <Route
        path="/funcionario"
        element={
          user && user.user_type === 'funcionario' ? (
            <FuncionarioDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* ----------------------------- ATENDENTE ----------------------------- */}

      <Route
        path="/atendente"
        element={
          user?.user_type === 'atendente' ? (
            <DashboardAtendente user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/atendente/dashboard"
        element={
          user?.user_type === 'atendente' ? (
            <DashboardAtendente
              initialTab="dashboard"
              user={user}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/atendente/entregas"
        element={
          user?.user_type === 'atendente' ? (
            <DashboardAtendente
              initialTab="entregas"
              user={user}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
export default App;
