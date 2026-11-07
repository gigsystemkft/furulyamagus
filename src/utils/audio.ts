import { RECORDER_NOTES } from '../data/notes';
import { NoteInfo } from '../types';

class AudioManager {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private isListening: boolean = false;
  private onPitchDetectedCallback: ((note: NoteInfo | null, freq: number, cents: number) => void) | null = null;
  private rafId: number | null = null;

  public async initMicrophone(onPitch: (note: NoteInfo | null, freq: number, cents: number) => void): Promise<boolean> {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.microphone = this.audioCtx.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      this.onPitchDetectedCallback = onPitch;
      this.isListening = true;
      this.startPitchDetectionLoop();
      return true;
    } catch (err) {
      console.error('Mikrofon hiba:', err);
      return false;
    }
  }

  public stopMicrophone() {
    this.isListening = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
  }

  private startPitchDetectionLoop = () => {
    if (!this.isListening || !this.analyser || !this.audioCtx) return;

    const bufferLength = this.analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(buffer);

    const freq = this.autoCorrelate(buffer, this.audioCtx.sampleRate);

    if (freq !== -1) {
      const matchedNote = this.findClosestNote(freq);
      const cents = this.getCentsOff(freq, matchedNote ? matchedNote.freq : freq);
      if (this.onPitchDetectedCallback) {
        this.onPitchDetectedCallback(matchedNote, freq, cents);
      }
    } else {
      if (this.onPitchDetectedCallback) {
        this.onPitchDetectedCallback(null, 0, 0);
      }
    }

    this.rafId = requestAnimationFrame(this.startPitchDetectionLoop);
  };

  // Auto-correlation algorithm for pitch detection
  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let sumSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      sumSquares += val * val;
    }
    const rootMeanSquare = Math.sqrt(sumSquares / SIZE);
    if (rootMeanSquare < 0.01) {
      return -1; // Too quiet
    }

    let r1 = 0;
    let r2 = SIZE - 1;
    const threshold = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < threshold) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmedBuffer = buffer.slice(r1, r2);
    const c = new Float32Array(trimmedBuffer.length);
    for (let i = 0; i < trimmedBuffer.length; i++) {
      for (let j = 0; j < trimmedBuffer.length - i; j++) {
        c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < trimmedBuffer.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) {
      T0 = T0 - b / (2 * a);
    }

    return sampleRate / T0;
  }

  private findClosestNote(freq: number): NoteInfo | null {
    let closest: NoteInfo | null = null;
    let minDiff = Infinity;

    for (const note of RECORDER_NOTES) {
      const diff = Math.abs(note.freq - freq);
      if (diff < minDiff && diff < 45) {
        minDiff = diff;
        closest = note;
      }
    }
    return closest;
  }

  private getCentsOff(freq: number, targetFreq: number): number {
    return Math.floor(1200 * Math.log2(freq / targetFreq));
  }

  // Synthesized Sound Effects
  public playPopSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.error(e);
    }
  }

  public playCoinSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.error(e);
    }
  }

  public playSuccessSound() {
    try {
      const ctx = this.getAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    } catch (e) {
      console.error(e);
    }
  }

  public playWrongSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.setValueAtTime(130, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error(e);
    }
  }

  // Realistic Warm Recorder Synth (Blockflöte)
  public playNoteTone(freq: number) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const duration = 0.8;

      // Master gain for envelope
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      // Gentle attack like blowing into a recorder
      masterGain.gain.linearRampToValueAtTime(0.25, now + 0.06);
      masterGain.gain.exponentialRampToValueAtTime(0.15, now + 0.3);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Lowpass filter to give warm wooden timbre
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 2.5, now);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);

      // 1. Warm Triangle Oscillator (Wood body fundamental)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      // 2. Soft Sine Oscillator (Warmth overtone)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq, now);

      // Connect oscillators to filter and master gain
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Start & Stop
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      console.error(e);
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }
}

export const audioManager = new AudioManager();
