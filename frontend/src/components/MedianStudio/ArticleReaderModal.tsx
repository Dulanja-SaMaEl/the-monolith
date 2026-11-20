import React, { useEffect } from 'react';
import { BlogPost } from './siteData';

interface ArticleReaderModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({ post, onClose }) => {
  useEffect(() => {
    if (post) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [post]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 bg-white max-w-3xl w-full max-h-[90vh] rounded-3xl shadow-2xl border border-median-taupe/20 overflow-y-auto text-median-taupe">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Article"
          data-cursor="pointer"
          className="absolute top-6 right-6 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm border border-median-taupe/30 hover:border-median-taupe flex items-center justify-center shadow-lg transition-all group"
        >
          <span className="text-base font-bold text-black group-hover:rotate-90 transition-transform duration-300">
            ✕
          </span>
        </button>

        {/* Article Cover */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-median-taupe/10">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
            <span className="text-xs font-bold tracking-widest uppercase text-white/80 mb-2">
              {post.category} • {post.date}
            </span>
            <h2 className="font-oswald text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white drop-shadow-md">
              {post.title}
            </h2>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-8 sm:p-12 space-y-8">
          {/* Author Row */}
          <div className="flex items-center gap-4 pb-6 border-b border-median-taupe/20">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover border border-median-taupe"
            />
            <div>
              <div className="font-oswald text-base font-bold text-black uppercase">
                {post.author.name}
              </div>
              <div className="text-xs text-median-taupe/70 font-semibold uppercase">
                {post.author.role} • {post.readTime}
              </div>
            </div>
          </div>

          {/* Lead Summary */}
          <p className="font-oswald text-xl sm:text-2xl text-black font-normal leading-snug">
            {post.summary}
          </p>

          {/* Paragraphs */}
          <div className="space-y-6 text-sm sm:text-base text-black/85 leading-relaxed font-normal normal-case">
            {post.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Share & Close */}
          <div className="pt-8 border-t border-median-taupe/20 flex items-center justify-between">
            <div className="text-xs font-bold uppercase text-median-taupe/70">
              Published by Monolith LK Insights
            </div>
            <button
              onClick={onClose}
              data-cursor="pointer"
              className="px-6 py-2.5 rounded-full border border-median-taupe hover:bg-median-taupe hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
