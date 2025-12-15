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
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          const res = await djangoApi.get(`/relatorios-diarios/${id}/`);
          setRelatorio(res.data);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [isEdit, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Carregando…
      </div>
    );
  }

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
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(isEdit);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Carregando…
      </div>
    );
  }

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
  const [funcionario, setFuncionario] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          const res = await djangoApi.get(`/users/${id}/`);
          setFuncionario(res.data);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [isEdit, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Carregando…
      </div>
    );
  }

  return (
    <FuncionarioForm
      existingFuncionario={isEdit ? funcionario : null}
      onSave={() => navigate('/admin')}
      onCancel={() => navigate('/admin')}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                APP                                          */
/* -------------------------------------------------------------------------- */

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔑 Verifica sessão ao abrir app
  useEffect(() => {
    const load = async () => {
      try {
        const res = await djangoApi.get('/auth/current_user/');
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogin = async (username, password) => {
    setError('');
    try {
      const res = await djangoApi.post('/auth/login/', { username, password });
      setUser(res.data);

      const tipo = res.data.user_type?.toLowerCase();

      if (tipo === 'admin') navigate('/admin');
      else if (tipo === 'motoboy') navigate('/motoboy');
      else if (tipo === 'atendente') navigate('/atendente');
      else navigate('/funcionario');
    } catch {
      setError('Nome de usuário ou senha incorretos.');
    }
  };

  const handleLogout = async () => {
    await djangoApi.post('/auth/logout/');
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Carregando…
      </div>
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
            <Navigate to="/" />
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

      {/* Entregas */}
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

      <Route
        path="/motoboy"
        element={
          user?.user_type === 'motoboy' ? (
            <MotoboyDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          user?.user_type === 'admin' ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/relatorio/novo"
        element={
          user?.user_type === 'admin' ? (
            <RelatorioFormWrapper isEdit={false} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/relatorio/editar/:id"
        element={
          user?.user_type === 'admin' ? (
            <RelatorioFormWrapper isEdit />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/relatorio"
        element={
          user?.user_type === 'funcionario' ? (
            <RelatorioFormFuncionarioWrapper currentUserLojaId={user.loja} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/funcionario"
        element={
          user?.user_type === 'funcionario' ? (
            <FuncionarioDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
