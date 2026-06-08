export interface CategoryDisplayConfig {
  name: string;
  slug: string;
  order: number;
  matchNames: string[];
}

export const CATEGORY_DISPLAY_ORDER: CategoryDisplayConfig[] = [
  {
    name: 'Experiência do Chef',
    slug: 'experiencia-do-chef',
    order: 1,
    matchNames: ['Experiência do Chef', 'Destaques', 'Mais Vendidos', 'Chef'],
  },
  {
    name: 'Entradas & Ceviche',
    slug: 'entradas-ceviche',
    order: 2,
    matchNames: ['Entradas', 'Ceviche', 'Entradas & Ceviche', 'Acompanhamentos'],
  },
  {
    name: 'Monte seu Poke',
    slug: 'monte-seu-poke',
    order: 3,
    matchNames: ['Monte seu Poke', 'Seja o Chef', 'Poke', 'Pokes'],
  },
  {
    name: 'Sashimi & Carpaccio',
    slug: 'sashimi-carpaccio',
    order: 4,
    matchNames: ['Sashimi', 'Carpaccio', 'Sashimi & Carpaccio'],
  },
  {
    name: 'Sushis Tradicionais',
    slug: 'sushis-tradicionais',
    order: 5,
    matchNames: ['Sushis Tradicionais', 'Gunkas', 'Uramakis', 'Makimonos', 'Sushis'],
  },
  {
    name: 'Hots',
    slug: 'hots',
    order: 6,
    matchNames: ['Hots', 'Hot', 'Temakis', 'Hot Rolls'],
  },
  {
    name: 'Combinados',
    slug: 'combinados',
    order: 7,
    matchNames: ['Combinados', 'Combinados Individuais'],
  },
  {
    name: 'Pratos Quentes & Yakisobas',
    slug: 'pratos-quentes-yakisobas',
    order: 8,
    matchNames: ['Pratos Quentes', 'Yakisobas', 'Yakisobas Individuais'],
  },
  {
    name: 'Bebidas',
    slug: 'bebidas',
    order: 9,
    matchNames: ['Bebidas'],
  },
  {
    name: 'Sobremesas',
    slug: 'sobremesas',
    order: 10,
    matchNames: ['Sobremesas', 'Doces'],
  },
  {
    name: 'Complementos',
    slug: 'complementos',
    order: 11,
    matchNames: ['Complementos', 'Adicionais', 'Extras'],
  },
];

export function getCategoryDisplay(name: string): CategoryDisplayConfig {
  const encontrada = CATEGORY_DISPLAY_ORDER.find((c) =>
    c.matchNames.some((m) => m.toLowerCase() === name.toLowerCase().trim()),
  );
  if (encontrada) return encontrada;
  return {
    name,
    slug: name.toLowerCase().replace(/&/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    order: 999,
    matchNames: [name],
  };
}
