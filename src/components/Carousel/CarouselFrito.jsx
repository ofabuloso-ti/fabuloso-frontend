// src/components/Carousel/CarouselFrito.jsx
import React, { useState, useEffect, useRef } from 'react';

const productsFrito = [
  {
    title: 'Mini Salgados',
    description:
      'Explore nossa linha de salgados fritos: crocantes por fora, macios por dentro e cheios de sabor. Cada unidade tem apenas 20g — o tamanho ideal para festas, eventos e revenda. Temos desde a tradicional coxinha de frango até o delicioso croquete de carne, passando por bolinha de queijo, kibe, rissole de carne, rissole de requeijão, salsicha, calabresa e presunto com queijo. Qualidade, variedade e praticidade que conquistam em cada mordida.',
    img: '/assets/home/minisalgados.png',
  },
  {
    title: 'Mini Pastéis',
    description:
      'Pastéis crocantes e recheados com carne, queijo ou frango. Uma opção prática e deliciosa para qualquer ocasião.',
    img: '/assets/home/minipasteis.png',
  },
  {
    title: 'Mini Churros',
    description:
      'Mini Churros recheados com doce de leite. Crocante por fora, cremoso por dentro. Ideal para adoçar festas, eventos ou servir como mimo irresistível.',
    img: '/assets/home/minichurros.png',
  },
];

export default function CarouselFrito() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const nextItem = () => setIndex((prev) => (prev + 1) % productsFrito.length);

  const prevItem = () =>
    setIndex(
      (prev) => (prev - 1 + productsFrito.length) % productsFrito.length,
    );

  // Função para resetar o timer quando usuário interagir
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextItem, 30000); // 30s
  };

  // Inicia o timer
  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const product = productsFrito[index];

  return (
    <div className="w-full relative max-w-6xl mx-auto mt-10">
      {/* Tabs */}
      <div className="flex justify-center overflow-x-auto font-jockey">
        <ul className="flex gap-6 text-[16px] mt-2 uppercase font-semibold whitespace-nowrap leading-relaxed px-4 tracking-wider">
          {productsFrito.map((item, i) => (
            <li
              key={i}
              className={`cursor-pointer hover:text-yellow-400 ${
                index === i ? 'text-yellow-400' : ''
              }`}
              onClick={() => {
                setIndex(i);
                resetTimer();
              }}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-10">
        <img
          src={product.img}
          alt={product.title}
          className="w-[200px] md:w-[250px] h-[200px] md:h-[250px] object-contain mx-auto md:mx-0"
        />
        <div className="border-l-4 border-white pl-6 max-w-xl text-center md:text-left">
          <h3 className="text-[32px] md:text-[50px] font-bold uppercase leading-tight font-jockey">
            {product.title}
          </h3>
          <p className="mt-4 text-[14px] md:text-base font-roboto">
            {product.description}
          </p>
        </div>
      </div>

      {/* Setas laterais */}
      <button
        onClick={() => {
          prevItem();
          resetTimer();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-3xl font-bold hover:text-yellow-400 z-10"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button
        onClick={() => {
          nextItem();
          resetTimer();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl font-bold hover:text-yellow-400 z-10"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
}
