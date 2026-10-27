/**
 * Pause Modal for Keystrike
 * Handles Resume (with optional 3-2-1 countdown), Restart Encounter, Settings, and Quit to Menu.
 * Supports Up/Down/Enter/Esc keyboard navigation.
 */

import React, { useState, useEffect } from 'react';
import { sounds } from '../audio/sound';
import { Play, RotateCcw, Settings, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onQuitToMenu,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'restart' | 'quit' | null>(null);

  const menuOptions = [
    {
      id: 'resume',
      label: 'Resume Fight',
      icon: <Play className="w-5 h-5 text-emerald-400" />,
      action: () => startResumeCountdown(),
    },
    {
      id: 'restart',
      label: 'Restart Encounter',
      icon: <RotateCcw className="w-5 h-5 text-amber-400" />,
      action: () => setConfirmAction('restart'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5 text-sky-400" />,
      action: () => onOpenSettings(),
    },
    {
      id: 'quit',
      label: 'Quit to Main Menu',
      icon: <Home className="w-5 h-5 text-rose-400" />,
      action: () => setConfirmAction('quit'),
    },
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);

  const startResumeCountdown = () => {
    setCountdown(3);
    sounds.playKeyClick();
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        sounds.playKeyClick();
        setCountdown(countdown - 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      onResume();
    }
  }, [countdown, onResume]);

  useEffect(() => {
    if (countdown !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (confirmAction) {
        if (e.key === 'Escape') {
          e.preventDefault();
          sounds.playKeyClick();
          setConfirmAction(null);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          sounds.playStrikeHit(false);
          if (confirmAction === 'restart') onRestart();
          if (confirmAction === 'quit') onQuitToMenu();
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        sounds.playKeyClick();
        setSelectedIdx(prev => (prev > 0 ? prev - 1 : menuOptions.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        sounds.playKeyClick();
        setSelectedIdx(prev => (prev < menuOptions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        sounds.playKeyClick();
        menuOptions[selectedIdx]?.action();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        startResumeCountdown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, menuOptions, countdown, confirmAction, onRestart, onQuitToMenu]);

  // Countdown view
  if (countdown !== null) {
    return (
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 select-none overflow-hidden">
        <div className="font-display text-9xl font-black text-metallic-cyan drop-shadow-[0_0_45px_rgba(56,189,248,0.9)] animate-bounce">
          {countdown > 0 ? countdown : 'ENGAGE!'}
        </div>
        <p className="font-mono text-xs text-sky-400 mt-4 tracking-widest uppercase font-bold">Synchronizing Combat Cadence...</p>
        <div className="absolute inset-0 crt-overlay" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 select-none p-6 overflow-hidden">
      {/* 3D Perspective Grid Background */}
      <div className="absolute -bottom-28 left-0 right-0 h-[380px] cyber-grid-3d opacity-25 pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-2xl chassis-3d carbon-underlay flex flex-col gap-6 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
        <div className="absolute top-2.5 left-2.5 hex-bolt" />
        <div className="absolute top-2.5 right-2.5 hex-bolt" />
        <div className="absolute bottom-2.5 left-2.5 hex-bolt" />
        <div className="absolute bottom-2.5 right-2.5 hex-bolt" />

        <div className="text-center">
          <h2 className="font-display text-3xl font-black uppercase text-metallic-chrome tracking-wide">
            COMBAT PAUSED
          </h2>
          <p className="font-mono text-xs text-slate-400 mt-1">Simulation Clock Frozen • Weapons Locked</p>
        </div>

        {confirmAction ? (
          <div className="p-6 rounded-xl bg-black/80 border border-rose-500/50 text-center flex flex-col gap-4 shadow-inner">
            <p className="font-display text-base text-rose-300 font-bold uppercase">
              {confirmAction === 'restart' ? 'Restart current encounter?' : 'Return to main menu?'}
            </p>
            <p className="text-xs font-mono text-slate-400">Any unsaved combat progress in this encounter will be reset.</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <button
                onClick={() => {
                  sounds.playStrikeHit(false);
                  if (confirmAction === 'restart') onRestart();
                  if (confirmAction === 'quit') onQuitToMenu();
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase shadow-[0_0_15px_rgba(244,63,94,0.5)] active:translate-y-0.5"
              >
                [Enter] Confirm
              </button>
              <button
                onClick={() => {
                  sounds.playKeyClick();
                  setConfirmAction(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase active:translate-y-0.5"
              >
                [Esc] Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {menuOptions.map((opt, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    sounds.playKeyClick();
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
                  <div className={`p-2 rounded-lg border ${isSelected ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-black/60 border-slate-800'}`}>
                    {opt.icon}
                  </div>
                  <span className="flex-1 font-display text-base font-bold uppercase tracking-wider text-white">
                    {opt.label}
                  </span>
                  {isSelected && <span className="text-[10px] font-mono text-sky-400 lowercase">[enter]</span>}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center font-mono text-xs text-slate-400 border-t border-slate-800 pt-3">
          [↑/↓] Navigate • [Enter] Select • [Esc] Resume
        </div>
      </div>

      {/* Atmospheric CRT Scanline filter */}
      <div className="absolute inset-0 crt-overlay" />
    </div>
  );
};
