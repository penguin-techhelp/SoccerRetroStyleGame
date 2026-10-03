import { PITCH_WIDTH, PITCH_HEIGHT, GOAL_Y_MIN, GOAL_Y_MAX, SoccerGameEngine } from './engine';
import { Player } from '../types/game';

export class SoccerRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false; // Authentic 16-bit pixel crispness
  }

  public render(engine: SoccerGameEngine, width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // Camera offset
    const zoom = Math.min(width / 1000, height / 650);
    const camX = engine.cameraX;
    const camY = engine.cameraY;

    ctx.save();
    // Center camera on screen
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    // 1. Draw Stadium Stands & Perimeter
    this.drawStadiumPerimeter(engine);

    // 2. Draw Pitch Surface (Stripes, Lines, Boxes)
    this.drawPitchSurface(engine);

    // 3. Draw Goal Nets & Posts
    this.drawGoalLeft(engine);
    this.drawGoalRight(engine);

    // 4. Draw Corner Flags
    this.drawCornerFlags(engine);

    // 5. Draw Shadows (Players & Ball)
    this.drawShadows(engine);

    // 6. Draw Players (Sorted by Y for correct isometric depth)
    const allPlayers = [...engine.homePlayers, ...engine.awayPlayers].sort((a, b) => a.y - b.y);
    allPlayers.forEach((p) => {
      this.drawPlayerSprite(p, engine);
    });

    // 7. Draw Ball (with Z altitude)
    this.drawBall(engine);

    // 8. Draw Weather Effects (Rain / Night Stadium Floodlights)
    this.drawWeather(engine);

    ctx.restore();

    // 9. Draw HUD (Radar Mini-Map, Charge Meters, Active Message Banners, Replay OSD)
    this.drawHUD(engine, width, height);
  }

  // --- Stadium Stands & Ad Boards ---
  private drawStadiumPerimeter(engine: SoccerGameEngine) {
    const ctx = this.ctx;

    // Outer Stadium Concrete / Crowd
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-200, -200, PITCH_WIDTH + 400, PITCH_HEIGHT + 400);

    // Grandstand crowd rows (Top & Bottom)
    this.drawCrowdRows(0, -140, PITCH_WIDTH, 140, engine);
    this.drawCrowdRows(0, PITCH_HEIGHT, PITCH_WIDTH, 140, engine);

    // LED Advertising Boards along sidelines
    const ads = ['★ SEGA-94 ★', '★ RETRO STRIKER ★', '★ CHIP-COLA ★', '★ PIXEL-16 ★', '★ MEGA SOCCER ★', '★ ARCADE PRO ★'];
    const boardHeight = 22;

    // Top ad board
    ctx.fillStyle = '#020617';
    ctx.fillRect(20, -24, PITCH_WIDTH - 40, boardHeight);
    ctx.fillStyle = '#fde047';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    for (let x = 120; x < PITCH_WIDTH - 60; x += 280) {
      const ad = ads[Math.floor(x / 280) % ads.length];
      ctx.fillText(ad, x, -9);
    }

    // Bottom ad board
    ctx.fillStyle = '#020617';
    ctx.fillRect(20, PITCH_HEIGHT + 2, PITCH_WIDTH - 40, boardHeight);
    ctx.fillStyle = '#38bdf8';
    for (let x = 120; x < PITCH_WIDTH - 60; x += 280) {
      const ad = ads[Math.floor((x + 140) / 280) % ads.length];
      ctx.fillText(ad, x, PITCH_HEIGHT + 17);
    }
  }

  private drawCrowdRows(x: number, y: number, w: number, h: number, engine: SoccerGameEngine) {
    const ctx = this.ctx;
    const colors = ['#dc2626', '#2563eb', '#eab308', '#16a34a', '#f8fafc', '#9333ea', '#ea580c'];

    // Tiered bench steps
    const stepH = 14;
    for (let rowY = y; rowY < y + h; rowY += stepH) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, rowY, w, 2);

      // Spectator pixel heads
      for (let px = x + 10; px < x + w - 10; px += 11) {
        const hash = Math.sin(px * 12.9898 + rowY * 78.233);
        const colIdx = Math.floor(Math.abs(hash * colors.length)) % colors.length;
        ctx.fillStyle = colors[colIdx];
        ctx.fillRect(px, rowY + 3, 7, 7);
        // Head
        ctx.fillStyle = '#fce0cd';
        ctx.fillRect(px + 1, rowY + 1, 5, 3);
      }
    }

    // Flash photography bulbs
    engine.crowdFlashes.forEach((f) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(f.x, f.y, 8 + f.life * 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // --- Pitch Lawn & Markings ---
  private drawPitchSurface(engine: SoccerGameEngine) {
    const ctx = this.ctx;

    // Grass stripes (alternating greens)
    const stripeWidth = 95;
    for (let x = 0; x < PITCH_WIDTH; x += stripeWidth) {
      const isEven = Math.floor(x / stripeWidth) % 2 === 0;
      ctx.fillStyle = isEven ? '#15803d' : '#16a34a';
      ctx.fillRect(x, 0, stripeWidth, PITCH_HEIGHT);
    }

    // White Pitch Lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'square';

    // Touchlines / Outer boundary
    const marginX = 40;
    const marginY = 40;
    const w = PITCH_WIDTH - marginX * 2;
    const h = PITCH_HEIGHT - marginY * 2;
    ctx.strokeRect(marginX, marginY, w, h);

    // Halfway Line
    const midX = PITCH_WIDTH / 2;
    ctx.beginPath();
    ctx.moveTo(midX, marginY);
    ctx.lineTo(midX, PITCH_HEIGHT - marginY);
    ctx.stroke();

    // Center Circle & Center Spot
    ctx.beginPath();
    ctx.arc(midX, PITCH_HEIGHT / 2, 100, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(midX, PITCH_HEIGHT / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Left Penalty Box (18-yard box)
    const boxW = 220;
    const boxH = 460;
    const boxY = (PITCH_HEIGHT - boxH) / 2;
    ctx.strokeRect(marginX, boxY, boxW, boxH);

    // Left 6-Yard Box
    const smallBoxW = 80;
    const smallBoxH = 220;
    const smallBoxY = (PITCH_HEIGHT - smallBoxH) / 2;
    ctx.strokeRect(marginX, smallBoxY, smallBoxW, smallBoxH);

    // Left Penalty Spot & Arc
    ctx.beginPath();
    ctx.arc(marginX + 150, PITCH_HEIGHT / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(marginX + 150, PITCH_HEIGHT / 2, 85, -0.7, 0.7);
    ctx.stroke();

    // Right Penalty Box
    ctx.strokeRect(PITCH_WIDTH - marginX - boxW, boxY, boxW, boxH);

    // Right 6-Yard Box
    ctx.strokeRect(PITCH_WIDTH - marginX - smallBoxW, smallBoxY, smallBoxW, smallBoxH);

    // Right Penalty Spot & Arc
    ctx.beginPath();
    ctx.arc(PITCH_WIDTH - marginX - 150, PITCH_HEIGHT / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(PITCH_WIDTH - marginX - 150, PITCH_HEIGHT / 2, 85, Math.PI - 0.7, Math.PI + 0.7);
    ctx.stroke();

    // Corner Kick Arcs
    const cornerR = 20;
    // Top-Left
    ctx.beginPath();
    ctx.arc(marginX, marginY, cornerR, 0, Math.PI / 2);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.arc(marginX, PITCH_HEIGHT - marginY, cornerR, -Math.PI / 2, 0);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.arc(PITCH_WIDTH - marginX, marginY, cornerR, Math.PI / 2, Math.PI);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.arc(PITCH_WIDTH - marginX, PITCH_HEIGHT - marginY, cornerR, Math.PI, Math.PI * 1.5);
    ctx.stroke();
  }

  // --- 3D Net & Goal Post Rendering ---
  private drawGoalLeft(engine: SoccerGameEngine) {
    const ctx = this.ctx;
    const goalX = 40;
    const netMesh = engine.leftNetMesh;

    // Draw flexible net mesh lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;

    // Horizontal lines
    for (let r = 0; r < netMesh.length; r++) {
      ctx.beginPath();
      for (let c = 0; c < netMesh[r].length; c++) {
        const pt = netMesh[r][c];
        if (c === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
    // Vertical lines
    for (let c = 0; c < netMesh[0].length; c++) {
      ctx.beginPath();
      for (let r = 0; r < netMesh.length; r++) {
        const pt = netMesh[r][c];
        if (r === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    // Goal Frame Posts & Crossbar
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(goalX, GOAL_Y_MIN);
    ctx.lineTo(goalX, GOAL_Y_MAX);
    ctx.stroke();

    // Top post cap
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(goalX - 3, GOAL_Y_MIN - 4, 8, 8);
    ctx.fillRect(goalX - 3, GOAL_Y_MAX - 4, 8, 8);
  }

  private drawGoalRight(engine: SoccerGameEngine) {
    const ctx = this.ctx;
    const goalX = PITCH_WIDTH - 40;
    const netMesh = engine.rightNetMesh;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;

    // Horizontal lines
    for (let r = 0; r < netMesh.length; r++) {
      ctx.beginPath();
      for (let c = 0; c < netMesh[r].length; c++) {
        const pt = netMesh[r][c];
        if (c === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
    // Vertical lines
    for (let c = 0; c < netMesh[0].length; c++) {
      ctx.beginPath();
      for (let r = 0; r < netMesh.length; r++) {
        const pt = netMesh[r][c];
        if (r === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    // Goal Frame
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(goalX, GOAL_Y_MIN);
    ctx.lineTo(goalX, GOAL_Y_MAX);
    ctx.stroke();

    // Caps
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(goalX - 5, GOAL_Y_MIN - 4, 8, 8);
    ctx.fillRect(goalX - 5, GOAL_Y_MAX - 4, 8, 8);
  }

  // --- Corner Flags ---
  private drawCornerFlags(engine: SoccerGameEngine) {
    const ctx = this.ctx;
    const corners = [
      { x: 40, y: 40 },
      { x: 40, y: PITCH_HEIGHT - 40 },
      { x: PITCH_WIDTH - 40, y: 40 },
      { x: PITCH_WIDTH - 40, y: PITCH_HEIGHT - 40 }
    ];

    const wave = Math.sin(engine.flagWaveTimer) * 4;

    corners.forEach((c) => {
      // Flag pole
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x, c.y - 20);
      ctx.stroke();

      // Flag banner (waving)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - 20);
      ctx.lineTo(c.x + 12 + wave, c.y - 15);
      ctx.lineTo(c.x, c.y - 10);
      ctx.closePath();
      ctx.fill();
    });
  }

  // --- Shadows ---
  private drawShadows(engine: SoccerGameEngine) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';

    // Player shadows
    [...engine.homePlayers, ...engine.awayPlayers].forEach((p) => {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 4, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ball dynamic shadow (shrinks and fades as altitude Z increases)
    const ball = engine.ball;
    const shadowScale = Math.max(0.4, 1 - ball.z / 180);
    const shadowAlpha = Math.max(0.08, 0.35 - (ball.z / 200) * 0.25);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y, 7 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 16-Bit Player Sprite ---
  private drawPlayerSprite(player: Player, engine: SoccerGameEngine) {
    const ctx = this.ctx;
    const isHome = player.teamId === engine.homeTeam.id;
    const team = isHome ? engine.homeTeam : engine.awayTeam;
    const isGK = player.role === 'GK';

    ctx.save();
    ctx.translate(player.x, player.y);

    // Kicking / Sliding offsets
    let bodyY = 0;
    if (player.state === 'sliding') {
      bodyY = 6;
      ctx.rotate(player.facingAngle);
      // Turf grass particles during slide
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(-16, -3, 3, 3);
      ctx.fillRect(-22, 2, 4, 3);
      ctx.fillRect(-28, -1, 3, 2);
    } else if (player.state === 'diving') {
      ctx.rotate(player.facingAngle);
      bodyY = 5;
    } else if (player.state === 'celebrating') {
      bodyY = -Math.abs(Math.sin(player.animTimer * 2)) * 6; // Jumping fist pump
    }

    const jerseyColor = isGK ? team.gkColor : team.primaryColor;
    const shortsColor = isGK ? '#1e293b' : team.secondaryColor;
    const sockColor = team.sockColor;

    // Legs animation
    const runFrame = player.animFrame;
    const legOffset1 = player.state === 'running' ? Math.sin(runFrame * 1.5) * 5 : 0;
    const legOffset2 = player.state === 'running' ? -Math.sin(runFrame * 1.5) * 5 : 0;

    // Socks & Boots
    ctx.fillStyle = sockColor;
    ctx.fillRect(-5, 4 + legOffset1 + bodyY, 3, 6);
    ctx.fillRect(2, 4 + legOffset2 + bodyY, 3, 6);

    ctx.fillStyle = '#090d16'; // Boots
    ctx.fillRect(-6, 9 + legOffset1 + bodyY, 5, 3);
    ctx.fillRect(1, 9 + legOffset2 + bodyY, 5, 3);

    // Shorts
    ctx.fillStyle = shortsColor;
    ctx.fillRect(-6, 0 + bodyY, 12, 6);

    // Jersey Body
    ctx.fillStyle = jerseyColor;
    ctx.fillRect(-7, -10 + bodyY, 14, 11);

    // Team Accent stripe / pattern
    if (team.stripeColor && !isGK) {
      ctx.fillStyle = team.stripeColor;
      ctx.fillRect(-2, -10 + bodyY, 4, 11);
    }

    // Number on back
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.number}`, 0, -4 + bodyY);

    // Arms
    ctx.fillStyle = player.skinTone;
    const armOffset = player.state === 'running' ? -legOffset1 * 0.8 : 0;
    ctx.fillRect(-9, -8 + armOffset + bodyY, 3, 7);
    ctx.fillRect(6, -8 - armOffset + bodyY, 3, 7);

    // Head
    ctx.fillStyle = player.skinTone;
    ctx.fillRect(-5, -19 + bodyY, 10, 9);

    // Hair
    ctx.fillStyle = player.hairColor;
    ctx.fillRect(-6, -21 + bodyY, 12, 4);
    if (player.hairStyle === 'curly') {
      ctx.fillRect(-7, -19 + bodyY, 2, 5);
      ctx.fillRect(5, -19 + bodyY, 2, 5);
    } else if (player.hairStyle === 'long') {
      ctx.fillRect(-6, -17 + bodyY, 2, 7);
      ctx.fillRect(4, -17 + bodyY, 2, 7);
    }

    // Yellow / Red Card badge if carded
    if (player.hasRedCard) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(6, -24, 5, 7);
    } else if (player.yellowCards > 0) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(6, -24, 5, 7);
    }

    // Active User Indicator (Retro Spinning/Bouncing Triangle)
    if (player.isControlled) {
      const isP1 = isHome;
      const markerColor = isP1 ? '#fde047' : '#38bdf8';
      const bounce = Math.sin(Date.now() / 150) * 3;

      // Triangle Marker
      ctx.fillStyle = markerColor;
      ctx.beginPath();
      ctx.moveTo(-6, -28 + bounce);
      ctx.lineTo(6, -28 + bounce);
      ctx.lineTo(0, -21 + bounce);
      ctx.closePath();
      ctx.fill();

      // Stamina Bar
      const stamPct = player.stamina / player.maxStamina;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, -34 + bounce, 24, 3);
      ctx.fillStyle = stamPct > 0.4 ? '#22c55e' : '#ef4444';
      ctx.fillRect(-12, -34 + bounce, 24 * stamPct, 3);

      // Player Name Kicker
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(player.name.toUpperCase(), 0, -38 + bounce);
    }

    ctx.restore();
  }

  // --- Ball Sprite ---
  private drawBall(engine: SoccerGameEngine) {
    const ctx = this.ctx;
    const b = engine.ball;
    const ballScreenY = b.y - b.z; // 3D height offset

    ctx.save();
    ctx.translate(b.x, ballScreenY);
    ctx.rotate(b.rotationAngle);

    // Ball Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // 16-bit 32-Panel Pentagons
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(-5, -2, 2, 2);
    ctx.fillRect(3, -2, 2, 2);
    ctx.fillRect(-2, 3, 2, 2);
    ctx.fillRect(-2, -5, 2, 2);

    ctx.restore();
  }

  // --- Weather Simulation (Rain streaks & Night floodlight ambiance) ---
  private drawWeather(engine: SoccerGameEngine) {
    const ctx = this.ctx;

    if (engine.settings.weather === 'rain') {
      ctx.strokeStyle = 'rgba(200, 230, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Render rain
      for (let i = 0; i < 180; i++) {
        const rx = (i * 97) % PITCH_WIDTH;
        const ry = ((i * 131) + Date.now() * 0.8) % PITCH_HEIGHT;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 14);
      }
      ctx.stroke();
    } else if (engine.settings.weather === 'night') {
      // Dark night atmospheric tint
      ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
      ctx.fillRect(-100, -100, PITCH_WIDTH + 200, PITCH_HEIGHT + 200);

      // Stadium floodlight cone highlights
      const grad = ctx.createRadialGradient(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 100, PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 700);
      grad.addColorStop(0, 'rgba(255, 255, 240, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);
    }
  }

  // --- HUD & Scoreboard ---
  private drawHUD(engine: SoccerGameEngine, w: number, h: number) {
    const ctx = this.ctx;

    // 1. Radar Mini-Map (Bottom Center)
    this.drawRadar(engine, w / 2 - 80, h - 75, 160, 65);

    // 2. Charge Meters (Shot / Pass Power Gauge)
    if (engine.isChargingShoot) {
      this.drawPowerGauge(w / 2 - 60, h - 90, 120, 10, engine.shootPower, 'SHOOT POWER');
    } else if (engine.isChargingPass) {
      this.drawPowerGauge(w / 2 - 60, h - 90, 120, 10, engine.passPower, 'PASS POWER');
    }

    // 3. Active Commentary Message Banner
    if (engine.activeMessage) {
      this.drawMessageBanner(engine.activeMessage, w, h);
    }

    // 4. Instant Replay Blinking VCR Overlay
    if (engine.isReplayPlaying) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, w, h);

      const blink = Math.floor(Date.now() / 400) % 2 === 0;
      ctx.fillStyle = '#ef4444';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      if (blink) {
        ctx.fillText('● REPLAY (0.5x)', 24, 70);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('[R] EXIT REPLAY', 24, 92);
    }
  }

  private drawRadar(engine: SoccerGameEngine, rx: number, ry: number, rw: number, rh: number) {
    const ctx = this.ctx;

    // Pitch frame
    ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);

    // Halfway line & center circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx + rw / 2, ry);
    ctx.lineTo(rx + rw / 2, ry + rh);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rx + rw / 2, ry + rh / 2, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Map function
    const toRadarX = (px: number) => rx + (px / PITCH_WIDTH) * rw;
    const toRadarY = (py: number) => ry + (py / PITCH_HEIGHT) * rh;

    // Home Players dots
    ctx.fillStyle = engine.homeTeam.primaryColor;
    engine.homePlayers.forEach((p) => {
      if (p.hasRedCard) return;
      ctx.fillRect(toRadarX(p.x) - 1.5, toRadarY(p.y) - 1.5, 3.5, 3.5);
    });

    // Away Players dots
    ctx.fillStyle = engine.awayTeam.primaryColor;
    engine.awayPlayers.forEach((p) => {
      if (p.hasRedCard) return;
      ctx.fillRect(toRadarX(p.x) - 1.5, toRadarY(p.y) - 1.5, 3.5, 3.5);
    });

    // Active User Ring
    if (engine.userControlledPlayerHome) {
      const p = engine.userControlledPlayerHome;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(toRadarX(p.x), toRadarY(p.y), 4.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Ball Dot
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(toRadarX(engine.ball.x) - 2, toRadarY(engine.ball.y) - 2, 4, 4);
  }

  private drawPowerGauge(x: number, y: number, w: number, h: number, power: number, label: string) {
    const ctx = this.ctx;

    // Border
    ctx.fillStyle = '#020617';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

    // Color gradient based on power
    const fillW = w * power;
    const barColor = power < 0.45 ? '#22c55e' : power < 0.8 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, fillW, h);

    // Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y - 5);
  }

  private drawMessageBanner(msg: { text: string; subtext?: string; type: string }, w: number, h: number) {
    const ctx = this.ctx;
    const bannerH = 70;
    const bannerY = h / 2 - bannerH / 2;

    // Banner Background with 16-bit Gold/Red bevels
    const isGoal = msg.type === 'goal';
    const isRedCard = msg.type === 'red_card';

    ctx.fillStyle = isGoal ? '#eab308' : isRedCard ? '#ef4444' : '#0f172a';
    ctx.fillRect(0, bannerY - 4, w, bannerH + 8);

    ctx.fillStyle = isGoal ? '#ca8a04' : isRedCard ? '#b91c1c' : '#1e293b';
    ctx.fillRect(0, bannerY, w, bannerH);

    // Text
    ctx.fillStyle = isGoal ? '#020617' : '#ffffff';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(msg.text, w / 2, bannerY + 34);

    if (msg.subtext) {
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillStyle = isGoal ? '#451a03' : '#94a3b8';
      ctx.fillText(msg.subtext, w / 2, bannerY + 54);
    }
  }
}
