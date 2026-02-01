import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
} from 'react';
import { FullScreenDiceCanvas } from '../components/DiceBox3D/FullScreenDiceCanvas';
import { useDiceBox, DiceRollResult } from '../hooks/useDiceBox';
import { useAuth } from '../hooks/useAuth';
import { getDiceColorHex } from '../types/diceColors';
import diceRollingSound from '../assets/sounds/dice-rolling.mp3';

export type RollPhase = 'idle' | 'rolling' | 'complete';

export interface Dice3DSettings {
  enabled: boolean;
  theme: string;
  themeColor: string;
  scale: number;
  gravity: number;
  suspendSimulation: boolean;
  mass: number;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  spinForce: number;
  throwForce: number;
  startingHeight: number;
  settleTimeout: number;
}

interface Dice3DContextValue {
  settings: Dice3DSettings;
  updateSettings: (newSettings: Partial<Dice3DSettings>) => void;
  roll3D: (notation: string) => Promise<DiceRollResult[]>;
  isReady: boolean;
  isRolling: boolean;
  rollPhase: RollPhase;
  showCanvas: boolean;
  clearDice: () => void;
  hideCanvas: () => void;
}

const defaultSettings: Dice3DSettings = {
  enabled: false,
  theme: 'default',
  themeColor: '#c41e3a', // Default red
  scale: 8,
  gravity: 5,
  suspendSimulation: false,
  mass: 2,
  friction: 0.8,
  restitution: 0,
  linearDamping: 0.3,
  angularDamping: 0.4,
  spinForce: 6,
  throwForce: 4,
  startingHeight: 8,
  settleTimeout: 2000,
};

const Dice3DContext = createContext<Dice3DContextValue | undefined>(undefined);

export function useDice3D(): Dice3DContextValue {
  const context = useContext(Dice3DContext);
  if (!context) {
    throw new Error('useDice3D must be used within Dice3DProvider');
  }
  return context;
}

// Optional version that doesn't throw - for use in providers that need graceful fallback
export function useDice3DOptional(): Dice3DContextValue | null {
  return useContext(Dice3DContext) ?? null;
}

interface Dice3DProviderProps {
  children: ReactNode;
  initialSettings?: Partial<Dice3DSettings>;
}

export function Dice3DProvider({
  children,
  initialSettings = {},
}: Dice3DProviderProps) {
  const { user } = useAuth();

  const [settingsState, setSettingsState] = useState<Dice3DSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  // Sync with user preferences from database
  useEffect(() => {
    setSettingsState((prev) => {
      const updates: Partial<Dice3DSettings> = {};

      if (user?.dice3DEnabled !== undefined) {
        updates.enabled = user.dice3DEnabled ?? false;
      }

      if (user?.diceColor !== undefined) {
        updates.themeColor = getDiceColorHex(user.diceColor);
      }

      if (Object.keys(updates).length === 0) {
        return prev;
      }

      return { ...prev, ...updates };
    });
  }, [user?.dice3DEnabled, user?.diceColor]);

  // Memoize settings to prevent unnecessary re-initializations
  const settings = useMemo(
    () => settingsState,
    [
      settingsState.enabled,
      settingsState.theme,
      settingsState.themeColor,
      settingsState.scale,
      settingsState.gravity,
      settingsState.suspendSimulation,
    ]
  );

  const [isRolling, setIsRolling] = useState(false);
  const [rollPhase, setRollPhase] = useState<RollPhase>('idle');
  const [showCanvas, setShowCanvas] = useState(false);

  const { rollMultiple, isReady, loading, clear, reinitialize, resizeWorld } =
    useDiceBox(settings);

  const updateSettings = useCallback((newSettings: Partial<Dice3DSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const clearDice = useCallback(() => {
    clear();
  }, [clear]);

  const hideCanvas = useCallback(() => {
    clear();
    setShowCanvas(false);
    setIsRolling(false);
    setRollPhase('idle');
  }, [clear]);

  const roll3D = useCallback(
    async (notation: string): Promise<DiceRollResult[]> => {
      if (!settings.enabled) {
        throw new Error('3D Dice not enabled');
      }

      // Show canvas first
      setShowCanvas(true);
      setIsRolling(true);
      setRollPhase('rolling');

      // Wait for canvas to be visible in the DOM
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Reinitialize DiceBox with correct full-screen dimensions
      // This ensures the dice use the entire visible area
      await reinitialize();

      // Ensure world is resized to fill full screen
      resizeWorld();

      // Wait a bit more for DiceBox to be fully ready
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Play dice rolling sound
      const audio = new Audio(diceRollingSound);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore errors (e.g., autoplay blocked)
      });

      try {
        // DiceBox has issues with combined notation like "1d20+1d6"
        // It interprets the second part as a modifier
        // So we need to parse and roll each dice type separately
        const diceTypes = notation.split('+').filter((d) => /\d+d\d+/i.test(d));

        // eslint-disable-next-line no-console
        console.log('[3D Dice] Rolling dice types simultaneously:', diceTypes);

        if (diceTypes.length === 0) {
          setRollPhase('complete');
          return [];
        }

        // Roll all dice types at once - they will roll simultaneously
        const allResults = await rollMultiple(diceTypes);

        // eslint-disable-next-line no-console
        console.log('[3D Dice] All results:', allResults);

        setRollPhase('complete');
        return allResults;
      } catch (err) {
        setRollPhase('idle');
        setShowCanvas(false);
        setIsRolling(false);
        throw err;
      }
    },
    [settings.enabled, rollMultiple, reinitialize, resizeWorld]
  );

  const contextValue: Dice3DContextValue = {
    settings,
    updateSettings,
    roll3D,
    isReady,
    isRolling,
    rollPhase,
    showCanvas,
    clearDice,
    hideCanvas,
  };

  return (
    <Dice3DContext.Provider value={contextValue}>
      {children}
      {/* Always render canvas so #dice-box-container exists in DOM */}
      {/* Visibility is controlled by showCanvas state, not settings.enabled */}
      <FullScreenDiceCanvas visible={showCanvas} loading={loading} />
    </Dice3DContext.Provider>
  );
}
