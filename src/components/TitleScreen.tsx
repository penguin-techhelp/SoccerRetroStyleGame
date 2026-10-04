import React, { useState, useEffect } from 'react';
import { GameMode, Difficulty, Weather } from '../types/game';
import { retroAudio } from '../audio/retroAudio';
import { Volume2, VolumeX, Tv, HelpCircle, Trophy, Play, Target, Shield, Award, Maximize2, Minimize2, Monitor, Cpu } from 'lucide-react';

interface TitleScreenProps {
  onSelectMode: (mode: GameMode) => void;
  difficulty: Difficulty;
  onChangeDifficulty: (d: Difficulty) => void;
  halfLength: number;
  onChangeHalfLength: (sec: number) => void;
  weather: Weather;
  onChangeWeather: (w: Weather) => void;
  crtFilter: boolean;
  onToggleCrt: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  aspectRatio169?: boolean;
  onToggleAspectRatio?: () => void;
  performanceMode?: 'standard' | 'eco';
  onTogglePerformanceMode?: () => void;
  onOpenControls: () => void;
  onOpenRoster?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onSelectMode,
  difficulty,
  onChangeDifficulty,
  halfLength,
  onChangeHalfLength,
  weather,
  onChangeWeather,
  crtFilter,
  onToggleCrt,
  soundEnabled,
  onToggleSound,
  aspectRatio169 = true,
  onToggleAspectRatio,
  performanceMode = 'standard',
  onTogglePerformanceMode,
  onOpenControls,
  onOpenRoster,
}) => {
  const [hasStartedMusic, setHasStartedMusic] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleStartMusic = () => {
    if (!hasStartedMusic) {
      retroAudio.startTitleMusic();
      setHasStartedMusic(true);
    }
  };

  const handleModeClick = (mode: GameMode) => {
    retroAudio.playMenuBeep();
    retroAudio.stopMusic();
    onSelectMode(mode);
  };

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between items-center bg-slate-950 text-slate-100 p-3 sm:p-5 select-none"
      onClick={handleStartMusic}
    >
      {/* Top Bar Navigation (16:9 Optimized) */}
      <header className="w-full max-w-5xl flex items-center justify-between border-b border-emerald-900/60 pb-2.5 z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-pixel text-emerald-400 text-xs sm:text-sm md:text-base tracking-wider">
            RETRO STRIKER '94
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-arcade hidden sm:inline">· 16:9 ARCADE ENGINE</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fullscreen toggle [F] */}
          <button
            onClick={toggleFullscreen}
            className="px-2.5 py-1 text-xs font-arcade border border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-emerald-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">16:9 FULL [F]</span>
          </button>

          {/* CRT scanlines toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              retroAudio.playMenuBeep();
              onToggleCrt();
            }}
            className={`px-2.5 py-1 text-xs font-arcade border transition-all flex items-center gap-1 cursor-pointer ${
              crtFilter 
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle CRT Scanline Effect"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>CRT {crtFilter ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSound();
            }}
            className="p-1.5 border border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
          </button>

          {/* Controls Help */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              retroAudio.playMenuBeep();
              onOpenControls();
            }}
            className="px-2.5 py-1 text-xs font-arcade border border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CONTROLS</span>
          </button>

          {/* 100 Players Database Roster */}
          {onOpenRoster && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                retroAudio.playMenuBeep();
                onOpenRoster();
              }}
              className="px-2.5 py-1 text-xs font-arcade border border-yellow-500/80 bg-yellow-950/40 text-yellow-300 hover:bg-yellow-900/60 hover:border-yellow-400 flex items-center gap-1 cursor-pointer shadow-sm"
              title="Official 100 Players Database from PDF"
            >
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>ROSTER</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Title Hero Banner & Mode Select (Optimized for 16:9 Viewport Height) */}
      <main className="w-full max-w-4xl flex flex-col items-center my-auto py-2 sm:py-3 z-10 shrink-0">
        {/* Pixel Art Title Graphic */}
        <div className="relative w-full max-w-xl rounded-none border-2 sm:border-4 border-emerald-600 bg-slate-900 overflow-hidden shadow-2xl shadow-emerald-950/60 mb-3 sm:mb-4">
          <img
            src="/src/assets/images/retro_fifa_title_1791033197230.jpg"
            alt="Retro Striker '94 16-Bit Title"
            className="w-full h-36 sm:h-44 md:h-52 object-cover object-center filter contrast-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-3">
            <h1 className="font-pixel text-lg sm:text-xl md:text-2xl text-yellow-300 text-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] tracking-wide">
              SUPER RETRO SOCCER
            </h1>
            <p className="text-center font-arcade text-[10px] sm:text-xs text-emerald-300 mt-0.5 tracking-widest">
              OPTIMIZED FOR CHROMEBOOKS & WINDOWS LAPTOS · 16:9 WIDESCREEN
            </p>
          </div>
        </div>

        {/* Game Mode Selector Grid */}
        <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
          <button
            onClick={() => handleModeClick('exhibition')}
            className="group relative p-2.5 sm:p-3 bg-slate-900/90 hover:bg-emerald-950/80 border-2 border-emerald-600/80 hover:border-emerald-400 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-pixel text-[11px] sm:text-xs text-emerald-400 group-hover:text-yellow-300">
                EXHIBITION MATCH
              </span>
              <Play className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[10px] text-slate-400 font-arcade">
              Single Player or Laptop 2-Player · Custom rules
            </p>
          </button>

          <button
            onClick={() => handleModeClick('tournament')}
            className="group relative p-2.5 sm:p-3 bg-slate-900/90 hover:bg-yellow-950/70 border-2 border-yellow-600/80 hover:border-yellow-400 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-pixel text-[11px] sm:text-xs text-yellow-400 group-hover:text-yellow-200">
                RETRO SOCCER
              </span>
              <Trophy className="w-3.5 h-3.5 text-yellow-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[10px] text-slate-400 font-arcade">
              16 Teams · Knockout ladder to the World Final
            </p>
          </button>

          <button
            onClick={() => handleModeClick('penalties')}
            className="group relative p-2.5 sm:p-3 bg-slate-900/90 hover:bg-rose-950/70 border-2 border-rose-600/80 hover:border-rose-400 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-pixel text-[11px] sm:text-xs text-rose-400 group-hover:text-rose-200">
                PENALTY SHOOTOUT
              </span>
              <Target className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-45 transition-transform" />
            </div>
            <p className="text-[10px] text-slate-400 font-arcade">
              5-Kick showdown · Sudden death target shooting
            </p>
          </button>

          <button
            onClick={() => handleModeClick('training')}
            className="group relative p-2.5 sm:p-3 bg-slate-900/90 hover:bg-sky-950/70 border-2 border-sky-600/80 hover:border-sky-400 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-pixel text-[11px] sm:text-xs text-sky-400 group-hover:text-sky-200">
                FREE KICK PRACTICE
              </span>
              <Shield className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[10px] text-slate-400 font-arcade">
              Curling free kicks over 4-man defensive walls
            </p>
          </button>
        </div>

        {/* Arcade Settings Bar (Includes 16:9 Aspect & Chromebook Eco Mode) */}
        <div className="w-full max-w-xl bg-slate-900/85 border border-slate-800 p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Half Length */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-arcade text-[10px]">TIME:</span>
            <div className="flex gap-1">
              {[60, 90, 180].map((sec) => (
                <button
                  key={sec}
                  onClick={(e) => {
                    e.stopPropagation();
                    retroAudio.playMenuBeep();
                    onChangeHalfLength(sec);
                  }}
                  className={`px-1.5 py-0.5 font-arcade border text-[10px] cursor-pointer ${
                    halfLength === sec
                      ? 'bg-emerald-600 border-emerald-400 text-slate-950 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {sec === 60 ? '2 MIN' : sec === 90 ? '3 MIN' : '6 MIN'}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-arcade text-[10px]">AI:</span>
            <div className="flex gap-1">
              {(['amateur', 'semi-pro', 'world-class'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation();
                    retroAudio.playMenuBeep();
                    onChangeDifficulty(d);
                  }}
                  className={`px-1.5 py-0.5 font-arcade uppercase border text-[10px] cursor-pointer ${
                    difficulty === d
                      ? 'bg-yellow-500 border-yellow-300 text-slate-950 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {d === 'amateur' ? 'EASY' : d === 'semi-pro' ? 'PRO' : 'LEGEND'}
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-arcade text-[10px]">PITCH:</span>
            <div className="flex gap-1">
              {(['sunny', 'night', 'rain', 'snow'] as Weather[]).map((w) => (
                <button
                  key={w}
                  onClick={(e) => {
                    e.stopPropagation();
                    retroAudio.playMenuBeep();
                    onChangeWeather(w);
                  }}
                  className={`px-1.5 py-0.5 font-arcade uppercase border text-[10px] cursor-pointer ${
                    weather === w
                      ? 'bg-sky-600 border-sky-400 text-slate-950 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* 16:9 Aspect Ratio Toggle */}
          {onToggleAspectRatio && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-arcade text-[10px]">RATIO:</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  retroAudio.playMenuBeep();
                  onToggleAspectRatio();
                }}
                className={`px-2 py-0.5 font-arcade border text-[10px] cursor-pointer flex items-center gap-1 ${
                  aspectRatio169
                    ? 'bg-emerald-700 border-emerald-400 text-emerald-100 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="16:9 Fixed Widescreen Ratio"
              >
                <Monitor className="w-3 h-3" />
                <span>{aspectRatio169 ? '16:9 WIDE' : 'STRETCH'}</span>
              </button>
            </div>
          )}

          {/* Chromebook / Laptop Eco Mode Toggle */}
          {onTogglePerformanceMode && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-arcade text-[10px]">GPU:</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  retroAudio.playMenuBeep();
                  onTogglePerformanceMode();
                }}
                className={`px-2 py-0.5 font-arcade border text-[10px] cursor-pointer flex items-center gap-1 ${
                  performanceMode === 'eco'
                    ? 'bg-amber-600 border-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="Optimized for Chromebooks & Battery-Saving Mode"
              >
                <Cpu className="w-3 h-3" />
                <span>{performanceMode === 'eco' ? 'CHROMEBOOK ECO' : '60FPS TURBO'}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl flex items-center justify-between border-t border-slate-900 pt-2 text-[10px] sm:text-xs text-slate-500 font-arcade z-10 shrink-0">
        <div>16:9 RETRO SOCCER SIMULATOR</div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span>CHROMEBOOK & LAPTOP READY</span>
          <span>·</span>
          <span>PRESS [F] FOR FULLSCREEN</span>
        </div>
      </footer>
    </div>
  );
};
