// src/components/Atendente/AtendenteHeader.jsx
import React from 'react';

function AtendenteHeader({ activeTab, setActiveTab }) {
  return (
    <header className="w-full bg-white shadow-md p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">Painel do Atendente</h1>
      </div>

      <nav className="flex gap-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 rounded ${
            activeTab === 'dashboard'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700'
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('entregas')}
          className={`px-3 py-1 rounded ${
            activeTab === 'entregas'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700'
          }`}
        >
          Entregas
        </button>
      </nav>
    </header>
  );
}

export default AtendenteHeader;
