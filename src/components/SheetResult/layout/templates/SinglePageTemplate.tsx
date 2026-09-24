/**
 * Página única — o arranjo anterior ao commit 5cb8bf9f, agora gerado.
 *
 * Regiões `surface` não somem neste modelo: viram cards sequenciais, usando o
 * `label` da região como título quando ela agrupa mais de uma seção. É o que
 * permite trocar de abas para scroll contínuo sem o usuário perder nada do que
 * organizou — a informação "estas seções andam juntas" continua expressa.
 */
import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';

import { ResolvedLayout } from '../../../../interfaces/SheetLayout';
import SheetIcon from '../../../icons/SheetIcon';
import RegionStack from '../RegionStack';
import { SheetSectionActions } from '../SheetSectionFrame';
import { collectRegionActions } from '../sheetSectionTypes';
import { SheetTemplateProps } from './templateTypes';

const SinglePageTemplate: React.FC<SheetTemplateProps> = ({
  layout,
  nodes,
}) => {
  const { titleColor } = layout.theme;

  const headerRegions = layout.regions.filter((r) => r.role === 'header');
  const mainRegions = layout.regions.filter(
    (r) => r.role === 'main' || r.role === 'surface'
  );
  const asideRegions = layout.regions.filter((r) => r.role === 'aside');
  const footerRegions = layout.regions.filter((r) => r.role === 'footer');

  const renderRegions = (regions: ResolvedLayout['regions']) =>
    regions.map((region) => {
      // Uma `surface` que agrupa várias seções ganha um rótulo próprio; com uma
      // seção só o título da própria seção já diz tudo, e repetir polui.
      const showGroupLabel =
        region.role === 'surface' &&
        !!region.label &&
        region.sections.length > 1;

      if (!showGroupLabel) {
        return (
          <RegionStack
            key={region.id}
            region={region}
            nodes={nodes}
            titleColor={titleColor}
          />
        );
      }

      return (
        <Card
          key={region.id}
          sx={{ p: 3, mb: 4, position: 'relative', overflow: 'visible' }}
        >
          {/* O card é da REGIÃO, então a barra também: as seções lá dentro
              renderizam sem card e não desenham a própria. */}
          <SheetSectionActions actions={collectRegionActions(region, nodes)} />
          <Typography
            variant='overline'
            sx={{
              color: 'text.secondary',
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {region.iconKey && (
              <SheetIcon iconKey={region.iconKey} fontSize='small' />
            )}
            {region.label}
          </Typography>
          <RegionStack
            region={region}
            nodes={nodes}
            withCards={false}
            titleColor={titleColor}
          />
        </Card>
      );
    });

  return (
    <>
      {renderRegions(headerRegions)}
      <Stack direction={layout.isNarrow ? 'column' : 'row'} spacing={2}>
        <Box
          sx={{
            width:
              layout.isNarrow || asideRegions.length === 0 ? '100%' : '60%',
            minWidth: 0,
          }}
        >
          {renderRegions(mainRegions)}
        </Box>
        {asideRegions.length > 0 && !layout.isNarrow && (
          <Box sx={{ width: '40%', minWidth: 0 }}>
            {/* Um card por seção, como no corpo (ver TabsTemplate). */}
            {renderRegions(asideRegions)}
          </Box>
        )}
      </Stack>
      {renderRegions(footerRegions)}
    </>
  );
};

export default SinglePageTemplate;
