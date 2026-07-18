import React from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonBase,
  Chip,
  Typography,
} from '@mui/material';
import { DiceRoll } from '@/interfaces/DiceRoll';
import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import { PowerOriginKind, SheetPower } from '@/functions/powers/powerOrigins';
import type { CustomEffect } from '@/premium/interfaces/CustomEffect';
import PowerDetailBody from './PowerDetailBody';
import {
  ACTION_RAIL_SX,
  CHEVRON_SX,
  COUNT_CHIP_SX,
  DETAIL_TIMEOUT,
  NAME_SX,
  ROW_SX,
} from './powersTabStyles';

export interface PowerRowProps {
  power: SheetPower;
  originKind: PowerOriginKind;
  count: number;
  /** Mobile: abre em bottom sheet em vez de expandir no lugar. */
  compact: boolean;
  /** Dados, efeito ativo, seleção de arma, pet, paródia, chip "Indisponível". */
  actionSlot?: React.ReactNode;
  /** `false` em modo reordenar: a linha vira só alça de arraste. */
  interactive?: boolean;
  dragHandleSlot?: React.ReactNode;
  onOpenDetail?: () => void;
  sheetHistory: SheetActionHistoryEntry[];
  sheet?: CharacterSheet;
  className?: string;
  onUpdateRolls?: (power: SheetPower, newRolls: DiceRoll[]) => void;
  onUpdateCustomEffects?: (
    power: SheetPower,
    newEffects: CustomEffect[]
  ) => void;
  detailExtra?: React.ReactNode;
}

/**
 * Uma linha da lista de poderes.
 *
 * O layout é um flex de UMA fileira em que só o nome é elástico:
 *
 *   [ nome flex:1 minWidth:0 ] [ ×N ] [ rail de ações ] [ chevron ]
 *
 * O rótulo de origem NÃO aparece aqui — subiu para o cabeçalho do grupo. Era
 * ele que colidia com o nome no mobile, e ele se repetia em toda linha do mesmo
 * grupo sem acrescentar nada.
 */
const PowerRow: React.FC<PowerRowProps> = ({
  power,
  originKind,
  count,
  compact,
  actionSlot,
  interactive = true,
  dragHandleSlot,
  onOpenDetail,
  sheetHistory,
  sheet,
  className,
  onUpdateRolls,
  onUpdateCustomEffects,
  detailExtra,
}) => {
  const nameCell = (
    <>
      <Typography sx={NAME_SX}>{power.name}</Typography>
      {count > 1 && (
        <Chip label={`×${count}`} size='small' sx={COUNT_CHIP_SX} />
      )}
    </>
  );

  // Modo reordenar: sem chevron, sem ações, sem detalhe — só a alça.
  if (!interactive) {
    return (
      <Box sx={ROW_SX}>
        {dragHandleSlot}
        {nameCell}
      </Box>
    );
  }

  // O rail inteiro engole o clique: sem isso, tocar no botão de dados também
  // abriria o detalhe da linha.
  const rail = actionSlot ? (
    <Box sx={ACTION_RAIL_SX} onClick={(e) => e.stopPropagation()}>
      {actionSlot}
    </Box>
  ) : null;

  if (compact) {
    return (
      <ButtonBase sx={ROW_SX} onClick={onOpenDetail}>
        {nameCell}
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
        id={power.name}
        sx={{
          ...ROW_SX,
          px: 2,
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
        {nameCell}
        {rail}
      </AccordionSummary>
      <AccordionDetails>
        <PowerDetailBody
          power={power}
          originKind={originKind}
          sheetHistory={sheetHistory}
          sheet={sheet}
          className={className}
          onUpdateRolls={onUpdateRolls}
          onUpdateCustomEffects={onUpdateCustomEffects}
          extra={detailExtra}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(PowerRow);
