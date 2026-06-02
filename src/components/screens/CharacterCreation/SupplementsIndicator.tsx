import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoStories as AutoStoriesIcon,
} from '@mui/icons-material';
import {
  SupplementId,
  SUPPLEMENT_METADATA,
  getSupplementsList,
} from '../../../types/supplement.types';

interface SupplementsIndicatorProps {
  /** Suplementos atualmente ativos para o usuário (sempre inclui o CORE). */
  userSupplements: SupplementId[];
  /** Se o usuário está autenticado (define o destino do botão de ação). */
  isAuthenticated: boolean;
  /** Dispara a navegação para a configuração (logado) ou login (deslogado). */
  onConfigureSupplements: () => void;
}

const SUPPLEMENTS_HINT_DISMISSED_KEY = 'supplementsHintDismissed';

const SupplementsIndicator: React.FC<SupplementsIndicatorProps> = ({
  userSupplements,
  isAuthenticated,
  onConfigureSupplements,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Suplementos disponíveis que ainda não estão ativos (CORE sempre está ativo,
  // então é naturalmente excluído por estar com enabled === true).
  const inactiveSupplements = getSupplementsList(userSupplements).filter(
    (supplement) => !supplement.enabled
  );

  // Assinatura dos inativos atuais: ao dispensar guardamos essa string, de modo
  // que o aviso reapareça automaticamente se um novo suplemento for lançado.
  const inactiveSignature = inactiveSupplements
    .map((supplement) => supplement.id)
    .sort()
    .join('|');

  const [dismissed, setDismissed] = React.useState(
    () =>
      inactiveSignature !== '' &&
      localStorage.getItem(SUPPLEMENTS_HINT_DISMISSED_KEY) === inactiveSignature
  );

  const handleDismiss = () => {
    localStorage.setItem(SUPPLEMENTS_HINT_DISMISSED_KEY, inactiveSignature);
    setDismissed(true);
  };

  const showHint = inactiveSupplements.length > 0 && !dismissed;

  return (
    <Box
      sx={{
        mt: 3,
        mb: 3,
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={1}>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ fontWeight: 'medium' }}
        >
          Sistema e Suplementos Ativos:
        </Typography>
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          {userSupplements.map((suppId) => {
            const supplement = SUPPLEMENT_METADATA[suppId];
            return supplement ? (
              <Chip
                key={suppId}
                label={supplement.name}
                size='small'
                color='primary'
                variant='outlined'
                sx={{ fontSize: '0.75rem' }}
              />
            ) : null;
          })}
        </Stack>

        {showHint && (
          <Box
            sx={{
              mt: 1,
              pt: 1.5,
              borderTop: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={1}
              alignItems={isMobile ? 'stretch' : 'center'}
              justifyContent='space-between'
            >
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack direction='row' spacing={0.5} alignItems='center'>
                  <AutoStoriesIcon
                    fontSize='small'
                    color='action'
                    sx={{ fontSize: '1rem' }}
                  />
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontWeight: 'medium' }}
                  >
                    {inactiveSupplements.length === 1
                      ? '+1 suplemento disponível com mais raças, classes e origens:'
                      : `+${inactiveSupplements.length} suplementos disponíveis com mais raças, classes e origens:`}
                  </Typography>
                </Stack>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                  {inactiveSupplements.map((supplement) => (
                    <Chip
                      key={supplement.id}
                      label={supplement.name}
                      size='small'
                      variant='outlined'
                      color='default'
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Stack>
              </Stack>

              <Stack
                direction='row'
                spacing={0.5}
                alignItems='center'
                justifyContent={isMobile ? 'space-between' : 'flex-end'}
              >
                <Button
                  size='small'
                  variant='contained'
                  onClick={onConfigureSupplements}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {isAuthenticated
                    ? 'Ativar suplementos →'
                    : 'Entrar para ativar →'}
                </Button>
                <Tooltip title='Dispensar aviso'>
                  <IconButton
                    size='small'
                    onClick={handleDismiss}
                    aria-label='Dispensar aviso de suplementos'
                  >
                    <CloseIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default SupplementsIndicator;
