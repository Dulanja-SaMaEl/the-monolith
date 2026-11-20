import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useCart } from './CartContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, subtotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: 'Jackson Miller',
    email: 'jackson@innovate.studio',
    cardNumber: '•••• •••• •••• 4242',
    expDate: '12/28',
    cvc: '888',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9F8170', '#141414', '#FAF8F5', '#d4af37'],
        });
      } catch (err) {
        // Fallback if canvas-confetti is not loaded
      }

      clearCart();
    }, 1200);
  };

  const handleFinish = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Box */}
      <div className="relative z-10 bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-median-taupe/30 overflow-hidden text-median-taupe">
        {/* Top Bar */}
        <div className="bg-median-taupe text-white p-6 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase opacity-80">
              MONOLITH LK SECURE CHECKOUT
            </span>
            <h3 className="font-oswald text-2xl font-bold tracking-wide uppercase text-white">
              {isSuccess ? 'Order Confirmed' : 'Complete Your Purchase'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-median-taupe/15 text-median-taupe flex items-center justify-center text-3xl font-bold">
              ✓
            </div>
            <div>
              <h4 className="font-oswald text-2xl font-bold text-black uppercase mb-2">
                Thank You For Your Order!
              </h4>
              <p className="text-xs text-median-taupe/80 max-w-sm mx-auto leading-relaxed">
                Your license keys and deliverables have been dispatched to{' '}
                <strong className="text-black">{formData.email}</strong>. Welcome to the Monolith LK collective.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-median-taupe/5 border border-median-taupe/20 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-median-taupe/70">Transaction ID:</span>
                <span className="font-mono font-bold text-black">#MNL-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-median-taupe/70">Total Paid:</span>
                <span className="font-bold text-black">${subtotal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-median-taupe/70">Status:</span>
                <span className="text-green-600 font-bold">Verified & Active</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              data-cursor="pointer"
              className="w-full py-3.5 rounded-xl bg-median-taupe hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Return to Studio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            {/* Order Summary snippet */}
            <div className="p-4 rounded-xl bg-median-taupe/5 border border-median-taupe/15 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-black">
                <span>ITEMS ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-oswald text-base">${subtotal.toFixed(2)} USD</span>
              </div>
              <div className="text-[11px] text-median-taupe/70 truncate">
                {items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-median-taupe/70 uppercase mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-median-taupe/30 focus:border-median-taupe focus:ring-1 focus:ring-median-taupe text-black text-xs font-medium outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-median-taupe/70 uppercase mb-1">
                  Email Address for Delivery
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-median-taupe/30 focus:border-median-taupe focus:ring-1 focus:ring-median-taupe text-black text-xs font-medium outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-median-taupe/70 uppercase mb-1">
                  Credit / Debit Card Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-median-taupe/30 focus:border-median-taupe focus:ring-1 focus:ring-median-taupe text-black text-xs font-mono outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-median-taupe/70 uppercase mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.expDate}
                    onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-median-taupe/30 focus:border-median-taupe focus:ring-1 focus:ring-median-taupe text-black text-xs font-mono outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-median-taupe/70 uppercase mb-1">
                    Security Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cvc}
                    onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-median-taupe/30 focus:border-median-taupe focus:ring-1 focus:ring-median-taupe text-black text-xs font-mono outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isProcessing}
              data-cursor="pointer"
              className="w-full py-4 rounded-xl bg-median-taupe hover:bg-black text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay ${subtotal.toFixed(2)} USD</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
