'use client';

import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  bookId: string;
  title: string;
  author: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { w: 48, h: 64, titleSize: 'text-[7px]', authorSize: 'text-[5px]', iconSize: 14 },
  md: { w: 72, h: 96, titleSize: 'text-[9px]', authorSize: 'text-[7px]', iconSize: 18 },
  lg: { w: 100, h: 140, titleSize: 'text-xs', authorSize: 'text-[8px]', iconSize: 24 },
};

export default function BookCover({ bookId, title, author, size = 'md', className = '' }: BookCoverProps) {
  const s = SIZE_MAP[size];

  return (
    <div
      className={`relative flex shrink-0 flex-col items-center justify-between overflow-hidden rounded-lg border border-border bg-bg-card ${className}`}
      style={{ width: s.w, height: s.h }}
    >
      {/* Spine accent - 3px left color strip */}
      <div
        className="absolute bottom-0 left-0 top-0 w-[3px] bg-brand"
      />

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-2 pt-3">
        <BookOpen className="mb-1 text-text-muted" style={{ width: s.iconSize, height: s.iconSize }} />
        <span className={`${s.titleSize} px-0.5 text-center font-semibold text-text-secondary leading-tight`}>
          {title.length > 8 ? title.slice(0, 8) + '…' : title}
        </span>
      </div>

      {/* Bottom */}
      <div className="w-full border-t border-border bg-bg-hover px-1 py-1 text-center">
        <span className={`${s.authorSize} block truncate text-text-muted`}>
          {author.length > 10 ? author.slice(0, 10) + '…' : author}
        </span>
      </div>

      {/* Corner fold */}
      <div
        className="absolute right-0 top-0 h-0 w-0"
        style={{
          borderLeft: '8px solid transparent',
          borderTop: '8px solid #2E333D',
        }}
      />
    </div>
  );
}
