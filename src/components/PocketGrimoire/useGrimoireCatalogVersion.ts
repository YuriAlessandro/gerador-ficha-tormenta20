import { useEffect, useState } from 'react';
import { dataRegistry } from '../../data/registry';

/**
 * Versão do conjunto de homebrews no registry: muda quando eles chegam (depois
 * do login) ou saem. Quem memoriza itens resolvidos do grimório a põe nas
 * dependências, para trocar "Não encontrado" pelo item assim que ele existir.
 *
 * Mesmo padrão de `useContentSupplements` (React 17, sem
 * `useSyncExternalStore`): a releitura dentro do efeito cobre a janela entre
 * o primeiro render e a inscrição.
 */
export function useGrimoireCatalogVersion(): number {
  const [version, setVersion] = useState(
    dataRegistry.getRuntimeSupplementsVersion
  );

  useEffect(() => {
    setVersion(dataRegistry.getRuntimeSupplementsVersion());
    return dataRegistry.subscribeRuntimeSupplements(() => {
      setVersion(dataRegistry.getRuntimeSupplementsVersion());
    });
  }, []);

  return version;
}
