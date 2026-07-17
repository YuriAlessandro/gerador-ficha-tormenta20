import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import { allSpellSchools, SpellSchool } from '@/interfaces/Spells';
import { SupplementId } from '@/types/supplement.types';
import { DEUSES_MAIORES } from '@/data/systems/tormenta20/classes/arcanista';
import { findClassDescription } from '@/functions/multiclass';
import { isClassOrVariantOf } from '@/functions/general';

type ClassSetupData = NonNullable<LevelUpSelections['classSetup']>;

interface ClassSetupStepProps {
  selectedClassName: string;
  classSetup: ClassSetupData;
  onChange: (setup: ClassSetupData) => void;
  activeSupplements?: SupplementId[];
}

const SPELL_SCHOOL_LABELS: Record<SpellSchool, string> = {
  Abjur: 'Abjuração',
  Adiv: 'Adivinhação',
  Conv: 'Convocação',
  Encan: 'Encantamento',
  Evoc: 'Evocação',
  Ilusão: 'Ilusão',
  Necro: 'Necromancia',
  Trans: 'Transmutação',
};

const ClassSetupStep: React.FC<ClassSetupStepProps> = ({
  selectedClassName,
  classSetup,
  onChange,
  activeSupplements = [],
}) => {
  // Resolve a classe para tratar variantes (ex.: Magimarcialista, variante de
  // Bardo) como a classe base na escolha de escolas de magia.
  const classDesc = findClassDescription(
    selectedClassName,
    undefined,
    activeSupplements
  );
  const isBardoLike = classDesc
    ? isClassOrVariantOf(classDesc, 'Bardo')
    : selectedClassName === 'Bardo';
  const isDruidaLike = classDesc
    ? isClassOrVariantOf(classDesc, 'Druida')
    : selectedClassName === 'Druida';

  if (selectedClassName === 'Arcanista') {
    return (
      <Box>
        <Typography variant='h6' gutterBottom>
          Configuração do Arcanista
        </Typography>
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            mb: 2,
          }}
        >
          Escolha o caminho do seu Arcanista. Cada subtipo possui uma forma
          diferente de conjurar magias.
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Subtipo do Arcanista</InputLabel>
          <Select
            value={classSetup.arcanistaSubtype || ''}
            label='Subtipo do Arcanista'
            onChange={(e) =>
              onChange({
                ...classSetup,
                arcanistaSubtype: e.target
                  .value as ClassSetupData['arcanistaSubtype'],
                feiticeiroLinhagem: undefined,
                draconicaDamageType: undefined,
              })
            }
          >
            <MenuItem value='Bruxo'>
              Bruxo (INT — magias via foco arcano)
            </MenuItem>
            <MenuItem value='Mago'>
              Mago (INT — 4 magias iniciais, livro de magias)
            </MenuItem>
            <MenuItem value='Feiticeiro'>
              Feiticeiro (CAR — poder inato, linhagem)
            </MenuItem>
          </Select>
        </FormControl>
        {classSetup.arcanistaSubtype === 'Feiticeiro' && (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Linhagem</InputLabel>
              <Select
                value={classSetup.feiticeiroLinhagem || ''}
                label='Linhagem'
                onChange={(e) =>
                  onChange({
                    ...classSetup,
                    feiticeiroLinhagem: e.target
                      .value as ClassSetupData['feiticeiroLinhagem'],
                    draconicaDamageType: undefined,
                  })
                }
              >
                <MenuItem value='Linhagem Dracônica'>
                  Linhagem Dracônica (resistência elemental + bônus PV)
                </MenuItem>
                <MenuItem value='Linhagem Feérica'>
                  Linhagem Feérica (treinado em Enganação)
                </MenuItem>
                <MenuItem value='Linhagem Rubra'>
                  Linhagem Rubra (conexão com a Tormenta)
                </MenuItem>
                {activeSupplements.includes(
                  SupplementId.TORMENTA20_DEUSES_ARTON
                ) && (
                  <MenuItem value='Linhagem Abençoada'>
                    Linhagem Abençoada (magias divinas + poder concedido)
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            {classSetup.feiticeiroLinhagem === 'Linhagem Dracônica' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tipo de Dano</InputLabel>
                <Select
                  value={classSetup.draconicaDamageType || ''}
                  label='Tipo de Dano'
                  onChange={(e) =>
                    onChange({
                      ...classSetup,
                      draconicaDamageType: e.target.value,
                    })
                  }
                >
                  <MenuItem value='Ácido'>Ácido</MenuItem>
                  <MenuItem value='Elétrico'>Elétrico</MenuItem>
                  <MenuItem value='Fogo'>Fogo</MenuItem>
                  <MenuItem value='Frio'>Frio</MenuItem>
                </Select>
              </FormControl>
            )}

            {classSetup.feiticeiroLinhagem === 'Linhagem Abençoada' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Deus Maior</InputLabel>
                <Select
                  value={classSetup.linhagemAbencoadaDeus || ''}
                  label='Deus Maior'
                  onChange={(e) =>
                    onChange({
                      ...classSetup,
                      linhagemAbencoadaDeus: e.target.value,
                    })
                  }
                >
                  {DEUSES_MAIORES.map((deus) => (
                    <MenuItem key={deus} value={deus}>
                      {deus}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </>
        )}
      </Box>
    );
  }

  // Escolha de escolas: declarada no spellPath (classes homebrew) ou o padrão
  // de Bardo/Druida (3 escolas dentre todas). Follow-up: migrar Bardo/Druida
  // para spellPath.schoolChoice e remover o fallback hardcoded.
  const schoolChoice = classDesc?.spellPath?.schoolChoice;
  const schoolConfig =
    schoolChoice ?? (isBardoLike || isDruidaLike ? { count: 3 } : null);

  if (schoolConfig) {
    const selectedSchools = classSetup.spellSchools || [];
    const pool = schoolConfig.available ?? allSpellSchools;
    const requiredCount = Math.min(schoolConfig.count, pool.length);

    const getSpellTypeText = (): string => {
      const type = schoolChoice
        ? classDesc?.spellPath?.spellType
        : (isBardoLike && 'Both') || 'Divine';
      if (type === 'Arcane') return 'arcanas';
      if (type === 'Both') return 'arcanas e divinas';
      return 'divinas';
    };
    const spellType = getSpellTypeText();

    return (
      <Box>
        <Typography variant='h6' gutterBottom>
          Escolas de Magia — {selectedClassName}
        </Typography>
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            mb: 2,
          }}
        >
          Escolha {requiredCount} escola{requiredCount > 1 ? 's' : ''} de magia.
          Você poderá aprender magias {spellType} dessas escolas.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {pool.map((school) => {
            const isSelected = selectedSchools.includes(school);
            const isDisabled =
              !isSelected && selectedSchools.length >= requiredCount;

            return (
              <Chip
                key={school}
                label={SPELL_SCHOOL_LABELS[school]}
                onClick={() => {
                  if (isSelected) {
                    onChange({
                      ...classSetup,
                      spellSchools: selectedSchools.filter((s) => s !== school),
                    });
                  } else if (!isDisabled) {
                    onChange({
                      ...classSetup,
                      spellSchools: [...selectedSchools, school],
                    });
                  }
                }}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                disabled={isDisabled}
                sx={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
              />
            );
          })}
        </Box>
        {selectedSchools.length < requiredCount && (
          <Alert severity='info'>
            Selecione {requiredCount - selectedSchools.length} escola
            {requiredCount - selectedSchools.length > 1 ? 's' : ''} de magia.
          </Alert>
        )}
        {selectedSchools.length === requiredCount && (
          <Alert severity='success'>
            Escolas selecionadas:{' '}
            {selectedSchools.map((s) => SPELL_SCHOOL_LABELS[s]).join(', ')}
          </Alert>
        )}
      </Box>
    );
  }

  return null;
};

export default ClassSetupStep;
