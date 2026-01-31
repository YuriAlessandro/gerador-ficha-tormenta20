import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import Origin, { OriginBenefits } from '@/interfaces/Origin';
import Skill from '@/interfaces/Skills';
import { OriginBenefit } from '@/interfaces/WizardSelections';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import Race from '@/interfaces/Race';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { isPowerAvailable } from '@/functions/powers';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';

interface OriginSelectionStepProps {
  origin: Origin;
  selectedBenefits: OriginBenefit[];
  onChange: (benefits: OriginBenefit[]) => void;
  usedSkills: Skill[];
  cachedBenefits?: OriginBenefits;
  // Attributes for requirement checking
  baseAttributes?: Record<Atributo, number>;
  raceAttributes?: Atributo[];
  race?: Race;
}

const OriginSelectionStep: React.FC<OriginSelectionStepProps> = ({
  origin,
  selectedBenefits,
  onChange,
  usedSkills,
  cachedBenefits,
  baseAttributes,
  raceAttributes,
  race,
}) => {
  const REQUIRED_SELECTIONS = 2;

  // Build a mock sheet for power requirement checking
  const mockSheetForRequirements = useMemo((): CharacterSheet | null => {
    if (!baseAttributes || !race) return null;

    // Calculate attribute values (base modifier + racial modifiers)
    const atributos: Record<Atributo, { value: number; mod: number }> = {
      [Atributo.FORCA]: { value: 0, mod: 0 },
      [Atributo.DESTREZA]: { value: 0, mod: 0 },
      [Atributo.CONSTITUICAO]: { value: 0, mod: 0 },
      [Atributo.INTELIGENCIA]: { value: 0, mod: 0 },
      [Atributo.SABEDORIA]: { value: 0, mod: 0 },
      [Atributo.CARISMA]: { value: 0, mod: 0 },
    };

    // Apply base attribute modifiers
    Object.entries(baseAttributes).forEach(([attr, modifier]) => {
      atributos[attr as Atributo].value = modifier;
      atributos[attr as Atributo].mod = modifier;
    });

    // Apply racial modifiers
    race.attributes.attrs.forEach((attrMod) => {
      if (attrMod.attr === 'any') {
        // Apply to chosen attributes
        raceAttributes?.forEach((chosenAttr) => {
          atributos[chosenAttr].value += attrMod.mod;
          atributos[chosenAttr].mod += attrMod.mod;
        });
      } else {
        atributos[attrMod.attr].value += attrMod.mod;
        atributos[attrMod.attr].mod += attrMod.mod;
      }
    });

    return {
      atributos,
      generalPowers: [],
      classPowers: [],
      skills: usedSkills,
      nivel: 1,
      classe: {
        name: '',
        abilities: [],
        proficiencias: [],
      },
      raca: race,
      spells: [],
    } as unknown as CharacterSheet;
  }, [baseAttributes, race, raceAttributes, usedSkills]);

  // Helper to check if a power meets requirements
  const checkPowerRequirements = (
    power: OriginPower | GeneralPower
  ): boolean => {
    if (!mockSheetForRequirements) return true; // If no sheet, allow all
    // Only check requirements if the power has them (GeneralPower has requirements, OriginPower may not)
    if ('requirements' in power && power.requirements) {
      return isPowerAvailable(mockSheetForRequirements, power as GeneralPower);
    }
    return true; // No requirements = always available
  };

  // If origin is regional, show what benefits will be granted automatically
  if (origin.isRegional) {
    const originBenefits = origin.getPowersAndSkills
      ? origin.getPowersAndSkills(usedSkills, origin, true)
      : {
          powers: {
            origin:
              origin.poderes as import('@/interfaces/Poderes').OriginPower[],
            general: [],
          },
          skills: origin.pericias,
        };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant='body1' color='text.secondary'>
          A origem {origin.name} é uma origem regional (Atlas de Arton) e
          concede todos os benefícios automaticamente.
        </Typography>

        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant='h6' gutterBottom>
            Benefícios Concedidos Automaticamente:
          </Typography>

          {originBenefits.skills.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2'>Perícias:</Typography>
              <Typography variant='body2' color='text.secondary'>
                {originBenefits.skills.join(', ')}
              </Typography>
            </Box>
          )}

          {originBenefits.powers.origin.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2'>Poderes de Origem:</Typography>
              {originBenefits.powers.origin.map((power) => (
                <Typography
                  key={power.name}
                  variant='body2'
                  color='text.secondary'
                >
                  • {power.name}
                </Typography>
              ))}
            </Box>
          )}

          {origin.getItems().length > 0 && (
            <Box>
              <Typography variant='subtitle2'>Itens:</Typography>
              {origin.getItems().map((item) => {
                const itemName =
                  typeof item.equipment === 'string'
                    ? item.equipment
                    : item.equipment.nome;
                const itemKey = `${itemName}-${item.qtd || 1}`;

                return (
                  <Typography
                    key={itemKey}
                    variant='body2'
                    color='text.secondary'
                  >
                    • {itemName}
                    {item.qtd && item.qtd > 1 ? ` (x${item.qtd})` : ''}
                  </Typography>
                );
              })}
            </Box>
          )}
        </Paper>

        <Alert severity='success'>
          Nenhuma seleção necessária - todos os benefícios serão concedidos
          automaticamente. Você pode continuar para o próximo passo.
        </Alert>
      </Box>
    );
  }

  // Get available benefits from the origin - use cached if available
  // This prevents random re-selection when navigating back and forth in the wizard
  const originBenefits =
    cachedBenefits ||
    (origin.getPowersAndSkills
      ? origin.getPowersAndSkills(usedSkills, origin, true)
      : {
          powers: {
            origin:
              origin.poderes as import('@/interfaces/Poderes').OriginPower[],
            general: [],
          },
          skills: origin.pericias,
        });

  // Items are always given automatically - not selectable
  const items = origin.getItems();

  // Build benefit options - only skills and powers are selectable
  // Get all origin skills to show disabled ones that are already selected
  const allOriginSkills = origin.pericias || [];

  // Skills already used in previous steps
  const alreadyUsedSkills = allOriginSkills.filter((skill) =>
    usedSkills.includes(skill as Skill)
  );

  // Skills available for selection (not already used) - filter out any that are in usedSkills
  const availableSkillOptions: OriginBenefit[] = originBenefits.skills
    .filter((skill) => !usedSkills.includes(skill))
    .map((skill) => ({
      type: 'skill' as const,
      name: skill,
      alreadyUsed: false,
    }));

  const alreadyUsedSkillOptions: OriginBenefit[] = alreadyUsedSkills.map(
    (skill) => ({
      type: 'skill' as const,
      name: skill as Skill,
      alreadyUsed: true,
    })
  );

  // Combine all skill options
  const skillOptions: OriginBenefit[] = [
    ...availableSkillOptions,
    ...alreadyUsedSkillOptions,
  ];

  // Include both origin powers and general powers from the origin
  // Also check requirements for each power
  const powerOptionsWithRequirements = [
    ...originBenefits.powers.origin.map((power) => ({
      type: 'power' as const,
      name: power.name,
      power,
      meetsRequirements: checkPowerRequirements(power),
    })),
    ...(originBenefits.powers.generalPowers || []).map((power) => ({
      type: 'power' as const,
      name: power.name,
      power,
      meetsRequirements: checkPowerRequirements(power),
    })),
  ];

  const powerOptions: OriginBenefit[] = powerOptionsWithRequirements.map(
    (opt) => ({
      type: opt.type,
      name: opt.name,
    })
  );

  const handleToggle = (benefit: OriginBenefit) => {
    const isSelected = selectedBenefits.some(
      (b) => b.type === benefit.type && b.name === benefit.name
    );

    if (isSelected) {
      // Remove benefit
      onChange(
        selectedBenefits.filter(
          (b) => !(b.type === benefit.type && b.name === benefit.name)
        )
      );
    } else if (selectedBenefits.length < REQUIRED_SELECTIONS) {
      // Add benefit if under limit
      onChange([...selectedBenefits, benefit]);
    }
  };

  const isComplete = selectedBenefits.length === REQUIRED_SELECTIONS;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        A origem {origin.name} concede itens automaticamente e permite escolher{' '}
        {REQUIRED_SELECTIONS} benefícios entre perícias e poderes. Selecione
        abaixo:
      </Typography>

      <Typography variant='caption' color='text.secondary'>
        Selecionados: {selectedBenefits.length} / {REQUIRED_SELECTIONS}
      </Typography>

      {/* Items Section - Always granted, display only */}
      {items.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant='h6' gutterBottom>
            Itens (concedidos automaticamente)
          </Typography>
          {items.map((item) => {
            const itemName =
              typeof item.equipment === 'string'
                ? item.equipment
                : item.equipment.nome;
            const itemKey = `${itemName}-${item.qtd || 1}`;

            return (
              <Typography key={itemKey} variant='body2' color='text.secondary'>
                • {itemName}
                {item.qtd && item.qtd > 1 ? ` (x${item.qtd})` : ''}
              </Typography>
            );
          })}
        </Paper>
      )}

      {/* Skills Section */}
      {skillOptions.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' gutterBottom>
            Perícias
          </Typography>
          {alreadyUsedSkillOptions.length > 0 && (
            <Alert severity='info' sx={{ mb: 2 }}>
              Algumas perícias desta origem já foram selecionadas em etapas
              anteriores (raça ou classe). Você pode desmarcá-las lá para
              escolhê-las aqui.
            </Alert>
          )}
          {skillOptions.map((benefit) => {
            const isSelected = selectedBenefits.some(
              (b) => b.type === benefit.type && b.name === benefit.name
            );
            const isAlreadyUsed = benefit.alreadyUsed === true;
            const isDisabledByLimit =
              !isSelected && selectedBenefits.length >= REQUIRED_SELECTIONS;

            return (
              <FormControlLabel
                key={`skill-${benefit.name}`}
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleToggle(benefit)}
                    disabled={isAlreadyUsed || isDisabledByLimit}
                  />
                }
                label={
                  <Typography
                    component='span'
                    sx={{
                      color: isAlreadyUsed ? 'text.disabled' : 'inherit',
                    }}
                  >
                    {benefit.name}
                    {isAlreadyUsed && (
                      <Typography
                        component='span'
                        variant='caption'
                        sx={{ ml: 1, fontStyle: 'italic' }}
                      >
                        (já selecionada)
                      </Typography>
                    )}
                  </Typography>
                }
              />
            );
          })}
        </Paper>
      )}

      {/* Powers Section */}
      {powerOptions.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' gutterBottom>
            Poderes
          </Typography>
          {powerOptionsWithRequirements.some((p) => !p.meetsRequirements) && (
            <Alert severity='info' sx={{ mb: 2 }}>
              Alguns poderes estão indisponíveis pois você não atende aos
              pré-requisitos (ex: atributo mínimo).
            </Alert>
          )}
          {powerOptionsWithRequirements.map((powerOpt) => {
            const benefit: OriginBenefit = {
              type: powerOpt.type,
              name: powerOpt.name,
            };
            const isSelected = selectedBenefits.some(
              (b) => b.type === benefit.type && b.name === benefit.name
            );
            const isDisabledByLimit =
              !isSelected && selectedBenefits.length >= REQUIRED_SELECTIONS;
            const isDisabledByRequirements = !powerOpt.meetsRequirements;
            const isDisabled = isDisabledByLimit || isDisabledByRequirements;

            return (
              <FormControlLabel
                key={`power-${benefit.name}`}
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleToggle(benefit)}
                    disabled={isDisabled}
                  />
                }
                label={
                  <Typography
                    component='span'
                    sx={{
                      color: isDisabledByRequirements
                        ? 'text.disabled'
                        : 'inherit',
                    }}
                  >
                    {benefit.name}
                    {isDisabledByRequirements && (
                      <Typography
                        component='span'
                        variant='caption'
                        sx={{ ml: 1, fontStyle: 'italic' }}
                      >
                        (pré-requisitos não atendidos)
                      </Typography>
                    )}
                  </Typography>
                }
              />
            );
          })}
        </Paper>
      )}

      {!isComplete && selectedBenefits.length > 0 && (
        <Alert severity='warning'>
          Selecione {REQUIRED_SELECTIONS - selectedBenefits.length} benefício
          {REQUIRED_SELECTIONS - selectedBenefits.length > 1 ? 's' : ''}{' '}
          adicional
          {REQUIRED_SELECTIONS - selectedBenefits.length > 1 ? 'is' : ''} para
          continuar.
        </Alert>
      )}

      {isComplete && (
        <Alert severity='success'>
          Benefícios selecionados com sucesso! Você pode continuar para o
          próximo passo.
        </Alert>
      )}
    </Box>
  );
};

export default OriginSelectionStep;
