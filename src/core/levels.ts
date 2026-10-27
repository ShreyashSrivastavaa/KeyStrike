/**
 * Level Configurations and Enemy Definitions.
 * Complete data specification for all 5 levels, enemies, and multi-phase bosses.
 */

import { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: 'Rooftop Dojo',
    subtitle: 'Ink at Twilight',
    description: 'Dusk falls over the city skyline. Lanterns flicker as ink soldiers test your fundamentals.',
    theme: 'rooftop',
    wordTier: 1,
    targetWpm: 25,
    baseIdleMs: 5000,
    baseWindupMs: 2800,
    parryLengthMin: 3,
    parryLengthMax: 4,
    hitDamagePct: 10,
    newMechanicTitle: 'Wind-up & Parry Words',
    newMechanicDesc: 'Enemies wind up red telegraph bars. Complete the red Parry Word before the bar empties to stagger them and cancel their attack!',
    parScore: 1200,
    encounters: [
      {
        id: 'l1_grunt_1',
        name: 'Ink Grunt',
        type: 'ink_grunt',
        baseHp: 95,
        idleMs: 5000,
        windupMs: 2800,
        hitDamagePct: 10,
        parryCount: 1,
        targetTTK: 12
      },
      {
        id: 'l1_grunt_2',
        name: 'Ink Grunt',
        type: 'ink_grunt',
        baseHp: 95,
        idleMs: 4800,
        windupMs: 2800,
        hitDamagePct: 10,
        parryCount: 1,
        targetTTK: 12
      },
      {
        id: 'l1_grunt_3',
        name: 'Ink Grunt',
        type: 'ink_grunt',
        baseHp: 100,
        idleMs: 4600,
        windupMs: 2800,
        hitDamagePct: 10,
        parryCount: 1,
        targetTTK: 13
      },
      {
        id: 'l1_boss_gorou',
        name: 'Gorou the Iron Fist',
        type: 'boss',
        isBoss: true,
        baseHp: 260,
        idleMs: 4500,
        windupMs: 3000,
        hitDamagePct: 12,
        parryCount: 1,
        targetTTK: 80,
        bossPhases: [
          {
            thresholdHpPct: 0.50,
            wordTier: 1,
            idleMs: 4500,
            windupMs: 3000,
            hitDamagePct: 12,
            parryCount: 1,
            description: 'Phase 1: Heavy Iron Punch'
          },
          {
            thresholdHpPct: 0.0,
            wordTier: 1,
            idleMs: 3800,
            windupMs: 2400,
            hitDamagePct: 15,
            parryCount: 2,
            enraged: true,
            description: 'Phase 2: Enraged Barrage'
          }
        ]
      }
    ]
  },
  {
    levelNumber: 2,
    name: 'Bamboo Hollow',
    subtitle: 'Moonlit Shinobi',
    description: 'Silver moonlight filters through dense bamboo. Silent shadows strike with blinding speed.',
    theme: 'bamboo',
    wordTier: 2,
    targetWpm: 35,
    baseIdleMs: 4500,
    baseWindupMs: 2600,
    parryLengthMin: 3,
    parryLengthMax: 5,
    hitDamagePct: 12,
    newMechanicTitle: 'Double Parry Volley',
    newMechanicDesc: 'Shuriken volleys require typing TWO Parry Words in sequence inside the same wind-up window!',
    parScore: 2400,
    encounters: [
      {
        id: 'l2_grunt',
        name: 'Ink Grunt',
        type: 'ink_grunt',
        baseHp: 70,
        idleMs: 4500,
        windupMs: 2600,
        hitDamagePct: 12,
        parryCount: 1,
        targetTTK: 15
      },
      {
        id: 'l2_ninja_1',
        name: 'Shuriken Ninja',
        type: 'shuriken_ninja',
        baseHp: 90,
        idleMs: 3800,
        windupMs: 2600,
        hitDamagePct: 12,
        parryCount: 2,
        targetTTK: 18
      },
      {
        id: 'l2_ninja_2',
        name: 'Shuriken Ninja',
        type: 'shuriken_ninja',
        baseHp: 95,
        idleMs: 3600,
        windupMs: 2600,
        hitDamagePct: 12,
        parryCount: 2,
        targetTTK: 19
      },
      {
        id: 'l2_boss_kage',
        name: 'Kage the Shadow',
        type: 'boss',
        isBoss: true,
        baseHp: 395,
        idleMs: 4000,
        windupMs: 2600,
        hitDamagePct: 14,
        parryCount: 2,
        targetTTK: 85,
        bossPhases: [
          {
            thresholdHpPct: 0.66,
            wordTier: 2,
            idleMs: 4000,
            windupMs: 2600,
            hitDamagePct: 14,
            parryCount: 2,
            description: 'Phase 1: Shuriken Volley'
          },
          {
            thresholdHpPct: 0.33,
            wordTier: 2,
            idleMs: 3500,
            windupMs: 2300,
            hitDamagePct: 16,
            parryCount: 1,
            vanish: true,
            description: 'Phase 2: Vanish & Surprise Strike'
          },
          {
            thresholdHpPct: 0.0,
            wordTier: 2,
            idleMs: 3000,
            windupMs: 1800,
            hitDamagePct: 18,
            parryCount: 1,
            flurry: true,
            description: 'Phase 3: Triple Flurry'
          }
        ]
      }
    ]
  },
  {
    levelNumber: 3,
    name: 'Storm Harbor',
    subtitle: 'Pier of the Tempest',
    description: 'Torrential rain batters the wooden docks as lightning fractures the stormy night sky.',
    theme: 'harbor',
    wordTier: 3,
    targetWpm: 45,
    baseIdleMs: 4200,
    baseWindupMs: 2300,
    parryLengthMin: 4,
    parryLengthMax: 5,
    hitDamagePct: 14,
    newMechanicTitle: 'Shield & Break Words',
    newMechanicDesc: 'Shielded enemies reduce all damage by 60%. Type the gold BREAK word to shatter the shield for 12 seconds!',
    parScore: 3600,
    encounters: [
      {
        id: 'l3_ninja',
        name: 'Shuriken Ninja',
        type: 'shuriken_ninja',
        baseHp: 105,
        idleMs: 3800,
        windupMs: 2300,
        hitDamagePct: 14,
        parryCount: 2,
        targetTTK: 16
      },
      {
        id: 'l3_shield_1',
        name: 'Shield Guard',
        type: 'shield_guard',
        baseHp: 145,
        idleMs: 4200,
        windupMs: 2300,
        hitDamagePct: 14,
        parryCount: 1,
        hasShield: true,
        targetTTK: 22
      },
      {
        id: 'l3_shield_2',
        name: 'Shield Guard',
        type: 'shield_guard',
        baseHp: 150,
        idleMs: 4000,
        windupMs: 2300,
        hitDamagePct: 14,
        parryCount: 1,
        hasShield: true,
        targetTTK: 23
      },
      {
        id: 'l3_boss_stormhook',
        name: 'Captain Stormhook',
        type: 'boss',
        isBoss: true,
        baseHp: 535,
        idleMs: 4200,
        windupMs: 2400,
        hitDamagePct: 16,
        parryCount: 1,
        hasShield: true,
        targetTTK: 90,
        bossPhases: [
          {
            thresholdHpPct: 0.60,
            wordTier: 3,
            idleMs: 4200,
            windupMs: 2400,
            hitDamagePct: 16,
            parryCount: 1,
            description: 'Phase 1: Cutlass & Tower Shield'
          },
          {
            thresholdHpPct: 0.30,
            wordTier: 3,
            idleMs: 3800,
            windupMs: 3200,
            hitDamagePct: 25,
            parryCount: 1,
            description: 'Phase 2: Tempest Lightning Strike'
          },
          {
            thresholdHpPct: 0.0,
            wordTier: 3,
            idleMs: 3500,
            windupMs: 2200,
            hitDamagePct: 18,
            parryCount: 1,
            shieldEveryNWords: 3,
            description: 'Phase 3: Resonant Shield Regeneration'
          }
        ]
      }
    ]
  },
  {
    levelNumber: 4,
    name: 'Crystal Depths',
    subtitle: 'Chamber of Shards',
    description: 'Subterranean caverns radiant with luminescent crystals and lethal reactive carapaces.',
    theme: 'crystal',
    wordTier: 4,
    targetWpm: 55,
    baseIdleMs: 4000,
    baseWindupMs: 2100,
    parryLengthMin: 4,
    parryLengthMax: 6,
    hitDamagePct: 16,
    newMechanicTitle: 'Counter Stance',
    newMechanicDesc: 'When the enemy glows with a blue aura, any typo inflicts 4% max HP damage to YOU. Stay calm and accurate!',
    parScore: 4800,
    encounters: [
      {
        id: 'l4_shield',
        name: 'Shield Guard',
        type: 'shield_guard',
        baseHp: 160,
        idleMs: 4000,
        windupMs: 2100,
        hitDamagePct: 16,
        parryCount: 1,
        hasShield: true,
        targetTTK: 20
      },
      {
        id: 'l4_sentinel_1',
        name: 'Crystal Sentinel',
        type: 'crystal_sentinel',
        baseHp: 175,
        idleMs: 3800,
        windupMs: 2100,
        hitDamagePct: 16,
        parryCount: 1,
        hasCounterStance: true,
        targetTTK: 22
      },
      {
        id: 'l4_brute',
        name: 'Iron Brute',
        type: 'brute',
        baseHp: 225,
        idleMs: 4800,
        windupMs: 2600,
        hitDamagePct: 22,
        parryCount: 2,
        targetTTK: 28
      },
      {
        id: 'l4_boss_warden',
        name: 'Crystal Warden',
        type: 'boss',
        isBoss: true,
        baseHp: 695,
        idleMs: 4000,
        windupMs: 2100,
        hitDamagePct: 18,
        parryCount: 1,
        targetTTK: 95,
        bossPhases: [
          {
            thresholdHpPct: 0.50,
            wordTier: 4,
            idleMs: 4000,
            windupMs: 2100,
            hitDamagePct: 18,
            parryCount: 1,
            counterStance: true,
            description: 'Phase 1: Reactive Counter Cycles'
          },
          {
            thresholdHpPct: 0.25,
            wordTier: 4,
            idleMs: 3600,
            windupMs: 2000,
            hitDamagePct: 20,
            parryCount: 2,
            description: 'Phase 2: Crystalline Spikes'
          },
          {
            thresholdHpPct: 0.0,
            wordTier: 4,
            idleMs: 3200,
            windupMs: 1900,
            hitDamagePct: 22,
            parryCount: 1,
            armorPlates: 3,
            description: 'Phase 3: Shatter Armor Plates'
          }
        ]
      }
    ]
  },
  {
    levelNumber: 5,
    name: 'Void Citadel',
    subtitle: 'Ascent to the Sovereign',
    description: 'Floating ruins suspended above a bottomless void. Master every technique to dethrone the Ink Emperor.',
    theme: 'void',
    wordTier: 5,
    targetWpm: 65,
    baseIdleMs: 3600,
    baseWindupMs: 2000,
    parryLengthMin: 5,
    parryLengthMax: 7,
    hitDamagePct: 18,
    newMechanicTitle: 'The Gauntlet & Calligraphy Storm',
    newMechanicDesc: 'Fight five guardians back-to-back with minimal rest. The Emperor unleashes unskippable martial arts phrases!',
    parScore: 6500,
    encounters: [
      {
        id: 'l5_ninja',
        name: 'Shuriken Ninja',
        type: 'shuriken_ninja',
        baseHp: 170,
        idleMs: 3400,
        windupMs: 1900,
        hitDamagePct: 16,
        parryCount: 2,
        targetTTK: 18
      },
      {
        id: 'l5_shield',
        name: 'Shield Guard',
        type: 'shield_guard',
        baseHp: 190,
        idleMs: 3600,
        windupMs: 2000,
        hitDamagePct: 16,
        parryCount: 1,
        hasShield: true,
        targetTTK: 20
      },
      {
        id: 'l5_sentinel',
        name: 'Crystal Sentinel',
        type: 'crystal_sentinel',
        baseHp: 210,
        idleMs: 3600,
        windupMs: 2000,
        hitDamagePct: 18,
        parryCount: 1,
        hasCounterStance: true,
        targetTTK: 22
      },
      {
        id: 'l5_brute',
        name: 'Iron Brute',
        type: 'brute',
        baseHp: 245,
        idleMs: 4200,
        windupMs: 2400,
        hitDamagePct: 22,
        parryCount: 2,
        targetTTK: 26
      },
      {
        id: 'l5_acolyte',
        name: 'Void Acolyte',
        type: 'void_acolyte',
        baseHp: 225,
        idleMs: 3500,
        windupMs: 1900,
        hitDamagePct: 18,
        parryCount: 2,
        hasShield: true,
        targetTTK: 24
      },
      {
        id: 'l5_boss_emperor',
        name: 'The Ink Emperor',
        type: 'boss',
        isBoss: true,
        baseHp: 900,
        idleMs: 3600,
        windupMs: 2000,
        hitDamagePct: 20,
        parryCount: 2,
        targetTTK: 105,
        bossPhases: [
          {
            thresholdHpPct: 0.66,
            wordTier: 5,
            idleMs: 3600,
            windupMs: 2000,
            hitDamagePct: 20,
            parryCount: 2,
            hasShield: true,
            counterStance: true,
            description: 'Phase 1: Duel of the Sovereign'
          },
          {
            thresholdHpPct: 0.33,
            wordTier: 5,
            idleMs: 3000,
            windupMs: 1800,
            hitDamagePct: 22,
            parryCount: 1,
            description: 'Phase 2: Relentless Blitz'
          },
          {
            thresholdHpPct: 0.0,
            wordTier: 6,
            idleMs: 3400,
            windupMs: 2800,
            hitDamagePct: 24,
            parryCount: 1,
            phrasesOnly: true,
            noSkip: true,
            description: 'Phase 3: Calligraphy Storm'
          }
        ]
      }
    ]
  }
];
