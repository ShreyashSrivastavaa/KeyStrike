/**
 * Damage Calculation Engine according to Keystrike Game Spec D2 & D3.
 * Pure math functions with zero external dependencies.
 */

export interface DamageCalculationParams {
  wordLength: number;
  wordDurationMs: number;
  targetWpm: number;
  errorCount: number;
  combo: number;
  isSurgeActive: boolean;
  isParry: boolean;
  isShielded: boolean;
}

export interface DamageResult {
  damage: number;
  wordWpm: number;
  lengthFactor: number;
  speedMult: number;
  accuracyMult: number;
  comboMult: number;
  critMult: number;
  surgeMult: number;
  parryMult: number;
  shieldMult: number;
  isCrit: boolean;
}

export const BASE_DAMAGE = 10;

/**
 * Calculates Word WPM: (word length / 5) / (duration in minutes)
 * Duration clamped to at least 400 ms.
 */
export function calculateWordWpm(wordLength: number, durationMs: number): number {
  const clampedDurationMs = Math.max(400, durationMs);
  const durationMinutes = clampedDurationMs / 60000;
  return (wordLength / 5) / durationMinutes;
}

/**
 * Calculates Damage per completed word:
 * round(BaseDamage * LengthFactor * SpeedMult * AccuracyMult * ComboMult * CritMult * SurgeMult * ParryMult * ShieldMult)
 */
export function calculateDamage(params: DamageCalculationParams): DamageResult {
  const {
    wordLength,
    wordDurationMs,
    targetWpm,
    errorCount,
    combo,
    isSurgeActive,
    isParry,
    isShielded
  } = params;

  // 1. Length Factor: word length / 5, clamped [0.6, 2.4]
  const rawLengthFactor = wordLength / 5;
  const lengthFactor = Math.min(2.4, Math.max(0.6, rawLengthFactor));

  // 2. Word WPM & SpeedMult: word WPM / target WPM, clamped [0.8, 1.5]
  const wordWpm = calculateWordWpm(wordLength, wordDurationMs);
  const rawSpeedMult = targetWpm > 0 ? wordWpm / targetWpm : 1.0;
  const speedMult = Math.min(1.5, Math.max(0.8, rawSpeedMult));

  // 3. AccuracyMult: 1.10 if 0 errors, else 1.0 - 0.10 * errors, floor 0.5
  let accuracyMult: number;
  if (errorCount === 0) {
    accuracyMult = 1.10;
  } else {
    accuracyMult = Math.max(0.5, 1.0 - (0.10 * errorCount));
  }

  // 4. ComboMult: 1 + 0.025 * min(combo, 20), max 1.5
  const effectiveCombo = Math.min(combo, 20);
  const comboMult = Math.min(1.5, 1 + 0.025 * effectiveCombo);

  // 5. CritMult: 1.75 if 0 errors and SpeedMult >= 1.15, else 1.0
  const isCrit = (errorCount === 0 && speedMult >= 1.15);
  const critMult = isCrit ? 1.75 : 1.0;

  // 6. SurgeMult: 1.5 if active, else 1.0
  const surgeMult = isSurgeActive ? 1.5 : 1.0;

  // 7. ParryMult: 1.25 for successful parry, else 1.0
  const parryMult = isParry ? 1.25 : 1.0;

  // 8. ShieldMult: 0.4 against shielded enemy, else 1.0
  const shieldMult = isShielded ? 0.4 : 1.0;

  // Final damage
  const rawDamage = BASE_DAMAGE *
    lengthFactor *
    speedMult *
    accuracyMult *
    comboMult *
    critMult *
    surgeMult *
    parryMult *
    shieldMult;

  const damage = Math.max(1, Math.round(rawDamage));

  return {
    damage,
    wordWpm,
    lengthFactor,
    speedMult,
    accuracyMult,
    comboMult,
    critMult,
    surgeMult,
    parryMult,
    shieldMult,
    isCrit
  };
}
