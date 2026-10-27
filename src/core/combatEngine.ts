/**
 * Core Combat and Typing Simulation Engine.
 * Pure TypeScript, deterministic, zero DOM/Phaser/React imports.
 * Consumes actions with timestamps and returns immutable snapshots + event arrays.
 */

import {
  CombatSnapshot,
  CombatAction,
  CombatEvent,
  WordItem,
  PlayerCombatState,
  EnemyCombatState,
  EnemyFSMState,
  EncounterResults,
  LevelConfig,
  EnemyConfig
} from './types';
import { WordSelector } from './words';
import { calculateDamage } from './damage';
import { LEVELS } from './levels';
import { calculateRating, calculateStars, recordLevelResult } from './save';

export class CombatEngine {
  private level: LevelConfig;
  private encounterIndex: number;
  private enemyConfig: EnemyConfig;
  private wordSelector: WordSelector;

  private player: PlayerCombatState;
  private enemy: EnemyCombatState;

  private currentWord: WordItem | null = null;
  private nextWord: WordItem | null = null;
  private wordCounterId: number = 0;

  private skipCooldownRemaining: number = 0;
  private isPaused: boolean = false;
  private activeCombatTimeMs: number = 0;
  private assistActive: boolean = false;
  private deathsThisEncounter: number = 0;
  private showAssistOffer: boolean = false;

  private victoryStats: EncounterResults | null = null;
  private isTerminal: boolean = false;

  constructor(levelIndex: number = 0, encounterIndex: number = 0, assist: boolean = false) {
    this.level = LEVELS[levelIndex] || LEVELS[0];
    this.encounterIndex = encounterIndex;
    this.assistActive = assist;
    this.wordSelector = new WordSelector(Date.now() + levelIndex * 100);

    const enemyCfg = this.level.encounters[this.encounterIndex] || this.level.encounters[0];
    this.enemyConfig = enemyCfg;

    this.player = {
      maxHp: 100,
      currentHp: 100,
      combo: 0,
      longestCombo: 0,
      surgeMeter: 0,
      isSurgeActive: false,
      surgeTimerRemaining: 0,
      totalCorrectKeys: 0,
      totalWrongKeys: 0,
      wordsCompleted: 0,
      parriesAttempted: 0,
      parriesLanded: 0,
      damageTaken: 0,
    };

    this.enemy = this.initEnemyState(this.enemyConfig);
    this.initWords();
  }

  private initEnemyState(cfg: EnemyConfig): EnemyCombatState {
    const windup = this.assistActive ? cfg.windupMs * 1.25 : cfg.windupMs;
    const hitDamagePct = this.assistActive ? cfg.hitDamagePct * 0.8 : cfg.hitDamagePct;

    return {
      config: { ...cfg, windupMs: windup, hitDamagePct },
      maxHp: cfg.baseHp,
      currentHp: cfg.baseHp,
      state: 'Idle',
      stateTimer: 0,
      stateDuration: cfg.idleMs,
      hasShield: !!cfg.hasShield,
      shieldDurationTimer: 0,
      counterStanceActive: false,
      counterStanceTimer: 0,
      armorPlatesRemaining: (cfg.isBoss && cfg.bossPhases?.[2]?.armorPlates) ? cfg.bossPhases[2].armorPlates : 0,
      isVanished: false,
      vanishTimer: 0,
      currentPhaseIndex: 0,
      parryQueueRemaining: 0,
      wordCounter: 0,
    };
  }

  private createWord(text: string, type: 'normal' | 'parry' | 'break' | 'dodge', tier: number): WordItem {
    this.wordCounterId++;
    return {
      wordId: `w_${this.wordCounterId}_${Date.now()}`,
      text,
      type,
      cursorIndex: 0,
      errorCount: 0,
      firstKeyTimestamp: null,
      completedTimestamp: null,
      tier,
    };
  }

  private initWords(): void {
    const tier = this.getCurrentWordTier();
    const firstWordText = this.wordSelector.selectWord(tier, false);
    const nextWordText = this.wordSelector.selectWord(tier, false);

    this.currentWord = this.createWord(firstWordText, 'normal', tier);
    this.nextWord = this.createWord(nextWordText, 'normal', tier);
  }

  private getCurrentWordTier(): number {
    if (this.enemy.config.isBoss && this.enemy.config.bossPhases) {
      const phase = this.enemy.config.bossPhases[this.enemy.currentPhaseIndex];
      if (phase?.phrasesOnly) return 6;
      if (phase?.wordTier) return phase.wordTier;
    }
    return this.level.wordTier;
  }

  /**
   * Main dispatch method
   */
  public dispatch(action: CombatAction): { snapshot: CombatSnapshot; events: CombatEvent[] } {
    const events: CombatEvent[] = [];

    switch (action.type) {
      case 'TICK':
        this.handleTick(action.deltaMs, action.timestamp, events);
        break;
      case 'KEY_DOWN':
        this.handleKeyDown(action.key, action.timestamp, events);
        break;
      case 'SKIP_WORD':
        this.handleSkipWord(action.timestamp, events);
        break;
      case 'ACTIVATE_SURGE':
        this.handleActivateSurge(action.timestamp, events);
        break;
      case 'PAUSE':
        this.isPaused = true;
        break;
      case 'RESUME':
        this.isPaused = false;
        break;
      case 'START_ENCOUNTER':
        this.startEncounter(action.levelIndex, action.encounterIndex, action.assistActive ?? false);
        break;
      case 'RETRY_ENCOUNTER':
        this.retryEncounter(action.acceptAssist ?? false);
        break;
      case 'NEXT_ENCOUNTER':
        this.nextEncounter();
        break;
    }

    return {
      snapshot: this.getSnapshot(),
      events,
    };
  }

  private handleKeyDown(key: string, timestamp: number, events: CombatEvent[]): void {
    if (this.isPaused || this.isTerminal) return;
    if (this.enemy.state === 'PhaseTransition' || this.enemy.state === 'Dying' || this.enemy.state === 'Dead') {
      return;
    }
    if (!this.currentWord) return;

    // Normalizing key
    const rawKey = key.toLowerCase();
    const expectedChar = this.currentWord.text[this.currentWord.cursorIndex]?.toLowerCase();

    // Ignore keys like Shift, Control, Alt etc.
    if (key.length > 1) return;

    if (rawKey === expectedChar) {
      // Correct key
      if (this.currentWord.cursorIndex === 0) {
        this.currentWord.firstKeyTimestamp = timestamp;
      }
      this.currentWord.cursorIndex++;
      this.player.totalCorrectKeys++;

      events.push({
        type: 'KEY_STROKE',
        key: rawKey,
        correct: true,
        errorCount: this.currentWord.errorCount,
        timestamp,
      });

      // Check if word completed
      if (this.currentWord.cursorIndex >= this.currentWord.text.length) {
        this.completeCurrentWord(timestamp, events);
      }
    } else {
      // Wrong key
      this.currentWord.errorCount++;
      this.player.totalWrongKeys++;

      // Counter Stance penalty: wrong key costs 4% max HP!
      if (this.enemy.counterStanceActive) {
        const penalty = Math.round(this.player.maxHp * 0.04);
        this.player.currentHp = Math.max(1, this.player.currentHp - penalty);
        this.player.damageTaken += penalty;
        events.push({
          type: 'COUNTER_PENALTY',
          damage: penalty,
          timestamp,
        });
      }

      events.push({
        type: 'KEY_STROKE',
        key: rawKey,
        correct: false,
        errorCount: this.currentWord.errorCount,
        timestamp,
      });
    }
  }

  private completeCurrentWord(timestamp: number, events: CombatEvent[]): void {
    if (!this.currentWord) return;

    this.currentWord.completedTimestamp = timestamp;
    const wordDuration = (this.currentWord.completedTimestamp && this.currentWord.firstKeyTimestamp)
      ? (this.currentWord.completedTimestamp - this.currentWord.firstKeyTimestamp)
      : 800;

    // Calculate Damage
    const isParry = this.currentWord.type === 'parry';
    const isBreak = this.currentWord.type === 'break';

    const dmgResult = calculateDamage({
      wordLength: this.currentWord.text.length,
      wordDurationMs: wordDuration,
      targetWpm: this.level.targetWpm,
      errorCount: this.currentWord.errorCount,
      combo: this.player.combo,
      isSurgeActive: this.player.isSurgeActive,
      isParry,
      isShielded: this.enemy.hasShield,
    });

    // Combo updates: +1 if 2 or fewer errors; reset if >=3
    if (this.currentWord.errorCount <= 2) {
      this.player.combo++;
      if (this.player.combo > this.player.longestCombo) {
        this.player.longestCombo = this.player.combo;
      }
      if (this.player.combo === 5 || this.player.combo === 10 || this.player.combo === 20) {
        events.push({
          type: 'COMBO_MILESTONE',
          combo: this.player.combo,
          timestamp,
        });
      }
    } else {
      this.player.combo = 0;
      events.push({ type: 'COMBO_RESET', timestamp });
    }

    // Surge meter: +10% if perfect, +4% if 1-2 errors, 0% otherwise
    if (!this.player.isSurgeActive) {
      if (this.currentWord.errorCount === 0) {
        this.player.surgeMeter = Math.min(100, this.player.surgeMeter + 10);
      } else if (this.currentWord.errorCount <= 2) {
        this.player.surgeMeter = Math.min(100, this.player.surgeMeter + 4);
      }
      if (this.player.surgeMeter >= 100) {
        events.push({ type: 'SURGE_READY', timestamp });
      }
    }

    this.player.wordsCompleted++;
    this.wordSelector.recordWordResult(this.currentWord.text.length, this.currentWord.errorCount);

    events.push({
      type: 'WORD_COMPLETED',
      word: { ...this.currentWord },
      damage: dmgResult.damage,
      isCrit: dmgResult.isCrit,
      isParry,
      isBreak,
      timestamp,
    });

    // Handle Parry logic
    if (isParry) {
      this.enemy.parryQueueRemaining--;
      this.player.parriesLanded++;
      events.push({
        type: 'PARRY_LANDED',
        word: { ...this.currentWord },
        comboBonus: 50,
        timestamp,
      });

      if (this.enemy.parryQueueRemaining <= 0) {
        // Attack cancelled! Stagger enemy for 800ms
        this.transitionEnemyState('Staggered', 800, events, timestamp);
      }
    }

    // Handle Break logic (drops shield)
    if (isBreak) {
      this.enemy.hasShield = false;
      this.enemy.shieldDurationTimer = 12000; // 12 seconds broken
      if (this.enemy.armorPlatesRemaining > 0) {
        this.enemy.armorPlatesRemaining--;
      }
      events.push({ type: 'SHIELD_BROKEN', timestamp });
    }

    // Apply Damage to Enemy (unless currently invulnerable in PhaseTransition)
    if (this.enemy.state !== 'PhaseTransition') {
      this.applyDamageToEnemy(dmgResult.damage, dmgResult.isCrit, timestamp, events);
    }

    // Shield regeneration mechanic for Captain Stormhook P3
    this.enemy.wordCounter++;
    if (this.enemy.config.isBoss && this.enemy.config.bossPhases) {
      const phase = this.enemy.config.bossPhases[this.enemy.currentPhaseIndex];
      if (phase?.shieldEveryNWords && this.enemy.wordCounter % phase.shieldEveryNWords === 0) {
        this.enemy.hasShield = true;
      }
    }

    // Swap to next word immediately on same frame (no dead input gap)
    this.swapNextWord();
  }

  private applyDamageToEnemy(damage: number, isCrit: boolean, timestamp: number, events: CombatEvent[]): void {
    // Check boss phase thresholds
    if (this.enemy.config.isBoss && this.enemy.config.bossPhases) {
      const nextPhaseIndex = this.enemy.currentPhaseIndex + 1;
      const nextPhase = this.enemy.config.bossPhases[nextPhaseIndex];

      if (nextPhase) {
        const thresholdHp = Math.round(this.enemy.maxHp * nextPhase.thresholdHpPct);
        const hpAfterDamage = this.enemy.currentHp - damage;

        if (hpAfterDamage <= thresholdHp) {
          // Clamp damage to threshold so boss doesn't skip phases
          const effectiveDamage = Math.max(1, this.enemy.currentHp - thresholdHp);
          this.enemy.currentHp = thresholdHp;

          events.push({
            type: 'ENEMY_DAMAGED',
            amount: effectiveDamage,
            remainingHp: this.enemy.currentHp,
            maxHp: this.enemy.maxHp,
            isCrit,
            timestamp,
          });

          // Trigger Phase Transition
          this.startPhaseTransition(nextPhaseIndex, timestamp, events);
          return;
        }
      }
    }

    // Normal damage application
    this.enemy.currentHp = Math.max(0, this.enemy.currentHp - damage);

    events.push({
      type: 'ENEMY_DAMAGED',
      amount: damage,
      remainingHp: this.enemy.currentHp,
      maxHp: this.enemy.maxHp,
      isCrit,
      timestamp,
    });

    if (this.enemy.currentHp <= 0) {
      this.handleEnemyDeath(timestamp, events);
    }
  }

  private startPhaseTransition(nextPhaseIndex: number, timestamp: number, events: CombatEvent[]): void {
    this.enemy.currentPhaseIndex = nextPhaseIndex;
    const phaseCfg = this.enemy.config.bossPhases![nextPhaseIndex];

    this.enemy.hasShield = !!phaseCfg.hasShield;
    if (phaseCfg.armorPlates) {
      this.enemy.armorPlatesRemaining = phaseCfg.armorPlates;
    }

    this.transitionEnemyState('PhaseTransition', 1500, events, timestamp);

    events.push({
      type: 'PHASE_TRANSITION',
      phaseIndex: nextPhaseIndex,
      bossName: this.enemy.config.name,
      timestamp,
    });
  }

  private handleEnemyDeath(timestamp: number, events: CombatEvent[]): void {
    this.transitionEnemyState('Dying', 1000, events, timestamp);
    this.isTerminal = true;

    const isLastEncounter = this.encounterIndex >= this.level.encounters.length - 1;

    // Build victory stats
    const netWpm = this.calculateNetWpm();
    const accuracy = this.calculateAccuracy();
    const score = this.calculateScore();

    const deaths = this.deathsThisEncounter;
    const assistUsed = this.assistActive;
    const stars = calculateStars(
      true,
      accuracy,
      netWpm,
      this.level.targetWpm,
      deaths,
      assistUsed,
      this.player.parriesAttempted,
      this.player.parriesLanded
    );
    const rating = calculateRating(score, this.level.parScore);

    const results: EncounterResults = {
      levelNumber: this.level.levelNumber,
      levelName: this.level.name,
      cleared: true,
      stars,
      rating,
      score,
      netWpm: Math.round(netWpm),
      accuracy: Math.round(accuracy * 100) / 100,
      longestCombo: this.player.longestCombo,
      parriesLanded: this.player.parriesLanded,
      damageTaken: this.player.damageTaken,
      assistUsed,
      noDeaths: deaths === 0,
      isNewBestScore: false,
      isNewBestStars: false,
    };

    if (isLastEncounter) {
      const saveRes = recordLevelResult(results);
      results.isNewBestScore = saveRes.isNewBestScore;
      results.isNewBestStars = saveRes.isNewBestStars;
    }

    this.victoryStats = results;

    events.push({
      type: 'ENCOUNTER_WON',
      results,
      timestamp,
    });
  }

  private swapNextWord(): void {
    if (this.isTerminal) return;

    // Determine type for current word:
    // If enemy is in Windup and parries remain -> word is Parry Word!
    // If enemy is shielded or has armor plates -> break word
    let nextType: 'normal' | 'parry' | 'break' = 'normal';
    let minLen: number | undefined;
    let maxLen: number | undefined;

    if (this.enemy.state === 'Windup' && this.enemy.parryQueueRemaining > 0) {
      nextType = 'parry';
      minLen = this.level.parryLengthMin;
      maxLen = this.level.parryLengthMax;
    } else if (this.enemy.hasShield || this.enemy.armorPlatesRemaining > 0) {
      // Break word every few words or immediately
      nextType = 'break';
    }

    const tier = this.getCurrentWordTier();
    const isParry = nextType === 'parry';

    // If nextWord is already queued and matches needed type, use it; else select fresh
    let wordText: string;
    if (this.nextWord && (nextType === 'normal' || this.nextWord.type === nextType)) {
      wordText = this.nextWord.text;
    } else {
      wordText = this.wordSelector.selectWord(tier, isParry, minLen, maxLen);
    }

    this.currentWord = this.createWord(wordText, nextType, tier);

    // Prepare subsequent nextWord
    const subsequentText = this.wordSelector.selectWord(tier, false);
    this.nextWord = this.createWord(subsequentText, 'normal', tier);
  }

  private handleTick(deltaMs: number, timestamp: number, events: CombatEvent[]): void {
    if (this.isPaused || this.isTerminal) return;

    // Active combat time
    this.activeCombatTimeMs += deltaMs;

    // Skip cooldown
    if (this.skipCooldownRemaining > 0) {
      this.skipCooldownRemaining = Math.max(0, this.skipCooldownRemaining - deltaMs);
    }

    // Surge timer
    if (this.player.isSurgeActive) {
      this.player.surgeTimerRemaining = Math.max(0, this.player.surgeTimerRemaining - deltaMs);
      if (this.player.surgeTimerRemaining <= 0) {
        this.player.isSurgeActive = false;
        this.player.surgeMeter = 0;
        events.push({ type: 'SURGE_ENDED', timestamp });
      }
    }

    // Shield duration timer
    if (this.enemy.shieldDurationTimer > 0) {
      this.enemy.shieldDurationTimer = Math.max(0, this.enemy.shieldDurationTimer - deltaMs);
      if (this.enemy.shieldDurationTimer <= 0 && this.enemy.config.hasShield) {
        this.enemy.hasShield = true;
      }
    }

    // Enemy state timer progression
    // (during Surge, enemy timers run at 60% speed)
    const effectiveEnemyDelta = this.player.isSurgeActive ? deltaMs * 0.6 : deltaMs;
    this.enemy.stateTimer += effectiveEnemyDelta;

    switch (this.enemy.state) {
      case 'Intro':
        if (this.enemy.stateTimer >= this.enemy.stateDuration) {
          this.transitionEnemyState('Idle', this.getEnemyIdleMs(), events, timestamp);
        }
        break;

      case 'Idle':
        // Counter stance cycling for Crystal Sentinel
        if (this.enemy.config.hasCounterStance) {
          this.updateCounterStance(effectiveEnemyDelta);
        }

        if (this.enemy.stateTimer >= this.enemy.stateDuration) {
          this.startEnemyWindup(events, timestamp);
        }
        break;

      case 'Windup':
        if (this.enemy.stateTimer >= this.enemy.stateDuration) {
          // Player failed to parry in time!
          this.executeEnemyAttack(events, timestamp);
        }
        break;

      case 'Attacking':
        if (this.enemy.stateTimer >= this.enemy.stateDuration) {
          this.transitionEnemyState('Recovering', 1000, events, timestamp);
        }
        break;

      case 'Recovering':
      case 'Staggered':
        if (this.enemy.stateTimer >= this.enemy.stateDuration) {
          this.transitionEnemyState('Idle', this.getEnemyIdleMs(), events, timestamp);
        }
        break;

      case 'PhaseTransition':
        if (this.enemy.stateTimer >= this.enemy.stateDuration) {
          this.transitionEnemyState('Idle', this.getEnemyIdleMs(), events, timestamp);
        }
        break;

      case 'Dying':
        if (this.enemy.stateTimer >= this.enemy.stateDuration) {
          this.enemy.state = 'Dead';
        }
        break;

      case 'Dead':
        break;
    }
  }

  private getEnemyIdleMs(): number {
    if (this.enemy.config.isBoss && this.enemy.config.bossPhases) {
      const phase = this.enemy.config.bossPhases[this.enemy.currentPhaseIndex];
      if (phase?.idleMs) return phase.idleMs;
    }
    return this.enemy.config.idleMs;
  }

  private getEnemyWindupMs(): number {
    let windup = this.enemy.config.windupMs;
    if (this.enemy.config.isBoss && this.enemy.config.bossPhases) {
      const phase = this.enemy.config.bossPhases[this.enemy.currentPhaseIndex];
      if (phase?.windupMs) windup = phase.windupMs;
    }
    return this.assistActive ? windup * 1.25 : windup;
  }

  private startEnemyWindup(events: CombatEvent[], timestamp: number): void {
    const windupMs = this.getEnemyWindupMs();
    let parryCount = this.enemy.config.parryCount;

    if (this.enemy.config.isBoss && this.enemy.config.bossPhases) {
      const phase = this.enemy.config.bossPhases[this.enemy.currentPhaseIndex];
      if (phase?.parryCount) parryCount = phase.parryCount;
    }

    this.enemy.parryQueueRemaining = parryCount;
    this.player.parriesAttempted += parryCount;

    this.transitionEnemyState('Windup', windupMs, events, timestamp);

    // Switch current typing word to Parry Word
    const minLen = this.level.parryLengthMin;
    const maxLen = this.level.parryLengthMax;
    const parryText = this.wordSelector.selectWord(this.getCurrentWordTier(), true, minLen, maxLen);
    this.currentWord = this.createWord(parryText, 'parry', this.getCurrentWordTier());
  }

  private executeEnemyAttack(events: CombatEvent[], timestamp: number): void {
    let hitDamagePct = this.enemy.config.hitDamagePct;
    if (this.enemy.config.isBoss && this.enemy.config.bossPhases) {
      const phase = this.enemy.config.bossPhases[this.enemy.currentPhaseIndex];
      if (phase?.hitDamagePct) hitDamagePct = phase.hitDamagePct;
    }

    // Fairness rule: capped at 25% max HP per single hit
    const cappedPct = Math.min(25, hitDamagePct);
    const damage = Math.round(this.player.maxHp * (cappedPct / 100));

    this.player.currentHp = Math.max(0, this.player.currentHp - damage);
    this.player.damageTaken += damage;
    this.player.combo = 0; // Combo resets on hit!

    events.push({
      type: 'ENEMY_ATTACK_LANDED',
      damage,
      playerRemainingHp: this.player.currentHp,
      timestamp,
    });
    events.push({ type: 'COMBO_RESET', timestamp });

    if (this.player.currentHp <= 0) {
      this.handlePlayerDefeat(events, timestamp);
    } else {
      this.transitionEnemyState('Attacking', 500, events, timestamp);
      // Resume normal words
      const tier = this.getCurrentWordTier();
      const normalText = this.wordSelector.selectWord(tier, false);
      this.currentWord = this.createWord(normalText, 'normal', tier);
    }
  }

  private handlePlayerDefeat(events: CombatEvent[], timestamp: number): void {
    this.isTerminal = true;
    this.deathsThisEncounter++;
    const offerAssist = this.deathsThisEncounter >= 3 && !this.assistActive;
    this.showAssistOffer = offerAssist;

    events.push({
      type: 'PLAYER_DEFEATED',
      deaths: this.deathsThisEncounter,
      offerAssist,
      timestamp,
    });
  }

  private updateCounterStance(deltaMs: number): void {
    this.enemy.counterStanceTimer += deltaMs;
    // 4s counter stance active, 4s inactive
    if (this.enemy.counterStanceTimer >= 8000) {
      this.enemy.counterStanceTimer = 0;
      this.enemy.counterStanceActive = false;
    } else if (this.enemy.counterStanceTimer >= 4000) {
      this.enemy.counterStanceActive = true;
    }
  }

  private transitionEnemyState(
    newState: EnemyFSMState,
    durationMs: number,
    events: CombatEvent[],
    timestamp: number
  ): void {
    const oldState = this.enemy.state;
    this.enemy.state = newState;
    this.enemy.stateTimer = 0;
    this.enemy.stateDuration = durationMs;

    events.push({
      type: 'ENEMY_STATE_CHANGE',
      oldState,
      newState,
      durationMs,
      timestamp,
    });
  }

  private handleSkipWord(timestamp: number, events: CombatEvent[]): void {
    if (!this.currentWord || this.skipCooldownRemaining > 0 || this.isPaused || this.isTerminal) return;

    // Rules: Not allowed on Parry Words, Break Words, or boss phrases with noSkip
    if (this.currentWord.type === 'parry' || this.currentWord.type === 'break') {
      return;
    }

    if (this.enemy.config.isBoss && this.enemy.config.bossPhases) {
      const phase = this.enemy.config.bossPhases[this.enemy.currentPhaseIndex];
      if (phase?.noSkip) return;
    }

    // Skip word: resets combo, puts skip on 5s cooldown
    this.player.combo = 0;
    this.skipCooldownRemaining = 5000;

    events.push({ type: 'COMBO_RESET', timestamp });

    // Pick new word
    const tier = this.getCurrentWordTier();
    const newWord = this.wordSelector.selectWord(tier, false);
    this.currentWord = this.createWord(newWord, 'normal', tier);
  }

  private handleActivateSurge(timestamp: number, events: CombatEvent[]): void {
    if (this.player.surgeMeter < 100 || this.player.isSurgeActive || this.isPaused || this.isTerminal) return;

    this.player.isSurgeActive = true;
    this.player.surgeTimerRemaining = 6000; // 6s duration

    events.push({
      type: 'SURGE_ACTIVATED',
      timestamp,
    });
  }

  private startEncounter(levelIndex: number, encounterIndex: number, assist: boolean): void {
    this.level = LEVELS[levelIndex] || LEVELS[0];
    this.encounterIndex = encounterIndex;
    this.assistActive = assist;
    this.isTerminal = false;
    this.isPaused = false;
    this.activeCombatTimeMs = 0;
    this.victoryStats = null;

    const enemyCfg = this.level.encounters[encounterIndex] || this.level.encounters[0];
    this.enemyConfig = enemyCfg;
    this.enemy = this.initEnemyState(enemyCfg);
    this.initWords();
  }

  private retryEncounter(acceptAssist: boolean): void {
    if (acceptAssist) {
      this.assistActive = true;
      this.showAssistOffer = false;
    }

    // Restores HP to larger of checkpoint value and 60
    this.player.currentHp = Math.max(60, this.player.currentHp);
    this.player.combo = 0;
    this.player.isSurgeActive = false;
    this.player.surgeMeter = 0;
    this.isTerminal = false;
    this.isPaused = false;
    this.victoryStats = null;

    this.enemy = this.initEnemyState(this.enemyConfig);
    this.initWords();
  }

  private nextEncounter(): void {
    const nextIdx = this.encounterIndex + 1;
    if (nextIdx < this.level.encounters.length) {
      // Player heals 20 HP between normal encounters
      this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + 20);
      this.startEncounter(this.level.levelNumber - 1, nextIdx, this.assistActive);
    }
  }

  private calculateNetWpm(): number {
    const activeMinutes = Math.max(0.1, this.activeCombatTimeMs / 60000);
    return (this.player.totalCorrectKeys / 5) / activeMinutes;
  }

  private calculateAccuracy(): number {
    const total = this.player.totalCorrectKeys + this.player.totalWrongKeys;
    if (total === 0) return 1.0;
    return this.player.totalCorrectKeys / total;
  }

  private calculateScore(): number {
    // Score based on Section H:
    // length x 10 x ComboMult x (1.5 if crit), Parry +50, encounter clear +200
    const baseWordPoints = this.player.wordsCompleted * 50;
    const parryPoints = this.player.parriesLanded * 50;
    const comboBonus = this.player.longestCombo * 20;
    const clearBonus = 200;
    return baseWordPoints + parryPoints + comboBonus + clearBonus;
  }

  public getSnapshot(): CombatSnapshot {
    return {
      screen: this.isTerminal ? (this.player.currentHp <= 0 ? 'defeated' : 'victory') : 'combat',
      levelIndex: this.level.levelNumber - 1,
      encounterIndex: this.encounterIndex,
      totalEncounters: this.level.encounters.length,
      isBossEncounter: !!this.enemy.config.isBoss,
      bossPhaseIndex: this.enemy.currentPhaseIndex,
      bossTotalPhases: this.enemy.config.bossPhases ? this.enemy.config.bossPhases.length : 1,
      player: { ...this.player },
      enemy: { ...this.enemy },
      currentWord: this.currentWord ? { ...this.currentWord } : null,
      nextWord: this.nextWord ? { ...this.nextWord } : null,
      skipCooldownRemaining: this.skipCooldownRemaining,
      isPaused: this.isPaused,
      activeCombatTimeMs: this.activeCombatTimeMs,
      liveWpm: Math.round(this.calculateNetWpm()),
      liveAccuracy: Math.round(this.calculateAccuracy() * 100),
      score: this.calculateScore(),
      assistActive: this.assistActive,
      deathsThisEncounter: this.deathsThisEncounter,
      showAssistOffer: this.showAssistOffer,
      victoryStats: this.victoryStats,
    };
  }
}
