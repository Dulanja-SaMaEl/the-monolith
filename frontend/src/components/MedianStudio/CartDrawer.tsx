import React, { useEffect } from 'react';
import { useCart } from './CartContext';

interface CartDrawerProps {
  navigate: (route: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    openCheckout,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          isCartOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[450px] z-[1001] bg-white text-median-taupe flex flex-col justify-between shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-median-taupe/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="font-oswald text-2xl font-bold uppercase tracking-wide text-black">
              Your Cart
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-median-taupe text-white font-bold">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>

          <button
            onClick={closeCart}
            aria-label="Close Cart"
            data-cursor="pointer"
            className="w-9 h-9 rounded-full border border-median-taupe/30 hover:border-median-taupe flex items-center justify-center transition-colors group"
          >
            <span className="text-sm font-bold text-median-taupe group-hover:rotate-90 transition-transform duration-300">
              ✕
            </span>
          </button>
        </div>

        {/* Item List / Empty State */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-median-taupe/40 flex items-center justify-center mb-4">
                <img
                  src="/assets/cart.png"
                  alt="Empty Cart"
                  className="w-7 h-7 object-contain opacity-50"
                />
              </div>
              <h5 className="font-oswald text-xl font-semibold uppercase text-black mb-1">
                No items in your cart
              </h5>
              <p className="text-xs text-median-taupe/80 max-w-xs mb-6">
                Explore our studio packages, single-page website designs, or bespoke digital solutions.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/pricing');
                }}
                data-cursor="pointer"
                className="px-6 py-3 rounded-full bg-median-taupe text-white text-xs font-bold tracking-wider uppercase hover:bg-black transition-colors"
              >
                Discover Packages
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-6 border-b border-median-taupe/15 last:border-b-0"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-median-taupe/10 flex-shrink-0 border border-median-taupe/20">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h5 className="font-oswald text-base font-semibold uppercase text-black">
                        {item.title}
                      </h5>
                      {item.type && (
                        <span className="text-[11px] text-median-taupe/70 uppercase">
                          {item.type}
                        </span>
                      )}
                    </div>
                    <span className="font-oswald text-base font-semibold text-black">
                      ${item.price.toFixed(2)} USD
                    </span>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between mt-3 pt-2">
                    <div className="flex items-center border border-median-taupe/40 rounded-full px-2 py-0.5 gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-xs font-bold px-1 hover:text-black"
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>
                      <span className="text-xs font-bold text-black min-w-3 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-xs font-bold px-1 hover:text-black"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[11px] font-semibold text-median-taupe/70 hover:text-red-500 uppercase transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Subtotal & Checkout */}
        {items.length > 0 && (
          <div className="p-6 md:p-8 border-t border-median-taupe/20 bg-median-taupe/5 space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold text-black">
              <span>SUBTOTAL</span>
              <span className="font-oswald text-xl">
                ${subtotal.toFixed(2)} USD
              </span>
            </div>
            <p className="text-[11px] text-median-taupe/70 leading-relaxed">
              Taxes calculated at checkout. Includes instant source code delivery and studio commercial license.
            </p>
            <button
              onClick={openCheckout}
              data-cursor="pointer"
              className="w-full py-4 rounded-xl bg-median-taupe hover:bg-black text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Continue to Checkout</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};
