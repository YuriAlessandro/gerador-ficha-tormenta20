import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Race, { RaceAttributeAbility } from '../../interfaces/Race';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry, RaceWithSupplement } from '../../data/registry';
import { normalizeSearch } from '../../functions/stringUtils';
import { encyclopediaIds } from '../../functions/encyclopediaSearch';
import { SEO, getPageSEO } from '../SEO';
import TormentaTitle from '../Database/TormentaTitle';
import SearchInput from './SearchInput';
import SupplementFilter from './SupplementFilter';
import DatabaseGrid from '../Database/DatabaseGrid';
import DatabaseCard from '../Database/DatabaseCard';
import ClickableChipFilterGroup, {
  ClickableFilterOption,
} from '../Database/ClickableChipFilterGroup';
import CopyUrlButton from '../Database/CopyUrlButton';
import AddToGrimoireButton from '../PocketGrimoire/AddToGrimoireButton';

const ALL_RACE_SUPPLEMENTS: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

interface ProcessedAttribute {
  label: string;
  type: 'specific' | 'any' | 'special';
}

const processAttributeList = (
  attrs: RaceAttributeAbility[]
): ProcessedAttribute[] => {
  const specificAttrs = attrs.filter((attr) => attr.attr !== 'any');
  const anyAttrs = attrs.filter((attr) => attr.attr === 'any');
  const result: ProcessedAttribute[] = [];

  specificAttrs.forEach((attr) => {
    result.push({
      label: `${attr.attr} ${attr.mod > 0 ? '+' : ''}${attr.mod}`,
      type: 'specific',
    });
  });

  const anyGroups: Record<number, number> = {};
  anyAttrs.forEach((attr) => {
    anyGroups[attr.mod] = (anyGroups[attr.mod] || 0) + 1;
  });

  Object.entries(anyGroups).forEach(([mod, count]) => {
    const modValue = parseInt(mod, 10);
    const sign = modValue > 0 ? '+' : '';
    const plural = count > 1;
    result.push({
      label: `${sign}${modValue} em ${count} atributo${
        plural ? 's diferentes' : ''
      } à sua escolha`,
      type: 'any',
    });
  });

  return result;
};

const processRaceAttributes = (race: Race): ProcessedAttribute[] => {
  if (race.attributeVariants && race.attributeVariants.length > 1) {
    return race.attributeVariants.flatMap((variant) =>
      processAttributeList(variant.attrs)
    );
  }
  return processAttributeList(race.attributes.attrs);
};

function getPositiveAttributes(race: Race): string[] {
  const found = new Set<string>();
  const collect = (attrs: RaceAttributeAbility[]) => {
    attrs.forEach((a) => {
      if (a.mod > 0) {
        found.add(a.attr === 'any' ? 'À escolha' : String(a.attr));
      }
    });
  };
  collect(race.attributes.attrs);
  if (race.attributeVariants) {
    race.attributeVariants.forEach((v) => collect(v.attrs));
  }
  if (race.heritages) {
    Object.values(race.heritages).forEach((h) => collect(h.attributes));
  }
  return Array.from(found);
}

const RacesTable: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [selectedSupplements, setSelectedSupplements] =
    useState<SupplementId[]>(ALL_RACE_SUPPLEMENTS);
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  const [onlyHeritages, setOnlyHeritages] = useState(false);

  const { params } = useRouteMatch<{ selectedRace?: string }>();
  const history = useHistory();

  const allRaces = useMemo(
    () => dataRegistry.getRacesWithSupplementInfo(selectedSupplements),
    [selectedSupplements]
  );

  const attrOptions: ClickableFilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    allRaces.forEach((race) => {
      getPositiveAttributes(race).forEach((attr) => {
        counts.set(attr, (counts.get(attr) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .map(([attr, count]) => ({ value: attr, label: `+ ${attr}`, count }));
  }, [allRaces]);

  const races = useMemo(() => {
    const search = normalizeSearch(value.trim());

    return allRaces.filter((race) => {
      if (onlyHeritages && !race.heritages) return false;

      if (selectedAttrs.length > 0) {
        const posAttrs = getPositiveAttributes(race);
        if (!selectedAttrs.some((a) => posAttrs.includes(a))) return false;
      }

      if (search.length > 0) {
        const heritageText = race.heritages
          ? Object.values(race.heritages).flatMap((h) => [
              h.name,
              ...h.abilities.flatMap((a) => [a.name, a.description]),
            ])
          : [];
        const haystack = normalizeSearch(
          [
            race.name,
            ...race.abilities.flatMap((a) => [a.name, a.description]),
            ...heritageText,
          ].join(' ')
        );
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [allRaces, value, selectedAttrs, onlyHeritages]);

  const handleToggleSupplement = (supplementId: SupplementId) => {
    setSelectedSupplements((prev) => {
      if (prev.includes(supplementId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== supplementId);
      }
      if (supplementId === SupplementId.TORMENTA20_CORE) {
        return [supplementId, ...prev];
      }
      return [...prev, supplementId];
    });
  };

  useEffect(() => {
    const { selectedRace } = params;
    if (selectedRace) {
      setValue(decodeURIComponent(selectedRace));
    }
  }, [params]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    if (params.selectedRace) history.push('/database/raças');
  };

  const onVoiceSearch = (newValue: string) => {
    setValue(newValue);
    if (params.selectedRace) history.push('/database/raças');
  };

  const clearFilters = () => {
    setValue('');
    setSelectedAttrs([]);
    setOnlyHeritages(false);
    if (params.selectedRace) history.push('/database/raças');
  };

  const normalizedSelected = params.selectedRace
    ? normalizeSearch(decodeURIComponent(params.selectedRace))
    : '';

  const selectedRaceData =
    races.length === 1 && params.selectedRace ? races[0] : null;
  const racesSEO = getPageSEO('races');

  const renderRaceCard = (race: RaceWithSupplement) => {
    const actions = (
      <>
        <AddToGrimoireButton
          itemId={encyclopediaIds.race(race.name)}
          itemName={race.name}
        />
        <CopyUrlButton
          itemName={race.name}
          itemType='raça'
          size='small'
          variant='minimal'
        />
      </>
    );

    const badges = (
      <>
        <Chip
          label={race.supplementName}
          size='small'
          variant='outlined'
          color={
            race.supplementId === SupplementId.TORMENTA20_CORE
              ? 'default'
              : 'secondary'
          }
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
        {race.size?.name && (
          <Chip
            label={`Tamanho: ${race.size.name}`}
            size='small'
            variant='outlined'
            sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
          />
        )}
        {race.heritages && (
          <Chip
            label='Com Heranças'
            size='small'
            color='info'
            variant='outlined'
            sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
          />
        )}
      </>
    );

    return (
      <DatabaseCard
        key={`${race.supplementId}-${race.name}`}
        title={race.name}
        icon={<GroupIcon fontSize='small' />}
        badges={badges}
        actions={actions}
        highlighted={
          Boolean(normalizedSelected) &&
          normalizeSearch(race.name) === normalizedSelected
        }
      >
        {/* Modificadores de Atributos */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant='subtitle2'
            sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, mb: 0.75 }}
          >
            Modificadores de Atributos
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {processRaceAttributes(race).map((attrInfo, idx) => (
              <Chip
                key={`${race.name}-attr-${idx}-${attrInfo.label}`}
                label={attrInfo.label}
                size='small'
                variant='outlined'
                color={attrInfo.type === 'any' ? 'secondary' : 'primary'}
                sx={{ fontFamily: 'Tfont, serif' }}
              />
            ))}
          </Box>
          {race.attributeVariants && race.attributeVariants.length > 1 && (
            <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              Escolha apenas uma das combinações acima.
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Habilidades Raciais */}
        <Typography
          variant='subtitle2'
          sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, mb: 1 }}
        >
          Habilidades Raciais
        </Typography>

        {race.heritages ? (
          <Stack spacing={2} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
            {Object.entries(race.heritages).map(([heritageKey, heritage]) => (
              <Box key={heritageKey}>
                <Typography
                  variant='subtitle2'
                  color='secondary'
                  sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, mb: 0.75 }}
                >
                  {heritage.name}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {processAttributeList(heritage.attributes).map((attrInfo, idx) => (
                    <Chip
                      key={`${heritageKey}-attr-${idx}-${attrInfo.label}`}
                      label={attrInfo.label}
                      size='small'
                      variant='outlined'
                      color={attrInfo.type === 'any' ? 'secondary' : 'primary'}
                      sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
                <Stack spacing={1}>
                  {heritage.abilities.map((ability) => (
                    <Box key={ability.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography
                          variant='subtitle2'
                          color='primary'
                          sx={{ fontFamily: 'Tfont, serif', fontWeight: 700 }}
                        >
                          {ability.name}
                        </Typography>
                        <AddToGrimoireButton
                          itemId={encyclopediaIds.raceAbility(
                            race.name,
                            ability.name,
                            heritage.name
                          )}
                          itemName={ability.name}
                        />
                      </Box>
                      <Typography variant='body2' sx={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}>
                        {ability.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={1.25} divider={<Divider flexItem />}>
            {race.abilities.map((ability) => (
              <Box key={ability.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography
                    variant='subtitle2'
                    color='primary'
                    sx={{ fontFamily: 'Tfont, serif', fontWeight: 700 }}
                  >
                    {ability.name}
                  </Typography>
                  <AddToGrimoireButton
                    itemId={encyclopediaIds.raceAbility(race.name, ability.name)}
                    itemName={ability.name}
                  />
                </Box>
                <Typography variant='body2' sx={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}>
                  {ability.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </DatabaseCard>
    );
  };

  return (
    <>
      <SEO
        title={
          selectedRaceData
            ? `${selectedRaceData.name} - Raça de Tormenta 20`
            : racesSEO.title
        }
        description={
          selectedRaceData
            ? `Atributos, habilidades e modificadores da raça ${selectedRaceData.name} em Tormenta 20.`
            : racesSEO.description
        }
        url={`/database/raças${
          selectedRaceData && params.selectedRace
            ? `/${params.selectedRace}`
            : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Raças e Habilidades Raciais
        </TormentaTitle>

        <SupplementFilter
          selectedSupplements={selectedSupplements}
          availableSupplements={ALL_RACE_SUPPLEMENTS}
          onToggleSupplement={handleToggleSupplement}
        />

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 540 }}>
            <SearchInput
              value={value}
              handleChange={handleChange}
              onVoiceSearch={onVoiceSearch}
            />
          </Box>
        </Box>

        <Paper
          variant='outlined'
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 3,
            borderRadius: 2,
            borderColor: `${theme.palette.primary.main}33`,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.02)'
                : 'rgba(0,0,0,0.015)',
          }}
        >
          <Stack spacing={1.5}>
            <ClickableChipFilterGroup
              label='Bônus de Atributo:'
              allLabel='Todos'
              options={attrOptions}
              selected={selectedAttrs}
              onToggle={(attr) =>
                setSelectedAttrs((prev) =>
                  prev.includes(attr)
                    ? prev.filter((a) => a !== attr)
                    : [...prev, attr]
                )
              }
              onClear={() => setSelectedAttrs([])}
            />

            <ClickableChipFilterGroup
              label='Estrutura Racial:'
              allLabel='Todas'
              options={[{ value: 'HERITAGES', label: 'Apenas com Heranças' }]}
              selected={onlyHeritages ? ['HERITAGES'] : []}
              onToggle={() => setOnlyHeritages((prev) => !prev)}
              onClear={() => setOnlyHeritages(false)}
            />
          </Stack>
        </Paper>

        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            {races.length} raça{races.length !== 1 ? 's' : ''} exibida
            {races.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <DatabaseGrid
          variant='wide'
          ariaLabel='Grade de raças'
          resetKey={`${value}|${selectedAttrs.join(',')}|${onlyHeritages}|${selectedSupplements.join(',')}`}
          emptyState={
            <Paper
              variant='outlined'
              sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
            >
              <Typography variant='body1' sx={{ color: 'text.secondary', mb: 2 }}>
                Nenhuma raça encontrada com os filtros aplicados.
              </Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={clearFilters}
                sx={{ fontFamily: 'Tfont, serif' }}
              >
                Limpar filtros
              </Button>
            </Paper>
          }
        >
          {races.map(renderRaceCard)}
        </DatabaseGrid>
      </Box>
    </>
  );
};

export default RacesTable;
