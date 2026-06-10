// Sound effects utility using Web Audio API — refined for smooth, pleasant tones
class SoundManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  // Click — very soft, mellow tap
  playClick() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    osc.type = "sine";
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  // Task complete — warm two-tone chime
  playTaskComplete() {
    const ctx = this.getContext();
    const notes = [
      { freq: 880, delay: 0, dur: 0.25 },
      { freq: 1320, delay: 0.1, dur: 0.35 },
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      osc.type = "sine";

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + dur);
    });
  }

  // Level up — magical ascending arpeggio
  playLevelUp() {
    const ctx = this.getContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.35, ctx.currentTime);

    const notes = [
      { freq: 523.25, delay: 0 },    // C5
      { freq: 659.25, delay: 0.08 }, // E5
      { freq: 783.99, delay: 0.16 }, // G5
      { freq: 1046.5, delay: 0.24 }, // C6
    ];

    notes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);

      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      osc.type = "sine";

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.5);
    });

    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
  }

  // Goal progress — soft rising tone
  playGoalProgress() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    osc.type = "sine";

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  }

  // Transaction — subtle coin clink
  playTransaction() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    osc.type = "sine";

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  // Hover — barely audible soft blip
  playHover() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.type = "sine";

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }

  // Navigate — smooth airy whoosh
  playNavigate() {
    const ctx = this.getContext();

    // White noise burst filtered to sound like wind
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.1);
    filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.25);
  }

  // Toggle switch
  playToggle() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(550, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.06);
    osc.type = "sine";

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // Aurora blast — ethereal rising shimmer for the intro animation
  playAuroraBlast() {
    const ctx = this.getContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);

    // Layered sine tones sweeping upward
    const tones = [
      { start: 200, end: 800, delay: 0 },
      { start: 300, end: 1200, delay: 0.05 },
      { start: 150, end: 600, delay: 0.1 },
      { start: 400, end: 1600, delay: 0.15 },
    ];

    tones.forEach(({ start, end, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);

      osc.frequency.setValueAtTime(start, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(end, ctx.currentTime + delay + 1.2);
      osc.type = "sine";

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.5);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 1.5);
    });

    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
  }
}

export const soundManager = new SoundManager();
