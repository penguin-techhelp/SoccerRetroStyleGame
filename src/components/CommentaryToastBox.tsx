import React, { useEffect, useState, useRef } from 'react';
import { CommentaryToast } from '../types/game';
import { retroAudio } from '../audio/retroAudio';
import { Mic, X, Volume2, VolumeX, RotateCcw, Radio } from 'lucide-react';

interface CommentaryToastBoxProps {
  toast: CommentaryToast | null;
  onDismiss: () => void;
}

export const CommentaryToastBox: React.FC<CommentaryToastBoxProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const timerRef = useRef<any>(null);
  const lastSpokenIdRef = useRef<string | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // Trigger audio commentary ONLY when a new toast ID arrives (prevents re-render stutter)
  useEffect(() => {
    if (!toast) {
      lastSpokenIdRef.current = null;
      clearInterval(timerRef.current);
      retroAudio.stopCommentarySpeech();
      setIsSpeaking(false);
      return;
    }

    // Prevent re-triggering if the parent component re-renders with the same active toast
    if (lastSpokenIdRef.current === toast.id) {
      return;
    }
    lastSpokenIdRef.current = toast.id;

    setProgress(100);

    const speechText = `${toast.headline}. ${toast.commentary}`;
    if (!voiceMuted) {
      retroAudio.speakCommentary(
        speechText,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }

    // Auto-dismiss timer (allowing full voice speech playback without cutoff)
    const duration = Math.max(toast.durationMs || 6000, 6000);
    const intervalTime = 60;
    const step = (intervalTime / duration) * 100;

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timerRef.current);
          onDismissRef.current();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);
  }, [toast, voiceMuted]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      retroAudio.stopCommentarySpeech();
    };
  }, []);

  const handleDismiss = () => {
    clearInterval(timerRef.current);
    retroAudio.stopCommentarySpeech();
    setIsSpeaking(false);
    onDismiss();
  };

  const handleReplayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!toast) return;
    const speechText = `${toast.headline}. ${toast.commentary}`;
    retroAudio.playCommentaryJingle();
    retroAudio.speakCommentary(
      speechText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleToggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !voiceMuted;
    setVoiceMuted(next);
    if (next) {
      retroAudio.stopCommentarySpeech();
      setIsSpeaking(false);
    } else if (toast) {
      const speechText = `${toast.headline}. ${toast.commentary}`;
      retroAudio.speakCommentary(
        speechText,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  if (!toast) return null;

  const isGoal = toast.type === 'goal';
  const isRedCard = toast.type === 'red_card';
  const isYellowCard = toast.type === 'yellow_card';
  const isSave = toast.type === 'save';

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
    ? '🟥 RED CARD'
    : isYellowCard
    ? '🟨 BOOKING'
    : isSave
    ? '🧤 BIG SAVE'
    : '🥅 WOODWORK';

  return (
    <div className="fixed top-14 right-2 sm:right-5 z-40 max-w-sm sm:max-w-md w-[94%] sm:w-auto select-none pointer-events-auto transition-all animate-arcade-toast">
      <div
        className={`relative bg-slate-950/95 border-2 ${borderColor} shadow-2xl p-3 sm:p-3.5 backdrop-blur-md overflow-hidden`}
      >
        {/* Subtle CRT scanlines */}
        <div className="absolute inset-0 crt-overlay opacity-25 pointer-events-none" />

        {/* Top Header Bar with Live Audio Visualizer */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span className="font-arcade text-[10px] text-yellow-300 tracking-wider">
              AUDIO COMMENTARY
            </span>

            {/* Live animated audio spectrum bars */}
            <div className="flex items-end gap-0.5 h-3 px-1">
              {[60, 100, 45, 90, 75, 40, 95, 70].map((h, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-all duration-150 ${
                    isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                  }`}
                  style={{
                    height: isSpeaking ? `${h}%` : '25%',
                    animationDelay: `${i * 90}ms`,
                  }}
                />
              ))}
            </div>

            <span className="flex items-center gap-1 text-[8px] font-pixel text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
              <span>{isSpeaking ? 'VOICE ON' : 'BROADCAST'}</span>
            </span>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-1.5">
            {/* Replay Audio Speech */}
            <button
              onClick={handleReplayAudio}
              className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-yellow-300 border border-slate-700 cursor-pointer transition-colors"
              title="Replay Voice Commentary"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            {/* Mute Voice */}
            <button
              onClick={handleToggleVoice}
              className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700 cursor-pointer transition-colors"
              title={voiceMuted ? 'Unmute Commentator Voice' : 'Mute Commentator Voice'}
            >
              {voiceMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
            </button>

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
              title="Dismiss"
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

        {/* Spoken Commentary Audio Transcript */}
        <div className="relative z-10 mb-2 bg-slate-900/60 p-2 border border-slate-800/80 rounded-xs flex items-start gap-2">
          <Mic className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSpeaking ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
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
