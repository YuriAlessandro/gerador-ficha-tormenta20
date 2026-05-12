import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import { Box, Button, Stack, Tooltip } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckIcon from '@mui/icons-material/Check';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import React, { useMemo, useState } from 'react';
import { DiceRoll } from '@/interfaces/DiceRoll';
import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import { getAutoridadeEclesiasticaDynamicText } from '@/functions/powers/frade-special';
import { CustomPower } from '@/interfaces/CustomPower';
import { applyPowersOrder } from '@/functions/powers/applyPowersOrder';
import PowerDisplay from './PowerDisplay';
import PowerWeaponSelectionAction from './PowerWeaponSelectionAction';

function filterUniqueByName<T extends { name: string }>(array: T[]): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

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
  onUpdateRolls?: (
    power:
      | ClassPower
      | RaceAbility
      | ClassAbility
      | OriginPower
      | GeneralPower
      | CustomPower,
    newRolls: DiceRoll[]
  ) => void;
  characterName?: string;
  onCompanionClick?: () => void;
  parodyButtonSlot?: React.ReactNode;
  sheet?: CharacterSheet;
  onSheetUpdate?: (updatedSheet: CharacterSheet) => void;
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
  characterName,
  onCompanionClick,
  parodyButtonSlot,
  sheet,
  onSheetUpdate,
}) => {
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

  const [reorderMode, setReorderMode] = useState(false);
  const canReorder = !!sheet && !!onSheetUpdate && uniquePowers.length > 1;

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

  const getPowerOrigin = (
    pw: ClassPower | RaceAbility | ClassAbility | OriginPower | CustomPower
  ) => {
    if (processedClassPowers.some((p) => p.name === pw.name)) {
      return `Poder de ${className}`;
    }
    if (raceAbilities.includes(pw as RaceAbility)) {
      return `Habilidade de ${raceName}`;
    }
    if (filteredClassAbilities.includes(pw as ClassAbility)) {
      const ability = pw as ClassAbility;
      return `Habilidade de ${ability.sourceClassName || className}`;
    }
    if (originPowers.includes(pw as OriginPower)) {
      return 'Poder de Origem';
    }
    if (deityPowers.includes(pw as GeneralPower)) {
      return 'Poder Divino';
    }
    if (customGrantedPowers?.some((p) => p.name === pw.name)) {
      return 'Poder Concedido Personalizado';
    }
    if (customPowers?.some((p) => p.name === pw.name)) {
      return 'Poder Personalizado';
    }
    return 'Poder Geral';
  };

  const hasWeaponSpecAction = (
    pw: ClassPower | RaceAbility | ClassAbility | OriginPower | CustomPower
  ): boolean => {
    const actions =
      'sheetActions' in pw && Array.isArray(pw.sheetActions)
        ? pw.sheetActions
        : [];
    return actions.some(
      (sa) => sa.action.type === 'selectWeaponSpecialization'
    );
  };

  const buildHeaderActionSlot = (
    pw: ClassPower | RaceAbility | ClassAbility | OriginPower | CustomPower
  ): React.ReactNode => {
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
    return undefined;
  };

  const renderPower = (
    power: ClassPower | RaceAbility | ClassAbility | OriginPower | CustomPower
  ) => (
    <PowerDisplay
      sheetHistory={sheetHistory}
      key={power.name}
      power={power}
      type={getPowerOrigin(power)}
      count={powerCount[power.name]}
      onUpdateRolls={reorderMode ? undefined : onUpdateRolls}
      characterName={characterName}
      onCompanionClick={
        !reorderMode && power.name === 'Melhor Amigo'
          ? onCompanionClick
          : undefined
      }
      headerActionSlot={reorderMode ? undefined : buildHeaderActionSlot(power)}
    />
  );

  return (
    <Box>
      {canReorder && (
        <Stack
          direction='row'
          spacing={1}
          sx={{ mb: 1, flexWrap: 'wrap', rowGap: 1 }}
        >
          <Button
            size='small'
            variant={reorderMode ? 'contained' : 'outlined'}
            startIcon={reorderMode ? <CheckIcon /> : <DragIndicatorIcon />}
            onClick={() => setReorderMode((prev) => !prev)}
          >
            {reorderMode ? 'Concluído' : 'Reordenar'}
          </Button>
          {reorderMode && sheet?.powersOrder && (
            <Tooltip title='Voltar à ordem alfabética padrão'>
              <Button
                size='small'
                variant='text'
                color='inherit'
                startIcon={<RestartAltIcon />}
                onClick={handleResetOrder}
              >
                Restaurar ordem alfabética
              </Button>
            </Tooltip>
          )}
        </Stack>
      )}

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
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          '&:active': { cursor: 'grabbing' },
                        }}
                      >
                        <DragIndicatorIcon
                          fontSize='small'
                          sx={{ color: 'text.secondary', flexShrink: 0 }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {renderPower(power)}
                        </Box>
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
        uniquePowers.map((power) => renderPower(power))
      )}
    </Box>
  );
};
export default PowersDisplay;
