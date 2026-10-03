import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SoccerGameEngine } from '../game/engine';
import { SoccerRenderer } from '../game/renderer';
import { MatchSettings, Team } from '../types/game';
import { retroAudio } from '../audio/retroAudio';
import { Pause, Play, RotateCcw, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

interface GameCanvasProps {
  homeTeam: Team;
  awayTeam: Team;
  settings: MatchSettings;
  onMatchComplete: (stats: { homeScore: number; awayScore: number; engine: SoccerGameEngine }) => void;
  onExitMatch: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  homeTeam,
  awayTeam,
  settings,
  onMatchComplete,
  onExitMatch
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SoccerGameEngine | null>(null);
  const rendererRef = useRef<SoccerRenderer | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [soundMuted, setSoundMuted] = useState(retroAudio.isSoundMuted());
  const [gameClockDisplay, setGameClockDisplay] = useState('00:00');
  const [matchPeriod, setMatchPeriod] = useState<'1ST' | '2ND' | 'HT' | 'FT'>('1ST');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Keyboard input states
  const keysDown = useRef<Record<string, boolean>>({});

  // Touch virtual controls state
  const touchDpad = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false
  });
  const touchButtons = useRef<{ pass: boolean; shoot: boolean; slide: boolean; sprint: boolean }>({
    pass: false,
    shoot: false,
    slide: false,
    sprint: false
  });

  // Initialize engine
  useEffect(() => {
    const engine = new SoccerGameEngine(homeTeam, awayTeam, settings);
    engineRef.current = engine;

    if (canvasRef.current) {
      rendererRef.current = new SoccerRenderer(canvasRef.current);
    }

    retroAudio.startCrowdAmbience();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [homeTeam, awayTeam, settings]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling on game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      keysDown.current[e.code] = true;

      // Pause toggle
      if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      }

      // Replay toggle [R]
      if (e.code === 'KeyR' && engineRef.current) {
        if (engineRef.current.isReplayPlaying) {
          engineRef.current.stopInstantReplay();
        } else {
          engineRef.current.startInstantReplay();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const togglePause = useCallback(() => {
    if (!engineRef.current) return;
    const nextState = !engineRef.current.isPaused;
    engineRef.current.isPaused = nextState;
    setIsPaused(nextState);
    retroAudio.playMenuBeep();
  }, []);

  const handleToggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    retroAudio.setMuted(next);
  };

  // Main Render & Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const engine = engineRef.current;
      const renderer = rendererRef.current;
      const canvas = canvasRef.current;

      if (engine && renderer && canvas) {
        // Read Gamepad Inputs
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp1 = gamepads[0];
        const gp2 = gamepads[1];

        // Player 1 Input Combination (Keyboard + Gamepad 1 + Touch)
        const p1Keys = keysDown.current;
        const gp1Left = gp1 ? gp1.axes[0] < -0.4 || gp1.buttons[14]?.pressed : false;
        const gp1Right = gp1 ? gp1.axes[0] > 0.4 || gp1.buttons[15]?.pressed : false;
        const gp1Up = gp1 ? gp1.axes[1] < -0.4 || gp1.buttons[12]?.pressed : false;
        const gp1Down = gp1 ? gp1.axes[1] > 0.4 || gp1.buttons[13]?.pressed : false;

        const inputP1 = {
          up: p1Keys['KeyW'] || p1Keys['ArrowUp'] || gp1Up || touchDpad.current.up,
          down: p1Keys['KeyS'] || p1Keys['ArrowDown'] || gp1Down || touchDpad.current.down,
          left: p1Keys['KeyA'] || p1Keys['ArrowLeft'] || gp1Left || touchDpad.current.left,
          right: p1Keys['KeyD'] || p1Keys['ArrowRight'] || gp1Right || touchDpad.current.right,
          pass: p1Keys['KeyJ'] || p1Keys['KeyZ'] || (gp1 ? gp1.buttons[0]?.pressed : false) || touchButtons.current.pass,
          shoot: p1Keys['KeyK'] || p1Keys['KeyX'] || (gp1 ? gp1.buttons[2]?.pressed || gp1.buttons[3]?.pressed : false) || touchButtons.current.shoot,
          slide: p1Keys['KeyL'] || p1Keys['KeyC'] || (gp1 ? gp1.buttons[1]?.pressed : false) || touchButtons.current.slide,
          sprint: p1Keys['ShiftLeft'] || p1Keys['Space'] || (gp1 ? gp1.buttons[5]?.pressed || gp1.buttons[7]?.pressed : false) || touchButtons.current.sprint,
        };

        // Player 2 Input (if 2P mode)
        let inputP2;
        if (settings.twoPlayer) {
          const gp2Left = gp2 ? gp2.axes[0] < -0.4 || gp2.buttons[14]?.pressed : false;
          const gp2Right = gp2 ? gp2.axes[0] > 0.4 || gp2.buttons[15]?.pressed : false;
          const gp2Up = gp2 ? gp2.axes[1] < -0.4 || gp2.buttons[12]?.pressed : false;
          const gp2Down = gp2 ? gp2.axes[1] > 0.4 || gp2.buttons[13]?.pressed : false;

          inputP2 = {
            up: p1Keys['Numpad8'] || p1Keys['KeyI'] || gp2Up,
            down: p1Keys['Numpad5'] || p1Keys['KeyK'] || gp2Down,
            left: p1Keys['Numpad4'] || p1Keys['KeyJ'] || gp2Left,
            right: p1Keys['Numpad6'] || p1Keys['KeyL'] || gp2Right,
            pass: p1Keys['Numpad1'] || p1Keys['Comma'] || (gp2 ? gp2.buttons[0]?.pressed : false),
            shoot: p1Keys['Numpad2'] || p1Keys['Period'] || (gp2 ? gp2.buttons[2]?.pressed : false),
            slide: p1Keys['Numpad3'] || p1Keys['Slash'] || (gp2 ? gp2.buttons[1]?.pressed : false),
            sprint: p1Keys['Numpad0'] || p1Keys['Enter'] || (gp2 ? gp2.buttons[5]?.pressed : false),
          };
        }

        // Update Physics Engine
        engine.update(inputP1, inputP2);

        // Render Canvas Frame
        renderer.render(engine, canvas.clientWidth, canvas.clientHeight);

        // Update React HUD states periodically
        setHomeScore(engine.homeScore);
        setAwayScore(engine.awayScore);

        const totalSecs = Math.floor(engine.matchClock);
        const matchMinute = Math.min(90, Math.floor((engine.matchClock / (settings.halfLengthSeconds * 2)) * 90));
        setGameClockDisplay(`${matchMinute < 10 ? '0' : ''}${matchMinute}:00`);

        if (engine.isFulltime) {
          setMatchPeriod('FT');
          onMatchComplete({ homeScore: engine.homeScore, awayScore: engine.awayScore, engine });
          return;
        } else if (engine.isHalftime) {
          setMatchPeriod('HT');
        } else if (engine.matchClock < settings.halfLengthSeconds) {
          setMatchPeriod('1ST');
        } else {
          setMatchPeriod('2ND');
        }
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [settings, onMatchComplete]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col select-none">
      {/* Top 16-Bit Scoreboard Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 md:px-6 py-2.5 bg-slate-950/90 border-b border-emerald-900/80 backdrop-blur-sm">
        {/* Left: Home Team */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xl md:text-2xl">{homeTeam.flag}</span>
          <div className="flex flex-col">
            <span className="font-pixel text-xs md:text-sm text-yellow-300">
              {homeTeam.countryCode}
            </span>
            <span className="text-[10px] text-slate-400 font-arcade hidden sm:inline">
              {homeTeam.name}
            </span>
          </div>
        </div>

        {/* Center: Live Match Clock & Score */}
        <div className="flex items-center gap-3 md:gap-5 bg-slate-900/90 px-4 py-1.5 border border-slate-700 shadow-inner">
          <div className="flex items-center gap-2 font-pixel text-lg md:text-2xl text-slate-100">
            <span className="text-yellow-400">{homeScore}</span>
            <span className="text-slate-500">-</span>
            <span className="text-sky-400">{awayScore}</span>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <div className="flex flex-col items-center">
            <span className="font-pixel text-[11px] md:text-xs text-emerald-400">
              {gameClockDisplay}
            </span>
            <span className="font-arcade text-[9px] text-slate-400">
              {matchPeriod} HALF
            </span>
          </div>
        </div>

        {/* Right: Away Team + Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex flex-col items-end">
            <span className="font-pixel text-xs md:text-sm text-sky-400">
              {awayTeam.countryCode}
            </span>
            <span className="text-[10px] text-slate-400 font-arcade hidden sm:inline">
              {awayTeam.name}
            </span>
          </div>
          <span className="text-xl md:text-2xl">{awayTeam.flag}</span>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Replay Button */}
          <button
            onClick={() => {
              if (engineRef.current) {
                if (engineRef.current.isReplayPlaying) {
                  engineRef.current.stopInstantReplay();
                } else {
                  engineRef.current.startInstantReplay();
                }
              }
            }}
            className="p-1.5 border border-slate-700 bg-slate-900 text-slate-300 hover:text-emerald-400 text-xs font-arcade hidden md:flex items-center gap-1"
            title="Instant Replay (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REPLAY [R]</span>
          </button>

          {/* Pause Button */}
          <button
            onClick={togglePause}
            className="p-1.5 border border-slate-700 bg-slate-900 text-slate-300 hover:text-yellow-400"
            title="Pause (P / Esc)"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 border border-slate-700 bg-slate-900 text-slate-300 hover:text-emerald-400"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Full-Screen Game Canvas */}
      <div className="relative flex-1 w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full block bg-slate-950 cursor-crosshair"
        />

        {/* CRT Scanline Filter Overlay */}
        {settings.crtFilter && (
          <div className="absolute inset-0 crt-overlay crt-vignette pointer-events-none z-10" />
        )}
      </div>

      {/* On-Screen Mobile / Touch Virtual Controls */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end pointer-events-none">
        {/* Virtual D-Pad (Left) */}
        <div className="relative w-32 h-32 bg-slate-900/60 border border-slate-700 rounded-lg pointer-events-auto p-1 grid grid-cols-3 grid-rows-3 gap-1 shadow-xl">
          <div />
          <button
            onTouchStart={() => (touchDpad.current.up = true)}
            onTouchEnd={() => (touchDpad.current.up = false)}
            className="bg-slate-800 active:bg-emerald-600 border border-slate-600 text-xs font-pixel text-slate-300 flex items-center justify-center"
          >
            ▲
          </button>
          <div />
          <button
            onTouchStart={() => (touchDpad.current.left = true)}
            onTouchEnd={() => (touchDpad.current.left = false)}
            className="bg-slate-800 active:bg-emerald-600 border border-slate-600 text-xs font-pixel text-slate-300 flex items-center justify-center"
          >
            ◀
          </button>
          <div className="bg-slate-950/80 border border-slate-800 rounded-sm" />
          <button
            onTouchStart={() => (touchDpad.current.right = true)}
            onTouchEnd={() => (touchDpad.current.right = false)}
            className="bg-slate-800 active:bg-emerald-600 border border-slate-600 text-xs font-pixel text-slate-300 flex items-center justify-center"
          >
            ▶
          </button>
          <div />
          <button
            onTouchStart={() => (touchDpad.current.down = true)}
            onTouchEnd={() => (touchDpad.current.down = false)}
            className="bg-slate-800 active:bg-emerald-600 border border-slate-600 text-xs font-pixel text-slate-300 flex items-center justify-center"
          >
            ▼
          </button>
          <div />
        </div>

        {/* Action Buttons (Right) */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onTouchStart={() => (touchButtons.current.sprint = true)}
              onTouchEnd={() => (touchButtons.current.sprint = false)}
              className="w-14 h-14 bg-sky-900/90 active:bg-sky-600 border-2 border-sky-400 font-pixel text-[9px] text-sky-200 rounded-md shadow-lg flex items-center justify-center"
            >
              RUN
            </button>
            <button
              onTouchStart={() => (touchButtons.current.slide = true)}
              onTouchEnd={() => (touchButtons.current.slide = false)}
              className="w-14 h-14 bg-amber-900/90 active:bg-amber-600 border-2 border-amber-400 font-pixel text-[9px] text-amber-200 rounded-md shadow-lg flex items-center justify-center"
            >
              SLIDE
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onTouchStart={() => (touchButtons.current.pass = true)}
              onTouchEnd={() => (touchButtons.current.pass = false)}
              className="w-14 h-14 bg-emerald-900/90 active:bg-emerald-600 border-2 border-emerald-400 font-pixel text-[9px] text-emerald-200 rounded-md shadow-lg flex items-center justify-center"
            >
              PASS
            </button>
            <button
              onTouchStart={() => (touchButtons.current.shoot = true)}
              onTouchEnd={() => (touchButtons.current.shoot = false)}
              className="w-14 h-14 bg-rose-900/90 active:bg-rose-600 border-2 border-rose-400 font-pixel text-[9px] text-rose-200 rounded-md shadow-lg flex items-center justify-center"
            >
              SHOOT
            </button>
          </div>
        </div>
      </div>

      {/* Pause Menu Modal Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-emerald-500 p-6 shadow-2xl text-center">
            <h3 className="font-pixel text-lg text-yellow-300 mb-6 tracking-wider">
              MATCH PAUSED
            </h3>

            <div className="space-y-3 font-arcade text-xs">
              <button
                onClick={togglePause}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold border border-emerald-300 transition-colors"
              >
                RESUME MATCH
              </button>

              <button
                onClick={() => {
                  togglePause();
                  if (engineRef.current) engineRef.current.startInstantReplay();
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
              >
                WATCH INSTANT REPLAY
              </button>

              <button
                onClick={onExitMatch}
                className="w-full py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-600 transition-colors"
              >
                QUIT TO MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
