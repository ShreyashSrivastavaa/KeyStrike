/**
 * Main Application Component for Keystrike
 * Coordinates screens, Session lifecycle, Phaser canvas mounting, and React HUD overlays.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScaledContainer } from './ui/ScaledContainer';
import { TitleScreen } from './ui/TitleScreen';
import { MainMenu } from './ui/MainMenu';
import { LevelSelect } from './ui/LevelSelect';
import { PreLevelIntro } from './ui/PreLevelIntro';
import { CombatHud } from './ui/CombatHud';
import { PauseModal } from './ui/PauseModal';
import { DefeatScreen } from './ui/DefeatScreen';
import { VictoryScreen } from './ui/VictoryScreen';
import { CampaignCompleteScreen } from './ui/CampaignCompleteScreen';
import { SettingsModal } from './ui/SettingsModal';
import { HowToPlayModal } from './ui/HowToPlayModal';
import { GameCanvas } from './render/GameCanvas';
import { Session } from './session/Session';
import { CombatSnapshot, UserSettings } from './core/types';
import { LEVELS } from './core/levels';
import { loadGameData } from './core/save';
import { sounds } from './audio/sound';

type AppScreen =
  | 'title'
  | 'menu'
  | 'level_select'
  | 'pre_level'
  | 'combat'
  | 'campaign_complete';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('title');
  const [selectedLevelIdx, setSelectedLevelIdx] = useState(0);
  const [assistActive, setAssistActive] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const [snapshot, setSnapshot] = useState<CombatSnapshot | null>(null);
  const sessionRef = useRef<Session | null>(null);

  // Settings
  const [settings, setSettings] = useState<UserSettings>(() => loadGameData().settings);

  // Initialize sound volumes on mount
  useEffect(() => {
    sounds.setVolumes(settings.masterVolume, settings.sfxVolume);
  }, [settings]);

  // Clean disposal of session
  const disposeCurrentSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.dispose();
      sessionRef.current = null;
    }
    setSession(null);
    setSnapshot(null);
  }, []);

  // Start encounter session
  const startCombatSession = useCallback((levelIdx: number, encounterIdx: number = 0, assist: boolean = false) => {
    disposeCurrentSession();

    const newSession = new Session(levelIdx, encounterIdx, assist);
    sessionRef.current = newSession;
    setSession(newSession);
    setSnapshot(newSession.getSnapshot());

    // Listen to snapshot updates
    newSession.subscribe((snap) => {
      setSnapshot({ ...snap });
    });

    setCurrentScreen('combat');
  }, [disposeCurrentSession]);

  // Clean up session on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.dispose();
      }
    };
  }, []);

  // Handlers for Navigation
  const handleStartCampaign = () => {
    setSelectedLevelIdx(0);
    setAssistActive(false);
    setCurrentScreen('pre_level');
  };

  const handleContinue = () => {
    const saveData = loadGameData();
    // Find highest unlocked level
    let highest = 0;
    for (let i = 1; i <= 5; i++) {
      if (saveData.levels[i]?.unlocked) {
        highest = i - 1;
      }
    }
    setSelectedLevelIdx(highest);
    setAssistActive(false);
    setCurrentScreen('pre_level');
  };

  const handleSelectLevel = (levelIdx: number) => {
    setSelectedLevelIdx(levelIdx);
    setAssistActive(false);
    setCurrentScreen('pre_level');
  };

  const handlePreLevelFight = () => {
    startCombatSession(selectedLevelIdx, 0, assistActive);
  };

  const handleNextEncounterOrVictory = () => {
    if (!session || !snapshot) return;

    if (snapshot.encounterIndex < snapshot.totalEncounters - 1) {
      // Advance to next encounter within same level
      session.dispatch({ type: 'NEXT_ENCOUNTER', timestamp: performance.now() });
    } else {
      // Completed full sector!
      if (selectedLevelIdx >= 4) {
        // Beat Sector 5 (Ink Emperor) -> Campaign Complete!
        disposeCurrentSession();
        setCurrentScreen('campaign_complete');
      } else {
        // Move to next sector
        setSelectedLevelIdx(prev => prev + 1);
        setCurrentScreen('pre_level');
      }
    }
  };

  const handleReplaySector = () => {
    startCombatSession(selectedLevelIdx, 0, assistActive);
  };

  const handleRetryEncounter = (acceptAssist: boolean = false) => {
    if (session) {
      if (acceptAssist) {
        setAssistActive(true);
      }
      session.dispatch({
        type: 'RETRY_ENCOUNTER',
        timestamp: performance.now(),
        acceptAssist,
      });
    }
  };

  const handleQuitToMenu = () => {
    disposeCurrentSession();
    setCurrentScreen('menu');
  };

  const handleReturnFromLevelSelect = () => {
    setCurrentScreen('menu');
  };

  return (
    <div className="w-full h-full bg-ink-950 text-white relative overflow-hidden font-body">
      <ScaledContainer>
        {/* Render Phaser Battle Canvas when in Combat or Victory/Defeat states */}
        {currentScreen === 'combat' && session && (
          <GameCanvas session={session} reducedMotion={settings.reducedMotion} />
        )}

        {/* Screen 1: Title Screen */}
        {currentScreen === 'title' && (
          <TitleScreen onStart={() => setCurrentScreen('menu')} />
        )}

        {/* Screen 2: Main Menu */}
        {currentScreen === 'menu' && (
          <MainMenu
            onStartCampaign={handleStartCampaign}
            onContinue={handleContinue}
            onOpenLevelSelect={() => setCurrentScreen('level_select')}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {/* Screen 3: Level Select */}
        {currentScreen === 'level_select' && (
          <LevelSelect
            onSelectLevel={handleSelectLevel}
            onBack={handleReturnFromLevelSelect}
          />
        )}

        {/* Screen 4: Pre-Level Intro */}
        {currentScreen === 'pre_level' && (
          <PreLevelIntro
            level={LEVELS[selectedLevelIdx] || LEVELS[0]}
            onFight={handlePreLevelFight}
          />
        )}

        {/* Screen 5: Active Combat HUD */}
        {currentScreen === 'combat' && session && snapshot && !snapshot.isPaused && snapshot.screen === 'combat' && (
          <CombatHud
            session={session}
            onPause={() => {}}
          />
        )}

        {/* Pause Overlay Modal */}
        {currentScreen === 'combat' && session && snapshot && snapshot.isPaused && (
          <PauseModal
            onResume={() => session.dispatch({ type: 'RESUME', timestamp: performance.now() })}
            onRestart={() => handleRetryEncounter(false)}
            onOpenSettings={() => setShowSettings(true)}
            onQuitToMenu={handleQuitToMenu}
          />
        )}

        {/* Defeat Screen Overlay */}
        {currentScreen === 'combat' && snapshot && snapshot.screen === 'defeated' && (
          <DefeatScreen
            snapshot={snapshot}
            onRetry={handleRetryEncounter}
            onLevelSelect={() => {
              disposeCurrentSession();
              setCurrentScreen('level_select');
            }}
          />
        )}

        {/* Victory Screen Overlay */}
        {currentScreen === 'combat' && snapshot && snapshot.screen === 'victory' && snapshot.victoryStats && (
          <VictoryScreen
            results={snapshot.victoryStats}
            isLastLevel={selectedLevelIdx === 4}
            onNextLevel={handleNextEncounterOrVictory}
            onReplay={handleReplaySector}
            onLevelSelect={() => {
              disposeCurrentSession();
              setCurrentScreen('level_select');
            }}
          />
        )}

        {/* Campaign Complete Screen */}
        {currentScreen === 'campaign_complete' && (
          <CampaignCompleteScreen onReturnToMenu={() => setCurrentScreen('menu')} />
        )}

        {/* Global Settings Modal */}
        {showSettings && (
          <SettingsModal
            onClose={(updated) => {
              setSettings(updated);
              setShowSettings(false);
            }}
          />
        )}

        {/* Global How to Play Modal */}
        {showHowToPlay && (
          <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
        )}
      </ScaledContainer>
    </div>
  );
};
