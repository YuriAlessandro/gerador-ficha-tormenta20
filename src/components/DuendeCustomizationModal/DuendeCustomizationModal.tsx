import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Checkbox,
  ListItemText,
  Chip,
  OutlinedInput,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Skill from '../../interfaces/Skills';
import {
  DUENDE_NATURES,
  DUENDE_NATURE_NAMES,
  DUENDE_SIZES,
  DUENDE_SIZE_NAMES,
  DUENDE_PRESENTES,
  DUENDE_PRESENTE_NAMES,
  DUENDE_TABU_SKILLS,
} from '../../data/systems/tormenta20/herois-de-arton/races/duende-config';

interface DuendeCustomizationModalProps {
  open: boolean;
  initialNature: string;
  initialSize: string;
  initialBonusAttributes: Atributo[];
  initialPresentes: string[];
  initialTabuSkill: Skill;
  onConfirm: (
    nature: string,
    size: string,
    bonusAttributes: Atributo[],
    presentes: string[],
    tabuSkill: Skill
  ) => void;
  onCancel: () => void;
}

const ATTRIBUTE_LABELS: Record<Atributo, string> = {
  [Atributo.FORCA]: 'Força',
  [Atributo.DESTREZA]: 'Destreza',
  [Atributo.CONSTITUICAO]: 'Constituição',
  [Atributo.INTELIGENCIA]: 'Inteligência',
  [Atributo.SABEDORIA]: 'Sabedoria',
  [Atributo.CARISMA]: 'Carisma',
};

const DuendeCustomizationModal: React.FC<DuendeCustomizationModalProps> = ({
  open,
  initialNature,
  initialSize,
  initialBonusAttributes,
  initialPresentes,
  initialTabuSkill,
  onConfirm,
  onCancel,
}) => {
  const [natureId, setNatureId] = useState(initialNature);
  const [sizeId, setSizeId] = useState(initialSize);
  const [bonusAttr1, setBonusAttr1] = useState<Atributo>(
    initialBonusAttributes[0] || Atributo.FORCA
  );
  const [bonusAttr2, setBonusAttr2] = useState<Atributo>(
    initialBonusAttributes[1] || Atributo.DESTREZA
  );
  const [bonusAttr3, setBonusAttr3] = useState<Atributo>(
    initialBonusAttributes[2] || Atributo.CONSTITUICAO
  );
  const [selectedPresentes, setSelectedPresentes] =
    useState<string[]>(initialPresentes);
  const [tabuSkill, setTabuSkill] = useState<Skill>(initialTabuSkill);

  const isAnimal = natureId === 'animal';

  // Reset to initial values when modal opens
  useEffect(() => {
    if (open) {
      setNatureId(initialNature);
      setSizeId(initialSize);
      setBonusAttr1(initialBonusAttributes[0] || Atributo.FORCA);
      setBonusAttr2(initialBonusAttributes[1] || Atributo.DESTREZA);
      setBonusAttr3(initialBonusAttributes[2] || Atributo.CONSTITUICAO);
      setSelectedPresentes(initialPresentes);
      setTabuSkill(initialTabuSkill);
    }
  }, [
    open,
    initialNature,
    initialSize,
    initialBonusAttributes,
    initialPresentes,
    initialTabuSkill,
  ]);

  const handlePresentesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    // Limit to 3 selections
    if (value.length <= 3) {
      setSelectedPresentes(value);
    }
  };

  const handleConfirm = () => {
    const bonusAttributes: Atributo[] = isAnimal
      ? [bonusAttr1, bonusAttr2, bonusAttr3]
      : [bonusAttr1, bonusAttr2];
    onConfirm(natureId, sizeId, bonusAttributes, selectedPresentes, tabuSkill);
  };

  const natureConfig = DUENDE_NATURES[natureId];
  const sizeConfig = DUENDE_SIZES[sizeId];

  const allAttributes = Object.values(Atributo);

  // Calculate if attributes are valid
  const attributesValid = isAnimal
    ? true // Animal can have duplicates
    : bonusAttr1 !== bonusAttr2; // Others must be different

  const presentesValid = selectedPresentes.length === 3;

  const canConfirm = attributesValid && presentesValid;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant='h5' component='div' fontWeight='bold'>
          Customização do Duende
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          Escolha a natureza, tamanho, dons, presentes e tabu do seu duende
        </Typography>
        <Chip
          label='Heróis de Arton'
          size='small'
          color='secondary'
          sx={{ mt: 1 }}
        />
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Natureza Selection */}
          <FormControl fullWidth>
            <InputLabel id='nature-label'>Natureza</InputLabel>
            <Select
              labelId='nature-label'
              id='nature-select'
              value={natureId}
              label='Natureza'
              onChange={(e) => setNatureId(e.target.value)}
            >
              {DUENDE_NATURE_NAMES.map((id) => {
                const nature = DUENDE_NATURES[id];
                return (
                  <MenuItem key={id} value={id}>
                    {nature.displayName}
                  </MenuItem>
                );
              })}
            </Select>
            {natureConfig && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                {natureConfig.abilities.map((ability) => (
                  <Box key={ability.name} sx={{ mb: 1 }}>
                    <Typography
                      variant='subtitle2'
                      fontWeight='bold'
                      color='primary'
                    >
                      {ability.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {ability.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </FormControl>

          {/* Tamanho Selection */}
          <FormControl fullWidth>
            <InputLabel id='size-label'>Tamanho</InputLabel>
            <Select
              labelId='size-label'
              id='size-select'
              value={sizeId}
              label='Tamanho'
              onChange={(e) => setSizeId(e.target.value)}
            >
              {DUENDE_SIZE_NAMES.map((id) => {
                const size = DUENDE_SIZES[id];
                return (
                  <MenuItem key={id} value={id}>
                    {size.displayName}
                  </MenuItem>
                );
              })}
            </Select>
            {sizeConfig && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Typography variant='body2' color='text.secondary'>
                  Deslocamento: {sizeConfig.displacement}m
                  {sizeConfig.attributeModifiers &&
                    sizeConfig.attributeModifiers.length > 0 && (
                      <>
                        {' • '}
                        {sizeConfig.attributeModifiers
                          .map(
                            (attr) =>
                              `${ATTRIBUTE_LABELS[attr.attr as Atributo]} ${
                                attr.mod > 0 ? '+' : ''
                              }${attr.mod}`
                          )
                          .join(', ')}
                      </>
                    )}
                </Typography>
              </Box>
            )}
          </FormControl>

          {/* Dons - Atributos */}
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              Dons (+1 em {isAnimal ? 'três' : 'dois'} atributos
              {isAnimal ? ', pode repetir' : ' diferentes'})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id='attr1-label'>Atributo 1</InputLabel>
                <Select
                  labelId='attr1-label'
                  value={bonusAttr1}
                  label='Atributo 1'
                  onChange={(e) => setBonusAttr1(e.target.value as Atributo)}
                >
                  {allAttributes.map((attr) => (
                    <MenuItem key={attr} value={attr}>
                      {ATTRIBUTE_LABELS[attr]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                sx={{ minWidth: 150 }}
                error={!isAnimal && bonusAttr1 === bonusAttr2}
              >
                <InputLabel id='attr2-label'>Atributo 2</InputLabel>
                <Select
                  labelId='attr2-label'
                  value={bonusAttr2}
                  label='Atributo 2'
                  onChange={(e) => setBonusAttr2(e.target.value as Atributo)}
                >
                  {allAttributes.map((attr) => (
                    <MenuItem key={attr} value={attr}>
                      {ATTRIBUTE_LABELS[attr]}
                    </MenuItem>
                  ))}
                </Select>
                {!isAnimal && bonusAttr1 === bonusAttr2 && (
                  <FormHelperText>Deve ser diferente</FormHelperText>
                )}
              </FormControl>

              {isAnimal && (
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id='attr3-label'>Atributo 3 (Animal)</InputLabel>
                  <Select
                    labelId='attr3-label'
                    value={bonusAttr3}
                    label='Atributo 3 (Animal)'
                    onChange={(e) => setBonusAttr3(e.target.value as Atributo)}
                  >
                    {allAttributes.map((attr) => (
                      <MenuItem key={attr} value={attr}>
                        {ATTRIBUTE_LABELS[attr]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>

          {/* Presentes Selection */}
          <FormControl fullWidth error={!presentesValid}>
            <InputLabel id='presentes-label'>
              Presentes de Magia e de Caos (escolha 3)
            </InputLabel>
            <Select
              labelId='presentes-label'
              id='presentes-select'
              multiple
              value={selectedPresentes}
              onChange={handlePresentesChange}
              input={
                <OutlinedInput label='Presentes de Magia e de Caos (escolha 3)' />
              }
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={DUENDE_PRESENTES[value]?.ability.name || value}
                      size='small'
                    />
                  ))}
                </Box>
              )}
            >
              {DUENDE_PRESENTE_NAMES.map((id) => {
                const presente = DUENDE_PRESENTES[id];
                return (
                  <MenuItem
                    key={id}
                    value={id}
                    disabled={
                      selectedPresentes.length >= 3 &&
                      !selectedPresentes.includes(id)
                    }
                  >
                    <Checkbox checked={selectedPresentes.includes(id)} />
                    <ListItemText primary={presente.ability.name} />
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>
              {selectedPresentes.length}/3 selecionados
            </FormHelperText>
          </FormControl>

          {/* Show selected presentes descriptions */}
          {selectedPresentes.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              {selectedPresentes.map((id) => {
                const presente = DUENDE_PRESENTES[id];
                if (!presente) return null;
                return (
                  <Box key={id} sx={{ mb: 1 }}>
                    <Typography
                      variant='subtitle2'
                      fontWeight='bold'
                      color='primary'
                    >
                      {presente.ability.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {presente.ability.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Tabu Selection */}
          <FormControl fullWidth>
            <InputLabel id='tabu-label'>Tabu (-5 em perícia)</InputLabel>
            <Select
              labelId='tabu-label'
              id='tabu-select'
              value={tabuSkill}
              label='Tabu (-5 em perícia)'
              onChange={(e) => setTabuSkill(e.target.value as Skill)}
            >
              {DUENDE_TABU_SKILLS.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </Select>
            <Box
              sx={{
                mt: 1,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              <Typography variant='body2' color='text.secondary'>
                Você possui um tabu — algo que nunca pode fazer (ou deixar de
                fazer). Se desrespeitar, fica fatigado por um dia. Se continuar
                desrespeitando: exausto no 2º dia, morte no 3º dia.
              </Typography>
            </Box>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} color='inherit'>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          color='primary'
          disabled={!canConfirm}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DuendeCustomizationModal;
