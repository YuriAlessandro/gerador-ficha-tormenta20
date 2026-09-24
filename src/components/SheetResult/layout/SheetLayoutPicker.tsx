/**
 * A entrada discreta da feature: um botão junto dos outros controles da ficha,
 * que abre a escolha entre os três modelos.
 *
 * Não existe área dedicada na home — a decisão de produto foi que layout se
 * descobre usando a ficha, não navegando até uma vitrine.
 *
 * O comportamento segue o contrato de dois eixos do projeto:
 * - flag desligada → o botão não existe, e ninguém fica sabendo que há algo
 *   desligado;
 * - flag ligada sem apoio → botão com cadeado que explica a feature e leva a
 *   /apoiar, com a ficha continuando no arranjo padrão.
 *
 * Abaixo dos três modelos fica a biblioteca do usuário (seus layouts, galeria
 * e importar por código). Ela vive no submódulo premium e entra por caminho;
 * no build sem o submódulo o stub devolve nada e sobram só os modelos.
 */
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import LockIcon from '@mui/icons-material/Lock';

import SheetLayoutEditorDialog from '../../../premium/components/SheetLayoutEditor/SheetLayoutEditorDialog';
import SheetLayoutLibraryPanel from '../../../premium/components/SheetLayoutLibrary/SheetLayoutLibraryPanel';
import CharacterSheet from '../../../interfaces/CharacterSheet';
import { SheetLayout } from '../../../interfaces/SheetLayout';
import {
  DEFAULT_SHEET_LAYOUT,
  SHEET_LAYOUT_PRESETS,
} from '../../../interfaces/sheetLayoutPresets';
import { useSheetLayoutAccess } from './sheetLayoutAccess';

/** Como cada modelo se explica para quem nunca viu. */
const PRESET_BLURBS: Record<string, string> = {
  'preset:tabs':
    'O arranjo clássico: informações no topo e o resto distribuído em abas.',
  'preset:single':
    'Tudo numa página só, em rolagem contínua. Bom para quem prefere ler a ficha inteira de uma vez.',
  'preset:actionMenu':
    'Um menu de telas, como um app de celular. Cada seção abre em tela cheia.',
};

export interface SheetLayoutPickerProps {
  currentLayoutId: string;
  /** O layout em uso, ponto de partida do editor. */
  currentLayout: SheetLayout;
  /** A ficha que o editor usa no preview. */
  sheet: CharacterSheet;
  /**
   * Grava o layout na ficha. `layoutId` é o modelo da biblioteca de onde ele
   * veio; `null` para modelos embarcados e layouts de terceiros.
   */
  onSelect: (layout: SheetLayout, layoutId: string | null) => void;
}

const SheetLayoutPicker: React.FC<SheetLayoutPickerProps> = ({
  currentLayoutId,
  currentLayout,
  sheet,
  onSelect,
}) => {
  const { isEnabled, hasAccess, needsSupport } = useSheetLayoutAccess();
  const [open, setOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  if (!isEnabled) return null;

  const handlePick = (layout: SheetLayout, layoutId: string | null = null) => {
    onSelect(layout, layoutId);
    setOpen(false);
  };

  return (
    <>
      <Tooltip
        title={
          needsSupport ? 'Layout da ficha (apoiadores)' : 'Layout da ficha'
        }
      >
        <IconButton size='small' onClick={() => setOpen(true)}>
          {needsSupport ? (
            <LockIcon fontSize='small' />
          ) : (
            <DashboardCustomizeIcon fontSize='small' />
          )}
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Tfont' }}>Layout da ficha</DialogTitle>
        <DialogContent>
          {needsSupport ? (
            <Typography sx={{ mb: 1 }}>
              Escolher entre os modelos de ficha — e montar o seu — é um recurso
              para apoiadores. A sua ficha continua funcionando normalmente no
              arranjo padrão.
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {SHEET_LAYOUT_PRESETS.map((preset) => {
                const selected = preset.id === currentLayoutId;
                return (
                  <Card
                    key={preset.id}
                    variant={selected ? 'elevation' : 'outlined'}
                    sx={{
                      borderColor: selected ? 'primary.main' : undefined,
                      borderWidth: selected ? 2 : 1,
                      borderStyle: 'solid',
                    }}
                  >
                    <CardActionArea
                      onClick={() => handlePick(preset)}
                      sx={{ p: 2 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography sx={{ fontWeight: 600 }}>
                          {preset.name}
                        </Typography>
                        {selected && (
                          <Typography
                            variant='caption'
                            sx={{ color: 'primary.main', fontWeight: 700 }}
                          >
                            EM USO
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant='body2'
                        sx={{ color: 'text.secondary', mt: 0.5 }}
                      >
                        {PRESET_BLURBS[preset.id]}
                      </Typography>
                    </CardActionArea>
                  </Card>
                );
              })}

              <SheetLayoutLibraryPanel sheet={sheet} onApply={handlePick} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Fechar</Button>
          {needsSupport && (
            <Button href='/apoiar' variant='contained'>
              Conhecer o apoio
            </Button>
          )}
          {hasAccess && currentLayoutId !== DEFAULT_SHEET_LAYOUT.id && (
            <Button onClick={() => handlePick(DEFAULT_SHEET_LAYOUT)}>
              Voltar ao padrão
            </Button>
          )}
          {hasAccess && (
            <Button
              variant='contained'
              onClick={() => {
                setOpen(false);
                setEditorOpen(true);
              }}
            >
              Personalizar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/*
       * O editor vive no submódulo premium. No build sem ele o stub devolve um
       * componente nulo — e isso nunca aparece, porque lá as feature flags vêm
       * todas desligadas e este seletor inteiro já não é renderizado.
       */}
      {hasAccess && editorOpen && (
        <SheetLayoutEditorDialog
          open
          layout={currentLayout}
          sheet={sheet}
          onClose={() => setEditorOpen(false)}
          onSave={onSelect}
        />
      )}
    </>
  );
};

export default SheetLayoutPicker;
