import { PITCH_WIDTH, PITCH_HEIGHT, GOAL_Y_MIN, GOAL_Y_MAX, SoccerGameEngine } from './engine';
import { Player, ReplayFrame } from '../types/game';

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
    const weather = engine.settings.weather;

    // Grass stripes (alternating greens based on weather conditions)
    const stripeWidth = 95;
    for (let x = 0; x < PITCH_WIDTH; x += stripeWidth) {
      const isEven = Math.floor(x / stripeWidth) % 2 === 0;

      if (weather === 'snow') {
        // Cold frosted winter turf
        ctx.fillStyle = isEven ? '#335e49' : '#3c6e56';
      } else if (weather === 'rain') {
        // Wet saturated slick turf
        ctx.fillStyle = isEven ? '#125c2d' : '#166c35';
      } else {
        // Crisp standard sunny/night lawn
        ctx.fillStyle = isEven ? '#15803d' : '#16a34a';
      }
      ctx.fillRect(x, 0, stripeWidth, PITCH_HEIGHT);
    }

    // Snow Dusting along sidelines and behind goals
    if (weather === 'snow') {
      ctx.fillStyle = 'rgba(240, 248, 255, 0.45)';
      // Top and bottom touchline snow edges
      ctx.fillRect(0, 0, PITCH_WIDTH, 42);
      ctx.fillRect(0, PITCH_HEIGHT - 42, PITCH_WIDTH, 42);
      // Left and right goal side snow dust
      ctx.fillRect(0, 0, 42, PITCH_HEIGHT);
      ctx.fillRect(PITCH_WIDTH - 42, 0, 42, PITCH_HEIGHT);

      // Frosty patches in corner arcs
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(40, 40, 30, 20);
      ctx.fillRect(PITCH_WIDTH - 70, 40, 30, 20);
      ctx.fillRect(40, PITCH_HEIGHT - 60, 30, 20);
      ctx.fillRect(PITCH_WIDTH - 70, PITCH_HEIGHT - 60, 30, 20);
    }

    // White Pitch Lines
    ctx.strokeStyle = weather === 'snow' ? '#ffffff' : '#ffffff';
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
    const isSnow = engine.settings.weather === 'snow';
    const ballScreenY = b.y - b.z; // 3D height offset

    ctx.save();
    ctx.translate(b.x, ballScreenY);
    ctx.rotate(b.rotationAngle);

    // Ball Body (Classic 90s High-Visibility Orange ball in snow matches!)
    ctx.fillStyle = isSnow ? '#f97316' : '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // 16-bit 32-Panel Pentagons
    ctx.fillStyle = isSnow ? '#0f172a' : '#090d16';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(-5, -2, 2, 2);
    ctx.fillRect(3, -2, 2, 2);
    ctx.fillRect(-2, 3, 2, 2);
    ctx.fillRect(-2, -5, 2, 2);

    ctx.restore();
  }

  // --- Weather Simulation (Rain streaks, Snow flakes, Turf splashes & Night floodlights) ---
  private drawWeather(engine: SoccerGameEngine) {
    const ctx = this.ctx;
    const weather = engine.settings.weather;

    // 1. Draw Ground Turf Sprays & Puddle Splashes
    if (engine.turfSplashes.length > 0) {
      engine.turfSplashes.forEach((s) => {
        const alpha = Math.max(0, s.life / s.maxLife);
        ctx.fillStyle = s.color.replace('0.8', `${alpha * 0.8}`).replace('0.95', `${alpha * 0.95}`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 + (1 - alpha) * 0.5), 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 2. Draw Falling Weather Particles (Rain / Snow)
    if (weather === 'rain') {
      ctx.lineWidth = 1.4;
      engine.weatherParticles.forEach((p) => {
        ctx.strokeStyle = `rgba(195, 225, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (p.vx || -4) * 0.9, p.y + (p.vy || 20) * 0.9);
        ctx.stroke();
      });
    } else if (weather === 'snow') {
      engine.weatherParticles.forEach((p) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        // Pixelated snowflake squares
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    } else if (weather === 'night') {
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

  public renderHighlightFrame(
    engine: SoccerGameEngine,
    frame: ReplayFrame,
    width: number,
    height: number,
    clipTitle: string,
    clipMinute: number,
    clipType: 'goal' | 'save' | 'woodwork',
    isSlowMo: boolean,
    clipIndex: number,
    totalClips: number,
    progress: number
  ) {
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // Apply frame positions to engine objects
    engine.ball.x = frame.ball.x;
    engine.ball.y = frame.ball.y;
    engine.ball.z = frame.ball.z;

    const all = [...engine.homePlayers, ...engine.awayPlayers];
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

    engine.cameraX = frame.ball.x;
    engine.cameraY = frame.ball.y;

    const zoom = Math.min(width / 750, height / 450);
    const camX = engine.cameraX;
    const camY = engine.cameraY;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    // 1. Stands & perimeter
    this.drawStadiumPerimeter(engine);
    // 2. Pitch
    this.drawPitchSurface(engine);
    // 3. Goal nets
    this.drawGoalLeft(engine);
    this.drawGoalRight(engine);
    // 4. Flags
    this.drawCornerFlags(engine);
    // 5. Shadows
    this.drawShadows(engine);

    // 6. Players sorted by Y
    const sortedPlayers = [...engine.homePlayers, ...engine.awayPlayers].sort((a, b) => a.y - b.y);
    sortedPlayers.forEach((p) => {
      this.drawPlayerSprite(p, engine);
    });

    // 7. Ball
    this.drawBall(engine);

    // 8. Weather
    this.drawWeather(engine);

    ctx.restore();

    // 9. Retro Highlight Broadcast Overlay (16-bit TV style)
    this.drawHighlightOSD(width, height, clipTitle, clipMinute, clipType, isSlowMo, clipIndex, totalClips, progress);
  }

  private drawHighlightOSD(
    w: number,
    h: number,
    title: string,
    minute: number,
    type: 'goal' | 'save' | 'woodwork',
    isSlowMo: boolean,
    clipIndex: number,
    totalClips: number,
    progress: number
  ) {
    const ctx = this.ctx;

    // Scanlines effect for CRT television look
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    // Top Broadcast Bar
    ctx.fillStyle = 'rgba(2, 6, 23, 0.90)';
    ctx.fillRect(0, 0, w, 28);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 27, w, 1.5);

    // Blinking REC dot
    const blink = Math.floor(Date.now() / 350) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(14, 14, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('REC ● HIGHLIGHT', 24, 18);

    // Moment indicator
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    ctx.fillText(`MOMENT ${clipIndex + 1} OF ${totalClips}`, w / 2, 18);

    // Channel / Time
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillText(`CH-94 · ${minute}'`, w - 12, 18);

    // Bottom Lower-Third Banner
    const bannerH = 34;
    const bannerY = h - bannerH - 8;

    ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
    ctx.fillRect(8, bannerY, w - 16, bannerH);
    ctx.strokeStyle = type === 'goal' ? '#eab308' : type === 'save' ? '#22c55e' : '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, bannerY, w - 16, bannerH);

    // Type icon/tag
    const typeLabel = type === 'goal' ? '⚽ GOAL' : type === 'save' ? '🧤 GREAT SAVE' : '🥅 WOODWORK';
    const tagColor = type === 'goal' ? '#eab308' : type === 'save' ? '#22c55e' : '#38bdf8';
    ctx.fillStyle = tagColor;
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(typeLabel, 16, bannerY + 13);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Press Start 2P", monospace';
    const displayTitle = title.length > 26 ? title.substring(0, 24) + '...' : title;
    ctx.fillText(displayTitle, 16, bannerY + 27);

    // Slow-mo badge
    if (isSlowMo) {
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'right';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('[0.5X SLOW-MO]', w - 16, bannerY + 21);
    }

    // Progress Scrubber Bar at very bottom
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, h - 5, w, 5);
    ctx.fillStyle = type === 'goal' ? '#fde047' : type === 'save' ? '#22c55e' : '#38bdf8';
    ctx.fillRect(0, h - 5, Math.max(0, Math.min(w, w * progress)), 5);
  }
}
