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
} from '@mui/material';
import {
  GOLEM_DESPERTO_CHASSIS,
  GOLEM_DESPERTO_CHASSIS_NAMES,
  GOLEM_DESPERTO_ENERGY_SOURCES,
  GOLEM_DESPERTO_SIZES,
  GOLEM_DESPERTO_SIZE_NAMES,
  getCompatibleEnergySources,
} from '../../data/systems/tormenta20/ameacas-de-arton/races/golem-desperto-config';

interface GolemDespertoCustomizationModalProps {
  open: boolean;
  initialChassis: string;
  initialEnergySource: string;
  initialSize: string;
  onConfirm: (chassis: string, energySource: string, size: string) => void;
  onCancel: () => void;
}

const GolemDespertoCustomizationModal: React.FC<
  GolemDespertoCustomizationModalProps
> = ({
  open,
  initialChassis,
  initialEnergySource,
  initialSize,
  onConfirm,
  onCancel,
}) => {
  const [chassisId, setChassisId] = useState(initialChassis);
  const [energySourceId, setEnergySourceId] = useState(initialEnergySource);
  const [sizeId, setSizeId] = useState(initialSize);
  const [compatibleEnergySources, setCompatibleEnergySources] = useState<
    string[]
  >([]);

  // Update compatible energy sources when chassis changes
  useEffect(() => {
    const compatible = getCompatibleEnergySources(chassisId);
    setCompatibleEnergySources(compatible);

    // If current energy source is not compatible, select first compatible one
    if (!compatible.includes(energySourceId) && compatible.length > 0) {
      setEnergySourceId(compatible[0]);
    }
  }, [chassisId, energySourceId]);

  // Reset to initial values when modal opens
  useEffect(() => {
    if (open) {
      setChassisId(initialChassis);
      setEnergySourceId(initialEnergySource);
      setSizeId(initialSize);
    }
  }, [open, initialChassis, initialEnergySource, initialSize]);

  const handleConfirm = () => {
    onConfirm(chassisId, energySourceId, sizeId);
  };

  const chassisConfig = GOLEM_DESPERTO_CHASSIS[chassisId];
  const energyConfig = GOLEM_DESPERTO_ENERGY_SOURCES[energySourceId];
  const sizeConfig = GOLEM_DESPERTO_SIZES[sizeId];

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
          Customização do Golem Desperto
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          Escolha o chassi, fonte de energia e tamanho do seu golem
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Chassi Selection */}
          <FormControl fullWidth>
            <InputLabel id='chassis-label'>Chassi</InputLabel>
            <Select
              labelId='chassis-label'
              id='chassis-select'
              value={chassisId}
              label='Chassi'
              onChange={(e) => setChassisId(e.target.value)}
            >
              {GOLEM_DESPERTO_CHASSIS_NAMES.map((id) => {
                const chassis = GOLEM_DESPERTO_CHASSIS[id];
                return (
                  <MenuItem key={id} value={id}>
                    {chassis.name}
                  </MenuItem>
                );
              })}
            </Select>
            {chassisConfig && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Typography variant='body2' color='text.secondary'>
                  {chassisConfig.chassiAbility.description}
                </Typography>
              </Box>
            )}
          </FormControl>

          {/* Fonte de Energia Selection */}
          <FormControl fullWidth>
            <InputLabel id='energy-label'>Fonte de Energia</InputLabel>
            <Select
              labelId='energy-label'
              id='energy-select'
              value={energySourceId}
              label='Fonte de Energia'
              onChange={(e) => setEnergySourceId(e.target.value)}
            >
              {compatibleEnergySources.map((id) => {
                const energy = GOLEM_DESPERTO_ENERGY_SOURCES[id];
                return (
                  <MenuItem key={id} value={id}>
                    {energy.displayName}
                  </MenuItem>
                );
              })}
            </Select>
            {energyConfig && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Typography variant='body2' color='text.secondary'>
                  {energyConfig.ability.description}
                </Typography>
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
              {GOLEM_DESPERTO_SIZE_NAMES.map((id) => {
                const size = GOLEM_DESPERTO_SIZES[id];
                return (
                  <MenuItem key={id} value={id}>
                    {size.displayName}
                  </MenuItem>
                );
              })}
            </Select>
            {sizeConfig && sizeConfig.attributes.length > 0 && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Typography variant='body2' color='text.secondary'>
                  Modificador de atributo:{' '}
                  {sizeConfig.attributes
                    .map(
                      (attr) =>
                        `${attr.attr} ${attr.mod > 0 ? '+' : ''}${attr.mod}`
                    )
                    .join(', ')}
                </Typography>
              </Box>
            )}
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} color='inherit'>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} variant='contained' color='primary'>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GolemDespertoCustomizationModal;
