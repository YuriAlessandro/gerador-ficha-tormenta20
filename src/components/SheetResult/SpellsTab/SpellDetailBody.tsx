import React from 'react';
import CasinoIcon from '@mui/icons-material/Casino';
import { Box, Button, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { Spell } from '@/interfaces/Spells';
import { getSchoolLabel } from '@/components/SpellPicker/schoolLabels';
import { manaExpenseByCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import {
  DETAIL_LABEL_SX,
  DETAIL_SECTION_SX,
  MICRO_CHIP_SX,
  ROLL_CHIP_SX,
} from './spellsTabStyles';

export interface SpellDetailBodyProps {
  spell: Spell;
  onCast?: () => void;
}

/**
 * O corpo do detalhe da magia, renderizado DENTRO do accordion no desktop e
 * DENTRO do bottom sheet no mobile. É um componente só de propósito: os dois
 * caminhos não podem divergir.
 *
 * NÃO repete execução/alcance/alvo/duração/resistência. No layout antigo o
 * detalhe reimprimia em pares rótulo-valor exatamente os seis campos que já
 * estavam na linha fechada — puro ruído. Agora a meta-line fica sempre visível,
 * então o detalhe começa onde ela termina: custo, descrição e aprimoramentos.
 */
const SpellDetailBody: React.FC<SpellDetailBodyProps> = ({ spell, onCast }) => {
  // O `?? 0` no custo do círculo não é decorativo: magia de círculo fora do
  // enum (homebrew, personalizada) não tem entrada na tabela, e sem ele o custo
  // viraria NaN na tela.
  const circleCost = manaExpenseByCircle[spell.spellCircle] ?? 0;
  const baseCost = spell.manaExpense ?? circleCost;
  const reduction = spell.manaReduction ?? 0;
  const cost = Math.max(0, baseCost - reduction);

  return (
    <Box>
      <Stack
        direction='row'
        sx={{ alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}
      >
        <Chip
          label={`${cost} PM`}
          size='small'
          color='primary'
          variant='outlined'
        />
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {spell.spellCircle} · {getSchoolLabel(spell.school)}
        </Typography>
        {reduction > 0 && (
          <Tooltip title={`Custo base ${baseCost} PM`} arrow>
            <Chip
              label={`−${reduction} PM de redução`}
              size='small'
              color='success'
              variant='outlined'
              sx={MICRO_CHIP_SX}
            />
          </Tooltip>
        )}
        {spell.equipmentSource && (
          // O campo guarda o id do item, não o nome — mostrar o id cru não
          // ajudaria ninguém. O que importa é avisar que a magia veio do
          // equipamento e some se ele sair.
          <Tooltip
            title='Concedida por um equipamento. Sai da lista se o item for removido.'
            arrow
          >
            <Chip
              label='Via equipamento'
              size='small'
              color='info'
              variant='outlined'
              sx={MICRO_CHIP_SX}
            />
          </Tooltip>
        )}
      </Stack>

      <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
        {spell.description}
      </Typography>

      {spell.aprimoramentos && spell.aprimoramentos.length > 0 && (
        <Box sx={DETAIL_SECTION_SX}>
          <Typography variant='caption' sx={DETAIL_LABEL_SX}>
            Aprimoramentos
          </Typography>
          {spell.aprimoramentos.map((aprimoramento) => (
            <Typography
              key={`${aprimoramento.addPm}-${aprimoramento.text.substring(
                0,
                20
              )}`}
              variant='body2'
              sx={{ mb: 0.75 }}
            >
              <Box component='strong' sx={{ color: 'primary.main', mr: 0.5 }}>
                {aprimoramento.trick
                  ? 'Truque:'
                  : `+${aprimoramento.addPm} PM:`}
              </Box>
              {aprimoramento.text}
            </Typography>
          ))}
        </Box>
      )}

      {spell.rolls && spell.rolls.length > 0 && (
        <Box sx={DETAIL_SECTION_SX}>
          <Typography variant='caption' sx={DETAIL_LABEL_SX}>
            Rolagens
          </Typography>
          <Stack direction='row' sx={{ gap: 0.5, flexWrap: 'wrap' }}>
            {spell.rolls.map((roll) => (
              <Chip
                key={roll.id ?? `${roll.label}-${roll.dice}`}
                label={`${roll.label}: ${roll.dice}`}
                size='small'
                variant='outlined'
                sx={ROLL_CHIP_SX}
              />
            ))}
          </Stack>
        </Box>
      )}

      {onCast && (
        <Button
          variant='contained'
          startIcon={<CasinoIcon />}
          onClick={onCast}
          fullWidth
          sx={{ mt: 2 }}
        >
          Conjurar · {cost} PM
        </Button>
      )}
    </Box>
  );
};

export default React.memo(SpellDetailBody);
