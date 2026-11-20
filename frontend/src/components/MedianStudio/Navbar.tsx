import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';

interface NavbarProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
  activeRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMenu,
  isMenuOpen,
  activeRoute,
  navigate,
}) => {
  const { totalCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md py-3 sm:py-4 border-b border-median-taupe/15 shadow-sm'
          : 'bg-transparent py-4 sm:py-6 md:py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        {/* Left Social Icons - Hidden on mobile to prevent overlapping, visible from md up */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
          {[
            { name: 'X', icon: '/assets/x.png', href: 'https://twitter.com' },
            { name: 'Facebook', icon: '/assets/facebook.png', href: 'https://facebook.com' },
            { name: 'Dribbble', icon: '/assets/dribbble.png', href: 'https://dribbble.com' },
            { name: 'LinkedIn', icon: '/assets/linkedin.png', href: 'https://linkedin.com' },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              data-cursor="pointer"
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-median-taupe/40 flex items-center justify-center transition-all duration-300 hover:border-median-taupe hover:bg-median-taupe hover:text-white group"
            >
              <img
                src={item.icon}
                alt={item.name}
                className="w-3 h-3 lg:w-3.5 lg:h-3.5 object-contain transition-all duration-300 group-hover:invert group-hover:brightness-0"
              />
            </a>
          ))}
        </div>

        {/* Brand Logo - Aligned left on mobile, perfectly centered on md+ */}
        <button
          onClick={() => navigate('/')}
          aria-label="Monolith LK Home"
          data-cursor="pointer"
          className="flex items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2 transition-transform duration-300 hover:scale-105 focus:outline-none group"
        >
          <span className="w-4 h-4 bg-black flex items-center justify-center text-white text-[9px] font-bold">
            ■
          </span>
          <span className="font-oswald text-xl sm:text-2xl font-bold tracking-[0.2em] text-black uppercase transition-colors group-hover:text-median-taupe">
            MONOLITH<span className="text-median-taupe ml-1">LK</span>
          </span>
        </button>

        {/* Right Actions: Portal Button, Cart & Menu Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Portal Access Button */}
          <button
            onClick={() => navigate('/portal/login')}
            data-cursor="pointer"
            aria-label="Open Client & Studio Portal"
            className="flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-full border border-black bg-black text-white hover:bg-median-taupe hover:border-median-taupe text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold transition-all duration-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Portal</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            aria-label={`Open Cart with ${totalCount} items`}
            data-cursor="pointer"
            className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-full border border-median-taupe/40 hover:border-median-taupe transition-all duration-300 hover:bg-median-taupe/5 group"
          >
            <img
              src="/assets/cart.png"
              alt="Cart"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain opacity-80 group-hover:opacity-100"
            />
            <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-median-taupe text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center">
              {totalCount}
            </span>
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={onOpenMenu}
            aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
            data-cursor="pointer"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-median-taupe/40 hover:border-median-taupe flex flex-col justify-center items-center gap-1 sm:gap-1.5 transition-all duration-300 group focus:outline-none"
          >
            <span
              className={`w-4 sm:w-5 h-[2px] bg-median-taupe transition-all duration-300 origin-center ${
                isMenuOpen ? 'rotate-45 translate-y-1.5 sm:translate-y-2' : ''
              }`}
            />
            <span
              className={`w-4 sm:w-5 h-[2px] bg-median-taupe transition-all duration-300 origin-center ${
                isMenuOpen ? '-rotate-45 -translate-y-1 sm:-translate-y-[2px]' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
