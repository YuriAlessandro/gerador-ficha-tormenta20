import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { RootState } from '../store';
import { LimitBoost, resolveLimitBoost } from '../functions/limitBoost';

/**
 * Estado do boost global de limites (meta de 200 apoiadores).
 *
 * A flag vem do mesmo `GET /api/feature-flags` das demais e fica em
 * `system.featureFlags` (persistido via redux-persist), então no boot o valor
 * em cache já está disponível e é revalidado logo em seguida.
 *
 * NÃO usar `useFeatureAccess('limitBoost')`: aquele hook cruza a flag com
 * `isSupporter`, e o boost vale para todo mundo — inclusive contas gratuitas.
 */
export function useLimitBoost(): LimitBoost {
  const flag = useSelector(
    (state: RootState) => state.system.featureFlags?.limitBoost
  );

  return useMemo(() => resolveLimitBoost(flag), [flag]);
}
