import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Atributo } from '@/data/systems/tormenta20/atributos';

interface RaceAttributeStepProps {
  selectedAttributes: Atributo[];
  onChange: (attributes: Atributo[]) => void;
  requiredCount: number;
  excludedAttributes?: Atributo[];
  /**
   * Modificador de cada slot, na mesma ordem dos selects. Sem Raças Abertas
   * todos costumam valer o mesmo (+1, +1, +1 do Humano) e o rótulo é dispensável;
   * com a regra ligada, cada slot carrega um valor diferente (+2, +1, −1 do
   * anão) e mostrar qual é qual deixa de ser opcional.
   */
  slotModifiers?: number[];
  /** Raças Abertas está disponível (suplemento + feature flag) para esta raça? */
  openRacesAvailable?: boolean;
  openRaces?: boolean;
  onOpenRacesChange?: (openRaces: boolean) => void;
  raceName?: string;
}

const formatMod = (mod: number): string => (mod > 0 ? `+${mod}` : `${mod}`);

const RaceAttributeStep: React.FC<RaceAttributeStepProps> = ({
  selectedAttributes,
  onChange,
  requiredCount,
  excludedAttributes = [],
  slotModifiers,
  openRacesAvailable = false,
  openRaces = false,
  onOpenRacesChange,
  raceName,
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
        !excludedAttributes.includes(attr) &&
        (!selectedAttributes.includes(attr) ||
          selectedAttributes[currentIndex] === attr)
    );

  const hasDuplicates = (): boolean => {
    const filtered = selectedAttributes.filter((attr) => attr !== undefined);
    return new Set(filtered).size !== filtered.length;
  };

  const isComplete = (): boolean =>
    selectedAttributes.length === requiredCount &&
    selectedAttributes.every((attr) => attr !== undefined) &&
    !hasDuplicates();

  const slotLabel = (index: number): string => {
    const mod = slotModifiers?.[index];
    if (mod === undefined) return `Atributo ${index + 1}`;
    return `${formatMod(mod)} em`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {openRacesAvailable && (
        <Paper variant='outlined' sx={{ p: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={openRaces}
                onChange={(_e, checked) => onOpenRacesChange?.(checked)}
              />
            }
            label='Usar Raças Abertas'
          />
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', mt: 0.5, mb: 1.5 }}
          >
            Regra opcional de <em>Heróis de Arton</em> (p. 281). Com ela, você
            aplica cada modificador de atributo
            {raceName ? ` de ${raceName}` : ' da sua raça'} no atributo que
            quiser — sem repetir o mesmo atributo. Sem ela, valem os
            modificadores padrão da raça.
          </Typography>
          <Alert severity='info'>
            Combine com o mestre antes de usar: o próprio livro sugere manter as
            travas das raças, porque elas é que tornam certas combinações
            memoráveis.
          </Alert>
        </Paper>
      )}

      {requiredCount === 0 ? (
        <Typography variant='body1' sx={{ color: 'text.secondary' }}>
          Os modificadores de atributo
          {raceName ? ` de ${raceName}` : ' da sua raça'} são fixos e serão
          aplicados automaticamente. Não há nada a escolher neste passo.
        </Typography>
      ) : (
        <Typography variant='body1' sx={{ color: 'text.secondary' }}>
          {openRaces
            ? 'Escolha em qual atributo aplicar cada modificador da sua raça:'
            : `Sua raça permite escolher ${requiredCount} atributo${
                requiredCount > 1 ? 's' : ''
              } para receber bônus. Selecione abaixo:`}
        </Typography>
      )}

      {excludedAttributes.length > 0 && (
        <Alert severity='info'>
          Atributos bloqueados pela raça: {excludedAttributes.join(', ')}
        </Alert>
      )}
      {Array.from({ length: requiredCount }).map((_, index) => {
        const fieldId = `attribute-slot-${index + 1}`;
        return (
          <FormControl key={fieldId} fullWidth>
            <InputLabel id={`${fieldId}-label`}>{slotLabel(index)}</InputLabel>
            <Select
              labelId={`${fieldId}-label`}
              value={selectedAttributes[index] || ''}
              label={slotLabel(index)}
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
      {requiredCount > 0 && isComplete() && (
        <Alert severity='success'>
          Atributos selecionados com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
    </Box>
  );
};

export default RaceAttributeStep;
