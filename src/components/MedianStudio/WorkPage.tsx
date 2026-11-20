import React, { useState } from 'react';
import { PROJECTS, Project } from './siteData';
import { ProjectDetailModal } from './ProjectDetailModal';
import { RotatingRibbons } from './RotatingRibbons';
import { ScrollReveal, StaggerContainer } from './ScrollReveal';

interface WorkPageProps {
  navigate: (route: string) => void;
}

export const WorkPage: React.FC<WorkPageProps> = ({ navigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = ['ALL', ...Array.from(new Set(PROJECTS.map((p) => p.tag.toUpperCase())))];

  const filteredProjects = PROJECTS.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      p.tag.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              Archive & Portfolio
            </span>
            <h1 className="font-oswald text-5xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tight text-black leading-none mb-6">
              Selected Works
            </h1>
            <p className="text-sm sm:text-lg text-black/85 max-w-2xl font-normal leading-relaxed">
              A showcase of award-winning digital flagships, experimental design systems, and bespoke software experiences.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <ScrollReveal variant="fade-up" duration={700}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-median-taupe/20">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  data-cursor="pointer"
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-median-taupe text-white shadow-md'
                      : 'border border-median-taupe/30 hover:border-median-taupe text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by project or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-median-taupe/40 focus:border-median-taupe text-xs text-black placeholder:text-median-taupe/60 outline-none uppercase"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-median-taupe/60 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-28">
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="font-oswald text-2xl font-bold uppercase text-black mb-2">
              No matching projects found
            </h3>
            <p className="text-xs text-median-taupe/70 mb-6">
              Try adjusting your category filter or search terms.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="px-6 py-3 rounded-full bg-median-taupe text-white text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <StaggerContainer
            staggerDelay={120}
            variant="scale-up"
            duration={800}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                data-cursor="work"
                className="group cursor-pointer flex flex-col justify-between rounded-2xl bg-white border border-median-taupe/20 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 h-full"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-median-taupe/10">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold uppercase text-median-taupe shadow-sm">
                      {proj.tag}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block mb-1">
                      {proj.category}
                    </span>
                    <h3 className="font-oswald text-2xl font-bold uppercase text-black group-hover:text-median-taupe transition-colors">
                      {proj.title}
                    </h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-median-taupe/15 flex items-center justify-between text-xs text-median-taupe/80">
                    <span>{proj.client}</span>
                    <span className="font-bold text-black font-oswald text-sm">
                      {proj.year}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* Rotating Ribbons */}
      <ScrollReveal variant="scale-up" duration={1000}>
        <RotatingRibbons navigate={navigate} />
      </ScrollReveal>

      {/* Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};
