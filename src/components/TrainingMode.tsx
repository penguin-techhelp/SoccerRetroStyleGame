import React, { useState } from 'react';
import { retroAudio } from '../audio/retroAudio';
import { ArrowLeft, Target, RotateCcw, Zap } from 'lucide-react';

interface TrainingModeProps {
  onBack: () => void;
}

export const TrainingMode: React.FC<TrainingModeProps> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shotsTaken, setShotsTaken] = useState(0);
  const [distanceYards, setDistanceYards] = useState(25);

  const [aimX, setAimX] = useState(0.5);
  const [aimY, setAimY] = useState(0.4);
  const [curve, setCurve] = useState(0); // -1 (left curve) to +1 (right curve)
  const [power, setPower] = useState(0.65);

  const [ballPos, setBallPos] = useState({ x: 0.5, y: 0.85, inFlight: false });
  const [lastResult, setLastResult] = useState<string | null>('BEND IT AROUND THE WALL');

  const handleShoot = () => {
    if (ballPos.inFlight) return;

    retroAudio.playHardShot();
    setShotsTaken((s) => s + 1);

    // Calculate curve trajectory and wall collision
    const targetX = aimX + curve * 0.15;
    const targetY = aimY;

    // 4-Man wall blocks center shots between 0.35 and 0.65 if low trajectory
    const hitWall = targetX > 0.38 && targetX < 0.62 && targetY > 0.45;
    const isTopCorner = (targetX < 0.28 || targetX > 0.72) && targetY < 0.32;
    const isGoal = !hitWall && targetX > 0.15 && targetX < 0.85 && targetY > 0.15 && targetY < 0.75;

    setBallPos({ x: 0.5, y: 0.85, inFlight: true });

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / 18;

      setBallPos({
        x: 0.5 + (targetX - 0.5) * progress,
        y: 0.85 + (targetY - 0.85) * progress,
        inFlight: true
      });

      if (step >= 18) {
        clearInterval(interval);

        if (hitWall) {
          retroAudio.playKick(0.3);
          setLastResult('BLOCKED BY THE WALL!');
          setStreak(0);
        } else if (isTopCorner) {
          retroAudio.playGoalCelebration();
          setLastResult('TOP CORNER ROCKET! +300 PTS');
          setScore((s) => s + 300);
          setStreak((st) => st + 1);
        } else if (isGoal) {
          retroAudio.playGoalCelebration();
          setLastResult('GOAL! INTO THE NET! +100 PTS');
          setScore((s) => s + 100);
          setStreak((st) => st + 1);
        } else {
          retroAudio.playCrowdGasp();
          setLastResult('MISSED THE TARGET!');
          setStreak(0);
        }

        setTimeout(() => {
          setBallPos({ x: 0.5, y: 0.85, inFlight: false });
        }, 1600);
      }
    }, 22);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 select-none">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between border-b border-sky-900/60 pb-3">
        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-arcade text-slate-400 hover:text-sky-400 border border-slate-700 bg-slate-900 px-3 py-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>QUIT</span>
        </button>

        <h2 className="font-pixel text-sm md:text-base text-sky-400 tracking-wider">
          FREE KICK PRACTICE
        </h2>

        <div className="flex items-center gap-4 font-arcade text-xs">
          <span>SCORE: <strong className="text-yellow-400 font-pixel">{score}</strong></span>
          <span>STREAK: <strong className="text-emerald-400 font-pixel">{streak}</strong></span>
        </div>
      </header>

      {/* Main Pitch Wall Simulation */}
      <main className="w-full max-w-4xl mx-auto my-auto py-4 flex flex-col items-center">
        <div className="relative w-full max-w-xl h-72 md:h-80 bg-emerald-800 border-4 border-slate-900 overflow-hidden shadow-2xl">
          {/* Turf */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#14532d_50%,#15803d_50%)] bg-[length:100%_40px]" />

          {/* Goal Frame */}
          <div className="absolute top-8 left-12 right-12 bottom-28 border-4 border-white bg-slate-950/20">
            {/* Top Corner Bullseyes */}
            <div className="absolute top-2 left-2 w-8 h-8 border-2 border-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-pixel text-yellow-300">+300</span>
            </div>
            <div className="absolute top-2 right-2 w-8 h-8 border-2 border-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-pixel text-yellow-300">+300</span>
            </div>
          </div>

          {/* 4-Man Defensive Wall */}
          <div className="absolute top-36 left-1/2 -translate-x-1/2 flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-4 h-4 bg-[#fce0cd] border border-slate-900 rounded-sm" />
                <div className="w-6 h-9 bg-rose-600 border border-slate-900" />
                <div className="flex gap-0.5">
                  <div className="w-2.5 h-4 bg-slate-900" />
                  <div className="w-2.5 h-4 bg-slate-900" />
                </div>
              </div>
            ))}
          </div>

          {/* Target Reticle */}
          {!ballPos.inFlight && (
            <div
              className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 border-2 border-yellow-300 rounded-full flex items-center justify-center animate-pulse"
              style={{
                left: `${12 + aimX * 76}%`,
                top: `${16 + aimY * 36}%`
              }}
            >
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
            </div>
          )}

          {/* Soccer Ball */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
            style={{
              left: `${ballPos.x * 100}%`,
              top: `${ballPos.y * 100}%`
            }}
          >
            <div className="w-6 h-6 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-slate-900 rounded-full" />
            </div>
          </div>
        </div>

        {/* Status Announcement */}
        <div className="mt-3 text-center">
          <span className="font-pixel text-xs text-yellow-300 bg-slate-900 border border-slate-700 px-4 py-1.5 inline-block">
            {lastResult}
          </span>
        </div>

        {/* Controls Grid */}
        <div className="w-full max-w-xl mt-4 bg-slate-900 border border-slate-800 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-xs font-arcade">
            <div>
              <label className="text-slate-400 block mb-1">TARGET AIM (LEFT / RIGHT)</label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={aimX}
                onChange={(e) => setAimX(parseFloat(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">BALL SWERVE / CURVE</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={curve}
                onChange={(e) => setCurve(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-slate-400 block mb-1">STRIKE ELEVATION</label>
              <input
                type="range"
                min="0.1"
                max="0.7"
                step="0.05"
                value={aimY}
                onChange={(e) => setAimY(parseFloat(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleShoot}
            disabled={ballPos.inFlight}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-pixel text-xs tracking-wider border-2 border-sky-300 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
          >
            STRIKE FREE KICK
          </button>
        </div>
      </main>

      <footer className="w-full max-w-4xl mx-auto text-center border-t border-slate-900 pt-3 text-xs text-slate-500 font-arcade">
        SHOTS ATTEMPTED: {shotsTaken}
      </footer>
    </div>
  );
};
