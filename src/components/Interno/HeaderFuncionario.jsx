// src/components/Interno/HeaderMotoboy.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '/assets/home/logo.png';

export default function HeaderMotoboy() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/motoboy/dashboard' },
    { name: 'Entregas', path: '/motoboy/entregas' },
  ];

  return (
    <header className="bg-[#E20613] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 mr-3" />
        </div>

        {/* Menu */}
        <nav className="flex gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-lg font-medium transition 
                ${
                  location.pathname === item.path
                    ? 'border-b-2 border-white'
                    : 'opacity-80 hover:opacity-100'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
