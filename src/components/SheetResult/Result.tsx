/* eslint-disable no-console */
import React, { useState, useCallback, useMemo } from 'react';
import BugReportIcon from '@mui/icons-material/BugReport';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Card,
  Chip,
  Container,
  Stack,
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
import { DiceRoll } from '@/interfaces/DiceRoll';
import { Spell } from '@/interfaces/Spells';
import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import CharacterSheet from '../../interfaces/CharacterSheet';
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
import SheetInfoEditDrawer from './EditDrawers/SheetInfoEditDrawer';
import SkillsEditDrawer from './EditDrawers/SkillsEditDrawer';
import EquipmentEditDrawer from './EditDrawers/EquipmentEditDrawer';
import PowersEditDrawer from './EditDrawers/PowersEditDrawer';
import SpellsEditDrawer from './EditDrawers/SpellsEditDrawer';
import DefenseEditDrawer from './EditDrawers/DefenseEditDrawer';
import BreadcrumbNav, { BreadcrumbItem } from '../common/BreadcrumbNav';
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
  font-size: 9px;
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

interface ResultProps {
  sheet: CharacterSheet;
  isDarkMode: boolean;
  onSheetUpdate?: (updatedSheet: CharacterSheet) => void;
  isSavedToCloud?: boolean;
}

const Result: React.FC<ResultProps> = (props) => {
  const { sheet, isDarkMode, onSheetUpdate, isSavedToCloud } = props;
  const [currentSheet, setCurrentSheet] = useState(sheet);
  const [sheetInfoDrawerOpen, setSheetInfoDrawerOpen] = useState(false);
  const [skillsDrawerOpen, setSkillsDrawerOpen] = useState(false);
  const [equipmentDrawerOpen, setEquipmentDrawerOpen] = useState(false);
  const [powersDrawerOpen, setPowersDrawerOpen] = useState(false);
  const [spellsDrawerOpen, setSpellsDrawerOpen] = useState(false);
  const [defenseDrawerOpen, setDefenseDrawerOpen] = useState(false);

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
        | GeneralPower,
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

      const updatedSheet = {
        ...currentSheet,
        generalPowers: updatedGeneralPowers,
        classPowers: updatedClassPowers,
        origin:
          currentSheet.origin && updatedOriginPowers
            ? { ...currentSheet.origin, powers: updatedOriginPowers }
            : currentSheet.origin,
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
    <Chip
      key={equip.nome}
      sx={{ margin: 0.5 }}
      label={`${equip.nome} ${
        equip.spaces ? equip.spaces > 0 && `[${equip.spaces} espaço(s)]` : ''
      }`}
    />
  ));

  equipamentosDiv.push(
    ...bagEquipments.Arma.map((weapon) => (
      <Chip
        key={getKey(weapon.nome)}
        sx={{ margin: 0.5 }}
        label={`${weapon.nome} ${
          weapon.spaces
            ? weapon.spaces > 0 && `[${weapon.spaces} espaço(s)]`
            : ''
        }`}
      />
    ))
  );

  equipamentosDiv.push(
    ...bagEquipments.Armadura.map((armor) => (
      <Chip
        key={getKey(armor.nome)}
        sx={{ margin: 0.5 }}
        label={`${armor.nome} ${
          armor.spaces ? armor.spaces > 0 && `[${armor.spaces} espaço(s)]` : ''
        }`}
      />
    ))
  );

  equipamentosDiv.push(
    ...bagEquipments.Escudo.map((shield) => (
      <Chip
        key={getKey(shield.nome)}
        sx={{ margin: 0.5 }}
        label={`${shield.nome} ${
          shield.spaces
            ? shield.spaces > 0 && `[${shield.spaces} espaço(s)]`
            : ''
        }`}
      />
    ))
  );

  const modFor = atributos.Força.mod;

  const fightSkill = completeSkills?.find((skill) => skill.name === 'Luta');
  const rangeSkill = completeSkills?.find((skill) => skill.name === 'Pontaria');

  const fightAttrBonus = fightSkill?.modAttr
    ? currentSheet.atributos[fightSkill.modAttr].mod
    : 0;
  const fightBonus =
    (fightSkill?.halfLevel ?? 0) +
    fightAttrBonus +
    (fightSkill?.others ?? 0) +
    (fightSkill?.training ?? 0);

  const rangeAttrBonus = rangeSkill?.modAttr
    ? currentSheet.atributos[rangeSkill.modAttr].mod
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

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = useMemo(
    () =>
      isSavedToCloud
        ? [
            { label: 'Home', href: '/', icon: <HomeIcon fontSize='small' /> },
            { label: 'Meus Personagens', href: '/meus-personagens' },
            { label: nome, icon: <PersonIcon fontSize='small' /> },
          ]
        : [
            { label: 'Home', href: '/', icon: <HomeIcon fontSize='small' /> },
            { label: 'Criar Ficha', href: '/criar-ficha' },
            { label: 'Resultado' },
          ],
    [isSavedToCloud, nome]
  );

  return (
    <BackgroundBox isDarkMode={isDarkMode} sx={{ p: 2 }}>
      <Container maxWidth='xl'>
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav items={breadcrumbItems} />

        <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
          {/* LADO ESQUERDO, 60% */}
          <Box width={isMobile ? '100%' : '60%'}>
            {/* PARTE DE CIMA: Informações da ficha */}
            <Card
              sx={{
                p: 3,
                mb: 4,
                minHeight: isMobile ? '500px' : '180px',
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
                    } ${className} (${sexo})`}
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
                </Stack>
              </Stack>
            </Card>

            {/* PARTE DO MEIO: Atributos */}
            <Box
              sx={
                isMobile
                  ? { mt: '-290px', position: 'relative' }
                  : { mt: '-90px', position: 'relative' }
              }
            >
              <AttributeDisplay attributes={atributos} characterName={nome} />
            </Box>

            {/* PARTE DE BAIXO: Ataques, Poderes, Magias, Inventário */}
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
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                justifyContent='space-between'
                alignItems='center'
              >
                <Box width={isMobile ? '100%' : '50%'}>
                  <BookTitle>Ataques</BookTitle>
                  {weaponsDiv}
                </Box>
                <Box width={isMobile ? '100%' : '50%'}>
                  <BookTitle>Defesa</BookTitle>
                  <DefenseEquipments
                    getKey={getKey}
                    defenseEquipments={defenseEquipments}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Typography fontSize={12}>
                      <strong>Penalidade de Armadura: </strong>
                      {((bag.getArmorPenalty
                        ? bag.getArmorPenalty()
                        : bag.armorPenalty) +
                        extraArmorPenalty) *
                        -1}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Card>

            {/* Card de Estatísticas: Defesa, Deslocamento, Tamanho */}
            <Card
              sx={{
                position: 'relative',
                pt: 4,
                pb: 3,
                px: 3,
                mb: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
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
              <Stack spacing={3} direction={isMobile ? 'column' : 'row'}>
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
                    <StatLabel theme={theme}>{defesa}</StatLabel>
                    <StatTitle>Defesa</StatTitle>
                  </Box>
                </FancyBox>
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
                        fontSize: '11px',
                        color: theme.palette.text.secondary,
                        textAlign: 'center',
                        margin: 0,
                      }}
                    >
                      ({Math.floor(displacement / 1.5)}q)
                    </Typography>
                    <StatTitle>Deslocamento</StatTitle>
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
                        fontSize: '28px',
                        color: theme.palette.primary.main,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        margin: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {size.name}
                    </Typography>
                    <StatTitle>Tamanho</StatTitle>
                  </Box>
                </FancyBox>
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
                  sheetHistory={currentSheet.sheetActionHistory}
                  classAbilities={classe.abilities}
                  classPowers={classPowers}
                  raceAbilities={raca.abilities}
                  originPowers={origin?.powers || []}
                  deityPowers={devoto?.poderes || []}
                  generalPowers={generalPowers}
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
                    {bag.getSpaces()}/{maxSpaces}-{maxSpaces * 2}
                  </Box>
                </Box>
              </Card>
              <Card sx={{ p: 2 }}>
                <BookTitle>Proficiências</BookTitle>
                <Stack direction='row' flexWrap='wrap'>
                  {proficienciasDiv}
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
        />
      </>
    </BackgroundBox>
  );
};

export default Result;
