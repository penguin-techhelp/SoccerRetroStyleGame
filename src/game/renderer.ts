import { PITCH_WIDTH, PITCH_HEIGHT, GOAL_Y_MIN, GOAL_Y_MAX, SoccerGameEngine } from './engine';
import { Player, ReplayFrame, Team } from '../types/game';

export class SoccerRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastWidth = 0;
  private lastHeight = 0;
  private crowdCanvasTop: HTMLCanvasElement | null = null;
  private crowdCanvasBottom: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false; // Authentic 16-bit pixel crispness
    this.initCrowdCanvases();
  }

  private initCrowdCanvases() {
    if (this.crowdCanvasTop && this.crowdCanvasBottom) return;

    const colors = ['#dc2626', '#2563eb', '#eab308', '#16a34a', '#f8fafc', '#9333ea', '#ea580c'];
    const h = 140;
    const w = PITCH_WIDTH;

    // Pre-render Top grandstand crowd row once to offscreen buffer
    const topCanvas = document.createElement('canvas');
    topCanvas.width = w;
    topCanvas.height = h;
    const topCtx = topCanvas.getContext('2d');
    if (topCtx) {
      topCtx.imageSmoothingEnabled = false;
      const stepH = 14;
      for (let rowY = 0; rowY < h; rowY += stepH) {
        topCtx.fillStyle = '#1e293b';
        topCtx.fillRect(0, rowY, w, 2);
        for (let px = 10; px < w - 10; px += 11) {
          const hash = Math.sin(px * 12.9898 + rowY * 78.233);
          const colIdx = Math.floor(Math.abs(hash * colors.length)) % colors.length;
          topCtx.fillStyle = colors[colIdx];
          topCtx.fillRect(px, rowY + 3, 7, 7);
          topCtx.fillStyle = '#fce0cd';
          topCtx.fillRect(px + 1, rowY + 1, 5, 3);
        }
      }
      this.crowdCanvasTop = topCanvas;
    }

    // Pre-render Bottom grandstand crowd row once to offscreen buffer
    const botCanvas = document.createElement('canvas');
    botCanvas.width = w;
    botCanvas.height = h;
    const botCtx = botCanvas.getContext('2d');
    if (botCtx) {
      botCtx.imageSmoothingEnabled = false;
      const stepH = 14;
      for (let rowY = 0; rowY < h; rowY += stepH) {
        botCtx.fillStyle = '#1e293b';
        botCtx.fillRect(0, rowY, w, 2);
        for (let px = 10; px < w - 10; px += 11) {
          const hash = Math.sin(px * 14.1234 + rowY * 81.567);
          const colIdx = Math.floor(Math.abs(hash * colors.length)) % colors.length;
          botCtx.fillStyle = colors[colIdx];
          botCtx.fillRect(px, rowY + 3, 7, 7);
          botCtx.fillStyle = '#fce0cd';
          botCtx.fillRect(px + 1, rowY + 1, 5, 3);
        }
      }
      this.crowdCanvasBottom = botCanvas;
    }
  }

  public render(engine: SoccerGameEngine, width: number, height: number) {
    // Ensure safe positive dimensions to prevent canvas buffer crashes
    const safeWidth = Math.max(320, width || 320);
    const safeHeight = Math.max(180, height || 180);

    // Only reallocate canvas buffer if dimensions actually changed
    // (Prevents GPU texture thrashing and memory garbage collection spikes on Chromebooks)
    if (this.lastWidth !== safeWidth || this.lastHeight !== safeHeight) {
      this.canvas.width = safeWidth;
      this.canvas.height = safeHeight;
      this.lastWidth = safeWidth;
      this.lastHeight = safeHeight;
      this.ctx.imageSmoothingEnabled = false;
    }

    const ctx = this.ctx;

    // Camera offset - tuned for 16:9 widescreen laptop displays (1024x576 base ratio)
    const zoom = Math.min(safeWidth / 1024, safeHeight / 576);
    const camX = engine.cameraX;
    const camY = engine.cameraY;

    ctx.save();
    // Center camera on screen
    ctx.translate(safeWidth / 2, safeHeight / 2);
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
    this.drawHUD(engine, safeWidth, safeHeight);
  }

  // --- Stadium Stands & Ad Boards ---
  private drawStadiumPerimeter(engine: SoccerGameEngine) {
    const ctx = this.ctx;

    // Outer Stadium Concrete / Crowd
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-200, -200, PITCH_WIDTH + 400, PITCH_HEIGHT + 400);

    // Grandstand crowd rows (Top & Bottom) using pre-rendered cached crowd bitmap
    this.drawCrowdRows(0, -140, PITCH_WIDTH, 140, engine, true);
    this.drawCrowdRows(0, PITCH_HEIGHT, PITCH_WIDTH, 140, engine, false);

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

    // Bottom ad boards (Left & Right flanking technical dugouts)
    ctx.fillStyle = '#020617';
    const dugoutLeft = PITCH_WIDTH / 2 - 230;
    const dugoutRight = PITCH_WIDTH / 2 + 230;

    // Left bottom ad board
    ctx.fillRect(20, PITCH_HEIGHT + 2, dugoutLeft - 20, boardHeight);
    // Right bottom ad board
    ctx.fillRect(dugoutRight, PITCH_HEIGHT + 2, PITCH_WIDTH - 40 - dugoutRight, boardHeight);

    ctx.fillStyle = '#38bdf8';
    for (let x = 120; x < dugoutLeft - 40; x += 280) {
      const ad = ads[Math.floor((x + 140) / 280) % ads.length];
      ctx.fillText(ad, x, PITCH_HEIGHT + 17);
    }
    for (let x = dugoutRight + 80; x < PITCH_WIDTH - 60; x += 280) {
      const ad = ads[Math.floor((x + 140) / 280) % ads.length];
      ctx.fillText(ad, x, PITCH_HEIGHT + 17);
    }

    // Team Dugout Benches on the sideline
    this.drawTeamBenches(engine);
  }

  // --- Team Dugouts / Bench Shelters ---
  private drawTeamBenches(engine: SoccerGameEngine) {
    const ctx = this.ctx;
    const centerY = PITCH_HEIGHT + 8;
    const benchW = 150;
    const benchH = 34;

    const drawDugout = (bx: number, team: Team, isHome: boolean) => {
      // 1. Technical Area dashed white box on turf
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(bx - 10, PITCH_HEIGHT - 12, benchW + 20, 16);
      ctx.setLineDash([]);

      // Manager / Coach standing in technical area
      const managerX = bx + 22;
      const managerY = PITCH_HEIGHT - 4;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(managerX - 4, managerY - 14, 8, 10);
      ctx.fillStyle = team.primaryColor;
      ctx.fillRect(managerX - 1, managerY - 13, 2, 7);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(managerX - 4, managerY - 4, 3, 5);
      ctx.fillRect(managerX + 1, managerY - 4, 3, 5);
      ctx.fillStyle = '#fcd34d';
      ctx.fillRect(managerX - 3, managerY - 20, 6, 6);

      // 2. Concrete Base Pad
      ctx.fillStyle = '#334155';
      ctx.fillRect(bx, centerY, benchW, benchH);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, centerY, benchW, benchH);

      // 3. Dugout Shelter Canopy (Translucent acrylic with steel frame)
      ctx.fillStyle = 'rgba(241, 245, 249, 0.28)';
      ctx.fillRect(bx, centerY, benchW, benchH - 4);
      ctx.fillStyle = team.primaryColor;
      ctx.fillRect(bx, centerY - 2, benchW, 4);

      // Shelter Frame Pillars
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(bx, centerY - 2, 3, benchH);
      ctx.fillRect(bx + benchW - 3, centerY - 2, 3, benchH);
      ctx.fillRect(bx + benchW / 2 - 1, centerY - 2, 2, benchH);

      // 4. Team Badge & Label on Canopy
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${team.flag} ${isHome ? 'HOME' : 'AWAY'} BENCH`, bx + 10, centerY + 8);

      // 5. Bucket Bench Seats & Reserve Players
      for (let s = 0; s < 6; s++) {
        const seatX = bx + 16 + s * 20;
        const seatY = centerY + 18;

        // Seat back & cushion
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(seatX - 5, seatY - 5, 10, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(seatX - 4, seatY + 3, 8, 4);

        // Pre-seated reserve player in tracksuit on odd seats
        if (s === 1 || s === 4) {
          ctx.fillStyle = team.primaryColor;
          ctx.fillRect(seatX - 4, seatY - 3, 8, 7);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(seatX - 3, seatY - 9, 6, 6);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(seatX - 4, seatY + 4, 8, 3);
        }
      }
    };

    // Home Dugout (Left side of midfield)
    drawDugout(PITCH_WIDTH / 2 - 210, engine.homeTeam, true);

    // Away Dugout (Right side of midfield)
    drawDugout(PITCH_WIDTH / 2 + 50, engine.awayTeam, false);

    // 4th Official Substitution Board Table at midfield
    const midX = PITCH_WIDTH / 2;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(midX - 16, centerY + 8, 32, 16);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(midX - 16, centerY + 8, 32, 16);
    ctx.fillStyle = '#22c55e';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('4TH OFF', midX, centerY + 18);
  }

  private drawCrowdRows(x: number, y: number, w: number, h: number, engine: SoccerGameEngine, isTop: boolean) {
    const ctx = this.ctx;
    this.initCrowdCanvases();

    const crowdCanvas = isTop ? this.crowdCanvasTop : this.crowdCanvasBottom;
    if (crowdCanvas) {
      ctx.drawImage(crowdCanvas, x, y);
    }

    // Flash photography bulbs (animated dynamic highlights)
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

  // --- Realistic 3D Net, Stanchions & Goal Post Rendering ---
  private drawRealisticGoal(engine: SoccerGameEngine, isLeft: boolean) {
    const ctx = this.ctx;
    const netMesh = isLeft ? engine.leftNetMesh : engine.rightNetMesh;
    if (!netMesh || netMesh.length === 0) return;

    const goalX = isLeft ? 45 : PITCH_WIDTH - 45;
    const depthDir = isLeft ? -1 : 1;
    const backX = goalX + depthDir * 65;
    const topY = GOAL_Y_MIN;
    const bottomY = GOAL_Y_MAX;

    ctx.save();

    // 1. Goal Interior Turf Ambient Shadow (Deep 3D cavity shadow)
    if (engine.settings.enableShadows) {
      const backTopPt = netMesh[0][netMesh[0].length - 1];
      const backBottomPt = netMesh[netMesh.length - 1][netMesh[0].length - 1];

      ctx.beginPath();
      ctx.moveTo(goalX, topY);
      ctx.lineTo(backTopPt.x, backTopPt.y);
      ctx.lineTo(backBottomPt.x, backBottomPt.y);
      ctx.lineTo(goalX, bottomY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(2, 22, 10, 0.45)';
      ctx.fill();
    }

    // 2. Net Fabric Translucent Backing (Gives tangible physical cloth volume)
    ctx.fillStyle = 'rgba(240, 248, 255, 0.08)';
    ctx.fill();

    // 3. Diagonal Support Stanchions (Steel back tension poles & ground anchor frame)
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    // Top stanchion arm extending back from top post
    ctx.moveTo(goalX, topY);
    ctx.lineTo(backX + depthDir * 8, topY - 14);
    ctx.lineTo(backX + depthDir * 16, topY - 6);
    // Bottom stanchion arm extending back from bottom post
    ctx.moveTo(goalX, bottomY);
    ctx.lineTo(backX + depthDir * 8, bottomY + 14);
    ctx.lineTo(backX + depthDir * 16, bottomY + 6);
    // Rear ground tension bar
    ctx.lineTo(backX + depthDir * 16, topY - 6);
    ctx.stroke();

    // Steel anchor ground plates
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(backX + depthDir * 16, topY - 6, 4.5, 0, Math.PI * 2);
    ctx.arc(backX + depthDir * 16, bottomY + 6, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Net Cord Shadow Layer on Pitch Turf
    if (engine.settings.enableShadows) {
      ctx.strokeStyle = 'rgba(0, 15, 5, 0.32)';
      ctx.lineWidth = 1.6;
      for (let r = 0; r < netMesh.length; r++) {
        ctx.beginPath();
        for (let c = 0; c < netMesh[r].length; c++) {
          const pt = netMesh[r][c];
          if (c === 0) ctx.moveTo(pt.x + 1.5, pt.y + 1.5);
          else ctx.lineTo(pt.x + 1.5, pt.y + 1.5);
        }
        ctx.stroke();
      }
    }

    // 5. Authentic Interlocking Diamond Netting (Honeycomb / Diamond Weave)
    // Primary white net cords (Horizontal)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.4;
    for (let r = 0; r < netMesh.length; r++) {
      ctx.beginPath();
      for (let c = 0; c < netMesh[r].length; c++) {
        const pt = netMesh[r][c];
        if (c === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    // Primary white net cords (Vertical)
    for (let c = 0; c < netMesh[0].length; c++) {
      ctx.beginPath();
      for (let r = 0; r < netMesh.length; r++) {
        const pt = netMesh[r][c];
        if (r === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    // Diagonal diamond weave cords (gives genuine World Cup / Champions League net structure)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.lineWidth = 1.1;
    for (let r = 0; r < netMesh.length - 1; r++) {
      for (let c = 0; c < netMesh[0].length - 1; c++) {
        const p1 = netMesh[r][c];
        const p2 = netMesh[r + 1][c + 1];
        const p3 = netMesh[r + 1][c];
        const p4 = netMesh[r][c + 1];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }
    }

    // Net cord knots at lattice intersections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let r = 1; r < netMesh.length - 1; r += 2) {
      for (let c = 1; c < netMesh[0].length; c++) {
        const pt = netMesh[r][c];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. Base Ground Skirt / Net Anchor Bar
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(goalX, bottomY);
    ctx.lineTo(netMesh[netMesh.length - 1][netMesh[0].length - 1].x, bottomY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(goalX, topY);
    ctx.lineTo(netMesh[0][netMesh[0].length - 1].x, topY);
    ctx.stroke();

    // 7. Cylindrical 3D White Goal Posts & Crossbar
    // Post drop shadows onto turf
    if (engine.settings.enableShadows) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(goalX + depthDir * 2, topY + 4, 7, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(goalX + depthDir * 2, bottomY + 4, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground mounting ring plates where posts enter turf
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(goalX, topY, 6, 0, Math.PI * 2);
    ctx.arc(goalX, bottomY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Front Uprights & Crossbar with 3D metallic highlights
    // Dark outer edge for 3D bevel depth
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 7.5;
    ctx.beginPath();
    ctx.moveTo(goalX, topY);
    ctx.lineTo(goalX, bottomY);
    ctx.stroke();

    // Pure white core cylinder
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(goalX, topY);
    ctx.lineTo(goalX, bottomY);
    ctx.stroke();

    // Specular highlight reflection line
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(goalX - (isLeft ? 1 : -1), topY);
    ctx.lineTo(goalX - (isLeft ? 1 : -1), bottomY);
    ctx.stroke();

    // Post corner elbows / caps with 3D shine
    const drawPostCap = (y: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(goalX, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Specular shine point
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(goalX - (isLeft ? 1.5 : -1.5), y - 1.5, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    drawPostCap(topY);
    drawPostCap(bottomY);

    ctx.restore();
  }

  private drawGoalLeft(engine: SoccerGameEngine) {
    this.drawRealisticGoal(engine, true);
  }

  private drawGoalRight(engine: SoccerGameEngine) {
    this.drawRealisticGoal(engine, false);
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
    if (!engine.settings.enableShadows) return;
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';

    // Batched player shadows (single draw call for Intel UHD Graphics efficiency)
    ctx.beginPath();
    [...engine.homePlayers, ...engine.awayPlayers].forEach((p) => {
      if (p.hasRedCard && p.y >= PITCH_HEIGHT + 24) return;
      ctx.ellipse(p.x, p.y + 4, 10, 5, 0, 0, Math.PI * 2);
    });
    ctx.fill();

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

    // Check if player has red card and has reached the sideline bench dugout
    if (player.hasRedCard && player.y >= PITCH_HEIGHT + 24) {
      // Seated on the team dugout bench
      const jerseyColor = isGK ? team.gkColor : team.primaryColor;
      const shortsColor = isGK ? '#1e293b' : team.secondaryColor;
      const sockColor = team.sockColor;

      // Legs resting on bench
      ctx.fillStyle = sockColor;
      ctx.fillRect(-5, 6, 3, 5);
      ctx.fillRect(2, 6, 3, 5);
      ctx.fillStyle = '#090d16'; // Boots
      ctx.fillRect(-6, 10, 5, 3);
      ctx.fillRect(1, 10, 5, 3);

      // Shorts
      ctx.fillStyle = shortsColor;
      ctx.fillRect(-6, 2, 12, 5);

      // Jersey body (leaning forward in dejection)
      ctx.fillStyle = jerseyColor;
      ctx.fillRect(-7, -8, 14, 10);

      // Arms resting on knees
      ctx.fillStyle = player.skinTone;
      ctx.fillRect(-8, -4, 3, 7);
      ctx.fillRect(5, -4, 3, 7);

      // Head bowed down
      ctx.fillStyle = player.skinTone;
      ctx.fillRect(-5, -16, 10, 8);
      ctx.fillStyle = player.hairColor;
      ctx.fillRect(-6, -18, 12, 4);

      // Red Card badge hanging above seat
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-3, -26, 6, 9);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-3, -26, 6, 9);

      ctx.restore();
      return;
    }

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
    } else if (player.state === 'idle') {
      bodyY = Math.sin(player.animTimer * 1.8) * 0.7; // Active breathing stance
    }

    const jerseyColor = isGK ? team.gkColor : team.primaryColor;
    const shortsColor = isGK ? '#1e293b' : team.secondaryColor;
    const sockColor = team.sockColor;

    // Legs animation
    const runFrame = player.animFrame;
    const isRunning = player.state === 'running';
    const legOffset1 = isRunning
      ? Math.sin(runFrame * 1.5) * 5
      : Math.sin(player.animTimer * 1.8) * 1.2;
    const legOffset2 = isRunning
      ? -Math.sin(runFrame * 1.5) * 5
      : -Math.sin(player.animTimer * 1.8) * 1.2;

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
    const armOffset = isRunning
      ? -legOffset1 * 0.8
      : Math.sin(player.animTimer * 1.8) * 0.8;
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
      // Sent off: Walking off the pitch to the bench
      const bounce = Math.sin(Date.now() / 180) * 2;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-5, -30 + bounce, 10, 13);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-5, -30 + bounce, 10, 13);
      ctx.fillStyle = '#ffffff';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OFF', 0, -34 + bounce);
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

      // Stadium floodlight highlights (optimized for Intel N-series iGPU in gopi mode)
      if (engine.settings.performanceMode === 'gopi') {
        ctx.fillStyle = 'rgba(255, 255, 240, 0.08)';
        ctx.fillRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);
      } else {
        const grad = ctx.createRadialGradient(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 100, PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 700);
        grad.addColorStop(0, 'rgba(255, 255, 240, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);
      }
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

    // 3. Instant Replay Blinking VCR Overlay
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
