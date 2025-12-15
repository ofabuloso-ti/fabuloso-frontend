import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginPageDesktop = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (user) {
      switch (user.user_type) {
        case 'admin':
          navigate('/admin');
          break;
        case 'motoboy':
          navigate('/motoboy');
          break;
        case 'atendente':
          navigate('/AtendenteDashboard');
          break;
        default:
          navigate('/interno');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoginForm />
    </div>
  );
};
