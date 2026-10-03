import React, { useState } from 'react';
import { GameMode, Difficulty, Weather } from '../types/game';
import { retroAudio } from '../audio/retroAudio';
import { Volume2, VolumeX, Tv, HelpCircle, Trophy, Play, Target, Shield, Award } from 'lucide-react';

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
  onOpenControls,
  onOpenRoster,
}) => {
  const [hasStartedMusic, setHasStartedMusic] = useState(false);

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
      className="relative min-h-screen w-full flex flex-col justify-between items-center bg-slate-950 text-slate-100 p-4 md:p-8 select-none"
      onClick={handleStartMusic}
    >
      {/* Top Bar Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between border-b border-emerald-900/60 pb-3 z-10">
        <div className="flex items-center gap-3">
          <span className="font-pixel text-emerald-400 text-sm md:text-base tracking-wider">
            RETRO STRIKER '94
          </span>
          <span className="text-xs text-slate-400 font-arcade hidden sm:inline">· 16-BIT ARCADE ENGINE</span>
        </div>

        <div className="flex items-center gap-2">
          {/* CRT scanlines toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              retroAudio.playMenuBeep();
              onToggleCrt();
            }}
            className={`px-3 py-1.5 text-xs font-arcade border transition-all flex items-center gap-1.5 ${
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
            className="p-2 border border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Controls Help */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              retroAudio.playMenuBeep();
              onOpenControls();
            }}
            className="px-3 py-1.5 text-xs font-arcade border border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500 hover:text-emerald-300 flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HOW TO PLAY</span>
          </button>

          {/* 100 Players Database Roster */}
          {onOpenRoster && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                retroAudio.playMenuBeep();
                onOpenRoster();
              }}
              className="px-3 py-1.5 text-xs font-arcade border border-yellow-500/80 bg-yellow-950/40 text-yellow-300 hover:bg-yellow-900/60 hover:border-yellow-400 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Official 100 Players Database from PDF"
            >
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>100 PLAYERS [PDF]</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Title Hero Banner */}
      <main className="w-full max-w-5xl flex flex-col items-center my-auto py-4 z-10">
        {/* Pixel Art Title Graphic */}
        <div className="relative w-full max-w-2xl rounded-none border-4 border-emerald-600 bg-slate-900 overflow-hidden shadow-2xl shadow-emerald-950/60 mb-6">
          <img
            src="/src/assets/images/retro_fifa_title_1791033197230.jpg"
            alt="Retro Striker '94 16-Bit Title"
            className="w-full h-48 md:h-64 object-cover object-center filter contrast-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
            <h1 className="font-pixel text-xl sm:text-2xl md:text-3xl text-yellow-300 text-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] tracking-wide">
              SUPER RETRO SOCCER
            </h1>
            <p className="text-center font-arcade text-xs md:text-sm text-emerald-300 mt-1 tracking-widest">
              PRESS ANY MODE TO KICK OFF
            </p>
          </div>
        </div>

        {/* Game Mode Selector Grid */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleModeClick('exhibition')}
            className="group relative p-4 bg-slate-900/90 hover:bg-emerald-950/80 border-2 border-emerald-600/80 hover:border-emerald-400 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-xs sm:text-sm text-emerald-400 group-hover:text-yellow-300">
                EXHIBITION MATCH
              </span>
              <Play className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-400 font-arcade">
              Quick match · Single Player or Local 2P · Custom rules
            </p>
          </button>

          <button
            onClick={() => handleModeClick('tournament')}
            className="group relative p-4 bg-slate-900/90 hover:bg-yellow-950/70 border-2 border-yellow-600/80 hover:border-yellow-400 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-xs sm:text-sm text-yellow-400 group-hover:text-yellow-200">
                RETRO SOCCER
              </span>
              <Trophy className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs text-slate-400 font-arcade">
              16 Teams · Knockout ladder from Round of 16 to the Final
            </p>
          </button>

          <button
            onClick={() => handleModeClick('penalties')}
            className="group relative p-4 bg-slate-900/90 hover:bg-rose-950/70 border-2 border-rose-600/80 hover:border-rose-400 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-xs sm:text-sm text-rose-400 group-hover:text-rose-200">
                PENALTY SHOOTOUT
              </span>
              <Target className="w-4 h-4 text-rose-400 group-hover:rotate-45 transition-transform" />
            </div>
            <p className="text-xs text-slate-400 font-arcade">
              5-Kick showdown · High stakes target shooting & goalie saves
            </p>
          </button>

          <button
            onClick={() => handleModeClick('training')}
            className="group relative p-4 bg-slate-900/90 hover:bg-sky-950/70 border-2 border-sky-600/80 hover:border-sky-400 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-xs sm:text-sm text-sky-400 group-hover:text-sky-200">
                FREE KICK PRACTICE
              </span>
              <Shield className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs text-slate-400 font-arcade">
              Curling free kicks over 4-man walls with corner bullseyes
            </p>
          </button>
        </div>

        {/* Arcade Settings Bar */}
        <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Half Length */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-arcade">MATCH TIME:</span>
            <div className="flex gap-1">
              {[60, 90, 180].map((sec) => (
                <button
                  key={sec}
                  onClick={(e) => {
                    e.stopPropagation();
                    retroAudio.playMenuBeep();
                    onChangeHalfLength(sec);
                  }}
                  className={`px-2 py-1 font-arcade border text-xs ${
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
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-arcade">AI SKILL:</span>
            <div className="flex gap-1">
              {(['amateur', 'semi-pro', 'world-class'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation();
                    retroAudio.playMenuBeep();
                    onChangeDifficulty(d);
                  }}
                  className={`px-2 py-1 font-arcade uppercase border text-xs ${
                    difficulty === d
                      ? 'bg-yellow-500 border-yellow-300 text-slate-950 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {d === 'amateur' ? 'AMATEUR' : d === 'semi-pro' ? 'PRO' : 'LEGEND'}
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-arcade">PITCH:</span>
            <div className="flex gap-1">
              {(['sunny', 'night', 'rain', 'snow'] as Weather[]).map((w) => (
                <button
                  key={w}
                  onClick={(e) => {
                    e.stopPropagation();
                    retroAudio.playMenuBeep();
                    onChangeWeather(w);
                  }}
                  className={`px-2 py-1 font-arcade uppercase border text-xs ${
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
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl flex items-center justify-between border-t border-slate-900 pt-3 text-xs text-slate-500 font-arcade z-10">
        <div>16-BIT RETRO SOCCER SIMULATOR</div>
        <div className="flex items-center gap-4">
          <span>KEYBOARD & GAMEPAD READY</span>
          <span>·</span>
          <span>© 1994 RETRO SPORTS</span>
        </div>
      </footer>
    </div>
  );
};
