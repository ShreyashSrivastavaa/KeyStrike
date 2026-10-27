/**
 * Level Select Screen for Keystrike
 * 3D Holographic Sector Cartridges with physical depth elevation,
 * metallic chassis frames, and 3D embossed golden stars.
 */

import React, { useState, useEffect } from 'react';
import { LEVELS } from '../core/levels';
import { loadGameData } from '../core/save';
import { sounds } from '../audio/sound';
import { Star, Lock, ArrowLeft, Zap, Target, Award, Shield, Sparkles } from 'lucide-react';

interface LevelSelectProps {
  onSelectLevel: (levelIndex: number) => void;
  onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({ onSelectLevel, onBack }) => {
  const saveData = loadGameData();
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        sounds.playKeyClick();
        setSelectedIdx(prev => (prev > 0 ? prev - 1 : LEVELS.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        sounds.playKeyClick();
        setSelectedIdx(prev => (prev < LEVELS.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const levelNum = selectedIdx + 1;
        const progress = saveData.levels[levelNum];
        if (progress?.unlocked) {
          sounds.playStrikeHit(false);
          onSelectLevel(selectedIdx);
        } else {
          sounds.playWrongBuzz();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        sounds.playKeyClick();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, onSelectLevel, onBack, saveData]);

  const selectedLevel = LEVELS[selectedIdx];
  const selectedProgress = saveData.levels[selectedIdx + 1];

  return (
    <div className="w-full h-full relative flex flex-col justify-between p-10 bg-[#03060c] text-white select-none overflow-hidden">
      {/* 3D Perspective Ground Grid Background */}
      <div className="absolute -bottom-28 left-0 right-0 h-[400px] cyber-grid-3d opacity-35 pointer-events-none" />

      {/* Top Header Deck */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playKeyClick();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-slate-700/80 hover:border-sky-400 text-slate-300 hover:text-white transition-all shadow-md active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">[ESC] Back to Command</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shadow-[0_0_8px_#38bdf8]" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400 font-bold">SECTOR DIRECTORY</span>
          </div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">
            <span className="text-metallic-chrome">TACTICAL</span> <span className="text-metallic-cyan">ARENAS</span>
          </h1>
        </div>

        <div className="font-mono text-xs font-bold text-slate-300 px-4 py-2 rounded-xl bg-black/60 border border-slate-800 shadow-inner flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>CLEARED:</span>
          <span className="text-metallic-gold text-sm">
            {Object.values(saveData.levels).filter(l => l.cleared).length} / 5
          </span>
        </div>
      </div>

      {/* 5 3D Holographic Sector Cartridges Row */}
      <div className="relative z-10 grid grid-cols-5 gap-5 my-auto px-2">
        {LEVELS.map((level, idx) => {
          const isSelected = idx === selectedIdx;
          const progress = saveData.levels[level.levelNumber];
          const isUnlocked = progress?.unlocked ?? false;
          const stars = progress?.bestStars ?? 0;
          const rating = progress?.bestRating ?? '-';

          return (
            <div
              key={level.levelNumber}
              onClick={() => {
                if (isUnlocked) {
                  sounds.playStrikeHit(false);
                  onSelectLevel(idx);
                } else {
                  sounds.playWrongBuzz();
                }
              }}
              onMouseEnter={() => {
                if (selectedIdx !== idx) {
                  sounds.playKeyClick();
                  setSelectedIdx(idx);
                }
              }}
              className={`card-deck-3d relative flex flex-col justify-between p-5 h-[340px] rounded-2xl cursor-pointer ${
                isSelected ? 'selected scale-105 z-20' : isUnlocked ? 'hover:scale-[1.02]' : 'opacity-50 grayscale'
              }`}
            >
              {/* Corner Hex Rivets */}
              <div className="absolute top-2.5 left-2.5 hex-bolt" />
              <div className="absolute top-2.5 right-2.5 hex-bolt" />

              {/* Header: Level Tag & Rating */}
              <div className="flex items-center justify-between mt-1">
                <span className="font-display text-xs font-extrabold uppercase tracking-wider text-sky-400">
                  SECTOR 0{level.levelNumber}
                </span>

                {isUnlocked ? (
                  rating !== '-' && (
                    <span className="font-display text-xs font-black px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      {rating}
                    </span>
                  )
                ) : (
                  <div className="p-1 rounded bg-black/60 border border-slate-700">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Holographic Sector Preview Chamber */}
              <div className="my-2 h-32 rounded-xl bg-gradient-to-b from-black/80 to-[#070a10] border border-white/10 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-sky-500/10 to-transparent pointer-events-none" />
                
                <div className="font-display text-lg font-black tracking-wide text-white uppercase drop-shadow">
                  {level.name}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5 line-clamp-1">{level.subtitle}</div>

                <div className="mt-3 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-400/40 text-[10px] font-mono text-sky-300 font-bold flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-3 h-3 text-sky-400" />
                  <span>TARGET: {level.targetWpm} WPM</span>
                </div>
              </div>

              {/* 3D Embossed Star Chamber */}
              <div className="flex items-center justify-center gap-2 py-1 bg-black/40 rounded-xl border border-slate-800/80 shadow-inner">
                {[1, 2, 3].map(starNum => (
                  <Star
                    key={starNum}
                    className={`w-5 h-5 transition-all ${
                      stars >= starNum
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110'
                        : 'text-slate-700 fill-slate-900/50'
                    }`}
                  />
                ))}
              </div>

              {/* Footer Engagement Status */}
              <div className="text-center pt-2 border-t border-slate-800/80">
                {isUnlocked ? (
                  isSelected ? (
                    <div className="font-display text-xs text-sky-400 font-black uppercase tracking-widest animate-pulse flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>[ENTER] ENGAGE</span>
                    </div>
                  ) : (
                    <span className="font-mono text-[11px] text-slate-400 font-medium">Click to Inspect</span>
                  )
                ) : (
                  <span className="font-mono text-[11px] text-slate-500 uppercase tracking-widest font-semibold">SECTOR LOCKED</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Sector Deep-Dive Telemetry Strip */}
      <div className="relative z-10 p-4 rounded-2xl bg-black/70 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <Target className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400 uppercase tracking-wider">TACTICAL DIRECTIVE:</span>
            <span className="text-white font-bold tracking-wide">{selectedLevel.newMechanicTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 uppercase tracking-wider">RECORD VELOCITY:</span>
            <span className="text-metallic-gold font-bold">{selectedProgress?.bestWpm ? `${selectedProgress.bestWpm} WPM` : '--'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 uppercase tracking-wider">PRECISION:</span>
            <span className="text-emerald-400 font-bold">{selectedProgress?.bestAccuracy ? `${Math.round(selectedProgress.bestAccuracy * 100)}%` : '--'}</span>
          </div>
        </div>

        <div className="text-slate-400 flex items-center gap-3">
          <span>[←/→] Navigate Sectors</span>
          <span className="text-slate-600">|</span>
          <span>[Enter] Deploy</span>
        </div>
      </div>

      {/* Atmospheric CRT Scanline filter */}
      <div className="absolute inset-0 crt-overlay" />
    </div>
  );
};

