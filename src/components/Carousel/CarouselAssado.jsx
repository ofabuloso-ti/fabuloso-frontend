// src/components/Carousel/CarouselAssado.jsx
import React, { useState, useEffect, useRef } from 'react';

const productsAssado = [
  {
    title: 'Empadas',
    description:
      'Nossas mini empadas são assadas com massa amanteigada, fina e delicada, recheadas de forma generosa com frango ou palmito. Cada unidade tem aproximadamente 20g, tornando-se ideais para eventos, recepções ou revendas. Uma opção elegante, saborosa e prática, com aquele sabor caseiro que agrada a todos.',
    img: '/assets/home/empada.png',
  },
  {
    title: 'Esfihas',
    description:
      'As mini esfihas possuem massa fofinha e levemente dourada, recheada com carne ou frango de forma generosa e saborosa. Com cerca de 20g por unidade, são perfeitas para festas, cafés, lanches rápidos ou revenda. Práticas, macias e muito saborosas, conquistam pelo aroma e pela textura que derrete na boca.',
    img: '/assets/home/esfiha.png',
  },
];

export default function CarouselAssado() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const nextItem = () => setIndex((prev) => (prev + 1) % productsAssado.length);
  const prevItem = () =>
    setIndex(
      (prev) => (prev - 1 + productsAssado.length) % productsAssado.length,
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

  const product = productsAssado[index];

  return (
    <div className="w-full relative max-w-6xl mx-auto mt-10">
      {/* Tabs */}
      <div className="flex justify-center overflow-x-auto font-jockey">
        <ul className="flex gap-6 text-[16px] mt-2 uppercase font-semibold whitespace-nowrap leading-relaxed px-4 tracking-wider">
          {productsAssado.map((item, i) => (
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
