export const MENU_CATEGORIES = [
  {
    title: 'Combinados',
    items: [
      {
        name: 'Combinado Salmão (20 peças)',
        description: '10 sashimis de salmão, 5 niguiris de salmão e 5 uramakis de salmão.',
        price: 55,
        image: '/assets/images/combinado_salmao.png',
        tag: 'Clássico da casa',
        pitch: 'A seleção perfeita para os amantes de salmão.',
        ingredients: ['Salmão fresco', 'Arroz temperado', 'Alga nori'],
      },
      {
        name: 'Combinado Especial (30 peças)',
        description: '10 sashimis variados, 10 niguiris variados e 10 enrolados especiais.',
        price: 85,
        image: '/assets/images/combinado_especial.png',
        tag: 'Mais pedido',
        pitch: 'Variedade e sabor para compartilhar.',
        ingredients: ['Salmão', 'Atum', 'Peixe branco', 'Arroz temperado', 'Alga nori'],
      },
      {
        name: 'Combinado Hot (16 peças)',
        description: '8 hot rolls clássicos e 8 hot rolls especiais com cream cheese e cebolinha.',
        price: 45,
        image: '/assets/images/combinado_hot.png',
        tag: 'Para esquentar',
        pitch: 'A combinação ideal de crocância e cremosidade.',
        ingredients: ['Salmão', 'Cream cheese', 'Arroz temperado', 'Alga nori', 'Massa crocante', 'Cebolinha'],
      },
    ],
  },
  {
    title: 'Temakis',
    items: [
      {
        name: 'Temaki de Salmão Completo',
        description: 'Salmão batido com cream cheese e cebolinha.',
        price: 25,
        tag: 'Favorito',
        pitch: 'Crocante por fora e muito recheado por dentro.',
        ingredients: ['Alga nori', 'Arroz temperado', 'Salmão fresco', 'Cream cheese', 'Cebolinha'],
      },
      {
        name: 'Temaki Hot',
        description: 'Temaki de salmão empanado e frito, com cream cheese e molho tarê.',
        price: 28,
        tag: 'Crocante',
        pitch: 'Sabor intenso com aquele toque agridoce.',
        ingredients: ['Alga nori', 'Arroz temperado', 'Salmão', 'Cream cheese', 'Massa crocante', 'Molho tarê'],
      },
      {
        name: 'Temaki Skin',
        description: 'Pele de salmão grelhada, cream cheese e molho tarê.',
        price: 20,
        tag: 'Saboroso',
        pitch: 'A pele de salmão no ponto perfeito para o seu paladar.',
        ingredients: ['Alga nori', 'Arroz temperado', 'Pele de salmão', 'Cream cheese', 'Molho tarê'],
      },
    ],
  },
  {
    title: 'Bebidas',
    items: [
      {
        name: 'Refrigerante lata',
        description: 'Bebida gelada em lata.',
        price: 6,
        tag: 'Geladinho',
        pitch: 'Companheiro clássico para equilibrar o pedido.',
        ingredients: ['Refrigerante em lata'],
      },
      {
        name: 'Água Mineral',
        description: 'Água mineral sem gás.',
        price: 3,
        tag: 'Essencial',
        pitch: 'Opção leve para acompanhar qualquer pedido.',
        ingredients: ['Água mineral sem gás'],
      },
      {
        name: 'Chá Gelado (Copo)',
        description: 'Chá gelado com limão.',
        price: 8,
        tag: 'Refrescante',
        pitch: 'Refrescante e perfeito para acompanhar sushi.',
        ingredients: ['Chá', 'Limão', 'Gelo'],
      },
    ],
  },
  {
    title: 'Acompanhamentos',
    items: [
      {
        name: 'Sunomono',
        description: 'Saladinha de pepino agridoce com gergelim.',
        price: 12,
        tag: 'Refrescante',
        pitch: 'O acompanhamento clássico e leve.',
        ingredients: ['Pepino', 'Molho agridoce', 'Gergelim'],
      },
      {
        name: 'Porção de Gengibre',
        description: 'Porção de gengibre em conserva.',
        price: 5,
        tag: 'Para limpar o paladar',
        pitch: 'Ideal para saborear entre diferentes tipos de sushi.',
        ingredients: ['Gengibre', 'Conserva doce'],
      },
      {
        name: 'Edamame',
        description: 'Porção de grãos de soja verde cozidos e salgados.',
        price: 15,
        tag: 'Petisco oriental',
        pitch: 'Saudável e muito saboroso para começar.',
        ingredients: ['Edamame', 'Sal marinho'],
      },
    ],
  },
];

export const MENU_ITEMS_BY_NAME = Object.fromEntries(
  MENU_CATEGORIES.flatMap((category) => category.items).map((item) => [item.name, item])
);
