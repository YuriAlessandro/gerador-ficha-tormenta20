import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import CharacterSheet from '@/interfaces/CharacterSheet';
import Equipment, { DefenseEquipment } from '@/interfaces/Equipment';
import EQUIPAMENTOS, { calcDefense } from '@/data/equipamentos';
import Bag from '@/interfaces/Bag';

interface EquipmentEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet>) => void;
}

interface SelectedEquipment {
  weapons: Equipment[];
  armors: DefenseEquipment[];
  shields: DefenseEquipment[];
}

const EquipmentEditDrawer: React.FC<EquipmentEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment>(
    {
      weapons: [],
      armors: [],
      shields: [],
    }
  );

  useEffect(() => {
    if (sheet.bag && open) {
      const bagEquipments = sheet.bag.getEquipments();

      setSelectedEquipment({
        weapons: bagEquipments.Arma || [],
        armors: bagEquipments.Armadura || [],
        shields: bagEquipments.Escudo || [],
      });
    }
  }, [sheet.bag, open]);

  const handleWeaponToggle = (weapon: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      weapons: prev.weapons.some((w) => w.nome === weapon.nome)
        ? prev.weapons.filter((w) => w.nome !== weapon.nome)
        : [...prev.weapons, weapon],
    }));
  };

  const handleArmorToggle = (armor: DefenseEquipment) => {
    setSelectedEquipment((prev) => {
      const isCurrentlySelected = prev.armors.some(
        (a) => a.nome === armor.nome
      );

      if (isCurrentlySelected) {
        // Remove the armor
        return {
          ...prev,
          armors: prev.armors.filter((a) => a.nome !== armor.nome),
        };
      } else {
        // Replace with new armor (only one allowed)
        return {
          ...prev,
          armors: [armor],
        };
      }
    });
  };

  const handleShieldToggle = (shield: DefenseEquipment) => {
    setSelectedEquipment((prev) => {
      const isCurrentlySelected = prev.shields.some(
        (s) => s.nome === shield.nome
      );

      if (isCurrentlySelected) {
        // Remove the shield
        return {
          ...prev,
          shields: prev.shields.filter((s) => s.nome !== shield.nome),
        };
      } else {
        // Replace with new shield (only one allowed)
        return {
          ...prev,
          shields: [shield],
        };
      }
    });
  };

  const handleSave = () => {
    if (!sheet.bag) return;

    const bagEquipments = sheet.bag.getEquipments();

    const updatedBagEquipments = {
      ...bagEquipments,
      Arma: selectedEquipment.weapons,
      Armadura: selectedEquipment.armors,
      Escudo: selectedEquipment.shields,
    };

    // Create a new Bag instance with updated equipment
    const updatedBag = new Bag(updatedBagEquipments);

    // Create updated sheet with new bag
    const updatedSheet = { ...sheet, bag: updatedBag };

    // Recalculate defense if armor or shield changed
    const originalArmor = sheet.bag.getEquipments().Armadura || [];
    const originalShield = sheet.bag.getEquipments().Escudo || [];
    const armorChanged =
      JSON.stringify(originalArmor) !==
      JSON.stringify(selectedEquipment.armors);
    const shieldChanged =
      JSON.stringify(originalShield) !==
      JSON.stringify(selectedEquipment.shields);

    if (armorChanged || shieldChanged) {
      // Reset to base defense (10) before recalculation
      const sheetWithBaseDefense = { ...updatedSheet, defesa: 10 };
      const recalculatedSheet = calcDefense(sheetWithBaseDefense);
      onSave({ bag: updatedBag, defesa: recalculatedSheet.defesa });
    } else {
      onSave({ bag: updatedBag });
    }

    onClose();
  };

  const handleCancel = () => {
    if (sheet.bag) {
      const bagEquipments = sheet.bag.getEquipments();

      setSelectedEquipment({
        weapons: bagEquipments.Arma || [],
        armors: bagEquipments.Armadura || [],
        shields: bagEquipments.Escudo || [],
      });
    }
    onClose();
  };

  const isWeaponSelected = (weapon: Equipment) =>
    selectedEquipment.weapons.some((w) => w.nome === weapon.nome);

  const isArmorSelected = (armor: DefenseEquipment) =>
    selectedEquipment.armors.some((a) => a.nome === armor.nome);

  const isShieldSelected = (shield: DefenseEquipment) =>
    selectedEquipment.shields.some((s) => s.nome === shield.nome);

  // No need to combine, we'll use the separate categories

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Editar Equipamentos</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant='body2' sx={{ mb: 2 }}>
          Selecione as armas, armaduras e escudos do personagem.
          <br />
          <strong>Limite:</strong> 1 armadura e 1 escudo por vez.
        </Typography>

        {/* Selected Equipment Summary */}
        {(selectedEquipment.weapons.length > 0 ||
          selectedEquipment.armors.length > 0 ||
          selectedEquipment.shields.length > 0) && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Equipamentos Selecionados:
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {[
                ...selectedEquipment.weapons,
                ...selectedEquipment.armors,
                ...selectedEquipment.shields,
              ].map((item) => (
                <Chip key={item.nome} label={item.nome} size='small' />
              ))}
            </Stack>
          </Box>
        )}

        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {/* Simple Weapons */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>Armas Simples</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {EQUIPAMENTOS.armasSimples.map((weapon) => (
                  <FormControlLabel
                    key={weapon.nome}
                    control={
                      <Checkbox
                        checked={isWeaponSelected(weapon)}
                        onChange={() => handleWeaponToggle(weapon)}
                        size='small'
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='body2' fontWeight='bold'>
                          {weapon.nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Dano: {weapon.dano || '-'} | Crítico:{' '}
                          {weapon.critico || '-'} | Tipo: {weapon.tipo || '-'}
                          {weapon.spaces &&
                            weapon.spaces > 0 &&
                            ` | ${weapon.spaces} espaço(s)`}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Martial Weapons */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>Armas Marciais</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {EQUIPAMENTOS.armasMarciais.map((weapon) => (
                  <FormControlLabel
                    key={weapon.nome}
                    control={
                      <Checkbox
                        checked={isWeaponSelected(weapon)}
                        onChange={() => handleWeaponToggle(weapon)}
                        size='small'
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='body2' fontWeight='bold'>
                          {weapon.nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Dano: {weapon.dano || '-'} | Crítico:{' '}
                          {weapon.critico || '-'} | Tipo: {weapon.tipo || '-'}
                          {weapon.spaces &&
                            weapon.spaces > 0 &&
                            ` | ${weapon.spaces} espaço(s)`}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Exotic Weapons */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>Armas Exóticas</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {EQUIPAMENTOS.armasExoticas.map((weapon) => (
                  <FormControlLabel
                    key={weapon.nome}
                    control={
                      <Checkbox
                        checked={isWeaponSelected(weapon)}
                        onChange={() => handleWeaponToggle(weapon)}
                        size='small'
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='body2' fontWeight='bold'>
                          {weapon.nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Dano: {weapon.dano || '-'} | Crítico:{' '}
                          {weapon.critico || '-'} | Tipo: {weapon.tipo || '-'}
                          {weapon.spaces &&
                            weapon.spaces > 0 &&
                            ` | ${weapon.spaces} espaço(s)`}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Firearms */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>Armas de Fogo</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {EQUIPAMENTOS.armasDeFogo.map((weapon) => (
                  <FormControlLabel
                    key={weapon.nome}
                    control={
                      <Checkbox
                        checked={isWeaponSelected(weapon)}
                        onChange={() => handleWeaponToggle(weapon)}
                        size='small'
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='body2' fontWeight='bold'>
                          {weapon.nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Dano: {weapon.dano || '-'} | Crítico:{' '}
                          {weapon.critico || '-'} | Tipo: {weapon.tipo || '-'}
                          {weapon.spaces &&
                            weapon.spaces > 0 &&
                            ` | ${weapon.spaces} espaço(s)`}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Light Armor */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>
                Armaduras Leves ({selectedEquipment.armors.length}/1)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {EQUIPAMENTOS.armadurasLeves.map((armor) => (
                  <FormControlLabel
                    key={armor.nome}
                    control={
                      <Checkbox
                        checked={isArmorSelected(armor)}
                        onChange={() => handleArmorToggle(armor)}
                        size='small'
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='body2' fontWeight='bold'>
                          {armor.nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Defesa: +{armor.defenseBonus} | Penalidade:{' '}
                          {armor.armorPenalty}
                          {armor.spaces &&
                            armor.spaces > 0 &&
                            ` | ${armor.spaces} espaço(s)`}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Heavy Armor */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>
                Armaduras Pesadas ({selectedEquipment.armors.length}/1)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {EQUIPAMENTOS.armaduraPesada.map((armor) => (
                  <FormControlLabel
                    key={armor.nome}
                    control={
                      <Checkbox
                        checked={isArmorSelected(armor)}
                        onChange={() => handleArmorToggle(armor)}
                        size='small'
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='body2' fontWeight='bold'>
                          {armor.nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Defesa: +{armor.defenseBonus} | Penalidade:{' '}
                          {armor.armorPenalty}
                          {armor.spaces &&
                            armor.spaces > 0 &&
                            ` | ${armor.spaces} espaço(s)`}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Shields Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>
                Escudos ({selectedEquipment.shields.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {EQUIPAMENTOS.escudos.map((shield) => (
                  <FormControlLabel
                    key={shield.nome}
                    control={
                      <Checkbox
                        checked={isShieldSelected(shield)}
                        onChange={() => handleShieldToggle(shield)}
                        size='small'
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='body2' fontWeight='bold'>
                          {shield.nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Defesa: +{shield.defenseBonus} | Penalidade:{' '}
                          {shield.armorPenalty}
                          {shield.spaces &&
                            shield.spaces > 0 &&
                            ` | ${shield.spaces} espaço(s)`}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Stack direction='row' spacing={2} sx={{ mt: 4 }}>
          <Button fullWidth variant='contained' onClick={handleSave}>
            Salvar
          </Button>
          <Button fullWidth variant='outlined' onClick={handleCancel}>
            Cancelar
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default EquipmentEditDrawer;
