import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types/game';
import { CLASSIC_TEAMS } from '../data/teams';
import { retroAudio } from '../audio/retroAudio';
import { ArrowLeft, Target, Trophy, RotateCcw } from 'lucide-react';

interface PenaltyShootoutProps {
  onBack: () => void;
}

type KickResult = 'goal' | 'saved' | 'missed';

export const PenaltyShootout: React.FC<PenaltyShootoutProps> = ({ onBack }) => {
  const [homeTeam, setHomeTeam] = useState<Team>(CLASSIC_TEAMS[0]); // Brazil
  const [awayTeam, setAwayTeam] = useState<Team>(CLASSIC_TEAMS[1]); // Italy

  const [currentTurn, setCurrentTurn] = useState<'user' | 'cpu'>('user');
  const [roundNumber, setRoundNumber] = useState(1);
  const [homeKicks, setHomeKicks] = useState<(KickResult | null)[]>([null, null, null, null, null]);
  const [awayKicks, setAwayKicks] = useState<(KickResult | null)[]>([null, null, null, null, null]);

  // Kicking state
  const [aimX, setAimX] = useState(0.5); // 0 (left) to 1 (right)
  const [aimY, setAimY] = useState(0.5); // 0 (top) to 1 (bottom)
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [ballState, setBallState] = useState<{ x: number; y: number; inFlight: boolean; scale: number }>({
    x: 0.5,
    y: 0.85,
    inFlight: false,
    scale: 1.0
  });

  const [gkState, setGkState] = useState<{ x: number; y: number; diveAngle: number; isDiving: boolean }>({
    x: 0.5,
    y: 0.45,
    diveAngle: 0,
    isDiving: false
  });

  const [announcement, setAnnouncement] = useState<string | null>('AIM WITH ARROWS · HOLD SHOOT TO STRIKE');
  const [winner, setWinner] = useState<Team | null>(null);

  // Power charging loop
  useEffect(() => {
    let anim: number;
    if (isCharging) {
      const charge = () => {
        setPower((p) => {
          const next = p + 0.04;
          return next >= 1.0 ? 1.0 : next;
        });
        anim = requestAnimationFrame(charge);
      };
      anim = requestAnimationFrame(charge);
    }
    return () => cancelAnimationFrame(anim);
  }, [isCharging]);

  // Handle User Shoot execution
  const executeUserKick = () => {
    if (ballState.inFlight || winner) return;

    setIsCharging(false);
    retroAudio.playKick(power);

    // Ball target coordinates
    const targetX = aimX + (Math.random() - 0.5) * 0.08;
    const targetY = 0.2 + aimY * 0.35;

    // Goalkeeper AI guess
    const gkGuessX = Math.random();
    const gkGuessY = 0.3 + Math.random() * 0.25;
    const isSave = Math.abs(gkGuessX - targetX) < 0.18 && power < 0.85;
    const isMiss = targetX < 0.15 || targetX > 0.85 || targetY < 0.15 || power > 0.95;

    // Trigger animations
    setBallState({ x: 0.5, y: 0.85, inFlight: true, scale: 1.0 });
    setGkState({
      x: gkGuessX,
      y: gkGuessY,
      diveAngle: (gkGuessX - 0.5) * 1.2,
      isDiving: true
    });

    // Flight animation
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / 20;

      setBallState({
        x: 0.5 + (targetX - 0.5) * progress,
        y: 0.85 + (targetY - 0.85) * progress,
        inFlight: true,
        scale: 1.0 - progress * 0.45
      });

      if (step >= 20) {
        clearInterval(interval);

        let result: KickResult = 'goal';
        if (isMiss) {
          result = 'missed';
          retroAudio.playRandomCrowdMissedShot();
          setAnnouncement('SHOT WIDE / OVER THE BAR!');
        } else if (isSave) {
          result = 'saved';
          retroAudio.playRandomCrowdSave();
          setAnnouncement('WHAT A SAVE BY THE KEEPER!');
        } else {
          result = 'goal';
          retroAudio.playRandomGoalCelebration();
          setAnnouncement('GOAL! PERFECT STRIKE!');
        }

        // Record kick
        const newHome = [...homeKicks];
        newHome[roundNumber - 1] = result;
        setHomeKicks(newHome);

        // Switch to CPU Turn
        setTimeout(() => {
          resetKickField();
          executeCpuKick(newHome);
        }, 2200);
      }
    }, 20);
  };

  // CPU Kick Execution
  const executeCpuKick = (currentHomeKicks: (KickResult | null)[]) => {
    setCurrentTurn('cpu');
    setAnnouncement('OPPONENT TAKING PENALTY...');

    setTimeout(() => {
      retroAudio.playKick(0.7);

      const targetX = 0.25 + Math.random() * 0.5;
      const targetY = 0.25 + Math.random() * 0.25;

      // User GK auto-dives
      const userGkX = Math.random();
      const isSave = Math.abs(userGkX - targetX) < 0.2;
      const isMiss = Math.random() < 0.15;

      setGkState({
        x: userGkX,
        y: 0.35,
        diveAngle: (userGkX - 0.5) * 1.2,
        isDiving: true
      });

      setBallState({
        x: targetX,
        y: targetY,
        inFlight: true,
        scale: 0.55
      });

      let result: KickResult = 'goal';
      if (isMiss) {
        result = 'missed';
        retroAudio.playRandomCrowdMissedShot();
        setAnnouncement('THEY MISSED! OFF TARGET!');
      } else if (isSave) {
        result = 'saved';
        retroAudio.playRandomCrowdSave();
        setAnnouncement('SAVED! SENSATIONAL STOP!');
      } else {
        result = 'goal';
        retroAudio.playRandomGoalCelebration();
        setAnnouncement('GOAL FOR OPPONENT!');
      }

      const newAway = [...awayKicks];
      newAway[roundNumber - 1] = result;
      setAwayKicks(newAway);

      setTimeout(() => {
        // Check winner
        checkShootoutWinner(currentHomeKicks, newAway);
      }, 2000);
    }, 1500);
  };

  const checkShootoutWinner = (hKicks: (KickResult | null)[], aKicks: (KickResult | null)[]) => {
    const hGoals = hKicks.filter((r) => r === 'goal').length;
    const aGoals = aKicks.filter((r) => r === 'goal').length;

    if (roundNumber >= 5) {
      if (hGoals > aGoals) {
        setWinner(homeTeam);
        setAnnouncement('VICTORY! YOU WON THE SHOOTOUT!');
        retroAudio.playGoalCelebration();
        return;
      } else if (aGoals > hGoals) {
        setWinner(awayTeam);
        setAnnouncement('DEFEATED IN PENALTIES!');
        return;
      }
    }

    // Next round
    setRoundNumber((r) => r + 1);
    setCurrentTurn('user');
    resetKickField();
    setAnnouncement('ROUND ' + (roundNumber + 1) + ' · YOUR TURN TO SHOOT');
  };

  const resetKickField = () => {
    setBallState({ x: 0.5, y: 0.85, inFlight: false, scale: 1.0 });
    setGkState({ x: 0.5, y: 0.45, diveAngle: 0, isDiving: false });
    setPower(0);
    setIsCharging(false);
  };

  const restartShootout = () => {
    setHomeKicks([null, null, null, null, null]);
    setAwayKicks([null, null, null, null, null]);
    setRoundNumber(1);
    setCurrentTurn('user');
    setWinner(null);
    resetKickField();
    setAnnouncement('AIM WITH ARROWS · HOLD SHOOT TO STRIKE');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 select-none">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between border-b border-rose-900/60 pb-3">
        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-arcade text-slate-400 hover:text-rose-400 border border-slate-700 bg-slate-900 px-3 py-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>QUIT</span>
        </button>

        <h2 className="font-pixel text-sm md:text-base text-rose-400 tracking-wider">
          PENALTY SHOOTOUT
        </h2>

        <button
          onClick={restartShootout}
          className="flex items-center gap-1.5 text-xs font-arcade text-slate-400 hover:text-slate-200 border border-slate-700 bg-slate-900 px-3 py-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESTART</span>
        </button>
      </header>

      {/* Main Stadium Penalty Box Arena */}
      <main className="w-full max-w-4xl mx-auto my-auto py-4 flex flex-col items-center">
        {/* Scorecard Ladder */}
        <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-800 p-4 mb-4 flex justify-between items-center shadow-xl">
          {/* Home team */}
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">{homeTeam.flag}</span>
            <span className="font-pixel text-xs text-yellow-300 mb-2">{homeTeam.countryCode}</span>
            <div className="flex gap-1.5">
              {homeKicks.map((k, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-pixel ${
                    k === 'goal'
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : k === 'saved' || k === 'missed'
                      ? 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  {k === 'goal' ? '✓' : k ? '✗' : ''}
                </div>
              ))}
            </div>
          </div>

          <div className="font-pixel text-lg text-slate-500">VS</div>

          {/* Away team */}
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">{awayTeam.flag}</span>
            <span className="font-pixel text-xs text-sky-300 mb-2">{awayTeam.countryCode}</span>
            <div className="flex gap-1.5">
              {awayKicks.map((k, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-pixel ${
                    k === 'goal'
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : k === 'saved' || k === 'missed'
                      ? 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  {k === 'goal' ? '✓' : k ? '✗' : ''}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stadium Goal Mouth View */}
        <div className="relative w-full max-w-xl h-72 md:h-80 bg-emerald-800 border-4 border-slate-900 overflow-hidden shadow-2xl">
          {/* Turf grass stripes */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#14532d_50%,#15803d_50%)] bg-[length:100%_40px]" />

          {/* White Penalty Box Markings */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40" />

          {/* Goal Frame */}
          <div className="absolute top-10 left-12 right-12 bottom-28 border-4 border-white bg-slate-950/20">
            {/* Goal net mesh pattern */}
            <div className="w-full h-full opacity-30 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:14px_14px]" />
          </div>

          {/* Target Aim Reticle (When User's Turn) */}
          {currentTurn === 'user' && !ballState.inFlight && (
            <div
              className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center"
              style={{
                left: `${12 + aimX * 76}%`,
                top: `${20 + aimY * 36}%`
              }}
            >
              <div className="w-full h-full border-2 border-dashed border-yellow-300 rounded-full animate-spin" />
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full absolute" />
            </div>
          )}

          {/* Goalkeeper Sprite */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
            style={{
              left: `${12 + gkState.x * 76}%`,
              top: `${20 + gkState.y * 36}%`,
              transform: `translate(-50%, -50%) rotate(${gkState.diveAngle}rad)`
            }}
          >
            <div className="flex flex-col items-center">
              {/* Head */}
              <div className="w-4 h-4 bg-[#fce0cd] border border-slate-900 rounded-sm" />
              {/* Body */}
              <div 
                className="w-7 h-8 border border-slate-900 shadow-sm"
                style={{ backgroundColor: currentTurn === 'user' ? awayTeam.gkColor : homeTeam.gkColor }}
              />
              {/* Legs */}
              <div className="flex gap-1">
                <div className="w-2.5 h-4 bg-slate-900" />
                <div className="w-2.5 h-4 bg-slate-900" />
              </div>
            </div>
          </div>

          {/* Soccer Ball */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
            style={{
              left: `${ballState.x * 100}%`,
              top: `${ballState.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${ballState.scale})`
            }}
          >
            <div className="w-6 h-6 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-slate-900 rounded-full" />
            </div>
          </div>
        </div>

        {/* Dynamic Announcement Banner */}
        <div className="mt-3 text-center">
          <span className="font-pixel text-xs text-yellow-300 bg-slate-900 border border-slate-700 px-4 py-1.5 inline-block">
            {announcement}
          </span>
        </div>

        {/* Kick Controls (User's Turn) */}
        {currentTurn === 'user' && !winner && (
          <div className="w-full max-w-xl mt-4 bg-slate-900 border border-slate-800 p-4 flex flex-col items-center">
            {/* Aim Direction Sliders */}
            <div className="w-full grid grid-cols-2 gap-4 mb-4 text-xs font-arcade">
              <div>
                <label className="text-slate-400 block mb-1">AIM HORIZONTAL (LEFT / RIGHT)</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={aimX}
                  onChange={(e) => setAimX(parseFloat(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">AIM VERTICAL (LOW / HIGH)</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={aimY}
                  onChange={(e) => setAimY(parseFloat(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Power Meter */}
            <div className="w-full mb-4">
              <div className="flex justify-between text-[10px] font-arcade text-slate-400 mb-1">
                <span>STRIKE POWER</span>
                <span>{Math.round(power * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 border border-slate-700 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    power < 0.5 ? 'bg-emerald-500' : power < 0.85 ? 'bg-yellow-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${power * 100}%` }}
                />
              </div>
            </div>

            {/* Action Strike Button */}
            <button
              onMouseDown={() => setIsCharging(true)}
              onMouseUp={executeUserKick}
              onTouchStart={() => setIsCharging(true)}
              onTouchEnd={executeUserKick}
              className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-pixel text-xs tracking-wider border-2 border-yellow-300 cursor-pointer shadow-lg active:scale-95"
            >
              {isCharging ? 'RELEASE TO SHOOT!' : 'HOLD TO CHARGE & SHOOT'}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center border-t border-slate-900 pt-3 text-xs text-slate-500 font-arcade">
        PENALTY SUDDEN DEATH RULES ACTIVE
      </footer>
    </div>
  );
};
