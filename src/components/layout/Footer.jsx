export function Footer({ phoneNumber, phoneLabel, scheduleLabel, storeStatus, lastOrder }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="contato">
      <div className="container footer-content">
        <div>
          <h3>Seu Shima Sushi</h3>
          <p>Avenida Padre Rocha, 539 - São José, Carpina - PE</p>
        </div>

        <div>
          <h4>Horário de funcionamento</h4>
          <p>{scheduleLabel}</p>
          <p className={`footer-status${storeStatus.isOpenNow ? ' is-open' : ' is-closed'}`}>
            {storeStatus.statusLabel} • {storeStatus.detailLabel}
          </p>
        </div>

        <div>
          <h4>Redes sociais</h4>
          <ul className="social-list">
            <li>
              <a
                className="social-icon-link"
                href="https://www.instagram.com/house_burguer_grill?igsh=cXZ1YmhhbGt3Y3hr"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"></rect>
                  <circle cx="12" cy="12" r="4.2"></circle>
                  <circle cx="17.2" cy="6.8" r="1"></circle>
                </svg>
              </a>
            </li>
            <li>
              <a
                className="phone-contact-link"
                href={`tel:${phoneNumber}`}
                aria-label="Telefone para contato"
              >
                <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6.7 3.5h3.1l1.4 3.5-1.9 1.9a16 16 0 0 0 6 6l1.9-1.9 3.5 1.4v3.1c0 .6-.4 1-1 1C10.2 19.5 4.5 13.8 4.5 6.5c0-.6.4-1 1-1z"></path>
                </svg>
                <span>{phoneLabel}</span>
              </a>
            </li>
          </ul>
        </div>

        {lastOrder ? (
          <div className="footer-last-order">
            <h4>Ultimo pedido</h4>
            <p>{lastOrder.formattedDate}</p>
            <p>
              {lastOrder.deliveryType} • {lastOrder.totalItems} {lastOrder.totalItems === 1 ? 'item' : 'itens'}
            </p>
            {lastOrder.items.length ? (
              <ul className="footer-last-order-items">
                {lastOrder.items.map((item) => (
                  <li key={item.name}>
                    <span>{item.quantity}x</span>
                    <strong>{item.name}</strong>
                  </li>
                ))}
              </ul>
            ) : null}
            {lastOrder.orderNote ? (
              <p className="footer-last-order-note">Obs.: {lastOrder.orderNote}</p>
            ) : null}
            <p className="footer-last-order-total">{lastOrder.formattedTotal}</p>
          </div>
        ) : null}
      </div>

      <div className="container footer-bottom">
        <p className="footer-legal">
          {`\u00A9 ${currentYear} Seu Shima Sushi todos os direitos reservados`}
        </p>
        <p className="footer-credit">
          
          <a
            className="footer-credit-link"
            href="https://www.linkedin.com/in/danillomartins/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir LinkedIn de Danillo Martins"
          >
            Desenvolvido por Danillo Martins
          </a>
        </p>
      </div>
    </footer>
  );
}
