/**
 * Persistence layer for Keystrike
 * Handles localStorage with schema versioning and star / rating calculations.
 */

import { SavedGameData, SavedLevelProgress, UserSettings, EncounterResults } from './types';
import { LEVELS } from './levels';

const SAVE_KEY = 'keystrike_save_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.8,
  reducedMotion: false,
  highContrast: false,
  typingFontSize: 'normal',
};

export const INITIAL_SAVE_DATA: SavedGameData = {
  version: 1,
  levels: {
    1: { unlocked: true, cleared: false, bestStars: 0, bestScore: 0, bestRating: '-', bestWpm: 0, bestAccuracy: 0, attempts: 0, clears: 0 },
    2: { unlocked: false, cleared: false, bestStars: 0, bestScore: 0, bestRating: '-', bestWpm: 0, bestAccuracy: 0, attempts: 0, clears: 0 },
    3: { unlocked: false, cleared: false, bestStars: 0, bestScore: 0, bestRating: '-', bestWpm: 0, bestAccuracy: 0, attempts: 0, clears: 0 },
    4: { unlocked: false, cleared: false, bestStars: 0, bestScore: 0, bestRating: '-', bestWpm: 0, bestAccuracy: 0, attempts: 0, clears: 0 },
    5: { unlocked: false, cleared: false, bestStars: 0, bestScore: 0, bestRating: '-', bestWpm: 0, bestAccuracy: 0, attempts: 0, clears: 0 },
  },
  settings: { ...DEFAULT_SETTINGS },
};

export function loadGameData(): SavedGameData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return INITIAL_SAVE_DATA;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) {
      return INITIAL_SAVE_DATA;
    }
    return {
      version: 1,
      levels: { ...INITIAL_SAVE_DATA.levels, ...(parsed.levels || {}) },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    };
  } catch {
    return INITIAL_SAVE_DATA;
  }
}

export function saveGameData(data: SavedGameData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to write to localStorage', err);
  }
}

export function resetGameData(): SavedGameData {
  const fresh = JSON.parse(JSON.stringify(INITIAL_SAVE_DATA));
  saveGameData(fresh);
  return fresh;
}

/**
 * Calculates rating:
 * S at >= 1.0 par score
 * A at >= 0.8
 * B at >= 0.6
 * C otherwise
 */
export function calculateRating(score: number, parScore: number): 'S' | 'A' | 'B' | 'C' {
  const ratio = parScore > 0 ? score / parScore : 1.0;
  if (ratio >= 1.0) return 'S';
  if (ratio >= 0.8) return 'A';
  if (ratio >= 0.6) return 'B';
  return 'C';
}

/**
 * Calculates stars earned based on Section H:
 * 1 Star: Clearing the level
 * 2 Stars: Accuracy >= 92% and avg WPM >= 90% target WPM
 * 3 Stars: Accuracy >= 96%, avg WPM >= 115% target WPM, no deaths, no Assist, and at least 70% parries landed.
 * Note: Deaths or Assist caps stars at 2.
 */
export function calculateStars(
  cleared: boolean,
  accuracy: number,
  netWpm: number,
  targetWpm: number,
  deaths: number,
  assistUsed: boolean,
  parriesAttempted: number,
  parriesLanded: number
): number {
  if (!cleared) return 0;

  let stars = 1;

  const meetsTwoStar = (accuracy >= 0.92) && (netWpm >= targetWpm * 0.90);
  if (meetsTwoStar) {
    stars = 2;
  }

  // 3-star check
  const parryRatio = parriesAttempted > 0 ? (parriesLanded / parriesAttempted) : 1.0;
  const meetsThreeStar =
    accuracy >= 0.96 &&
    netWpm >= targetWpm * 1.15 &&
    deaths === 0 &&
    !assistUsed &&
    parryRatio >= 0.70;

  if (meetsThreeStar) {
    stars = 3;
  } else if (deaths > 0 || assistUsed) {
    // Deaths or assist caps at 2 stars
    stars = Math.min(stars, 2);
  }

  return stars;
}

export function recordLevelResult(results: EncounterResults): {
  updatedData: SavedGameData;
  isNewBestScore: boolean;
  isNewBestStars: boolean;
} {
  const current = loadGameData();
  const lvlNum = results.levelNumber;
  const prev = current.levels[lvlNum] || {
    unlocked: true,
    cleared: false,
    bestStars: 0,
    bestScore: 0,
    bestRating: '-',
    bestWpm: 0,
    bestAccuracy: 0,
    attempts: 0,
    clears: 0,
  };

  const isNewBestScore = results.score > prev.bestScore;
  const isNewBestStars = results.stars > prev.bestStars;

  const updatedLevel: SavedLevelProgress = {
    unlocked: true,
    cleared: prev.cleared || results.cleared,
    bestStars: Math.max(prev.bestStars, results.stars),
    bestScore: Math.max(prev.bestScore, results.score),
    bestRating: isNewBestScore ? results.rating : prev.bestRating,
    bestWpm: Math.max(prev.bestWpm, results.netWpm),
    bestAccuracy: Math.max(prev.bestAccuracy, results.accuracy),
    attempts: prev.attempts + 1,
    clears: results.cleared ? prev.clears + 1 : prev.clears,
  };

  current.levels[lvlNum] = updatedLevel;

  // Unlock next level if cleared
  if (results.cleared && lvlNum < LEVELS.length) {
    const nextLvlNum = lvlNum + 1;
    if (current.levels[nextLvlNum]) {
      current.levels[nextLvlNum].unlocked = true;
    }
  }

  saveGameData(current);

  return {
    updatedData: current,
    isNewBestScore,
    isNewBestStars,
  };
}
