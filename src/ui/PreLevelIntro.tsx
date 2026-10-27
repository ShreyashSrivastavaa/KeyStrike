/**
 * Pre-Level Intro Screen for Keystrike
 * Explains story beats and introduces the sector's new mechanic before combat starts.
 * Press Enter (or Space) to fight!
 */

import React, { useEffect } from 'react';
import { LevelConfig } from '../core/types';
import { sounds } from '../audio/sound';
import { Swords, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface PreLevelIntroProps {
  level: LevelConfig;
  onFight: () => void;
}

export const PreLevelIntro: React.FC<PreLevelIntroProps> = ({ level, onFight }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sounds.playStrikeHit(false);
        onFight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFight]);

  return (
    <div className="w-full h-full relative flex flex-col justify-between p-10 bg-[#03060c] text-white select-none overflow-hidden">
      {/* 3D Perspective Ground Grid Background */}
      <div className="absolute -bottom-28 left-0 right-0 h-[400px] cyber-grid-3d opacity-35 pointer-events-none" />

      {/* Atmospheric Horizon Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-sky-950/20 to-transparent pointer-events-none" />

      {/* Top Sector Deployment Capsule */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-sky-400/30 text-sky-300 font-mono text-xs uppercase tracking-widest shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
          <span>Sector 0{level.levelNumber} Tactical Infiltration</span>
        </div>

        <div className="text-xs font-mono text-slate-300 px-4 py-1.5 rounded-xl bg-black/60 border border-slate-800 shadow-inner">
          TARGET VELOCITY: <span className="text-metallic-cyan font-bold">{level.targetWpm} WPM</span>
        </div>
      </div>

      {/* Center 3D Briefing Console */}
      <div className="relative z-10 max-w-2xl mx-auto my-auto flex flex-col items-center text-center">
        <h1 className="font-display text-5xl font-black uppercase tracking-tight drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          <span className="text-metallic-chrome">{level.name.split(' ')[0]}</span>{' '}
          <span className="text-metallic-cyan">{level.name.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="font-display text-lg text-sky-400 tracking-[0.2em] uppercase mt-1 mb-4 font-bold">
          {level.subtitle}
        </p>

        <p className="text-slate-300 font-body text-base max-w-lg mb-8 leading-relaxed drop-shadow">
          {level.description}
        </p>

        {/* 3D Threat Directive Chassis */}
        <div className="w-full p-6 rounded-2xl chassis-3d carbon-underlay border border-amber-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.8),_0_0_20px_rgba(245,158,11,0.15)] text-left flex items-start gap-4 relative">
          <div className="absolute top-2.5 left-2.5 hex-bolt" />
          <div className="absolute top-2.5 right-2.5 hex-bolt" />
          <div className="absolute bottom-2.5 left-2.5 hex-bolt" />
          <div className="absolute bottom-2.5 right-2.5 hex-bolt" />

          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 shadow-inner">
            <ShieldAlert className="w-6 h-6 drop-shadow-[0_0_8px_#f59e0b]" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 font-black tracking-wider shadow-sm">
                NEW THREAT DIRECTIVE
              </span>
              <span className="font-display text-lg text-white font-black">{level.newMechanicTitle}</span>
            </div>
            <p className="text-sm font-mono text-slate-300 leading-normal">
              {level.newMechanicDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Heavy 3D Arcade Pushbutton */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <button
          onClick={() => {
            sounds.playStrikeHit(false);
            onFight();
          }}
          className="btn-arcade-3d px-10 py-3.5 text-lg gap-3 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
        >
          <Swords className="w-5 h-5 text-white" />
          <span>ENGAGE DIRECTIVE [ENTER]</span>
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
        <span className="text-xs font-mono text-slate-400">Zero backspaces permitted • Strike cadence active</span>
      </div>

      {/* Atmospheric CRT Scanline filter */}
      <div className="absolute inset-0 crt-overlay" />
    </div>
  );
};
