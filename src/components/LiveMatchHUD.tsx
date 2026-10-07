import React from 'react';
import { Team } from '../types/game';
import { BarChart2, ChevronDown, ChevronUp, ShieldAlert, Target, Activity, X } from 'lucide-react';
import { retroAudio } from '../audio/retroAudio';

export interface LiveStatsData {
  homePossPct: number;
  awayPossPct: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
}

export type HUDViewMode = 'compact' | 'expanded' | 'hidden';

interface LiveMatchHUDProps {
  homeTeam: Team;
  awayTeam: Team;
  stats: LiveStatsData;
  mode: HUDViewMode;
  onSetMode: (nextMode: HUDViewMode) => void;
}

export const LiveMatchHUD: React.FC<LiveMatchHUDProps> = ({
  homeTeam,
  awayTeam,
  stats,
  mode,
  onSetMode,
}) => {
  if (mode === 'hidden') return null;

  const homeColor = homeTeam.primaryColor || '#fbbf24';
  const awayColor = awayTeam.primaryColor || '#38bdf8';

  const totalShots = stats.homeShots + stats.awayShots;
  const homeShotPct = totalShots > 0 ? Math.round((stats.homeShots / totalShots) * 100) : 50;
  const awayShotPct = 100 - homeShotPct;

  const totalFouls = stats.homeFouls + stats.awayFouls;
  const homeFoulPct = totalFouls > 0 ? Math.round((stats.homeFouls / totalFouls) * 100) : 50;
  const awayFoulPct = 100 - homeFoulPct;

  // COMPACT MODE: Sleek broadcast ticker bar below scoreboard
  if (mode === 'compact') {
    return (
      <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-all duration-200 max-w-[95vw]">
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 bg-slate-950/95 border border-slate-700/80 shadow-2xl backdrop-blur-md rounded-xs overflow-x-auto">
          {/* Home team indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs sm:text-sm">{homeTeam.flag}</span>
            <span
              className="font-pixel text-[10px] sm:text-[11px] font-bold"
              style={{ color: homeColor }}
            >
              {stats.homePossPct}%
            </span>
          </div>

          {/* Possession duel progress bar */}
          <div className="flex flex-col items-center gap-0.5 w-24 sm:w-36">
            <div className="flex justify-between w-full text-[8px] font-arcade text-slate-400">
              <span>POSS</span>
              <span className="text-[7px] text-slate-500">LIVE</span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-slate-900 border border-slate-700/80 rounded-xs flex overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${stats.homePossPct}%`, backgroundColor: homeColor }}
              />
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${stats.awayPossPct}%`, backgroundColor: awayColor }}
              />
            </div>
          </div>

          {/* Away team indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="font-pixel text-[10px] sm:text-[11px] font-bold"
              style={{ color: awayColor }}
            >
              {stats.awayPossPct}%
            </span>
            <span className="text-xs sm:text-sm">{awayTeam.flag}</span>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-0.5 hidden xs:block" />

          {/* Shots & Fouls quick tally */}
          <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-pixel text-slate-300">
            <div className="flex items-center gap-1" title="Total Shots (Home - Away)">
              <Target className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="tabular-nums font-bold">
                <span style={{ color: homeColor }}>{stats.homeShots}</span>
                <span className="text-slate-500 mx-0.5">-</span>
                <span style={{ color: awayColor }}>{stats.awayShots}</span>
              </span>
            </div>

            <div className="flex items-center gap-1" title="Fouls Committed (Home - Away)">
              <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="tabular-nums font-bold">
                <span style={{ color: homeColor }}>{stats.homeFouls}</span>
                <span className="text-slate-500 mx-0.5">-</span>
                <span style={{ color: awayColor }}>{stats.awayFouls}</span>
              </span>
            </div>
          </div>

          {/* Expand Toggle Button */}
          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onSetMode('expanded');
            }}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-yellow-400 rounded-xs transition-colors cursor-pointer ml-1"
            title="Expand Full Match Stats (Tab)"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED MODE: Rich 16-bit arcade broadcast overlay panel
  return (
    <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-30 max-w-md w-[95%] sm:w-full pointer-events-auto transition-all animate-arcade-toast">
      <div className="relative bg-slate-950/95 border-2 border-emerald-500/90 shadow-2xl p-3 sm:p-4 backdrop-blur-md rounded-xs overflow-hidden">
        {/* CRT Scanline Filter Overlay */}
        <div className="absolute inset-0 crt-overlay opacity-30 pointer-events-none" />

        {/* Top Broadcast Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="font-pixel text-[11px] sm:text-xs text-yellow-300 tracking-wider">
              LIVE MATCH HUD
            </h3>
            <span className="flex items-center gap-1 text-[8px] font-pixel text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-arcade text-[9px] text-slate-400 hidden sm:inline mr-1">
              [TAB] TOGGLE
            </span>
            <button
              onClick={() => {
                retroAudio.playMenuBeep();
                onSetMode('compact');
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xs cursor-pointer transition-colors"
              title="Compact View"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                retroAudio.playMenuBeep();
                onSetMode('hidden');
              }}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xs cursor-pointer transition-colors"
              title="Hide HUD"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Team Names Header */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 py-1 px-2 bg-slate-900/80 border border-slate-800 rounded-xs">
            <span className="text-base">{homeTeam.flag}</span>
            <div className="text-left overflow-hidden">
              <div className="font-pixel text-[10px] sm:text-xs truncate" style={{ color: homeColor }}>
                {homeTeam.name}
              </div>
              <div className="font-arcade text-[8px] text-slate-400">{homeTeam.countryCode}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-1 px-2 bg-slate-900/80 border border-slate-800 rounded-xs">
            <div className="text-right overflow-hidden">
              <div className="font-pixel text-[10px] sm:text-xs truncate" style={{ color: awayColor }}>
                {awayTeam.name}
              </div>
              <div className="font-arcade text-[8px] text-slate-400">{awayTeam.countryCode}</div>
            </div>
            <span className="text-base">{awayTeam.flag}</span>
          </div>
        </div>

        {/* Core Live Stats Breakdown */}
        <div className="space-y-3 relative z-10">
          {/* STAT 1: POSSESSION PERCENTAGE */}
          <div className="bg-slate-900/70 p-2 sm:p-2.5 border border-slate-800 rounded-xs">
            <div className="flex justify-between items-center mb-1">
              <span
                className="font-pixel text-xs sm:text-sm font-bold tabular-nums"
                style={{ color: homeColor }}
              >
                {stats.homePossPct}%
              </span>
              <span className="font-arcade text-[10px] text-slate-300 font-semibold tracking-wider">
                POSSESSION
              </span>
              <span
                className="font-pixel text-xs sm:text-sm font-bold tabular-nums"
                style={{ color: awayColor }}
              >
                {stats.awayPossPct}%
              </span>
            </div>

            {/* Duel Progress Bar */}
            <div className="w-full h-2.5 bg-slate-950 border border-slate-700/80 rounded-xs flex overflow-hidden relative">
              <div
                className="h-full transition-all duration-300 relative"
                style={{ width: `${stats.homePossPct}%`, backgroundColor: homeColor }}
              />
              <div
                className="h-full transition-all duration-300 relative"
                style={{ width: `${stats.awayPossPct}%`, backgroundColor: awayColor }}
              />
              {/* Center marker */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/70 shadow-sm" />
            </div>
            <div className="flex justify-between mt-1 text-[8px] font-arcade text-slate-500">
              <span>{stats.homePossPct > 50 ? '▲ DOMINATING' : ''}</span>
              <span>50% LINE</span>
              <span>{stats.awayPossPct > 50 ? 'DOMINATING ▲' : ''}</span>
            </div>
          </div>

          {/* STAT 2: SHOTS COUNT */}
          <div className="bg-slate-900/70 p-2 sm:p-2.5 border border-slate-800 rounded-xs">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-pixel text-xs sm:text-sm font-bold tabular-nums"
                  style={{ color: homeColor }}
                >
                  {stats.homeShots}
                </span>
                <span className="text-[9px] font-arcade text-slate-400">
                  ({stats.homeShotsOnTarget} on target)
                </span>
              </div>

              <div className="flex items-center gap-1 font-arcade text-[10px] text-slate-300 font-semibold tracking-wider">
                <Target className="w-3 h-3 text-emerald-400" />
                <span>SHOTS COUNT</span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-[9px] font-arcade text-slate-400">
                  ({stats.awayShotsOnTarget} on target)
                </span>
                <span
                  className="font-pixel text-xs sm:text-sm font-bold tabular-nums"
                  style={{ color: awayColor }}
                >
                  {stats.awayShots}
                </span>
              </div>
            </div>

            {/* Comparison Bar */}
            <div className="w-full h-2 bg-slate-950 border border-slate-700/80 rounded-xs flex overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${homeShotPct}%`, backgroundColor: homeColor }}
              />
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${awayShotPct}%`, backgroundColor: awayColor }}
              />
            </div>
          </div>

          {/* STAT 3: FOULS COMMITTED */}
          <div className="bg-slate-900/70 p-2 sm:p-2.5 border border-slate-800 rounded-xs">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="font-pixel text-xs sm:text-sm font-bold tabular-nums"
                  style={{ color: homeColor }}
                >
                  {stats.homeFouls}
                </span>
                <div className="flex gap-1 text-[8px] font-pixel">
                  {stats.homeYellowCards > 0 && (
                    <span className="text-amber-400 bg-amber-950/80 px-1 py-0.5 rounded-xs">
                      🟨{stats.homeYellowCards}
                    </span>
                  )}
                  {stats.homeRedCards > 0 && (
                    <span className="text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded-xs">
                      🟥{stats.homeRedCards}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 font-arcade text-[10px] text-slate-300 font-semibold tracking-wider">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>FOULS COMMITTED</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex gap-1 text-[8px] font-pixel">
                  {stats.awayYellowCards > 0 && (
                    <span className="text-amber-400 bg-amber-950/80 px-1 py-0.5 rounded-xs">
                      🟨{stats.awayYellowCards}
                    </span>
                  )}
                  {stats.awayRedCards > 0 && (
                    <span className="text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded-xs">
                      🟥{stats.awayRedCards}
                    </span>
                  )}
                </div>
                <span
                  className="font-pixel text-xs sm:text-sm font-bold tabular-nums"
                  style={{ color: awayColor }}
                >
                  {stats.awayFouls}
                </span>
              </div>
            </div>

            {/* Comparison Bar */}
            <div className="w-full h-2 bg-slate-950 border border-slate-700/80 rounded-xs flex overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${homeFoulPct}%`, backgroundColor: homeColor }}
              />
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${awayFoulPct}%`, backgroundColor: awayColor }}
              />
            </div>
          </div>
        </div>

        {/* Footer controls & Hotkey cue */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] sm:text-[9px] font-arcade text-slate-400 relative z-10">
          <div className="flex items-center gap-1">
            <span className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded-xs font-mono">TAB</span>
            <span>CYCLE MODES (EXPANDED / COMPACT / OFF)</span>
          </div>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onSetMode('compact');
            }}
            className="text-emerald-400 hover:text-emerald-300 font-pixel cursor-pointer underline"
          >
            SWITCH TO COMPACT
          </button>
        </div>
      </div>
    </div>
  );
};
