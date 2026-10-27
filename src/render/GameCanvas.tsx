/**
 * React wrapper for Phaser 3 Game Canvas.
 * StrictMode-safe: uses ref guard to ensure single Phaser instance creation.
 * Configured for 1280x720 logical resolution with Scale.FIT.
 */

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Session } from '../session/Session';
import { BattleScene } from './BattleScene';

interface GameCanvasProps {
  session: Session;
  reducedMotion?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ session, reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 1280,
      height: 720,
      backgroundColor: '#06070a',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BattleScene],
      audio: {
        noAudio: true, // Audio handled by pure Web Audio API SoundManager
      },
      fps: {
        target: 60,
        forceSetTimeOut: true,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Start BattleScene with active session
    game.scene.start('BattleScene', { session, reducedMotion });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [session, reducedMotion]);

  return (
    <div
      ref={containerRef}
      id="phaser-canvas-container"
      className="w-full h-full absolute inset-0 flex items-center justify-center pointer-events-none"
    />
  );
};
