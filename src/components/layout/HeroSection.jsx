import { useState } from 'react';
import { MENU_CATEGORIES } from '../../data/menu.js';
import { FoodIllustration } from '../menu/FoodIllustration.jsx';

const FEATURED_ITEMS = MENU_CATEGORIES[0].items.slice(0, 3);

export function HeroSection({ onSelectItem, scheduleLabel, storeStatus }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = FEATURED_ITEMS[activeIndex];

  return (
    <section className="hero" id="inicio">
      <div className="overlay"></div>
      <div className="container hero-content">
        <div className="hero-announcement">
          <span className="hero-announcement-dot"></span>
          <span>Sushi fresco e artesanal montado na hora e pedido fechado em poucos toques</span>
        </div>
        <div className={`hero-status-badge${storeStatus.isOpenNow ? ' is-open' : ' is-closed'}`}>
          <strong>{storeStatus.statusLabel}</strong>
          <span>{storeStatus.detailLabel}</span>
        </div>
        <p className="hero-tag">Sabor oriental, ingredientes frescos e muita qualidade</p>
        <h1>Seu sushi da noite está aqui, saboroso, fresco e com cara de vício</h1>
        <p>
          Do clássico bem montado aos combinados especiais da casa, cada prato foi pensado
          para dar fome no olhar e satisfação de verdade na primeira mordida.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#cardapio">
            Ver cardápio completo
          </a>
          <a className="btn btn-outline" href="#localizacao">
            Onde estamos
          </a>
        </div>
        <p className="hero-schedule-note">{scheduleLabel}</p>

        <div className="hero-proof-grid">
          <article className="hero-proof-card">
            <strong>Arroz temperado e montagem caprichada</strong>
            <p>Visual bonito, sabor equilibrado e ingredientes frescos em cada peça.</p>
          </article>
          <article className="hero-proof-card">
            <strong>Salmão fresco e cream cheese</strong>
            <p>Os favoritos da casa aparecem com força no sabor e na textura.</p>
          </article>
          <article className="hero-proof-card">
            <strong>Pedido direto no WhatsApp</strong>
            <p>Você escolhe, ajusta e finaliza rápido sem fluxo enrolado.</p>
          </article>
        </div>

        <div className="hero-highlight-bar">
          <div className="hero-highlight-item">
            <span className="hero-highlight-value">Combinados</span>
            <span className="hero-highlight-label">
              peças frescas, salmão de qualidade e equilíbrio perfeito
            </span>
          </div>
          <div className="hero-highlight-item">
            <span className="hero-highlight-value">Temakis</span>
            <span className="hero-highlight-label">
              crocantes e recheados para quem quer mais pegada
            </span>
          </div>
          <div className="hero-highlight-item">
            <span className="hero-highlight-value">Especiais Quentes</span>
            <span className="hero-highlight-label">
              porções generosas para matar a fome de verdade
            </span>
          </div>
        </div>

        <div className="hero-desktop-feature">
          <button
            className="hero-desktop-feature-card"
            type="button"
            onClick={() => onSelectItem(activeItem)}
          >
            <div className="hero-desktop-feature-copy">
              <span>{activeItem.tag}</span>
              <strong>{activeItem.name}</strong>
              <p>{activeItem.pitch}</p>
            </div>
            <div className="hero-desktop-feature-art">
              <FoodIllustration item={activeItem} />
            </div>
          </button>
        </div>

        <div className="hero-slider hero-mobile-slider">
          <div className="hero-slider-head">
            <p className="hero-slider-label">Mais pedidos da casa</p>
            <span className="hero-slider-caption">Toque em um item para abrir os detalhes</span>
          </div>
          <div className="hero-slider-shell">
            <button
              className="hero-featured-card"
              type="button"
              onClick={() => onSelectItem(activeItem)}
            >
              <div className="hero-featured-media">
                <FoodIllustration item={activeItem} />
                <div className="hero-featured-overlay">
                  <span>{activeItem.tag}</span>
                  <strong>{activeItem.name}</strong>
                </div>
              </div>
              <div className="hero-featured-footer">
                <p>{activeItem.pitch}</p>
                <div className="hero-featured-dots" aria-hidden="true">
                  {FEATURED_ITEMS.map((item, index) => (
                    <span
                      key={item.name}
                      className={index === activeIndex ? 'is-active' : ''}
                    ></span>
                  ))}
                </div>
              </div>
            </button>

            <div className="hero-slider-track" aria-label="Vitrine de pratos em destaque">
              {FEATURED_ITEMS.map((item, index) => (
                <button
                  className={`hero-burger-card${index === activeIndex ? ' is-active' : ''}`}
                  type="button"
                  key={item.name}
                  onClick={() => setActiveIndex(index)}
                >
                  <FoodIllustration item={item} />
                  <div className="hero-burger-copy">
                    <strong>{item.name}</strong>
                    <span>{item.tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
