const INGREDIENT_STYLES = [
  { match: /salmão|atum/i, fill: '#ff7e67', stroke: '#e85a4f', height: 18, type: 'fish' },
  { match: /arroz/i, fill: '#ffffff', stroke: '#e0e0e0', height: 14, type: 'rice' },
  { match: /nori|alga/i, fill: '#2e3b32', stroke: '#1a2421', height: 6, type: 'nori' },
  { match: /cream cheese/i, fill: '#fffdd0', stroke: '#e6e4a8', height: 10, type: 'cheese' },
  { match: /cebolinha|pepino/i, fill: '#69b34c', stroke: '#4b8b36', height: 8, type: 'veg' },
  { match: /crocante|empanado/i, fill: '#e8b76a', stroke: '#c88f44', height: 12, type: 'crunch' },
  {
    match: /água|suco|refrigerante|chá/i,
    fill: '#61b7ff',
    stroke: '#3c8bce',
    height: 42,
    type: 'drink',
  },
];

function getIngredientStyle(ingredient) {
  return INGREDIENT_STYLES.find((style) => style.match.test(ingredient));
}

export function FoodIllustration({ item }) {
  if (item.image) {
    return (
      <img
        className="product-illustration product-photo"
        src={item.image}
        alt={item.name}
        loading="lazy"
      />
    );
  }

  const visibleIngredients = item.ingredients.slice(0, 6);
  const drinkStyle = visibleIngredients
    .map(getIngredientStyle)
    .find((style) => style?.type === 'drink');

  if (drinkStyle) {
    return (
      <svg className="product-illustration" viewBox="0 0 320 240" role="img" aria-label={item.name}>
        <defs>
          <linearGradient id="drink-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a1608" />
            <stop offset="100%" stopColor="#120b05" />
          </linearGradient>
          <linearGradient id="drink-liquid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86d0ff" />
            <stop offset="100%" stopColor="#2f84d6" />
          </linearGradient>
        </defs>
        <rect width="320" height="240" rx="32" fill="url(#drink-bg)" />
        <circle cx="92" cy="56" r="34" fill="rgba(246,190,59,0.16)" />
        <circle cx="252" cy="188" r="48" fill="rgba(246,190,59,0.12)" />
        <rect x="118" y="42" width="84" height="18" rx="9" fill="#f0db99" />
        <rect x="132" y="30" width="10" height="48" rx="5" fill="#f4e7bf" />
        <path
          d="M102 62h116l-16 128a18 18 0 0 1-18 16h-48a18 18 0 0 1-18-16Z"
          fill="rgba(255,255,255,0.14)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
        />
        <path
          d="M114 76h92l-11 95a12 12 0 0 1-12 10h-46a12 12 0 0 1-12-10Z"
          fill="url(#drink-liquid)"
        />
        <text
          x="160"
          y="222"
          textAnchor="middle"
          fill="#ffd05a"
          fontFamily="Barlow, sans-serif"
          fontSize="18"
          fontWeight="700"
        >
          {item.tag}
        </text>
      </svg>
    );
  }

  // Desenho simplificado de um sushi para itens sem foto
  return (
    <svg className="product-illustration" viewBox="0 0 320 240" role="img" aria-label={item.name}>
      <defs>
        <linearGradient id="bg-sushi" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#241307" />
          <stop offset="100%" stopColor="#110904" />
        </linearGradient>
        <linearGradient id="salmon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7e67" />
          <stop offset="100%" stopColor="#e85a4f" />
        </linearGradient>
      </defs>

      <rect width="320" height="240" rx="32" fill="url(#bg-sushi)" />
      <circle cx="68" cy="58" r="34" fill="rgba(246,190,59,0.14)" />
      <circle cx="256" cy="186" r="48" fill="rgba(246,190,59,0.12)" />

      <ellipse cx="160" cy="194" rx="92" ry="14" fill="rgba(0,0,0,0.35)" />

      {/* Base de Arroz (Niguiri style) */}
      <rect x="110" y="130" width="100" height="40" rx="20" fill="#ffffff" stroke="#e0e0e0" strokeWidth="2" />

      {/* Fatia de Peixe */}
      <path d="M90 140 Q 160 110 230 140 Q 230 160 160 130 Q 90 160 90 140" fill="url(#salmon-grad)" stroke="#e85a4f" strokeWidth="2" />

      {/* Faixa de Nori */}
      <rect x="150" y="125" width="20" height="50" fill="#2e3b32" stroke="#1a2421" strokeWidth="1" />

      <text
        x="160"
        y="224"
        textAnchor="middle"
        fill="#ffd05a"
        fontFamily="Barlow, sans-serif"
        fontSize="18"
        fontWeight="700"
      >
        {item.tag}
      </text>
    </svg>
  );
}
