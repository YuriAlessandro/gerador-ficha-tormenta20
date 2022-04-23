import React, { useEffect, useState } from 'react';
import {
  Box,
  Slide,
  Alert,
  Paper,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
} from '@mui/material';
import Select from 'react-select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { cloneDeep } from 'lodash';
import { CardInterface } from './interfaces';
import CLASSES from '../../../data/classes';
import getSelectTheme from '../../../functions/style';
import { ClassDescription } from '../../../interfaces/Class';
import Skill from '../../../interfaces/Skills';

const ClassCard: React.FC<CardInterface> = ({ onContinue, sheet }) => {
  const [choosenClass, setChoosenClass] = useState<
    ClassDescription | undefined
  >(undefined);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [selectedOrSkill, setSelectedOrSkill] = useState('');

  const [error, setError] = useState('');

  const ls = window.localStorage;

  const formThemeColors =
    ls.getItem('dkmFdn') === 'true'
      ? getSelectTheme('dark')
      : getSelectTheme('default');

  const classesopt = CLASSES.map((classe) => ({
    value: classe.name,
    label: classe.name,
  }));

  const onSelectClass = (classe: { label: string; value: string } | null) => {
    const selectedClass = CLASSES.find(
      (iClass) => iClass.name === classe?.label
    );

    if (selectedClass) {
      const availableAbilities = selectedClass.abilities.filter(
        (abilitie) => abilitie.nivel <= sheet.nivel
      );

      selectedClass.abilities = availableAbilities;
    }

    setChoosenClass(selectedClass);
  };

  const onClickContinue = () => {
    const sheetClone = cloneDeep(sheet);

    if (choosenClass) {
      // Set class
      sheetClone.classe = choosenClass;

      // Check if user selected all skills
      if (selectedCheckboxes.length < choosenClass.periciasrestantes.qtd) {
        setError(
          `Por favor, selecione ${choosenClass.periciasrestantes.qtd} perícias antes de continuar`
        );
        return;
      }

      // Check if user selected 'or' skills
      const orExists =
        choosenClass.periciasbasicas.filter((skl) => skl.type === 'or').length >
        0;

      if (orExists && !selectedOrSkill) {
        setError(
          `Por favor, selecione as perícias corretamente antes de continuar`
        );
        return;
      }
      // Set skills
      const skills: Skill[] = [];
      if (selectedOrSkill) skills.push(selectedOrSkill as Skill);
      const obgSkills = choosenClass.periciasbasicas.filter(
        (skl) => skl.type === 'and'
      );

      obgSkills.forEach((obgSkill) => {
        skills.push(...(obgSkill.list as Skill[]));
      });

      skills.push(...(selectedCheckboxes as Skill[]));

      sheetClone.skills = skills;

      onContinue(5, sheetClone);
    } else {
      setError('Você deve escolher uma classe antes de continuar');
    }
  };

  const handleSkillChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const skill = (event.target as HTMLInputElement).value;
    setSelectedOrSkill(skill);
  };

  const handleCheckboxSkillChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const skill = event.target.name;
    const max = choosenClass ? choosenClass.periciasrestantes.qtd : 0;

    if (
      !selectedCheckboxes.includes(skill) &&
      selectedCheckboxes.length < max
    ) {
      setSelectedCheckboxes((prevState) => [...prevState, skill]);
    } else if (selectedCheckboxes.includes(skill)) {
      const newList = selectedCheckboxes.filter((item) => item !== skill);
      setSelectedCheckboxes(newList);
    }
  };

  useEffect(() => {
    setSelectedCheckboxes([]);
    setSelectedOrSkill('');
  }, [choosenClass]);

  return (
    <Paper elevation={0}>
      <Box sx={{ p: 2 }}>
        <h1>Escolha a classe</h1>

        <Slide direction='right' in={error.length > 0}>
          <Alert severity='error'>{error}</Alert>
        </Slide>

        <Select
          className='filterSelect'
          options={classesopt}
          placeholder='Escolha sua classe'
          onChange={onSelectClass}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
        />

        {choosenClass && (
          <>
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ mr: 3 }}>
                <Slide in={choosenClass !== undefined}>
                  <Paper elevation={1} sx={{ mt: 3, p: 1 }}>
                    <p>
                      <strong>Pontos de vida:</strong> Começa com{' '}
                      {choosenClass.pv} (+ modificador de Constituição)
                    </p>
                    <p>
                      Ganha {choosenClass.addpv} (+ modificador de Constituição)
                      por nível.
                    </p>
                  </Paper>
                </Slide>
                <Slide in={choosenClass !== undefined}>
                  <Paper elevation={1} sx={{ mt: 3, p: 1 }}>
                    Pontos de mana: {choosenClass.pm} PM por nível
                  </Paper>
                </Slide>
                <Slide>
                  <>
                    {choosenClass.abilities.map((hab) => (
                      <Paper elevation={1} sx={{ mt: 3, p: 1 }}>
                        <strong>{hab.name}:</strong> {hab.text}
                      </Paper>
                    ))}
                  </>
                </Slide>
              </Box>
              <Box sx={{ width: '100%' }}>
                <Slide in={choosenClass !== undefined}>
                  <Paper elevation={1} sx={{ mt: 3, p: 1 }}>
                    <strong>Perícias: </strong>
                    <FormGroup>
                      {choosenClass.periciasbasicas.map((skill) => {
                        if (skill.type === 'or') {
                          return (
                            <RadioGroup
                              name='radio-buttons-group'
                              onChange={handleSkillChange}
                            >
                              {skill.list.map((skl) => (
                                <FormControlLabel
                                  value={skl}
                                  control={<Radio />}
                                  label={skl}
                                />
                              ))}
                            </RadioGroup>
                          );
                        }

                        return skill.list.map((skl) => (
                          <FormControlLabel
                            control={<Checkbox checked />}
                            label={skl}
                          />
                        ));
                      })}

                      <h4>
                        Escolha mais {choosenClass.periciasrestantes.qtd}:{' '}
                      </h4>
                      {choosenClass.periciasrestantes.list.map((skl) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              onChange={handleCheckboxSkillChange}
                              name={skl}
                              checked={selectedCheckboxes.includes(skl)}
                            />
                          }
                          label={skl}
                        />
                      ))}
                    </FormGroup>
                  </Paper>
                </Slide>
              </Box>
            </Box>
          </>
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

export default ClassCard;
