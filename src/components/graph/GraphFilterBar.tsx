'use client';

import { Search, X } from 'lucide-react';
import { useSBPACK } from '@/lib/store';

interface GraphFilterBarProps {
  selectedBookId: string | null;
  onSelectBook: (bookId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function GraphFilterBar({
  selectedBookId,
  onSelectBook,
  searchQuery,
  onSearchChange,
}: GraphFilterBarProps) {
  const { packs } = useSBPACK();

  return (
    <div className="absolute left-5 right-5 top-5 z-30 flex items-center gap-3">
      {/* Search — glass pill */}
      <div
        className="relative flex-1 max-w-xs"
        style={{
          background: 'rgba(26, 29, 36, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(46, 51, 61, 0.4)',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'rgba(122, 127, 138, 0.5)' }} />
        <input
          type="text"
          placeholder="搜索知识点…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-xl bg-transparent pl-9 pr-8 text-[13px] text-text-primary placeholder-text-faint outline-none"
          style={{ caretColor: '#6C8CFF' }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors"
            style={{ color: 'rgba(122, 127, 138, 0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E8EAED')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(122, 127, 138, 0.5)')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter chips — horizontal scroll */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <button
          onClick={() => onSelectBook(null)}
          className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-150"
          style={{
            background: !selectedBookId ? 'rgba(108, 140, 255, 0.12)' : 'rgba(26, 29, 36, 0.6)',
            color: !selectedBookId ? '#6C8CFF' : 'rgba(122, 127, 138, 0.6)',
            border: `1px solid ${!selectedBookId ? 'rgba(108, 140, 255, 0.2)' : 'rgba(46, 51, 61, 0.3)'}`,
            backdropFilter: 'blur(8px)',
          }}
        >
          全部
        </button>
        {packs.map((pack) => {
          const isActive = selectedBookId === pack.bookId;
          return (
            <button
              key={pack.bookId}
              onClick={() => onSelectBook(isActive ? null : pack.bookId)}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-150"
              style={{
                background: isActive ? 'rgba(108, 140, 255, 0.12)' : 'rgba(26, 29, 36, 0.6)',
                color: isActive ? '#6C8CFF' : 'rgba(122, 127, 138, 0.6)',
                border: `1px solid ${isActive ? 'rgba(108, 140, 255, 0.2)' : 'rgba(46, 51, 61, 0.3)'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: isActive ? '#6C8CFF' : 'rgba(122, 127, 138, 0.3)' }}
              />
              {pack.bookTitle}
            </button>
          );
        })}
      </div>
    </div>
  );
}
