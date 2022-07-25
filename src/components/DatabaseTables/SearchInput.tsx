import React, { useEffect } from 'react';
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

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    onVoiceSearch(transcript);
  }, [transcript]);

  return (
    <Stack spacing={2} direction='row' alignItems='center'>
      <TextField
        id='races-search'
        label='Filtrar'
        variant='outlined'
        value={value}
        onChange={handleChange}
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
                      onClick={() => SpeechRecognition.startListening()}
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
