import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  useTheme,
} from '@mui/material';
import { SheetActionHistoryEntry } from '@/interfaces/CharacterSheet';

const getText = (text: string) => <div>{text}</div>;

const generateClassPowerDiv = (power: ClassPower | ClassAbility) =>
  getText(power.text);
const generateGeneralPowerDiv = (power: RaceAbility | OriginPower) =>
  getText(power.description);

const PowerDisplay: React.FC<{
  sheetHistory: SheetActionHistoryEntry[];
  power: ClassPower | RaceAbility | ClassAbility | OriginPower;
  type: string;
  count: number;
}> = ({ sheetHistory, power, type, count }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const theme = useTheme();

  const isMobile = window.innerWidth < 720;

  const historySources = sheetHistory
    .filter((entry) =>
      entry.changes.some(
        (change) =>
          change.type === 'PowerAdded' && change.powerName === power.name
      )
    )
    .map((entry) => {
      const { source } = entry;
      if (source.type === 'levelUp') {
        return `Nível ${source.level}`;
      }
      if (source.type === 'power') {
        return source.name;
      }
      if (source.type === 'origin') {
        return `${source.originName}`;
      }
      if (source.type === 'class') {
        return `${source.className}`;
      }
      if (source.type === 'divinity') {
        return `Devoto de ${source.divinityName}`;
      }
      if (source.type === 'race') {
        return `${source.raceName}`;
      }
      return '';
    })
    .filter((source) => source !== '');

  // Check if this is a general power that was added manually
  const isManuallyAdded = type === 'Poder Geral' && historySources.length === 0;

  const powerSources = isManuallyAdded
    ? 'Adicionado manualmente'
    : historySources.join(', ');

  return (
    <Accordion
      expanded={isExpanded}
      onChange={() => setIsExpanded(!isExpanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id={power.name}>
        <Typography
          sx={{
            width: isMobile ? '70%' : '80%',
            flexShrink: 0,
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            fontSize: '0.9rem',
          }}
        >
          {power.name}
          {count > 1 ? ` (x${count})` : ''}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{type}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {generateClassPowerDiv(power as ClassPower)}
        {generateGeneralPowerDiv(power as RaceAbility)}
        <div style={{ paddingTop: '16px' }}>
          <Typography variant='caption' color='text.secondary'>
            Vindo de: {powerSources || 'Origem não identificada'}
          </Typography>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};
export default PowerDisplay;
