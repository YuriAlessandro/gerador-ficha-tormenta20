import { useEffect, useRef, useState, useCallback } from 'react';
// @ts-expect-error - dice-box doesn't have TypeScript definitions
import DiceBox from '@3d-dice/dice-box';

export interface DiceBoxConfig {
  enabled: boolean;
  theme?: string;
  themeColor?: string; // Hex color for dice (e.g., '#c41e3a')
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
  add: (notation: string) => Promise<DiceRollResult[]>;
  rollMultiple: (notations: string[]) => Promise<DiceRollResult[]>;
  clear: () => void;
  reinitialize: () => Promise<void>;
  resizeWorld: () => void;
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
              if (container) {
                resolve();
              } else {
                setTimeout(check, 100);
              }
            };
            check();
          });

        await checkContainer();

        const instance = new DiceBox({
          assetPath: '/assets/dice-box/',
          container: '#dice-box-container',
          scale: config.scale ?? 10,
          theme: config.theme ?? 'default',
          themeColor: config.themeColor ?? '#c41e3a',
          gravity: config.gravity ?? 1,
          suspendSimulation: config.suspendSimulation ?? false,
        });

        await instance.init();

        if (mounted) {
          diceBoxRef.current = instance;
          setIsReady(true);
        }
      } catch (err) {
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

      // Remove canvas element from DOM
      const container = document.getElementById('dice-box-container');
      if (container) {
        const canvas = container.querySelector('canvas');
        if (canvas) {
          canvas.remove();
        }
      }

      setIsReady(false);
    };
  }, [
    config.enabled,
    config.theme,
    config.themeColor,
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

  // Add more dice to an existing roll (DiceBox.add method)
  const add = useCallback(
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

          // Add dice to the existing roll
          diceBoxRef.current.add(notation);
        } catch (err) {
          reject(err);
        }
      });
    },
    [isReady]
  );

  // Roll multiple dice types simultaneously
  // All dice roll at the same time and onRollComplete fires once all have settled
  const rollMultiple = useCallback(
    async (notations: string[]): Promise<DiceRollResult[]> => {
      if (!diceBoxRef.current || !isReady) {
        throw new Error('DiceBox not initialized');
      }

      if (notations.length === 0) {
        return [];
      }

      return new Promise((resolve, reject) => {
        try {
          // Store the original callback
          const originalCallback = diceBoxRef.current.onRollComplete;

          // Override callback - this fires once ALL dice have settled
          diceBoxRef.current.onRollComplete = (results: DiceRollResult[]) => {
            // Restore original callback
            if (diceBoxRef.current) {
              diceBoxRef.current.onRollComplete = originalCallback;
            }
            resolve(results);
          };

          // Roll the first notation
          diceBoxRef.current.roll(notations[0]);

          // Add remaining notations immediately (don't wait - they roll together)
          notations.slice(1).forEach((notation) => {
            diceBoxRef.current.add(notation);
          });
        } catch (err) {
          reject(err);
        }
      });
    },
    [isReady]
  );

  // Clear dice from the screen
  const clear = useCallback(() => {
    if (diceBoxRef.current) {
      diceBoxRef.current.clear();
    }
  }, []);

  // Reinitialize the DiceBox (useful after container resize)
  const reinitialize = useCallback(async () => {
    if (!config.enabled) return;

    // Clear existing instance
    if (diceBoxRef.current) {
      diceBoxRef.current.clear();
      diceBoxRef.current = null;
    }

    setIsReady(false);
    setLoading(true);
    setError(null);

    try {
      const container = document.getElementById('dice-box-container');
      if (!container) {
        throw new Error('Dice container not found');
      }

      // Remove existing canvas
      const existingCanvas = container.querySelector('canvas');
      if (existingCanvas) {
        existingCanvas.remove();
      }

      // Update container dimensions to match viewport
      const width = window.innerWidth;
      const height = window.innerHeight;
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;

      const instance = new DiceBox({
        assetPath: '/assets/dice-box/',
        container: '#dice-box-container',
        scale: config.scale ?? 10,
        theme: config.theme ?? 'default',
        themeColor: config.themeColor ?? '#c41e3a',
        gravity: config.gravity ?? 1,
        suspendSimulation: config.suspendSimulation ?? false,
      });

      await instance.init();

      // Ensure canvas has correct dimensions after init
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      // Call resizeWorld to update the physics world with correct dimensions
      if (instance.resizeWorld) {
        instance.resizeWorld();
      }

      diceBoxRef.current = instance;
      setIsReady(true);
    } catch (err) {
      setError(err as Error);
      setIsReady(false);
    } finally {
      setLoading(false);
    }
  }, [
    config.enabled,
    config.scale,
    config.theme,
    config.themeColor,
    config.gravity,
    config.suspendSimulation,
  ]);

  // Manually trigger world resize
  const resizeWorld = useCallback(() => {
    if (diceBoxRef.current && diceBoxRef.current.resizeWorld) {
      // Update canvas dimensions before resize
      const container = document.getElementById('dice-box-container');
      if (container) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;

        const canvas = container.querySelector('canvas') as HTMLCanvasElement;
        if (canvas) {
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
        }
      }
      diceBoxRef.current.resizeWorld();
    }
  }, []);

  return {
    diceBox: diceBoxRef.current,
    loading,
    error,
    isReady,
    roll,
    add,
    rollMultiple,
    clear,
    reinitialize,
    resizeWorld,
  };
}
