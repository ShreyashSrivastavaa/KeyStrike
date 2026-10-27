/**
 * BattleScene for Keystrike
 * Handles procedural rendering of the 2D combat arena, parallax backgrounds,
 * stickman rigs, particle VFX, hit-stop, camera shake, and floating combat text.
 */

import Phaser from 'phaser';
import { Session } from '../session/Session';
import { CombatEvent, CombatSnapshot } from '../core/types';
import { StickmanRig, RigConfig } from './StickmanRig';

export class BattleScene extends Phaser.Scene {
  private session: Session | null = null;
  private unsubscribeEvents: (() => void) | null = null;
  private unsubscribeSnapshots: (() => void) | null = null;

  private playerRig: StickmanRig | null = null;
  private enemyRig: StickmanRig | null = null;

  private currentTheme: string = 'rooftop';
  private backgroundLayers: Phaser.GameObjects.Graphics[] = [];
  private ambientParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  private telegraphGraphics: Phaser.GameObjects.Graphics | null = null;
  private slashGraphics: Phaser.GameObjects.Graphics | null = null;
  private floorDynamicGraphics: Phaser.GameObjects.Graphics | null = null;

  private isHitStopped: boolean = false;
  private hitStopTimer: number = 0;
  private jabToggle: boolean = false;
  private reducedMotion: boolean = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  public init(data: { session: Session; reducedMotion?: boolean }): void {
    this.session = data.session;
    this.reducedMotion = data.reducedMotion ?? false;
  }

  public create(): void {
    if (!this.session) return;

    const snap = this.session.getSnapshot();
    this.setupBackground(snap.levelIndex);

    // Floor dynamic lighting & contact shadows (rendered behind characters)
    this.floorDynamicGraphics = this.add.graphics();
    this.telegraphGraphics = this.add.graphics();
    this.slashGraphics = this.add.graphics();

    this.setupStickmen(snap);

    // Subscribe to session combat events
    this.unsubscribeEvents = this.session.onEvent((event: CombatEvent) => {
      this.handleCombatEvent(event);
    });

    // Subscribe to snapshot updates for state sync
    this.unsubscribeSnapshots = this.session.subscribe((snapshot: CombatSnapshot) => {
      this.syncSnapshot(snapshot);
    });
  }

  private setupStickmen(snap: CombatSnapshot): void {
    // 1. Player Rig (Left third: x = 380, y = 380)
    const playerConfig: RigConfig = {
      scale: 1.15,
      color: 0xffffff,
      glowColor: 0x38bdf8, // vibrant cyan
      strokeWidth: 6,
      headRadius: 10,
      torsoLength: 36,
      armLength: 20,
      legLength: 24,
      weaponType: 'sword',
    };
    this.playerRig = new StickmanRig(this, 380, 390, true, playerConfig);

    // 2. Enemy Rig (Right third: x = 900, y = 380)
    this.createEnemyRig(snap);
  }

  private createEnemyRig(snap: CombatSnapshot): void {
    if (this.enemyRig) {
      this.enemyRig.destroy();
      this.enemyRig = null;
    }

    const enemyType = snap.enemy.config.type;
    const isBoss = snap.enemy.config.isBoss;

    let rigConfig: RigConfig = {
      scale: isBoss ? 1.45 : 1.15,
      color: 0xffffff,
      glowColor: 0xef233c, // red telegraph glow
      strokeWidth: isBoss ? 7 : 6,
      headRadius: isBoss ? 13 : 10,
      torsoLength: isBoss ? 44 : 36,
      armLength: isBoss ? 24 : 20,
      legLength: isBoss ? 28 : 24,
      weaponType: 'club',
      hasAura: isBoss,
    };

    switch (enemyType) {
      case 'ink_grunt':
        rigConfig.weaponType = 'club';
        rigConfig.glowColor = 0xf97316; // orange
        break;
      case 'shuriken_ninja':
        rigConfig.weaponType = 'sword';
        rigConfig.glowColor = 0x2dd4bf; // teal
        rigConfig.hasScarf = true;
        break;
      case 'shield_guard':
        rigConfig.weaponType = 'shield';
        rigConfig.glowColor = 0xfacc15; // gold
        break;
      case 'crystal_sentinel':
        rigConfig.weaponType = 'sword';
        rigConfig.glowColor = 0x3b82f6; // blue
        rigConfig.hasAura = true;
        break;
      case 'brute':
        rigConfig.scale = 1.5;
        rigConfig.weaponType = 'hammer';
        rigConfig.glowColor = 0xd97706; // amber
        break;
      case 'boss':
        rigConfig.glowColor = 0xa855f7; // purple
        rigConfig.hasAura = true;
        break;
    }

    this.enemyRig = new StickmanRig(this, 900, 390, false, rigConfig);
  }

  private setupBackground(levelIndex: number): void {
    // Clear existing
    this.backgroundLayers.forEach(l => l.destroy());
    this.backgroundLayers = [];

    const themes = ['rooftop', 'bamboo', 'harbor', 'crystal', 'void'];
    this.currentTheme = themes[levelIndex] || 'rooftop';

    const bg1 = this.add.graphics(); // Atmospheric Sky layer
    const bg2 = this.add.graphics(); // 3D Multi-plane silhouettes & architecture
    const bg3 = this.add.graphics(); // 3D Perspective Arena Floor

    this.backgroundLayers = [bg1, bg2, bg3];

    // 1. Sky & Atmospheric Silhouettes per theme
    switch (this.currentTheme) {
      case 'rooftop': {
        // Deep Tokyo/Neo-Cyber dusk sky
        bg1.fillGradientStyle(0x08091a, 0x08091a, 0x2e1065, 0x831843, 1);
        bg1.fillRect(0, 0, 1280, 720);

        // Distant stars / dusk motes
        bg1.fillStyle(0xffffff, 0.6);
        for (let i = 0; i < 40; i++) {
          const sx = (i * 97) % 1280;
          const sy = (i * 53) % 240;
          bg1.fillCircle(sx, sy, (i % 3 === 0) ? 1.5 : 1);
        }

        // Layer A: Far Distant Mountain / Skyline Haze (Low contrast)
        bg2.fillStyle(0x13112c, 0.7);
        for (let x = 0; x < 1280; x += 110) {
          const h = 180 + ((x * 43) % 120);
          bg2.fillRect(x, 410 - h, 95, h);
          // Radio tower mast on tallest
          if (x % 330 === 0) {
            bg2.lineStyle(1.5, 0x6366f1, 0.8);
            bg2.lineBetween(x + 47, 410 - h, x + 47, 410 - h - 55);
            bg2.fillStyle(0xef4444, 0.9);
            bg2.fillCircle(x + 47, 410 - h - 55, 3); // Red aviation beacon
            bg2.fillStyle(0x13112c, 0.7);
          }
        }

        // Layer B: Mid-ground Skyscraper Slabs with lit window clusters
        bg2.fillStyle(0x0c0f1d, 0.95);
        for (let x = 20; x < 1280; x += 90) {
          const h = 130 + ((x * 29) % 160);
          bg2.fillRect(x, 410 - h, 78, h);

          // Realistic window grids (cyan & warm amber)
          for (let wy = 410 - h + 15; wy < 390; wy += 18) {
            for (let wx = x + 10; wx < x + 68; wx += 14) {
              if ((wx * wy) % 5 > 1) {
                const isCyan = (wx + wy) % 3 === 0;
                bg2.fillStyle(isCyan ? 0x38bdf8 : 0xfde047, isCyan ? 0.35 : 0.45);
                bg2.fillRect(wx, wy, 7, 9);
              }
            }
          }
          bg2.fillStyle(0x0c0f1d, 0.95);
        }

        // Layer C: Dojo Rooftop Tiles & Lanterns on Horizon
        bg2.fillStyle(0x05070d, 1.0);
        bg2.fillRect(0, 395, 1280, 20);
        // Traditional curved eaves silhouette
        bg2.lineStyle(2, 0x38bdf8, 0.4);
        bg2.lineBetween(0, 400, 1280, 400);
        break;
      }

      case 'bamboo': {
        // Deep misty emerald moonlit night
        bg1.fillGradientStyle(0x022c22, 0x022c22, 0x064e3b, 0x020617, 1);
        bg1.fillRect(0, 0, 1280, 720);

        // Huge glowing moon with volumetric halo
        bg1.fillStyle(0xa7f3d0, 0.12);
        bg1.fillCircle(1020, 140, 120);
        bg1.fillStyle(0xf0fdf4, 0.9);
        bg1.fillCircle(1020, 140, 65);

        // Layer A: Distant foggy bamboo stalks
        bg2.fillStyle(0x064e3b, 0.5);
        for (let x = 10; x < 1280; x += 45) {
          bg2.fillRect(x, 60, 8, 350);
        }

        // Layer B: Mid bamboo stalks with leaf joints
        bg2.fillStyle(0x042f2e, 0.85);
        for (let x = 30; x < 1280; x += 85) {
          bg2.fillRect(x, 40, 16, 370);
          bg2.fillRect(x - 5, 140, 26, 6);
          bg2.fillRect(x - 5, 240, 26, 6);
          bg2.fillRect(x - 5, 330, 26, 6);
        }
        break;
      }

      case 'harbor': {
        // Storm harbor with naval tempest lighting
        bg1.fillGradientStyle(0x032845, 0x082f49, 0x0284c7, 0x020617, 1);
        bg1.fillRect(0, 0, 1280, 720);

        // Sweeping lighthouse beacon cone
        bg1.fillStyle(0xbae6fd, 0.12);
        bg1.fillTriangle(1150, 120, 0, 320, 0, 400);

        // Shipyard industrial silhouettes (cranes and gantry)
        bg2.fillStyle(0x090d16, 0.95);
        for (let x = 80; x < 1280; x += 220) {
          // Crane tower
          bg2.fillRect(x, 180, 22, 230);
          bg2.fillRect(x - 40, 180, 140, 14);
          bg2.lineStyle(2, 0xef4444, 0.7);
          bg2.strokeCircle(x + 11, 175, 4);
        }
        break;
      }

      case 'crystal': {
        // Luminescent subterranean abyss
        bg1.fillGradientStyle(0x3b0764, 0x581c87, 0x1e1b4b, 0x050508, 1);
        bg1.fillRect(0, 0, 1280, 720);

        // Huge 3D faceted crystal clusters
        bg2.fillStyle(0x06b6d4, 0.6);
        bg2.fillTriangle(140, 410, 190, 180, 240, 410);
        bg2.fillStyle(0x67e8f9, 0.4);
        bg2.fillTriangle(170, 410, 190, 180, 240, 410);

        bg2.fillStyle(0xd946ef, 0.6);
        bg2.fillTriangle(1040, 410, 1090, 190, 1140, 410);
        bg2.fillStyle(0xf0abfc, 0.4);
        bg2.fillTriangle(1070, 410, 1090, 190, 1140, 410);
        break;
      }

      case 'void': {
        // Warped cosmic citadel with swirling dark matter rift
        bg1.fillGradientStyle(0x2e0854, 0x0f021e, 0x4c0519, 0x020005, 1);
        bg1.fillRect(0, 0, 1280, 720);

        // Floating shattered pillars in 3D perspective
        bg2.fillStyle(0x1a0731, 0.9);
        bg2.fillRect(160, 220, 70, 150);
        bg2.fillRect(1000, 190, 90, 170);
        bg2.lineStyle(2, 0xa855f7, 0.6);
        bg2.strokeRect(160, 220, 70, 150);
        bg2.strokeRect(1000, 190, 90, 170);
        break;
      }
    }

    // =========================================================================
    // 2. 3D PERSPECTIVE ARENA FLOOR (Horizon at y = 410, receding to y = 720)
    // =========================================================================
    
    // Reflective dark wet asphalt / carbon dojo base
    bg3.fillGradientStyle(0x070b14, 0x070b14, 0x030508, 0x030508, 1);
    bg3.fillRect(0, 410, 1280, 310);

    // Glowing Neon Horizon Line
    bg3.lineStyle(3, 0x38bdf8, 0.9);
    bg3.lineBetween(0, 410, 1280, 410);
    bg3.lineStyle(1.5, 0xffffff, 0.7);
    bg3.lineBetween(0, 410, 1280, 410);

    // 3D Perspective Floor Depth Lines (converging to center vanishing point 640, 390)
    const vpX = 640;
    const vpY = 390;
    bg3.lineStyle(1, 0x38bdf8, 0.18);

    // 18 perspective grid spokes fanning down
    for (let x = -300; x <= 1580; x += 110) {
      bg3.lineBetween(vpX, vpY, x, 720);
    }

    // Transverse Foreshortened Horizontal Grid Rings (Exponential Spacing for 3D depth)
    const transverseYs = [416, 424, 436, 452, 475, 508, 552, 610, 680];
    transverseYs.forEach((ty, idx) => {
      const alpha = 0.08 + (idx / transverseYs.length) * 0.16;
      bg3.lineStyle(1.5, 0x38bdf8, alpha);
      bg3.lineBetween(0, ty, 1280, ty);
    });

    // Perimeter Hazard Warning Runway Lights along left and right flanks
    for (let py = 420; py < 700; py += 35) {
      const prog = (py - 410) / 300;
      const leftX = 40 + prog * 60;
      const rightX = 1240 - prog * 60;
      bg3.fillStyle(0x38bdf8, 0.7);
      bg3.fillCircle(leftX, py, 2.5);
      bg3.fillCircle(rightX, py, 2.5);
    }
  }

  private handleCombatEvent(evt: CombatEvent): void {
    switch (evt.type) {
      case 'KEY_STROKE':
        if (evt.correct) {
          // Micro-jab alternating arms on each correct key
          this.jabToggle = !this.jabToggle;
          this.playerRig?.setPose(this.jabToggle ? 'jabA' : 'jabB', 60);
          this.time.delayedCall(75, () => {
            this.playerRig?.setPose('ready', 90);
          });
        }
        break;

      case 'WORD_COMPLETED':
        this.triggerAttackImpact(evt.damage, evt.isCrit, evt.isParry);
        break;

      case 'ENEMY_STATE_CHANGE':
        if (evt.newState === 'Windup') {
          this.enemyRig?.setPose('windup', 200);
        } else if (evt.newState === 'Attacking') {
          this.enemyRig?.setPose('attack', 100);
        } else if (evt.newState === 'Staggered') {
          this.enemyRig?.setPose('stagger', 150);
        } else if (evt.newState === 'Idle') {
          this.enemyRig?.setPose('idle', 150);
        }
        break;

      case 'ENEMY_ATTACK_LANDED':
        this.triggerPlayerHit(evt.damage);
        break;

      case 'PARRY_LANDED':
        this.triggerParryEffect();
        break;

      case 'PHASE_TRANSITION':
        this.triggerPhaseFlash();
        break;

      case 'ENCOUNTER_WON':
        this.playerRig?.setPose('victory', 300);
        this.enemyRig?.setPose('death', 300);
        break;

      case 'PLAYER_DEFEATED':
        this.playerRig?.setPose('death', 300);
        break;
    }
  }

  private triggerAttackImpact(damage: number, isCrit: boolean, isParry: boolean): void {
    // 1. Pose
    this.playerRig?.setPose(isCrit ? 'critStrike' : 'heavyStrike', 80);
    this.enemyRig?.setPose('hitReact', 80);

    // 2. Slash Arc VFX
    this.drawSlashArc(isCrit, isParry);

    // 3. Floating Damage Number
    this.showDamageNumber(damage, isCrit, isParry);

    // 4. Hit-stop (Section J: 50ms normal, 80ms crit, 120ms parry)
    const stopMs = isParry ? 120 : (isCrit ? 80 : 50);
    this.triggerHitStop(stopMs);

    // 5. Camera Shake
    if (!this.reducedMotion) {
      const intensity = isCrit ? 0.015 : 0.007;
      this.cameras.main.shake(120, intensity);
    }

    // Reset pose after hit
    this.time.delayedCall(160, () => {
      this.playerRig?.setPose('ready', 120);
      if (this.enemyRig && this.session?.getSnapshot().enemy.state === 'Idle') {
        this.enemyRig.setPose('idle', 120);
      }
    });
  }

  private triggerPlayerHit(_damage: number): void {
    this.playerRig?.setPose('hitReact', 80);
    if (!this.reducedMotion) {
      this.cameras.main.shake(180, 0.02);
      this.cameras.main.flash(100, 239, 35, 60, true);
    }
    this.time.delayedCall(220, () => {
      this.playerRig?.setPose('ready', 120);
    });
  }

  private triggerParryEffect(): void {
    this.enemyRig?.setPose('stagger', 120);
    this.playerRig?.setPose('parryCounter', 100);

    if (!this.reducedMotion) {
      this.cameras.main.flash(150, 255, 255, 255, true);
      this.cameras.main.shake(150, 0.018);
    }

    // Golden sparks text
    const text = this.add.text(640, 280, 'PARRY!', {
      fontFamily: 'Russo One',
      fontSize: '48px',
      color: '#ef233c',
      stroke: '#ffffff',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: 220,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  private triggerPhaseFlash(): void {
    if (!this.reducedMotion) {
      this.cameras.main.flash(400, 168, 85, 247, true);
      this.cameras.main.shake(300, 0.025);
    }
  }

  private drawSlashArc(isCrit: boolean, isParry: boolean): void {
    if (!this.slashGraphics) return;

    this.slashGraphics.clear();
    const color = isParry ? 0xef233c : (isCrit ? 0xfacc15 : 0x38bdf8);
    this.slashGraphics.lineStyle(isCrit ? 8 : 5, color, 0.9);

    const arc = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(550, 320),
      new Phaser.Math.Vector2(700, 300),
      new Phaser.Math.Vector2(850, 410)
    );
    arc.draw(this.slashGraphics);

    this.tweens.add({
      targets: this.slashGraphics,
      alpha: 0,
      duration: 120,
      onComplete: () => {
        if (this.slashGraphics) {
          this.slashGraphics.clear();
          this.slashGraphics.alpha = 1;
        }
      },
    });
  }

  private showDamageNumber(damage: number, isCrit: boolean, isParry: boolean): void {
    const x = 860 + (Math.random() * 60 - 30);
    const y = 320 + (Math.random() * 40 - 20);

    const color = isParry ? '#ef233c' : (isCrit ? '#facc15' : '#38bdf8');
    const prefix = isCrit ? 'CRIT ' : '';
    const fontSize = isCrit ? '36px' : '26px';

    const dmgText = this.add.text(x, y, `${prefix}-${damage}`, {
      fontFamily: 'Russo One',
      fontSize,
      color,
      stroke: '#06070a',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: dmgText,
      y: y - 50,
      alpha: 0,
      scaleX: isCrit ? 1.3 : 1.1,
      scaleY: isCrit ? 1.3 : 1.1,
      duration: 700,
      ease: 'Power1',
      onComplete: () => dmgText.destroy(),
    });
  }

  private triggerHitStop(ms: number): void {
    if (this.reducedMotion) return;
    this.isHitStopped = true;
    this.hitStopTimer = ms;
  }

  private syncSnapshot(snap: CombatSnapshot): void {
    // Check if enemy reconfigured
    if (this.enemyRig && this.enemyRig.config.scale === 1.15 && snap.isBossEncounter) {
      this.createEnemyRig(snap);
    }
  }

  public update(_time: number, delta: number): void {
    if (this.isHitStopped) {
      this.hitStopTimer -= delta;
      if (this.hitStopTimer <= 0) {
        this.isHitStopped = false;
      }
      return;
    }

    // Tick the session clock
    if (this.session) {
      this.session.tick(delta);
    }

    // Render dynamic ground contact shadows & neon floor illumination
    this.renderDynamicFloorLights();

    // Update Stickmen animations
    this.playerRig?.update(delta);
    this.enemyRig?.update(delta);

    // Draw telegraph bar above enemy during Windup
    this.renderTelegraphBar();
  }

  private renderDynamicFloorLights(): void {
    if (!this.floorDynamicGraphics || !this.session) return;
    const g = this.floorDynamicGraphics;
    g.clear();

    const snap = this.session.getSnapshot();
    const isPlayerSurge = snap.player.isSurgeActive || snap.player.surgeMeter >= 100;
    const isEnemyWindup = snap.enemy.state === 'Windup';
    const isBoss = snap.isBossEncounter;

    // 1. Player Ground Contact Shadow & Cyan Floor Reflection Pool
    const pX = 380;
    const pY = 432;
    // Ambient occlusion contact shadow (elliptical depth grounding)
    g.fillStyle(0x020617, 0.7);
    g.fillEllipse(pX, pY, 74, 17);
    g.fillStyle(0x000000, 0.88);
    g.fillEllipse(pX, pY, 44, 10);

    // Cyan ground neon reflection pool
    g.fillStyle(0x0284c7, isPlayerSurge ? 0.35 : 0.18);
    g.fillEllipse(pX, pY + 2, isPlayerSurge ? 120 : 85, isPlayerSurge ? 28 : 18);

    // 2. Enemy Ground Contact Shadow & Colored Floor Reflection Pool
    const eX = 900;
    const eY = 432;
    const eScale = isBoss ? 1.35 : 1.0;

    g.fillStyle(0x020617, 0.7);
    g.fillEllipse(eX, eY, 74 * eScale, 17 * eScale);
    g.fillStyle(0x000000, 0.88);
    g.fillEllipse(eX, eY, 44 * eScale, 10 * eScale);

    // Dynamic ground illumination based on enemy state
    if (isEnemyWindup) {
      g.fillStyle(0xef233c, 0.45);
      g.fillEllipse(eX, eY + 2, 130 * eScale, 32 * eScale);
    } else {
      const auraColor = isBoss ? 0xa855f7 : 0xe11d48;
      g.fillStyle(auraColor, 0.16);
      g.fillEllipse(eX, eY + 2, 85 * eScale, 20 * eScale);
    }
  }

  private renderTelegraphBar(): void {
    if (!this.telegraphGraphics || !this.session) return;
    this.telegraphGraphics.clear();

    const snap = this.session.getSnapshot();
    if (snap.enemy.state === 'Windup') {
      const enemyX = 900;
      const enemyY = 270;
      const barW = 120;
      const barH = 10;

      const progress = Math.min(1, snap.enemy.stateTimer / snap.enemy.stateDuration);
      const remainingW = (1 - progress) * barW;

      // Red danger ring above head
      this.telegraphGraphics.lineStyle(3, 0xef233c, 0.8);
      this.telegraphGraphics.strokeCircle(enemyX, enemyY - 20, 16);

      // Background bar
      this.telegraphGraphics.fillStyle(0x1e293b, 0.8);
      this.telegraphGraphics.fillRect(enemyX - barW / 2, enemyY, barW, barH);

      // Foreground countdown
      this.telegraphGraphics.fillStyle(0xef233c, 1.0);
      this.telegraphGraphics.fillRect(enemyX - barW / 2, enemyY, remainingW, barH);
    }
  }

  public shutdown(): void {
    if (this.unsubscribeEvents) {
      this.unsubscribeEvents();
      this.unsubscribeEvents = null;
    }
    if (this.unsubscribeSnapshots) {
      this.unsubscribeSnapshots();
      this.unsubscribeSnapshots = null;
    }
    this.playerRig?.destroy();
    this.enemyRig?.destroy();
    this.telegraphGraphics?.destroy();
    this.slashGraphics?.destroy();
    this.floorDynamicGraphics?.destroy();
    this.ambientParticles?.destroy();
  }
}
