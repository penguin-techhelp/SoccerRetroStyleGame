import { Ball, BannerMessage, FormationType, GoalEvent, MatchSettings, MatchStats, Player, PlayerActionState, ReplayFrame, Team } from '../types/game';
import { FORMATION_COORDS } from '../data/teams';
import { retroAudio } from '../audio/retroAudio';

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

  // Replay ring buffer
  private replayBuffer: ReplayFrame[] = [];
  private maxReplayFrames = 300;

  // Net simulation
  public leftNetMesh: NetPoint[][] = [];
  public rightNetMesh: NetPoint[][] = [];

  // Weather particles
  private rainDrops: { x: number; y: number; speed: number; len: number }[] = [];

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
    this.rainDrops = [];
    if (this.settings.weather === 'rain') {
      for (let i = 0; i < 220; i++) {
        this.rainDrops.push({
          x: Math.random() * PITCH_WIDTH,
          y: Math.random() * PITCH_HEIGHT,
          speed: 16 + Math.random() * 8,
          len: 12 + Math.random() * 8
        });
      }
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

  public triggerGoal(scoringTeamId: string, shooterName: string, shooterNumber: number) {
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

    const currentMinute = Math.min(90, Math.floor((this.matchClock / (this.settings.halfLengthSeconds * 2)) * 90) + 1);
    this.goalEvents.push({
      minute: currentMinute,
      scorerName: shooterName,
      scorerNumber: shooterNumber,
      teamId: scoringTeamId,
      teamName: isHome ? this.homeTeam.name : this.awayTeam.name
    });

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
    this.showMessage('GOOOOAAAL!', `${shooterName.toUpperCase()} #${shooterNumber}`, 'goal', 200);

    // Scoring team celebrates
    const scorers = isHome ? this.homePlayers : this.awayPlayers;
    scorers.forEach((p) => {
      p.state = 'celebrating';
      p.stateTimer = 180;
    });

    // Crowd flashbulbs frenzy
    for (let i = 0; i < 20; i++) {
      this.crowdFlashes.push({
        x: Math.random() * PITCH_WIDTH,
        y: Math.random() < 0.5 ? Math.random() * 60 : PITCH_HEIGHT - 60 + Math.random() * 60,
        life: 5 + Math.random() * 10
      });
    }
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

    // Weather simulation
    if (this.settings.weather === 'rain') {
      this.rainDrops.forEach((d) => {
        d.y += d.speed;
        d.x -= 2;
        if (d.y > PITCH_HEIGHT) {
          d.y = 0;
          d.x = Math.random() * PITCH_WIDTH;
        }
      });
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
    player.stateTimer = 35;
    const slideSpeed = 8.5 + (player.stats.tackle / 100) * 3;
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

    const isSevere = Math.random() < 0.45;
    if (isSevere) {
      fouler.yellowCards++;
      if (fouler.yellowCards >= 2) {
        fouler.hasRedCard = true;
        if (fouler.teamId === this.homeTeam.id) this.homeStats.redCards++;
        else this.awayStats.redCards++;
        this.showMessage('RED CARD!', `${fouler.name.toUpperCase()} SENT OFF`, 'red_card', 160);
      } else {
        if (fouler.teamId === this.homeTeam.id) this.homeStats.yellowCards++;
        else this.awayStats.yellowCards++;
        this.showMessage('YELLOW CARD', `${fouler.name.toUpperCase()} BOOKED`, 'yellow_card', 140);
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

    // Friction & Air drag
    const friction = this.ball.z > 0 ? 0.992 : 0.975;
    this.ball.vx *= friction;
    this.ball.vy *= friction;

    // Gravity
    if (this.ball.z > 0) {
      this.ball.vz -= 0.35; // Gravity
    } else {
      // Ground bounce
      this.ball.z = 0;
      if (Math.abs(this.ball.vz) > 1.2) {
        this.ball.vz = -this.ball.vz * 0.58;
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
        const lastScorer = this.homePlayers.find((p) => p.id === this.userControlledPlayerHome?.id) || this.homePlayers[9];
        this.triggerGoal(this.homeTeam.id, lastScorer.name, lastScorer.number);
      }
      this.ball.vx = Math.min(0, this.ball.vx * -0.3); // Bounce off net
      return;
    }

    // Left Goal (Home goal defended by Home Team)
    if (this.ball.x <= 40 && this.ball.y >= GOAL_Y_MIN && this.ball.y <= GOAL_Y_MAX && this.ball.z <= 70) {
      if (this.playState === 'in_play') {
        const lastScorer = this.awayPlayers.find((p) => p.id === this.userControlledPlayerAway?.id) || this.awayPlayers[9];
        this.triggerGoal(this.awayTeam.id, lastScorer.name, lastScorer.number);
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
