import React, { useState } from 'react';

export default function Lojas() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

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
              <a href="/home" className="block hover:text-white">
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
              NOSSAS LOJAS
            </h1>
            <h2 className="text-xl md:text-[25px] font-bold leading-tight tracking-wider uppercase">
              Cada vez mais perto de você
            </h2>
          </div>
        </div>
      </header>

      {/* LOJAS */}
      <section className="bg-[#FFBB00] text-white px-6 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-wide font-jockey">
            Descubra a nossa loja
            <br className="md:hidden" /> mais perto de você
          </h2>

          {/* Card da Loja */}
          <div className="bg-[#E20613] rounded-2xl overflow-hidden shadow-xl font-roboto max-w-md mx-auto">
            <img
              src="/assets/Images/novaodessa.png"
              alt="Loja O Fabuloso Nova Odessa"
              className="w-full h-56 object-cover"
            />

            <div className="p-6 text-left space-y-2 text-sm md:text-base">
              <h3 className="text-lg md:text-xl font-bold uppercase">
                LOJA 01: O Fabuloso - Nova Odessa
              </h3>

              <p>
                Avenida Ampélio Gazzetta, 2122 Sala 3<br />
                Jardim Bela Vista, Nova Odessa - SP
              </p>

              <a
                href="https://wa.me/5519988408125"
                target="_blank"
                rel="noreferrer"
                className="text-white underline font-semibold hover:text-yellow-300"
              >
                (19) 98840-8125
              </a>

              <div className="mt-4">
                <h4 className="font-bold">Horário de Funcionamento</h4>
                <p>
                  Domingo
                  <br />
                  <span className="text-white/80">12:00 até às 18hrs</span>
                  <br />
                  Segunda à Sábado
                  <br />
                  <span className="text-white/80">14:00 até às 22hrs</span>
                </p>
              </div>

              <div className="pt-4">
                <a
                  href="https://www.google.com/maps/place/Avenida+Amp%C3%A9lio+Gazzetta,+2122+-+Jardim+Bela+Vista,+Nova+Odessa+-+SP"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-white text-[#E20613] font-bold px-6 py-2 rounded-full hover:bg-gray-200 transition"
                >
                  Abrir no Mapa
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-white bg-[#9E0000] py-10 text-sm font-normal">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Coluna 1 */}
          <div>
            <p className="font-bold text-[14px] mb-1">
              CNPJ: 34.700.511/0001-38
            </p>
            <p className="font-bold text-[14px] mb-4">Josiel Ludgerio Pinto</p>
            <p className="leading-snug text-[14px]">
              Avenida Ampélio Gazzetta, 2122 Sala 3<br />
              Jardim Bela Vista, Nova Odessa - SP
              <br />
              CEP: 13385-019
            </p>
            <p className="mt-2 text-[14px]">
              comercial@salgadosofabuloso.com.br
            </p>
          </div>

          {/* Coluna 2 */}
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

          {/* Coluna 3 */}
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
