/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameMode, Difficulty, Weather, MatchSettings, Team } from './types/game';
import { CLASSIC_TEAMS } from './data/teams';
import { TitleScreen } from './components/TitleScreen';
import { TeamSelect } from './components/TeamSelect';
import { GameCanvas } from './components/GameCanvas';
import { TournamentBracket } from './components/TournamentBracket';
import { PenaltyShootout } from './components/PenaltyShootout';
import { TrainingMode } from './components/TrainingMode';
import { MatchSummaryModal } from './components/MatchSummaryModal';
import { ControlsModal } from './components/ControlsModal';
import { PlayerDatabaseModal } from './components/PlayerDatabaseModal';
import { SoccerGameEngine } from './game/engine';
import { retroAudio } from './audio/retroAudio';

type AppScreen =
  | 'TITLE'
  | 'TEAM_SELECT_EXHIBITION'
  | 'TEAM_SELECT_TOURNAMENT'
  | 'TOURNAMENT_BRACKET'
  | 'MATCH'
  | 'PENALTIES'
  | 'TRAINING';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('TITLE');

  // Match Configuration Settings
  const [settings, setSettings] = useState<MatchSettings>({
    mode: 'exhibition',
    halfLengthSeconds: 60, // 2 minutes per match (fast arcade tempo!)
    difficulty: 'semi-pro',
    weather: 'sunny',
    twoPlayer: false,
    crtFilter: true,
    soundEnabled: true,
  });

  // Selected Teams
  const [homeTeam, setHomeTeam] = useState<Team>(CLASSIC_TEAMS[0]); // Brazil
  const [awayTeam, setAwayTeam] = useState<Team>(CLASSIC_TEAMS[1]); // Italy
  const [userTournamentTeam, setUserTournamentTeam] = useState<Team>(CLASSIC_TEAMS[0]);

  // Tournament Callback State
  const [tournamentWinCallback, setTournamentWinCallback] = useState<(() => void) | null>(null);

  // Match Summary State
  const [finishedEngine, setFinishedEngine] = useState<SoccerGameEngine | null>(null);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);

  // Sound toggle
  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    setSettings((s) => ({ ...s, soundEnabled: next }));
    retroAudio.setMuted(!next);
  };

  const handleToggleCrt = () => {
    setSettings((s) => ({ ...s, crtFilter: !s.crtFilter }));
  };

  const handleSelectMode = (mode: GameMode) => {
    setSettings((s) => ({ ...s, mode }));

    if (mode === 'exhibition') {
      setCurrentScreen('TEAM_SELECT_EXHIBITION');
    } else if (mode === 'tournament') {
      setCurrentScreen('TEAM_SELECT_TOURNAMENT');
    } else if (mode === 'penalties') {
      setCurrentScreen('PENALTIES');
    } else if (mode === 'training') {
      setCurrentScreen('TRAINING');
    }
  };

  const handleConfirmExhibitionTeams = (home: Team, away: Team, twoPlayer: boolean) => {
    setHomeTeam(home);
    setAwayTeam(away);
    setSettings((s) => ({ ...s, twoPlayer }));
    setFinishedEngine(null);
    setCurrentScreen('MATCH');
  };

  const handleConfirmTournamentTeam = (team: Team) => {
    setUserTournamentTeam(team);
    setCurrentScreen('TOURNAMENT_BRACKET');
  };

  const handlePlayTournamentMatch = (home: Team, away: Team, onWon: () => void) => {
    setHomeTeam(home);
    setAwayTeam(away);
    setSettings((s) => ({ ...s, twoPlayer: false }));
    setTournamentWinCallback(() => onWon);
    setFinishedEngine(null);
    setCurrentScreen('MATCH');
  };

  const handleMatchComplete = (result: { homeScore: number; awayScore: number; engine: SoccerGameEngine }) => {
    setFinishedEngine(result.engine);

    // If tournament match and user won, call progression callback
    if (settings.mode === 'tournament' && tournamentWinCallback) {
      const isHome = homeTeam.id === userTournamentTeam.id;
      const userWon = isHome ? result.homeScore > result.awayScore : result.awayScore > result.homeScore;
      if (userWon) {
        tournamentWinCallback();
      }
    }
  };

  const handlePlayAgain = () => {
    setFinishedEngine(null);
  };

  const handleExitToMenu = () => {
    setFinishedEngine(null);
    if (settings.mode === 'tournament') {
      setCurrentScreen('TOURNAMENT_BRACKET');
    } else {
      setCurrentScreen('TITLE');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 font-sans">
      {/* 1. Title Screen */}
      {currentScreen === 'TITLE' && (
        <TitleScreen
          onSelectMode={handleSelectMode}
          difficulty={settings.difficulty}
          onChangeDifficulty={(d) => setSettings((s) => ({ ...s, difficulty: d }))}
          halfLength={settings.halfLengthSeconds}
          onChangeHalfLength={(sec) => setSettings((s) => ({ ...s, halfLengthSeconds: sec }))}
          weather={settings.weather}
          onChangeWeather={(w) => setSettings((s) => ({ ...s, weather: w }))}
          crtFilter={settings.crtFilter}
          onToggleCrt={handleToggleCrt}
          soundEnabled={settings.soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenControls={() => setShowControlsModal(true)}
          onOpenRoster={() => setShowRosterModal(true)}
        />
      )}

      {/* 2. Team Select (Exhibition) */}
      {currentScreen === 'TEAM_SELECT_EXHIBITION' && (
        <TeamSelect
          onBack={() => setCurrentScreen('TITLE')}
          onConfirmTeams={handleConfirmExhibitionTeams}
          onOpenRoster={() => setShowRosterModal(true)}
        />
      )}

      {/* 3. Team Select (Tournament) */}
      {currentScreen === 'TEAM_SELECT_TOURNAMENT' && (
        <TeamSelect
          isTournament={true}
          onBack={() => setCurrentScreen('TITLE')}
          onConfirmTeams={(team) => handleConfirmTournamentTeam(team)}
          onOpenRoster={() => setShowRosterModal(true)}
        />
      )}

      {/* 4. Tournament Bracket View */}
      {currentScreen === 'TOURNAMENT_BRACKET' && (
        <TournamentBracket
          userTeam={userTournamentTeam}
          onPlayMatch={handlePlayTournamentMatch}
          onBack={() => setCurrentScreen('TITLE')}
        />
      )}

      {/* 5. Live Match Arena */}
      {currentScreen === 'MATCH' && (
        <GameCanvas
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          settings={settings}
          onMatchComplete={handleMatchComplete}
          onExitMatch={handleExitToMenu}
        />
      )}

      {/* 6. Penalty Shootout Mode */}
      {currentScreen === 'PENALTIES' && (
        <PenaltyShootout onBack={() => setCurrentScreen('TITLE')} />
      )}

      {/* 7. Training Mode */}
      {currentScreen === 'TRAINING' && (
        <TrainingMode onBack={() => setCurrentScreen('TITLE')} />
      )}

      {/* Match Summary Modal Overlay */}
      {finishedEngine && (
        <MatchSummaryModal
          engine={finishedEngine}
          onPlayAgain={handlePlayAgain}
          onWatchReplay={() => {
            finishedEngine.startInstantReplay();
            setFinishedEngine(null);
          }}
          onExit={handleExitToMenu}
        />
      )}

      {/* Controls & Playbook Modal */}
      {showControlsModal && (
        <ControlsModal onClose={() => setShowControlsModal(false)} />
      )}

      {/* Official 100 Players Database Roster Modal */}
      {showRosterModal && (
        <PlayerDatabaseModal onClose={() => setShowRosterModal(false)} />
      )}
    </div>
  );
}
