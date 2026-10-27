/**
 * Defeat Screen for Keystrike
 * Displayed when player HP reaches 0.
 * Shows stats recap, checkpoint recovery info, and Assist offer if 3+ deaths occurred.
 */

import React, { useEffect, useState } from 'react';
import { CombatSnapshot } from '../core/types';
import { sounds } from '../audio/sound';
import { RotateCcw, Compass, ShieldAlert, HeartHandshake } from 'lucide-react';

interface DefeatScreenProps {
  snapshot: CombatSnapshot;
  onRetry: (acceptAssist?: boolean) => void;
  onLevelSelect: () => void;
}

export const DefeatScreen: React.FC<DefeatScreenProps> = ({ snapshot, onRetry, onLevelSelect }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const showAssist = snapshot.showAssistOffer && !snapshot.assistActive;

  const options = [
    {
      id: 'retry',
      label: 'Retry Encounter',
      desc: 'Restart from checkpoint with restored HP',
      action: () => onRetry(false),
    },
    ...(showAssist
      ? [
          {
            id: 'assist',
            label: 'Accept Assist & Retry',
            desc: '+25% Windup time, -20% Enemy damage (Caps stars at 2)',
            action: () => onRetry(true),
          },
        ]
      : []),
    {
      id: 'levels',
      label: 'Return to Level Select',
      desc: 'Choose another sector to hone your typing skills',
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
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-between p-10 z-50 select-none overflow-hidden">
      {/* 3D Perspective Grid Background */}
      <div className="absolute -bottom-28 left-0 right-0 h-[380px] cyber-grid-3d opacity-25 pointer-events-none" />

      {/* Top Header */}
      <div className="text-center relative z-10">
        <h1 className="font-display text-7xl font-black uppercase tracking-tight text-metallic-crimson drop-shadow-[0_10px_25px_rgba(239,35,60,0.8)]">
          DEFEATED
        </h1>
        <p className="font-mono text-xs text-slate-300 mt-2">
          Slain by <span className="text-white font-black uppercase text-sm">{snapshot.enemy.config.name}</span>
        </p>
      </div>

      {/* Center Stats Recap Chassis */}
      <div className="w-full max-w-lg p-6 rounded-2xl chassis-3d carbon-underlay flex flex-col gap-4 relative z-10">
        <div className="absolute top-2.5 left-2.5 hex-bolt" />
        <div className="absolute top-2.5 right-2.5 hex-bolt" />
        <div className="absolute bottom-2.5 left-2.5 hex-bolt" />
        <div className="absolute bottom-2.5 right-2.5 hex-bolt" />

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase">WORDS STUCK</span>
            <div className="font-display text-2xl font-black text-white mt-0.5">
              {snapshot.player.wordsCompleted}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase">PEAK COMBO</span>
            <div className="font-display text-2xl font-black text-sky-400 mt-0.5">
              ×{snapshot.player.longestCombo}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase">COMBAT VELOCITY</span>
            <div className="font-display text-2xl font-black text-amber-400 mt-0.5">
              {snapshot.liveWpm} WPM
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase">DAMAGE SUSTAINED</span>
            <div className="font-display text-2xl font-black text-rose-400 mt-0.5">
              {snapshot.player.damageTaken} HP
            </div>
          </div>
        </div>

        {/* Assist Prompt Banner */}
        {showAssist && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-3 text-left shadow-lg">
            <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono font-black text-emerald-300 uppercase">ASSIST PROTOCOL AVAILABLE</div>
              <p className="text-[11px] font-mono text-slate-300 mt-0.5">
                Granting +25% longer parry reaction windows and 20% reduced enemy strike damage.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-1">
          {options.map((opt, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <div
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
                className={`card-deck-3d px-5 py-3.5 rounded-xl cursor-pointer flex items-center gap-3.5 ${
                  isSelected ? 'selected' : ''
                }`}
              >
                <div className={`p-2 rounded-lg border ${isSelected ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-black/60 border-slate-800 text-slate-400'}`}>
                  {opt.id === 'assist' ? <ShieldAlert className="w-5 h-5 text-emerald-400" /> : opt.id === 'levels' ? <Compass className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <div className="font-display text-base font-black tracking-wide uppercase flex items-center justify-between">
                    <span>{opt.label}</span>
                    {isSelected && <span className="text-[10px] font-mono text-sky-400 lowercase">[enter]</span>}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">{opt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Hint */}
      <div className="font-mono text-xs text-slate-400 relative z-10 flex items-center gap-3">
        <span>Restoring from Checkpoint (≥60 HP)</span>
        <span className="text-slate-600">|</span>
        <span>[↑/↓] Navigate</span>
        <span className="text-slate-600">|</span>
        <span>[Enter] Confirm</span>
      </div>

      {/* Atmospheric CRT Scanline filter */}
      <div className="absolute inset-0 crt-overlay" />
    </div>
  );
};
