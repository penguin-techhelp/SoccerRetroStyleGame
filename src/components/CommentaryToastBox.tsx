import React, { useEffect, useState } from 'react';
import { CommentaryToast } from '../types/game';
import { Mic, X, Sparkles } from 'lucide-react';

interface CommentaryToastBoxProps {
  toast: CommentaryToast | null;
  onDismiss: () => void;
}

export const CommentaryToastBox: React.FC<CommentaryToastBoxProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const duration = toast.durationMs || 4500;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isGoal = toast.type === 'goal';
  const isRedCard = toast.type === 'red_card';
  const isYellowCard = toast.type === 'yellow_card';
  const isSave = toast.type === 'save';
  const isWoodwork = toast.type === 'woodwork';

  const borderColor = isGoal
    ? 'border-yellow-400'
    : isRedCard
    ? 'border-rose-500'
    : isYellowCard
    ? 'border-amber-400'
    : isSave
    ? 'border-emerald-400'
    : 'border-sky-400';

  const badgeBg = isGoal
    ? 'bg-yellow-400 text-slate-950'
    : isRedCard
    ? 'bg-rose-600 text-white'
    : isYellowCard
    ? 'bg-amber-400 text-slate-950'
    : isSave
    ? 'bg-emerald-500 text-slate-950'
    : 'bg-sky-500 text-slate-950';

  const badgeLabel = isGoal
    ? '⚽ GOAL!'
    : isRedCard
    ? '🟥 RED CARD!'
    : isYellowCard
    ? '🟨 YELLOW CARD'
    : isSave
    ? '🧤 BIG SAVE!'
    : '🥅 WOODWORK!';

  return (
    <div className="fixed top-14 right-2 sm:right-5 z-40 max-w-sm sm:max-w-md w-[94%] sm:w-auto select-none pointer-events-auto transition-all animate-arcade-toast">
      <div
        className={`relative bg-slate-950/95 border-2 ${borderColor} shadow-2xl p-3 sm:p-3.5 backdrop-blur-md overflow-hidden`}
      >
        {/* Subtle CRT scanlines */}
        <div className="absolute inset-0 crt-overlay opacity-30 pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span className="font-arcade text-[10px] text-yellow-300 tracking-wider">
              ARCADE COMMENTATOR
            </span>
            <span className="flex items-center gap-1 text-[9px] font-pixel text-rose-400 bg-rose-950/60 px-1 py-0.5 rounded-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-slate-400 tabular-nums">
              {toast.minute}'
            </span>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Headline + Badge */}
        <div className="flex items-center justify-between gap-2 mb-1.5 relative z-10">
          <div className="flex items-center gap-1.5 min-w-0">
            {toast.teamFlag && <span className="text-sm shrink-0">{toast.teamFlag}</span>}
            <h4 className="font-pixel text-xs sm:text-sm text-yellow-300 truncate">
              {toast.headline}
            </h4>
          </div>

          <span
            className={`px-1.5 py-0.5 font-pixel text-[9px] font-bold rounded-xs shrink-0 ${badgeBg}`}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Commentary Speech */}
        <div className="relative z-10 mb-2">
          <p className="font-arcade text-xs text-slate-200 leading-snug">
            "{toast.commentary}"
          </p>
        </div>

        {/* Progress Bar timer at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className={`h-full transition-all duration-75 ${
              isGoal
                ? 'bg-yellow-400'
                : isRedCard
                ? 'bg-rose-500'
                : isSave
                ? 'bg-emerald-400'
                : 'bg-sky-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
