import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  // useEffect, // DISABLED: 3D Dice feature temporarily disabled
  useMemo,
} from 'react';
// DISABLED: 3D Dice feature temporarily disabled
// import { DiceTray } from '../components/DiceBox3D/DiceTray';
import { useDiceBox, DiceRollResult } from '../hooks/useDiceBox';
// import { useAuth } from '../hooks/useAuth'; // DISABLED: 3D Dice feature temporarily disabled

export interface Dice3DSettings {
  enabled: boolean;
  theme: string;
  scale: number;
  gravity: number;
  suspendSimulation: boolean;
}

interface Dice3DContextValue {
  settings: Dice3DSettings;
  updateSettings: (newSettings: Partial<Dice3DSettings>) => void;
  roll3D: (notation: string) => Promise<DiceRollResult[]>;
  isReady: boolean;
  isRolling: boolean;
}

const defaultSettings: Dice3DSettings = {
  enabled: false,
  theme: 'default',
  scale: 12,
  gravity: 1,
  suspendSimulation: false,
};

const Dice3DContext = createContext<Dice3DContextValue | undefined>(undefined);

export function useDice3D(): Dice3DContextValue {
  const context = useContext(Dice3DContext);
  if (!context) {
    throw new Error('useDice3D must be used within Dice3DProvider');
  }
  return context;
}

interface Dice3DProviderProps {
  children: ReactNode;
  initialSettings?: Partial<Dice3DSettings>;
}

export function Dice3DProvider({
  children,
  initialSettings = {},
}: Dice3DProviderProps) {
  // DISABLED: 3D Dice feature temporarily disabled
  // const { user } = useAuth();

  const [settingsState, setSettingsState] = useState<Dice3DSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  // Memoize settings to prevent unnecessary re-initializations
  const settings = useMemo(
    () => settingsState,
    [
      settingsState.enabled,
      settingsState.theme,
      settingsState.scale,
      settingsState.gravity,
      settingsState.suspendSimulation,
    ]
  );

  const [isRolling, setIsRolling] = useState(false);

  // DISABLED: 3D Dice feature temporarily disabled
  const { roll, isReady } = useDiceBox(settings);
  // const { roll, isReady, loading, error } = useDiceBox(settings);

  // DISABLED: 3D Dice feature temporarily disabled
  // Sync with user settings from database
  // useEffect(() => {
  //   if (user?.dice3DEnabled !== undefined) {
  //     setSettingsState((prev) => ({
  //       ...prev,
  //       enabled: user.dice3DEnabled ?? false,
  //     }));
  //   }
  // }, [user?.dice3DEnabled]);

  const updateSettings = useCallback((newSettings: Partial<Dice3DSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const roll3D = useCallback(
    async (notation: string): Promise<DiceRollResult[]> => {
      if (!settings.enabled || !isReady) {
        throw new Error('3D Dice not enabled or not ready');
      }

      setIsRolling(true);
      try {
        const results = await roll(notation);
        return results;
      } finally {
        setTimeout(() => {
          setIsRolling(false);
        }, 2000);
      }
    },
    [settings.enabled, isReady, roll]
  );

  const contextValue: Dice3DContextValue = {
    settings,
    updateSettings,
    roll3D,
    isReady,
    isRolling,
  };

  // DISABLED: 3D Dice feature temporarily disabled
  // const handleCloseTray = useCallback(() => {
  //   setIsRolling(false);
  // }, []);

  return (
    <Dice3DContext.Provider value={contextValue}>
      {children}
      {/* DISABLED: 3D Dice feature temporarily disabled
      <DiceTray
        config={settings}
        visible={isRolling}
        onClose={handleCloseTray}
        loading={loading}
        error={error}
        isReady={isReady}
      />
      */}
    </Dice3DContext.Provider>
  );
}
