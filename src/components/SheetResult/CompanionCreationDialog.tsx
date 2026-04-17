import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  CompanionSheet,
  CompanionType,
  CompanionSize,
  CompanionTrick,
  NaturalWeaponDamageType,
  SpiritEnergyType,
} from '@/interfaces/Companion';
import Skill from '@/interfaces/Skills';
import {
  createCompanion,
  getAvailableTricks,
} from '@/data/systems/tormenta20/herois-de-arton/companion';
import CompanionCreationStep from '../CharacterCreationWizard/steps/CompanionCreationStep';

interface CompanionCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (companion: CompanionSheet) => void;
  trainerLevel: number;
  trainerCharisma: number;
}

const CompanionCreationDialog: React.FC<CompanionCreationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  trainerLevel,
  trainerCharisma,
}) => {
  const isMobile = useMemo(() => window.innerWidth < 720, []);

  const [companionName, setCompanionName] = useState<string | undefined>();
  const [companionType, setCompanionType] = useState<
    CompanionType | undefined
  >();
  const [companionSize, setCompanionSize] = useState<
    CompanionSize | undefined
  >();
  const [companionWeaponDamageType, setCompanionWeaponDamageType] = useState<
    NaturalWeaponDamageType | undefined
  >();
  const [companionSpiritEnergyType, setCompanionSpiritEnergyType] = useState<
    SpiritEnergyType | undefined
  >();
  const [companionSkills, setCompanionSkills] = useState<Skill[]>([]);
  const [companionTricks, setCompanionTricks] = useState<CompanionTrick[]>([]);

  const resetState = () => {
    setCompanionName(undefined);
    setCompanionType(undefined);
    setCompanionSize(undefined);
    setCompanionWeaponDamageType(undefined);
    setCompanionSpiritEnergyType(undefined);
    setCompanionSkills([]);
    setCompanionTricks([]);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const isValid = useMemo(() => {
    if (!companionType || !companionSize || !companionWeaponDamageType)
      return false;
    if (companionType === 'Espírito' && !companionSpiritEnergyType)
      return false;
    if (companionSkills.length !== 3) return false;
    if (companionTricks.length !== 2) return false;
    const availableTricks = getAvailableTricks(
      1,
      companionType,
      companionSize,
      companionTricks,
      companionType === 'Monstro' ? 2 : 1,
      true
    );
    return companionTricks.every((t) => {
      const def = availableTricks.find((d) => d.name === t.name);
      if (!def?.hasSubChoice) return true;
      if (def.subChoiceType === 'attribute')
        return !!t.choices?.primary && !!t.choices?.secondary;
      if (def.subChoiceType === 'movement') return !!t.choices?.type;
      return true;
    });
  }, [
    companionType,
    companionSize,
    companionWeaponDamageType,
    companionSpiritEnergyType,
    companionSkills,
    companionTricks,
  ]);

  const handleConfirm = () => {
    if (
      !isValid ||
      !companionType ||
      !companionSize ||
      !companionWeaponDamageType
    )
      return;
    const newCompanion = createCompanion({
      name: companionName,
      type: companionType,
      size: companionSize,
      weaponDamageType: companionWeaponDamageType,
      spiritEnergyType: companionSpiritEnergyType,
      skills: companionSkills,
      tricks: companionTricks,
      trainerLevel,
      trainerCharisma,
    });
    onConfirm(newCompanion);
    resetState();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='h6' fontWeight='bold'>
            Criar Melhor Amigo
          </Typography>
          <IconButton size='small' onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <CompanionCreationStep
          companionName={companionName}
          companionType={companionType}
          companionSize={companionSize}
          companionWeaponDamageType={companionWeaponDamageType}
          companionSpiritEnergyType={companionSpiritEnergyType}
          companionSkills={companionSkills}
          companionTricks={companionTricks}
          onNameChange={setCompanionName}
          onTypeChange={(type) => {
            setCompanionType(type);
            setCompanionTricks([]);
          }}
          onSizeChange={(size) => {
            setCompanionSize(size);
            setCompanionTricks([]);
          }}
          onWeaponDamageTypeChange={setCompanionWeaponDamageType}
          onSpiritEnergyTypeChange={setCompanionSpiritEnergyType}
          onSkillsChange={setCompanionSkills}
          onTricksChange={setCompanionTricks}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant='contained' disabled={!isValid}>
          Criar Parceiro
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanionCreationDialog;
