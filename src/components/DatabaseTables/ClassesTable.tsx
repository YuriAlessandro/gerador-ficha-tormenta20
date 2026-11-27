import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry, ClassWithSupplement } from '../../data/registry';
import { formatRequirement } from '../../functions/requirementText';
import { normalizeSearch } from '../../functions/stringUtils';
import {
  classLabelOf,
  encyclopediaIds,
} from '../../functions/encyclopediaSearch';
import { SEO, getPageSEO } from '../SEO';
import TormentaTitle from '../Database/TormentaTitle';
import SearchInput from './SearchInput';
import SupplementFilter from './SupplementFilter';
import DatabaseGrid from '../Database/DatabaseGrid';
import DatabaseCard from '../Database/DatabaseCard';
import ClickableChipFilterGroup from '../Database/ClickableChipFilterGroup';
import CopyUrlButton from '../Database/CopyUrlButton';
import AddToGrimoireButton from '../PocketGrimoire/AddToGrimoireButton';
import ClassPowerTreesView from '../PowerTrees/ClassPowerTreesView';

type ClassKindFilter = 'ALL' | 'BASE' | 'VARIANT';
type SpellcasterFilter = 'ALL' | 'CASTERS' | 'MARTIAL';
type CardSectionView = 'tudo' | 'arvore';

const ALL_CLASS_SUPPLEMENTS: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

function isSpellcasterClass(classe: ClassWithSupplement): boolean {
  if (classe.spellPath) return true;
  return (classe.abilities || []).some((a) =>
    normalizeSearch(a.name).includes('magia')
  );
}

const ClassGridCard: React.FC<{
  classe: ClassWithSupplement;
  supplements: SupplementId[];
  highlighted: boolean;
}> = ({ classe, supplements, highlighted }) => {
  const [sectionView, setSectionView] = useState<CardSectionView>('tudo');
  const fullName = classLabelOf(classe);

  const actions = (
    <>
      <AddToGrimoireButton
        itemId={encyclopediaIds.class(classe)}
        itemName={fullName}
      />
      <CopyUrlButton
        itemName={classe.name}
        itemType='classe'
        size='small'
        variant='minimal'
      />
    </>
  );

  const badges = (
    <>
      <Chip
        label={
          classe.isVariant && classe.baseClassName
            ? `Variante de ${classe.baseClassName}`
            : 'Classe Base'
        }
        size='small'
        color={classe.isVariant ? 'info' : 'primary'}
        variant='filled'
        sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
      />
      <Chip
        label={classe.supplementName}
        size='small'
        variant='outlined'
        color={
          classe.supplementId === SupplementId.TORMENTA20_CORE
            ? 'default'
            : 'secondary'
        }
        sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
      />
      <Chip
        label={`PV: ${classe.pv} (+${classe.addpv}/nível)`}
        size='small'
        variant='outlined'
        sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
      />
      <Chip
        label={`PM: +${classe.pm}/nível`}
        size='small'
        variant='outlined'
        sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
      />
    </>
  );

  return (
    <DatabaseCard
      title={fullName}
      icon={<WhatshotIcon fontSize='small' />}
      badges={badges}
      actions={actions}
      highlighted={highlighted}
    >
      {/* Perícias & Proficiências */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant='body2' sx={{ mb: 0.75 }}>
          <strong>Perícias básicas:</strong>{' '}
          {classe.periciasbasicas
            .map((per) =>
              per.type === 'and'
                ? per.list.join(' e ')
                : per.list.join(' ou ')
            )
            .join('; ')}
        </Typography>
        <Typography variant='body2' sx={{ mb: 0.75 }}>
          <strong>+{classe.periciasrestantes.qtd} perícias entre:</strong>{' '}
          {classe.periciasrestantes.list.join(', ')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {classe.proficiencias.map((prof) => (
            <Chip
              key={`${fullName}-prof-${prof}`}
              label={prof}
              size='small'
              variant='outlined'
              color='secondary'
              sx={{ fontFamily: 'Tfont, serif', fontSize: '0.68rem' }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Habilidades de Classe */}
      <Typography
        variant='subtitle2'
        sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, mb: 1 }}
      >
        Habilidades de {classe.name} ({classe.abilities.length})
      </Typography>

      <Stack spacing={1.25} divider={<Divider flexItem />} sx={{ mb: 2 }}>
        {classe.abilities.map((ability) => (
          <Box key={`${fullName}-ablt-${ability.name}-${ability.nivel}`}>
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
                {ability.name} ({ability.nivel}º nível)
              </Typography>
              <AddToGrimoireButton
                itemId={encyclopediaIds.classAbility(classe, ability.name)}
                itemName={ability.name}
              />
            </Box>
            <Typography
              variant='body2'
              sx={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}
            >
              {ability.text}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Poderes de Classe (Lista Completa ou Árvore) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1.5,
        }}
      >
        <Typography
          variant='subtitle2'
          sx={{ fontFamily: 'Tfont, serif', fontWeight: 700 }}
        >
          Poderes de {classe.name} ({classe.powers.length})
        </Typography>
        <ToggleButtonGroup
          size='small'
          exclusive
          value={sectionView}
          onChange={(_e, next) => {
            if (next) setSectionView(next as CardSectionView);
          }}
          aria-label={`Modo de exibição dos poderes de ${classe.name}`}
        >
          <ToggleButton value='tudo'>
            <FormatListBulletedIcon fontSize='small' sx={{ mr: 0.5 }} />
            Textos
          </ToggleButton>
          <ToggleButton value='arvore'>
            <AccountTreeIcon fontSize='small' sx={{ mr: 0.5 }} />
            Árvore
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {sectionView === 'arvore' ? (
        <ClassPowerTreesView classe={classe} supplements={supplements} />
      ) : (
        <Stack spacing={1.25} divider={<Divider flexItem />}>
          {classe.powers.map((power) => (
            <Box key={`${fullName}-pwr-${power.name}`}>
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
                  itemId={encyclopediaIds.classPower(classe, power.name)}
                  itemName={power.name}
                />
              </Box>
              <Typography
                variant='body2'
                sx={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}
              >
                {power.text}
              </Typography>
              {power.requirements && power.requirements.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 0.75,
                  }}
                >
                  {power.requirements.map((reqGroup, rIdx) => (
                    <React.Fragment key={`${power.name}-rg-${rIdx}`}>
                      {reqGroup.map((req, sIdx) => (
                        <Chip
                          key={`${power.name}-r-${sIdx}-${req.name || req.text}`}
                          label={formatRequirement(req)}
                          size='small'
                          variant='outlined'
                          color='secondary'
                          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
                        />
                      ))}
                      {power.requirements &&
                        power.requirements.length > 1 &&
                        rIdx + 1 < power.requirements.length && (
                          <Typography variant='caption' sx={{ fontStyle: 'italic' }}>
                            ou
                          </Typography>
                        )}
                    </React.Fragment>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </DatabaseCard>
  );
};

const ClassesTable: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [selectedSupplements, setSelectedSupplements] = useState<SupplementId[]>(
    ALL_CLASS_SUPPLEMENTS
  );
  const [kindFilter, setKindFilter] = useState<ClassKindFilter>('ALL');
  const [casterFilter, setCasterFilter] = useState<SpellcasterFilter>('ALL');
  const { params } = useRouteMatch<{ selectedClass?: string }>();
  const history = useHistory();

  const sortedClasses = useMemo(() => {
    const allClasses =
      dataRegistry.getClassesWithSupplementInfo(selectedSupplements);
    const baseClasses = allClasses.filter((c) => !c.isVariant);
    const variants = allClasses.filter((c) => c.isVariant);
    const sorted: ClassWithSupplement[] = [];
    baseClasses.forEach((base) => {
      sorted.push(base);
      sorted.push(...variants.filter((v) => v.baseClassName === base.name));
    });
    return sorted;
  }, [selectedSupplements]);

  const classes = useMemo(() => {
    const search = normalizeSearch(value.trim());

    return sortedClasses.filter((classe) => {
      if (kindFilter === 'BASE' && classe.isVariant) return false;
      if (kindFilter === 'VARIANT' && !classe.isVariant) return false;

      const caster = isSpellcasterClass(classe);
      if (casterFilter === 'CASTERS' && !caster) return false;
      if (casterFilter === 'MARTIAL' && caster) return false;

      if (search.length > 0) {
        const haystack = normalizeSearch(
          [
            classe.name,
            classe.subname || '',
            classe.baseClassName || '',
            ...classe.abilities.flatMap((a) => [a.name, a.text]),
            ...classe.powers.flatMap((p) => [p.name, p.text]),
          ].join(' ')
        );
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [sortedClasses, value, kindFilter, casterFilter]);

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
    const { selectedClass } = params;
    if (selectedClass) {
      setValue(decodeURIComponent(selectedClass));
    }
  }, [params]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    if (params.selectedClass) history.push('/database/classes');
  };

  const onVoiceSearch = (newValue: string) => {
    setValue(newValue);
    if (params.selectedClass) history.push('/database/classes');
  };

  const clearFilters = () => {
    setValue('');
    setKindFilter('ALL');
    setCasterFilter('ALL');
    if (params.selectedClass) history.push('/database/classes');
  };

  const normalizedSelected = params.selectedClass
    ? normalizeSearch(decodeURIComponent(params.selectedClass))
    : '';

  const selectedClassData =
    classes.length === 1 && params.selectedClass ? classes[0] : null;
  const classesSEO = getPageSEO('classes');

  return (
    <>
      <SEO
        title={
          selectedClassData
            ? `${selectedClassData.name} - Classe de Tormenta 20`
            : classesSEO.title
        }
        description={
          selectedClassData
            ? `Habilidades, poderes e progressão da classe ${selectedClassData.name} em Tormenta 20.`
            : classesSEO.description
        }
        url={`/database/classes${
          selectedClassData && params.selectedClass
            ? `/${params.selectedClass}`
            : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Classes e Poderes de Classe
        </TormentaTitle>

        <SupplementFilter
          selectedSupplements={selectedSupplements}
          availableSupplements={ALL_CLASS_SUPPLEMENTS}
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
              label='Tipo de Classe:'
              allLabel={`Todas (${sortedClasses.length})`}
              options={[
                {
                  value: 'BASE',
                  label: 'Classes Base',
                  count: sortedClasses.filter((c) => !c.isVariant).length,
                },
                {
                  value: 'VARIANT',
                  label: 'Variantes',
                  count: sortedClasses.filter((c) => c.isVariant).length,
                },
              ]}
              selected={kindFilter === 'ALL' ? [] : [kindFilter]}
              onToggle={(val) =>
                setKindFilter(
                  kindFilter === val ? 'ALL' : (val as ClassKindFilter)
                )
              }
              onClear={() => setKindFilter('ALL')}
            />

            <ClickableChipFilterGroup
              label='Perfil de Conjuração:'
              allLabel='Todas'
              options={[
                { value: 'CASTERS', label: 'Conjuradoras' },
                { value: 'MARTIAL', label: 'Não Conjuradoras' },
              ]}
              selected={casterFilter === 'ALL' ? [] : [casterFilter]}
              onToggle={(val) =>
                setCasterFilter(
                  casterFilter === val ? 'ALL' : (val as SpellcasterFilter)
                )
              }
              onClear={() => setCasterFilter('ALL')}
            />
          </Stack>
        </Paper>

        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            {classes.length} classe{classes.length !== 1 ? 's' : ''} exibida
            {classes.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <DatabaseGrid
          variant='wide'
          batchSize={12}
          ariaLabel='Grade de classes'
          resetKey={`${value}|${kindFilter}|${casterFilter}|${selectedSupplements.join(',')}`}
          emptyState={
            <Paper
              variant='outlined'
              sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
            >
              <Typography variant='body1' sx={{ color: 'text.secondary', mb: 2 }}>
                Nenhuma classe encontrada com os filtros aplicados.
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
          {classes.map((cl) => (
            <ClassGridCard
              key={`${cl.supplementId}-${classLabelOf(cl)}`}
              classe={cl}
              supplements={selectedSupplements}
              highlighted={
                Boolean(normalizedSelected) &&
                normalizeSearch(cl.name) === normalizedSelected
              }
            />
          ))}
        </DatabaseGrid>
      </Box>
    </>
  );
};

export default ClassesTable;
