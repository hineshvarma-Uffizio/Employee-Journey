/* ==========================================================================
   MEMORY PALACE AUDIO ENGINE - SYNTHESIZED WEB AUDIO
   ========================================================================== */
    /* ==========================================================================
       1. SYNTHESIZED WEB AUDIO ENGINE
       ========================================================================== */
    class PalaceAudioEngine {
      constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.ambientGain = null;
      }

      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContext();
          this.startAmbientDrone();
        } else if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      startAmbientDrone() {
        if (!this.ctx || this.isMuted) return;
        try {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(110, this.ctx.currentTime);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(164.81, this.ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.015, this.ctx.currentTime);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start();
          osc2.start();
          this.ambientGain = gain;
        } catch (e) {}
      }

      playFootstep() {
        if (!this.ctx || this.isMuted) return;
        try {
          const t = this.ctx.currentTime;
          const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < noiseBuffer.length; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseBuffer.length * 0.3));
          }

          const whiteNoise = this.ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(240, t);
          filter.Q.setValueAtTime(1.8, t);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

          whiteNoise.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          whiteNoise.start(t);
        } catch (e) {}
      }

      playDoorCreak() {
        if (!this.ctx || this.isMuted) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(75, now);
          osc.frequency.linearRampToValueAtTime(105, now + 0.5);
          osc.frequency.linearRampToValueAtTime(65, now + 0.9);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(340, now);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.95);
        } catch (e) {}
      }

      playChime() {
        if (!this.ctx || this.isMuted) return;
        try {
          const now = this.ctx.currentTime;
          const freqs = [523.25, 659.25, 783.99, 1046.50];
          freqs.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.06);
            gain.gain.setValueAtTime(0.05, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.8);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.85);
          });
        } catch (e) {}
      }

      playPaperSnap() {
        if (!this.ctx || this.isMuted) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.07);
        } catch (e) {}
      }

      toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ambientGain) {
          this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.015, this.ctx ? this.ctx.currentTime : 0);
        }
        return !this.isMuted;
      }
    }

    const palaceAudio = new PalaceAudioEngine();


// Export to window for global access across modules
window.PalaceAudioEngine = PalaceAudioEngine;
window.palaceAudio = palaceAudio;
