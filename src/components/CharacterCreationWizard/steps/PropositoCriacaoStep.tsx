import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Radio,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import Race from '@/interfaces/Race';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { isPowerAvailable } from '@/functions/powers';
import { GeneralPower, GeneralPowerType } from '@/interfaces/Poderes';
import { ClassDescription } from '@/interfaces/Class';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
import Skill from '@/interfaces/Skills';
import { normalizeSearch } from '@/functions/stringUtils';

interface PropositoCriacaoStepProps {
  selectedPower?: GeneralPower;
  onChange: (power: GeneralPower | undefined) => void;
  baseAttributes?: Record<Atributo, number>;
  raceAttributes?: Atributo[];
  race?: Race;
  classe?: ClassDescription;
  usedSkills: Skill[];
  supplements: SupplementId[];
}

const VALID_POWER_TYPES = [
  GeneralPowerType.COMBATE,
  GeneralPowerType.DESTINO,
  GeneralPowerType.MAGIA,
  GeneralPowerType.TORMENTA,
];

const POWER_TYPE_LABELS: Record<string, string> = {
  [GeneralPowerType.COMBATE]: 'Poderes de Combate',
  [GeneralPowerType.DESTINO]: 'Poderes de Destino',
  [GeneralPowerType.MAGIA]: 'Poderes de Magia',
  [GeneralPowerType.TORMENTA]: 'Poderes da Tormenta',
};

const PropositoCriacaoStep: React.FC<PropositoCriacaoStepProps> = ({
  selectedPower,
  onChange,
  baseAttributes,
  raceAttributes,
  race,
  classe,
  usedSkills,
  supplements,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  // Build a mock sheet for power requirement checking
  const mockSheet = useMemo((): CharacterSheet | null => {
    if (!baseAttributes || !race) return null;

    const atributos: Record<Atributo, { value: number; mod: number }> = {
      [Atributo.FORCA]: { value: 0, mod: 0 },
      [Atributo.DESTREZA]: { value: 0, mod: 0 },
      [Atributo.CONSTITUICAO]: { value: 0, mod: 0 },
      [Atributo.INTELIGENCIA]: { value: 0, mod: 0 },
      [Atributo.SABEDORIA]: { value: 0, mod: 0 },
      [Atributo.CARISMA]: { value: 0, mod: 0 },
    };

    Object.entries(baseAttributes).forEach(([attr, modifier]) => {
      atributos[attr as Atributo].value = modifier;
      atributos[attr as Atributo].mod = modifier;
    });

    race.attributes.attrs.forEach((attrMod) => {
      if (attrMod.attr === 'any') {
        raceAttributes?.forEach((chosenAttr) => {
          atributos[chosenAttr].value += attrMod.mod;
          atributos[chosenAttr].mod += attrMod.mod;
        });
      } else {
        atributos[attrMod.attr].value += attrMod.mod;
        atributos[attrMod.attr].mod += attrMod.mod;
      }
    });

    return {
      atributos,
      generalPowers: [],
      classPowers: [],
      skills: usedSkills,
      nivel: 1,
      classe: {
        name: classe?.name || '',
        abilities: classe?.abilities || [],
        proficiencias: classe?.proficiencias || [],
      },
      raca: race,
      spells: [],
      sheetActionHistory: [],
    } as unknown as CharacterSheet;
  }, [baseAttributes, race, raceAttributes, usedSkills, classe]);

  // Get all general powers and group by type
  const powersByType = useMemo(() => {
    const allPowers = dataRegistry.getAllPowersBySupplements(supplements);
    const filtered = allPowers.filter((power) =>
      VALID_POWER_TYPES.includes(power.type)
    );

    const grouped: Record<
      string,
      { power: GeneralPower; available: boolean }[]
    > = {};

    filtered.forEach((power) => {
      if (!grouped[power.type]) {
        grouped[power.type] = [];
      }
      const available = mockSheet ? isPowerAvailable(mockSheet, power) : true;
      grouped[power.type].push({ power, available });
    });

    // Sort each group: available first, then alphabetical
    Object.values(grouped).forEach((group) => {
      group.sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        return a.power.name.localeCompare(b.power.name);
      });
    });

    return grouped;
  }, [supplements, mockSheet]);

  const normalizedFilter = normalizeSearch(searchFilter.trim());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Como um Golem, você não possui uma origem. Em vez disso, escolha um
        poder geral como seu <strong>Propósito de Criação</strong>.
      </Typography>

      <TextField
        label='Buscar poder'
        variant='outlined'
        size='small'
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        fullWidth
      />

      {VALID_POWER_TYPES.map((type) => {
        const powers = powersByType[type];
        if (!powers || powers.length === 0) return null;

        const filteredPowers = normalizedFilter
          ? powers.filter((p) =>
              normalizeSearch(p.power.name).includes(normalizedFilter)
            )
          : powers;

        if (filteredPowers.length === 0) return null;

        return (
          <Accordion
            key={type}
            defaultExpanded={type === GeneralPowerType.COMBATE}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>
                {POWER_TYPE_LABELS[type]} ({filteredPowers.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {filteredPowers.map(({ power, available }) => {
                  const isSelected = selectedPower?.name === power.name;

                  return (
                    <FormControlLabel
                      key={power.name}
                      control={
                        <Radio
                          checked={isSelected}
                          onChange={() =>
                            onChange(isSelected ? undefined : power)
                          }
                          disabled={!available}
                        />
                      }
                      label={
                        <Box>
                          <Typography
                            component='span'
                            sx={{
                              color: !available ? 'text.disabled' : 'inherit',
                            }}
                          >
                            {power.name}
                            {!available && (
                              <Typography
                                component='span'
                                variant='caption'
                                sx={{ ml: 1, fontStyle: 'italic' }}
                              >
                                (pré-requisitos não atendidos)
                              </Typography>
                            )}
                          </Typography>
                          {isSelected && (
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{ mt: 0.5 }}
                            >
                              {power.description}
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', mb: 0.5 }}
                    />
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {selectedPower && (
        <Alert severity='success'>
          Poder selecionado: <strong>{selectedPower.name}</strong>. Você pode
          continuar para o próximo passo.
        </Alert>
      )}

      {!selectedPower && (
        <Alert severity='info'>Selecione um poder geral para continuar.</Alert>
      )}
    </Box>
  );
};

export default PropositoCriacaoStep;
