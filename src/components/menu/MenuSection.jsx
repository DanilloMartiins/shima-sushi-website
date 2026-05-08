import { useEffect, useMemo, useState } from 'react';
import { MENU_CATEGORIES } from '../../data/menu.js';
import { MenuCard } from './MenuCard.jsx';

function toCategoryId(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function MenuSection({ onSelectItem }) {
  const categories = useMemo(
    () =>
      MENU_CATEGORIES.map((category) => ({
        ...category,
        id: toCategoryId(category.title),
      })),
    []
  );
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? '');

  useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(category.id))
      .filter(Boolean);
    const navElement = document.querySelector('.menu-category-nav');

    if (sections.length === 0 || !navElement) {
      return undefined;
    }

    let ticking = false;

    function updateActiveCategory() {
      const navBottom = navElement.getBoundingClientRect().bottom;
      const triggerLine = navBottom + 24;
      let currentId = sections[0].id;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;

        if (sectionTop <= triggerLine && sectionBottom > triggerLine) {
          currentId = section.id;
          break;
        }

        if (sectionTop <= triggerLine) {
          currentId = section.id;
        }
      }

      setActiveCategoryId(currentId);
    }

    function handleScrollOrResize() {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveCategory();
        ticking = false;
      });
    }

    updateActiveCategory();
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [categories]);

  return (
    <section className="menu section" id="cardapio">
      <div className="container">
        <div className="section-title menu-section-title">
          <p className="section-tag">Cardápio</p>
          <h2>Cardápio com presença de culinária oriental</h2>
          <p className="menu-section-subtitle">
            Combinados frescos, temakis crocantes e pratos tradicionais. Toque em
            um item para abrir os detalhes.
          </p>
        </div>

        <nav className="menu-category-nav" aria-label="Categorias do cardápio">
          {categories.map((category) => (
            <a
              key={category.title}
              className={`menu-category-pill${activeCategoryId === category.id ? ' is-active' : ''}`}
              href={`#${category.id}`}
              aria-current={activeCategoryId === category.id ? 'true' : undefined}
              onClick={(event) => {
                window.setTimeout(() => {
                  event.currentTarget.blur();
                }, 0);
              }}
            >
              {category.title}
            </a>
          ))}
        </nav>

        {categories.map((category) => (
          <div className="menu-category-block" id={category.id} key={category.title}>
            <div className="menu-category-header">
              <h3 className="menu-category-title">{category.title}</h3>
              <span className="menu-category-count">{category.items.length} opções</span>
            </div>
            <div className="menu-grid">
              {category.items.map((item) => (
                <MenuCard key={item.name} item={item} onSelect={onSelectItem} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
