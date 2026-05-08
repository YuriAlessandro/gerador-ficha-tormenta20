import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { CompanionSheet, CompanionTrick } from '@/interfaces/Companion';
import { Spell } from '@/interfaces/Spells';
import { getAvailableTricks } from '@/data/systems/tormenta20/herois-de-arton/companion';
import CompanionTrickSelectionStep from '@/components/LevelUpWizard/steps/CompanionTrickSelectionStep';

export interface EnsinarTruquePick {
  companionIndex: number;
  trick: CompanionTrick;
  spell?: Spell;
}

interface EnsinarTruqueDialogProps {
  open: boolean;
  companions: CompanionSheet[];
  trainerLevel: number;
  pendingCount: number;
  onComplete: (picks: EnsinarTruquePick[]) => void;
  onCancel: () => void;
}

const EnsinarTruqueDialog: React.FC<EnsinarTruqueDialogProps> = ({
  open,
  companions,
  trainerLevel,
  pendingCount,
  onComplete,
  onCancel,
}) => {
  const [picks, setPicks] = useState<EnsinarTruquePick[]>([]);
  const [companionIndex, setCompanionIndex] = useState<number>(0);
  const [trick, setTrick] = useState<CompanionTrick | undefined>(undefined);
  const [spell, setSpell] = useState<Spell | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setPicks([]);
      setCompanionIndex(0);
      setTrick(undefined);
      setSpell(undefined);
    }
  }, [open]);

  const currentStep = picks.length + 1;
  const activeCompanion =
    companions[companionIndex] || companions[0] || undefined;

  // Reflete os truques já alocados (em picks anteriores) no companheiro ativo
  // para impedir duplicatas dentro do mesmo fluxo de Dialog.
  const projectedCompanion = useMemo<CompanionSheet | undefined>(() => {
    if (!activeCompanion) return undefined;
    const accumulatedTricks = picks
      .filter((p) => p.companionIndex === companionIndex)
      .map((p) => p.trick);
    return {
      ...activeCompanion,
      tricks: [...activeCompanion.tricks, ...accumulatedTricks],
    };
  }, [activeCompanion, picks, companionIndex]);

  const isCurrentComplete = useMemo(() => {
    if (!trick || !projectedCompanion) return false;
    const def = getAvailableTricks(
      trainerLevel,
      projectedCompanion.companionType,
      projectedCompanion.size,
      projectedCompanion.tricks,
      projectedCompanion.naturalWeapons.length || 1,
      false
    ).find((t) => t.name === trick.name);
    if (!def?.hasSubChoice) return true;
    if (def.subChoiceType === 'attribute')
      return !!trick.choices?.primary && !!trick.choices?.secondary;
    if (def.subChoiceType === 'movement') return !!trick.choices?.type;
    if (def.subChoiceType === 'spell') return !!spell;
    return true;
  }, [trick, spell, projectedCompanion, trainerLevel]);

  const handleConfirmStep = () => {
    if (!trick) return;
    const nextPicks = [...picks, { companionIndex, trick, spell }];
    if (nextPicks.length >= pendingCount) {
      onComplete(nextPicks);
      return;
    }
    setPicks(nextPicks);
    setTrick(undefined);
    setSpell(undefined);
  };

  if (!projectedCompanion) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth='md'>
      <DialogTitle>
        Ensinar Truque ({currentStep} de {pendingCount})
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            O poder &quot;Ensinar Truque&quot; permite que um de seus melhores
            amigos aprenda um truque adicional. Escolha o companheiro alvo e o
            truque a aprender.
          </Typography>
        </Box>
        <CompanionTrickSelectionStep
          companion={projectedCompanion}
          trainerLevel={trainerLevel}
          companions={companions}
          selectedCompanionIndex={companionIndex}
          onSelectCompanion={(idx) => {
            setCompanionIndex(idx);
            setTrick(undefined);
            setSpell(undefined);
          }}
          selectedTrick={trick}
          onSelectTrick={(t) => {
            setTrick(t);
            if (!t) setSpell(undefined);
          }}
          selectedSpell={spell}
          onSelectSpell={(s) => setSpell(s)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          variant='contained'
          disabled={!isCurrentComplete}
          onClick={handleConfirmStep}
        >
          {currentStep >= pendingCount ? 'Concluir' : 'Próximo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnsinarTruqueDialog;
