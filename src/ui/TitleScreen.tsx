/**
 * Title Screen for Keystrike
 * Cinematic 3D Arcade Experience featuring:
 * - 3D Perspective Cyber Floor Grid with vanishing horizon
 * - 3D Extruded Metallic Chrome & Cyan Branding
 * - Floating 3D Mechanical Keycaps in perspective
 * - Heavy Arcade illuminated 3D Pushbutton
 */

import React, { useEffect } from 'react';
import { sounds } from '../audio/sound';
import { Swords, Keyboard, Sparkles, Zap, ShieldAlert } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  useEffect(() => {
    const handleKeyDown = () => {
      sounds.playStrikeHit(false);
      onStart();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  const handleClick = () => {
    sounds.playStrikeHit(false);
    onStart();
  };

  return (
    <div
      onClick={handleClick}
      className="w-full h-full relative flex flex-col items-center justify-between p-10 bg-[#03060c] text-white cursor-pointer select-none overflow-hidden"
    >
      {/* 3D Perspective Horizon & Grid Floor */}
      <div className="absolute inset-0 bg-radial-gradient from-sky-950/40 via-transparent to-transparent pointer-events-none" />
      
      {/* 3D Perspective Ground Grid receding into the distance */}
      <div className="absolute -bottom-24 left-0 right-0 h-[480px] cyber-grid-3d opacity-60 pointer-events-none" />

      {/* Atmospheric Horizon Light Bar */}
      <div className="absolute top-[52%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/80 to-transparent shadow-[0_0_20px_#38bdf8] pointer-events-none" />
      <div className="absolute top-[48%] left-[20%] right-[20%] h-[30px] bg-sky-500/15 blur-2xl pointer-events-none" />

      {/* Floating 3D Mechanical Keycaps in background perspective */}
      <div className="absolute top-16 left-24 keycap-container-3d opacity-40 animate-pulse pointer-events-none rotate-12 scale-90">
        <div className="keycap-3d text-2xl font-bold">W</div>
      </div>
      <div className="absolute top-28 right-32 keycap-container-3d opacity-30 pointer-events-none -rotate-12 scale-110">
        <div className="keycap-3d text-2xl font-bold keycap-parry">P</div>
      </div>
      <div className="absolute bottom-40 left-36 keycap-container-3d opacity-30 pointer-events-none rotate-6 scale-95">
        <div className="keycap-3d text-2xl font-bold keycap-break">B</div>
      </div>
      <div className="absolute bottom-48 right-40 keycap-container-3d opacity-35 pointer-events-none -rotate-6 scale-90">
        <div className="keycap-3d text-2xl font-bold keycap-typed">K</div>
      </div>

      {/* Top Tactical Status Capsule */}
      <div className="relative z-10 flex items-center gap-2 px-5 py-2 rounded-full border border-sky-400/30 bg-black/60 shadow-[0_0_20px_rgba(56,189,248,0.25)] text-sky-300 text-xs font-mono tracking-widest uppercase">
        <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
        <span>Tactical Stickman Mechanical Brawler • Arcade Console</span>
      </div>

      {/* Central 3D Extruded Branding */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        {/* Extruded 3D Title */}
        <div className="relative">
          <div className="absolute -inset-10 bg-sky-500/15 blur-3xl rounded-full pointer-events-none" />
          
          <h1 className="relative font-display text-8xl md:text-[130px] tracking-tighter uppercase font-black leading-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]">
            <span className="text-metallic-chrome">KEY</span>
            <span className="text-metallic-cyan">STRIKE</span>
          </h1>
        </div>

        {/* Subtitle with Glowing Katana Swords */}
        <div className="mt-4 flex items-center gap-4 px-6 py-2 rounded-2xl bg-black/50 border border-white/10 shadow-lg backdrop-blur-md">
          <Swords className="w-6 h-6 text-sky-400 animate-pulse drop-shadow-[0_0_8px_#38bdf8]" />
          <p className="font-display text-xl md:text-2xl tracking-[0.3em] uppercase text-slate-200 font-extrabold">
            Your Keyboard is Your Sword
          </p>
          <Swords className="w-6 h-6 text-sky-400 scale-x-[-1] animate-pulse drop-shadow-[0_0_8px_#38bdf8]" />
        </div>

        {/* 3 Mechanical Core Pillars */}
        <div className="mt-8 flex items-center gap-8 text-xs text-slate-300 font-mono tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80] animate-ping" />
            <span className="font-bold text-white">Pure Mechanical Cadence</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold text-white">Procedural 3D Rig</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold text-white">Zero Backspace Combat</span>
          </div>
        </div>
      </div>

      {/* Bottom Heavy 3D Arcade Pushbutton */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <button className="btn-arcade-3d px-10 py-4 text-xl tracking-widest gap-3 shadow-[0_0_30px_rgba(56,189,248,0.5)]">
          <Keyboard className="w-6 h-6 text-white drop-shadow" />
          <span>PRESS ANY KEY TO ENGAGE</span>
        </button>

        <div className="text-xs text-slate-400 font-mono tracking-widest flex items-center gap-3">
          <span>v1.0.0 ARCADIA</span>
          <span className="text-slate-600">|</span>
          <span>PHYSICAL MECHANICAL KEYBOARD ENGAGED</span>
        </div>
      </div>

      {/* Atmospheric CRT Scanline filter */}
      <div className="absolute inset-0 crt-overlay" />
    </div>
  );
};

