import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SupplementId } from '../types/supplement.types';
import { dataRegistry } from '../data/registry';

/**
 * Retorna as fontes de conteúdo ativas a serem passadas aos métodos
 * `dataRegistry.*BySupplements(...)`: os suplementos oficiais habilitados pelo
 * usuário (`enabledSupplements`) somados aos suplementos registrados em runtime
 * no registry (`getRuntimeSupplementIds`).
 *
 * Este é o ponto único onde ids de suplemento runtime (strings dinâmicas) se
 * juntam aos oficiais. O retorno é tipado como `SupplementId[]` (cast de
 * fronteira): os métodos do registry mantêm essa assinatura e resolvem os ids
 * runtime registrados, sem que nenhum consumidor precise mudar.
 *
 * O CORE é garantido pelo próprio registry (`ensureCore`); aqui apenas provemos
 * o fallback quando o usuário não está logado. A lista runtime é capturada do
 * registry no momento do render; mudanças no conjunto registrado devem disparar
 * um novo render (ex.: troca de rota ou atualização do usuário).
 */
export function useContentSupplements(): SupplementId[] {
  const enabledSupplements = useSelector(
    (state: RootState) => state.auth.dbUser?.enabledSupplements
  );

  return useMemo(() => {
    const official = enabledSupplements ?? [SupplementId.TORMENTA20_CORE];
    const runtimeIds = dataRegistry.getRuntimeSupplementIds();
    // Cast de fronteira: ver doc acima.
    return [...official, ...runtimeIds] as SupplementId[];
  }, [enabledSupplements]);
}
