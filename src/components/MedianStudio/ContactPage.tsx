import React, { useState } from 'react';
import { RotatingRibbons } from './RotatingRibbons';
import { ScrollReveal, StaggerContainer } from './ScrollReveal';

interface ContactPageProps {
  navigate: (route: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: 'Website Design',
    budget: '$5k – $15k',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    'Product Design',
    'Website Design',
    'Marketing',
    'Custom System',
  ];

  const budgetTiers = [
    '< $5,000',
    '$5,000 – $15,000',
    '$15,000 – $35,000',
    '$35,000+',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
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
              Initiate Collaboration
            </span>
            <h1 className="font-oswald text-5xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tight text-black leading-none mb-6">
              Stay in Touch
            </h1>
            <p className="text-sm sm:text-lg text-black/85 max-w-2xl font-normal leading-relaxed">
              Have an upcoming project, redesign, or architectural inquiry? Fill out the brief below and our partners will respond within 24 hours.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Main Grid: Form + Office Contacts */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Form Container (7 cols) */}
        <ScrollReveal variant="fade-up" duration={850} className="lg:col-span-7">
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-median-taupe/20 shadow-sm">
            {isSubmitted ? (
              <div className="py-16 text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-median-taupe text-white flex items-center justify-center text-3xl font-bold">
                  ✓
                </div>
                <h3 className="font-oswald text-3xl font-bold uppercase text-black">
                  Message Received
                </h3>
                <p className="text-xs sm:text-sm text-black/75 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <strong className="text-black">{formData.name || 'there'}</strong>. Our directors will review your brief and schedule an initial discovery call.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      company: '',
                      service: 'Website Design',
                      budget: '$5k – $15k',
                      message: '',
                    });
                  }}
                  className="px-6 py-3 rounded-full border border-median-taupe hover:bg-median-taupe hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-median-taupe/80 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jackson Miller"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-full border border-median-taupe/30 focus:border-median-taupe text-xs text-black outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-median-taupe/80 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. jackson@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-full border border-median-taupe/30 focus:border-median-taupe text-xs text-black outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-bold uppercase text-median-taupe/80 mb-2">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lumina Labs"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-full border border-median-taupe/30 focus:border-median-taupe text-xs text-black outline-none transition-colors"
                  />
                </div>

                {/* Service Interest Chips */}
                <div>
                  <label className="block text-xs font-bold uppercase text-median-taupe/80 mb-3">
                    Service Need
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {services.map((srv) => (
                      <button
                        type="button"
                        key={srv}
                        onClick={() => setFormData({ ...formData, service: srv })}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                          formData.service === srv
                            ? 'bg-median-taupe text-white shadow-sm'
                            : 'border border-median-taupe/30 text-black hover:border-median-taupe'
                        }`}
                      >
                        {srv}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Chips */}
                <div>
                  <label className="block text-xs font-bold uppercase text-median-taupe/80 mb-3">
                    Estimated Budget Tier
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {budgetTiers.map((tier) => (
                      <button
                        type="button"
                        key={tier}
                        onClick={() => setFormData({ ...formData, budget: tier })}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                          formData.budget === tier
                            ? 'bg-median-taupe text-white shadow-sm'
                            : 'border border-median-taupe/30 text-black hover:border-median-taupe'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Brief */}
                <div>
                  <label className="block text-xs font-bold uppercase text-median-taupe/80 mb-2">
                    Project Brief & Objectives *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your brand vision, target timeline, and specific deliverables..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 rounded-2xl border border-median-taupe/30 focus:border-median-taupe text-xs text-black outline-none transition-colors"
                  />
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-cursor="pointer"
                  className="w-full py-4 rounded-xl bg-median-taupe hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmitting Brief...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Project Brief</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>

        {/* Studio Contacts & Locations (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Direct Line */}
          <ScrollReveal variant="fade-left" delay={150} duration={800}>
            <div className="p-8 rounded-2xl border border-median-taupe/20 bg-median-taupe/5 space-y-4">
              <span className="text-xs font-bold tracking-widest uppercase text-median-taupe block">
                Direct Contact
              </span>
              <div className="space-y-2">
                <a
                  href="mailto:contact@monolith.lk"
                  className="font-oswald text-2xl font-bold uppercase text-black hover:text-median-taupe block"
                >
                  contact@monolith.lk
                </a>
                <a
                  href="tel:+94760967884"
                  className="font-oswald text-2xl font-bold uppercase text-black hover:text-median-taupe block"
                >
                  +94 76 096 7884
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Locations with StaggerContainer */}
          <StaggerContainer staggerDelay={120} variant="scale-up" duration={750} className="space-y-4">
            {[
              {
                city: 'Colombo',
                address: '148 Galle Road, Suite 5B, Colombo 03, Sri Lanka',
                tz: 'IST (UTC+5:30)',
              },
              {
                city: 'Dubai',
                address: 'Business Bay, Bay Square 12, Level 14, Dubai, UAE',
                tz: 'GST (UTC+4)',
              },
              {
                city: 'London',
                address: '24 Old Street, Shoreditch, EC1V 9AB, London, UK',
                tz: 'GMT/BST (UTC+0)',
              },
            ].map((loc) => (
              <div
                key={loc.city}
                className="p-6 rounded-2xl border border-median-taupe/20 bg-white hover:border-median-taupe transition-colors space-y-1"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-oswald text-xl font-bold uppercase text-black">
                    {loc.city}
                  </h4>
                  <span className="text-[10px] font-semibold uppercase text-median-taupe/70">
                    {loc.tz}
                  </span>
                </div>
                <p className="text-xs text-black/75 font-normal leading-relaxed">
                  {loc.address}
                </p>
              </div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Rotating Ribbons */}
      <ScrollReveal variant="scale-up" duration={1000}>
        <RotatingRibbons navigate={navigate} />
      </ScrollReveal>
    </div>
  );
};
