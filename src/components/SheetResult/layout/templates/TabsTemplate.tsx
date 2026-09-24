/**
 * O modelo de abas — o arranjo que a ficha tinha antes de existir layout
 * configurável, agora expresso como dado.
 *
 * As regiões `surface` viram um único card com `TabContext`, inserido no fluxo
 * da coluna principal na posição da PRIMEIRA delas. O que estiver em regiões
 * `main` antes disso renderiza acima do card; o que estiver depois, abaixo. É
 * assim que o preset consegue pôr Proficiências e Tamanho/Deslocamento embaixo
 * das abas sem precisar de um papel de região só para isso.
 */
import React from 'react';
import { Box, Card, Stack, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import { ResolvedLayout } from '../../../../interfaces/SheetLayout';
import SheetIcon from '../../../icons/SheetIcon';
import RegionStack from '../RegionStack';
import { SheetSectionActions } from '../SheetSectionFrame';
import { collectRegionActions } from '../sheetSectionTypes';
import { SheetTemplateProps } from './templateTypes';
import { useSurfaceSelection } from './useSurfaceSelection';

const TabsTemplate: React.FC<SheetTemplateProps> = ({
  layout,
  nodes,
  sheetId,
}) => {
  const surfaces = layout.regions.filter((r) => r.role === 'surface');
  const { activeId, setActiveId } = useSurfaceSelection(
    sheetId,
    layout,
    surfaces
  );

  const firstSurfaceIdx = layout.regions.findIndex((r) => r.role === 'surface');
  const mainRegions = layout.regions.filter((r) => r.role === 'main');
  const asideRegions = layout.regions.filter((r) => r.role === 'aside');
  const footerRegions = layout.regions.filter((r) => r.role === 'footer');
  const headerRegions = layout.regions.filter((r) => r.role === 'header');

  const above = mainRegions.filter(
    (r) => layout.regions.indexOf(r) < firstSurfaceIdx || firstSurfaceIdx === -1
  );
  const below = mainRegions.filter(
    (r) => firstSurfaceIdx !== -1 && layout.regions.indexOf(r) > firstSurfaceIdx
  );

  const { titleColor } = layout.theme;
  const actions = collectRegionActions(
    surfaces.find((r) => r.id === activeId),
    nodes
  );

  const renderRegions = (regions: ResolvedLayout['regions']) =>
    regions.map((region) => (
      <RegionStack
        key={region.id}
        region={region}
        nodes={nodes}
        titleColor={titleColor}
      />
    ));

  const tabsCard = surfaces.length > 0 && (
    <Card sx={{ p: 3, mb: 4, position: 'relative', overflow: 'visible' }}>
      <SheetSectionActions actions={actions} />
      <TabContext value={activeId}>
        <TabList
          onChange={(_, value: string) => setActiveId(value)}
          variant='scrollable'
          scrollButtons='auto'
          allowScrollButtonsMobile
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {surfaces.map((region) => (
            <Tab
              key={region.id}
              label={region.label}
              value={region.id}
              icon={
                region.iconKey ? (
                  <SheetIcon iconKey={region.iconKey} fontSize='small' />
                ) : undefined
              }
              iconPosition='start'
              sx={{ minHeight: 48 }}
            />
          ))}
        </TabList>
        {surfaces.map((region) => (
          <TabPanel key={region.id} value={region.id} sx={{ p: 2 }}>
            {/* `withCards={false}`: as seções já estão dentro do card de abas. */}
            <RegionStack
              region={region}
              nodes={nodes}
              withCards={false}
              titleColor={titleColor}
            />
          </TabPanel>
        ))}
      </TabContext>
    </Card>
  );

  return (
    <>
      {renderRegions(headerRegions)}
      <Stack direction={layout.isNarrow ? 'column' : 'row'} spacing={2}>
        <Box
          sx={{
            width: layout.isNarrow ? '100%' : '60%',
            // Item de flex tem `min-width: auto`: sem isto a coluna se recusa a
            // encolher e a tabela de equipamentos estoura por cima da vizinha.
            minWidth: 0,
          }}
        >
          {renderRegions(above)}
          {tabsCard}
          {renderRegions(below)}
        </Box>
        {asideRegions.length > 0 && (
          <Box sx={{ width: layout.isNarrow ? '100%' : '40%', minWidth: 0 }}>
            {/* Cada SEÇÃO da lateral é um card próprio, como no corpo: levar
                Equipamentos para cá leva o card de Equipamentos, e não o
                conteúdo dele para dentro do card de Perícias. */}
            {renderRegions(asideRegions)}
          </Box>
        )}
      </Stack>
      {renderRegions(footerRegions)}
    </>
  );
};

export default TabsTemplate;
