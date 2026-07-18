import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Skill from '@/interfaces/Skills';

// Busca só aparece quando a lista é grande o suficiente para valer a pena
const SEARCH_THRESHOLD = 10;

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

interface SkillChipSelectorProps {
  availableSkills: Skill[];
  selectedSkills: Skill[];
  onToggle: (skill: Skill) => void;
  maxReached: boolean;
}

const SkillChipSelector: React.FC<SkillChipSelectorProps> = ({
  availableSkills,
  selectedSkills,
  onToggle,
  maxReached,
}) => {
  const [search, setSearch] = useState('');
  const showSearch = availableSkills.length > SEARCH_THRESHOLD;

  // Perícias selecionadas permanecem visíveis mesmo fora do filtro, para a
  // seleção atual nunca "sumir" durante a busca
  const visibleSkills = useMemo(() => {
    if (!showSearch || !search.trim()) return availableSkills;
    const query = normalize(search.trim());
    return availableSkills.filter(
      (skill) =>
        selectedSkills.includes(skill) || normalize(skill).includes(query)
    );
  }, [availableSkills, selectedSkills, search, showSearch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {showSearch && (
        <TextField
          size='small'
          placeholder='Buscar perícia...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    aria-label='Limpar busca'
                    onClick={() => setSearch('')}
                  >
                    <ClearIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      )}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {visibleSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          const isDisabled = !isSelected && maxReached;

          let hoverBgColor: string | undefined;
          if (isSelected) {
            hoverBgColor = 'primary.dark';
          } else if (!isDisabled) {
            hoverBgColor = 'rgba(209, 50, 53, 0.08)';
          }

          return (
            <Chip
              key={skill}
              label={skill}
              size='small'
              variant={isSelected ? 'filled' : 'outlined'}
              color={isSelected ? 'primary' : 'default'}
              onClick={isDisabled ? undefined : () => onToggle(skill)}
              disabled={isDisabled}
              sx={{
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                '&:hover': {
                  backgroundColor: hoverBgColor,
                },
              }}
            />
          );
        })}
        {visibleSkills.length === 0 && (
          <Typography
            variant='body2'
            sx={{
              color: 'text.secondary',
            }}
          >
            Nenhuma perícia encontrada.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SkillChipSelector;
