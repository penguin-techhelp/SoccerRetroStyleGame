/**
 * 16-Bit Retro Web Audio Synthesizer
 * Generates authentic 90s arcade & console sound effects and chiptune music
 * using pure Web Audio API oscillators, noise buffers, and resonant filters.
 */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private crowdGain: GainNode | null = null;
  private crowdFilter: BiquadFilterNode | null = null;
  private crowdSource: AudioBufferSourceNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private crowdInitialized: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Lazy initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
    if (muted) {
      if (this.isMusicPlaying) {
        this.stopMusic();
      }
      this.stopCommentarySpeech();
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  /** Kick / Pass Sound */
  public playKick(power: number = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = 160 + power * 120;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.09);

    const kickVolume = 0.3 + power * 0.4;
    gain.gain.setValueAtTime(kickVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  /** Hard Shot Blast */
  public playHardShot() {
    if (this.isMuted) return;
    this.playKick(1.0);

    // Add brief whoosh
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  /** Slide Tackle Swoosh */
  public playSlide() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.22;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.linearRampToValueAtTime(250, t + 0.22);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  /** Referee Whistle (Classic dual-frequency tone burst) */
  public playWhistle(doubleBlast: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const triggerBlast = (timeOffset: number, duration: number) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + timeOffset;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(2600, t);
      osc2.frequency.setValueAtTime(2950, t);

      // Tremolo / flutter
      vibrato.frequency.setValueAtTime(28, t);
      vibratoGain.gain.setValueAtTime(140, t);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc1.frequency);
      vibratoGain.connect(osc2.frequency);

      gain.gain.setValueAtTime(0.0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.setValueAtTime(0.28, t + duration - 0.03);
      gain.gain.linearRampToValueAtTime(0.001, t + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      vibrato.start(t);
      osc1.start(t);
      osc2.start(t);

      vibrato.stop(t + duration);
      osc1.stop(t + duration);
      osc2.stop(t + duration);
    };

    triggerBlast(0, doubleBlast ? 0.16 : 0.35);
    if (doubleBlast) {
      triggerBlast(0.22, 0.4);
    }
  }

  /** Post / Crossbar Metallic Clang */
  public playPostClang() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    [680, 1140, 1550].forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.46);
    });
  }

  /** Goal Net Rustle */
  public playNetRustle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  /**
   * Procedural Randomized Crowd Reaction Sound Suite
   * Dynamically triggers authentic stadium reactions for missed shots, fouls,
   * red card uproars, goalkeeper saves, and goal celebrations.
   */

  /** Missed Shot Reaction (Randomized: 3 variations of collective agonizing gasps & groans) */
  public playRandomCrowdMissedShot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const variant = Math.floor(Math.random() * 3);
    const t = this.ctx.currentTime;

    if (variant === 0) {
      // Variation A: The Classic Agonized Crowd Groan ("Oooooh-aaah!")
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(290, t);
      osc1.frequency.exponentialRampToValueAtTime(140, t + 0.65);
      osc2.frequency.setValueAtTime(215, t);
      osc2.frequency.exponentialRampToValueAtTime(110, t + 0.7);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.76);
      osc2.stop(t + 0.76);
    } else if (variant === 1) {
      // Variation B: Staccato Shock Shout ("Aaaaah!")
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.linearRampToValueAtTime(180, t + 0.45);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, t);
      filter.frequency.exponentialRampToValueAtTime(250, t + 0.45);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.52);
    } else {
      // Variation C: The Two-Tone Head-in-Hands Sigh ("Ohhh-no!")
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.setValueAtTime(220, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.8);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.86);
    }
  }

  /** Crowd Foul Reaction (Randomized: Outraged shouts, jeers, boos, and whistle harmonics) */
  public playRandomCrowdFoul() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const variant = Math.floor(Math.random() * 3);
    const t = this.ctx.currentTime;

    if (variant === 0) {
      // Variation A: Indignant Crowd Shouting ("Heeeyyy!!")
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.linearRampToValueAtTime(260, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.55);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, t);
      filter.Q.setValueAtTime(1.8, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.62);
    } else if (variant === 1) {
      // Variation B: Crowd Jeers & Spectator Whistles ("Boooo!")
      const booOsc = this.ctx.createOscillator();
      const booGain = this.ctx.createGain();
      booOsc.type = 'triangle';
      booOsc.frequency.setValueAtTime(130, t);
      booOsc.frequency.exponentialRampToValueAtTime(95, t + 0.7);

      booGain.gain.setValueAtTime(0.01, t);
      booGain.gain.linearRampToValueAtTime(0.26, t + 0.08);
      booGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      booOsc.connect(booGain);
      booGain.connect(this.masterGain);
      booOsc.start(t);
      booOsc.stop(t + 0.76);

      // Spectator whistle chirp
      const whistleOsc = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistleOsc.type = 'sine';
      whistleOsc.frequency.setValueAtTime(2500, t + 0.05);
      whistleOsc.frequency.linearRampToValueAtTime(2350, t + 0.35);

      whistleGain.gain.setValueAtTime(0.01, t + 0.05);
      whistleGain.gain.linearRampToValueAtTime(0.12, t + 0.12);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      whistleOsc.connect(whistleGain);
      whistleGain.connect(this.masterGain);
      whistleOsc.start(t + 0.05);
      whistleOsc.stop(t + 0.36);
    } else {
      // Variation C: Visceral Tackle Impact Gasp & Shock
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(175, t);
      osc.frequency.linearRampToValueAtTime(110, t + 0.45);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.32, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.52);
    }
  }

  /** Red Card Uproar: Prolonged stadium uproar, whistles and sustained boos */
  public playRandomCrowdRedCardUproar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Double sharp referee whistle
    this.playWhistle(true);

    // Deep sustained booing roar
    const booOsc1 = this.ctx.createOscillator();
    const booOsc2 = this.ctx.createOscillator();
    const booGain = this.ctx.createGain();

    booOsc1.type = 'sawtooth';
    booOsc2.type = 'triangle';
    booOsc1.frequency.setValueAtTime(125, t + 0.1);
    booOsc1.frequency.linearRampToValueAtTime(90, t + 1.6);
    booOsc2.frequency.setValueAtTime(130, t + 0.1);
    booOsc2.frequency.linearRampToValueAtTime(85, t + 1.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, t);

    booGain.gain.setValueAtTime(0.01, t + 0.1);
    booGain.gain.linearRampToValueAtTime(0.35, t + 0.25);
    booGain.gain.exponentialRampToValueAtTime(0.001, t + 1.7);

    booOsc1.connect(filter);
    booOsc2.connect(filter);
    filter.connect(booGain);
    booGain.connect(this.masterGain);

    booOsc1.start(t + 0.1);
    booOsc2.start(t + 0.1);
    booOsc1.stop(t + 1.72);
    booOsc2.stop(t + 1.72);

    // Staccato angry whistle blasts
    const playWhistleBlast = (delay: number) => {
      if (!this.ctx || !this.masterGain) return;
      const wt = t + delay;
      const wOsc = this.ctx.createOscillator();
      const wGain = this.ctx.createGain();
      wOsc.type = 'sine';
      wOsc.frequency.setValueAtTime(2600 + Math.random() * 200, wt);

      wGain.gain.setValueAtTime(0.01, wt);
      wGain.gain.linearRampToValueAtTime(0.14, wt + 0.05);
      wGain.gain.exponentialRampToValueAtTime(0.001, wt + 0.35);

      wOsc.connect(wGain);
      wGain.connect(this.masterGain);
      wOsc.start(wt);
      wOsc.stop(wt + 0.36);
    };

    playWhistleBlast(0.25);
    playWhistleBlast(0.65);
    playWhistleBlast(1.05);
  }

  /** Goalkeeper Save Reaction (Randomized: relief roars, acclaim, and applause) */
  public playRandomCrowdSave() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const variant = Math.floor(Math.random() * 2);
    const t = this.ctx.currentTime;

    if (variant === 0) {
      // Relief Roar & Acclaim ("Yeeaaah!")
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(170, t);
      osc.frequency.linearRampToValueAtTime(310, t + 0.18);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.7);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.32, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.76);
    } else {
      // Acclaiming Applause & Cheer Wave
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.linearRampToValueAtTime(340, t + 0.22);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.8);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.86);
    }
  }

  /** Woodwork Strike Reaction: Loud crossbar clang + collective shock & groan */
  public playRandomCrowdWoodwork() {
    this.playPostClang();
    this.playRandomCrowdMissedShot();
  }

  /** Goal Celebration (Randomized: 3 epic stadium celebration styles) */
  public playRandomGoalCelebration() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.playWhistle(true);
    const variant = Math.floor(Math.random() * 3);
    const t = this.ctx.currentTime;

    // Helper: stadium air horn
    const playHorn = (delay: number, dur: number, note: number = 311.13) => {
      if (!this.ctx || !this.masterGain) return;
      const ht = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc.frequency.setValueAtTime(note, ht);
      osc2.frequency.setValueAtTime(note * 1.5, ht); // perfect fifth

      gain.gain.setValueAtTime(0.22, ht);
      gain.gain.linearRampToValueAtTime(0.2, ht + dur - 0.05);
      gain.gain.linearRampToValueAtTime(0.001, ht + dur);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(ht);
      osc2.start(ht);
      osc.stop(ht + dur);
      osc2.stop(ht + dur);
    };

    if (variant === 0) {
      // Style 1: Stadium Air Horn Fanfare (2 short, 1 long blast) + Victory Arpeggio
      playHorn(0.25, 0.18);
      playHorn(0.48, 0.18);
      playHorn(0.75, 0.65);

      const melody = [
        { note: 261.63, time: 0.1 },  // C4
        { note: 329.63, time: 0.25 }, // E4
        { note: 392.00, time: 0.4 },  // G4
        { note: 523.25, time: 0.6 },  // C5
        { note: 659.25, time: 0.8 },  // E5
        { note: 783.99, time: 1.0 },  // G5
      ];

      melody.forEach(({ note, time }) => {
        if (!this.ctx || !this.masterGain) return;
        const mt = this.ctx.currentTime + time;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note, mt);

        g.gain.setValueAtTime(0.15, mt);
        g.gain.exponentialRampToValueAtTime(0.001, mt + 0.35);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(mt);
        osc.stop(mt + 0.36);
      });
    } else if (variant === 1) {
      // Style 2: The Stadium Chant & Horn Surge ("Ole, Ole, Ole!")
      playHorn(0.2, 0.3, 261.63); // C4
      playHorn(0.55, 0.3, 329.63); // E4
      playHorn(0.9, 0.55, 392.00); // G4

      // Rhythmic stadium roar pulses
      [0.15, 0.5, 0.85, 1.2].forEach((time, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const rt = this.ctx.currentTime + time;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180 + idx * 25, rt);
        osc.frequency.linearRampToValueAtTime(260 + idx * 30, rt + 0.15);
        osc.frequency.exponentialRampToValueAtTime(120, rt + 0.35);

        g.gain.setValueAtTime(0.01, rt);
        g.gain.linearRampToValueAtTime(0.25, rt + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, rt + 0.36);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(rt);
        osc.stop(rt + 0.37);
      });
    } else {
      // Style 3: Sub-Bass Boom & Triumphant Stadium Surge
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65, t);
      subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.8);

      subGain.gain.setValueAtTime(0.4, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.86);

      // Double power horn fanfare
      playHorn(0.18, 0.45, 293.66); // D4
      playHorn(0.7, 0.85, 369.99);  // F#4
    }
  }

  /** Legacy alias for crowd gasp */
  public playCrowdGasp() {
    this.playRandomCrowdMissedShot();
  }

  /** Legacy alias for goal celebration */
  public playGoalCelebration() {
    this.playRandomGoalCelebration();
  }

  /** Continuous Ambient Crowd Noise that reacts dynamically to ball distance to goal */
  public startCrowdAmbience() {
    if (this.crowdInitialized) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      // Pink noise algorithm
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      this.crowdSource = this.ctx.createBufferSource();
      this.crowdSource.buffer = buffer;
      this.crowdSource.loop = true;

      this.crowdFilter = this.ctx.createBiquadFilter();
      this.crowdFilter.type = 'bandpass';
      this.crowdFilter.frequency.setValueAtTime(500, this.ctx.currentTime);
      this.crowdFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.crowdSource.connect(this.crowdFilter);
      this.crowdFilter.connect(this.crowdGain);
      this.crowdGain.connect(this.masterGain);

      this.crowdSource.start();
      this.crowdInitialized = true;
    } catch (e) {
      console.warn("Could not start crowd ambience:", e);
    }
  }

  public updateCrowdExcitement(tension: number) {
    // tension: 0.0 (calm midfield) to 1.0 (inside 6-yard box / shot taken)
    if (!this.crowdGain || !this.crowdFilter || !this.ctx) return;
    const t = this.ctx.currentTime;
    const targetVol = 0.08 + tension * 0.22;
    const targetFreq = 450 + tension * 750;

    this.crowdGain.gain.setTargetAtTime(targetVol, t, 0.1);
    this.crowdFilter.frequency.setTargetAtTime(targetFreq, t, 0.1);
  }

  /** 16-Bit Chiptune Arcade Menu / Title Music */
  public startTitleMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isMusicPlaying = true;

    // Classic 90s Sega/SNES Arcade-inspired brassy bassline & arpeggio
    // Key of F Minor / Ab Major
    const bassline = [
      174.61, 174.61, 207.65, 233.08, // F3, F3, Ab3, Bb3
      174.61, 174.61, 261.63, 233.08, // F3, F3, C4, Bb3
      155.56, 155.56, 174.61, 207.65, // Eb3, Eb3, F3, Ab3
      130.81, 146.83, 155.56, 174.61  // C3, D3, Eb3, F3
    ];

    const leadNotes = [
      349.23, 415.30, 523.25, 698.46, // F4, Ab4, C5, F5
      622.25, 523.25, 466.16, 415.30, // Eb5, C5, Bb4, Ab4
      392.00, 466.16, 523.25, 622.25, // G4, Bb4, C5, Eb5
      523.25, 466.16, 415.30, 349.23  // C5, Bb4, Ab4, F4
    ];

    let step = 0;
    const bpm = 128;
    const stepDurationMs = (60 / bpm / 2) * 1000; // 16th notes

    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || !this.masterGain || this.isMuted) return;

      const t = this.ctx.currentTime;

      // Bass note
      if (step % 2 === 0) {
        const bassIdx = Math.floor(step / 2) % bassline.length;
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sawtooth';
        bOsc.frequency.setValueAtTime(bassline[bassIdx] / 2, t);

        const bFilter = this.ctx.createBiquadFilter();
        bFilter.type = 'lowpass';
        bFilter.frequency.setValueAtTime(600, t);
        bFilter.frequency.exponentialRampToValueAtTime(100, t + 0.18);

        bGain.gain.setValueAtTime(0.18, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        bOsc.connect(bFilter);
        bFilter.connect(bGain);
        bGain.connect(this.masterGain);

        bOsc.start(t);
        bOsc.stop(t + 0.19);
      }

      // Lead synth note
      if (step % 2 === 1 || step % 4 === 0) {
        const leadIdx = step % leadNotes.length;
        const lOsc = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        lOsc.type = 'square';
        lOsc.frequency.setValueAtTime(leadNotes[leadIdx], t);

        lGain.gain.setValueAtTime(0.08, t);
        lGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        lOsc.connect(lGain);
        lGain.connect(this.masterGain);

        lOsc.start(t);
        lOsc.stop(t + 0.13);
      }

      // Arcade hi-hat tick
      if (step % 2 === 1) {
        const hBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
        const hData = hBuffer.getChannelData(0);
        for (let i = 0; i < hData.length; i++) {
          hData[i] = (Math.random() * 2 - 1) * 0.1;
        }
        const hSource = this.ctx.createBufferSource();
        hSource.buffer = hBuffer;
        const hFilter = this.ctx.createBiquadFilter();
        hFilter.type = 'highpass';
        hFilter.frequency.setValueAtTime(7000, t);
        const hGain = this.ctx.createGain();
        hGain.gain.setValueAtTime(0.05, t);
        hGain.gain.linearRampToValueAtTime(0.001, t + 0.03);

        hSource.connect(hFilter);
        hFilter.connect(hGain);
        hGain.connect(this.masterGain);
        hSource.start(t);
      }

      step = (step + 1) % 64;
    }, stepDurationMs);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  /** UI Menu Click Blip */
  public playMenuBeep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(880, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  /** 16-Bit Arcade Commentator Notification Jingle */
  public playCommentaryJingle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Arpeggio broadcast ping
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.setValueAtTime(880.0, t + 0.06); // A5
    osc.frequency.setValueAtTime(1174.66, t + 0.12); // D6

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.setValueAtTime(0.22, t + 0.06);
    gain.gain.setValueAtTime(0.25, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.33);
  }

  /** Voice Commentary via Web Speech API (Protected against V8 GC audio cutoff) */
  public speakCommentary(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Cancel previous speech cleanly
      window.speechSynthesis.cancel();
      this.currentUtterance = null;

      // Resume speech synthesis engine if Chromium suspended it
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Clean arcade emojis/symbols for crisp voice reading
      const cleanText = text
        .replace(/⚽|🟥|🟨|🧤|🥅|★|•|—/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.04; // Dramatic, authoritative television broadcast cadence
      utterance.pitch = 0.98; // Rich, resonant broadcast announcer pitch
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const isUK = (v: SpeechSynthesisVoice) =>
        v.lang.replace('_', '-').toLowerCase().startsWith('en-gb');
      const isEnglish = (v: SpeechSynthesisVoice) =>
        v.lang.toLowerCase().startsWith('en');

      // Prioritize authentic British football commentator voices (Peter Drury / Martin Tyler broadcast style)
      const preferredVoice =
        // 1. UK Natural/Neural/Broadcast male voices
        voices.find(
          (v) =>
            isUK(v) &&
            (v.name.includes('Natural') ||
              v.name.includes('Neural') ||
              v.name.includes('Google UK English Male') ||
              v.name.includes('Daniel') ||
              v.name.includes('Oliver') ||
              v.name.includes('George') ||
              v.name.includes('Arthur') ||
              v.name.includes('Ryan') ||
              v.name.includes('Malcolm'))
        ) ||
        // 2. Any UK English voice
        voices.find((v) => isUK(v)) ||
        // 3. Natural broadcast male English voices (Guy, David, Alex)
        voices.find(
          (v) =>
            isEnglish(v) &&
            (v.name.includes('Natural') ||
              v.name.includes('Neural') ||
              v.name.includes('Guy') ||
              v.name.includes('David') ||
              v.name.includes('Alex'))
        ) ||
        // 4. Any English voice
        voices.find((v) => isEnglish(v));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        if (this.currentUtterance === utterance) {
          this.currentUtterance = null;
          (window as any).__retroVoiceUtterance = null;
        }
        onEnd?.();
      };

      utterance.onerror = () => {
        if (this.currentUtterance === utterance) {
          this.currentUtterance = null;
          (window as any).__retroVoiceUtterance = null;
        }
        onEnd?.();
      };

      // Retain strong persistent reference on class and window to prevent V8 garbage collector from cutting off audio mid-speech
      this.currentUtterance = utterance;
      (window as any).__retroVoiceUtterance = utterance;

      window.speechSynthesis.speak(utterance);
    } catch {
      onEnd?.();
    }
  }

  public stopCommentarySpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        this.currentUtterance = null;
        (window as any).__retroVoiceUtterance = null;
      } catch {
        // Safe catch
      }
    }
  }

  /**
   * Iconic EA Sports Style Intro Audio Stinger
   * Deep sub-bass stadium impact, metallic shimmer fanfare, and booming announcer voice:
   * "Tuxedo Penguin Gaming Sports Studio. It's in the game!"
   */
  public playEASportsIntroStinger() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // 1. Sub-bass impact boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.9);
    subGain.gain.setValueAtTime(0.7, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 1.25);

    // 2. Metallic shimmer / synth brass chord (EA fanfare)
    const freqs = [220, 277.18, 329.63, 440, 554.37]; // A major 9th chord
    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, t + 1.4);
      gain.gain.setValueAtTime(0.12, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + 0.08);
      osc.stop(t + 1.55);
    });

    // 3. Booming EA Sports style voiceover
    setTimeout(() => {
      this.speakCommentary(
        "Tuxedo Penguin Gaming Sports Studio. It's in the game!",
        () => {}
      );
    }, 450);
  }
}

export const retroAudio = new RetroAudioEngine();
