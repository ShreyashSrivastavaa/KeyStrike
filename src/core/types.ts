/**
 * Pure TypeScript Core Types for Keystrike
 * No Phaser or React dependencies allowed in this file.
 */

export type ScreenState =
  | 'title'
  | 'main_menu'
  | 'level_select'
  | 'pre_level'
  | 'combat'
  | 'pause'
  | 'defeated'
  | 'victory'
  | 'campaign_complete';

export type WordType = 'normal' | 'parry' | 'break' | 'dodge';

export interface WordItem {
  wordId: string;
  text: string;
  type: WordType;
  cursorIndex: number;
  errorCount: number;
  firstKeyTimestamp: number | null;
  completedTimestamp: number | null;
  tier: number;
}

export type EnemyType =
  | 'ink_grunt'
  | 'shuriken_ninja'
  | 'shield_guard'
  | 'crystal_sentinel'
  | 'brute'
  | 'void_acolyte'
  | 'boss';

export type EnemyFSMState =
  | 'Intro'
  | 'Idle'
  | 'Windup'
  | 'Attacking'
  | 'Recovering'
  | 'Staggered'
  | 'PhaseTransition'
  | 'Dying'
  | 'Dead';

export interface BossPhaseConfig {
  thresholdHpPct: number; // e.g. 0.50 (enters phase when HP falls to or below 50%)
  wordTier: number;
  windupMs: number;
  idleMs: number;
  hitDamagePct: number;
  parryCount: number; // number of parry words required in sequence
  description: string;
  enraged?: boolean;
  vanish?: boolean; // P2 of Kage
  flurry?: boolean; // P3 of Kage
  shieldEveryNWords?: number; // Captain Stormhook
  counterStance?: boolean; // Crystal Warden
  armorPlates?: number; // Crystal Warden P3 shatter
  hasShield?: boolean;
  phrasesOnly?: boolean; // Ink Emperor P3
  noSkip?: boolean;
}

export interface EnemyConfig {
  id: string;
  name: string;
  type: EnemyType;
  baseHp: number;
  idleMs: number;
  windupMs: number;
  hitDamagePct: number;
  parryCount: number; // usually 1, or 2 for ninjas / brutes
  hasShield?: boolean;
  hasCounterStance?: boolean;
  isBoss?: boolean;
  bossPhases?: BossPhaseConfig[];
  targetTTK: number; // seconds
}

export interface LevelConfig {
  levelNumber: number;
  name: string;
  subtitle: string;
  description: string;
  theme: 'rooftop' | 'bamboo' | 'harbor' | 'crystal' | 'void';
  wordTier: number;
  targetWpm: number;
  baseIdleMs: number;
  baseWindupMs: number;
  parryLengthMin: number;
  parryLengthMax: number;
  hitDamagePct: number;
  newMechanicTitle: string;
  newMechanicDesc: string;
  parScore: number;
  encounters: EnemyConfig[];
}

export interface PlayerCombatState {
  maxHp: number;
  currentHp: number;
  combo: number;
  longestCombo: number;
  surgeMeter: number; // 0 to 100
  isSurgeActive: boolean;
  surgeTimerRemaining: number; // ms remaining
  totalCorrectKeys: number;
  totalWrongKeys: number;
  wordsCompleted: number;
  parriesAttempted: number;
  parriesLanded: number;
  damageTaken: number;
}

export interface EnemyCombatState {
  config: EnemyConfig;
  maxHp: number;
  currentHp: number;
  state: EnemyFSMState;
  stateTimer: number; // ms elapsed or remaining in current state
  stateDuration: number; // total expected duration in ms
  hasShield: boolean;
  shieldDurationTimer: number;
  counterStanceActive: boolean;
  counterStanceTimer: number;
  armorPlatesRemaining: number;
  isVanished: boolean;
  vanishTimer: number;
  currentPhaseIndex: number;
  parryQueueRemaining: number; // how many parry words needed to clear current windup
  wordCounter: number; // for rules like shield every 3rd word
}

export interface CombatSnapshot {
  screen: ScreenState;
  levelIndex: number;
  encounterIndex: number;
  totalEncounters: number;
  isBossEncounter: boolean;
  bossPhaseIndex: number;
  bossTotalPhases: number;
  player: PlayerCombatState;
  enemy: EnemyCombatState;
  currentWord: WordItem | null;
  nextWord: WordItem | null;
  skipCooldownRemaining: number; // ms
  isPaused: boolean;
  activeCombatTimeMs: number;
  liveWpm: number;
  liveAccuracy: number;
  score: number;
  assistActive: boolean;
  deathsThisEncounter: number;
  showAssistOffer: boolean;
  victoryStats: EncounterResults | null;
}

export interface EncounterResults {
  levelNumber: number;
  levelName: string;
  cleared: boolean;
  stars: number;
  rating: 'S' | 'A' | 'B' | 'C';
  score: number;
  netWpm: number;
  accuracy: number;
  longestCombo: number;
  parriesLanded: number;
  damageTaken: number;
  assistUsed: boolean;
  noDeaths: boolean;
  isNewBestScore: boolean;
  isNewBestStars: boolean;
}

export type CombatEvent =
  | { type: 'KEY_STROKE'; key: string; correct: boolean; errorCount: number; timestamp: number }
  | { type: 'WORD_COMPLETED'; word: WordItem; damage: number; isCrit: boolean; isParry: boolean; isBreak: boolean; timestamp: number }
  | { type: 'ENEMY_DAMAGED'; amount: number; remainingHp: number; maxHp: number; isCrit: boolean; timestamp: number }
  | { type: 'ENEMY_STATE_CHANGE'; oldState: EnemyFSMState; newState: EnemyFSMState; durationMs: number; timestamp: number }
  | { type: 'ENEMY_ATTACK_LANDED'; damage: number; playerRemainingHp: number; timestamp: number }
  | { type: 'PARRY_LANDED'; word: WordItem; comboBonus: number; timestamp: number }
  | { type: 'SHIELD_BROKEN'; timestamp: number }
  | { type: 'COUNTER_PENALTY'; damage: number; timestamp: number }
  | { type: 'SURGE_READY'; timestamp: number }
  | { type: 'SURGE_ACTIVATED'; timestamp: number }
  | { type: 'SURGE_ENDED'; timestamp: number }
  | { type: 'COMBO_MILESTONE'; combo: number; timestamp: number }
  | { type: 'COMBO_RESET'; timestamp: number }
  | { type: 'PHASE_TRANSITION'; phaseIndex: number; bossName: string; timestamp: number }
  | { type: 'ENCOUNTER_WON'; results: EncounterResults; timestamp: number }
  | { type: 'PLAYER_DEFEATED'; deaths: number; offerAssist: boolean; timestamp: number }
  | { type: 'HIT_STOP'; durationMs: number; timestamp: number };

export type CombatAction =
  | { type: 'KEY_DOWN'; key: string; timestamp: number }
  | { type: 'TICK'; deltaMs: number; timestamp: number }
  | { type: 'SKIP_WORD'; timestamp: number }
  | { type: 'ACTIVATE_SURGE'; timestamp: number }
  | { type: 'PAUSE'; timestamp: number }
  | { type: 'RESUME'; timestamp: number }
  | { type: 'START_ENCOUNTER'; levelIndex: number; encounterIndex: number; timestamp: number; assistActive?: boolean }
  | { type: 'RETRY_ENCOUNTER'; timestamp: number; acceptAssist?: boolean }
  | { type: 'NEXT_ENCOUNTER'; timestamp: number };

export interface SavedLevelProgress {
  unlocked: boolean;
  cleared: boolean;
  bestStars: number;
  bestScore: number;
  bestRating: 'S' | 'A' | 'B' | 'C' | '-';
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  clears: number;
}

export interface UserSettings {
  masterVolume: number;
  sfxVolume: number;
  reducedMotion: boolean;
  highContrast: boolean;
  typingFontSize: 'normal' | 'large' | 'extra-large';
}

export interface SavedGameData {
  version: number;
  levels: Record<number, SavedLevelProgress>;
  settings: UserSettings;
}
