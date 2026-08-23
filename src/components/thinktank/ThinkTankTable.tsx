'use client';

import { cn } from '@/lib/utils';
import { ROUNDTABLE_SEATS } from '@root/mock-data/roundtable-seats';

const SEAT_ANGLES = ROUNDTABLE_SEATS.map((_, i) => (i / ROUNDTABLE_SEATS.length) * Math.PI * 2 - Math.PI / 2);

interface ThinkTankTableProps {
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
  speakingSeatId?: string | null;
  completedSeatIds?: string[];
  disabled?: boolean;
}

export default function ThinkTankTable({
  selectedSeatIds,
  onToggleSeat,
  speakingSeatId,
  completedSeatIds = [],
  disabled = false,
}: ThinkTankTableProps) {
  const tableSize = 180;
  const containerSize = 420;
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;
  const seatRadius = 165;
  const seatW = 96;
  const seatH = 80;

  return (
    <div className="relative flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
      {/* Table circle */}
      <div
        className="absolute rounded-full border border-border"
        style={{
          width: tableSize,
          height: tableSize,
          left: centerX - tableSize / 2,
          top: centerY - tableSize / 2,
          background: '#1A1D24',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="flex h-full flex-col items-center justify-center">
          <span className="text-2xl">🏛️</span>
          <span className="mt-1 text-[12px] font-medium tracking-widest" style={{ color: '#4E535C' }}>ROUNDTABLE</span>
        </div>
      </div>

      {/* Seats */}
      {ROUNDTABLE_SEATS.map((seat, i) => {
        const angle = SEAT_ANGLES[i];
        const x = centerX + Math.cos(angle) * seatRadius;
        const y = centerY + Math.sin(angle) * seatRadius;
        const isSelected = selectedSeatIds.includes(seat.id);
        const isSpeaking = speakingSeatId === seat.id;
        const isCompleted = completedSeatIds.includes(seat.id);

        return (
          <button
            key={seat.id}
            onClick={() => !disabled && onToggleSeat(seat.id)}
            disabled={disabled}
            className={cn(
              'absolute flex flex-col items-center justify-center rounded-xl border transition-all duration-200',
              'hover:scale-105',
              isSelected
                ? 'border-brand/30 ring-1 ring-brand/20'
                : 'border-border hover:border-brand/20',
              isSpeaking && 'animate-pulse scale-110',
              isCompleted && 'opacity-60',
              disabled && !isSelected && 'opacity-30 cursor-not-allowed',
            )}
            style={{
              left: x - seatW / 2,
              top: y - seatH / 2,
              width: seatW,
              height: seatH,
              background: isSelected ? 'rgba(108,140,255,0.08)' : '#242830',
              borderRadius: 12,
            }}
          >
            <span className="text-xl leading-none">{seat.icon}</span>
            <span className={cn(
              'mt-1 text-[11px] font-semibold leading-tight',
              isSelected ? 'text-brand' : 'text-text-secondary',
            )}>
              {seat.name}
            </span>
            <span className="mt-0.5 text-[10px] leading-tight text-text-muted">{seat.persona}</span>

            {isSpeaking && (
              <span className="mt-0.5 text-[9px] font-medium text-brand">发言中…</span>
            )}
            {isCompleted && !isSpeaking && (
              <span className="mt-0.5 text-[9px] text-success">✓ 已发言</span>
            )}
            {isSelected && !isSpeaking && !isCompleted && (
              <span className="mt-0.5 text-[9px] text-brand">已选中</span>
            )}
          </button>
        );
      })}

      {/* Status bar */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ bottom: -8 }}
      >
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px]"
          style={{ background: '#1A1D24', border: '1px solid #2E333D' }}
        >
          已选 <span className={cn('font-bold', selectedSeatIds.length >= 2 ? 'text-brand' : 'text-error')}>
            {selectedSeatIds.length}
          </span> / 2-4 席
        </span>
      </div>
    </div>
  );
}
