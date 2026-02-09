/* eslint-disable no-console */
import React, { useState, useCallback, useMemo } from 'react';
import BugReportIcon from '@mui/icons-material/BugReport';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Card,
  Chip,
  Container,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Link,
} from '@mui/material';
import styled from '@emotion/styled';
import {
  MOREAU_HERITAGES,
  MoreauHeritageName,
} from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { isHeavyArmor } from '@/data/systems/tormenta20/equipamentos';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { Spell } from '@/interfaces/Spells';
import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import { CustomPower } from '@/interfaces/CustomPower';
import CharacterSheet, {
  DamageReduction,
} from '../../interfaces/CharacterSheet';
import Weapons from '../Weapons';
import DefenseEquipments from '../DefenseEquipments';
import Equipment from '../../interfaces/Equipment';
import '../../assets/css/result.css';
import Spells from '../Spells';
import SkillTable from './SkillTable';
import LabelDisplay from './LabelDisplay';
import AttributeDisplay from './AttributeDisplay';
import FancyBox from './common/FancyBox';
import BookTitle from './common/BookTitle';
import PowersDisplay from './PowersDisplay';
import RollButton from '../RollButton';
import SheetInfoEditDrawer from './EditDrawers/SheetInfoEditDrawer';
import SkillsEditDrawer from './EditDrawers/SkillsEditDrawer';
import EquipmentEditDrawer from './EditDrawers/EquipmentEditDrawer';
import PowersEditDrawer from './EditDrawers/PowersEditDrawer';
import SpellsEditDrawer from './EditDrawers/SpellsEditDrawer';
import DefenseEditDrawer from './EditDrawers/DefenseEditDrawer';
import RdEditDrawer from './EditDrawers/RdEditDrawer';
import StatControl from './StatControl';

// Styled components defined outside to prevent recreation on every render
const BackgroundBox = styled(Box)<{ isDarkMode: boolean }>`
  background-color: ${(props) => (props.isDarkMode ? '#212121' : '#f3f2f1')};
`;

interface ThemeProp {
  theme: {
    palette: {
      primary: {
        main: string;
      };
    };
  };
}

const StatTitle = styled.h4`
  font-family: 'Tfont';
  position: relative;
  font-size: 16px;
  text-transform: uppercase;
  margin: 0;
  white-space: nowrap;
`;

const StatLabel = styled.div<ThemeProp>`
  font-family: 'Tfont';
  text-align: center;
  width: 100%;
  font-size: 45px;
  color: ${(props) => props.theme.palette.primary.main};
  line-height: 1;
  margin: 0;
`;

const formatRdLabel = (rd: DamageReduction | undefined): string => {
  if (!rd) return '';
  const entries = Object.entries(rd)
    .filter(([, v]) => v && v > 0)
    .map(([type, v]) => `${v} ${type.toLowerCase()}`);
  if (entries.length === 0) return '';

  const MAX_LENGTH = 40;
  const full = entries.join(' | ');
  if (full.length <= MAX_LENGTH) return full;

  const truncated = entries.reduce((acc, entry) => {
    const next = acc ? `${acc} | ${entry}` : entry;
    if (next.length > MAX_LENGTH - 3) return acc;
    return next;
  }, '');
  return `${truncated}...`;
};

interface ResultProps {
  sheet: CharacterSheet;
  isDarkMode: boolean;
  onSheetUpdate?: (updatedSheet: CharacterSheet) => void;
}

const Result: React.FC<ResultProps> = (props) => {
  const { sheet, isDarkMode, onSheetUpdate } = props;
  const [currentSheet, setCurrentSheet] = useState(sheet);
  const [sheetInfoDrawerOpen, setSheetInfoDrawerOpen] = useState(false);
  const [skillsDrawerOpen, setSkillsDrawerOpen] = useState(false);
  const [equipmentDrawerOpen, setEquipmentDrawerOpen] = useState(false);
  const [powersDrawerOpen, setPowersDrawerOpen] = useState(false);
  const [spellsDrawerOpen, setSpellsDrawerOpen] = useState(false);
  const [defenseDrawerOpen, setDefenseDrawerOpen] = useState(false);
  const [rdDrawerOpen, setRdDrawerOpen] = useState(false);

  const theme = useTheme();

  // Update currentSheet when sheet prop changes
  React.useEffect(() => {
    setCurrentSheet(sheet);
  }, [sheet]);

  const handleSheetInfoUpdate = useCallback(
    (updates: Partial<CharacterSheet> | CharacterSheet) => {
      // Check if it's a full sheet (has required properties) or partial updates
      const isFullSheet =
        'id' in updates && 'nome' in updates && 'atributos' in updates;

      const updatedSheet = isFullSheet
        ? (updates as CharacterSheet)
        : { ...currentSheet, ...updates };

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleSkillsUpdate = useCallback(
    (updates: Partial<CharacterSheet>) => {
      const updatedSheet = { ...currentSheet, ...updates };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleEquipmentUpdate = useCallback(
    (updates: Partial<CharacterSheet>) => {
      const updatedSheet = { ...currentSheet, ...updates };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePowersUpdate = useCallback(
    (updates: Partial<CharacterSheet> | CharacterSheet) => {
      // Check if it's a full sheet (has required properties) or partial updates
      const isFullSheet =
        'id' in updates && 'nome' in updates && 'atributos' in updates;

      const updatedSheet = isFullSheet
        ? (updates as CharacterSheet)
        : { ...currentSheet, ...updates };

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleSpellsUpdate = useCallback(
    (updates: Partial<CharacterSheet>) => {
      const updatedSheet = { ...currentSheet, ...updates };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleSpellRollsUpdate = useCallback(
    (spell: Spell, newRolls: DiceRoll[]) => {
      const updatedSpells = currentSheet.spells?.map((s) =>
        s.nome === spell.nome ? { ...s, rolls: newRolls } : s
      );
      const updatedSheet = { ...currentSheet, spells: updatedSpells };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePowerRollsUpdate = useCallback(
    (
      power:
        | ClassPower
        | RaceAbility
        | ClassAbility
        | OriginPower
        | GeneralPower
        | CustomPower,
      newRolls: DiceRoll[]
    ) => {
      // Update in all possible power arrays
      const updatedGeneralPowers = currentSheet.generalPowers?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );
      const updatedClassPowers = currentSheet.classPowers?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );
      const updatedOriginPowers = currentSheet.origin?.powers?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );
      const updatedRaceAbilities = currentSheet.raca?.abilities?.map((a) =>
        a.name === power.name ? { ...a, rolls: newRolls } : a
      );
      const updatedClassAbilities = currentSheet.classe?.abilities?.map((a) =>
        a.name === power.name ? { ...a, rolls: newRolls } : a
      );
      const updatedDeityPowers = currentSheet.devoto?.poderes?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );
      const updatedCustomPowers = currentSheet.customPowers?.map((p) =>
        p.name === power.name ? { ...p, rolls: newRolls } : p
      );

      const updatedSheet = {
        ...currentSheet,
        generalPowers: updatedGeneralPowers,
        classPowers: updatedClassPowers,
        customPowers: updatedCustomPowers,
        origin:
          currentSheet.origin && updatedOriginPowers
            ? { ...currentSheet.origin, powers: updatedOriginPowers }
            : currentSheet.origin,
        raca:
          currentSheet.raca && updatedRaceAbilities
            ? { ...currentSheet.raca, abilities: updatedRaceAbilities }
            : currentSheet.raca,
        classe:
          currentSheet.classe && updatedClassAbilities
            ? { ...currentSheet.classe, abilities: updatedClassAbilities }
            : currentSheet.classe,
        devoto:
          currentSheet.devoto && updatedDeityPowers
            ? { ...currentSheet.devoto, poderes: updatedDeityPowers }
            : currentSheet.devoto,
      };

      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePVCurrentUpdate = useCallback(
    (newCurrent: number) => {
      const updatedSheet = { ...currentSheet, currentPV: newCurrent };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePVIncrementUpdate = useCallback(
    (newIncrement: number) => {
      const updatedSheet = { ...currentSheet, pvIncrement: newIncrement };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePMCurrentUpdate = useCallback(
    (newCurrent: number) => {
      const updatedSheet = { ...currentSheet, currentPM: newCurrent };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handlePMIncrementUpdate = useCallback(
    (newIncrement: number) => {
      const updatedSheet = { ...currentSheet, pmIncrement: newIncrement };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const handleSpellCast = useCallback(
    (pmSpent: number) => {
      const currentPMValue = currentSheet.currentPM ?? currentSheet.pm;
      const newPM = Math.max(0, currentPMValue - pmSpent);
      const updatedSheet = { ...currentSheet, currentPM: newPM };
      setCurrentSheet(updatedSheet);
      if (onSheetUpdate) {
        onSheetUpdate(updatedSheet);
      }
    },
    [currentSheet, onSheetUpdate]
  );

  const {
    nome,
    sexo,
    nivel,
    atributos,
    raca,
    raceHeritage,
    classe,
    pv,
    pm,
    defesa,
    bag,
    id,
    devoto,
    origin,
    spells,
    displacement,
    size,
    maxSpaces,
    customMaxSpaces,
    generalPowers = [],
    classPowers = [],
    steps,
    extraArmorPenalty = 0,
    completeSkills,
    dinheiro = 0,
  } = currentSheet;

  function getKey(elementId: string) {
    return `${id}-${elementId}`;
  }

  let className = `${classe.name}`;
  if (classe.subname) className = `${className} (${classe.subname})`;

  const periciasSorted = completeSkills
    ? [...completeSkills].sort((skillA, skillB) =>
        skillA.name < skillB.name ? -1 : 1
      )
    : undefined;

  const periciasDiv = useMemo(
    () => <SkillTable sheet={currentSheet} skills={periciasSorted} />,
    [currentSheet, periciasSorted]
  );

  const proficienciasDiv = useMemo(
    () =>
      classe.proficiencias.map((proe) => (
        <Chip sx={{ m: 0.5 }} label={proe} key={getKey(proe)} />
      )),
    [classe.proficiencias]
  );

  const bagEquipments = useMemo(() => {
    if (bag.getEquipments) {
      return bag.getEquipments();
    }
    return bag.equipments;
  }, [bag]);

  const equipsEntriesNoWeapons: Equipment[] = useMemo(
    () =>
      Object.entries(bagEquipments)
        .filter(
          ([key]) => key !== 'Arma' && key !== 'Armadura' && key !== 'Escudo'
        )
        .flatMap((value) => value[1]),
    [bagEquipments]
  );

  const equipamentosDiv = equipsEntriesNoWeapons.map((equip) => (
    <Box
      key={equip.nome}
      sx={{ display: 'inline-flex', alignItems: 'center', margin: 0.5 }}
    >
      <Chip
        sx={{ marginRight: equip.rolls && equip.rolls.length > 0 ? 0 : 0 }}
        label={`${equip.nome} ${
          equip.spaces ? equip.spaces > 0 && `[${equip.spaces} espaço(s)]` : ''
        }`}
      />
      {equip.rolls && equip.rolls.length > 0 && (
        <RollButton
          rolls={equip.rolls}
          iconOnly
          size='small'
          characterName={nome}
        />
      )}
    </Box>
  ));

  equipamentosDiv.push(
    ...bagEquipments.Arma.map((weapon) => (
      <Box
        key={getKey(weapon.nome)}
        sx={{ display: 'inline-flex', alignItems: 'center', margin: 0.5 }}
      >
        <Chip
          label={`${weapon.nome} ${
            weapon.spaces
              ? weapon.spaces > 0 && `[${weapon.spaces} espaço(s)]`
              : ''
          }`}
        />
        {weapon.rolls && weapon.rolls.length > 0 && (
          <RollButton
            rolls={weapon.rolls}
            iconOnly
            size='small'
            characterName={nome}
          />
        )}
      </Box>
    ))
  );

  equipamentosDiv.push(
    ...bagEquipments.Armadura.map((armor) => (
      <Box
        key={getKey(armor.nome)}
        sx={{ display: 'inline-flex', alignItems: 'center', margin: 0.5 }}
      >
        <Chip
          label={`${armor.nome} ${
            armor.spaces
              ? armor.spaces > 0 && `[${armor.spaces} espaço(s)]`
              : ''
          }`}
        />
        {armor.rolls && armor.rolls.length > 0 && (
          <RollButton
            rolls={armor.rolls}
            iconOnly
            size='small'
            characterName={nome}
          />
        )}
      </Box>
    ))
  );

  equipamentosDiv.push(
    ...bagEquipments.Escudo.map((shield) => (
      <Box
        key={getKey(shield.nome)}
        sx={{ display: 'inline-flex', alignItems: 'center', margin: 0.5 }}
      >
        <Chip
          label={`${shield.nome} ${
            shield.spaces
              ? shield.spaces > 0 && `[${shield.spaces} espaço(s)]`
              : ''
          }`}
        />
        {shield.rolls && shield.rolls.length > 0 && (
          <RollButton
            rolls={shield.rolls}
            iconOnly
            size='small'
            characterName={nome}
          />
        )}
      </Box>
    ))
  );

  const modFor = atributos.Força.value;

  const fightSkill = completeSkills?.find((skill) => skill.name === 'Luta');
  const rangeSkill = completeSkills?.find((skill) => skill.name === 'Pontaria');

  const fightAttrBonus = fightSkill?.modAttr
    ? currentSheet.atributos[fightSkill.modAttr].value
    : 0;
  const fightBonus =
    (fightSkill?.halfLevel ?? 0) +
    fightAttrBonus +
    (fightSkill?.others ?? 0) +
    (fightSkill?.training ?? 0);

  const rangeAttrBonus = rangeSkill?.modAttr
    ? currentSheet.atributos[rangeSkill.modAttr].value
    : 0;
  const rangeBonus =
    (rangeSkill?.halfLevel ?? 0) +
    rangeAttrBonus +
    (rangeSkill?.others ?? 0) +
    (rangeSkill?.training ?? 0);

  const weaponsDiv = useMemo(
    () => (
      <Weapons
        getKey={getKey}
        weapons={bagEquipments.Arma}
        fightBonus={fightBonus}
        rangeBonus={rangeBonus}
        modFor={modFor}
        characterName={nome}
      />
    ),
    [bagEquipments.Arma, fightBonus, rangeBonus, modFor, nome]
  );

  const defenseEquipments = useMemo(
    () => [...bagEquipments.Armadura, ...bagEquipments.Escudo],
    [bagEquipments.Armadura, bagEquipments.Escudo]
  );

  const defenseFormula = useMemo(() => {
    const base = currentSheet.customDefenseBase ?? 10;
    const components: string[] = [];
    components.push(`${base} (base)`);

    // Armor and shield bonuses
    defenseEquipments.forEach((equip) => {
      if (equip.defenseBonus && equip.defenseBonus > 0) {
        components.push(`${equip.defenseBonus} (${equip.nome})`);
      }
    });

    // Check if character has heavy armor
    const hasHeavyArmor = bagEquipments.Armadura?.some((armor) =>
      isHeavyArmor(armor)
    );

    // Attribute modifier
    const useAttr = currentSheet.useDefenseAttribute ?? true;
    if (useAttr && !hasHeavyArmor) {
      const defaultAttr =
        classe.name === 'Nobre' ? Atributo.CARISMA : Atributo.DESTREZA;
      const attrToUse = currentSheet.customDefenseAttribute || defaultAttr;
      const attrValue = atributos[attrToUse]?.value || 0;
      if (attrValue !== 0) {
        const attrName = attrToUse.substring(0, 3).toUpperCase();
        components.push(`${attrValue} (${attrName})`);
      }
    }

    // Manual bonus
    if (currentSheet.bonusDefense && currentSheet.bonusDefense !== 0) {
      components.push(`${currentSheet.bonusDefense} (bônus manual)`);
    }

    return `${components.join(' + ')} = ${defesa}`;
  }, [
    currentSheet,
    defenseEquipments,
    bagEquipments.Armadura,
    classe.name,
    atributos,
    defesa,
  ]);

  // const uniqueGeneralPowers = filterUnique(generalPowers);
  // const uniqueClassPowers = filterUnique(classPowers);

  const keyAttr = classe.spellPath
    ? atributos[classe.spellPath.keyAttribute]
    : null;

  // Helper function to format attribute modifiers correctly
  const formatAttributeModifier = useCallback(
    (value: number | string): string => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (Number.isNaN(numValue)) return String(value);
      if (numValue === 0) return '0';
      if (numValue > 0) return `+${numValue}`;
      return String(numValue); // Negative values already have '-'
    },
    []
  );

  const changesDiv = steps.map((step) => {
    if (step.type === 'Atributos') {
      return (
        <li key={getKey(`${step.label}-${step.value}`)}>
          <strong>{step.label}:</strong>
          <ul className='stepAttrList'>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{`${
                attr.name
              }: ${formatAttributeModifier(attr.value as number)}`}</li>
            ))}
          </ul>
        </li>
      );
    }
    if (
      step.type === 'Perícias' ||
      step.type === 'Magias' ||
      step.type === 'Equipamentos' ||
      step.type === 'Atributos Extras' ||
      step.type === 'Edição Manual'
    ) {
      return (
        <li key={getKey(step.label)}>
          <strong>{step.label}:</strong>
          <ul className='stepAttrList'>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{attr.value}</li>
            ))}
          </ul>
        </li>
      );
    }
    if (step.type === 'Poderes' || step.type === 'Nível') {
      return (
        <li key={getKey(step.label)}>
          <strong>{step.label}:</strong>
          <ul>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{`${attr.name}${
                attr.value ? ': ' : ''
              }${attr.value}`}</li>
            ))}
          </ul>
        </li>
      );
    }
    return (
      <li
        key={getKey(
          `${step.label}-${step.value[0] ? `: ${step.value[0].value}` : ''}`
        )}
      >
        <strong>{step.label}</strong>
        {`${step.value[0] ? `: ${step.value[0].value}` : ''}`}
      </li>
    );
  });

  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  const hasAnyRd =
    currentSheet.reducaoDeDano &&
    Object.values(currentSheet.reducaoDeDano).some((v) => v && v > 0);

  const defenseInfoWidth = isMobile ? '100%' : '80%';

  return (
    <BackgroundBox isDarkMode={isDarkMode} sx={{ p: isMobile ? 0 : 2 }}>
      <Container maxWidth='xl' sx={{ p: isMobile ? 0 : 2 }}>
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
          {/* LADO ESQUERDO, 60% */}
          <Box width={isMobile ? '100%' : '60%'}>
            {/* PARTE DE CIMA: Informações da ficha */}
            <Card
              sx={{
                p: 3,
                mb: 4,
                minHeight: isMobile ? 'inherit' : '180px',
                position: 'relative',
                overflow: 'visible', // Allow the button to show outside the card
              }}
            >
              {onSheetUpdate && (
                <IconButton
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: -16, // Half the button height to position it on the edge
                    right: 16,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: 1, // Makes it square with slightly rounded corners
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={() => setSheetInfoDrawerOpen(true)}
                >
                  <EditIcon />
                </IconButton>
              )}
              <Stack
                direction='row'
                spacing={2}
                alignItems='center'
                flexWrap='wrap'
                justifyContent='center'
                gap={isMobile ? 5 : 0}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <LabelDisplay text={nome} size='large' />
                  <LabelDisplay
                    text={`${raca.name}${
                      raca.name === 'Moreau' && raceHeritage
                        ? ` (${
                            MOREAU_HERITAGES[raceHeritage as MoreauHeritageName]
                              ?.name || raceHeritage
                          })`
                        : ''
                    } ${className}${sexo ? ` (${sexo})` : ''}`}
                    size='medium'
                  />
                  <LabelDisplay title='Nível' text={`${nivel}`} size='small' />
                  {origin && (
                    <LabelDisplay
                      title='Origem'
                      text={origin.name || 'Não possui'}
                      size='small'
                    />
                  )}
                  {devoto && (
                    <LabelDisplay
                      title='Divindade'
                      text={devoto.divindade.name}
                      size='small'
                    />
                  )}
                </Box>
                <Stack
                  justifyContent='space-around'
                  alignItems='center'
                  direction='row'
                  spacing={3}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <StatControl
                      type='PV'
                      current={currentSheet.currentPV ?? pv}
                      max={pv}
                      calculatedMax={pv}
                      increment={currentSheet.pvIncrement ?? 1}
                      onUpdateCurrent={handlePVCurrentUpdate}
                      onUpdateIncrement={handlePVIncrementUpdate}
                      disabled={!onSheetUpdate}
                    />
                    {currentSheet.manualMaxPV !== undefined &&
                      currentSheet.manualMaxPV > 0 && (
                        <Tooltip title='Cálculo automático desativado. Edite nas configurações para alterar.'>
                          <Chip
                            size='small'
                            label='Manual'
                            color='warning'
                            sx={{ mt: 1, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <StatControl
                      type='PM'
                      current={currentSheet.currentPM ?? pm}
                      max={pm}
                      calculatedMax={pm}
                      increment={currentSheet.pmIncrement ?? 1}
                      onUpdateCurrent={handlePMCurrentUpdate}
                      onUpdateIncrement={handlePMIncrementUpdate}
                      disabled={!onSheetUpdate}
                    />
                    {currentSheet.manualMaxPM !== undefined &&
                      currentSheet.manualMaxPM > 0 && (
                        <Tooltip title='Cálculo automático desativado. Edite nas configurações para alterar.'>
                          <Chip
                            size='small'
                            label='Manual'
                            color='warning'
                            sx={{ mt: 1, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                  </Box>
                </Stack>
              </Stack>
            </Card>

            {/* PARTE DO MEIO: Atributos */}
            {!isMobile && (
              <Box
                sx={
                  isMobile
                    ? { mt: '-290px', position: 'relative' }
                    : { mt: '-90px', position: 'relative' }
                }
              >
                <AttributeDisplay attributes={atributos} characterName={nome} />
              </Box>
            )}
            {isMobile && (
              <Card
                sx={{
                  p: 3,
                  mb: 4,
                  position: 'relative',
                  overflow: 'visible', // Allow the button to show outside the card
                }}
              >
                <BookTitle>Atributos</BookTitle>
                <AttributeDisplay attributes={atributos} characterName={nome} />
              </Card>
            )}

            {/* Card de Ataques */}
            <Card
              sx={{
                p: 3,
                mb: 4,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {onSheetUpdate && (
                <IconButton
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 16,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={() => setEquipmentDrawerOpen(true)}
                >
                  <EditIcon />
                </IconButton>
              )}
              <BookTitle>Ataques</BookTitle>
              {weaponsDiv}
            </Card>

            {/* Card de Defesa */}
            <Card
              sx={{
                p: 3,
                mb: 4,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {onSheetUpdate && (
                <IconButton
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 16,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={() => setDefenseDrawerOpen(true)}
                >
                  <EditIcon />
                </IconButton>
              )}
              <BookTitle>Defesa</BookTitle>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                alignItems='center'
              >
                <Box
                  width={isMobile ? '100%' : '20%'}
                  display='flex'
                  flexDirection='column'
                  alignItems='center'
                  justifyContent='center'
                  order={isMobile ? 1 : 0}
                >
                  <FancyBox>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        fontSize: '68px',
                      }}
                    >
                      <StatLabel theme={theme}>{defesa}</StatLabel>
                      <StatTitle>Defesa</StatTitle>
                    </Box>
                  </FancyBox>
                  {(hasAnyRd || onSheetUpdate) && (
                    <Tooltip
                      title={
                        onSheetUpdate
                          ? 'Clique para editar Redução de Dano'
                          : formatRdLabel(currentSheet.reducaoDeDano)
                      }
                      arrow
                    >
                      <Typography
                        onClick={() => onSheetUpdate && setRdDrawerOpen(true)}
                        sx={{
                          mt: 0.5,
                          fontSize: '11px',
                          color: hasAnyRd ? 'text.secondary' : 'text.disabled',
                          cursor: onSheetUpdate ? 'pointer' : 'default',
                          textAlign: 'center',
                          maxWidth: '140px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          ...(onSheetUpdate
                            ? {
                                '&:hover': {
                                  color: 'primary.main',
                                  textDecoration: 'underline',
                                },
                              }
                            : {}),
                        }}
                      >
                        {hasAnyRd
                          ? `RD: ${formatRdLabel(currentSheet.reducaoDeDano)}`
                          : 'RD: —'}
                      </Typography>
                    </Tooltip>
                  )}
                </Box>
                <Box width={defenseInfoWidth} order={isMobile ? 0 : 1}>
                  <DefenseEquipments
                    getKey={getKey}
                    defenseEquipments={defenseEquipments}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      mt: 1,
                    }}
                  >
                    <Typography fontSize={12} color='text.secondary'>
                      <strong>Penalidade de Armadura: </strong>
                      {((bag.getArmorPenalty
                        ? bag.getArmorPenalty()
                        : bag.armorPenalty) +
                        extraArmorPenalty) *
                        -1}
                    </Typography>
                  </Box>
                  <Typography
                    fontSize={12}
                    color='text.secondary'
                    sx={{ mt: 1, fontFamily: 'monospace' }}
                  >
                    {defenseFormula}
                  </Typography>
                </Box>
              </Stack>
            </Card>
            <Card
              sx={{ p: 3, mb: 4, position: 'relative', overflow: 'visible' }}
            >
              {onSheetUpdate && (
                <IconButton
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 16,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={() => setPowersDrawerOpen(true)}
                >
                  <EditIcon />
                </IconButton>
              )}
              <Box>
                <BookTitle>Poderes</BookTitle>
                <PowersDisplay
                  sheetHistory={currentSheet.sheetActionHistory || []}
                  classAbilities={classe.abilities}
                  classPowers={classPowers}
                  raceAbilities={raca.abilities}
                  originPowers={origin?.powers || []}
                  deityPowers={devoto?.poderes || []}
                  generalPowers={generalPowers}
                  customPowers={currentSheet.customPowers || []}
                  className={classe.name}
                  raceName={raca.name}
                  deityName={devoto?.divindade?.name}
                  onUpdateRolls={
                    onSheetUpdate ? handlePowerRollsUpdate : undefined
                  }
                  characterName={nome}
                />
              </Box>
            </Card>
            <Card
              sx={{ p: 3, mb: 4, position: 'relative', overflow: 'visible' }}
            >
              {onSheetUpdate && (
                <IconButton
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 16,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={() => setSpellsDrawerOpen(true)}
                >
                  <EditIcon />
                </IconButton>
              )}
              <Box>
                <BookTitle>Magias</BookTitle>
                <Spells
                  spells={spells}
                  spellPath={classe.spellPath}
                  keyAttr={keyAttr}
                  nivel={nivel}
                  onUpdateRolls={
                    onSheetUpdate ? handleSpellRollsUpdate : undefined
                  }
                  characterName={nome}
                  currentPM={currentSheet.currentPM ?? pm}
                  maxPM={pm}
                  onSpellCast={onSheetUpdate ? handleSpellCast : undefined}
                />
              </Box>
            </Card>
          </Box>
          {/* LADO DIREITO, 40% */}
          <Box width={isMobile ? '100%' : '40%'}>
            <Stack spacing={4}>
              <Card sx={{ position: 'relative', overflow: 'visible' }}>
                {onSheetUpdate && (
                  <IconButton
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: 16,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => setSkillsDrawerOpen(true)}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {periciasDiv}
              </Card>
              <Card sx={{ position: 'relative', overflow: 'visible' }}>
                {onSheetUpdate && (
                  <IconButton
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: 16,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => setEquipmentDrawerOpen(true)}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <Box p={2}>
                  <BookTitle>Equipamentos</BookTitle>
                  <Stack
                    // spacing={2}
                    direction='row'
                    flexWrap='wrap'
                    justifyContent='flex-start'
                  >
                    {equipamentosDiv}
                  </Stack>
                  <Box mt={2}>
                    <strong>Dinheiro: </strong>
                    T$ {dinheiro}
                  </Box>
                  <Box mt={1}>
                    <strong>Espaços (atual/limite-máximo): </strong>
                    {bag.getSpaces()}/{customMaxSpaces ?? maxSpaces}-
                    {(customMaxSpaces ?? maxSpaces) * 2}
                  </Box>
                </Box>
              </Card>
              <Card sx={{ p: 2 }}>
                <BookTitle>Proficiências</BookTitle>
                <Stack direction='row' flexWrap='wrap'>
                  {proficienciasDiv}
                </Stack>
              </Card>
              <Card sx={{ p: 2 }}>
                <Stack spacing={2} direction='row' justifyContent='center'>
                  <FancyBox>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.3,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'Tfont',
                          fontSize: '35px',
                          color: theme.palette.primary.main,
                          textAlign: 'center',
                          lineHeight: 1,
                          margin: 0,
                        }}
                      >
                        {displacement}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'Tfont',
                          fontSize: '16px',
                          color: theme.palette.text.secondary,
                          textAlign: 'center',
                          margin: 0,
                        }}
                      >
                        ({Math.floor(displacement / 1.5)}q)
                      </Typography>
                      <StatTitle>Desl.</StatTitle>
                    </Box>
                  </FancyBox>
                  <FancyBox>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'Tfont',
                          fontSize: '58px',
                          color: theme.palette.primary.main,
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          lineHeight: 1,
                          margin: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {size.name.charAt(0)}
                      </Typography>
                      <StatTitle>Tamanho</StatTitle>
                    </Box>
                  </FancyBox>
                </Stack>
              </Card>
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ mt: 2, width: '100%' }}>
          {/* Bug Report Alert */}
          <Alert severity='info' icon={<BugReportIcon />} sx={{ mb: 2 }}>
            Encontrou algum problema nessa ficha?{' '}
            <Link
              href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/categories/problemas'
              target='_blank'
              rel='noopener noreferrer'
              sx={{ fontWeight: 'bold' }}
            >
              Nos avise!
            </Link>
          </Alert>

          {/* Passo-a-passo Accordion */}
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls='steps-content'
              id='steps-header'
            >
              <Typography variant='h6' sx={{ fontFamily: 'Tfont' }}>
                Passo-a-passo da criação
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component='ul' sx={{ pl: 2 }}>
                {changesDiv}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>

      <>
        <SheetInfoEditDrawer
          open={sheetInfoDrawerOpen}
          onClose={() => setSheetInfoDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSheetInfoUpdate}
        />

        <SkillsEditDrawer
          open={skillsDrawerOpen}
          onClose={() => setSkillsDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSkillsUpdate}
        />

        <EquipmentEditDrawer
          open={equipmentDrawerOpen}
          onClose={() => setEquipmentDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleEquipmentUpdate}
        />

        <PowersEditDrawer
          open={powersDrawerOpen}
          onClose={() => setPowersDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handlePowersUpdate}
        />

        <SpellsEditDrawer
          open={spellsDrawerOpen}
          onClose={() => setSpellsDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSpellsUpdate}
        />

        <DefenseEditDrawer
          open={defenseDrawerOpen}
          onClose={() => setDefenseDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSheetInfoUpdate}
          onOpenEquipmentDrawer={() => setEquipmentDrawerOpen(true)}
        />

        <RdEditDrawer
          open={rdDrawerOpen}
          onClose={() => setRdDrawerOpen(false)}
          sheet={currentSheet}
          onSave={handleSheetInfoUpdate}
        />
      </>
    </BackgroundBox>
  );
};

export default Result;
