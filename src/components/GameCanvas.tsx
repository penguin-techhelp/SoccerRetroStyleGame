import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SoccerGameEngine } from '../game/engine';
import { SoccerRenderer } from '../game/renderer';
import { MatchSettings, Team, CommentaryToast } from '../types/game';
import { retroAudio } from '../audio/retroAudio';
import { CommentaryToastBox } from './CommentaryToastBox';
import { LiveMatchHUD, LiveStatsData, HUDViewMode } from './LiveMatchHUD';
import { Pause, Play, RotateCcw, Volume2, VolumeX, ArrowLeft, BarChart2, Maximize2, Minimize2, Monitor, Bot, Zap } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<SoccerGameEngine | null>(null);
  const rendererRef = useRef<SoccerRenderer | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [soundMuted, setSoundMuted] = useState(retroAudio.isSoundMuted());
  const [gameClockDisplay, setGameClockDisplay] = useState('00:00');
  const [matchPeriod, setMatchPeriod] = useState<'1ST' | '2ND' | 'HT' | 'FT'>('1ST');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [autoPlay, setAutoPlay] = useState(Boolean(settings.autoPlay));

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.setAutoPlay(next);
      }
      retroAudio.playMenuBeep();
      return next;
    });
  }, []);

  const [commentaryToast, setCommentaryToast] = useState<CommentaryToast | null>(null);

  // 16:9 Widescreen & Fullscreen States for Chromebooks / Windows Laptops
  const [isAspect169, setIsAspect169] = useState(settings.aspectRatio169 !== false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Match Stats HUD State
  const [hudMode, setHudMode] = useState<HUDViewMode>('compact');
  const [liveStats, setLiveStats] = useState<LiveStatsData>({
    homePossPct: 50,
    awayPossPct: 50,
    homeShots: 0,
    awayShots: 0,
    homeShotsOnTarget: 0,
    awayShotsOnTarget: 0,
    homeFouls: 0,
    awayFouls: 0,
    homeYellowCards: 0,
    awayYellowCards: 0,
    homeRedCards: 0,
    awayRedCards: 0,
  });
  const frameCountRef = useRef(0);

  const cycleHudMode = useCallback(() => {
    setHudMode((prev) => {
      if (prev === 'compact') return 'expanded';
      if (prev === 'expanded') return 'hidden';
      return 'compact';
    });
    retroAudio.playMenuBeep();
  }, []);

  const handleDismissCommentary = useCallback(() => {
    setCommentaryToast(null);
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      // Fallback if browser fullscreen is blocked
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

    engine.onCommentaryEvent = (toast: CommentaryToast) => {
      setCommentaryToast(toast);
      retroAudio.playCommentaryJingle();
    };

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

  const togglePause = useCallback(() => {
    if (!engineRef.current) return;
    const nextState = !engineRef.current.isPaused;
    engineRef.current.isPaused = nextState;
    setIsPaused(nextState);
    retroAudio.playMenuBeep();
  }, []);

  // Keyboard Event Listeners (Chromebook & Laptop Optimized)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling on game navigation keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      keysDown.current[e.code] = true;

      // Pause toggle [P] / [Esc]
      if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      }

      // 16:9 Fullscreen toggle [F]
      if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }

      // Auto Mode toggle [KeyA] (without ctrl/alt)
      if (e.code === 'KeyA' && !e.ctrlKey && !e.altKey && !settings.twoPlayer) {
        e.preventDefault();
        toggleAutoPlay();
      }

      // 16:9 Aspect Ratio toggle [Ctrl+A or Alt+A]
      if (e.code === 'KeyA' && (e.ctrlKey || e.altKey)) {
        e.preventDefault();
        setIsAspect169((v) => !v);
      }

      // Replay toggle [R]
      if (e.code === 'KeyR' && engineRef.current) {
        if (engineRef.current.isReplayPlaying) {
          engineRef.current.stopInstantReplay();
        } else {
          engineRef.current.startInstantReplay();
        }
      }

      // Live Stats HUD toggle [Tab] or [KeyT]
      if (e.code === 'Tab' || e.code === 'KeyT') {
        e.preventDefault();
        cycleHudMode();
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
  }, [cycleHudMode, togglePause, toggleFullscreen]);

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

        // Player 1 Input Combination
        // If 2P mode: P1 uses WASD (left side of laptop keyboard)
        // If 1P mode: P1 can use WASD or Arrow Keys
        const p1Keys = keysDown.current;
        const gp1Left = gp1 ? gp1.axes[0] < -0.4 || gp1.buttons[14]?.pressed : false;
        const gp1Right = gp1 ? gp1.axes[0] > 0.4 || gp1.buttons[15]?.pressed : false;
        const gp1Up = gp1 ? gp1.axes[1] < -0.4 || gp1.buttons[12]?.pressed : false;
        const gp1Down = gp1 ? gp1.axes[1] > 0.4 || gp1.buttons[13]?.pressed : false;

        const inputP1 = {
          up: p1Keys['KeyW'] || (!settings.twoPlayer && p1Keys['ArrowUp']) || gp1Up || touchDpad.current.up,
          down: p1Keys['KeyS'] || (!settings.twoPlayer && p1Keys['ArrowDown']) || gp1Down || touchDpad.current.down,
          left: p1Keys['KeyA'] || (!settings.twoPlayer && p1Keys['ArrowLeft']) || gp1Left || touchDpad.current.left,
          right: p1Keys['KeyD'] || (!settings.twoPlayer && p1Keys['ArrowRight']) || gp1Right || touchDpad.current.right,
          pass: p1Keys['KeyJ'] || p1Keys['KeyZ'] || (gp1 ? gp1.buttons[0]?.pressed : false) || touchButtons.current.pass,
          shoot: p1Keys['KeyK'] || p1Keys['KeyX'] || (gp1 ? gp1.buttons[2]?.pressed || gp1.buttons[3]?.pressed : false) || touchButtons.current.shoot,
          slide: p1Keys['KeyL'] || p1Keys['KeyC'] || (gp1 ? gp1.buttons[1]?.pressed : false) || touchButtons.current.slide,
          sprint: p1Keys['ShiftLeft'] || p1Keys['Space'] || (gp1 ? gp1.buttons[5]?.pressed || gp1.buttons[7]?.pressed : false) || touchButtons.current.sprint,
        };

        // Player 2 Input (Optimized for Chromebooks & laptops without Numpads!)
        let inputP2;
        if (settings.twoPlayer) {
          const gp2Left = gp2 ? gp2.axes[0] < -0.4 || gp2.buttons[14]?.pressed : false;
          const gp2Right = gp2 ? gp2.axes[0] > 0.4 || gp2.buttons[15]?.pressed : false;
          const gp2Up = gp2 ? gp2.axes[1] < -0.4 || gp2.buttons[12]?.pressed : false;
          const gp2Down = gp2 ? gp2.axes[1] > 0.4 || gp2.buttons[13]?.pressed : false;

          inputP2 = {
            up: p1Keys['ArrowUp'] || p1Keys['Numpad8'] || p1Keys['KeyI'] || gp2Up,
            down: p1Keys['ArrowDown'] || p1Keys['Numpad5'] || p1Keys['KeyK'] || gp2Down,
            left: p1Keys['ArrowLeft'] || p1Keys['Numpad4'] || p1Keys['KeyJ'] || gp2Left,
            right: p1Keys['ArrowRight'] || p1Keys['Numpad6'] || p1Keys['KeyL'] || gp2Right,
            pass: p1Keys['KeyN'] || p1Keys['Comma'] || p1Keys['Numpad1'] || (gp2 ? gp2.buttons[0]?.pressed : false),
            shoot: p1Keys['KeyM'] || p1Keys['Period'] || p1Keys['Numpad2'] || (gp2 ? gp2.buttons[2]?.pressed : false),
            slide: p1Keys['KeyB'] || p1Keys['Slash'] || p1Keys['Numpad3'] || (gp2 ? gp2.buttons[1]?.pressed : false),
            sprint: p1Keys['ShiftRight'] || p1Keys['Enter'] || p1Keys['Numpad0'] || (gp2 ? gp2.buttons[5]?.pressed : false),
          };
        }

        // Update Physics Engine
        engine.update(inputP1, inputP2);

        // Render Canvas Frame
        renderer.render(engine, canvas.clientWidth, canvas.clientHeight);

        // Update React HUD states periodically
        setHomeScore(engine.homeScore);
        setAwayScore(engine.awayScore);

        // Update Live Match Stats (possession %, shots, fouls)
        frameCountRef.current++;
        if (frameCountRef.current % 15 === 0) {
          const totalPoss = engine.homeStats.possessionTimeSeconds + engine.awayStats.possessionTimeSeconds;
          const homePct = totalPoss > 0 ? Math.round((engine.homeStats.possessionTimeSeconds / totalPoss) * 100) : 50;
          const awayPct = 100 - homePct;

          setLiveStats({
            homePossPct: homePct,
            awayPossPct: awayPct,
            homeShots: engine.homeStats.shots,
            awayShots: engine.awayStats.shots,
            homeShotsOnTarget: engine.homeStats.shotsOnTarget,
            awayShotsOnTarget: engine.awayStats.shotsOnTarget,
            homeFouls: engine.homeStats.fouls,
            awayFouls: engine.awayStats.fouls,
            homeYellowCards: engine.homeStats.yellowCards,
            awayYellowCards: engine.awayStats.yellowCards,
            homeRedCards: engine.homeStats.redCards,
            awayRedCards: engine.awayStats.redCards,
          });
        }

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
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col select-none"
    >
      {/* Top 16-Bit Scoreboard & Broadcast Controls Bar */}
      <header className="relative z-20 shrink-0 flex items-center justify-between px-3 md:px-5 py-2 bg-slate-950/95 border-b border-emerald-900/80 backdrop-blur-sm">
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
        <div className="flex items-center gap-2.5 sm:gap-4 bg-slate-900/90 px-3 sm:px-4 py-1 border border-slate-700 shadow-inner">
          <div className="flex items-center gap-1.5 sm:gap-2 font-pixel text-base sm:text-xl text-slate-100">
            <span className="text-yellow-400">{homeScore}</span>
            <span className="text-slate-500">-</span>
            <span className="text-sky-400">{awayScore}</span>
          </div>

          <div className="h-5 w-px bg-slate-700" />

          <div className="flex flex-col items-center">
            <span className="font-pixel text-[10px] sm:text-xs text-emerald-400">
              {gameClockDisplay}
            </span>
            <span className="font-arcade text-[8px] sm:text-[9px] text-slate-400">
              {matchPeriod} HALF
            </span>
          </div>
        </div>

        {/* Right: Away Team + Chromebook/Laptop Quick Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex flex-col items-end hidden xs:flex">
            <span className="font-pixel text-xs md:text-sm text-sky-400">
              {awayTeam.countryCode}
            </span>
            <span className="text-[10px] text-slate-400 font-arcade hidden sm:inline">
              {awayTeam.name}
            </span>
          </div>
          <span className="text-xl md:text-2xl">{awayTeam.flag}</span>

          <div className="h-5 w-px bg-slate-800 mx-0.5 hidden sm:block" />

          {/* 16:9 Aspect Ratio Lock Toggle */}
          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              setIsAspect169(!isAspect169);
            }}
            className={`p-1 sm:p-1.5 border ${
              isAspect169
                ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300'
                : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
            } text-[10px] font-arcade flex items-center gap-1 cursor-pointer transition-colors`}
            title="Toggle 16:9 Aspect Ratio / Full-Bleed"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isAspect169 ? '16:9 FIT' : 'STRETCH'}</span>
          </button>

          {/* Fullscreen Toggle (F) */}
          <button
            onClick={toggleFullscreen}
            className="p-1 sm:p-1.5 border border-slate-700 bg-slate-900 text-slate-300 hover:text-emerald-400 text-xs font-arcade flex items-center gap-1 cursor-pointer"
            title="Toggle 16:9 Fullscreen [F]"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">[F]</span>
          </button>

          {/* Live Stats HUD Button */}
          <button
            onClick={cycleHudMode}
            className={`p-1 sm:p-1.5 border ${
              hudMode !== 'hidden'
                ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300'
                : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-emerald-400'
            } text-xs font-arcade flex items-center gap-1 cursor-pointer transition-colors`}
            title="Live Match Stats HUD (Tab)"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              HUD {hudMode === 'expanded' ? '[FULL]' : hudMode === 'compact' ? '[MINI]' : '[OFF]'}
            </span>
          </button>

          {/* Instant Replay Button */}
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
            className="p-1 sm:p-1.5 border border-slate-700 bg-slate-900 text-slate-300 hover:text-emerald-400 text-xs font-arcade hidden md:flex items-center gap-1 cursor-pointer"
            title="Instant Replay (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>[R]</span>
          </button>

          {/* Auto Mode Toggle Button [A] */}
          {!settings.twoPlayer && (
            <button
              onClick={toggleAutoPlay}
              className={`p-1 sm:p-1.5 border text-xs font-arcade flex items-center gap-1 cursor-pointer transition-all ${
                autoPlay
                  ? 'border-cyan-400 bg-cyan-950/90 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-cyan-300 hover:border-slate-600'
              }`}
              title="Auto Mode [A] (AI controls Home Team with manual takeover)"
            >
              <Bot className={`w-3.5 h-3.5 ${autoPlay ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span className="font-pixel text-[9px] font-bold">
                AUTO {autoPlay ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {/* Gopi Mode Status Tag for Intel N-Series iGPU */}
          {settings.performanceMode === 'gopi' && (
            <div
              className="hidden sm:flex items-center gap-1 px-1.5 py-1 border border-cyan-500/80 bg-cyan-950/70 text-cyan-300 text-[9px] font-pixel shadow-xs"
              title="Gopi Mode Active: Tuned for Intel Processor N150 / 8GB RAM Integrated Intel UHD Graphics"
            >
              <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400 animate-pulse" />
              <span>GOPI 60FPS</span>
            </div>
          )}

          {/* Pause Button */}
          <button
            onClick={togglePause}
            className="p-1 sm:p-1.5 border border-slate-700 bg-slate-900 text-slate-300 hover:text-yellow-400 cursor-pointer"
            title="Pause (P / Esc)"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1 sm:p-1.5 border border-slate-700 bg-slate-900 text-slate-300 hover:text-emerald-400 cursor-pointer"
            title="Toggle Audio [M]"
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Pitch Arena Viewport (16:9 Optimized) */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
        {isAspect169 ? (
          <div className="relative aspect-video w-full h-full max-w-full max-h-full shadow-2xl bg-slate-950 flex items-center justify-center border-x-2 sm:border-x-4 border-slate-900 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full block bg-slate-950 cursor-crosshair object-contain"
            />
            {/* CRT Scanline Filter Overlay */}
            {settings.crtFilter && (
              <div className="absolute inset-0 crt-overlay crt-vignette pointer-events-none z-10" />
            )}
          </div>
        ) : (
          <div className="relative w-full h-full">
            <canvas
              ref={canvasRef}
              className="w-full h-full block bg-slate-950 cursor-crosshair"
            />
            {/* CRT Scanline Filter Overlay */}
            {settings.crtFilter && (
              <div className="absolute inset-0 crt-overlay crt-vignette pointer-events-none z-10" />
            )}
          </div>
        )}
      </div>

      {/* Auto Pilot Active Status Pill */}
      {autoPlay && !isPaused && (
        <div className="absolute top-13 left-2 sm:left-4 z-20 pointer-events-none transition-all">
          <div className="flex items-center gap-2 px-2 sm:px-2.5 py-1 bg-slate-950/90 border border-cyan-400/80 shadow-lg shadow-cyan-950/60 backdrop-blur-xs rounded-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="font-pixel text-[8px] sm:text-[9px] text-cyan-300 tracking-wider">
              🤖 AUTO MODE ACTIVE
            </span>
            <span className="font-arcade text-[9px] text-slate-400 hidden sm:inline">
              (Press [A] to toggle · Use keys/touch to take over)
            </span>
          </div>
        </div>
      )}

      {/* Virtual Touch Controls (Visible only on compact touch mobile screens) */}
      <div className="md:hidden absolute bottom-3 left-3 right-3 z-20 flex justify-between items-end pointer-events-none">
        {/* Virtual D-Pad (Left) */}
        <div className="relative w-28 h-28 bg-slate-900/70 border border-slate-700 rounded-lg pointer-events-auto p-1 grid grid-cols-3 grid-rows-3 gap-0.5 shadow-xl">
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
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <button
              onTouchStart={() => (touchButtons.current.sprint = true)}
              onTouchEnd={() => (touchButtons.current.sprint = false)}
              className="w-12 h-12 bg-sky-900/90 active:bg-sky-600 border border-sky-400 font-pixel text-[8px] text-sky-200 rounded-md shadow-lg flex items-center justify-center"
            >
              RUN
            </button>
            <button
              onTouchStart={() => (touchButtons.current.slide = true)}
              onTouchEnd={() => (touchButtons.current.slide = false)}
              className="w-12 h-12 bg-amber-900/90 active:bg-amber-600 border border-amber-400 font-pixel text-[8px] text-amber-200 rounded-md shadow-lg flex items-center justify-center"
            >
              SLIDE
            </button>
          </div>
          <div className="flex gap-1.5">
            <button
              onTouchStart={() => (touchButtons.current.pass = true)}
              onTouchEnd={() => (touchButtons.current.pass = false)}
              className="w-12 h-12 bg-emerald-900/90 active:bg-emerald-600 border border-emerald-400 font-pixel text-[8px] text-emerald-200 rounded-md shadow-lg flex items-center justify-center"
            >
              PASS
            </button>
            <button
              onTouchStart={() => (touchButtons.current.shoot = true)}
              onTouchEnd={() => (touchButtons.current.shoot = false)}
              className="w-12 h-12 bg-rose-900/90 active:bg-rose-600 border border-rose-400 font-pixel text-[8px] text-rose-200 rounded-md shadow-lg flex items-center justify-center"
            >
              SHOOT
            </button>
          </div>
        </div>
      </div>

      {/* Pause Menu Modal Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-emerald-500 p-6 shadow-2xl text-center">
            <h3 className="font-pixel text-base sm:text-lg text-yellow-300 mb-5 tracking-wider">
              MATCH PAUSED
            </h3>

            <div className="space-y-2.5 font-arcade text-xs">
              <button
                onClick={togglePause}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold border border-emerald-300 transition-colors cursor-pointer"
              >
                RESUME MATCH [ESC]
              </button>

              {!settings.twoPlayer && (
                <button
                  onClick={() => {
                    toggleAutoPlay();
                  }}
                  className={`w-full py-2.5 font-bold border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    autoPlay
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-400 hover:bg-cyan-900'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>AUTO MODE: {autoPlay ? 'ENABLED [ON]' : 'DISABLED [OFF]'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  togglePause();
                  if (engineRef.current) engineRef.current.startInstantReplay();
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
              >
                WATCH INSTANT REPLAY [R]
              </button>

              <button
                onClick={toggleFullscreen}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
              >
                {isFullscreen ? 'EXIT FULLSCREEN [F]' : 'ENTER 16:9 FULLSCREEN [F]'}
              </button>

              <button
                onClick={onExitMatch}
                className="w-full py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-600 transition-colors cursor-pointer"
              >
                QUIT TO MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Match Stats HUD Overlay (Possession %, Shots, Fouls) */}
      <LiveMatchHUD
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        stats={liveStats}
        mode={hudMode}
        onSetMode={setHudMode}
      />

      {/* 16-Bit Arcade Commentator Toast Notification */}
      <CommentaryToastBox
        toast={commentaryToast}
        onDismiss={handleDismissCommentary}
      />
    </div>
  );
};
