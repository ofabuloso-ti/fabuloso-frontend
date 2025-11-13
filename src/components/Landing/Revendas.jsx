import React, { useState } from 'react';

export default function Revendas() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  });

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitResaleForm = (e) => {
    e.preventDefault();
    console.log('Dados enviados:', formData);
    alert('Mensagem enviada com sucesso!');
    setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
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

          {/* Banner */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-6 md:-mt-40">
            <h1 className="text-5xl md:text-[88px] font-bold leading-tight uppercase">
              TRABALHE COM <br />
              NOSSOS PRODUTOS
            </h1>
            <h2 className="text-xl md:text-[25px] font-bold leading-tight tracking-wider">
              A qualidade que o seu estabelecimento merece
            </h2>
          </div>
        </div>
      </header>

      {/* VARIEDADES */}
      <section className="bg-[#E20613] text-white font-jockey px-6 py-16">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2 className="text-6xl md:text-7xl font-bold uppercase tracking-wider">
            MUITAS VARIEDADES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {/* CARD 1 */}
            <div className="bg-[#FFA600] p-6 rounded-tl-[2rem] flex flex-col justify-center items-center text-center min-h-[240px]">
              <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
                Salgados Fritos
              </h3>
              <img
                src="/assets/revendas/fritos1.png"
                alt="Salgados fritos"
                className="w-40 h-auto mt-4"
              />
              <p className="text-xl md:text-2xl leading-snug mt-4">
                Salgados crocantes, deliciosos, com mais de nove opções de
                sabores
              </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-[#FFBB00] p-6 rounded-tr-[2rem] flex flex-col justify-center items-center text-center min-h-[240px]">
              <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
                Mini Pastéis
              </h3>
              <img
                src="/assets/revendas/pastel1.png"
                alt="Mini Pastéis"
                className="w-40 h-auto mt-4"
              />
              <p className="text-xl md:text-2xl leading-snug mt-4">
                Os melhores sabores: queijo, pizza, carne e frango para você
                apreciar
              </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-[#FFBB00] p-6 rounded-bl-[2rem] flex flex-col justify-center items-center text-center min-h-[240px]">
              <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
                Salgados Assados
              </h3>
              <img
                src="/assets/revendas/assados1.png"
                alt="Salgados Assados"
                className="w-40 h-auto mt-4"
              />
              <p className="text-xl md:text-2xl leading-snug mt-4">
                Esfihas e empadas maravilhosas para um lanche da tarde
              </p>
            </div>

            {/* CARD 4 */}
            <div className="bg-[#FFA600] p-6 rounded-br-[2rem] flex flex-col justify-center items-center text-center min-h-[240px]">
              <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
                Nhoque
              </h3>
              <img
                src="/assets/revendas/nhoque1.png"
                alt="Nhoque"
                className="w-40 h-auto mt-4"
              />
              <p className="text-xl md:text-2xl leading-snug mt-4">
                Nhoque tradicional com massa de batata, perfeito para a refeição
                de domingo
              </p>
            </div>
          </div>

          <p className="text-xl md:text-2xl font-bold tracking-wider uppercase">
            E MUITO MAIS...
          </p>
        </div>
      </section>

      {/* PASSO A PASSO */}
      <section className="bg-[#FFBB00] font-jockey py-20 px-4">
        <div className="max-w-5xl mx-auto space-y-16">
          <h2 className="text-center text-5xl md:text-6xl font-bold uppercase text-white">
            Por Onde Começar?
          </h2>

          {[
            {
              step: '1º',
              title: 'Demonstre seu interesse',
              text: 'Preencha o formulário abaixo com seus dados e informações sobre o seu comércio. Vamos analisar seu perfil com carinho.',
              reverse: false,
            },
            {
              step: '2º',
              title: 'Atendimento personalizado',
              text: 'Nossa equipe comercial entrará em contato para entender sua demanda, explicar preços e condições exclusivas para revendedores.',
              reverse: true,
            },
            {
              step: '3º',
              title: 'Escolha os produtos e feche o pedido',
              text: 'Você poderá escolher entre nossos salgados fritos, assados, mini churros e massas. Ajudamos com o mix ideal para seu público.',
              reverse: false,
            },
            {
              step: '4º',
              title: 'Receba os produtos no seu ponto de venda',
              text: 'Entregamos com segurança e pontualidade. Agora é só vender e encantar seus clientes com o sabor d’O Fabuloso!',
              reverse: true,
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`relative bg-[#E20613] text-white rounded-[3rem] p-10 flex flex-col md:flex-row ${
                item.reverse ? 'md:flex-row-reverse text-right' : 'text-left'
              } justify-between items-center gap-6`}
            >
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold uppercase text-[#FFBB00]">
                  {item.title}
                </h3>
                <p className="text-lg md:text-xl mt-4">{item.text}</p>
              </div>
              <div className="bg-white text-[#E20613] text-5xl md:text-6xl font-bold w-28 h-28 rounded-full flex items-center justify-center shrink-0">
                {item.step}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO DE CONTATO */}
      <section className="bg-[#E20613] text-white font-jockey px-6 py-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-stretch relative">
          <div className="flex-1 flex flex-col justify-between py-4">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tight text-left">
                COMECE A <br />
                REVENDER
              </h2>
              <p className="text-lg md:text-xl text-left max-w-md">
                TENHA A NOSSA VARIEDADES DE PRODUTOS DENTRO DO SEU COMÉRCIO E
                VENDA SALGADOS DE QUALIDADE ALTÍSSIMA
              </p>
            </div>
            <p className="text-base md:text-lg font-light text-left mt-10 md:mt-auto">
              Junte-se a esse sabor que conquista!
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={submitResaleForm}
            className="md:w-[60%] w-full bg-[#FFBB00] text-white p-6 md:p-8 rounded-md space-y-4 tracking-widest"
          >
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome"
              required
              className="w-full p-3 rounded text-[#E20613] font-bold placeholder:text-[#E20613]"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Seu email"
              required
              className="w-full p-3 rounded text-[#E20613] font-bold placeholder:text-[#E20613]"
            />
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="Seu telefone"
              className="w-full p-3 rounded text-[#E20613] font-bold placeholder:text-[#E20613]"
            />
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              rows="4"
              placeholder="Conte um pouco sobre seu comércio"
              className="w-full p-3 rounded text-[#E20613] font-bold placeholder:text-[#E20613] resize-none"
            ></textarea>
            <button
              type="submit"
              className="bg-white text-[#E20613] font-bold px-6 py-3 rounded-md uppercase hover:bg-gray-200 transition w-full"
            >
              Enviar
            </button>
          </form>
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
              Avenida Ampélio Gazzetta, 2122 Sala 3 <br />
              Jardim Bela Vista, Nova Odessa - SP <br />
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
