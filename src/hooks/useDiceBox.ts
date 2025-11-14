import { useEffect, useRef, useState, useCallback } from 'react';
// @ts-expect-error - dice-box doesn't have TypeScript definitions
import DiceBox from '@3d-dice/dice-box';

export interface DiceBoxConfig {
  enabled: boolean;
  theme?: string;
  scale?: number;
  gravity?: number;
  suspendSimulation?: boolean;
}

export interface DiceRollResult {
  qty: number;
  sides: number;
  value: number;
  groupId: number;
  rollId: string;
  theme: string;
  themeColor: string;
}

export interface UseDiceBoxReturn {
  diceBox: typeof DiceBox | null;
  loading: boolean;
  error: Error | null;
  isReady: boolean;
  roll: (notation: string) => Promise<DiceRollResult[]>;
}

export function useDiceBox(config: DiceBoxConfig): UseDiceBoxReturn {
  const diceBoxRef = useRef<typeof DiceBox | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!config.enabled) {
      setIsReady(false);
      return undefined;
    }

    let mounted = true;

    async function init() {
      try {
        setLoading(true);
        setError(null);

        // Wait for container to exist
        const checkContainer = () =>
          new Promise<void>((resolve) => {
            const check = () => {
              const container = document.getElementById('dice-box-container');
              // eslint-disable-next-line no-console
              console.log('Checking for container:', container);
              if (container) {
                resolve();
              } else {
                setTimeout(check, 100);
              }
            };
            check();
          });

        await checkContainer();
        // eslint-disable-next-line no-console
        console.log('Container found, initializing DiceBox');

        const instance = new DiceBox({
          assetPath: '/assets/dice-box/',
          container: '#dice-box-container',
          scale: config.scale ?? 10,
          theme: config.theme ?? 'default',
          gravity: config.gravity ?? 1,
          suspendSimulation: config.suspendSimulation ?? false,
        });

        // eslint-disable-next-line no-console
        console.log('DiceBox instance created, calling init()');
        await instance.init();
        // eslint-disable-next-line no-console
        console.log('DiceBox initialized successfully');

        if (mounted) {
          diceBoxRef.current = instance;
          setIsReady(true);
        }
      } catch (err) {
        console.error('DiceBox init error:', err);
        if (mounted) {
          setError(err as Error);
          setIsReady(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (diceBoxRef.current) {
        diceBoxRef.current.clear();
        diceBoxRef.current = null;
      }
      setIsReady(false);
    };
  }, [
    config.enabled,
    config.theme,
    config.scale,
    config.gravity,
    config.suspendSimulation,
  ]);

  const roll = useCallback(
    async (notation: string): Promise<DiceRollResult[]> => {
      if (!diceBoxRef.current || !isReady) {
        throw new Error('DiceBox not initialized');
      }

      return new Promise((resolve, reject) => {
        try {
          // Store the original callback
          const originalCallback = diceBoxRef.current.onRollComplete;

          // Override callback for this roll
          diceBoxRef.current.onRollComplete = (results: DiceRollResult[]) => {
            // Restore original callback
            if (diceBoxRef.current) {
              diceBoxRef.current.onRollComplete = originalCallback;
            }
            resolve(results);
          };

          // Trigger the roll
          diceBoxRef.current.roll(notation);
        } catch (err) {
          reject(err);
        }
      });
    },
    [isReady]
  );

  return {
    diceBox: diceBoxRef.current,
    loading,
    error,
    isReady,
    roll,
  };
}
