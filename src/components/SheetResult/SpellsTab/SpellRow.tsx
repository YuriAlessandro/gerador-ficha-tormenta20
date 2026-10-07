import React from 'react';
import BuildIcon from '@mui/icons-material/Build';
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
import { getSpellDisplayName } from '@/functions/spells/spellDisplayName';
import { SpellTradition } from '@/functions/spells/spellTradition';
import { getEngenhocaAparatos } from '@/functions/spells/engenhoca';
import { manaExpenseByCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import CharacterSheet from '@/interfaces/CharacterSheet';
import type {
  ActiveEffectUsageOption,
  ActivePowerDefinition,
} from '@/premium/interfaces/ActiveEffect';
import PowerActiveEffectAction from '../PowerActiveEffectAction';
import {
  ACTION_RAIL_SX,
  CHEVRON_SX,
  DETAIL_TIMEOUT,
  ROW_SX,
} from '../common/listStyles';
import SpellDetailBody, { EngenhocaRowInfo } from './SpellDetailBody';
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
  /** Efeito ativo que esta magia aplica na ficha, quando tem um. */
  activeEffect?: ActivePowerDefinition | null;
  /** Com estes dois, a estrelinha aparece no rail. */
  sheet?: CharacterSheet;
  onActivateEffect?: (
    definition: ActivePowerDefinition,
    option: ActiveEffectUsageOption
  ) => void;
  /** CDs já calculadas pelo pai quando a magia é uma engenhoca. */
  engenhocaInfo?: EngenhocaRowInfo;
  /** Presente = a ficha fabrica engenhocas (botão de engrenagem no rail). */
  onOpenEngenhoca?: (spell: Spell) => void;
  /** Tira a marca de enguiçada. */
  onRepairEngenhoca?: (spell: Spell) => void;
  /** Arcana, divina ou universal — resolvido pelo pai contra o catálogo. */
  tradition?: SpellTradition;
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
  activeEffect,
  sheet,
  onActivateEffect,
  engenhocaInfo,
  onOpenEngenhoca,
  onRepairEngenhoca,
  tradition,
}) => {
  const { engenhoca } = spell;
  const displayName = getSpellDisplayName(spell);
  const enguicada = !!engenhoca?.enguicada;
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
            {displayName}
          </Typography>
          {engenhoca && (
            <Tooltip
              title={`Engenhoca${
                displayName !== spell.nome ? ` que simula ${spell.nome}` : ''
              }${
                engenhocaInfo
                  ? ` · CD de ativação ${engenhocaInfo.activationDC} (+ aprimoramentos) · CD para resistir ${engenhocaInfo.resistDC}`
                  : ''
              }${engenhoca.forma ? ` · ${engenhoca.forma}` : ''}`}
              arrow
            >
              <Chip
                icon={<BuildIcon />}
                label={
                  engenhocaInfo
                    ? `Engenhoca · CD ${engenhocaInfo.activationDC}`
                    : 'Engenhoca'
                }
                size='small'
                color='secondary'
                variant='outlined'
                sx={MICRO_CHIP_SX}
              />
            </Tooltip>
          )}
          {getEngenhocaAparatos(engenhoca).map((aparato) => (
            <Tooltip key={aparato.id} title={aparato.descricao} arrow>
              <Chip
                label={aparato.nome}
                size='small'
                variant='outlined'
                sx={MICRO_CHIP_SX}
              />
            </Tooltip>
          ))}
          {engenhocaInfo?.circleAboveLimit && (
            <Tooltip
              title='Seu nível de inventor ainda não permite fabricar engenhocas deste círculo'
              arrow
            >
              <Chip
                label='Círculo alto'
                size='small'
                color='warning'
                variant='outlined'
                sx={MICRO_CHIP_SX}
              />
            </Tooltip>
          )}
          {enguicada && (
            <Tooltip
              title={
                onRepairEngenhoca
                  ? 'Enguiçada: clique para marcar como consertada (1 hora de trabalho)'
                  : 'Enguiçada: precisa de 1 hora de conserto'
              }
              arrow
            >
              <Chip
                label='Enguiçada'
                size='small'
                color='error'
                sx={MICRO_CHIP_SX}
                onClick={
                  onRepairEngenhoca
                    ? (e) => {
                        e.stopPropagation();
                        onRepairEngenhoca(spell);
                      }
                    : undefined
                }
              />
            </Tooltip>
          )}
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
        <SpellMetaLine spell={spell} tradition={tradition} />
      </Box>
    </>
  );

  // O rail inteiro engole o clique: sem isso, tocar no botão de dados também
  // abriria o detalhe da linha.
  const rail = (
    <Box sx={ACTION_RAIL_SX} onClick={(e) => e.stopPropagation()}>
      {/* Mesma estrelinha da aba de Poderes: abre o diálogo de tipos de uso.
          Não cobra PM — o custo da magia é pago no lançamento. */}
      {activeEffect && sheet && onActivateEffect && (
        <PowerActiveEffectAction
          definition={activeEffect}
          sheet={sheet}
          onActivate={onActivateEffect}
        />
      )}
      {onOpenEngenhoca && (
        <Tooltip
          title={
            engenhoca ? 'Configurar engenhoca' : 'Transformar em engenhoca'
          }
          arrow
        >
          <IconButton
            size='small'
            onClick={() => onOpenEngenhoca(spell)}
            color={engenhoca ? 'secondary' : 'default'}
            aria-label={`Engenhoca de ${spell.nome}`}
          >
            <BuildIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip
        title={(() => {
          if (!engenhoca) return 'Usar magia';
          return enguicada
            ? 'Engenhoca enguiçada — conserte antes de ativar'
            : 'Ativar engenhoca';
        })()}
        arrow
      >
        <span>
          <IconButton
            size='small'
            onClick={onOpenCast}
            disabled={enguicada}
            color={spell.rolls?.length ? 'primary' : 'default'}
            aria-label={`Usar ${displayName}`}
          >
            <CasinoIcon fontSize='small' />
          </IconButton>
        </span>
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
        <SpellDetailBody
          spell={spell}
          onCast={enguicada ? undefined : onOpenCast}
          engenhocaInfo={engenhocaInfo}
          tradition={tradition}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(SpellRow);
