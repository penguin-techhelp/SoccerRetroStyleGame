export type GameMode = 'exhibition' | 'tournament' | 'penalties' | 'training' | 'career';

export type Difficulty = 'amateur' | 'semi-pro' | 'world-class';

export type Weather = 'sunny' | 'night' | 'rain' | 'snow';

export type PlayerRole = 'GK' | 'DEF' | 'MID' | 'FWD';

export type PlayerActionState = 
  | 'idle' 
  | 'running' 
  | 'kicking' 
  | 'sliding' 
  | 'tackled' 
  | 'diving' 
  | 'celebrating' 
  | 'carded';

export interface PlayerStats {
  speed: number;       // 1 - 99
  shot: number;        // 1 - 99
  pass: number;        // 1 - 99
  tackle: number;      // 1 - 99
  stamina: number;     // 1 - 99
  keeper: number;      // 1 - 99 (relevant for GK)
}

export interface PlayerMatchStats {
  goals: number;
  assists: number;
  tackles: number;
  shots: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  role: PlayerRole;
  teamId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  stats: PlayerStats;
  matchStats: PlayerMatchStats;
  stamina: number;
  maxStamina: number;
  facingAngle: number;
  animFrame: number;
  animTimer: number;
  state: PlayerActionState;
  stateTimer: number;
  yellowCards: number;
  hasRedCard: boolean;
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'curly' | 'long' | 'buzz';
  isControlled: boolean;
  baseXPct?: number;
  baseYPct?: number;
  runPhaseTimer?: number;
}

export type FormationType = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2';

export interface Team {
  id: string;
  name: string;
  countryCode: string;
  flag: string;
  starPlayer: string;
  formation: FormationType;
  primaryColor: string;      // Jersey main color
  secondaryColor: string;    // Shorts color
  stripeColor?: string;      // Accent / stripe
  gkColor: string;           // Goalie jersey color
  sockColor: string;
  overallRating: number;     // 1 - 99
  attributes: {
    speed: number;
    attack: number;
    defense: number;
    stamina: number;
  };
  squad: Omit<Player, 'x' | 'y' | 'vx' | 'vy' | 'targetX' | 'targetY' | 'matchStats' | 'stamina' | 'maxStamina' | 'facingAngle' | 'animFrame' | 'animTimer' | 'state' | 'stateTimer' | 'yellowCards' | 'hasRedCard' | 'isControlled'>[];
}

export interface Ball {
  x: number;
  y: number;
  z: number;              // 0 = ground, > 0 = in air
  vx: number;
  vy: number;
  vz: number;
  spinX: number;
  spinY: number;
  rotationAngle: number;
  ownerId: string | null;
  lastTouchTeamId: string | null;
}

export interface MatchStats {
  goals: number;
  shots: number;
  shotsOnTarget: number;
  tackles: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  possessionTimeSeconds: number;
}

export interface GoalEvent {
  minute: number;
  scorerName: string;
  scorerNumber: number;
  scorerId: string;
  assistName?: string;
  assistNumber?: number;
  assistId?: string;
  teamId: string;
  teamName: string;
  isPenalty?: boolean;
}

export interface ReplayFrame {
  ball: { x: number; y: number; z: number };
  players: {
    id: string;
    teamId: string;
    x: number;
    y: number;
    facingAngle: number;
    state: PlayerActionState;
    animFrame: number;
  }[];
}

export interface HighlightClip {
  id: string;
  title: string;
  description: string;
  minute: number;
  type: 'goal' | 'save' | 'woodwork';
  teamName: string;
  frames: ReplayFrame[];
  importanceScore: number;
}

export interface BannerMessage {
  text: string;
  subtext?: string;
  type: 'goal' | 'save' | 'foul' | 'yellow_card' | 'red_card' | 'offside' | 'whistle' | 'halftime' | 'fulltime' | 'corner' | 'penalty';
  duration: number;
}

export interface CommentaryToast {
  id: string;
  type: 'goal' | 'save' | 'red_card' | 'yellow_card' | 'woodwork' | 'halftime' | 'fulltime';
  headline: string;
  commentary: string;
  spokenText?: string;
  playerName?: string;
  teamName: string;
  teamFlag?: string;
  minute: number;
  durationMs?: number;
}

export interface TournamentMatch {
  id: string;
  round: 'r16' | 'qf' | 'sf' | 'final';
  roundName: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
  winnerId?: string;
}

export type PerformanceMode = 'standard' | 'gopi' | 'eco';

export interface MatchSettings {
  mode: GameMode;
  halfLengthSeconds: number;   // 60, 90, 180
  difficulty: Difficulty;
  weather: Weather;
  twoPlayer: boolean;
  crtFilter: boolean;
  soundEnabled: boolean;
  aspectRatio169: boolean;     // True = strict 16:9 arcade framing, False = stretch to window
  performanceMode: PerformanceMode; // 'gopi' specifically tuned for Intel N-series (N150/N100) 8GB RAM integrated Intel Graphics
  enableShadows: boolean;           // False = clean, crisp, shadow-free pitch; True = drop shadows
  autoPlay?: boolean;          // Auto Mode: AI plays on behalf of user team with manual override
}
