/**
 * Escolhe o template e mede o container.
 *
 * A medição fica aqui, e não em cada template, porque é ela que define o que
 * "estreito" significa para a ficha inteira — e porque a pergunta certa é
 * sobre o CONTAINER, não sobre o viewport. O `Result` roda dentro do widget do
 * Escudo do Mestre, de diálogos da mesa e do painel lateral do Owlbear, onde a
 * tela é grande e o espaço não é. O `useMediaQuery` do código antigo acertava
 * na página da ficha e errava em todos esses.
 */
import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import { SheetLayout } from '../../../interfaces/SheetLayout';
import {
  resolveLayout,
  SHEET_NARROW_BREAKPOINT,
} from '../../../functions/sheetLayoutResolve';
import { useContainerWidth } from '../../../hooks/useContainerWidth';
import ActionMenuTemplate from './templates/ActionMenuTemplate';
import SinglePageTemplate from './templates/SinglePageTemplate';
import TabsTemplate from './templates/TabsTemplate';
import { availableKindsOf, SheetSectionNodeMap } from './sheetSectionTypes';
import { resolveLayoutFont } from './layoutTheme';

export interface SheetLayoutRendererProps {
  layout: SheetLayout;
  nodes: SheetSectionNodeMap;
  sheetId: string;
  /**
   * Embeds que sabem em que superfície estão (e cuja medida do container pode
   * enganar) podem cravar o modo.
   */
  forceSurface?: 'desktop' | 'mobile';
}

const SheetLayoutRenderer: React.FC<SheetLayoutRendererProps> = ({
  layout,
  nodes,
  sheetId,
  forceSurface,
}) => {
  const [containerRef, measuredWidth] = useContainerWidth<HTMLDivElement>();

  // Só vale enquanto a largura não foi medida (primeiro render, jsdom).
  const viewportNarrow = useMediaQuery(
    `(max-width:${SHEET_NARROW_BREAKPOINT}px)`,
    { noSsr: true }
  );

  const available = useMemo(() => availableKindsOf(nodes), [nodes]);

  const resolved = useMemo(() => {
    const forced =
      // eslint-disable-next-line no-nested-ternary
      forceSurface === 'mobile'
        ? { width: 0, fallbackNarrow: true }
        : forceSurface === 'desktop'
        ? { width: 0, fallbackNarrow: false }
        : { width: measuredWidth, fallbackNarrow: viewportNarrow };

    return resolveLayout(layout, { ...forced, available });
  }, [layout, measuredWidth, viewportNarrow, forceSurface, available]);

  const Template =
    // eslint-disable-next-line no-nested-ternary
    resolved.template === 'single'
      ? SinglePageTemplate
      : resolved.template === 'actionMenu'
      ? ActionMenuTemplate
      : TabsTemplate;

  const { theme } = resolved;

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        // A fonte do layout vale para a ficha inteira; sem escolha, herda.
        // O FUNDO do layout é pintado pela raiz do `Result` (ver
        // `layoutBackgroundCss`), para cobrir também as margens da ficha.
        fontFamily: resolveLayoutFont(theme.fontFamily),
      }}
    >
      <Template layout={resolved} nodes={nodes} sheetId={sheetId} />
    </Box>
  );
};

export default SheetLayoutRenderer;
