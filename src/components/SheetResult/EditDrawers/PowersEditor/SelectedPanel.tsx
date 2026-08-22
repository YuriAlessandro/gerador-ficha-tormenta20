import React, { useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Box,
  ButtonBase,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { POWER_ORIGINS } from '@/functions/powers/powerOrigins';
import {
  EDITOR_CHIP_SX,
  EMPTY_SX,
  SELECTED_GROUP_SX,
} from './powersEditorStyles';

/** Uma linha do painel: um poder na ficha, com ou sem botão de remover. */
export interface SelectedItem {
  key: string;
  name: string;
  /** Instâncias do mesmo poder. Exibido como `×N` a partir de 2. */
  count: number;
  /** Pré-requisitos deixaram de ser atendidos depois de escolhido. */
  unmet?: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
}

export interface SelectedGroup {
  key: string;
  label: string;
  icon: SvgIconComponent;
  color: string;
  items: SelectedItem[];
}

interface SelectedPanelProps {
  groups: SelectedGroup[];
  /** Habilidades de classe e raça: automáticas, não removíveis. */
  automaticGroups: SelectedGroup[];
}

const GroupBlock: React.FC<{ group: SelectedGroup; removable: boolean }> = ({
  group,
  removable,
}) => {
  const Icon = group.icon;

  return (
    <Box>
      <Box sx={SELECTED_GROUP_SX}>
        <Icon sx={{ color: group.color, fontSize: '1rem' }} />
        <Typography
          variant='body2'
          sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}
        >
          {group.label}
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {group.items.length}
        </Typography>
      </Box>

      {group.items.map((item) => (
        <Box
          key={item.key}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            minHeight: 40,
            px: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: '0.95rem',
              overflowWrap: 'anywhere',
              color: removable ? 'text.primary' : 'text.secondary',
            }}
          >
            {item.name}
          </Typography>

          {item.count > 1 && (
            <Chip
              size='small'
              label={`×${item.count}`}
              color='primary'
              sx={EDITOR_CHIP_SX}
            />
          )}

          {item.unmet && (
            <Tooltip title='Não cumpre os pré-requisitos'>
              <LockOutlinedIcon
                sx={{ color: 'warning.main', fontSize: '0.95rem' }}
              />
            </Tooltip>
          )}

          {item.onEdit && (
            <Tooltip title='Editar'>
              <IconButton
                size='small'
                onClick={item.onEdit}
                aria-label={`Editar ${item.name}`}
              >
                <EditIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          )}

          {item.onRemove && (
            <Tooltip title='Remover'>
              <IconButton
                size='small'
                onClick={item.onRemove}
                aria-label={`Remover ${item.name}`}
              >
                <DeleteOutlineIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ))}
    </Box>
  );
};

/**
 * A coluna direita: o que já está na ficha.
 *
 * As habilidades automáticas de classe e raça vão para um bloco recolhido no
 * pé. No editor antigo elas ficavam no meio do resumo, com o mesmo peso visual
 * dos poderes escolhidos — e ainda apareciam como chips com aparência de
 * removível, sendo que não são.
 */
const SelectedPanel: React.FC<SelectedPanelProps> = ({
  groups,
  automaticGroups,
}) => {
  const [showAutomatic, setShowAutomatic] = useState(false);
  const automaticCount = automaticGroups.reduce(
    (total, group) => total + group.items.length,
    0
  );

  return (
    <Box sx={{ px: 1.5, pb: 2 }}>
      {groups.length === 0 && (
        <Typography sx={{ ...EMPTY_SX, textAlign: 'center' }}>
          Nenhum poder escolhido ainda. Use o catálogo ao lado.
        </Typography>
      )}

      {groups.map((group) => (
        <GroupBlock key={group.key} group={group} removable />
      ))}

      {automaticCount > 0 && (
        <Box sx={{ mt: 2 }}>
          <ButtonBase
            onClick={() => setShowAutomatic((prev) => !prev)}
            sx={{
              display: 'flex',
              boxSizing: 'border-box',
              width: '100%',
              justifyContent: 'flex-start',
              gap: 0.75,
              px: 1,
              py: 0.75,
              borderRadius: 1,
              color: 'text.secondary',
            }}
            aria-expanded={showAutomatic}
          >
            <ExpandMoreIcon
              sx={{
                fontSize: '1.1rem',
                transform: showAutomatic ? 'rotate(180deg)' : 'none',
                transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)',
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
              }}
            />
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
              Automáticos ({automaticCount})
            </Typography>
          </ButtonBase>

          <Collapse in={showAutomatic} timeout={220} unmountOnExit>
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', px: 1, display: 'block', mb: 0.5 }}
            >
              Concedidos pela classe e pela raça — não podem ser removidos.
            </Typography>
            {automaticGroups.map((group) => (
              <GroupBlock key={group.key} group={group} removable={false} />
            ))}
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

export { POWER_ORIGINS };
export default SelectedPanel;
