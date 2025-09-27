import React, { useState, useEffect, useRef } from 'react';
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
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CharacterSheet, { Step, SubStep } from '@/interfaces/CharacterSheet';
import Equipment, { DefenseEquipment } from '@/interfaces/Equipment';
import EQUIPAMENTOS, { calcDefense } from '@/data/equipamentos';
import Bag from '@/interfaces/Bag';
import { GENERAL_EQUIPMENT } from '@/data/equipamentos-gerais';

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
  generalItems: Equipment[];
  clothing: Equipment[];
  alchemy: Equipment[];
  food: Equipment[];
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
      generalItems: [],
      clothing: [],
      alchemy: [],
      food: [],
    }
  );
  const [dinheiro, setDinheiro] = useState(0);
  const [showAddWeapons, setShowAddWeapons] = useState(false);
  const [showAddArmor, setShowAddArmor] = useState(false);
  const [showAddShield, setShowAddShield] = useState(false);
  const [showAddGeneralItems, setShowAddGeneralItems] = useState(false);
  const [showAddClothing, setShowAddClothing] = useState(false);
  const [showAddAlchemy, setShowAddAlchemy] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);

  // Refs for accordion auto-scroll
  const weaponsAccordionRef = useRef<HTMLDivElement>(null);
  const armorAccordionRef = useRef<HTMLDivElement>(null);
  const shieldAccordionRef = useRef<HTMLDivElement>(null);
  const generalItemsAccordionRef = useRef<HTMLDivElement>(null);
  const clothingAccordionRef = useRef<HTMLDivElement>(null);
  const alchemyAccordionRef = useRef<HTMLDivElement>(null);
  const foodAccordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sheet.bag && open) {
      const bagEquipments = sheet.bag.getEquipments();

      setSelectedEquipment({
        weapons: bagEquipments.Arma || [],
        armors: bagEquipments.Armadura || [],
        shields: bagEquipments.Escudo || [],
        generalItems: bagEquipments['Item Geral'] || [],
        clothing: bagEquipments.Vestuário || [],
        alchemy: bagEquipments.Alquimía || [],
        food: bagEquipments.Alimentação || [],
      });

      setDinheiro(sheet.dinheiro || 0);
    }
  }, [sheet.bag, sheet.dinheiro, open]);

  // Function to scroll to accordion when it opens
  const scrollToAccordion = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }, 100); // Small delay to allow accordion to fully expand
  };

  // Function to close all other accordions (auto-collapse)
  const closeOtherAccordions = (except: string) => {
    if (except !== 'weapons') setShowAddWeapons(false);
    if (except !== 'armor') setShowAddArmor(false);
    if (except !== 'shield') setShowAddShield(false);
    if (except !== 'generalItems') setShowAddGeneralItems(false);
    if (except !== 'clothing') setShowAddClothing(false);
    if (except !== 'alchemy') setShowAddAlchemy(false);
    if (except !== 'food') setShowAddFood(false);
  };

  // Enhanced toggle functions with auto-collapse and scroll
  const handleToggleWeapons = () => {
    const newState = !showAddWeapons;
    if (newState) {
      closeOtherAccordions('weapons');
      setShowAddWeapons(true);
      scrollToAccordion(weaponsAccordionRef);
    } else {
      setShowAddWeapons(false);
    }
  };

  const handleToggleArmor = () => {
    const newState = !showAddArmor;
    if (newState) {
      closeOtherAccordions('armor');
      setShowAddArmor(true);
      scrollToAccordion(armorAccordionRef);
    } else {
      setShowAddArmor(false);
    }
  };

  const handleToggleShield = () => {
    const newState = !showAddShield;
    if (newState) {
      closeOtherAccordions('shield');
      setShowAddShield(true);
      scrollToAccordion(shieldAccordionRef);
    } else {
      setShowAddShield(false);
    }
  };

  const handleToggleGeneralItems = () => {
    const newState = !showAddGeneralItems;
    if (newState) {
      closeOtherAccordions('generalItems');
      setShowAddGeneralItems(true);
      scrollToAccordion(generalItemsAccordionRef);
    } else {
      setShowAddGeneralItems(false);
    }
  };

  const handleToggleClothing = () => {
    const newState = !showAddClothing;
    if (newState) {
      closeOtherAccordions('clothing');
      setShowAddClothing(true);
      scrollToAccordion(clothingAccordionRef);
    } else {
      setShowAddClothing(false);
    }
  };

  const handleToggleAlchemy = () => {
    const newState = !showAddAlchemy;
    if (newState) {
      closeOtherAccordions('alchemy');
      setShowAddAlchemy(true);
      scrollToAccordion(alchemyAccordionRef);
    } else {
      setShowAddAlchemy(false);
    }
  };

  const handleToggleFood = () => {
    const newState = !showAddFood;
    if (newState) {
      closeOtherAccordions('food');
      setShowAddFood(true);
      scrollToAccordion(foodAccordionRef);
    } else {
      setShowAddFood(false);
    }
  };

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

  // Handlers for General Items
  const handleGeneralItemToggle = (item: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      generalItems: prev.generalItems.some((i) => i.nome === item.nome)
        ? prev.generalItems.filter((i) => i.nome !== item.nome)
        : [...prev.generalItems, item],
    }));
  };

  const handleRemoveGeneralItem = (item: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      generalItems: prev.generalItems.filter((i) => i.nome !== item.nome),
    }));
  };

  // Handlers for Clothing
  const handleClothingToggle = (item: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      clothing: prev.clothing.some((i) => i.nome === item.nome)
        ? prev.clothing.filter((i) => i.nome !== item.nome)
        : [...prev.clothing, item],
    }));
  };

  const handleRemoveClothing = (item: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      clothing: prev.clothing.filter((i) => i.nome !== item.nome),
    }));
  };

  // Handlers for Alchemy
  const handleAlchemyToggle = (item: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      alchemy: prev.alchemy.some((i) => i.nome === item.nome)
        ? prev.alchemy.filter((i) => i.nome !== item.nome)
        : [...prev.alchemy, item],
    }));
  };

  const handleRemoveAlchemy = (item: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      alchemy: prev.alchemy.filter((i) => i.nome !== item.nome),
    }));
  };

  // Handlers for Food
  const handleFoodToggle = (item: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      food: prev.food.some((i) => i.nome === item.nome)
        ? prev.food.filter((i) => i.nome !== item.nome)
        : [...prev.food, item],
    }));
  };

  const handleRemoveFood = (item: Equipment) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      food: prev.food.filter((i) => i.nome !== item.nome),
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
      'Item Geral': selectedEquipment.generalItems,
      Vestuário: selectedEquipment.clothing,
      Alquimía: selectedEquipment.alchemy,
      Alimentação: selectedEquipment.food,
    };

    // Create a new Bag instance with updated equipment
    const updatedBag = new Bag(updatedBagEquipments);

    // Create updated sheet with new bag
    const updatedSheet = { ...sheet, bag: updatedBag };

    // Track equipment changes in steps
    const originalWeapons = sheet.bag.getEquipments().Arma || [];
    const originalArmor = sheet.bag.getEquipments().Armadura || [];
    const originalShield = sheet.bag.getEquipments().Escudo || [];
    const originalGeneralItems = sheet.bag.getEquipments()['Item Geral'] || [];
    const originalClothing = sheet.bag.getEquipments().Vestuário || [];
    const originalAlchemy = sheet.bag.getEquipments().Alquimía || [];
    const originalFood = sheet.bag.getEquipments().Alimentação || [];

    const weaponsChanged =
      JSON.stringify(originalWeapons) !==
      JSON.stringify(selectedEquipment.weapons);
    const armorChanged =
      JSON.stringify(originalArmor) !==
      JSON.stringify(selectedEquipment.armors);
    const shieldChanged =
      JSON.stringify(originalShield) !==
      JSON.stringify(selectedEquipment.shields);
    const generalItemsChanged =
      JSON.stringify(originalGeneralItems) !==
      JSON.stringify(selectedEquipment.generalItems);
    const clothingChanged =
      JSON.stringify(originalClothing) !==
      JSON.stringify(selectedEquipment.clothing);
    const alchemyChanged =
      JSON.stringify(originalAlchemy) !==
      JSON.stringify(selectedEquipment.alchemy);
    const foodChanged =
      JSON.stringify(originalFood) !== JSON.stringify(selectedEquipment.food);

    const newSteps: Step[] = [];

    // Check if money changed
    const moneyChanged = sheet.dinheiro !== dinheiro;

    if (
      weaponsChanged ||
      armorChanged ||
      shieldChanged ||
      generalItemsChanged ||
      clothingChanged ||
      alchemyChanged ||
      foodChanged ||
      moneyChanged
    ) {
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

      if (generalItemsChanged) {
        const addedGeneralItems = selectedEquipment.generalItems.filter(
          (sg) => !originalGeneralItems.some((og) => og.nome === sg.nome)
        );
        const removedGeneralItems = originalGeneralItems.filter(
          (og) =>
            !selectedEquipment.generalItems.some((sg) => sg.nome === og.nome)
        );

        addedGeneralItems.forEach((gi) =>
          equipmentChanges.push({
            name: gi.nome,
            value: `${gi.nome} (item geral) - adicionado`,
          })
        );
        removedGeneralItems.forEach((gi) =>
          equipmentChanges.push({
            name: gi.nome,
            value: `${gi.nome} (item geral) - removido`,
          })
        );
      }

      if (clothingChanged) {
        const addedClothing = selectedEquipment.clothing.filter(
          (sc) => !originalClothing.some((oc) => oc.nome === sc.nome)
        );
        const removedClothing = originalClothing.filter(
          (oc) => !selectedEquipment.clothing.some((sc) => sc.nome === oc.nome)
        );

        addedClothing.forEach((c) =>
          equipmentChanges.push({
            name: c.nome,
            value: `${c.nome} (vestuário) - adicionado`,
          })
        );
        removedClothing.forEach((c) =>
          equipmentChanges.push({
            name: c.nome,
            value: `${c.nome} (vestuário) - removido`,
          })
        );
      }

      if (alchemyChanged) {
        const addedAlchemy = selectedEquipment.alchemy.filter(
          (sa) => !originalAlchemy.some((oa) => oa.nome === sa.nome)
        );
        const removedAlchemy = originalAlchemy.filter(
          (oa) => !selectedEquipment.alchemy.some((sa) => sa.nome === oa.nome)
        );

        addedAlchemy.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (alquimia) - adicionado`,
          })
        );
        removedAlchemy.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (alquimia) - removido`,
          })
        );
      }

      if (foodChanged) {
        const addedFood = selectedEquipment.food.filter(
          (sf) => !originalFood.some((of) => of.nome === sf.nome)
        );
        const removedFood = originalFood.filter(
          (of) => !selectedEquipment.food.some((sf) => sf.nome === of.nome)
        );

        addedFood.forEach((f) =>
          equipmentChanges.push({
            name: f.nome,
            value: `${f.nome} (alimentação) - adicionado`,
          })
        );
        removedFood.forEach((f) =>
          equipmentChanges.push({
            name: f.nome,
            value: `${f.nome} (alimentação) - removido`,
          })
        );
      }

      // Add money change to equipment changes
      if (moneyChanged) {
        equipmentChanges.push({
          name: 'Dinheiro',
          value: `Dinheiro alterado de T$ ${
            sheet.dinheiro || 0
          } para T$ ${dinheiro}`,
        });
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
        dinheiro,
      };

      if (newSteps.length > 0) {
        updates.steps = [...sheet.steps, ...newSteps];
      }

      onSave(updates);
    } else {
      const updates: Partial<CharacterSheet> = {
        bag: updatedBag,
        dinheiro,
      };

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
        generalItems: bagEquipments['Item Geral'] || [],
        clothing: bagEquipments.Vestuário || [],
        alchemy: bagEquipments.Alquimía || [],
        food: bagEquipments.Alimentação || [],
      });
      setDinheiro(sheet.dinheiro || 0);
    }
    setShowAddWeapons(false);
    setShowAddArmor(false);
    setShowAddShield(false);
    setShowAddGeneralItems(false);
    setShowAddClothing(false);
    setShowAddAlchemy(false);
    setShowAddFood(false);
    onClose();
  };

  const isWeaponSelected = (weapon: Equipment) =>
    selectedEquipment.weapons.some((w) => w.nome === weapon.nome);

  const isArmorSelected = (armor: DefenseEquipment) =>
    selectedEquipment.armors.some((a) => a.nome === armor.nome);

  const isShieldSelected = (shield: DefenseEquipment) =>
    selectedEquipment.shields.some((s) => s.nome === shield.nome);

  const isGeneralItemSelected = (item: Equipment) =>
    selectedEquipment.generalItems.some((i) => i.nome === item.nome);

  const isClothingSelected = (item: Equipment) =>
    selectedEquipment.clothing.some((i) => i.nome === item.nome);

  const isAlchemySelected = (item: Equipment) =>
    selectedEquipment.alchemy.some((i) => i.nome === item.nome);

  const isFoodSelected = (item: Equipment) =>
    selectedEquipment.food.some((i) => i.nome === item.nome);

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
          {/* Money Section */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Dinheiro
              </Typography>
              <TextField
                fullWidth
                type='number'
                label='Dinheiro (T$)'
                value={dinheiro}
                onChange={(e) => setDinheiro(Number(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>

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
                    startIcon={
                      showAddWeapons ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleWeapons}
                    variant={showAddWeapons ? 'contained' : 'outlined'}
                    color={showAddWeapons ? 'primary' : 'inherit'}
                  >
                    {showAddWeapons ? 'Fechar' : 'Adicionar'}
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
                      startIcon={
                        showAddArmor ? <ExpandLessIcon /> : <ExpandMoreIcon />
                      }
                      onClick={handleToggleArmor}
                      variant={showAddArmor ? 'contained' : 'outlined'}
                      color={showAddArmor ? 'primary' : 'inherit'}
                    >
                      {showAddArmor ? 'Fechar' : 'Adicionar'}
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
                      startIcon={
                        showAddShield ? <ExpandLessIcon /> : <ExpandMoreIcon />
                      }
                      onClick={handleToggleShield}
                      variant={showAddShield ? 'contained' : 'outlined'}
                      color={showAddShield ? 'primary' : 'inherit'}
                    >
                      {showAddShield ? 'Fechar' : 'Adicionar'}
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

              {/* General Items */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Itens Gerais ({selectedEquipment.generalItems.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddGeneralItems ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )
                    }
                    onClick={handleToggleGeneralItems}
                    variant={showAddGeneralItems ? 'contained' : 'outlined'}
                    color={showAddGeneralItems ? 'primary' : 'inherit'}
                  >
                    {showAddGeneralItems ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.generalItems.length > 0 ? (
                  <List dense>
                    {selectedEquipment.generalItems.map((item) => (
                      <ListItem key={item.nome}>
                        <ListItemText
                          primary={item.nome}
                          secondary={`Preço: T$ ${item.preco || 0} | Espaços: ${
                            item.spaces || 0
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveGeneralItem(item)}
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
                    Nenhum item geral equipado
                  </Typography>
                )}
              </Box>

              {/* Clothing */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Vestuário ({selectedEquipment.clothing.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddClothing ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleClothing}
                    variant={showAddClothing ? 'contained' : 'outlined'}
                    color={showAddClothing ? 'primary' : 'inherit'}
                  >
                    {showAddClothing ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.clothing.length > 0 ? (
                  <List dense>
                    {selectedEquipment.clothing.map((item) => (
                      <ListItem key={item.nome}>
                        <ListItemText
                          primary={item.nome}
                          secondary={`Preço: T$ ${item.preco || 0} | Espaços: ${
                            item.spaces || 0
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveClothing(item)}
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
                    Nenhum vestuário equipado
                  </Typography>
                )}
              </Box>

              {/* Alchemy */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Alquimia ({selectedEquipment.alchemy.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddAlchemy ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleAlchemy}
                    variant={showAddAlchemy ? 'contained' : 'outlined'}
                    color={showAddAlchemy ? 'primary' : 'inherit'}
                  >
                    {showAddAlchemy ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.alchemy.length > 0 ? (
                  <List dense>
                    {selectedEquipment.alchemy.map((item) => (
                      <ListItem key={item.nome}>
                        <ListItemText
                          primary={item.nome}
                          secondary={`Preço: T$ ${item.preco || 0} | Espaços: ${
                            item.spaces || 0
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveAlchemy(item)}
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
                    Nenhum item de alquimia equipado
                  </Typography>
                )}
              </Box>

              {/* Food */}
              <Box>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Alimentação ({selectedEquipment.food.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddFood ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleFood}
                    variant={showAddFood ? 'contained' : 'outlined'}
                    color={showAddFood ? 'primary' : 'inherit'}
                  >
                    {showAddFood ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.food.length > 0 ? (
                  <List dense>
                    {selectedEquipment.food.map((item) => (
                      <ListItem key={item.nome}>
                        <ListItemText
                          primary={item.nome}
                          secondary={`Preço: T$ ${item.preco || 0} | Espaços: ${
                            item.spaces || 0
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveFood(item)}
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
                    Nenhum item de alimentação equipado
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Add Weapons Section */}
          {showAddWeapons && (
            <Accordion expanded={showAddWeapons} ref={weaponsAccordionRef}>
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
            <Accordion expanded={showAddArmor} ref={armorAccordionRef}>
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
            <Accordion expanded={showAddShield} ref={shieldAccordionRef}>
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

          {/* Add General Items Section */}
          {showAddGeneralItems && (
            <Accordion
              expanded={showAddGeneralItems}
              ref={generalItemsAccordionRef}
            >
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Itens Gerais</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Adventurer Equipment */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Equipamentos de Aventureiro
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {GENERAL_EQUIPMENT.adventurerEquipment.map((item) => (
                      <FormControlLabel
                        key={item.nome}
                        control={
                          <Checkbox
                            checked={isGeneralItemSelected(item)}
                            onChange={() => handleGeneralItemToggle(item)}
                            size='small'
                          />
                        }
                        label={`${item.nome} (T$ ${item.preco || 0})`}
                      />
                    ))}
                  </Stack>

                  {/* Tools */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Ferramentas
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {GENERAL_EQUIPMENT.tools.map((item) => (
                      <FormControlLabel
                        key={item.nome}
                        control={
                          <Checkbox
                            checked={isGeneralItemSelected(item)}
                            onChange={() => handleGeneralItemToggle(item)}
                            size='small'
                          />
                        }
                        label={`${item.nome} (T$ ${item.preco || 0})`}
                      />
                    ))}
                  </Stack>

                  {/* Esoteric Items */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Itens Esotéricos
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {GENERAL_EQUIPMENT.esoteric.map((item) => (
                      <FormControlLabel
                        key={item.nome}
                        control={
                          <Checkbox
                            checked={isGeneralItemSelected(item)}
                            onChange={() => handleGeneralItemToggle(item)}
                            size='small'
                          />
                        }
                        label={`${item.nome} (T$ ${item.preco || 0})`}
                      />
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddGeneralItems(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Clothing Section */}
          {showAddClothing && (
            <Accordion expanded={showAddClothing} ref={clothingAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Vestuário</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {GENERAL_EQUIPMENT.clothing.map((item) => (
                      <FormControlLabel
                        key={item.nome}
                        control={
                          <Checkbox
                            checked={isClothingSelected(item)}
                            onChange={() => handleClothingToggle(item)}
                            size='small'
                          />
                        }
                        label={`${item.nome} (T$ ${item.preco || 0})`}
                      />
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddClothing(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Alchemy Section */}
          {showAddAlchemy && (
            <Accordion expanded={showAddAlchemy} ref={alchemyAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>
                  Adicionar Itens de Alquimia
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Prepared Items */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Preparados Alquímicos
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {GENERAL_EQUIPMENT.alchemyPrepared.map((item) => (
                      <FormControlLabel
                        key={item.nome}
                        control={
                          <Checkbox
                            checked={isAlchemySelected(item)}
                            onChange={() => handleAlchemyToggle(item)}
                            size='small'
                          />
                        }
                        label={`${item.nome} (T$ ${item.preco || 0})`}
                      />
                    ))}
                  </Stack>

                  {/* Catalysts */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Catalisadores
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {GENERAL_EQUIPMENT.alchemyCatalysts.map((item) => (
                      <FormControlLabel
                        key={item.nome}
                        control={
                          <Checkbox
                            checked={isAlchemySelected(item)}
                            onChange={() => handleAlchemyToggle(item)}
                            size='small'
                          />
                        }
                        label={`${item.nome} (T$ ${item.preco || 0})`}
                      />
                    ))}
                  </Stack>

                  {/* Poisons */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Venenos
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {GENERAL_EQUIPMENT.alchemyPoisons.map((item) => (
                      <FormControlLabel
                        key={item.nome}
                        control={
                          <Checkbox
                            checked={isAlchemySelected(item)}
                            onChange={() => handleAlchemyToggle(item)}
                            size='small'
                          />
                        }
                        label={`${item.nome} (T$ ${item.preco || 0})`}
                      />
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddAlchemy(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Food Section */}
          {showAddFood && (
            <Accordion expanded={showAddFood} ref={foodAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Alimentação</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {GENERAL_EQUIPMENT.food.map((item) => (
                      <FormControlLabel
                        key={item.nome}
                        control={
                          <Checkbox
                            checked={isFoodSelected(item)}
                            onChange={() => handleFoodToggle(item)}
                            size='small'
                          />
                        }
                        label={`${item.nome} (T$ ${item.preco || 0})`}
                      />
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddFood(false)}
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
