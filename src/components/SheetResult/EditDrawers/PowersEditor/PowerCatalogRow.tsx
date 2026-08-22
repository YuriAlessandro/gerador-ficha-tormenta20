import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Box,
  ButtonBase,
  Checkbox,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { PowerAvailability } from '@/functions/powers/requirementEvaluation';
import { DETAIL_TIMEOUT } from '../../common/listStyles';
import PowerRequirements from './PowerRequirements';
import {
  CATALOG_NAME_SX,
  CATALOG_ROW_SX,
  DESCRIPTION_SX,
  EDITOR_CHIP_SX,
  HIGHLIGHT_SX,
  ROW_BUTTON_SX,
} from './powersEditorStyles';

export interface PowerCatalogRowProps {
  name: string;
  description: string;
  icon: SvgIconComponent;
  /** Token da paleta ou hex, vindo de `POWER_ORIGINS`. */
  color: string;
  availability: PowerAvailability;
  selected: boolean;
  /** Quantas vezes o poder está na ficha. Só aparece a partir de 2. */
  count: number;
  repeatable: boolean;
  /** Etiqueta curta à direita do nome (suplemento, origem exigida...). */
  badge?: string;
  /** Trecho buscado, para destacar dentro do nome. */
  highlight?: string;
  onToggle: () => void;
  onAddAnother?: () => void;
}

/** Quebra o nome no trecho buscado para destacá-lo sem perder o resto. */
function renderName(name: string, highlight?: string): React.ReactNode {
  if (!highlight) return name;

  const index = name.toLowerCase().indexOf(highlight.toLowerCase());
  if (index < 0) return name;

  return (
    <>
      {name.slice(0, index)}
      <Box component='mark' sx={HIGHLIGHT_SX}>
        {name.slice(index, index + highlight.length)}
      </Box>
      {name.slice(index + highlight.length)}
    </>
  );
}

/**
 * Uma linha do catálogo.
 *
 * Fechada, é neutra: ícone da categoria, nome e no máximo dois chips. A cor só
 * entra na guia esquerda quando o poder já está na ficha, e o cadeado marca o
 * que não cumpre pré-requisito — sem borda vermelha e sem esmaecer a linha
 * inteira, porque o poder **continua selecionável** de propósito: a regra do
 * app sempre permitiu pegar um poder fora dos requisitos, e o texto de ajuda
 * do editor promete isso.
 *
 * A descrição e os pré-requisitos só entram no DOM quando a linha é expandida.
 * Com 400-600 poderes no catálogo, montar tudo de uma vez era o que deixava o
 * editor antigo pesado.
 */
const PowerCatalogRow: React.FC<PowerCatalogRowProps> = ({
  name,
  description,
  icon: Icon,
  color,
  availability,
  selected,
  count,
  repeatable,
  badge,
  highlight,
  onToggle,
  onAddAnother,
}) => {
  const [expanded, setExpanded] = useState(false);
  const locked = !availability.available;

  return (
    <Box
      sx={{
        ...CATALOG_ROW_SX,
        borderLeftColor: selected ? color : 'transparent',
        bgcolor: selected ? 'action.selected' : 'transparent',
      }}
    >
      <Checkbox
        size='small'
        checked={selected}
        onChange={onToggle}
        sx={{ mt: 0.25, p: 0.5 }}
        slotProps={{ input: { 'aria-label': `Selecionar ${name}` } }}
      />

      {/*
        Coluna flex, e não um Box comum: o `ButtonBase` é `inline-flex` por
        padrão no MUI, e como elemento inline ele ganhava o strut da linha de
        texto do pai — sobrava faixa vazia embaixo de cada nome. Como item de
        um flex container ele é blockificado, estica na largura toda (levando a
        seta para a direita) e não arrasta espaço nenhum.
      */}
      <Box
        sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
      >
        <ButtonBase
          sx={ROW_BUTTON_SX}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          <Icon sx={{ color, fontSize: '1.25rem', flexShrink: 0 }} />

          <Typography
            component='span'
            sx={{
              ...CATALOG_NAME_SX,
              color: locked ? 'text.secondary' : 'primary.main',
            }}
          >
            {renderName(name, highlight)}
          </Typography>

          {count > 1 && (
            <Chip
              size='small'
              label={`×${count}`}
              color='primary'
              sx={EDITOR_CHIP_SX}
            />
          )}
          {repeatable && (
            <Chip size='small' label='Repetível' sx={EDITOR_CHIP_SX} />
          )}
          {badge && (
            <Chip
              size='small'
              variant='outlined'
              label={badge}
              sx={EDITOR_CHIP_SX}
            />
          )}
          {locked && (
            <Tooltip title='Não cumpre os pré-requisitos — você ainda pode escolher'>
              <LockOutlinedIcon
                sx={{ color: 'text.disabled', fontSize: '1rem', flexShrink: 0 }}
              />
            </Tooltip>
          )}

          <ExpandMoreIcon
            sx={{
              color: 'text.secondary',
              flexShrink: 0,
              ml: 'auto',
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)',
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
              },
            }}
          />
        </ButtonBase>

        <Collapse in={expanded} timeout={DETAIL_TIMEOUT} unmountOnExit>
          <Box sx={{ pb: 1.25, pr: 1 }}>
            <Typography sx={DESCRIPTION_SX}>{description}</Typography>
            <PowerRequirements availability={availability} />
          </Box>
        </Collapse>
      </Box>

      {repeatable && selected && onAddAnother && (
        <Tooltip title='Adicionar outra vez'>
          <IconButton
            size='small'
            onClick={onAddAnother}
            sx={{ mt: 0.25, flexShrink: 0 }}
            aria-label={`Adicionar outra instância de ${name}`}
          >
            <AddIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default PowerCatalogRow;
