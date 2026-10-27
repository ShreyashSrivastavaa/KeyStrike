/**
 * Main Menu for Keystrike
 * 3D Tactical Command Deck featuring:
 * - 3D Perspective Cyber Horizon Grid
 * - 3D Extruded Metallic Branding & Sculpted Gold Trophy Counter
 * - 3D Interactive Command Deck Cards with physical extrusion and lift
 */

import React, { useState, useEffect } from 'react';
import { sounds } from '../audio/sound';
import { Swords, Play, Compass, HelpCircle, Settings, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { loadGameData } from '../core/save';

interface MainMenuProps {
  onStartCampaign: () => void;
  onContinue: () => void;
  onOpenLevelSelect: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartCampaign,
  onContinue,
  onOpenLevelSelect,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const saveData = loadGameData();
  const hasContinue = saveData.levels[2]?.unlocked || saveData.levels[1]?.cleared;

  interface MenuItem {
    id: string;
    label: string;
    desc: string;
    tag: string;
    icon: React.ReactNode;
    action: () => void;
  }

  const menuItems: MenuItem[] = [
    ...(hasContinue
      ? [
          {
            id: 'continue',
            label: 'Continue Journey',
            desc: 'Resume campaign from latest unlocked sector deployment',
            tag: 'RESUME',
            icon: <Play className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#22c55e]" />,
            action: onContinue,
          },
        ]
      : []),
    {
      id: 'campaign',
      label: hasContinue ? 'New Campaign' : 'Start Campaign',
      desc: 'Deploy to Sector 1: Rooftop Dojo and battle the 5 masters',
      tag: 'STORY',
      icon: <Swords className="w-5 h-5 text-sky-400 drop-shadow-[0_0_8px_#38bdf8]" />,
      action: onStartCampaign,
    },
    {
      id: 'levels',
      label: 'Level Select',
      desc: 'Browse arenas, practice boss encounters, and chase 3-star ratings',
      tag: 'SECTORS',
      icon: <Compass className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_#818cf8]" />,
      action: onOpenLevelSelect,
    },
    {
      id: 'howtoplay',
      label: 'Combat Manual',
      desc: 'Review parries, break words, counter stances, and combos',
      tag: 'TACTICS',
      icon: <HelpCircle className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_#facc15]" />,
      action: onOpenHowToPlay,
    },
    {
      id: 'settings',
      label: 'Settings',
      desc: 'Audio telemetry, reduced motion, and visual contrast modes',
      tag: 'SYSTEM',
      icon: <Settings className="w-5 h-5 text-slate-300 drop-shadow" />,
      action: onOpenSettings,
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        sounds.playKeyClick();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        sounds.playKeyClick();
        setSelectedIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        sounds.playStrikeHit(false);
        menuItems[selectedIndex]?.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, menuItems]);

  const totalStars = Object.values(saveData.levels).reduce((sum, lvl) => sum + (lvl.bestStars || 0), 0);

  return (
    <div className="w-full h-full relative flex flex-col justify-between p-10 bg-[#03060c] text-white select-none overflow-hidden">
      {/* 3D Perspective Ground Grid Background */}
      <div className="absolute -bottom-28 left-0 right-0 h-[400px] cyber-grid-3d opacity-40 pointer-events-none" />

      {/* Atmospheric Horizon Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-sky-950/25 to-transparent pointer-events-none" />

      {/* Top Header Deck */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shadow-[0_0_8px_#38bdf8]" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400 font-bold">
              TACTICAL BRAWLER CONSOLE • ONLINE
            </span>
          </div>

          <h1 className="font-display text-4xl font-black uppercase tracking-tight flex items-center gap-2">
            <span className="text-metallic-chrome">KEY</span>
            <span className="text-metallic-cyan">STRIKE</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Master the mechanical rhythm. Every finished word strikes.</p>
        </div>

        {/* 3D Sculpted Star / Trophy Badge */}
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black/70 border border-amber-500/40 shadow-[0_8px_20px_rgba(0,0,0,0.8),_0_0_15px_rgba(245,158,11,0.2)]">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 shadow-inner">
            <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_#f59e0b]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">TACTICAL STARS</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-black text-metallic-gold leading-none">
                {totalStars}
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">/ 15</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center 3D Command Deck Cards */}
      <div className="relative z-10 max-w-xl w-full flex flex-col gap-3.5 my-auto">
        {menuItems.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={item.id}
              onClick={() => {
                sounds.playStrikeHit(false);
                item.action();
              }}
              onMouseEnter={() => {
                if (selectedIndex !== idx) {
                  sounds.playKeyClick();
                  setSelectedIndex(idx);
                }
              }}
              className={`card-deck-3d px-6 py-4 rounded-2xl cursor-pointer flex items-center gap-4 ${
                isSelected ? 'selected' : ''
              }`}
            >
              {/* Recessed Icon Well */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400/80 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'bg-black/60 border-slate-800'
                }`}
              >
                {item.icon}
              </div>

              {/* Title & Description */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-display text-lg tracking-wide uppercase font-black text-white flex items-center gap-2.5">
                    <span>{item.label}</span>
                    {isSelected && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-400/20 text-sky-300 border border-sky-400/40 lowercase shadow-sm">
                        [enter]
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-black/40 border border-slate-800 text-slate-400">
                    {item.tag}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 mt-0.5">{item.desc}</div>
              </div>

              <ChevronRight
                className={`w-5 h-5 transition-transform ${
                  isSelected ? 'text-sky-400 translate-x-1' : 'text-slate-600'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Nav Hint Deck */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-4 bg-black/30 px-4 rounded-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">[↑/↓]</span>
            <span>Navigate Sectors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-900 border border-sky-500 text-sky-200 font-bold">[Enter]</span>
            <span>Engage Directive</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Keystrike Tactical Console v1.0</span>
        </div>
      </div>

      {/* Atmospheric CRT Scanline filter */}
      <div className="absolute inset-0 crt-overlay" />
    </div>
  );
};

