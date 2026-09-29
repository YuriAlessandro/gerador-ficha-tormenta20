import React from 'react';
import { Alert, Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { Spell, SpellSchool } from '@/interfaces/Spells';
import { SCHOOL_LABELS } from '@/components/SpellPicker/schoolLabels';
import { SCHOOL_VISUALS } from '@/components/SheetResult/SpellsTab/spellSchoolVisuals';
import {
  EditableSchoolTarget,
  getSpellsFromRemovedSchools,
} from '@/functions/spells/spellSchoolEditing';

interface SpellSchoolsEditorProps {
  targets: EditableSchoolTarget[];
  /** Escolas em edição, por nome de classe. */
  draft: Record<string, SpellSchool[]>;
  onChange: (className: string, schools: SpellSchool[]) => void;
  /** Magias atualmente selecionadas na gaveta (para o aviso de escola removida). */
  spells: Spell[];
}

/**
 * Troca das escolas de magia escolhidas na criação (Bardo, Druida, variantes e
 * homebrews com `schoolChoice`). As escolas filtram as magias ofertadas nos
 * próximos níveis; magias já aprendidas não são removidas.
 */
const SpellSchoolsEditor: React.FC<SpellSchoolsEditorProps> = ({
  targets,
  draft,
  onChange,
  spells,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant='subtitle2'>Escolas de Magia</Typography>
      <Typography
        variant='caption'
        sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}
      >
        Definem quais magias você pode aprender ao subir de nível. Trocar as
        escolas não remove magias já aprendidas.
      </Typography>

      <Stack spacing={2}>
        {targets.map((target) => {
          const selected = draft[target.className] ?? target.schools;
          const { count } = target.config;
          const isFull = selected.length >= count;
          const orphanSpells = getSpellsFromRemovedSchools(
            spells,
            target.schools,
            selected
          );

          const toggle = (school: SpellSchool) => {
            if (selected.includes(school)) {
              onChange(
                target.className,
                selected.filter((s) => s !== school)
              );
            } else if (!isFull) {
              onChange(target.className, [...selected, school]);
            }
          };

          return (
            <Box key={target.className}>
              {targets.length > 1 && (
                <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                  {target.className}
                </Typography>
              )}
              <Typography
                variant='caption'
                sx={{
                  color: isFull ? 'text.secondary' : 'warning.main',
                  display: 'block',
                  mb: 1,
                }}
              >
                Selecionadas: {selected.length} / {count}
              </Typography>
              <Stack
                direction='row'
                sx={{ flexWrap: 'wrap', gap: 1 }}
                role='group'
                aria-label={`Escolas de magia de ${target.className}`}
              >
                {target.config.available.map((school) => {
                  const isSelected = selected.includes(school);
                  const visual = SCHOOL_VISUALS[school];
                  const Icon = visual.icon;
                  const color = isDark ? visual.dark : visual.light;
                  return (
                    <Chip
                      key={school}
                      label={SCHOOL_LABELS[school]}
                      icon={<Icon sx={{ '&&': { color } }} />}
                      onClick={() => toggle(school)}
                      disabled={!isSelected && isFull}
                      variant={isSelected ? 'filled' : 'outlined'}
                      aria-pressed={isSelected}
                      size='small'
                      sx={{
                        fontWeight: isSelected ? 'bold' : 'normal',
                        borderColor: isSelected ? color : undefined,
                      }}
                    />
                  );
                })}
              </Stack>
              {orphanSpells.length > 0 && (
                <Alert severity='info' sx={{ mt: 1.5 }}>
                  Estas magias são de escolas que você removeu e continuam na
                  ficha: {orphanSpells.map((s) => s.nome).join(', ')}. Remova-as
                  abaixo se não fizerem mais sentido.
                </Alert>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default SpellSchoolsEditor;
