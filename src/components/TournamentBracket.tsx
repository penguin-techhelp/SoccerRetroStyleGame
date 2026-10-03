import React, { useState } from 'react';
import { Team, TournamentMatch } from '../types/game';
import { CLASSIC_TEAMS } from '../data/teams';
import { retroAudio } from '../audio/retroAudio';
import { Trophy, Play, ArrowLeft } from 'lucide-react';

interface TournamentBracketProps {
  userTeam: Team;
  onPlayMatch: (homeTeam: Team, awayTeam: Team, onMatchWon: () => void) => void;
  onBack: () => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  userTeam,
  onPlayMatch,
  onBack
}) => {
  // Generate initial bracket
  const [matches, setMatches] = useState<TournamentMatch[]>(() => {
    // Shuffle teams except user team
    const otherTeams = CLASSIC_TEAMS.filter((t) => t.id !== userTeam.id);
    const shuffled = [...otherTeams].sort(() => Math.random() - 0.5);

    // 16 teams: 8 matches in Round of 16
    const bracketTeams = [userTeam, ...shuffled.slice(0, 15)];

    const r16Matches: TournamentMatch[] = [];
    for (let i = 0; i < 8; i++) {
      r16Matches.push({
        id: `r16_${i}`,
        round: 'r16',
        roundName: 'ROUND OF 16',
        homeTeam: bracketTeams[i * 2],
        awayTeam: bracketTeams[i * 2 + 1],
        played: false
      });
    }
    return r16Matches;
  });

  const [currentRound, setCurrentRound] = useState<'r16' | 'qf' | 'sf' | 'final' | 'champion'>('r16');

  // Find user's active match in the current round
  const userMatch = matches.find(
    (m) => (m.homeTeam.id === userTeam.id || m.awayTeam.id === userTeam.id) && !m.played
  );

  const simulateCpuMatch = (match: TournamentMatch): TournamentMatch => {
    const homeRating = match.homeTeam.overallRating;
    const awayRating = match.awayTeam.overallRating;

    let homeScore = Math.floor(Math.random() * 3) + (homeRating > awayRating ? 1 : 0);
    let awayScore = Math.floor(Math.random() * 3) + (awayRating > homeRating ? 1 : 0);

    // Sudden death if draw in knockout
    if (homeScore === awayScore) {
      if (Math.random() > 0.5) homeScore++;
      else awayScore++;
    }

    const winnerId = homeScore > awayScore ? match.homeTeam.id : match.awayTeam.id;

    return {
      ...match,
      homeScore,
      awayScore,
      played: true,
      winnerId
    };
  };

  const handlePlayUserMatch = () => {
    if (!userMatch) return;
    retroAudio.playMenuBeep();

    onPlayMatch(userMatch.homeTeam, userMatch.awayTeam, () => {
      // User won match!
      const isHome = userMatch.homeTeam.id === userTeam.id;
      const updatedMatch: TournamentMatch = {
        ...userMatch,
        homeScore: isHome ? 2 : 1,
        awayScore: isHome ? 1 : 2,
        played: true,
        winnerId: userTeam.id
      };

      // Simulate rest of matches in current round
      const currentRoundMatches = matches.filter((m) => m.round === currentRound);
      const simulatedMatches = currentRoundMatches.map((m) => {
        if (m.id === userMatch.id) return updatedMatch;
        if (!m.played) return simulateCpuMatch(m);
        return m;
      });

      // Prepare next round
      let nextRoundMatches: TournamentMatch[] = [];
      const winners = simulatedMatches.map((m) =>
        m.winnerId === m.homeTeam.id ? m.homeTeam : m.awayTeam
      );

      if (currentRound === 'r16') {
        for (let i = 0; i < 4; i++) {
          nextRoundMatches.push({
            id: `qf_${i}`,
            round: 'qf',
            roundName: 'QUARTER FINAL',
            homeTeam: winners[i * 2],
            awayTeam: winners[i * 2 + 1],
            played: false
          });
        }
        setCurrentRound('qf');
      } else if (currentRound === 'qf') {
        for (let i = 0; i < 2; i++) {
          nextRoundMatches.push({
            id: `sf_${i}`,
            round: 'sf',
            roundName: 'SEMI FINAL',
            homeTeam: winners[i * 2],
            awayTeam: winners[i * 2 + 1],
            played: false
          });
        }
        setCurrentRound('sf');
      } else if (currentRound === 'sf') {
        nextRoundMatches.push({
          id: `final_0`,
          round: 'final',
          roundName: 'RETRO SOCCER FINAL',
          homeTeam: winners[0],
          awayTeam: winners[1],
          played: false
        });
        setCurrentRound('final');
      } else if (currentRound === 'final') {
        setCurrentRound('champion');
        retroAudio.playGoalCelebration();
      }

      setMatches([...matches.filter((m) => m.round !== currentRound), ...simulatedMatches, ...nextRoundMatches]);
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 select-none">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between border-b border-yellow-900/60 pb-3">
        <button
          onClick={() => {
            retroAudio.playMenuBeep();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-arcade text-slate-400 hover:text-yellow-400 border border-slate-700 bg-slate-900 px-3 py-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>QUIT TOURNAMENT</span>
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="font-pixel text-sm md:text-base text-yellow-300 tracking-wider">
            RETRO SOCCER '94
          </h2>
        </div>

        <div className="flex items-center gap-2 font-pixel text-xs text-emerald-400">
          <span>{userTeam.flag} {userTeam.countryCode}</span>
        </div>
      </header>

      {/* Main Bracket Area */}
      <main className="w-full max-w-5xl mx-auto my-auto py-6 flex flex-col items-center">
        {currentRound === 'champion' ? (
          /* Victory Celebration */
          <div className="text-center p-8 border-4 border-yellow-400 bg-yellow-950/40 shadow-2xl max-w-lg">
            <img
              src="/src/assets/images/retro_world_trophy_1791033207535.jpg"
              alt="World Trophy"
              className="w-32 h-32 mx-auto mb-4 border-2 border-yellow-400 shadow-xl"
              referrerPolicy="no-referrer"
            />
            <h1 className="font-pixel text-xl sm:text-2xl text-yellow-300 mb-2">
              RETRO SOCCER CHAMPIONS!
            </h1>
            <p className="font-arcade text-sm text-slate-200 mb-6">
              {userTeam.name.toUpperCase()} LIFTS THE RETRO SOCCER TROPHY!
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-pixel text-xs border-2 border-yellow-300 cursor-pointer"
            >
              RETURN TO TITLE
            </button>
          </div>
        ) : (
          <div className="w-full">
            {/* Round Name Banner */}
            <div className="text-center mb-6">
              <span className="font-pixel text-xs text-yellow-400 tracking-widest bg-yellow-950/70 border border-yellow-700/60 px-4 py-1.5 inline-block">
                CURRENT STAGE: {currentRound === 'r16' ? 'ROUND OF 16' : currentRound === 'qf' ? 'QUARTER FINALS' : currentRound === 'sf' ? 'SEMI FINALS' : 'RETRO SOCCER FINAL'}
              </span>
            </div>

            {/* Next Match Showcase */}
            {userMatch && (
              <div className="max-w-xl mx-auto bg-slate-900 border-2 border-yellow-500/80 p-5 shadow-2xl mb-8">
                <div className="text-center text-xs font-arcade text-slate-400 mb-3">
                  YOUR NEXT KNOCKOUT FIXTURE
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Home */}
                  <div className="flex-1 flex flex-col items-center p-3 bg-slate-800/80 border border-slate-700">
                    <span className="text-3xl mb-1">{userMatch.homeTeam.flag}</span>
                    <span className="font-pixel text-xs text-slate-100">{userMatch.homeTeam.name}</span>
                    <span className="text-[10px] font-arcade text-slate-400">★ {userMatch.homeTeam.overallRating} OVR</span>
                  </div>

                  <span className="font-pixel text-sm text-yellow-400">VS</span>

                  {/* Away */}
                  <div className="flex-1 flex flex-col items-center p-3 bg-slate-800/80 border border-slate-700">
                    <span className="text-3xl mb-1">{userMatch.awayTeam.flag}</span>
                    <span className="font-pixel text-xs text-slate-100">{userMatch.awayTeam.name}</span>
                    <span className="text-[10px] font-arcade text-slate-400">★ {userMatch.awayTeam.overallRating} OVR</span>
                  </div>
                </div>

                <button
                  onClick={handlePlayUserMatch}
                  className="w-full mt-4 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-pixel text-xs tracking-wider border-2 border-yellow-300 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>PLAY KNOCKOUT MATCH</span>
                </button>
              </div>
            )}

            {/* Bracket List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {matches
                .filter((m) => m.round === currentRound)
                .map((m) => {
                  const isUserInMatch = m.homeTeam.id === userTeam.id || m.awayTeam.id === userTeam.id;

                  return (
                    <div
                      key={m.id}
                      className={`p-3 border text-xs font-arcade ${
                        isUserInMatch
                          ? 'border-yellow-400 bg-yellow-950/30 ring-1 ring-yellow-400'
                          : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{m.homeTeam.flag}</span>
                          <span className="truncate">{m.homeTeam.name}</span>
                        </span>
                        <span className="font-pixel text-slate-300">
                          {m.played ? m.homeScore : '-'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{m.awayTeam.flag}</span>
                          <span className="truncate">{m.awayTeam.name}</span>
                        </span>
                        <span className="font-pixel text-slate-300">
                          {m.played ? m.awayScore : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center border-t border-slate-900 pt-3 text-xs text-slate-500 font-arcade">
        KNOCKOUT FORMAT · WIN OR GO HOME
      </footer>
    </div>
  );
};
