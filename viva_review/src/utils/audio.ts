/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Synthesizer for notifications and persistent alarms

let audioCtx: AudioContext | null = null;
let alarmIntervalId: any = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('Web Audio API not supported or suspended', e);
    return null;
  }
}

/**
 * Pleasant modern notification chime (two-tone melodic chime)
 */
export function playNotificationChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(587.33, now); // D5
  osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(440, now); // A4
  osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.25); // E5

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.55);
  osc2.stop(now + 0.55);
}

/**
 * Single chime for new order arrival
 */
export function playOrderAlertChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
  osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
  osc.frequency.setValueAtTime(1046.5, now + 0.36); // C6

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.7);
}

/**
 * Guest arrival / notification chime
 */
export function playGuestAlertChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
  osc.frequency.setValueAtTime(783.99, now + 0.3); // G5

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.6);
}

/**
 * Cargo arrival / preference update chime
 */
export function playCargoAlertChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now); // A4
  osc.frequency.setValueAtTime(554.37, now + 0.12); // C#5
  osc.frequency.setValueAtTime(659.25, now + 0.24); // E5
  osc.frequency.setValueAtTime(880, now + 0.36); // A5

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.7);
}

/**
 * Starts repeating audible alarm every intervalMs until stopOrderAlertAlarm is called.
 * Requirement 5: "Bildirim, güvenlik görevlisi TAMAM butonuna basana kadar tekrar sesli uyarı versin."
 */
export function startOrderAlertAlarm(intervalMs = 3000): void {
  stopOrderAlertAlarm();
  playOrderAlertChime();
  alarmIntervalId = setInterval(() => {
    playOrderAlertChime();
  }, intervalMs);
}

/**
 * Stops repeating audible alarm when TAMAM is pressed
 */
export function stopOrderAlertAlarm(): void {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
}

/**
 * Success action confirmation sound
 */
export function playSuccessChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.32);
}

/**
 * Mystic Instrumental Guest Notification Tone (Ethereal multi-harmonic synthesizer)
 * Plays soothing pentatonic chime chords
 */
export function playMysticGuestAlertChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.15 / (idx + 1), now + idx * 0.12 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + 1.25);
  });
}

