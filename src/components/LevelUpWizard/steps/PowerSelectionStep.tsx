import React, { useCallback, useMemo } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
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
  /**
   * Nível-alvo em `className`. Os requisitos de NÍVEL dos poderes dessa
   * classe são mostrados contra ele, não contra o nível de personagem.
   */
  classLevel?: number;
  knownClassPowers?: string[];
  knownGeneralPowers?: string[];
  unavailableGeneralPowers?: string[];
  /**
   * Poderes de classe listados porém bloqueados por pré-requisito. Quem decide
   * é o modal, contra a ficha do nível-alvo — este passo respeita em vez de
   * recalcular, para as duas pontas não divergirem.
   */
  unavailableClassPowers?: string[];
  almaLivrePower?: ClassPower | null;
  almaLivreClassName?: string;
  almaLivrePowerAvailable?: boolean;
  /**
   * Opt-in do jogador para escolher poderes fora dos pré-requisitos. Desligado,
   * os reprovados ficam escondidos enquanto se navega (a busca ainda os
   * encontra, travados); ligado, aparecem e ficam escolhíveis. O estado mora no
   * modal: este passo é desmontado a cada navegação do assistente.
   */
  allowOutOfRequirements?: boolean;
  onAllowOutOfRequirementsChange?: (allow: boolean) => void;
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
  classLevel,
  knownClassPowers = [],
  knownGeneralPowers = [],
  unavailableGeneralPowers = [],
  unavailableClassPowers = [],
  almaLivrePower = null,
  almaLivreClassName,
  almaLivrePowerAvailable = false,
  allowOutOfRequirements = false,
  onAllowOutOfRequirementsChange,
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
        if (knownClassPowers.includes(power.name) && !power.canRepeat) {
          return UNAVAILABLE;
        }
        // O veredito do modal manda; a avaliação aqui só serve para MOSTRAR
        // qual requisito falhou, que é o motivo de o poder ficar listado.
        const evaluated = evaluatePowerRequirements(
          power,
          {
            sheet,
            className: entry.source.className,
            // Poder emprestado de outra classe (waiver) não usa este nível
            classLevel:
              entry.source.className === className ? classLevel : undefined,
          },
          'class'
        );
        if (unavailableClassPowers.includes(power.name)) {
          return allowOutOfRequirements
            ? { ...evaluated, available: true, outOfRequirements: true }
            : { ...evaluated, available: false };
        }
        return evaluated;
      }

      if (entry.source.type === 'general') {
        const { power } = entry.source;
        if (
          knownGeneralPowers.includes(power.name) &&
          !power.allowSeveralPicks
        ) {
          return UNAVAILABLE;
        }
        const evaluated = evaluatePowerRequirements(
          power,
          { sheet },
          'general'
        );
        if (unavailableGeneralPowers.includes(power.name)) {
          return allowOutOfRequirements
            ? { ...evaluated, available: true, outOfRequirements: true }
            : { ...evaluated, available: false };
        }
        return evaluated;
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
      unavailableClassPowers,
      allowOutOfRequirements,
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
    // Com 300+ poderes gerais e frequentemente menos de 50 escolhíveis, a
    // subida de nível abre mostrando só o que dá para pegar. A busca ignora o
    // filtro: procurar um poder pelo nome e não achá-lo faria o jogador
    // concluir que ele não existe, em vez de ver o requisito que falta.
    initialOnlyAvailable: true,
    searchIgnoresOnlyAvailable: true,
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

  // Nome do que está escolhido agora, ou `null` enquanto nada válido estiver.
  // Substitui o antigo `isComplete`, que era só um booleano para o aviso.
  const selectedPowerName = useMemo(() => {
    if (selectedPowerChoice === 'class')
      return selectedClassPower?.name ?? null;
    if (selectedPowerChoice === 'general') {
      return selectedGeneralPower?.name ?? null;
    }
    if (selectedPowerChoice === 'almaLivre' && almaLivrePowerAvailable) {
      return almaLivrePower?.name ?? null;
    }
    return null;
  }, [
    selectedPowerChoice,
    selectedClassPower,
    selectedGeneralPower,
    almaLivrePower,
    almaLivrePowerAvailable,
  ]);

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
      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1.5 }}>
        A cada nível, você pode escolher um poder de classe ou um poder geral.
        Os grupos abaixo dizem de onde cada poder vem.
      </Typography>

      {/*
        O estado da escolha fica ACIMA do catálogo, não depois dele. Embaixo,
        ele caía atrás da lista de altura fixa e só aparecia no fim da rolagem
        do assistente — parecia um texto solto no meio da tela. Aqui ocupa a
        mesma linha esteja ou não completo, então não empurra o catálogo
        quando o usuário seleciona.
      */}
      <Box
        sx={{
          minHeight: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        {selectedPowerName ? (
          <>
            <CheckCircleIcon fontSize='small' color='success' />
            <Typography variant='body2' sx={{ color: 'success.main' }}>
              Selecionado: <strong>{selectedPowerName}</strong>
            </Typography>
          </>
        ) : (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Selecione um poder para continuar.
          </Typography>
        )}
      </Box>

      {onAllowOutOfRequirementsChange && (
        <FormControlLabel
          sx={{ ml: 0, mr: 0, mb: 1, gap: 1, alignSelf: 'flex-start' }}
          control={
            <Checkbox
              size='small'
              checked={allowOutOfRequirements}
              onChange={(e) => onAllowOutOfRequirementsChange(e.target.checked)}
              slotProps={{
                input: { 'aria-label': 'Mostrar poderes fora dos requisitos' },
              }}
            />
          }
          label={
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Mostrar poderes fora dos requisitos
            </Typography>
          }
        />
      )}

      {/* Altura limitada: o catálogo rola por dentro, com busca e filtros
          grudados no topo, em vez de esticar o corpo do assistente. */}
      <Box sx={{ height: { xs: 340, sm: 460 }, minHeight: 0 }}>
        <CatalogPanel
          catalog={catalog}
          counts={counts}
          isSelected={isSelected}
          onToggle={onToggle}
          canAddAnother={() => false}
          onAddAnother={() => undefined}
        />
      </Box>
    </Box>
  );
};

export default PowerSelectionStep;
