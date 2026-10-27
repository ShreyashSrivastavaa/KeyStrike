/**
 * How to Play (Combat Manual) Modal for Keystrike
 * Explains typing cadence, windup parries, shields, counter stances, and combos.
 */

import React, { useEffect } from 'react';
import { sounds } from '../audio/sound';
import { X, Swords, ShieldAlert, Shield, Flame, Zap, CheckCircle2 } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        sounds.playKeyClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const cards = [
    {
      title: 'Your Keyboard is Your Sword',
      icon: <Swords className="w-5 h-5 text-sky-400" />,
      desc: 'There are no attack buttons. Each correct key micro-jabs your stickman. Completing a word lands a strike.',
      rule: 'Wrong keys are rejected, never inserted. Zero backspace dance!',
    },
    {
      title: 'Telegraphs & Red Parry Words',
      icon: <ShieldAlert className="w-5 h-5 text-parry" />,
      desc: 'When an enemy winds up, a red countdown bar and Parry Word appear. Finish the Parry Word in time to stagger the enemy!',
      rule: 'Miss it and you take heavy damage and reset your combo.',
    },
    {
      title: 'Tower Shields & Break Words',
      icon: <Shield className="w-5 h-5 text-amber-400" />,
      desc: 'Shielded guards absorb 60% of all damage. Type the gold BREAK word to shatter their shield for 12 seconds.',
      rule: 'Enemies with armor plates require breaking each plate sequentially.',
    },
    {
      title: 'Counter Stance (Blue Aura)',
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      desc: 'Crystal sentinels project a blue reactive aura. While this stance is active, any typo hurts YOU for 4% max HP!',
      rule: 'Slow down, stay calm, and focus on pure precision.',
    },
    {
      title: 'Combos & Critical Strikes',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      desc: 'Words typed with 2 or fewer typos raise your combo. Reaching 5, 10, and 20 combos boosts multiplier up to 1.5×.',
      rule: 'Typing clean words at speed ≥ 1.15× target triggers 1.75× Crits!',
    },
    {
      title: 'Surge Panic Mode (Enter)',
      icon: <Zap className="w-5 h-5 text-sky-300" />,
      desc: 'Flawless typing fills the Surge Meter. At 100%, press ENTER to unleash 6 seconds of 1.5× damage and 40% enemy slow motion.',
      rule: 'Use Surge to turn the tide during dangerous boss flurries.',
    },
  ];

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 select-none p-6 crt-overlay">
      <div className="w-full max-w-2xl p-8 rounded-2xl chassis-3d carbon-underlay relative flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Corner Hex Bolts */}
        <div className="bolt-hex absolute top-3 left-3" />
        <div className="bolt-hex absolute top-3 right-3" />
        <div className="bolt-hex absolute bottom-3 left-3" />
        <div className="bolt-hex absolute bottom-3 right-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="font-display text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-slate-300 tracking-wider">
                TACTICAL COMBAT MANUAL
              </h2>
            </div>
            <p className="font-mono text-xs text-cyan-400/80 mt-0.5 tracking-wide">
              FIELD ENCOUNTER PROTOCOLS // OPERATOR MANUAL MK-IV
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] text-slate-400 hover:text-white hover:border-cyan-400/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Strategy Cards Grid with 3D raised cards */}
        <div className="grid grid-cols-2 gap-4">
          {cards.map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-700/70 shadow-[0_6px_14px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col justify-between hover:border-cyan-400/50 transition-all"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-inner">
                    {c.icon}
                  </div>
                  <span className="font-display text-sm font-bold text-white tracking-wide">{c.title}</span>
                </div>
                <p className="text-xs font-mono text-slate-300 leading-relaxed mb-3">{c.desc}</p>
              </div>

              <div className="flex items-start gap-1.5 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-snug">{c.rule}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer 3D Pushbutton */}
        <button
          onClick={() => {
            sounds.playKeyClick();
            onClose();
          }}
          className="btn-arcade-3d w-full py-3.5 rounded-xl bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-700 text-slate-950 font-display font-black text-sm uppercase tracking-widest transition-all"
        >
          [Esc / Enter] Close Manual & Return
        </button>
      </div>
    </div>
  );
};
