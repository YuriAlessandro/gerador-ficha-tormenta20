import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Spell } from '@/interfaces/Spells';

interface LevelSpellSelectionStepProps {
  availableSpells: Spell[];
  selectedSpells: Spell[];
  requiredCount: number;
  spellCircle: number;
  onSpellToggle: (spell: Spell) => void;
}

const LevelSpellSelectionStep: React.FC<LevelSpellSelectionStepProps> = ({
  availableSpells,
  selectedSpells,
  requiredCount,
  spellCircle,
  onSpellToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const isSpellSelected = (spell: Spell): boolean =>
    selectedSpells.some((s) => s.nome === spell.nome);

  const isComplete = selectedSpells.length === requiredCount;

  // Filter spells by search query
  const filteredSpells = useMemo(() => {
    if (!searchQuery) return availableSpells;

    const lowerQuery = searchQuery.toLowerCase();
    return availableSpells.filter((spell) => {
      const name = spell.nome.toLowerCase();
      const school = spell.school.toLowerCase();
      const description = spell.description.toLowerCase();
      return (
        name.includes(lowerQuery) ||
        school.includes(lowerQuery) ||
        description.includes(lowerQuery)
      );
    });
  }, [availableSpells, searchQuery]);

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Seleção de Magias - Círculo {spellCircle}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
        Escolha {requiredCount} {requiredCount === 1 ? 'magia' : 'magias'} do{' '}
        {spellCircle}º círculo.
      </Typography>
      <Typography
        variant='body2'
        color={isComplete ? 'success.main' : 'warning.main'}
        sx={{ mb: 2 }}
      >
        {selectedSpells.length} de {requiredCount}{' '}
        {requiredCount === 1 ? 'magia selecionada' : 'magias selecionadas'}
      </Typography>

      {availableSpells.length === 0 && (
        <Typography variant='body2' color='text.secondary'>
          Nenhuma magia disponível neste círculo. Você já conhece todas as
          magias disponíveis ou não há magias neste círculo para sua classe.
        </Typography>
      )}

      {availableSpells.length > 0 && (
        <>
          {/* Search field */}
          <TextField
            fullWidth
            size='small'
            placeholder='Buscar magias por nome, escola ou descrição...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {filteredSpells.length === 0 && searchQuery && (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Nenhuma magia encontrada para &quot;{searchQuery}&quot;
            </Typography>
          )}

          {searchQuery && filteredSpells.length > 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {filteredSpells.length}{' '}
              {filteredSpells.length === 1
                ? 'magia encontrada'
                : 'magias encontradas'}
            </Typography>
          )}
        </>
      )}

      <Grid container spacing={2}>
        {filteredSpells.map((spell) => {
          const selected = isSpellSelected(spell);
          const canSelect = !selected && selectedSpells.length < requiredCount;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={spell.nome}>
              <Card
                variant='outlined'
                sx={{
                  cursor: canSelect || selected ? 'pointer' : 'default',
                  border: selected ? 2 : 1,
                  borderColor: selected ? 'primary.main' : 'divider',
                  opacity: !canSelect && !selected ? 0.5 : 1,
                  '&:hover': {
                    borderColor:
                      canSelect || selected ? 'primary.light' : 'divider',
                    bgcolor: canSelect || selected ? 'action.hover' : 'inherit',
                  },
                  height: '100%',
                }}
                onClick={() => {
                  if (canSelect || selected) {
                    onSpellToggle(spell);
                  }
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                      {spell.nome}
                    </Typography>
                    <Chip
                      label={`${spell.spellCircle}º círculo`}
                      size='small'
                      color='primary'
                      variant='outlined'
                    />
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block' }}
                    >
                      {spell.school}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block' }}
                    >
                      {spell.execucao} • {spell.alcance}
                      {spell.alvo && ` • ${spell.alvo}`}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block' }}
                    >
                      Duração: {spell.duracao}
                    </Typography>
                  </Box>

                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {spell.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {!isComplete && filteredSpells.length > 0 && (
        <Typography
          variant='body2'
          color='warning.main'
          sx={{ mt: 2, textAlign: 'center' }}
        >
          Selecione {requiredCount - selectedSpells.length}{' '}
          {requiredCount - selectedSpells.length === 1
            ? 'magia mais'
            : 'magias mais'}{' '}
          para continuar.
        </Typography>
      )}
    </Box>
  );
};

export default LevelSpellSelectionStep;
