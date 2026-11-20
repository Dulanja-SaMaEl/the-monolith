import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './CartContext';
import { Preloader } from './Preloader';
import { CustomCursor } from './CustomCursor';
import { Navbar } from './Navbar';
import { FullscreenMenu } from './FullscreenMenu';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { Footer } from './Footer';

// Pages
import { HomePage } from './HomePage';
import { AboutPage } from './AboutPage';
import { WorkPage } from './WorkPage';
import { PricingPage } from './PricingPage';
import { BlogPage } from './BlogPage';
import { ContactPage } from './ContactPage';
import { StyleGuidePage } from './StyleGuidePage';

interface MedianStudioProps {
  onSwitchView?: (view: 'ncloud' | 'jack' | 'halo' | 'median') => void;
}

const MedianStudioContent: React.FC<MedianStudioProps> = ({ onSwitchView }) => {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        return hash.replace('#', '');
      } else if (hash.startsWith('#median/')) {
        return '/' + hash.replace('#median/', '');
      }
    }
    return '/';
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isCheckoutOpen, closeCheckout } = useCart();

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        setCurrentRoute(hash.replace('#', ''));
      } else if (hash.startsWith('#median/')) {
        setCurrentRoute('/' + hash.replace('#median/', ''));
      } else if (hash === '' || hash === '#' || hash === '#median') {
        setCurrentRoute('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (route === '/') {
      window.history.pushState({}, '', window.location.pathname);
    } else {
      window.history.pushState({}, '', `#${route}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentRoute) {
      case '/about':
        return <AboutPage navigate={navigate} />;
      case '/work':
      case '/works':
        return <WorkPage navigate={navigate} />;
      case '/pricing':
        return <PricingPage navigate={navigate} />;
      case '/blog':
      case '/blog-1':
        return <BlogPage navigate={navigate} />;
      case '/contact':
      case '/contact-1':
        return <ContactPage navigate={navigate} />;
      case '/style-guide':
      case '/template-info/style-guide':
      case '/template-info/licensing':
        return <StyleGuidePage navigate={navigate} />;
      case '/':
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="median-root min-h-screen flex flex-col bg-white text-median-taupe font-inter selection:bg-median-taupe selection:text-white relative">
      {/* Preloader on initial load */}
      <Preloader />

      {/* Smooth Magnetic Custom Cursor */}
      <CustomCursor />

      {/* Global Navigation Bar */}
      <Navbar
        onOpenMenu={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
        activeRoute={currentRoute}
        navigate={navigate}
      />

      {/* Fullscreen Sliding Menu */}
      <FullscreenMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeRoute={currentRoute}
        navigate={navigate}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer navigate={navigate} />

      {/* Secure Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={closeCheckout} />

      {/* Main Page View */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Global Persistent Footer */}
      <Footer navigate={navigate} />
    </div>
  );
};

export const MedianStudio: React.FC<MedianStudioProps> = (props) => {
  return (
    <CartProvider>
      <MedianStudioContent {...props} />
    </CartProvider>
  );
};

export default MedianStudio;
