import { useCallback } from 'react';
import { useDice3DOptional } from '../../../contexts/Dice3DContext';

export function useWyrtDice() {
  const dice3D = useDice3DOptional();

  const rollD6 = useCallback(async (): Promise<number> => {
    if (dice3D?.settings.enabled && dice3D.isReady) {
      const results = await dice3D.roll3D('1d6');
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1500);
      });
      dice3D.hideCanvas();
      return results[0].value;
    }
    return Math.floor(Math.random() * 6) + 1;
  }, [dice3D]);

  return { rollD6 };
}
