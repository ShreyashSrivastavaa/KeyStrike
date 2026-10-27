/**
 * Campaign Complete Screen for Keystrike
 * Epic epilogue following the defeat of The Ink Emperor in Sector 5.
 * Summarizes full campaign achievements, stars, and credits.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { loadGameData } from '../core/save';
import { sounds } from '../audio/sound';
import { Star, Crown, Home, CheckCircle2 } from 'lucide-react';

interface CampaignCompleteScreenProps {
  onReturnToMenu: () => void;
}

export const CampaignCompleteScreen: React.FC<CampaignCompleteScreenProps> = ({ onReturnToMenu }) => {
  const saveData = loadGameData();
  const totalStars = Object.values(saveData.levels).reduce((sum, lvl) => sum + (lvl.bestStars || 0), 0);

  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#38bdf8', '#facc15', '#ffffff'],
      });
    } catch {}

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        sounds.playStrikeHit(false);
        onReturnToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReturnToMenu]);

  return (
    <div className="w-full h-full relative flex flex-col justify-between p-12 bg-slate-950 text-white select-none overflow-hidden crt-overlay">
      {/* 3D Perspective Ground Floor Grid */}
      <div className="cyber-grid-3d" />

      {/* Ambient Radial Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-purple-500/30 to-purple-900/50 border border-purple-400/50 shadow-[0_10px_25px_rgba(168,85,247,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] flex items-center justify-center text-purple-300 mb-3 transform -rotate-3 hover:rotate-0 transition-transform">
          <Crown className="w-10 h-10 text-yellow-300 drop-shadow-[0_2px_8px_rgba(250,204,21,0.8)] animate-bounce" />
        </div>
        <h1 className="font-display text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-200 to-purple-500 drop-shadow-[0_8px_25px_rgba(168,85,247,0.8)]">
          CAMPAIGN COMPLETE
        </h1>
        <p className="font-mono text-sm tracking-widest text-purple-300/90 uppercase mt-1">
          THE INK EMPEROR HAS FALLEN // REALM SECURED
        </p>
      </div>

      {/* Center Story Epilogue & Statistics */}
      <div className="relative z-10 max-w-xl mx-auto my-auto text-center flex flex-col items-center gap-6">
        <p className="text-slate-200 font-mono text-sm leading-relaxed px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700/40 backdrop-blur-sm shadow-inner">
          Through precision, blistering cadence, and unbreakable focus, you parried the Void and mastered every strike.
          The ink realm is free from the Sovereign's reign.
        </p>

        {/* Global Campaign Badge Chassis */}
        <div className="w-full p-6 rounded-2xl chassis-3d carbon-underlay relative flex items-center justify-around">
          <div className="bolt-hex absolute top-2.5 left-2.5" />
          <div className="bolt-hex absolute top-2.5 right-2.5" />
          <div className="bolt-hex absolute bottom-2.5 left-2.5" />
          <div className="bolt-hex absolute bottom-2.5 right-2.5" />

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Stars</span>
            <div className="font-display text-3xl font-black text-amber-400 mt-1 flex items-center gap-1.5 drop-shadow-[0_2px_10px_rgba(250,204,21,0.6)]">
              <Star className="w-7 h-7 fill-amber-400 text-amber-300" />
              <span>{totalStars} / 15</span>
            </div>
          </div>

          <div className="h-12 w-0.5 bg-gradient-to-b from-transparent via-slate-700 to-transparent shadow-[1px_0_0_rgba(255,255,255,0.1)]" />

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Sectors Liberated</span>
            <div className="font-display text-3xl font-black text-emerald-400 mt-1 flex items-center gap-1.5 drop-shadow-[0_2px_10px_rgba(52,211,153,0.6)]">
              <CheckCircle2 className="w-7 h-7" />
              <span>5 / 5</span>
            </div>
          </div>

          <div className="h-12 w-0.5 bg-gradient-to-b from-transparent via-slate-700 to-transparent shadow-[1px_0_0_rgba(255,255,255,0.1)]" />

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Honor Bestowed</span>
            <div className="font-display text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 mt-1 tracking-wider drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]">
              SOVEREIGN TYPIST
            </div>
          </div>
        </div>

        {/* Credits note */}
        <div className="text-xs font-mono text-slate-500 tracking-wider">
          KEYSTRIKE // MECHANICAL TYPING BRAWLER ARCHITECTURE MK-V
        </div>
      </div>

      {/* Bottom 3D Arcade Pushbutton */}
      <div className="relative z-10 flex justify-center">
        <button
          onClick={() => {
            sounds.playStrikeHit(false);
            onReturnToMenu();
          }}
          className="btn-arcade-3d flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-b from-purple-500 via-purple-600 to-purple-800 text-white font-display font-black text-base tracking-widest uppercase transition-all shadow-[0_8px_25px_rgba(168,85,247,0.5)]"
        >
          <Home className="w-5 h-5 text-purple-200" />
          <span>[Enter] Return to Main Menu</span>
        </button>
      </div>
    </div>
  );
};
