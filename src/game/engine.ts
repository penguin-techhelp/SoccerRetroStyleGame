import { Ball, BannerMessage, CommentaryToast, FormationType, GoalEvent, HighlightClip, MatchSettings, MatchStats, Player, PlayerActionState, ReplayFrame, Team } from '../types/game';
import { FORMATION_COORDS } from '../data/teams';
import { retroAudio } from '../audio/retroAudio';
import { generateCommentaryToast } from './commentary';

export const PITCH_WIDTH = 1900;
export const PITCH_HEIGHT = 1150;
export const GOAL_Y_MIN = 485;
export const GOAL_Y_MAX = 665;
export const GOAL_DEPTH = 55;

export interface NetPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  len?: number;
  swayPhase?: number;
  swaySpeed?: number;
}

export interface TurfSplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class SoccerGameEngine {
  public homeTeam: Team;
  public awayTeam: Team;
  public settings: MatchSettings;

  public homePlayers: Player[] = [];
  public awayPlayers: Player[] = [];
  public ball: Ball;

  public cameraX = PITCH_WIDTH / 2;
  public cameraY = PITCH_HEIGHT / 2;

  public homeScore = 0;
  public awayScore = 0;
  public matchClock = 0; // in seconds
  public isHalftime = false;
  public isFulltime = false;
  public isPaused = false;
  public isReplayPlaying = false;
  public replaySpeed = 0.5;
  public replayIndex = 0;

  public userControlledPlayerHome: Player | null = null;
  public userControlledPlayerAway: Player | null = null; // for 2P mode

  public shootPower = 0;
  public isChargingShoot = false;
  public isChargingPass = false;
  public passPower = 0;

  public shootPower2 = 0;
  public isChargingShoot2 = false;
  public isChargingPass2 = false;
  public passPower2 = 0;

  public homeStats: MatchStats = {
    goals: 0,
    shots: 0,
    shotsOnTarget: 0,
    tackles: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    corners: 0,
    possessionTimeSeconds: 0
  };

  public awayStats: MatchStats = {
    goals: 0,
    shots: 0,
    shotsOnTarget: 0,
    tackles: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    corners: 0,
    possessionTimeSeconds: 0
  };

  public goalEvents: GoalEvent[] = [];
  public activeMessage: BannerMessage | null = null;

  // Player Stats Tracking State
  public lastShooterId: string | null = null;
  public lastPasserId: string | null = null;
  public lastPasserTeamId: string | null = null;
  public lastPossessorId: string | null = null;

  // Replay ring buffer and Highlight Reel
  public replayBuffer: ReplayFrame[] = [];
  public highlights: HighlightClip[] = [];
  private maxReplayFrames = 450;
  private lastHighlightTime = -999;

  // 16-Bit Arcade Commentator Event Callback
  public onCommentaryEvent?: (toast: CommentaryToast) => void;

  public emitCommentary(
    type: CommentaryToast['type'],
    teamName: string,
    teamFlag: string,
    minute: number,
    playerName?: string,
    assistName?: string
  ) {
    const toast = generateCommentaryToast(type, teamName, teamFlag, minute, playerName, assistName);
    this.onCommentaryEvent?.(toast);
  }

  // Net simulation
  public leftNetMesh: NetPoint[][] = [];
  public rightNetMesh: NetPoint[][] = [];

  // Weather particles & turf interaction
  public weatherParticles: WeatherParticle[] = [];
  public turfSplashes: TurfSplashParticle[] = [];

  // Corner flags
  public flagWaveTimer = 0;

  // Crowd flashes
  public crowdFlashes: { x: number; y: number; life: number }[] = [];

  // Kickoff / Set-piece state
  public playState: 'kickoff' | 'in_play' | 'goal' | 'throw_in' | 'corner' | 'goal_kick' | 'penalty' = 'kickoff';
  public stateTimer = 0;
  public setPieceTeamId: string | null = null;
  public setPieceLocation: { x: number; y: number } = { x: PITCH_WIDTH / 2, y: PITCH_HEIGHT / 2 };

  constructor(homeTeam: Team, awayTeam: Team, settings: MatchSettings) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.settings = settings;

    this.ball = {
      x: PITCH_WIDTH / 2,
      y: PITCH_HEIGHT / 2,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      spinX: 0,
      spinY: 0,
      rotationAngle: 0,
      ownerId: null,
      lastTouchTeamId: null
    };

    this.initPlayers();
    this.initNetMeshes();
    this.initWeather();
    this.setupKickoff(this.homeTeam.id);
  }

  private initWeather() {
    this.weatherParticles = [];
    this.turfSplashes = [];

    if (this.settings.weather === 'rain') {
      // 280 diagonal falling rain streaks
      for (let i = 0; i < 280; i++) {
        this.weatherParticles.push({
          x: Math.random() * PITCH_WIDTH,
          y: Math.random() * PITCH_HEIGHT,
          vx: -3.5 - Math.random() * 2,
          vy: 18 + Math.random() * 7,
          len: 14 + Math.random() * 8,
          size: 1.2,
          alpha: 0.45 + Math.random() * 0.4
        });
      }
    } else if (this.settings.weather === 'snow') {
      // 240 drifting snowflakes with sway
      for (let i = 0; i < 240; i++) {
        this.weatherParticles.push({
          x: Math.random() * PITCH_WIDTH,
          y: Math.random() * PITCH_HEIGHT,
          vx: 0,
          vy: 1.5 + Math.random() * 2.2,
          size: 2 + Math.random() * 3,
          alpha: 0.6 + Math.random() * 0.4,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.03 + Math.random() * 0.035
        });
      }
    }
  }

  public spawnTurfEffect(x: number, y: number, count: number = 3, forceType?: 'rain' | 'snow') {
    const weather = forceType || this.settings.weather;
    if (weather !== 'rain' && weather !== 'snow') return;

    const isSnow = weather === 'snow';
    for (let i = 0; i < count; i++) {
      this.turfSplashes.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * (isSnow ? 3.2 : 5.0),
        vy: -(Math.random() * (isSnow ? 2.2 : 3.8) + 0.5),
        life: isSnow ? 18 + Math.random() * 10 : 12 + Math.random() * 8,
        maxLife: isSnow ? 28 : 20,
        color: isSnow ? 'rgba(255, 255, 255, 0.95)' : 'rgba(180, 220, 255, 0.8)',
        size: isSnow ? 2.5 + Math.random() * 2.5 : 1.5 + Math.random() * 2
      });
    }
  }

  private initNetMeshes() {
    // 5x5 spring points for each net
    this.leftNetMesh = [];
    for (let r = 0; r <= 4; r++) {
      const row: NetPoint[] = [];
      const y = GOAL_Y_MIN + (r / 4) * (GOAL_Y_MAX - GOAL_Y_MIN);
      for (let c = 0; c <= 3; c++) {
        const x = 50 - (c / 3) * GOAL_DEPTH;
        row.push({ x, y, vx: 0, vy: 0 });
      }
      this.leftNetMesh.push(row);
    }

    this.rightNetMesh = [];
    for (let r = 0; r <= 4; r++) {
      const row: NetPoint[] = [];
      const y = GOAL_Y_MIN + (r / 4) * (GOAL_Y_MAX - GOAL_Y_MIN);
      for (let c = 0; c <= 3; c++) {
        const x = (PITCH_WIDTH - 50) + (c / 3) * GOAL_DEPTH;
        row.push({ x, y, vx: 0, vy: 0 });
      }
      this.rightNetMesh.push(row);
    }
  }

  public initPlayers() {
    this.homePlayers = [];
    this.awayPlayers = [];

    const homeCoords = FORMATION_COORDS[this.homeTeam.formation] || FORMATION_COORDS['4-4-2'];
    const awayCoords = FORMATION_COORDS[this.awayTeam.formation] || FORMATION_COORDS['4-4-2'];

    // Home Team (attacks towards Right goal: X = PITCH_WIDTH)
    this.homeTeam.squad.slice(0, 11).forEach((tmpl, idx) => {
      const coord = homeCoords[idx] || { xPct: 0.2, yPct: 0.5, role: 'MID' };
      const startX = 60 + coord.xPct * (PITCH_WIDTH - 120);
      const startY = 80 + coord.yPct * (PITCH_HEIGHT - 160);

      this.homePlayers.push({
        ...tmpl,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        targetX: startX,
        targetY: startY,
        stats: tmpl.stats,
        matchStats: { goals: 0, assists: 0, tackles: 0, shots: 0 },
        stamina: 100,
        maxStamina: 100,
        facingAngle: 0,
        animFrame: 0,
        animTimer: 0,
        state: 'idle',
        stateTimer: 0,
        yellowCards: 0,
        hasRedCard: false,
        isControlled: idx === 9 // Primary striker by default
      });
    });

    // Away Team (attacks towards Left goal: X = 0)
    this.awayTeam.squad.slice(0, 11).forEach((tmpl, idx) => {
      const coord = awayCoords[idx] || { xPct: 0.2, yPct: 0.5, role: 'MID' };
      // Invert for away team facing left
      const startX = PITCH_WIDTH - (60 + coord.xPct * (PITCH_WIDTH - 120));
      const startY = 80 + coord.yPct * (PITCH_HEIGHT - 160);

      this.awayPlayers.push({
        ...tmpl,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        targetX: startX,
        targetY: startY,
        stats: tmpl.stats,
        matchStats: { goals: 0, assists: 0, tackles: 0, shots: 0 },
        stamina: 100,
        maxStamina: 100,
        facingAngle: Math.PI,
        animFrame: 0,
        animTimer: 0,
        state: 'idle',
        stateTimer: 0,
        yellowCards: 0,
        hasRedCard: false,
        isControlled: idx === 9
      });
    });

    this.userControlledPlayerHome = this.homePlayers.find((p) => p.isControlled) || this.homePlayers[9];
    this.userControlledPlayerAway = this.awayPlayers.find((p) => p.isControlled) || this.awayPlayers[9];
  }

  public setupKickoff(kickingTeamId: string) {
    this.playState = 'kickoff';
    this.stateTimer = 180; // 3 seconds count
    this.setPieceTeamId = kickingTeamId;

    this.ball.x = PITCH_WIDTH / 2;
    this.ball.y = PITCH_HEIGHT / 2;
    this.ball.z = 0;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vz = 0;
    this.ball.ownerId = null;

    // Reset players to their base formation positions
    const homeCoords = FORMATION_COORDS[this.homeTeam.formation];
    const awayCoords = FORMATION_COORDS[this.awayTeam.formation];

    this.homePlayers.forEach((p, idx) => {
      const coord = homeCoords[idx];
      let tx = 60 + coord.xPct * (PITCH_WIDTH - 120);
      let ty = 80 + coord.yPct * (PITCH_HEIGHT - 160);
      if (kickingTeamId === this.homeTeam.id && (idx === 9 || idx === 10)) {
        tx = PITCH_WIDTH / 2 - (idx === 9 ? 12 : 24);
        ty = PITCH_HEIGHT / 2 + (idx === 9 ? 0 : 25);
      }
      p.x = tx;
      p.y = ty;
      p.targetX = tx;
      p.targetY = ty;
      p.vx = 0;
      p.vy = 0;
      p.state = 'idle';
      p.facingAngle = 0;
    });

    this.awayPlayers.forEach((p, idx) => {
      const coord = awayCoords[idx];
      let tx = PITCH_WIDTH - (60 + coord.xPct * (PITCH_WIDTH - 120));
      let ty = 80 + coord.yPct * (PITCH_HEIGHT - 160);
      if (kickingTeamId === this.awayTeam.id && (idx === 9 || idx === 10)) {
        tx = PITCH_WIDTH / 2 + (idx === 9 ? 12 : 24);
        ty = PITCH_HEIGHT / 2 + (idx === 9 ? 0 : 25);
      }
      p.x = tx;
      p.y = ty;
      p.targetX = tx;
      p.targetY = ty;
      p.vx = 0;
      p.vy = 0;
      p.state = 'idle';
      p.facingAngle = Math.PI;
    });

    if (kickingTeamId === this.homeTeam.id) {
      this.switchControlledPlayer(this.homeTeam.id, this.homePlayers[9]);
    } else {
      this.switchControlledPlayer(this.awayTeam.id, this.awayPlayers[9]);
    }

    this.showMessage('KICK OFF', 'PRESS PASS TO START', 'whistle', 120);
    retroAudio.playWhistle(false);
  }

  public showMessage(text: string, subtext: string | undefined, type: BannerMessage['type'], duration: number = 100) {
    this.activeMessage = { text, subtext, type, duration };
  }

  public switchControlledPlayer(teamId: string, specificPlayer?: Player) {
    const list = teamId === this.homeTeam.id ? this.homePlayers : this.awayPlayers;
    list.forEach((p) => (p.isControlled = false));

    if (specificPlayer && !specificPlayer.hasRedCard) {
      specificPlayer.isControlled = true;
      if (teamId === this.homeTeam.id) this.userControlledPlayerHome = specificPlayer;
      else this.userControlledPlayerAway = specificPlayer;
      return;
    }

    // Find outfield player closest to the ball
    let bestDist = Infinity;
    let bestPlayer = list[9];
    list.forEach((p) => {
      if (p.role === 'GK' || p.hasRedCard) return;
      const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
      if (d < bestDist) {
        bestDist = d;
        bestPlayer = p;
      }
    });

    bestPlayer.isControlled = true;
    if (teamId === this.homeTeam.id) this.userControlledPlayerHome = bestPlayer;
    else this.userControlledPlayerAway = bestPlayer;
  }

  public triggerGoal(scoringTeamId: string, shooterName: string, shooterNumber: number, shooterId?: string) {
    this.playState = 'goal';
    this.stateTimer = 220; // Celebrate for ~3.5 seconds

    const isHome = scoringTeamId === this.homeTeam.id;
    if (isHome) {
      this.homeScore++;
      this.homeStats.goals++;
    } else {
      this.awayScore++;
      this.awayStats.goals++;
    }

    const allPlayers = [...this.homePlayers, ...this.awayPlayers];
    const scorer = allPlayers.find((p) => p.id === shooterId) ||
      allPlayers.find((p) => p.name === shooterName && p.teamId === scoringTeamId) ||
      (isHome ? this.homePlayers[9] : this.awayPlayers[9]);

    // Record goal on player
    scorer.matchStats.goals++;

    // Check for assist
    let assistPlayer: Player | undefined;
    if (this.lastPasserId && this.lastPasserId !== scorer.id && this.lastPasserTeamId === scoringTeamId) {
      assistPlayer = allPlayers.find((p) => p.id === this.lastPasserId);
      if (assistPlayer) {
        assistPlayer.matchStats.assists++;
      }
    }

    const currentMinute = Math.min(90, Math.floor((this.matchClock / (this.settings.halfLengthSeconds * 2)) * 90) + 1);
    this.goalEvents.push({
      minute: currentMinute,
      scorerId: scorer.id,
      scorerName: scorer.name,
      scorerNumber: scorer.number,
      assistId: assistPlayer?.id,
      assistName: assistPlayer?.name,
      assistNumber: assistPlayer?.number,
      teamId: scoringTeamId,
      teamName: isHome ? this.homeTeam.name : this.awayTeam.name
    });

    // Reset touch trackers
    this.lastPasserId = null;
    this.lastPasserTeamId = null;
    this.lastShooterId = null;

    // Net bulge impulse
    if (isHome) {
      // Right net hit
      this.rightNetMesh.forEach((row) =>
        row.forEach((pt) => {
          pt.vx += 10;
        })
      );
    } else {
      // Left net hit
      this.leftNetMesh.forEach((row) =>
        row.forEach((pt) => {
          pt.vx -= 10;
        })
      );
    }

    retroAudio.playGoalCelebration();
    const bannerSubtext = assistPlayer
      ? `${scorer.name.toUpperCase()} #${scorer.number} · AST: ${assistPlayer.name.toUpperCase()}`
      : `${scorer.name.toUpperCase()} #${scorer.number}`;
    this.showMessage('GOOOOAAAL!', bannerSubtext, 'goal', 200);

    // Scoring team celebrates
    const scorers = isHome ? this.homePlayers : this.awayPlayers;
    scorers.forEach((p) => {
      p.state = 'celebrating';
      p.stateTimer = 180;
    });

    // Capture Highlight Clip for Highlight Reel
    this.captureHighlight(
      `GOAL: ${scorer.name.toUpperCase()} (${scorer.number})`,
      assistPlayer ? `Assisted by ${assistPlayer.name} (#${assistPlayer.number})` : `Clinical strike into the net!`,
      'goal',
      isHome ? this.homeTeam.name : this.awayTeam.name,
      100 + this.homeScore + this.awayScore,
      200
    );

    // Emit Arcade Commentator Toast
    this.emitCommentary(
      'goal',
      isHome ? this.homeTeam.name : this.awayTeam.name,
      isHome ? this.homeTeam.flag : this.awayTeam.flag,
      currentMinute,
      scorer.name,
      assistPlayer?.name
    );

    // Crowd flashbulbs frenzy
    for (let i = 0; i < 20; i++) {
      this.crowdFlashes.push({
        x: Math.random() * PITCH_WIDTH,
        y: Math.random() < 0.5 ? Math.random() * 60 : PITCH_HEIGHT - 60 + Math.random() * 60,
        life: 5 + Math.random() * 10
      });
    }
  }

  public captureHighlight(
    title: string,
    description: string,
    type: 'goal' | 'save' | 'woodwork',
    teamName: string,
    importanceScore: number,
    frameCount: number = 200
  ) {
    if (this.replayBuffer.length < 20) return;
    // Prevent duplicate clip spam within 150 frames (2.5 seconds) unless it is a goal
    if (type !== 'goal' && this.replayBuffer.length - this.lastHighlightTime < 150) return;
    this.lastHighlightTime = this.replayBuffer.length;

    const currentMinute = Math.min(90, Math.floor((this.matchClock / (this.settings.halfLengthSeconds * 2)) * 90) + 1);
    const framesToCapture = this.replayBuffer.slice(-Math.min(frameCount, this.replayBuffer.length));

    const clip: HighlightClip = {
      id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      minute: currentMinute,
      type,
      teamName,
      frames: framesToCapture,
      importanceScore
    };

    this.highlights.push(clip);
  }

  public getTopHighlights(limit: number = 3): HighlightClip[] {
    const sorted = [...this.highlights].sort((a, b) => b.importanceScore - a.importanceScore);
    if (sorted.length >= limit) {
      return sorted.slice(0, limit);
    }

    // If fewer than requested, create supplementary clips from replay buffer
    if (this.replayBuffer.length > 30) {
      const needed = limit - sorted.length;
      for (let i = 0; i < needed; i++) {
        const segLen = Math.min(180, Math.max(40, Math.floor(this.replayBuffer.length / (needed + 1))));
        const start = Math.max(0, this.replayBuffer.length - (i + 1) * segLen);
        const subFrames = this.replayBuffer.slice(start, start + segLen);
        if (subFrames.length > 20) {
          const isHomeEvent = i % 2 === 0;
          sorted.push({
            id: `hl_sub_${i}`,
            title: i === 0 ? 'DANGEROUS ATTACKING OPPORTUNITY' : 'FAST-BREAK COUNTER ATTACK',
            description: 'Intense pressure and slick ball movement deep in opposition territory',
            minute: Math.max(1, Math.min(90, Math.floor((i + 1) * 26))),
            type: 'save',
            teamName: isHomeEvent ? this.homeTeam.name : this.awayTeam.name,
            frames: subFrames,
            importanceScore: 50 - i * 10
          });
        }
      }
    }

    return sorted.slice(0, limit);
  }

  // --- Main Update Loop (Called at 60 FPS) ---
  public update(
    inputP1: { up: boolean; down: boolean; left: boolean; right: boolean; pass: boolean; shoot: boolean; slide: boolean; sprint: boolean },
    inputP2?: { up: boolean; down: boolean; left: boolean; right: boolean; pass: boolean; shoot: boolean; slide: boolean; sprint: boolean }
  ) {
    if (this.isPaused) return;

    if (this.isReplayPlaying) {
      this.updateReplayPlayback();
      return;
    }

    this.flagWaveTimer += 0.05;

    // Active message timer
    if (this.activeMessage) {
      this.activeMessage.duration--;
      if (this.activeMessage.duration <= 0) {
        this.activeMessage = null;
      }
    }

    // Update match clock
    if (this.playState === 'in_play') {
      this.matchClock += 1 / 60;
      const totalMatchLength = this.settings.halfLengthSeconds * 2;
      const halfLength = this.settings.halfLengthSeconds;

      // Track possession
      if (this.ball.ownerId) {
        const owner = this.homePlayers.find((p) => p.id === this.ball.ownerId);
        if (owner) this.homeStats.possessionTimeSeconds += 1 / 60;
        else this.awayStats.possessionTimeSeconds += 1 / 60;
      }

      // Half-time check
      if (this.matchClock >= halfLength && !this.isHalftime && this.matchClock < halfLength + 2) {
        this.isHalftime = true;
        this.showMessage('HALF TIME', `${this.homeScore} - ${this.awayScore}`, 'halftime', 240);
        retroAudio.playWhistle(true);
      }

      // Full-time check
      if (this.matchClock >= totalMatchLength && !this.isFulltime) {
        this.isFulltime = true;
        this.showMessage('FULL TIME', `${this.homeScore} - ${this.awayScore}`, 'fulltime', 300);
        retroAudio.playWhistle(true);
      }
    }

    // Update State timers for set pieces / goals
    if (this.playState !== 'in_play') {
      this.stateTimer--;
      if (this.playState === 'goal' && this.stateTimer <= 0) {
        // Kickoff to the team that conceded
        const concedingTeamId = this.ball.x > PITCH_WIDTH / 2 ? this.awayTeam.id : this.homeTeam.id;
        this.setupKickoff(concedingTeamId);
      }
    }

    // Process Player 1 Input
    this.handlePlayerControl(this.homeTeam.id, this.userControlledPlayerHome, inputP1, false);

    // Process Player 2 / AI
    if (this.settings.twoPlayer && inputP2) {
      this.handlePlayerControl(this.awayTeam.id, this.userControlledPlayerAway, inputP2, true);
    } else {
      this.updateOpponentAI();
    }

    // Update Teammate AI
    this.updateTeammateAI(this.homeTeam.id);
    if (this.settings.twoPlayer) {
      this.updateTeammateAI(this.awayTeam.id);
    }

    // Update All Players (Physics, Animations, Collisions)
    [...this.homePlayers, ...this.awayPlayers].forEach((p) => this.updatePlayerPhysics(p));

    // Update Ball Physics
    this.updateBallPhysics();

    // Check Ball-Player Interactions (Dribbling, Tackles, Interceptions)
    this.checkPossessionAndCollisions();

    // Net Spring Physics
    this.updateNetPhysics();

    // Weather simulation (Rain and Snow particles)
    if (this.settings.weather === 'rain') {
      this.weatherParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > PITCH_HEIGHT) {
          p.y = 0;
          p.x = Math.random() * PITCH_WIDTH;
          // Spawn turf splash puddle ripple occasionally
          if (Math.random() < 0.08) {
            this.spawnTurfEffect(p.x, Math.random() * PITCH_HEIGHT, 1, 'rain');
          }
        }
      });
    } else if (this.settings.weather === 'snow') {
      this.weatherParticles.forEach((p) => {
        if (p.swayPhase !== undefined && p.swaySpeed !== undefined) {
          p.swayPhase += p.swaySpeed;
          p.x += Math.sin(p.swayPhase) * 1.5 - 0.4;
        }
        p.y += p.vy;
        if (p.y > PITCH_HEIGHT) {
          p.y = 0;
          p.x = Math.random() * PITCH_WIDTH;
        }
      });
    }

    // Update Turf Sprays and Splashes
    if (this.turfSplashes.length > 0) {
      this.turfSplashes.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.12; // gravity on water/snow particles
        s.life--;
      });
      this.turfSplashes = this.turfSplashes.filter((s) => s.life > 0);
    }

    // Ball rolling spray in wet/snowy conditions
    if (this.ball.z <= 1) {
      const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);
      if (ballSpeed > 3.0 && (this.settings.weather === 'rain' || this.settings.weather === 'snow')) {
        this.spawnTurfEffect(this.ball.x, this.ball.y, 1);
      }
    }

    // Flashbulbs
    this.crowdFlashes = this.crowdFlashes.filter((f) => {
      f.life--;
      return f.life > 0;
    });

    // Record Replay Snapshot
    this.recordReplayFrame();

    // Smooth Camera Tracking
    this.updateCamera();

    // Audio Excitement dynamic updates
    const distToGoalHome = Math.hypot(this.ball.x - PITCH_WIDTH, this.ball.y - PITCH_HEIGHT / 2);
    const distToGoalAway = Math.hypot(this.ball.x - 0, this.ball.y - PITCH_HEIGHT / 2);
    const minGoalDist = Math.min(distToGoalHome, distToGoalAway);
    const tension = Math.max(0, Math.min(1, 1 - minGoalDist / 600));
    retroAudio.updateCrowdExcitement(tension);
  }

  private handlePlayerControl(
    teamId: string,
    player: Player | null,
    input: { up: boolean; down: boolean; left: boolean; right: boolean; pass: boolean; shoot: boolean; slide: boolean; sprint: boolean },
    isP2: boolean
  ) {
    if (!player || player.hasRedCard) return;

    // Movement vector
    let dx = 0;
    let dy = 0;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    // Facing angle
    if (dx !== 0 || dy !== 0) {
      player.facingAngle = Math.atan2(dy, dx);
    }

    // Speed calculation
    const baseSpeed = 3.6 + (player.stats.speed / 100) * 1.8;
    const isSprinting = input.sprint && player.stamina > 10;
    const speed = isSprinting ? baseSpeed * 1.35 : baseSpeed;

    if (isSprinting && (dx !== 0 || dy !== 0)) {
      player.stamina = Math.max(0, player.stamina - 0.25);
    } else {
      player.stamina = Math.min(player.maxStamina, player.stamina + 0.15);
    }

    if (player.state !== 'sliding' && player.state !== 'kicking' && player.state !== 'tackled') {
      player.vx = dx * speed;
      player.vy = dy * speed;
      player.state = dx !== 0 || dy !== 0 ? 'running' : 'idle';
    }

    // Action handling
    const hasBall = this.ball.ownerId === player.id;

    if (hasBall) {
      // PASS BUTTON
      if (input.pass) {
        if (!isP2) {
          this.isChargingPass = true;
          this.passPower = Math.min(1.0, this.passPower + 0.05);
        } else {
          this.isChargingPass2 = true;
          this.passPower2 = Math.min(1.0, this.passPower2 + 0.05);
        }
      } else if (isP2 ? this.isChargingPass2 : this.isChargingPass) {
        // Execute Pass on release
        const power = isP2 ? this.passPower2 : this.passPower;
        this.executePass(player, power);
        if (isP2) {
          this.isChargingPass2 = false;
          this.passPower2 = 0;
        } else {
          this.isChargingPass = false;
          this.passPower = 0;
        }
      }

      // SHOOT BUTTON
      if (input.shoot) {
        if (!isP2) {
          this.isChargingShoot = true;
          this.shootPower = Math.min(1.0, this.shootPower + 0.04);
        } else {
          this.isChargingShoot2 = true;
          this.shootPower2 = Math.min(1.0, this.shootPower2 + 0.04);
        }
      } else if (isP2 ? this.isChargingShoot2 : this.isChargingShoot) {
        // Execute Shot on release
        const power = isP2 ? this.shootPower2 : this.shootPower;
        this.executeShot(player, power);
        if (isP2) {
          this.isChargingShoot2 = false;
          this.shootPower2 = 0;
        } else {
          this.isChargingShoot = false;
          this.shootPower = 0;
        }
      }
    } else {
      // DEFENSE / OFF-BALL CONTROLS
      // Switch player with pass button
      if (input.pass) {
        this.switchControlledPlayer(teamId);
      }

      // Slide Tackle
      if (input.slide && player.state !== 'sliding' && player.state !== 'tackled') {
        this.executeSlideTackle(player);
      }
    }

    // Start in-play from kickoff on any action
    if (this.playState === 'kickoff' && (input.pass || input.shoot)) {
      this.playState = 'in_play';
    }
  }

  private executePass(passer: Player, power: number) {
    this.ball.ownerId = null;
    this.ball.lastTouchTeamId = passer.teamId;
    this.lastPasserId = passer.id;
    this.lastPasserTeamId = passer.teamId;
    passer.state = 'kicking';
    passer.stateTimer = 15;

    // Find best teammate in facing cone
    const teammates = passer.teamId === this.homeTeam.id ? this.homePlayers : this.awayPlayers;
    let targetPlayer: Player | null = null;
    let bestScore = -Infinity;

    teammates.forEach((tm) => {
      if (tm.id === passer.id || tm.role === 'GK') return;
      const angleToTm = Math.atan2(tm.y - passer.y, tm.x - passer.x);
      let angleDiff = Math.abs(angleToTm - passer.facingAngle);
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      angleDiff = Math.abs(angleDiff);

      if (angleDiff < Math.PI / 2.5) {
        const dist = Math.hypot(tm.x - passer.x, tm.y - passer.y);
        const score = 1000 - dist - angleDiff * 300;
        if (score > bestScore) {
          bestScore = score;
          targetPlayer = tm;
        }
      }
    });

    let passAngle = passer.facingAngle;
    let passSpeed = 10 + power * 9;

    if (targetPlayer) {
      passAngle = Math.atan2((targetPlayer as Player).y - passer.y, (targetPlayer as Player).x - passer.x);
      this.switchControlledPlayer(passer.teamId, targetPlayer);
    }

    // Add ball height if high power (lob / cross)
    if (power > 0.6) {
      this.ball.vz = 4 + (power - 0.6) * 10;
    }

    this.ball.vx = Math.cos(passAngle) * passSpeed;
    this.ball.vy = Math.sin(passAngle) * passSpeed;
    retroAudio.playKick(power);

    if (this.playState === 'kickoff') {
      this.playState = 'in_play';
    }
  }

  private executeShot(shooter: Player, power: number) {
    this.ball.ownerId = null;
    this.ball.lastTouchTeamId = shooter.teamId;
    this.lastShooterId = shooter.id;
    shooter.matchStats.shots++;
    shooter.state = 'kicking';
    shooter.stateTimer = 20;

    const isHome = shooter.teamId === this.homeTeam.id;
    const targetGoalX = isHome ? PITCH_WIDTH - 30 : 30;
    const targetGoalY = PITCH_HEIGHT / 2 + (shooter.facingAngle > 0 ? 50 : -50);

    const shotAngle = Math.atan2(targetGoalY - shooter.y, targetGoalX - shooter.x);
    const speed = 12 + power * 14 + (shooter.stats.shot / 100) * 5;

    // Shot curve
    this.ball.spinY = (shooter.facingAngle - shotAngle) * 0.5;
    this.ball.vx = Math.cos(shotAngle) * speed;
    this.ball.vy = Math.sin(shotAngle) * speed;
    this.ball.vz = 2.5 + power * 6.5;

    if (power > 0.7) {
      retroAudio.playHardShot();
    } else {
      retroAudio.playKick(power);
    }

    if (isHome) {
      this.homeStats.shots++;
    } else {
      this.awayStats.shots++;
    }

    if (this.playState === 'kickoff') {
      this.playState = 'in_play';
    }
  }

  private executeSlideTackle(player: Player) {
    player.state = 'sliding';

    // Weather impact on slide distance and duration
    let slideSpeedMult = 1.0;
    let slideTimerDuration = 35;
    if (this.settings.weather === 'rain') {
      slideSpeedMult = 1.25; // Skids further on slick wet grass!
      slideTimerDuration = 42;
      this.spawnTurfEffect(player.x, player.y, 6, 'rain');
    } else if (this.settings.weather === 'snow') {
      slideSpeedMult = 0.92; // Plows through snow resistance
      slideTimerDuration = 32;
      this.spawnTurfEffect(player.x, player.y, 8, 'snow');
    }

    player.stateTimer = slideTimerDuration;
    const baseTackleSpeed = 8.5 + (player.stats.tackle / 100) * 3;
    const slideSpeed = baseTackleSpeed * slideSpeedMult;
    player.vx = Math.cos(player.facingAngle) * slideSpeed;
    player.vy = Math.sin(player.facingAngle) * slideSpeed;
    retroAudio.playSlide();

    // Check if tackles an opponent
    const opponents = player.teamId === this.homeTeam.id ? this.awayPlayers : this.homePlayers;
    opponents.forEach((opp) => {
      const dist = Math.hypot(opp.x - player.x, opp.y - player.y);
      if (dist < 32) {
        if (this.ball.ownerId === opp.id) {
          // Clean tackle or foul check
          const isFromBehind = Math.abs(player.facingAngle - opp.facingAngle) < 0.8;
          if (isFromBehind && Math.random() < 0.6) {
            // Foul!
            this.handleFoul(player, opp);
          } else {
            // Clean dispossession
            this.ball.ownerId = null;
            this.ball.lastTouchTeamId = player.teamId;
            player.matchStats.tackles++;
            this.ball.vx = player.vx * 0.8 + (Math.random() - 0.5) * 4;
            this.ball.vy = player.vy * 0.8 + (Math.random() - 0.5) * 4;
            opp.state = 'tackled';
            opp.stateTimer = 40;
            if (player.teamId === this.homeTeam.id) this.homeStats.tackles++;
            else this.awayStats.tackles++;
          }
        }
      }
    });
  }

  private handleFoul(fouler: Player, victim: Player) {
    victim.state = 'tackled';
    victim.stateTimer = 50;
    victim.vx = 0;
    victim.vy = 0;

    retroAudio.playWhistle(true);

    if (fouler.teamId === this.homeTeam.id) this.homeStats.fouls++;
    else this.awayStats.fouls++;

    const currentMinute = Math.min(90, Math.floor((this.matchClock / (this.settings.halfLengthSeconds * 2)) * 90) + 1);
    const foulerTeam = fouler.teamId === this.homeTeam.id ? this.homeTeam : this.awayTeam;

    const isSevere = Math.random() < 0.45;
    if (isSevere) {
      const isStraightRed = Math.random() < 0.22 && fouler.yellowCards === 0;
      if (isStraightRed || fouler.yellowCards >= 1) {
        fouler.hasRedCard = true;
        fouler.yellowCards = Math.max(fouler.yellowCards, 1);
        if (fouler.teamId === this.homeTeam.id) this.homeStats.redCards++;
        else this.awayStats.redCards++;
        this.showMessage('RED CARD!', `${fouler.name.toUpperCase()} SENT OFF`, 'red_card', 160);
        this.emitCommentary('red_card', foulerTeam.name, foulerTeam.flag, currentMinute, fouler.name);
      } else {
        fouler.yellowCards++;
        if (fouler.teamId === this.homeTeam.id) this.homeStats.yellowCards++;
        else this.awayStats.yellowCards++;
        this.showMessage('YELLOW CARD', `${fouler.name.toUpperCase()} BOOKED`, 'yellow_card', 140);
        this.emitCommentary('yellow_card', foulerTeam.name, foulerTeam.flag, currentMinute, fouler.name);
      }
    } else {
      this.showMessage('REFEREE WHISTLE', 'FOUL AWARDED', 'foul', 100);
    }
  }

  private updateOpponentAI() {
    const diff = this.settings.difficulty;
    const aiSpeedMult = diff === 'amateur' ? 0.75 : diff === 'semi-pro' ? 0.9 : 1.05;
    const reactionDelay = diff === 'amateur' ? 20 : diff === 'semi-pro' ? 12 : 5;

    this.awayPlayers.forEach((p) => {
      if (p.hasRedCard || p.role === 'GK') return;

      const hasBall = this.ball.ownerId === p.id;
      if (hasBall) {
        // Attack towards left goal (X = 50)
        const targetX = 60;
        const targetY = PITCH_HEIGHT / 2;
        const distToGoal = Math.hypot(p.x - targetX, p.y - targetY);

        if (distToGoal < 380 && Math.random() < 0.05) {
          // Shoot!
          this.executeShot(p, 0.7 + Math.random() * 0.3);
        } else if (Math.random() < 0.03) {
          // Pass to open teammate
          this.executePass(p, 0.4 + Math.random() * 0.4);
        } else {
          // Dribble towards goal
          const angle = Math.atan2(targetY - p.y, targetX - p.x);
          p.vx = Math.cos(angle) * (3.8 * aiSpeedMult);
          p.vy = Math.sin(angle) * (3.8 * aiSpeedMult);
          p.facingAngle = angle;
          p.state = 'running';
        }
      } else {
        // Off ball AI
        const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
        const isClosestToBall = this.getClosestPlayer(this.awayPlayers, this.ball.x, this.ball.y)?.id === p.id;

        if (isClosestToBall && distToBall < 450) {
          // Chase ball
          const angle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
          p.vx = Math.cos(angle) * (4.2 * aiSpeedMult);
          p.vy = Math.sin(angle) * (4.2 * aiSpeedMult);
          p.facingAngle = angle;
          p.state = 'running';

          // Slide tackle if close and ball is possessed by opponent
          if (distToBall < 40 && this.ball.ownerId && Math.random() < (diff === 'world-class' ? 0.08 : 0.02)) {
            this.executeSlideTackle(p);
          }
        } else {
          // Return to formation zone
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 15) {
            p.vx = (dx / dist) * 2.8;
            p.vy = (dy / dist) * 2.8;
            p.facingAngle = Math.atan2(dy, dx);
            p.state = 'running';
          } else {
            p.vx = 0;
            p.vy = 0;
            p.state = 'idle';
          }
        }
      }
    });

    // Goalkeeper AI
    const awayGK = this.awayPlayers.find((p) => p.role === 'GK');
    if (awayGK) this.updateGoalkeeper(awayGK, PITCH_WIDTH - 60, true);

    const homeGK = this.homePlayers.find((p) => p.role === 'GK');
    if (homeGK) this.updateGoalkeeper(homeGK, 60, false);
  }

  private updateTeammateAI(teamId: string) {
    const isHome = teamId === this.homeTeam.id;
    const squad = isHome ? this.homePlayers : this.awayPlayers;
    const targetGoalX = isHome ? PITCH_WIDTH - 50 : 50;

    squad.forEach((p) => {
      if (p.isControlled || p.hasRedCard || p.role === 'GK') return;

      const hasBall = this.ball.ownerId === p.id;
      if (hasBall) return; // Handled elsewhere

      // Dynamic forward shift when team has ball
      const teamPossession = this.ball.lastTouchTeamId === teamId;
      const xOffset = teamPossession ? (isHome ? 90 : -90) : 0;

      const targetX = p.targetX + xOffset;
      const targetY = p.targetY;
      const dx = targetX - p.x;
      const dy = targetY - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 25) {
        const speed = Math.min(dist * 0.08, 3.5);
        p.vx = (dx / dist) * speed;
        p.vy = (dy / dist) * speed;
        p.facingAngle = Math.atan2(dy, dx);
        p.state = 'running';
      } else {
        p.vx = 0;
        p.vy = 0;
        p.state = 'idle';
      }
    });
  }

  private updateGoalkeeper(gk: Player, goalX: number, isRightGoal: boolean) {
    // Keep within penalty box mouth
    const goalCenterY = PITCH_HEIGHT / 2;
    const targetY = Math.max(GOAL_Y_MIN + 25, Math.min(GOAL_Y_MAX - 25, this.ball.y));

    // Move along goal line
    const dy = targetY - gk.y;
    if (Math.abs(dy) > 6) {
      gk.vy = Math.sign(dy) * 3.8;
      gk.state = 'running';
    } else {
      gk.vy = 0;
      gk.state = 'idle';
    }

    gk.x = goalX;
    gk.vx = 0;
    gk.facingAngle = isRightGoal ? Math.PI : 0;

    // Check Diving / Saves
    const distToBall = Math.hypot(gk.x - this.ball.x, gk.y - this.ball.y);
    if (distToBall < 55 && this.ball.z < 60) {
      const isShotComing = isRightGoal ? this.ball.vx > 3 : this.ball.vx < -3;
      if (isShotComing) {
        // Save!
        gk.state = 'diving';
        gk.stateTimer = 40;
        this.ball.vx = -this.ball.vx * 0.35 + (Math.random() - 0.5) * 4;
        this.ball.vy = (Math.random() - 0.5) * 6;
        this.ball.vz = 3;
        this.ball.ownerId = null;

        retroAudio.playCrowdGasp();
        this.showMessage('WHAT A SAVE!', `${gk.name.toUpperCase()} PUSHES IT AWAY!`, 'save', 90);

        this.captureHighlight(
          `HEROIC SAVE: ${gk.name.toUpperCase()}`,
          `Acrobatic diving stop by ${gk.name} (#${gk.number}) denies goal!`,
          'save',
          gk.teamId === this.homeTeam.id ? this.homeTeam.name : this.awayTeam.name,
          85,
          180
        );

        const currentMinute = Math.min(90, Math.floor((this.matchClock / (this.settings.halfLengthSeconds * 2)) * 90) + 1);
        const keeperTeam = gk.teamId === this.homeTeam.id ? this.homeTeam : this.awayTeam;
        this.emitCommentary('save', keeperTeam.name, keeperTeam.flag, currentMinute, gk.name);
      }
    }
  }

  private updatePlayerPhysics(p: Player) {
    if (p.stateTimer > 0) {
      p.stateTimer--;
      if (p.stateTimer <= 0 && (p.state === 'sliding' || p.state === 'kicking' || p.state === 'tackled' || p.state === 'diving')) {
        p.state = 'idle';
      }
    }

    // Apply friction to sliding
    if (p.state === 'sliding') {
      p.vx *= 0.92;
      p.vy *= 0.92;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Clamp inside pitch boundaries
    p.x = Math.max(30, Math.min(PITCH_WIDTH - 30, p.x));
    p.y = Math.max(40, Math.min(PITCH_HEIGHT - 40, p.y));

    // Animation frame progression
    if (p.state === 'running') {
      p.animTimer += 0.2;
      p.animFrame = Math.floor(p.animTimer) % 4;
    } else {
      p.animFrame = 0;
    }
  }

  private updateBallPhysics() {
    if (this.ball.ownerId) {
      const owner = [...this.homePlayers, ...this.awayPlayers].find((p) => p.id === this.ball.ownerId);
      if (owner) {
        // Ball stays glued near owner's feet
        const carryDist = 16;
        this.ball.x = owner.x + Math.cos(owner.facingAngle) * carryDist;
        this.ball.y = owner.y + Math.sin(owner.facingAngle) * carryDist;
        this.ball.z = 0;
        this.ball.vx = owner.vx;
        this.ball.vy = owner.vy;
        this.ball.vz = 0;
        this.ball.rotationAngle += 0.15;
        return;
      }
    }

    // Free ball physics
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.ball.z += this.ball.vz;

    // Spin effect (curl)
    this.ball.vx += this.ball.spinX;
    this.ball.vy += this.ball.spinY;
    this.ball.spinX *= 0.98;
    this.ball.spinY *= 0.98;

    // Weather-dependent Friction & Bounce Elasticity
    let groundFriction = 0.975;
    let bounceRestitution = 0.58;

    if (this.settings.weather === 'rain') {
      // Slick wet pitch: ball skids faster across ground (less rolling friction), but vertical bounce is lower & damp
      groundFriction = 0.986;
      bounceRestitution = 0.42;
    } else if (this.settings.weather === 'snow') {
      // Heavy cold snowpack: ball slows down quickly due to snow drag, low dead bounce
      groundFriction = 0.955;
      bounceRestitution = 0.35;
    } else if (this.settings.weather === 'night') {
      groundFriction = 0.978;
      bounceRestitution = 0.55;
    }

    const friction = this.ball.z > 0 ? 0.992 : groundFriction;
    this.ball.vx *= friction;
    this.ball.vy *= friction;

    // Gravity
    if (this.ball.z > 0) {
      this.ball.vz -= 0.35; // Gravity
    } else {
      // Ground bounce
      this.ball.z = 0;
      if (Math.abs(this.ball.vz) > 1.2) {
        this.ball.vz = -this.ball.vz * bounceRestitution;
        // Spawn ground impact splash / snow puff on bounce
        if (this.settings.weather === 'rain' || this.settings.weather === 'snow') {
          this.spawnTurfEffect(this.ball.x, this.ball.y, 4);
        }
        retroAudio.playKick(0.2);
      } else {
        this.ball.vz = 0;
      }
    }

    // Ball rotation based on ground movement
    const groundSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    this.ball.rotationAngle += groundSpeed * 0.08;

    // Goal detection
    this.checkGoalAndBoundaries();
  }

  private checkGoalAndBoundaries() {
    // Right Goal (Away goal defended by Away Team)
    if (this.ball.x >= PITCH_WIDTH - 40 && this.ball.y >= GOAL_Y_MIN && this.ball.y <= GOAL_Y_MAX && this.ball.z <= 70) {
      if (this.playState === 'in_play') {
        const lastScorer = (this.lastShooterId && this.homePlayers.find((p) => p.id === this.lastShooterId)) ||
          this.homePlayers.find((p) => p.id === this.userControlledPlayerHome?.id) ||
          this.homePlayers[9];
        this.triggerGoal(this.homeTeam.id, lastScorer.name, lastScorer.number, lastScorer.id);
      }
      this.ball.vx = Math.min(0, this.ball.vx * -0.3); // Bounce off net
      return;
    }

    // Left Goal (Home goal defended by Home Team)
    if (this.ball.x <= 40 && this.ball.y >= GOAL_Y_MIN && this.ball.y <= GOAL_Y_MAX && this.ball.z <= 70) {
      if (this.playState === 'in_play') {
        const lastScorer = (this.lastShooterId && this.awayPlayers.find((p) => p.id === this.lastShooterId)) ||
          this.awayPlayers.find((p) => p.id === this.userControlledPlayerAway?.id) ||
          this.awayPlayers[9];
        this.triggerGoal(this.awayTeam.id, lastScorer.name, lastScorer.number, lastScorer.id);
      }
      this.ball.vx = Math.max(0, this.ball.vx * -0.3);
      return;
    }

    // Post / Crossbar collisions
    this.checkGoalFrameCollisions();

    // Sideline / Goal-line boundaries
    if (this.playState === 'in_play') {
      if (this.ball.y < 35 || this.ball.y > PITCH_HEIGHT - 35) {
        // Throw-in
        this.ball.y = Math.max(45, Math.min(PITCH_HEIGHT - 45, this.ball.y));
        this.ball.vx *= -0.5;
        this.ball.vy *= -0.5;
      }
      if (this.ball.x < 35 || this.ball.x > PITCH_WIDTH - 35) {
        // Goal line out - bounce gently back in arcade mode
        this.ball.x = Math.max(45, Math.min(PITCH_WIDTH - 45, this.ball.x));
        this.ball.vx *= -0.5;
      }
    }
  }

  private checkGoalFrameCollisions() {
    const postRadius = 14;
    const posts = [
      { x: 45, y: GOAL_Y_MIN },
      { x: 45, y: GOAL_Y_MAX },
      { x: PITCH_WIDTH - 45, y: GOAL_Y_MIN },
      { x: PITCH_WIDTH - 45, y: GOAL_Y_MAX }
    ];

    posts.forEach((post) => {
      const d = Math.hypot(this.ball.x - post.x, this.ball.y - post.y);
      if (d < postRadius && this.ball.z <= 75) {
        this.ball.vx = -this.ball.vx * 0.75 + (Math.random() - 0.5) * 4;
        this.ball.vy = -this.ball.vy * 0.75 + (Math.random() - 0.5) * 4;
        retroAudio.playPostClang();
        this.showMessage('OFF THE POST!', 'CLATTERING WOODWORK', 'save', 70);

        this.captureHighlight(
          'OFF THE WOODWORK!',
          'Thunderous rocket strike rattles the goal frame!',
          'woodwork',
          this.ball.lastTouchTeamId === this.homeTeam.id ? this.homeTeam.name : this.awayTeam.name,
          80,
          180
        );

        const currentMinute = Math.min(90, Math.floor((this.matchClock / (this.settings.halfLengthSeconds * 2)) * 90) + 1);
        const hittingTeam = this.ball.lastTouchTeamId === this.homeTeam.id ? this.homeTeam : this.awayTeam;
        this.emitCommentary('woodwork', hittingTeam.name, hittingTeam.flag, currentMinute);
      }
    });
  }

  private checkPossessionAndCollisions() {
    if (this.playState === 'goal') return;

    const allPlayers = [...this.homePlayers, ...this.awayPlayers];
    const reachRadius = 26;

    allPlayers.forEach((p) => {
      if (p.hasRedCard || p.state === 'sliding' || p.state === 'tackled') return;

      const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
      if (d < reachRadius && this.ball.z < 25) {
        if (!this.ball.ownerId) {
          // Take possession
          this.ball.ownerId = p.id;
          this.ball.lastTouchTeamId = p.teamId;

          // Track possessor and assists sequence
          if (this.lastPossessorId !== p.id) {
            // If opposition intercepted, clear assist chain
            if (this.lastPasserTeamId && this.lastPasserTeamId !== p.teamId) {
              this.lastPasserId = null;
              this.lastPasserTeamId = null;
            }
            this.lastPossessorId = p.id;
          }

          // If human controlled, set as active
          if (p.teamId === this.homeTeam.id) {
            this.switchControlledPlayer(this.homeTeam.id, p);
          } else if (this.settings.twoPlayer) {
            this.switchControlledPlayer(this.awayTeam.id, p);
          }
        }
      }
    });
  }

  private updateNetPhysics() {
    // Left net mesh relax
    this.leftNetMesh.forEach((row) =>
      row.forEach((pt) => {
        pt.vx *= 0.85;
        pt.vy *= 0.85;
        pt.x += pt.vx;
        pt.y += pt.vy;
      })
    );
    // Right net mesh relax
    this.rightNetMesh.forEach((row) =>
      row.forEach((pt) => {
        pt.vx *= 0.85;
        pt.vy *= 0.85;
        pt.x += pt.vx;
        pt.y += pt.vy;
      })
    );
  }

  private updateCamera() {
    // Camera focuses between ball and controlled player
    const targetX = this.ball.x;
    const targetY = this.ball.y;

    this.cameraX += (targetX - this.cameraX) * 0.08;
    this.cameraY += (targetY - this.cameraY) * 0.08;
  }

  private recordReplayFrame() {
    const frame: ReplayFrame = {
      ball: { x: this.ball.x, y: this.ball.y, z: this.ball.z },
      players: [...this.homePlayers, ...this.awayPlayers].map((p) => ({
        id: p.id,
        teamId: p.teamId,
        x: p.x,
        y: p.y,
        facingAngle: p.facingAngle,
        state: p.state,
        animFrame: p.animFrame
      }))
    };

    this.replayBuffer.push(frame);
    if (this.replayBuffer.length > this.maxReplayFrames) {
      this.replayBuffer.shift();
    }
  }

  public startInstantReplay() {
    if (this.replayBuffer.length < 30) return;
    this.isReplayPlaying = true;
    this.replayIndex = 0;
  }

  public stopInstantReplay() {
    this.isReplayPlaying = false;
  }

  private updateReplayPlayback() {
    if (!this.isReplayPlaying || this.replayBuffer.length === 0) return;

    this.replayIndex = (this.replayIndex + 1) % this.replayBuffer.length;
    const frame = this.replayBuffer[this.replayIndex];

    this.ball.x = frame.ball.x;
    this.ball.y = frame.ball.y;
    this.ball.z = frame.ball.z;

    const all = [...this.homePlayers, ...this.awayPlayers];
    frame.players.forEach((fp) => {
      const p = all.find((pl) => pl.id === fp.id);
      if (p) {
        p.x = fp.x;
        p.y = fp.y;
        p.facingAngle = fp.facingAngle;
        p.state = fp.state;
        p.animFrame = fp.animFrame;
      }
    });

    this.cameraX = this.ball.x;
    this.cameraY = this.ball.y;
  }

  private getClosestPlayer(players: Player[], x: number, y: number): Player | null {
    let closest: Player | null = null;
    let minDist = Infinity;
    players.forEach((p) => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    });
    return closest;
  }
}
