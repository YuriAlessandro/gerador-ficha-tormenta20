import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

import { AmmoType } from '../../../interfaces/Equipment';
import { ammoTypeLabel } from './ammo';

export interface AmmoTypeFieldProps {
  label: string;
  value: AmmoType | '';
  onChange: (next: AmmoType | '') => void;
  /** Tipos oferecidos na lista. Vem de `getAmmoTypeSuggestions`. */
  options: AmmoType[];
  helperText?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

/**
 * Seletor de tipo de munição, compartilhado pelas três telas de autoria de item
 * (item personalizado, editor de item e Pacote de Itens homebrew).
 *
 * É `freeSolo` porque o vocabulário de `AmmoType` é ABERTO: além dos cinco do
 * livro, o autor cunha famílias próprias ("Cartuchos a vapor") ao criar um
 * pacote de munição. As sugestões existem justamente para que apontar uma arma
 * para esse tipo seja uma ESCOLHA e não uma redigitação — arma e munição se
 * encontram por igualdade de string, então um typo quebraria o vínculo em
 * silêncio.
 */
const AmmoTypeField: React.FC<AmmoTypeFieldProps> = ({
  label,
  value,
  onChange,
  options,
  helperText,
  size = 'medium',
  fullWidth = true,
}) => (
  <Autocomplete
    freeSolo
    size={size}
    fullWidth={fullWidth}
    options={options}
    value={value || null}
    // `onChange` cobre escolher da lista e limpar; `onInputChange` cobre a
    // digitação livre. Sem os dois, um tipo novo só seria gravado se o usuário
    // apertasse Enter.
    onChange={(_, next) => onChange((next as AmmoType) ?? '')}
    onInputChange={(_, next, reason) => {
      if (reason === 'input') onChange(next.trim() as AmmoType);
    }}
    getOptionLabel={(option) => ammoTypeLabel(option as AmmoType)}
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
