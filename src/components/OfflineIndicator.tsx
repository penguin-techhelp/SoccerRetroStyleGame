import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  // If online, do not clutter the screen
  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 px-3 py-1.5 bg-slate-900/95 border border-amber-500/90 text-amber-300 shadow-2xl backdrop-blur-sm pointer-events-none transition-all">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span className="font-pixel text-[9px]">OFFLINE MODE</span>
      <span className="font-arcade text-[10px] text-slate-400 hidden sm:inline">
        · 100% playable without internet
      </span>
    </div>
  );
};
