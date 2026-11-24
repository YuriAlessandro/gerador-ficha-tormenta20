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
import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry, OriginWithSupplement } from '../../data/registry';
import { ORIGIN_POWER_TYPE } from '../../data/systems/tormenta20/powers/originPowers';
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

const ALL_ORIGIN_SUPPLEMENTS: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_ATLAS_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const OriginsTable: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [selectedSupplements, setSelectedSupplements] = useState<SupplementId[]>(
    ALL_ORIGIN_SUPPLEMENTS
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const { params } = useRouteMatch<{ selectedOrigin?: string }>();
  const history = useHistory();

  const allOrigins = useMemo(
    () => dataRegistry.getOriginsBySupplements(selectedSupplements),
    [selectedSupplements]
  );

  const skillOptions: ClickableFilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    allOrigins.forEach((origin) => {
      (origin.pericias || []).forEach((skill) => {
        counts.set(skill, (counts.get(skill) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .map(([skill, count]) => ({ value: skill, label: skill, count }));
  }, [allOrigins]);

  const origins = useMemo(() => {
    const search = normalizeSearch(value.trim());

    return allOrigins.filter((origin) => {
      if (selectedSkills.length > 0) {
        const originSkills: string[] = origin.pericias || [];
        if (!selectedSkills.some((s) => originSkills.includes(s))) return false;
      }

      if (search.length > 0) {
        const itemsText = origin
          .getItems()
          .map((item) => {
            if (item.description) return item.description;
            if (item.equipment) {
              return typeof item.equipment === 'string'
                ? item.equipment
                : item.equipment.nome;
            }
            return '';
          })
          .join(' ');
        const haystack = normalizeSearch(
          [
            origin.name,
            itemsText,
            ...(origin.pericias || []),
            ...(origin.poderes || []).flatMap((p) => [p.name, p.description]),
          ].join(' ')
        );
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [allOrigins, value, selectedSkills]);

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
    const { selectedOrigin } = params;
    if (selectedOrigin) {
      setValue(decodeURIComponent(selectedOrigin));
    }
  }, [params]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    if (params.selectedOrigin) history.push('/database/origens');
  };

  const onVoiceSearch = (newValue: string) => {
    setValue(newValue);
    if (params.selectedOrigin) history.push('/database/origens');
  };

  const clearFilters = () => {
    setValue('');
    setSelectedSkills([]);
    if (params.selectedOrigin) history.push('/database/origens');
  };

  const normalizedSelected = params.selectedOrigin
    ? normalizeSearch(decodeURIComponent(params.selectedOrigin))
    : '';

  const selectedOriginData =
    origins.length === 1 && params.selectedOrigin ? origins[0] : null;
  const originsSEO = getPageSEO('origins');

  const renderOriginCard = (origin: OriginWithSupplement) => {
    const exclusivePowers = origin.poderes.filter(
      (p) => p.type === ORIGIN_POWER_TYPE
    );
    const itemsText = origin
      .getItems()
      .map((item) => {
        if (item.description) return item.description;
        if (item.equipment) {
          return typeof item.equipment === 'string'
            ? item.equipment
            : item.equipment.nome;
        }
        return '';
      })
      .filter(Boolean)
      .join('; ');

    const actions = (
      <>
        <AddToGrimoireButton
          itemId={encyclopediaIds.origin(origin.name)}
          itemName={origin.name}
        />
        <CopyUrlButton
          itemName={origin.name}
          itemType='origem'
          size='small'
          variant='minimal'
        />
      </>
    );

    const badges = (
      <>
        <Chip
          label={origin.supplementName}
          size='small'
          variant='outlined'
          color={
            origin.supplementId === SupplementId.TORMENTA20_CORE
              ? 'default'
              : 'secondary'
          }
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
        {origin.pericias.map((per) => (
          <Chip
            key={`${origin.name}-skill-${per}`}
            label={per}
            size='small'
            variant='outlined'
            color='primary'
            sx={{ fontFamily: 'Tfont, serif', fontSize: '0.68rem' }}
          />
        ))}
      </>
    );

    return (
      <DatabaseCard
        key={`${origin.supplementId}-${origin.name}`}
        title={origin.name}
        icon={<BrowseGalleryIcon fontSize='small' />}
        badges={badges}
        actions={actions}
        highlighted={
          Boolean(normalizedSelected) &&
          normalizeSearch(origin.name) === normalizedSelected
        }
      >
        {itemsText && (
          <Typography variant='body2' sx={{ mb: 1.25 }}>
            <strong>Itens Iniciais:</strong> {itemsText}
          </Typography>
        )}

        {origin.name !== 'Amnésico' ? (
          <Box sx={{ mb: exclusivePowers.length > 0 ? 1.5 : 0 }}>
            <Typography variant='body2' sx={{ mb: 0.5 }}>
              <strong>Perícias:</strong>{' '}
              {origin.pericias.length > 0 ? origin.pericias.join(', ') : '—'}
            </Typography>
            <Typography variant='body2'>
              <strong>Poderes:</strong>{' '}
              {origin.poderes.map((power) => power.name).join(', ')}
            </Typography>
          </Box>
        ) : (
          <Typography variant='body2' sx={{ mb: 1.5 }}>
            Uma perícia e um poder escolhidos pelo mestre e o poder Lembranças
            Graduais.
          </Typography>
        )}

        {exclusivePowers.length > 0 && (
          <>
            <Divider sx={{ my: 1.25 }} />
            <Stack spacing={1.25}>
              {exclusivePowers.map((power) => (
                <Box key={`${origin.name}-pwr-${power.name}`}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant='subtitle2'
                      color='primary'
                      sx={{ fontFamily: 'Tfont, serif', fontWeight: 700 }}
                    >
                      {power.name}
                    </Typography>
                    <AddToGrimoireButton
                      itemId={encyclopediaIds.originPower(
                        origin.name,
                        power.name
                      )}
                      itemName={power.name}
                    />
                  </Box>
                  <Typography
                    variant='body2'
                    sx={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}
                  >
                    {power.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </DatabaseCard>
    );
  };

  return (
    <>
      <SEO
        title={
          selectedOriginData
            ? `${selectedOriginData.name} - Origem de Tormenta 20`
            : originsSEO.title
        }
        description={
          selectedOriginData
            ? `Poderes, perícias e benefícios da origem ${selectedOriginData.name} em Tormenta 20.`
            : originsSEO.description
        }
        url={`/database/origens${
          selectedOriginData && params.selectedOrigin
            ? `/${params.selectedOrigin}`
            : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Origens de Personagem
        </TormentaTitle>

        <SupplementFilter
          selectedSupplements={selectedSupplements}
          availableSupplements={ALL_ORIGIN_SUPPLEMENTS}
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
          <ClickableChipFilterGroup
            label='Filtrar por Perícia Concedida:'
            allLabel='Todas'
            options={skillOptions}
            selected={selectedSkills}
            onToggle={(skill) =>
              setSelectedSkills((prev) =>
                prev.includes(skill)
                  ? prev.filter((s) => s !== skill)
                  : [...prev, skill]
              )
            }
            onClear={() => setSelectedSkills([])}
            enableQuickFilter
            quickFilterPlaceholder='Filtrar perícia...'
          />
        </Paper>

        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            {origins.length} origem{origins.length !== 1 ? 's' : ''} exibida
            {origins.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <DatabaseGrid
          ariaLabel='Grade de origens'
          resetKey={`${value}|${selectedSkills.join(',')}|${selectedSupplements.join(',')}`}
          emptyState={
            <Paper
              variant='outlined'
              sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
            >
              <Typography variant='body1' sx={{ color: 'text.secondary', mb: 2 }}>
                Nenhuma origem encontrada com os filtros aplicados.
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
          {origins.map(renderOriginCard)}
        </DatabaseGrid>
      </Box>
    </>
  );
};

export default OriginsTable;
