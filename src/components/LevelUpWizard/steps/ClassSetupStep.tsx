import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import { allSpellSchools } from '@/interfaces/Spells';
import { SupplementId } from '@/types/supplement.types';
import { DEUSES_MAIORES } from '@/data/systems/tormenta20/classes/arcanista';
import { findClassDescription } from '@/functions/multiclass';
import { isClassOrVariantOf } from '@/functions/general';
import ArcanistSubtypeSelectionStep from '@/components/CharacterCreationWizard/steps/ArcanistSubtypeSelectionStep';
import FeiticeiroLinhagemSelectionStep from '@/components/CharacterCreationWizard/steps/FeiticeiroLinhagemSelectionStep';
import SpellSchoolSelectionStep from '@/components/CharacterCreationWizard/steps/SpellSchoolSelectionStep';

type ClassSetupData = NonNullable<LevelUpSelections['classSetup']>;

interface ClassSetupStepProps {
  selectedClassName: string;
  classSetup: ClassSetupData;
  onChange: (setup: ClassSetupData) => void;
  activeSupplements?: SupplementId[];
  /**
   * Ficha antiga de Feiticeiro Abençoado multiclasse que perdeu o deus: só
   * ele é perguntado, no 2º nível da classe (ver `classSetupNeedsRecovery`).
   */
  recoveringDeus?: boolean;
}

const ClassSetupStep: React.FC<ClassSetupStepProps> = ({
  selectedClassName,
  classSetup,
  onChange,
  activeSupplements = [],
  recoveringDeus = false,
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

  if (selectedClassName === 'Arcanista' && recoveringDeus) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity='info'>
          No 2º nível da Linhagem Abençoada você recebe um poder concedido do
          deus da linhagem, mas esta ficha não guardou qual deus foi escolhido.
          Selecione-o de novo para continuar.
        </Alert>
        <FormControl fullWidth>
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
      </Box>
    );
  }

  // Mesmos cards da criação de personagem.
  if (selectedClassName === 'Arcanista') {
    const isFeiticeiro = classSetup.arcanistaSubtype === 'Feiticeiro';
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ArcanistSubtypeSelectionStep
          selectedSubtype={classSetup.arcanistaSubtype || null}
          onChange={(subtype) =>
            onChange({
              ...classSetup,
              arcanistaSubtype: subtype,
              feiticeiroLinhagem: undefined,
              draconicaDamageType: undefined,
              linhagemAbencoadaDeus: undefined,
            })
          }
          hideStatus={isFeiticeiro}
        />
        {isFeiticeiro && (
          <>
            <Divider />
            <FeiticeiroLinhagemSelectionStep
              selectedLinhagem={classSetup.feiticeiroLinhagem || null}
              onChange={(linhagem) =>
                onChange({
                  ...classSetup,
                  feiticeiroLinhagem: linhagem,
                  draconicaDamageType: undefined,
                  linhagemAbencoadaDeus: undefined,
                })
              }
              activeSupplements={activeSupplements}
              selectedDeus={classSetup.linhagemAbencoadaDeus}
              onDeusChange={(deus) =>
                onChange({ ...classSetup, linhagemAbencoadaDeus: deus })
              }
            />
          </>
        )}
        {isFeiticeiro &&
          classSetup.feiticeiroLinhagem === 'Linhagem Dracônica' && (
            <FormControl fullWidth>
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
    const spellType: 'Arcane' | 'Divine' | 'Both' =
      (schoolChoice ? classDesc?.spellPath?.spellType : undefined) ??
      (isBardoLike ? 'Both' : 'Divine');

    return (
      <SpellSchoolSelectionStep
        selectedSchools={classSetup.spellSchools || []}
        onChange={(schools) =>
          onChange({ ...classSetup, spellSchools: schools })
        }
        requiredCount={Math.min(
          schoolConfig.count,
          (schoolConfig.available ?? allSpellSchools).length
        )}
        availableSchools={schoolConfig.available}
        className={selectedClassName}
        spellType={spellType}
      />
    );
  }

  return null;
};

export default ClassSetupStep;
