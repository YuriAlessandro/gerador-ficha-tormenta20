import React, { useState } from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { OriginPower } from '@/interfaces/Poderes';
import {
  ManualPowerSelections,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import { getPowerSelectionRequirements } from '@/functions/powers/manualPowerSelection';
import PowerSelectionDialog from '@/components/SheetResult/EditDrawers/PowerSelectionDialog';

interface OriginPowerSwapStepProps {
  sheet: CharacterSheet;
  powers: OriginPower[];
  selections: ManualPowerSelections;
  onChange: (selections: ManualPowerSelections) => void;
}

/**
 * Troca do poder escolhido por uma origem que permite re-escolher.
 *
 * Cosmopolita ("uma vez por aventura, após concluir um descanso, pode trocar
 * esse poder por outro") e Citadino Abastado ("até o fim da aventura, ou até
 * usar esta habilidade novamente") são os únicos poderes de origem cujo texto
 * prevê a troca — por isso o passo é gateado pelo marcador
 * `swappableAtLevelUp`, e não por "tem requisito de escolha": Futura Lenda e
 * Duplo Feérico são escolhas permanentes.
 *
 * O passo é OPCIONAL: quem não quiser trocar segue direto.
 */
const OriginPowerSwapStep: React.FC<OriginPowerSwapStepProps> = ({
  sheet,
  powers,
  selections,
  onChange,
}) => {
  const [editing, setEditing] = useState<OriginPower | null>(null);

  /** O que a escolha vigente concedeu, para mostrar no card. */
  const currentChoiceLabel = (power: OriginPower): string | null => {
    const pending = selections[power.name];
    if (pending?.powers && pending.powers.length > 0) {
      return pending.powers[0].name;
    }

    const granted: string[] = [];
    (sheet.sheetActionHistory ?? [])
      .filter((entry) => entry.powerName === power.name)
      .forEach((entry) =>
        entry.changes.forEach((change) => {
          if (change.type === 'PowerAdded' || change.type === 'ClassPowerAdded')
            granted.push(change.powerName);
        })
      );
    return granted.length > 0 ? granted[granted.length - 1] : null;
  };

  const requirementsFor = (power: OriginPower) =>
    getPowerSelectionRequirements(power);

  const handleConfirm = (picked: SelectionOptions) => {
    if (!editing) return;
    onChange({ ...selections, [editing.name]: picked });
    setEditing(null);
  };

  const editingRequirements = editing ? requirementsFor(editing) : null;

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Benefício da Origem
      </Typography>
      <Typography
        variant='body2'
        sx={{ color: 'text.secondary', mb: 2 }}
        gutterBottom
      >
        Sua origem permite trocar o poder escolhido entre aventuras. Se não
        quiser trocar nada, é só seguir para o próximo passo.
      </Typography>

      <Stack spacing={2}>
        {powers.map((power) => {
          const current = currentChoiceLabel(power);
          const swapped = !!selections[power.name];

          return (
            <Paper key={power.name} variant='outlined' sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant='subtitle1'>{power.name}</Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {current
                      ? `Poder atual: ${current}`
                      : 'Nenhum poder escolhido ainda.'}
                  </Typography>
                  {swapped && (
                    <Chip
                      size='small'
                      color='primary'
                      label='Escolha trocada neste nível'
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<AutorenewIcon />}
                  onClick={() => setEditing(power)}
                >
                  {swapped ? 'Trocar de novo' : 'Trocar poder'}
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {editing && editingRequirements && (
        <PowerSelectionDialog
          open
          onClose={() => setEditing(null)}
          onConfirm={handleConfirm}
          requirements={editingRequirements}
          ownerPower={editing}
          initialSelections={selections[editing.name]}
          sheet={sheet}
        />
      )}
    </Box>
  );
};

export default OriginPowerSwapStep;
