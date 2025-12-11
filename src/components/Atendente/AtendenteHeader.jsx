// src/components/Atendente/AtendenteHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoDesktop from '/assets/home/logo.png';

export default function AtendenteHeader({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between bg-white p-4 shadow-md sticky top-0 z-50">
      <div className="flex items-center space-x-3 relative" ref={menuRef}>
        {/* HAMBURGUER MOBILE */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg
              className="w-7 h-7 text-[#d20000]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-7 h-7 text-[#d20000]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        {/* LOGO */}
        <Link to="/atendente/dashboard">
          <img src={logoDesktop} alt="Logo" className="h-12 cursor-pointer" />
        </Link>

        {/* MENU MOBILE */}
        {menuOpen && (
          <nav className="absolute top-14 left-0 w-56 bg-white shadow-lg rounded-md flex flex-col py-2 md:hidden z-50">
            {/* Dashboard */}
            <button
              onClick={() => {
                navigate('/atendente/dashboard');
                setMenuOpen(false);
              }}
              className={`px-4 py-2 text-left ${
                location.pathname.includes('/atendente/dashboard')
                  ? 'bg-[#d20000] text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>

            {/* Entregas */}
            <button
              onClick={() => {
                navigate('/atendente/entregas');
                setMenuOpen(false);
              }}
              className={`px-4 py-2 text-left ${
                location.pathname.includes('/atendente/entregas')
                  ? 'bg-[#d20000] text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Entregas
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="px-4 py-2 text-left text-red-600 hover:bg-gray-100"
            >
              Sair
            </button>
          </nav>
        )}
      </div>

      {/* MENU DESKTOP */}
      <nav className="hidden md:flex space-x-6 font-semibold text-gray-700">
        {/* Dashboard */}
        <button
          onClick={() => navigate('/atendente/dashboard')}
          className={`px-4 py-2 rounded-md transition ${
            location.pathname.includes('/atendente/dashboard')
              ? 'bg-[#d20000] text-white'
              : 'hover:bg-gray-200'
          }`}
        >
          Dashboard
        </button>

        {/* Entregas */}
        <button
          onClick={() => navigate('/atendente/entregas')}
          className={`px-4 py-2 rounded-md transition ${
            location.pathname.includes('/atendente/entregas')
              ? 'bg-[#d20000] text-white'
              : 'hover:bg-gray-200'
          }`}
        >
          Entregas
        </button>
      </nav>

      {/* LOGOUT DESKTOP */}
      <button
        onClick={onLogout}
        className="hidden md:inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        Sair
      </button>
    </header>
  );
}
