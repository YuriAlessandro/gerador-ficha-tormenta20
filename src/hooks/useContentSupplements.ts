import { useEffect, useMemo, useState } from 'react';
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
 * o fallback quando o usuário não está logado.
 *
 * O conjunto runtime não vive no Redux, então assinamos o registry
 * diretamente: ativar ou desativar um homebrew re-renderiza quem usa este hook.
 * Sem isso, telas já montadas (a Mochila, que abre por cima da ficha)
 * continuariam com a lista antiga até um render vindo de outra fonte.
 *
 * (React 17 aqui — sem `useSyncExternalStore`. A releitura da versão dentro do
 * efeito cobre a janela entre o primeiro render e a inscrição.)
 */
export function useContentSupplements(): SupplementId[] {
  const enabledSupplements = useSelector(
    (state: RootState) => state.auth.dbUser?.enabledSupplements
  );

  const [runtimeVersion, setRuntimeVersion] = useState(
    dataRegistry.getRuntimeSupplementsVersion
  );

  useEffect(() => {
    setRuntimeVersion(dataRegistry.getRuntimeSupplementsVersion());
    return dataRegistry.subscribeRuntimeSupplements(() => {
      setRuntimeVersion(dataRegistry.getRuntimeSupplementsVersion());
    });
  }, []);

  return useMemo(() => {
    const official = enabledSupplements ?? [SupplementId.TORMENTA20_CORE];
    const runtimeIds = dataRegistry.getRuntimeSupplementIds();
    // Cast de fronteira: ver doc acima.
    return [...official, ...runtimeIds] as SupplementId[];
    // `runtimeVersion` não é lido: é o gatilho de recálculo quando o conjunto
    // de suplementos runtime muda.
  }, [enabledSupplements, runtimeVersion]);
}
