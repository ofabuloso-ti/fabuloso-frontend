// src/components/LoginPage.jsx
import React from 'react';
import LoginForm from './LoginForm';
import logoDesktop from '/assets/home/logo.png';
import { Link } from 'react-router-dom';

export const LoginPageDesktop = ({ onLogin, error }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <Link to="/home">
      <img
        src={logoDesktop}
        alt="Logo Good Mais Coxinhas"
        className="h-20 mb-8"
      />
    </Link>
    <LoginForm onLogin={onLogin} error={error} />
  </div>
);

export const LoginPageMobile = ({ onLogin, error }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <img
      src={logoDesktop}
      alt="Logo Good Mais Coxinhas"
      className="h-16 mb-6"
    />
    <LoginForm onLogin={onLogin} error={error} />
  </div>
);
