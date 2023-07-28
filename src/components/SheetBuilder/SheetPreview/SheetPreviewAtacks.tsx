import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectPreviewAttributes,
  selectPreviewSkills,
  selectSheetAttacks,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { SerializedAttack, Translator } from 't20-sheet-builder';
import { rollDice } from '@/functions/randomUtils';
import { useSnackbar } from 'notistack';
import diceSound from '@/assets/sounds/dice-rolling.mp3';
import BookTitle from '../common/BookTitle';

const SheetPreviewAtacks = () => {
  const attacks = useSelector(selectSheetAttacks);
  const skills = useSelector(selectPreviewSkills);
  const attributes = useSelector(selectPreviewAttributes);

  const { enqueueSnackbar } = useSnackbar();

  const getAttackDamage = (attack: SerializedAttack) =>
    `${attack.damage.diceQuantity}d${attack.damage.diceSides}`;

  const getAttackCritical = (attack: SerializedAttack) =>
    `${attack.critical.threat}/x${attack.critical.multiplier}`;

  const onRollAttack = (
    attack: string,
    diceQtd: number,
    dice: number,
    criticalThreat: number,
    criticalMultiplier: number
  ) => {
    // For now, lets use only fight. But in the future we need to indity if it is a ranged attack and use shoot instead
    const fightSkill = skills.fight;

    const forceAttribute = Object.entries(attributes).find(
      ([attribute, _]) => attribute === 'strength'
    );

    if (fightSkill && forceAttribute) {
      const bonus = fightSkill.total;
      // Damage bonus for melee attacks is the same as the force attribute
      const damageBonus = forceAttribute[1];
      const rollAttack = rollDice(1, 20);

      const actualQtd =
        rollAttack >= criticalThreat ? criticalMultiplier * diceQtd : 1;

      const rollDamage = rollDice(actualQtd, dice);

      const audio = new Audio(diceSound);
      audio.play();
      enqueueSnackbar(`${attack}`, {
        variant: 'attackRoll',
        damage: rollDamage,
        damageBonus,
        rollResult: rollAttack,
        bonus,
        diceQtd: actualQtd,
        dice,
        criticalThreat,
      });
    }
  };

  return (
    <Box>
      <BookTitle>Ataques</BookTitle>
      {!attacks && <p>Nenhum ataque.</p>}
      {attacks && (
        <TableContainer component={Paper}>
          <Table size='small'>
            <TableHead sx={{ fontWeight: 'bold' }}>
              <TableRow>
                <TableCell>
                  <strong>Ataque</strong>
                </TableCell>
                <TableCell align='right'>
                  <strong>Dano</strong>
                </TableCell>
                <TableCell align='right'>
                  <strong>Crítico</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attacks.map((attack) => {
                const atkName = Translator.getEquipmentTranslation(attack.name);
                return (
                  <TableRow
                    key={attack.name}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      onRollAttack(
                        atkName,
                        attack.details.attack.damage.diceQuantity,
                        attack.details.attack.damage.diceSides,
                        attack.details.attack.critical.threat,
                        attack.details.attack.critical.multiplier
                      )
                    }
                  >
                    <TableCell component='th' scope='row'>
                      {atkName}
                    </TableCell>
                    <TableCell align='right'>
                      {getAttackDamage(attack.details.attack)}
                    </TableCell>
                    <TableCell align='right'>
                      {getAttackCritical(attack.details.attack)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SheetPreviewAtacks;
