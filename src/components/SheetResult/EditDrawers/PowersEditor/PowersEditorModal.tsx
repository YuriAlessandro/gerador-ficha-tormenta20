import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Slide,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import CharacterSheet from '@/interfaces/CharacterSheet';
import PowersEditorContent from './PowersEditorContent';

const MOBILE_MEDIA_QUERY = '(max-width:768px)';

const SlideUpTransition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>((props, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Slide direction='up' ref={ref} {...props} />
));
SlideUpTransition.displayName = 'SlideUpTransition';

export interface PowersEditorModalProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet>) => void;
}

/**
 * Editor de poderes e habilidades.
 *
 * Modal, e não drawer como os outros editores da ficha, porque o conteúdo é de
 * outra ordem de grandeza: são centenas de poderes para navegar, e a coluna de
 * 700px do drawer não comportava catálogo e ficha lado a lado. É o mesmo
 * caminho que a Mochila já tinha tomado.
 *
 * O shell é de propósito quase vazio — todo o peso está em
 * `PowersEditorContent`, que o `Dialog` só monta quando `open` é verdadeiro.
 */
const PowersEditorModal: React.FC<PowersEditorModalProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY, { noSsr: true });

  const powerCount =
    (sheet.generalPowers?.length ?? 0) +
    (sheet.classPowers?.length ?? 0) +
    (sheet.origin?.powers?.length ?? 0) +
    (sheet.devoto?.poderes?.length ?? 0) +
    (sheet.customPowers?.length ?? 0);

  const abilityCount =
    (sheet.classe.abilities?.filter((a) => a.nivel <= sheet.nivel).length ??
      0) + (sheet.raca.abilities?.length ?? 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth='lg'
      fullWidth
      slots={{ transition: SlideUpTransition }}
      slotProps={{
        paper: {
          sx: {
            height: isMobile ? '100%' : '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <AppBar position='sticky' color='default' elevation={0}>
        <Toolbar
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 1.5 },
            alignItems: 'center',
            minHeight: { xs: 52, sm: 64 },
            px: { xs: 1.5, sm: 2 },
          }}
        >
          <MilitaryTechIcon
            color='primary'
            fontSize={isMobile ? 'small' : 'medium'}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* `variant='h6'` já traz a fonte Tfont pelo tema. */}
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              component='div'
              sx={{ lineHeight: 1.2 }}
              noWrap
            >
              Poderes e Habilidades
            </Typography>
            <Typography
              variant='body2'
              noWrap
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              {powerCount} poder(es) · {abilityCount} habilidade(s)
            </Typography>
          </Box>
          <Tooltip title='Fechar'>
            <IconButton onClick={onClose} aria-label='Fechar editor de poderes'>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <PowersEditorContent
        open={open}
        sheet={sheet}
        onSave={onSave}
        onClose={onClose}
        isMobile={isMobile}
      />
    </Dialog>
  );
};

export default PowersEditorModal;
