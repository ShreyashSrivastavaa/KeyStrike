/**
 * Session Layer (Glue between Core, Phaser, React, and Browser APIs).
 * Owns InputManager, event bus, clock, and state subscriptions.
 * Zero React/Phaser direct imports here — works as a pure store with subscribe/getSnapshot.
 */

import { CombatEngine } from '../core/combatEngine';
import { CombatSnapshot, CombatAction, CombatEvent } from '../core/types';
import { sounds } from '../audio/sound';

export type SnapshotListener = (snapshot: CombatSnapshot) => void;
export type EventListener = (event: CombatEvent) => void;

export class Session {
  private engine: CombatEngine;
  private currentSnapshot: CombatSnapshot;

  private snapshotListeners = new Set<SnapshotListener>();
  private eventListeners = new Set<EventListener>();

  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private blurHandler: (() => void) | null = null;
  private visibilityHandler: (() => void) | null = null;

  private isDisposed: boolean = false;

  constructor(levelIndex: number = 0, encounterIndex: number = 0, assist: boolean = false) {
    this.engine = new CombatEngine(levelIndex, encounterIndex, assist);
    this.currentSnapshot = this.engine.getSnapshot();

    this.setupInputManager();
    this.setupWindowListeners();
  }

  /**
   * Provides current snapshot for useSyncExternalStore
   */
  public getSnapshot = (): CombatSnapshot => {
    return this.currentSnapshot;
  };

  /**
   * Subscribes a React component or observer to snapshot updates
   */
  public subscribe = (listener: SnapshotListener): (() => void) => {
    this.snapshotListeners.add(listener);
    return () => {
      this.snapshotListeners.delete(listener);
    };
  };

  /**
   * Subscribes a Phaser scene or sound listener to discrete combat events
   */
  public onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  /**
   * Dispatches an action into the Core engine and notifies all listeners
   */
  public dispatch(action: CombatAction): void {
    if (this.isDisposed) return;

    const { snapshot, events } = this.engine.dispatch(action);
    this.currentSnapshot = snapshot;

    // Trigger audio effects automatically based on events
    events.forEach(evt => {
      this.handleAudioForEvent(evt);
      this.eventListeners.forEach(listener => listener(evt));
    });

    // Notify React listeners
    this.snapshotListeners.forEach(listener => listener(this.currentSnapshot));
  }

  private handleAudioForEvent(evt: CombatEvent): void {
    switch (evt.type) {
      case 'KEY_STROKE':
        if (evt.correct) {
          sounds.playCorrectTick();
        } else {
          sounds.playWrongBuzz();
        }
        break;
      case 'WORD_COMPLETED':
        sounds.playStrikeHit(evt.isCrit);
        break;
      case 'PARRY_LANDED':
        sounds.playParryClang();
        break;
      case 'ENEMY_STATE_CHANGE':
        if (evt.newState === 'Windup') {
          sounds.playWindupWarning();
        }
        break;
      case 'ENEMY_ATTACK_LANDED':
      case 'COUNTER_PENALTY':
        sounds.playPlayerHurt();
        break;
      case 'SHIELD_BROKEN':
        sounds.playShieldShatter();
        break;
      case 'SURGE_ACTIVATED':
        sounds.playSurgeActivated();
        break;
      case 'ENCOUNTER_WON':
        sounds.playVictoryJingle();
        break;
      case 'PLAYER_DEFEATED':
        sounds.playDefeatJingle();
        break;
    }
  }

  /**
   * Window-level keydown listener according to Section D1
   */
  private setupInputManager(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      if (this.isDisposed) return;

      // Ignored events
      if (e.repeat || e.isComposing) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key;

      // Handle pause (Escape)
      if (key === 'Escape') {
        e.preventDefault();
        if (this.currentSnapshot.isPaused) {
          this.dispatch({ type: 'RESUME', timestamp: performance.now() });
        } else {
          this.dispatch({ type: 'PAUSE', timestamp: performance.now() });
        }
        return;
      }

      // If paused or in terminal state, ignore typing keys
      if (this.currentSnapshot.isPaused || this.currentSnapshot.screen !== 'combat') {
        return;
      }

      // Tab key: Skip word
      if (key === 'Tab') {
        e.preventDefault();
        this.dispatch({ type: 'SKIP_WORD', timestamp: performance.now() });
        return;
      }

      // Enter key: Activate Surge
      if (key === 'Enter') {
        e.preventDefault();
        if (this.currentSnapshot.player.surgeMeter >= 100 && !this.currentSnapshot.player.isSurgeActive) {
          this.dispatch({ type: 'ACTIVATE_SURGE', timestamp: performance.now() });
        }
        return;
      }

      // Space key: allowed if part of phrase
      if (key === ' ') {
        e.preventDefault();
      }

      // Normal typing keys: single letters / space
      if (key.length === 1) {
        // Prevent default browser shortcuts for search, slash, quotes
        if (key === '/' || key === "'" || key === '"') {
          e.preventDefault();
        }
        this.dispatch({
          type: 'KEY_DOWN',
          key,
          timestamp: performance.now(),
        });
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Focus loss and visibility handlers (auto-pause)
   */
  private setupWindowListeners(): void {
    this.blurHandler = () => {
      if (!this.isDisposed && !this.currentSnapshot.isPaused && this.currentSnapshot.screen === 'combat') {
        this.dispatch({ type: 'PAUSE', timestamp: performance.now() });
      }
    };

    this.visibilityHandler = () => {
      if (document.hidden && !this.isDisposed && !this.currentSnapshot.isPaused && this.currentSnapshot.screen === 'combat') {
        this.dispatch({ type: 'PAUSE', timestamp: performance.now() });
      }
    };

    window.addEventListener('blur', this.blurHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  /**
   * Ticks the simulation (called by Phaser update or requestAnimationFrame)
   */
  public tick(deltaMs: number): void {
    if (this.isDisposed) return;
    // Delta clamped to 50ms per specification
    const clampedDelta = Math.min(50, deltaMs);
    this.dispatch({
      type: 'TICK',
      deltaMs: clampedDelta,
      timestamp: performance.now(),
    });
  }

  /**
   * Clean disposal removing all event listeners
   */
  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;

    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.blurHandler) {
      window.removeEventListener('blur', this.blurHandler);
      this.blurHandler = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    this.snapshotListeners.clear();
    this.eventListeners.clear();
  }
}
