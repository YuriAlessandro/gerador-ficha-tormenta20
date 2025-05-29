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

const getText = (text: string) => <div>{text}</div>;

const generateClassPowerDiv = (power: ClassPower | ClassAbility) =>
  getText(power.text);
const generateGeneralPowerDiv = (power: RaceAbility | OriginPower) =>
  getText(power.description);

const PowerDisplay: React.FC<{
  power: ClassPower | RaceAbility | ClassAbility | OriginPower;
  type: string;
  count: number;
}> = ({ power, type, count }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const theme = useTheme();

  const isMobile = window.innerWidth < 720;

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
      </AccordionDetails>
    </Accordion>
  );
};
export default PowerDisplay;
