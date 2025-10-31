import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';
import { Atributo } from '@/data/systems/tormenta20/atributos';

interface RaceAttributeStepProps {
  selectedAttributes: Atributo[];
  onChange: (attributes: Atributo[]) => void;
  requiredCount: number;
}

const RaceAttributeStep: React.FC<RaceAttributeStepProps> = ({
  selectedAttributes,
  onChange,
  requiredCount,
}) => {
  const allAttributes = Object.values(Atributo);

  const handleAttributeChange = (index: number, value: Atributo) => {
    const newAttributes = [...selectedAttributes];
    newAttributes[index] = value;
    onChange(newAttributes);
  };

  const getAvailableAttributes = (currentIndex: number): Atributo[] =>
    allAttributes.filter(
      (attr) =>
        !selectedAttributes.includes(attr) ||
        selectedAttributes[currentIndex] === attr
    );

  const hasDuplicates = (): boolean => {
    const filtered = selectedAttributes.filter((attr) => attr !== undefined);
    return new Set(filtered).size !== filtered.length;
  };

  const isComplete = (): boolean =>
    selectedAttributes.length === requiredCount &&
    selectedAttributes.every((attr) => attr !== undefined) &&
    !hasDuplicates();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Sua raça permite escolher {requiredCount} atributo
        {requiredCount > 1 ? 's' : ''} para receber bônus. Selecione abaixo:
      </Typography>

      {Array.from({ length: requiredCount }).map((_, index) => {
        const fieldId = `attribute-slot-${index + 1}`;
        return (
          <FormControl key={fieldId} fullWidth>
            <InputLabel id={`${fieldId}-label`}>
              Atributo {index + 1}
            </InputLabel>
            <Select
              labelId={`${fieldId}-label`}
              value={selectedAttributes[index] || ''}
              label={`Atributo ${index + 1}`}
              onChange={(e) =>
                handleAttributeChange(index, e.target.value as Atributo)
              }
            >
              {getAvailableAttributes(index).map((attr) => (
                <MenuItem key={attr} value={attr}>
                  {attr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      })}

      {hasDuplicates() && (
        <Alert severity='error'>
          Você não pode selecionar o mesmo atributo mais de uma vez.
        </Alert>
      )}

      {!isComplete() &&
        selectedAttributes.length === requiredCount &&
        !hasDuplicates() && (
          <Alert severity='warning'>
            Selecione todos os {requiredCount} atributos para continuar.
          </Alert>
        )}

      {isComplete() && (
        <Alert severity='success'>
          Atributos selecionados com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
    </Box>
  );
};

export default RaceAttributeStep;
