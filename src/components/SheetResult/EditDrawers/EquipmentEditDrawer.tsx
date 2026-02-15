import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import CharacterSheet, { Step, SubStep } from '@/interfaces/CharacterSheet';
import Equipment, { DefenseEquipment } from '@/interfaces/Equipment';
import EQUIPAMENTOS, {
  calcDefense,
  isHeavyArmor,
} from '@/data/systems/tormenta20/equipamentos';
import Bag from '@/interfaces/Bag';
import { GENERAL_EQUIPMENT } from '@/data/systems/tormenta20/equipamentos-gerais';
import { recalculateSheet } from '@/functions/recalculateSheet';
import { v4 as uuid } from 'uuid';
import { DiceRoll } from '@/interfaces/DiceRoll';
import RollsEditDialog from '@/components/RollsEditDialog';
import { SupplementId, SUPPLEMENT_METADATA } from '@/types/supplement.types';
import { TORMENTA20_SYSTEM } from '@/data/systems/tormenta20';

// TODO: Melhorar isso
const SIMPLE_WEAPONS = [
  'PORRETE',
  'ZARABATANA',
  'BASTAO_LUDICO',
  'BESTA_DE_MAO',
  'VIROTES_BESTA_MAO',
];

const FIREARMS = [
  'TRAQUE',
  'ARCABUZ',
  'BACAMARTE',
  'GARRUCHA',
  'CANHAO_PORTATIL',
  'BOLA_DE_FERRO',
  'SIFAO_CAUSTICO',
];

const MARTIAL_WEAPONS = [
  'NEKO_TE',
  'GLADIO',
  'TETSUBO',
  'ADAGA_OPOSTA',
  'AGULHA_DE_AHLEN',
  'CINQUEDEA',
  'DIRK',
  'MARTELO_LEVE',
  'ESPADA_LARGA',
  'ESPADIM',
  'MACA_ESTRELA',
  'SERRILHEIRA',
  'BICO_DE_CORVO',
  'DESMONTADOR',
  'ESPADA_DE_EXECUCAO',
  'LANCA_DE_JUSTA',
  'MALHO',
  'MARTELO_LONGO',
  'TAN_KORAK',
  'TAI_TAI',
  'ARCO_MONTADO',
  'FLECHAS',
  'BESTA_DUPLA',
  'VIROTES',
];

interface EquipmentEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet>) => void;
}

interface SelectedEquipment {
  weapons: Equipment[];
  armors: DefenseEquipment[];
  shields: DefenseEquipment[];
  generalItems: Equipment[];
  esoteric: Equipment[];
  clothing: Equipment[];
  alchemy: Equipment[];
  food: Equipment[];
  animals: Equipment[];
}

interface EquipmentWithSupplement extends Equipment {
  supplementId?: SupplementId;
}

interface DefenseEquipmentWithSupplement extends DefenseEquipment {
  supplementId?: SupplementId;
}

const EquipmentEditDrawer: React.FC<EquipmentEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  // Use all available supplements for equipment editing (not just user's enabled ones)
  const allSupplements = Object.keys(
    TORMENTA20_SYSTEM.supplements
  ) as SupplementId[];

  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment>(
    {
      weapons: [],
      armors: [],
      shields: [],
      generalItems: [],
      esoteric: [],
      clothing: [],
      alchemy: [],
      food: [],
      animals: [],
    }
  );
  const [dinheiroStr, setDinheiroStr] = useState('0');
  const dinheiro = Number(dinheiroStr) || 0;
  const setDinheiro = useCallback(
    (value: number | ((prev: number) => number)) => {
      if (typeof value === 'function') {
        setDinheiroStr((prev) => String(value(Number(prev) || 0)));
      } else {
        setDinheiroStr(String(value));
      }
    },
    []
  );
  const [customMaxSpaces, setCustomMaxSpaces] = useState<number | null>(null);
  const [autoDescontarTibares, setAutoDescontarTibares] = useState(true);
  const [showAddWeapons, setShowAddWeapons] = useState(false);
  const [showAddArmor, setShowAddArmor] = useState(false);
  const [showAddShield, setShowAddShield] = useState(false);
  const [showAddGeneralItems, setShowAddGeneralItems] = useState(false);
  const [showAddEsoteric, setShowAddEsoteric] = useState(false);
  const [showAddClothing, setShowAddClothing] = useState(false);
  const [showAddAlchemy, setShowAddAlchemy] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddAnimals, setShowAddAnimals] = useState(false);

  // Estados para edição de arma
  const [editingWeapon, setEditingWeapon] = useState<Equipment | null>(null);
  const [editingWeaponIndex, setEditingWeaponIndex] = useState<number | null>(
    null
  );
  const [editNome, setEditNome] = useState<string>('');
  const [editAtkBonus, setEditAtkBonus] = useState<string>('');
  const [editDano, setEditDano] = useState<string>('');
  const [editMargemAmeaca, setEditMargemAmeaca] = useState<string>('20');
  const [editMultCritico, setEditMultCritico] = useState<string>('2');
  const [editWeaponSpaces, setEditWeaponSpaces] = useState<string>('1');

  // Estados para item customizado
  const [showCustomItemDialog, setShowCustomItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [customItemNome, setCustomItemNome] = useState('');
  const [customItemSpaces, setCustomItemSpaces] = useState('0');
  const [customItemRolls, setCustomItemRolls] = useState<DiceRoll[]>([]);
  const [showItemRollsDialog, setShowItemRollsDialog] = useState(false);
  const [itemNomeError, setItemNomeError] = useState('');
  const [itemSpacesError, setItemSpacesError] = useState('');

  // Estados para edição de armadura
  const [editingArmor, setEditingArmor] = useState<DefenseEquipment | null>(
    null
  );
  const [editingArmorIndex, setEditingArmorIndex] = useState<number | null>(
    null
  );
  const [editArmorNome, setEditArmorNome] = useState<string>('');
  const [editArmorDefenseBonus, setEditArmorDefenseBonus] =
    useState<string>('0');
  const [editArmorPenalty, setEditArmorPenalty] = useState<string>('0');
  const [editArmorRolls, setEditArmorRolls] = useState<DiceRoll[]>([]);
  const [editArmorSpaces, setEditArmorSpaces] = useState<string>('0');
  const [editArmorIsHeavy, setEditArmorIsHeavy] = useState<boolean>(false);
  const [showArmorRollsDialog, setShowArmorRollsDialog] = useState(false);

  // Estados para edição de escudo
  const [editingShield, setEditingShield] = useState<DefenseEquipment | null>(
    null
  );
  const [editingShieldIndex, setEditingShieldIndex] = useState<number | null>(
    null
  );
  const [editShieldNome, setEditShieldNome] = useState<string>('');
  const [editShieldDefenseBonus, setEditShieldDefenseBonus] =
    useState<string>('0');
  const [editShieldPenalty, setEditShieldPenalty] = useState<string>('0');
  const [editShieldRolls, setEditShieldRolls] = useState<DiceRoll[]>([]);
  const [editShieldSpaces, setEditShieldSpaces] = useState<string>('0');
  const [showShieldRollsDialog, setShowShieldRollsDialog] = useState(false);

  // Estados para edição de vestuário
  const [editingClothing, setEditingClothing] = useState<Equipment | null>(
    null
  );
  const [editingClothingIndex, setEditingClothingIndex] = useState<
    number | null
  >(null);
  const [editClothingNome, setEditClothingNome] = useState<string>('');
  const [editClothingRolls, setEditClothingRolls] = useState<DiceRoll[]>([]);
  const [editClothingSpaces, setEditClothingSpaces] = useState<string>('0');
  const [showClothingRollsDialog, setShowClothingRollsDialog] = useState(false);

  // Estados para edição de alquimia
  const [editingAlchemy, setEditingAlchemy] = useState<Equipment | null>(null);
  const [editingAlchemyIndex, setEditingAlchemyIndex] = useState<number | null>(
    null
  );
  const [editAlchemyNome, setEditAlchemyNome] = useState<string>('');
  const [editAlchemyRolls, setEditAlchemyRolls] = useState<DiceRoll[]>([]);
  const [editAlchemySpaces, setEditAlchemySpaces] = useState<string>('0');
  const [showAlchemyRollsDialog, setShowAlchemyRollsDialog] = useState(false);

  // Estados para edição de alimentação
  const [editingFood, setEditingFood] = useState<Equipment | null>(null);
  const [editingFoodIndex, setEditingFoodIndex] = useState<number | null>(null);
  const [editFoodNome, setEditFoodNome] = useState<string>('');
  const [editFoodRolls, setEditFoodRolls] = useState<DiceRoll[]>([]);
  const [editFoodSpaces, setEditFoodSpaces] = useState<string>('0');
  const [showFoodRollsDialog, setShowFoodRollsDialog] = useState(false);

  // Categorize supplement weapons by type
  const getCategorizedWeapons = useMemo(() => {
    const categorized = {
      simple: [] as EquipmentWithSupplement[],
      martial: [] as EquipmentWithSupplement[],
      exotic: [] as EquipmentWithSupplement[],
      firearms: [] as EquipmentWithSupplement[],
    };

    allSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.equipment?.weapons) {
        Object.entries(supplement.equipment.weapons).forEach(
          ([key, weapon]) => {
            const weaponWithSupplement = { ...weapon, supplementId };

            // Categorize based on weapon key and properties
            // Simple weapons
            if (SIMPLE_WEAPONS.includes(key)) {
              categorized.simple.push(weaponWithSupplement);
            }
            // Firearms (must check before martial to avoid misclassification)
            else if (FIREARMS.includes(key)) {
              categorized.firearms.push(weaponWithSupplement);
            }
            // Martial weapons
            else if (MARTIAL_WEAPONS.includes(key)) {
              categorized.martial.push(weaponWithSupplement);
            }
            // Everything else is exotic
            else {
              categorized.exotic.push(weaponWithSupplement);
            }
          }
        );
      }
    });

    // Sort each category alphabetically by name
    categorized.simple.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    categorized.martial.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    categorized.exotic.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    categorized.firearms.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    return categorized;
  }, [allSupplements]);

  // Categorize supplement armors and shields
  const getCategorizedArmors = useMemo(() => {
    const categorized = {
      light: [] as DefenseEquipmentWithSupplement[],
      heavy: [] as DefenseEquipmentWithSupplement[],
      shields: [] as DefenseEquipmentWithSupplement[],
    };

    allSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.equipment?.armors) {
        Object.entries(supplement.equipment.armors).forEach(([, armor]) => {
          const armorWithSupplement = { ...armor, supplementId };

          if (armor.group === 'Escudo') {
            categorized.shields.push(armorWithSupplement);
          } else if (armor.group === 'Armadura') {
            // Light armor: defense bonus <= 4
            if (armor.defenseBonus <= 4) {
              categorized.light.push(armorWithSupplement);
            }
            // Heavy armor: defense bonus > 4
            else {
              categorized.heavy.push(armorWithSupplement);
            }
          }
        });
      }
    });

    return categorized;
  }, [allSupplements]);

  // Get supplement general items
  const getSupplementGeneralItems = useMemo(() => {
    const items: EquipmentWithSupplement[] = [];

    allSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.equipment?.generalItems) {
        supplement.equipment.generalItems.forEach((item) => {
          items.push({ ...item, supplementId });
        });
      }
    });

    return items;
  }, [allSupplements]);

  // Get supplement esoteric items
  const getSupplementEsoteric = useMemo(() => {
    const items: EquipmentWithSupplement[] = [];

    allSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.equipment?.esoteric) {
        supplement.equipment.esoteric.forEach((item) => {
          items.push({ ...item, supplementId });
        });
      }
    });

    return items;
  }, [allSupplements]);

  // Get supplement clothing
  const getSupplementClothing = useMemo(() => {
    const items: EquipmentWithSupplement[] = [];

    allSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.equipment?.clothing) {
        supplement.equipment.clothing.forEach((item) => {
          items.push({ ...item, supplementId });
        });
      }
    });

    return items;
  }, [allSupplements]);

  // Get supplement alchemy items categorized
  const getCategorizedAlchemy = useMemo(() => {
    const categorized = {
      prepared: [] as EquipmentWithSupplement[],
      catalysts: [] as EquipmentWithSupplement[],
      poisons: [] as EquipmentWithSupplement[],
    };

    allSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.equipment?.alchemy) {
        supplement.equipment.alchemy.forEach((item) => {
          const itemWithSupplement = { ...item, supplementId };
          // Categorize based on item name keywords
          if (
            item.nome.includes('Corrosivo') ||
            item.nome.includes('Gelo') ||
            item.nome.includes('Pedaço') ||
            item.nome.includes('Raio')
          ) {
            categorized.catalysts.push(itemWithSupplement);
          } else if (
            item.nome.includes('Esporos') ||
            item.nome.includes('Peçonha') ||
            item.nome.includes('Veneno')
          ) {
            categorized.poisons.push(itemWithSupplement);
          } else {
            categorized.prepared.push(itemWithSupplement);
          }
        });
      }
    });

    return categorized;
  }, [allSupplements]);

  // Get supplement food
  const getSupplementFood = useMemo(() => {
    const items: EquipmentWithSupplement[] = [];

    allSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.equipment?.food) {
        supplement.equipment.food.forEach((item) => {
          items.push({ ...item, supplementId });
        });
      }
    });

    return items;
  }, [allSupplements]);

  // Get supplement animals
  const getSupplementAnimals = useMemo(() => {
    const items: EquipmentWithSupplement[] = [];

    allSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.equipment?.animals) {
        supplement.equipment.animals.forEach((item) => {
          items.push({ ...item, supplementId });
        });
      }
    });

    return items;
  }, [allSupplements]);

  // Refs for accordion auto-scroll
  const weaponsAccordionRef = useRef<HTMLDivElement>(null);
  const armorAccordionRef = useRef<HTMLDivElement>(null);
  const shieldAccordionRef = useRef<HTMLDivElement>(null);
  const generalItemsAccordionRef = useRef<HTMLDivElement>(null);
  const esotericAccordionRef = useRef<HTMLDivElement>(null);
  const clothingAccordionRef = useRef<HTMLDivElement>(null);
  const alchemyAccordionRef = useRef<HTMLDivElement>(null);
  const foodAccordionRef = useRef<HTMLDivElement>(null);
  const animalsAccordionRef = useRef<HTMLDivElement>(null);

  const canAfford = (item: Equipment | DefenseEquipment): boolean => {
    if (!autoDescontarTibares) return true;
    return (item.preco || 0) <= dinheiro;
  };

  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  const markRecentAction = (item: Equipment | DefenseEquipment) => {
    const key = `${item.nome}-${item.group}`;
    setRecentlyAdded((prev) => new Set(prev).add(key));
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 1500);
  };

  const renderAddButton = (
    item: Equipment | DefenseEquipment,
    onClick: () => void
  ) => {
    const key = `${item.nome}-${item.group}`;
    const wasAdded = recentlyAdded.has(key);

    if (wasAdded) {
      return (
        <IconButton size='small' color='success' disabled>
          <CheckIcon />
        </IconButton>
      );
    }

    return (
      <IconButton
        size='small'
        color='primary'
        onClick={onClick}
        disabled={!canAfford(item)}
      >
        <AddCircleOutlineIcon />
      </IconButton>
    );
  };

  useEffect(() => {
    if (sheet.bag && open) {
      const bagEquipments = sheet.bag.getEquipments();

      setSelectedEquipment({
        weapons: bagEquipments.Arma || [],
        armors: bagEquipments.Armadura || [],
        shields: bagEquipments.Escudo || [],
        generalItems: bagEquipments['Item Geral'] || [],
        esoteric: bagEquipments.Esotérico || [],
        clothing: bagEquipments.Vestuário || [],
        alchemy: bagEquipments.Alquimía || [],
        food: bagEquipments.Alimentação || [],
        animals: bagEquipments.Animal || [],
      });

      setDinheiro(sheet.dinheiro || 0);
      setCustomMaxSpaces(sheet.customMaxSpaces ?? null);
      setAutoDescontarTibares(true);
    }
  }, [sheet.bag, sheet.dinheiro, sheet.customMaxSpaces, open]);

  // Function to scroll to accordion when it opens
  const scrollToAccordion = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }, 100); // Small delay to allow accordion to fully expand
  };

  // Function to close all other accordions (auto-collapse)
  const closeOtherAccordions = (except: string) => {
    if (except !== 'weapons') setShowAddWeapons(false);
    if (except !== 'armor') setShowAddArmor(false);
    if (except !== 'shield') setShowAddShield(false);
    if (except !== 'generalItems') setShowAddGeneralItems(false);
    if (except !== 'esoteric') setShowAddEsoteric(false);
    if (except !== 'clothing') setShowAddClothing(false);
    if (except !== 'alchemy') setShowAddAlchemy(false);
    if (except !== 'food') setShowAddFood(false);
    if (except !== 'animals') setShowAddAnimals(false);
  };

  // Enhanced toggle functions with auto-collapse and scroll
  const handleToggleWeapons = () => {
    const newState = !showAddWeapons;
    if (newState) {
      closeOtherAccordions('weapons');
      setShowAddWeapons(true);
      scrollToAccordion(weaponsAccordionRef);
    } else {
      setShowAddWeapons(false);
    }
  };

  const handleToggleArmor = () => {
    const newState = !showAddArmor;
    if (newState) {
      closeOtherAccordions('armor');
      setShowAddArmor(true);
      scrollToAccordion(armorAccordionRef);
    } else {
      setShowAddArmor(false);
    }
  };

  const handleToggleShield = () => {
    const newState = !showAddShield;
    if (newState) {
      closeOtherAccordions('shield');
      setShowAddShield(true);
      scrollToAccordion(shieldAccordionRef);
    } else {
      setShowAddShield(false);
    }
  };

  const handleToggleGeneralItems = () => {
    const newState = !showAddGeneralItems;
    if (newState) {
      closeOtherAccordions('generalItems');
      setShowAddGeneralItems(true);
      scrollToAccordion(generalItemsAccordionRef);
    } else {
      setShowAddGeneralItems(false);
    }
  };

  const handleToggleEsoteric = () => {
    const newState = !showAddEsoteric;
    if (newState) {
      closeOtherAccordions('esoteric');
      setShowAddEsoteric(true);
      scrollToAccordion(esotericAccordionRef);
    } else {
      setShowAddEsoteric(false);
    }
  };

  const handleToggleClothing = () => {
    const newState = !showAddClothing;
    if (newState) {
      closeOtherAccordions('clothing');
      setShowAddClothing(true);
      scrollToAccordion(clothingAccordionRef);
    } else {
      setShowAddClothing(false);
    }
  };

  const handleToggleAlchemy = () => {
    const newState = !showAddAlchemy;
    if (newState) {
      closeOtherAccordions('alchemy');
      setShowAddAlchemy(true);
      scrollToAccordion(alchemyAccordionRef);
    } else {
      setShowAddAlchemy(false);
    }
  };

  const handleToggleFood = () => {
    const newState = !showAddFood;
    if (newState) {
      closeOtherAccordions('food');
      setShowAddFood(true);
      scrollToAccordion(foodAccordionRef);
    } else {
      setShowAddFood(false);
    }
  };

  const handleToggleAnimals = () => {
    const newState = !showAddAnimals;
    if (newState) {
      closeOtherAccordions('animals');
      setShowAddAnimals(true);
      scrollToAccordion(animalsAccordionRef);
    } else {
      setShowAddAnimals(false);
    }
  };

  const handleWeaponToggle = (weapon: Equipment) => {
    const price = weapon.preco || 0;
    if (autoDescontarTibares && price > dinheiro) return;

    // Sempre adiciona a arma (permite múltiplas armas com mesmo nome)
    // Store base values when weapon is first added
    const weaponWithBase: Equipment = {
      ...weapon,
      baseDano: weapon.dano,
      baseAtkBonus: weapon.atkBonus ?? 0,
      baseCritico: weapon.critico,
      hasManualEdits: false, // Initially not manually edited
    };

    setSelectedEquipment((prev) => ({
      ...prev,
      weapons: [...prev.weapons, weaponWithBase],
    }));

    if (autoDescontarTibares && price > 0) {
      setDinheiro((prev) => prev - price);
    }
    markRecentAction(weapon);
  };

  const handleRemoveWeapon = (index: number) => {
    if (autoDescontarTibares) {
      const weapon = selectedEquipment.weapons[index];
      const price = weapon?.preco || 0;
      if (price > 0) setDinheiro((d) => d + price);
    }
    setSelectedEquipment((prev) => ({
      ...prev,
      weapons: prev.weapons.filter((_, i) => i !== index),
    }));
  };

  const handleOpenEditWeapon = (weapon: Equipment, index: number) => {
    setEditingWeapon(weapon);
    setEditingWeaponIndex(index);
    setEditNome(weapon.nome);
    setEditAtkBonus(weapon.atkBonus?.toString() || '0');
    setEditDano(weapon.dano || '');
    setEditWeaponSpaces(weapon.spaces?.toString() || '1');

    // Parse critico into margem and multiplicador
    // Formats: "19" (margem only), "x3" (mult only), "19/x3" (both)
    const critico = weapon.critico || '20/x2';
    if (critico.includes('/')) {
      const parts = critico.split('/');
      setEditMargemAmeaca(parts[0]);
      setEditMultCritico(parts[1].replace('x', ''));
    } else if (critico.startsWith('x')) {
      setEditMargemAmeaca('20');
      setEditMultCritico(critico.replace('x', ''));
    } else {
      setEditMargemAmeaca(critico);
      setEditMultCritico('2');
    }
  };

  const handleCloseEditWeapon = () => {
    setEditingWeapon(null);
    setEditingWeaponIndex(null);
    setEditNome('');
    setEditAtkBonus('');
    setEditDano('');
    setEditMargemAmeaca('20');
    setEditMultCritico('2');
    setEditWeaponSpaces('1');
  };

  const handleSaveEditWeapon = () => {
    if (!editingWeapon || editingWeaponIndex === null) return;

    // Store base values if not already stored (for backward compatibility)
    const baseDano = editingWeapon.baseDano ?? editingWeapon.dano;
    const baseAtkBonus =
      editingWeapon.baseAtkBonus ?? editingWeapon.atkBonus ?? 0;
    const baseCritico = editingWeapon.baseCritico ?? editingWeapon.critico;

    // Combine margem and multiplicador into critico format
    const critico = `${editMargemAmeaca}/x${editMultCritico}`;

    const updatedWeapon: Equipment = {
      ...editingWeapon,
      nome: editNome,
      atkBonus: editAtkBonus ? parseInt(editAtkBonus, 10) : 0,
      dano: editDano,
      critico,
      spaces: parseFloat(editWeaponSpaces) || 1,
      // Store base values for future resets
      baseDano,
      baseAtkBonus,
      baseCritico,
      // Mark as manually edited so recalculateSheet preserves these changes
      hasManualEdits: true,
    };

    setSelectedEquipment((prev) => ({
      ...prev,
      weapons: prev.weapons.map((w, i) =>
        i === editingWeaponIndex ? updatedWeapon : w
      ),
    }));

    handleCloseEditWeapon();
  };

  // Handlers para item customizado
  const resetCustomItemForm = () => {
    setCustomItemNome('');
    setCustomItemSpaces('0');
    setCustomItemRolls([]);
    setItemNomeError('');
    setItemSpacesError('');
  };

  const handleOpenCustomItemDialog = () => {
    setShowCustomItemDialog(true);
    setEditingItem(null);
    setEditingItemIndex(null);
    resetCustomItemForm();
  };

  const handleOpenEditItem = (item: Equipment, index: number) => {
    setEditingItem(item);
    setEditingItemIndex(index);
    setCustomItemNome(item.nome);
    setCustomItemSpaces(item.spaces?.toString() || '0');
    setCustomItemRolls(item.rolls || []);
    setShowCustomItemDialog(true);
  };

  const handleCloseCustomItemDialog = () => {
    setShowCustomItemDialog(false);
    setEditingItem(null);
    setEditingItemIndex(null);
    resetCustomItemForm();
  };

  const validateCustomItemForm = (): boolean => {
    let isValid = true;

    if (customItemNome.trim().length < 2) {
      setItemNomeError('Nome deve ter pelo menos 2 caracteres');
      isValid = false;
    } else {
      setItemNomeError('');
    }

    const spaces = parseFloat(customItemSpaces);
    if (Number.isNaN(spaces) || spaces < 0) {
      setItemSpacesError('Espaços deve ser um número maior ou igual a 0');
      isValid = false;
    } else {
      setItemSpacesError('');
    }

    return isValid;
  };

  const handleSaveCustomItem = () => {
    if (!validateCustomItemForm()) return;

    const customItem: Equipment = {
      id: editingItem?.id || uuid(), // Manter id existente ou gerar novo
      nome: customItemNome.trim(),
      spaces: parseFloat(customItemSpaces),
      group: 'Item Geral',
      rolls: customItemRolls.length > 0 ? customItemRolls : undefined,
      isCustom: true,
    };

    if (editingItem && editingItemIndex !== null) {
      // Editando item existente
      setSelectedEquipment((prev) => ({
        ...prev,
        generalItems: prev.generalItems.map((item, i) =>
          i === editingItemIndex ? customItem : item
        ),
      }));
    } else {
      // Adicionando novo item
      setSelectedEquipment((prev) => ({
        ...prev,
        generalItems: [...prev.generalItems, customItem],
      }));
    }

    handleCloseCustomItemDialog();
  };

  const handleArmorToggle = (armor: DefenseEquipment) => {
    const isCurrentlySelected = selectedEquipment.armors.some(
      (a) => a.nome === armor.nome
    );
    const price = armor.preco || 0;

    if (isCurrentlySelected) {
      // Remove the armor
      setSelectedEquipment((prev) => ({
        ...prev,
        armors: prev.armors.filter((a) => a.nome !== armor.nome),
      }));
      if (autoDescontarTibares && price > 0) {
        setDinheiro((d) => d + price);
      }
    } else {
      // Replacing: refund old armor first
      const oldArmor = selectedEquipment.armors[0];
      const oldPrice = oldArmor?.preco || 0;
      const netCost = price - oldPrice;

      if (autoDescontarTibares && netCost > dinheiro) return;

      // Store base values when armor is first added
      const armorWithBase: DefenseEquipment = {
        ...armor,
        baseDefenseBonus: armor.defenseBonus,
        baseArmorPenalty: armor.armorPenalty,
        hasManualEdits: false, // Initially not manually edited
      };

      // Replace with new armor (only one allowed)
      setSelectedEquipment((prev) => ({
        ...prev,
        armors: [armorWithBase],
      }));

      if (autoDescontarTibares && netCost !== 0) {
        setDinheiro((d) => d - netCost);
      }
    }
  };

  const handleRemoveArmor = (armor: DefenseEquipment) => {
    if (autoDescontarTibares) {
      const price = armor.preco || 0;
      if (price > 0) setDinheiro((d) => d + price);
    }
    setSelectedEquipment((prev) => ({
      ...prev,
      armors: prev.armors.filter((a) => a.nome !== armor.nome),
    }));
  };

  // Handlers para edição de armadura
  const handleOpenEditArmor = (armor: DefenseEquipment, index: number) => {
    setEditingArmor(armor);
    setEditingArmorIndex(index);
    setEditArmorNome(armor.nome);
    setEditArmorDefenseBonus(armor.defenseBonus?.toString() || '0');
    setEditArmorPenalty(armor.armorPenalty?.toString() || '0');
    setEditArmorRolls(armor.rolls || []);
    setEditArmorSpaces(armor.spaces?.toString() || '0');
    setEditArmorIsHeavy(isHeavyArmor(armor));
  };

  const handleCloseEditArmor = () => {
    setEditingArmor(null);
    setEditingArmorIndex(null);
    setEditArmorNome('');
    setEditArmorDefenseBonus('0');
    setEditArmorPenalty('0');
    setEditArmorRolls([]);
    setEditArmorSpaces('0');
    setEditArmorIsHeavy(false);
  };

  const handleSaveEditArmor = () => {
    if (!editingArmor || editingArmorIndex === null) return;

    // Store base values if not already stored (for backward compatibility)
    const baseDefenseBonus =
      editingArmor.baseDefenseBonus ?? editingArmor.defenseBonus;
    const baseArmorPenalty =
      editingArmor.baseArmorPenalty ?? editingArmor.armorPenalty;

    const updatedArmor: DefenseEquipment = {
      ...editingArmor,
      nome: editArmorNome,
      defenseBonus: parseInt(editArmorDefenseBonus, 10) || 0,
      armorPenalty: parseInt(editArmorPenalty, 10) || 0,
      spaces: parseFloat(editArmorSpaces) || 0,
      rolls: editArmorRolls.length > 0 ? editArmorRolls : undefined,
      // Store base values for future resets
      baseDefenseBonus,
      baseArmorPenalty,
      // Mark as manually edited so recalculateSheet preserves these changes
      hasManualEdits: true,
      // Heavy armor flag for defense calculation
      isHeavyArmor: editArmorIsHeavy,
    };

    setSelectedEquipment((prev) => ({
      ...prev,
      armors: prev.armors.map((a, i) =>
        i === editingArmorIndex ? updatedArmor : a
      ),
    }));

    handleCloseEditArmor();
  };

  const handleShieldToggle = (shield: DefenseEquipment) => {
    const isCurrentlySelected = selectedEquipment.shields.some(
      (s) => s.nome === shield.nome
    );
    const price = shield.preco || 0;

    if (isCurrentlySelected) {
      // Remove the shield
      setSelectedEquipment((prev) => ({
        ...prev,
        shields: prev.shields.filter((s) => s.nome !== shield.nome),
      }));
      if (autoDescontarTibares && price > 0) {
        setDinheiro((d) => d + price);
      }
    } else {
      // Replacing: refund old shield first
      const oldShield = selectedEquipment.shields[0];
      const oldPrice = oldShield?.preco || 0;
      const netCost = price - oldPrice;

      if (autoDescontarTibares && netCost > dinheiro) return;

      // Store base values when shield is first added
      const shieldWithBase: DefenseEquipment = {
        ...shield,
        baseDefenseBonus: shield.defenseBonus,
        baseArmorPenalty: shield.armorPenalty,
        hasManualEdits: false, // Initially not manually edited
      };

      // Replace with new shield (only one allowed)
      setSelectedEquipment((prev) => ({
        ...prev,
        shields: [shieldWithBase],
      }));

      if (autoDescontarTibares && netCost !== 0) {
        setDinheiro((d) => d - netCost);
      }
    }
  };

  const handleRemoveShield = (shield: DefenseEquipment) => {
    if (autoDescontarTibares) {
      const price = shield.preco || 0;
      if (price > 0) setDinheiro((d) => d + price);
    }
    setSelectedEquipment((prev) => ({
      ...prev,
      shields: prev.shields.filter((s) => s.nome !== shield.nome),
    }));
  };

  // Handlers para edição de escudo
  const handleOpenEditShield = (shield: DefenseEquipment, index: number) => {
    setEditingShield(shield);
    setEditingShieldIndex(index);
    setEditShieldNome(shield.nome);
    setEditShieldDefenseBonus(shield.defenseBonus?.toString() || '0');
    setEditShieldPenalty(shield.armorPenalty?.toString() || '0');
    setEditShieldRolls(shield.rolls || []);
    setEditShieldSpaces(shield.spaces?.toString() || '0');
  };

  const handleCloseEditShield = () => {
    setEditingShield(null);
    setEditingShieldIndex(null);
    setEditShieldNome('');
    setEditShieldDefenseBonus('0');
    setEditShieldPenalty('0');
    setEditShieldRolls([]);
    setEditShieldSpaces('0');
  };

  const handleSaveEditShield = () => {
    if (!editingShield || editingShieldIndex === null) return;

    // Store base values if not already stored (for backward compatibility)
    const baseDefenseBonus =
      editingShield.baseDefenseBonus ?? editingShield.defenseBonus;
    const baseArmorPenalty =
      editingShield.baseArmorPenalty ?? editingShield.armorPenalty;

    const updatedShield: DefenseEquipment = {
      ...editingShield,
      nome: editShieldNome,
      defenseBonus: parseInt(editShieldDefenseBonus, 10) || 0,
      armorPenalty: parseInt(editShieldPenalty, 10) || 0,
      spaces: parseFloat(editShieldSpaces) || 0,
      rolls: editShieldRolls.length > 0 ? editShieldRolls : undefined,
      // Store base values for future resets
      baseDefenseBonus,
      baseArmorPenalty,
      // Mark as manually edited so recalculateSheet preserves these changes
      hasManualEdits: true,
    };

    setSelectedEquipment((prev) => ({
      ...prev,
      shields: prev.shields.map((s, i) =>
        i === editingShieldIndex ? updatedShield : s
      ),
    }));

    handleCloseEditShield();
  };

  // Handlers for General Items
  const handleAddGeneralItem = (item: Equipment) => {
    const price = item.preco || 0;
    if (autoDescontarTibares && price > dinheiro) return;

    setSelectedEquipment((prev) => ({
      ...prev,
      generalItems: [...prev.generalItems, item],
    }));

    if (autoDescontarTibares && price > 0) {
      setDinheiro((prev) => prev - price);
    }
    markRecentAction(item);
  };

  const handleRemoveGeneralItem = (item: Equipment) => {
    if (autoDescontarTibares) {
      const price = item.preco || 0;
      if (price > 0) setDinheiro((d) => d + price);
    }
    setSelectedEquipment((prev) => ({
      ...prev,
      generalItems: prev.generalItems.filter((i) => i.nome !== item.nome),
    }));
  };

  // Handlers for Esoteric
  const handleAddEsoteric = (item: Equipment) => {
    const price = item.preco || 0;
    if (autoDescontarTibares && price > dinheiro) return;

    setSelectedEquipment((prev) => ({
      ...prev,
      esoteric: [...prev.esoteric, item],
    }));

    if (autoDescontarTibares && price > 0) {
      setDinheiro((prev) => prev - price);
    }
    markRecentAction(item);
  };

  const handleRemoveEsoteric = (item: Equipment) => {
    if (autoDescontarTibares) {
      const price = item.preco || 0;
      if (price > 0) setDinheiro((d) => d + price);
    }
    setSelectedEquipment((prev) => ({
      ...prev,
      esoteric: prev.esoteric.filter((i) => i.nome !== item.nome),
    }));
  };

  // Handlers for Clothing
  const handleAddClothing = (item: Equipment) => {
    const price = item.preco || 0;
    if (autoDescontarTibares && price > dinheiro) return;

    setSelectedEquipment((prev) => ({
      ...prev,
      clothing: [...prev.clothing, item],
    }));

    if (autoDescontarTibares && price > 0) {
      setDinheiro((prev) => prev - price);
    }
    markRecentAction(item);
  };

  const handleRemoveClothing = (item: Equipment) => {
    if (autoDescontarTibares) {
      const price = item.preco || 0;
      if (price > 0) setDinheiro((d) => d + price);
    }
    setSelectedEquipment((prev) => ({
      ...prev,
      clothing: prev.clothing.filter((i) => i.nome !== item.nome),
    }));
  };

  // Handlers for Alchemy
  const handleAddAlchemy = (item: Equipment) => {
    const price = item.preco || 0;
    if (autoDescontarTibares && price > dinheiro) return;

    setSelectedEquipment((prev) => ({
      ...prev,
      alchemy: [...prev.alchemy, item],
    }));

    if (autoDescontarTibares && price > 0) {
      setDinheiro((prev) => prev - price);
    }
    markRecentAction(item);
  };

  const handleRemoveAlchemy = (item: Equipment) => {
    if (autoDescontarTibares) {
      const price = item.preco || 0;
      if (price > 0) setDinheiro((d) => d + price);
    }
    setSelectedEquipment((prev) => ({
      ...prev,
      alchemy: prev.alchemy.filter((i) => i.nome !== item.nome),
    }));
  };

  // Handlers for Food
  const handleAddFood = (item: Equipment) => {
    const price = item.preco || 0;
    if (autoDescontarTibares && price > dinheiro) return;

    setSelectedEquipment((prev) => ({
      ...prev,
      food: [...prev.food, item],
    }));

    if (autoDescontarTibares && price > 0) {
      setDinheiro((prev) => prev - price);
    }
    markRecentAction(item);
  };

  const handleRemoveFood = (item: Equipment) => {
    if (autoDescontarTibares) {
      const price = item.preco || 0;
      if (price > 0) setDinheiro((d) => d + price);
    }
    setSelectedEquipment((prev) => ({
      ...prev,
      food: prev.food.filter((i) => i.nome !== item.nome),
    }));
  };

  // Handlers for Animals
  const handleAddAnimals = (item: Equipment) => {
    const price = item.preco || 0;
    if (autoDescontarTibares && price > dinheiro) return;

    setSelectedEquipment((prev) => ({
      ...prev,
      animals: [...prev.animals, item],
    }));

    if (autoDescontarTibares && price > 0) {
      setDinheiro((prev) => prev - price);
    }
    markRecentAction(item);
  };

  const handleRemoveAnimals = (item: Equipment) => {
    if (autoDescontarTibares) {
      const price = item.preco || 0;
      if (price > 0) setDinheiro((d) => d + price);
    }
    setSelectedEquipment((prev) => ({
      ...prev,
      animals: prev.animals.filter((i) => i.nome !== item.nome),
    }));
  };

  // Handlers para edição de vestuário
  const handleOpenEditClothing = (item: Equipment, index: number) => {
    setEditingClothing(item);
    setEditingClothingIndex(index);
    setEditClothingNome(item.nome);
    setEditClothingRolls(item.rolls || []);
    setEditClothingSpaces(item.spaces?.toString() || '0');
  };

  const handleCloseEditClothing = () => {
    setEditingClothing(null);
    setEditingClothingIndex(null);
    setEditClothingNome('');
    setEditClothingRolls([]);
    setEditClothingSpaces('0');
  };

  const handleSaveEditClothing = () => {
    if (!editingClothing || editingClothingIndex === null) return;

    const updatedItem: Equipment = {
      ...editingClothing,
      nome: editClothingNome,
      spaces: parseFloat(editClothingSpaces) || 0,
      rolls: editClothingRolls.length > 0 ? editClothingRolls : undefined,
      hasManualEdits: true,
    };

    setSelectedEquipment((prev) => ({
      ...prev,
      clothing: prev.clothing.map((item, i) =>
        i === editingClothingIndex ? updatedItem : item
      ),
    }));

    handleCloseEditClothing();
  };

  // Handlers para edição de alquimia
  const handleOpenEditAlchemy = (item: Equipment, index: number) => {
    setEditingAlchemy(item);
    setEditingAlchemyIndex(index);
    setEditAlchemyNome(item.nome);
    setEditAlchemyRolls(item.rolls || []);
    setEditAlchemySpaces(item.spaces?.toString() || '0');
  };

  const handleCloseEditAlchemy = () => {
    setEditingAlchemy(null);
    setEditingAlchemyIndex(null);
    setEditAlchemyNome('');
    setEditAlchemyRolls([]);
    setEditAlchemySpaces('0');
  };

  const handleSaveEditAlchemy = () => {
    if (!editingAlchemy || editingAlchemyIndex === null) return;

    const updatedItem: Equipment = {
      ...editingAlchemy,
      nome: editAlchemyNome,
      spaces: parseFloat(editAlchemySpaces) || 0,
      rolls: editAlchemyRolls.length > 0 ? editAlchemyRolls : undefined,
      hasManualEdits: true,
    };

    setSelectedEquipment((prev) => ({
      ...prev,
      alchemy: prev.alchemy.map((item, i) =>
        i === editingAlchemyIndex ? updatedItem : item
      ),
    }));

    handleCloseEditAlchemy();
  };

  // Handlers para edição de alimentação
  const handleOpenEditFood = (item: Equipment, index: number) => {
    setEditingFood(item);
    setEditingFoodIndex(index);
    setEditFoodNome(item.nome);
    setEditFoodRolls(item.rolls || []);
    setEditFoodSpaces(item.spaces?.toString() || '0');
  };

  const handleCloseEditFood = () => {
    setEditingFood(null);
    setEditingFoodIndex(null);
    setEditFoodNome('');
    setEditFoodRolls([]);
    setEditFoodSpaces('0');
  };

  const handleSaveEditFood = () => {
    if (!editingFood || editingFoodIndex === null) return;

    const updatedItem: Equipment = {
      ...editingFood,
      nome: editFoodNome,
      spaces: parseFloat(editFoodSpaces) || 0,
      rolls: editFoodRolls.length > 0 ? editFoodRolls : undefined,
      hasManualEdits: true,
    };

    setSelectedEquipment((prev) => ({
      ...prev,
      food: prev.food.map((item, i) =>
        i === editingFoodIndex ? updatedItem : item
      ),
    }));

    handleCloseEditFood();
  };

  const handleSave = () => {
    if (!sheet.bag) return;

    const bagEquipments = sheet.bag.getEquipments();

    const updatedBagEquipments = {
      ...bagEquipments,
      Arma: selectedEquipment.weapons,
      Armadura: selectedEquipment.armors,
      Escudo: selectedEquipment.shields,
      'Item Geral': selectedEquipment.generalItems,
      Esotérico: selectedEquipment.esoteric,
      Vestuário: selectedEquipment.clothing,
      Alquimía: selectedEquipment.alchemy,
      Alimentação: selectedEquipment.food,
      Animal: selectedEquipment.animals,
    };

    // Create a new Bag instance with updated equipment
    const updatedBag = new Bag(updatedBagEquipments);

    // Create updated sheet with new bag, dinheiro, and customMaxSpaces
    const sheetWithNewBag = {
      ...sheet,
      bag: updatedBag,
      dinheiro,
      customMaxSpaces: customMaxSpaces ?? undefined,
    };

    // Recalculate sheet to apply weapon bonuses and other effects
    // This ensures powers like "Arsenal das Profundezas" apply to newly added weapons
    // Skip PM/PV recalculation since equipment changes shouldn't affect them
    const recalculatedSheet = recalculateSheet(
      sheetWithNewBag,
      sheet,
      undefined,
      {
        skipPMRecalc: true,
        skipPVRecalc: true,
      }
    );

    // Track equipment changes in steps
    const originalWeapons = sheet.bag.getEquipments().Arma || [];
    const originalArmor = sheet.bag.getEquipments().Armadura || [];
    const originalShield = sheet.bag.getEquipments().Escudo || [];
    const originalGeneralItems = sheet.bag.getEquipments()['Item Geral'] || [];
    const originalEsoteric = sheet.bag.getEquipments().Esotérico || [];
    const originalClothing = sheet.bag.getEquipments().Vestuário || [];
    const originalAlchemy = sheet.bag.getEquipments().Alquimía || [];
    const originalFood = sheet.bag.getEquipments().Alimentação || [];
    const originalAnimals = sheet.bag.getEquipments().Animal || [];

    const weaponsChanged =
      JSON.stringify(originalWeapons) !==
      JSON.stringify(selectedEquipment.weapons);
    const armorChanged =
      JSON.stringify(originalArmor) !==
      JSON.stringify(selectedEquipment.armors);
    const shieldChanged =
      JSON.stringify(originalShield) !==
      JSON.stringify(selectedEquipment.shields);
    const generalItemsChanged =
      JSON.stringify(originalGeneralItems) !==
      JSON.stringify(selectedEquipment.generalItems);
    const esotericChanged =
      JSON.stringify(originalEsoteric) !==
      JSON.stringify(selectedEquipment.esoteric);
    const clothingChanged =
      JSON.stringify(originalClothing) !==
      JSON.stringify(selectedEquipment.clothing);
    const alchemyChanged =
      JSON.stringify(originalAlchemy) !==
      JSON.stringify(selectedEquipment.alchemy);
    const foodChanged =
      JSON.stringify(originalFood) !== JSON.stringify(selectedEquipment.food);
    const animalsChanged =
      JSON.stringify(originalAnimals) !==
      JSON.stringify(selectedEquipment.animals);

    const newSteps: Step[] = [];

    // Check if money changed
    const moneyChanged = sheet.dinheiro !== dinheiro;

    if (
      weaponsChanged ||
      armorChanged ||
      shieldChanged ||
      generalItemsChanged ||
      esotericChanged ||
      clothingChanged ||
      alchemyChanged ||
      foodChanged ||
      animalsChanged ||
      moneyChanged
    ) {
      const equipmentChanges: SubStep[] = [];

      if (weaponsChanged) {
        const addedWeapons = selectedEquipment.weapons.filter(
          (sw) => !originalWeapons.some((ow) => ow.nome === sw.nome)
        );
        const removedWeapons = originalWeapons.filter(
          (ow) => !selectedEquipment.weapons.some((sw) => sw.nome === ow.nome)
        );

        addedWeapons.forEach((w) =>
          equipmentChanges.push({
            name: w.nome,
            value: `${w.nome} (arma) - adicionado`,
          })
        );
        removedWeapons.forEach((w) =>
          equipmentChanges.push({
            name: w.nome,
            value: `${w.nome} (arma) - removido`,
          })
        );
      }

      if (armorChanged) {
        const addedArmors = selectedEquipment.armors.filter(
          (sa) => !originalArmor.some((oa) => oa.nome === sa.nome)
        );
        const removedArmors = originalArmor.filter(
          (oa) => !selectedEquipment.armors.some((sa) => sa.nome === oa.nome)
        );

        addedArmors.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (armadura) - adicionado`,
          })
        );
        removedArmors.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (armadura) - removido`,
          })
        );
      }

      if (shieldChanged) {
        const addedShields = selectedEquipment.shields.filter(
          (ss) => !originalShield.some((os) => os.nome === ss.nome)
        );
        const removedShields = originalShield.filter(
          (os) => !selectedEquipment.shields.some((s) => s.nome === os.nome)
        );

        addedShields.forEach((s) =>
          equipmentChanges.push({
            name: s.nome,
            value: `${s.nome} (escudo) - adicionado`,
          })
        );
        removedShields.forEach((s) =>
          equipmentChanges.push({
            name: s.nome,
            value: `${s.nome} (escudo) - removido`,
          })
        );
      }

      if (generalItemsChanged) {
        const addedGeneralItems = selectedEquipment.generalItems.filter(
          (sg) => !originalGeneralItems.some((og) => og.nome === sg.nome)
        );
        const removedGeneralItems = originalGeneralItems.filter(
          (og) =>
            !selectedEquipment.generalItems.some((sg) => sg.nome === og.nome)
        );

        addedGeneralItems.forEach((gi) =>
          equipmentChanges.push({
            name: gi.nome,
            value: `${gi.nome} (item geral) - adicionado`,
          })
        );
        removedGeneralItems.forEach((gi) =>
          equipmentChanges.push({
            name: gi.nome,
            value: `${gi.nome} (item geral) - removido`,
          })
        );
      }

      if (esotericChanged) {
        const addedEsoteric = selectedEquipment.esoteric.filter(
          (se) => !originalEsoteric.some((oe) => oe.nome === se.nome)
        );
        const removedEsoteric = originalEsoteric.filter(
          (oe) => !selectedEquipment.esoteric.some((se) => se.nome === oe.nome)
        );

        addedEsoteric.forEach((e) =>
          equipmentChanges.push({
            name: e.nome,
            value: `${e.nome} (esotérico) - adicionado`,
          })
        );
        removedEsoteric.forEach((e) =>
          equipmentChanges.push({
            name: e.nome,
            value: `${e.nome} (esotérico) - removido`,
          })
        );
      }

      if (clothingChanged) {
        const addedClothing = selectedEquipment.clothing.filter(
          (sc) => !originalClothing.some((oc) => oc.nome === sc.nome)
        );
        const removedClothing = originalClothing.filter(
          (oc) => !selectedEquipment.clothing.some((sc) => sc.nome === oc.nome)
        );

        addedClothing.forEach((c) =>
          equipmentChanges.push({
            name: c.nome,
            value: `${c.nome} (vestuário) - adicionado`,
          })
        );
        removedClothing.forEach((c) =>
          equipmentChanges.push({
            name: c.nome,
            value: `${c.nome} (vestuário) - removido`,
          })
        );
      }

      if (alchemyChanged) {
        const addedAlchemy = selectedEquipment.alchemy.filter(
          (sa) => !originalAlchemy.some((oa) => oa.nome === sa.nome)
        );
        const removedAlchemy = originalAlchemy.filter(
          (oa) => !selectedEquipment.alchemy.some((sa) => sa.nome === oa.nome)
        );

        addedAlchemy.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (alquimia) - adicionado`,
          })
        );
        removedAlchemy.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (alquimia) - removido`,
          })
        );
      }

      if (foodChanged) {
        const addedFood = selectedEquipment.food.filter(
          (sf) => !originalFood.some((of) => of.nome === sf.nome)
        );
        const removedFood = originalFood.filter(
          (of) => !selectedEquipment.food.some((sf) => sf.nome === of.nome)
        );

        addedFood.forEach((f) =>
          equipmentChanges.push({
            name: f.nome,
            value: `${f.nome} (alimentação) - adicionado`,
          })
        );
        removedFood.forEach((f) =>
          equipmentChanges.push({
            name: f.nome,
            value: `${f.nome} (alimentação) - removido`,
          })
        );
      }

      if (animalsChanged) {
        const addedAnimals = selectedEquipment.animals.filter(
          (sa) => !originalAnimals.some((oa) => oa.nome === sa.nome)
        );
        const removedAnimals = originalAnimals.filter(
          (oa) => !selectedEquipment.animals.some((sa) => sa.nome === oa.nome)
        );

        addedAnimals.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (animal) - adicionado`,
          })
        );
        removedAnimals.forEach((a) =>
          equipmentChanges.push({
            name: a.nome,
            value: `${a.nome} (animal) - removido`,
          })
        );
      }

      // Add money change to equipment changes
      if (moneyChanged) {
        equipmentChanges.push({
          name: 'Dinheiro',
          value: `Dinheiro alterado de T$ ${
            sheet.dinheiro || 0
          } para T$ ${dinheiro}`,
        });
      }

      if (equipmentChanges.length > 0) {
        newSteps.push({
          label: 'Edição Manual - Equipamentos',
          type: 'Equipamentos',
          value: equipmentChanges,
        });
      }
    }

    // If armor or shield changed, recalculate defense
    let finalSheet = recalculatedSheet;
    if (armorChanged || shieldChanged) {
      const sheetWithBaseDefense = { ...finalSheet, defesa: 10 };
      finalSheet = calcDefense(sheetWithBaseDefense);
    }

    // Add equipment change steps to the recalculated sheet's steps
    if (newSteps.length > 0) {
      finalSheet = {
        ...finalSheet,
        steps: [...finalSheet.steps, ...newSteps],
      };
    }

    // Save the fully recalculated sheet
    onSave(finalSheet);
    onClose();
  };

  const handleCancel = () => {
    if (sheet.bag) {
      const bagEquipments = sheet.bag.getEquipments();

      setSelectedEquipment({
        weapons: bagEquipments.Arma || [],
        armors: bagEquipments.Armadura || [],
        shields: bagEquipments.Escudo || [],
        generalItems: bagEquipments['Item Geral'] || [],
        esoteric: bagEquipments.Esotérico || [],
        clothing: bagEquipments.Vestuário || [],
        alchemy: bagEquipments.Alquimía || [],
        food: bagEquipments.Alimentação || [],
        animals: bagEquipments.Animal || [],
      });
      setDinheiro(sheet.dinheiro || 0);
    }
    setAutoDescontarTibares(true);
    setShowAddWeapons(false);
    setShowAddArmor(false);
    setShowAddShield(false);
    setShowAddGeneralItems(false);
    setShowAddEsoteric(false);
    setShowAddClothing(false);
    setShowAddAlchemy(false);
    setShowAddFood(false);
    setShowAddAnimals(false);
    onClose();
  };

  const isArmorSelected = (armor: DefenseEquipment) =>
    selectedEquipment.armors.some((a) => a.nome === armor.nome);

  const isShieldSelected = (shield: DefenseEquipment) =>
    selectedEquipment.shields.some((s) => s.nome === shield.nome);

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Editar Equipamentos</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant='body2' sx={{ mb: 2 }}>
          Gerencie os equipamentos do personagem. Você pode remover itens
          existentes ou adicionar novos.
          <br />
          <strong>Limite:</strong> 1 armadura e 1 escudo por vez.
        </Typography>

        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {/* Money and Spaces Section */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Dinheiro e Carga
              </Typography>
              <TextField
                fullWidth
                type='number'
                label='Dinheiro (T$)'
                value={dinheiroStr}
                onChange={(e) => setDinheiroStr(e.target.value)}
                inputProps={{ min: 0 }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type='number'
                label='Limite de Espaços (personalizado)'
                value={customMaxSpaces ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomMaxSpaces(val === '' ? null : Number(val));
                }}
                inputProps={{ min: 1 }}
                helperText={`Padrão: ${
                  10 + (sheet.atributos?.Força?.value || 0)
                } (10 + Força). Deixe vazio para usar o padrão.`}
              />
              <Tooltip title='Quando ativo, adicionar equipamentos desconta o preço do dinheiro. Remover equipamentos reembolsa o valor.'>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoDescontarTibares}
                      onChange={(e) =>
                        setAutoDescontarTibares(e.target.checked)
                      }
                      color='warning'
                    />
                  }
                  label='Descontar tibares ao adicionar/remover'
                  sx={{ mt: 1 }}
                />
              </Tooltip>
            </CardContent>
          </Card>

          {/* Current Equipment Section */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Equipamentos Atuais
              </Typography>

              {/* Weapons */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Armas ({selectedEquipment.weapons.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddWeapons ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleWeapons}
                    variant={showAddWeapons ? 'contained' : 'outlined'}
                    color={showAddWeapons ? 'primary' : 'inherit'}
                  >
                    {showAddWeapons ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.weapons.length > 0 ? (
                  <List dense>
                    {selectedEquipment.weapons.map((weapon, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <ListItem key={index}>
                        <ListItemText
                          primary={weapon.nome}
                          secondary={`Dano: ${weapon.dano} | Crítico: ${
                            weapon.critico || '20/x2'
                          } | Bônus Ataque: ${weapon.atkBonus || 0}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenEditWeapon(weapon, index)}
                            color='primary'
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveWeapon(index)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhuma arma equipada
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Armor */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {`Armadura${
                      selectedEquipment.armors.length > 0
                        ? ' (uma por vez)'
                        : ''
                    }`}
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddArmor ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleArmor}
                    variant={showAddArmor ? 'contained' : 'outlined'}
                    color={showAddArmor ? 'primary' : 'inherit'}
                    disabled={selectedEquipment.armors.length > 0}
                  >
                    {showAddArmor ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.armors.length > 0 ? (
                  <List dense>
                    {selectedEquipment.armors.map((armor, index) => (
                      <ListItem key={armor.nome}>
                        <ListItemText
                          primary={armor.nome}
                          secondary={`Defesa: +${
                            armor.defenseBonus
                          } | Penalidade: ${armor.armorPenalty}${
                            armor.rolls && armor.rolls.length > 0
                              ? ` | ${armor.rolls.length} rolagem(ns)`
                              : ''
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenEditArmor(armor, index)}
                            color='primary'
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveArmor(armor)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhuma armadura equipada
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Shield */}
              <Box>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {`Escudo${
                      selectedEquipment.shields.length > 0
                        ? ' (um por vez)'
                        : ''
                    }`}
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddShield ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleShield}
                    variant={showAddShield ? 'contained' : 'outlined'}
                    color={showAddShield ? 'primary' : 'inherit'}
                    disabled={selectedEquipment.shields.length > 0}
                  >
                    {showAddShield ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.shields.length > 0 ? (
                  <List dense>
                    {selectedEquipment.shields.map((shield, index) => (
                      <ListItem key={shield.nome}>
                        <ListItemText
                          primary={shield.nome}
                          secondary={`Defesa: +${
                            shield.defenseBonus
                          } | Penalidade: ${shield.armorPenalty}${
                            shield.rolls && shield.rolls.length > 0
                              ? ` | ${shield.rolls.length} rolagem(ns)`
                              : ''
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenEditShield(shield, index)}
                            color='primary'
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveShield(shield)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhum escudo equipado
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* General Items */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Itens Gerais ({selectedEquipment.generalItems.length})
                  </Typography>
                  <Stack direction='row' spacing={1}>
                    <Button
                      size='small'
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={handleOpenCustomItemDialog}
                      variant='outlined'
                      color='secondary'
                    >
                      Personalizado
                    </Button>
                    <Button
                      size='small'
                      startIcon={
                        showAddGeneralItems ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )
                      }
                      onClick={handleToggleGeneralItems}
                      variant={showAddGeneralItems ? 'contained' : 'outlined'}
                      color={showAddGeneralItems ? 'primary' : 'inherit'}
                    >
                      {showAddGeneralItems ? 'Fechar' : 'Adicionar'}
                    </Button>
                  </Stack>
                </Stack>
                {selectedEquipment.generalItems.length > 0 ? (
                  <List dense>
                    {selectedEquipment.generalItems.map((item, index) => (
                      <ListItem key={item.id || item.nome}>
                        <ListItemText
                          primary={
                            <Stack
                              direction='row'
                              alignItems='center'
                              spacing={0.5}
                            >
                              <span>{item.nome}</span>
                              {item.isCustom && (
                                <Chip
                                  size='small'
                                  label='Personalizado'
                                  variant='outlined'
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={`${
                            item.preco ? `Preço: T$ ${item.preco} | ` : ''
                          }Espaços: ${item.spaces || 0}${
                            item.rolls && item.rolls.length > 0
                              ? ` | ${item.rolls.length} rolagem(ns)`
                              : ''
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenEditItem(item, index)}
                            color='primary'
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveGeneralItem(item)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhum geral equipado
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Esoteric */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Esotéricos ({selectedEquipment.esoteric.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddEsoteric ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleEsoteric}
                    variant={showAddEsoteric ? 'contained' : 'outlined'}
                    color={showAddEsoteric ? 'primary' : 'inherit'}
                  >
                    {showAddEsoteric ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.esoteric.length > 0 ? (
                  <List dense>
                    {selectedEquipment.esoteric.map((item) => (
                      <ListItem key={item.nome}>
                        <ListItemText
                          primary={item.nome}
                          secondary={`${
                            item.preco ? `Preço: T$ ${item.preco} | ` : ''
                          }Espaços: ${item.spaces || 0}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveEsoteric(item)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhum esotérico equipado
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Clothing */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Vestuário ({selectedEquipment.clothing.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddClothing ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleClothing}
                    variant={showAddClothing ? 'contained' : 'outlined'}
                    color={showAddClothing ? 'primary' : 'inherit'}
                  >
                    {showAddClothing ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.clothing.length > 0 ? (
                  <List dense>
                    {selectedEquipment.clothing.map((item, index) => (
                      <ListItem key={item.nome}>
                        <ListItemText
                          primary={item.nome}
                          secondary={`Preço: T$ ${item.preco || 0} | Espaços: ${
                            item.spaces || 0
                          }${
                            item.rolls && item.rolls.length > 0
                              ? ` | ${item.rolls.length} rolagem(ns)`
                              : ''
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenEditClothing(item, index)}
                            color='primary'
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveClothing(item)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhum vestuário equipado
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Alchemy */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Alquimia ({selectedEquipment.alchemy.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddAlchemy ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleAlchemy}
                    variant={showAddAlchemy ? 'contained' : 'outlined'}
                    color={showAddAlchemy ? 'primary' : 'inherit'}
                  >
                    {showAddAlchemy ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.alchemy.length > 0 ? (
                  <List dense>
                    {selectedEquipment.alchemy.map((item, index) => (
                      <ListItem key={item.nome}>
                        <ListItemText
                          primary={item.nome}
                          secondary={`Preço: T$ ${item.preco || 0} | Espaços: ${
                            item.spaces || 0
                          }${
                            item.rolls && item.rolls.length > 0
                              ? ` | ${item.rolls.length} rolagem(ns)`
                              : ''
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenEditAlchemy(item, index)}
                            color='primary'
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveAlchemy(item)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhum de alquimia equipado
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Food */}
              <Box>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Alimentação ({selectedEquipment.food.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddFood ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleFood}
                    variant={showAddFood ? 'contained' : 'outlined'}
                    color={showAddFood ? 'primary' : 'inherit'}
                  >
                    {showAddFood ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.food.length > 0 ? (
                  <List dense>
                    {selectedEquipment.food.map((item, index) => (
                      <ListItem key={item.nome}>
                        <ListItemText
                          primary={item.nome}
                          secondary={`Preço: T$ ${item.preco || 0} | Espaços: ${
                            item.spaces || 0
                          }${
                            item.rolls && item.rolls.length > 0
                              ? ` | ${item.rolls.length} rolagem(ns)`
                              : ''
                          }`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenEditFood(item, index)}
                            color='primary'
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveFood(item)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhum de alimentação equipado
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Animals */}
              <Box>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Animais ({selectedEquipment.animals.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={
                      showAddAnimals ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleToggleAnimals}
                    variant={showAddAnimals ? 'contained' : 'outlined'}
                    color={showAddAnimals ? 'primary' : 'inherit'}
                  >
                    {showAddAnimals ? 'Fechar' : 'Adicionar'}
                  </Button>
                </Stack>
                {selectedEquipment.animals.length > 0 ? (
                  <List dense>
                    {selectedEquipment.animals.map((item) => (
                      <ListItem key={item.nome}>
                        <ListItemText
                          primary={item.nome}
                          secondary={`${
                            item.preco ? `Preço: T$ ${item.preco} | ` : ''
                          }Espaços: ${item.spaces || 0}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleRemoveAnimals(item)}
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhum animal equipado
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Add Weapons Section */}
          {showAddWeapons && (
            <Accordion expanded={showAddWeapons} ref={weaponsAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Armas</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Simple Weapons */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armas Simples
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {[...EQUIPAMENTOS.armasSimples]
                      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                      .map((weapon) => (
                        <Box
                          key={weapon.nome}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {renderAddButton(weapon, () =>
                            handleWeaponToggle(weapon)
                          )}
                          <Typography variant='body2' sx={{ flex: 1 }}>
                            {weapon.nome} (Dano: {weapon.dano}
                            {weapon.preco ? ` | T$ ${weapon.preco}` : ''})
                          </Typography>
                        </Box>
                      ))}
                    {/* Supplement simple weapons */}
                    {getCategorizedWeapons.simple.map((weapon) => (
                      <Box
                        key={weapon.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(weapon, () =>
                          handleWeaponToggle(weapon)
                        )}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {weapon.nome} (Dano: {weapon.dano}
                          {weapon.preco ? ` | T$ ${weapon.preco}` : ''})
                        </Typography>
                        {weapon.supplementId &&
                          weapon.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[weapon.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Martial Weapons */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armas Marciais
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {[...EQUIPAMENTOS.armasMarciais]
                      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                      .map((weapon) => (
                        <Box
                          key={weapon.nome}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {renderAddButton(weapon, () =>
                            handleWeaponToggle(weapon)
                          )}
                          <Typography variant='body2' sx={{ flex: 1 }}>
                            {weapon.nome} (Dano: {weapon.dano}
                            {weapon.preco ? ` | T$ ${weapon.preco}` : ''})
                          </Typography>
                        </Box>
                      ))}
                    {/* Supplement martial weapons */}
                    {getCategorizedWeapons.martial.map((weapon) => (
                      <Box
                        key={weapon.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(weapon, () =>
                          handleWeaponToggle(weapon)
                        )}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {weapon.nome} (Dano: {weapon.dano}
                          {weapon.preco ? ` | T$ ${weapon.preco}` : ''})
                        </Typography>
                        {weapon.supplementId &&
                          weapon.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[weapon.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Exotic Weapons */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armas Exóticas
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {[...EQUIPAMENTOS.armasExoticas]
                      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                      .map((weapon) => (
                        <Box
                          key={weapon.nome}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {renderAddButton(weapon, () =>
                            handleWeaponToggle(weapon)
                          )}
                          <Typography variant='body2' sx={{ flex: 1 }}>
                            {weapon.nome} (Dano: {weapon.dano}
                            {weapon.preco ? ` | T$ ${weapon.preco}` : ''})
                          </Typography>
                        </Box>
                      ))}
                    {/* Supplement exotic weapons */}
                    {getCategorizedWeapons.exotic.map((weapon) => (
                      <Box
                        key={weapon.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(weapon, () =>
                          handleWeaponToggle(weapon)
                        )}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {weapon.nome} (Dano: {weapon.dano}
                          {weapon.preco ? ` | T$ ${weapon.preco}` : ''})
                        </Typography>
                        {weapon.supplementId &&
                          weapon.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[weapon.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Firearms */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armas de Fogo
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {[...EQUIPAMENTOS.armasDeFogo]
                      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                      .map((weapon) => (
                        <Box
                          key={weapon.nome}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {renderAddButton(weapon, () =>
                            handleWeaponToggle(weapon)
                          )}
                          <Typography variant='body2' sx={{ flex: 1 }}>
                            {weapon.nome} (Dano: {weapon.dano}
                            {weapon.preco ? ` | T$ ${weapon.preco}` : ''})
                          </Typography>
                        </Box>
                      ))}
                    {/* Supplement firearms */}
                    {getCategorizedWeapons.firearms.map((weapon) => (
                      <Box
                        key={weapon.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(weapon, () =>
                          handleWeaponToggle(weapon)
                        )}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {weapon.nome} (Dano: {weapon.dano}
                          {weapon.preco ? ` | T$ ${weapon.preco}` : ''})
                        </Typography>
                        {weapon.supplementId &&
                          weapon.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[weapon.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddWeapons(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Armor Section */}
          {showAddArmor && (
            <Accordion expanded={showAddArmor} ref={armorAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Armadura</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Light Armor */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armaduras Leves
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {EQUIPAMENTOS.armadurasLeves.map((armor) => (
                      <Box
                        key={armor.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isArmorSelected(armor)}
                              onChange={() => handleArmorToggle(armor)}
                              size='small'
                              disabled={
                                !isArmorSelected(armor) && !canAfford(armor)
                              }
                            />
                          }
                          label={`${armor.nome} (Defesa: +${
                            armor.defenseBonus
                          }, Penalidade: ${armor.armorPenalty}${
                            armor.preco ? ` | T$ ${armor.preco}` : ''
                          })`}
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                      </Box>
                    ))}
                    {/* Supplement light armors */}
                    {getCategorizedArmors.light.map((armor) => (
                      <Box
                        key={armor.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isArmorSelected(armor)}
                              onChange={() => handleArmorToggle(armor)}
                              size='small'
                              disabled={
                                !isArmorSelected(armor) && !canAfford(armor)
                              }
                            />
                          }
                          label={`${armor.nome} (Defesa: +${
                            armor.defenseBonus
                          }, Penalidade: ${armor.armorPenalty}${
                            armor.preco ? ` | T$ ${armor.preco}` : ''
                          })`}
                          sx={{ flex: 1 }}
                        />
                        {armor.supplementId &&
                          armor.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[armor.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Heavy Armor */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Armaduras Pesadas
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {EQUIPAMENTOS.armaduraPesada.map((armor) => (
                      <Box
                        key={armor.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isArmorSelected(armor)}
                              onChange={() => handleArmorToggle(armor)}
                              size='small'
                              disabled={
                                !isArmorSelected(armor) && !canAfford(armor)
                              }
                            />
                          }
                          label={`${armor.nome} (Defesa: +${
                            armor.defenseBonus
                          }, Penalidade: ${armor.armorPenalty}${
                            armor.preco ? ` | T$ ${armor.preco}` : ''
                          })`}
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                      </Box>
                    ))}
                    {/* Supplement heavy armors */}
                    {getCategorizedArmors.heavy.map((armor) => (
                      <Box
                        key={armor.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isArmorSelected(armor)}
                              onChange={() => handleArmorToggle(armor)}
                              size='small'
                              disabled={
                                !isArmorSelected(armor) && !canAfford(armor)
                              }
                            />
                          }
                          label={`${armor.nome} (Defesa: +${
                            armor.defenseBonus
                          }, Penalidade: ${armor.armorPenalty}${
                            armor.preco ? ` | T$ ${armor.preco}` : ''
                          })`}
                          sx={{ flex: 1 }}
                        />
                        {armor.supplementId &&
                          armor.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[armor.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddArmor(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Shield Section */}
          {showAddShield && (
            <Accordion expanded={showAddShield} ref={shieldAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Escudo</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {EQUIPAMENTOS.escudos.map((shield) => (
                      <Box
                        key={shield.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isShieldSelected(shield)}
                              onChange={() => handleShieldToggle(shield)}
                              size='small'
                              disabled={
                                !isShieldSelected(shield) && !canAfford(shield)
                              }
                            />
                          }
                          label={`${shield.nome} (Defesa: +${
                            shield.defenseBonus
                          }, Penalidade: ${shield.armorPenalty}${
                            shield.preco ? ` | T$ ${shield.preco}` : ''
                          })`}
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                      </Box>
                    ))}
                    {/* Supplement shields */}
                    {getCategorizedArmors.shields.map((shield) => (
                      <Box
                        key={shield.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isShieldSelected(shield)}
                              onChange={() => handleShieldToggle(shield)}
                              size='small'
                              disabled={
                                !isShieldSelected(shield) && !canAfford(shield)
                              }
                            />
                          }
                          label={`${shield.nome} (Defesa: +${
                            shield.defenseBonus
                          }, Penalidade: ${shield.armorPenalty}${
                            shield.preco ? ` | T$ ${shield.preco}` : ''
                          })`}
                          sx={{ flex: 1 }}
                        />
                        {shield.supplementId &&
                          shield.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[shield.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddShield(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add General Items Section */}
          {showAddGeneralItems && (
            <Accordion
              expanded={showAddGeneralItems}
              ref={generalItemsAccordionRef}
            >
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Itens Gerais</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Adventurer Equipment */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Equipamentos de Aventureiro
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {/* Core items */}
                    {GENERAL_EQUIPMENT.adventurerEquipment.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () =>
                          handleAddGeneralItem(item)
                        )}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                      </Box>
                    ))}
                    {/* Supplement items */}
                    {getSupplementGeneralItems.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () =>
                          handleAddGeneralItem(item)
                        )}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                        {item.supplementId &&
                          item.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[item.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Tools */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Ferramentas
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {GENERAL_EQUIPMENT.tools.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () =>
                          handleAddGeneralItem(item)
                        )}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddGeneralItems(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Esoteric Section */}
          {showAddEsoteric && (
            <Accordion expanded={showAddEsoteric} ref={esotericAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Esotéricos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {/* Core items */}
                    {GENERAL_EQUIPMENT.esoteric.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddEsoteric(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                      </Box>
                    ))}
                    {/* Supplement items */}
                    {getSupplementEsoteric.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddEsoteric(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                        {item.supplementId &&
                          item.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[item.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddEsoteric(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Clothing Section */}
          {showAddClothing && (
            <Accordion expanded={showAddClothing} ref={clothingAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Vestuário</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {/* Core items */}
                    {GENERAL_EQUIPMENT.clothing.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddClothing(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                      </Box>
                    ))}
                    {/* Supplement items */}
                    {getSupplementClothing.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddClothing(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                        {item.supplementId &&
                          item.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[item.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddClothing(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Alchemy Section */}
          {showAddAlchemy && (
            <Accordion expanded={showAddAlchemy} ref={alchemyAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>
                  Adicionar Itens de Alquimia
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Prepared Items */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Preparados Alquímicos
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {/* Core items */}
                    {GENERAL_EQUIPMENT.alchemyPrepared.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddAlchemy(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                      </Box>
                    ))}
                    {/* Supplement items */}
                    {getCategorizedAlchemy.prepared.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddAlchemy(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                        {item.supplementId &&
                          item.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[item.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Catalysts */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Catalisadores
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {/* Core items */}
                    {GENERAL_EQUIPMENT.alchemyCatalysts.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddAlchemy(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                      </Box>
                    ))}
                    {/* Supplement items */}
                    {getCategorizedAlchemy.catalysts.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddAlchemy(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                        {item.supplementId &&
                          item.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[item.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Poisons */}
                  <Typography
                    variant='subtitle2'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Venenos
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {/* Core items */}
                    {GENERAL_EQUIPMENT.alchemyPoisons.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddAlchemy(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                      </Box>
                    ))}
                    {/* Supplement items */}
                    {getCategorizedAlchemy.poisons.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddAlchemy(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                        {item.supplementId &&
                          item.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[item.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddAlchemy(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Food Section */}
          {showAddFood && (
            <Accordion expanded={showAddFood} ref={foodAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Alimentação</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {/* Core items */}
                    {GENERAL_EQUIPMENT.food.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddFood(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                      </Box>
                    ))}
                    {/* Supplement items */}
                    {getSupplementFood.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddFood(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                        {item.supplementId &&
                          item.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[item.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddFood(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Animals Section */}
          {showAddAnimals && (
            <Accordion expanded={showAddAnimals} ref={animalsAccordionRef}>
              <AccordionSummary>
                <Typography variant='h6'>Adicionar Animais</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {/* Core items */}
                    {GENERAL_EQUIPMENT.animals.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddAnimals(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                      </Box>
                    ))}
                    {/* Supplement items */}
                    {getSupplementAnimals.map((item) => (
                      <Box
                        key={item.nome}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {renderAddButton(item, () => handleAddAnimals(item))}
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.nome} (T$ {item.preco || 0})
                        </Typography>
                        {item.supplementId &&
                          item.supplementId !==
                            SupplementId.TORMENTA20_CORE && (
                            <Chip
                              label={
                                SUPPLEMENT_METADATA[item.supplementId]
                                  ?.abbreviation || ''
                              }
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant='outlined'
                    onClick={() => setShowAddAnimals(false)}
                    fullWidth
                  >
                    Fechar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>

        <Stack direction='row' spacing={2} sx={{ mt: 4 }}>
          <Button fullWidth variant='contained' onClick={handleSave}>
            Salvar
          </Button>
          <Button fullWidth variant='outlined' onClick={handleCancel}>
            Cancelar
          </Button>
        </Stack>
      </Box>

      {/* Dialog de edição de arma */}
      <Dialog
        open={editingWeapon !== null}
        onClose={handleCloseEditWeapon}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Arma</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Nome da Arma'
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              fullWidth
              helperText='Nome personalizado para a arma'
            />
            <TextField
              label='Bônus de Ataque'
              type='number'
              value={editAtkBonus}
              onChange={(e) => setEditAtkBonus(e.target.value)}
              fullWidth
              helperText='Bônus adicional que será somado ao ataque (pode ser negativo)'
            />
            <TextField
              label='Dano'
              value={editDano}
              onChange={(e) => setEditDano(e.target.value)}
              fullWidth
              helperText='Ex: 1d8, 2d6+2, 1d10+4'
            />
            <Stack direction='row' spacing={2}>
              <TextField
                label='Margem de Ameaça'
                type='number'
                value={editMargemAmeaca}
                onChange={(e) => setEditMargemAmeaca(e.target.value)}
                fullWidth
                helperText='Ex: 20, 19, 18'
                inputProps={{ min: 1, max: 20 }}
              />
              <TextField
                label='Multiplicador'
                type='number'
                value={editMultCritico}
                onChange={(e) => setEditMultCritico(e.target.value)}
                fullWidth
                helperText='Ex: 2, 3, 4'
                inputProps={{ min: 2 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 4 }}>x</span>,
                }}
              />
            </Stack>
            <TextField
              label='Espaços'
              type='number'
              value={editWeaponSpaces}
              onChange={(e) => setEditWeaponSpaces(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
              helperText='Quantidade de espaços ocupados na mochila'
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditWeapon}>Cancelar</Button>
          <Button onClick={handleSaveEditWeapon} variant='contained'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de item customizado */}
      <Dialog
        open={showCustomItemDialog}
        onClose={handleCloseCustomItemDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {editingItem ? 'Editar Item' : 'Criar Item Personalizado'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Nome do Item'
              value={customItemNome}
              onChange={(e) => setCustomItemNome(e.target.value)}
              fullWidth
              required
              error={!!itemNomeError}
              helperText={itemNomeError || 'Nome do item personalizado'}
            />
            <TextField
              label='Espaços'
              type='number'
              value={customItemSpaces}
              onChange={(e) => setCustomItemSpaces(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
              error={!!itemSpacesError}
              helperText={
                itemSpacesError || 'Quantidade de espaços ocupados na mochila'
              }
            />

            {/* Seção de Rolagens */}
            <Box>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography variant='subtitle2'>
                  Rolagens ({customItemRolls.length})
                </Typography>
                <Button
                  size='small'
                  startIcon={<EditIcon />}
                  onClick={() => setShowItemRollsDialog(true)}
                >
                  {customItemRolls.length > 0
                    ? 'Editar Rolagens'
                    : 'Adicionar Rolagens'}
                </Button>
              </Stack>
              {customItemRolls.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {customItemRolls.map((roll, index) => (
                    <ListItem key={roll.id || index} sx={{ py: 0 }}>
                      <ListItemText
                        primary={`${roll.label} - ${roll.dice}`}
                        secondary={roll.description}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCustomItemDialog}>Cancelar</Button>
          <Button onClick={handleSaveCustomItem} variant='contained'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* RollsEditDialog para editar rolagens do item */}
      <RollsEditDialog
        open={showItemRollsDialog}
        onClose={() => setShowItemRollsDialog(false)}
        rolls={customItemRolls}
        onSave={(rolls) => {
          setCustomItemRolls(rolls);
          setShowItemRollsDialog(false);
        }}
        title='Rolagens do Item'
      />

      {/* Dialog de edição de armadura */}
      <Dialog
        open={editingArmor !== null}
        onClose={handleCloseEditArmor}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Armadura</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Nome da Armadura'
              value={editArmorNome}
              onChange={(e) => setEditArmorNome(e.target.value)}
              fullWidth
              helperText='Nome personalizado para a armadura'
            />
            <TextField
              label='Bônus de Defesa'
              type='number'
              value={editArmorDefenseBonus}
              onChange={(e) => setEditArmorDefenseBonus(e.target.value)}
              fullWidth
              inputProps={{ min: 0, max: 15 }}
              helperText='Bônus que será adicionado à Defesa (geralmente 0-10)'
            />
            <TextField
              label='Penalidade de Armadura'
              type='number'
              value={editArmorPenalty}
              onChange={(e) => setEditArmorPenalty(e.target.value)}
              fullWidth
              inputProps={{ max: 0 }}
              helperText='Penalidade em perícias (geralmente 0 ou negativo)'
            />
            <TextField
              label='Espaços'
              type='number'
              value={editArmorSpaces}
              onChange={(e) => setEditArmorSpaces(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
              helperText='Quantidade de espaços ocupados na mochila'
            />

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editArmorIsHeavy}
                    onChange={(e) => setEditArmorIsHeavy(e.target.checked)}
                  />
                }
                label='Armadura Pesada'
              />
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
              >
                Armaduras pesadas não somam modificador de Destreza na Defesa
              </Typography>
            </Box>

            {/* Seção de Rolagens */}
            <Box>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography variant='subtitle2'>
                  Rolagens ({editArmorRolls.length})
                </Typography>
                <Button
                  size='small'
                  startIcon={<EditIcon />}
                  onClick={() => setShowArmorRollsDialog(true)}
                >
                  {editArmorRolls.length > 0
                    ? 'Editar Rolagens'
                    : 'Adicionar Rolagens'}
                </Button>
              </Stack>
              {editArmorRolls.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {editArmorRolls.map((roll, index) => (
                    <ListItem key={roll.id || index} sx={{ py: 0 }}>
                      <ListItemText
                        primary={`${roll.label} - ${roll.dice}`}
                        secondary={roll.description}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditArmor}>Cancelar</Button>
          <Button onClick={handleSaveEditArmor} variant='contained'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* RollsEditDialog para editar rolagens da armadura */}
      <RollsEditDialog
        open={showArmorRollsDialog}
        onClose={() => setShowArmorRollsDialog(false)}
        rolls={editArmorRolls}
        onSave={(rolls) => {
          setEditArmorRolls(rolls);
          setShowArmorRollsDialog(false);
        }}
        title='Rolagens da Armadura'
      />

      {/* Dialog de edição de escudo */}
      <Dialog
        open={editingShield !== null}
        onClose={handleCloseEditShield}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Escudo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Nome do Escudo'
              value={editShieldNome}
              onChange={(e) => setEditShieldNome(e.target.value)}
              fullWidth
              helperText='Nome personalizado para o escudo'
            />
            <TextField
              label='Bônus de Defesa'
              type='number'
              value={editShieldDefenseBonus}
              onChange={(e) => setEditShieldDefenseBonus(e.target.value)}
              fullWidth
              inputProps={{ min: 0, max: 10 }}
              helperText='Bônus que será adicionado à Defesa (geralmente 1-3)'
            />
            <TextField
              label='Penalidade de Armadura'
              type='number'
              value={editShieldPenalty}
              onChange={(e) => setEditShieldPenalty(e.target.value)}
              fullWidth
              inputProps={{ max: 0 }}
              helperText='Penalidade em perícias (geralmente 0 ou negativo)'
            />
            <TextField
              label='Espaços'
              type='number'
              value={editShieldSpaces}
              onChange={(e) => setEditShieldSpaces(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
              helperText='Quantidade de espaços ocupados na mochila'
            />

            {/* Seção de Rolagens */}
            <Box>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography variant='subtitle2'>
                  Rolagens ({editShieldRolls.length})
                </Typography>
                <Button
                  size='small'
                  startIcon={<EditIcon />}
                  onClick={() => setShowShieldRollsDialog(true)}
                >
                  {editShieldRolls.length > 0
                    ? 'Editar Rolagens'
                    : 'Adicionar Rolagens'}
                </Button>
              </Stack>
              {editShieldRolls.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {editShieldRolls.map((roll, index) => (
                    <ListItem key={roll.id || index} sx={{ py: 0 }}>
                      <ListItemText
                        primary={`${roll.label} - ${roll.dice}`}
                        secondary={roll.description}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditShield}>Cancelar</Button>
          <Button onClick={handleSaveEditShield} variant='contained'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* RollsEditDialog para editar rolagens do escudo */}
      <RollsEditDialog
        open={showShieldRollsDialog}
        onClose={() => setShowShieldRollsDialog(false)}
        rolls={editShieldRolls}
        onSave={(rolls) => {
          setEditShieldRolls(rolls);
          setShowShieldRollsDialog(false);
        }}
        title='Rolagens do Escudo'
      />

      {/* Dialog de edição de vestuário */}
      <Dialog
        open={editingClothing !== null}
        onClose={handleCloseEditClothing}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Vestuário</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Nome do Vestuário'
              value={editClothingNome}
              onChange={(e) => setEditClothingNome(e.target.value)}
              fullWidth
              helperText='Nome personalizado para o vestuário'
            />
            <TextField
              label='Espaços'
              type='number'
              value={editClothingSpaces}
              onChange={(e) => setEditClothingSpaces(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
              helperText='Quantidade de espaços ocupados na mochila'
            />

            {/* Seção de Rolagens */}
            <Box>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography variant='subtitle2'>
                  Rolagens ({editClothingRolls.length})
                </Typography>
                <Button
                  size='small'
                  startIcon={<EditIcon />}
                  onClick={() => setShowClothingRollsDialog(true)}
                >
                  {editClothingRolls.length > 0
                    ? 'Editar Rolagens'
                    : 'Adicionar Rolagens'}
                </Button>
              </Stack>
              {editClothingRolls.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {editClothingRolls.map((roll, index) => (
                    <ListItem key={roll.id || index} sx={{ py: 0 }}>
                      <ListItemText
                        primary={`${roll.label} - ${roll.dice}`}
                        secondary={roll.description}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditClothing}>Cancelar</Button>
          <Button onClick={handleSaveEditClothing} variant='contained'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* RollsEditDialog para editar rolagens do vestuário */}
      <RollsEditDialog
        open={showClothingRollsDialog}
        onClose={() => setShowClothingRollsDialog(false)}
        rolls={editClothingRolls}
        onSave={(rolls) => {
          setEditClothingRolls(rolls);
          setShowClothingRollsDialog(false);
        }}
        title='Rolagens do Vestuário'
      />

      {/* Dialog de edição de alquimia */}
      <Dialog
        open={editingAlchemy !== null}
        onClose={handleCloseEditAlchemy}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Item de Alquimia</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Nome do Item'
              value={editAlchemyNome}
              onChange={(e) => setEditAlchemyNome(e.target.value)}
              fullWidth
              helperText='Nome personalizado para o item de alquimia'
            />
            <TextField
              label='Espaços'
              type='number'
              value={editAlchemySpaces}
              onChange={(e) => setEditAlchemySpaces(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
              helperText='Quantidade de espaços ocupados na mochila'
            />

            {/* Seção de Rolagens */}
            <Box>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography variant='subtitle2'>
                  Rolagens ({editAlchemyRolls.length})
                </Typography>
                <Button
                  size='small'
                  startIcon={<EditIcon />}
                  onClick={() => setShowAlchemyRollsDialog(true)}
                >
                  {editAlchemyRolls.length > 0
                    ? 'Editar Rolagens'
                    : 'Adicionar Rolagens'}
                </Button>
              </Stack>
              {editAlchemyRolls.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {editAlchemyRolls.map((roll, index) => (
                    <ListItem key={roll.id || index} sx={{ py: 0 }}>
                      <ListItemText
                        primary={`${roll.label} - ${roll.dice}`}
                        secondary={roll.description}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditAlchemy}>Cancelar</Button>
          <Button onClick={handleSaveEditAlchemy} variant='contained'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* RollsEditDialog para editar rolagens de alquimia */}
      <RollsEditDialog
        open={showAlchemyRollsDialog}
        onClose={() => setShowAlchemyRollsDialog(false)}
        rolls={editAlchemyRolls}
        onSave={(rolls) => {
          setEditAlchemyRolls(rolls);
          setShowAlchemyRollsDialog(false);
        }}
        title='Rolagens do Item de Alquimia'
      />

      {/* Dialog de edição de alimentação */}
      <Dialog
        open={editingFood !== null}
        onClose={handleCloseEditFood}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Alimentação</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Nome do Item'
              value={editFoodNome}
              onChange={(e) => setEditFoodNome(e.target.value)}
              fullWidth
              helperText='Nome personalizado para o item de alimentação'
            />
            <TextField
              label='Espaços'
              type='number'
              value={editFoodSpaces}
              onChange={(e) => setEditFoodSpaces(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
              helperText='Quantidade de espaços ocupados na mochila'
            />

            {/* Seção de Rolagens */}
            <Box>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography variant='subtitle2'>
                  Rolagens ({editFoodRolls.length})
                </Typography>
                <Button
                  size='small'
                  startIcon={<EditIcon />}
                  onClick={() => setShowFoodRollsDialog(true)}
                >
                  {editFoodRolls.length > 0
                    ? 'Editar Rolagens'
                    : 'Adicionar Rolagens'}
                </Button>
              </Stack>
              {editFoodRolls.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {editFoodRolls.map((roll, index) => (
                    <ListItem key={roll.id || index} sx={{ py: 0 }}>
                      <ListItemText
                        primary={`${roll.label} - ${roll.dice}`}
                        secondary={roll.description}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditFood}>Cancelar</Button>
          <Button onClick={handleSaveEditFood} variant='contained'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* RollsEditDialog para editar rolagens de alimentação */}
      <RollsEditDialog
        open={showFoodRollsDialog}
        onClose={() => setShowFoodRollsDialog(false)}
        rolls={editFoodRolls}
        onSave={(rolls) => {
          setEditFoodRolls(rolls);
          setShowFoodRollsDialog(false);
        }}
        title='Rolagens do Item de Alimentação'
      />
    </Drawer>
  );
};

export default EquipmentEditDrawer;
