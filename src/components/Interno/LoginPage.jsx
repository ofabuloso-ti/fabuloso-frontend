// src/components/LoginPage.jsx
import React, { useEffect } from 'react';
import LoginForm from './LoginForm';
import logoDesktop from '/assets/home/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ======================
// DESKTOP
// ======================
export const LoginPageDesktop = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <Link to="/home">
      <img
        src={logoDesktop}
        alt="Logo Good Mais Coxinhas"
        className="h-20 mb-8"
      />
    </Link>
    <LoginForm />
  </div>
);

// ======================
// MOBILE
// ======================
export const LoginPageMobile = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <img
      src={logoDesktop}
      alt="Logo Good Mais Coxinhas"
      className="h-16 mb-6"
    />
    <LoginForm />
  </div>
);

// ======================
// PAGE (DEFAULT)
// ======================
const LoginPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // 🔐 Redireciona automaticamente se já estiver logado
  useEffect(() => {
    if (loading) return;

    if (user) {
      switch (user.user_type) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'motoboy':
          navigate('/motoboy', { replace: true });
          break;
        case 'atendente':
          navigate('/AtendenteDashboard', { replace: true });
          break;
        default:
          navigate('/interno', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // 🕓 Evita tela preta no PWA
  if (loading) {
    return <div className="min-h-screen bg-white" />;
  }

  const isMobile = window.innerWidth < 768;

  return isMobile ? <LoginPageMobile /> : <LoginPageDesktop />;
};

export default LoginPage;
