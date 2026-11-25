// Synthesized sound for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Every sound is a WebAudio oscillator or a short noise burst made in code:
// no audio files, no network. Sound starts only after the player's first
// interaction (browser rule) and M mutes everything. The game is complete
// without sound; sound is polish, never a requirement.
export function createSound() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gainValue, slideTo) {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, audio.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, audio.currentTime + dur);
    gain.gain.setValueAtTime(gainValue || 0.08, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + dur);
  }

  function noise(dur, gainValue) {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    const length = Math.floor(audio.sampleRate * dur);
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    gain.gain.value = gainValue || 0.12;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(audio.destination);
    source.start();
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
    chop() { noise(0.08, 0.14); tone(180, 0.07, 'square', 0.05, 90); },
    cook() { tone(320, 0.12, 'sine', 0.06, 520); },
    pickup() { tone(520, 0.07, 'square', 0.06); },
    plate() { tone(660, 0.09, 'triangle', 0.08); },
    ready() { tone(880, 0.12, 'triangle', 0.09); tone(1320, 0.18, 'triangle', 0.07); },
    serve() { tone(523, 0.1, 'square', 0.08); tone(659, 0.1, 'square', 0.08); tone(784, 0.16, 'square', 0.09); },
    error() { tone(160, 0.25, 'sawtooth', 0.09, 70); },
    warn() { tone(980, 0.09, 'square', 0.05); tone(980, 0.09, 'square', 0.05); },
    burn() { noise(0.4, 0.16); tone(220, 0.4, 'sawtooth', 0.08, 55); },
    transform() { tone(110, 0.7, 'sawtooth', 0.1, 440); tone(165, 0.7, 'sawtooth', 0.07, 660); },
  };
}
