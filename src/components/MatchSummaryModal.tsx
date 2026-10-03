import React from 'react';
import { SoccerGameEngine } from '../game/engine';
import { retroAudio } from '../audio/retroAudio';
import { Trophy, RotateCcw, Home, Play } from 'lucide-react';

interface MatchSummaryModalProps {
  engine: SoccerGameEngine;
  onPlayAgain: () => void;
  onWatchReplay: () => void;
  onExit: () => void;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  engine,
  onPlayAgain,
  onWatchReplay,
  onExit
}) => {
  const home = engine.homeTeam;
  const away = engine.awayTeam;
  const homeStats = engine.homeStats;
  const awayStats = engine.awayStats;

  // Calculate possession percentage
  const totalPossession = Math.max(1, homeStats.possessionTimeSeconds + awayStats.possessionTimeSeconds);
  const homePossPct = Math.round((homeStats.possessionTimeSeconds / totalPossession) * 100);
  const awayPossPct = 100 - homePossPct;

  const winner =
    engine.homeScore > engine.awayScore ? home : engine.awayScore > engine.homeScore ? away : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500 shadow-2xl p-6 flex flex-col">
        {/* Title */}
        <div className="text-center mb-5 border-b border-slate-800 pb-3">
          <span className="font-arcade text-xs text-emerald-400 tracking-widest block mb-1">
            FULL TIME SUMMARY
          </span>
          <h2 className="font-pixel text-xl sm:text-2xl text-yellow-300">
            {winner ? `${winner.name.toUpperCase()} WINS!` : 'MATCH DRAW!'}
          </h2>
        </div>

        {/* Scoreboard Lockup */}
        <div className="flex items-center justify-between bg-slate-950 p-4 border border-slate-800 mb-5">
          <div className="flex flex-col items-center flex-1">
            <span className="text-3xl mb-1">{home.flag}</span>
            <span className="font-pixel text-xs text-yellow-400">{home.name}</span>
          </div>

          <div className="font-pixel text-2xl sm:text-3xl text-slate-100 px-4">
            <span className="text-yellow-400">{engine.homeScore}</span>
            <span className="text-slate-600 mx-2">-</span>
            <span className="text-sky-400">{engine.awayScore}</span>
          </div>

          <div className="flex flex-col items-center flex-1">
            <span className="text-3xl mb-1">{away.flag}</span>
            <span className="font-pixel text-xs text-sky-400">{away.name}</span>
          </div>
        </div>

        {/* Goalscorers Timeline */}
        {engine.goalEvents.length > 0 && (
          <div className="mb-5 bg-slate-950/60 p-3 border border-slate-800 text-xs font-arcade">
            <span className="text-slate-400 block mb-2 text-[10px]">GOAL TIMELINE:</span>
            <div className="space-y-1">
              {engine.goalEvents.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>⚽</span>
                    <span>{g.scorerName} (#{g.scorerNumber})</span>
                  </span>
                  <span className="font-pixel text-yellow-400 text-[10px]">{g.minute}'</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Table */}
        <div className="space-y-2 mb-6 text-xs font-arcade">
          {/* Possession */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-yellow-400">{homePossPct}%</span>
            <span className="text-slate-500">POSSESSION</span>
            <span className="font-bold text-sky-400">{awayPossPct}%</span>
          </div>
          <div className="w-full flex h-1.5 bg-slate-800">
            <div className="bg-yellow-400 h-full" style={{ width: `${homePossPct}%` }} />
            <div className="bg-sky-400 h-full" style={{ width: `${awayPossPct}%` }} />
          </div>

          {/* Shots */}
          <div className="flex justify-between items-center pt-2 text-slate-300">
            <span className="font-bold">{homeStats.shots}</span>
            <span className="text-slate-500">SHOTS</span>
            <span className="font-bold">{awayStats.shots}</span>
          </div>

          {/* Tackles */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold">{homeStats.tackles}</span>
            <span className="text-slate-500">TACKLES</span>
            <span className="font-bold">{awayStats.tackles}</span>
          </div>

          {/* Fouls */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold">{homeStats.fouls}</span>
            <span className="text-slate-500">FOULS</span>
            <span className="font-bold">{awayStats.fouls}</span>
          </div>

          {/* Yellow / Red Cards */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-yellow-400">{homeStats.yellowCards}Y / {homeStats.redCards}R</span>
            <span className="text-slate-500">CARDS</span>
            <span className="font-bold text-yellow-400">{awayStats.yellowCards}Y / {awayStats.redCards}R</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-arcade text-xs">
          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onPlayAgain();
            }}
            className="py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold border border-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onWatchReplay();
            }}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REPLAY [R]</span>
          </button>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onExit();
            }}
            className="py-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
