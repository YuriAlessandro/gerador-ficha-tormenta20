/**
 * Arranjo fixo das seções da ficha, para quem roda o projeto sem o submódulo
 * premium (onde vive o sistema de layouts configuráveis).
 *
 * Identidade no topo; no computador, duas colunas (corpo à esquerda, perícias
 * e diário à direita); no celular, uma coluna só; o rodapé por último. Cada
 * seção é um card próprio, exceto as que já trazem o próprio container.
 */
import React from 'react';
import { Box, Stack, useMediaQuery } from '@mui/material';

import SheetSectionFrame from './SheetSectionFrame';
import { SheetSectionKind, SheetSectionNodeMap } from './sheetSectionTypes';

const HEADER: SheetSectionKind[] = ['identity'];
const MAIN: SheetSectionKind[] = [
  'attributes',
  'attacks',
  'defense',
  'powers',
  'spells',
  'equipment',
  'proficiencies',
  'sizeDisplacement',
  'partners',
  'animalCompanions',
];
const ASIDE: SheetSectionKind[] = ['skills', 'journal'];
const FOOTER: SheetSectionKind[] = ['creationSteps', 'bugReport', 'supportCta'];

export interface DefaultSheetArrangementProps {
  nodes: SheetSectionNodeMap;
  forceSurface?: 'desktop' | 'mobile';
}

const DefaultSheetArrangement: React.FC<DefaultSheetArrangementProps> = ({
  nodes,
  forceSurface,
}) => {
  const measuredNarrow = useMediaQuery('(max-width:768px)');
  const narrow = forceSurface ? forceSurface === 'mobile' : measuredNarrow;

  const render = (kinds: SheetSectionKind[]) =>
    kinds.map((kind) => {
      const node = nodes[kind];
      if (!node?.available) return null;
      return (
        <SheetSectionFrame
          key={kind}
          node={node}
          withCard={!node.selfContained}
        />
      );
    });

  return (
    <>
      {render(HEADER)}
      <Stack direction={narrow ? 'column' : 'row'} spacing={narrow ? 0 : 2}>
        <Box sx={{ width: narrow ? '100%' : '60%', minWidth: 0 }}>
          {render(MAIN)}
        </Box>
        <Box sx={{ width: narrow ? '100%' : '40%', minWidth: 0 }}>
          {render(ASIDE)}
        </Box>
      </Stack>
      {render(FOOTER)}
    </>
  );
};

export default DefaultSheetArrangement;
