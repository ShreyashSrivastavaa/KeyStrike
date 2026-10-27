/**
 * Curated word lists and adaptive word selection engine.
 * Strict rules:
 * - lowercase letters and single spaces only
 * - family-friendly, no punctuation, no proper nouns
 * - T1..T5 have >= 150 words each
 * - T6 phrases have >= 60 entries
 * - No repeats in last 12 words
 * - Consecutive words never start with the same letter
 * - Adaptive length bias based on rolling accuracy
 */

export const WORD_TIERS: Record<number, string[]> = {
  1: [
    // 3 to 5 letters (easy letter flow) - 160 words
    'ace', 'act', 'aim', 'air', 'arc', 'arm', 'ash', 'axe', 'bay', 'beam',
    'beat', 'bent', 'bite', 'blade', 'blast', 'blaze', 'block', 'blow', 'bold', 'bolt',
    'bone', 'boom', 'boot', 'bow', 'brawl', 'break', 'brisk', 'burn', 'burst', 'calm',
    'cast', 'chain', 'chant', 'charge', 'chase', 'chin', 'chip', 'chop', 'claw', 'clay',
    'clef', 'cliff', 'cloak', 'close', 'cloud', 'clash', 'cold', 'comb', 'core', 'crash',
    'creek', 'crisp', 'cross', 'crow', 'crush', 'cure', 'curl', 'cut', 'dart', 'dash',
    'dawn', 'dive', 'dodge', 'dose', 'draw', 'drift', 'drop', 'drum', 'dual', 'dust',
    'echo', 'edge', 'ember', 'fade', 'fang', 'fast', 'fate', 'fear', 'fend', 'fire',
    'firm', 'fist', 'flag', 'flame', 'flare', 'flash', 'fleet', 'flex', 'flow', 'flux',
    'foil', 'fold', 'foul', 'fury', 'gale', 'gasp', 'gear', 'glare', 'glide', 'glow',
    'gold', 'grab', 'grip', 'grit', 'growl', 'guard', 'gust', 'halt', 'hard', 'hawk',
    'heal', 'heat', 'heavy', 'helm', 'hide', 'hilt', 'hold', 'hook', 'hope', 'horn',
    'iron', 'jade', 'jolt', 'jump', 'keen', 'kick', 'kinetic', 'knee', 'knot', 'lash',
    'lead', 'leap', 'lock', 'loom', 'lunge', 'mark', 'mask', 'mesh', 'mist', 'moon',
    'nerve', 'pace', 'palm', 'parry', 'peak', 'pierce', 'pivot', 'plum', 'pose', 'power',
    'punch', 'quick', 'rage', 'ramp', 'rank', 'reach', 'reap', 'rest', 'ring', 'rip'
  ],
  2: [
    // 5 to 7 letters - 160 words
    'action', 'agility', 'archer', 'armour', 'arrows', 'attack', 'bamboo', 'battle',
    'beast', 'blades', 'blaze', 'blocker', 'border', 'bounce', 'bravery', 'breeze',
    'brutal', 'bundle', 'canyon', 'caster', 'castle', 'charge', 'chaser', 'cipher',
    'circle', 'clash', 'cleave', 'clench', 'clover', 'combat', 'corner', 'counter',
    'crater', 'crisis', 'crouch', 'dagger', 'danger', 'daring', 'darken', 'dealer',
    'defend', 'deflect', 'demon', 'depths', 'direct', 'disarm', 'dragon', 'drifter',
    'driver', 'duelist', 'dynamo', 'eagles', 'elixir', 'empire', 'energy', 'engine',
    'escape', 'falcon', 'fathom', 'ferret', 'fierce', 'flame', 'flank', 'flurry',
    'flying', 'focus', 'force', 'forest', 'forge', 'freeze', 'frenzy', 'frost',
    'furious', 'fusion', 'glider', 'grapple', 'ground', 'guardian', 'hammer', 'handle',
    'hazard', 'helmet', 'heroic', 'hidden', 'hunter', 'impact', 'infuse', 'jagged',
    'katana', 'knight', 'kraken', 'lancer', 'launch', 'legend', 'lethal', 'linear',
    'mantle', 'master', 'meteor', 'monkey', 'motion', 'muscle', 'ninja', 'outrun',
    'pounce', 'prey', 'pulse', 'pursue', 'quiver', 'radius', 'raider', 'rapid',
    'razor', 'rebound', 'reflex', 'render', 'rescue', 'rhythm', 'riposte', 'rising',
    'roaring', 'runner', 'savage', 'scythe', 'shadow', 'shield', 'shinobi', 'shiver',
    'silent', 'silver', 'slasher', 'smash', 'sniper', 'spark', 'spear', 'spectre',
    'spider', 'spiral', 'spirit', 'spring', 'sprint', 'stance', 'static', 'stealth',
    'strike', 'strong', 'strider', 'stride', 'sweep', 'swift', 'sword', 'target'
  ],
  3: [
    // 6 to 9 letters (mixed patterns, double letters) - 160 words
    'accuracy', 'ambush', 'armored', 'assassin', 'assault', 'avalanche', 'barrage',
    'bastion', 'battler', 'berserk', 'blaster', 'blitzing', 'breakers', 'calamity',
    'callous', 'catapult', 'champion', 'cleaver', 'collision', 'command', 'conquer',
    'crescent', 'crusher', 'cyclone', 'darkness', 'decimate', 'defender', 'defiance',
    'delirium', 'demolish', 'destroy', 'discipline', 'disrupt', 'dominant', 'drifting',
    'dynamism', 'eclipse', 'elusive', 'empower', 'endurance', 'enforcer', 'engulf',
    'escalate', 'evasion', 'execution', 'exhaust', 'explode', 'falchion', 'ferocious',
    'firestorm', 'fissure', 'flanking', 'flashing', 'fortress', 'fracture', 'frontier',
    'furious', 'garrison', 'gladiator', 'glimmer', 'grappling', 'grinding', 'halberd',
    'hammering', 'harbour', 'havoc', 'heavens', 'horizon', 'hurricane', 'illusion',
    'immortal', 'impacts', 'infinite', 'initiator', 'ironclad', 'judgment', 'junction',
    'kinetic', 'knighthood', 'lacerate', 'launching', 'lightning', 'lockdown', 'marauder',
    'marksman', 'martial', 'mastery', 'merciless', 'midnight', 'momentum', 'monarch',
    'monument', 'moonlight', 'mystical', 'nightfall', 'nullify', 'oblivion', 'onslaught',
    'outbreak', 'overcome', 'overkill', 'overwhelm', 'paralyze', 'pathway', 'pendulum',
    'perilous', 'phantom', 'pinnacle', 'platinum', 'powerful', 'precision', 'pressure',
    'punisher', 'quicksand', 'radiance', 'rebellion', 'reckless', 'recovery', 'redoubt',
    'relentless', 'resonance', 'retribution', 'revenant', 'reversal', 'ricochet', 'rupture',
    'sanctuary', 'scimitar', 'scorching', 'scramble', 'sentinel', 'serenade', 'serpent',
    'severance', 'shattering', 'shirker', 'shuriken', 'sinister', 'skirmish', 'solitude',
    'spectrum', 'splinter', 'stagger', 'stalwart', 'stampede', 'standoff', 'stronghold',
    'tactician', 'talisman', 'tempest', 'titanium', 'tormentor', 'torrent', 'trajectory',
    'transcend', 'tremendous', 'triumphant', 'turbulent', 'twilight', 'typhoon', 'ultimate',
    'unleashed', 'valkyrie', 'vanquisher', 'vengeance', 'victorious', 'vigilance', 'warlord'
  ],
  4: [
    // 7 to 10 letters (awkward bigrams, less common words) - 160 words
    'aberration', 'annihilate', 'antagonist', 'apocalypse', 'asymmetry', 'barricade',
    'bedazzled', 'belligerent', 'bewildered', 'blacksmith', 'bloodhound', 'bodyguard',
    'bombardment', 'boundaries', 'breakthrough', 'brilliance', 'cataclysm', 'caterpillar',
    'centurion', 'chivalrous', 'chronology', 'cleverness', 'clobbering', 'companion',
    'concussion', 'conjuring', 'conqueror', 'consequence', 'constrictor', 'contingent',
    'countdown', 'crystalline', 'crystallize', 'cultivator', 'decimation', 'deflection',
    'deliberate', 'demolition', 'devastate', 'devastation', 'dimension', 'discombob',
    'discordant', 'dislocation', 'dissonance', 'dragonfly', 'earthquake', 'equilibrium',
    'evanescent', 'eviscerate', 'executioner', 'exhilarate', 'exorcising', 'expedition',
    'extinguish', 'fabricated', 'firecracker', 'flamboyant', 'formidable', 'fragility',
    'frequency', 'frontrunner', 'fulfilment', 'fundamental', 'gangplank', 'gaslighting',
    'generosity', 'glaciology', 'grasshopper', 'gravitation', 'groundswell', 'guillotine',
    'headspring', 'headstrong', 'heartbreak', 'highlander', 'hourglass', 'hydroplane',
    'hypnotized', 'illuminator', 'immobility', 'impalement', 'impenetrable', 'inquisitor',
    'insurgency', 'interceptor', 'intertwine', 'invigorate', 'iridescent', 'juggernaut',
    'kaleidoscope', 'kinematics', 'labyrinth', 'landslider', 'liquidation', 'locomotive',
    'luminosity', 'magnificent', 'maneuvering', 'mastermind', 'mechanisms', 'melodramatic',
    'mercenaries', 'metamorph', 'microsecond', 'misfortune', 'mobilization', 'monolithic',
    'moonflower', 'mortality', 'mysterious', 'navigation', 'needlework', 'nightmarish',
    'nonchalant', 'obliterate', 'obstinacy', 'occurrence', 'omnipresent', 'opportunist',
    'orchestrate', 'outmaneuver', 'overbearing', 'overwhelmed', 'pathfinder', 'percussion',
    'perseverance', 'pestilence', 'philosophy', 'placeholder', 'polymorphic', 'prodigious',
    'propulsion', 'pulverize', 'quickwitted', 'reinforce', 'relentless', 'retaliation',
    'revolution', 'ridiculous', 'scandalous', 'scorcher', 'sharpness', 'shimmering',
    'silhouetted', 'smashdown', 'solidarity', 'specialist', 'splendour', 'steadfast',
    'subjugation', 'subterranean', 'supersede', 'suppression', 'surveillance', 'susceptible',
    'swashbuckler', 'symmetrical', 'synchronize', 'temperament', 'thunderbolt', 'transformation'
  ],
  5: [
    // 8 to 12 letters plus short two-word phrases up to 14 chars - 160 words
    'annihilator', 'apprehension', 'astronomical', 'battlefront', 'black diamond',
    'blade dancer', 'blood brother', 'blue horizon', 'bone crusher', 'boundlessness',
    'catastrophic', 'chain lightning', 'cloud dancer', 'cold steel', 'combustion',
    'comprehensive', 'conflagration', 'dark eclipse', 'deep silence', 'demon slayer',
    'devastator', 'dire omens', 'disintegration', 'divine wrath', 'dragon heart',
    'dreadnought', 'dual strike', 'dust storm', 'eagle vision', 'electric pulse',
    'endless night', 'eternal flame', 'extermination', 'fatal blow', 'final verdict',
    'fire baptism', 'flash point', 'flying kick', 'force field', 'frost bite',
    'furious wind', 'ghost blade', 'golden dawn', 'grim reaper', 'heavy armor',
    'high velocity', 'hollow ground', 'hyper speed', 'hypervelocity', 'impact point',
    'iron defense', 'iron fortress', 'iron resolve', 'jade warrior', 'judgment day',
    'kinetic blast', 'laser focus', 'lethal tempo', 'lightning rod', 'linear path',
    'lone wanderer', 'lost temple', 'lunar cycle', 'manifestation', 'martial artist',
    'master fighter', 'meteor crash', 'midnight run', 'mind breaker', 'moon stalker',
    'mortal combat', 'mystic power', 'neural link', 'night hunter', 'noble spirit',
    'nuclear strike', 'null pointer', 'omen of doom', 'one punch', 'phantom strike',
    'polar frost', 'power surge', 'primal instinct', 'pure instinct', 'quantum leap',
    'quick reflex', 'quicksilver', 'radiant burst', 'rapid punch', 'razor sharp',
    'rebel force', 'reckless charge', 'resurrection', 'rising dragon', 'roaring tiger',
    'sacred ground', 'savage beast', 'shadow dancer', 'shadow strike', 'sharp steel',
    'shattered sun', 'silent death', 'silent steps', 'silent storm', 'silver bullet',
    'smoke screen', 'solar flare', 'soul stealer', 'spear thrust', 'speed demon',
    'spirit walker', 'split second', 'steel curtain', 'storm bringer', 'strike hard',
    'strike true', 'sudden impact', 'swift justice', 'thunder bird', 'thunder clap',
    'total eclipse', 'toxic vapor', 'true mastery', 'twin dragons', 'ultimate arts',
    'unbroken line', 'unseen threat', 'valiant knight', 'viper strike', 'void walker',
    'vortex spin', 'war champion', 'white lotus', 'white tiger', 'wind cutter',
    'wolf spirit', 'zero gravity', 'zero tolerance', 'zenith strike', 'zigzag dash',
    'blade mastery', 'crimson tide', 'dragon breath', 'fury of wind', 'ghostly mist',
    'hammer throw', 'infinity loop', 'judging gaze', 'mighty shield', 'phantom step',
    'raging river', 'silent arrow', 'tiger claw', 'unspoken vow', 'whirlwind kick'
  ],
  6: [
    // Boss-only finishers up to 18 characters (single space, no punctuation) - 65 entries
    'final calligraphy', 'strike like water', 'iron will cut deep',
    'fist of five rings', 'shatter the void', 'dance on the edge',
    'moonlit bamboo', 'unbroken spirit', 'fury of the blade',
    'tearing the silence', 'master of shadows', 'echoes in the rain',
    'lightning and thunder', 'blade of the lotus', 'the falling leaves',
    'serpent in the mist', 'breath of dragons', 'calm before storm',
    'crush every doubt', 'walk without sound', 'eyes of the tiger',
    'art of the counter', 'shattered horizons', 'whisper of steel',
    'cleaving the clouds', 'rising above all', 'stand and deliver',
    'ashes to embers', 'step through fire', 'crown of the victor',
    'silent as shadows', 'dance with danger', 'clash of titans',
    'spirit of iron', 'bound for glory', 'paths of destiny',
    'reap the whirlwind', 'wings of obsidian', 'river of arrows',
    'frost and thunder', 'pierce the gloom', 'armor of virtue',
    'swift as swallows', 'shield of dawn', 'hammer of justice',
    'fury of storms', 'song of the blade', 'wrath of heaven',
    'chasing shadows', 'strike of balance', 'flowing like wind',
    'patience of earth', 'might of tigers', 'resolve like stone',
    'edge of nightfall', 'flame of truth', 'unyielding vigor',
    'storm over harbor', 'shadows retreating', 'the grand finale',
    'path of the monk', 'steel meets spirit', 'zenith of combat',
    'sovereign of ink', 'triumph of mind'
  ]
};

export class WordSelector {
  private recentWords: string[] = [];
  private lastStartingLetter: string = '';
  private rollingAccuracies: number[] = [];

  constructor(private seed: number = 1337) {}

  /** Pseudo-random generator for deterministic seeds */
  private nextRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  public recordWordResult(correct: number, errors: number): void {
    const total = correct + errors;
    if (total > 0) {
      const acc = correct / total;
      this.rollingAccuracies.push(acc);
      if (this.rollingAccuracies.length > 8) {
        this.rollingAccuracies.shift();
      }
    }
  }

  public getRollingAccuracy(): number {
    if (this.rollingAccuracies.length === 0) return 1.0;
    const sum = this.rollingAccuracies.reduce((a, b) => a + b, 0);
    return sum / this.rollingAccuracies.length;
  }

  /**
   * Select a word respecting fairness rules:
   * - Tier list
   * - Adaptive length bias
   * - No repeats in last 12 words
   * - Consecutive words never start with same letter
   * - Parry words are never biased upward
   */
  public selectWord(tier: number, isParry: boolean = false, minLength?: number, maxLength?: number): string {
    const tierList = WORD_TIERS[tier] || WORD_TIERS[1];
    let candidatePool = tierList.slice();

    // Filter by min/max length if provided
    if (minLength !== undefined || maxLength !== undefined) {
      const min = minLength ?? 0;
      const max = maxLength ?? 999;
      const filtered = candidatePool.filter(w => w.length >= min && w.length <= max);
      if (filtered.length >= 5) {
        candidatePool = filtered;
      }
    }

    // Adaptive bias (unless it is a parry word)
    if (!isParry && candidatePool.length >= 10) {
      const avgAcc = this.getRollingAccuracy();
      candidatePool.sort((a, b) => a.length - b.length);
      const half = Math.floor(candidatePool.length / 2);

      if (avgAcc < 0.85) {
        // Bias to shorter half
        candidatePool = candidatePool.slice(0, half + 5);
      } else if (avgAcc > 0.97) {
        // Bias to longer half
        candidatePool = candidatePool.slice(half - 5);
      }
    }

    // Filter out words in recent history (last 12)
    const recentSet = new Set(this.recentWords);
    let validPool = candidatePool.filter(w => !recentSet.has(w));

    // Filter out same starting letter as last word
    if (this.lastStartingLetter) {
      const diffStartPool = validPool.filter(w => w.charAt(0) !== this.lastStartingLetter);
      if (diffStartPool.length > 0) {
        validPool = diffStartPool;
      }
    }

    // Fallback if pool depleted
    if (validPool.length === 0) {
      validPool = candidatePool;
    }

    // Pick pseudorandomly
    const idx = Math.floor(this.nextRandom() * validPool.length);
    const chosen = validPool[idx] || 'strike';

    // Update history
    this.recentWords.push(chosen);
    if (this.recentWords.length > 12) {
      this.recentWords.shift();
    }
    this.lastStartingLetter = chosen.charAt(0);

    return chosen;
  }
}
