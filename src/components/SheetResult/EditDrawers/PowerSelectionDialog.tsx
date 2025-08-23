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
} from '@mui/material';
import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  PowerSelectionRequirements,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import {
  getFilteredAvailableOptions,
  validateSelections,
} from '@/functions/powers/manualPowerSelection';
import { FAMILIARS } from '@/data/familiars';

interface PowerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selections: SelectionOptions) => void;
  requirements: PowerSelectionRequirements;
  sheet: CharacterSheet;
}

const PowerSelectionDialog: React.FC<PowerSelectionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  requirements,
  sheet,
}) => {
  const [selections, setSelections] = useState<SelectionOptions>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Reset selections when dialog opens/closes or requirements change
  useEffect(() => {
    if (open) {
      setSelections({});
      setErrors([]);
    }
  }, [open, requirements.powerName]);

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

  const handleWeaponSelection = (
    weapon: string,
    checked: boolean,
    pick: number
  ) => {
    setSelections((prev) => {
      const currentWeapons = prev.weapons || [];
      let newWeapons: string[];

      if (pick === 1) {
        // Single selection - replace (weapons are always single selection for specialization)
        newWeapons = checked ? [weapon] : [];
      } else if (checked) {
        // Multiple selection (keeping for consistency)
        if (currentWeapons.length < pick) {
          newWeapons = [...currentWeapons, weapon];
        } else {
          newWeapons = currentWeapons;
        }
      } else {
        newWeapons = currentWeapons.filter((w) => w !== weapon);
      }

      return { ...prev, weapons: newWeapons };
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

  const handleConfirm = () => {
    const validation = validateSelections(requirements, selections, sheet);

    if (validation.isValid) {
      onConfirm(selections);
      onClose();
    } else {
      setErrors(validation.errors);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRequirement = (requirement: any, index: number) => {
    const { type, pick, label } = requirement;
    const availableOptions = getFilteredAvailableOptions(requirement, sheet);

    if (availableOptions.length === 0) {
      return (
        <Box key={index} mb={2}>
          <Typography variant='h6' gutterBottom>
            {label}
          </Typography>
          <Alert severity='warning'>
            Nenhuma opção disponível para seleção.
          </Alert>
        </Box>
      );
    }

    const isSingleSelection = pick === 1;

    switch (type) {
      case 'learnSkill': {
        const selectedSkills = selections.skills || [];

        return (
          <Box key={index} mb={2}>
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
          <Box key={index} mb={2}>
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

      case 'getGeneralPower': {
        const selectedPowers = selections.powers || [];

        return (
          <Box key={index} mb={2}>
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
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
                  {availableOptions.map((power) => (
                    <FormControlLabel
                      key={power.name}
                      value={power.name}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant='body1'>{power.name}</Typography>
                          {power.description && (
                            <Typography variant='body2' color='text.secondary'>
                              {power.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              ) : (
                <FormGroup>
                  {availableOptions.map((power) => (
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
                      label={
                        <Box>
                          <Typography variant='body1'>{power.name}</Typography>
                          {power.description && (
                            <Typography variant='body2' color='text.secondary'>
                              {power.description}
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

      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle': {
        const selectedSpells = selections.spells || [];

        return (
          <Box key={index} mb={2}>
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
                            <Typography variant='body2' color='text.secondary'>
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
                            <Typography variant='body2' color='text.secondary'>
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
          <Box key={index} mb={2}>
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

      case 'selectWeaponSpecialization': {
        const selectedWeapons = selections.weapons || [];

        return (
          <Box key={index} mb={2}>
            <Typography variant='h6' gutterBottom>
              {label}
            </Typography>
            <FormControl component='fieldset'>
              <RadioGroup
                value={selectedWeapons[0] || ''}
                onChange={(e) =>
                  handleWeaponSelection(e.target.value, true, pick)
                }
              >
                {availableOptions.map((weapon) => (
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
      }

      case 'selectFamiliar': {
        const selectedFamiliars = selections.familiars || [];

        return (
          <Box key={index} mb={2}>
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
                          <Typography variant='body2' color='text.secondary'>
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

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Seleções para {requirements.powerName}</DialogTitle>
      <DialogContent>
        <Typography variant='body1' color='text.secondary' gutterBottom>
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

        {requirements.requirements.map((requirement, index) => (
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
