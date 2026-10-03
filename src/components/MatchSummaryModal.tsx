import React, { useState, useEffect, useRef } from 'react';
import { SoccerGameEngine } from '../game/engine';
import { SoccerRenderer } from '../game/renderer';
import { Player, HighlightClip } from '../types/game';
import { retroAudio } from '../audio/retroAudio';
import {
  Trophy,
  RotateCcw,
  Home,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Star,
  Shield,
  Zap,
  Sparkles,
  Film,
  Clock,
  Tv
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'team' | 'players' | 'highlights'>('team');
  const [selectedTeamTab, setSelectedTeamTab] = useState<'home' | 'away'>('home');

  // Highlight Reel State
  const [selectedClipIndex, setSelectedClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [isAutoPlayAll, setIsAutoPlayAll] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [transitionNotice, setTransitionNotice] = useState<string | null>(null);

  const highlightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const highlightRendererRef = useRef<SoccerRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const frameIndexRef = useRef(0);

  const home = engine.homeTeam;
  const away = engine.awayTeam;
  const homeStats = engine.homeStats;
  const awayStats = engine.awayStats;

  // Retrieve Top 3 Highlights automatically curated by the engine
  const topHighlights: HighlightClip[] = engine.getTopHighlights(3);
  const activeClip: HighlightClip | undefined = topHighlights[selectedClipIndex] || topHighlights[0];

  // Calculate possession percentage
  const totalPossession = Math.max(1, homeStats.possessionTimeSeconds + awayStats.possessionTimeSeconds);
  const homePossPct = Math.round((homeStats.possessionTimeSeconds / totalPossession) * 100);
  const awayPossPct = 100 - homePossPct;

  const winner =
    engine.homeScore > engine.awayScore ? home : engine.awayScore > engine.homeScore ? away : null;

  // Calculate Player Match Ratings & Performance
  const calculatePlayerRating = (p: Player, concededGoals: number): number => {
    let rating = 6.0;
    rating += p.matchStats.goals * 1.4;
    rating += p.matchStats.assists * 1.0;
    rating += p.matchStats.tackles * 0.4;
    rating += p.matchStats.shots * 0.1;

    if ((p.role === 'GK' || p.role === 'DEF') && concededGoals === 0) {
      rating += 0.8;
    }

    if (p.hasRedCard) rating -= 2.0;
    else if (p.yellowCards > 0) rating -= 0.5;

    return Math.min(10.0, Math.max(4.0, Math.round(rating * 10) / 10));
  };

  const allPlayersWithRatings = [
    ...engine.homePlayers.map((p) => ({
      ...p,
      teamName: home.name,
      rating: calculatePlayerRating(p, engine.awayScore)
    })),
    ...engine.awayPlayers.map((p) => ({
      ...p,
      teamName: away.name,
      rating: calculatePlayerRating(p, engine.homeScore)
    }))
  ];

  const motmPlayer = [...allPlayersWithRatings].sort((a, b) => b.rating - a.rating)[0];

  const displayedSquad = (selectedTeamTab === 'home' ? engine.homePlayers : engine.awayPlayers).map((p) => ({
    ...p,
    rating: calculatePlayerRating(p, selectedTeamTab === 'home' ? engine.awayScore : engine.homeScore)
  }));

  const topScorer = [...allPlayersWithRatings]
    .filter((p) => p.matchStats.goals > 0)
    .sort((a, b) => b.matchStats.goals - a.matchStats.goals)[0];

  const topAssister = [...allPlayersWithRatings]
    .filter((p) => p.matchStats.assists > 0)
    .sort((a, b) => b.matchStats.assists - a.matchStats.assists)[0];

  const topTackler = [...allPlayersWithRatings]
    .filter((p) => p.matchStats.tackles > 0)
    .sort((a, b) => b.matchStats.tackles - a.matchStats.tackles)[0];

  // Highlight Reel Canvas Animation Loop
  useEffect(() => {
    if (activeTab !== 'highlights' || !highlightCanvasRef.current || !activeClip || activeClip.frames.length === 0) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    if (!highlightRendererRef.current) {
      highlightRendererRef.current = new SoccerRenderer(highlightCanvasRef.current);
    }

    const renderer = highlightRendererRef.current;
    let subFrame = frameIndexRef.current;

    const renderLoop = () => {
      const frames = activeClip.frames;
      if (frames && frames.length > 0) {
        if (isPlaying) {
          // Speed step: normal speed (1 frame per tick) or slow-motion (0.5 frame per tick)
          const speedStep = isSlowMo ? 0.45 : 0.95;
          subFrame += speedStep;

          if (subFrame >= frames.length - 1) {
            if (isAutoPlayAll) {
              if (selectedClipIndex < topHighlights.length - 1) {
                // Advance to next moment in the highlight reel!
                subFrame = 0;
                frameIndexRef.current = 0;
                retroAudio.playWhistle(false);
                setTransitionNotice(`NEXT: MOMENT #${selectedClipIndex + 2}`);
                setTimeout(() => setTransitionNotice(null), 1200);
                setSelectedClipIndex((prev) => prev + 1);
                return;
              } else {
                // Completed all top 3 moments
                subFrame = frames.length - 1;
                setIsPlaying(false);
                setIsAutoPlayAll(false);
                setTransitionNotice('★ ALL 3 HIGHLIGHTS COMPLETE ★');
                setTimeout(() => setTransitionNotice(null), 2500);
              }
            } else {
              // Loop current clip
              subFrame = 0;
            }
          }

          frameIndexRef.current = subFrame;
          setCurrentFrameIndex(Math.floor(subFrame));
        }

        const safeIdx = Math.min(frames.length - 1, Math.max(0, Math.floor(subFrame)));
        const frame = frames[safeIdx];
        const canvas = highlightCanvasRef.current;

        if (canvas && frame) {
          const width = canvas.clientWidth || 560;
          const height = canvas.clientHeight || 280;
          const progress = frames.length > 1 ? safeIdx / (frames.length - 1) : 1;

          renderer.renderHighlightFrame(
            engine,
            frame,
            width,
            height,
            activeClip.title,
            activeClip.minute,
            activeClip.type,
            isSlowMo,
            selectedClipIndex,
            topHighlights.length,
            progress
          );
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activeTab, selectedClipIndex, isPlaying, isSlowMo, isAutoPlayAll, activeClip, topHighlights.length, engine]);

  // Scrub handler
  const handleScrub = (newFrame: number) => {
    frameIndexRef.current = newFrame;
    setCurrentFrameIndex(newFrame);

    if (highlightCanvasRef.current && highlightRendererRef.current && activeClip) {
      const frame = activeClip.frames[newFrame];
      if (frame) {
        const progress = activeClip.frames.length > 1 ? newFrame / (activeClip.frames.length - 1) : 1;
        highlightRendererRef.current.renderHighlightFrame(
          engine,
          frame,
          highlightCanvasRef.current.clientWidth || 560,
          highlightCanvasRef.current.clientHeight || 280,
          activeClip.title,
          activeClip.minute,
          activeClip.type,
          isSlowMo,
          selectedClipIndex,
          topHighlights.length,
          progress
        );
      }
    }
  };

  // Play All Highlights (Moments 1 -> 2 -> 3)
  const handlePlayAll = () => {
    retroAudio.playMenuBeep();
    setSelectedClipIndex(0);
    frameIndexRef.current = 0;
    setCurrentFrameIndex(0);
    setIsAutoPlayAll(true);
    setIsPlaying(true);
    setTransitionNotice('PLAYING TOP 3 MOMENTS');
    setTimeout(() => setTransitionNotice(null), 1200);
  };

  // Select Individual Moment
  const handleSelectClip = (idx: number) => {
    retroAudio.playMenuBeep();
    setSelectedClipIndex(idx);
    frameIndexRef.current = 0;
    setCurrentFrameIndex(0);
    setIsAutoPlayAll(false);
    setIsPlaying(true);
  };

  const handlePrevClip = () => {
    if (selectedClipIndex > 0) {
      handleSelectClip(selectedClipIndex - 1);
    }
  };

  const handleNextClip = () => {
    if (selectedClipIndex < topHighlights.length - 1) {
      handleSelectClip(selectedClipIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-emerald-500 shadow-2xl p-4 sm:p-6 flex flex-col my-auto max-h-[96vh] overflow-y-auto">
        {/* Title */}
        <div className="text-center mb-3 border-b border-slate-800 pb-2.5">
          <span className="font-arcade text-xs text-emerald-400 tracking-widest block mb-1">
            FULL TIME SUMMARY
          </span>
          <h2 className="font-pixel text-lg sm:text-2xl text-yellow-300">
            {winner ? `${winner.name.toUpperCase()} WINS!` : 'MATCH DRAW!'}
          </h2>
        </div>

        {/* Scoreboard Lockup */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 sm:p-3.5 border border-slate-800 mb-3">
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl sm:text-3xl mb-1">{home.flag}</span>
            <span className="font-pixel text-xs sm:text-sm text-yellow-400">{home.name}</span>
          </div>

          <div className="font-pixel text-2xl sm:text-3xl text-slate-100 px-3 sm:px-4">
            <span className="text-yellow-400">{engine.homeScore}</span>
            <span className="text-slate-600 mx-2">-</span>
            <span className="text-sky-400">{engine.awayScore}</span>
          </div>

          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl sm:text-3xl mb-1">{away.flag}</span>
            <span className="font-pixel text-xs sm:text-sm text-sky-400">{away.name}</span>
          </div>
        </div>

        {/* Navigation Tabs (Match Stats vs Player Performance vs Highlight Reel) */}
        <div className="flex border-b border-slate-800 mb-3 gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              setActiveTab('team');
            }}
            className={`py-2 px-2.5 sm:px-3.5 font-arcade text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'team'
                ? 'border-yellow-400 text-yellow-300 font-bold bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            MATCH STATS
          </button>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              setActiveTab('players');
            }}
            className={`py-2 px-2.5 sm:px-3.5 font-arcade text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'players'
                ? 'border-emerald-400 text-emerald-300 font-bold bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>PLAYER STATS</span>
          </button>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              setActiveTab('highlights');
              setIsPlaying(true);
            }}
            className={`py-2 px-2.5 sm:px-3.5 font-arcade text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'highlights'
                ? 'border-yellow-400 text-yellow-300 font-bold bg-yellow-950/30'
                : 'border-transparent text-yellow-400/80 hover:text-yellow-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>HIGHLIGHT REEL</span>
            <span className="px-1.5 py-0.2 font-pixel text-[9px] bg-yellow-400 text-slate-950 font-bold rounded-xs">
              TOP 3
            </span>
          </button>
        </div>

        {/* TAB 1: TEAM STATS & GOAL TIMELINE */}
        {activeTab === 'team' && (
          <div className="space-y-3 mb-4">
            {/* Top 3 Highlight Reel Promo Callout Banner */}
            {topHighlights.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-950/50 via-slate-900 to-amber-950/40 border border-yellow-500/60 p-2.5 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div>
                    <span className="font-pixel text-[10px] text-yellow-300 block">
                      ★ TOP 3 MATCH HIGHLIGHTS READY ★
                    </span>
                    <span className="text-[11px] font-arcade text-slate-300">
                      Watch top goals, saves & dramatic moments!
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('highlights');
                    handlePlayAll();
                  }}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-arcade text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-md active:scale-95 transition-transform"
                >
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span>PLAY REEL</span>
                </button>
              </div>
            )}

            {/* Goalscorers Timeline with Assists */}
            {engine.goalEvents.length > 0 ? (
              <div className="bg-slate-950/70 p-3 border border-slate-800 text-xs font-arcade">
                <span className="text-slate-400 block mb-2 text-[10px] tracking-wider">
                  GOAL TIMELINE & ASSISTS:
                </span>
                <div className="space-y-1.5">
                  {engine.goalEvents.map((g, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-slate-200 border-b border-slate-900/60 pb-1 last:border-none"
                    >
                      <div className="flex items-center gap-2">
                        <span>⚽</span>
                        <span className="font-bold text-yellow-300">
                          {g.scorerName} (#{g.scorerNumber})
                        </span>
                        {g.assistName && (
                          <span className="text-slate-400 text-[11px]">
                            · Assist: <strong className="text-emerald-300">{g.assistName}</strong> (#{g.assistNumber})
                          </span>
                        )}
                      </div>
                      <span className="font-pixel text-yellow-400 text-[10px] tabular-nums">
                        {g.minute}'
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-xs font-arcade text-slate-500">
                NO GOALS SCORED IN THIS MATCH
              </div>
            )}

            {/* Team Stats Table */}
            <div className="space-y-2 text-xs font-arcade">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-bold text-yellow-400 tabular-nums">{homePossPct}%</span>
                <span className="text-slate-500">BALL POSSESSION</span>
                <span className="font-bold text-sky-400 tabular-nums">{awayPossPct}%</span>
              </div>
              <div className="w-full flex h-1.5 bg-slate-800">
                <div className="bg-yellow-400 h-full" style={{ width: `${homePossPct}%` }} />
                <div className="bg-sky-400 h-full" style={{ width: `${awayPossPct}%` }} />
              </div>

              <div className="flex justify-between items-center pt-1 text-slate-300">
                <span className="font-bold tabular-nums">{homeStats.shots}</span>
                <span className="text-slate-500">TOTAL SHOTS</span>
                <span className="font-bold tabular-nums">{awayStats.shots}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="font-bold tabular-nums">{homeStats.tackles}</span>
                <span className="text-slate-500">SLIDE TACKLES</span>
                <span className="font-bold tabular-nums">{awayStats.tackles}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="font-bold tabular-nums">{homeStats.fouls}</span>
                <span className="text-slate-500">FOULS COMMITTED</span>
                <span className="font-bold tabular-nums">{awayStats.fouls}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="font-bold text-yellow-400 tabular-nums">
                  {homeStats.yellowCards}Y / {homeStats.redCards}R
                </span>
                <span className="text-slate-500">DISCIPLINE CARDS</span>
                <span className="font-bold text-yellow-400 tabular-nums">
                  {awayStats.yellowCards}Y / {awayStats.redCards}R
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLAYER RATINGS & STATS */}
        {activeTab === 'players' && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950 p-2.5 border border-slate-800 text-xs font-arcade">
              {motmPlayer && (
                <div className="flex items-center gap-2 border-r border-slate-800 pr-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-yellow-400 block font-pixel">MAN OF THE MATCH</span>
                    <span className="font-bold text-slate-100 truncate block">
                      {motmPlayer.name} ({motmPlayer.rating})
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 border-r border-slate-800 pr-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-emerald-400 block font-pixel">TOP ASSISTS</span>
                  <span className="font-bold text-slate-100 truncate block">
                    {topAssister ? `${topAssister.name} (${topAssister.matchStats.assists} AST)` : 'No assists'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-sky-400 block font-pixel">MOST TACKLES</span>
                  <span className="font-bold text-slate-100 truncate block">
                    {topTackler ? `${topTackler.name} (${topTackler.matchStats.tackles} TK)` : 'None'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    retroAudio.playMenuBeep();
                    setSelectedTeamTab('home');
                  }}
                  className={`px-3 py-1.5 font-arcade text-xs border transition-colors cursor-pointer ${
                    selectedTeamTab === 'home'
                      ? 'bg-yellow-500 border-yellow-300 text-slate-950 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {home.flag} {home.name} SQUAD
                </button>

                <button
                  onClick={() => {
                    retroAudio.playMenuBeep();
                    setSelectedTeamTab('away');
                  }}
                  className={`px-3 py-1.5 font-arcade text-xs border transition-colors cursor-pointer ${
                    selectedTeamTab === 'away'
                      ? 'bg-sky-500 border-sky-300 text-slate-950 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {away.flag} {away.name} SQUAD
                </button>
              </div>

              <span className="text-[10px] font-arcade text-slate-500 hidden sm:inline">
                GOALS · ASSISTS · TACKLES
              </span>
            </div>

            <div className="border border-slate-800 bg-slate-950/70 overflow-x-auto">
              <table className="w-full text-left text-xs font-arcade border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[10px]">
                    <th className="py-2 px-2.5">#</th>
                    <th className="py-2 px-2">PLAYER</th>
                    <th className="py-2 px-2 text-center">POS</th>
                    <th className="py-2 px-2 text-center text-yellow-300 font-pixel">GOALS</th>
                    <th className="py-2 px-2 text-center text-emerald-300 font-pixel">ASSISTS</th>
                    <th className="py-2 px-2 text-center text-sky-300 font-pixel">TACKLES</th>
                    <th className="py-2 px-2 text-center">SHOTS</th>
                    <th className="py-2 px-2 text-right">RATING</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {displayedSquad.map((p) => {
                    const isMotm = motmPlayer && motmPlayer.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-800/50 transition-colors ${
                          isMotm ? 'bg-yellow-950/20' : ''
                        }`}
                      >
                        <td className="py-2 px-2.5 text-slate-400 font-mono tabular-nums">{p.number}</td>
                        <td className="py-2 px-2 font-medium text-slate-100 truncate max-w-[130px]">
                          <span className="flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isMotm && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="text-[10px] text-slate-400">{p.role}</span>
                        </td>
                        <td className="py-2 px-2 text-center font-bold font-mono tabular-nums text-yellow-400">
                          {p.matchStats.goals > 0 ? p.matchStats.goals : '-'}
                        </td>
                        <td className="py-2 px-2 text-center font-bold font-mono tabular-nums text-emerald-400">
                          {p.matchStats.assists > 0 ? p.matchStats.assists : '-'}
                        </td>
                        <td className="py-2 px-2 text-center font-bold font-mono tabular-nums text-sky-400">
                          {p.matchStats.tackles > 0 ? p.matchStats.tackles : '-'}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-400 font-mono tabular-nums">
                          {p.matchStats.shots > 0 ? p.matchStats.shots : '-'}
                        </td>
                        <td className="py-2 px-2 text-right font-pixel text-[10px] tabular-nums">
                          <span
                            className={
                              p.rating >= 8.5
                                ? 'text-yellow-400 font-bold'
                                : p.rating >= 7.0
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                            }
                          >
                            {p.rating.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: HIGHLIGHT REEL (TOP 3 EXCITING MOMENTS) */}
        {activeTab === 'highlights' && (
          <div className="space-y-3 mb-4">
            {/* Retro 16-Bit CRT Player Screen */}
            <div className="relative w-full bg-black border-2 border-slate-700 overflow-hidden shadow-2xl rounded-sm">
              <canvas
                ref={highlightCanvasRef}
                className="w-full h-52 sm:h-64 block bg-slate-950 cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              />

              {/* CRT Scanline Overlay Effect */}
              <div className="absolute inset-0 crt-overlay pointer-events-none opacity-40" />

              {/* Central Transition Notice Banner */}
              {transitionNotice && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none">
                  <div className="bg-yellow-400 text-slate-950 font-pixel text-xs sm:text-sm px-4 py-2 border-2 border-slate-900 shadow-2xl animate-pulse">
                    {transitionNotice}
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls & Timeline Bar */}
            <div className="bg-slate-950 p-2 sm:p-2.5 border border-slate-800 space-y-2">
              {/* Scrubbing Slider Track */}
              {activeClip && activeClip.frames.length > 0 && (
                <div className="flex items-center gap-2 font-arcade text-[10px] text-slate-400">
                  <span className="tabular-nums font-mono w-10 text-right">
                    {(currentFrameIndex / 60).toFixed(1)}s
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={activeClip.frames.length - 1}
                    value={currentFrameIndex}
                    onChange={(e) => handleScrub(parseInt(e.target.value, 10))}
                    className="flex-1 accent-yellow-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                  <span className="tabular-nums font-mono w-10">
                    {(activeClip.frames.length / 60).toFixed(1)}s
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs font-arcade">
                <div className="flex items-center gap-1.5">
                  {/* Prev Clip */}
                  <button
                    onClick={handlePrevClip}
                    disabled={selectedClipIndex === 0}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 text-slate-200 cursor-pointer"
                    title="Previous Highlight Moment"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  {/* Play / Pause */}
                  <button
                    onClick={() => {
                      retroAudio.playMenuBeep();
                      setIsPlaying(!isPlaying);
                    }}
                    className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                    <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>

                  {/* Replay Moment */}
                  <button
                    onClick={() => {
                      retroAudio.playMenuBeep();
                      frameIndexRef.current = 0;
                      setCurrentFrameIndex(0);
                      setIsPlaying(true);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
                    title="Replay Current Moment From Start"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Next Clip */}
                  <button
                    onClick={handleNextClip}
                    disabled={selectedClipIndex >= topHighlights.length - 1}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 text-slate-200 cursor-pointer"
                    title="Next Highlight Moment"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Slow-Motion Toggle */}
                  <button
                    onClick={() => {
                      retroAudio.playMenuBeep();
                      setIsSlowMo(!isSlowMo);
                    }}
                    className={`px-2 py-1.5 border text-[11px] font-arcade cursor-pointer flex items-center gap-1 transition-colors ${
                      isSlowMo
                        ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{isSlowMo ? 'SLOW-MO (0.5x)' : '1.0x NORMAL'}</span>
                  </button>

                  {/* Play All Button */}
                  <button
                    onClick={handlePlayAll}
                    className={`px-2.5 py-1.5 border text-[11px] font-arcade cursor-pointer flex items-center gap-1 shadow-sm transition-colors ${
                      isAutoPlayAll
                        ? 'bg-emerald-500 border-emerald-300 text-slate-950 font-bold'
                        : 'bg-emerald-700 hover:bg-emerald-600 border-emerald-500 text-slate-100'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>PLAY ALL (1→3)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Top 3 Moments Cards Selection List */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-arcade text-slate-400 px-1">
                <span>TOP 3 EXCITING MATCH MOMENTS:</span>
                <span className="text-[10px] text-yellow-400/80 font-pixel">SELECT TO WATCH</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {topHighlights.map((clip, idx) => {
                  const isSelected = selectedClipIndex === idx;
                  const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                  const typeIcon = clip.type === 'goal' ? '⚽' : clip.type === 'save' ? '🧤' : '🥅';
                  const typeLabel = clip.type === 'goal' ? 'GOAL' : clip.type === 'save' ? 'SAVE' : 'WOODWORK';

                  return (
                    <button
                      key={clip.id}
                      onClick={() => handleSelectClip(idx)}
                      className={`p-2.5 text-left border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-yellow-950/40 border-yellow-400 shadow-md ring-1 ring-yellow-400/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 font-pixel text-[10px] text-yellow-300">
                          <span>{rankMedal}</span>
                          <span>#{idx + 1}</span>
                          <span className="text-[9px] text-slate-400">· {typeIcon} {typeLabel}</span>
                        </div>
                        <span className="font-pixel text-[9px] text-yellow-400 tabular-nums">
                          {clip.minute}'
                        </span>
                      </div>

                      <div className="font-pixel text-[10px] text-slate-100 truncate mb-1">
                        {clip.title}
                      </div>

                      <div className="font-arcade text-[10px] text-slate-400 line-clamp-1 mb-1.5">
                        {clip.description}
                      </div>

                      <div className="flex items-center justify-between font-arcade text-[9px]">
                        <span className="text-slate-500">{clip.teamName}</span>
                        {isSelected && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>PLAYING</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-arcade text-xs mt-auto pt-2.5 border-t border-slate-800">
          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onPlayAgain();
            }}
            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold border border-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-transform"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              setActiveTab('highlights');
              handlePlayAll();
            }}
            className={`py-2.5 border flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform ${
              activeTab === 'highlights'
                ? 'bg-yellow-400 text-slate-950 font-bold border-yellow-300'
                : 'bg-yellow-950/60 hover:bg-yellow-900/80 text-yellow-300 border-yellow-600/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>HIGHLIGHTS</span>
          </button>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onWatchReplay();
            }}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>FULL REPLAY</span>
          </button>

          <button
            onClick={() => {
              retroAudio.playMenuBeep();
              onExit();
            }}
            className="py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
