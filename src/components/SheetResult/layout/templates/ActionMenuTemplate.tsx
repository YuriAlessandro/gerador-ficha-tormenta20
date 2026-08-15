/**
 * Menu de ação — o modelo do app do D&D Beyond.
 *
 * Cabeçalho fixo com os vitais, e o resto atrás de uma lista-mestra de telas.
 * Tocar numa tela abre ela inteira, com "‹ Voltar"; o botão de menu reabre o
 * overlay para pular direto entre telas sem voltar antes.
 *
 * O OVERLAY NÃO É UM `Dialog`, e isso é a decisão mais importante do arquivo.
 * `Dialog` renderiza em portal para o `document.body`, o que cobriria a tela
 * INTEIRA — e o `Result` roda dentro do widget de ficha do Escudo do Mestre e
 * do `PlayerSheetViewDialog`. Um jogador abrindo o menu da própria ficha
 * apagaria a tela do mestre. Ancorado em absoluto no root da ficha, o overlay
 * cobre exatamente a área da ficha em qualquer container.
 */
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

import RegionStack from '../RegionStack';
import SheetIcon from '../../../icons/SheetIcon';
import { SheetSectionActions } from '../SheetSectionFrame';
import { collectRegionActions } from '../sheetSectionTypes';
import { SheetTemplateProps } from './templateTypes';
import { useSurfaceSelection } from './useSurfaceSelection';

const ActionMenuTemplate: React.FC<SheetTemplateProps> = ({
  layout,
  nodes,
  sheetId,
}) => {
  const surfaces = layout.regions.filter((r) => r.role === 'surface');
  const { setActiveId, restoredId } = useSurfaceSelection(
    sheetId,
    layout,
    surfaces
  );
  const [menuOpen, setMenuOpen] = useState(false);
  /**
   * `null` = mostrando a lista-mestra; id = dentro de uma tela.
   *
   * Começa na tela restaurada quando havia uma: o caso real é o jogador
   * lendo os próprios ataques na mesa e girando o tablet, o que remonta a
   * árvore inteira. Sem isso ele cairia de volta na lista a cada rotação.
   */
  const [openScreenId, setOpenScreenId] = useState<string | null>(
    restoredId ?? null
  );

  const { titleColor } = layout.theme;
  const headerRegions = layout.regions.filter((r) => r.role === 'header');
  const footerRegions = layout.regions.filter((r) => r.role === 'footer');

  const openScreen = (regionId: string) => {
    setActiveId(regionId);
    setOpenScreenId(regionId);
    setMenuOpen(false);
  };

  const current = surfaces.find((r) => r.id === openScreenId);
  const actions = collectRegionActions(current, nodes);

  const screenList = (onPick: (id: string) => void) => (
    <List sx={{ width: '100%' }}>
      {surfaces.map((region) => (
        <ListItemButton
          key={region.id}
          onClick={() => onPick(region.id)}
          sx={{ borderRadius: 1, mb: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SheetIcon iconKey={region.iconKey} />
          </ListItemIcon>
          <ListItemText
            primary={region.label}
            secondary={
              region.sections.length > 1
                ? `${region.sections.length} seções`
                : undefined
            }
          />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ position: 'relative', minHeight: '100%' }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backgroundColor: 'background.paper',
        }}
      >
        {headerRegions.map((region) => (
          <RegionStack
            key={region.id}
            region={region}
            nodes={nodes}
            titleColor={titleColor}
          />
        ))}
      </Box>

      {current ? (
        <Card sx={{ p: 3, mb: 4, position: 'relative', overflow: 'visible' }}>
          <SheetSectionActions actions={actions} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Button
              size='small'
              startIcon={<ArrowBackIosNewIcon fontSize='small' />}
              onClick={() => setOpenScreenId(null)}
            >
              Voltar
            </Button>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              {current.label}
            </Typography>
            <IconButton size='small' onClick={() => setMenuOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
          <RegionStack
            region={current}
            nodes={nodes}
            withCards={false}
            titleColor={titleColor}
          />
        </Card>
      ) : (
        <Card sx={{ p: 2, mb: 4 }}>{screenList(openScreen)}</Card>
      )}

      {footerRegions.map((region) => (
        <RegionStack
          key={region.id}
          region={region}
          nodes={nodes}
          titleColor={titleColor}
        />
      ))}

      {menuOpen && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            backgroundColor: 'background.paper',
            overflowY: 'auto',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton
              onClick={() => setMenuOpen(false)}
              aria-label='Fechar menu'
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {screenList(openScreen)}
        </Box>
      )}
    </Box>
  );
};

export default ActionMenuTemplate;
