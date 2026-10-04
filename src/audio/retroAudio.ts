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

  /** Crowd Gasp ("Oooooh!") */
  public playCrowdGasp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(160, t + 0.5);

    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  /** Goal Cheer & Stadium Horn Fanfare */
  public playGoalCelebration() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.playWhistle(true);

    // Stadium air horn blasts (2 short, 1 long)
    const playHorn = (delay: number, dur: number, note: number = 311.13) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc.frequency.setValueAtTime(note, t);
      osc2.frequency.setValueAtTime(note * 1.5, t); // perfect fifth

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.linearRampToValueAtTime(0.2, t + dur - 0.05);
      gain.gain.linearRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + dur);
      osc2.stop(t + dur);
    };

    playHorn(0.3, 0.2);
    playHorn(0.55, 0.2);
    playHorn(0.85, 0.7);

    // Retro victory chime arpeggio
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
      const t = this.ctx.currentTime + time;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note, t);

      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.36);
    });
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

    // Classic 90s Sega/SNES FIFA-inspired brassy bassline & arpeggio
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
      utterance.rate = 1.12; // Natural, energetic broadcast cadence
      utterance.pitch = 1.05; // Slightly elevated announcer inflection
      utterance.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('David') ||
              v.name.includes('Guy') ||
              v.name.includes('UK') ||
              v.name.includes('US'))
        ) || voices.find((v) => v.lang.startsWith('en'));

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
}

export const retroAudio = new RetroAudioEngine();
