import {
  Alert,
  Paper,
  Slide,
  Box,
  IconButton,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Divider,
} from '@mui/material';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ORIGINS, origins } from '../../../data/origins';
import getSelectTheme from '../../../functions/style';
import { CardInterface } from './interfaces';
import Origin from '../../../interfaces/Origin';
import { GeneralPower, OriginPower } from '../../../interfaces/Poderes';
import Skill from '../../../interfaces/Skills';
import { getPowersAllowedByRequirements } from '../../../functions/powers';

const MAX = 2;

const OriginCard: React.FC<CardInterface> = ({ onContinue, sheet }) => {
  const [tempSheet, setTempSheet] = useState(sheet);
  const [allowedPowersToSelect, setAllowedPowersToSelect] = useState<
    (OriginPower | GeneralPower)[]
  >([]);

  const [choosenOrigin, setChoosenOrigin] = useState<Origin | undefined>(
    undefined
  );
  const [selectedPowers, setSelectedPowers] = useState<
    (OriginPower | GeneralPower)[]
  >([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [currentTotal, setCurrentTotal] = useState(0);

  const ls = window.localStorage;

  const formThemeColors =
    ls.getItem('dkmFdn') === 'true'
      ? getSelectTheme('dark')
      : getSelectTheme('default');

  const origens = Object.keys(ORIGINS).map((origin) => ({
    value: origin,
    label: origin,
  }));

  const onClickContinue = () => {
    const sheetClone = cloneDeep(tempSheet);
    onContinue(5, sheetClone);
  };

  const onSelectOrigin = (origin: { label: string; value: string } | null) => {
    if (origin) {
      const selectedOrigin = ORIGINS[origin.label as unknown as origins];
      setChoosenOrigin(selectedOrigin);
    }
  };

  const handleSelectSkill = (event: React.ChangeEvent<HTMLInputElement>) => {
    const skill = event.target.name;

    if (!selectedSkills.includes(skill) && currentTotal < MAX) {
      setSelectedSkills((prevState) => [...prevState, skill]);
    } else if (selectedSkills.includes(skill)) {
      const newList = selectedSkills.filter((item) => item !== skill);
      setSelectedSkills(newList);
    }

    const sheetClone = cloneDeep(tempSheet);
    sheetClone.skills = [...sheetClone.skills, ...(selectedSkills as Skill[])];
    setTempSheet(sheetClone);
  };

  const handleSelectPower = (event: React.ChangeEvent<HTMLInputElement>) => {
    const powerName = event.currentTarget.name;

    let foundPower = choosenOrigin?.poderes.find(
      (power) => power.name === powerName
    );

    if (!foundPower) {
      foundPower = allowedPowersToSelect.find(
        (power) => power.name === powerName
      );
    }

    if (foundPower) {
      if (selectedPowers.includes(foundPower)) {
        const newList = selectedPowers.filter((item) => item !== foundPower);
        setSelectedPowers(newList);
      } else if (currentTotal < MAX) {
        setSelectedPowers((prev) => [...prev, foundPower as GeneralPower]);
      }
    }
  };

  useEffect(() => {
    console.log(tempSheet);
    const powers = [
      ...getPowersAllowedByRequirements(tempSheet),
      ...selectedPowers,
    ];
    setAllowedPowersToSelect(powers.sort((a, b) => (a.name < b.name ? -1 : 1)));
  }, [tempSheet]);

  useEffect(() => {
    const sheetClone = cloneDeep(tempSheet);

    sheetClone.generalPowers = selectedPowers as GeneralPower[];
    sheetClone.skills = [...sheetClone.skills, ...(selectedSkills as Skill[])];

    setTempSheet(sheetClone);
    setCurrentTotal(selectedSkills.length + selectedPowers.length);
  }, [selectedSkills, selectedPowers]);

  useEffect(() => {
    const sheetClone = cloneDeep(sheet);
    sheetClone.origin = undefined;

    setTempSheet(sheetClone);
    setChoosenOrigin(undefined);
  }, []);

  return (
    <Paper elevation={0}>
      <Box sx={{ p: 2 }}>
        <h1>Escolha a origem e poderes</h1>

        <Slide direction='right' in={error.length > 0}>
          <Alert severity='error'>{error}</Alert>
        </Slide>

        <Select
          className='filterSelect'
          options={origens}
          placeholder='Escolha sua origem'
          onChange={onSelectOrigin}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
        />

        {choosenOrigin && (
          <Paper elevation={1} sx={{ mt: 3, p: 1 }}>
            <>
              <p>Escolha duas opções:</p>
              {choosenOrigin.pericias.length > 0 && (
                <Paper elevation={3} sx={{ p: 1, mt: 3 }}>
                  <FormGroup>
                    {choosenOrigin.pericias.map((bnt) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={handleSelectSkill}
                            name={bnt}
                            checked={selectedSkills.includes(bnt)}
                          />
                        }
                        label={bnt}
                      />
                    ))}
                  </FormGroup>
                </Paper>
              )}
              {choosenOrigin.poderes.length > 0 && (
                <Paper elevation={3} sx={{ p: 1, mt: 3 }}>
                  <FormGroup>
                    {choosenOrigin.poderes.map((bnt) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={handleSelectPower}
                            name={bnt.name}
                            checked={selectedPowers.includes(bnt)}
                          />
                        }
                        label={bnt.name}
                      />
                    ))}
                  </FormGroup>
                </Paper>
              )}
              <Paper elevation={3} sx={{ p: 1, mt: 3 }}>
                <FormGroup>
                  {allowedPowersToSelect.map((power) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleSelectPower}
                          name={power.name}
                          checked={selectedPowers.includes(power)}
                        />
                      }
                      label={power.name}
                    />
                  ))}
                </FormGroup>
              </Paper>
            </>
          </Paper>
        )}
      </Box>
      <Box sx={{ textAlign: 'center', pb: 1 }}>
        <IconButton title='Continuar' onClick={onClickContinue}>
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default OriginCard;
