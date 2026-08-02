import React from 'react';
import { Alert, Box, Divider, Typography } from '@mui/material';
import Equipment from '@/interfaces/Equipment';
import ItemStats from '@/components/common/ItemStats';
import Origin, { Items } from '@/interfaces/Origin';
import {
  getOriginItemOptionName,
  OriginItemChoices,
} from '@/functions/originItems';
import SelectableItemGrid from './SelectableItemGrid';

interface OriginItemStepProps {
  origin: Origin;
  /** Itens congelados na entrada do passo (evita re-sorteio a cada render). */
  items: Items[];
  choices: OriginItemChoices | undefined;
  onChange: (choices: OriginItemChoices) => void;
}

const OriginItemStep: React.FC<OriginItemStepProps> = ({
  origin,
  items,
  choices,
  onChange,
}) => {
  const current = choices || {};

  const choiceItems = items.filter((item) => item.choice);
  const fixedItems = items.filter((item) => !item.choice);

  const isComplete = choiceItems.every(
    (item) => item.choice && current[item.choice.key]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' sx={{ color: 'text.secondary' }}>
        A origem {origin.name} concede estes itens gratuitamente — você não paga
        por eles no Mercado. Escolha os que ficam a seu critério.
      </Typography>

      {choiceItems.map((item, index) => {
        const { choice } = item;
        if (!choice) return null;

        return (
          <Box key={choice.key}>
            {index > 0 && <Divider sx={{ mb: 2 }} />}
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              {choice.label} — escolha 1:
            </Typography>
            <SelectableItemGrid
              items={choice.options}
              selectedName={current[choice.key]}
              onSelect={(option) =>
                onChange({
                  ...current,
                  [choice.key]: getOriginItemOptionName(
                    option as Equipment | string
                  ),
                })
              }
            />
          </Box>
        );
      })}

      {fixedItems.length > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Incluído automaticamente:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {fixedItems.map((item) => {
                const isText = typeof item.equipment === 'string';
                const name = isText
                  ? (item.equipment as string)
                  : (item.equipment as Equipment).nome;

                return (
                  <Box
                    key={name}
                    sx={{
                      py: 1,
                      px: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                      {name}
                      {item.qtd && item.qtd > 1 ? ` (x${item.qtd})` : ''}
                    </Typography>
                    {!isText && (
                      <ItemStats item={item.equipment as Equipment} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </>
      )}

      {!isComplete && (
        <Alert severity='warning'>Escolha todos os itens para continuar.</Alert>
      )}

      {isComplete && (
        <Alert severity='success'>
          Itens da origem selecionados! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
    </Box>
  );
};

export default OriginItemStep;
