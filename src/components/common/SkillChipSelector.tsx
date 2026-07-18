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
import Skill, { isOficioSkill } from '@/interfaces/Skills';
import { normalizeSearch } from '@/functions/stringUtils';
import OficioPicker from './OficioPicker';

// Busca só aparece quando a lista é grande o suficiente para valer a pena
const SEARCH_THRESHOLD = 10;

interface SkillChipSelectorProps {
  availableSkills: Skill[];
  selectedSkills: Skill[];
  onToggle: (skill: Skill) => void;
  maxReached: boolean;
  /**
   * Libera a criação de Ofícios customizados no menu. Explícito (e não
   * inferido) porque criar um `Skill` fora do enum não deve ser um efeito
   * colateral silencioso de um componente genérico.
   */
  allowCustomOficio?: boolean;
  /** Ofícios já usados em outro passo: desabilitados e bloqueados para custom. */
  unavailableOficios?: Skill[];
}

const SkillChipSelector: React.FC<SkillChipSelectorProps> = ({
  availableSkills,
  selectedSkills,
  onToggle,
  maxReached,
  allowCustomOficio = false,
  unavailableOficios = [],
}) => {
  const [search, setSearch] = useState('');

  // Os Ofícios colapsam num chip único com menu — sem isso a lista ganha 16
  // chips que a maioria dos usuários não usa.
  const oficioOptions = useMemo(
    () => availableSkills.filter(isOficioSkill),
    [availableSkills]
  );
  const plainSkills = useMemo(
    () => availableSkills.filter((skill) => !isOficioSkill(skill)),
    [availableSkills]
  );
  // Vem de selectedSkills, NÃO da interseção com availableSkills: um Ofício
  // customizado nunca está em availableSkills (derivado do enum) e sumiria da
  // tela logo após ser criado.
  const selectedOficios = useMemo(
    () => selectedSkills.filter(isOficioSkill),
    [selectedSkills]
  );

  const hasOficioGroup = oficioOptions.length > 0 || selectedOficios.length > 0;
  // O grupo de Ofícios conta como 1 para o threshold, já que ocupa 1 chip
  const showSearch =
    plainSkills.length + (hasOficioGroup ? 1 : 0) > SEARCH_THRESHOLD;

  const query = normalizeSearch(search.trim());

  // Perícias selecionadas permanecem visíveis mesmo fora do filtro, para a
  // seleção atual nunca "sumir" durante a busca
  const visibleSkills = useMemo(() => {
    if (!showSearch || !query) return plainSkills;
    return plainSkills.filter(
      (skill) =>
        selectedSkills.includes(skill) || normalizeSearch(skill).includes(query)
    );
  }, [plainSkills, selectedSkills, query, showSearch]);

  // O chip de Ofício some da busca só quando nem o rótulo nem nenhum ofício
  // (do catálogo ou já escolhido) casam com a query
  const showOficioGroup =
    hasOficioGroup &&
    (!showSearch ||
      !query ||
      normalizeSearch('Ofício').includes(query) ||
      [...oficioOptions, ...selectedOficios].some((oficio) =>
        normalizeSearch(oficio).includes(query)
      ));

  const isEmpty = visibleSkills.length === 0 && !showOficioGroup;

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
        {showOficioGroup && (
          <OficioPicker
            selected={selectedOficios}
            options={oficioOptions}
            unavailable={unavailableOficios}
            maxReached={maxReached}
            allowCustom={allowCustomOficio}
            onSelect={onToggle}
            onDeselect={onToggle}
          />
        )}
        {isEmpty && (
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
