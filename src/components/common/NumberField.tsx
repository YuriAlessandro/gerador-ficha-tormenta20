import React from 'react';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { SxProps, Theme } from '@mui/material/styles';

// React 17 não tem useId; contador módulo-local gera ids estáveis por instância
let nextNumberFieldId = 0;
const useStableId = (): string => {
  const [id] = React.useState(() => {
    nextNumberFieldId += 1;
    return `number-field-${nextNumberFieldId}`;
  });
  return id;
};

export interface NumberFieldProps {
  value?: number | null;
  onValueChange?: (value: number | null) => void;
  label?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  /** Adornment inicial (ex.: "T$"); o final é ocupado pelos botões +/- */
  startAdornment?: React.ReactNode;
  autoFocus?: boolean;
  /** Chamado depois do handler interno do Base UI (setas ↑/↓ continuam funcionando) */
  onKeyDown?: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  /** Aplicado no FormControl (raiz). Use para width, margens etc. */
  sx?: SxProps<Theme>;
}

/**
 * Campo numérico no padrão do Material UI v9: primitivo NumberField do
 * Base UI composto com os blocos do Material UI (FormControl, OutlinedInput,
 * InputLabel), com botões de incremento/decremento como adornment.
 * Receita oficial: https://mui.com/material-ui/react-number-field/
 */
const NumberField: React.FC<NumberFieldProps> = ({
  value,
  onValueChange,
  label,
  min,
  max,
  step,
  size = 'medium',
  fullWidth = false,
  error = false,
  helperText,
  placeholder,
  disabled = false,
  required = false,
  id: idProp,
  name,
  startAdornment,
  autoFocus = false,
  onKeyDown,
  sx,
}) => {
  const stableId = useStableId();
  const id = idProp ?? stableId;

  return (
    <BaseNumberField.Root
      value={value}
      onValueChange={(newValue) => onValueChange?.(newValue)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      required={required}
      name={name}
      render={(props, state) => (
        <FormControl
          size={size}
          fullWidth={fullWidth}
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          variant='outlined'
          sx={sx}
        >
          {props.children}
        </FormControl>
      )}
    >
      {label !== undefined && label !== null && label !== '' && (
        <InputLabel htmlFor={id}>{label}</InputLabel>
      )}
      <BaseNumberField.Input
        id={id}
        render={(props, state) => (
          <OutlinedInput
            aria-describedby={helperText ? `${id}-helper-text` : undefined}
            label={label}
            placeholder={placeholder}
            fullWidth={fullWidth}
            inputRef={props.ref}
            value={state.inputValue}
            autoFocus={autoFocus}
            onBlur={props.onBlur}
            onChange={props.onChange}
            onKeyUp={props.onKeyUp}
            onKeyDown={(event) => {
              props.onKeyDown?.(event as React.KeyboardEvent<HTMLInputElement>);
              onKeyDown?.(event);
            }}
            onFocus={props.onFocus}
            slotProps={{
              input: props,
            }}
            startAdornment={startAdornment}
            endAdornment={
              <InputAdornment
                position='end'
                sx={{
                  flexDirection: 'column',
                  maxHeight: 'unset',
                  alignSelf: 'stretch',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  ml: 0,
                  '& button': {
                    py: 0,
                    flex: 1,
                    borderRadius: 0.5,
                  },
                }}
              >
                <BaseNumberField.Increment
                  render={<IconButton size={size} aria-label='Aumentar' />}
                >
                  <KeyboardArrowUpIcon
                    fontSize={size}
                    sx={{ transform: 'translateY(2px)' }}
                  />
                </BaseNumberField.Increment>

                <BaseNumberField.Decrement
                  render={<IconButton size={size} aria-label='Diminuir' />}
                >
                  <KeyboardArrowDownIcon
                    fontSize={size}
                    sx={{ transform: 'translateY(-2px)' }}
                  />
                </BaseNumberField.Decrement>
              </InputAdornment>
            }
            sx={{ pr: 0 }}
          />
        )}
      />
      {helperText && (
        <FormHelperText id={`${id}-helper-text`} sx={{ ml: 0 }}>
          {helperText}
        </FormHelperText>
      )}
    </BaseNumberField.Root>
  );
};

export default NumberField;
