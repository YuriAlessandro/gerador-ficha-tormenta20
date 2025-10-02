import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { manaExpenseByCircle } from '../data/systems/tormenta20/magias/generalSpells';
import { Spell } from '../interfaces/Spells';

interface SpellProps {
  spell: Spell;
}

const SpellRow: React.FC<SpellProps> = (props) => {
  const { spell } = props;

  const [isExpanded, setIsExpanded] = React.useState(false);
  const theme = useTheme();

  const isMobile = window.innerWidth < 720;

  return (
    <Accordion
      expanded={isExpanded}
      onChange={() => setIsExpanded(!isExpanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id={spell.nome}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography
              sx={{
                flexShrink: 0,
                fontWeight: 'semi-bold',
                color: theme.palette.primary.main,
                fontSize: '0.9rem',
              }}
            >
              {spell.nome} {spell.customKeyAttr && `(${spell.customKeyAttr})`}
            </Typography>
          </Grid>
          {!isMobile && (
            <>
              <Grid item xs={2}>
                <Typography>{spell.school}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>{spell.execucao}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>{spell.alcance}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>{spell.resistencia || '-'}</Typography>
              </Grid>
            </>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        {isMobile && (
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={3}>
              <Typography>{spell.school}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography>{spell.execucao}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography>{spell.alcance}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography>{spell.resistencia || '-'}</Typography>
            </Grid>
          </Grid>
        )}
        <Grid container>
          <Grid item xs={10}>
            <Typography fontWeight='bold'>{spell.spellCircle}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography
              sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
            >
              Custo: {manaExpenseByCircle[spell.spellCircle]} PM
            </Typography>
          </Grid>
        </Grid>
        {spell.manaReduction && (
          <Typography sx={{ marginTop: '10px' }}>
            - Você tem {spell.manaReduction} de redução de mana para a magia{' '}
            {spell.nome}
          </Typography>
        )}
        <p>{spell.description}</p>
        {spell.aprimoramentos && spell.aprimoramentos.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            {spell.aprimoramentos.map((aprimoramento) => (
              <Typography
                key={`${aprimoramento.addPm}-${aprimoramento.text.substring(
                  0,
                  20
                )}`}
                sx={{ marginBottom: '8px' }}
              >
                <strong style={{ color: theme.palette.primary.main }}>
                  {aprimoramento.addPm === 0
                    ? 'Truque:'
                    : `+${aprimoramento.addPm} PM:`}
                </strong>{' '}
                {aprimoramento.text}
              </Typography>
            ))}
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default SpellRow;
