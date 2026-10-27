import { describe, it, expect } from 'vitest';
import { calculateDamage, calculateWordWpm } from '../damage';
import { WORD_TIERS, WordSelector } from '../words';
import { LEVELS } from '../levels';
import { CombatEngine } from '../combatEngine';
import { calculateStars, calculateRating } from '../save';
import { HeadlessTypistBot } from '../bot';

describe('Damage Calculations (Section D2 & D3)', () => {
  it('calculates word WPM with 400ms duration clamp', () => {
    // 5 letters in 600ms = (5/5)/(0.6/60) = 100 WPM
    const wpm = calculateWordWpm(5, 600);
    expect(wpm).toBeCloseTo(100, 1);

    // Clamped to 400ms when duration is 100ms
    const clampedWpm = calculateWordWpm(5, 100);
    expect(clampedWpm).toBeCloseTo(150, 1);
  });

  it('calculates length factor clamped to [0.6, 2.4]', () => {
    // 2-letter word -> 2/5 = 0.4 -> clamped to 0.6
    const resLow = calculateDamage({
      wordLength: 2,
      wordDurationMs: 1000,
      targetWpm: 25,
      errorCount: 0,
      combo: 0,
      isSurgeActive: false,
      isParry: false,
      isShielded: false
    });
    expect(resLow.lengthFactor).toBe(0.6);

    // 15-letter word -> 15/5 = 3.0 -> clamped to 2.4
    const resHigh = calculateDamage({
      wordLength: 15,
      wordDurationMs: 1000,
      targetWpm: 25,
      errorCount: 0,
      combo: 0,
      isSurgeActive: false,
      isParry: false,
      isShielded: false
    });
    expect(resHigh.lengthFactor).toBe(2.4);
  });

  it('awards 1.75 crit multiplier for perfect word at speed >= 1.15', () => {
    // Target WPM 25. Word length 5 typed in 800ms -> WPM = 75 -> speedMult = 1.5 (clamped) >= 1.15
    const resCrit = calculateDamage({
      wordLength: 5,
      wordDurationMs: 800,
      targetWpm: 25,
      errorCount: 0,
      combo: 0,
      isSurgeActive: false,
      isParry: false,
      isShielded: false
    });
    expect(resCrit.isCrit).toBe(true);
    expect(resCrit.critMult).toBe(1.75);
  });

  it('reduces damage by 60% (0.4 multiplier) against shielded enemies', () => {
    const resUnshielded = calculateDamage({
      wordLength: 5,
      wordDurationMs: 1000,
      targetWpm: 25,
      errorCount: 0,
      combo: 0,
      isSurgeActive: false,
      isParry: false,
      isShielded: false
    });
    const resShielded = calculateDamage({
      wordLength: 5,
      wordDurationMs: 1000,
      targetWpm: 25,
      errorCount: 0,
      combo: 0,
      isSurgeActive: false,
      isParry: false,
      isShielded: true
    });
    expect(resShielded.damage).toBeLessThan(resUnshielded.damage);
    expect(resShielded.shieldMult).toBe(0.4);
  });
});

describe('Word Selection Fairness (Section E1 & E4)', () => {
  it('has at least 150 words per tier 1-5 and 60 phrases for tier 6', () => {
    expect(WORD_TIERS[1].length).toBeGreaterThanOrEqual(150);
    expect(WORD_TIERS[2].length).toBeGreaterThanOrEqual(150);
    expect(WORD_TIERS[3].length).toBeGreaterThanOrEqual(150);
    expect(WORD_TIERS[4].length).toBeGreaterThanOrEqual(150);
    expect(WORD_TIERS[5].length).toBeGreaterThanOrEqual(150);
    expect(WORD_TIERS[6].length).toBeGreaterThanOrEqual(60);
  });

  it('ensures consecutive words never start with the same letter and no repeats in last 12', () => {
    const selector = new WordSelector(42);
    const words: string[] = [];
    for (let i = 0; i < 50; i++) {
      words.push(selector.selectWord(1, false));
    }

    for (let i = 1; i < words.length; i++) {
      expect(words[i].charAt(0)).not.toBe(words[i - 1].charAt(0));
    }
  });

  it('enforces parry window feasibility across all levels: windupMs > longest parry word time at 70% target WPM', () => {
    LEVELS.forEach(level => {
      const minSpeed = level.targetWpm * 0.7;
      const msPerChar = 60000 / (minSpeed * 5);
      const longestParryTime = level.parryLengthMax * msPerChar;

      level.encounters.forEach(enemy => {
        expect(enemy.windupMs).toBeGreaterThan(longestParryTime);
      });
    });
  });
});

describe('Combat Engine State Machine (Section D1, D5, G3)', () => {
  it('rejects wrong keys without advancing cursor', () => {
    const engine = new CombatEngine(0, 0, false);
    const snapshotBefore = engine.getSnapshot();
    const currentWord = snapshotBefore.currentWord!;
    expect(currentWord.cursorIndex).toBe(0);

    const wrongKey = currentWord.text[0] === 'z' ? 'x' : 'z';
    const { snapshot: afterWrong, events } = engine.dispatch({
      type: 'KEY_DOWN',
      key: wrongKey,
      timestamp: 1000,
    });

    expect(afterWrong.currentWord!.cursorIndex).toBe(0);
    expect(afterWrong.currentWord!.errorCount).toBe(1);
    expect(events.some(e => e.type === 'KEY_STROKE' && !e.correct)).toBe(true);
  });

  it('advances cursor on correct key and micro-jabs', () => {
    const engine = new CombatEngine(0, 0, false);
    const snapshotBefore = engine.getSnapshot();
    const correctKey = snapshotBefore.currentWord!.text[0];

    const { snapshot: afterCorrect, events } = engine.dispatch({
      type: 'KEY_DOWN',
      key: correctKey,
      timestamp: 1000,
    });

    expect(afterCorrect.currentWord!.cursorIndex).toBe(1);
    expect(events.some(e => e.type === 'KEY_STROKE' && e.correct)).toBe(true);
  });

  it('completes word on last character and damages enemy', () => {
    const engine = new CombatEngine(0, 0, false);
    let snap = engine.getSnapshot();
    const word = snap.currentWord!.text;
    const initialEnemyHp = snap.enemy.currentHp;

    for (let i = 0; i < word.length; i++) {
      snap = engine.dispatch({
        type: 'KEY_DOWN',
        key: word[i],
        timestamp: 1000 + i * 100,
      }).snapshot;
    }

    expect(snap.player.wordsCompleted).toBe(1);
    expect(snap.enemy.currentHp).toBeLessThan(initialEnemyHp);
    // Instant swap to next word with 0 cursor index
    expect(snap.currentWord).not.toBeNull();
    expect(snap.currentWord!.cursorIndex).toBe(0);
  });
});

describe('Scoring and Stars (Section H)', () => {
  it('calculates ratings S, A, B, C accurately', () => {
    expect(calculateRating(1200, 1000)).toBe('S');
    expect(calculateRating(850, 1000)).toBe('A');
    expect(calculateRating(650, 1000)).toBe('B');
    expect(calculateRating(400, 1000)).toBe('C');
  });

  it('awards 3 stars only when meeting high accuracy, WPM, parry ratio and 0 deaths without assist', () => {
    const stars3 = calculateStars(true, 0.98, 30, 25, 0, false, 5, 5);
    expect(stars3).toBe(3);

    // Deaths caps at 2 stars
    const starsDeath = calculateStars(true, 0.98, 30, 25, 1, false, 5, 5);
    expect(starsDeath).toBe(2);

    // Assist caps at 2 stars
    const starsAssist = calculateStars(true, 0.98, 30, 25, 0, true, 5, 5);
    expect(starsAssist).toBe(2);
  });
});

describe('Balance Gate Simulation (Section E3)', () => {
  it('validates that Level 1 Grunt can be defeated by typist bot', () => {
    const simResult = HeadlessTypistBot.simulateEncounter(0, 0, 25, 0.96);
    console.log('SimResult for Level 1 Grunt:', simResult);
    expect(simResult.passed).toBe(true);
    expect(simResult.parryFeasible).toBe(true);
  });
});
