// src/components/Landing/Franquia.jsx
import React, { useState } from 'react';

export default function Franquia() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    mensagem: '',
  });

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const enviarFormulario = (e) => {
    e.preventDefault();
    console.log('Dados enviados:', formData);
    alert('Mensagem enviada com sucesso! Em breve entraremos em contato.');

    setFormData({ nome: '', email: '', mensagem: '' });
  };

  return (
    <>
      {/* HEADER */}
      <header
        className="relative h-[700px] md:h-[900px] bg-cover bg-center text-white font-jockey"
        style={{ backgroundImage: "url('/assets/home/banner.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFBB00] to-transparent z-10"></div>

        <div className="relative z-20 flex flex-col h-full">
          {/* Navbar */}
          <nav className="relative flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="z-20">
              <a href="/">
                <img
                  src="/assets/home/logogrande.png"
                  alt="Logo"
                  className="h-16 md:h-20 w-auto"
                />
              </a>
            </div>

            {/* Menu Desktop */}
            <ul className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-8 text-[20px] font-light uppercase z-0">
              <li>
                <a href="/home" className="hover:text-yellow-300">
                  Início
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-yellow-300">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="/franquia" className="hover:text-yellow-300">
                  Franquia
                </a>
              </li>
              <li>
                <a href="/lojas" className="hover:text-yellow-300">
                  Lojas
                </a>
              </li>
              <li>
                <a href="/revendas" className="hover:text-yellow-300">
                  Revendas
                </a>
              </li>
            </ul>

            {/* Desktop - Área Cliente */}
            <div className="hidden md:flex z-20 items-center gap-2">
              <a
                href="/login"
                className="bg-white text-[#FFBB00] font-bold px-4 py-2 rounded-md hover:bg-gray-100 uppercase text-sm md:text-base whitespace-nowrap"
              >
                área do Cliente
              </a>
              <i className="fa-solid fa-circle-user text-2xl md:text-4xl hover:text-yellow-300"></i>
            </div>

            {/* Mobile - Usuário + Sanduíche */}
            <div className="md:hidden z-20 flex items-center gap-4">
              <a href="/login">
                <i className="fa-solid fa-circle-user text-3xl hover:text-yellow-300"></i>
              </a>
              <button onClick={toggleMenu}>
                <i
                  className={`fas fa-bars text-3xl transition-colors duration-300 ${
                    menuOpen ? 'text-yellow-300' : 'text-white'
                  }`}
                ></i>
              </button>
            </div>
          </nav>

          {/* Menu Mobile */}
          {menuOpen && (
            <div
              id="menu-mobile"
              className="flex flex-col bg-[#FFBB00] text-[#9E0000] font-bold absolute top-20 left-0 w-full text-center py-4 space-y-4 z-30"
            >
              <a href="/" className="block hover:text-white">
                Início
              </a>
              <a href="/about" className="block hover:text-white">
                Sobre Nós
              </a>
              <a href="/franquia" className="block hover:text-white">
                Franquia
              </a>
              <a href="/lojas" className="block hover:text-white">
                Lojas
              </a>
              <a href="/revendas" className="block hover:text-white">
                Revendas
              </a>
            </div>
          )}

          {/* Menu Mobile */}
          {menuOpen && (
            <div
              id="menu-mobile"
              className="flex flex-col bg-[#FFBB00] text-[#9E0000] font-bold absolute top-20 left-0 w-full text-center py-4 space-y-4 z-30"
            >
              <a href="/" className="block hover:text-white">
                Início
              </a>
              <a href="/about" className="block hover:text-white">
                Sobre Nós
              </a>
              <a href="/franquia" className="block hover:text-white">
                Franquia
              </a>
              <a href="/lojas" className="block hover:text-white">
                Lojas
              </a>
              <a href="/revendas" className="block hover:text-white">
                Revendas
              </a>
            </div>
          )}

          {/* Menu Mobile */}
          {menuOpen && (
            <div
              id="menu-mobile"
              className="flex flex-col bg-[#FFBB00] text-[#9E0000] font-bold absolute top-20 left-0 w-full text-center py-4 space-y-4 z-30"
            >
              <a href="/" className="block hover:text-white">
                Início
              </a>
              <a href="/about" className="block hover:text-white">
                Sobre Nós
              </a>
              <a href="/franquia" className="block hover:text-white">
                Franquia
              </a>
              <a href="/lojas" className="block hover:text-white">
                Lojas
              </a>
              <a href="/revendas" className="block hover:text-white">
                Revendas
              </a>
            </div>
          )}

          {/* Banner */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-6 md:-mt-40">
            <h1 className="text-5xl md:text-[88px] font-bold leading-tight uppercase">
              DESEJA SER UM <br />
              FRANQUIADO?
            </h1>
            <h2 className="text-xl md:text-[25px] font-bold leading-tight tracking-wider">
              Nosso sabor já conquistou milhares de clientes. <br />
              Agora, queremos levar essa crocância ainda mais longe — com você!
            </h2>
          </div>
        </div>
      </header>

      {/* CONSTRUÇÃO */}
      <section className="bg-[#E20613] text-white font-jockey px-6 py-0 border-b-8 border-yellow-400">
        <div className="w-full md:max-w-6xl mx-auto flex flex-col md:flex-row items-stretch">
          <div className="flex-1 flex items-start py-6 md:py-10 text-center">
            <div className="p-6 md:p-10 space-y-10">
              <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-wider leading-tight">
                Em Construção
              </h2>
              <p className="text-lg md:text-3xl leading-relaxed tracking-wide">
                Estamos preparando um modelo de franquia que leve nossos
                produtos a cada canto do Brasil com o mesmo padrão de qualidade.
                Enquanto finalizamos os detalhes, queremos conhecer{' '}
                <strong>você</strong>, futuro parceiro!
              </p>
            </div>
          </div>

          <div className="flex-1">
            <img
              src="/assets/franquia/franquia.png"
              alt="Franquia em construção"
              className="w-full max-h-[620px] object-contain mx-auto block"
            />
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="bg-[#FFBB00] text-white font-jockey px-6 py-16">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-wider">
            Nossos Números
          </h2>

          <div className="flex flex-col md:flex-row justify-center gap-10 text-center">
            {/* CARD 1 */}
            <div className="flex-1 bg-[#E20613] rounded-[2rem] pt-20 pb-6 px-4 relative transition-transform duration-300 ease-in-out hover:scale-105">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-[#E20613] font-bold text-4xl md:text-5xl w-28 h-28 rounded-full flex items-center justify-center shadow-md group-hover:animate-pulse">
                2018
              </div>
              <p className="text-lg md:text-xl lg:text-2xl leading-snug mt-2">
                A mais de 6 anos no ramo <br /> de Salgados
              </p>
            </div>

            {/* CARD 2 */}
            <div className="flex-1 bg-[#E20613] rounded-[2rem] pt-20 pb-6 px-4 relative transition-transform duration-300 ease-in-out hover:scale-105">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-[#E20613] font-bold text-4xl md:text-5xl w-28 h-28 rounded-full flex items-center justify-center shadow-md group-hover:animate-pulse">
                +20
              </div>
              <p className="text-lg md:text-xl lg:text-2xl leading-snug mt-2">
                Mais de 20 clientes entre <br /> interior e litoral de SP
              </p>
            </div>

            {/* CARD 3 */}
            <div className="flex-1 bg-[#E20613] rounded-[2rem] pt-20 pb-6 px-4 relative transition-transform duration-300 ease-in-out hover:scale-105">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-[#E20613] font-bold text-4xl md:text-5xl w-28 h-28 rounded-full flex items-center justify-center shadow-md group-hover:animate-pulse">
                +2ton
              </div>
              <p className="text-lg md:text-xl lg:text-2xl leading-snug mt-2">
                Mais de 2 toneladas <br /> de salgados vendidos por ano
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section className="bg-[#E20613] text-white font-jockey px-6 py-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-stretch relative">
          <div className="flex-1 flex flex-col justify-between py-4">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tight text-left">
                Faça parte
                <br />
                dessa história
              </h2>
              <p className="text-lg md:text-xl text-left max-w-md">
                Em breve entraremos em contato com todos os interessados para
                apresentar o projeto completo.
              </p>
            </div>
            <p className="text-base md:text-lg font-light text-left mt-10 md:mt-auto">
              Junte-se a esse sabor que conquista!
            </p>
          </div>

          {/* Form */}
          <div className="md:w-[60%] w-full bg-[#FFBB00] text-white p-6 md:p-8 rounded-md space-y-4 tracking-widest">
            <form onSubmit={enviarFormulario} className="space-y-4">
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
                placeholder="Nome"
                className="w-full p-3 rounded text-black"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="Email"
                className="w-full p-3 rounded text-black"
              />

              <textarea
                name="mensagem"
                value={formData.mensagem}
                onChange={(e) =>
                  setFormData({ ...formData, mensagem: e.target.value })
                }
                rows="5"
                required
                placeholder="Digite sua mensagem..."
                className="w-full p-3 rounded text-black"
              ></textarea>

              <button
                type="submit"
                className="bg-[#E20613] hover:bg-[#c00510] px-6 py-3 rounded font-bold uppercase"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-white bg-[#9E0000] py-10 text-sm font-normal">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div>
            <p className="font-bold text-[14px] mb-1">
              CNPJ: 34.700.511/0001-38
            </p>
            <p className="font-bold text-[14px] mb-4">Josiel Ludgerio Pinto</p>
            <p className="leading-snug text-[14px]">
              Avenida Ampélio Gazzetta, 2122 Sala 3
              <br />
              Jardim Bela Vista, Nova Odessa - SP
              <br />
              CEP: 13385-019
            </p>
            <p className="mt-2 text-[14px]">
              comercial@salgadosofabuloso.com.br
            </p>
          </div>

          <div>
            <p className="font-bold text-[14px] mb-4">Salgados O Fabuloso</p>
            <div className="flex flex-col gap-2">
              <a href="/about" className="hover:text-yellow-400 text-[14px]">
                Sobre Nós
              </a>
              <a href="/contato" className="hover:text-yellow-400 text-[14px]">
                Contato
              </a>
            </div>
          </div>

          <div>
            <p className="font-bold text-[14px] mb-4">Redes Sociais</p>
            <div className="flex gap-4 text-xl">
              <a
                href="https://www.facebook.com/ofabulosoNO/?locale=pt_BR"
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow-400"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://www.instagram.com/ofabuloso.oficial/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow-400"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://wa.me/5519988408125"
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow-400"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-[#800000] mt-8 pt-4 text-center text-[12px]">
          © 2019 - 2025 Salgados o Fabuloso. Todos os direitos reservados.
        </div>
      </footer>
    </>
  );
}
