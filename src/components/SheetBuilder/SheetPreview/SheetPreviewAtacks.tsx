import diceSound from '@/assets/sounds/dice-rolling.mp3';
import React from 'react';
import {
  selectCharacter,
  selectSheetAttacks,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Box } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import {
  Character,
  EquipmentName,
  PreviewContext,
  SerializedAttack,
  TranslatableName,
  Translator,
} from 't20-sheet-builder';
import BookTitle from '../common/BookTitle';

const SheetPreviewAtacks = () => {
  const attacksPreview = useSelector(selectSheetAttacks);
  const characterPreview = useSelector(selectCharacter);

  const { enqueueSnackbar } = useSnackbar();

  const getAttackDamage = (attack: SerializedAttack) =>
    `${attack.damage.diceQuantity}d${attack.damage.diceSides}`;

  const getAttackCritical = (attack: SerializedAttack) =>
    `${attack.critical.threat}/x${attack.critical.multiplier}`;

  const onRollAttack = (attackName: TranslatableName) => {
    const character = Character.makeFromSerialized(characterPreview);
    const context = new PreviewContext(character);
    const attacks = context.getAttacks();
    const attack = attacks.get(attackName as EquipmentName);

    if (!attack) return;

    const attackResult = context.roll(attack);
    const audio = new Audio(diceSound);
    audio.play();
    enqueueSnackbar(`${attackName}`, {
      variant: 'attackRoll',
      attackResult,
      attack,
    });
  };

  return (
    <Box>
      <BookTitle>Ataques</BookTitle>
      {!attacksPreview && <p>Nenhum ataque.</p>}
      {attacksPreview && (
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
              {attacksPreview.map(({ attack }) => {
                const translatedName = Translator.getTranslation(attack.name);
                return (
                  <TableRow
                    key={attack.name}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                    }}
                    onClick={() => onRollAttack(attack.name)}
                  >
                    <TableCell component='th' scope='row'>
                      {translatedName}
                    </TableCell>
                    <TableCell align='right'>
                      {getAttackDamage(attack)}
                    </TableCell>
                    <TableCell align='right'>
                      {getAttackCritical(attack)}
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
