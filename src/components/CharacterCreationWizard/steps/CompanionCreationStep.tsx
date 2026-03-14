import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Checkbox,
  Chip,
  Divider,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import Skill from '@/interfaces/Skills';
import {
  CompanionType,
  CompanionSize,
  CompanionTrick,
  NaturalWeaponDamageType,
  SpiritEnergyType,
} from '@/interfaces/Companion';
import { COMPANION_TYPES } from '@/data/systems/tormenta20/herois-de-arton/companion/companionTypes';
import {
  COMPANION_AVAILABLE_SKILLS,
  COMPANION_SIZES,
  COMPANION_WEAPON_DAMAGE_TYPES,
  getAvailableTricks,
} from '@/data/systems/tormenta20/herois-de-arton/companion';
import { CompanionTrickDefinition } from '@/data/systems/tormenta20/herois-de-arton/companion/companionTricks';

interface CompanionCreationStepProps {
  companionName?: string;
  companionType?: CompanionType;
  companionSize?: CompanionSize;
  companionWeaponDamageType?: NaturalWeaponDamageType;
  companionSpiritEnergyType?: SpiritEnergyType;
  companionSkills: Skill[];
  companionTricks: CompanionTrick[];
  onNameChange: (name: string) => void;
  onTypeChange: (type: CompanionType) => void;
  onSizeChange: (size: CompanionSize) => void;
  onWeaponDamageTypeChange: (damageType: NaturalWeaponDamageType) => void;
  onSpiritEnergyTypeChange: (energyType: SpiritEnergyType) => void;
  onSkillsChange: (skills: Skill[]) => void;
  onTricksChange: (tricks: CompanionTrick[]) => void;
}

const CompanionCreationStep: React.FC<CompanionCreationStepProps> = ({
  companionName,
  companionType,
  companionSize,
  companionWeaponDamageType,
  companionSpiritEnergyType,
  companionSkills,
  companionTricks,
  onNameChange,
  onTypeChange,
  onSizeChange,
  onWeaponDamageTypeChange,
  onSpiritEnergyTypeChange,
  onSkillsChange,
  onTricksChange,
}) => {
  const naturalWeaponCount = useMemo(() => {
    let count = 1;
    if (companionType === 'Monstro') count = 2;
    count += companionTricks.filter(
      (t) => t.name === 'Arma Natural Adicional'
    ).length;
    return count;
  }, [companionType, companionTricks]);

  const availableTricks: CompanionTrickDefinition[] = useMemo(() => {
    if (!companionType || !companionSize) return [];
    return getAvailableTricks(
      1,
      companionType,
      companionSize,
      companionTricks,
      naturalWeaponCount,
      true
    );
  }, [companionType, companionSize, companionTricks, naturalWeaponCount]);

  const handleToggleSkill = (skill: Skill) => {
    if (companionSkills.includes(skill)) {
      onSkillsChange(companionSkills.filter((s) => s !== skill));
    } else if (companionSkills.length < 3) {
      onSkillsChange([...companionSkills, skill]);
    }
  };

  const handleToggleTrick = (trick: CompanionTrickDefinition) => {
    const existing = companionTricks.find((t) => t.name === trick.name);
    if (existing) {
      onTricksChange(companionTricks.filter((t) => t.name !== trick.name));
    } else if (companionTricks.length < 2) {
      onTricksChange([...companionTricks, { name: trick.name }]);
    }
  };

  const handleTypeChange = (newType: CompanionType) => {
    onTypeChange(newType);
    // Limpar truques ao mudar tipo (pré-requisitos podem mudar)
    onTricksChange([]);
  };

  const handleSizeChange = (newSize: CompanionSize) => {
    onSizeChange(newSize);
    // Limpar truques ao mudar tamanho (pré-requisitos podem mudar)
    onTricksChange([]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Configure o Melhor Amigo do seu Treinador:
      </Typography>

      {/* Nome (opcional) */}
      <Box>
        <Typography variant='subtitle2' fontWeight='bold' sx={{ mb: 1 }}>
          Nome do Parceiro (opcional)
        </Typography>
        <TextField
          size='small'
          fullWidth
          placeholder='Ex: Rex, Sombra, Faísca...'
          value={companionName || ''}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </Box>

      <Divider />

      {/* Tipo */}
      <Box>
        <Typography variant='subtitle2' fontWeight='bold' sx={{ mb: 1 }}>
          Tipo do Parceiro
        </Typography>
        <RadioGroup
          value={companionType || ''}
          onChange={(e) => handleTypeChange(e.target.value as CompanionType)}
        >
          {COMPANION_TYPES.map((typeDef) => (
            <FormControlLabel
              key={typeDef.name}
              value={typeDef.name}
              control={<Radio size='small' />}
              label={
                <Box>
                  <Typography variant='body2' fontWeight='bold'>
                    {typeDef.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {typeDef.description}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mb: 1 }}
            />
          ))}
        </RadioGroup>
      </Box>

      <Divider />

      {/* Tamanho */}
      <Box>
        <Typography variant='subtitle2' fontWeight='bold' sx={{ mb: 1 }}>
          Tamanho
        </Typography>
        <RadioGroup
          row
          value={companionSize || ''}
          onChange={(e) => handleSizeChange(e.target.value as CompanionSize)}
        >
          {COMPANION_SIZES.map((size) => (
            <FormControlLabel
              key={size}
              value={size}
              control={<Radio size='small' />}
              label={size}
            />
          ))}
        </RadioGroup>
      </Box>

      <Divider />

      {/* Tipo de dano da arma natural */}
      <Box>
        <Typography variant='subtitle2' fontWeight='bold' sx={{ mb: 1 }}>
          Tipo de Dano da Arma Natural
        </Typography>
        <RadioGroup
          row
          value={companionWeaponDamageType || ''}
          onChange={(e) =>
            onWeaponDamageTypeChange(e.target.value as NaturalWeaponDamageType)
          }
        >
          {COMPANION_WEAPON_DAMAGE_TYPES.map((dt) => (
            <FormControlLabel
              key={dt}
              value={dt}
              control={<Radio size='small' />}
              label={dt}
            />
          ))}
        </RadioGroup>
      </Box>

      {/* Energia Espiritual (só para Espírito) */}
      {companionType === 'Espírito' && (
        <>
          <Divider />
          <Box>
            <Typography variant='subtitle2' fontWeight='bold' sx={{ mb: 1 }}>
              Tipo de Energia Espiritual
            </Typography>
            <RadioGroup
              row
              value={companionSpiritEnergyType || ''}
              onChange={(e) =>
                onSpiritEnergyTypeChange(e.target.value as SpiritEnergyType)
              }
            >
              <FormControlLabel
                value='Positiva'
                control={<Radio size='small' />}
                label='Positiva (+2 em perícias de Sabedoria)'
              />
              <FormControlLabel
                value='Negativa'
                control={<Radio size='small' />}
                label='Negativa (+2 em perícias de Carisma)'
              />
            </RadioGroup>
          </Box>
        </>
      )}

      <Divider />

      {/* Perícias */}
      <Box>
        <Typography variant='subtitle2' fontWeight='bold' sx={{ mb: 1 }}>
          Perícias Treinadas (escolha 3)
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Selecionadas: {companionSkills.length} / 3
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {COMPANION_AVAILABLE_SKILLS.map((skill) => {
            const isSelected = companionSkills.includes(skill);
            const isDisabled = !isSelected && companionSkills.length >= 3;
            return (
              <Chip
                key={skill}
                label={skill}
                size='small'
                variant={isSelected ? 'filled' : 'outlined'}
                color={isSelected ? 'primary' : 'default'}
                onClick={() => handleToggleSkill(skill)}
                disabled={isDisabled}
                sx={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  '&:hover': {
                    backgroundColor: (() => {
                      if (isSelected) return 'primary.dark';
                      if (isDisabled) return undefined;
                      return 'rgba(209, 50, 53, 0.08)';
                    })(),
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      <Divider />

      {/* Truques */}
      <Box>
        <Typography variant='subtitle2' fontWeight='bold' sx={{ mb: 1 }}>
          Truques Iniciais (escolha 2)
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Selecionados: {companionTricks.length} / 2
        </Typography>
        {companionType && companionSize ? (
          <Box sx={{ mt: 1 }}>
            {availableTricks.map((trick) => {
              const isSelected = companionTricks.some(
                (t) => t.name === trick.name
              );
              const isDisabled = !isSelected && companionTricks.length >= 2;
              return (
                <Box key={trick.name} sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleTrick(trick)}
                        disabled={isDisabled}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='subtitle1'>
                          {trick.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {trick.text}
                        </Typography>
                      </Box>
                    }
                    sx={{ alignItems: 'flex-start' }}
                  />
                </Box>
              );
            })}
          </Box>
        ) : (
          <Alert severity='info' sx={{ mt: 1 }}>
            Selecione o tipo e tamanho do parceiro para ver os truques
            disponíveis.
          </Alert>
        )}
      </Box>

      {/* Validação */}
      {companionType &&
        companionSize &&
        companionWeaponDamageType &&
        companionSkills.length === 3 &&
        companionTricks.length === 2 &&
        (companionType !== 'Espírito' || companionSpiritEnergyType) && (
          <Alert severity='success'>
            Melhor Amigo configurado com sucesso! Você pode continuar para o
            próximo passo.
          </Alert>
        )}
    </Box>
  );
};

export default CompanionCreationStep;
