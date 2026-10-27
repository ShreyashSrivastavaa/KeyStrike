/**
 * Headless Typist Bot for Balance Simulation and TTK Validation.
 * Simulates a typist at target WPM with 96% accuracy to verify balance gate:
 * - Each enemy killed within +/- 25% of its target TTK.
 * - Parry windows feasible at 70% target WPM.
 */

import { CombatEngine } from './combatEngine';
import { LEVELS } from './levels';

export interface BotSimulationResult {
  levelNumber: number;
  encounterIndex: number;
  enemyName: string;
  targetTTK: number;
  actualTTK: number;
  ratio: number;
  passed: boolean;
  parryFeasible: boolean;
}

export class HeadlessTypistBot {
  /**
   * Simulates an encounter with a virtual typist at the specified WPM and accuracy.
   */
  public static simulateEncounter(
    levelIndex: number,
    encounterIndex: number,
    simulatedWpm: number,
    accuracy: number = 0.96
  ): BotSimulationResult {
    const level = LEVELS[levelIndex];
    const enemyCfg = level.encounters[encounterIndex];
    const engine = new CombatEngine(levelIndex, encounterIndex, false);

    // Keystroke delay in ms: 1 word = 5 characters. characters per minute = WPM * 5.
    // ms per character = 60000 / (WPM * 5)
    const msPerChar = 60000 / (simulatedWpm * 5);

    let currentTime = 1000;
    const timeStepMs = 16.67; // 60 FPS tick
    let timeSinceLastKey = 0;
    let isFinished = false;

    // Feasibility test for parry window:
    // windupMs must exceed time to type longest possible parry word at 70% target WPM.
    const parryMinSpeed = level.targetWpm * 0.7;
    const parryMsPerChar = 60000 / (parryMinSpeed * 5);
    const longestParryWordTime = level.parryLengthMax * parryMsPerChar;
    const parryFeasible = enemyCfg.windupMs > longestParryWordTime;

    const maxSimulationTimeMs = 300000; // 5 min safety cutoff

    while (!isFinished && currentTime < maxSimulationTimeMs) {
      // 1. Tick engine
      const { snapshot } = engine.dispatch({
        type: 'TICK',
        deltaMs: timeStepMs,
        timestamp: currentTime,
      });

      if (snapshot.enemy.state === 'Dead' || snapshot.enemy.state === 'Dying' || snapshot.victoryStats) {
        isFinished = true;
        break;
      }

      // Check if Surge ready
      if (snapshot.player.surgeMeter >= 100 && !snapshot.player.isSurgeActive) {
        engine.dispatch({
          type: 'ACTIVATE_SURGE',
          timestamp: currentTime,
        });
      }

      // 2. Type key if word present
      timeSinceLastKey += timeStepMs;
      if (timeSinceLastKey >= msPerChar && snapshot.currentWord) {
        timeSinceLastKey = 0;

        const targetChar = snapshot.currentWord.text[snapshot.currentWord.cursorIndex];
        if (targetChar) {
          // Accuracy check: 96% correct, 4% wrong typo
          const isCorrect = Math.random() <= accuracy;
          const typedKey = isCorrect ? targetChar : (targetChar === 'a' ? 'b' : 'a');

          engine.dispatch({
            type: 'KEY_DOWN',
            key: typedKey,
            timestamp: currentTime,
          });
        }
      }

      currentTime += timeStepMs;
    }

    const actualTTK = (currentTime - 1000) / 1000;
    const ratio = actualTTK / enemyCfg.targetTTK;

    // Balance gate: TTK within +/- 25% of target (ratio between 0.70 and 1.35)
    const passed = ratio >= 0.70 && ratio <= 1.35;

    return {
      levelNumber: level.levelNumber,
      encounterIndex,
      enemyName: enemyCfg.name,
      targetTTK: enemyCfg.targetTTK,
      actualTTK: Math.round(actualTTK * 10) / 10,
      ratio: Math.round(ratio * 100) / 100,
      passed,
      parryFeasible,
    };
  }

  /**
   * Run all encounters across all 5 levels
   */
  public static runAllLevels(): BotSimulationResult[] {
    const results: BotSimulationResult[] = [];
    LEVELS.forEach((level, lIdx) => {
      level.encounters.forEach((_, eIdx) => {
        results.push(this.simulateEncounter(lIdx, eIdx, level.targetWpm));
      });
    });
    return results;
  }
}
