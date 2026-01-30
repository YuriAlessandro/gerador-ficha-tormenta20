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
  Chip,
  Stack,
} from '@mui/material';
import {
  MOREAU_HERITAGES,
  MOREAU_HERITAGE_NAMES,
  MoreauHeritageName,
} from '../../data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import { Atributo } from '../../data/systems/tormenta20/atributos';

const ATRIBUTOS = Object.values(Atributo);

interface MoreauCustomizationModalProps {
  open: boolean;
  initialHeritage: string;
  initialBonusAttributes: Atributo[];
  onConfirm: (heritage: string, bonusAttributes: Atributo[]) => void;
  onCancel: () => void;
}

const MoreauCustomizationModal: React.FC<MoreauCustomizationModalProps> = ({
  open,
  initialHeritage,
  initialBonusAttributes,
  onConfirm,
  onCancel,
}) => {
  const [heritageId, setHeritageId] = useState(initialHeritage);
  const [bonusAttr1, setBonusAttr1] = useState<Atributo | ''>(
    initialBonusAttributes[0] || ''
  );
  const [bonusAttr2, setBonusAttr2] = useState<Atributo | ''>(
    initialBonusAttributes[1] || ''
  );

  // Reset to initial values when modal opens
  useEffect(() => {
    if (open) {
      setHeritageId(initialHeritage);
      setBonusAttr1(initialBonusAttributes[0] || '');
      setBonusAttr2(initialBonusAttributes[1] || '');
    }
  }, [open, initialHeritage, initialBonusAttributes]);

  const handleConfirm = () => {
    const bonusAttrs: Atributo[] = [];
    if (bonusAttr1) bonusAttrs.push(bonusAttr1);
    if (bonusAttr2) bonusAttrs.push(bonusAttr2);
    onConfirm(heritageId, bonusAttrs);
  };

  const heritage = MOREAU_HERITAGES[heritageId as MoreauHeritageName];

  // Get the fixed attribute from the heritage (non-'any')
  const fixedAttr = heritage?.attributes.find((a) => a.attr !== 'any');

  // Check if form is valid (heritage selected and 2 bonus attributes)
  const isValid = heritageId && bonusAttr1 && bonusAttr2;

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
          Customização do Moreau
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          Escolha a herança do seu moreau e os atributos de bônus
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Heritage Selection */}
          <FormControl fullWidth>
            <InputLabel id='heritage-label'>Herança</InputLabel>
            <Select
              labelId='heritage-label'
              id='heritage-select'
              value={heritageId}
              label='Herança'
              onChange={(e) => setHeritageId(e.target.value)}
            >
              {MOREAU_HERITAGE_NAMES.map((id) => {
                const h = MOREAU_HERITAGES[id];
                return (
                  <MenuItem key={id} value={id}>
                    {h.name}
                  </MenuItem>
                );
              })}
            </Select>
            {heritage && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant='subtitle2'
                  fontWeight='bold'
                  sx={{ mb: 1 }}
                >
                  Habilidades:
                </Typography>
                <Stack spacing={1}>
                  {heritage.abilities.map((ability) => (
                    <Box key={ability.name}>
                      <Typography
                        variant='body2'
                        fontWeight='bold'
                        component='span'
                      >
                        {ability.name}:
                      </Typography>{' '}
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        component='span'
                      >
                        {ability.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                {fixedAttr && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='subtitle2' fontWeight='bold'>
                      Atributo Fixo:{' '}
                      <Chip
                        label={`+1 ${fixedAttr.attr}`}
                        size='small'
                        color='primary'
                      />
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </FormControl>

          {/* Bonus Attributes Selection */}
          <Typography variant='subtitle1' fontWeight='bold'>
            Atributos de Bônus (+1 cada)
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: -2 }}>
            Escolha dois atributos para receber +1 (podem ser iguais)
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id='attr1-label'>Primeiro Atributo</InputLabel>
              <Select
                labelId='attr1-label'
                id='attr1-select'
                value={bonusAttr1}
                label='Primeiro Atributo'
                onChange={(e) => setBonusAttr1(e.target.value as Atributo)}
              >
                {ATRIBUTOS.map((attr) => (
                  <MenuItem key={attr} value={attr}>
                    {attr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id='attr2-label'>Segundo Atributo</InputLabel>
              <Select
                labelId='attr2-label'
                id='attr2-select'
                value={bonusAttr2}
                label='Segundo Atributo'
                onChange={(e) => setBonusAttr2(e.target.value as Atributo)}
              >
                {ATRIBUTOS.map((attr) => (
                  <MenuItem key={attr} value={attr}>
                    {attr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Summary */}
          {heritage && bonusAttr1 && bonusAttr2 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 1,
              }}
            >
              <Typography variant='subtitle2' fontWeight='bold'>
                Resumo dos Atributos:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {fixedAttr && (
                  <Chip
                    label={`+1 ${fixedAttr.attr}`}
                    size='small'
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
                  />
                )}
                <Chip
                  label={`+1 ${bonusAttr1}`}
                  size='small'
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
                />
                <Chip
                  label={`+1 ${bonusAttr2}`}
                  size='small'
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
                />
              </Box>
            </Box>
          )}
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
          disabled={!isValid}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoreauCustomizationModal;
