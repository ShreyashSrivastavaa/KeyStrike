/**
 * Active Combat HUD for Keystrike
 * Hyper-realistic 3D Cockpit Interface featuring:
 * - 3D Mechanical Keycap array with authentic physical key switches, dished surfaces, and RGB underglow
 * - Cylindrical illuminated plasma health gauges with glass glints and metallic bezels
 * - Recessed tactical telemetry pods & 3D surge plasma capacitor
 */

import React, { useSyncExternalStore, useState, useEffect } from 'react';
import { Session } from '../session/Session';
import { CombatEvent } from '../core/types';
import { Flame, Shield, ShieldAlert, Skull, Zap, Pause, Forward, Activity } from 'lucide-react';

interface CombatHudProps {
  session: Session;
  onPause: () => void;
}

export const CombatHud: React.FC<CombatHudProps> = ({ session, onPause }) => {
  const snap = useSyncExternalStore(session.subscribe, session.getSnapshot);

  // Keypress feedback for kinetic physical punch
  const [lastTypedIdx, setLastTypedIdx] = useState<number | null>(null);
  const [errorShake, setErrorShake] = useState(false);

  useEffect(() => {
    const unsub = session.onEvent((evt: CombatEvent) => {
      if (evt.type === 'KEY_STROKE') {
        if (!evt.correct) {
          setErrorShake(true);
          setTimeout(() => setErrorShake(false), 240);
        } else {
          // Momentary physical key depression
          setLastTypedIdx(snap.currentWord ? snap.currentWord.cursorIndex - 1 : null);
          setTimeout(() => setLastTypedIdx(null), 120);
        }
      }
    });
    return unsub;
  }, [session, snap.currentWord]);

  const { player, enemy, currentWord, nextWord, liveWpm, liveAccuracy, skipCooldownRemaining } = snap;

  // HP Percentages
  const playerHpPct = Math.max(0, Math.min(100, (player.currentHp / player.maxHp) * 100));
  const enemyHpPct = Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));

  // Determine Typing Panel Threat Mode
  const isParryWord = currentWord?.type === 'parry' || enemy.state === 'Windup';
  const isBreakWord = currentWord?.type === 'break' || enemy.hasShield;
  const isCounterStance = enemy.counterStanceActive;

  return (
    <div className="w-full h-full relative pointer-events-none select-none flex flex-col justify-between">
      {/* =========================================================================
          TOP BAR: 3D Cylindrical Plasma Gauges, LED Encounter Pips & 3D Combo
          ========================================================================= */}
      <div className="h-24 w-full px-8 pt-3 flex items-start justify-between bg-gradient-to-b from-black/95 via-ink-950/80 to-transparent">
        {/* Left: Pilot Status & 3D Plasma Gauge */}
        <div className="w-84 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
              <span className="font-display text-xs font-bold text-sky-300 tracking-wider">SWORD PILOT</span>
            </div>
            <span className="font-mono text-xs font-extrabold text-slate-200 tracking-wide drop-shadow">
              {player.currentHp} <span className="text-slate-500 font-normal">/</span> {player.maxHp} HP
            </span>
          </div>

          {/* 3D Cylindrical Health Tube */}
          <div className="gauge-housing-3d h-5 w-full relative">
            <div className="gauge-glass-glint" />
            
            {/* Plasma fluid interior with tick lines */}
            <div className="relative w-full h-full rounded-[6px] overflow-hidden bg-black/60">
              <div
                style={{ width: `${playerHpPct}%` }}
                className={`h-full transition-all duration-150 rounded-[4px] relative ${
                  playerHpPct > 50
                    ? 'plasma-bar-emerald'
                    : playerHpPct > 25
                    ? 'plasma-bar-amber'
                    : 'plasma-bar-crimson animate-pulse'
                }`}
              >
                {/* Internal fluid light pulse */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>

              {/* Physical gauge tick marks */}
              <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-40">
                <div className="w-[1px] h-full bg-black/80" />
                <div className="w-[1px] h-full bg-black/80" />
                <div className="w-[1px] h-full bg-black/80" />
                <div className="w-[1px] h-full bg-black/80" />
              </div>
            </div>
          </div>

          {snap.assistActive && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Activity className="w-3 h-3 animate-spin" />
              <span>Assisted Cadence Engaged (-20% Dmg)</span>
            </div>
          )}
        </div>

        {/* Center: Tactical 3D Encounter Pips & 3D Combo Emissary */}
        <div className="flex flex-col items-center">
          {/* Physical Jewel LED Pips */}
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 shadow-inner mb-1.5">
            {Array.from({ length: snap.totalEncounters }).map((_, idx) => {
              const isDone = idx < snap.encounterIndex;
              const isCurrent = idx === snap.encounterIndex;
              const isBossPip = idx === snap.totalEncounters - 1;

              return (
                <div key={idx} className="flex items-center">
                  {isBossPip ? (
                    <div
                      className={`p-1.5 rounded-full border transition-all ${
                        isCurrent
                          ? 'border-purple-400 bg-purple-900 text-purple-200 shadow-[0_0_12px_#c084fc] animate-pulse'
                          : isDone
                          ? 'border-emerald-500 bg-emerald-950 text-emerald-400 shadow-[0_0_8px_#22c55e]'
                          : 'border-slate-800 bg-black/80 text-slate-700'
                      }`}
                    >
                      <Skull className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full border transition-all ${
                        isCurrent
                          ? 'border-sky-400 bg-sky-400 shadow-[0_0_10px_#38bdf8] scale-125'
                          : isDone
                          ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_8px_#22c55e]'
                          : 'border-slate-800 bg-slate-900'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 3D Extruded Combo Display */}
          <div className="flex items-center gap-2">
            {player.combo >= 5 && (
              <Flame className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_#f59e0b] animate-bounce" />
            )}
            <div
              className={`font-display text-2xl font-black uppercase tracking-widest ${
                player.combo >= 20
                  ? 'text-metallic-gold text-3xl animate-pulse'
                  : player.combo >= 10
                  ? 'text-metallic-cyan text-2xl'
                  : player.combo >= 5
                  ? 'text-emerald-400 drop-shadow-[0_0_10px_#22c55e]'
                  : 'text-slate-400'
              }`}
            >
              {player.combo > 0 ? `COMBO ×${player.combo}` : 'READY TO STRIKE'}
            </div>
          </div>
        </div>

        {/* Right: Threat Target & 3D Crimson Gauge */}
        <div className="w-84 flex flex-col gap-1.5 items-end">
          <div className="w-full flex items-center justify-between text-xs font-mono">
            <span className="font-mono text-xs font-extrabold text-slate-200 tracking-wide drop-shadow">
              {enemy.currentHp} <span className="text-slate-500 font-normal">/</span> {enemy.maxHp} HP
            </span>

            <div className="flex items-center gap-1.5">
              {enemy.hasShield && <Shield className="w-4 h-4 text-amber-400 animate-pulse drop-shadow-[0_0_8px_#facc15]" />}
              {enemy.counterStanceActive && <ShieldAlert className="w-4 h-4 text-blue-400 animate-pulse drop-shadow-[0_0_8px_#60a5fa]" />}
              <span className="font-display text-xs font-bold text-rose-400 uppercase tracking-wider">{enemy.config.name}</span>
            </div>
          </div>

          {/* 3D Cylindrical Health Tube */}
          <div className="gauge-housing-3d h-5 w-full relative">
            <div className="gauge-glass-glint" />
            
            <div className="relative w-full h-full rounded-[6px] overflow-hidden bg-black/60">
              <div
                style={{ width: `${enemyHpPct}%` }}
                className="h-full rounded-[4px] plasma-bar-crimson transition-all duration-150 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>

              {/* Physical gauge tick marks */}
              <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-40">
                <div className="w-[1px] h-full bg-black/80" />
                <div className="w-[1px] h-full bg-black/80" />
                <div className="w-[1px] h-full bg-black/80" />
                <div className="w-[1px] h-full bg-black/80" />
              </div>
            </div>
          </div>

          {/* Boss Phase Modules & Pause Button */}
          <div className="w-full flex items-center justify-between mt-0.5">
            {snap.isBossEncounter && snap.bossTotalPhases > 1 ? (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: snap.bossTotalPhases }).map((_, pIdx) => (
                  <div
                    key={pIdx}
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      pIdx === snap.bossPhaseIndex
                        ? 'border-purple-400 bg-purple-950 text-purple-200 shadow-[0_0_10px_#c084fc]'
                        : pIdx < snap.bossPhaseIndex
                        ? 'border-slate-800 bg-black/80 text-slate-700 line-through'
                        : 'border-slate-800 bg-black/60 text-slate-500'
                    }`}
                  >
                    PHASE {pIdx + 1}
                  </div>
                ))}
              </div>
            ) : <div />}

            <button
              onClick={() => {
                session.dispatch({ type: 'PAUSE', timestamp: performance.now() });
                onPause();
              }}
              className="pointer-events-auto flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-lg bg-black/60 border border-slate-700/80 hover:border-sky-400 text-slate-300 hover:text-white transition-all shadow-md hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] active:translate-y-0.5"
            >
              <Pause className="w-3.5 h-3.5 text-sky-400" />
              <span>[ESC] Pause</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ARENA VIEW CLEARANCE (Phaser 3D Perspective Stage renders here)
          ========================================================================= */}
      <div className="flex-1" />

      {/* =========================================================================
          3D MECHANICAL TYPING CONSOLE DECK (The Heart of KeyStrike)
          ========================================================================= */}
      <div className="w-full px-10 mb-3">
        <div
          className={`w-full max-w-4xl mx-auto chassis-3d carbon-underlay p-6 transition-all duration-150 relative ${
            isParryWord
              ? 'border-2 border-red-500 shadow-[0_0_35px_rgba(239,35,60,0.45)]'
              : isBreakWord
              ? 'border-2 border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.45)]'
              : isCounterStance
              ? 'border-2 border-blue-500 shadow-[0_0_35px_rgba(59,130,246,0.45)]'
              : 'border border-slate-700/60'
          } ${errorShake ? 'animate-shake' : ''}`}
        >
          {/* Corner Hex Rivets */}
          <div className="absolute top-2.5 left-2.5 hex-bolt" />
          <div className="absolute top-2.5 right-2.5 hex-bolt" />
          <div className="absolute bottom-2.5 left-2.5 hex-bolt" />
          <div className="absolute bottom-2.5 right-2.5 hex-bolt" />

          {/* Hazard Header Banner & Digital Countdown */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              {isParryWord ? (
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-red-950/80 border border-red-500 text-red-200 text-xs font-display font-black tracking-wider uppercase shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>PARRY DIRECTIVE: STRIKE BEFORE ENEMY CLASH!</span>
                </div>
              ) : isBreakWord ? (
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-amber-950/80 border border-amber-500 text-amber-200 text-xs font-display font-black tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.7)]">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>BREAK DIRECTIVE: SHATTER FORTIFIED SHIELD!</span>
                </div>
              ) : isCounterStance ? (
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-blue-950/80 border border-blue-500 text-blue-200 text-xs font-display font-black tracking-wider uppercase shadow-[0_0_20px_rgba(59,130,246,0.7)] animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                  <span>COUNTER STANCE ACTIVE: TYPOS INFLICT 4% HP DAMAGE!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                  <span>TARGET MECHANICAL CADENCE:</span>
                </div>
              )}
            </div>

            {/* Parry Timer Countdown Bar in 3D Tube */}
            {isParryWord && enemy.state === 'Windup' && (
              <div className="gauge-housing-3d h-4 w-56 relative">
                <div className="gauge-glass-glint" />
                <div className="relative w-full h-full rounded-[4px] overflow-hidden bg-black/80">
                  <div
                    style={{
                      width: `${Math.max(0, 100 - (enemy.stateTimer / enemy.stateDuration) * 100)}%`,
                    }}
                    className="h-full plasma-bar-crimson transition-all duration-75"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3D MECHANICAL KEYBOARD SWITCH ARRAY (High-Detail Physical Keycaps) */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-[#070a10] to-[#0d121c] border border-black/80 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9),_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center gap-2.5 flex-wrap min-h-[90px]">
            {currentWord ? (
              currentWord.text.split('').map((char, idx) => {
                const isTyped = idx < currentWord.cursorIndex;
                const isCursor = idx === currentWord.cursorIndex;
                const isPressed = idx === lastTypedIdx;

                let keycapClass = '';
                if (isTyped) {
                  keycapClass = 'keycap-typed';
                } else if (isCursor) {
                  keycapClass = isParryWord ? 'keycap-parry keycap-cursor' : isBreakWord ? 'keycap-break keycap-cursor' : 'keycap-cursor';
                } else if (isParryWord) {
                  keycapClass = 'keycap-parry';
                } else if (isBreakWord) {
                  keycapClass = 'keycap-break';
                }

                if (isPressed) {
                  keycapClass += ' keycap-pressed';
                }

                return (
                  <div key={idx} className="keycap-container-3d">
                    <div className={`keycap-3d text-3xl md:text-4xl ${keycapClass}`}>
                      <span>{char === ' ' ? '␣' : char}</span>
                      
                      {/* Active cursor laser indicator on bottom */}
                      {isCursor && (
                        <span className="absolute bottom-1 w-6 h-1 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <span className="text-slate-600 font-display uppercase tracking-widest text-2xl">COMBAT READY</span>
            )}
          </div>

          {/* Next Word Preview Bay */}
          <div className="mt-3 flex items-center justify-between px-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="text-slate-500 tracking-wider">RESERVE STRIKE:</span>
              <span className="px-3 py-1 rounded-md bg-black/50 border border-slate-800 text-sky-300 font-typing font-bold text-sm tracking-widest shadow-inner">
                {nextWord ? nextWord.text : 'FINISH'}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-mono tracking-wider">
              CADENCE: 0 BACKSPACE • PURE KEYBOARD FLOW
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM TELEMETRY DECK: Speed, Accuracy, 3D Surge Reactor & Skip Pedal
          ========================================================================= */}
      <div className="h-16 px-10 pb-3 flex items-center justify-between text-xs font-mono bg-gradient-to-t from-black via-ink-950/90 to-transparent">
        {/* Left: Recessed Cockpit Telemetry Pods */}
        <div className="flex items-center gap-4">
          {/* Speed Pod */}
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <Zap className="w-4 h-4 text-sky-400 shadow-sm" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">VELOCITY</span>
              <span className="font-display text-lg font-black text-white leading-none drop-shadow">
                {liveWpm} <span className="text-xs text-sky-400 font-normal">WPM</span>
              </span>
            </div>
          </div>

          {/* Accuracy Pod */}
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-black/70 border border-slate-800 shadow-inner">
            <Activity className="w-4 h-4 text-emerald-400 shadow-sm" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">PRECISION</span>
              <span className="font-display text-lg font-black text-emerald-400 leading-none drop-shadow">
                {liveAccuracy}<span className="text-xs font-normal">%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: 3D High-Voltage Surge Reactor */}
        <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-black/80 border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col items-end">
            <span className="font-display text-[10px] font-black uppercase tracking-wider text-sky-400">SURGE CAPACITOR</span>
            <span className="text-[9px] font-mono text-slate-400">{player.surgeMeter}% CHARGED</span>
          </div>

          {/* 3D Cylindrical Reactor Core Tube */}
          <div className="gauge-housing-3d h-4 w-44 relative">
            <div className="gauge-glass-glint" />
            <div className="relative w-full h-full rounded-[4px] overflow-hidden bg-black/80">
              <div
                style={{ width: `${player.surgeMeter}%` }}
                className={`h-full transition-all duration-150 rounded-[3px] relative ${
                  player.isSurgeActive
                    ? 'plasma-bar-cyan animate-pulse'
                    : player.surgeMeter >= 100
                    ? 'plasma-bar-cyan animate-pulse'
                    : 'plasma-bar-cyan'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Illuminated Tactile Surge Trigger Button */}
          {player.isSurgeActive ? (
            <div className="px-3 py-1 rounded-lg bg-sky-950 border border-sky-400 text-sky-300 font-display text-xs font-black uppercase tracking-wider shadow-[0_0_15px_#38bdf8] animate-pulse">
              OVERDRIVE (×1.5 DMG)
            </div>
          ) : player.surgeMeter >= 100 ? (
            <div className="btn-arcade-3d px-3 py-1 text-xs animate-bounce text-white shadow-[0_0_20px_#38bdf8]">
              [ENTER] SURGE!
            </div>
          ) : null}
        </div>

        {/* Right: Tactile 3D [TAB] Skip Word Pedal */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-slate-800 flex items-center gap-2">
            <Forward className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] text-slate-500 uppercase">SKIP:</span>
            {skipCooldownRemaining > 0 ? (
              <span className="text-slate-400 font-mono font-bold">{(skipCooldownRemaining / 1000).toFixed(1)}s</span>
            ) : (
              <span className="text-sky-400 font-display font-black tracking-wider">[TAB] READY</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

