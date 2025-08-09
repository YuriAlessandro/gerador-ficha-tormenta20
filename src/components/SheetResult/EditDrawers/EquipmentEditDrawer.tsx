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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CharacterSheet, { Step, SubStep } from '@/interfaces/CharacterSheet';
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
  const [showAddWeapons, setShowAddWeapons] = useState(false);
  const [showAddArmor, setShowAddArmor] = useState(false);
  const [showAddShield, setShowAddShield] = useState(false);

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

  const handleRemoveWeapon = (weapon: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      weapons: prev.weapons.filter((w) => w.nome !== weapon.nome),
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
      }
      // Replace with new armor (only one allowed)
      return {
        ...prev,
        armors: [armor],
      };
    });
  };

  const handleRemoveArmor = (armor: DefenseEquipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      armors: prev.armors.filter((a) => a.nome !== armor.nome),
    }));
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
      }
      // Replace with new shield (only one allowed)
      return {
        ...prev,
        shields: [shield],
      };
    });
  };

  const handleRemoveShield = (shield: DefenseEquipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      shields: prev.shields.filter((s) => s.nome !== shield.nome),
    }));
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

    // Track equipment changes in steps
    const originalWeapons = sheet.bag.getEquipments().Arma || [];
    const originalArmor = sheet.bag.getEquipments().Armadura || [];
    const originalShield = sheet.bag.getEquipments().Escudo || [];

    const weaponsChanged =
      JSON.stringify(originalWeapons) !==
      JSON.stringify(selectedEquipment.weapons);
    const armorChanged =
      JSON.stringify(originalArmor) !==
      JSON.stringify(selectedEquipment.armors);
    const shieldChanged =
      JSON.stringify(originalShield) !==
      JSON.stringify(selectedEquipment.shields);

    const newSteps: Step[] = [];

    if (weaponsChanged || armorChanged || shieldChanged) {
      const equipmentChanges: SubStep[] = [];

      if (weaponsChanged) {
        const addedWeapons = selectedEquipment.weapons.filter(
          (sw) => !originalWeapons.some((ow) => ow.nome === sw.nome)
        );
        const removedWeapons = originalWeapons.filter(
          (ow) => !selectedEquipment.weapons.some((sw) => sw.nome === ow.nome)
        );

        addedWeapons.forEach((w) =>
          equipmentChanges.push({
            name: w.nome,
            value: `${w.nome} (arma) - adicionado`,
          })
        );
        removedWeapons.forEach((w) =>
          equipmentChanges.push({
            name: w.nome,
            value: `${w.nome} (arma) - removido`,
          })
        );
      }

      if (armorChanged) {
        const addedArmors = selectedEquipment.armors.filter(
          (sa) => !originalArmor.some((oa) => oa.nome === sa.nome)
        );
        const removedArmors = originalArmor.filter(
          (oa) => !selectedEquipment.armors.some((sa) => sa.nome === oa.nome)
        );

        addedArmors.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (armadura) - adicionado`,
          })
        );
        removedArmors.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (armadura) - removido`,
          })
        );
      }

      if (shieldChanged) {
        const addedShields = selectedEquipment.shields.filter(
          (ss) => !originalShield.some((os) => os.nome === ss.nome)
        );
        const removedShields = originalShield.filter(
          (os) => !selectedEquipment.shields.some((s) => s.nome === os.nome)
        );

        addedShields.forEach((s) =>
          equipmentChanges.push({
            name: s.nome,
            value: `${s.nome} (escudo) - adicionado`,
          })
        );
        removedShields.forEach((s) =>
          equipmentChanges.push({
            name: s.nome,
            value: `${s.nome} (escudo) - removido`,
          })
        );
      }

      if (equipmentChanges.length > 0) {
        newSteps.push({
          label: 'Edição Manual - Equipamentos',
          type: 'Equipamentos',
          value: equipmentChanges,
        });
      }
    }

    if (armorChanged || shieldChanged) {
      // Reset to base defense (10) before recalculation
      const sheetWithBaseDefense = { ...updatedSheet, defesa: 10 };
      const recalculatedSheet = calcDefense(sheetWithBaseDefense);

      const updates: Partial<CharacterSheet> = {
        bag: updatedBag,
        defesa: recalculatedSheet.defesa,
      };

      if (newSteps.length > 0) {
        updates.steps = [...sheet.steps, ...newSteps];
      }

      onSave(updates);
    } else {
      const updates: Partial<CharacterSheet> = { bag: updatedBag };

      if (newSteps.length > 0) {
        updates.steps = [...sheet.steps, ...newSteps];
      }

      onSave(updates);
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
    setShowAddWeapons(false);
    setShowAddArmor(false);
    setShowAddShield(false);
    onClose();
  };

  const isWeaponSelected = (weapon: Equipment) =>
    selectedEquipment.weapons.some((w) => w.nome === weapon.nome);

  const isArmorSelected = (armor: DefenseEquipment) =>
    selectedEquipment.armors.some((a) => a.nome === armor.nome);

  const isShieldSelected = (shield: DefenseEquipment) =>
    selectedEquipment.shields.some((s) => s.nome === shield.nome);

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
          Gerencie os equipamentos do personagem. Você pode remover itens
          existentes ou adicionar novos.
          <br />
          <strong>Limite:</strong> 1 armadura e 1 escudo por vez.
        </Typography>

        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {/* Current Equipment Section */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Equipamentos Atuais
              </Typography>

              {/* Weapons */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Armas ({selectedEquipment.weapons.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddWeapons(!showAddWeapons)}
                  >
                    Adicionar
                  </Button>
                </Stack>
                {selectedEquipment.weapons.length > 0 ? (
                  <List dense>
                    {selectedEquipment.weapons.map((weapon) => (
                      <ListItem key={weapon.nome}>
                        <ListItemText
                          primary={weapon.nome}
                          secondary={`Dano: ${weapon.dano} | Crítico: ${
                            weapon.critico || '20/x2'
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveWeapon(weapon)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhuma arma equipada
                  </Typography>
                )}
              </Box>

              {/* Armor */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Armadura
                  </Typography>
                  {selectedEquipment.armors.length === 0 && (
                    <Button
                      size='small'
                      startIcon={<AddIcon />}
                      onClick={() => setShowAddArmor(!showAddArmor)}
                    >
                      Adicionar
                    </Button>
                  )}
                </Stack>
                {selectedEquipment.armors.length > 0 ? (
                  <List dense>
                    {selectedEquipment.armors.map((armor) => (
                      <ListItem key={armor.nome}>
                        <ListItemText
                          primary={armor.nome}
                          secondary={`Defesa: +${armor.defenseBonus} | Penalidade: ${armor.armorPenalty}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveArmor(armor)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhuma armadura equipada
                  </Typography>
                )}
              </Box>

              {/* Shield */}
              <Box>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Escudo
                  </Typography>
                  {selectedEquipment.shields.length === 0 && (
                    <Button
                      size='small'
                      startIcon={<AddIcon />}
                      onClick={() => setShowAddShield(!showAddShield)}
                    >
                      Adicionar
                    </Button>
                  )}
                </Stack>
                {selectedEquipment.shields.length > 0 ? (
                  <List dense>
                    {selectedEquipment.shields.map((shield) => (
                      <ListItem key={shield.nome}>
                        <ListItemText
                          primary={shield.nome}
                          secondary={`Defesa: +${shield.defenseBonus} | Penalidade: ${shield.armorPenalty}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveShield(shield)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhum escudo equipado
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Add Weapons Section */}
          {showAddWeapons && (
            <Accordion expanded={showAddWeapons}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Armas</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Simple Weapons */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armas Simples
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
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
                        label={`${weapon.nome} (Dano: ${weapon.dano})`}
                      />
                    ))}
                  </Stack>

                  {/* Martial Weapons */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armas Marciais
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
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
                        label={`${weapon.nome} (Dano: ${weapon.dano})`}
                      />
                    ))}
                  </Stack>

                  {/* Exotic Weapons */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armas Exóticas
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
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
                        label={`${weapon.nome} (Dano: ${weapon.dano})`}
                      />
                    ))}
                  </Stack>

                  {/* Firearms */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armas de Fogo
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
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
                        label={`${weapon.nome} (Dano: ${weapon.dano})`}
                      />
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddWeapons(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Armor Section */}
          {showAddArmor && (
            <Accordion expanded={showAddArmor}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Armadura</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Light Armor */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armaduras Leves
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
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
                        label={`${armor.nome} (Defesa: +${armor.defenseBonus}, Penalidade: ${armor.armorPenalty})`}
                      />
                    ))}
                  </Stack>

                  {/* Heavy Armor */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armaduras Pesadas
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
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
                        label={`${armor.nome} (Defesa: +${armor.defenseBonus}, Penalidade: ${armor.armorPenalty})`}
                      />
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddArmor(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Shield Section */}
          {showAddShield && (
            <Accordion expanded={showAddShield}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Escudo</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Stack spacing={1} sx={{ mb: 2 }}>
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
                        label={`${shield.nome} (Defesa: +${shield.defenseBonus}, Penalidade: ${shield.armorPenalty})`}
                      />
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddShield(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
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
