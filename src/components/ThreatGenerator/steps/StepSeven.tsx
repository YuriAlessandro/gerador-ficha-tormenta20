import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { ThreatSheet, TreasureLevel } from '../../../interfaces/ThreatSheet';

interface StepSevenProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const StepSeven: React.FC<StepSevenProps> = ({ threat, onUpdate }) => {
  const handleEquipmentChange = (equipment: string) => {
    onUpdate({ equipment });
  };

  const handleTreasureLevelChange = (treasureLevel: TreasureLevel) => {
    onUpdate({ treasureLevel });
  };

  return (
    <Box p={3}>
      <Typography variant='h6' gutterBottom>
        Equipamentos e Tesouro
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Descreva os equipamentos da ameaça e configure o nível de tesouro que
        ela oferece quando derrotada.
      </Typography>

      <Grid container spacing={3}>
        {/* Equipment Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Equipamentos
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={2}>
              Liste armas, armaduras, itens mágicos e outros equipamentos que a
              ameaça possui.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              label='Descrição dos Equipamentos'
              value={threat.equipment || ''}
              onChange={(e) => handleEquipmentChange(e.target.value)}
              placeholder='Ex:
- Espada longa élfica +1
- Armadura de couro
- Poção de cura
- Anel de proteção
- 50 moedas de ouro'
            />
          </Paper>
        </Grid>

        {/* Treasure Level Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Nível de Tesouro
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={3}>
              Determina a quantidade de riquezas que a ameaça oferece quando
              derrotada.
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Nível de Tesouro</InputLabel>
              <Select
                value={threat.treasureLevel || TreasureLevel.STANDARD}
                label='Nível de Tesouro'
                onChange={(e) =>
                  handleTreasureLevelChange(e.target.value as TreasureLevel)
                }
              >
                {Object.values(TreasureLevel).map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box mt={3}>
              <Typography variant='body2' color='text.secondary'>
                <strong>Níveis de Tesouro:</strong>
              </Typography>
              <Box mt={1}>
                <Typography variant='caption' display='block'>
                  • <strong>Nenhum:</strong> Não oferece tesouro
                </Typography>
                <Typography variant='caption' display='block'>
                  • <strong>Padrão:</strong> Tesouro normal para o ND
                </Typography>
                <Typography variant='caption' display='block'>
                  • <strong>Metade:</strong> 50% do tesouro padrão
                </Typography>
                <Typography variant='caption' display='block'>
                  • <strong>Dobro:</strong> 200% do tesouro padrão
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Equipment Examples */}
      <Box mt={4}>
        <Typography variant='subtitle1' gutterBottom>
          Exemplos de Equipamentos por Tipo
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper variant='outlined' sx={{ p: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                <strong>Humanoides</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Armas, armaduras, poções, moedas, itens mágicos diversos
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper variant='outlined' sx={{ p: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                <strong>Monstros</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Garras naturais, escamas, componentes mágicos, gemas
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper variant='outlined' sx={{ p: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                <strong>Construtos</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Engrenagens mágicas, cristais de energia, metais raros
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper variant='outlined' sx={{ p: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                <strong>Mortos-vivos</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Relíquias antigas, pergaminhos, componentes necromânticos
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Treasure Guidelines */}
      <Box mt={3}>
        <Alert severity='info'>
          <Typography variant='body2'>
            <strong>Dica:</strong> O tesouro padrão é baseado no ND da ameaça.
            Use &quot;Metade&quot; para lacaios ou ameaças em grandes grupos, e
            &quot;Dobro&quot; para chefes importantes ou ameaças solo especiais.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default StepSeven;
