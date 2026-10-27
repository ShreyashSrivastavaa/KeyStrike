/**
 * Procedural Skeletal Stickman Rig for Phaser 3 Graphics.
 * Renders characters via joint angles and offsets.
 * No external spritesheets or raster art required.
 */

import Phaser from 'phaser';

export interface JointPose {
  headOffset: { x: number; y: number };
  torsoAngle: number; // radians
  leftUpperArm: number;
  leftForearm: number;
  rightUpperArm: number;
  rightForearm: number;
  leftThigh: number;
  leftShin: number;
  rightThigh: number;
  rightShin: number;
  weaponAngle?: number;
}

export type PoseType =
  | 'idle'
  | 'ready'
  | 'jabA'
  | 'jabB'
  | 'heavyStrike'
  | 'critStrike'
  | 'windup'
  | 'attack'
  | 'hitReact'
  | 'stagger'
  | 'parryCounter'
  | 'victory'
  | 'death';

export interface RigConfig {
  scale: number;
  color: number;
  glowColor: number;
  strokeWidth: number;
  headRadius: number;
  torsoLength: number;
  armLength: number;
  legLength: number;
  weaponType?: 'sword' | 'club' | 'shuriken' | 'shield' | 'hammer' | 'crystal' | 'none';
  hasScarf?: boolean;
  hasAura?: boolean;
}

// Pre-defined keyframe joint angles in radians
export const POSES: Record<PoseType, JointPose> = {
  idle: {
    headOffset: { x: 0, y: -42 },
    torsoAngle: 0.05,
    leftUpperArm: 0.6,
    leftForearm: 1.2,
    rightUpperArm: -0.6,
    rightForearm: 1.0,
    leftThigh: 0.3,
    leftShin: -0.1,
    rightThigh: -0.3,
    rightShin: 0.1,
    weaponAngle: 0.5,
  },
  ready: {
    headOffset: { x: 4, y: -40 },
    torsoAngle: 0.15,
    leftUpperArm: 1.1,
    leftForearm: 1.6,
    rightUpperArm: 0.4,
    rightForearm: 1.9,
    leftThigh: 0.6,
    leftShin: -0.4,
    rightThigh: -0.5,
    rightShin: 0.3,
    weaponAngle: 0.9,
  },
  jabA: {
    headOffset: { x: 12, y: -40 },
    torsoAngle: 0.25,
    leftUpperArm: 1.5,
    leftForearm: 0.2, // extended forward punch
    rightUpperArm: 0.2,
    rightForearm: 2.1,
    leftThigh: 0.8,
    leftShin: -0.5,
    rightThigh: -0.6,
    rightShin: 0.2,
    weaponAngle: 1.4,
  },
  jabB: {
    headOffset: { x: 10, y: -40 },
    torsoAngle: 0.2,
    leftUpperArm: 0.3,
    leftForearm: 1.8,
    rightUpperArm: 1.5,
    rightForearm: 0.2, // right punch extended
    leftThigh: 0.5,
    leftShin: -0.3,
    rightThigh: -0.7,
    rightShin: 0.4,
    weaponAngle: 1.2,
  },
  heavyStrike: {
    headOffset: { x: 22, y: -36 },
    torsoAngle: 0.45,
    leftUpperArm: 1.8,
    leftForearm: -0.2,
    rightUpperArm: 2.2,
    rightForearm: -0.5,
    leftThigh: 1.1,
    leftShin: -0.7,
    rightThigh: -0.9,
    rightShin: 0.5,
    weaponAngle: 2.3,
  },
  critStrike: {
    headOffset: { x: 18, y: -48 }, // jumping leap
    torsoAngle: 0.3,
    leftUpperArm: 2.5,
    leftForearm: 0.3,
    rightUpperArm: 2.6,
    rightForearm: 0.4,
    leftThigh: 0.9,
    leftShin: -0.9,
    rightThigh: -0.4,
    rightShin: -0.8,
    weaponAngle: 2.8,
  },
  windup: {
    headOffset: { x: -8, y: -42 }, // leaning back
    torsoAngle: -0.2,
    leftUpperArm: -0.8,
    leftForearm: 2.2,
    rightUpperArm: 2.4, // weapon raised high
    rightForearm: 1.2,
    leftThigh: -0.4,
    leftShin: 0.2,
    rightThigh: 0.7,
    rightShin: -0.5,
    weaponAngle: 2.6,
  },
  attack: {
    headOffset: { x: -24, y: -38 }, // lunging forward (enemy facing left)
    torsoAngle: -0.4,
    leftUpperArm: 1.2,
    leftForearm: 0.1,
    rightUpperArm: -1.6,
    rightForearm: -0.3,
    leftThigh: -0.8,
    leftShin: 0.4,
    rightThigh: 0.9,
    rightShin: -0.6,
    weaponAngle: -1.2,
  },
  hitReact: {
    headOffset: { x: -14, y: -44 }, // head snapped back
    torsoAngle: -0.3,
    leftUpperArm: -0.5,
    leftForearm: 0.8,
    rightUpperArm: -0.7,
    rightForearm: 0.9,
    leftThigh: -0.2,
    leftShin: 0.5,
    rightThigh: 0.4,
    rightShin: 0.1,
    weaponAngle: -0.2,
  },
  stagger: {
    headOffset: { x: -6, y: -38 },
    torsoAngle: -0.15,
    leftUpperArm: -0.9,
    leftForearm: 1.4,
    rightUpperArm: 1.1,
    rightForearm: 1.8,
    leftThigh: -0.5,
    leftShin: 0.6,
    rightThigh: 0.3,
    rightShin: -0.2,
    weaponAngle: 0.2,
  },
  parryCounter: {
    headOffset: { x: 8, y: -40 },
    torsoAngle: 0.1,
    leftUpperArm: 1.3,
    leftForearm: 1.9,
    rightUpperArm: 1.4,
    rightForearm: 1.9, // cross block
    leftThigh: 0.5,
    leftShin: -0.3,
    rightThigh: -0.5,
    rightShin: 0.2,
    weaponAngle: 1.7,
  },
  victory: {
    headOffset: { x: 0, y: -46 },
    torsoAngle: -0.05,
    leftUpperArm: 0.3,
    leftForearm: 1.4,
    rightUpperArm: 2.7, // right hand thrust to sky
    rightForearm: 0.1,
    leftThigh: 0.2,
    leftShin: 0,
    rightThigh: -0.2,
    rightShin: 0,
    weaponAngle: 3.0,
  },
  death: {
    headOffset: { x: 10, y: -16 }, // collapsed down
    torsoAngle: 1.1,
    leftUpperArm: 0.4,
    leftForearm: 1.2,
    rightUpperArm: 0.8,
    rightForearm: 0.9,
    leftThigh: 1.4,
    leftShin: -1.3,
    rightThigh: 1.2,
    rightShin: -1.2,
    weaponAngle: 0.1,
  },
};

export class StickmanRig {
  public graphics: Phaser.GameObjects.Graphics;
  public x: number;
  public y: number;
  public facingRight: boolean;

  private currentPose: JointPose;
  private targetPose: JointPose;
  private transitionProgress: number = 1.0;
  private transitionDuration: number = 100; // ms
  private transitionElapsed: number = 0;

  private breathTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    facingRight: boolean = true,
    public config: RigConfig
  ) {
    this.x = x;
    this.y = y;
    this.facingRight = facingRight;
    this.graphics = scene.add.graphics();

    this.currentPose = { ...POSES.idle };
    this.targetPose = { ...POSES.idle };
  }

  public setPose(poseName: PoseType, durationMs: number = 100): void {
    const target = POSES[poseName];
    if (!target) return;

    this.currentPose = this.interpolatePoses(this.currentPose, this.targetPose, Math.min(1, this.transitionProgress));
    this.targetPose = { ...target };
    this.transitionDuration = Math.max(1, durationMs);
    this.transitionElapsed = 0;
    this.transitionProgress = 0;
  }

  public update(deltaMs: number): void {
    this.breathTimer += deltaMs * 0.003;

    if (this.transitionProgress < 1.0) {
      this.transitionElapsed += deltaMs;
      this.transitionProgress = Math.min(1.0, this.transitionElapsed / this.transitionDuration);
    }

    this.render();
  }

  private interpolatePoses(a: JointPose, b: JointPose, t: number): JointPose {
    const smoothT = t * t * (3 - 2 * t); // smoothstep easing
    const lerp = (v1: number, v2: number) => v1 + (v2 - v1) * smoothT;

    return {
      headOffset: {
        x: lerp(a.headOffset.x, b.headOffset.x),
        y: lerp(a.headOffset.y, b.headOffset.y),
      },
      torsoAngle: lerp(a.torsoAngle, b.torsoAngle),
      leftUpperArm: lerp(a.leftUpperArm, b.leftUpperArm),
      leftForearm: lerp(a.leftForearm, b.leftForearm),
      rightUpperArm: lerp(a.rightUpperArm, b.rightUpperArm),
      rightForearm: lerp(a.rightForearm, b.rightForearm),
      leftThigh: lerp(a.leftThigh, b.leftThigh),
      leftShin: lerp(a.leftShin, b.leftShin),
      rightThigh: lerp(a.rightThigh, b.rightThigh),
      rightShin: lerp(a.rightShin, b.rightShin),
      weaponAngle: a.weaponAngle !== undefined && b.weaponAngle !== undefined ? lerp(a.weaponAngle, b.weaponAngle) : undefined,
    };
  }

  private render(): void {
    const g = this.graphics;
    g.clear();

    const pose = this.interpolatePoses(this.currentPose, this.targetPose, this.transitionProgress);
    const flip = this.facingRight ? 1 : -1;
    const s = this.config.scale;

    // Subtle breathing bob
    const breathY = Math.sin(this.breathTimer) * 2;

    const rootX = this.x;
    const rootY = this.y + breathY;

    // Torso anchor (pelvis)
    const pelvisX = rootX;
    const pelvisY = rootY;

    // Torso vector
    const torsoLen = this.config.torsoLength * s;
    const neckX = pelvisX + Math.sin(pose.torsoAngle * flip) * torsoLen;
    const neckY = pelvisY - Math.cos(pose.torsoAngle) * torsoLen;

    // Head
    const headX = neckX + pose.headOffset.x * flip * s;
    const headY = neckY + (pose.headOffset.y + 40) * s - (this.config.headRadius * s * 1.2);

    // 1. Soft Outer Volumetric Glow
    g.lineStyle(this.config.strokeWidth + 6, this.config.glowColor, 0.35);
    this.drawSkeleton(g, pelvisX, pelvisY, neckX, neckY, headX, headY, pose, flip, s, false);

    // 2. Physical Cylindrical Limb Core
    g.lineStyle(this.config.strokeWidth, this.config.color, 0.95);
    this.drawSkeleton(g, pelvisX, pelvisY, neckX, neckY, headX, headY, pose, flip, s, true);

    // 3. Accessories & Cyber Details
    this.drawAccessories(g, neckX, neckY, headX, headY, pose, flip, s);
  }

  private drawSkeleton(
    g: Phaser.GameObjects.Graphics,
    pelvisX: number,
    pelvisY: number,
    neckX: number,
    neckY: number,
    headX: number,
    headY: number,
    pose: JointPose,
    flip: number,
    s: number,
    drawJointNodes: boolean
  ): void {
    const armLen = this.config.armLength * s;
    const legLen = this.config.legLength * s;
    const headR = this.config.headRadius * s;

    // 1. Head (Solid with illuminated visor slit)
    if (drawJointNodes) {
      g.fillStyle(0x0f172a, 0.95);
      g.fillCircle(headX, headY, headR);
      g.lineStyle(2, this.config.color, 1.0);
      g.strokeCircle(headX, headY, headR);

      // Glowing Cyber Visor Slit
      g.lineStyle(2.5, this.config.glowColor, 1.0);
      g.lineBetween(headX + 2 * flip * s, headY - 1 * s, headX + 9 * flip * s, headY - 1 * s);
    } else {
      g.strokeCircle(headX, headY, headR + 2);
    }

    // 2. Torso line
    g.lineBetween(pelvisX, pelvisY, neckX, neckY);

    // 3. Legs
    // Left Leg (hip -> knee -> foot)
    const lKneeX = pelvisX + Math.sin(pose.leftThigh * flip) * legLen;
    const lKneeY = pelvisY + Math.cos(pose.leftThigh) * legLen;
    const lFootX = lKneeX + Math.sin((pose.leftThigh + pose.leftShin) * flip) * legLen;
    const lFootY = lKneeY + Math.cos(pose.leftThigh + pose.leftShin) * legLen;
    g.lineBetween(pelvisX, pelvisY, lKneeX, lKneeY);
    g.lineBetween(lKneeX, lKneeY, lFootX, lFootY);

    // Right Leg
    const rKneeX = pelvisX + Math.sin(pose.rightThigh * flip) * legLen;
    const rKneeY = pelvisY + Math.cos(pose.rightThigh) * legLen;
    const rFootX = rKneeX + Math.sin((pose.rightThigh + pose.rightShin) * flip) * legLen;
    const rFootY = rKneeY + Math.cos(pose.rightThigh + pose.rightShin) * legLen;
    g.lineBetween(pelvisX, pelvisY, rKneeX, rKneeY);
    g.lineBetween(rKneeX, rKneeY, rFootX, rFootY);

    // 4. Arms
    // Left Arm (shoulder -> elbow -> hand)
    const lElbowX = neckX + Math.sin(pose.leftUpperArm * flip) * armLen;
    const lElbowY = neckY + Math.cos(pose.leftUpperArm) * armLen;
    const lHandX = lElbowX + Math.sin((pose.leftUpperArm + pose.leftForearm) * flip) * armLen;
    const lHandY = lElbowY + Math.cos(pose.leftUpperArm + pose.leftForearm) * armLen;
    g.lineBetween(neckX, neckY, lElbowX, lElbowY);
    g.lineBetween(lElbowX, lElbowY, lHandX, lHandY);

    // Right Arm
    const rElbowX = neckX + Math.sin(pose.rightUpperArm * flip) * armLen;
    const rElbowY = neckY + Math.cos(pose.rightUpperArm) * armLen;
    const rHandX = rElbowX + Math.sin((pose.rightUpperArm + pose.rightForearm) * flip) * armLen;
    const rHandY = rElbowY + Math.cos(pose.rightUpperArm + pose.rightForearm) * armLen;
    g.lineBetween(neckX, neckY, rElbowX, rElbowY);
    g.lineBetween(rElbowX, rElbowY, rHandX, rHandY);

    // Draw Spherical Joint Nodes for 3D Skeletal Feel
    if (drawJointNodes) {
      g.fillStyle(this.config.glowColor, 0.9);
      const nodeR = 2.5 * s;
      g.fillCircle(pelvisX, pelvisY, nodeR);
      g.fillCircle(neckX, neckY, nodeR);
      g.fillCircle(lKneeX, lKneeY, nodeR);
      g.fillCircle(rKneeX, rKneeY, nodeR);
      g.fillCircle(lElbowX, lElbowY, nodeR);
      g.fillCircle(rElbowX, rElbowY, nodeR);
    }

    // 5. Weapon (Detailed 3D Energy Blades & Weapons)
    if (this.config.weaponType && this.config.weaponType !== 'none') {
      const handX = rHandX;
      const handY = rHandY;
      const wAngle = pose.weaponAngle ?? 1.0;
      const wLen = 34 * s;
      const tipX = handX + Math.sin(wAngle * flip) * wLen;
      const tipY = handY - Math.cos(wAngle) * wLen;

      if (this.config.weaponType === 'sword') {
        if (!drawJointNodes) {
          // Volumetric outer laser blade aura
          g.lineStyle(10, this.config.glowColor, 0.4);
          g.lineBetween(handX, handY, tipX, tipY);
        } else {
          // Metallic Tsuba / Handguard
          g.lineStyle(4, 0x94a3b8, 1.0);
          g.lineBetween(handX - 5 * s, handY, handX + 5 * s, handY);
          
          // Pure White-Hot Energy Blade Core
          g.lineStyle(4, 0xffffff, 1.0);
          g.lineBetween(handX, handY, tipX, tipY);
        }
      } else if (this.config.weaponType === 'club') {
        g.lineStyle(this.config.strokeWidth + 5, 0x9a3412, 1.0);
        g.lineBetween(handX, handY, tipX, tipY);
      } else if (this.config.weaponType === 'hammer') {
        g.lineBetween(handX, handY, tipX, tipY);
        g.fillStyle(0x334155, 1.0);
        g.fillRect(tipX - 12 * s, tipY - 8 * s, 24 * s, 16 * s);
        g.lineStyle(2, this.config.glowColor, 1.0);
        g.strokeRect(tipX - 12 * s, tipY - 8 * s, 24 * s, 16 * s);
      } else if (this.config.weaponType === 'shield') {
        g.fillStyle(0x0f172a, 0.85);
        g.fillRoundedRect(lHandX - 15 * s, lHandY - 25 * s, 30 * s, 50 * s, 6);
        g.lineStyle(3, this.config.glowColor, 0.9);
        g.strokeRoundedRect(lHandX - 15 * s, lHandY - 25 * s, 30 * s, 50 * s, 6);
      }
    }
  }

  private drawAccessories(
    g: Phaser.GameObjects.Graphics,
    neckX: number,
    neckY: number,
    _headX: number,
    _headY: number,
    _pose: JointPose,
    flip: number,
    s: number
  ): void {
    if (this.config.hasScarf) {
      g.lineStyle(4, 0xef233c, 0.9);
      const waveX = Math.sin(this.breathTimer * 2) * 8;
      g.lineBetween(neckX, neckY, neckX - 25 * flip * s + waveX, neckY + 12 * s);
    }

    if (this.config.hasAura) {
      g.lineStyle(2, this.config.glowColor, 0.4);
      g.strokeCircle(this.x, this.y - 30 * s, (45 + Math.sin(this.breathTimer * 3) * 5) * s);
    }
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
