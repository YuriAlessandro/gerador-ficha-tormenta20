import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PetsIcon from '@mui/icons-material/Pets';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import React, { useCallback, useMemo, useState } from 'react';
import { DiceRoll } from '@/interfaces/DiceRoll';
import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import { getAutoridadeEclesiasticaDynamicText } from '@/functions/powers/frade-special';
import { CustomPower } from '@/interfaces/CustomPower';
import { applyPowersOrder } from '@/functions/powers/applyPowersOrder';
import {
  classifyPowers,
  groupPowersByOrigin,
  originGroupKey,
  originLabel,
  PowerOrigin,
  POWER_ORIGINS,
  SheetPower,
} from '@/functions/powers/powerOrigins';
import { getPowerText } from '@/functions/powers/powerText';
import { normalizeSearch } from '@/functions/stringUtils';
import { getActivePowerForSheetEntry } from '@/premium/data/activePowers';
import { getComplicationPowerWarning } from '@/premium/functions/complications';
import type {
  ActivePowerDefinition,
  ActiveEffectUsageOption,
} from '@/premium/interfaces/ActiveEffect';
import type { CustomEffect } from '@/premium/interfaces/CustomEffect';
import RollButton from '../RollButton';
import PowerWeaponSelectionAction from './PowerWeaponSelectionAction';
import PowerActiveEffectAction from './PowerActiveEffectAction';
import PowerCustomEffectsAction from './PowerCustomEffectsAction';
import PowerRow from './PowersTab/PowerRow';
import PowerDetailSheet from './PowersTab/PowerDetailSheet';
import PowersToolbar, { OriginFilterOption } from './PowersTab/PowersToolbar';
import {
  EMPTY_SX,
  GROUP_COUNT_SX,
  GROUP_HEADER_SX,
  GROUP_TITLE_SX,
} from './PowersTab/powersTabStyles';

function filterUniqueByName<T extends { name: string }>(array: T[]): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

const COMPLICATION_ORIGIN: PowerOrigin = { kind: 'complication' };

const PowersDisplay: React.FC<{
  sheetHistory: SheetActionHistoryEntry[];
  classPowers: ClassPower[];
  raceAbilities: RaceAbility[];
  classAbilities: ClassAbility[];
  originPowers: OriginPower[];
  deityPowers: GeneralPower[];
  generalPowers: GeneralPower[];
  customPowers?: CustomPower[];
  customGrantedPowers?: CustomPower[];
  className: string;
  raceName: string;
  deityName?: string;
  onUpdateRolls?: (power: SheetPower, newRolls: DiceRoll[]) => void;
  onUpdateCustomEffects?: (
    power: SheetPower,
    newEffects: CustomEffect[]
  ) => void;
  characterName?: string;
  onCompanionClick?: () => void;
  parodyButtonSlot?: React.ReactNode;
  sheet?: CharacterSheet;
  onSheetUpdate?: (updatedSheet: CharacterSheet) => void;
  onActivateEffect?: (
    definition: ActivePowerDefinition,
    option: ActiveEffectUsageOption
  ) => void;
}> = ({
  sheetHistory,
  classPowers,
  raceAbilities,
  classAbilities,
  originPowers,
  deityPowers,
  generalPowers,
  customPowers,
  customGrantedPowers,
  className,
  raceName,
  deityName,
  onUpdateRolls,
  onUpdateCustomEffects,
  characterName,
  onCompanionClick,
  parodyButtonSlot,
  sheet,
  onSheetUpdate,
  onActivateEffect,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [reorderMode, setReorderMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOrigins, setActiveOrigins] = useState<Set<string>>(new Set());
  const [selectedPowerName, setSelectedPowerName] = useState<string | null>(
    null
  );

  // Aplica texto dinâmico para poderes que dependem da divindade
  const processedClassPowers = useMemo(
    () =>
      classPowers.map((power) => {
        if (power.name === 'Autoridade Eclesiástica') {
          const dynamicText = getAutoridadeEclesiasticaDynamicText(deityName);
          if (dynamicText) {
            return { ...power, dynamicText };
          }
        }
        return power;
      }),
    [classPowers, deityName]
  );

  // Filtra habilidades de classe cujo nome já exista como poder de classe
  // (ex: habilidade "Alquimista Iniciado" que auto-concede o poder de mesmo nome)
  const classPowerNames = new Set(processedClassPowers.map((p) => p.name));
  const filteredClassAbilities = classAbilities.filter(
    (ability) => !classPowerNames.has(ability.name)
  );

  const powers = [
    ...processedClassPowers,
    ...raceAbilities,
    ...filteredClassAbilities,
    ...originPowers,
    ...deityPowers,
    ...generalPowers,
    ...(customPowers || []),
    ...(customGrantedPowers || []),
  ];

  // Count how many times a power if the same name appears
  const powerCount: Record<string, number> = {};

  powers.forEach((power) => {
    powerCount[power.name] = (powerCount[power.name] || 0) + 1;
  });

  const uniquePowers = applyPowersOrder(
    [
      ...filterUniqueByName(processedClassPowers),
      ...filterUniqueByName(raceAbilities),
      ...filterUniqueByName(filteredClassAbilities),
      ...filterUniqueByName(originPowers),
      ...filterUniqueByName(deityPowers),
      ...filterUniqueByName(generalPowers),
      ...filterUniqueByName(customPowers || []),
      ...filterUniqueByName(customGrantedPowers || []),
    ],
    sheet?.powersOrder
  );

  const canReorder = !!sheet && !!onSheetUpdate && uniquePowers.length > 1;

  const origins = useMemo(
    () =>
      classifyPowers({
        classPowers: processedClassPowers,
        raceAbilities,
        classAbilities: filteredClassAbilities,
        originPowers,
        deityPowers,
        generalPowers,
        customPowers,
        customGrantedPowers,
        className,
        raceName,
      }),
    [
      processedClassPowers,
      raceAbilities,
      filteredClassAbilities,
      originPowers,
      deityPowers,
      generalPowers,
      customPowers,
      customGrantedPowers,
      className,
      raceName,
    ]
  );

  // Texto normalizado por poder, memoizado: sem isso cada tecla digitada
  // re-normalizaria dezenas de descrições de 1-2KB.
  const haystack = useMemo(() => {
    const map = new Map<string, string>();
    uniquePowers.forEach((power) => {
      map.set(
        power.name,
        normalizeSearch(`${power.name} ${getPowerText(power)}`)
      );
    });
    return map;
  }, [uniquePowers]);

  const searched = useMemo(() => {
    const term = normalizeSearch(searchTerm.trim());
    if (!term) return uniquePowers;
    return uniquePowers.filter((power) =>
      (haystack.get(power.name) || '').includes(term)
    );
  }, [uniquePowers, haystack, searchTerm]);

  // Contagens dos chips saem da lista filtrada pela BUSCA mas não pela origem —
  // assim os números mostram onde o termo bateu, em vez de ficarem congelados.
  const originOptions: OriginFilterOption[] = useMemo(
    () =>
      groupPowersByOrigin(searched, origins).map((group) => ({
        key: group.key,
        label: group.label,
        count: group.powers.length,
        descriptor: group.descriptor,
      })),
    [searched, origins]
  );

  const visible = useMemo(() => {
    if (activeOrigins.size === 0) return searched;
    return searched.filter((power) => {
      const origin = origins.get(power.name);
      return !!origin && activeOrigins.has(originGroupKey(origin));
    });
  }, [searched, origins, activeOrigins]);

  const groups = useMemo(
    () => groupPowersByOrigin(visible, origins),
    [visible, origins]
  );

  const handleDragEnd = (result: DropResult) => {
    if (!sheet || !onSheetUpdate) return;
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const currentOrder = uniquePowers.map((p) => p.name);
    const [moved] = currentOrder.splice(result.source.index, 1);
    currentOrder.splice(result.destination.index, 0, moved);

    onSheetUpdate({ ...sheet, powersOrder: currentOrder });
  };

  const handleResetOrder = () => {
    if (!sheet || !onSheetUpdate) return;
    onSheetUpdate({ ...sheet, powersOrder: undefined });
  };

  const handleToggleOrigin = useCallback((key: string) => {
    setActiveOrigins((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleResetOrigins = useCallback(() => {
    setActiveOrigins(new Set());
  }, []);

  // Entrar em reordenar achata a lista: `powersOrder` é plano, então o
  // Droppable PRECISA receber `uniquePowers` inteiro. Arrastar dentro de um
  // subconjunto filtrado faria `result.source.index` virar índice local e
  // corromperia a ordem salva em silêncio.
  const handleReorderModeChange = useCallback((value: boolean) => {
    setReorderMode(value);
    if (value) {
      setSearchTerm('');
      setActiveOrigins(new Set());
      setSelectedPowerName(null);
    }
  }, []);

  const hasWeaponSpecAction = (pw: SheetPower): boolean => {
    const actions =
      'sheetActions' in pw && Array.isArray(pw.sheetActions)
        ? pw.sheetActions
        : [];
    return actions.some(
      (sa) => sa.action.type === 'selectWeaponSpecialization'
    );
  };

  const buildBaseHeaderActionSlot = (pw: SheetPower): React.ReactNode => {
    if (pw.name === 'Paródia') return parodyButtonSlot;
    if (sheet && onSheetUpdate && hasWeaponSpecAction(pw)) {
      return (
        <PowerWeaponSelectionAction
          power={pw as ClassPower | RaceAbility | ClassAbility | OriginPower}
          instances={powerCount[pw.name] || 1}
          sheet={sheet}
          onSheetUpdate={onSheetUpdate}
        />
      );
    }
    if (sheet && onActivateEffect) {
      const activeDef = getActivePowerForSheetEntry(className, pw.name);
      if (activeDef) {
        return (
          <PowerActiveEffectAction
            definition={activeDef}
            sheet={sheet}
            onActivate={onActivateEffect}
          />
        );
      }
      const pwCustomEffects =
        'customEffects' in pw && pw.customEffects ? pw.customEffects : [];
      if (pwCustomEffects.length > 0) {
        return (
          <PowerCustomEffectsAction
            powerName={pw.name}
            customEffects={pwCustomEffects}
            sheet={sheet}
            onActivate={onActivateEffect}
          />
        );
      }
    }
    return undefined;
  };

  const buildHeaderActionSlot = (pw: SheetPower): React.ReactNode => {
    const base = buildBaseHeaderActionSlot(pw);

    // Poder concedido por complicação de classe (Heróis de Arton): marca como
    // indisponível quando menos da metade dos níveis são da classe exigida.
    // Sempre computado no render — nunca persistido.
    const complicationWarning =
      sheet?.complication && pw.name === sheet.complication.grantedPowerName
        ? getComplicationPowerWarning(sheet)
        : null;

    const companionSlot =
      onCompanionClick && pw.name === 'Melhor Amigo' ? (
        <IconButton
          size='small'
          onClick={onCompanionClick}
          title='Ver ficha do Melhor Amigo'
        >
          <PetsIcon fontSize='small' color='primary' />
        </IconButton>
      ) : null;

    // O botão de rolagem vive no rail, junto das outras ações — antes ele
    // ficava ANTES do nome, e era ele que deixava a borda esquerda irregular
    // (linhas sem rolagem precisavam de um espaçador de 28px para compensar).
    const powerRolls = 'rolls' in pw && pw.rolls ? pw.rolls : [];
    const rollSlot =
      powerRolls.length > 0 ? (
        <RollButton
          rolls={powerRolls}
          iconOnly
          size='small'
          characterName={characterName}
        />
      ) : null;

    if (!complicationWarning && !companionSlot && !rollSlot) return base;

    // No mobile o chip com texto compete por largura com dados e efeitos;
    // o rótulo completo continua no bottom sheet.
    const warningChip = complicationWarning ? (
      <Tooltip title={complicationWarning}>
        {isMobile ? (
          <WarningAmberIcon fontSize='small' color='warning' />
        ) : (
          <Chip
            size='small'
            color='warning'
            icon={<WarningAmberIcon />}
            label='Indisponível'
          />
        )}
      </Tooltip>
    ) : null;

    return (
      <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
        {warningChip}
        {rollSlot}
        {companionSlot}
        {base}
      </Stack>
    );
  };

  const complicationExtra = sheet?.complication ? (
    <>
      {sheet.complication.className && (
        <Typography
          variant='caption'
          sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}
        >
          Complicação de {sheet.complication.className}
        </Typography>
      )}
      {sheet.complication.behavioral && (
        <Typography
          variant='caption'
          sx={{ display: 'block', color: 'warning.main', mb: 0.5 }}
        >
          † Comportamental — se violar, perde todos os PM (recupera a partir do
          próximo dia).
        </Typography>
      )}
      <Typography variant='caption' sx={{ display: 'block', mb: 1 }}>
        Poder adicional: <strong>{sheet.complication.grantedPowerName}</strong>
      </Typography>
    </>
  ) : null;

  // A Complicação vira um pseudo-poder no seu próprio grupo: fica FORA de
  // `uniquePowers`, portanto fora do drag-and-drop e de `powersOrder` — igual
  // ao comportamento anterior, só que sem accordion duplicado à mão.
  const complicationPower: SheetPower | null = sheet?.complication
    ? {
        name: sheet.complication.name,
        description: sheet.complication.description,
      }
    : null;

  const selectedPower: SheetPower | null = useMemo(() => {
    if (!selectedPowerName) return null;
    if (complicationPower && complicationPower.name === selectedPowerName) {
      return complicationPower;
    }
    return uniquePowers.find((p) => p.name === selectedPowerName) || null;
  }, [selectedPowerName, uniquePowers, complicationPower]);

  const selectedOrigin: PowerOrigin =
    (selectedPowerName && origins.get(selectedPowerName)) ||
    COMPLICATION_ORIGIN;

  const isComplicationSelected =
    !!complicationPower && complicationPower.name === selectedPowerName;

  const renderRow = (power: SheetPower, extra?: React.ReactNode) => {
    const origin = origins.get(power.name) || COMPLICATION_ORIGIN;
    return (
      <PowerRow
        key={power.name}
        power={power}
        originKind={origin.kind}
        count={powerCount[power.name] || 1}
        compact={isMobile}
        actionSlot={buildHeaderActionSlot(power)}
        onOpenDetail={() => setSelectedPowerName(power.name)}
        sheetHistory={sheetHistory}
        sheet={sheet}
        className={className}
        onUpdateRolls={onUpdateRolls}
        onUpdateCustomEffects={onUpdateCustomEffects}
        detailExtra={extra}
      />
    );
  };

  const renderGroupHeader = (
    key: string,
    label: string,
    color: string,
    Icon: React.ElementType,
    count: number
  ) => (
    <Box sx={GROUP_HEADER_SX} key={`${key}-header`}>
      <Icon sx={{ fontSize: 18 }} style={{ color }} aria-hidden />
      <Typography variant='body2' sx={GROUP_TITLE_SX}>
        {label}
      </Typography>
      <Typography variant='caption' sx={GROUP_COUNT_SX}>
        {count}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <PowersToolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        originOptions={originOptions}
        activeOrigins={activeOrigins}
        onToggleOrigin={handleToggleOrigin}
        onResetOrigins={handleResetOrigins}
        canReorder={canReorder}
        reorderMode={reorderMode}
        onReorderModeChange={handleReorderModeChange}
        hasCustomOrder={!!sheet?.powersOrder}
        onResetOrder={handleResetOrder}
      />

      {reorderMode ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='powers-list'>
            {(droppableProvided) => (
              <Box
                ref={droppableProvided.innerRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...droppableProvided.droppableProps}
              >
                {uniquePowers.map((power, idx) => (
                  <Draggable
                    key={power.name}
                    draggableId={power.name}
                    index={idx}
                  >
                    {(dragProvided, snapshot) => (
                      <Box
                        ref={dragProvided.innerRef}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...dragProvided.draggableProps}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...dragProvided.dragHandleProps}
                        sx={{
                          opacity: snapshot.isDragging ? 0.85 : 1,
                          cursor: 'grab',
                          '&:active': { cursor: 'grabbing' },
                        }}
                      >
                        <PowerRow
                          power={power}
                          originKind={
                            (origins.get(power.name) || COMPLICATION_ORIGIN)
                              .kind
                          }
                          count={powerCount[power.name] || 1}
                          compact={isMobile}
                          interactive={false}
                          dragHandleSlot={
                            <DragIndicatorIcon
                              fontSize='small'
                              sx={{ color: 'text.secondary', flexShrink: 0 }}
                            />
                          }
                          sheetHistory={sheetHistory}
                          sheet={sheet}
                          className={className}
                        />
                      </Box>
                    )}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <>
          {groups.length === 0 && (
            <Box sx={EMPTY_SX}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Nenhum poder encontrado.
              </Typography>
              <Button size='small' onClick={() => setSearchTerm('')}>
                Limpar busca
              </Button>
            </Box>
          )}

          {groups.map((group) => (
            <Box key={group.key}>
              {renderGroupHeader(
                group.key,
                group.label,
                group.descriptor.color,
                group.descriptor.icon,
                group.powers.length
              )}
              {group.powers.map((power) => renderRow(power))}
            </Box>
          ))}

          {complicationPower && (
            <Box>
              {renderGroupHeader(
                'complication',
                POWER_ORIGINS.complication.label(),
                POWER_ORIGINS.complication.color,
                POWER_ORIGINS.complication.icon,
                1
              )}
              {renderRow(complicationPower, complicationExtra)}
            </Box>
          )}
        </>
      )}

      <PowerDetailSheet
        open={!!selectedPower}
        onClose={() => setSelectedPowerName(null)}
        isMobile={isMobile}
        power={selectedPower}
        originKind={selectedOrigin.kind}
        originLabel={originLabel(selectedOrigin)}
        sheetHistory={sheetHistory}
        sheet={sheet}
        className={className}
        onUpdateRolls={onUpdateRolls}
        onUpdateCustomEffects={onUpdateCustomEffects}
        detailExtra={isComplicationSelected ? complicationExtra : undefined}
      />
    </Box>
  );
};

export default PowersDisplay;
