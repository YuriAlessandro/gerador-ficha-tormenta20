import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import { ThreatSheet, TreasureLevel } from '../../../interfaces/ThreatSheet';
import SectionCard from './shared/SectionCard';

interface StepTreasureProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const TREASURE_DESCRIPTIONS = [
  { label: 'Nenhum', text: 'Não oferece tesouro' },
  { label: 'Padrão', text: 'Tesouro normal para o ND' },
  { label: 'Metade', text: '50% do tesouro padrão' },
  { label: 'Dobro', text: '200% do tesouro padrão' },
];

const StepTreasure: React.FC<StepTreasureProps> = ({ threat, onUpdate }) => (
  <Box p={{ xs: 2, sm: 3 }}>
    <Typography variant='h6' gutterBottom>
      Tesouro e Equipamentos
    </Typography>
    <Typography variant='body2' color='text.secondary' mb={3}>
      Descreva os equipamentos da ameaça e o nível de tesouro que ela oferece
      quando derrotada.
    </Typography>

    <Grid container spacing={3} alignItems='stretch'>
      <Grid size={{ xs: 12, md: 8 }}>
        <SectionCard
          icon={<Inventory2OutlinedIcon />}
          title='Equipamentos'
          subtitle='Armas, armaduras, itens mágicos e outros pertences.'
          sx={{ height: '100%' }}
        >
          <TextField
            fullWidth
            multiline
            rows={9}
            label='Descrição dos Equipamentos'
            value={threat.equipment || ''}
            onChange={(e) => onUpdate({ equipment: e.target.value })}
            placeholder={`Ex:
- Espada longa élfica +1
- Armadura de couro
- Poção de cura
- Anel de proteção
- 50 moedas de ouro`}
          />
        </SectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <SectionCard
          icon={<DiamondOutlinedIcon />}
          title='Nível de Tesouro'
          subtitle='Riquezas oferecidas ao ser derrotada.'
          sx={{ height: '100%' }}
        >
          <FormControl fullWidth>
            <InputLabel>Nível de Tesouro</InputLabel>
            <Select
              value={threat.treasureLevel || TreasureLevel.STANDARD}
              label='Nível de Tesouro'
              onChange={(e) =>
                onUpdate({ treasureLevel: e.target.value as TreasureLevel })
              }
            >
              {Object.values(TreasureLevel).map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack spacing={0.5} mt={2}>
            {TREASURE_DESCRIPTIONS.map((item) => (
              <Typography variant='caption' display='block' key={item.label}>
                • <strong>{item.label}:</strong> {item.text}
              </Typography>
            ))}
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>

    <Box mt={3}>
      <Alert severity='info'>
        <Typography variant='body2'>
          <strong>Dica:</strong> o tesouro padrão é baseado no ND da ameaça. Use
          &quot;Metade&quot; para lacaios ou ameaças em grandes grupos, e
          &quot;Dobro&quot; para chefes importantes ou ameaças solo especiais.
        </Typography>
      </Alert>
    </Box>
  </Box>
);

export default StepTreasure;
