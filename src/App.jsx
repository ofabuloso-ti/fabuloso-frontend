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
import FuncionarioDashboard from './components/Interno/FuncionarioDashboard';
import AdminDashboard from './components/Interno/AdminDashboard';
import RelatorioDiarioForm from './components/Interno/RelatorioDiarioForm';
import LojaForm from './components/Interno/LojaForm';
import FuncionarioForm from './components/Interno/FuncionarioForm';
import {
  LoginPageDesktop,
  LoginPageMobile,
} from './components/Interno/LoginPage';

// Landing Pages
import Home from './components/Landing/Home';
import About from './components/Landing/About';
import Franquia from './components/Landing/Franquia';
import Lojas from './components/Landing/Lojas';
import Revendas from './components/Landing/Revendas';

// Wrapper para relatórios (Admin - com id na URL)
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

  const handleSave = () => navigate('/admin');
  const handleCancel = () => navigate('/admin');

  if (loading) return <div className="loading-container">Carregando...</div>;

  return (
    <RelatorioDiarioForm
      existingRelatorio={isEdit ? relatorio : null}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}

// Wrapper para relatórios (Funcionário - recebe existingRelatorio por state)
function RelatorioFormFuncionarioWrapper({ currentUserLojaId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const existingRelatorio = location.state?.existingRelatorio || null;

  const handleSave = () => navigate('/funcionario');
  const handleCancel = () => navigate('/funcionario');

  return (
    <RelatorioDiarioForm
      currentUserLojaId={currentUserLojaId}
      existingRelatorio={existingRelatorio}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}

// Wrapper para formulário de loja
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

  const handleSave = () => navigate('/admin');
  const handleCancel = () => navigate('/admin');

  if (loading) return <div className="loading-container">Carregando...</div>;

  return (
    <LojaForm
      existingLoja={isEdit ? loja : null}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}

// Wrapper para formulário de funcionário
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

  const handleSave = () => navigate('/admin');
  const handleCancel = () => navigate('/admin');

  if (loading) return <div className="loading-container">Carregando...</div>;

  return (
    <FuncionarioForm
      existingFuncionario={isEdit ? funcionario : null}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await djangoApi.get('auth/current_user/');
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkCurrentUser();
  }, []);

  const handleLogin = async (username, password) => {
    setError('');
    try {
      const response = await djangoApi.post('auth/login/', {
        username,
        password,
      });
      setUser(response.data);
      navigate(response.data.user_type === 'admin' ? '/admin' : '/funcionario');
    } catch {
      setError('Nome de usuário ou senha incorretos.');
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      await djangoApi.post('auth/logout/');
      setUser(null);
      navigate('/login');
    } catch {
      setError('Erro ao tentar fazer logout.');
    }
  };

  if (loading) return <div className="loading-container">Carregando...</div>;

  return (
    <Routes>
      {/* Landing pública */}
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
              to={user.user_type === 'admin' ? '/admin' : '/funcionario'}
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

      {/* Relatórios - Admin */}
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

      {/* Relatórios - Funcionário */}
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

      {/* Admin */}
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

      {/* Nova Loja */}
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

      {/* Editar Loja */}
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

      {/* Novo Funcionário */}
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

      {/* Editar Funcionário */}
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

      {/* Funcionário Dashboard */}
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
