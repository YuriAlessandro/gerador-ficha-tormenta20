/**
 * Renderiza as seções de uma região, respeitando a largura escolhida.
 *
 * `half` é resolvido com flex-wrap e não com grid de duas colunas porque uma
 * seção `half` seguida de uma `full` precisa quebrar a linha sozinha — e porque
 * no estreito o `resolveLayout` já força tudo para `full`, então aqui não há
 * nenhuma decisão de breakpoint a tomar.
 */
import React from 'react';
import { Box } from '@mui/material';

import { LayoutRegion } from '../../../interfaces/SheetLayout';
import SheetSectionFrame from './SheetSectionFrame';
import { SheetSectionNodeMap } from './sheetSectionTypes';

export interface RegionStackProps {
  region: LayoutRegion;
  nodes: SheetSectionNodeMap;
  /** `false` quando as seções já estão dentro de um card (aba/tela). */
  withCards?: boolean;
  titleColor?: string;
}

const RegionStack: React.FC<RegionStackProps> = ({
  region,
  nodes,
  withCards = true,
  titleColor,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      // O gap horizontal separa duas seções `half`; o vertical fica por conta
      // do `mb` do card, que é o espaçamento histórico da ficha.
      columnGap: 2,
    }}
  >
    {region.sections.map((section) => {
      const node = nodes[section.payload.kind];
      if (!node || !node.available) return null;

      return (
        <Box
          key={section.id}
          sx={{
            width: section.width === 'half' ? 'calc(50% - 8px)' : '100%',
            // Item de flex tem `min-width: auto`: sem isto uma tabela larga
            // (equipamentos) se recusa a encolher e estoura a coluna vizinha.
            minWidth: 0,
          }}
        >
          <SheetSectionFrame
            node={node}
            section={section}
            withCard={withCards && !node.selfContained}
            titleColor={titleColor}
          />
        </Box>
      );
    })}
  </Box>
);

export default RegionStack;
