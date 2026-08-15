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
  /**
   * Id que veio da memória, ou `undefined` se não havia nada guardado.
   *
   * O menu de ação precisa distinguir "restaurado" de "primeiro da lista": ele
   * abre na lista-mestra por padrão, mas se o jogador estava DENTRO de uma tela
   * quando a árvore remontou (a mesa virtual troca o layout inteiro ao girar o
   * tablet), tem que voltar para lá — que é a razão de existir esta memória.
   */
  restoredId?: string;
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

  // Lido uma vez, no mount: depois disso quem manda é o estado local.
  const [restoredId] = useState<string | undefined>(() => {
    const remembered = getRememberedSheetSurface(sheetId, layoutKey);
    return remembered && surfaces.some((s) => s.id === remembered)
      ? remembered
      : undefined;
  });

  const [activeId, setActive] = useState<string>(restoredId ?? fallback);

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

  return { activeId, setActiveId, restoredId };
}

export default useSurfaceSelection;
