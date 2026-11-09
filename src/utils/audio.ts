/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Synthesizer for notifications and persistent alarms

let audioCtx: AudioContext | null = null;
let alarmIntervalId: any = null;
let guestAlarmIntervalId: any = null;

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
 * Loud, distinct, modern residence chime (two-tone rich harmonic chime)
 */
export function playNotificationChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Note 1: High crisp ding (880Hz A5 + harmonic 1760Hz)
  const osc1 = ctx.createOscillator();
  const osc1Harm = ctx.createOscillator();
  const gain1 = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, now);
  osc1Harm.type = 'triangle';
  osc1Harm.frequency.setValueAtTime(1760, now);

  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.65, now + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

  osc1.connect(gain1);
  osc1Harm.connect(gain1);
  gain1.connect(ctx.destination);

  osc1.start(now);
  osc1Harm.start(now);
  osc1.stop(now + 0.45);
  osc1Harm.stop(now + 0.45);

  // Note 2: Warm rich dong (659.25Hz E5 + harmonic)
  const osc2 = ctx.createOscillator();
  const osc2Harm = ctx.createOscillator();
  const gain2 = ctx.createGain();

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(659.25, now + 0.18);
  osc2Harm.type = 'triangle';
  osc2Harm.frequency.setValueAtTime(1318.5, now + 0.18);

  gain2.gain.setValueAtTime(0.0001, now + 0.18);
  gain2.gain.linearRampToValueAtTime(0.7, now + 0.21);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

  osc2.connect(gain2);
  osc2Harm.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now + 0.18);
  osc2Harm.start(now + 0.18);
  osc2.stop(now + 0.85);
  osc2Harm.stop(now + 0.85);
}

/**
 * Loud and distinctive 3-tone chime for courier orders & deliveries
 */
export function playOrderAlertChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [659.25, 830.61, 1046.5]; // E5, G#5, C6 (Bright Major Chime)

  frequencies.forEach((freq, idx) => {
    const startTime = now + idx * 0.14;
    const osc = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    oscSub.type = 'triangle';
    oscSub.frequency.setValueAtTime(freq * 2, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.65, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

    osc.connect(gain);
    oscSub.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    oscSub.start(startTime);
    osc.stop(startTime + 0.7);
    oscSub.stop(startTime + 0.7);
  });
}

/**
 * Guest arrival / gate buzzer & melodious chime
 */
export function playGuestAlertChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6

  frequencies.forEach((freq, idx) => {
    const startTime = now + idx * 0.12;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.6, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.6);
  });
}

/**
 * Cargo arrival / custody chime
 */
export function playCargoAlertChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const oscHarm = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.18);
  oscHarm.type = 'triangle';
  oscHarm.frequency.setValueAtTime(1046.5, now + 0.18);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.65, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

  osc.connect(gain);
  oscHarm.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  oscHarm.start(now);
  osc.stop(now + 0.65);
  oscHarm.stop(now + 0.65);
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
 * Starts repeating audible alarm for guest arrival / resident response
 */
export function startGuestAlertAlarm(intervalMs = 3000): void {
  stopGuestAlertAlarm();
  playGuestAlertChime();
  guestAlarmIntervalId = setInterval(() => {
    playGuestAlertChime();
  }, intervalMs);
}

/**
 * Stops repeating audible alarm for guest
 */
export function stopGuestAlertAlarm(): void {
  if (guestAlarmIntervalId) {
    clearInterval(guestAlarmIntervalId);
    guestAlarmIntervalId = null;
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
