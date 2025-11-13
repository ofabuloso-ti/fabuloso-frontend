import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      {/* HEADER */}
      <header
        className="relative h-[700px] md:h-[900px] bg-cover bg-center text-white font-jockey"
        style={{ backgroundImage: "url('/assets/home/banner.png')" }}
      >
        {/* Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fff] to-transparent z-10"></div>

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
              <a href="/incio" className="block hover:text-white">
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
            <div className="md:hidden flex flex-col bg-[#FFBB00] text-[#9E0000] font-bold absolute top-20 left-0 w-full text-center py-4 space-y-4 z-30 font-jockey">
              <Link to="/" className="block hover:text-white">
                Início
              </Link>
              <Link to="/sobreNos" className="block hover:text-white">
                Sobre Nós
              </Link>
              <Link to="/franquia" className="block hover:text-white">
                Franquia
              </Link>
              <Link to="/lojas" className="block hover:text-white">
                Lojas
              </Link>
              <Link to="/revendas" className="block hover:text-white">
                Revendas
              </Link>
            </div>
          )}

          {/* Conteúdo Central */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-6 md:-mt-40 text-black font-jockey">
            <h1 className="text-5xl md:text-[88px] font-bold leading-tight uppercase">
              SOBRE NÓS
            </h1>
            <h2 className="text-xl md:text-[25px] font-bold leading-tight tracking-wider">
              Conheça um pouco da nossa história
            </h2>
          </div>
        </div>
      </header>

      {/* HISTÓRIA */}
      <section className="bg-white text-black px-6 py-16">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-left font-roboto">
            <h2 className="text-6xl font-bold uppercase">Sobre Nós</h2>
            <p className="text-2xl font-semibold mt-1">
              Descubra a história do O Fabuloso
            </p>
          </div>

          <p className="text-xl md:text-2xl leading-relaxed text-justify font-thin">
            Desde o início, o Fabuloso nasceu de um sonho simples: levar alegria
            e sabor para dentro dos lares brasileiros. A empresa surgiu em uma
            pequena cozinha, com receitas caseiras e o desejo de transformar
            momentos comuns em experiências especiais. Com dedicação e foco na
            qualidade, conquistamos rapidamente o paladar dos nossos primeiros
            clientes e, desde então, seguimos crescendo com responsabilidade e
            carinho em cada detalhe.
          </p>

          <div className="relative flex flex-col md:flex-row items-start gap-6 mt-10">
            <div className="md:w-[45%] relative z-0">
              <img
                src="/assets/about/family.png"
                alt="Família comendo salgados"
                className="w-full md:w-[450px] shadow-lg object-cover"
              />
            </div>

            <div className="w-full md:w-[65%] md:max-w-[720px] bg-[#E20613] text-white p-6 md:p-8 text-xl md:text-2xl shadow-md rounded-none static md:absolute md:right-10 md:top-1/2 md:-translate-y-1/2 z-10">
              <p className="leading-relaxed text-justify font-thin">
                Nosso propósito vai além de vender salgados — queremos
                proporcionar praticidade e aconchego para famílias que valorizam
                o tempo juntas. Cada produto que entregamos carrega o
                compromisso de facilitar o dia a dia com muito sabor, sem abrir
                mão da tradição. Acreditamos que comida boa aproxima pessoas, e
                é isso que buscamos oferecer: mais tempo para aproveitar e menos
                tempo na cozinha.
              </p>
            </div>
          </div>

          <p className="text-xl md:text-2xl leading-relaxed text-justify font-thin">
            Para os nossos revendedores, o Fabuloso representa uma oportunidade
            real de crescimento. Oferecemos não apenas produtos de alta
            rotatividade, mas também suporte, credibilidade e um portfólio
            diversificado que atende diferentes públicos e perfis de negócio.
            Ser nosso parceiro é contar com um sistema eficiente e confiável,
            pensado para gerar resultados, impulsionando histórias de sucesso
            por todo o estado de São Paulo.
          </p>
        </div>
      </section>

      {/* MISSÃO E VALORES */}
      <section className="bg-[#FFBB00] text-white font-roboto px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Título lateral */}
          <div className="flex flex-col justify-start">
            <h2 className="text-6xl md:text-7xl font-bold leading-none relative inline-block mb-2">
              <span className="block border-t-4 border-[#E20613] w-2/3 mb-2"></span>
              NOSSOS <br /> VALORES
            </h2>
          </div>

          {/* Missão e Valores */}
          <div className="flex flex-col space-y-12">
            {/* Missão */}
            <div>
              <h3 className="text-5xl md:text-6xl font-bold flex items-center gap-3">
                <span className="text-6xl font-bold">1</span>
                <span>MISSÃO</span>
              </h3>
              <div className="border-t-4 border-[#E20613] w-full mt-2 mb-4"></div>
              <p className="text-lg md:text-xl text-white/90 font-light">
                Contribuir para que famílias e comunidades tenham acesso a
                alimentos práticos, de qualidade e saborosos. Entregamos mais do
                que produtos — oferecemos momentos de alegria e união em cada
                mordida.
              </p>
            </div>

            {/* Valores */}
            <div>
              <h3 className="text-5xl md:text-6xl font-bold flex items-center gap-3">
                <span className="text-6xl font-bold">2</span>
                <span>VALORES</span>
              </h3>
              <div className="border-t-4 border-[#E20613] w-full mt-2 mb-4"></div>
              <p className="text-lg md:text-xl text-white/90 font-light">
                Acreditamos na força do sabor como forma de conexão. Atuamos com
                responsabilidade, respeito, honestidade e paixão pelo que
                fazemos. Valorizamos nossos clientes, nossos parceiros e todos
                que compartilham nossa missão de levar o melhor para a mesa dos
                brasileiros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-white bg-[#9E0000] py-10 text-sm font-normal">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Coluna 1: Endereço */}
          <div>
            <p className="font-bold text-[14px] mb-1">
              CNPJ: 34.700.511/0001-38
            </p>
            <p className="font-bold text-[14px] mb-4">Josiel Ludgerio Pinto</p>
            <p className="leading-snug text-[14px]">
              Avenida Ampélio Gazzetta, 2122 Sala 3 <br />
              Jardim Bela Vista, Nova Odessa - SP <br />
              CEP: 13385-019
            </p>
            <p className="mt-2 text-[14px]">
              comercial@salgadosofabuloso.com.br
            </p>
          </div>

          {/* Coluna 2: Links */}
          <div>
            <p className="font-bold text-[14px] mb-4">Salgados O Fabuloso</p>
            <div className="flex flex-col gap-2">
              <Link
                to="/sobreNos"
                className="hover:text-yellow-400 text-[14px]"
              >
                Sobre Nós
              </Link>
              <Link to="/contato" className="hover:text-yellow-400 text-[14px]">
                Contato
              </Link>
            </div>
          </div>

          {/* Coluna 3: Redes Sociais */}
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
