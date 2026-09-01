import { useCallback, useEffect, useMemo, useState } from 'react';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { GolpePessoalBuild } from '@/data/systems/tormenta20/golpePessoal';
import originPowersCatalog from '@/data/systems/tormenta20/powers/originPowers';
import { ORIGINS } from '@/data/systems/tormenta20/origins';
import { dataRegistry } from '@/data/registry';
import { getGrantedPowerPool } from '@/functions/powers/grantedPowerPool';
import { ClassAbility, ClassPower } from '@/interfaces/Class';
import CharacterSheet, {
  SheetActionHistoryEntry,
  Step,
} from '@/interfaces/CharacterSheet';
import { CustomPower } from '@/interfaces/CustomPower';
import {
  GeneralPower,
  GeneralPowerType,
  OriginPower,
} from '@/interfaces/Poderes';
import {
  ManualPowerSelections,
  PowerSelectionRequirements,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import {
  calculateGolpePessoalCost,
  resolveGolpePessoalEffectKey,
} from '@/functions/powers/golpePessoal';
import { getPowerSelectionRequirements } from '@/functions/powers/manualPowerSelection';
import {
  GENERAL_TYPE_TO_KIND,
  PowerOriginKind,
} from '@/functions/powers/powerOrigins';
import {
  evaluatePowerRequirements,
  PowerAvailability,
} from '@/functions/powers/requirementEvaluation';
import { resolveClassPowerCatalog } from '@/functions/powers';
import { recalculateSheet } from '@/functions/recalculateSheet';
import {
  findClassDescription,
  getClassLevel,
  getClassLevelsMap,
  isMulticlass,
} from '@/functions/multiclass';
import { useContentSupplements } from '@/hooks/useContentSupplements';
import { SupplementId } from '@/types/supplement.types';
import { EnsinarTruquePick } from '../EnsinarTruqueDialog';
import {
  isRepeatablePower,
  mergeSelections,
  requiresUserInput,
  resolveAutoSelections,
} from './powerSelectionMerge';

/**
 * Todo o estado e as regras do editor de poderes, fora da árvore de render.
 *
 * A lógica aqui é a mesma que vivia em `PowersEditDrawer.tsx` — inclusive
 * `commitSave`, migrado sem alteração de conteúdo por ser a parte mais
 * sensível do fluxo (histórico de ações, Ambição Herdada do Meio-Elfo,
 * Versátil do Humano, truques do Treinador). O que mudou foi a moradia: com o
 * estado num hook consumido por dentro do `Dialog`, nada disso roda enquanto o
 * editor está fechado.
 */

export interface PowerCategory {
  /** Chave estável do grupo. `type` não serve: Destino tem até 3 categorias. */
  key: string;
  type: GeneralPowerType | 'ORIGEM';
  kind: PowerOriginKind;
  name: string;
  powers: (GeneralPower | OriginPower)[];
}

export interface ClassPowerSet {
  className: string;
  powers: ClassPower[];
}

export interface ClassAbilitySet {
  className: string;
  classLevel: number;
  abilities: ClassAbility[];
}

interface UsePowersEditorArgs {
  open: boolean;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet>) => void;
  onClose: () => void;
}

export function usePowersEditor({
  open,
  sheet,
  onSave,
  onClose,
}: UsePowersEditorArgs) {
  const supplements = useContentSupplements();

  const [selectedPowers, setSelectedPowers] = useState<GeneralPower[]>([]);
  const [selectedClassPowers, setSelectedClassPowers] = useState<ClassPower[]>(
    []
  );
  const [selectedOriginPowers, setSelectedOriginPowers] = useState<
    OriginPower[]
  >([]);
  const [selectedCustomPowers, setSelectedCustomPowers] = useState<
    CustomPower[]
  >([]);
  const [selectedDeityPowers, setSelectedDeityPowers] = useState<
    GeneralPower[]
  >([]);
  const [selectedCustomGrantedPowers, setSelectedCustomGrantedPowers] =
    useState<CustomPower[]>([]);

  const [manualSelections, setManualSelections] =
    useState<ManualPowerSelections>({});

  const [selectionDialog, setSelectionDialog] = useState<{
    open: boolean;
    requirements: PowerSelectionRequirements | null;
    powerToAdd: GeneralPower | ClassPower | null;
    isClassPower: boolean;
    isDeityPower: boolean;
  }>({
    open: false,
    requirements: null,
    powerToAdd: null,
    isClassPower: false,
    isDeityPower: false,
  });

  const [golpePessoalDialog, setGolpePessoalDialog] = useState<{
    open: boolean;
    powerToAdd: ClassPower | null;
  }>({ open: false, powerToAdd: null });

  const [customPowerDialog, setCustomPowerDialog] = useState<{
    open: boolean;
    powerToEdit?: CustomPower;
  }>({ open: false });

  const [customGrantedPowerDialog, setCustomGrantedPowerDialog] = useState<{
    open: boolean;
    powerToEdit?: CustomPower;
  }>({ open: false });

  const [ensinarTruqueDialog, setEnsinarTruqueDialog] = useState<{
    open: boolean;
    pendingCount: number;
  }>({ open: false, pendingCount: 0 });

  // ── Hidratação a partir da ficha ────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    setSelectedPowers(sheet.generalPowers ? [...sheet.generalPowers] : []);
    setSelectedClassPowers(sheet.classPowers ? [...sheet.classPowers] : []);
    setSelectedOriginPowers(
      sheet.origin?.powers ? [...sheet.origin.powers] : []
    );
    setSelectedCustomPowers(sheet.customPowers ? [...sheet.customPowers] : []);
    setSelectedDeityPowers(
      sheet.devoto?.poderes ? [...sheet.devoto.poderes] : []
    );
    setSelectedCustomGrantedPowers(
      sheet.customGrantedPowers ? [...sheet.customGrantedPowers] : []
    );

    // As escolhas de familiar/arma/totem já feitas voltam do histórico, senão
    // reabrir o editor e salvar apagaria a escolha registrada.
    const initialManualSelections: ManualPowerSelections = {};
    sheet.sheetActionHistory?.forEach((entry) => {
      const { powerName } = entry;
      if (!powerName) return;
      entry.changes.forEach((change) => {
        if (!initialManualSelections[powerName]) {
          initialManualSelections[powerName] = {};
        }
        if (change.type === 'FamiliarSelected') {
          initialManualSelections[powerName].familiars = [change.familiarKey];
        } else if (change.type === 'WeaponSpecializationSelected') {
          initialManualSelections[powerName].weapons = [change.weaponName];
        } else if (change.type === 'AnimalTotemSelected') {
          initialManualSelections[powerName].animalTotems = [change.totemKey];
        }
      });
    });
    setManualSelections(initialManualSelections);
  }, [
    open,
    sheet.generalPowers,
    sheet.classPowers,
    sheet.origin?.powers,
    sheet.customPowers,
    sheet.devoto?.poderes,
    sheet.customGrantedPowers,
    sheet.sheetActionHistory,
  ]);

  // ── Preservação de rolagens ao re-adicionar um poder ────────────────────
  const withOriginalRolls = useCallback(
    <T extends { name: string; rolls?: unknown }>(
      power: T,
      source: T[] | undefined
    ): T => {
      const original = source?.find((p) => p.name === power.name);
      return original?.rolls ? { ...power, rolls: original.rolls } : power;
    },
    []
  );

  const getOriginalPowerWithRolls = useCallback(
    (power: GeneralPower) => withOriginalRolls(power, sheet.generalPowers),
    [sheet.generalPowers, withOriginalRolls]
  );
  const getOriginalClassPowerWithRolls = useCallback(
    (power: ClassPower) => withOriginalRolls(power, sheet.classPowers),
    [sheet.classPowers, withOriginalRolls]
  );
  const getOriginalOriginPowerWithRolls = useCallback(
    (power: OriginPower) => withOriginalRolls(power, sheet.origin?.powers),
    [sheet.origin?.powers, withOriginalRolls]
  );

  // ── Catálogo ────────────────────────────────────────────────────────────
  // Deliberadamente ignora os suplementos ativos do usuário: o editor mostra
  // tudo o que existe, para não esconder um poder que a ficha já possui.
  const allSupplements = useMemo(
    () => [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
      SupplementId.TORMENTA20_DEUSES_ARTON,
      SupplementId.TORMENTA20_HEROIS_ARTON,
      // Suplementos runtime ativados (ex.: Pacotes de Poderes homebrew).
      ...(dataRegistry.getRuntimeSupplementIds() as unknown as SupplementId[]),
    ],
    []
  );

  const allPowersByCategory = useMemo(
    () => dataRegistry.getPowersBySupplements(allSupplements),
    [allSupplements]
  );

  const classPowerSets = useMemo<ClassPowerSet[]>(() => {
    const sets: ClassPowerSet[] = [];

    // `resolveClassPowerCatalog` e não `sheet.classe.powers` direto: fichas
    // salvas têm o catálogo zerado por `stripSheetForStorage`, e uma variante
    // com o suplemento de origem desativado ficaria com `powers: []`.
    const primaryPowers = resolveClassPowerCatalog(sheet);

    if (!isMulticlass(sheet)) {
      if (primaryPowers.length > 0) {
        sets.push({ className: sheet.classe.name, powers: primaryPowers });
      }
      return sets;
    }

    getClassLevelsMap(sheet).forEach((_level, className) => {
      if (className === sheet.classe.name) {
        if (primaryPowers.length > 0) {
          sets.push({ className, powers: primaryPowers });
        }
        return;
      }
      const subname = sheet.classLevels?.find(
        (cl) => cl.className === className
      )?.classSubname;
      const classDesc = findClassDescription(
        className,
        subname,
        allSupplements
      );
      if (classDesc?.powers && classDesc.powers.length > 0) {
        sets.push({ className, powers: classDesc.powers });
      }
    });

    return sets;
  }, [sheet, allSupplements]);

  const classAbilitySets = useMemo<ClassAbilitySet[]>(() => {
    const sets: ClassAbilitySet[] = [];

    if (!isMulticlass(sheet)) {
      const filtered = (sheet.classe.abilities ?? []).filter(
        (a) => a.nivel <= sheet.nivel
      );
      if (filtered.length > 0) {
        sets.push({
          className: sheet.classe.name,
          classLevel: sheet.nivel,
          abilities: filtered,
        });
      }
      return sets;
    }

    getClassLevelsMap(sheet).forEach((classLevel, className) => {
      let sourceAbilities: ClassAbility[] = [];
      if (className === sheet.classe.name) {
        sourceAbilities = sheet.classe.abilities ?? [];
      } else {
        const subname = sheet.classLevels?.find(
          (cl) => cl.className === className
        )?.classSubname;
        sourceAbilities =
          findClassDescription(className, subname, allSupplements)?.abilities ??
          [];
      }
      const filtered = sourceAbilities.filter((a) => a.nivel <= classLevel);
      if (filtered.length > 0) {
        sets.push({ className, classLevel, abilities: filtered });
      }
    });

    return sets;
  }, [sheet, allSupplements]);

  const powerCategories = useMemo<PowerCategory[]>(() => {
    const isKallyanach = sheet.raca.name === 'Kallyanach';
    const isKobolds = sheet.raca.name === 'Kobolds';

    const isDraconic = (p: GeneralPower) => p.name.includes('Bênção Dracônica');
    const isKobold = (p: GeneralPower) => p.name.includes('(Kobolds)');

    const destino = allPowersByCategory.DESTINO;
    const general = (
      type: GeneralPowerType,
      name: string,
      powers: GeneralPower[]
    ) => ({
      key: name,
      type,
      kind: GENERAL_TYPE_TO_KIND[type],
      name,
      powers,
    });

    return [
      {
        key: 'Poderes de Origem',
        type: 'ORIGEM' as const,
        kind: 'originPower' as PowerOriginKind,
        name: 'Poderes de Origem',
        powers: Object.values(originPowersCatalog),
      },
      general(
        GeneralPowerType.COMBATE,
        'Poderes de Combate',
        allPowersByCategory.COMBATE
      ),
      // Bênçãos e Talentos só existem para a raça correspondente.
      ...(isKallyanach
        ? [
            general(
              GeneralPowerType.DESTINO,
              'Bênçãos Dracônicas (Kallyanach)',
              destino.filter(isDraconic)
            ),
          ]
        : []),
      ...(isKobolds
        ? [
            general(
              GeneralPowerType.DESTINO,
              'Talentos do Bando (Kobolds)',
              destino.filter(isKobold)
            ),
          ]
        : []),
      general(
        GeneralPowerType.DESTINO,
        'Poderes de Destino',
        destino.filter((p) => !isDraconic(p) && !isKobold(p))
      ),
      general(
        GeneralPowerType.MAGIA,
        'Poderes de Magia',
        allPowersByCategory.MAGIA
      ),
      general(
        GeneralPowerType.TORMENTA,
        'Poderes de Tormenta',
        allPowersByCategory.TORMENTA
      ),
      general(
        GeneralPowerType.CONCEDIDOS,
        'Poderes Concedidos',
        allPowersByCategory.CONCEDIDOS
      ),
      general(
        GeneralPowerType.RACA,
        'Poderes de Raça',
        allPowersByCategory.RACA
      ),
    ];
  }, [allPowersByCategory, sheet.raca.name]);

  // ── Disponibilidade ─────────────────────────────────────────────────────
  // Cache por nome: a lista tem centenas de itens e a UI consulta o veredito
  // na ordenação e de novo em cada linha renderizada.
  const availabilityCache = useMemo(
    () => new Map<string, PowerAvailability>(),
    [selectedPowers, selectedClassPowers, sheet]
  );

  const getAvailability = useCallback(
    (
      power: { name: string; requirements?: GeneralPower['requirements'] },
      kind: 'general' | 'class' = 'general'
    ): PowerAvailability => {
      const cacheKey = `${kind}:${power.name}`;
      const cached = availabilityCache.get(cacheKey);
      if (cached) return cached;

      const result = evaluatePowerRequirements(
        power,
        {
          sheet,
          pendingGeneralPowers: selectedPowers,
          pendingClassPowers: selectedClassPowers,
        },
        kind
      );
      availabilityCache.set(cacheKey, result);
      return result;
    },
    [availabilityCache, sheet, selectedPowers, selectedClassPowers]
  );

  // ── Poderes gerais ──────────────────────────────────────────────────────
  const addGeneralPower = useCallback(
    (power: GeneralPower) => {
      const requirements = getPowerSelectionRequirements(power);

      if (!requirements) {
        setSelectedPowers((prev) => [
          ...prev,
          getOriginalPowerWithRolls(power),
        ]);
        return;
      }

      if (requiresUserInput(requirements, sheet, supplements)) {
        setSelectionDialog({
          open: true,
          requirements,
          powerToAdd: power,
          isClassPower: false,
          isDeityPower: false,
        });
        return;
      }

      const autoSelections = resolveAutoSelections(
        requirements,
        sheet,
        supplements
      );
      setManualSelections((prev) => ({
        ...prev,
        [power.name]: mergeSelections(
          prev[power.name],
          autoSelections,
          isRepeatablePower(power)
        ),
      }));
      setSelectedPowers((prev) => [...prev, getOriginalPowerWithRolls(power)]);
    },
    [getOriginalPowerWithRolls, sheet, supplements]
  );

  const handlePowerToggle = useCallback(
    (power: GeneralPower) => {
      if (selectedPowers.some((p) => p.name === power.name)) {
        setSelectedPowers((prev) => prev.filter((p) => p.name !== power.name));
        setManualSelections((prev) => {
          const updated = { ...prev };
          delete updated[power.name];
          return updated;
        });
        return;
      }
      addGeneralPower(power);
    },
    [addGeneralPower, selectedPowers]
  );

  /** Botão "+" de um poder repetível: sempre adiciona outra instância. */
  const handleAddRepeatablePower = useCallback(
    (power: GeneralPower) => addGeneralPower(power),
    [addGeneralPower]
  );

  const handlePowerRemove = useCallback(
    (powerToRemove: GeneralPower) => {
      const count = selectedPowers.filter(
        (p) => p.name === powerToRemove.name
      ).length;

      if (count > 1) {
        // Várias instâncias: tira só a última.
        setSelectedPowers((prev) => {
          const lastIndex = prev
            .map((p) => p.name)
            .lastIndexOf(powerToRemove.name);
          return prev.filter((_p, index) => index !== lastIndex);
        });
        return;
      }

      setSelectedPowers((prev) =>
        prev.filter((p) => p.name !== powerToRemove.name)
      );
      setManualSelections((prev) => {
        const updated: ManualPowerSelections = {};
        // Além da entrada do próprio poder, limpa a referência a ele dentro da
        // seleção de QUALQUER outra habilidade (a que o concedeu, como
        // "Linhagem Rubra" ou "Memória Póstuma"). Sem isso, a habilidade que
        // concede reescolheria o poder removido no próximo recálculo.
        Object.entries(prev).forEach(([key, selection]) => {
          if (key === powerToRemove.name) return;
          if (selection.powers?.some((p) => p.name === powerToRemove.name)) {
            updated[key] = {
              ...selection,
              powers: selection.powers.filter(
                (p) => p.name !== powerToRemove.name
              ),
            };
          } else {
            updated[key] = selection;
          }
        });
        return updated;
      });
    },
    [selectedPowers]
  );

  // ── Poderes de classe ───────────────────────────────────────────────────
  const addClassPower = useCallback(
    (power: ClassPower, sourceClassName?: string) => {
      // Golpe Pessoal é montado no assistente próprio, não escolhido da lista.
      if (power.name === 'Golpe Pessoal') {
        setGolpePessoalDialog({ open: true, powerToAdd: power });
        return;
      }

      const stamped = (p: ClassPower) => ({
        ...getOriginalClassPowerWithRolls(p),
        ...(sourceClassName ? { className: sourceClassName } : {}),
      });

      const requirements = getPowerSelectionRequirements(power);

      if (!requirements) {
        setSelectedClassPowers((prev) => [...prev, stamped(power)]);
        return;
      }

      if (requiresUserInput(requirements, sheet, supplements)) {
        setSelectionDialog({
          open: true,
          requirements,
          powerToAdd: power,
          isClassPower: true,
          isDeityPower: false,
        });
        return;
      }

      const autoSelections = resolveAutoSelections(
        requirements,
        sheet,
        supplements
      );
      setManualSelections((prev) => ({
        ...prev,
        [power.name]: mergeSelections(
          prev[power.name],
          autoSelections,
          isRepeatablePower(power)
        ),
      }));
      setSelectedClassPowers((prev) => [...prev, stamped(power)]);
    },
    [getOriginalClassPowerWithRolls, sheet, supplements]
  );

  const handleClassPowerToggle = useCallback(
    (power: ClassPower, sourceClassName?: string) => {
      if (selectedClassPowers.some((p) => p.name === power.name)) {
        setSelectedClassPowers((prev) =>
          prev.filter((p) => p.name !== power.name)
        );
        setManualSelections((prev) => {
          const updated = { ...prev };
          delete updated[power.name];
          return updated;
        });
        return;
      }
      addClassPower(power, sourceClassName);
    },
    [addClassPower, selectedClassPowers]
  );

  const handleAddRepeatableClassPower = useCallback(
    (power: ClassPower, sourceClassName?: string) =>
      addClassPower(power, sourceClassName),
    [addClassPower]
  );

  const handleClassPowerRemove = useCallback(
    (powerToRemove: ClassPower) => {
      const count = selectedClassPowers.filter(
        (p) => p.name === powerToRemove.name
      ).length;

      if (count > 1) {
        setSelectedClassPowers((prev) => {
          const lastIndex = prev
            .map((p) => p.name)
            .lastIndexOf(powerToRemove.name);
          return prev.filter((_p, index) => index !== lastIndex);
        });
        return;
      }

      setSelectedClassPowers((prev) =>
        prev.filter((p) => p.name !== powerToRemove.name)
      );
      setManualSelections((prev) => {
        const updated = { ...prev };
        delete updated[powerToRemove.name];
        return updated;
      });
    },
    [selectedClassPowers]
  );

  // ── Diálogo de seleção ──────────────────────────────────────────────────
  const handleSelectionConfirm = useCallback(
    (selections: SelectionOptions) => {
      const { powerToAdd, isClassPower, isDeityPower } = selectionDialog;

      if (powerToAdd) {
        setManualSelections((prev) => ({
          ...prev,
          [powerToAdd.name]: mergeSelections(
            prev[powerToAdd.name],
            selections,
            isRepeatablePower(powerToAdd)
          ),
        }));

        if (isClassPower) {
          setSelectedClassPowers((prev) => [
            ...prev,
            getOriginalClassPowerWithRolls(powerToAdd as ClassPower),
          ]);
        } else if (isDeityPower) {
          setSelectedDeityPowers((prev) => [
            ...prev,
            getOriginalPowerWithRolls(powerToAdd as GeneralPower),
          ]);
        } else {
          setSelectedPowers((prev) => [
            ...prev,
            getOriginalPowerWithRolls(powerToAdd as GeneralPower),
          ]);
        }
      }

      setSelectionDialog({
        open: false,
        requirements: null,
        powerToAdd: null,
        isClassPower: false,
        isDeityPower: false,
      });
    },
    [getOriginalClassPowerWithRolls, getOriginalPowerWithRolls, selectionDialog]
  );

  const handleSelectionCancel = useCallback(() => {
    setSelectionDialog({
      open: false,
      requirements: null,
      powerToAdd: null,
      isClassPower: false,
      isDeityPower: false,
    });
  }, []);

  // ── Golpe Pessoal ───────────────────────────────────────────────────────
  const handleGolpePessoalConfirm = useCallback(
    (build: GolpePessoalBuild) => {
      const { powerToAdd } = golpePessoalDialog;
      if (!powerToAdd) return;

      const availableEffects =
        dataRegistry.getGolpePessoalEffectsBySupplements(allSupplements);

      const effectDescriptions = build.effects
        .map((effectData) => {
          const effectKey = resolveGolpePessoalEffectKey(
            effectData.effectName,
            availableEffects
          );
          if (!effectKey) return '';

          const effect = availableEffects[effectKey];
          let desc = `• ${effect.name}: ${effect.description}`;
          if (effectData.repeats > 1) desc += ` (${effectData.repeats}x)`;
          if (effectData.choices && effectData.choices.length > 0) {
            desc += ` [${effectData.choices.join(', ')}]`;
          }
          return desc;
        })
        .join('\n');

      // Recalcula o custo pelos valores atuais dos efeitos.
      const totalCost = calculateGolpePessoalCost(
        build.effects,
        availableEffects
      );

      setSelectedClassPowers((prev) => [
        ...prev,
        {
          ...powerToAdd,
          name: `Golpe Pessoal (${build.weapon})`,
          text: `${effectDescriptions}\n\n💠 Custo Total: ${totalCost} PM`,
        },
      ]);
      setGolpePessoalDialog({ open: false, powerToAdd: null });
    },
    [allSupplements, golpePessoalDialog.powerToAdd]
  );

  const closeGolpePessoalDialog = useCallback(
    () => setGolpePessoalDialog({ open: false, powerToAdd: null }),
    []
  );

  // ── Poderes de origem ───────────────────────────────────────────────────
  const handleOriginPowerToggle = useCallback(
    (power: OriginPower) => {
      if (selectedOriginPowers.some((p) => p.name === power.name)) {
        setSelectedOriginPowers((prev) =>
          prev.filter((p) => p.name !== power.name)
        );
        setManualSelections((prev) => {
          const updated = { ...prev };
          delete updated[power.name];
          return updated;
        });
        return;
      }
      setSelectedOriginPowers((prev) => [
        ...prev,
        getOriginalOriginPowerWithRolls(power),
      ]);
    },
    [getOriginalOriginPowerWithRolls, selectedOriginPowers]
  );

  const getOriginForPower = useCallback((power: OriginPower) => {
    const foundOrigin = Object.values(ORIGINS).find((origin) =>
      origin.poderes?.some((p) => p.name === power.name)
    );
    return foundOrigin ? foundOrigin.name : null;
  }, []);

  // ── Poderes personalizados ──────────────────────────────────────────────
  const handleSaveCustomPower = useCallback(
    (power: CustomPower) => {
      setSelectedCustomPowers((prev) =>
        customPowerDialog.powerToEdit
          ? prev.map((p) => (p.id === power.id ? power : p))
          : [...prev, power]
      );
      setCustomPowerDialog({ open: false });
    },
    [customPowerDialog.powerToEdit]
  );

  const handleRemoveCustomPower = useCallback(
    (powerId: string) =>
      setSelectedCustomPowers((prev) => prev.filter((p) => p.id !== powerId)),
    []
  );

  const handleSaveCustomGrantedPower = useCallback(
    (power: CustomPower) => {
      setSelectedCustomGrantedPowers((prev) =>
        customGrantedPowerDialog.powerToEdit
          ? prev.map((p) => (p.id === power.id ? power : p))
          : [...prev, power]
      );
      setCustomGrantedPowerDialog({ open: false });
    },
    [customGrantedPowerDialog.powerToEdit]
  );

  const handleRemoveCustomGrantedPower = useCallback(
    (powerId: string) =>
      setSelectedCustomGrantedPowers((prev) =>
        prev.filter((p) => p.id !== powerId)
      ),
    []
  );

  // ── Poderes concedidos ──────────────────────────────────────────────────
  const isDevoto = !!sheet.devoto;
  const storedDeity = sheet.devoto?.divindade;
  const deityPowers = useMemo(() => {
    if (!storedDeity) return [];
    // Devoção Dupla: a piscina é a união das listas dos dois deuses (mais o
    // poder único do sincretismo). Resolve pelo registry — o objeto gravado na
    // ficha tem o catálogo esvaziado por `stripSheetForStorage`.
    const names = [storedDeity.name];
    const secundaria = sheet.devoto?.divindadeSecundaria;
    if (secundaria && secundaria !== storedDeity.name) names.push(secundaria);

    const pool = getGrantedPowerPool(names, allSupplements);
    return pool.length > 0 ? pool : storedDeity.poderes || [];
  }, [allSupplements, storedDeity, sheet.devoto?.divindadeSecundaria]);

  const isDeityPowerSelected = useCallback(
    (power: GeneralPower) =>
      selectedDeityPowers.some((p) => p.name === power.name),
    [selectedDeityPowers]
  );

  const isDeityPowerAvailable = useCallback(
    (power: GeneralPower) => {
      // Não sendo devoto, o poder segue a regra dos poderes gerais.
      if (!isDevoto) return true;
      return deityPowers.some((p) => p.name === power.name);
    },
    [deityPowers, isDevoto]
  );

  const handleDeityPowerToggle = useCallback(
    (power: GeneralPower) => {
      if (!isDevoto) {
        handlePowerToggle(power);
        return;
      }
      if (!isDeityPowerAvailable(power)) return;

      const isSelected = selectedDeityPowers.some((p) => p.name === power.name);
      if (isSelected) {
        setSelectedDeityPowers((prev) =>
          prev.filter((p) => p.name !== power.name)
        );
        setManualSelections((prev) => {
          const updated = { ...prev };
          delete updated[power.name];
          return updated;
        });
        return;
      }

      // Mesmo fluxo de `addGeneralPower`: poderes concedidos com `sheetActions`
      // que exigem escolha (ex.: Biblioteca Divina) também precisam do diálogo
      // — sem isso o poder era adicionado direto e a escolha nunca acontecia.
      const requirements = getPowerSelectionRequirements(power);

      if (!requirements) {
        setSelectedDeityPowers((prev) => [...prev, power]);
        return;
      }

      if (requiresUserInput(requirements, sheet, supplements)) {
        setSelectionDialog({
          open: true,
          requirements,
          powerToAdd: power,
          isClassPower: false,
          isDeityPower: true,
        });
        return;
      }

      const autoSelections = resolveAutoSelections(
        requirements,
        sheet,
        supplements
      );
      setManualSelections((prev) => ({
        ...prev,
        [power.name]: mergeSelections(
          prev[power.name],
          autoSelections,
          isRepeatablePower(power)
        ),
      }));
      setSelectedDeityPowers((prev) => [...prev, power]);
    },
    [
      handlePowerToggle,
      isDeityPowerAvailable,
      isDevoto,
      selectedDeityPowers,
      sheet,
      supplements,
    ]
  );

  const handleDeityPowerRemove = useCallback(
    (powerToRemove: GeneralPower) =>
      setSelectedDeityPowers((prev) =>
        prev.filter((p) => p.name !== powerToRemove.name)
      ),
    []
  );

  // ── Salvar ──────────────────────────────────────────────────────────────
  const commitSave = useCallback(
    (ensinarTruquePicks: EnsinarTruquePick[]) => {
      const originalPowerNames = sheet.generalPowers?.map((p) => p.name) || [];
      const newPowerNames = selectedPowers.map((p) => p.name);

      const addedPowers = selectedPowers.filter(
        (p) => !originalPowerNames.includes(p.name)
      );
      const removedPowers =
        sheet.generalPowers?.filter((p) => !newPowerNames.includes(p.name)) ||
        [];

      const originalClassPowerNames =
        sheet.classPowers?.map((p) => p.name) || [];
      const newClassPowerNames = selectedClassPowers.map((p) => p.name);

      const addedClassPowers = selectedClassPowers.filter(
        (p) => !originalClassPowerNames.includes(p.name)
      );
      const removedClassPowers =
        sheet.classPowers?.filter(
          (p) => !newClassPowerNames.includes(p.name)
        ) || [];

      const originalOriginPowerNames =
        sheet.origin?.powers?.map((p) => p.name) || [];
      const newOriginPowerNames = selectedOriginPowers.map((p) => p.name);

      const addedOriginPowers = selectedOriginPowers.filter(
        (p) => !originalOriginPowerNames.includes(p.name)
      );
      const removedOriginPowers =
        sheet.origin?.powers?.filter(
          (p) => !newOriginPowerNames.includes(p.name)
        ) || [];

      const newSteps: Step[] = [];
      const newHistoryEntries: SheetActionHistoryEntry[] = [];

      const pushAddStep = (label: string, powers: { name: string }[]): void => {
        if (powers.length === 0) return;
        newSteps.push({
          label,
          type: 'Poderes',
          value: powers.map((p) => ({ name: p.name, value: p.name })),
        });
      };

      const pushRemoveStep = (
        label: string,
        powers: { name: string }[]
      ): void => {
        if (powers.length === 0) return;
        newSteps.push({
          label,
          type: 'Poderes',
          value: powers.map((p) => ({
            name: p.name,
            value: `${p.name} (removido)`,
          })),
        });
      };

      const pushAddedHistory = (
        powers: { name: string }[],
        type: 'PowerAdded' | 'ClassPowerAdded'
      ): void => {
        if (powers.length === 0) return;
        newHistoryEntries.push({
          source: { type: 'manualEdit' },
          changes: powers.map((p) => ({ type, powerName: p.name })),
        });
      };

      pushAddStep('Edição Manual - Poderes Gerais Adicionados', addedPowers);
      pushRemoveStep('Edição Manual - Poderes Gerais Removidos', removedPowers);
      pushAddStep(
        'Edição Manual - Poderes de Classe Adicionados',
        addedClassPowers
      );
      pushRemoveStep(
        'Edição Manual - Poderes de Classe Removidos',
        removedClassPowers
      );
      pushAddStep(
        'Edição Manual - Poderes de Origem Adicionados',
        addedOriginPowers
      );
      pushRemoveStep(
        'Edição Manual - Poderes de Origem Removidos',
        removedOriginPowers
      );

      pushAddedHistory(addedPowers, 'PowerAdded');
      pushAddedHistory(addedClassPowers, 'ClassPowerAdded');
      pushAddedHistory(addedOriginPowers, 'PowerAdded');

      const originalCustomPowerIds = sheet.customPowers?.map((p) => p.id) || [];
      const newCustomPowerIds = selectedCustomPowers.map((p) => p.id);

      const addedCustomPowers = selectedCustomPowers.filter(
        (p) => !originalCustomPowerIds.includes(p.id)
      );
      const removedCustomPowers =
        sheet.customPowers?.filter((p) => !newCustomPowerIds.includes(p.id)) ||
        [];

      pushAddStep(
        'Edição Manual - Poderes Personalizados Adicionados',
        addedCustomPowers
      );
      pushRemoveStep(
        'Edição Manual - Poderes Personalizados Removidos',
        removedCustomPowers
      );
      pushAddedHistory(addedCustomPowers, 'PowerAdded');

      if (sheet.devoto) {
        const originalDeityPowerNames =
          sheet.devoto.poderes?.map((p) => p.name) || [];
        const newDeityPowerNames = selectedDeityPowers.map((p) => p.name);

        const addedDeityPowers = selectedDeityPowers.filter(
          (p) => !originalDeityPowerNames.includes(p.name)
        );
        const removedDeityPowers =
          sheet.devoto.poderes?.filter(
            (p) => !newDeityPowerNames.includes(p.name)
          ) || [];

        pushAddStep(
          'Edição Manual - Poderes Concedidos Adicionados',
          addedDeityPowers
        );
        pushRemoveStep(
          'Edição Manual - Poderes Concedidos Removidos',
          removedDeityPowers
        );
        pushAddedHistory(addedDeityPowers, 'PowerAdded');
      }

      // Ambição Herdada (Meio-Elfo): remover o poder concedido zera a escolha,
      // senão o recálculo o reconcederia.
      let shouldClearMeioElfoAmbicao = false;
      if (
        sheet.meioElfoAmbicaoPower &&
        sheet.meioElfoAmbicaoType &&
        sheet.meioElfoAmbicaoType !== 'cleared'
      ) {
        const ambicaoPowerName = sheet.meioElfoAmbicaoPower;
        if (sheet.meioElfoAmbicaoType === 'generalPower') {
          const wasInOriginal = sheet.generalPowers?.some(
            (p) => p.name === ambicaoPowerName
          );
          const isInNew = selectedPowers.some(
            (p) => p.name === ambicaoPowerName
          );
          if (wasInOriginal && !isInNew) shouldClearMeioElfoAmbicao = true;
        } else if (sheet.meioElfoAmbicaoType === 'originPower') {
          const wasInOriginal = sheet.origin?.powers?.some(
            (p) => p.name === ambicaoPowerName
          );
          const isInNew = selectedOriginPowers.some(
            (p) => p.name === ambicaoPowerName
          );
          if (wasInOriginal && !isInNew) shouldClearMeioElfoAmbicao = true;
        }
      }

      // Versátil (Humano): mesma lógica.
      let shouldClearHumanoVersatil = false;
      if (sheet.humanoVersatilChoice?.type === 'power') {
        const versatilPowerName = sheet.humanoVersatilChoice.value;
        const wasInOriginal = sheet.generalPowers?.some(
          (p) => p.name === versatilPowerName
        );
        const isInNew = selectedPowers.some(
          (p) => p.name === versatilPowerName
        );
        if (wasInOriginal && !isInNew) shouldClearHumanoVersatil = true;
      }

      // Treinador: aplicar os truques extras escolhidos no "Ensinar Truque".
      let updatedCompanions = sheet.companions;
      if (ensinarTruquePicks.length > 0 && sheet.companions?.length) {
        updatedCompanions = sheet.companions.map((companion, idx) => {
          const picksForThis = ensinarTruquePicks.filter(
            (p) => p.companionIndex === idx
          );
          if (picksForThis.length === 0) return companion;
          return {
            ...companion,
            tricks: [...companion.tricks, ...picksForThis.map((p) => p.trick)],
            spells: [
              ...(companion.spells || []),
              ...picksForThis
                .filter((p) => p.spell)
                .map((p) => ({ ...p.spell!, customKeyAttr: Atributo.CARISMA })),
            ],
          };
        });

        ensinarTruquePicks.forEach((pick) => {
          newHistoryEntries.push({
            source: {
              type: 'power',
              name: 'Ensinar Truque',
              className: 'Treinador',
            },
            powerName: 'Ensinar Truque',
            changes: [
              {
                type: 'CompanionTrickLearned',
                companionIndex: pick.companionIndex,
                trickName: pick.trick.name,
                choices: pick.trick.choices,
                spellName: pick.spell?.nome,
              },
            ],
          });
        });
      }

      const updatedSheet = {
        ...sheet,
        generalPowers: selectedPowers,
        classPowers: selectedClassPowers,
        customPowers: selectedCustomPowers,
        customGrantedPowers: selectedCustomGrantedPowers,
        companions: updatedCompanions,
        ...(shouldClearMeioElfoAmbicao
          ? {
              meioElfoAmbicaoType: 'cleared' as const,
              meioElfoAmbicaoPower: undefined,
            }
          : {}),
        ...(shouldClearHumanoVersatil
          ? { humanoVersatilChoice: { type: 'cleared' as const } }
          : {}),
        origin: sheet.origin
          ? { ...sheet.origin, powers: selectedOriginPowers }
          : undefined,
        devoto: sheet.devoto
          ? { ...sheet.devoto, poderes: selectedDeityPowers }
          : undefined,
        steps:
          newSteps.length > 0 ? [...sheet.steps, ...newSteps] : sheet.steps,
        sheetActionHistory: [
          ...(sheet.sheetActionHistory || []),
          ...newHistoryEntries,
        ],
      };

      // A ficha inteira, já recalculada — é o que o `Result` espera receber.
      onSave(recalculateSheet(updatedSheet, sheet, manualSelections));
      onClose();
    },
    [
      manualSelections,
      onClose,
      onSave,
      selectedClassPowers,
      selectedCustomGrantedPowers,
      selectedCustomPowers,
      selectedDeityPowers,
      selectedOriginPowers,
      selectedPowers,
      sheet,
    ]
  );

  const handleSave = useCallback(() => {
    // Treinador: "Ensinar Truque" recém-adicionado precisa escolher o truque
    // antes de fechar o save.
    const originalClassPowerNames = sheet.classPowers?.map((p) => p.name) || [];
    const ensinarTruqueAddedCount = selectedClassPowers.filter(
      (p) =>
        p.name === 'Ensinar Truque' && !originalClassPowerNames.includes(p.name)
    ).length;
    const totalEnsinarAdded = selectedClassPowers.filter(
      (p) => p.name === 'Ensinar Truque'
    ).length;
    const originalEnsinarCount = (sheet.classPowers || []).filter(
      (p) => p.name === 'Ensinar Truque'
    ).length;
    const pendingCount = Math.max(
      ensinarTruqueAddedCount,
      totalEnsinarAdded - originalEnsinarCount
    );

    if (pendingCount > 0 && sheet.companions && sheet.companions.length > 0) {
      setEnsinarTruqueDialog({ open: true, pendingCount });
      return;
    }
    commitSave([]);
  }, [commitSave, selectedClassPowers, sheet.classPowers, sheet.companions]);

  const handleCancel = useCallback(() => {
    setSelectedPowers(sheet.generalPowers ? [...sheet.generalPowers] : []);
    setSelectedClassPowers(sheet.classPowers ? [...sheet.classPowers] : []);
    setSelectedOriginPowers(
      sheet.origin?.powers ? [...sheet.origin.powers] : []
    );
    setSelectedCustomPowers(sheet.customPowers ? [...sheet.customPowers] : []);
    setSelectedDeityPowers(
      sheet.devoto?.poderes ? [...sheet.devoto.poderes] : []
    );
    setSelectedCustomGrantedPowers(
      sheet.customGrantedPowers ? [...sheet.customGrantedPowers] : []
    );
    setManualSelections({});
    onClose();
  }, [onClose, sheet]);

  const trainerLevel = getClassLevel(sheet, 'Treinador') || sheet.nivel;

  return {
    // seleção
    selectedPowers,
    selectedClassPowers,
    selectedOriginPowers,
    selectedCustomPowers,
    selectedDeityPowers,
    selectedCustomGrantedPowers,
    // catálogo
    powerCategories,
    classPowerSets,
    classAbilitySets,
    allSupplements,
    getOriginForPower,
    getAvailability,
    // poderes gerais / classe / origem
    handlePowerToggle,
    handleAddRepeatablePower,
    handlePowerRemove,
    handleClassPowerToggle,
    handleAddRepeatableClassPower,
    handleClassPowerRemove,
    handleOriginPowerToggle,
    // concedidos
    isDevoto,
    deityPowers,
    isDeityPowerSelected,
    isDeityPowerAvailable,
    handleDeityPowerToggle,
    handleDeityPowerRemove,
    // personalizados
    customPowerDialog,
    setCustomPowerDialog,
    handleSaveCustomPower,
    handleRemoveCustomPower,
    customGrantedPowerDialog,
    setCustomGrantedPowerDialog,
    handleSaveCustomGrantedPower,
    handleRemoveCustomGrantedPower,
    // diálogos
    selectionDialog,
    handleSelectionConfirm,
    handleSelectionCancel,
    golpePessoalDialog,
    handleGolpePessoalConfirm,
    closeGolpePessoalDialog,
    ensinarTruqueDialog,
    setEnsinarTruqueDialog,
    trainerLevel,
    // ações
    commitSave,
    handleSave,
    handleCancel,
  };
}
