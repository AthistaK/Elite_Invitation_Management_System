// Web Audio API Sound Synthesizer for EIMS Notifications
let audioCtx: AudioContext | null = null;
let audioContextInitialized = false;

// Initialize AudioContext upon first user interaction to comply with browser autoplay policies
function initAudioContext() {
  if (audioContextInitialized) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      audioContextInitialized = true;
    }
  } catch (err) {
    console.warn('Web Audio API not supported in this browser:', err);
  }
}

// User interaction listener to resume AudioContext
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

const SOUND_STORAGE_KEY = 'eims_sound_enabled';

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  return stored !== 'false';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
}

export function toggleSoundEnabled(): boolean {
  const nextState = !isSoundEnabled();
  setSoundEnabled(nextState);
  return nextState;
}

export function playNotificationSound(): void {
  if (!isSoundEnabled()) return;

  try {
    initAudioContext();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => playChimeSequence(audioCtx!)).catch(() => {});
    } else {
      playChimeSequence(audioCtx);
    }
  } catch (err) {
    console.warn('Failed to play notification sound:', err);
  }
}

function playChimeSequence(ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Tone 1: C5 (523.25 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(523.25, now);
  gain1.gain.setValueAtTime(0.15, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.2);

  // Tone 2: E5 (659.25 Hz) - 0.1s delay
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(659.25, now + 0.1);
  gain2.gain.setValueAtTime(0.2, now + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.1);
  osc2.stop(now + 0.35);
}
