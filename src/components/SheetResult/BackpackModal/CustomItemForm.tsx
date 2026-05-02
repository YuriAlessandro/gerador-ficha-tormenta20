import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { v4 as uuid } from 'uuid';

import Equipment, {
  DefenseEquipment,
  equipGroup,
} from '../../../interfaces/Equipment';
import Skill from '../../../interfaces/Skills';
import { CATEGORY_ORDER } from './itemTypeStyles';
import { isDefenseGroup } from './equipmentCatalog';

export interface CustomItemFormProps {
  /** Optional initial values when editing an existing custom item. */
  initial?: Equipment;
  /** Pre-selects this category when creating a new custom item. */
  defaultGroup?: equipGroup;
  onCancel: () => void;
  onSubmit: (item: Equipment) => void;
}

const ALL_SKILLS = Object.values(Skill);

const CustomItemForm: React.FC<CustomItemFormProps> = ({
  initial,
  defaultGroup,
  onCancel,
  onSubmit,
}) => {
  const [nome, setNome] = useState(initial?.nome ?? '');
  const [group, setGroup] = useState<equipGroup>(
    initial?.group ?? defaultGroup ?? 'Item Geral'
  );
  const [spacesText, setSpacesText] = useState(
    initial?.spaces !== undefined ? String(initial.spaces) : '1'
  );
  const [precoText, setPrecoText] = useState(
    initial?.preco !== undefined ? String(initial.preco) : ''
  );
  const [descricao, setDescricao] = useState(initial?.descricao ?? '');

  // Weapon fields
  const [dano, setDano] = useState(initial?.dano ?? '');
  const [atkBonusText, setAtkBonusText] = useState(
    initial?.atkBonus !== undefined ? String(initial.atkBonus) : '0'
  );
  const [critico, setCritico] = useState(initial?.critico ?? 'x2');
  const [customSkill, setCustomSkill] = useState<Skill | ''>(
    initial?.customSkill ?? ''
  );

  // Defense fields
  const initialDefense =
    initial && isDefenseGroup(initial.group)
      ? (initial as DefenseEquipment)
      : null;
  const [defenseBonusText, setDefenseBonusText] = useState(
    initialDefense?.defenseBonus !== undefined
      ? String(initialDefense.defenseBonus)
      : '0'
  );
  const [armorPenaltyText, setArmorPenaltyText] = useState(
    initialDefense?.armorPenalty !== undefined
      ? String(initialDefense.armorPenalty)
      : '0'
  );
  const [isHeavyArmor, setIsHeavyArmor] = useState(
    initialDefense?.isHeavyArmor ?? false
  );
  const [canBeWielded, setCanBeWielded] = useState(
    initial?.canBeWielded ?? false
  );
  const [twoHanded, setTwoHanded] = useState(initial?.twoHanded ?? false);

  const [nomeError, setNomeError] = useState('');
  const [spacesError, setSpacesError] = useState('');

  // Categories that are wieldable by default — for these, hide the override
  // checkbox to avoid clutter (it would be redundant).
  const naturallyWieldable =
    group === 'Arma' || group === 'Escudo' || group === 'Alquimía';

  const handleSubmit = () => {
    const trimmedNome = nome.trim();
    if (!trimmedNome) {
      setNomeError('Nome é obrigatório');
      return;
    }
    setNomeError('');

    const spaces = parseFloat(spacesText.replace(',', '.'));
    if (Number.isNaN(spaces) || spaces < 0) {
      setSpacesError('Espaços deve ser um número ≥ 0');
      return;
    }
    setSpacesError('');

    const preco = parseFloat(precoText.replace(',', '.'));

    const baseItem: Equipment = {
      id: initial?.id ?? uuid(),
      nome: trimmedNome,
      group,
      spaces,
      isCustom: true,
      preco: Number.isNaN(preco) ? undefined : preco,
      descricao: descricao.trim() || undefined,
      rolls: initial?.rolls,
      quantity: initial?.quantity ?? 1,
      canBeWielded: !naturallyWieldable && canBeWielded ? true : undefined,
    };

    if (group === 'Arma') {
      const atkBonus = parseInt(atkBonusText, 10);
      baseItem.dano = dano.trim() || undefined;
      baseItem.atkBonus = Number.isNaN(atkBonus) ? 0 : atkBonus;
      baseItem.critico = critico.trim() || 'x2';
      baseItem.customSkill = (customSkill || undefined) as Skill | undefined;
      baseItem.baseDano = baseItem.dano;
      baseItem.baseAtkBonus = baseItem.atkBonus;
      baseItem.baseCritico = baseItem.critico;
      baseItem.twoHanded = twoHanded ? true : undefined;
    } else if (isDefenseGroup(group)) {
      const defenseBonus = parseInt(defenseBonusText, 10);
      const armorPenalty = parseInt(armorPenaltyText, 10);
      const def: DefenseEquipment = {
        ...(baseItem as DefenseEquipment),
        defenseBonus: Number.isNaN(defenseBonus) ? 0 : defenseBonus,
        armorPenalty: Number.isNaN(armorPenalty) ? 0 : armorPenalty,
        isHeavyArmor: group === 'Armadura' ? isHeavyArmor : false,
      };
      def.baseDefenseBonus = def.defenseBonus;
      def.baseArmorPenalty = def.armorPenalty;
      onSubmit(def);
      return;
    }

    onSubmit(baseItem);
  };

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            label='Nome do item'
            fullWidth
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={!!nomeError}
            helperText={nomeError}
            autoFocus
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select
              label='Categoria'
              value={group}
              onChange={(e) => setGroup(e.target.value as equipGroup)}
            >
              {CATEGORY_ORDER.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label='Espaços'
            fullWidth
            value={spacesText}
            onChange={(e) => setSpacesText(e.target.value)}
            error={!!spacesError}
            helperText={spacesError || 'Step 0,5'}
            inputProps={{ inputMode: 'decimal' }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label='Preço (T$)'
            fullWidth
            value={precoText}
            onChange={(e) => setPrecoText(e.target.value)}
            inputProps={{ inputMode: 'decimal' }}
          />
        </Grid>

        {group === 'Arma' && (
          <>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label='Dano'
                fullWidth
                value={dano}
                onChange={(e) => setDano(e.target.value)}
                placeholder='1d8'
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label='Bônus de Ataque'
                fullWidth
                value={atkBonusText}
                onChange={(e) => setAtkBonusText(e.target.value)}
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label='Crítico'
                fullWidth
                value={critico}
                onChange={(e) => setCritico(e.target.value)}
                placeholder='x2 ou 19/x2'
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Perícia (opcional)</InputLabel>
                <Select
                  label='Perícia (opcional)'
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value as Skill)}
                >
                  <MenuItem value=''>
                    <em>Padrão (Luta / Pontaria)</em>
                  </MenuItem>
                  {ALL_SKILLS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={twoHanded}
                    onChange={(e) => setTwoHanded(e.target.checked)}
                  />
                }
                label='Arma de duas mãos (ocupa ambas as mãos quando empunhada)'
              />
            </Grid>
          </>
        )}

        {isDefenseGroup(group) && (
          <>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label='Bônus de Defesa'
                fullWidth
                value={defenseBonusText}
                onChange={(e) => setDefenseBonusText(e.target.value)}
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label='Penalidade de Armadura'
                fullWidth
                value={armorPenaltyText}
                onChange={(e) => setArmorPenaltyText(e.target.value)}
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
            {group === 'Armadura' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isHeavyArmor}
                      onChange={(e) => setIsHeavyArmor(e.target.checked)}
                    />
                  }
                  label='Armadura pesada (impede bônus de Destreza)'
                />
              </Grid>
            )}
          </>
        )}

        <Grid size={12}>
          <TextField
            label='Descrição'
            fullWidth
            multiline
            minRows={2}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </Grid>

        {!naturallyWieldable && (
          <Grid size={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={canBeWielded}
                  onChange={(e) => setCanBeWielded(e.target.checked)}
                />
              }
              label='Pode ser empunhado (varinha, foco arcano, etc.)'
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button variant='contained' onClick={handleSubmit}>
          {initial ? 'Salvar item' : 'Criar item'}
        </Button>
      </Box>
    </Stack>
  );
};

export default CustomItemForm;
