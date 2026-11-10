// Browser Vibration API & Tactical Screen Shake Feedback Service
export type HapticPattern = 'tick' | 'light' | 'medium' | 'heavy' | 'pulse' | 'launch';
export type ShakeIntensity = 'subtle' | 'medium' | 'impact';

const HAPTIC_TIMINGS: Record<HapticPattern, number | number[]> = {
  tick: 8,
  light: 15,
  medium: 28,
  heavy: 45,
  pulse: [25, 30, 35],
  launch: [35, 40, 75]
};

class TacticalFeedbackService {
  private hapticsEnabled: boolean = true;
  private shakeEnabled: boolean = true;

  constructor() {
    try {
      const savedHaptics = localStorage.getItem('reyplace_haptics_enabled');
      if (savedHaptics !== null) {
        this.hapticsEnabled = savedHaptics === 'true';
      }
      const savedShake = localStorage.getItem('reyplace_shake_enabled');
      if (savedShake !== null) {
        this.shakeEnabled = savedShake === 'true';
      }
    } catch {}
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
    try {
      localStorage.setItem('reyplace_haptics_enabled', String(enabled));
    } catch {}
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  public setShakeEnabled(enabled: boolean) {
    this.shakeEnabled = enabled;
    try {
      localStorage.setItem('reyplace_shake_enabled', String(enabled));
    } catch {}
  }

  public isShakeEnabled(): boolean {
    return this.shakeEnabled;
  }

  /**
   * Triggers mobile browser vibration
   */
  public vibrate(pattern: HapticPattern = 'light') {
    if (!this.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        const timing = HAPTIC_TIMINGS[pattern];
        navigator.vibrate(timing);
      } catch {}
    }
  }

  /**
   * Triggers subtle tactical screen/element shake animation
   */
  public shake(intensity: ShakeIntensity = 'subtle') {
    if (!this.shakeEnabled) return;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('reyplace-tactical-shake', {
          detail: { intensity }
        })
      );
    }
  }

  /**
   * Trigger both haptic vibration and screen shake simultaneously
   */
  public trigger(pattern: HapticPattern = 'light', intensity: ShakeIntensity = 'subtle') {
    this.vibrate(pattern);
    this.shake(intensity);
  }
}

export const tacticalFeedback = new TacticalFeedbackService();

export function useTacticalFeedback() {
  return {
    vibrate: (pattern: HapticPattern) => tacticalFeedback.vibrate(pattern),
    shake: (intensity: ShakeIntensity) => tacticalFeedback.shake(intensity),
    trigger: (pattern: HapticPattern, intensity: ShakeIntensity) =>
      tacticalFeedback.trigger(pattern, intensity),
    setHapticsEnabled: (e: boolean) => tacticalFeedback.setHapticsEnabled(e),
    setShakeEnabled: (e: boolean) => tacticalFeedback.setShakeEnabled(e),
    isHapticsEnabled: () => tacticalFeedback.isHapticsEnabled(),
    isShakeEnabled: () => tacticalFeedback.isShakeEnabled()
  };
}
