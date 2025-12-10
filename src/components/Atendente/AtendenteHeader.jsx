import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function AtendenteHeader() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full bg-white shadow-md p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">Painel do Atendente</h1>
      </div>

      <nav className="flex gap-4">
        <Link
          to="/dashboardAtendente"
          className={`px-3 py-1 rounded ${
            isActive('/dashboardAtendente')
              ? 'bg-blue-500 text-white'
              : 'text-gray-700'
          }`}
        >
          Dashboard
        </Link>

        <Link
          to="/atendenteEntregas"
          className={`px-3 py-1 rounded ${
            isActive('/atendenteEntregas')
              ? 'bg-blue-500 text-white'
              : 'text-gray-700'
          }`}
        >
          Entregas
        </Link>
      </nav>
    </header>
  );
}

export default AtendenteHeader;
