/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import diceSound from '@/assets/sounds/dice-rolling.mp3';
import {
  selectCharacter,
  selectPreviewResistances,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import styled from '@emotion/styled';
import { Button, Paper, Stack } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import {
  Character,
  FixedModifier,
  SerializedSheetSkill,
  SkillName,
  Translator,
} from 't20-sheet-builder';

export interface ResistedSkill {
  name: SkillName;
  skill: SerializedSheetSkill;
}

const Transition = React.forwardRef(
  (
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>
  ) => <Slide direction='up' ref={ref} {...props} />
);

const SheetPreviewResistances: React.FC<{
  open: boolean;
  onClose: () => void;
  resistance: ResistedSkill;
}> = ({ open, onClose, resistance }) => {
  const { enqueueSnackbar } = useSnackbar();
  const params = useParams<{ id: string }>();
  const characterPreview = useSelector(selectCharacter(params.id));
  const resistances = useSelector(selectPreviewResistances(params.id));
  const skillName = Translator.getSkillTranslation(resistance.name);
  const character = Character.makeFromSerialized(characterPreview);
  const onClickSkill = (bonus: number) => {
    const roll = character.getSkills()[resistance.name].roll();
    roll.modifiers.fixed.add(new FixedModifier('default', bonus));
    const audio = new Audio(diceSound);
    audio.play();
    enqueueSnackbar(`${skillName}`, {
      variant: 'diceRoll',
      persist: true,
      roll,
    });

    onClose();
  };

  const ResistanceOption = styled(Paper)`
    padding: 10px;
    cursor: pointer;
  `;

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby='alert-dialog-slide-description'
    >
      <DialogTitle>Rolagem de {skillName}</DialogTitle>
      <DialogContent>
        Você possui diferentes tipos de resistência. Escolha entre um deles:
        <Stack spacing={2} direction='row' flexWrap='wrap' useFlexGap mt={2}>
          <ResistanceOption
            onClick={() => onClickSkill(resistance.skill.total)}
          >
            Normal ({resistance.skill.total})
          </ResistanceOption>
          {Object.values(resistances.resistances).map((avResistance) => (
            <ResistanceOption
              onClick={() =>
                onClickSkill(
                  resistance.skill.total + avResistance.fixedModifiers.total
                )
              }
            >
              Contra{' '}
              {Translator.getResistanceTranslation(avResistance.resisted)} (
              {resistance.skill.total + avResistance.fixedModifiers.total})
            </ResistanceOption>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SheetPreviewResistances;
