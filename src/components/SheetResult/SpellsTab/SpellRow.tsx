import React from 'react';
import CasinoIcon from '@mui/icons-material/Casino';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonBase,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Spell } from '@/interfaces/Spells';
import { manaExpenseByCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import {
  ACTION_RAIL_SX,
  CHEVRON_SX,
  DETAIL_TIMEOUT,
  ROW_SX,
} from '../common/listStyles';
import SpellDetailBody from './SpellDetailBody';
import SpellMetaLine from './SpellMetaLine';
import SpellSchoolGlyph from './SpellSchoolGlyph';
import {
  MAGO_RAIL_SX,
  MICRO_CHIP_SX,
  NAME_LINE_SX,
  SCHOOL_GLYPH_WRAP_SX,
  SPELL_CONTENT_SX,
  SPELL_NAME_SX,
} from './spellsTabStyles';

export interface SpellRowProps {
  spell: Spell;
  /** Compacto: abre em bottom sheet em vez de expandir no lugar. */
  compact: boolean;
  onOpenDetail: () => void;
  onOpenCast: () => void;
  isMago?: boolean;
  onToggleMemorized?: (spell: Spell) => void;
  onToggleAlwaysPrepared?: (spell: Spell) => void;
}

/**
 * Uma linha da lista de magias.
 *
 * O layout é uma coluna de duas linhas dentro de uma fileira:
 *
 *   [ mago ] [ escola ] [ nome + chips ] [ dados ] [ chevron ]
 *                      [ meta-line    ]
 *
 * O rail do Mago e o glifo de escola são irmãos do bloco de conteúdo e ficam
 * centralizados contra ele INTEIRO — nome mais meta-line —, não contra a linha
 * do nome. Ver `SCHOOL_GLYPH_WRAP_SX`.
 *
 * Só o bloco central é elástico; todo o resto tem `flexShrink: 0`. O custo em PM
 * NÃO aparece aqui — é derivado do círculo e vive no cabeçalho do grupo. Só volta
 * pra linha quando a magia foge da regra (`manaExpense` próprio ou redução).
 */
const SpellRow: React.FC<SpellRowProps> = ({
  spell,
  compact,
  onOpenDetail,
  onOpenCast,
  isMago,
  onToggleMemorized,
  onToggleAlwaysPrepared,
}) => {
  // O `?? 0` não é decorativo: magia de círculo fora do enum (homebrew,
  // personalizada) não tem entrada na tabela, e sem ele o custo viraria NaN.
  const circleCost = manaExpenseByCircle[spell.spellCircle] ?? 0;
  const baseCost = spell.manaExpense ?? circleCost;
  const reduction = spell.manaReduction ?? 0;
  const cost = Math.max(0, baseCost - reduction);
  /** O custo mora no cabeçalho do círculo; na linha só quando foge da regra. */
  const hasCustomCost = cost !== circleCost;

  const canEditMago = isMago && !!onToggleMemorized;

  const magoRail = isMago && (
    <Box sx={MAGO_RAIL_SX} onClick={(e) => e.stopPropagation()}>
      {spell.alwaysPrepared ? (
        <Tooltip
          title={canEditMago ? 'Remover sempre preparada' : 'Sempre preparada'}
          arrow
        >
          {canEditMago ? (
            <IconButton
              size='small'
              onClick={() => onToggleAlwaysPrepared?.(spell)}
              color='warning'
              sx={{ p: 0 }}
              aria-label='Remover sempre preparada'
            >
              <PushPinIcon fontSize='small' />
            </IconButton>
          ) : (
            <PushPinIcon fontSize='small' color='warning' />
          )}
        </Tooltip>
      ) : (
        <>
          <Tooltip
            title={
              canEditMago
                ? 'Memorizar magia'
                : (spell.memorized && 'Memorizada') || 'Não memorizada'
            }
            arrow
          >
            <span>
              <Checkbox
                size='small'
                checked={spell.memorized ?? false}
                disabled={!canEditMago}
                onChange={() => onToggleMemorized?.(spell)}
                sx={{ p: 0 }}
                slotProps={{
                  input: { 'aria-label': `Memorizar ${spell.nome}` },
                }}
              />
            </span>
          </Tooltip>
          {canEditMago && onToggleAlwaysPrepared && (
            <Tooltip title='Marcar como sempre preparada' arrow>
              <IconButton
                size='small'
                onClick={() => onToggleAlwaysPrepared(spell)}
                sx={{ p: 0 }}
                aria-label={`Marcar ${spell.nome} como sempre preparada`}
              >
                <PushPinOutlinedIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </Box>
  );

  const content = (
    <>
      {magoRail}
      <Box sx={SCHOOL_GLYPH_WRAP_SX}>
        <SpellSchoolGlyph school={spell.school} />
      </Box>
      <Box sx={SPELL_CONTENT_SX}>
        <Box sx={NAME_LINE_SX}>
          <Typography component='span' sx={SPELL_NAME_SX}>
            {spell.nome}
          </Typography>
          {spell.customKeyAttr && (
            <Tooltip title='Atributo-chave próprio desta magia' arrow>
              <Chip
                label={spell.customKeyAttr}
                size='small'
                variant='outlined'
                sx={MICRO_CHIP_SX}
              />
            </Tooltip>
          )}
          {hasCustomCost && (
            <Tooltip
              title={`Custo diferente do círculo (${circleCost} PM)`}
              arrow
            >
              <Chip
                label={`${cost} PM`}
                size='small'
                color='primary'
                variant='outlined'
                sx={MICRO_CHIP_SX}
              />
            </Tooltip>
          )}
          {spell.isCustom && (
            <Chip
              label='Personalizada'
              size='small'
              color='success'
              variant='outlined'
              sx={MICRO_CHIP_SX}
            />
          )}
        </Box>
        <SpellMetaLine spell={spell} />
      </Box>
    </>
  );

  // O rail inteiro engole o clique: sem isso, tocar no botão de dados também
  // abriria o detalhe da linha.
  const rail = (
    <Box sx={ACTION_RAIL_SX} onClick={(e) => e.stopPropagation()}>
      <Tooltip title='Usar magia' arrow>
        <IconButton
          size='small'
          onClick={onOpenCast}
          color={spell.rolls?.length ? 'primary' : 'default'}
          aria-label={`Usar ${spell.nome}`}
        >
          <CasinoIcon fontSize='small' />
        </IconButton>
      </Tooltip>
    </Box>
  );

  if (compact) {
    return (
      <ButtonBase sx={ROW_SX} onClick={onOpenDetail}>
        {content}
        {rail}
        <ChevronRightIcon fontSize='small' sx={CHEVRON_SX} />
      </ButtonBase>
    );
  }

  return (
    <Accordion
      disableGutters
      slotProps={{
        transition: { timeout: DETAIL_TIMEOUT, unmountOnExit: true },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id={spell.nome}
        sx={{
          ...ROW_SX,
          // Sem sobrescrever o `px` do ROW_SX: em Poderes o primeiro elemento
          // da linha é o nome, e 16px de recuo cabem num texto. Aqui o primeiro
          // é o glifo de escola, e 16px à esquerda dele contra 8px até o nome
          // desequilibravam a calha. Assim o desktop também bate com o compacto.

          // O Accordion já desenha o próprio divisor; manter o da linha
          // duplicaria a borda entre itens.
          borderBottom: 'none',
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            width: '100%',
            minWidth: 0,
            margin: 0,
          },
        }}
      >
        {content}
        {rail}
      </AccordionSummary>
      <AccordionDetails>
        <SpellDetailBody spell={spell} onCast={onOpenCast} />
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(SpellRow);
