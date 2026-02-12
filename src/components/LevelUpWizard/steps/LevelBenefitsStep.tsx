import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { ClassAbility } from '@/interfaces/Class';
import {
  Atributo,
  ATTR_ABBREVIATIONS,
} from '@/data/systems/tormenta20/atributos';

interface LevelBenefitsStepProps {
  simulatedSheet: CharacterSheet;
  currentLevel: number;
}

interface LevelBenefits {
  pvGain: number;
  pvClassBase: number;
  pvAttrMod: number;
  pvAttrName: string;
  pmGain: number;
  pmClassBase: number;
  pmLevelCalcBonus: number;
  newAbilities: ClassAbility[];
  hasSkillBonusChange: boolean;
  oldTraining: number;
  newTraining: number;
  hasNewSpellCircle: boolean;
  newSpellCircle: number;
  spellCount: number;
}

const skillTrainingMod = (level: number): number => {
  if (level >= 15) return 6;
  if (level >= 7) return 4;
  return 2;
};

const LevelBenefitsStep: React.FC<LevelBenefitsStepProps> = ({
  simulatedSheet,
  currentLevel,
}) => {
  const [expandedAbilities, setExpandedAbilities] = useState<
    Record<string, boolean>
  >({});

  const toggleAbility = (name: string) => {
    setExpandedAbilities((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const benefits: LevelBenefits = useMemo(() => {
    // PV calculation
    const hpReplacement = simulatedSheet.sheetBonuses.find(
      (bonus) => bonus.target.type === 'HPAttributeReplacement'
    );
    let hpAttribute = Atributo.CONSTITUICAO;
    if (
      hpReplacement &&
      hpReplacement.target.type === 'HPAttributeReplacement'
    ) {
      hpAttribute = hpReplacement.target.newAttribute;
    }

    const pvClassBase = simulatedSheet.classe.addpv;
    const pvAttrMod = simulatedSheet.atributos[hpAttribute].value;
    let pvGain = pvClassBase + pvAttrMod;
    if (pvGain < 1) pvGain = 1;

    // PM calculation
    const pmClassBase = simulatedSheet.classe.addpm;
    let pmLevelCalcBonus = 0;
    simulatedSheet.sheetBonuses.forEach((bonus) => {
      if (bonus.target.type === 'PM' && bonus.modifier.type === 'LevelCalc') {
        const oldLevel = currentLevel - 1;
        const newLevel = currentLevel;
        const { formula } = bonus.modifier as {
          type: 'LevelCalc';
          formula: string;
        };

        const calcBonus = (level: number) => {
          const filledFormula = formula.replace('{level}', level.toString());
          try {
            // eslint-disable-next-line no-eval
            return eval(filledFormula);
          } catch {
            return 0;
          }
        };

        pmLevelCalcBonus += calcBonus(newLevel) - calcBonus(oldLevel);
      }
    });
    const pmGain = pmClassBase + pmLevelCalcBonus;

    // New class abilities
    const originalAbilities =
      simulatedSheet.classe.originalAbilities ||
      simulatedSheet.classe.abilities;
    const newAbilities = originalAbilities.filter(
      (ability) => ability.nivel === currentLevel
    );

    // Skill training bonus change
    const oldTraining = skillTrainingMod(currentLevel - 1);
    const newTraining = skillTrainingMod(currentLevel);
    const hasSkillBonusChange = newTraining > oldTraining;

    // Spell circle access
    const { spellPath } = simulatedSheet.classe;
    let hasNewSpellCircle = false;
    let newSpellCircle = 0;
    let spellCount = 0;

    if (
      spellPath &&
      typeof spellPath.spellCircleAvailableAtLevel === 'function'
    ) {
      const oldCircle = spellPath.spellCircleAvailableAtLevel(currentLevel - 1);
      const newCircle = spellPath.spellCircleAvailableAtLevel(currentLevel);
      if (newCircle > oldCircle) {
        hasNewSpellCircle = true;
        newSpellCircle = newCircle;
      }
    }

    if (spellPath && typeof spellPath.qtySpellsLearnAtLevel === 'function') {
      spellCount = spellPath.qtySpellsLearnAtLevel(currentLevel);
    }

    return {
      pvGain,
      pvClassBase,
      pvAttrMod,
      pvAttrName: ATTR_ABBREVIATIONS[hpAttribute],
      pmGain,
      pmClassBase,
      pmLevelCalcBonus,
      newAbilities,
      hasSkillBonusChange,
      oldTraining,
      newTraining,
      hasNewSpellCircle,
      newSpellCircle,
      spellCount,
    };
  }, [simulatedSheet, currentLevel]);

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Ganhos do Nível {currentLevel}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Confira os benefícios automáticos deste nível antes de fazer suas
        escolhas.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* PV Gain */}
        <Paper variant='outlined' sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FavoriteIcon sx={{ color: 'error.main' }} />
            <Typography variant='subtitle1' fontWeight='bold'>
              +{benefits.pvGain} Pontos de Vida
            </Typography>
          </Box>
          <Typography variant='body2' color='text.secondary' sx={{ ml: 4.5 }}>
            {benefits.pvClassBase} (classe) + {benefits.pvAttrMod} (
            {benefits.pvAttrName})
            {benefits.pvClassBase + benefits.pvAttrMod < 1 && ' = mínimo de 1'}
          </Typography>
        </Paper>

        {/* PM Gain */}
        <Paper variant='outlined' sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: 'info.main' }} />
            <Typography variant='subtitle1' fontWeight='bold'>
              +{benefits.pmGain} Pontos de Mana
            </Typography>
          </Box>
          <Typography variant='body2' color='text.secondary' sx={{ ml: 4.5 }}>
            {benefits.pmClassBase} (classe)
            {benefits.pmLevelCalcBonus > 0 &&
              ` + ${benefits.pmLevelCalcBonus} (bônus racial)`}
          </Typography>
        </Paper>

        {/* New Class Abilities */}
        {benefits.newAbilities.length > 0 && (
          <Paper variant='outlined' sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <StarIcon sx={{ color: 'warning.main' }} />
              <Typography variant='subtitle1' fontWeight='bold'>
                {benefits.newAbilities.length === 1
                  ? 'Nova Habilidade de Classe'
                  : 'Novas Habilidades de Classe'}
              </Typography>
            </Box>
            <List disablePadding>
              {benefits.newAbilities.map((ability) => (
                <ListItem
                  key={ability.name}
                  disablePadding
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    py: 0.5,
                    ml: 3.5,
                  }}
                  onClick={() => toggleAbility(ability.name)}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      width: '100%',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <ListItemText
                      primary={ability.name}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    <IconButton size='small'>
                      {expandedAbilities[ability.name] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </IconButton>
                  </Box>
                  <Collapse
                    in={expandedAbilities[ability.name]}
                    timeout='auto'
                    unmountOnExit
                  >
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 0.5, mb: 1, whiteSpace: 'pre-wrap' }}
                    >
                      {ability.text}
                    </Typography>
                  </Collapse>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Skill Training Bonus Change */}
        {benefits.hasSkillBonusChange && (
          <Alert severity='info' icon={false}>
            <Typography variant='body2'>
              <strong>Bônus de treino de perícias</strong> aumenta de +
              {benefits.oldTraining} para +{benefits.newTraining} para todas as
              perícias treinadas.
            </Typography>
          </Alert>
        )}

        {/* New Spell Circle */}
        {benefits.hasNewSpellCircle && (
          <Paper variant='outlined' sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MenuBookIcon sx={{ color: 'secondary.main' }} />
              <Typography variant='subtitle1' fontWeight='bold'>
                Acesso ao {benefits.newSpellCircle}º círculo de magias!
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Spells to Learn */}
        {benefits.spellCount > 0 && (
          <Alert severity='info' icon={<MenuBookIcon />}>
            <Typography variant='body2'>
              Você poderá aprender{' '}
              <strong>
                {benefits.spellCount}{' '}
                {benefits.spellCount === 1 ? 'magia' : 'magias'}
              </strong>{' '}
              neste nível. A seleção será feita em um passo posterior.
            </Typography>
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default LevelBenefitsStep;
