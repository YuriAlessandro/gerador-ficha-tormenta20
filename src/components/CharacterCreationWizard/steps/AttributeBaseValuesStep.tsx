import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CasinoIcon from '@mui/icons-material/Casino';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import Race, { RaceAttributeAbility } from '@/interfaces/Race';
import {
  getPointBuyCost,
  getRemainingPoints,
  POINT_BUY_BUDGET,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
} from '@/functions/attributeMethods';
import { getEffectiveRaceAttrs } from '@/functions/general';
import type { VariedAttributeMethod } from '@/premium/data/attributeMethods';
import {
  RawAttributeCell,
  RawAttributeDicePool,
} from '@/premium/components/OptionalRules';

export type AttributeMethod = 'free' | 'dice' | 'points';

interface AttributeBaseValuesStepProps {
  race: Race;
  sexForAttributes?: 'Masculino' | 'Feminino'; // Dimorfismo sexual (ex: Nagah)
  baseAttributes: Record<Atributo, number>;
  raceAttributeChoices?: Atributo[]; // For races with 'any' attributes
  method: AttributeMethod;
  dicePool?: number[];
  diceAssignment?: (number | null)[];
  onChange: (attributes: Record<Atributo, number>) => void;
  onMethodChange: (method: AttributeMethod) => void;
  onRoll: () => void;
  onDiceAssignmentChange: (assignment: (number | null)[]) => void;
  /**
   * Atributos Variados (Heróis de Arton). Vazio quando a regra não está
   * disponível — nesse caso o seletor de variante nem aparece e o passo se
   * comporta exatamente como antes.
   */
  variedMethods?: VariedAttributeMethod[];
  /** Variante ativa do botão base atual (heroica, nimb, p15, khalmyr…). */
  variedMethod?: VariedAttributeMethod;
  onVariedMethodChange?: (methodId: string) => void;
  /** Rótulos do pool quando o valor bruto importa (Nimb: "20 → +5"). */
  dicePoolLabels?: string[];
  /** Estado dos métodos em valor bruto (Valkaria). */
  rawDice?: number[];
  rawAssignment?: (number | null)[];
  onRawAssignmentChange?: (assignment: (number | null)[]) => void;
}

// Helper to format modifier with sign
const formatMod = (mod: number): string => {
  if (mod > 0) return `+${mod}`;
  return mod.toString();
};

const AttributeBaseValuesStep: React.FC<AttributeBaseValuesStepProps> = ({
  race,
  sexForAttributes,
  baseAttributes,
  raceAttributeChoices,
  method,
  dicePool,
  diceAssignment,
  onChange,
  onMethodChange,
  onRoll,
  onDiceAssignmentChange,
  variedMethods = [],
  variedMethod,
  onVariedMethodChange,
  dicePoolLabels,
  rawDice,
  rawAssignment,
  onRawAssignmentChange,
}) => {
  const allAttributes = Object.values(Atributo);

  // Estado local para permitir input vazio temporariamente (método Livre)
  const [inputValues, setInputValues] = useState<Record<Atributo, string>>(() =>
    allAttributes.reduce(
      (acc, attr) => ({ ...acc, [attr]: String(baseAttributes[attr] ?? 0) }),
      {} as Record<Atributo, string>
    )
  );

  // Ressincroniza os inputs do método Livre quando o método muda (ex.: reset ao 0)
  useEffect(() => {
    if (method === 'free') {
      setInputValues(
        allAttributes.reduce(
          (acc, attr) => ({
            ...acc,
            [attr]: String(baseAttributes[attr] ?? 0),
          }),
          {} as Record<Atributo, string>
        )
      );
    }
  }, [method]);

  const handleFreeChange = (atributo: Atributo, value: string) => {
    // Só aceita números e o símbolo '-'
    if (value !== '' && !/^-?\d*$/.test(value)) {
      return;
    }

    // Sempre atualiza o estado local (permite vazio ou apenas '-')
    setInputValues((prev) => ({ ...prev, [atributo]: value }));

    // Só propaga para o parent se for número válido
    const numValue = parseInt(value, 10);
    if (!Number.isNaN(numValue) && numValue >= -4 && numValue <= 50) {
      onChange({
        ...baseAttributes,
        [atributo]: numValue,
      });
    }
  };

  const handlePointsAdjust = (atributo: Atributo, delta: number) => {
    const current = baseAttributes[atributo] ?? 0;
    const next = current + delta;
    if (next < POINT_BUY_MIN || next > POINT_BUY_MAX) return;
    onChange({ ...baseAttributes, [atributo]: next });
  };

  const handleAssign = (attrIndex: number, poolIndex: number | null) => {
    const next: (number | null)[] = allAttributes.map(
      (_, i) => diceAssignment?.[i] ?? null
    );
    next[attrIndex] = poolIndex;
    onDiceAssignmentChange(next);
  };

  const handleRawAssign = (dieIndex: number, attrIndex: number | null) => {
    const next: (number | null)[] = (rawDice ?? []).map(
      (_, i) => rawAssignment?.[i] ?? null
    );
    next[dieIndex] = attrIndex;
    onRawAssignmentChange?.(next);
  };

  // Calculate racial modifier bonus
  const getRacialModifier = (atributo: Atributo): number => {
    let modifier = 0;
    let anyIndex = 0;

    getEffectiveRaceAttrs(race, sexForAttributes).forEach(
      (attr: RaceAttributeAbility) => {
        if (attr.attr === atributo) {
          modifier += attr.mod;
        } else if (attr.attr === 'any') {
          // Each 'any' slot corresponds to one specific choice by index
          if (raceAttributeChoices?.[anyIndex] === atributo) {
            modifier += attr.mod;
          }
          anyIndex += 1;
        }
      }
    );

    return modifier;
  };

  // Helper to get color for racial modifier
  const getRacialModifierColor = (mod: number): string => {
    if (mod > 0) return 'success.main';
    if (mod < 0) return 'error.main';
    return 'text.secondary';
  };

  // Sem Atributos Variados, o orçamento é o do livro básico. Com a regra, a
  // variante escolhida manda (5, 10 ou 15 pontos).
  const pointBudget =
    variedMethod?.kind === 'points'
      ? variedMethod.budget ?? POINT_BUY_BUDGET
      : POINT_BUY_BUDGET;
  const remainingPoints = getRemainingPoints(baseAttributes, pointBudget);

  // Khalmyr é um método "por pontos" que na prática distribui um pool fixo — a
  // UI dele é a de dados, não a de compra.
  const usesPoolUI =
    method === 'dice'
      ? variedMethod?.kind !== 'raw'
      : variedMethod?.kind === 'pool';
  const usesRawUI = variedMethod?.kind === 'raw' && !!variedMethod.raw;
  const usesPointsUI = method === 'points' && variedMethod?.kind !== 'pool';

  const usedPoolIndices = new Set(
    (diceAssignment ?? [])
      .filter((idx): idx is number => idx !== null && idx !== undefined)
      .map((idx) => idx)
  );

  const methodDescriptions: Record<AttributeMethod, string> = {
    free: 'Defina livremente o modificador de cada atributo, sem restrições.',
    dice: 'Role 4d6 (descartando o menor) seis vezes e distribua os modificadores resultantes entre os atributos como quiser.',
    points: `Você tem ${pointBudget} pontos para distribuir. Custos: +1 = 1, +2 = 2, +3 = 4, +4 = 7. Reduzir um atributo para −1 devolve 1 ponto.`,
  };

  // A variante descreve o método melhor que o texto genérico do botão base.
  const methodDescription =
    method !== 'free' && variedMethod
      ? variedMethod.description
      : methodDescriptions[method];

  const variantOptions = variedMethods.filter(
    (candidate) => candidate.base === method
  );
  const showVariantSelector = method !== 'free' && variantOptions.length > 1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <ToggleButtonGroup
            color='primary'
            exclusive
            value={method}
            onChange={(_e, value: AttributeMethod | null) => {
              if (value) onMethodChange(value);
            }}
            size='small'
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value='free'>Livre</ToggleButton>
            <ToggleButton value='dice'>Dados</ToggleButton>
            <ToggleButton value='points'>Pontos</ToggleButton>
          </ToggleButtonGroup>

          {showVariantSelector && (
            <FormControl size='small' sx={{ minWidth: 200 }}>
              <InputLabel id='attribute-variant-label'>Variante</InputLabel>
              <Select
                labelId='attribute-variant-label'
                label='Variante'
                value={variedMethod?.id ?? ''}
                onChange={(e) => onVariedMethodChange?.(String(e.target.value))}
              >
                {variantOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
          }}
        >
          {methodDescription} Os modificadores da raça {race.name} são aplicados
          automaticamente ao valor final.
        </Typography>
        {showVariantSelector &&
          variedMethod &&
          variedMethod.id !== 'heroica' &&
          variedMethod.id !== 'p10' && (
            <Alert severity='info'>
              <strong>{variedMethod.label}</strong> é uma variante opcional de{' '}
              <em>Heróis de Arton</em> (p. 280). Combine com o mestre: os
              métodos não são equilibrados entre si.
            </Alert>
          )}
      </Box>
      {usesPointsUI && (
        <Alert severity={remainingPoints === 0 ? 'success' : 'info'}>
          Pontos restantes: <strong>{remainingPoints}</strong> / {pointBudget}
        </Alert>
      )}
      {usesRawUI && (
        <RawAttributeDicePool
          dice={rawDice}
          assignment={rawAssignment}
          onRoll={onRoll}
        />
      )}
      {usesPoolUI && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* Khalmyr não rola nada: o arranjo é fixo e já vem pronto. */}
            {variedMethod?.id !== 'khalmyr' && (
              <Button
                variant='contained'
                startIcon={<CasinoIcon />}
                onClick={onRoll}
              >
                {dicePool && dicePool.length > 0
                  ? 'Rolar novamente'
                  : 'Rolar atributos'}
              </Button>
            )}
            {dicePool && dicePool.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {dicePool.map((mod, idx) => (
                  <Chip
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    label={dicePoolLabels?.[idx] ?? formatMod(mod)}
                    size='small'
                    color={usedPoolIndices.has(idx) ? 'default' : 'primary'}
                    variant={usedPoolIndices.has(idx) ? 'outlined' : 'filled'}
                  />
                ))}
              </Box>
            )}
          </Box>
          {(!dicePool || dicePool.length === 0) && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
              }}
            >
              Clique em &quot;Rolar atributos&quot; para gerar seus valores.
            </Typography>
          )}
        </Box>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
          gap: 1.5,
        }}
      >
        {allAttributes.map((atributo, attrIndex) => {
          const baseModifier = baseAttributes[atributo] ?? 0;
          const racialModifier = getRacialModifier(atributo);
          const finalValue = baseModifier + racialModifier;

          const selectedPoolIndex = diceAssignment?.[attrIndex] ?? null;
          const addCost =
            getPointBuyCost(baseModifier + 1) - getPointBuyCost(baseModifier);
          const canAdd =
            baseModifier < POINT_BUY_MAX && addCost <= remainingPoints;
          const canSubtract = baseModifier > POINT_BUY_MIN;

          return (
            <Paper key={atributo} sx={{ p: 1.5 }}>
              <Typography
                variant='subtitle2'
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  fontFamily: 'Tfont, serif',
                }}
              >
                {atributo}
              </Typography>
              {method === 'free' && (
                <TextField
                  size='small'
                  label='Modificador'
                  value={inputValues[atributo]}
                  onChange={(e) => handleFreeChange(atributo, e.target.value)}
                  sx={{
                    width: 100,
                    mb: 1,
                    '& .MuiInputBase-input': { textAlign: 'center' },
                  }}
                />
              )}
              {usesPointsUI && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <IconButton
                    size='small'
                    onClick={() => handlePointsAdjust(atributo, -1)}
                    disabled={!canSubtract}
                    aria-label={`Diminuir ${atributo}`}
                  >
                    <RemoveIcon fontSize='small' />
                  </IconButton>
                  <Typography
                    variant='h6'
                    sx={{ minWidth: 32, textAlign: 'center' }}
                  >
                    {formatMod(baseModifier)}
                  </Typography>
                  <IconButton
                    size='small'
                    onClick={() => handlePointsAdjust(atributo, 1)}
                    disabled={!canAdd}
                    aria-label={`Aumentar ${atributo}`}
                  >
                    <AddIcon fontSize='small' />
                  </IconButton>
                </Box>
              )}
              {usesRawUI && variedMethod?.raw && (
                <RawAttributeCell
                  attributeIndex={attrIndex}
                  dice={rawDice}
                  assignment={rawAssignment}
                  startingValue={variedMethod.raw.startingValue}
                  convert={variedMethod.raw.convert}
                  onAssign={handleRawAssign}
                />
              )}
              {usesPoolUI && (
                <FormControl
                  size='small'
                  sx={{ width: 100, mb: 1 }}
                  disabled={!dicePool || dicePool.length === 0}
                >
                  <InputLabel id={`dice-${atributo}`}>Valor</InputLabel>
                  <Select
                    labelId={`dice-${atributo}`}
                    label='Valor'
                    value={
                      selectedPoolIndex === null
                        ? ''
                        : String(selectedPoolIndex)
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      handleAssign(attrIndex, val === '' ? null : Number(val));
                    }}
                  >
                    <MenuItem value=''>
                      <em>—</em>
                    </MenuItem>
                    {(dicePool ?? []).map((mod, poolIdx) => {
                      const disabled =
                        usedPoolIndices.has(poolIdx) &&
                        poolIdx !== selectedPoolIndex;
                      return (
                        <MenuItem
                          // eslint-disable-next-line react/no-array-index-key
                          key={poolIdx}
                          value={String(poolIdx)}
                          disabled={disabled}
                        >
                          {dicePoolLabels?.[poolIdx] ?? formatMod(mod)}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                  }}
                >
                  Mod. Racial:
                </Typography>
                <Typography
                  variant='body2'
                  color={getRacialModifierColor(racialModifier)}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                  }}
                >
                  {formatMod(racialModifier)}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  Final:
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                  }}
                >
                  {formatMod(finalValue)}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default AttributeBaseValuesStep;
