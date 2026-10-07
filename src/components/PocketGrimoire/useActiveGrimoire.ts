import { PocketGrimoire } from '../../interfaces/PocketGrimoire';
import { useAppSelector } from '../../store/hooks';
import {
  selectActiveGrimoire,
  selectGrimoires,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { useGrimoireLimit } from './useGrimoireLimit';

/**
 * Grimório ativo para uso: o gravado, ou — se ele estiver acima do limite — o
 * primeiro liberado. Calculado na leitura e nunca gravado: o plano chega de
 * forma assíncrona, e gravar a troca faria o ativo mudar sozinho a cada
 * carregamento.
 */
export function useActiveGrimoire(): PocketGrimoire {
  const grimoires = useAppSelector(selectGrimoires);
  const stored = useAppSelector(selectActiveGrimoire);
  const { lockedIds } = useGrimoireLimit();
  if (!lockedIds.has(stored.id)) return stored;
  return grimoires.find((g) => !lockedIds.has(g.id)) ?? stored;
}
