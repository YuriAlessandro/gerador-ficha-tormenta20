import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Button,
  Stack,
  IconButton,
  Divider,
  Checkbox,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import CharacterSheet, {
  DamageReduction,
  DamageType,
  ALL_DAMAGE_TYPES,
} from '@/interfaces/CharacterSheet';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { recalculateSheet } from '@/functions/recalculateSheet';
import { isHeavyArmor } from '@/data/systems/tormenta20/equipamentos';
import { DefenseEquipment } from '@/interfaces/Equipment';
import { getWornArmor } from '@/components/SheetResult/BackpackModal/wielding';

interface DefenseEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet> | CharacterSheet) => void;
  onOpenEquipmentDrawer: () => void;
}

interface EditedData {
  customDefenseBase: number | undefined;
  customDefenseAttribute: Atributo | undefined;
  useDefenseAttribute: boolean;
  bonusDefense: number;
}

const SPECIFIC_DAMAGE_TYPES: DamageType[] = ALL_DAMAGE_TYPES.filter(
  (t) => t !== 'Geral'
);

// Auto RD = total computed RD minus the user's manual bonus. Editing the field
// to a value below the auto RD produces a negative manual bonus (clamped so the
// final total never goes below 0 in recalculateSheet).
const getAutoRd = (sheet: CharacterSheet, type: DamageType): number => {
  const total = sheet.reducaoDeDano?.[type] ?? 0;
  const manual = sheet.bonusRd?.[type] ?? 0;
  return Math.max(0, total - manual);
};

const DefenseEditDrawer: React.FC<DefenseEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
  onOpenEquipmentDrawer,
}) => {
  const [editedData, setEditedData] = useState<EditedData>({
    customDefenseBase: sheet.customDefenseBase,
    customDefenseAttribute: sheet.customDefenseAttribute,
    useDefenseAttribute: sheet.useDefenseAttribute ?? true,
    bonusDefense: sheet.bonusDefense ?? 0,
  });

  // RD editing. State holds the total values (auto + manual), which is what the
  // user sees and edits. On save we derive `bonusRd` (manual portion only).
  const [editedRd, setEditedRd] = useState<DamageReduction>(
    sheet.reducaoDeDano ?? {}
  );

  // Re-sync local state whenever the drawer is (re)opened, so auto RD reflects
  // the latest equipment/powers and edits aren't carried over from a cancel.
  useEffect(() => {
    if (open) {
      setEditedData({
        customDefenseBase: sheet.customDefenseBase,
        customDefenseAttribute: sheet.customDefenseAttribute,
        useDefenseAttribute: sheet.useDefenseAttribute ?? true,
        bonusDefense: sheet.bonusDefense ?? 0,
      });
      setEditedRd(sheet.reducaoDeDano ?? {});
    }
  }, [open, sheet]);

  // The armor actually worn (respects wornArmorId, incl. the "took it off"
  // sentinel) and the shields actually wielded in a hand slot. Mirrors the
  // rules in calcDefense so the preview matches the saved value: only worn
  // armor and wielded shields contribute to defense.
  const wornArmor = getWornArmor(
    (sheet.bag.equipments.Armadura || []) as DefenseEquipment[],
    sheet.wornArmorId
  );
  const wieldedShields = (sheet.bag.equipments.Escudo || []).filter(
    (shield: DefenseEquipment) =>
      shield.id !== undefined &&
      (shield.id === sheet.mainHandItemId || shield.id === sheet.offHandItemId)
  );

  // Check if the character has heavy armor WORN (an unequipped heavy armor in
  // the bag must not suppress the defense attribute modifier).
  const hasHeavyArmor = (): boolean => !!wornArmor && isHeavyArmor(wornArmor);

  // Get default defense attribute based on class
  const getDefaultDefenseAttribute = (): Atributo => {
    if (sheet.classe.name === 'Nobre') {
      return Atributo.CARISMA;
    }
    return Atributo.DESTREZA;
  };

  // Calculate bonus value from sheet bonuses (mirroring recalculateSheet logic)
  const calculateBonusValue = (bonus: {
    type: string;
    value?: number;
    attribute?: string;
    formula?: string;
  }): number => {
    if (bonus.type === 'Level') {
      return sheet.nivel;
    }
    if (bonus.type === 'HalfLevel') {
      return Math.floor(sheet.nivel / 2);
    }
    if (bonus.type === 'Attribute') {
      const attr = bonus.attribute as Atributo;
      return sheet.atributos[attr]?.value || 0;
    }
    if (bonus.type === 'SpecialAttribute') {
      if (bonus.attribute === 'spellKeyAttr' && sheet.classe.spellPath) {
        return sheet.atributos[sheet.classe.spellPath.keyAttribute].value;
      }
    }
    if (bonus.type === 'LevelCalc' && bonus.formula) {
      const formula = bonus.formula.replace(/{level}/g, sheet.nivel.toString());
      try {
        // eslint-disable-next-line no-eval
        return eval(formula);
      } catch {
        return 0;
      }
    }
    if (bonus.type === 'Fixed') {
      return bonus.value || 0;
    }
    return 0;
  };

  // Calculate defense preview based on current edits
  const calculateDefensePreview = (): number => {
    const base = editedData.customDefenseBase ?? 10;
    let total = base;

    // Add worn armor bonus (only the worn armor counts).
    if (wornArmor?.defenseBonus) {
      total += wornArmor.defenseBonus;
    }

    // Add wielded shield bonuses (only shields in a hand slot count).
    wieldedShields.forEach((shield) => {
      if (shield.defenseBonus) {
        total += shield.defenseBonus;
      }
    });

    // Add attribute modifier if applicable
    const heavyArmor = hasHeavyArmor();
    if (editedData.useDefenseAttribute && !heavyArmor) {
      const attrToUse =
        editedData.customDefenseAttribute || getDefaultDefenseAttribute();
      total += sheet.atributos[attrToUse].value;
    }

    // Add power bonuses
    const defenseBonuses = sheet.sheetBonuses.filter(
      (bonus) => bonus.target.type === 'Defense'
    );
    defenseBonuses.forEach((bonus) => {
      total += calculateBonusValue(bonus.modifier);
    });

    // Add manual bonus
    total += editedData.bonusDefense;

    return total;
  };

  // Generate defense calculation formula string
  const getDefenseCalculationFormula = (): string => {
    const base = editedData.customDefenseBase ?? 10;
    const components: string[] = [];

    components.push(`${base} (base)`);

    // Armor bonus (only the worn armor counts).
    if (wornArmor?.defenseBonus && wornArmor.defenseBonus > 0) {
      components.push(`${wornArmor.defenseBonus} (${wornArmor.nome})`);
    }

    // Shield bonuses (only shields wielded in a hand slot count).
    wieldedShields.forEach((shield) => {
      if (shield.defenseBonus && shield.defenseBonus > 0) {
        components.push(`${shield.defenseBonus} (${shield.nome})`);
      }
    });

    // Attribute modifier
    const heavyArmor = hasHeavyArmor();
    if (editedData.useDefenseAttribute && !heavyArmor) {
      const attrToUse =
        editedData.customDefenseAttribute || getDefaultDefenseAttribute();
      const attrValue = sheet.atributos[attrToUse].value;
      if (attrValue !== 0) {
        const attrName = attrToUse.substring(0, 3).toUpperCase();
        components.push(`${attrValue} (${attrName})`);
      }
    }

    // Power bonuses
    const defenseBonuses = sheet.sheetBonuses.filter(
      (bonus) => bonus.target.type === 'Defense'
    );
    defenseBonuses.forEach((bonus) => {
      const value = calculateBonusValue(bonus.modifier);
      if (value !== 0) {
        let sourceName = 'Desconhecido';
        if (bonus.source?.type === 'power') {
          sourceName = bonus.source.name;
        } else if (bonus.source?.type === 'origin') {
          sourceName = bonus.source.originName || 'Origem';
        } else if (bonus.source?.type === 'race') {
          sourceName = bonus.source.raceName || 'Raça';
        }
        components.push(`${value} (${sourceName})`);
      }
    });

    // Manual bonus
    if (editedData.bonusDefense !== 0) {
      components.push(`${editedData.bonusDefense} (bônus manual)`);
    }

    const formula = components.join(' + ');
    const total = calculateDefensePreview();
    return `${formula} = ${total}`;
  };

  const handleRdChange = (type: DamageType, value: number) => {
    const clampedValue = Math.max(0, value);
    setEditedRd((prev) => ({
      ...prev,
      [type]: clampedValue,
    }));
  };

  const handleSave = () => {
    // Derive manual RD (bonusRd) = edited total - auto RD, per damage type.
    const newBonusRd: DamageReduction = {};
    Object.entries(editedRd).forEach(([key, totalValue]) => {
      const type = key as DamageType;
      const autoValue = getAutoRd(sheet, type);
      const manualValue = (totalValue ?? 0) - autoValue;
      if (manualValue !== 0) {
        newBonusRd[type] = manualValue;
      }
    });

    const updates: Partial<CharacterSheet> = {
      customDefenseBase: editedData.customDefenseBase,
      customDefenseAttribute: editedData.customDefenseAttribute,
      useDefenseAttribute: editedData.useDefenseAttribute,
      bonusDefense: editedData.bonusDefense,
      bonusRd: Object.keys(newBonusRd).length > 0 ? newBonusRd : undefined,
    };

    // Create updated sheet with custom defense fields
    const updatedSheet = { ...sheet, ...updates };

    // Recalculate sheet to apply defense changes
    const recalculatedSheet = recalculateSheet(updatedSheet, sheet);

    // Let onSave handle the persistence (no need to save to localStorage here)
    onSave(recalculatedSheet);
    onClose();
  };

  const handleCancel = () => {
    setEditedData({
      customDefenseBase: sheet.customDefenseBase,
      customDefenseAttribute: sheet.customDefenseAttribute,
      useDefenseAttribute: sheet.useDefenseAttribute ?? true,
      bonusDefense: sheet.bonusDefense ?? 0,
    });
    setEditedRd(sheet.reducaoDeDano ?? {});
    onClose();
  };

  const renderRdField = (type: DamageType, size: 'small' | 'medium') => {
    const label = type === 'Geral' ? 'RD Geral' : `RD de ${type}`;
    return (
      <TextField
        key={type}
        fullWidth
        label={label}
        type='number'
        value={editedRd[type] ?? 0}
        onChange={(e) =>
          handleRdChange(type, parseInt(e.target.value, 10) || 0)
        }
        inputProps={{ min: 0, max: 99 }}
        size={size}
      />
    );
  };

  const heavyArmor = hasHeavyArmor();
  const defaultAttribute = getDefaultDefenseAttribute();
  const currentAttr = editedData.customDefenseAttribute || defaultAttribute;
  const currentAttrValue = sheet.atributos[currentAttr].value;

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Editar Defesa</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {/* Defesa Base */}
          <TextField
            fullWidth
            label='Defesa Base'
            type='number'
            value={editedData.customDefenseBase ?? 10}
            onChange={(e) => {
              const { value } = e.target;
              const numValue = parseInt(value, 10);
              setEditedData({
                ...editedData,
                customDefenseBase: numValue === 10 ? undefined : numValue,
              });
            }}
            helperText='Padrão: 10 (regra base de Tormenta 20)'
            inputProps={{ min: 0, max: 50 }}
          />

          {/* Usar Atributo na Defesa */}
          <Tooltip
            title={
              heavyArmor
                ? 'Armadura pesada equipada ignora modificador de atributo'
                : ''
            }
            arrow
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={editedData.useDefenseAttribute}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      useDefenseAttribute: e.target.checked,
                    })
                  }
                  disabled={heavyArmor}
                />
              }
              label='Usar Atributo na Defesa'
            />
          </Tooltip>
          <Typography variant='caption' color='text.secondary' sx={{ mt: -2 }}>
            {heavyArmor
              ? 'Armaduras pesadas ignoram o modificador de atributo'
              : 'Desmarque para ignorar modificador de atributo (ex: armaduras pesadas customizadas)'}
          </Typography>

          {/* Atributo de Defesa */}
          <FormControl
            fullWidth
            disabled={!editedData.useDefenseAttribute || heavyArmor}
          >
            <InputLabel>Atributo de Defesa</InputLabel>
            <Select
              value={editedData.customDefenseAttribute || defaultAttribute}
              onChange={(e) => {
                const selectedValue = e.target.value as Atributo;
                setEditedData({
                  ...editedData,
                  customDefenseAttribute:
                    selectedValue === defaultAttribute
                      ? undefined
                      : selectedValue,
                });
              }}
              label='Atributo de Defesa'
            >
              {Object.values(Atributo).map((attr) => (
                <MenuItem key={attr} value={attr}>
                  {attr}
                  {attr === defaultAttribute && ' (Padrão)'}
                </MenuItem>
              ))}
            </Select>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
              Modificador atual de {currentAttr}:{' '}
              {currentAttrValue >= 0 ? '+' : ''}
              {currentAttrValue}
            </Typography>
          </FormControl>

          {/* Bônus Manual */}
          <TextField
            fullWidth
            label='Bônus Manual de Defesa'
            type='number'
            value={editedData.bonusDefense}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10) || 0;
              setEditedData({
                ...editedData,
                bonusDefense: value,
              });
            }}
            helperText='Bônus adicional de fontes não automáticas'
            inputProps={{ min: -50, max: 50 }}
          />

          {/* Redução de Dano (RD) */}
          <Divider>
            <Typography variant='caption' color='text.secondary'>
              Redução de Dano
            </Typography>
          </Divider>
          <Typography variant='caption' color='text.secondary' sx={{ mt: -2 }}>
            Valores totais (automático + manual). Fontes automáticas como
            materiais (Adamante), raça e poderes já estão somadas — ajuste para
            adicionar RD de outras fontes.
          </Typography>

          {renderRdField('Geral', 'medium')}

          <Divider sx={{ my: 0.5 }}>
            <Typography variant='caption' color='text.secondary'>
              Por Tipo de Dano
            </Typography>
          </Divider>

          {SPECIFIC_DAMAGE_TYPES.map((type) => renderRdField(type, 'small'))}

          {/* Botão para Editar Equipamentos de Defesa */}
          <Button
            variant='outlined'
            startIcon={<ShieldIcon />}
            onClick={() => {
              onClose();
              onOpenEquipmentDrawer();
            }}
            fullWidth
          >
            Editar Equipamentos de Defesa
          </Button>

          {/* Preview do Cálculo */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 'bold' }}>
              📊 Preview do Cálculo
            </Typography>

            <Stack spacing={0.5}>
              <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                Defesa Total: {calculateDefensePreview()}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  wordBreak: 'break-word',
                }}
              >
                {getDefenseCalculationFormula()}
              </Typography>
            </Stack>
          </Box>

          {/* Buttons */}
          <Stack direction='row' spacing={2} sx={{ mt: 3 }}>
            <Button variant='outlined' onClick={handleCancel} fullWidth>
              Cancelar
            </Button>
            <Button variant='contained' onClick={handleSave} fullWidth>
              Salvar
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default DefenseEditDrawer;
