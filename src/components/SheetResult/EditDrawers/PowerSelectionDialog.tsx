import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Alert,
  Divider,
  TextField,
} from '@mui/material';
import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  PowerSelectionRequirements,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import {
  getChosenOptionNestedRequirements,
  getFilteredAvailableOptions,
  resolveLearnSkillRemainingPick,
  validateSelections,
} from '@/functions/powers/manualPowerSelection';
import { getCurrentPlateau } from '@/functions/powers/general';
import { FAMILIARS } from '@/data/systems/tormenta20/familiars';
import { ANIMAL_TOTEMS } from '@/data/systems/tormenta20/animalTotems';
import { useContentSupplements } from '@/hooks/useContentSupplements';
import { dataRegistry } from '@/data/registry';
import AlmaLivreSelectionField from '@/components/CharacterCreationWizard/steps/AlmaLivreSelectionField';

/** Acima disso, a lista de poderes ganha campo de busca. */
const SEARCH_THRESHOLD = 12;

/** Comparação de busca sem acento e sem caixa. */
const normalizeSearch = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

interface PowerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selections: SelectionOptions) => void;
  requirements: PowerSelectionRequirements;
  sheet: CharacterSheet;
  // For repeatable powers: how many instances of the power are on the sheet,
  // and the currently-recorded selections (one per instance, in order).
  instances?: number;
  initialSelections?: SelectionOptions;
  // O poder dono dos requisitos. Só é preciso para os requisitos ANINHADOS de
  // um `chooseFromOptions` — os que só existem depois que o jogador escolhe uma
  // opção (ex.: Cosmopolita → "Poder geral" revela a lista de poderes gerais).
  // Sem ele o diálogo desenha só o primeiro nível e o Confirmar aceita uma
  // escolha pela metade.
  ownerPower?: Parameters<typeof getChosenOptionNestedRequirements>[0];
}

const PowerSelectionDialog: React.FC<PowerSelectionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  requirements,
  sheet,
  instances = 1,
  initialSelections,
  ownerPower,
}) => {
  const supplements = useContentSupplements();
  const [selections, setSelections] = useState<SelectionOptions>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [searchByRequirement, setSearchByRequirement] = useState<
    Record<number, string>
  >({});

  // Requisitos que só existem depois de uma escolha de `chooseFromOptions`.
  // Recalculados a cada mudança de `selections` para que o segundo passo
  // apareça assim que o ramo é escolhido.
  const nestedRequirements = ownerPower
    ? getChosenOptionNestedRequirements(ownerPower, selections)
    : [];
  const effectiveRequirements: PowerSelectionRequirements = {
    powerName: requirements.powerName,
    requirements: [...requirements.requirements, ...nestedRequirements],
  };

  // Reset selections when dialog opens/closes or requirements change
  useEffect(() => {
    if (open) {
      setSelections(initialSelections || {});
      setErrors([]);
      setSearchByRequirement({});
    }
  }, [open, requirements.powerName, initialSelections]);

  const handleSkillSelection = (
    skill: string,
    checked: boolean,
    pick: number
  ) => {
    setSelections((prev) => {
      const currentSkills = prev.skills || [];
      let newSkills: string[];

      if (pick === 1) {
        // Single selection - replace
        newSkills = checked ? [skill] : [];
      } else if (checked) {
        // Multiple selection
        if (currentSkills.length < pick) {
          newSkills = [...currentSkills, skill];
        } else {
          newSkills = currentSkills;
        }
      } else {
        newSkills = currentSkills.filter((s) => s !== skill);
      }

      return { ...prev, skills: newSkills };
    });
  };

  const handleProficiencySelection = (
    proficiency: string,
    checked: boolean,
    pick: number
  ) => {
    setSelections((prev) => {
      const currentProfs = prev.proficiencies || [];
      let newProfs: string[];

      if (pick === 1) {
        // Single selection - replace
        newProfs = checked ? [proficiency] : [];
      } else if (checked) {
        // Multiple selection
        if (currentProfs.length < pick) {
          newProfs = [...currentProfs, proficiency];
        } else {
          newProfs = currentProfs;
        }
      } else {
        newProfs = currentProfs.filter((p) => p !== proficiency);
      }

      return { ...prev, proficiencies: newProfs };
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePowerSelection = (power: any, checked: boolean, pick: number) => {
    setSelections((prev) => {
      const currentPowers = prev.powers || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let newPowers: any[];

      if (pick === 1) {
        // Single selection - replace
        newPowers = checked ? [power] : [];
      } else if (checked) {
        // Multiple selection
        if (currentPowers.length < pick) {
          newPowers = [...currentPowers, power];
        } else {
          newPowers = currentPowers;
        }
      } else {
        newPowers = currentPowers.filter((p) => p.name !== power.name);
      }

      return { ...prev, powers: newPowers };
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSpellSelection = (spell: any, checked: boolean, pick: number) => {
    setSelections((prev) => {
      const currentSpells = prev.spells || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let newSpells: any[];

      if (pick === 1) {
        // Single selection - replace
        newSpells = checked ? [spell] : [];
      } else if (checked) {
        // Multiple selection
        if (currentSpells.length < pick) {
          newSpells = [...currentSpells, spell];
        } else {
          newSpells = currentSpells;
        }
      } else {
        newSpells = currentSpells.filter((s) => s.nome !== spell.nome);
      }

      return { ...prev, spells: newSpells };
    });
  };

  const handleAttributeSelection = (
    attribute: string,
    checked: boolean,
    pick: number
  ) => {
    setSelections((prev) => {
      const currentAttributes = prev.attributes || [];
      let newAttributes: string[];

      if (pick === 1) {
        // Single selection - replace (attributes are always single selection)
        newAttributes = checked ? [attribute] : [];
      } else if (checked) {
        // Multiple selection (unlikely for attributes but keeping for consistency)
        if (currentAttributes.length < pick) {
          newAttributes = [...currentAttributes, attribute];
        } else {
          newAttributes = currentAttributes;
        }
      } else {
        newAttributes = currentAttributes.filter((a) => a !== attribute);
      }

      return { ...prev, attributes: newAttributes };
    });
  };

  const handleOptionSelection = (
    optionName: string,
    checked: boolean,
    pick: number
  ) => {
    setSelections((prev) => {
      const current = prev.chosenOption || [];
      let next: string[];

      if (pick === 1) {
        next = checked ? [optionName] : [];
      } else if (checked) {
        next = current.length < pick ? [...current, optionName] : current;
      } else {
        next = current.filter((o) => o !== optionName);
      }

      return { ...prev, chosenOption: next };
    });
  };

  const handleWeaponSelection = (weapon: string, instanceIndex: number) => {
    setSelections((prev) => {
      const currentWeapons = [...(prev.weapons || [])];
      // Pad with empty strings to reach the index, then assign.
      while (currentWeapons.length <= instanceIndex) {
        currentWeapons.push('');
      }
      currentWeapons[instanceIndex] = weapon;
      return { ...prev, weapons: currentWeapons };
    });
  };

  const handleFamiliarSelection = (
    familiar: string,
    checked: boolean,
    pick: number
  ) => {
    setSelections((prev) => {
      const currentFamiliars = prev.familiars || [];
      let newFamiliars: string[];

      if (pick === 1) {
        // Single selection - replace
        newFamiliars = checked ? [familiar] : [];
      } else if (checked) {
        // Multiple selection (keeping for consistency)
        if (currentFamiliars.length < pick) {
          newFamiliars = [...currentFamiliars, familiar];
        } else {
          newFamiliars = currentFamiliars;
        }
      } else {
        newFamiliars = currentFamiliars.filter((f) => f !== familiar);
      }

      return { ...prev, familiars: newFamiliars };
    });
  };

  const handleAnimalTotemSelection = (
    totem: string,
    checked: boolean,
    pick: number
  ) => {
    setSelections((prev) => {
      const currentTotems = prev.animalTotems || [];
      let newTotems: string[];

      if (pick === 1) {
        // Single selection - replace
        newTotems = checked ? [totem] : [];
      } else if (checked) {
        // Multiple selection (keeping for consistency)
        if (currentTotems.length < pick) {
          newTotems = [...currentTotems, totem];
        } else {
          newTotems = currentTotems;
        }
      } else {
        newTotems = currentTotems.filter((t) => t !== totem);
      }

      return { ...prev, animalTotems: newTotems };
    });
  };

  const handleConfirm = () => {
    const validation = validateSelections(
      effectiveRequirements,
      selections,
      sheet,
      supplements
    );

    if (validation.isValid) {
      onConfirm(selections);
      onClose();
    } else {
      setErrors(validation.errors);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRequirement = (requirement: any, index: number) => {
    const { type, label } = requirement;
    // Biblioteca Divina e similares: `requirement.pick` é só o piso (patamar
    // Iniciante) — a quantidade real escala com o patamar atual da ficha,
    // menos o que o histórico já concedeu (só oferece mais de uma perícia se
    // ainda não tiver escolhido nenhuma).
    const pick =
      type === 'learnSkill'
        ? resolveLearnSkillRemainingPick(
            requirement,
            getCurrentPlateau(sheet),
            sheet,
            requirements.powerName
          )
        : requirement.pick;
    const availableOptions = getFilteredAvailableOptions(
      requirement,
      sheet,
      supplements
    );

    // Alma Livre e Diferentão (Kobolds): escolher uma classe e um poder dela.
    // Não têm `availableOptions` — as listas são montadas pelo próprio campo —,
    // então precisa vir ANTES do early-return de "sem opções". Sem este caso o
    // diálogo abria sem seletor nenhum e o Confirmar era rejeitado pelo
    // `validateSelections`: o poder ficava impossível de adicionar pela ficha.
    if (type === 'almaLivreSelectClass') {
      const availableClasses = dataRegistry
        .getClassesBySupplements(supplements)
        .filter((c) => c.name !== sheet.classe.name);

      return (
        <Box
          key={index}
          sx={{
            mb: 2,
          }}
        >
          <Typography variant='h6' gutterBottom>
            {label}
          </Typography>
          <AlmaLivreSelectionField
            availableClasses={availableClasses}
            supplements={supplements}
            selections={selections}
            immediateClassPower={requirement.metadata?.immediateClassPower}
            sheet={sheet}
            onChange={(newSelections) => setSelections(newSelections)}
          />
        </Box>
      );
    }

    if (availableOptions.length === 0) {
      return (
        <Box
          key={index}
          sx={{
            mb: 2,
          }}
        >
          <Typography variant='h6' gutterBottom>
            {label}
          </Typography>
          <Alert severity='info'>
            Você já possui todas as opções disponíveis deste poder. Nenhuma
            seleção necessária.
          </Alert>
        </Box>
      );
    }

    const isSingleSelection = pick === 1;

    switch (type) {
      case 'learnSkill': {
        const selectedSkills = selections.skills || [];

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
            }}
          >
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
            <FormControl component='fieldset'>
              {isSingleSelection ? (
                <RadioGroup
                  value={selectedSkills[0] || ''}
                  onChange={(e) =>
                    handleSkillSelection(e.target.value, true, pick)
                  }
                >
                  {availableOptions.map((skill) => (
                    <FormControlLabel
                      key={skill}
                      value={skill}
                      control={<Radio />}
                      label={skill}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <FormGroup>
                  {availableOptions.map((skill) => (
                    <FormControlLabel
                      key={skill}
                      control={
                        <Checkbox
                          checked={selectedSkills.includes(skill)}
                          onChange={(e) =>
                            handleSkillSelection(skill, e.target.checked, pick)
                          }
                          disabled={
                            !selectedSkills.includes(skill) &&
                            selectedSkills.length >= pick
                          }
                        />
                      }
                      label={skill}
                    />
                  ))}
                </FormGroup>
              )}
            </FormControl>
          </Box>
        );
      }

      case 'addProficiency': {
        const selectedProfs = selections.proficiencies || [];

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
            }}
          >
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
            <FormControl component='fieldset'>
              {isSingleSelection ? (
                <RadioGroup
                  value={selectedProfs[0] || ''}
                  onChange={(e) =>
                    handleProficiencySelection(e.target.value, true, pick)
                  }
                >
                  {availableOptions.map((prof) => (
                    <FormControlLabel
                      key={prof}
                      value={prof}
                      control={<Radio />}
                      label={prof}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <FormGroup>
                  {availableOptions.map((prof) => (
                    <FormControlLabel
                      key={prof}
                      control={
                        <Checkbox
                          checked={selectedProfs.includes(prof)}
                          onChange={(e) =>
                            handleProficiencySelection(
                              prof,
                              e.target.checked,
                              pick
                            )
                          }
                          disabled={
                            !selectedProfs.includes(prof) &&
                            selectedProfs.length >= pick
                          }
                        />
                      }
                      label={prof}
                    />
                  ))}
                </FormGroup>
              )}
            </FormControl>
          </Box>
        );
      }

      // `getClassPower` (ex.: o ramo "poder de classe" do Cosmopolita e do
      // Citadino Abastado) compartilha a renderização: a resposta mora na mesma
      // chave `selections.powers`, e o `applyPower` casa por nome. Sem este
      // caso o `switch` caía no `default: return null` e o diálogo abria vazio.
      case 'getGeneralPower':
      case 'getClassPower': {
        const selectedPowers = selections.powers || [];
        // ClassPower guarda o texto em `text`, GeneralPower em `description`.
        const powerText = (power: { description?: string; text?: string }) =>
          power.description ?? power.text ?? '';

        // Piscinas por categoria (`availableTypes`) chegam com centenas de
        // poderes; sem busca a lista é inutilizável. O assistente de criação já
        // tem a dele.
        const query = normalizeSearch(searchByRequirement[index] ?? '');
        const shownOptions = query
          ? availableOptions.filter(
              (power) =>
                normalizeSearch(power.name).includes(query) ||
                normalizeSearch(powerText(power)).includes(query)
            )
          : availableOptions;

        const optionLabel = (power: {
          name: string;
          description?: string;
          text?: string;
        }) => (
          <Box>
            <Typography variant='body1'>{power.name}</Typography>
            {powerText(power) && (
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                }}
              >
                {powerText(power)}
              </Typography>
            )}
          </Box>
        );

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
            }}
          >
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
            {availableOptions.length > SEARCH_THRESHOLD && (
              <TextField
                fullWidth
                size='small'
                placeholder='Buscar poder...'
                value={searchByRequirement[index] ?? ''}
                onChange={(e) =>
                  setSearchByRequirement((prev) => ({
                    ...prev,
                    [index]: e.target.value,
                  }))
                }
                sx={{
                  mb: 1,
                }}
              />
            )}
            <FormControl component='fieldset'>
              {isSingleSelection ? (
                <RadioGroup
                  value={selectedPowers[0]?.name || ''}
                  onChange={(e) => {
                    const power = availableOptions.find(
                      (p) => p.name === e.target.value
                    );
                    if (power) handlePowerSelection(power, true, pick);
                  }}
                >
                  {shownOptions.map((power) => (
                    <FormControlLabel
                      key={power.name}
                      value={power.name}
                      control={<Radio />}
                      label={optionLabel(power)}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <FormGroup>
                  {shownOptions.map((power) => (
                    <FormControlLabel
                      key={power.name}
                      control={
                        <Checkbox
                          checked={selectedPowers.some(
                            (p) => p.name === power.name
                          )}
                          onChange={(e) =>
                            handlePowerSelection(power, e.target.checked, pick)
                          }
                          disabled={
                            !selectedPowers.some(
                              (p) => p.name === power.name
                            ) && selectedPowers.length >= pick
                          }
                        />
                      }
                      label={optionLabel(power)}
                    />
                  ))}
                </FormGroup>
              )}
            </FormControl>
          </Box>
        );
      }

      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle': {
        const selectedSpells = selections.spells || [];

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
            }}
          >
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
            <FormControl component='fieldset'>
              {isSingleSelection ? (
                <RadioGroup
                  value={selectedSpells[0]?.nome || ''}
                  onChange={(e) => {
                    const spell = availableOptions.find(
                      (s) => s.nome === e.target.value
                    );
                    if (spell) handleSpellSelection(spell, true, pick);
                  }}
                >
                  {availableOptions.map((spell) => (
                    <FormControlLabel
                      key={spell.nome}
                      value={spell.nome}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant='body1'>{spell.nome}</Typography>
                          {spell.descricao && (
                            <Typography
                              variant='body2'
                              sx={{
                                color: 'text.secondary',
                              }}
                            >
                              {spell.descricao}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              ) : (
                <FormGroup>
                  {availableOptions.map((spell) => (
                    <FormControlLabel
                      key={spell.nome}
                      control={
                        <Checkbox
                          checked={selectedSpells.some(
                            (s) => s.nome === spell.nome
                          )}
                          onChange={(e) =>
                            handleSpellSelection(spell, e.target.checked, pick)
                          }
                          disabled={
                            !selectedSpells.some(
                              (s) => s.nome === spell.nome
                            ) && selectedSpells.length >= pick
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography variant='body1'>{spell.nome}</Typography>
                          {spell.descricao && (
                            <Typography
                              variant='body2'
                              sx={{
                                color: 'text.secondary',
                              }}
                            >
                              {spell.descricao}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              )}
            </FormControl>
          </Box>
        );
      }

      case 'increaseAttribute': {
        const selectedAttributes = selections.attributes || [];

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
            }}
          >
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
            <FormControl component='fieldset'>
              <RadioGroup
                value={selectedAttributes[0] || ''}
                onChange={(e) =>
                  handleAttributeSelection(e.target.value, true, pick)
                }
              >
                {availableOptions.map((attribute) => (
                  <FormControlLabel
                    key={attribute}
                    value={attribute}
                    control={<Radio />}
                    label={attribute}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        );
      }

      case 'chooseFromOptions': {
        const selectedOptions = selections.chosenOption || [];
        const optionObjs = availableOptions as unknown as {
          name: string;
          text?: string;
        }[];

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
            }}
          >
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
            <FormControl component='fieldset'>
              {isSingleSelection ? (
                <RadioGroup
                  value={selectedOptions[0] || ''}
                  onChange={(e) =>
                    handleOptionSelection(e.target.value, true, pick)
                  }
                >
                  {optionObjs.map((opt) => (
                    <FormControlLabel
                      key={opt.name}
                      value={opt.name}
                      control={<Radio />}
                      label={opt.text ? `${opt.name} — ${opt.text}` : opt.name}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <FormGroup>
                  {optionObjs.map((opt) => (
                    <FormControlLabel
                      key={opt.name}
                      control={
                        <Checkbox
                          checked={selectedOptions.includes(opt.name)}
                          onChange={(e) =>
                            handleOptionSelection(
                              opt.name,
                              e.target.checked,
                              pick
                            )
                          }
                        />
                      }
                      label={opt.text ? `${opt.name} — ${opt.text}` : opt.name}
                    />
                  ))}
                </FormGroup>
              )}
            </FormControl>
          </Box>
        );
      }

      case 'selectWeaponSpecialization': {
        const selectedWeapons = selections.weapons || [];
        const isOptional = requirement.optional === true;
        const NONE_VALUE = '__none__';

        if (availableOptions.length === 0) {
          return (
            <Box
              key={index}
              sx={{
                mb: 2,
              }}
            >
              <Typography variant='h6' gutterBottom>
                {label}
              </Typography>
              <Alert severity='info'>
                Nenhuma arma na ficha. Adicione uma arma e abra novamente para
                escolher.
              </Alert>
            </Box>
          );
        }

        const renderOneInstance = (instanceIndex: number) => {
          const currentValue = selectedWeapons[instanceIndex] || '';
          const usedByOtherInstances = new Set(
            selectedWeapons.filter(
              (w, i) => i !== instanceIndex && w && w !== NONE_VALUE
            )
          );
          const optionsForThisInstance = availableOptions.filter(
            (weapon) =>
              weapon === currentValue || !usedByOtherInstances.has(weapon)
          );
          const headerLabel =
            instances > 1 ? `Arma ${instanceIndex + 1}` : label;
          return (
            <Box
              key={`weapon-instance-${instanceIndex}`}
              sx={{
                mb: 2,
              }}
            >
              <Typography variant='h6' gutterBottom>
                {headerLabel}
              </Typography>
              <FormControl component='fieldset'>
                <RadioGroup
                  value={currentValue || (isOptional ? NONE_VALUE : '')}
                  onChange={(e) => {
                    const value =
                      e.target.value === NONE_VALUE ? '' : e.target.value;
                    handleWeaponSelection(value, instanceIndex);
                  }}
                >
                  {isOptional && (
                    <FormControlLabel
                      value={NONE_VALUE}
                      control={<Radio />}
                      label='Nenhuma arma'
                    />
                  )}
                  {optionsForThisInstance.map((weapon) => (
                    <FormControlLabel
                      key={weapon}
                      value={weapon}
                      control={<Radio />}
                      label={weapon}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          );
        };

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
            }}
          >
            {instances > 1 && (
              <Typography variant='subtitle2' gutterBottom>
                {label}
              </Typography>
            )}
            {Array.from({ length: instances }, (_, i) => renderOneInstance(i))}
          </Box>
        );
      }

      case 'selectFamiliar': {
        const selectedFamiliars = selections.familiars || [];

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
            }}
          >
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
            <FormControl component='fieldset'>
              <RadioGroup
                value={selectedFamiliars[0] || ''}
                onChange={(e) =>
                  handleFamiliarSelection(e.target.value, true, pick)
                }
              >
                {availableOptions.map((familiarKey) => {
                  const familiar = FAMILIARS[familiarKey];
                  return (
                    <FormControlLabel
                      key={familiarKey}
                      value={familiarKey}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant='subtitle2'>
                            {familiar.name}
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: 'text.secondary',
                            }}
                          >
                            {familiar.description}
                          </Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          </Box>
        );
      }

      case 'selectAnimalTotem': {
        const selectedTotems = selections.animalTotems || [];

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
            }}
          >
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
            <FormControl component='fieldset'>
              <RadioGroup
                value={selectedTotems[0] || ''}
                onChange={(e) =>
                  handleAnimalTotemSelection(e.target.value, true, pick)
                }
              >
                {availableOptions.map((totemKey) => {
                  const totem = ANIMAL_TOTEMS[totemKey];
                  return (
                    <FormControlLabel
                      key={totemKey}
                      value={totemKey}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant='subtitle2'>
                            {totem.name}
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: 'text.secondary',
                            }}
                          >
                            {totem.description}
                          </Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Seleções para {requirements.powerName}</DialogTitle>
      <DialogContent>
        <Typography
          variant='body1'
          gutterBottom
          sx={{
            color: 'text.secondary',
          }}
        >
          Este poder requer que você faça algumas seleções manuais.
        </Typography>

        {errors.length > 0 && (
          <Alert severity='error' sx={{ mb: 2 }}>
            <Typography variant='subtitle2'>Erros de validação:</Typography>
            <ul style={{ margin: 0, paddingLeft: '1.5em' }}>
              {errors.map((error) => (
                <li key={`error-${error.substring(0, 30)}`}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {effectiveRequirements.requirements.map((requirement, index) => (
          <React.Fragment
            key={`${requirement.type}-${requirement.pick}-${requirement.label}`}
          >
            {renderRequirement(requirement, index)}
            {index < requirements.requirements.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </React.Fragment>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} color='primary' variant='contained'>
          Confirmar Seleções
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PowerSelectionDialog;
