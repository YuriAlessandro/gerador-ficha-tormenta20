/**
 * Qual aba/tela está aberta.
 *
 * Compartilhado pelos templates de abas e de menu de ação porque a regra é a
 * mesma nos dois, e é uma regra com armadilha: o conjunto de regiões muda em
 * runtime. Uma seção some quando a ficha deixa de ter o dado (o druida perde o
 * companheiro), o `resolveLayout` descarta a região que ficou vazia, e o id
 * guardado passa a apontar para o nada. Sem a validação abaixo o `TabContext`
 * fica com um `value` órfão e nenhum painel renderiza — a ficha aparece com as
 * abas no lugar e o conteúdo em branco.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  LayoutRegion,
  ResolvedLayout,
} from '../../../../interfaces/SheetLayout';
import {
  getRememberedSheetSurface,
  rememberSheetSurface,
} from '../../sheetSurfaceMemory';

export interface SurfaceSelection {
  activeId: string;
  setActiveId: (regionId: string) => void;
}

export function useSurfaceSelection(
  sheetId: string,
  layout: ResolvedLayout,
  surfaces: LayoutRegion[]
): SurfaceSelection {
  // O id do layout não vem no `ResolvedLayout` (ele é a superfície resolvida,
  // não o documento), então a memória é chaveada pelo template + a assinatura
  // das regiões — o suficiente para distinguir dois layouts diferentes.
  const layoutKey = useMemo(
    () => `${layout.template}:${surfaces.map((s) => s.id).join(',')}`,
    [layout.template, surfaces]
  );

  const fallback = surfaces[0]?.id ?? '';

  // A memória é lida uma vez, no mount: depois disso quem manda é o estado
  // local. É o que devolve o jogador à aba/tela em que estava quando a árvore
  // remonta (a mesa virtual troca o layout inteiro ao girar o tablet).
  const [activeId, setActive] = useState<string>(() => {
    const remembered = getRememberedSheetSurface(sheetId, layoutKey);
    return remembered && surfaces.some((s) => s.id === remembered)
      ? remembered
      : fallback;
  });

  // A região ativa pode desaparecer sem que este componente desmonte.
  useEffect(() => {
    if (!surfaces.some((s) => s.id === activeId)) {
      setActive(fallback);
    }
  }, [surfaces, activeId, fallback]);

  const setActiveId = useCallback(
    (regionId: string) => {
      setActive(regionId);
      rememberSheetSurface(sheetId, layoutKey, regionId);
    },
    [sheetId, layoutKey]
  );

  return { activeId, setActiveId };
}

export default useSurfaceSelection;
