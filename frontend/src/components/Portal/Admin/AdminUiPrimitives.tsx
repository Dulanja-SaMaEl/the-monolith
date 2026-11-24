import React from 'react';

export const AdminPagination: React.FC<{
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-median-taupe/15 text-xs font-mono">
      <span className="text-median-taupe/80">
        Showing <strong className="text-black">{startIdx}</strong>–<strong className="text-black">{endIdx}</strong> of{' '}
        <strong className="text-black">{totalItems}</strong>
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2.5 py-1 rounded-lg border border-median-taupe/30 hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          ← Prev
        </button>
        {[...Array(totalPages)].map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                currentPage === pageNum
                  ? 'bg-black text-white'
                  : 'border border-median-taupe/30 hover:border-black text-black'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2.5 py-1 rounded-lg border border-median-taupe/30 hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export const AdminSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="p-5 rounded-2xl bg-white border border-median-taupe/15 shadow-sm space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 w-2/3">
            <div className="h-2.5 bg-median-taupe/20 rounded w-1/4" />
            <div className="h-5 bg-median-taupe/25 rounded w-1/2" />
            <div className="h-3 bg-median-taupe/15 rounded w-3/4" />
          </div>
          <div className="h-6 w-20 bg-median-taupe/20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

interface AdminToolbarProps {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  actionLabel?: string;
  actionOpen?: boolean;
  onActionToggle?: () => void;
  extraControls?: React.ReactNode;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actionLabel,
  actionOpen,
  onActionToggle,
  extraControls,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
      {onSearchChange !== undefined && (
        <input
          type="text"
          value={searchValue || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-median-taupe/25 bg-[#FAF8F5] text-xs font-mono text-black focus:outline-none focus:border-black transition-colors"
        />
      )}
      {extraControls}
    </div>
    {actionLabel && onActionToggle && (
      <button
        type="button"
        onClick={onActionToggle}
        className={`px-4 py-2 rounded-xl font-oswald text-xs uppercase tracking-wider font-bold transition-all shrink-0 ${
          actionOpen
            ? 'border border-black text-black bg-white hover:bg-black hover:text-white'
            : 'bg-black text-white hover:bg-median-taupe shadow-sm'
        }`}
      >
        {actionOpen ? '✕ Close Form' : actionLabel}
      </button>
    )}
  </div>
);
