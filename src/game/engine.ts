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
  originX: number;
  originY: number;
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

  // Shot tracking for crowd reactions (missed shots, saves, woodwork)
  public shotActive: boolean = false;
  public shotTimer: number = 0;

  // Auto Mode (AI controls Home Team on behalf of player with seamless manual override)
  public autoPlay: boolean = false;
  public autoPlayUserOverrideTimer: number = 0;

  constructor(homeTeam: Team, awayTeam: Team, settings: MatchSettings) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.settings = settings;
    this.autoPlay = Boolean(settings.autoPlay);

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

    const isGopi = this.settings.performanceMode === 'gopi';
    const isEco = this.settings.performanceMode === 'eco' || isGopi;
    const rainCount = isGopi ? 45 : isEco ? 110 : 280;
    const snowCount = isGopi ? 35 : isEco ? 90 : 240;

    if (this.settings.weather === 'rain') {
      // Diagonal falling rain streaks
      for (let i = 0; i < rainCount; i++) {
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
      // Drifting snowflakes with sway
      for (let i = 0; i < snowCount; i++) {
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
    if (this.settings.performanceMode === 'gopi' && this.turfSplashes.length > 10) return;

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
    // 7x5 dense spring-damper mesh for realistic net depth and sag
    const rows = 7;
    const cols = 5;
    const goalXLeft = 45;
    const goalXRight = PITCH_WIDTH - 45;
    const depth = 65;

    this.leftNetMesh = [];
    for (let r = 0; r < rows; r++) {
      const row: NetPoint[] = [];
      const y = GOAL_Y_MIN + (r / (rows - 1)) * (GOAL_Y_MAX - GOAL_Y_MIN);
      for (let c = 0; c < cols; c++) {
        // Natural net sag and depth
        const x = goalXLeft - (c / (cols - 1)) * depth;
        row.push({ x, y, originX: x, originY: y, vx: 0, vy: 0 });
      }
      this.leftNetMesh.push(row);
    }

    this.rightNetMesh = [];
    for (let r = 0; r < rows; r++) {
      const row: NetPoint[] = [];
      const y = GOAL_Y_MIN + (r / (rows - 1)) * (GOAL_Y_MAX - GOAL_Y_MIN);
      for (let c = 0; c < cols; c++) {
        const x = goalXRight + (c / (cols - 1)) * depth;
        row.push({ x, y, originX: x, originY: y, vx: 0, vy: 0 });
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
        baseXPct: coord.xPct,
        baseYPct: coord.yPct,
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
        baseXPct: coord.xPct,
        baseYPct: coord.yPct,
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
      p.baseXPct = coord.xPct;
      p.baseYPct = coord.yPct;
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
      p.baseXPct = coord.xPct;
      p.baseYPct = coord.yPct;
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

  public showMessage(_text: string, _subtext?: string, _type?: BannerMessage['type'], _duration: number = 100) {
    this.activeMessage = null;
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

    // Find outfield player closest to the ball who does not have a red card
    const eligiblePlayers = list.filter((p) => p.role !== 'GK' && !p.hasRedCard);
    if (eligiblePlayers.length === 0) {
      if (teamId === this.homeTeam.id) this.userControlledPlayerHome = null;
      else this.userControlledPlayerAway = null;
      return;
    }

    let bestDist = Infinity;
    let bestPlayer = eligiblePlayers[0];
    eligiblePlayers.forEach((p) => {
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

    // Realistic localized net bulge impulse based on ball impact point & velocity
    const targetMesh = isHome ? this.rightNetMesh : this.leftNetMesh;
    const impactDir = isHome ? 1 : -1;
    const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);

    targetMesh.forEach((row) => {
      row.forEach((pt) => {
        const dist = Math.hypot(pt.originX - this.ball.x, pt.originY - this.ball.y);
        const force = Math.max(0, 1 - dist / 130) * Math.min(22, ballSpeed * 0.9 + 12);
        pt.vx += impactDir * force;
        pt.vy += (pt.originY - this.ball.y) * 0.08 * force;
      });
    });

    this.shotActive = false;
    this.shotTimer = 0;
    retroAudio.playRandomGoalCelebration();
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
      } else if (this.ball.lastTouchTeamId) {
        if (this.ball.lastTouchTeamId === this.homeTeam.id) {
          this.homeStats.possessionTimeSeconds += 1 / 60;
        } else {
          this.awayStats.possessionTimeSeconds += 1 / 60;
        }
      }

      // Half-time check
      if (this.matchClock >= halfLength && !this.isHalftime && this.matchClock < halfLength + 2) {
        this.isHalftime = true;
        this.showMessage('HALF TIME', `${this.homeScore} - ${this.awayScore}`, 'halftime', 240);
        retroAudio.playWhistle(true);
        this.emitCommentary('halftime', this.homeTeam.name, this.homeTeam.flag, 45);
      }

      // Full-time check
      if (this.matchClock >= totalMatchLength && !this.isFulltime) {
        this.isFulltime = true;
        this.showMessage('FULL TIME', `${this.homeScore} - ${this.awayScore}`, 'fulltime', 300);
        retroAudio.playWhistle(true);
        this.emitCommentary('fulltime', this.homeTeam.name, this.homeTeam.flag, 90);
      }
    }

    // Update active shot flight timer
    if (this.shotTimer > 0) {
      this.shotTimer--;
      if (this.shotTimer <= 0) {
        this.shotActive = false;
      }
    }

    // Update State timers for set pieces / goals
    if (this.playState !== 'in_play') {
      this.stateTimer--;
      if (this.playState === 'kickoff' && this.stateTimer <= 60) {
        this.playState = 'in_play';
      }
      if (this.playState === 'goal' && this.stateTimer <= 0) {
        // Kickoff to the team that conceded
        const concedingTeamId = this.ball.x > PITCH_WIDTH / 2 ? this.awayTeam.id : this.homeTeam.id;
        this.setupKickoff(concedingTeamId);
      }
    }

    // Update user manual override timer for Auto Mode
    if (this.autoPlayUserOverrideTimer > 0) {
      this.autoPlayUserOverrideTimer--;
    }

    // Process Player 1 Input or Auto-Play AI
    const isManualActive = this.autoPlayUserOverrideTimer > 0 || !this.autoPlay;
    if (isManualActive) {
      this.handlePlayerControl(this.homeTeam.id, this.userControlledPlayerHome, inputP1, false);
    } else {
      this.updateAutoPlayHome();
    }

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

    // Manual input override detection for Auto Mode
    const hasManualInput = input.up || input.down || input.left || input.right || input.pass || input.shoot || input.slide || input.sprint;
    if (hasManualInput && !isP2) {
      this.autoPlayUserOverrideTimer = 90; // Seamless manual takeover for 1.5s
    }

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
    if (this.playState === 'kickoff' && (input.pass || input.shoot || input.up || input.down || input.left || input.right || input.sprint || input.slide)) {
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
      if (tm.id === passer.id || tm.role === 'GK' || tm.hasRedCard) return;
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
    this.shotActive = true;
    this.shotTimer = 85;
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
        fouler.isControlled = false;
        if (this.ball.ownerId === fouler.id) {
          this.ball.ownerId = null;
        }
        fouler.yellowCards = Math.max(fouler.yellowCards, 1);
        if (fouler.teamId === this.homeTeam.id) this.homeStats.redCards++;
        else this.awayStats.redCards++;
        this.switchControlledPlayer(fouler.teamId);
        retroAudio.playRandomCrowdRedCardUproar();
        this.showMessage('RED CARD!', `${fouler.name.toUpperCase()} SENT OFF TO BENCH`, 'red_card', 160);
        this.emitCommentary('red_card', foulerTeam.name, foulerTeam.flag, currentMinute, fouler.name);
      } else {
        fouler.yellowCards++;
        if (fouler.teamId === this.homeTeam.id) this.homeStats.yellowCards++;
        else this.awayStats.yellowCards++;
        retroAudio.playRandomCrowdFoul();
        this.showMessage('YELLOW CARD', `${fouler.name.toUpperCase()} BOOKED`, 'yellow_card', 140);
        this.emitCommentary('yellow_card', foulerTeam.name, foulerTeam.flag, currentMinute, fouler.name);
      }
    } else {
      retroAudio.playRandomCrowdFoul();
      this.showMessage('REFEREE WHISTLE', 'FOUL AWARDED', 'foul', 100);
    }
  }

  /**
   * FC Mobile Dynamic Tactical Movement System
   * Keeps all outfield players in realistic, fluid, continuous motion.
   * Players dynamically shift with the ball, make forward runs, drop back to shield,
   * create passing triangles, mark opposing attackers, and never stand frozen in one spot.
   */
  private updateOffBallMovement(
    p: Player,
    teamId: string,
    isHome: boolean,
    hasTeamPossession: boolean,
    ballCarrier: Player | null
  ) {
    if (p.isControlled || p.hasRedCard || p.role === 'GK') return;

    const oppSquad = isHome ? this.awayPlayers : this.homePlayers;
    const sameSquad = isHome ? this.homePlayers : this.awayPlayers;

    // 1. Formation Anchor Position (computed dynamically from base formation percentages)
    const baseXPct = p.baseXPct ?? (p.role === 'DEF' ? 0.2 : p.role === 'MID' ? 0.38 : 0.65);
    const baseYPct = p.baseYPct ?? 0.5;

    const baseX = isHome
      ? 60 + baseXPct * (PITCH_WIDTH - 120)
      : PITCH_WIDTH - (60 + baseXPct * (PITCH_WIDTH - 120));
    const baseY = 80 + baseYPct * (PITCH_HEIGHT - 160);

    // 2. Ball progression & Pitch Compression (0.0 = left goal, 1.0 = right goal)
    const ballProgX = Math.max(0, Math.min(1, this.ball.x / PITCH_WIDTH));
    const ballOffsetY = this.ball.y - PITCH_HEIGHT / 2;

    let dynX = baseX;
    let dynY = baseY;
    let isSprintingRun = false;

    // Run clock unique to each player
    p.runPhaseTimer = (p.runPhaseTimer || 0) + 1;
    const runCycle = Math.sin(this.matchClock * 1.6 + p.number * 1.9);

    if (hasTeamPossession) {
      // ===== ATTACKING PHASE (TEAM HAS THE BALL) =====
      const attackDir = isHome ? 1 : -1;

      // Dynamic team push: entire squad shifts forward with ball progression
      if (isHome) {
        dynX += ballProgX * 220;
      } else {
        dynX -= (1 - ballProgX) * 220;
      }
      dynY += ballOffsetY * 0.35;

      // Role-specific attacking behaviors
      if (p.role === 'FWD') {
        // --- STRIKERS & FORWARDS ---
        dynX += attackDir * 140;

        // FC Mobile Attacking Run Triggers:
        // Every 3-4 seconds, forward makes an aggressive run behind defense or across the box
        if (runCycle > 0.12) {
          isSprintingRun = true;
          dynX += attackDir * 90;
          dynY = PITCH_HEIGHT / 2 + Math.sin(this.matchClock * 2.2 + p.number * 1.6) * 130;
        } else {
          // Check towards the ball carrier to offer a direct pass option
          if (ballCarrier) {
            dynX -= attackDir * 35;
            dynY = ballCarrier.y + (baseYPct > 0.5 ? 45 : -45);
          }
        }
      } else if (p.role === 'MID') {
        // --- MIDFIELDERS ---
        const isWideMid = baseYPct < 0.28 || baseYPct > 0.72;
        if (isWideMid) {
          // Wingers push high and wide to stretch opponent defense
          dynX += attackDir * 120;
          dynY = baseYPct < 0.5 ? 100 : PITCH_HEIGHT - 100;
          if (runCycle > 0.25) {
            isSprintingRun = true;
            dynX += attackDir * 75; // Wing overlap burst!
          }
        } else {
          // Central midfielders: dynamic passing triangles & support
          dynX += attackDir * 80;
          if (ballCarrier && ballCarrier.id !== p.id) {
            const distToCarrier = Math.hypot(p.x - ballCarrier.x, p.y - ballCarrier.y);
            // Ideal support distance is ~130 - 200px
            if (distToCarrier > 220) {
              dynX = ballCarrier.x + attackDir * (p.number % 2 === 0 ? 80 : -50);
              dynY = ballCarrier.y + (p.number % 2 === 0 ? 70 : -70);
            } else if (distToCarrier < 100) {
              const pushAngle = Math.atan2(p.y - ballCarrier.y, p.x - ballCarrier.x);
              dynX += Math.cos(pushAngle) * 60;
              dynY += Math.sin(pushAngle) * 60;
            }
          }
        }
      } else if (p.role === 'DEF') {
        // --- DEFENDERS ---
        const isFullback = baseYPct < 0.22 || baseYPct > 0.78;
        if (isFullback && runCycle > 0.4 && (isHome ? ballProgX > 0.42 : ballProgX < 0.58)) {
          // Modern overlapping fullback run!
          isSprintingRun = true;
          dynX += attackDir * 135;
          dynY = baseYPct < 0.5 ? 95 : PITCH_HEIGHT - 95;
        } else {
          // Center backs hold high defensive line at midfield to compress pitch
          const maxPush = isHome ? PITCH_WIDTH * 0.54 : PITCH_WIDTH * 0.46;
          dynX = isHome ? Math.min(maxPush, dynX + 70) : Math.max(maxPush, dynX - 70);
        }
      }
    } else {
      // ===== DEFENSIVE PHASE (OPPONENT HAS THE BALL) =====
      const ownGoalX = isHome ? 60 : PITCH_WIDTH - 60;
      const defDir = isHome ? -1 : 1;

      // Entire squad contracts towards own goal
      if (isHome) {
        dynX -= (1 - ballProgX) * 200;
      } else {
        dynX += ballProgX * 200;
      }
      dynY += ballOffsetY * 0.38;

      if (p.role === 'DEF') {
        // Defenders drop deep to shield the penalty box
        dynX += defDir * 110;
        // Center backs mark nearest opposing attacker goal-side
        const nearestAttacker = this.getClosestPlayer(
          oppSquad.filter((o) => !o.hasRedCard && o.role !== 'GK'),
          p.x,
          p.y
        );
        if (nearestAttacker) {
          const distToAttacker = Math.hypot(p.x - nearestAttacker.x, p.y - nearestAttacker.y);
          if (distToAttacker < 180) {
            // Position on goal-side of attacker
            const angleToGoal = Math.atan2(PITCH_HEIGHT / 2 - nearestAttacker.y, ownGoalX - nearestAttacker.x);
            dynX = nearestAttacker.x + Math.cos(angleToGoal) * 32;
            dynY = nearestAttacker.y + Math.sin(angleToGoal) * 32;
          }
        }
      } else if (p.role === 'MID') {
        // Midfielders drop back into a tight shield 60-120px in front of defense
        dynX += defDir * 80;
        // If ball carrier is nearby (< 130px), pinch in to help press/trap!
        if (this.ball.ownerId) {
          const oppCarrier = oppSquad.find((o) => o.id === this.ball.ownerId);
          if (oppCarrier && Math.hypot(p.x - oppCarrier.x, p.y - oppCarrier.y) < 130) {
            const trapAngle = Math.atan2(oppCarrier.y - p.y, oppCarrier.x - p.x);
            dynX = oppCarrier.x - Math.cos(trapAngle) * 35;
            dynY = oppCarrier.y - Math.sin(trapAngle) * 35;
          }
        }
      } else if (p.role === 'FWD') {
        // Forwards stay high near center line for counter attacks
        const counterLine = isHome ? PITCH_WIDTH * 0.38 : PITCH_WIDTH * 0.62;
        dynX = isHome ? Math.max(counterLine, dynX) : Math.min(counterLine, dynX);
      }
    }

    // 3. Spacing Repulsion: Avoid clumping with teammates
    sameSquad.forEach((tm) => {
      if (tm.id !== p.id && !tm.hasRedCard) {
        const distToTm = Math.hypot(p.x - tm.x, p.y - tm.y);
        if (distToTm < 38) {
          const repAngle = Math.atan2(p.y - tm.y, p.x - tm.x);
          dynX += Math.cos(repAngle) * 22;
          dynY += Math.sin(repAngle) * 22;
        }
      }
    });

    // 4. Pitch Boundary Clamping
    dynX = Math.max(65, Math.min(PITCH_WIDTH - 65, dynX));
    dynY = Math.max(55, Math.min(PITCH_HEIGHT - 55, dynY));

    // 5. Continuous FC Mobile Locomotive Dynamics (Active Footwork & Runs)
    const dx = dynX - p.x;
    const dy = dynY - p.y;
    const dist = Math.hypot(dx, dy);

    // Dynamic player speed based on stats & situation
    const baseStatSpeed = 3.2 + (p.stats.speed / 100) * 1.5;

    if (dist > 22) {
      // Dynamic run / sprint towards tactical position
      const moveSpeed = isSprintingRun
        ? Math.min(baseStatSpeed * 1.3, Math.max(3.2, dist * 0.085))
        : Math.min(baseStatSpeed, Math.max(2.4, dist * 0.07));

      p.vx = (dx / dist) * moveSpeed;
      p.vy = (dy / dist) * moveSpeed;
      p.facingAngle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
      p.state = 'running';
    } else {
      // FC Mobile Active Jockeying / Footwork: NEVER freeze at (0, 0)!
      // Continuous weight shifts, micro-steps, and jockeying towards the ball
      const footworkPulse = this.matchClock * 3.8 + p.number * 1.7;
      const swayX = Math.sin(footworkPulse) * 1.5;
      const swayY = Math.cos(footworkPulse * 0.95) * 1.5;
      const microSpeed = 1.4 + (p.stats.speed / 100) * 0.6;

      p.vx = (dx / (dist || 1)) * microSpeed * 0.6 + swayX;
      p.vy = (dy / (dist || 1)) * microSpeed * 0.6 + swayY;
      p.facingAngle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
      p.state = 'running';
    }
  }

  private updateOpponentAI() {
    const diff = this.settings.difficulty;
    const aiSpeedMult = diff === 'amateur' ? 0.78 : diff === 'semi-pro' ? 0.92 : 1.05;
    const awayHasBall = this.ball.ownerId ? this.awayPlayers.some((p) => p.id === this.ball.ownerId) : false;
    const awayBallCarrier = awayHasBall ? this.awayPlayers.find((p) => p.id === this.ball.ownerId) || null : null;

    // Rank outfield away players by distance to ball
    const outfieldAway = this.awayPlayers.filter((p) => !p.hasRedCard && p.role !== 'GK');
    const rankedAway = [...outfieldAway].sort(
      (a, b) => Math.hypot(a.x - this.ball.x, a.y - this.ball.y) - Math.hypot(b.x - this.ball.x, b.y - this.ball.y)
    );
    const closestAway = rankedAway[0];
    const secondClosestAway = rankedAway[1];

    outfieldAway.forEach((p) => {
      const hasBall = this.ball.ownerId === p.id;

      if (hasBall) {
        // AI BALL CARRIER (ATTACK TOWARDS LEFT GOAL X = 60)
        const targetX = 60;
        const targetY = PITCH_HEIGHT / 2;
        const distToGoal = Math.hypot(p.x - targetX, p.y - targetY);

        // Check if there is an open teammate in a better position
        const teammatesAhead = outfieldAway.filter(
          (tm) => tm.id !== p.id && tm.x < p.x - 40 && Math.abs(tm.y - p.y) < 280
        );

        if (distToGoal < 380 && Math.random() < (diff === 'world-class' ? 0.08 : 0.04)) {
          // Shoot!
          this.executeShot(p, 0.7 + Math.random() * 0.3);
        } else if (teammatesAhead.length > 0 && Math.random() < 0.035) {
          // Tactical pass to open teammate making a run
          this.executePass(p, 0.45 + Math.random() * 0.35);
        } else {
          // Dribble towards goal with evasive slalom around defenders
          let angle = Math.atan2(targetY - p.y, targetX - p.x);

          // Dodge nearby home defenders
          const closeDefender = this.getClosestPlayer(
            this.homePlayers.filter((h) => !h.hasRedCard),
            p.x,
            p.y
          );
          if (closeDefender && Math.hypot(p.x - closeDefender.x, p.y - closeDefender.y) < 70) {
            const dodgeAngle = closeDefender.y > p.y ? -0.7 : 0.7;
            angle += dodgeAngle;
          }

          p.vx = Math.cos(angle) * (3.8 * aiSpeedMult);
          p.vy = Math.sin(angle) * (3.8 * aiSpeedMult);
          p.facingAngle = angle;
          p.state = 'running';
        }
      } else if (!awayHasBall && closestAway && p.id === closestAway.id) {
        // PRIMARY BALL CHASER (PRESSING DEFENDER)
        const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
        const angle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
        p.vx = Math.cos(angle) * (4.2 * aiSpeedMult);
        p.vy = Math.sin(angle) * (4.2 * aiSpeedMult);
        p.facingAngle = angle;
        p.state = 'running';

        // Slide tackle when close to opponent with ball
        if (distToBall < 45 && this.ball.ownerId && Math.random() < (diff === 'world-class' ? 0.09 : 0.03)) {
          this.executeSlideTackle(p);
        }
      } else if (!awayHasBall && secondClosestAway && p.id === secondClosestAway.id) {
        // SECONDARY PRESSER (COVERING DEFENDER)
        const goalCenter = { x: PITCH_WIDTH - 60, y: PITCH_HEIGHT / 2 };
        const blockX = this.ball.x + (goalCenter.x - this.ball.x) * 0.25;
        const blockY = this.ball.y + (goalCenter.y - this.ball.y) * 0.25;
        const dx = blockX - p.x;
        const dy = blockY - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 15) {
          p.vx = (dx / dist) * (3.4 * aiSpeedMult);
          p.vy = (dy / dist) * (3.4 * aiSpeedMult);
          p.facingAngle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
          p.state = 'running';
        } else {
          p.vx = Math.cos(this.matchClock * 3) * 1.2;
          p.vy = Math.sin(this.matchClock * 3) * 1.2;
          p.facingAngle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
          p.state = 'running';
        }
      } else {
        // ALL OTHER AWAY PLAYERS: FULL FC MOBILE DYNAMIC TACTICAL MOVEMENT!
        this.updateOffBallMovement(p, this.awayTeam.id, false, awayHasBall, awayBallCarrier);
      }
    });

    // Goalkeeper AI
    const awayGK = this.awayPlayers.find((p) => p.role === 'GK');
    if (awayGK) this.updateGoalkeeper(awayGK, PITCH_WIDTH - 60, true);

    const homeGK = this.homePlayers.find((p) => p.role === 'GK');
    if (homeGK) this.updateGoalkeeper(homeGK, 60, false);
  }

  public setAutoPlay(enabled: boolean) {
    this.autoPlay = enabled;
    if (enabled) {
      this.autoPlayUserOverrideTimer = 0;
    }
  }

  /**
   * Autonomous AI Control for Player's Team (Auto Mode)
   * Drives the active home player with tactical intelligence: shooting, passing,
   * dribbling around defenders, and pressing/tackling when defending.
   */
  private updateAutoPlayHome() {
    const homeHasBall = this.ball.ownerId ? this.homePlayers.some((p) => p.id === this.ball.ownerId) : false;
    const homeBallCarrier = homeHasBall ? this.homePlayers.find((p) => p.id === this.ball.ownerId) || null : null;

    // Outfield home players
    const outfieldHome = this.homePlayers.filter((p) => !p.hasRedCard && p.role !== 'GK');
    const rankedHome = [...outfieldHome].sort(
      (a, b) => Math.hypot(a.x - this.ball.x, a.y - this.ball.y) - Math.hypot(b.x - this.ball.x, b.y - this.ball.y)
    );
    const closestHome = rankedHome[0];

    // Ensure user controlled player follows the active AI actor
    if (homeBallCarrier && (!this.userControlledPlayerHome || this.userControlledPlayerHome.id !== homeBallCarrier.id)) {
      this.switchControlledPlayer(this.homeTeam.id, homeBallCarrier);
    } else if (!homeHasBall && closestHome && (!this.userControlledPlayerHome || this.userControlledPlayerHome.id !== closestHome.id)) {
      this.switchControlledPlayer(this.homeTeam.id, closestHome);
    }

    const activePlayer = this.userControlledPlayerHome;
    if (!activePlayer || activePlayer.hasRedCard) return;

    // Start in-play from kickoff automatically
    if (this.playState === 'kickoff') {
      if (this.stateTimer < 100) {
        this.playState = 'in_play';
        if (activePlayer && this.ball.ownerId === activePlayer.id) {
          const teammate = outfieldHome.find((tm) => tm.id !== activePlayer.id);
          if (teammate) {
            this.executePass(activePlayer, 0.45);
          }
        }
      }
      return;
    }

    const hasBall = this.ball.ownerId === activePlayer.id;

    if (hasBall) {
      // ATTACK TOWARDS RIGHT GOAL (X = PITCH_WIDTH - 60)
      const targetX = PITCH_WIDTH - 60;
      const targetY = PITCH_HEIGHT / 2;
      const distToGoal = Math.hypot(activePlayer.x - targetX, activePlayer.y - targetY);

      // Check for teammates ahead making a run
      const teammatesAhead = outfieldHome.filter(
        (tm) => tm.id !== activePlayer.id && tm.x > activePlayer.x + 35 && Math.abs(tm.y - activePlayer.y) < 280
      );

      // Shoot when in range
      if (distToGoal < 370 && Math.random() < 0.06) {
        this.executeShot(activePlayer, 0.75 + Math.random() * 0.25);
      } else if (teammatesAhead.length > 0 && Math.random() < 0.04) {
        // Tactical pass to open teammate
        this.executePass(activePlayer, 0.45 + Math.random() * 0.35);
      } else {
        // Dynamic dribble with obstacle avoidance
        let angle = Math.atan2(targetY - activePlayer.y, targetX - activePlayer.x);

        // Dodge nearby away defenders
        const closeDefender = this.getClosestPlayer(
          this.awayPlayers.filter((a) => !a.hasRedCard),
          activePlayer.x,
          activePlayer.y
        );
        if (closeDefender && Math.hypot(activePlayer.x - closeDefender.x, activePlayer.y - closeDefender.y) < 65) {
          const dodgeAngle = closeDefender.y > activePlayer.y ? -0.7 : 0.7;
          angle += dodgeAngle;
        }

        activePlayer.vx = Math.cos(angle) * 4.2;
        activePlayer.vy = Math.sin(angle) * 4.2;
        activePlayer.facingAngle = angle;
        activePlayer.state = 'running';
      }
    } else {
      // DEFENDING OR CHASING LOOSE BALL
      const distToBall = Math.hypot(activePlayer.x - this.ball.x, activePlayer.y - this.ball.y);
      const angle = Math.atan2(this.ball.y - activePlayer.y, this.ball.x - activePlayer.x);

      activePlayer.vx = Math.cos(angle) * 4.4;
      activePlayer.vy = Math.sin(angle) * 4.4;
      activePlayer.facingAngle = angle;
      activePlayer.state = 'running';

      // Slide tackle when close to opponent with ball
      if (distToBall < 46 && this.ball.ownerId && Math.random() < 0.05) {
        this.executeSlideTackle(activePlayer);
      }
    }
  }

  private updateTeammateAI(teamId: string) {
    const isHome = teamId === this.homeTeam.id;
    const squad = isHome ? this.homePlayers : this.awayPlayers;
    const hasTeamPossession = this.ball.ownerId
      ? squad.some((p) => p.id === this.ball.ownerId)
      : this.ball.lastTouchTeamId === teamId;
    const ballCarrier = hasTeamPossession
      ? squad.find((p) => p.id === this.ball.ownerId) || null
      : null;

    // Outfield players ranked by distance to ball
    const outfield = squad.filter((p) => !p.hasRedCard && p.role !== 'GK');
    const ranked = [...outfield].sort(
      (a, b) => Math.hypot(a.x - this.ball.x, a.y - this.ball.y) - Math.hypot(b.x - this.ball.x, b.y - this.ball.y)
    );
    const closest = ranked[0];
    const secondClosest = ranked[1];

    outfield.forEach((p) => {
      // If user is controlling this player, user controls them
      if (p.isControlled) return;

      const hasBall = this.ball.ownerId === p.id;

      if (hasBall) {
        // AI Teammate has ball (when player switches or in CPU match)
        const targetX = isHome ? PITCH_WIDTH - 60 : 60;
        const targetY = PITCH_HEIGHT / 2;
        const distToGoal = Math.hypot(p.x - targetX, p.y - targetY);

        if (distToGoal < 360 && Math.random() < 0.05) {
          this.executeShot(p, 0.75 + Math.random() * 0.25);
        } else if (Math.random() < 0.03) {
          this.executePass(p, 0.5 + Math.random() * 0.3);
        } else {
          const angle = Math.atan2(targetY - p.y, targetX - p.x);
          p.vx = Math.cos(angle) * 3.8;
          p.vy = Math.sin(angle) * 3.8;
          p.facingAngle = angle;
          p.state = 'running';
        }
      } else if (!hasTeamPossession && closest && p.id === closest.id) {
        // Closest defender on Home team presses the ball!
        const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
        const angle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
        p.vx = Math.cos(angle) * 4.0;
        p.vy = Math.sin(angle) * 4.0;
        p.facingAngle = angle;
        p.state = 'running';

        // Auto tackle if opponent is carrying ball nearby
        if (distToBall < 42 && this.ball.ownerId && Math.random() < 0.04) {
          this.executeSlideTackle(p);
        }
      } else if (!hasTeamPossession && secondClosest && p.id === secondClosest.id) {
        // 2nd closest defender provides cover/containment
        const goalCenter = { x: isHome ? 60 : PITCH_WIDTH - 60, y: PITCH_HEIGHT / 2 };
        const blockX = this.ball.x + (goalCenter.x - this.ball.x) * 0.28;
        const blockY = this.ball.y + (goalCenter.y - this.ball.y) * 0.28;
        const dx = blockX - p.x;
        const dy = blockY - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 15) {
          p.vx = (dx / dist) * 3.4;
          p.vy = (dy / dist) * 3.4;
          p.facingAngle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
          p.state = 'running';
        } else {
          p.vx = Math.cos(this.matchClock * 2.8) * 1.2;
          p.vy = Math.sin(this.matchClock * 2.8) * 1.2;
          p.facingAngle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
          p.state = 'running';
        }
      } else {
        // ALL OTHER TEAMMATES: DYNAMIC FC MOBILE OFF-BALL RUNS & PASSING SUPPORT!
        this.updateOffBallMovement(p, teamId, isHome, hasTeamPossession, ballCarrier);
      }
    });
  }

  private updateGoalkeeper(gk: Player, goalX: number, isRightGoal: boolean) {
    // Keep within penalty box mouth with active footwork and angle narrowing
    const targetY = Math.max(GOAL_Y_MIN + 25, Math.min(GOAL_Y_MAX - 25, this.ball.y));

    // Dynamic keeper positioning: advance off line towards ball when ball is in attacking half
    const ballInHalf = isRightGoal ? this.ball.x > PITCH_WIDTH / 2 : this.ball.x < PITCH_WIDTH / 2;
    const distToGoalX = isRightGoal ? PITCH_WIDTH - this.ball.x : this.ball.x;
    const advanceOffset = ballInHalf ? Math.min(45, Math.max(10, (500 - distToGoalX) * 0.08)) : 0;
    const targetX = isRightGoal ? goalX - advanceOffset : goalX + advanceOffset;

    // Move smoothly along goal area
    const dy = targetY - gk.y;
    const dx = targetX - gk.x;

    // Keeper micro-bounce (always active on toes)
    const keeperFootwork = Math.sin(this.matchClock * 4.0) * 1.5;

    if (Math.abs(dy) > 4) {
      gk.vy = Math.sign(dy) * 3.6;
      gk.state = 'running';
    } else {
      gk.vy = keeperFootwork;
      gk.state = 'running';
    }
    gk.vx = Math.sign(dx) * Math.min(Math.abs(dx) * 0.1, 2.0);
    gk.facingAngle = Math.atan2(this.ball.y - gk.y, this.ball.x - gk.x);

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
        this.shotActive = false;
        this.shotTimer = 0;

        retroAudio.playRandomCrowdSave();
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
    if (p.hasRedCard) {
      // Sent off: walk off the pitch to the team bench dugout on the sideline!
      const isHome = p.teamId === this.homeTeam.id;
      const squad = isHome ? this.homePlayers : this.awayPlayers;
      const redCardIndex = squad.filter((m) => m.hasRedCard).indexOf(p);
      const benchOffset = Math.max(0, redCardIndex) * 16;

      const benchX = isHome ? PITCH_WIDTH / 2 - 160 - benchOffset : PITCH_WIDTH / 2 + 160 + benchOffset;
      const benchY = PITCH_HEIGHT + 34;

      const dx = benchX - p.x;
      const dy = benchY - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        // Walking off the pitch to the team bench
        const walkSpeed = 2.4;
        p.vx = (dx / dist) * walkSpeed;
        p.vy = (dy / dist) * walkSpeed;
        p.x += p.vx;
        p.y += p.vy;
        p.facingAngle = Math.atan2(dy, dx);
        p.state = 'running';
        p.animTimer += 0.08;
        p.animFrame = Math.floor(p.animTimer) % 4;
      } else {
        // Seated on the bench in the dugout
        p.vx = 0;
        p.vy = 0;
        p.x = benchX;
        p.y = benchY;
        p.facingAngle = -Math.PI / 2; // Facing the pitch
        p.state = 'idle';
        p.animFrame = 0;
      }
      return;
    }

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

    // Dynamic state & animation stride progression based on real speed
    const speed = Math.hypot(p.vx, p.vy);
    if (p.state !== 'sliding' && p.state !== 'diving' && p.state !== 'kicking' && p.state !== 'tackled' && p.state !== 'celebrating') {
      p.state = speed > 0.3 ? 'running' : 'idle';
    }

    if (p.state === 'running') {
      p.animTimer += Math.max(0.12, Math.min(0.38, speed * 0.065));
      p.animFrame = Math.floor(p.animTimer) % 4;
    } else {
      p.animTimer += 0.05;
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
          this.homePlayers[9] ||
          this.homePlayers[0];
        if (lastScorer) {
          this.triggerGoal(this.homeTeam.id, lastScorer.name, lastScorer.number, lastScorer.id);
        }
      }
      this.ball.vx = Math.min(0, this.ball.vx * -0.3); // Bounce off net
      return;
    }

    // Left Goal (Home goal defended by Home Team)
    if (this.ball.x <= 40 && this.ball.y >= GOAL_Y_MIN && this.ball.y <= GOAL_Y_MAX && this.ball.z <= 70) {
      if (this.playState === 'in_play') {
        const lastScorer = (this.lastShooterId && this.awayPlayers.find((p) => p.id === this.lastShooterId)) ||
          this.awayPlayers.find((p) => p.id === this.userControlledPlayerAway?.id) ||
          this.awayPlayers[9] ||
          this.awayPlayers[0];
        if (lastScorer) {
          this.triggerGoal(this.awayTeam.id, lastScorer.name, lastScorer.number, lastScorer.id);
        }
      }
      this.ball.vx = Math.max(0, this.ball.vx * -0.3);
      return;
    }

    // Post / Crossbar collisions
    this.checkGoalFrameCollisions();

    // Near miss / Missed shot crowd reaction
    if (this.playState === 'in_play' && this.shotActive) {
      const pastLeftGoalLine = this.ball.x <= 55 && (this.ball.y < GOAL_Y_MIN || this.ball.y > GOAL_Y_MAX || this.ball.z > 70);
      const pastRightGoalLine = this.ball.x >= PITCH_WIDTH - 55 && (this.ball.y < GOAL_Y_MIN || this.ball.y > GOAL_Y_MAX || this.ball.z > 70);
      if (pastLeftGoalLine || pastRightGoalLine) {
        this.shotActive = false;
        this.shotTimer = 0;
        retroAudio.playRandomCrowdMissedShot();
        this.showMessage('MISSED CHANCE!', 'JUST WIDE OF THE POST!', 'whistle', 65);
      }
    }

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
        this.shotActive = false;
        this.shotTimer = 0;
        retroAudio.playRandomCrowdWoodwork();
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
    const k = 0.16;       // Spring tension constant
    const damping = 0.85; // Air and cloth damping
    const ballPushRadius = 26;

    const updateMesh = (mesh: NetPoint[][], isLeftGoal: boolean) => {
      mesh.forEach((row, r) => {
        row.forEach((pt, c) => {
          // Anchored posts: front top and bottom posts stay fixed
          const isFrontPostAnchor = (c === 0 && (r === 0 || r === mesh.length - 1));
          if (isFrontPostAnchor) {
            pt.x = pt.originX;
            pt.y = pt.originY;
            pt.vx = 0;
            pt.vy = 0;
            return;
          }

          // Dynamic ball interaction: if ball pushes into net
          const distToBall = Math.hypot(this.ball.x - pt.x, this.ball.y - pt.y);
          if (distToBall < ballPushRadius && this.ball.z < 65) {
            const overlap = (ballPushRadius - distToBall) / ballPushRadius;
            const pushDirX = isLeftGoal ? -1 : 1;
            pt.vx += (this.ball.vx * 0.35 + pushDirX * 3.5) * overlap;
            pt.vy += (this.ball.vy * 0.35 + (pt.y - this.ball.y) * 0.1) * overlap;
          }

          // Hooke's Law spring back towards rest origin
          const fx = (pt.originX - pt.x) * k;
          const fy = (pt.originY - pt.y) * k;
          pt.vx = (pt.vx + fx) * damping;
          pt.vy = (pt.vy + fy) * damping;
          pt.x += pt.vx;
          pt.y += pt.vy;
        });
      });
    };

    updateMesh(this.leftNetMesh, true);
    updateMesh(this.rightNetMesh, false);
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
