/**
 * Level Victory Results Screen for Keystrike
 * Features animated star reveals, rating badges (S/A/B/C), performance metrics, and celebratory confetti.
 * Buttons: Next Sector, Replay, Level Select.
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { EncounterResults } from '../core/types';
import { sounds } from '../audio/sound';
import { Star, ArrowRight, RotateCcw, Compass, Award, CheckCircle2 } from 'lucide-react';

interface VictoryScreenProps {
  results: EncounterResults;
  isLastLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  results,
  isLastLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  const [starsRevealed, setStarsRevealed] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Trigger celebration confetti and staggered star reveal
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#facc15', '#22c55e', '#a855f7'],
      });
    } catch {
      // Fallback gracefully if canvas context restricted
    }

    // Stagger star animation
    const timer1 = setTimeout(() => {
      sounds.playCritSting();
      setStarsRevealed(1);
    }, 400);

    const timer2 = setTimeout(() => {
      if (results.stars >= 2) {
        sounds.playCritSting();
        setStarsRevealed(2);
      }
    }, 900);

    const timer3 = setTimeout(() => {
      if (results.stars >= 3) {
        sounds.playCritSting();
        setStarsRevealed(3);
      }
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [results.stars]);

  const options = [
    {
      id: 'next',
      label: isLastLevel ? 'View Campaign Epilogue' : 'Proceed to Next Sector',
      icon: <ArrowRight className="w-5 h-5 text-sky-400" />,
      action: onNextLevel,
    },
    {
      id: 'replay',
      label: 'Replay Sector',
      icon: <RotateCcw className="w-5 h-5 text-amber-400" />,
      action: onReplay,
    },
    {
      id: 'levels',
      label: 'Level Select',
      icon: <Compass className="w-5 h-5 text-slate-400" />,
      action: onLevelSelect,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        sounds.playKeyClick();
        setSelectedIdx(prev => (prev > 0 ? prev - 1 : options.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        sounds.playKeyClick();
        setSelectedIdx(prev => (prev < options.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        sounds.playStrikeHit(false);
        options[selectedIdx]?.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, options]);

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-between p-8 z-50 select-none overflow-hidden">
      {/* 3D Perspective Grid Background */}
      <div className="absolute -bottom-28 left-0 right-0 h-[380px] cyber-grid-3d opacity-25 pointer-events-none" />

      {/* Top Header Deck */}
      <div className="text-center relative z-10">
        <span className="font-mono text-xs text-sky-300 font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-black/60 border border-sky-400/40 shadow-inner">
          SECTOR 0{results.levelNumber} LIBERATED
        </span>
        <h1 className="font-display text-5xl font-black uppercase tracking-tight mt-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          <span className="text-metallic-gold">VICTORY</span> <span className="text-metallic-chrome">ACHIEVED</span>
        </h1>
        <p className="font-mono text-xs text-slate-400 mt-0.5">{results.levelName}</p>
      </div>

      {/* Center 3D Results Chassis */}
      <div className="chassis-3d carbon-underlay p-6 my-auto w-full max-w-xl flex flex-col items-center gap-4 relative z-10">
        <div className="absolute top-2.5 left-2.5 hex-bolt" />
        <div className="absolute top-2.5 right-2.5 hex-bolt" />
        <div className="absolute bottom-2.5 left-2.5 hex-bolt" />
        <div className="absolute bottom-2.5 right-2.5 hex-bolt" />

        {/* Animated 3D Trophy Stars */}
        <div className="flex items-center gap-5 my-1">
          {[1, 2, 3].map(starNum => {
            const isEarned = starsRevealed >= starNum;
            return (
              <div
                key={starNum}
                className={`transition-all duration-300 transform ${
                  isEarned ? 'scale-125 rotate-0' : 'scale-90 opacity-25 -rotate-12'
                }`}
              >
                <Star
                  className={`w-14 h-14 ${
                    isEarned
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,1)]'
                      : 'text-slate-700 fill-slate-900'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* 3D Combat Rating Medallion */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-black/70 border border-amber-500/50 shadow-[0_8px_20px_rgba(0,0,0,0.9),_0_0_15px_rgba(245,158,11,0.3)]">
            <Award className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_#f59e0b]" />
            <span className="font-display text-xs font-black text-slate-300 uppercase tracking-wider">COMBAT RATING:</span>
            <span className="font-display text-3xl font-black text-metallic-gold leading-none">{results.rating}</span>
          </div>

          <div className="px-5 py-2.5 rounded-2xl bg-black/60 border border-slate-800 text-xs font-mono shadow-inner">
            TOTAL SCORE: <span className="text-metallic-cyan font-extrabold text-sm">{results.score} PTS</span>
          </div>
        </div>

        {/* 4 3D Telemetry Pods */}
        <div className="w-full grid grid-cols-4 gap-3 text-center mt-1">
          <div className="p-3 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase">NET VELOCITY</span>
            <div className="font-display text-xl font-black text-sky-400 mt-0.5">{results.netWpm} WPM</div>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase">PRECISION</span>
            <div className="font-display text-xl font-black text-emerald-400 mt-0.5">
              {Math.round(results.accuracy * 100)}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase">PEAK COMBO</span>
            <div className="font-display text-xl font-black text-purple-400 mt-0.5">
              ×{results.longestCombo}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase">PARRIES</span>
            <div className="font-display text-xl font-black text-amber-400 mt-0.5">
              {results.parriesLanded}
            </div>
          </div>
        </div>

        {/* New Record Alert */}
        {(results.isNewBestScore || results.isNewBestStars) && (
          <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-xs shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-bold">New Record Verified & Logged</span>
          </div>
        )}

        {/* Star Directives Breakdown */}
        <div className="text-[11px] font-mono text-slate-400 flex flex-col gap-1 text-left w-full px-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span>★ Sector Cleared</span>
            <span className="text-emerald-400 font-bold">Achieved</span>
          </div>
          <div className="flex items-center justify-between">
            <span>★★ Accuracy ≥ 92% & Velocity ≥ 90% Target</span>
            <span className={results.stars >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
              {results.stars >= 2 ? 'Achieved' : 'Not Met'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>★★★ 96% Acc, 115% WPM, 0 Deaths, No Assist, ≥70% Parries</span>
            <span className={results.stars >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
              {results.stars >= 3 ? 'Achieved' : 'Not Met'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="relative z-10 flex items-center gap-4">
        {options.map((opt, idx) => {
          const isSelected = idx === selectedIdx;
          const isPrimary = idx === 0;

          if (isPrimary && isSelected) {
            return (
              <button
                key={opt.id}
                onClick={() => {
                  sounds.playStrikeHit(false);
                  opt.action();
                }}
                className="btn-arcade-3d px-8 py-3 text-sm gap-2.5 shadow-[0_0_25px_rgba(56,189,248,0.5)]"
              >
                {opt.icon}
                <span>{opt.label}</span>
                <span className="text-[11px] font-mono text-sky-200 lowercase">[enter]</span>
              </button>
            );
          }

          return (
            <button
              key={opt.id}
              onClick={() => {
                sounds.playStrikeHit(false);
                opt.action();
              }}
              onMouseEnter={() => {
                if (selectedIdx !== idx) {
                  sounds.playKeyClick();
                  setSelectedIdx(idx);
                }
              }}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl border font-display text-xs uppercase tracking-wider transition-all ${
                isSelected
                  ? 'border-sky-400 bg-black/80 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] scale-105'
                  : 'border-slate-800 bg-black/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
              {isSelected && <span className="text-[10px] font-mono text-sky-400 lowercase">[enter]</span>}
            </button>
          );
        })}
      </div>

      {/* Atmospheric CRT Scanline filter */}
      <div className="absolute inset-0 crt-overlay" />
    </div>
  );
};
