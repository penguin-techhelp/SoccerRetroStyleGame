import React, { useState } from 'react';
import { Team, FormationType } from '../types/game';
import { CLASSIC_TEAMS } from '../data/teams';
import { retroAudio } from '../audio/retroAudio';
import { ArrowLeft, Users, Zap, Shield, Flame, Activity, Award } from 'lucide-react';

interface TeamSelectProps {
  onBack: () => void;
  onConfirmTeams: (homeTeam: Team, awayTeam: Team, twoPlayer: boolean) => void;
  isTournament?: boolean;
  onOpenRoster?: () => void;
}

export const TeamSelect: React.FC<TeamSelectProps> = ({
  onBack,
  onConfirmTeams,
  isTournament = false,
  onOpenRoster
}) => {
  const [homeIndex, setHomeIndex] = useState(0); // Default Brazil
  const [awayIndex, setAwayIndex] = useState(1); // Default Italy
  const [isTwoPlayer, setIsTwoPlayer] = useState(false);
  const [activeSlot, setActiveSlot] = useState<'home' | 'away'>('home');

  const [homeFormation, setHomeFormation] = useState<FormationType>(CLASSIC_TEAMS[0].formation);
  const [awayFormation, setAwayFormation] = useState<FormationType>(CLASSIC_TEAMS[1].formation);

  const homeTeam = { ...CLASSIC_TEAMS[homeIndex], formation: homeFormation };
  const awayTeam = { ...CLASSIC_TEAMS[awayIndex], formation: awayFormation };

  const handleSelectTeam = (idx: number) => {
    retroAudio.playMenuBeep();
    if (activeSlot === 'home') {
      setHomeIndex(idx);
      setHomeFormation(CLASSIC_TEAMS[idx].formation);
      if (!isTournament) {
        setActiveSlot('away');
      }
    } else {
      setAwayIndex(idx);
      setAwayFormation(CLASSIC_TEAMS[idx].formation);
    }
  };

  const handleStart = () => {
    retroAudio.playWhistle(false);
    onConfirmTeams(homeTeam, awayTeam, isTwoPlayer);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between border-b border-emerald-900/60 pb-2.5 shrink-0">
        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-arcade text-slate-400 hover:text-emerald-400 border border-slate-700 bg-slate-900 px-3 py-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>MAIN MENU</span>
        </button>

        <div className="flex items-center gap-2">
          <h2 className="font-pixel text-xs sm:text-sm md:text-base text-yellow-300 tracking-wider">
            {isTournament ? 'CHOOSE YOUR CLUB' : 'CLUB SELECTION'}
          </h2>
          {onOpenRoster && (
            <button
              onClick={() => {
                retroAudio.playMenuBeep();
                onOpenRoster();
              }}
              className="hidden sm:flex items-center gap-1 text-[11px] font-arcade px-2.5 py-1 bg-yellow-950/40 border border-yellow-500/70 text-yellow-300 hover:bg-yellow-900/60 cursor-pointer"
            >
              <Award className="w-3 h-3 text-yellow-400" />
              <span>100 PLAYERS [PDF]</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenRoster && (
            <button
              onClick={() => {
                retroAudio.playMenuBeep();
                onOpenRoster();
              }}
              className="sm:hidden flex items-center gap-1 text-[10px] font-arcade px-2 py-1 bg-yellow-950/40 border border-yellow-500/70 text-yellow-300 hover:bg-yellow-900/60 cursor-pointer"
            >
              <Award className="w-3 h-3 text-yellow-400" />
              <span>ROSTER</span>
            </button>
          )}
          {!isTournament && (
            <button
              onClick={() => {
                retroAudio.playMenuBeep();
                setIsTwoPlayer(!isTwoPlayer);
              }}
              className={`px-3 py-1.5 text-xs font-arcade border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isTwoPlayer
                  ? 'bg-sky-950 border-sky-400 text-sky-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isTwoPlayer ? '2-PLAYER' : 'VS CPU'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 my-auto py-2 sm:py-3 shrink-0">
        {/* Left Team Showcase (Home) */}
        <div 
          onClick={() => setActiveSlot('home')}
          className={`col-span-12 md:col-span-3 min-w-0 p-3 sm:p-4 border-2 transition-all cursor-pointer ${
            activeSlot === 'home' 
              ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/40' 
              : 'border-slate-800 bg-slate-900/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-800 pb-1.5">
            <span className="text-xs font-arcade text-emerald-400 truncate">
              {isTournament ? 'YOUR NATION' : isTwoPlayer ? 'PLAYER 1 (HOME)' : 'PLAYER (HOME)'}
            </span>
            <span className="font-pixel text-[11px] sm:text-xs text-yellow-400 shrink-0">★ {homeTeam.overallRating} OVR</span>
          </div>

          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-3xl shrink-0">{homeTeam.flag}</span>
            <div className="min-w-0">
              <h3 className="font-pixel text-base sm:text-lg text-slate-100 truncate">{homeTeam.name.toUpperCase()}</h3>
              <p className="text-[11px] text-slate-400 font-arcade truncate">STAR: {homeTeam.starPlayer}</p>
            </div>
          </div>

          {/* Kit Preview Colors */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-900 p-2 border border-slate-800 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 font-arcade">JERSEY:</span>
              <div 
                className="w-4 h-4 border border-slate-600 shadow-xs"
                style={{ backgroundColor: homeTeam.primaryColor }}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 font-arcade">SHORTS:</span>
              <div 
                className="w-4 h-4 border border-slate-600 shadow-xs"
                style={{ backgroundColor: homeTeam.secondaryColor }}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 font-arcade">GK:</span>
              <div 
                className="w-4 h-4 border border-slate-600 shadow-xs"
                style={{ backgroundColor: homeTeam.gkColor }}
              />
            </div>
          </div>

          {/* Attributes */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs font-arcade">
              <span className="flex items-center gap-1 text-slate-400"><Zap className="w-3 h-3 text-yellow-400" /> SPEED</span>
              <span className="font-bold text-slate-200">{homeTeam.attributes.speed}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5">
              <div className="bg-yellow-400 h-1.5" style={{ width: `${homeTeam.attributes.speed}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs font-arcade">
              <span className="flex items-center gap-1 text-slate-400"><Flame className="w-3 h-3 text-rose-400" /> ATTACK</span>
              <span className="font-bold text-slate-200">{homeTeam.attributes.attack}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5">
              <div className="bg-rose-400 h-1.5" style={{ width: `${homeTeam.attributes.attack}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs font-arcade">
              <span className="flex items-center gap-1 text-slate-400"><Shield className="w-3 h-3 text-sky-400" /> DEFENSE</span>
              <span className="font-bold text-slate-200">{homeTeam.attributes.defense}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5">
              <div className="bg-sky-400 h-1.5" style={{ width: `${homeTeam.attributes.defense}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs font-arcade">
              <span className="flex items-center gap-1 text-slate-400"><Activity className="w-3 h-3 text-emerald-400" /> STAMINA</span>
              <span className="font-bold text-slate-200">{homeTeam.attributes.stamina}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5">
              <div className="bg-emerald-400 h-1.5" style={{ width: `${homeTeam.attributes.stamina}%` }} />
            </div>
          </div>

          {/* Formation Picker */}
          <div className="mt-2.5">
            <span className="text-[10px] text-slate-400 font-arcade block mb-1">FORMATION:</span>
            <div className="grid grid-cols-4 gap-1">
              {(['4-4-2', '4-3-3', '3-5-2', '5-3-2'] as FormationType[]).map((f) => (
                <button
                  key={f}
                  onClick={(e) => {
                    e.stopPropagation();
                    retroAudio.playMenuBeep();
                    setHomeFormation(f);
                  }}
                  className={`py-1 text-center font-arcade text-xs border cursor-pointer ${
                    homeFormation === f
                      ? 'bg-emerald-600 border-emerald-400 text-slate-950 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Teams Grid (16 Classic Teams) */}
        <div className="col-span-12 md:col-span-6 min-w-0 flex flex-col justify-between">
          <div className="text-center font-arcade text-xs text-slate-400 mb-2">
            SELECTING FOR: <span className="text-yellow-300 font-bold">{activeSlot === 'home' ? 'HOME TEAM' : 'AWAY TEAM'}</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3">
            {CLASSIC_TEAMS.map((t, idx) => {
              const isSelectedHome = homeIndex === idx;
              const isSelectedAway = awayIndex === idx;

              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTeam(idx)}
                  className={`p-1.5 sm:p-2.5 flex flex-col items-center justify-center border transition-all text-center cursor-pointer ${
                    isSelectedHome
                      ? 'bg-emerald-950 border-emerald-400 shadow-md ring-2 ring-emerald-500'
                      : isSelectedAway
                      ? 'bg-sky-950 border-sky-400 shadow-md ring-2 ring-sky-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-xl sm:text-2xl mb-0.5">{t.flag}</span>
                  <span className="font-pixel text-[9px] sm:text-[10px] text-slate-200 truncate w-full">{t.countryCode}</span>
                  <span className="text-[8px] sm:text-[9px] font-arcade text-slate-400">{t.overallRating}</span>
                </button>
              );
            })}
          </div>

          {/* Action Launch Bar */}
          <div className="text-center mt-auto pt-1">
            <button
              onClick={handleStart}
              className="w-full py-3 sm:py-3.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-pixel text-xs sm:text-sm tracking-wider border-2 border-yellow-300 shadow-xl shadow-yellow-950/40 cursor-pointer transition-transform active:scale-95"
            >
              {isTournament ? 'ENTER TOURNAMENT' : 'START MATCH'}
            </button>
          </div>
        </div>

        {/* Right Team Showcase (Away / Opponent) */}
        <div 
          onClick={() => !isTournament && setActiveSlot('away')}
          className={`col-span-12 md:col-span-3 min-w-0 p-3 sm:p-4 border-2 transition-all ${
            isTournament ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
          } ${
            activeSlot === 'away' 
              ? 'border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-950/40' 
              : 'border-slate-800 bg-slate-900/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-800 pb-1.5">
            <span className="text-xs font-arcade text-sky-400 truncate">
              {isTwoPlayer ? 'PLAYER 2 (AWAY)' : 'CPU OPPONENT (AWAY)'}
            </span>
            <span className="font-pixel text-[11px] sm:text-xs text-yellow-400 shrink-0">★ {awayTeam.overallRating} OVR</span>
          </div>

          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-3xl shrink-0">{awayTeam.flag}</span>
            <div className="min-w-0">
              <h3 className="font-pixel text-base sm:text-lg text-slate-100 truncate">{awayTeam.name.toUpperCase()}</h3>
              <p className="text-[11px] text-slate-400 font-arcade truncate">STAR: {awayTeam.starPlayer}</p>
            </div>
          </div>

          {/* Kit Preview Colors */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-900 p-2 border border-slate-800 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 font-arcade">JERSEY:</span>
              <div 
                className="w-4 h-4 border border-slate-600 shadow-xs"
                style={{ backgroundColor: awayTeam.primaryColor }}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 font-arcade">SHORTS:</span>
              <div 
                className="w-4 h-4 border border-slate-600 shadow-xs"
                style={{ backgroundColor: awayTeam.secondaryColor }}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 font-arcade">GK:</span>
              <div 
                className="w-4 h-4 border border-slate-600 shadow-xs"
                style={{ backgroundColor: awayTeam.gkColor }}
              />
            </div>
          </div>

          {/* Attributes */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs font-arcade">
              <span className="flex items-center gap-1 text-slate-400"><Zap className="w-3 h-3 text-yellow-400" /> SPEED</span>
              <span className="font-bold text-slate-200">{awayTeam.attributes.speed}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5">
              <div className="bg-yellow-400 h-1.5" style={{ width: `${awayTeam.attributes.speed}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs font-arcade">
              <span className="flex items-center gap-1 text-slate-400"><Flame className="w-3 h-3 text-rose-400" /> ATTACK</span>
              <span className="font-bold text-slate-200">{awayTeam.attributes.attack}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5">
              <div className="bg-rose-400 h-1.5" style={{ width: `${awayTeam.attributes.attack}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs font-arcade">
              <span className="flex items-center gap-1 text-slate-400"><Shield className="w-3 h-3 text-sky-400" /> DEFENSE</span>
              <span className="font-bold text-slate-200">{awayTeam.attributes.defense}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5">
              <div className="bg-sky-400 h-1.5" style={{ width: `${awayTeam.attributes.defense}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs font-arcade">
              <span className="flex items-center gap-1 text-slate-400"><Activity className="w-3 h-3 text-emerald-400" /> STAMINA</span>
              <span className="font-bold text-slate-200">{awayTeam.attributes.stamina}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5">
              <div className="bg-emerald-400 h-1.5" style={{ width: `${awayTeam.attributes.stamina}%` }} />
            </div>
          </div>

          {/* Formation Picker */}
          <div className="mt-2.5">
            <span className="text-[10px] text-slate-400 font-arcade block mb-1">FORMATION:</span>
            <div className="grid grid-cols-4 gap-1">
              {(['4-4-2', '4-3-3', '3-5-2', '5-3-2'] as FormationType[]).map((f) => (
                <button
                  key={f}
                  onClick={(e) => {
                    e.stopPropagation();
                    retroAudio.playMenuBeep();
                    setAwayFormation(f);
                  }}
                  className={`py-1 text-center font-arcade text-xs border cursor-pointer ${
                    awayFormation === f
                      ? 'bg-sky-600 border-sky-400 text-slate-950 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between border-t border-slate-900 pt-3 text-xs text-slate-500 font-arcade">
        <span>CLICK ON TEAMS TO SELECT</span>
        <span>SLOTS: {activeSlot.toUpperCase()} SELECTED</span>
      </footer>
    </div>
  );
};
