'use client';

import { useState, useCallback } from 'react';
import ThinkTankTable from './ThinkTankTable';
import RoundtableChat from './RoundtableChat';
import { Users, Info } from 'lucide-react';

export default function ThinkTank() {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [speakingSeatId, setSpeakingSeatId] = useState<string | null>(null);
  const [completedSeatIds, setCompletedSeatIds] = useState<string[]>([]);

  const handleToggleSeat = useCallback((seatId: string) => {
    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) return prev.filter((id) => id !== seatId);
      if (prev.length >= 4) return prev;
      return [...prev, seatId];
    });
  }, []);

  const handleSeatComplete = useCallback((seatId: string) => {
    setCompletedSeatIds((prev) => [...prev, seatId]);
  }, []);

  const handleComplete = useCallback(() => {
    setSpeakingSeatId(null);
  }, []);

  const isRunning = speakingSeatId !== null;

  return (
    <div className="flex h-[calc(100vh-180px)] gap-5">
      <div className="flex w-[520px] shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-bold text-text-primary">智囊团圆桌</h2>
        </div>

        {selectedSeatIds.length < 2 && !isRunning && (
          <div
            className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs text-text-secondary"
            style={{ background: 'rgba(108,140,255,0.08)', border: '1px solid rgba(108,140,255,0.15)' }}
          >
            <Info className="h-3.5 w-3.5 text-brand" />
            请点选 2~4 个席位组建本轮智囊团
          </div>
        )}

        <ThinkTankTable
          selectedSeatIds={selectedSeatIds}
          onToggleSeat={handleToggleSeat}
          speakingSeatId={speakingSeatId}
          completedSeatIds={completedSeatIds}
          disabled={isRunning}
        />
      </div>

      <div className="flex flex-1 flex-col rounded-xl border border-border bg-bg-card p-5">
        <RoundtableChat
          selectedSeatIds={selectedSeatIds}
          disabled={isRunning}
          onSpeakingChange={setSpeakingSeatId}
          onSeatComplete={handleSeatComplete}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
