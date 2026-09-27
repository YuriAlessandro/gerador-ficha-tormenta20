import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { CompanionTrick } from '@/interfaces/Companion';
import {
  COMPANION_MANEUVERS,
  SOPRO_ELEMENTS,
  SPECIAL_MOVEMENTS,
  getCompanionTrickDefinition,
} from '@/data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import { Atributo } from '@/data/systems/tormenta20/atributos';

// Condicionamento Especial: qualquer atributo, exceto Inteligência
const CONDITIONING_ATTRIBUTES: Atributo[] = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
];

interface ChoiceSelectProps {
  label: string;
  value: string | undefined;
  options: string[];
  onChange: (value: string | undefined) => void;
}

const ChoiceSelect: React.FC<ChoiceSelectProps> = ({
  label,
  value,
  options,
  onChange,
}) => (
  <FormControl size='small' sx={{ minWidth: 160 }}>
    <InputLabel>{label}</InputLabel>
    <Select
      label={label}
      value={value || ''}
      onChange={(e) => onChange((e.target.value as string) || undefined)}
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

interface CompanionTrickChoiceFieldsProps {
  trick: CompanionTrick;
  /** Recebe o objeto `choices` inteiro já atualizado */
  onChoicesChange: (choices: Record<string, string>) => void;
}

/**
 * Seletores das sub-escolhas de truque do melhor amigo: atributos
 * (Condicionamento Especial), deslocamento (Deslocamento Especial), elemento
 * (Sopro) e manobra (Manobra Ensaiada). Magia Inata fica de fora — cada fluxo
 * tem sua própria busca de magias.
 */
const CompanionTrickChoiceFields: React.FC<CompanionTrickChoiceFieldsProps> = ({
  trick,
  onChoicesChange,
}) => {
  const def = getCompanionTrickDefinition(trick.name);
  if (!def?.hasSubChoice || def.subChoiceType === 'spell') return null;

  const choices = trick.choices || {};
  const setChoice = (
    key: string,
    value: string | undefined,
    extra?: (next: Record<string, string>) => void
  ) => {
    const next = { ...choices };
    if (value === undefined) delete next[key];
    else next[key] = value;
    if (extra) extra(next);
    onChoicesChange(next);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {def.subChoiceType === 'attribute' && (
        <>
          <ChoiceSelect
            label='Primário (+2)'
            value={choices.primary}
            options={CONDITIONING_ATTRIBUTES}
            onChange={(value) =>
              setChoice('primary', value, (next) => {
                // O secundário não pode repetir o primário
                if (value && next.secondary === value) {
                  // eslint-disable-next-line no-param-reassign
                  delete next.secondary;
                }
              })
            }
          />
          <ChoiceSelect
            label='Secundário (+1)'
            value={choices.secondary}
            options={CONDITIONING_ATTRIBUTES.filter(
              (attr) => attr !== choices.primary
            )}
            onChange={(value) => setChoice('secondary', value)}
          />
        </>
      )}
      {def.subChoiceType === 'movement' && (
        <ChoiceSelect
          label='Deslocamento'
          value={choices.type}
          options={SPECIAL_MOVEMENTS}
          onChange={(value) => setChoice('type', value)}
        />
      )}
      {def.subChoiceType === 'element' && (
        <ChoiceSelect
          label='Tipo de energia'
          value={choices.element}
          options={SOPRO_ELEMENTS}
          onChange={(value) => setChoice('element', value)}
        />
      )}
      {def.subChoiceType === 'maneuver' && (
        <ChoiceSelect
          label='Manobra'
          value={choices.maneuver}
          options={COMPANION_MANEUVERS}
          onChange={(value) => setChoice('maneuver', value)}
        />
      )}
    </Box>
  );
};

export default CompanionTrickChoiceFields;
