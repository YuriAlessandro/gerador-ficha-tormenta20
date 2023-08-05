import { rollDice } from '@/functions/randomUtils';
import { Box, Button, Paper, Select, Stack, useTheme } from '@mui/material';
import React from 'react';
// import { SheetBuilderFormStepAttributesDefinitionProvider } from './SheetBuilderFormStepAttributesDefinitionContext';
import styled from '@emotion/styled';
import {
  selectAttribute,
  setAttribute,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Attribute, Attributes, Translator } from 't20-sheet-builder';
import { Option } from '@/components/SheetBuilder/common/Option';
import { addSign } from '@/components/SheetBuilder/common/StringHelper';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import diceSound from '@/assets/sounds/dice-rolling.mp3';
import { attributes } from '../../../common/Attributes';
import border from '../../../../../assets/images/attrBox.svg';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

const SheetBuilderFormStepAttributesDefinitionDice = () => {
  const theme = useTheme();
  const [rolls, setRolls] = React.useState<
    { roll: number; attr: keyof Attributes | undefined }[]
  >([]);

  const dispatch = useAppDispatch();

  const generateRolls = () => {
    const audio = new Audio(diceSound);
    audio.play();

    dispatch(setOptionReady({ key: 'isAttrReady', value: 'pending' }));
    const currentRoll = [];
    for (let i = 0; i < 6; i += 1) {
      currentRoll.push({
        roll: rollDice(4, 6, 1),
        attr: undefined,
      });
    }

    attributes.forEach((attribute) => {
      dispatch(setAttribute({ attribute, value: 0 }));
    });

    setRolls(currentRoll);
  };

  const AttributeLabel = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px;
    width: 120px;
    height: 120px;
    text-align: center;
    color: ${theme.palette.primary.main};
    background-image: url(${border});
    background-size: fill;
    background-repeat: no-repeat;
    background-position: center;
    font-size: 3rem;
    font-family: 'Tfont';
  `;

  const onChange = (
    option: Option<{ idx: number; attr: keyof Attributes }>
  ) => {
    const newRolls = [...rolls];

    const attribute = option.value.attr as Attribute;

    // Change the attr of the roll
    newRolls[option.value.idx] = {
      ...newRolls[option.value.idx],
      attr: option.value.attr,
    };

    const newValue = newRolls[option.value.idx].roll;

    let mod = 0;
    // Get modifier based on the roll
    if (newValue <= 7) mod = -2;
    else if (newValue <= 9) mod = -1;
    else if (newValue <= 11) mod = 0;
    else if (newValue <= 13) mod = 1;
    else if (newValue <= 15) mod = 2;
    else if (newValue <= 17) mod = 3;
    else if (newValue === 18) mod = 4;

    dispatch(setOptionReady({ key: 'isAttrReady', value: 'confirmed' }));
    dispatch(setAttribute({ attribute, value: mod }));

    setRolls(newRolls);
  };

  return (
    <Box>
      <Stack spacing={2} justifyContent='center'>
        <p>
          Após gerar os valores, selecione em qual atributo você deseja usá-lo.
        </p>
        <Button variant='outlined' onClick={() => generateRolls()}>
          {rolls.length > 0 ? 'Rolar novamente' : 'Rolar dados'}
        </Button>
        <Stack direction='row' spacing={2} justifyContent='center'>
          {rolls.map(({ roll, attr }, idx) => {
            const options: Option<{
              idx: number;
              attr: keyof Attributes;
            }>[] = attributes.map((attribute) => ({
              value: { idx, attr: attribute },
              label: Translator.getAttributeTranslation(attribute),
            }));
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Paper key={idx} sx={{ width: '100px', textAlign: 'center' }}>
                <h3>{roll}</h3>
                <SheetBuilderFormSelect
                  id={`${attr}`}
                  options={options}
                  onChange={onChange}
                  placeholder=' '
                  isOptionDisabled={(option) =>
                    rolls.find((froll) => option.value.attr === froll.attr) !==
                    undefined
                  }
                />
              </Paper>
            );
          })}
        </Stack>
        <Stack direction='row' spacing={2}>
          {attributes.map((attribute) => {
            const attributeValue = useAppSelector(selectAttribute(attribute));
            return (
              <Stack key={attribute} alignItems='center'>
                <h3>{Translator.getAttributeTranslation(attribute)}</h3>
                <AttributeLabel key={attribute}>
                  {addSign(attributeValue)}
                </AttributeLabel>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
};

export default SheetBuilderFormStepAttributesDefinitionDice;
