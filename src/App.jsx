import { useEffect, useState } from 'react';
import { APP_CONFIG, INITIAL_CHECKOUT_FORM } from './config/app.js';
import { CartDrawer } from './components/cart/CartDrawer.jsx';
import { FloatingCartButton } from './components/cart/FloatingCartButton.jsx';
import { CheckoutModal } from './components/checkout/CheckoutModal.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { Header } from './components/layout/Header.jsx';
import { HeroSection } from './components/layout/HeroSection.jsx';
import { LocationSection } from './components/layout/LocationSection.jsx';
import { MenuSection } from './components/menu/MenuSection.jsx';
import { ProductDetailsModal } from './components/menu/ProductDetailsModal.jsx';
import { useBodyScrollLock } from './hooks/useBodyScrollLock.js';
import { usePersistentCart } from './hooks/usePersistentCart.js';
import { addItemToCart, getCartTotals, removeSingleItemFromCart } from './utils/cart.js';
import { getStoredCheckoutForm, persistCheckoutForm, updateCheckoutForm } from './utils/checkout.js';
import { getStoredLastOrder, persistLastOrder } from './utils/orderHistory.js';
import { buildWhatsAppMessage } from './utils/whatsapp.js';
import { getStoreStatus } from './utils/storeStatus.js';

function App() {
  const [cart, setCart] = usePersistentCart(APP_CONFIG.storage.cartKey);
  const [orderNote, setOrderNote] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState(() =>
    getStoredCheckoutForm(APP_CONFIG.storage.checkoutKey, INITIAL_CHECKOUT_FORM),
  );
  const [lastOrder, setLastOrder] = useState(() =>
    getStoredLastOrder(APP_CONFIG.storage.orderHistoryKey, APP_CONFIG.business.timeZone),
  );
  const [addedItemName, setAddedItemName] = useState('');
  const [storeStatus, setStoreStatus] = useState(() => getStoreStatus(APP_CONFIG.business));

  useBodyScrollLock(isCartOpen || isCheckoutOpen || Boolean(selectedItem));

  useEffect(() => {
    if (!addedItemName) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setAddedItemName('');
    }, 1100);

    return () => window.clearTimeout(timeoutId);
  }, [addedItemName]);

  useEffect(() => {
    if (!selectedItem) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setSelectedItem(null);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedItem]);

  useEffect(() => {
    function updateStoreStatus() {
      setStoreStatus(getStoreStatus(APP_CONFIG.business));
    }

    updateStoreStatus();
    const intervalId = window.setInterval(updateStoreStatus, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    persistCheckoutForm(APP_CONFIG.storage.checkoutKey, checkoutForm);
  }, [checkoutForm]);

  const { totalItems, totalPrice } = getCartTotals(cart);
  const isOrderingOpen = storeStatus.isOpenNow;

  function handleAddToCart(name, price, quantity = 1) {
    if (!isOrderingOpen) {
      window.alert('O Seu Shima Sushi está fechado no momento. Os pedidos voltam das 17h às 22h.');
      return;
    }

    setCart((currentCart) => addItemToCart(currentCart, name, price, quantity));
    setAddedItemName(name);
  }

  function handleRemoveOne(name) {
    setCart((currentCart) => removeSingleItemFromCart(currentCart, name));
  }

  function handleOpenCheckout() {
    if (!isOrderingOpen) {
      window.alert('O Seu Shima Sushi está fechado no momento. Os pedidos voltam no próximo horário de funcionamento.');
      return;
    }

    if (cart.length === 0) {
      window.alert('Adicione pelo menos 1 item no carrinho antes de concluir o pedido.');
      return;
    }

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }

  function handleFormChange(event) {
    setCheckoutForm((currentForm) => updateCheckoutForm(currentForm, event.target));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formElement = event.currentTarget;
    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      return;
    }

    const message = buildWhatsAppMessage(cart, orderNote, checkoutForm);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${APP_CONFIG.contact.whatsappNumber}?text=${encodedMessage}`;
    const orderSnapshot = {
      createdAt: new Date().toISOString(),
      deliveryType: checkoutForm.deliveryType,
      totalItems,
      totalPrice,
      orderNote: orderNote.trim(),
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    };

    window.open(url, '_blank', 'noopener,noreferrer');
    persistLastOrder(APP_CONFIG.storage.orderHistoryKey, orderSnapshot);
    setLastOrder(
      getStoredLastOrder(APP_CONFIG.storage.orderHistoryKey, APP_CONFIG.business.timeZone),
    );
    setCart([]);
    setOrderNote('');
    setIsCheckoutOpen(false);
  }

  return (
    <>
      <div className="brand-watermark" aria-hidden="true">
      </div>

      <Header />

      <main>
        <HeroSection
          onSelectItem={setSelectedItem}
          storeStatus={storeStatus}
          scheduleLabel={APP_CONFIG.business.scheduleLabel}
        />
        <MenuSection onSelectItem={setSelectedItem} />
        <LocationSection />
      </main>

      <CartDrawer
        cart={cart}
        totalItems={totalItems}
        totalPrice={totalPrice}
        orderNote={orderNote}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderNoteChange={setOrderNote}
        onAddOne={handleAddToCart}
        onRemoveOne={handleRemoveOne}
        onClearCart={() => setCart([])}
        onCheckout={handleOpenCheckout}
        isOrderingOpen={isOrderingOpen}
        storeStatus={storeStatus}
      />

      <FloatingCartButton
        totalItems={totalItems}
        totalPrice={totalPrice}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <Footer
        phoneNumber={APP_CONFIG.contact.phoneNumber}
        phoneLabel={APP_CONFIG.contact.phoneLabel}
        storeStatus={storeStatus}
        scheduleLabel={APP_CONFIG.business.scheduleLabel}
        lastOrder={lastOrder}
      />

      <ProductDetailsModal
        item={selectedItem}
        isAdded={selectedItem ? addedItemName === selectedItem.name : false}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
        isOrderingOpen={isOrderingOpen}
        storeStatus={storeStatus}
      />

      <CheckoutModal
        form={checkoutForm}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        totalItems={totalItems}
        totalPrice={totalPrice}
      />
    </>
  );
}

export default App;
