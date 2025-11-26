import { useState, useEffect } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import CarouselFrito from '../Carousel/CarouselFrito';
import CarouselAssado from '../Carousel/CarouselAssado';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Carrossel Revenda
  const pacotes = [
    { src: '/assets/home/pacoteBolinha.png', alt: 'Bolinha de Queijo' },
    { src: '/assets/home/pacoteCoxinha.png', alt: 'Coxinha' },
    { src: '/assets/home/pacoteKibe.png', alt: 'Kibe' },
  ];
  const [order, setOrder] = useState(pacotes);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrder((prev) => [...prev.slice(1), prev[0]]); // gira os pacotes
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Formulário de contato
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch('https://exemplo.com/api/contato', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.status === 'success') {
        alert('Mensagem enviada com sucesso!');
        e.target.reset();
      } else {
        alert('Erro ao enviar. Tente novamente.');
      }
    } catch (error) {
      alert('Erro de rede ou servidor.');
    }
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
            <div className="md:hidden flex-col bg-[#FFBB00] text-[#9E0000] font-bold absolute top-20 left-0 w-full text-center py-4 space-y-4 z-30">
              <Link to="/" className="block hover:text-white">
                Início
              </Link>
              <Link to="/about" className="block hover:text-white">
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

          {/* Banner */}
          <div className="flex flex-1 items-center justify-center text-center px-4 md:mt-[-100px]">
            <h1 className="font-jockey text-5xl md:text-[88px] leading-tight uppercase">
              CROCANÇA. SABOR.
              <br />
              ALEGRIA.
            </h1>
          </div>
        </div>
      </header>

      {/* CARDS */}
      <section className="bg-[#FFBB00] py-16">
        <div className="max-w-6xl mx-auto px-4 grid gap-10 md:grid-cols-3">
          {[
            {
              title: 'FEITO PARA IMPRESSIONAR',
              text: 'Ingredientes selecionados, sabor inconfundível e crocância perfeita. Nossos salgados são preparados com rigoroso controle de qualidade para garantir excelência a cada mordida.',
            },
            {
              title: 'VARIEDADE QUE CONQUISTA',
              text: 'De coxinhas a empadas, temos salgados assados e fritos que atendem desde pequenas lanchonetes até grandes redes de mercados.',
            },
            {
              title: 'VENDA O MELHOR SALGADO',
              text: 'Quer revender nossos salgados? Tornar-se um distribuidor ou franqueado é simples e lucrativo. Entre em contato!',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="
          bg-[#E89600]/90 
          p-8 
          rounded-3xl 
          shadow-xl 
          border border-white/20 
          backdrop-blur-sm
          hover:scale-[1.02] 
          transition-transform 
          duration-300
        "
            >
              {/* Título com Jockey One */}
              <h3 className="font-jockey text-[26px] font-bold mb-4 leading-tight tracking-wide text-white">
                {card.title}
              </h3>

              {/* Texto mais legível (cinza escuro) */}
              <p className="font-roboto text-[18px] leading-relaxed text-[#222]">
                {card.text}
              </p>

              <div className="text-right mt-6 text-2xl text-white">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE NÓS */}
      <section className="bg-[#FFBB00] py-10 text-white font-jockey">
        <div className="text-center px-4">
          <h3 className="text-4xl">sobre nós</h3>
          <h2 className="text-[48px] md:text-[88px] leading-tight">
            TRADIÇÃO E QUALIDADE EM <br /> CADA MORDIDA
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 px-6 md:px-16 py-10">
          {/* Texto */}
          <div className="font-roboto max-w-xl text-justify space-y-6 text-[16px] md:text-[18px] leading-relaxed">
            <p className="text-right">
              Há mais de quatro anos, iniciamos nossa jornada com um propósito
              claro: levar até a mesa dos nossos clientes muito mais do que
              apenas alimentos — entregar experiências marcadas pelo sabor, pela
              praticidade e pela confiança. Desde o início, focamos em criar uma
              linha de salgados congelados que pudesse unir qualidade artesanal
              à eficiência de um produto pronto para o dia a dia. Utilizamos
              ingredientes cuidadosamente selecionados.
            </p>
            <p className="text-left">
              Atualmente, nossa presença se estende por diversos municípios do
              estado de São Paulo, atendendo com excelência desde pequenos
              estabelecimentos de bairro até grandes redes de varejo e
              distribuição. Nosso compromisso é oferecer soluções versáteis que
              atendam às necessidades de diferentes perfis de clientes — do
              comerciante que busca agilidade ao consumidor final que deseja
              praticidade sem abrir mão do sabor.
            </p>
          </div>
          {/* Imagens */}
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <img src="/assets/home/primeira.png" alt="Cliente" />
            <img src="/assets/home/segunda.png" alt="Cliente" />
            <img src="/assets/home/terceira.png" alt="Cliente" />
            <img src="/assets/home/quarta.png" alt="Cliente" />
          </div>
        </div>
      </section>

      {/* PRODUTOS */}
      <section className="bg-[#E20613] text-white px-4 md:px-8 py-12">
        {/* Título principal */}
        <div className="text-center mb-8 font-jockey">
          <h3 className="text-4xl">NOSSOS PRODUTOS</h3>
          <h2 className="text-[48px] md:text-[88px] leading-tight mt-2">
            ESCOLHA O MELHOR PARA SEUS <br /> CLIENTES
          </h2>
        </div>

        {/* ========================= FRITOS ========================= */}
        <div className="w-full flex flex-col items-center text-center font-jockey mt-4">
          {/* Linha premium */}
          <hr className="border-white/30 w-full mb-6" />

          {/* Título premium */}
          <h2 className="text-[38px] md:text-[50px] font-bold uppercase tracking-[2px] mb-2">
            Fritos
          </h2>
        </div>

        <CarouselFrito className="mt-0" />

        {/* ========================= ASSADOS ========================= */}
        <div className="w-full flex flex-col items-center text-center font-jockey mt-12">
          {/* Linha premium */}
          <hr className="border-white/30 w-full mb-6" />

          {/* Título premium */}
          <h2 className="text-[38px] md:text-[50px] font-bold uppercase tracking-[2px] mb-2">
            Assados
          </h2>
        </div>

        <CarouselAssado className="mt-0" />
      </section>

      {/* REVENDA */}
      <section className="relative font-jockey text-white overflow-hidden">
        {/* Fundo */}
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: "url('/assets/home/loja.png')" }}
        >
          <div className="bg-[#E20613] opacity-60 w-full h-full"></div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-10 pb-40 md:pt-20 md:pb-52">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/assets/home/logogrande.png"
              alt="Logo"
              className="h-[140px] md:h-[220px] w-auto"
            />
          </div>

          {/* Quadro Amarelo */}
          <div className="relative bg-[#FFBB00] rounded-2xl px-4 py-10 md:px-16 md:py-20 text-center w-full max-w-6xl shadow-xl overflow-hidden">
            {/* Faixa Vermelha */}
            <div className="absolute top-[75%] md:top-[72%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80px] md:h-[100px] bg-[#E20613] z-0"></div>

            {/* Título */}
            <div className="relative z-10 space-y-6 md:space-y-10">
              <h3 className="text-sm md:text-xl uppercase font-jockey tracking-widest">
                para revenda
              </h3>
              <h2 className="text-[28px] md:text-[72px] font-bold leading-tight">
                QUALIDADE E SABOR
                <br className="hidden md:block" />
                NA SUA PRATELEIRA
              </h2>

              {/* Pacotes que giram */}
              <div className="flex items-end justify-center gap-6 mt-10 transition-all duration-700">
                {order.map((item, i) => (
                  <img
                    key={i}
                    src={item.src}
                    alt={item.alt}
                    className={`transition-transform duration-700 ${
                      i === 1
                        ? 'h-52 md:h-80 scale-110 drop-shadow-xl'
                        : 'h-40 md:h-60 opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section className="bg-[#E20613] py-32 px-4 flex justify-center">
        <div className="bg-[#FFBB00] w-full max-w-4xl rounded-2xl p-6 md:p-10 shadow-xl text-white">
          <h2 className="font-jockey text-center text-2xl md:text-4xl font-bold mb-8 uppercase">
            Entre em Contato Conosco
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 font-bold block">Nome</label>
              <input
                type="text"
                name="nome"
                required
                className="p-3 rounded text-black w-full"
              />
            </div>
            <div>
              <label className="mb-2 font-bold block">Email</label>
              <input
                type="email"
                name="email"
                required
                className="p-3 rounded text-black w-full"
              />
            </div>
            <div>
              <label className="mb-2 font-bold block">Mensagem</label>
              <textarea
                name="mensagem"
                rows="5"
                required
                className="p-3 rounded text-black w-full"
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-white text-[#E20613] font-bold px-6 py-3 rounded hover:bg-gray-200"
            >
              Enviar
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-white bg-[#9E0000] py-10 text-sm font-normal">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna 1 */}
          <div>
            <p className="font-bold text-[14px]">CNPJ: 34.700.511/0001-38</p>
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
          {/* Coluna 2 */}
          <div>
            <p className="font-bold text-[14px] mb-4">Salgados O Fabuloso</p>
            <div className="flex flex-col gap-2">
              <Link
                to="/sobrenos"
                className="hover:text-yellow-400 text-[14px]"
              >
                Sobre Nós
              </Link>
              <Link to="/contato" className="hover:text-yellow-400 text-[14px]">
                Contato
              </Link>
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
