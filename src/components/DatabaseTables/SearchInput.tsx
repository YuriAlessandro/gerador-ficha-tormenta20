import 'regenerator-runtime';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Stack,
  TextField,
  InputAdornment,
  Popover,
  Box,
  IconButton,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import debounce from 'lodash/debounce';

interface IProps {
  value: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceSearch: (newValue: string) => void;
}

const SearchInput: React.FC<IProps> = ({
  value,
  handleChange,
  onVoiceSearch,
}) => {
  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value);

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // Sync local value when parent value changes (e.g., from voice search)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced callback to parent - only triggers filter after 300ms of no typing
  // We pass the value directly since React events are pooled and recycled
  const debouncedSetValue = useMemo(
    () =>
      debounce((newValue: string) => {
        // Create a synthetic event-like object for compatibility with parent
        const syntheticEvent = {
          target: { value: newValue },
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(syntheticEvent);
      }, 300),
    [handleChange]
  );

  // Cleanup debounce on unmount
  useEffect(
    () => () => {
      debouncedSetValue.cancel();
    },
    [debouncedSetValue]
  );

  // Handle input change - update local state immediately, debounce parent callback
  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setLocalValue(newValue);
      debouncedSetValue(newValue);
    },
    [debouncedSetValue]
  );

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (transcript) {
      onVoiceSearch(transcript);
    }
  }, [transcript]);

  return (
    <Stack spacing={2} direction='row' alignItems='center'>
      <TextField
        id='races-search'
        label='Filtrar'
        variant='outlined'
        value={localValue}
        onChange={onInputChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              {browserSupportsSpeechRecognition && (
                <>
                  {listening ? (
                    <IconButton
                      onClick={() => SpeechRecognition.stopListening()}
                    >
                      <GraphicEqIcon sx={{ color: 'green' }} />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() =>
                        SpeechRecognition.startListening({ language: 'pt-BR' })
                      }
                    >
                      <MicIcon />
                    </IconButton>
                  )}
                </>
              )}
            </InputAdornment>
          ),
        }}
      />

      <Box onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
        <HelpOutlineIcon />
      </Box>

      <Popover
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        Essa busca irá mostrar resultados do nome direto e de quaisquer
        sub-items importantes dessa sessão (habilidades de raça, por exemplo).
      </Popover>
    </Stack>
  );
};

export default SearchInput;
