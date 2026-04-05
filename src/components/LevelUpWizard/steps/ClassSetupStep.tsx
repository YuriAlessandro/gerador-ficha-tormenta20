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
  if (selectedClassName === 'Arcanista') {
    return (
      <Box>
        <Typography variant='h6' gutterBottom>
          Configuração do Arcanista
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
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

  if (selectedClassName === 'Bardo' || selectedClassName === 'Druida') {
    const selectedSchools = classSetup.spellSchools || [];
    const spellType =
      selectedClassName === 'Bardo' ? 'arcanas e divinas' : 'divinas';

    return (
      <Box>
        <Typography variant='h6' gutterBottom>
          Escolas de Magia — {selectedClassName}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Escolha 3 escolas de magia. Você poderá aprender magias {spellType}{' '}
          dessas escolas.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {allSpellSchools.map((school) => {
            const isSelected = selectedSchools.includes(school);
            const isDisabled = !isSelected && selectedSchools.length >= 3;

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

        {selectedSchools.length < 3 && (
          <Alert severity='info'>
            Selecione {3 - selectedSchools.length} escola
            {3 - selectedSchools.length > 1 ? 's' : ''} de magia.
          </Alert>
        )}

        {selectedSchools.length === 3 && (
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
