import React from 'react';

interface RotatingRibbonsProps {
  navigate?: (route: string) => void;
}

export const RotatingRibbons: React.FC<RotatingRibbonsProps> = ({ navigate }) => {
  const repeatedText = Array(12).fill('CONTACT US');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigate) {
      navigate('/contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative py-28 md:py-36 overflow-hidden select-none bg-white">
      {/* Background Ribbon 2: Rotated +6deg with lower opacity */}
      <div
        onClick={handleClick}
        data-cursor="pointer"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] bg-median-taupe/40 text-white py-4 md:py-6 flex items-center cursor-pointer shadow-lg transition-transform duration-500 hover:scale-105"
        style={{
          transform: 'translate(-50%, -50%) rotate(6deg) scale(1.15)',
        }}
      >
        <div className="flex whitespace-nowrap animate-marquee-right">
          {[...repeatedText, ...repeatedText].map((text, idx) => (
            <div key={idx} className="flex items-center">
              <span className="font-oswald text-4xl sm:text-6xl md:text-7xl font-bold uppercase tracking-tight mx-4 text-white">
                {text}
              </span>
              <span className="w-3 h-3 rounded-full bg-white mx-3 inline-block" />
            </div>
          ))}
        </div>
      </div>

      {/* Foreground Ribbon 1: Rotated -6deg in solid Median Bronze */}
      <div
        onClick={handleClick}
        data-cursor="pointer"
        className="relative z-10 w-[140vw] -left-[20vw] bg-median-taupe text-white py-5 md:py-7 flex items-center cursor-pointer shadow-2xl transition-all duration-500 hover:scale-[1.18] group"
        style={{
          transform: 'rotate(-6deg) scale(1.15)',
        }}
      >
        <div className="flex whitespace-nowrap animate-marquee-left group-hover:[animation-play-state:paused]">
          {[...repeatedText, ...repeatedText].map((text, idx) => (
            <div key={idx} className="flex items-center">
              <span className="font-oswald text-4xl sm:text-6xl md:text-7xl font-bold uppercase tracking-tight mx-4 text-white drop-shadow-sm">
                {text}
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-white mx-3 inline-block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
