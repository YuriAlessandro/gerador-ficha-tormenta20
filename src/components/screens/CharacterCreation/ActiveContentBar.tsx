import React from 'react';
import {
  Box,
  Chip,
  Typography,
  Button,
  Collapse,
  Divider,
} from '@mui/material';
import {
  AutoStories as AutoStoriesIcon,
  ExpandMore as ExpandMoreIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import {
  SupplementId,
  SUPPLEMENT_METADATA,
} from '../../../types/supplement.types';
import { HomebrewActivationPanel, useHomebrews } from '../../../premium';
import SupplementsIndicator from './SupplementsIndicator';

interface ActiveContentBarProps {
  /** Suplementos atualmente ativos (sempre inclui o CORE). */
  userSupplements: SupplementId[];
  /** Se o usuário está autenticado (controla a seção de homebrews). */
  isAuthenticated: boolean;
  /** Navega para a configuração de suplementos (ou login). */
  onConfigureSupplements: () => void;
}

const MAX_VISIBLE_CHIPS = 3;

/**
 * Superfície única e recolhível de "Conteúdo ativo" — reúne suplementos oficiais
 * e homebrews num só lugar (antes espalhados no topo do formulário e no rodapé
 * da página). Recolhida por padrão: uma linha-resumo; expandida revela os
 * controles de ativação.
 */
const ActiveContentBar: React.FC<ActiveContentBarProps> = ({
  userSupplements,
  isAuthenticated,
  onConfigureSupplements,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  // Seguro fora de autenticação: contexto devolve lista vazia.
  const { activated } = useHomebrews();
  const homebrewCount = isAuthenticated ? activated.length : 0;

  const supplementNames = userSupplements
    .map((id) => SUPPLEMENT_METADATA[id]?.name)
    .filter((name): name is string => Boolean(name));

  const visibleNames = supplementNames.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCount = supplementNames.length - visibleNames.length;

  return (
    <Box
      sx={{
        mb: 3,
        borderRadius: 1,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Collapsed summary: header row (label + toggle) then a chip row. */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <AutoStoriesIcon
            fontSize='small'
            sx={{ color: 'text.secondary', fontSize: '1.1rem', flexShrink: 0 }}
          />
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
              fontWeight: 'medium',
            }}
          >
            Conteúdo ativo
          </Typography>
          <Button
            size='small'
            variant='text'
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            }
            sx={{
              ml: 'auto',
              flexShrink: 0,
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            Gerenciar
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            mt: 1,
          }}
        >
          {visibleNames.map((name) => (
            <Chip
              key={name}
              label={name}
              size='small'
              color='primary'
              variant='outlined'
              sx={{ fontSize: '0.72rem' }}
            />
          ))}
          {hiddenCount > 0 && (
            <Chip
              label={`+${hiddenCount}`}
              size='small'
              variant='outlined'
              sx={{ fontSize: '0.72rem' }}
            />
          )}
          {homebrewCount > 0 && (
            <Chip
              icon={<BoltIcon sx={{ fontSize: '0.9rem' }} />}
              label={
                homebrewCount === 1
                  ? '1 homebrew'
                  : `${homebrewCount} homebrews`
              }
              size='small'
              color='warning'
              variant='outlined'
              sx={{ fontSize: '0.72rem' }}
            />
          )}
        </Box>
      </Box>
      {/* Expanded detail: supplements activation + homebrews */}
      <Collapse in={expanded} timeout='auto' unmountOnExit>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Divider sx={{ mb: 0.5 }} />
          <SupplementsIndicator
            userSupplements={userSupplements}
            isAuthenticated={isAuthenticated}
            onConfigureSupplements={onConfigureSupplements}
          />
          {isAuthenticated && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <HomebrewActivationPanel />
            </>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ActiveContentBar;
