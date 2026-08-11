import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Equipment, {
  AttackAttribute,
  DamageAttribute,
  WeaponOverride,
} from '../../interfaces/Equipment';
import Skill from '../../interfaces/Skills';
import { resolveDamageAttribute } from '../../functions/weaponSkill';
import {
  ATTACK_ATTRIBUTE_DEFAULT_LABEL,
  WEAPON_ATTRIBUTE_OPTIONS,
} from './BackpackModal/weaponAttributeOptions';

const ALL_SKILLS = Object.values(Skill);

export interface WeaponAttributesDialogProps {
  open: boolean;
  onClose: () => void;
  weapon: Equipment;
  onSave: (next: WeaponOverride) => void;
}

/**
 * Edição dos campos SEMÂNTICOS de uma arma direto da aba Ataques: perícia
 * rolada e atributos de ataque e dano.
 *
 * Existe separado do `ItemEditorDialog` da Mochila por dois motivos. Primeiro,
 * as armas naturais da Forma Selvagem são virtuais — não estão na mochila, logo
 * o editor de lá é inalcançável e seu `onSave` gravaria um item fantasma na
 * bag. Segundo, mesmo para armas da mochila, abas de modificações, quantidade e
 * material especial são ruído quando o jogador só quer trocar o atributo.
 */
const WeaponAttributesDialog: React.FC<WeaponAttributesDialogProps> = (
  props
) => {
  const { open, onClose, weapon, onSave } = props;
  const isMobile = useMediaQuery('(max-width:768px)', { noSsr: true });

  const [customSkill, setCustomSkill] = useState<Skill | ''>('');
  const [attackAttribute, setAttackAttribute] = useState<AttackAttribute | ''>(
    ''
  );
  const [damageAttribute, setDamageAttribute] =
    useState<DamageAttribute>('Nenhum');

  // Reabrir o diálogo tem que refletir o estado atual da arma — inclusive
  // depois de o pai persistir uma edição anterior.
  useEffect(() => {
    if (!open) return;
    setCustomSkill(weapon.customSkill ?? '');
    setAttackAttribute(weapon.attackAttribute ?? '');
    setDamageAttribute(resolveDamageAttribute(weapon));
  }, [open, weapon]);

  const handleSave = () => {
    onSave({
      customSkill: customSkill || undefined,
      attackAttribute: attackAttribute || undefined,
      damageAttribute,
    });
    onClose();
  };

  // "Padrão" = nenhum override. O atributo de dano volta a ser derivado da
  // regra de melee/ranged, então nem ele é gravado.
  const handleReset = () => {
    onSave({});
    onClose();
  };

  const weaponName = weapon.customDisplayName?.trim() || weapon.nome;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth='xs'
      fullWidth
    >
      <DialogTitle>Ataque e dano — {weaponName}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Perícia</InputLabel>
              <Select
                label='Perícia'
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value as Skill | '')}
              >
                <MenuItem value=''>
                  <em>Padrão (Luta / Pontaria)</em>
                </MenuItem>
                {ALL_SKILLS.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {skill}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Atributo no ataque</InputLabel>
              <Select
                label='Atributo no ataque'
                value={attackAttribute}
                onChange={(e) =>
                  setAttackAttribute(e.target.value as AttackAttribute | '')
                }
              >
                <MenuItem value=''>
                  <em>{ATTACK_ATTRIBUTE_DEFAULT_LABEL}</em>
                </MenuItem>
                {WEAPON_ATTRIBUTE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Atributo no dano</InputLabel>
              <Select
                label='Atributo no dano'
                value={damageAttribute}
                onChange={(e) =>
                  setDamageAttribute(e.target.value as DamageAttribute)
                }
              >
                {WEAPON_ATTRIBUTE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              A perícia define o treinamento e os outros bônus do teste.
              &quot;Atributo no ataque&quot; troca só o atributo dentro dela —
              use para Acuidade com Arma, Armeiro ou uma forma selvagem que
              ataca com outro atributo.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        <Button onClick={handleReset} color='inherit'>
          Restaurar padrão
        </Button>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant='contained'>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WeaponAttributesDialog;
