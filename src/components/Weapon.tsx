import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Equipment from '../interfaces/Equipment';
import { rollD20, rollDamage, parseCritical } from '../functions/diceRoller';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';

interface WeaponProps {
  equipment: Equipment;
  rangeBonus: number;
  fightBonus: number;
  modDano: number;
  characterName?: string;
}

const Weapon: React.FC<WeaponProps> = (props) => {
  const { equipment, rangeBonus, fightBonus, modDano, characterName } = props;
  const { nome, dano, critico, alcance, atkBonus } = equipment;
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();

  const isRange = alcance && alcance !== '-';

  const modAtk = isRange ? rangeBonus : fightBonus;
  const atk = atkBonus ? atkBonus + modAtk : modAtk;

  const damageModifier = isRange ? 0 : modDano;
  const damageModStr =
    damageModifier >= 0 ? `+${damageModifier}` : `${damageModifier}`;
  const damage = isRange ? dano : `${dano}${damageModStr}`;

  const handleWeaponClick = () => {
    const attackRoll = rollD20();
    const attackTotal = Math.max(1, attackRoll + atk);

    // Parsear crítico da arma (campo critico pode ser "19/x3", "x2", "19", etc.)
    const { threshold, multiplier } = parseCritical(critico || '');
    const isCritical = attackRoll >= threshold;
    const isFumble = attackRoll === 1;

    // Parsear e rolar dano
    const damageRollString =
      damageModifier >= 0
        ? `${dano}+${damageModifier}`
        : `${dano}${damageModifier}`;
    const damageRollResult = rollDamage(damageRollString);

    if (!damageRollResult) {
      // Fallback se o parse falhar - não rola dano
      return;
    }

    // Calcular dano com fórmula correta de crítico
    // Fórmula: (dados × multiplicador) + bônus
    const diceTotal = damageRollResult.diceRolls.reduce((sum, r) => sum + r, 0);
    const normalDamage = Math.max(1, diceTotal + damageRollResult.modifier);
    const criticalDamage = Math.max(
      1,
      diceTotal * multiplier + damageRollResult.modifier
    );
    const finalDamage = isCritical ? criticalDamage : normalDamage;

    // Format attack dice notation
    const atkModifierStr = atk >= 0 ? `+${atk}` : `${atk}`;
    const attackDiceNotation = `1d20${atkModifierStr}`;

    // Label com dano normal entre parênteses se crítico (para criaturas imunes)
    const damageLabel = isCritical
      ? `Dano x${multiplier} (normal: ${normalDamage})`
      : 'Dano';

    showDiceResult(
      nome,
      [
        {
          label: 'Ataque',
          diceNotation: attackDiceNotation,
          rolls: [attackRoll],
          modifier: atk,
          total: attackTotal,
          isCritical,
          isFumble,
        },
        {
          label: damageLabel,
          diceNotation: damageRollResult.diceString,
          rolls: damageRollResult.diceRolls,
          modifier: damageRollResult.modifier,
          total: finalDamage,
        },
      ],
      characterName
    );
  };

  return (
    <Box
      sx={{
        borderBottom: '1px solid #ccc',
        padding: '4px 0',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          borderBottom: `1px solid ${theme.palette.primary.main}`,
        },
        '&:active': {
          transform: 'scale(0.99)',
        },
      }}
      onClick={handleWeaponClick}
      title={`Rolar ataque com ${nome}`}
    >
      <Typography fontSize={12}>
        {nome} {`${atk >= 0 ? '+' : ''}${atk}`} • {damage} • ({critico})
      </Typography>
    </Box>
  );
};

export default Weapon;
