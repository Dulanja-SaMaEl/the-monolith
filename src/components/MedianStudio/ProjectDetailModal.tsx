import React, { useEffect } from 'react';
import { Project } from './siteData';
import { useCart } from './CartContext';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
}) => {
  const { addToCart } = useCart();

  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [project]);

  if (!project) return null;

  const handleOrderTemplate = () => {
    addToCart({
      id: `project-${project.id}`,
      title: `${project.title} — Digital Template`,
      price: 199,
      image: project.image,
      type: 'Project Template',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 bg-white max-w-4xl w-full max-h-[90vh] rounded-3xl shadow-2xl border border-median-taupe/20 overflow-y-auto text-median-taupe">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Project Detail"
          data-cursor="pointer"
          className="absolute top-6 right-6 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm border border-median-taupe/30 hover:border-median-taupe flex items-center justify-center shadow-lg transition-all group"
        >
          <span className="text-base font-bold text-black group-hover:rotate-90 transition-transform duration-300">
            ✕
          </span>
        </button>

        {/* Hero Image */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-median-taupe/10">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
            <span className="text-xs font-bold tracking-widest uppercase text-white/80 mb-2">
              {project.category}
            </span>
            <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-white drop-shadow-md">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-10">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-median-taupe/20 text-xs">
            <div>
              <span className="text-median-taupe/60 block font-semibold mb-1">CLIENT</span>
              <span className="font-oswald text-base text-black font-semibold">{project.client}</span>
            </div>
            <div>
              <span className="text-median-taupe/60 block font-semibold mb-1">YEAR</span>
              <span className="font-oswald text-base text-black font-semibold">{project.year}</span>
            </div>
            <div>
              <span className="text-median-taupe/60 block font-semibold mb-1">DISCIPLINE</span>
              <span className="font-oswald text-base text-black font-semibold">{project.tag}</span>
            </div>
            <div>
              <span className="text-median-taupe/60 block font-semibold mb-1">LICENSE</span>
              <span className="font-oswald text-base text-black font-semibold">Available</span>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-4">
            <h3 className="font-oswald text-2xl font-bold text-black uppercase">
              Project Concept
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-black/90 font-normal">
              {project.description}
            </p>
          </div>

          {/* Challenge & Solution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-median-taupe/5 border border-median-taupe/15 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-median-taupe">
                The Challenge
              </span>
              <p className="text-xs sm:text-sm text-black/80 leading-relaxed font-normal">
                {project.challenge}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-median-taupe/5 border border-median-taupe/15 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-median-taupe">
                The Solution
              </span>
              <p className="text-xs sm:text-sm text-black/80 leading-relaxed font-normal">
                {project.solution}
              </p>
            </div>
          </div>

          {/* Deliverables Chips */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-median-taupe/70 uppercase mb-4">
              Project Deliverables
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {project.deliverables.map((item, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-full border border-median-taupe text-xs font-semibold text-black uppercase bg-median-taupe/5"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Quote if available */}
          {project.quote && (
            <blockquote className="p-6 border-l-4 border-median-taupe bg-median-taupe/5 rounded-r-2xl space-y-2">
              <p className="font-oswald text-xl sm:text-2xl text-black font-normal italic leading-snug">
                “{project.quote.text}”
              </p>
              <cite className="text-xs font-bold text-median-taupe uppercase not-italic block">
                — {project.quote.author}
              </cite>
            </blockquote>
          )}

          {/* Footer Call to Action */}
          <div className="pt-6 border-t border-median-taupe/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-median-taupe/70 font-semibold block">
                Want a custom adaptation of this build?
              </span>
              <span className="font-oswald text-lg text-black font-semibold">
                Available as a Turnkey System ($199 USD)
              </span>
            </div>

            <button
              onClick={handleOrderTemplate}
              data-cursor="pointer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-median-taupe hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              <span>Add to Cart</span>
              <span>+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
