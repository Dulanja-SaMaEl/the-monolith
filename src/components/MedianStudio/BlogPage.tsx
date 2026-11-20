import React, { useState } from 'react';
import { BLOG_POSTS, BlogPost } from './siteData';
import { ArticleReaderModal } from './ArticleReaderModal';
import { RotatingRibbons } from './RotatingRibbons';
import { ScrollReveal, StaggerContainer } from './ScrollReveal';

interface BlogPageProps {
  navigate: (route: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ navigate }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(BLOG_POSTS.map((p) => p.category.toUpperCase())))];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    if (activeCategory === 'ALL') return true;
    return post.category.toUpperCase() === activeCategory.toUpperCase();
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
              Discourse & Technical Philosophy
            </span>
            <h1 className="font-oswald text-5xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tight text-black leading-none mb-6">
              Latest News
            </h1>
            <p className="text-sm sm:text-lg text-black/85 max-w-2xl font-normal leading-relaxed">
              Explorations on modern design systems, hardware-accelerated animations, commercial brand strategy, and high-craft typography.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <ScrollReveal variant="fade-up" duration={700}>
          <div className="flex gap-3 pb-6 border-b border-median-taupe/20">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-cursor="pointer"
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat
                    ? 'bg-median-taupe text-white shadow-md'
                    : 'border border-median-taupe/30 hover:border-median-taupe text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Article Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-28">
        <StaggerContainer
          staggerDelay={160}
          variant="fade-up"
          duration={850}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              data-cursor="pointer"
              className="group cursor-pointer rounded-2xl bg-white border border-median-taupe/20 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-median-taupe/10">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full border border-median-taupe text-[10px] font-bold uppercase text-median-taupe">
                      {post.category}
                    </span>
                    <span className="text-xs text-median-taupe/60 font-semibold uppercase">
                      {post.date} • {post.readTime}
                    </span>
                  </div>

                  <h2 className="font-oswald text-3xl sm:text-4xl font-bold uppercase text-black group-hover:text-median-taupe transition-colors mb-4">
                    {post.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-black/75 font-normal leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-median-taupe/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full object-cover border border-median-taupe"
                    />
                    <span className="text-xs font-bold text-black uppercase">
                      {post.author.name}
                    </span>
                  </div>

                  <span className="text-xs font-bold uppercase text-black flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    <span>Read Story</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </StaggerContainer>
      </section>

      {/* Rotating Ribbons */}
      <ScrollReveal variant="scale-up" duration={1000}>
        <RotatingRibbons navigate={navigate} />
      </ScrollReveal>

      {/* Reader Modal */}
      <ArticleReaderModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};
