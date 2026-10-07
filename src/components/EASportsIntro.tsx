import React, { useEffect, useState, useRef } from 'react';
import { retroAudio } from '../audio/retroAudio';

interface EASportsIntroProps {
  onComplete: () => void;
}

export const EASportsIntro: React.FC<EASportsIntroProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [phase, setPhase] = useState<'shimmer' | 'voice' | 'tagline' | 'fadeout'>('shimmer');
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const startSequence = () => {
    if (hasStarted) return;
    setHasStarted(true);

    // Trigger iconic EA Sports audio stinger & announcer voice
    retroAudio.playEASportsIntroStinger();

    // Sequence stages
    const t1 = setTimeout(() => setPhase('voice'), 700);
    const t2 = setTimeout(() => setPhase('tagline'), 2100);
    const t3 = setTimeout(() => setPhase('fadeout'), 3900);
    const t4 = setTimeout(() => onComplete(), 4500);

    timerRef.current = [t1, t2, t3, t4];
  };

  useEffect(() => {
    // Attempt auto-start on mount
    startSequence();

    // Keydown listener to skip or trigger
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      timerRef.current.forEach((t) => clearTimeout(t));
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      onClick={() => {
        if (!hasStarted) {
          startSequence();
        } else {
          onComplete();
        }
      }}
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-opacity duration-600 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Stadium Spotlight Rays Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-black pointer-events-none" />

      {/* Floating Sparkles & Light Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Central EA Sports Style Emblem & Mascot */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl transform transition-all duration-700">
        {/* Emblem Shield Ring */}
        <div className="relative mb-5 sm:mb-7 group">
          {/* Glowing neon halo */}
          <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 rounded-full blur-lg opacity-60 animate-spin" style={{ animationDuration: '12s' }} />

          {/* Metallic Crest Outer Ring */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-slate-200 via-slate-800 to-slate-950 p-1.5 shadow-[0_0_35px_rgba(56,189,248,0.5)] border-2 border-cyan-400 flex items-center justify-center">
            {/* Inner Crest Core */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-700 flex flex-col items-center justify-center p-2 relative overflow-hidden">
              {/* Metallic Scanline Glint */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse pointer-events-none" />

              {/* Tuxedo Penguin Vector Mascot */}
              <svg
                viewBox="0 0 100 100"
                className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              >
                {/* Penguin Body (Egg shape) */}
                <ellipse cx="50" cy="54" rx="28" ry="36" fill="#0f172a" />
                {/* White Tuxedo Shirt Chest */}
                <ellipse cx="50" cy="55" rx="16" ry="26" fill="#f8fafc" />

                {/* Tuxedo Black Lapels (V shape jacket) */}
                <polygon points="34,36 50,68 39,78 30,50" fill="#020617" />
                <polygon points="66,36 50,68 61,78 70,50" fill="#020617" />

                {/* Crimson Bowtie */}
                <polygon points="43,42 50,45 43,48" fill="#e11d48" />
                <polygon points="57,42 50,45 57,48" fill="#e11d48" />
                <circle cx="50" cy="45" r="2.5" fill="#be123c" />

                {/* Tuxedo Buttons */}
                <circle cx="50" cy="53" r="1.5" fill="#0f172a" />
                <circle cx="50" cy="60" r="1.5" fill="#0f172a" />

                {/* Penguin Wings / Arms in Pockets */}
                <ellipse cx="23" cy="58" rx="6" ry="16" transform="rotate(22 23 58)" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                <ellipse cx="77" cy="58" rx="6" ry="16" transform="rotate(-22 77 58)" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

                {/* Penguin Head */}
                <circle cx="50" cy="28" rx="18" fill="#0f172a" />

                {/* Sunglasses / Dapper Shades */}
                <rect x="36" y="24" width="12" height="7" rx="2" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
                <rect x="52" y="24" width="12" height="7" rx="2" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
                <line x1="48" y1="27" x2="52" y2="27" stroke="#38bdf8" strokeWidth="1" />
                {/* Sunglasses Glint */}
                <line x1="38" y1="26" x2="44" y2="26" stroke="#93c5fd" strokeWidth="1" />

                {/* Orange Beak */}
                <polygon points="46,31 54,31 50,37" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5" />

                {/* Orange Webbed Feet */}
                <ellipse cx="40" cy="90" rx="8" ry="4" fill="#f59e0b" />
                <ellipse cx="60" cy="90" rx="8" ry="4" fill="#f59e0b" />

                {/* Miniature Soccer Ball at foot */}
                <circle cx="72" cy="85" r="7" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
                <polygon points="72,82 74,84 73,87 70,87 69,84" fill="#0f172a" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Name Typography (Classic EA Sports Chrome Style) */}
        <div className="space-y-1 sm:space-y-1.5 tracking-wider">
          {/* "TUXEDO PENGUIN" */}
          <h2 className="font-pixel text-xl sm:text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_4px_12px_rgba(56,189,248,0.7)] uppercase font-black">
            TUXEDO PENGUIN
          </h2>

          {/* "GAMING SPORTS STUDIO" */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-slate-950 font-pixel text-[11px] sm:text-xs md:text-sm font-bold tracking-widest shadow-lg rounded-xs">
            <span>GAMING SPORTS STUDIO</span>
          </div>

          {/* Iconic EA Style Tagline: "IT'S IN THE GAME" */}
          <div
            className={`pt-3 sm:pt-4 transition-all duration-700 transform ${
              phase === 'tagline' || phase === 'fadeout'
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-3 scale-95'
            }`}
          >
            <p className="font-arcade text-xs sm:text-sm md:text-base text-yellow-300 tracking-[0.25em] uppercase font-bold italic drop-shadow-[0_2px_8px_rgba(250,204,21,0.6)]">
              ★ IT'S IN THE GAME ★
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Skip Indicator */}
      <div className="absolute bottom-6 z-20 flex items-center gap-2 font-arcade text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
        <span>PRESS ANY KEY OR CLICK TO CONTINUE</span>
        <span className="text-slate-600">·</span>
        <span className="font-pixel text-[9px] text-slate-400">[SPACE]</span>
      </div>
    </div>
  );
};
