import React from 'react';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';

import { AmmoType } from '../../../interfaces/Equipment';
import { ammoTypeLabel, AmmoTypeOption } from './ammo';

export interface AmmoTypeFieldProps {
  label: string;
  value: AmmoType | '';
  onChange: (next: AmmoType | '') => void;
  /** Tipos + pacotes que os resolvem. Vem de `getAmmoTypeOptions`. */
  options: AmmoTypeOption[];
  helperText?: string;
  size?: 'small' | 'medium';
}

/** "Bolas de metal pesado · 12" — o que aquele tipo acha na mochila. */
function describePacks(option: AmmoTypeOption): string {
  if (option.packs.length === 0) return '';
  return option.packs
    .map((p) => (p.units === undefined ? p.nome : `${p.nome} · ${p.units}`))
    .join(' | ');
}

/**
 * Seletor de tipo de munição, compartilhado pelas três telas de autoria de item
 * (item personalizado, editor de item e Pacote de Itens homebrew).
 *
 * É `freeSolo` porque o vocabulário de `AmmoType` é ABERTO: além dos cinco do
 * livro, o autor cunha famílias próprias ("Cartuchos a vapor") ao criar um
 * pacote de munição.
 *
 * Cada opção mostra os PACOTES que a resolvem, e não só o nome do tipo. Sem
 * isso, quem criou "Bolas de metal pesado" abria a lista, via cinco tipos
 * abstratos e concluía que o pacote dele tinha sumido — quando na verdade é
 * "Bolas de Ferro" que aponta para ele.
 */
const AmmoTypeField: React.FC<AmmoTypeFieldProps> = ({
  label,
  value,
  onChange,
  options,
  helperText,
  size = 'medium',
}) => (
  <Autocomplete
    freeSolo
    size={size}
    fullWidth
    options={options}
    value={value || null}
    // Ordena os tipos que você TEM na frente: são os que respondem à pergunta
    // "com o que essa arma atira?" para quem já montou o inventário.
    groupBy={(option) =>
      (option as AmmoTypeOption).packs.length > 0
        ? 'Na sua mochila'
        : 'Outros tipos'
    }
    getOptionLabel={(option) =>
      typeof option === 'string'
        ? ammoTypeLabel(option)
        : ammoTypeLabel(option.type)
    }
    isOptionEqualToValue={(option, selected) =>
      (option as AmmoTypeOption).type === selected
    }
    onChange={(_, next) => {
      if (next === null) onChange('');
      else if (typeof next === 'string') onChange(next as AmmoType);
      else onChange(next.type);
    }}
    // Cobre a digitação livre de um tipo novo; sem isto o valor só seria
    // gravado ao apertar Enter.
    onInputChange={(_, next, reason) => {
      if (reason === 'input') onChange(next.trim() as AmmoType);
    }}
    renderOption={(props, option) => {
      const packs = describePacks(option as AmmoTypeOption);
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Box component='li' {...props} key={(option as AmmoTypeOption).type}>
          <Box>
            <Typography variant='body2'>
              {ammoTypeLabel((option as AmmoTypeOption).type)}
            </Typography>
            {packs && (
              <Typography variant='caption' color='text.secondary'>
                {packs}
              </Typography>
            )}
          </Box>
        </Box>
      );
    }}
    renderInput={(params) => (
      <TextField
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...params}
        label={label}
        helperText={helperText}
      />
    )}
  />
);

export default AmmoTypeField;
