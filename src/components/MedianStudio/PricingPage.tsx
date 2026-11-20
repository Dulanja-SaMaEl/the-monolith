import React, { useState } from 'react';
import { PRICING_PLANS, FAQS } from './siteData';
import { useCart } from './CartContext';
import { RotatingRibbons } from './RotatingRibbons';
import { ScrollReveal, StaggerContainer } from './ScrollReveal';

interface PricingPageProps {
  navigate: (route: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate }) => {
  const { addToCart } = useCart();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSelectPlan = (plan: typeof PRICING_PLANS[0]) => {
    const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
    addToCart({
      id: plan.id,
      title: `${plan.title} (${isAnnual ? 'Annual' : 'Monthly'})`,
      price: price,
      image: '/assets/work-4.jpg',
      type: 'Studio License',
    });
  };

  return (
    <div className="pt-32 pb-16 bg-white text-median-taupe">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <ScrollReveal variant="scale-up" duration={900}>
          <div className="border border-median-taupe/20 rounded-2xl p-8 sm:p-16 relative bg-median-taupe/5">
            <span className="absolute -top-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -top-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />

            <span className="text-xs font-bold tracking-widest uppercase text-median-taupe block mb-4">
              Transparent Investment & Licenses
            </span>
            <h1 className="font-oswald text-5xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tight text-black leading-none mb-6">
              Our Prices
            </h1>
            <p className="text-sm sm:text-lg text-black/85 max-w-2xl font-normal leading-relaxed">
              Select a commercial package tailored to your scope. Every plan comes with full source code ownership, zero hidden fees, and dedicated technical support.
            </p>

            {/* Billing Toggle */}
            <div className="mt-10 flex items-center gap-4">
              <span
                className={`text-xs font-bold uppercase ${
                  !isAnnual ? 'text-black' : 'text-median-taupe/60'
                }`}
              >
                Monthly Billing
              </span>

              <button
                onClick={() => setIsAnnual(!isAnnual)}
                data-cursor="pointer"
                aria-label="Toggle Annual Billing"
                className="w-14 h-8 rounded-full bg-median-taupe/20 p-1 flex items-center transition-colors border border-median-taupe/40 focus:outline-none"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-median-taupe transition-transform duration-300 shadow-md ${
                    isAnnual ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>

              <span
                className={`text-xs font-bold uppercase flex items-center gap-2 ${
                  isAnnual ? 'text-black' : 'text-median-taupe/60'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2.5 py-0.5 rounded-full bg-median-taupe text-white text-[10px] font-bold">
                  Save 20%
                </span>
              </span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Pricing Cards with Staggered Entrance */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-28">
        <StaggerContainer
          staggerDelay={160}
          variant="scale-up"
          duration={850}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {PRICING_PLANS.map((plan) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 relative h-full ${
                  plan.popular
                    ? 'bg-median-taupe text-white shadow-2xl scale-100 md:-translate-y-2 border-2 border-median-taupe'
                    : 'bg-white text-median-taupe border border-median-taupe/20 shadow-sm hover:border-median-taupe'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3
                        className={`font-oswald text-2xl sm:text-3xl font-bold uppercase ${
                          plan.popular ? 'text-white' : 'text-black'
                        }`}
                      >
                        {plan.title}
                      </h3>
                      <p
                        className={`text-xs mt-1 font-normal ${
                          plan.popular ? 'text-white/80' : 'text-median-taupe/70'
                        }`}
                      >
                        {plan.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-8 pb-6 border-b border-current/20">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`font-oswald text-5xl sm:text-6xl font-bold ${
                          plan.popular ? 'text-white' : 'text-black'
                        }`}
                      >
                        ${price}
                      </span>
                      <span className="text-xs font-semibold uppercase opacity-80">
                        USD / mo
                      </span>
                    </div>
                    {isAnnual && (
                      <span className="text-[11px] font-semibold opacity-75 mt-1 block">
                        Billed annually (${price * 12}/year)
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-10 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="font-bold text-sm">✓</span>
                        <span className="font-medium leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  data-cursor="pointer"
                  className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-black text-white hover:bg-white hover:text-black'
                      : 'bg-median-taupe text-white hover:bg-black'
                  }`}
                >
                  <span>Add to Cart</span>
                  <span>+</span>
                </button>
              </div>
            );
          })}
        </StaggerContainer>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 mb-28">
        <ScrollReveal variant="fade-up" duration={800} className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
            Clear Answers
          </span>
          <h2 className="font-oswald text-4xl sm:text-5xl font-bold uppercase text-black">
            Frequently Asked Questions
          </h2>
        </ScrollReveal>

        <StaggerContainer staggerDelay={100} variant="fade-up" duration={700} className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="border border-median-taupe/20 rounded-2xl overflow-hidden bg-white shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  data-cursor="pointer"
                  aria-expanded={isOpen}
                  className="w-full p-6 sm:p-8 flex items-center justify-between gap-4 text-left focus:outline-none"
                >
                  <span className="font-oswald text-xl sm:text-2xl font-bold uppercase text-black">
                    {faq.question}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full border border-median-taupe flex items-center justify-center font-bold text-sm transition-all duration-300 flex-shrink-0 ${
                      isOpen
                        ? 'bg-median-taupe text-white rotate-45'
                        : 'text-median-taupe'
                    }`}
                  >
                    +
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 border-t border-median-taupe/15 text-xs sm:text-sm text-black/80 font-normal leading-relaxed animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </StaggerContainer>
      </section>

      {/* Rotating Ribbons */}
      <ScrollReveal variant="scale-up" duration={1000}>
        <RotatingRibbons navigate={navigate} />
      </ScrollReveal>
    </div>
  );
};
