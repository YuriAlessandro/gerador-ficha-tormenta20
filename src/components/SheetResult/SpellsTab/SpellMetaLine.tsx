import React from 'react';
import AdjustIcon from '@mui/icons-material/Adjust';
import BoltIcon from '@mui/icons-material/Bolt';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';
import { Box, SvgIconProps, Tooltip } from '@mui/material';
import { Spell } from '@/interfaces/Spells';
import { META_ICON_SX, META_ITEM_SX, META_LINE_SX } from './spellsTabStyles';

interface MetaToken {
  key: string;
  label: string;
  value: string;
  Icon: React.ComponentType<SvgIconProps>;
}

/**
 * Os cinco campos que a tabela antiga espalhava em colunas.
 *
 * A ordem é a de uso na mesa: primeiro o que decide se dá pra lançar agora
 * (execução, alcance), depois o que descreve o efeito (alvo, duração) e por fim
 * a resistência. Campo vazio é OMITIDO — o layout antigo enchia a linha de "-".
 */
const getTokens = (spell: Spell): MetaToken[] => {
  const tokens: MetaToken[] = [];

  if (spell.execucao) {
    tokens.push({
      key: 'execucao',
      label: 'Execução',
      value: spell.execucao,
      Icon: BoltIcon,
    });
  }
  if (spell.alcance) {
    tokens.push({
      key: 'alcance',
      label: 'Alcance',
      value: spell.alcance,
      Icon: StraightenIcon,
    });
  }

  const target = spell.alvo || spell.area;
  if (target) {
    tokens.push({
      key: 'alvo',
      label: spell.alvo ? 'Alvo' : 'Área',
      value: target,
      Icon: AdjustIcon,
    });
  }

  if (spell.duracao) {
    tokens.push({
      key: 'duracao',
      label: 'Duração',
      value: spell.duracao,
      Icon: ScheduleIcon,
    });
  }
  if (spell.resistencia) {
    tokens.push({
      key: 'resistencia',
      label: 'Resistência',
      value: spell.resistencia,
      Icon: ShieldOutlinedIcon,
    });
  }

  return tokens;
};

interface SpellMetaLineProps {
  spell: Spell;
}

/**
 * A linha de metadados da magia.
 *
 * Sem rótulo escrito: o ícone identifica o campo e o tooltip confirma. Escrever
 * "Execução: Padrão · Alcance: Curto" dobraria o comprimento da linha e é
 * justamente o comprimento que era o problema.
 */
const SpellMetaLine: React.FC<SpellMetaLineProps> = ({ spell }) => {
  const tokens = getTokens(spell);
  if (tokens.length === 0) return null;

  return (
    <Box sx={META_LINE_SX}>
      {tokens.map(({ key, label, value, Icon }) => (
        <Tooltip
          key={key}
          title={label}
          arrow
          disableInteractive
          enterDelay={400}
        >
          <Box component='span' sx={META_ITEM_SX}>
            <Icon sx={META_ICON_SX} />
            {value}
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default React.memo(SpellMetaLine);
