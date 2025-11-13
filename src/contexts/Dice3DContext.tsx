import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { DiceBox3D } from '../components/DiceBox3D';
import { useDiceBox, DiceRollResult } from '../hooks/useDiceBox';

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
  enabled: false, // Desabilitado por padrão
  theme: 'default',
  scale: 30, // Escala ajustada para tela inteira
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
  const [settings, setSettings] = useState<Dice3DSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  const [isRolling, setIsRolling] = useState(false);

  const { roll, isReady } = useDiceBox(settings);

  const updateSettings = useCallback((newSettings: Partial<Dice3DSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
        // Aguardar um pouco antes de remover o overlay para o usuário ver o resultado
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

  return (
    <Dice3DContext.Provider value={contextValue}>
      {children}
      <DiceBox3D config={settings} visible={isRolling} />
    </Dice3DContext.Provider>
  );
}
