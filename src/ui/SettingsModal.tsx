/**
 * Settings Modal for Keystrike
 * Controls audio volumes, accessibility (reduced motion, high contrast), and local save reset.
 */

import React, { useState } from 'react';
import { UserSettings } from '../core/types';
import { loadGameData, saveGameData, resetGameData } from '../core/save';
import { sounds } from '../audio/sound';
import { Volume2, Eye, Type, Trash2, X, Check } from 'lucide-react';

interface SettingsModalProps {
  onClose: (updatedSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const currentData = loadGameData();
  const [settings, setSettings] = useState<UserSettings>({ ...currentData.settings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleMasterChange = (val: number) => {
    const updated = { ...settings, masterVolume: val };
    setSettings(updated);
    sounds.setVolumes(val, updated.sfxVolume);
  };

  const handleSfxChange = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    setSettings(updated);
    sounds.setVolumes(updated.masterVolume, val);
    sounds.playCorrectTick();
  };

  const handleToggleReducedMotion = () => {
    sounds.playKeyClick();
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const handleToggleHighContrast = () => {
    sounds.playKeyClick();
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const handleFontSizeChange = (size: 'normal' | 'large' | 'extra-large') => {
    sounds.playKeyClick();
    setSettings(prev => ({ ...prev, typingFontSize: size }));
  };

  const handleSaveAndClose = () => {
    sounds.playKeyClick();
    const data = loadGameData();
    data.settings = settings;
    saveGameData(data);
    onClose(settings);
  };

  const handleExecuteReset = () => {
    sounds.playStrikeHit(false);
    resetGameData();
    setShowResetConfirm(false);
    onClose(settings);
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 select-none p-6 overflow-hidden">
      {/* 3D Perspective Grid Background */}
      <div className="absolute -bottom-28 left-0 right-0 h-[380px] cyber-grid-3d opacity-25 pointer-events-none" />

      <div className="w-full max-w-lg p-8 rounded-2xl chassis-3d carbon-underlay flex flex-col gap-6 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
        <div className="absolute top-2.5 left-2.5 hex-bolt" />
        <div className="absolute top-2.5 right-2.5 hex-bolt" />
        <div className="absolute bottom-2.5 left-2.5 hex-bolt" />
        <div className="absolute bottom-2.5 right-2.5 hex-bolt" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-display text-2xl font-black uppercase text-metallic-chrome tracking-wide">
              SYSTEM & AUDIO TELEMETRY
            </h2>
            <p className="font-mono text-xs text-slate-400 mt-0.5">Customize your combat sensory feedback</p>
          </div>

          <button
            onClick={handleSaveAndClose}
            className="p-2 rounded-xl bg-black/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all shadow-sm active:translate-y-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Sliders */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-black/50 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-slate-300 font-bold">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>MASTER VOLUME</span>
              </span>
              <span className="text-metallic-cyan font-bold text-sm">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={e => handleMasterChange(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-black/50 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-slate-300 font-bold">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>SFX COMBAT AUDIO</span>
              </span>
              <span className="text-emerald-400 font-bold text-sm">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={e => handleSfxChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
          </div>
        </div>

        {/* Toggles: Reduced Motion & High Contrast */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-slate-800/80">
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Reduced Motion (Disables shake & flashes)</span>
            </div>
            <button
              onClick={handleToggleReducedMotion}
              className={`w-12 h-6 rounded-full p-1 transition-colors border ${
                settings.reducedMotion ? 'bg-sky-500 border-sky-400' : 'bg-slate-900 border-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-slate-800/80">
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
              <Type className="w-4 h-4 text-amber-400" />
              <span>High Contrast Typing Legends</span>
            </div>
            <button
              onClick={handleToggleHighContrast}
              className={`w-12 h-6 rounded-full p-1 transition-colors border ${
                settings.highContrast ? 'bg-sky-500 border-sky-400' : 'bg-slate-900 border-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.highContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Typing Font Size Selector */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase">Keycap Font Scale:</span>
          <div className="flex items-center gap-2">
            {(['normal', 'large', 'extra-large'] as const).map(size => (
              <button
                key={size}
                onClick={() => handleFontSizeChange(size)}
                className={`px-3 py-1.5 rounded-lg border font-mono uppercase text-xs transition-all ${
                  settings.typingFontSize === size
                    ? 'border-sky-400 bg-sky-950 text-white font-bold shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                    : 'border-slate-800 bg-black/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Save Button */}
        <div className="pt-2 border-t border-slate-800">
          {showResetConfirm ? (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 flex flex-col items-center gap-3 text-center shadow-lg">
              <span className="text-xs font-mono text-rose-300 font-bold uppercase">
                Reset all campaign clears and stars?
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExecuteReset}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                >
                  Yes, Erase Save
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Game Save Data</span>
            </button>
          )}
        </div>

        {/* Save & Apply 3D Button */}
        <button
          onClick={handleSaveAndClose}
          className="btn-arcade-3d w-full py-3.5 text-sm gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
        >
          <Check className="w-4 h-4 text-white" />
          <span>SAVE TELEMETRY & RETURN</span>
        </button>
      </div>

      {/* Atmospheric CRT Scanline filter */}
      <div className="absolute inset-0 crt-overlay" />
    </div>
  );
};
