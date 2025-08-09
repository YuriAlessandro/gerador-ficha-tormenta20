import React, { useState } from 'react';
import BugReportIcon from '@mui/icons-material/BugReport';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Card,
  Chip,
  Container,
  Stack,
  Typography,
  useTheme,
  IconButton,
} from '@mui/material';
import styled from '@emotion/styled';
import bgImage from '@/assets/images/fantasybg.png';
import bigBoxDark from '@/assets/images/bigBoxDark.svg';
import bigBox from '@/assets/images/bigBox.svg';
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

  const theme = useTheme();

  // Update currentSheet when sheet prop changes
  React.useEffect(() => {
    setCurrentSheet(sheet);
  }, [sheet]);

  const handleSheetInfoUpdate = (updates: Partial<CharacterSheet>) => {
    const updatedSheet = { ...currentSheet, ...updates };
    setCurrentSheet(updatedSheet);
    if (onSheetUpdate) {
      onSheetUpdate(updatedSheet);
    }
  };

  const handleSkillsUpdate = (updates: Partial<CharacterSheet>) => {
    const updatedSheet = { ...currentSheet, ...updates };
    setCurrentSheet(updatedSheet);
    if (onSheetUpdate) {
      onSheetUpdate(updatedSheet);
    }
  };

  const handleEquipmentUpdate = (updates: Partial<CharacterSheet>) => {
    const updatedSheet = { ...currentSheet, ...updates };
    setCurrentSheet(updatedSheet);
    if (onSheetUpdate) {
      onSheetUpdate(updatedSheet);
    }
  };

  const handlePowersUpdate = (
    updates: Partial<CharacterSheet> | CharacterSheet
  ) => {
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
  };

  const handleSpellsUpdate = (updates: Partial<CharacterSheet>) => {
    const updatedSheet = { ...currentSheet, ...updates };
    setCurrentSheet(updatedSheet);
    if (onSheetUpdate) {
      onSheetUpdate(updatedSheet);
    }
  };

  const {
    nome,
    sexo,
    nivel,
    atributos,
    raca,
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
    maxSpaces,
    generalPowers = [],
    classPowers = [],
    steps,
    extraArmorPenalty = 0,
    completeSkills,
  } = currentSheet;

  function getKey(elementId: string) {
    return `${id}-${elementId}`;
  }

  let className = `${classe.name}`;
  if (classe.subname) className = `${className} (${classe.subname})`;

  const periciasSorted = completeSkills?.sort((skillA, skillB) =>
    skillA.name < skillB.name ? -1 : 1
  );

  const periciasDiv = (
    <SkillTable sheet={currentSheet} skills={periciasSorted} />
  );

  const proficienciasDiv = classe.proficiencias.map((proe) => (
    <Chip sx={{ m: 0.5 }} label={proe} key={getKey(proe)} />
  ));

  let bagEquipments;
  if (bag.getEquipments) {
    bagEquipments = bag.getEquipments();
  } else {
    bagEquipments = bag.equipments;
  }

  const equipsEntriesNoWeapons: Equipment[] = Object.entries(bagEquipments)
    .filter(([key]) => key !== 'Arma' && key !== 'Armadura' && key !== 'Escudo')
    .flatMap((value) => value[1]);

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

  const weaponsDiv = (
    <Weapons
      getKey={getKey}
      weapons={bagEquipments.Arma}
      fightBonus={fightBonus}
      rangeBonus={rangeBonus}
      modFor={modFor}
    />
  );
  const defenseEquipments = [
    ...bagEquipments.Armadura,
    ...bagEquipments.Escudo,
  ];

  // const uniqueGeneralPowers = filterUnique(generalPowers);
  // const uniqueClassPowers = filterUnique(classPowers);

  const keyAttr = classe.spellPath
    ? atributos[classe.spellPath.keyAttribute]
    : null;

  const changesDiv = steps.map((step) => {
    if (step.type === 'Atributos') {
      return (
        <li key={getKey(`${step.label}-${step.value}`)}>
          <strong>{step.label}:</strong>
          <ul className='stepAttrList'>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{`${attr.name}: ${
                (attr.value as number) > 0 ? '+' : '-'
              }${attr.value}`}</li>
            ))}
          </ul>
        </li>
      );
    }
    if (
      step.type === 'Perícias' ||
      step.type === 'Magias' ||
      step.type === 'Equipamentos' ||
      step.type === 'Atributos Extras'
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

  const isMobile = window.innerWidth <= 768;

  const BackgroundBox = styled(Box)`
    background: linear-gradient(
        to top,
        rgba(255, 255, 255, 0) 20%,
        ${isDarkMode ? '#212121' : '#f3f2f1'}
      ),
      url(${bgImage});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  `;

  const TextBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 50%;
    &:first-of-type {
      border-right: 1px solid ${theme.palette.primary.main};
      padding-right: 10px;
    }
    &:last-child {
      padding-left: 10px;
    }
  `;

  const DefenseTitle = styled.h4`
    font-family: 'Tfont';
    position: relative;
  `;

  const DisplacementTitle = styled.h4`
    font-family: 'Tfont';
    position: relative;
    font-size: 10px;
  `;

  const DefenseLabel = styled.div`
    font-family: 'Tfont';
    text-align: center;
    width: 100%;
    font-size: 50px;
    color: ${theme.palette.primary.main};
    margin-bottom: -20px;
  `;

  return (
    <Box>
      <BackgroundBox sx={{ p: 2 }}>
        <Container maxWidth='xl'>
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
                      text={`${raca.name} ${className} (${sexo})`}
                      size='medium'
                    />
                    <LabelDisplay
                      title='Nível'
                      text={`${nivel}`}
                      size='small'
                    />
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
                    justifyContent='space-between'
                    alignItems='center'
                    direction={isMobile ? 'column' : 'row'}
                  >
                    <Box
                      sx={{
                        backgroundImage: `url(${
                          isDarkMode ? bigBoxDark : bigBox
                        })`,
                        backgroundPosition: 'center',
                        backgroundSize: 'fill',
                        backgroundRepeat: 'no-repeat',
                        width: '100px',
                        // ml: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 5,
                        fontFamily: 'Tfont',
                      }}
                    >
                      <TextBox>
                        <Box
                          sx={{
                            fontSize: '50px',
                            color: theme.palette.primary.main,
                          }}
                        >
                          {pv}
                        </Box>
                        <Box>PV</Box>
                      </TextBox>
                      <TextBox>
                        <Box
                          sx={{
                            fontSize: '50px',
                            color: theme.palette.primary.main,
                          }}
                        >
                          {pm}
                        </Box>
                        <Box>PM</Box>
                      </TextBox>
                    </Box>
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
                <AttributeDisplay attributes={atributos} />
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
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  spacing={2}
                  justifyContent='space-between'
                  alignItems='center'
                >
                  <Box width={isMobile ? '100%' : '33%'}>
                    <BookTitle>Ataques</BookTitle>
                    {weaponsDiv}
                  </Box>
                  <Stack spacing={2} direction='row'>
                    <FancyBox>
                      <Box>
                        <DefenseLabel>{displacement}</DefenseLabel>
                        <DisplacementTitle>Deslocamento</DisplacementTitle>
                      </Box>
                    </FancyBox>
                    <FancyBox>
                      <Box>
                        <DefenseLabel>{defesa}</DefenseLabel>
                        <DefenseTitle>Defesa</DefenseTitle>
                      </Box>
                    </FancyBox>
                  </Stack>
                  <Box width={isMobile ? '100%' : '33%'}>
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
              <Card
                sx={{ p: 3, mb: 4, position: 'relative', overflow: 'visible' }}
              >
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
                  />
                </Box>
              </Card>
              <Card
                sx={{ p: 3, mb: 4, position: 'relative', overflow: 'visible' }}
              >
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
                <Box>
                  <BookTitle>Magias</BookTitle>
                  <Spells
                    spells={spells}
                    spellPath={classe.spellPath}
                    keyAttr={keyAttr}
                    nivel={nivel}
                  />
                </Box>
              </Card>
            </Box>
            {/* LADO DIREITO, 40% */}
            <Box width={isMobile ? '100%' : '40%'}>
              <Stack spacing={4}>
                <Card sx={{ position: 'relative', overflow: 'visible' }}>
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
                  {periciasDiv}
                </Card>
                <Card>
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

          <Stack
            direction='row'
            flexWrap='wrap'
            alignItems='flex-start'
            justifyContent='space-between'
            width='100%'
          >
            <Card sx={{ mt: 2, p: 5, width: '30%' }}>
              <p>
                <small style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginRight: '5px',
                    }}
                  >
                    <BugReportIcon /> Encontrou algum problema nessa ficha?
                  </span>
                  <a
                    target='blank'
                    href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/categories/problemas'
                  >
                    Nos avise!
                  </a>
                </small>
              </p>
            </Card>

            <Card sx={{ mt: 2, p: 5, width: '50%' }}>{changesDiv}</Card>
          </Stack>
        </Container>
      </BackgroundBox>

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
    </Box>
  );
};

export default Result;
