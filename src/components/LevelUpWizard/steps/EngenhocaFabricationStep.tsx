import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { EngenhocaData, Spell } from '@/interfaces/Spells';
import SpellCardPicker from '@/components/SpellPicker/SpellCardPicker';
import {
  getEngenhocaFabricationCost,
  getEngenhocaFabricationDC,
} from '@/functions/spells/engenhoca';

export interface EngenhocaFabricationStepProps {
  /** Magias arcanas e divinas até o círculo que o inventor fabrica. */
  availableSpells: Spell[];
  /** Escolhidas neste nível, já com `engenhoca` preenchido. */
  selectedSpells: Spell[];
  /** Quantas engenhocas ainda cabem no limite (Int, +3 com Manutenção Eficiente). */
  slots: number;
  maxCircle: number;
  /** T$ que o personagem tem agora. */
  money: number;
  deductMoney: boolean;
  /** Bônus de Ofício (engenhoqueiro), só informativo. */
  oficioBonus: number;
  /** Teto de PM em aprimoramentos por ativação (Inteligência). */
  maxAprimoramentoPm: number;
  traditionNames?: { arcane: Set<string>; divine: Set<string> };
  onChange: (selectedSpells: Spell[], deductMoney: boolean) => void;
}

/** Custo total de fabricação das engenhocas escolhidas. */
export const getTotalFabricationCost = (spells: Spell[]): number =>
  spells.reduce((sum, spell) => sum + getEngenhocaFabricationCost(spell), 0);

/**
 * Fabricação de engenhocas ao subir de nível (JdA p. 70): escolhe magias,
 * batiza cada invenção e paga T$ 100 × PM. O teste de Ofício é só informado —
 * a fabricação acontece entre aventuras e é assumida como bem-sucedida.
 */
const EngenhocaFabricationStep: React.FC<EngenhocaFabricationStepProps> = ({
  availableSpells,
  selectedSpells,
  slots,
  maxCircle,
  money,
  deductMoney,
  oficioBonus,
  maxAprimoramentoPm,
  traditionNames,
  onChange,
}) => {
  const isMobile = window.innerWidth <= 768;
  // Cartões com a lista de aprimoramentos aberta (só consulta).
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpanded = (nome: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(nome)) next.delete(nome);
      else next.add(nome);
      return next;
    });
  const totalCost = getTotalFabricationCost(selectedSpells);
  const insufficient = deductMoney && totalCost > money;

  const handleToggle = (spell: Spell) => {
    const isSelected = selectedSpells.some((s) => s.nome === spell.nome);
    if (isSelected) {
      onChange(
        selectedSpells.filter((s) => s.nome !== spell.nome),
        deductMoney
      );
      return;
    }
    if (selectedSpells.length >= slots) return;
    onChange(
      [...selectedSpells, { ...spell, engenhoca: { forma: 'empunhada' } }],
      deductMoney
    );
  };

  const updateEngenhoca = (spell: Spell, patch: Partial<EngenhocaData>) => {
    onChange(
      selectedSpells.map((s) =>
        s.nome === spell.nome
          ? { ...s, engenhoca: { ...s.engenhoca, ...patch } }
          : s
      ),
      deductMoney
    );
  };

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Engenhocas
      </Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
        Fabrique até {slots} {slots === 1 ? 'engenhoca' : 'engenhocas'}{' '}
        simulando magias arcanas ou divinas de até o {maxCircle}º círculo. Cada
        uma custa T$ 100 por PM da magia e leva uma semana. Este passo é
        opcional.
      </Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        O teste de Ofício (engenhoqueiro) é considerado bem-sucedido — seu bônus
        é {oficioBonus >= 0 ? '+' : '−'}
        {Math.abs(oficioBonus)}. Aparatos são acoplados depois, na aba de Magias
        da ficha.
      </Typography>
      <Alert severity='info' sx={{ mt: 1 }}>
        <strong>Aprimoramentos não são escolhidos aqui.</strong> A engenhoca é
        fabricada com a magia básica, e a cada ativação você decide quais
        aprimoramentos usar, até {maxAprimoramentoPm} PM (sua Inteligência).
        Cada PM soma +1 na CD do teste de ativação, e você paga só esses PM.
      </Alert>

      {selectedSpells.length > 0 && (
        <Stack spacing={1} sx={{ my: 2 }}>
          {selectedSpells.map((spell) => (
            <Paper key={spell.nome} variant='outlined' sx={{ p: 1.5 }}>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={1.5}
                sx={{ alignItems: isMobile ? 'stretch' : 'center' }}
              >
                <TextField
                  size='small'
                  label={`Nome da engenhoca (${spell.nome})`}
                  placeholder={spell.nome}
                  value={spell.engenhoca?.nome ?? ''}
                  onChange={(e) =>
                    updateEngenhoca(spell, { nome: e.target.value })
                  }
                  sx={{ flex: 1 }}
                  slotProps={{ htmlInput: { maxLength: 60 } }}
                />
                <ToggleButtonGroup
                  exclusive
                  size='small'
                  value={spell.engenhoca?.forma ?? 'empunhada'}
                  onChange={(_, value) =>
                    value && updateEngenhoca(spell, { forma: value })
                  }
                >
                  <ToggleButton value='empunhada'>Empunhada</ToggleButton>
                  <ToggleButton value='vestida'>Vestida</ToggleButton>
                </ToggleButtonGroup>
                <Stack direction='row' sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    size='small'
                    color='primary'
                    variant='outlined'
                    label={`T$ ${getEngenhocaFabricationCost(spell)}`}
                  />
                  <Chip
                    size='small'
                    variant='outlined'
                    label={`CD ${getEngenhocaFabricationDC(spell)}`}
                  />
                </Stack>
              </Stack>
              {!!spell.aprimoramentos?.length && (
                <>
                  <Button
                    size='small'
                    onClick={() => toggleExpanded(spell.nome)}
                    sx={{ mt: 0.5 }}
                  >
                    {expanded.has(spell.nome) ? 'Ocultar' : 'Ver'}{' '}
                    aprimoramentos disponíveis na ativação (
                    {spell.aprimoramentos.length})
                  </Button>
                  <Collapse in={expanded.has(spell.nome)} unmountOnExit>
                    <Box sx={{ mt: 0.5 }}>
                      {spell.aprimoramentos.map((aprimoramento) => (
                        <Typography
                          key={`${
                            aprimoramento.addPm
                          }-${aprimoramento.text.substring(0, 20)}`}
                          variant='body2'
                          sx={{ mb: 0.5 }}
                        >
                          <Box
                            component='strong'
                            sx={{ color: 'primary.main', mr: 0.5 }}
                          >
                            {aprimoramento.trick
                              ? 'Truque:'
                              : `+${aprimoramento.addPm} PM:`}
                          </Box>
                          {aprimoramento.text}
                        </Typography>
                      ))}
                    </Box>
                  </Collapse>
                </>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      <Paper sx={{ p: 1.5, my: 2, bgcolor: 'background.default' }}>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={1}
          sx={{
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant='body2'>
            Custo total: <strong>T$ {totalCost}</strong> · Disponível:{' '}
            <strong>T$ {money}</strong>
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={deductMoney}
                onChange={(e) => onChange(selectedSpells, e.target.checked)}
              />
            }
            label='Descontar T$ do personagem'
          />
        </Stack>
        {insufficient && (
          <Alert severity='error' sx={{ mt: 1 }}>
            Dinheiro insuficiente: faltam T$ {totalCost - money}. Remova uma
            engenhoca ou desligue o desconto.
          </Alert>
        )}
      </Paper>

      <SpellCardPicker
        availableSpells={availableSpells}
        selectedSpells={selectedSpells}
        requiredCount={slots}
        onToggle={handleToggle}
        traditionNames={traditionNames}
        emptyMessage='Nenhuma magia disponível para fabricar: você já tem todas as magias deste círculo na ficha.'
      />
    </Box>
  );
};

export default EngenhocaFabricationStep;
