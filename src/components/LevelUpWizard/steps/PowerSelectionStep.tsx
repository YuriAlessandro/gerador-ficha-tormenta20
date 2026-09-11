import React, { useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import CatalogPanel from '@/components/PowerCatalog/CatalogPanel';
import {
  CatalogEntry,
  ClassPowerSet,
  PowerCategory,
  usePowerCatalog,
} from '@/components/PowerCatalog/usePowerCatalog';
import { PowerOriginKind } from '@/functions/powers/powerOrigins';
import { evaluatePowerRequirements } from '@/functions/powers/requirementEvaluation';
import type { PowerAvailability } from '@/functions/powers/requirementEvaluation';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { ClassPower } from '@/interfaces/Class';
import { GeneralPower, GeneralPowerType } from '@/interfaces/Poderes';

interface PowerSelectionStepProps {
  sheet: CharacterSheet;
  classPowers: ClassPower[];
  generalPowers: GeneralPower[];
  selectedPowerChoice: 'class' | 'general' | 'almaLivre' | null;
  selectedClassPower: ClassPower | null;
  selectedGeneralPower: GeneralPower | null;
  onPowerChoiceChange: (choice: 'class' | 'general' | 'almaLivre') => void;
  onClassPowerSelect: (power: ClassPower) => void;
  onGeneralPowerSelect: (power: GeneralPower) => void;
  onAlmaLivrePowerSelect?: (power: ClassPower) => void;
  className: string;
  knownClassPowers?: string[];
  knownGeneralPowers?: string[];
  unavailableGeneralPowers?: string[];
  almaLivrePower?: ClassPower | null;
  almaLivreClassName?: string;
  almaLivrePowerAvailable?: boolean;
}

const ALMA_LIVRE = 'Alma Livre';

const AVAILABLE: PowerAvailability = {
  available: true,
  bypassed: true,
  groups: [],
};
const UNAVAILABLE: PowerAvailability = {
  available: false,
  bypassed: true,
  groups: [],
};

/** Um grupo por origem real do poder, e não um balde só com o nome da classe. */
function groupClassPowers(
  powers: ClassPower[],
  ownClassName: string
): ClassPowerSet[] {
  const sets = new Map<string, ClassPowerSet>();

  powers.forEach((power) => {
    // `className`/`unlockedBy` vêm carimbados por `getWaivedClassPowers`. Um
    // poder de Bárbaro pego via Domínio do Medo não é um poder de Bucaneiro.
    const origin = power.className ?? ownClassName;
    const key = `${origin}:${power.unlockedBy ?? ''}`;
    const existing = sets.get(key);
    if (existing) {
      existing.powers.push(power);
      return;
    }
    sets.set(key, {
      className: origin,
      powers: [power],
      unlockedBy: power.unlockedBy,
    });
  });

  return [...sets.values()];
}

const GENERAL_KINDS: Record<string, PowerOriginKind> = {
  [GeneralPowerType.COMBATE]: 'generalCombate',
  [GeneralPowerType.DESTINO]: 'generalDestino',
  [GeneralPowerType.MAGIA]: 'generalMagia',
  [GeneralPowerType.CONCEDIDOS]: 'generalConcedidos',
  [GeneralPowerType.TORMENTA]: 'generalTormenta',
  [GeneralPowerType.RACA]: 'generalRaca',
};

const GENERAL_LABELS: Record<string, string> = {
  [GeneralPowerType.COMBATE]: 'Poderes de Combate',
  [GeneralPowerType.DESTINO]: 'Poderes de Destino',
  [GeneralPowerType.MAGIA]: 'Poderes de Magia',
  [GeneralPowerType.CONCEDIDOS]: 'Poderes Concedidos',
  [GeneralPowerType.TORMENTA]: 'Poderes de Tormenta',
  [GeneralPowerType.RACA]: 'Poderes de Raça',
};

function groupGeneralPowers(powers: GeneralPower[]): PowerCategory[] {
  const byType = new Map<GeneralPowerType, GeneralPower[]>();
  powers.forEach((power) => {
    const list = byType.get(power.type);
    if (list) list.push(power);
    else byType.set(power.type, [power]);
  });

  return [...byType.entries()].map(([type, list]) => ({
    key: type,
    type,
    kind: GENERAL_KINDS[type] ?? 'generalCombate',
    name: GENERAL_LABELS[type] ?? 'Poderes Gerais',
    powers: list,
  }));
}

/**
 * A escolha de poder da subida de nível, sobre o mesmo catálogo do editor de
 * poderes da ficha.
 *
 * Antes eram três listas separadas atrás de um RadioGroup ("Poder de Classe" /
 * "Poder Geral" / "Alma Livre"), cada uma com busca própria e nenhuma com
 * filtro de disponibilidade. Pior: a lista de classe usava um cabeçalho único
 * com o nome da classe do personagem, então um poder de Bárbaro destravado por
 * "Domínio do Medo" aparecia sob "Poderes de Bucaneiro".
 *
 * Aqui o tipo da escolha é DERIVADO do item clicado, em vez de ser um passo
 * anterior: o grupo do catálogo já diz de onde o poder vem.
 */
const PowerSelectionStep: React.FC<PowerSelectionStepProps> = ({
  sheet,
  classPowers,
  generalPowers,
  selectedPowerChoice,
  selectedClassPower,
  selectedGeneralPower,
  onPowerChoiceChange,
  onClassPowerSelect,
  onGeneralPowerSelect,
  onAlmaLivrePowerSelect,
  className,
  knownClassPowers = [],
  knownGeneralPowers = [],
  unavailableGeneralPowers = [],
  almaLivrePower = null,
  almaLivreClassName,
  almaLivrePowerAvailable = false,
}) => {
  const classPowerSets = useMemo(() => {
    const sets = groupClassPowers(classPowers, className);

    // Alma Livre é a mesma ideia de um waiver — "escolha um poder dessa classe
    // como se pertencesse a ela" — então ganha o mesmo tratamento visual.
    if (almaLivrePower && almaLivreClassName) {
      sets.push({
        className: almaLivreClassName,
        powers: [almaLivrePower],
        unlockedBy: ALMA_LIVRE,
      });
    }

    return sets;
  }, [classPowers, className, almaLivrePower, almaLivreClassName]);

  const powerCategories = useMemo(
    () => groupGeneralPowers(generalPowers),
    [generalPowers]
  );

  const isAlmaLivreEntry = useCallback(
    (entry: CatalogEntry) =>
      entry.source.type === 'class' &&
      !!almaLivrePower &&
      entry.source.power.name === almaLivrePower.name &&
      entry.groupKey.includes(ALMA_LIVRE),
    [almaLivrePower]
  );

  const resolveAvailability = useCallback(
    (entry: CatalogEntry): PowerAvailability => {
      if (isAlmaLivreEntry(entry)) {
        return almaLivrePowerAvailable ? AVAILABLE : UNAVAILABLE;
      }

      if (entry.source.type === 'class') {
        const { power } = entry.source;
        // A lista de classe já vem filtrada por `getAllowedClassPowers`; o que
        // sobra decidir é o poder já conhecido e não repetível.
        if (knownClassPowers.includes(power.name) && !power.canRepeat) {
          return UNAVAILABLE;
        }
        return evaluatePowerRequirements(
          power,
          { sheet, className: entry.source.className },
          'class'
        );
      }

      if (entry.source.type === 'general') {
        const { power } = entry.source;
        if (
          knownGeneralPowers.includes(power.name) &&
          !power.allowSeveralPicks
        ) {
          return UNAVAILABLE;
        }
        if (unavailableGeneralPowers.includes(power.name)) return UNAVAILABLE;
        return evaluatePowerRequirements(power, { sheet }, 'general');
      }

      return AVAILABLE;
    },
    [
      sheet,
      isAlmaLivreEntry,
      almaLivrePowerAvailable,
      knownClassPowers,
      knownGeneralPowers,
      unavailableGeneralPowers,
    ]
  );

  const catalog = usePowerCatalog({
    powerCategories,
    classPowerSets,
    classAbilitySets: [],
    raceName: sheet.raca.name,
    raceAbilities: [],
    customPowers: [],
    resolveAvailability,
  });

  const isSelected = useCallback(
    (entry: CatalogEntry) => {
      if (isAlmaLivreEntry(entry)) return selectedPowerChoice === 'almaLivre';
      if (entry.source.type === 'class') {
        return (
          selectedPowerChoice === 'class' &&
          selectedClassPower?.name === entry.source.power.name &&
          selectedClassPower?.className === entry.source.power.className
        );
      }
      if (entry.source.type === 'general') {
        return (
          selectedPowerChoice === 'general' &&
          selectedGeneralPower?.name === entry.source.power.name
        );
      }
      return false;
    },
    [
      isAlmaLivreEntry,
      selectedPowerChoice,
      selectedClassPower,
      selectedGeneralPower,
    ]
  );

  // Escolha única: clicar num item troca a seleção inteira, e o TIPO da escolha
  // sai do grupo do item — o RadioGroup anterior virou redundante.
  const onToggle = useCallback(
    (entry: CatalogEntry) => {
      if (!resolveAvailability(entry).available) return;

      if (entry.source.type === 'class') {
        if (isAlmaLivreEntry(entry) && onAlmaLivrePowerSelect) {
          onPowerChoiceChange('almaLivre');
          onAlmaLivrePowerSelect(entry.source.power);
          return;
        }
        onPowerChoiceChange('class');
        onClassPowerSelect(entry.source.power);
        return;
      }

      if (entry.source.type === 'general') {
        onPowerChoiceChange('general');
        onGeneralPowerSelect(entry.source.power);
      }
    },
    [
      resolveAvailability,
      isAlmaLivreEntry,
      onAlmaLivrePowerSelect,
      onPowerChoiceChange,
      onClassPowerSelect,
      onGeneralPowerSelect,
    ]
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    [...knownClassPowers, ...knownGeneralPowers].forEach((name) =>
      map.set(name, (map.get(name) ?? 0) + 1)
    );
    return map;
  }, [knownClassPowers, knownGeneralPowers]);

  const hasAnyPower =
    classPowers.length > 0 || generalPowers.length > 0 || !!almaLivrePower;

  const isComplete =
    (selectedPowerChoice === 'class' && selectedClassPower !== null) ||
    (selectedPowerChoice === 'general' && selectedGeneralPower !== null) ||
    (selectedPowerChoice === 'almaLivre' && almaLivrePowerAvailable);

  if (!hasAnyPower) {
    return (
      <Typography variant='body2' color='error'>
        Nenhum poder disponível para este nível. Isso não deveria acontecer -
        por favor, reporte este bug.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Typography variant='h6' gutterBottom>
        Escolha um Poder
      </Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
        A cada nível, você pode escolher um poder de classe ou um poder geral.
        Os grupos abaixo dizem de onde cada poder vem.
      </Typography>

      {/* Altura limitada: o catálogo rola por dentro, com busca e filtros
          grudados no topo, em vez de esticar o corpo do assistente. */}
      <Box sx={{ height: { xs: 380, sm: 460 }, minHeight: 0 }}>
        <CatalogPanel
          catalog={catalog}
          counts={counts}
          isSelected={isSelected}
          onToggle={onToggle}
          canAddAnother={() => false}
          onAddAnother={() => undefined}
        />
      </Box>

      {selectedPowerChoice && !isComplete && (
        <Typography variant='body2' sx={{ color: 'warning.main', mt: 2 }}>
          Selecione um poder para continuar.
        </Typography>
      )}
    </Box>
  );
};

export default PowerSelectionStep;
