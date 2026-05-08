export function Header() {
  return (
    <header className="header" id="topo">
      <div className="container header-content">
        <a className="logo" href="#inicio" aria-label="Ir para o início">
          <span className="logo-icon" aria-hidden="true">
            <svg className="logo-house-icon" viewBox="0 0 24 24">
              <path d="M3 10.5L12 3l9 7.5"></path>
              <path d="M5.5 9.8V21h13V9.8"></path>
              <path d="M10 21v-6h4v6"></path>
            </svg>
          </span>
          <span className="logo-copy">
            <span className="logo-text">Seu Shima Sushi</span>
            <span className="logo-subtext">Culinária Oriental • Carpina</span>
          </span>
        </a>

        <nav className="nav" aria-label="Menu principal">
          <a href="#inicio">Início</a>
          <a href="#cardapio">Cardápio</a>
          <a href="#localizacao">Localização</a>
          <a href="#contato">Contato</a>
        </nav>
      </div>
    </header>
  );
}
