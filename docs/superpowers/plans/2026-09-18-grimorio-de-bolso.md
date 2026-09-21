# Grimório de bolso — plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** permitir que o jogador junte itens da Enciclopédia de Tanah-Toh em grimórios locais, nomeados, consultáveis na mesa, exportáveis e importáveis em JSON.

**Arquitetura:** um slice Redux persistido guarda só ids do índice da enciclopédia. Um resolvedor puro transforma ids em conteúdo completo (magia, poder geral, genérico, resumo ou não encontrado), lendo o índice e o `dataRegistry` com todos os suplementos. A interface fica em `src/components/PocketGrimoire/`: botão de adicionar nos cards, botão flutuante com balão na enciclopédia e as páginas `/grimorio` e `/grimorio/:id`.

**Stack:** React 17, TypeScript, Redux Toolkit 1.9 com redux-persist 6, MUI v9 (`@mui/material`, `@mui/icons-material`), notistack 3, react-router-dom 5, Vitest com Testing Library e jsdom.

**Spec:** `docs/superpowers/specs/2026-09-18-grimorio-de-bolso-design.md`

## Restrições globais

- Todo texto de interface em português do Brasil.
- Nenhum import de `src/premium` (direto ou indireto) no código novo. Os testes novos precisam passar sem o submódulo premium.
- ESLint Airbnb: sem `for...of`/`for...in` (use `forEach`/`map`), sem `++` (use `+= 1`), sem ternário aninhado, sem `any`, sem spread de props em JSX, sem acessar campos com `_` (por exemplo `_persist`).
- Rodar `npx prettier --write` em todo arquivo criado ou editado.
- Responsivo: celular é `useMediaQuery('(max-width: 720px)')`, o mesmo critério de `Database.tsx`.
- Cores só pelo tema (`primary`, `success`, `text.secondary`, `action.hover`…), para funcionar no claro e no escuro.
- Notificações do grimório: `autoHideDuration: 4000` e `anchorOrigin: { vertical: 'bottom', horizontal: 'left' }`.
- Nome de grimório: no máximo 60 caracteres.
- Cards abrem sozinhos quando o grimório tem 5 itens ou menos.
- Linha de base dos testes: 2036 passando e 15 falhas conhecidas em `src/functions/__tests__/unarmedDamage.spec.ts` (stub premium). Qualquer outra falha é regressão.
- Branch: `feat/grimorio-de-bolso`. Commits terminam com `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## Estrutura de arquivos

| Arquivo                                                           | Responsabilidade                                                              |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/interfaces/PocketGrimoire.ts`                                | Tipos e constantes do grimório                                                |
| `src/functions/pocketGrimoire/state.ts`                           | Regras puras: estado inicial, validação, nomes                                |
| `src/functions/pocketGrimoire/itemId.ts`                          | Anatomia do id: prefixo, nome, categoria de filtro                            |
| `src/functions/pocketGrimoire/resolveItems.ts`                    | Índice completo em cache, resolução de ids, agrupamento, filtro               |
| `src/functions/pocketGrimoire/exchange.ts`                        | Exportar e importar (JSON), nome do arquivo                                   |
| `src/store/slices/pocketGrimoire/pocketGrimoireSlice.ts`          | Slice, actions, selectors e `migrate` do persist                              |
| `src/components/PocketGrimoire/__tests__/renderWithProviders.tsx` | Helper de teste: store, snackbar, router, helmet                              |
| `src/components/PocketGrimoire/cards/*.tsx`                       | Cards de consulta (moldura, magia, poder, genérico, não encontrado, despacho) |
| `src/components/PocketGrimoire/GrimoireNameDialog.tsx`            | Diálogo de nome (criar e renomear)                                            |
| `src/components/PocketGrimoire/ExportGrimoireDialog.tsx`          | Diálogo de exportação                                                         |
| `src/components/PocketGrimoire/ImportGrimoireDialog.tsx`          | Diálogo de importação                                                         |
| `src/components/PocketGrimoire/GrimoireMenu.tsx`                  | Menu ⋮ de um grimório                                                         |
| `src/components/PocketGrimoire/AddToGrimoireButton.tsx`           | Botão 📖+/✓                                                                   |
| `src/components/PocketGrimoire/GrimoireItemList.tsx`              | Lista resumida (nomes agrupados) usada no balão                               |
| `src/components/PocketGrimoire/PocketGrimoireFab.tsx`             | Botão flutuante com balão ou folha                                            |
| `src/components/PocketGrimoire/PocketGrimoireListPage.tsx`        | Página `/grimorio`                                                            |
| `src/components/PocketGrimoire/PocketGrimoirePage.tsx`            | Página `/grimorio/:id`                                                        |

Arquivos existentes alterados (só inserções): `src/store/index.ts`, `src/App.tsx`, `src/components/SidebarV2/SidebarV2.tsx`, `src/components/screens/Database.tsx`, `src/components/Database/UnifiedSpellsTable.tsx`, `src/components/DatabaseTables/PowersTable.tsx`, `src/components/Database/EncyclopediaSearch.tsx`.

---

### Tarefa 1: modelo e regras puras

**Arquivos:**

- Criar: `src/interfaces/PocketGrimoire.ts`
- Criar: `src/functions/pocketGrimoire/state.ts`
- Criar: `src/functions/pocketGrimoire/itemId.ts`
- Testes: `src/functions/pocketGrimoire/__tests__/state.spec.ts` e `src/functions/pocketGrimoire/__tests__/itemId.spec.ts`

**Interfaces:**

- Produz: `PocketGrimoire`, `PocketGrimoireState`, `DEFAULT_GRIMOIRE_ID`, `DEFAULT_GRIMOIRE_NAME`, `GRIMOIRE_NAME_MAX_LENGTH`; `isRecord(v)`, `createDefaultGrimoire(now)`, `createInitialState(now?)`, `normalizeGrimoireName(raw): string | null`, `uniqueGrimoireName(base, taken): string`, `ensureValidState(input, now?): PocketGrimoireState`; `GrimoireFilter`, `prefixOf(id)`, `nameFromId(id)`, `filterOfId(id)`.

- [ ] **Passo 1: escrever os tipos**

```ts
// src/interfaces/PocketGrimoire.ts
/** Id fixo do grimório que sempre existe e não pode ser excluído. */
export const DEFAULT_GRIMOIRE_ID = 'default';
export const DEFAULT_GRIMOIRE_NAME = 'Padrão';
export const GRIMOIRE_NAME_MAX_LENGTH = 60;

export interface PocketGrimoire {
  id: string;
  name: string;
  /** Ids do índice da enciclopédia (`EncyclopediaEntry.id`), sem repetição. */
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PocketGrimoireState {
  grimoires: PocketGrimoire[];
  activeId: string;
}
```

- [ ] **Passo 2: escrever os testes que falham**

```ts
// src/functions/pocketGrimoire/__tests__/state.spec.ts
import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  ensureValidState,
  normalizeGrimoireName,
  uniqueGrimoireName,
} from '../state';
import { DEFAULT_GRIMOIRE_ID } from '../../../interfaces/PocketGrimoire';

const NOW = '2026-09-18T12:00:00.000Z';

describe('createInitialState', () => {
  it('começa só com o Padrão, ativo e vazio', () => {
    expect(createInitialState(NOW)).toEqual({
      grimoires: [
        {
          id: DEFAULT_GRIMOIRE_ID,
          name: 'Padrão',
          itemIds: [],
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      activeId: DEFAULT_GRIMOIRE_ID,
    });
  });
});

describe('normalizeGrimoireName', () => {
  it('apara e colapsa espaços', () => {
    expect(normalizeGrimoireName('  Mago   da  one-shot ')).toBe(
      'Mago da one-shot'
    );
  });
  it('devolve null para nome vazio', () => {
    expect(normalizeGrimoireName('   ')).toBeNull();
  });
  it('corta em 60 caracteres', () => {
    expect(normalizeGrimoireName('a'.repeat(80))).toHaveLength(60);
  });
});

describe('uniqueGrimoireName', () => {
  it('mantém nome livre', () => {
    expect(uniqueGrimoireName('Clériga', ['Padrão'])).toBe('Clériga');
  });
  it('adiciona sufixo ignorando maiúsculas', () => {
    expect(uniqueGrimoireName('Mago', ['mago', 'Mago (2)'])).toBe('Mago (3)');
  });
  it('não passa de 60 caracteres com o sufixo', () => {
    const base = 'b'.repeat(60);
    const result = uniqueGrimoireName(base, [base]);
    expect(result).toHaveLength(60);
    expect(result.endsWith(' (2)')).toBe(true);
  });
});

describe('ensureValidState', () => {
  it('estado ausente vira o inicial', () => {
    expect(ensureValidState(undefined, NOW)).toEqual(createInitialState(NOW));
  });

  it('lixo vira o inicial', () => {
    expect(ensureValidState('lixo', NOW)).toEqual(createInitialState(NOW));
    expect(ensureValidState({ grimoires: 3 }, NOW)).toEqual(
      createInitialState(NOW)
    );
  });

  it('recria o Padrão quando falta, no início da lista', () => {
    const result = ensureValidState(
      {
        grimoires: [
          { id: 'x', name: 'X', itemIds: [], createdAt: NOW, updatedAt: NOW },
        ],
        activeId: 'x',
      },
      NOW
    );
    expect(result.grimoires.map((g) => g.id)).toEqual([
      DEFAULT_GRIMOIRE_ID,
      'x',
    ]);
    expect(result.activeId).toBe('x');
  });

  it('remove ids repetidos e não-strings dos itens', () => {
    const result = ensureValidState(
      {
        grimoires: [
          {
            id: DEFAULT_GRIMOIRE_ID,
            name: 'Padrão',
            itemIds: ['spell:A', 'spell:A', 42, '', 'spell:B'],
          },
        ],
        activeId: DEFAULT_GRIMOIRE_ID,
      },
      NOW
    );
    expect(result.grimoires[0].itemIds).toEqual(['spell:A', 'spell:B']);
  });

  it('descarta grimórios sem id e ids duplicados de grimório', () => {
    const result = ensureValidState(
      {
        grimoires: [
          { name: 'sem id' },
          { id: 'x', name: 'Primeiro', itemIds: [] },
          { id: 'x', name: 'Duplicado', itemIds: [] },
        ],
        activeId: 'x',
      },
      NOW
    );
    expect(result.grimoires.map((g) => g.name)).toEqual(['Padrão', 'Primeiro']);
  });

  it('activeId inexistente volta para o Padrão', () => {
    const result = ensureValidState(
      { grimoires: [], activeId: 'fantasma' },
      NOW
    );
    expect(result.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('nome vazio ganha nome padrão', () => {
    const result = ensureValidState(
      { grimoires: [{ id: 'x', name: '  ', itemIds: [] }], activeId: 'x' },
      NOW
    );
    expect(result.grimoires[1].name).toBe('Grimório sem nome');
  });
});
```

```ts
// src/functions/pocketGrimoire/__tests__/itemId.spec.ts
import { describe, it, expect } from 'vitest';
import { filterOfId, nameFromId, prefixOf } from '../itemId';

describe('prefixOf', () => {
  it('pega o trecho até o primeiro dois-pontos', () => {
    expect(prefixOf('class-power:Arcanista:Magia Acelerada')).toBe(
      'class-power'
    );
    expect(prefixOf('sem-prefixo')).toBe('');
  });
});

describe('nameFromId', () => {
  it('ids de duas partes', () => {
    expect(nameFromId('spell:Bola de Fogo')).toBe('Bola de Fogo');
    expect(nameFromId('class:Arcanista')).toBe('Arcanista');
  });
  it('ids de três partes descartam o dono', () => {
    expect(nameFromId('power:COMBATE:Ataque Poderoso')).toBe('Ataque Poderoso');
    expect(nameFromId('class-power:Arcanista:Magia Acelerada')).toBe(
      'Magia Acelerada'
    );
  });
  it('preserva dois-pontos dentro do nome', () => {
    expect(
      nameFromId(
        'class-ability:Cavaleiro:Postura de Combate: Aríete Implacável'
      )
    ).toBe('Postura de Combate: Aríete Implacável');
  });
  it('id sem forma conhecida volta inteiro', () => {
    expect(nameFromId('esquisito')).toBe('esquisito');
    expect(nameFromId('spell:')).toBe('spell:');
  });
});

describe('filterOfId', () => {
  it('classifica cada prefixo', () => {
    expect(filterOfId('spell:X')).toBe('spells');
    expect(filterOfId('power:MAGIA:X')).toBe('powers');
    expect(filterOfId('class-power:A:X')).toBe('powers');
    expect(filterOfId('origin-power:A:X')).toBe('powers');
    expect(filterOfId('deity-power:A:X')).toBe('powers');
    expect(filterOfId('class-ability:A:X')).toBe('abilities');
    expect(filterOfId('race-ability:A:X')).toBe('abilities');
    expect(filterOfId('class:X')).toBe('others');
    expect(filterOfId('race:X')).toBe('others');
    expect(filterOfId('origin:X')).toBe('others');
    expect(filterOfId('deity:X')).toBe('others');
  });
  it('prefixo desconhecido não tem categoria', () => {
    expect(filterOfId('coisa:X')).toBeNull();
  });
});
```

- [ ] **Passo 3: rodar e ver falhar**

Rodar: `npx vitest run src/functions/pocketGrimoire`
Esperado: FAIL, com os módulos `../state` e `../itemId` não encontrados.

- [ ] **Passo 4: implementar**

```ts
// src/functions/pocketGrimoire/state.ts
import {
  DEFAULT_GRIMOIRE_ID,
  DEFAULT_GRIMOIRE_NAME,
  GRIMOIRE_NAME_MAX_LENGTH,
  PocketGrimoire,
  PocketGrimoireState,
} from '../../interfaces/PocketGrimoire';

const UNNAMED_GRIMOIRE = 'Grimório sem nome';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function createDefaultGrimoire(now: string): PocketGrimoire {
  return {
    id: DEFAULT_GRIMOIRE_ID,
    name: DEFAULT_GRIMOIRE_NAME,
    itemIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createInitialState(
  now: string = new Date().toISOString()
): PocketGrimoireState {
  return {
    grimoires: [createDefaultGrimoire(now)],
    activeId: DEFAULT_GRIMOIRE_ID,
  };
}

/** Nome limpo (aparado, espaços colapsados, até 60 caracteres) ou `null`. */
export function normalizeGrimoireName(raw: string): string | null {
  const name = raw
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, GRIMOIRE_NAME_MAX_LENGTH)
    .trim();
  return name.length > 0 ? name : null;
}

/**
 * Evita dois grimórios com o mesmo nome (sem diferenciar maiúsculas):
 * "Mago" já existe → "Mago (2)", "Mago (3)"… sempre dentro do limite de
 * tamanho.
 */
export function uniqueGrimoireName(base: string, taken: string[]): string {
  const key = (name: string) => name.toLocaleLowerCase('pt-BR');
  const takenKeys = new Set(taken.map(key));
  if (!takenKeys.has(key(base))) return base;

  const withSuffix = (n: number) => {
    const suffix = ` (${n})`;
    const room = GRIMOIRE_NAME_MAX_LENGTH - suffix.length;
    return `${base.slice(0, room).trimEnd()}${suffix}`;
  };

  let n = 2;
  while (takenKeys.has(key(withSuffix(n)))) n += 1;
  return withSuffix(n);
}

function sanitizeGrimoire(raw: unknown, now: string): PocketGrimoire | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || raw.id.length === 0) {
    return null;
  }
  const name =
    typeof raw.name === 'string' ? normalizeGrimoireName(raw.name) : null;
  const rawItems = Array.isArray(raw.itemIds) ? raw.itemIds : [];
  const itemIds = Array.from(
    new Set(
      rawItems.filter(
        (item): item is string => typeof item === 'string' && item.length > 0
      )
    )
  );
  const fallbackName =
    raw.id === DEFAULT_GRIMOIRE_ID ? DEFAULT_GRIMOIRE_NAME : UNNAMED_GRIMOIRE;

  return {
    id: raw.id,
    name: name ?? fallbackName,
    itemIds,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
  };
}

/**
 * Transforma qualquer coisa vinda de fora (localStorage, versão antiga do app,
 * edição manual) num estado que respeita as invariantes: o Padrão existe, o
 * ativo existe, nenhum id se repete.
 */
export function ensureValidState(
  input: unknown,
  now: string = new Date().toISOString()
): PocketGrimoireState {
  const rawList =
    isRecord(input) && Array.isArray(input.grimoires) ? input.grimoires : [];

  const seen = new Set<string>();
  const grimoires: PocketGrimoire[] = [];
  rawList.forEach((raw) => {
    const grimoire = sanitizeGrimoire(raw, now);
    if (grimoire && !seen.has(grimoire.id)) {
      seen.add(grimoire.id);
      grimoires.push(grimoire);
    }
  });

  if (!seen.has(DEFAULT_GRIMOIRE_ID)) {
    grimoires.unshift(createDefaultGrimoire(now));
  }

  const requestedActive = isRecord(input) ? input.activeId : undefined;
  const activeId =
    typeof requestedActive === 'string' &&
    grimoires.some((g) => g.id === requestedActive)
      ? requestedActive
      : DEFAULT_GRIMOIRE_ID;

  return { grimoires, activeId };
}
```

```ts
// src/functions/pocketGrimoire/itemId.ts
/**
 * Anatomia dos ids do índice da enciclopédia (ver `buildEncyclopediaIndex`):
 * `<prefixo>:<nome>` para entidades e magias, `<prefixo>:<dono>:<nome>` para
 * poderes e habilidades. Nomes podem conter ":" ("Postura de Combate: …").
 */
export type GrimoireFilter =
  | 'all'
  | 'spells'
  | 'powers'
  | 'abilities'
  | 'others';

export type GrimoireCategory = Exclude<GrimoireFilter, 'all'>;

const TWO_PART_PREFIXES = ['spell', 'race', 'class', 'origin', 'deity'];

const CATEGORY_BY_PREFIX: Record<string, GrimoireCategory> = {
  spell: 'spells',
  power: 'powers',
  'class-power': 'powers',
  'origin-power': 'powers',
  'deity-power': 'powers',
  'class-ability': 'abilities',
  'race-ability': 'abilities',
  class: 'others',
  race: 'others',
  origin: 'others',
  deity: 'others',
};

export function prefixOf(id: string): string {
  const colon = id.indexOf(':');
  return colon === -1 ? '' : id.slice(0, colon);
}

/** Nome legível extraído do id, para itens que não estão mais no índice. */
export function nameFromId(id: string): string {
  const [prefix, ...rest] = id.split(':');
  if (rest.length === 0) return id;
  const nameParts = TWO_PART_PREFIXES.includes(prefix) ? rest : rest.slice(1);
  const name = nameParts.join(':').trim();
  return name.length > 0 ? name : id;
}

export function filterOfId(id: string): GrimoireCategory | null {
  return CATEGORY_BY_PREFIX[prefixOf(id)] ?? null;
}
```

- [ ] **Passo 5: rodar e ver passar**

Rodar: `npx vitest run src/functions/pocketGrimoire`
Esperado: PASS em todos.

- [ ] **Passo 6: lint, formatação e commit**

```bash
npx prettier --write src/interfaces/PocketGrimoire.ts src/functions/pocketGrimoire
npx eslint --max-warnings=0 src/interfaces/PocketGrimoire.ts src/functions/pocketGrimoire
git add src/interfaces/PocketGrimoire.ts src/functions/pocketGrimoire
git commit -m "feat(grimorio): modelo e regras puras do grimório de bolso"
```

---

### Tarefa 2: slice Redux persistido

**Arquivos:**

- Criar: `src/store/slices/pocketGrimoire/pocketGrimoireSlice.ts`
- Modificar: `src/store/index.ts` (imports, config de persist e registro do reducer)
- Teste: `src/store/slices/pocketGrimoire/__tests__/pocketGrimoireSlice.spec.ts`

**Interfaces:**

- Consome: tudo de `state.ts` e `PocketGrimoire.ts` (Tarefa 1).
- Produz: `default` (reducer); actions `addItem(grimoireId, itemId)`, `removeItem(grimoireId, itemId)`, `createGrimoire(name?)`, `renameGrimoire(id, name)`, `duplicateGrimoire(sourceId)`, `deleteGrimoire(id)`, `setActive(id)`, `importGrimoire(name, itemIds)`, em que `createGrimoire`, `duplicateGrimoire` e `importGrimoire` levam `payload.id` com o id novo; `WithPocketGrimoire`; selectors `selectGrimoires`, `selectActiveId`, `selectActiveGrimoire`, `selectGrimoireById(id?)`; `migratePocketGrimoire(state)`.

- [ ] **Passo 1: escrever os testes que falham**

```ts
// src/store/slices/pocketGrimoire/__tests__/pocketGrimoireSlice.spec.ts
import { describe, it, expect } from 'vitest';
import reducer, {
  addItem,
  createGrimoire,
  deleteGrimoire,
  duplicateGrimoire,
  importGrimoire,
  migratePocketGrimoire,
  removeItem,
  renameGrimoire,
  selectActiveGrimoire,
  selectGrimoireById,
  setActive,
} from '../pocketGrimoireSlice';
import { createInitialState } from '../../../../functions/pocketGrimoire/state';
import {
  DEFAULT_GRIMOIRE_ID,
  PocketGrimoireState,
} from '../../../../interfaces/PocketGrimoire';

const initial = (): PocketGrimoireState =>
  createInitialState('2026-01-01T00:00:00.000Z');

const withGrimoire = (name: string) => {
  const action = createGrimoire(name);
  return { state: reducer(initial(), action), id: action.payload.id };
};

describe('itens', () => {
  it('adiciona sem duplicar e atualiza updatedAt', () => {
    let state = reducer(initial(), addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    state = reducer(state, addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    expect(state.grimoires[0].itemIds).toEqual(['spell:A']);
    expect(state.grimoires[0].updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
  });

  it('remove', () => {
    let state = reducer(initial(), addItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    state = reducer(state, removeItem(DEFAULT_GRIMOIRE_ID, 'spell:A'));
    expect(state.grimoires[0].itemIds).toEqual([]);
  });

  it('ignora grimório inexistente', () => {
    const state = reducer(initial(), addItem('fantasma', 'spell:A'));
    expect(state).toEqual(initial());
  });
});

describe('criar, renomear, duplicar', () => {
  it('cria com id do prepare, sem virar ativo', () => {
    const { state, id } = withGrimoire('Mago da one-shot');
    expect(state.grimoires[1]).toMatchObject({ id, name: 'Mago da one-shot' });
    expect(state.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('cria com nome padrão e sem colisão', () => {
    let state = reducer(initial(), createGrimoire());
    state = reducer(state, createGrimoire('   '));
    expect(state.grimoires.map((g) => g.name)).toEqual([
      'Padrão',
      'Novo grimório',
      'Novo grimório (2)',
    ]);
  });

  it('renomeia, ignora nome vazio e evita colisão com outro', () => {
    const { state: s1, id } = withGrimoire('Mago');
    let state = reducer(s1, renameGrimoire(id, '  Arcanista  '));
    expect(selectGrimoireById(id)({ pocketGrimoire: state })?.name).toBe(
      'Arcanista'
    );
    state = reducer(state, renameGrimoire(id, '   '));
    expect(selectGrimoireById(id)({ pocketGrimoire: state })?.name).toBe(
      'Arcanista'
    );
    state = reducer(state, renameGrimoire(id, 'padrão'));
    expect(selectGrimoireById(id)({ pocketGrimoire: state })?.name).toBe(
      'padrão (2)'
    );
  });

  it('renomear para o próprio nome não gera sufixo', () => {
    const { state: s1, id } = withGrimoire('Mago');
    const state = reducer(s1, renameGrimoire(id, 'Mago'));
    expect(selectGrimoireById(id)({ pocketGrimoire: state })?.name).toBe(
      'Mago'
    );
  });

  it('duplica com os mesmos itens e nome de cópia', () => {
    const { state: s1, id } = withGrimoire('Mago');
    const s2 = reducer(s1, addItem(id, 'spell:A'));
    const dup = duplicateGrimoire(id);
    const state = reducer(s2, dup);
    const copy = selectGrimoireById(dup.payload.id)({ pocketGrimoire: state });
    expect(copy).toMatchObject({ name: 'Mago (cópia)', itemIds: ['spell:A'] });
  });

  it('a cópia não compartilha a lista de itens com o original', () => {
    const { state: s1, id } = withGrimoire('Mago');
    const dup = duplicateGrimoire(id);
    let state = reducer(s1, dup);
    state = reducer(state, addItem(dup.payload.id, 'spell:B'));
    expect(selectGrimoireById(id)({ pocketGrimoire: state })?.itemIds).toEqual(
      []
    );
  });
});

describe('excluir e ativar', () => {
  it('não exclui o Padrão', () => {
    const state = reducer(initial(), deleteGrimoire(DEFAULT_GRIMOIRE_ID));
    expect(state.grimoires).toHaveLength(1);
  });

  it('excluir o ativo volta o ativo para o Padrão', () => {
    const { state: s1, id } = withGrimoire('Mago');
    let state = reducer(s1, setActive(id));
    expect(state.activeId).toBe(id);
    state = reducer(state, deleteGrimoire(id));
    expect(state.grimoires).toHaveLength(1);
    expect(state.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('setActive ignora id inexistente', () => {
    const state = reducer(initial(), setActive('fantasma'));
    expect(state.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('selectActiveGrimoire devolve o ativo', () => {
    const { state: s1, id } = withGrimoire('Mago');
    const state = reducer(s1, setActive(id));
    expect(selectActiveGrimoire({ pocketGrimoire: state }).id).toBe(id);
  });
});

describe('importar', () => {
  it('cria grimório novo, sem duplicatas e com nome único', () => {
    const { state: s1 } = withGrimoire('Mago');
    const action = importGrimoire('Mago', ['spell:A', 'spell:A', 'spell:B']);
    const state = reducer(s1, action);
    const imported = selectGrimoireById(action.payload.id)({
      pocketGrimoire: state,
    });
    expect(imported).toMatchObject({
      name: 'Mago (2)',
      itemIds: ['spell:A', 'spell:B'],
    });
    expect(state.activeId).toBe(DEFAULT_GRIMOIRE_ID);
  });

  it('nome vazio vira "Grimório importado"', () => {
    const action = importGrimoire('', []);
    const state = reducer(initial(), action);
    expect(
      selectGrimoireById(action.payload.id)({ pocketGrimoire: state })?.name
    ).toBe('Grimório importado');
  });
});

describe('migratePocketGrimoire', () => {
  it('mantém undefined (primeira execução)', async () => {
    await expect(migratePocketGrimoire(undefined)).resolves.toBeUndefined();
  });

  it('conserta estado corrompido e preserva a chave de controle do persist', async () => {
    const persisted = {
      grimoires: 'lixo',
      activeId: 'x',
      _persist: { version: -1, rehydrated: false },
    };
    const result = (await migratePocketGrimoire(
      persisted as unknown as Parameters<typeof migratePocketGrimoire>[0]
    )) as unknown as Record<string, unknown>;
    expect(result.activeId).toBe(DEFAULT_GRIMOIRE_ID);
    expect(result).toHaveProperty('_persist');
    expect((result.grimoires as unknown[]).length).toBe(1);
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

Rodar: `npx vitest run src/store/slices/pocketGrimoire`
Esperado: FAIL, com `../pocketGrimoireSlice` não encontrado.

- [ ] **Passo 3: implementar o slice**

```ts
// src/store/slices/pocketGrimoire/pocketGrimoireSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistedState } from 'redux-persist';
import { v4 as uuid } from 'uuid';
import {
  DEFAULT_GRIMOIRE_ID,
  PocketGrimoire,
  PocketGrimoireState,
} from '../../../interfaces/PocketGrimoire';
import {
  createInitialState,
  ensureValidState,
  normalizeGrimoireName,
  uniqueGrimoireName,
} from '../../../functions/pocketGrimoire/state';

const NEW_GRIMOIRE_NAME = 'Novo grimório';
const IMPORTED_GRIMOIRE_NAME = 'Grimório importado';

interface ItemPayload {
  grimoireId: string;
  itemId: string;
  now: string;
}

interface NewGrimoirePayload {
  id: string;
  now: string;
  name: string;
  itemIds: string[];
}

interface RenamePayload {
  id: string;
  name: string;
  now: string;
}

interface DuplicatePayload {
  id: string;
  now: string;
  sourceId: string;
}

const isoNow = () => new Date().toISOString();

const findGrimoire = (state: PocketGrimoireState, id: string) =>
  state.grimoires.find((g) => g.id === id);

const namesExcept = (state: PocketGrimoireState, exceptId?: string) =>
  state.grimoires.filter((g) => g.id !== exceptId).map((g) => g.name);

const pushGrimoire = (
  state: PocketGrimoireState,
  { id, now, name, itemIds }: NewGrimoirePayload,
  fallbackName: string
) => {
  const grimoire: PocketGrimoire = {
    id,
    name: uniqueGrimoireName(
      normalizeGrimoireName(name) ?? fallbackName,
      namesExcept(state)
    ),
    itemIds: Array.from(new Set(itemIds)),
    createdAt: now,
    updatedAt: now,
  };
  state.grimoires.push(grimoire);
};

export const pocketGrimoireSlice = createSlice({
  name: 'pocketGrimoire',
  initialState: () => createInitialState(),
  reducers: {
    addItem: {
      reducer(state, action: PayloadAction<ItemPayload>) {
        const { grimoireId, itemId, now } = action.payload;
        const grimoire = findGrimoire(state, grimoireId);
        if (grimoire && !grimoire.itemIds.includes(itemId)) {
          grimoire.itemIds.push(itemId);
          grimoire.updatedAt = now;
        }
      },
      prepare(grimoireId: string, itemId: string) {
        return { payload: { grimoireId, itemId, now: isoNow() } };
      },
    },
    removeItem: {
      reducer(state, action: PayloadAction<ItemPayload>) {
        const { grimoireId, itemId, now } = action.payload;
        const grimoire = findGrimoire(state, grimoireId);
        if (grimoire && grimoire.itemIds.includes(itemId)) {
          grimoire.itemIds = grimoire.itemIds.filter((id) => id !== itemId);
          grimoire.updatedAt = now;
        }
      },
      prepare(grimoireId: string, itemId: string) {
        return { payload: { grimoireId, itemId, now: isoNow() } };
      },
    },
    createGrimoire: {
      reducer(state, action: PayloadAction<NewGrimoirePayload>) {
        pushGrimoire(state, action.payload, NEW_GRIMOIRE_NAME);
      },
      prepare(name = '') {
        return { payload: { id: uuid(), now: isoNow(), name, itemIds: [] } };
      },
    },
    importGrimoire: {
      reducer(state, action: PayloadAction<NewGrimoirePayload>) {
        pushGrimoire(state, action.payload, IMPORTED_GRIMOIRE_NAME);
      },
      prepare(name: string, itemIds: string[]) {
        return { payload: { id: uuid(), now: isoNow(), name, itemIds } };
      },
    },
    renameGrimoire: {
      reducer(state, action: PayloadAction<RenamePayload>) {
        const { id, name, now } = action.payload;
        const grimoire = findGrimoire(state, id);
        const normalized = normalizeGrimoireName(name);
        if (grimoire && normalized) {
          grimoire.name = uniqueGrimoireName(
            normalized,
            namesExcept(state, id)
          );
          grimoire.updatedAt = now;
        }
      },
      prepare(id: string, name: string) {
        return { payload: { id, name, now: isoNow() } };
      },
    },
    duplicateGrimoire: {
      reducer(state, action: PayloadAction<DuplicatePayload>) {
        const { id, now, sourceId } = action.payload;
        const source = findGrimoire(state, sourceId);
        if (source) {
          pushGrimoire(
            state,
            {
              id,
              now,
              name: `${source.name} (cópia)`,
              itemIds: [...source.itemIds],
            },
            NEW_GRIMOIRE_NAME
          );
        }
      },
      prepare(sourceId: string) {
        return { payload: { id: uuid(), now: isoNow(), sourceId } };
      },
    },
    deleteGrimoire(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (id !== DEFAULT_GRIMOIRE_ID) {
        state.grimoires = state.grimoires.filter((g) => g.id !== id);
        if (state.activeId === id) state.activeId = DEFAULT_GRIMOIRE_ID;
      }
    },
    setActive(state, action: PayloadAction<string>) {
      if (findGrimoire(state, action.payload)) {
        state.activeId = action.payload;
      }
    },
  },
});

export const {
  addItem,
  removeItem,
  createGrimoire,
  importGrimoire,
  renameGrimoire,
  duplicateGrimoire,
  deleteGrimoire,
  setActive,
} = pocketGrimoireSlice.actions;

export default pocketGrimoireSlice.reducer;

/** Formato mínimo que os selectors precisam (RootState ou store de teste). */
export interface WithPocketGrimoire {
  pocketGrimoire: PocketGrimoireState;
}

export const selectGrimoires = (state: WithPocketGrimoire) =>
  state.pocketGrimoire.grimoires;

export const selectActiveId = (state: WithPocketGrimoire) =>
  state.pocketGrimoire.activeId;

export const selectActiveGrimoire = (
  state: WithPocketGrimoire
): PocketGrimoire =>
  findGrimoire(state.pocketGrimoire, state.pocketGrimoire.activeId) ??
  state.pocketGrimoire.grimoires[0];

export const selectGrimoireById =
  (id: string | undefined) =>
  (state: WithPocketGrimoire): PocketGrimoire | undefined =>
    id === undefined ? undefined : findGrimoire(state.pocketGrimoire, id);

/**
 * `migrate` do redux-persist: o localStorage é entrada externa (outra versão
 * do app, edição manual), então o que chega passa por `ensureValidState`
 * antes de virar estado. O spread preserva a chave de controle do persist.
 */
export const migratePocketGrimoire = (
  state: PersistedState
): Promise<PersistedState> =>
  Promise.resolve(
    state ? ({ ...state, ...ensureValidState(state) } as PersistedState) : state
  );
```

- [ ] **Passo 4: rodar e ver passar**

Rodar: `npx vitest run src/store/slices/pocketGrimoire`
Esperado: PASS em todos.

- [ ] **Passo 5: registrar na store**

Em `src/store/index.ts`, logo após o import de `notificationReducer`:

```ts
import pocketGrimoireReducer, {
  migratePocketGrimoire,
} from './slices/pocketGrimoire/pocketGrimoireSlice';
```

Logo após `subscriptionPersistConfig`:

```ts
export const pocketGrimoirePersistConfig = {
  key: 'pocketGrimoire',
  storage,
  migrate: migratePocketGrimoire,
};
```

Logo após `persistedSubscriptionReducer`:

```ts
const persistedPocketGrimoireReducer = persistReducer(
  pocketGrimoirePersistConfig,
  pocketGrimoireReducer
);
```

No objeto `reducer` do `configureStore`, depois de `notification: notificationReducer,`:

```ts
    pocketGrimoire: persistedPocketGrimoireReducer,
```

- [ ] **Passo 6: conferir tipos e lint**

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "pocketGrimoire|PocketGrimoire|store/index" ; echo "exit: fim"
npx prettier --write src/store/index.ts src/store/slices/pocketGrimoire
npx eslint --max-warnings=0 src/store/index.ts src/store/slices/pocketGrimoire
```

Esperado: nenhuma linha de erro do `tsc` citando esses arquivos. ESLint sem saída.

- [ ] **Passo 7: commit**

```bash
git add src/store/index.ts src/store/slices/pocketGrimoire
git commit -m "feat(grimorio): slice Redux persistido do grimório de bolso"
```

---

### Tarefa 3: resolvedor de ids

**Arquivos:**

- Criar: `src/functions/pocketGrimoire/resolveItems.ts`
- Teste: `src/functions/pocketGrimoire/__tests__/resolveItems.spec.ts`

**Interfaces:**

- Consome: `buildEncyclopediaIndex`, `EncyclopediaEntry` (`src/functions/encyclopediaSearch.ts`); `dataRegistry`, `GeneralPowerWithSupplement` (`src/data/registry.ts`); `nameFromId`, `prefixOf`, `filterOfId`, `GrimoireFilter` (Tarefa 1).
- Produz: `SpellKind`, `GrimoireSpell`, `ResolvedItem`, `ResolvedGroup`; `getGrimoireCatalog()`, `getFullEncyclopediaIndex()`, `resolveItem(id)`, `resolveItems(ids)`, `itemTitle(item)`, `groupResolvedItems(items)`, `matchesFilter(item, filter)`, `encyclopediaPath(entry)`.

- [ ] **Passo 1: escrever os testes que falham**

```ts
// src/functions/pocketGrimoire/__tests__/resolveItems.spec.ts
import { describe, it, expect } from 'vitest';
import {
  getFullEncyclopediaIndex,
  getGrimoireCatalog,
  groupResolvedItems,
  itemTitle,
  matchesFilter,
  resolveItem,
  resolveItems,
  encyclopediaPath,
} from '../resolveItems';
import { buildEncyclopediaIndex } from '../../encyclopediaSearch';
import { prefixOf } from '../itemId';

const firstIdWithPrefix = (prefix: string) => {
  const entry = getFullEncyclopediaIndex().find(
    (e) => prefixOf(e.id) === prefix
  );
  if (!entry) throw new Error(`nenhum item com prefixo ${prefix}`);
  return entry.id;
};

describe('resolveItem', () => {
  it('magia vem completa', () => {
    const item = resolveItem('spell:Bola de Fogo');
    expect(item.kind).toBe('spell');
    if (item.kind === 'spell') {
      expect(item.spell.alcance).toBe('Médio');
      expect(item.spell.circle).toBe(2);
      expect(item.spell.aprimoramentos?.length).toBeGreaterThan(0);
    }
  });

  it('cada prefixo resolve para o tipo certo', () => {
    const expected: Record<string, string> = {
      spell: 'spell',
      power: 'power',
      'class-power': 'generic',
      'class-ability': 'generic',
      'race-ability': 'generic',
      'origin-power': 'generic',
      'deity-power': 'generic',
      class: 'summary',
      race: 'summary',
      origin: 'summary',
      deity: 'summary',
    };
    Object.entries(expected).forEach(([prefix, kind]) => {
      expect(resolveItem(firstIdWithPrefix(prefix)).kind).toBe(kind);
    });
  });

  it('id inexistente vira missing com nome legível', () => {
    expect(resolveItem('spell:Magia Que Não Existe')).toEqual({
      kind: 'missing',
      id: 'spell:Magia Que Não Existe',
      name: 'Magia Que Não Existe',
    });
  });

  it('magia arcana e divina vira um item só com os dois tipos', () => {
    const both = Array.from(getGrimoireCatalog().spells.values()).find(
      (s) => s.spellTypes.length === 2
    );
    expect(both).toBeDefined();
    const item = resolveItem(`spell:${both?.nome}`);
    expect(item.kind === 'spell' && item.spell.spellTypes).toEqual([
      'Arcana',
      'Divina',
    ]);
  });

  it('resolve itens fora do conjunto padrão de suplementos', () => {
    const defaultIds = new Set(buildEncyclopediaIndex().map((e) => e.id));
    const extra = getFullEncyclopediaIndex().find((e) => !defaultIds.has(e.id));
    expect(extra).toBeDefined();
    expect(resolveItem(extra?.id ?? '').kind).not.toBe('missing');
  });
});

describe('proteção contra regressão do índice', () => {
  it('toda magia e todo poder geral do índice têm dados completos', () => {
    const problems = getFullEncyclopediaIndex()
      .filter((e) => ['spell', 'power'].includes(prefixOf(e.id)))
      .map((e) => ({ id: e.id, kind: resolveItem(e.id).kind }))
      .filter(({ id, kind }) => kind !== prefixOf(id));
    expect(problems).toEqual([]);
  });
});

describe('groupResolvedItems', () => {
  it('ordena grupos e itens', () => {
    const items = resolveItems([
      'spell:Bola de Fogo',
      'spell:Magia Fantasma',
      firstIdWithPrefix('class-power'),
      'spell:Seta Infalível de Talude',
      firstIdWithPrefix('class'),
    ]);
    const groups = groupResolvedItems(items);
    const keys = groups.map((g) => g.key);
    expect(keys.indexOf('spell-1')).toBeLessThan(keys.indexOf('spell-2'));
    expect(keys.indexOf('spell-2')).toBeLessThan(keys.indexOf('class-power'));
    expect(keys.indexOf('class-power')).toBeLessThan(keys.indexOf('class'));
    expect(keys[keys.length - 1]).toBe('missing');
    expect(groups.find((g) => g.key === 'missing')?.label).toBe(
      'Não encontrados'
    );
  });

  it('ordem alfabética dentro do grupo', () => {
    const groups = groupResolvedItems(
      resolveItems(['spell:Zzz inexistente', 'spell:Aaa inexistente'])
    );
    expect(groups[0].items.map(itemTitle)).toEqual([
      'Aaa inexistente',
      'Zzz inexistente',
    ]);
  });
});

describe('matchesFilter', () => {
  it('filtra por categoria e mostra missing em todos', () => {
    const spell = resolveItem('spell:Bola de Fogo');
    const missing = resolveItem('spell:Nada');
    expect(matchesFilter(spell, 'spells')).toBe(true);
    expect(matchesFilter(spell, 'powers')).toBe(false);
    expect(matchesFilter(spell, 'all')).toBe(true);
    expect(matchesFilter(missing, 'powers')).toBe(true);
  });
});

describe('encyclopediaPath', () => {
  it('aponta para a aba e o item', () => {
    const item = resolveItem('spell:Bola de Fogo');
    expect(item.kind !== 'missing' && encyclopediaPath(item.entry)).toBe(
      '/database/magias/Bola%20de%20Fogo'
    );
  });
});
```

> "Seta Infalível de Talude" é de 1º círculo (`generalSpells.ts:1626`), "Bola de Fogo" de 2º, e "Magia Fantasma" não existe (vira `missing`).

- [ ] **Passo 2: rodar e ver falhar**

Rodar: `npx vitest run src/functions/pocketGrimoire/__tests__/resolveItems.spec.ts`
Esperado: FAIL, com `../resolveItems` não encontrado.

- [ ] **Passo 3: implementar**

```ts
// src/functions/pocketGrimoire/resolveItems.ts
import {
  buildEncyclopediaIndex,
  EncyclopediaEntry,
} from '../encyclopediaSearch';
import { dataRegistry, GeneralPowerWithSupplement } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { Spell, SpellCircle } from '../../interfaces/Spells';
import { GeneralPowerType } from '../../interfaces/Poderes';
import { filterOfId, GrimoireFilter, nameFromId, prefixOf } from './itemId';

export type SpellKind = 'Arcana' | 'Divina';

export interface GrimoireSpell extends Spell {
  spellTypes: SpellKind[];
  circle: number;
}

export type ResolvedItem =
  | {
      kind: 'spell';
      id: string;
      entry: EncyclopediaEntry;
      spell: GrimoireSpell;
    }
  | {
      kind: 'power';
      id: string;
      entry: EncyclopediaEntry;
      power: GeneralPowerWithSupplement;
    }
  | { kind: 'generic'; id: string; entry: EncyclopediaEntry }
  | { kind: 'summary'; id: string; entry: EncyclopediaEntry }
  | { kind: 'missing'; id: string; name: string };

export interface ResolvedGroup {
  key: string;
  label: string;
  items: ResolvedItem[];
}

interface GrimoireCatalog {
  index: EncyclopediaEntry[];
  byId: Map<string, EncyclopediaEntry>;
  /** Por nome da magia (é o `param` das entradas `spell:`). */
  spells: Map<string, GrimoireSpell>;
  /** Pelo id do índice (`power:<tipo>:<nome>`). */
  powers: Map<string, GeneralPowerWithSupplement>;
}

/**
 * Todos os suplementos, de propósito: um item guardado no grimório não pode
 * "sumir" porque o suplemento dele está desativado na enciclopédia.
 */
const ALL_SUPPLEMENTS = Object.values(SupplementId);

const SUMMARY_PREFIXES = ['class', 'race', 'origin', 'deity'];

const GROUPS: { key: string; label: string }[] = [
  { key: 'spell-1', label: 'Magias · 1º círculo' },
  { key: 'spell-2', label: 'Magias · 2º círculo' },
  { key: 'spell-3', label: 'Magias · 3º círculo' },
  { key: 'spell-4', label: 'Magias · 4º círculo' },
  { key: 'spell-5', label: 'Magias · 5º círculo' },
  { key: 'power', label: 'Poderes gerais' },
  { key: 'class-power', label: 'Poderes de classe' },
  { key: 'class-ability', label: 'Habilidades de classe' },
  { key: 'origin-power', label: 'Poderes de origem' },
  { key: 'deity-power', label: 'Poderes concedidos' },
  { key: 'race-ability', label: 'Habilidades de raça' },
  { key: 'class', label: 'Classes' },
  { key: 'race', label: 'Raças' },
  { key: 'origin', label: 'Origens' },
  { key: 'deity', label: 'Divindades' },
  { key: 'other', label: 'Outros' },
  { key: 'missing', label: 'Não encontrados' },
];

const KNOWN_GROUP_KEYS = new Set(GROUPS.map((g) => g.key));

function collectSpells(): Map<string, GrimoireSpell> {
  const spells = new Map<string, GrimoireSpell>();

  const add = (circle: SpellCircle, kind: SpellKind, circleNumber: number) => {
    Object.values(circle).forEach((spellsOfSchool) => {
      spellsOfSchool.forEach((spell) => {
        const existing = spells.get(spell.nome);
        if (existing) {
          if (!existing.spellTypes.includes(kind))
            existing.spellTypes.push(kind);
        } else {
          spells.set(spell.nome, {
            ...spell,
            spellTypes: [kind],
            circle: circleNumber,
          });
        }
      });
    });
  };

  for (let circle = 1; circle <= 5; circle += 1) {
    const { arcane, divine } = dataRegistry.getSpellsByCircleAndSupplements(
      circle,
      ALL_SUPPLEMENTS
    );
    add(arcane, 'Arcana', circle);
    add(divine, 'Divina', circle);
  }
  return spells;
}

function collectPowers(): Map<string, GeneralPowerWithSupplement> {
  const powers = new Map<string, GeneralPowerWithSupplement>();
  const byType = dataRegistry.getPowersWithSupplementInfo(ALL_SUPPLEMENTS);
  (Object.keys(byType) as GeneralPowerType[]).forEach((type) => {
    byType[type].forEach((power) => {
      powers.set(`power:${type}:${power.name}`, power);
    });
  });
  return powers;
}

let catalog: GrimoireCatalog | null = null;

/** Índice completo e dados detalhados, montados uma vez por sessão. */
export function getGrimoireCatalog(): GrimoireCatalog {
  if (!catalog) {
    const index = buildEncyclopediaIndex(ALL_SUPPLEMENTS);
    catalog = {
      index,
      byId: new Map(index.map((entry) => [entry.id, entry])),
      spells: collectSpells(),
      powers: collectPowers(),
    };
  }
  return catalog;
}

export const getFullEncyclopediaIndex = (): EncyclopediaEntry[] =>
  getGrimoireCatalog().index;

export function resolveItem(id: string): ResolvedItem {
  const { byId, spells, powers } = getGrimoireCatalog();
  const entry = byId.get(id);
  if (!entry) return { kind: 'missing', id, name: nameFromId(id) };

  const prefix = prefixOf(id);
  const spell = prefix === 'spell' ? spells.get(entry.param) : undefined;
  if (spell) return { kind: 'spell', id, entry, spell };

  const power = prefix === 'power' ? powers.get(id) : undefined;
  if (power) return { kind: 'power', id, entry, power };

  if (SUMMARY_PREFIXES.includes(prefix)) return { kind: 'summary', id, entry };
  return { kind: 'generic', id, entry };
}

export const resolveItems = (ids: string[]): ResolvedItem[] =>
  ids.map(resolveItem);

export const itemTitle = (item: ResolvedItem): string =>
  item.kind === 'missing' ? item.name : item.entry.title;

function groupKeyOf(item: ResolvedItem): string {
  if (item.kind === 'missing') return 'missing';
  if (item.kind === 'spell') return `spell-${item.spell.circle}`;
  const prefix = prefixOf(item.id);
  return KNOWN_GROUP_KEYS.has(prefix) ? prefix : 'other';
}

export function groupResolvedItems(items: ResolvedItem[]): ResolvedGroup[] {
  const buckets = new Map<string, ResolvedItem[]>();
  items.forEach((item) => {
    const key = groupKeyOf(item);
    buckets.set(key, [...(buckets.get(key) ?? []), item]);
  });

  return GROUPS.filter((group) => buckets.has(group.key)).map((group) => ({
    ...group,
    items: [...(buckets.get(group.key) ?? [])].sort((a, b) =>
      itemTitle(a).localeCompare(itemTitle(b), 'pt-BR')
    ),
  }));
}

/** Itens não encontrados aparecem em todos os filtros, para não sumirem. */
export function matchesFilter(
  item: ResolvedItem,
  filter: GrimoireFilter
): boolean {
  if (filter === 'all' || item.kind === 'missing') return true;
  return filterOfId(item.id) === filter;
}

export const encyclopediaPath = (entry: EncyclopediaEntry): string =>
  `/database/${entry.route}/${encodeURIComponent(entry.param)}`;
```

- [ ] **Passo 4: rodar e ver passar**

Rodar: `npx vitest run src/functions/pocketGrimoire`
Esperado: PASS em todos. Se a proteção contra regressão falhar, **não afrouxe o teste**: investigue o id e corrija o resolvedor (ou registre o caso na spec como item de dados).

- [ ] **Passo 5: lint, formatação e commit**

```bash
npx prettier --write src/functions/pocketGrimoire
npx eslint --max-warnings=0 src/functions/pocketGrimoire
git add src/functions/pocketGrimoire
git commit -m "feat(grimorio): resolve ids do índice em conteúdo completo"
```

---

### Tarefa 4: exportar e importar (lógica)

**Arquivos:**

- Criar: `src/functions/pocketGrimoire/exchange.ts`
- Teste: `src/functions/pocketGrimoire/__tests__/exchange.spec.ts`

**Interfaces:**

- Consome: `PocketGrimoire` (Tarefa 1), `isRecord` (Tarefa 1), `normalizeSearch` (`src/functions/stringUtils.ts`).
- Produz: `GRIMOIRE_FILE_FORMAT`, `GRIMOIRE_FILE_VERSION`, `MAX_IMPORT_BYTES`, `MAX_IMPORT_ITEMS`, `IMPORT_ERRORS`, `GrimoireFile`, `ImportResult`, `exportGrimoire(grimoire, resolveName, now?)`, `parseGrimoireImport(text)`, `grimoireFileName(name)`.

- [ ] **Passo 1: escrever os testes que falham**

```ts
// src/functions/pocketGrimoire/__tests__/exchange.spec.ts
import { describe, it, expect } from 'vitest';
import {
  exportGrimoire,
  grimoireFileName,
  IMPORT_ERRORS,
  MAX_IMPORT_ITEMS,
  parseGrimoireImport,
} from '../exchange';
import { PocketGrimoire } from '../../../interfaces/PocketGrimoire';

const grimoire: PocketGrimoire = {
  id: 'x',
  name: 'Mago da one-shot',
  itemIds: ['spell:Bola de Fogo', 'class-power:Arcanista:Magia Acelerada'],
  createdAt: '2026-09-18T00:00:00.000Z',
  updatedAt: '2026-09-18T00:00:00.000Z',
};

const resolveName = (id: string) => id.split(':').pop() ?? id;
const NOW = new Date('2026-09-18T21:30:00.000Z');

const fileWith = (patch: Record<string, unknown>) =>
  JSON.stringify({
    formato: 'fichas-de-nimb/grimorio-de-bolso',
    versao: 1,
    exportadoEm: NOW.toISOString(),
    grimorio: { nome: 'X', itens: [] },
    ...patch,
  });

describe('exportGrimoire', () => {
  it('gera o formato documentado', () => {
    expect(JSON.parse(exportGrimoire(grimoire, resolveName, NOW))).toEqual({
      formato: 'fichas-de-nimb/grimorio-de-bolso',
      versao: 1,
      exportadoEm: '2026-09-18T21:30:00.000Z',
      grimorio: {
        nome: 'Mago da one-shot',
        itens: [
          { id: 'spell:Bola de Fogo', nome: 'Bola de Fogo' },
          {
            id: 'class-power:Arcanista:Magia Acelerada',
            nome: 'Magia Acelerada',
          },
        ],
      },
    });
  });

  it('ida e volta preserva nome e itens', () => {
    expect(
      parseGrimoireImport(exportGrimoire(grimoire, resolveName, NOW))
    ).toEqual({
      ok: true,
      value: { name: 'Mago da one-shot', itemIds: grimoire.itemIds },
    });
  });
});

describe('parseGrimoireImport', () => {
  it('não é JSON', () => {
    expect(parseGrimoireImport('{oi')).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notJson,
    });
  });

  it('JSON de outra coisa', () => {
    expect(parseGrimoireImport('{"a":1}')).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notGrimoire,
    });
    expect(parseGrimoireImport('[]')).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notGrimoire,
    });
    expect(parseGrimoireImport(fileWith({ grimorio: { nome: 'X' } }))).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notGrimoire,
    });
    expect(
      parseGrimoireImport(fileWith({ grimorio: { nome: 'X', itens: [{}] } }))
    ).toEqual({ ok: false, error: IMPORT_ERRORS.notGrimoire });
  });

  it('versão inválida ou futura', () => {
    expect(parseGrimoireImport(fileWith({ versao: 'um' }))).toEqual({
      ok: false,
      error: IMPORT_ERRORS.notGrimoire,
    });
    expect(parseGrimoireImport(fileWith({ versao: 2 }))).toEqual({
      ok: false,
      error: IMPORT_ERRORS.newerVersion,
    });
  });

  it('grande demais', () => {
    expect(parseGrimoireImport(' '.repeat(1024 * 1024 + 1))).toEqual({
      ok: false,
      error: IMPORT_ERRORS.tooLarge,
    });
  });

  it('itens demais', () => {
    const itens = Array.from({ length: MAX_IMPORT_ITEMS + 1 }, (_, i) => ({
      id: `spell:${i}`,
    }));
    expect(
      parseGrimoireImport(fileWith({ grimorio: { nome: 'X', itens } }))
    ).toEqual({ ok: false, error: IMPORT_ERRORS.tooManyItems });
  });

  it('remove repetidos, apara ids e aceita nome ausente', () => {
    expect(
      parseGrimoireImport(
        fileWith({
          grimorio: {
            itens: [{ id: ' spell:A ' }, { id: 'spell:A' }, { id: 'spell:B' }],
          },
        })
      )
    ).toEqual({
      ok: true,
      value: { name: '', itemIds: ['spell:A', 'spell:B'] },
    });
  });

  it('mantém ids desconhecidos', () => {
    const result = parseGrimoireImport(
      fileWith({ grimorio: { nome: 'X', itens: [{ id: 'spell:Nada' }] } })
    );
    expect(result).toEqual({
      ok: true,
      value: { name: 'X', itemIds: ['spell:Nada'] },
    });
  });
});

describe('grimoireFileName', () => {
  it('gera slug sem acentos', () => {
    expect(grimoireFileName('Clériga de Lena!')).toBe(
      'grimorio-cleriga-de-lena.json'
    );
    expect(grimoireFileName('!!!')).toBe('grimorio-sem-nome.json');
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

Rodar: `npx vitest run src/functions/pocketGrimoire/__tests__/exchange.spec.ts`
Esperado: FAIL, com `../exchange` não encontrado.

- [ ] **Passo 3: implementar**

```ts
// src/functions/pocketGrimoire/exchange.ts
import { PocketGrimoire } from '../../interfaces/PocketGrimoire';
import { normalizeSearch } from '../stringUtils';
import { isRecord } from './state';

export const GRIMOIRE_FILE_FORMAT = 'fichas-de-nimb/grimorio-de-bolso';
export const GRIMOIRE_FILE_VERSION = 1;
export const MAX_IMPORT_BYTES = 1024 * 1024;
export const MAX_IMPORT_ITEMS = 1000;

export const IMPORT_ERRORS = {
  tooLarge: 'Arquivo grande demais para ser um grimório.',
  notJson: 'Não foi possível ler o arquivo. Ele não parece ser um JSON válido.',
  notGrimoire: 'Este arquivo não é um grimório do Fichas de Nimb.',
  newerVersion: 'Este grimório foi criado numa versão mais nova do site.',
  tooManyItems: `Este grimório tem itens demais (máximo ${MAX_IMPORT_ITEMS}).`,
} as const;

export interface GrimoireFile {
  formato: string;
  versao: number;
  exportadoEm: string;
  grimorio: {
    nome: string;
    itens: { id: string; nome: string }[];
  };
}

export type ImportResult =
  | { ok: true; value: { name: string; itemIds: string[] } }
  | { ok: false; error: string };

/** O `nome` de cada item é só para leitura humana; a importação usa o `id`. */
export function exportGrimoire(
  grimoire: PocketGrimoire,
  resolveName: (id: string) => string,
  now: Date = new Date()
): string {
  const file: GrimoireFile = {
    formato: GRIMOIRE_FILE_FORMAT,
    versao: GRIMOIRE_FILE_VERSION,
    exportadoEm: now.toISOString(),
    grimorio: {
      nome: grimoire.name,
      itens: grimoire.itemIds.map((id) => ({ id, nome: resolveName(id) })),
    },
  };
  return JSON.stringify(file, null, 2);
}

const fail = (error: string): ImportResult => ({ ok: false, error });

export function parseGrimoireImport(text: string): ImportResult {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) {
    return fail(IMPORT_ERRORS.tooLarge);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return fail(IMPORT_ERRORS.notJson);
  }

  if (!isRecord(data) || data.formato !== GRIMOIRE_FILE_FORMAT) {
    return fail(IMPORT_ERRORS.notGrimoire);
  }
  const { versao, grimorio } = data;
  if (typeof versao !== 'number' || !Number.isInteger(versao) || versao < 1) {
    return fail(IMPORT_ERRORS.notGrimoire);
  }
  if (versao > GRIMOIRE_FILE_VERSION) return fail(IMPORT_ERRORS.newerVersion);
  if (!isRecord(grimorio) || !Array.isArray(grimorio.itens)) {
    return fail(IMPORT_ERRORS.notGrimoire);
  }
  if (grimorio.itens.length > MAX_IMPORT_ITEMS) {
    return fail(IMPORT_ERRORS.tooManyItems);
  }

  const ids = grimorio.itens.map((item) =>
    isRecord(item) && typeof item.id === 'string' ? item.id.trim() : ''
  );
  if (ids.some((id) => id.length === 0)) return fail(IMPORT_ERRORS.notGrimoire);

  return {
    ok: true,
    value: {
      name: typeof grimorio.nome === 'string' ? grimorio.nome : '',
      itemIds: Array.from(new Set(ids)),
    },
  };
}

export function grimoireFileName(name: string): string {
  const slug = normalizeSearch(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `grimorio-${slug || 'sem-nome'}.json`;
}
```

- [ ] **Passo 4: rodar e ver passar**

Rodar: `npx vitest run src/functions/pocketGrimoire`
Esperado: PASS em todos.

- [ ] **Passo 5: lint, formatação e commit**

```bash
npx prettier --write src/functions/pocketGrimoire
npx eslint --max-warnings=0 src/functions/pocketGrimoire
git add src/functions/pocketGrimoire
git commit -m "feat(grimorio): exportar e importar grimórios em JSON"
```

---

### Tarefa 5: cards de consulta e helper de testes

**Arquivos:**

- Criar: `src/components/PocketGrimoire/__tests__/renderWithProviders.tsx`
- Criar: `src/components/PocketGrimoire/cards/GrimoireCardShell.tsx`
- Criar: `src/components/PocketGrimoire/cards/GrimoireSpellCard.tsx`
- Criar: `src/components/PocketGrimoire/cards/GrimoirePowerCard.tsx`
- Criar: `src/components/PocketGrimoire/cards/GrimoireEntryCard.tsx` (genérico e resumo)
- Criar: `src/components/PocketGrimoire/cards/GrimoireMissingCard.tsx`
- Criar: `src/components/PocketGrimoire/cards/GrimoireItemCard.tsx` (despacho por `kind`)
- Teste: `src/components/PocketGrimoire/__tests__/cards.spec.tsx`

**Interfaces:**

- Consome: `ResolvedItem`, `resolveItem`, `encyclopediaPath` (Tarefa 3); `formatRequirement` (`src/functions/requirementText.ts`); o reducer da Tarefa 2.
- Produz: `renderWithProviders(ui, { preloadedState?, route?, path? })`, que devolve `{ store, ...renderResult }`; `GrimoireItemCard` com as props `{ item: ResolvedItem; defaultOpen: boolean; onRemove: (id: string) => void }`.

- [ ] **Passo 1: escrever o helper de teste**

```tsx
// src/components/PocketGrimoire/__tests__/renderWithProviders.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import pocketGrimoireReducer from '../../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { PocketGrimoireState } from '../../../interfaces/PocketGrimoire';
import { createInitialState } from '../../../functions/pocketGrimoire/state';

interface Options {
  preloadedState?: PocketGrimoireState;
  /** URL inicial do MemoryRouter. */
  route?: string;
  /** Padrão de rota que envolve a UI (para `useParams`). */
  path?: string;
}

export const createTestStore = (preloadedState?: PocketGrimoireState) =>
  configureStore({
    reducer: { pocketGrimoire: pocketGrimoireReducer },
    preloadedState: {
      pocketGrimoire: preloadedState ?? createInitialState(),
    },
  });

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, route = '/', path }: Options = {}
) {
  const store = createTestStore(preloadedState);
  const result = render(
    <HelmetProvider>
      <Provider store={store}>
        <SnackbarProvider>
          <MemoryRouter initialEntries={[route]}>
            {path ? <Route path={path}>{ui}</Route> : ui}
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>
    </HelmetProvider>
  );
  return { store, ...result };
}
```

- [ ] **Passo 2: escrever os testes que falham**

```tsx
// src/components/PocketGrimoire/__tests__/cards.spec.tsx
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GrimoireItemCard from '../cards/GrimoireItemCard';
import {
  resolveItem,
  getFullEncyclopediaIndex,
} from '../../../functions/pocketGrimoire/resolveItems';
import { prefixOf } from '../../../functions/pocketGrimoire/itemId';
import { renderWithProviders } from './renderWithProviders';

const idWithPrefix = (prefix: string) =>
  getFullEncyclopediaIndex().find((e) => prefixOf(e.id) === prefix)?.id ?? '';

describe('GrimoireItemCard', () => {
  it('magia aberta mostra estatísticas e aprimoramentos', () => {
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('spell:Bola de Fogo')}
        defaultOpen
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
    expect(screen.getByText('Reflexos reduz à metade')).toBeInTheDocument();
    expect(screen.getByText('Aprimoramentos')).toBeInTheDocument();
  });

  it('magia fechada mostra resumo e abre ao clicar', () => {
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('spell:Bola de Fogo')}
        defaultOpen={false}
        onRemove={vi.fn()}
      />
    );
    expect(screen.queryByText('Aprimoramentos')).not.toBeInTheDocument();
    expect(screen.getByText(/Evoc · Padrão · Médio/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Bola de Fogo/ }));
    expect(screen.getByText('Aprimoramentos')).toBeInTheDocument();
  });

  it('botão de remover chama onRemove com o id', () => {
    const onRemove = vi.fn();
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('spell:Bola de Fogo')}
        defaultOpen={false}
        onRemove={onRemove}
      />
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Remover Bola de Fogo do grimório' })
    );
    expect(onRemove).toHaveBeenCalledWith('spell:Bola de Fogo');
  });

  it('poder geral aberto mostra descrição', () => {
    const item = resolveItem(idWithPrefix('power'));
    renderWithProviders(
      <GrimoireItemCard item={item} defaultOpen onRemove={vi.fn()} />
    );
    if (item.kind !== 'power') throw new Error('esperava poder');
    expect(
      screen.getByText(item.power.description.slice(0, 30), { exact: false })
    ).toBeInTheDocument();
  });

  it('resumo tem link para a enciclopédia', () => {
    const item = resolveItem(idWithPrefix('class'));
    renderWithProviders(
      <GrimoireItemCard item={item} defaultOpen onRemove={vi.fn()} />
    );
    expect(
      screen.getByRole('link', { name: /Ver na enciclopédia/ })
    ).toHaveAttribute('href', expect.stringMatching(/^\/database\/classes\//));
  });

  it('item não encontrado avisa e permite remover', () => {
    const onRemove = vi.fn();
    renderWithProviders(
      <GrimoireItemCard
        item={resolveItem('spell:Magia Sumida')}
        defaultOpen={false}
        onRemove={onRemove}
      />
    );
    expect(
      screen.getByText('Magia Sumida não existe mais na enciclopédia.')
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Remover Magia Sumida do grimório' })
    );
    expect(onRemove).toHaveBeenCalledWith('spell:Magia Sumida');
  });
});
```

- [ ] **Passo 3: rodar e ver falhar**

Rodar: `npx vitest run src/components/PocketGrimoire`
Esperado: FAIL, com `../cards/GrimoireItemCard` não encontrado.

- [ ] **Passo 4: implementar a moldura**

```tsx
// src/components/PocketGrimoire/cards/GrimoireCardShell.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  ButtonBase,
  Collapse,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

interface Props {
  title: string;
  /** Linha curta exibida com o card fechado (ex.: "Evoc · Padrão · Médio"). */
  summary?: string;
  /** Chips ao lado do título (tipo de magia, tipo de poder…). */
  chips?: React.ReactNode;
  defaultOpen: boolean;
  onRemove: () => void;
  children: React.ReactNode;
}

/** Moldura comum: cabeçalho clicável que expande + botão de remover. */
const GrimoireCardShell: React.FC<Props> = ({
  title,
  summary,
  chips,
  defaultOpen,
  onRemove,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  // Acompanha a regra "abre sozinho com poucos itens" quando a lista muda.
  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <Paper variant='outlined' sx={{ mb: 1, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <ButtonBase
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          sx={{
            flex: 1,
            justifyContent: 'flex-start',
            textAlign: 'left',
            p: 1.5,
            gap: 1,
          }}
        >
          <KeyboardArrowDownIcon
            fontSize='small'
            sx={{
              mt: 0.25,
              color: 'text.secondary',
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                component='span'
                sx={{ fontFamily: 'Tfont, serif', fontWeight: 600 }}
              >
                {title}
              </Typography>
              {chips}
            </Box>
            {!open && summary && (
              <Typography
                component='span'
                variant='caption'
                sx={{ color: 'text.secondary', display: 'block' }}
              >
                {summary}
              </Typography>
            )}
          </Box>
        </ButtonBase>
        <Tooltip title='Remover do grimório'>
          <IconButton
            aria-label={`Remover ${title} do grimório`}
            onClick={onRemove}
            size='small'
            sx={{ m: 1 }}
          >
            <DeleteOutlinedIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
};

export default GrimoireCardShell;
```

- [ ] **Passo 5: implementar os cards**

```tsx
// src/components/PocketGrimoire/cards/GrimoireSpellCard.tsx
import React from 'react';
import { Box, Chip, Divider, Typography } from '@mui/material';
import GrimoireCardShell from './GrimoireCardShell';
import { GrimoireSpell } from '../../../functions/pocketGrimoire/resolveItems';

interface Props {
  spell: GrimoireSpell;
  defaultOpen: boolean;
  onRemove: () => void;
}

const GrimoireSpellCard: React.FC<Props> = ({
  spell,
  defaultOpen,
  onRemove,
}) => {
  const stats = [
    { label: 'Execução', value: spell.execucao },
    { label: 'Alcance', value: spell.alcance },
    { label: 'Alvo', value: spell.alvo },
    { label: 'Área', value: spell.area },
    { label: 'Duração', value: spell.duracao },
    { label: 'Resistência', value: spell.resistencia },
  ].filter((stat) => stat.value);

  return (
    <GrimoireCardShell
      title={spell.nome}
      summary={`${spell.school} · ${spell.execucao} · ${spell.alcance}`}
      chips={spell.spellTypes.map((type) => (
        <Chip
          key={type}
          label={type}
          size='small'
          variant='outlined'
          color={type === 'Arcana' ? 'primary' : 'secondary'}
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      ))}
      defaultOpen={defaultOpen}
      onRemove={onRemove}
    >
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {spell.circle}º círculo · {spell.school}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
          gap: 1,
          my: 1.5,
          p: 1.5,
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      >
        {stats.map((stat) => (
          <Box key={stat.label}>
            <Typography
              variant='caption'
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              {stat.label}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
        {spell.description}
      </Typography>
      {spell.aprimoramentos && spell.aprimoramentos.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography
            variant='subtitle2'
            color='primary'
            sx={{ fontFamily: 'Tfont, serif' }}
          >
            Aprimoramentos
          </Typography>
          <Box component='ul' sx={{ pl: 2, my: 0.5 }}>
            {spell.aprimoramentos.map((apr) => (
              <li key={`${apr.addPm}-${apr.text.slice(0, 30)}`}>
                <Typography variant='body2' component='span'>
                  <strong>{apr.trick ? 'TRUQUE' : `+${apr.addPm} PM`}:</strong>{' '}
                  {apr.text}
                </Typography>
              </li>
            ))}
          </Box>
        </>
      )}
    </GrimoireCardShell>
  );
};

export default GrimoireSpellCard;
```

```tsx
// src/components/PocketGrimoire/cards/GrimoirePowerCard.tsx
import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import GrimoireCardShell from './GrimoireCardShell';
import { GeneralPowerWithSupplement } from '../../../data/registry';
import { EncyclopediaEntry } from '../../../functions/encyclopediaSearch';
import { formatRequirement } from '../../../functions/requirementText';

interface Props {
  entry: EncyclopediaEntry;
  power: GeneralPowerWithSupplement;
  defaultOpen: boolean;
  onRemove: () => void;
}

const GrimoirePowerCard: React.FC<Props> = ({
  entry,
  power,
  defaultOpen,
  onRemove,
}) => {
  const requirementGroups = power.requirements.filter(
    (group) => group.length > 0
  );

  return (
    <GrimoireCardShell
      title={power.name}
      summary={entry.subtitle}
      defaultOpen={defaultOpen}
      onRemove={onRemove}
    >
      {entry.subtitle && (
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {entry.subtitle}
        </Typography>
      )}
      <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
        {power.description}
      </Typography>
      {requirementGroups.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography
            variant='subtitle2'
            color='primary'
            sx={{ fontFamily: 'Tfont, serif' }}
          >
            Pré-requisitos
          </Typography>
          {requirementGroups.map((group, index) => (
            <Box
              key={group.map((req) => formatRequirement(req)).join('|')}
              sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}
            >
              {index > 0 && (
                <Typography
                  variant='caption'
                  sx={{ fontStyle: 'italic', mr: 1 }}
                >
                  ou
                </Typography>
              )}
              {group.map((req) => (
                <Chip
                  key={formatRequirement(req)}
                  label={formatRequirement(req)}
                  size='small'
                  variant='outlined'
                  sx={{ m: 0.25 }}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </GrimoireCardShell>
  );
};

export default GrimoirePowerCard;
```

```tsx
// src/components/PocketGrimoire/cards/GrimoireEntryCard.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Chip, Link, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GrimoireCardShell from './GrimoireCardShell';
import { EncyclopediaEntry } from '../../../functions/encyclopediaSearch';
import { encyclopediaPath } from '../../../functions/pocketGrimoire/resolveItems';

interface Props {
  entry: EncyclopediaEntry;
  /** Resumo de entidade inteira (classe, raça…): mostra link para a enciclopédia. */
  isSummary: boolean;
  defaultOpen: boolean;
  onRemove: () => void;
}

const GrimoireEntryCard: React.FC<Props> = ({
  entry,
  isSummary,
  defaultOpen,
  onRemove,
}) => (
  <GrimoireCardShell
    title={entry.title}
    summary={entry.subtitle}
    chips={
      <Chip
        label={entry.categoryLabel}
        size='small'
        variant='outlined'
        sx={{ height: 20, fontSize: '0.7rem' }}
      />
    }
    defaultOpen={defaultOpen}
    onRemove={onRemove}
  >
    {entry.subtitle && (
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {entry.subtitle}
      </Typography>
    )}
    {entry.description && (
      <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
        {entry.description}
      </Typography>
    )}
    {isSummary && (
      <Link
        component={RouterLink}
        to={encyclopediaPath(entry)}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1 }}
      >
        Ver na enciclopédia
        <OpenInNewIcon fontSize='inherit' />
      </Link>
    )}
  </GrimoireCardShell>
);

export default GrimoireEntryCard;
```

```tsx
// src/components/PocketGrimoire/cards/GrimoireMissingCard.tsx
import React from 'react';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface Props {
  name: string;
  onRemove: () => void;
}

const GrimoireMissingCard: React.FC<Props> = ({ name, onRemove }) => (
  <Paper
    variant='outlined'
    sx={{
      mb: 1,
      p: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      borderStyle: 'dashed',
    }}
  >
    <HelpOutlineIcon fontSize='small' sx={{ color: 'text.secondary' }} />
    <Box sx={{ flex: 1 }}>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {name} não existe mais na enciclopédia.
      </Typography>
    </Box>
    <Tooltip title='Remover do grimório'>
      <IconButton
        aria-label={`Remover ${name} do grimório`}
        onClick={onRemove}
        size='small'
      >
        <DeleteOutlinedIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  </Paper>
);

export default GrimoireMissingCard;
```

```tsx
// src/components/PocketGrimoire/cards/GrimoireItemCard.tsx
import React from 'react';
import { ResolvedItem } from '../../../functions/pocketGrimoire/resolveItems';
import GrimoireSpellCard from './GrimoireSpellCard';
import GrimoirePowerCard from './GrimoirePowerCard';
import GrimoireEntryCard from './GrimoireEntryCard';
import GrimoireMissingCard from './GrimoireMissingCard';

interface Props {
  item: ResolvedItem;
  defaultOpen: boolean;
  onRemove: (itemId: string) => void;
}

/** Escolhe o card pelo tipo resolvido do item. */
const GrimoireItemCard: React.FC<Props> = ({ item, defaultOpen, onRemove }) => {
  const handleRemove = () => onRemove(item.id);

  switch (item.kind) {
    case 'spell':
      return (
        <GrimoireSpellCard
          spell={item.spell}
          defaultOpen={defaultOpen}
          onRemove={handleRemove}
        />
      );
    case 'power':
      return (
        <GrimoirePowerCard
          entry={item.entry}
          power={item.power}
          defaultOpen={defaultOpen}
          onRemove={handleRemove}
        />
      );
    case 'missing':
      return <GrimoireMissingCard name={item.name} onRemove={handleRemove} />;
    default:
      return (
        <GrimoireEntryCard
          entry={item.entry}
          isSummary={item.kind === 'summary'}
          defaultOpen={defaultOpen}
          onRemove={handleRemove}
        />
      );
  }
};

export default GrimoireItemCard;
```

- [ ] **Passo 6: rodar e ver passar**

Rodar: `npx vitest run src/components/PocketGrimoire`
Esperado: PASS em todos. O resumo `Evoc · Padrão · Médio` vem de `school`, `execucao` e `alcance` da Bola de Fogo (`generalSpells.ts:2322`).

- [ ] **Passo 7: lint, formatação e commit**

```bash
npx prettier --write src/components/PocketGrimoire
npx eslint --max-warnings=0 src/components/PocketGrimoire
git add src/components/PocketGrimoire
git commit -m "feat(grimorio): cards de consulta do grimório"
```

---

### Tarefa 6: diálogos (nome, exportar, importar) e menu ⋮

**Arquivos:**

- Criar: `src/components/PocketGrimoire/GrimoireNameDialog.tsx`
- Criar: `src/components/PocketGrimoire/ExportGrimoireDialog.tsx`
- Criar: `src/components/PocketGrimoire/ImportGrimoireDialog.tsx`
- Criar: `src/components/PocketGrimoire/GrimoireMenu.tsx`
- Criar: `src/components/PocketGrimoire/grimoireSnackbar.ts` (opções padrão das notificações)
- Teste: `src/components/PocketGrimoire/__tests__/dialogs.spec.tsx`

**Interfaces:**

- Consome: as actions e os selectors da Tarefa 2; `exportGrimoire`, `parseGrimoireImport`, `grimoireFileName` (Tarefa 4); `resolveItem`, `itemTitle` (Tarefa 3); `normalizeGrimoireName` (Tarefa 1); `renderWithProviders` (Tarefa 5).
- Produz:

  - `GRIMOIRE_SNACKBAR` (opções do notistack);
  - `GrimoireNameDialog`, com props `{ open, title, confirmLabel, initialName?, onClose, onConfirm(name) }`;
  - `ExportGrimoireDialog`, com props `{ open, grimoire, onClose }`;
  - `ImportGrimoireDialog`, com props `{ open, onClose }`;
  - `GrimoireMenu`, com props `{ grimoire, isActive, onDeleted? }`.

- [ ] **Passo 1: escrever os testes que falham**

```tsx
// src/components/PocketGrimoire/__tests__/dialogs.spec.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GrimoireNameDialog from '../GrimoireNameDialog';
import ImportGrimoireDialog from '../ImportGrimoireDialog';
import GrimoireMenu from '../GrimoireMenu';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { IMPORT_ERRORS } from '../../../functions/pocketGrimoire/exchange';

describe('GrimoireNameDialog', () => {
  it('confirma nome limpo e bloqueia vazio', () => {
    const onConfirm = vi.fn();
    renderWithProviders(
      <GrimoireNameDialog
        open
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );
    const confirm = screen.getByRole('button', { name: 'Criar' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: '  Mago  ' },
    });
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith('Mago');
  });
});

describe('ImportGrimoireDialog', () => {
  const pasteAndImport = (text: string) => {
    fireEvent.click(screen.getByRole('tab', { name: 'Colar texto' }));
    fireEvent.change(screen.getByLabelText('JSON do grimório'), {
      target: { value: text },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));
  };

  it('mostra erro para texto inválido', () => {
    renderWithProviders(<ImportGrimoireDialog open onClose={vi.fn()} />);
    pasteAndImport('não é json');
    expect(screen.getByText(IMPORT_ERRORS.notJson)).toBeInTheDocument();
  });

  it('importa texto válido como grimório novo', async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(
      <ImportGrimoireDialog open onClose={onClose} />
    );
    pasteAndImport(
      JSON.stringify({
        formato: 'fichas-de-nimb/grimorio-de-bolso',
        versao: 1,
        exportadoEm: '2026-09-18T00:00:00.000Z',
        grimorio: {
          nome: 'Trazido',
          itens: [{ id: 'spell:Bola de Fogo' }, { id: 'spell:Sumida' }],
        },
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const { grimoires } = store.getState().pocketGrimoire;
    expect(grimoires[1]).toMatchObject({
      name: 'Trazido',
      itemIds: ['spell:Bola de Fogo', 'spell:Sumida'],
    });
    expect(
      await screen.findByText('Trazido importado: 2 itens (1 não encontrado).')
    ).toBeInTheDocument();
  });
});

describe('GrimoireMenu', () => {
  it('Excluir fica desativado no Padrão', () => {
    const state = createInitialState();
    renderWithProviders(
      <GrimoireMenu grimoire={state.grimoires[0]} isActive />,
      { preloadedState: state }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    expect(screen.getByRole('menuitem', { name: /Excluir/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('Duplicar cria uma cópia', () => {
    const state = createInitialState();
    const { store } = renderWithProviders(
      <GrimoireMenu grimoire={state.grimoires[0]} isActive />,
      { preloadedState: state }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Duplicar/ }));
    expect(store.getState().pocketGrimoire.grimoires[1].name).toBe(
      'Padrão (cópia)'
    );
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

Rodar: `npx vitest run src/components/PocketGrimoire/__tests__/dialogs.spec.tsx`
Esperado: FAIL, com os módulos dos diálogos não encontrados.

- [ ] **Passo 3: implementar**

```ts
// src/components/PocketGrimoire/grimoireSnackbar.ts
import { OptionsObject } from 'notistack';

/**
 * O SnackbarProvider global nunca esconde (`autoHideDuration: null`) e ancora
 * à direita, onde fica o botão flutuante do grimório.
 */
export const GRIMOIRE_SNACKBAR: OptionsObject = {
  autoHideDuration: 4000,
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
};
```

```tsx
// src/components/PocketGrimoire/GrimoireNameDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { normalizeGrimoireName } from '../../functions/pocketGrimoire/state';
import { GRIMOIRE_NAME_MAX_LENGTH } from '../../interfaces/PocketGrimoire';

interface Props {
  open: boolean;
  title: string;
  confirmLabel: string;
  initialName?: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const GrimoireNameDialog: React.FC<Props> = ({
  open,
  title,
  confirmLabel,
  initialName = '',
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const normalized = normalizeGrimoireName(name);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (normalized) onConfirm(normalized);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            label='Nome'
            value={name}
            onChange={(event) => setName(event.target.value)}
            inputProps={{ maxLength: GRIMOIRE_NAME_MAX_LENGTH }}
            helperText={`${name.length}/${GRIMOIRE_NAME_MAX_LENGTH}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type='submit' variant='contained' disabled={!normalized}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GrimoireNameDialog;
```

```tsx
// src/components/PocketGrimoire/ExportGrimoireDialog.tsx
import React, { useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useSnackbar } from 'notistack';
import { PocketGrimoire } from '../../interfaces/PocketGrimoire';
import {
  exportGrimoire,
  grimoireFileName,
} from '../../functions/pocketGrimoire/exchange';
import {
  itemTitle,
  resolveItem,
} from '../../functions/pocketGrimoire/resolveItems';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

interface Props {
  open: boolean;
  grimoire: PocketGrimoire;
  onClose: () => void;
}

const resolveName = (id: string) => itemTitle(resolveItem(id));

const ExportGrimoireDialog: React.FC<Props> = ({ open, grimoire, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const json = useMemo(
    () => (open ? exportGrimoire(grimoire, resolveName) : ''),
    [open, grimoire]
  );

  const handleDownload = () => {
    const url = URL.createObjectURL(
      new Blob([json], { type: 'application/json' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = grimoireFileName(grimoire.name);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      enqueueSnackbar('Grimório copiado.', {
        ...GRIMOIRE_SNACKBAR,
        variant: 'success',
      });
    } catch {
      enqueueSnackbar(
        'Não foi possível copiar. Selecione o texto e copie manualmente.',
        { ...GRIMOIRE_SNACKBAR, variant: 'error' }
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Exportar “{grimoire.name}”</DialogTitle>
      <DialogContent>
        <Typography variant='body2' sx={{ mb: 1.5, color: 'text.secondary' }}>
          Guarde o arquivo como backup ou envie para outro aparelho. Para
          recuperar, use “Importar” em Meus grimórios.
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={6}
          maxRows={14}
          value={json}
          label='JSON do grimório'
          InputProps={{ readOnly: true, sx: { fontFamily: 'monospace' } }}
        />
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Fechar</Button>
        <Button startIcon={<ContentCopyOutlinedIcon />} onClick={handleCopy}>
          Copiar texto
        </Button>
        <Button
          variant='contained'
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={handleDownload}
        >
          Baixar .json
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportGrimoireDialog;
```

```tsx
// src/components/PocketGrimoire/ImportGrimoireDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { useSnackbar } from 'notistack';
import { useStore } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import {
  importGrimoire,
  selectGrimoireById,
  setActive,
  WithPocketGrimoire,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { parseGrimoireImport } from '../../functions/pocketGrimoire/exchange';
import { resolveItem } from '../../functions/pocketGrimoire/resolveItems';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

interface Props {
  open: boolean;
  onClose: () => void;
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

const ImportGrimoireDialog: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const store = useStore<WithPocketGrimoire>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [tab, setTab] = useState<'file' | 'text'>('file');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTab('file');
      setText('');
      setFileName('');
      setError('');
    }
  }, [open]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError('');
      setText(await file.text());
    }
  };

  const handleImport = () => {
    const result = parseGrimoireImport(text);
    if (!result.ok) {
      setError(result.error);
    } else {
      const action = dispatch(
        importGrimoire(result.value.name, result.value.itemIds)
      );
      const { id } = action.payload;
      const created = selectGrimoireById(id)(store.getState());
      const missing = result.value.itemIds.filter(
        (itemId) => resolveItem(itemId).kind === 'missing'
      ).length;
      const missingText =
        missing > 0
          ? ` (${plural(missing, 'não encontrado', 'não encontrados')})`
          : '';
      enqueueSnackbar(
        `${created?.name ?? 'Grimório'} importado: ${plural(
          result.value.itemIds.length,
          'item',
          'itens'
        )}${missingText}.`,
        {
          ...GRIMOIRE_SNACKBAR,
          variant: 'success',
          action: (key) => (
            <Button
              color='inherit'
              size='small'
              onClick={() => {
                dispatch(setActive(id));
                closeSnackbar(key);
              }}
            >
              Tornar ativo
            </Button>
          ),
        }
      );
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Importar grimório</DialogTitle>
      <DialogContent>
        <Tabs
          value={tab}
          onChange={(_event, value: 'file' | 'text') => {
            setTab(value);
            setError('');
          }}
          sx={{ mb: 2 }}
        >
          <Tab value='file' label='Arquivo' />
          <Tab value='text' label='Colar texto' />
        </Tabs>
        {tab === 'file' ? (
          <Box>
            <Button
              component='label'
              variant='outlined'
              startIcon={<FileUploadOutlinedIcon />}
            >
              Escolher arquivo .json
              <input
                hidden
                type='file'
                accept='.json,application/json'
                onChange={handleFile}
              />
            </Button>
            {fileName && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                {fileName}
              </Typography>
            )}
          </Box>
        ) : (
          <TextField
            fullWidth
            multiline
            minRows={6}
            maxRows={14}
            label='JSON do grimório'
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError('');
            }}
            InputProps={{ sx: { fontFamily: 'monospace' } }}
          />
        )}
        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Typography
          variant='caption'
          sx={{ display: 'block', mt: 2, color: 'text.secondary' }}
        >
          A importação sempre cria um grimório novo. Nada é sobrescrito.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant='contained'
          onClick={handleImport}
          disabled={text.trim().length === 0}
        >
          Importar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportGrimoireDialog;
```

```tsx
// src/components/PocketGrimoire/GrimoireMenu.tsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../../store/hooks';
import {
  deleteGrimoire,
  duplicateGrimoire,
  renameGrimoire,
  setActive,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  DEFAULT_GRIMOIRE_ID,
  PocketGrimoire,
} from '../../interfaces/PocketGrimoire';
import GrimoireNameDialog from './GrimoireNameDialog';
import ExportGrimoireDialog from './ExportGrimoireDialog';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

interface Props {
  grimoire: PocketGrimoire;
  isActive: boolean;
  /** Chamado depois de excluir (a página de consulta volta para a lista). */
  onDeleted?: () => void;
}

type OpenDialog = 'rename' | 'export' | 'delete' | null;

const GrimoireMenu: React.FC<Props> = ({ grimoire, isActive, onDeleted }) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const isDefault = grimoire.id === DEFAULT_GRIMOIRE_ID;

  const closeMenu = () => setAnchorEl(null);
  const openDialog = (which: OpenDialog) => {
    closeMenu();
    setDialog(which);
  };

  const handleDuplicate = () => {
    closeMenu();
    dispatch(duplicateGrimoire(grimoire.id));
    enqueueSnackbar(`Cópia de ${grimoire.name} criada.`, {
      ...GRIMOIRE_SNACKBAR,
      variant: 'success',
    });
  };

  const handleDelete = () => {
    setDialog(null);
    dispatch(deleteGrimoire(grimoire.id));
    enqueueSnackbar(`${grimoire.name} excluído.`, GRIMOIRE_SNACKBAR);
    onDeleted?.();
  };

  return (
    <>
      <IconButton
        aria-label={`Opções de ${grimoire.name}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          disabled={isActive}
          onClick={() => {
            closeMenu();
            dispatch(setActive(grimoire.id));
          }}
        >
          <ListItemIcon>
            <CheckCircleOutlinedIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>
            {isActive ? 'Já é o ativo' : 'Tornar ativo'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openDialog('rename')}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Renomear</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openDialog('export')}>
          <ListItemIcon>
            <FileDownloadOutlinedIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Exportar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <ContentCopyOutlinedIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={isDefault}
          onClick={() => openDialog('delete')}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText>
            {isDefault ? 'Excluir (o Padrão não pode)' : 'Excluir'}
          </ListItemText>
        </MenuItem>
      </Menu>

      <GrimoireNameDialog
        open={dialog === 'rename'}
        title='Renomear grimório'
        confirmLabel='Salvar'
        initialName={grimoire.name}
        onClose={() => setDialog(null)}
        onConfirm={(name) => {
          dispatch(renameGrimoire(grimoire.id, name));
          setDialog(null);
        }}
      />
      <ExportGrimoireDialog
        open={dialog === 'export'}
        grimoire={grimoire}
        onClose={() => setDialog(null)}
      />
      <Dialog open={dialog === 'delete'} onClose={() => setDialog(null)}>
        <DialogTitle>Excluir “{grimoire.name}”?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta ação não pode ser desfeita. Se quiser guardar os itens, exporte
            o grimório antes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancelar</Button>
          <Button color='error' variant='contained' onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GrimoireMenu;
```

- [ ] **Passo 4: rodar e ver passar**

Rodar: `npx vitest run src/components/PocketGrimoire`
Esperado: PASS em todos.

- [ ] **Passo 5: lint, formatação e commit**

```bash
npx prettier --write src/components/PocketGrimoire
npx eslint --max-warnings=0 src/components/PocketGrimoire
git add src/components/PocketGrimoire
git commit -m "feat(grimorio): diálogos de nome, exportar, importar e menu do grimório"
```

---

### Tarefa 7: botão 📖+/✓ e inserção na enciclopédia

**Arquivos:**

- Criar: `src/components/PocketGrimoire/AddToGrimoireButton.tsx`
- Modificar: `src/components/Database/UnifiedSpellsTable.tsx` (import e o botão antes do `CopyUrlButton` no `Row`)
- Modificar: `src/components/DatabaseTables/PowersTable.tsx` (import e o botão no fim do `Box` do nome, no `Row`)
- Modificar: `src/components/Database/EncyclopediaSearch.tsx` (import e o botão no fim do `Box` do título de cada resultado)
- Teste: `src/components/PocketGrimoire/__tests__/addToGrimoireButton.spec.tsx`

**Interfaces:**

- Consome: `addItem`, `removeItem`, `selectActiveGrimoire`, `selectGrimoireById` (Tarefa 2); `GRIMOIRE_SNACKBAR` (Tarefa 6); `renderWithProviders` (Tarefa 5).
- Produz: `AddToGrimoireButton`, com props `{ itemId: string; itemName: string; grimoireId?: string }`.

- [ ] **Passo 1: screenshots "antes" das abas da enciclopédia**

Com o `npm start` rodando, capture `/database/magias` e `/database/poderes` no desktop (1366×900) e no celular (390×844), usando Chromium headless (Playwright no scratchpad da sessão). Salve como `antes-magias-*.png` e `antes-poderes-*.png` no scratchpad. Elas serão comparadas na Tarefa 10.

- [ ] **Passo 2: escrever os testes que falham**

```tsx
// src/components/PocketGrimoire/__tests__/addToGrimoireButton.spec.tsx
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AddToGrimoireButton from '../AddToGrimoireButton';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { dataRegistry } from '../../../data/registry';
import { SupplementId } from '../../../types/supplement.types';
import { GeneralPowerType } from '../../../interfaces/Poderes';
import { getGrimoireCatalog } from '../../../functions/pocketGrimoire/resolveItems';

const ID = 'spell:Bola de Fogo';

describe('AddToGrimoireButton', () => {
  it('adiciona ao ativo, troca o ícone e desfaz', async () => {
    const { store } = renderWithProviders(
      <AddToGrimoireButton itemId={ID} itemName='Bola de Fogo' />
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar Bola de Fogo a Padrão' })
    );
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([ID]);
    expect(
      screen.getByRole('button', { name: 'Remover Bola de Fogo de Padrão' })
    ).toBeInTheDocument();

    expect(
      await screen.findByText('"Bola de Fogo" foi para Padrão.')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([]);
  });

  it('com grimoireId age sobre aquele grimório, não sobre o ativo', () => {
    const state = createInitialState();
    state.grimoires.push({
      id: 'outro',
      name: 'Outro',
      itemIds: [],
      createdAt: '',
      updatedAt: '',
    });
    const { store } = renderWithProviders(
      <AddToGrimoireButton
        itemId={ID}
        itemName='Bola de Fogo'
        grimoireId='outro'
      />,
      { preloadedState: state }
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar Bola de Fogo a Outro' })
    );
    const { grimoires } = store.getState().pocketGrimoire;
    expect(grimoires[0].itemIds).toEqual([]);
    expect(grimoires[1].itemIds).toEqual([ID]);
  });

  it('não propaga o clique para a linha da tabela', () => {
    let rowClicks = 0;
    renderWithProviders(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        onClick={() => {
          rowClicks += 1;
        }}
      >
        <AddToGrimoireButton itemId={ID} itemName='Bola de Fogo' />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
    expect(rowClicks).toBe(0);
  });
});

describe('ids montados pela tabela de poderes', () => {
  it('power:<power.type>:<nome> existe no índice para todo poder geral', () => {
    const { byId } = getGrimoireCatalog();
    const byType = dataRegistry.getPowersWithSupplementInfo(
      Object.values(SupplementId)
    );
    const broken = (Object.keys(byType) as GeneralPowerType[]).flatMap((type) =>
      byType[type]
        .map((power) => `power:${power.type}:${power.name}`)
        .filter((id) => !byId.has(id))
    );
    expect(broken).toEqual([]);
  });
});
```

- [ ] **Passo 3: rodar e ver falhar**

Rodar: `npx vitest run src/components/PocketGrimoire/__tests__/addToGrimoireButton.spec.tsx`
Esperado: FAIL, com `../AddToGrimoireButton` não encontrado.

- [ ] **Passo 4: implementar o botão**

```tsx
// src/components/PocketGrimoire/AddToGrimoireButton.tsx
import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItem,
  removeItem,
  selectActiveGrimoire,
  selectGrimoireById,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

interface Props {
  itemId: string;
  itemName: string;
  /** Sem ele, age sobre o grimório ativo. */
  grimoireId?: string;
}

const AddToGrimoireButton: React.FC<Props> = ({
  itemId,
  itemName,
  grimoireId,
}) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const active = useAppSelector(selectActiveGrimoire);
  const explicit = useAppSelector(selectGrimoireById(grimoireId));
  const target = explicit ?? active;
  const inGrimoire = target.itemIds.includes(itemId);
  const label = inGrimoire
    ? `Remover ${itemName} de ${target.name}`
    : `Adicionar ${itemName} a ${target.name}`;

  const notify = (message: string, undo: () => void) => {
    enqueueSnackbar(message, {
      ...GRIMOIRE_SNACKBAR,
      action: (key) => (
        <Button
          color='inherit'
          size='small'
          onClick={() => {
            undo();
            closeSnackbar(key);
          }}
        >
          Desfazer
        </Button>
      ),
    });
  };

  const handleClick = (event: React.MouseEvent) => {
    // O botão vive dentro de linhas de tabela e resultados de busca clicáveis.
    event.stopPropagation();
    const targetId = target.id;
    // Texto sem gênero: serve para "a magia" e para "o poder".
    if (inGrimoire) {
      dispatch(removeItem(targetId, itemId));
      notify(`"${itemName}" saiu de ${target.name}.`, () =>
        dispatch(addItem(targetId, itemId))
      );
    } else {
      dispatch(addItem(targetId, itemId));
      notify(`"${itemName}" foi para ${target.name}.`, () =>
        dispatch(removeItem(targetId, itemId))
      );
    }
  };

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        size='small'
        color={inGrimoire ? 'success' : 'default'}
        onClick={handleClick}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {inGrimoire ? (
          <BookmarkAddedIcon fontSize='small' />
        ) : (
          <BookmarkAddOutlinedIcon fontSize='small' />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default AddToGrimoireButton;
```

- [ ] **Passo 5: rodar e ver passar**

Rodar: `npx vitest run src/components/PocketGrimoire`
Esperado: PASS em todos.

- [ ] **Passo 6: inserir nos três pontos da enciclopédia**

`src/components/Database/UnifiedSpellsTable.tsx`: depois do import de `CopyUrlButton`:

```tsx
import AddToGrimoireButton from '../PocketGrimoire/AddToGrimoireButton';
```

No `Row`, imediatamente antes do `<CopyUrlButton itemName={spell.nome} itemType='magia' …/>`:

```tsx
<AddToGrimoireButton itemId={`spell:${spell.nome}`} itemName={spell.nome} />
```

`src/components/DatabaseTables/PowersTable.tsx`: depois do import de `CopyUrlButton`:

```tsx
import AddToGrimoireButton from '../PocketGrimoire/AddToGrimoireButton';
```

No `Row`, como último filho do `Box` que contém o nome e os chips (logo depois do `Chip` de `power.supplementName`):

```tsx
<AddToGrimoireButton
  itemId={`power:${power.type}:${power.name}`}
  itemName={power.name}
/>
```

`src/components/Database/EncyclopediaSearch.tsx`: depois do import de `normalizeSearch`:

```tsx
import AddToGrimoireButton from '../PocketGrimoire/AddToGrimoireButton';
```

Dentro do `Box` do `primary` de cada resultado, como último filho (depois do bloco `entry.subtitle`):

```tsx
<Box sx={{ ml: 'auto' }}>
  <AddToGrimoireButton itemId={entry.id} itemName={entry.title} />
</Box>
```

- [ ] **Passo 7: conferir que nada existente quebrou**

```bash
npx vitest run src/components src/functions/__tests__/encyclopediaSearch* 2>&1 | tail -5
npx prettier --write src/components/PocketGrimoire src/components/Database/UnifiedSpellsTable.tsx src/components/DatabaseTables/PowersTable.tsx src/components/Database/EncyclopediaSearch.tsx
npx eslint --max-warnings=0 src/components/PocketGrimoire src/components/Database/UnifiedSpellsTable.tsx src/components/DatabaseTables/PowersTable.tsx src/components/Database/EncyclopediaSearch.tsx
```

Esperado: testes passando e ESLint sem saída. `PowersTable.tsx` já tem `/* eslint-disable @typescript-eslint/no-explicit-any */` no topo; não mexa nisso.

- [ ] **Passo 8: commit**

```bash
git add src/components/PocketGrimoire src/components/Database/UnifiedSpellsTable.tsx src/components/DatabaseTables/PowersTable.tsx src/components/Database/EncyclopediaSearch.tsx
git commit -m "feat(grimorio): botão de adicionar ao grimório na enciclopédia"
```

---

### Tarefa 8: botão flutuante e balão na enciclopédia

**Arquivos:**

- Criar: `src/components/PocketGrimoire/GrimoireItemList.tsx`
- Criar: `src/components/PocketGrimoire/PocketGrimoireFab.tsx`
- Modificar: `src/components/screens/Database.tsx` (import e `{!embedded && <PocketGrimoireFab />}`)
- Teste: `src/components/PocketGrimoire/__tests__/fab.spec.tsx`

**Interfaces:**

- Consome: `resolveItems`, `groupResolvedItems`, `itemTitle`, `encyclopediaPath`, `ResolvedGroup` (Tarefa 3); as actions e os selectors da Tarefa 2; `GrimoireNameDialog` (Tarefa 6); `safeBottom` e `safeRight` (`src/theme/safeArea.ts`).
- Produz: `GrimoireItemList`, com props `{ groups: ResolvedGroup[]; onRemove(id); onNavigate(path) }`; `PocketGrimoireFab`, sem props.

- [ ] **Passo 1: escrever os testes que falham**

```tsx
// src/components/PocketGrimoire/__tests__/fab.spec.tsx
import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PocketGrimoireFab from '../PocketGrimoireFab';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { PocketGrimoireState } from '../../../interfaces/PocketGrimoire';

const stateWithItems = (): PocketGrimoireState => {
  const state = createInitialState();
  state.grimoires[0].itemIds = ['spell:Bola de Fogo'];
  state.grimoires.push({
    id: 'outro',
    name: 'Clériga',
    itemIds: [],
    createdAt: '',
    updatedAt: '',
  });
  return state;
};

describe('PocketGrimoireFab', () => {
  it('mostra a contagem do ativo', () => {
    renderWithProviders(<PocketGrimoireFab />, {
      preloadedState: stateWithItems(),
    });
    expect(
      screen.getByRole('button', { name: 'Grimório de bolso: Padrão, 1 item' })
    ).toBeInTheDocument();
  });

  it('abre o balão com os itens e remove', () => {
    const { store } = renderWithProviders(<PocketGrimoireFab />, {
      preloadedState: stateWithItems(),
    });
    fireEvent.click(screen.getByRole('button', { name: /Grimório de bolso/ }));
    const panel = screen.getByRole('dialog', { name: 'Grimório de bolso' });
    expect(within(panel).getByText('Bola de Fogo')).toBeInTheDocument();
    fireEvent.click(
      within(panel).getByRole('button', { name: 'Remover Bola de Fogo' })
    );
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([]);
    expect(
      within(panel).getByText(/Seu grimório está vazio/)
    ).toBeInTheDocument();
  });

  it('troca o ativo pelo seletor', () => {
    const { store } = renderWithProviders(<PocketGrimoireFab />, {
      preloadedState: stateWithItems(),
    });
    fireEvent.click(screen.getByRole('button', { name: /Grimório de bolso/ }));
    // O nome acessível do Select junta o rótulo e o valor exibido.
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: /Grimório ativo/ })
    );
    fireEvent.click(screen.getByRole('option', { name: /Clériga/ }));
    expect(store.getState().pocketGrimoire.activeId).toBe('outro');
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

Rodar: `npx vitest run src/components/PocketGrimoire/__tests__/fab.spec.tsx`
Esperado: FAIL, com `../PocketGrimoireFab` não encontrado.

- [ ] **Passo 3: implementar a lista resumida**

```tsx
// src/components/PocketGrimoire/GrimoireItemList.tsx
import React from 'react';
import {
  Box,
  IconButton,
  Link,
  List,
  ListItem,
  ListSubheader,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  encyclopediaPath,
  itemTitle,
  ResolvedGroup,
} from '../../functions/pocketGrimoire/resolveItems';

interface Props {
  groups: ResolvedGroup[];
  onRemove: (itemId: string) => void;
  onNavigate: (path: string) => void;
}

/** Lista só de nomes, agrupada — o resumo que cabe no balão. */
const GrimoireItemList: React.FC<Props> = ({
  groups,
  onRemove,
  onNavigate,
}) => (
  <List dense disablePadding>
    {groups.map((group) => (
      <Box component='li' key={group.key} sx={{ listStyle: 'none' }}>
        <ListSubheader
          component='div'
          disableSticky
          sx={{
            lineHeight: '28px',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'primary.main',
            bgcolor: 'transparent',
            px: 0,
          }}
        >
          {group.label} ({group.items.length})
        </ListSubheader>
        <Box component='ul' sx={{ p: 0, m: 0 }}>
          {group.items.map((item) => {
            const title = itemTitle(item);
            return (
              <ListItem
                key={item.id}
                disableGutters
                secondaryAction={
                  <Tooltip title='Remover'>
                    <IconButton
                      edge='end'
                      size='small'
                      aria-label={`Remover ${title}`}
                      onClick={() => onRemove(item.id)}
                    >
                      <DeleteOutlinedIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                }
              >
                {item.kind === 'missing' ? (
                  <Typography
                    variant='body2'
                    sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                  >
                    {title}
                  </Typography>
                ) : (
                  <Link
                    component='button'
                    variant='body2'
                    underline='hover'
                    onClick={() => onNavigate(encyclopediaPath(item.entry))}
                    sx={{ textAlign: 'left' }}
                  >
                    {title}
                  </Link>
                )}
              </ListItem>
            );
          })}
        </Box>
      </Box>
    ))}
  </List>
);

export default GrimoireItemList;
```

- [ ] **Passo 4: implementar o botão flutuante**

```tsx
// src/components/PocketGrimoire/PocketGrimoireFab.tsx
import React, { useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Fab,
  IconButton,
  MenuItem,
  Paper,
  Popper,
  SwipeableDrawer,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  createGrimoire,
  removeItem,
  selectActiveGrimoire,
  selectGrimoires,
  setActive,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  groupResolvedItems,
  resolveItems,
} from '../../functions/pocketGrimoire/resolveItems';
import { safeBottom, safeRight } from '../../theme/safeArea';
import GrimoireItemList from './GrimoireItemList';
import GrimoireNameDialog from './GrimoireNameDialog';

const NEW_OPTION = '__novo__';
const TITLE_ID = 'pocket-grimoire-panel-title';

const countLabel = (count: number) =>
  `${count} ${count === 1 ? 'item' : 'itens'}`;

const PocketGrimoireFab: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const isMobile = useMediaQuery('(max-width: 720px)');
  const grimoires = useAppSelector(selectGrimoires);
  const active = useAppSelector(selectActiveGrimoire);
  const fabRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const groups = useMemo(
    () => groupResolvedItems(resolveItems(active.itemIds)),
    [active.itemIds]
  );

  const handleNavigate = (path: string) => {
    if (isMobile) setOpen(false);
    history.push(path);
  };

  const panel = (
    <Box
      role='dialog'
      aria-labelledby={TITLE_ID}
      sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MenuBookIcon color='primary' fontSize='small' />
        <Typography
          id={TITLE_ID}
          sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, flex: 1 }}
        >
          Grimório de bolso
        </Typography>
        <IconButton
          size='small'
          aria-label='Fechar'
          onClick={() => setOpen(false)}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <TextField
        select
        size='small'
        label='Grimório ativo'
        value={active.id}
        onChange={(event) => {
          if (event.target.value === NEW_OPTION) setCreating(true);
          else dispatch(setActive(event.target.value));
        }}
      >
        {grimoires.map((grimoire) => (
          <MenuItem key={grimoire.id} value={grimoire.id}>
            {grimoire.name} ({grimoire.itemIds.length})
          </MenuItem>
        ))}
        <MenuItem value={NEW_OPTION}>
          <AddIcon fontSize='small' sx={{ mr: 1 }} />
          Novo grimório
        </MenuItem>
      </TextField>

      <Box sx={{ maxHeight: isMobile ? '45vh' : 320, overflowY: 'auto' }}>
        {groups.length === 0 ? (
          <Typography variant='body2' sx={{ color: 'text.secondary', py: 1 }}>
            Seu grimório está vazio. Use o ícone de marcador nos cards de magias
            e poderes para adicionar.
          </Typography>
        ) : (
          <GrimoireItemList
            groups={groups}
            onRemove={(itemId) => dispatch(removeItem(active.id, itemId))}
            onNavigate={handleNavigate}
          />
        )}
      </Box>

      <Button
        component={RouterLink}
        to={`/grimorio/${active.id}`}
        variant='outlined'
        endIcon={<OpenInNewIcon />}
      >
        Abrir completo
      </Button>
    </Box>
  );

  return (
    <>
      <Fab
        ref={fabRef}
        color='primary'
        aria-label={`Grimório de bolso: ${active.name}, ${countLabel(
          active.itemIds.length
        )}`}
        onClick={() => setOpen((value) => !value)}
        sx={{
          position: 'fixed',
          bottom: safeBottom(16),
          right: safeRight(16),
          zIndex: (theme) => theme.zIndex.speedDial,
        }}
      >
        <Badge
          badgeContent={active.itemIds.length}
          color='secondary'
          showZero
          max={99}
        >
          <MenuBookIcon />
        </Badge>
      </Fab>

      {isMobile ? (
        <SwipeableDrawer
          anchor='bottom'
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              pb: safeBottom(8),
            },
          }}
        >
          {panel}
        </SwipeableDrawer>
      ) : (
        // Sem ClickAwayListener de propósito: o balão não bloqueia a página,
        // então dá para seguir marcando itens nos cards com ele aberto.
        <Popper
          open={open}
          anchorEl={fabRef.current}
          placement='top-end'
          sx={{ zIndex: (theme) => theme.zIndex.speedDial + 1 }}
          modifiers={[{ name: 'offset', options: { offset: [0, 12] } }]}
        >
          <Paper elevation={8} sx={{ width: 320, borderRadius: 3 }}>
            {panel}
          </Paper>
        </Popper>
      )}

      <GrimoireNameDialog
        open={creating}
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={() => setCreating(false)}
        onConfirm={(name) => {
          const action = dispatch(createGrimoire(name));
          dispatch(setActive(action.payload.id));
          setCreating(false);
        }}
      />
    </>
  );
};

export default PocketGrimoireFab;
```

- [ ] **Passo 5: rodar e ver passar**

Rodar: `npx vitest run src/components/PocketGrimoire`
Esperado: PASS em todos. Se o `Popper` não montar no jsdom porque `fabRef.current` é nulo no primeiro render, troque `fabRef` por um estado `anchorEl` preenchido no `onClick` (`setAnchorEl(event.currentTarget)`). Esse é o padrão do MUI e resolve o problema.

- [ ] **Passo 6: inserir na enciclopédia**

`src/components/screens/Database.tsx`: depois do import de `SEO`:

```tsx
import PocketGrimoireFab from '../PocketGrimoire/PocketGrimoireFab';
```

Logo antes do `</>` final do `return`, depois do `</Container>`:

```tsx
{
  /* Fora da mesa virtual (embedded): lá não há rota /grimorio. */
}
{
  !embedded && <PocketGrimoireFab />;
}
```

- [ ] **Passo 7: lint, formatação e commit**

```bash
npx prettier --write src/components/PocketGrimoire src/components/screens/Database.tsx
npx eslint --max-warnings=0 src/components/PocketGrimoire src/components/screens/Database.tsx
git add src/components/PocketGrimoire src/components/screens/Database.tsx
git commit -m "feat(grimorio): botão flutuante e balão do grimório na enciclopédia"
```

---

### Tarefa 9: páginas, rotas e menu lateral

**Arquivos:**

- Criar: `src/components/PocketGrimoire/PocketGrimoireListPage.tsx`
- Criar: `src/components/PocketGrimoire/PocketGrimoirePage.tsx`
- Modificar: `src/App.tsx` (dois `lazyScreen` e duas `Route` depois de `/database`)
- Modificar: `src/components/SidebarV2/SidebarV2.tsx` (import `MenuBookIcon` e um item depois da Enciclopédia)
- Teste: `src/components/PocketGrimoire/__tests__/pages.spec.tsx`

**Interfaces:**

- Consome: tudo das Tarefas 2, 3, 5, 6 e 7; `searchEncyclopedia` (`src/functions/encyclopediaSearch.ts`); `normalizeSearch`; `SEO` (`src/components/SEO`); `TormentaTitle` (`src/components/Database/TormentaTitle.tsx`).
- Produz: páginas com `export default`; `AUTO_OPEN_MAX_ITEMS = 5` exportado de `PocketGrimoirePage.tsx`.

- [ ] **Passo 1: escrever os testes que falham**

```tsx
// src/components/PocketGrimoire/__tests__/pages.spec.tsx
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PocketGrimoirePage from '../PocketGrimoirePage';
import PocketGrimoireListPage from '../PocketGrimoireListPage';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { getFullEncyclopediaIndex } from '../../../functions/pocketGrimoire/resolveItems';
import { prefixOf } from '../../../functions/pocketGrimoire/itemId';

const spellIds = (count: number) =>
  getFullEncyclopediaIndex()
    .filter((e) => prefixOf(e.id) === 'spell')
    .slice(0, count)
    .map((e) => e.id);

const renderPage = (itemIds: string[]) => {
  const state = createInitialState();
  state.grimoires[0].itemIds = itemIds;
  return renderWithProviders(<PocketGrimoirePage />, {
    preloadedState: state,
    route: '/grimorio/default',
    path: '/grimorio/:id',
  });
};

const openCards = () =>
  screen
    .queryAllByRole('button', { expanded: true })
    .filter((el) => el.getAttribute('aria-expanded') === 'true');

describe('PocketGrimoirePage', () => {
  it('abre os cards com 5 itens ou menos', () => {
    renderPage(spellIds(5));
    expect(openCards()).toHaveLength(5);
  });

  it('deixa fechados com 6 itens ou mais', () => {
    renderPage(spellIds(6));
    expect(openCards()).toHaveLength(0);
  });

  it('só mostra filtros de categorias presentes', () => {
    const powerId =
      getFullEncyclopediaIndex().find((e) => prefixOf(e.id) === 'power')?.id ??
      '';
    renderPage([...spellIds(1), powerId]);
    expect(screen.getByRole('button', { name: 'Magias' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Poderes' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Habilidades' })
    ).not.toBeInTheDocument();
  });

  it('esconde os filtros quando só há uma categoria', () => {
    renderPage(spellIds(2));
    expect(
      screen.queryByRole('button', { name: 'Magias' })
    ).not.toBeInTheDocument();
  });

  it('busca mostra resultados da enciclopédia para adicionar', () => {
    renderPage([]);
    fireEvent.change(screen.getByLabelText('Buscar no grimório ou adicionar'), {
      target: { value: 'bola de fogo' },
    });
    expect(screen.getByText('Adicionar da enciclopédia')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Adicionar Bola de Fogo a Padrão' })
        .length
    ).toBeGreaterThan(0);
  });

  it('grimório inexistente mostra aviso', () => {
    renderWithProviders(<PocketGrimoirePage />, {
      route: '/grimorio/fantasma',
      path: '/grimorio/:id',
    });
    expect(screen.getByText('Grimório não encontrado')).toBeInTheDocument();
  });
});

describe('PocketGrimoireListPage', () => {
  it('lista grimórios com o ativo marcado e o aviso de armazenamento local', () => {
    renderWithProviders(<PocketGrimoireListPage />);
    expect(screen.getByText('Padrão')).toBeInTheDocument();
    expect(screen.getByText('ativo')).toBeInTheDocument();
    expect(screen.getByText(/ficam só neste navegador/)).toBeInTheDocument();
  });

  it('cria um grimório novo pelo botão Novo', () => {
    const { store } = renderWithProviders(<PocketGrimoireListPage />);
    fireEvent.click(screen.getByRole('button', { name: /Novo/ }));
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Mago' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));
    expect(store.getState().pocketGrimoire.grimoires[1].name).toBe('Mago');
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

Rodar: `npx vitest run src/components/PocketGrimoire/__tests__/pages.spec.tsx`
Esperado: FAIL, com as páginas não encontradas.

- [ ] **Passo 3: implementar a página de lista**

```tsx
// src/components/PocketGrimoire/PocketGrimoireListPage.tsx
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  createGrimoire,
  selectActiveId,
  selectGrimoires,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { SEO } from '../SEO';
import TormentaTitle from '../Database/TormentaTitle';
import GrimoireMenu from './GrimoireMenu';
import GrimoireNameDialog from './GrimoireNameDialog';
import ImportGrimoireDialog from './ImportGrimoireDialog';

const describeGrimoire = (count: number, updatedAt: string) => {
  const items = `${count} ${count === 1 ? 'item' : 'itens'}`;
  const date = new Date(updatedAt);
  return Number.isNaN(date.getTime())
    ? items
    : `${items} · editado em ${date.toLocaleDateString('pt-BR')}`;
};

const PocketGrimoireListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const grimoires = useAppSelector(selectGrimoires);
  const activeId = useAppSelector(selectActiveId);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  return (
    <>
      <SEO
        title='Grimório de bolso'
        description='Junte magias, poderes e habilidades de Tormenta 20 para consultar na mesa.'
        url='/grimorio'
      />
      <Container maxWidth='md' sx={{ py: 3 }}>
        <TormentaTitle variant='h4' centered gradient sx={{ mb: 3 }}>
          Meus grimórios
        </TormentaTitle>

        <Stack direction='row' spacing={1} sx={{ mb: 2 }} flexWrap='wrap'>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setCreating(true)}
          >
            Novo
          </Button>
          <Button
            variant='outlined'
            startIcon={<FileUploadOutlinedIcon />}
            onClick={() => setImporting(true)}
          >
            Importar
          </Button>
        </Stack>

        <Stack spacing={1.5}>
          {grimoires.map((grimoire) => (
            <Card
              key={grimoire.id}
              variant='outlined'
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <CardActionArea
                onClick={() => history.push(`/grimorio/${grimoire.id}`)}
                sx={{ flex: 1, p: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{ fontFamily: 'Tfont, serif', fontWeight: 600 }}
                  >
                    {grimoire.name}
                  </Typography>
                  {grimoire.id === activeId && (
                    <Chip label='ativo' size='small' color='primary' />
                  )}
                </Box>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {describeGrimoire(
                    grimoire.itemIds.length,
                    grimoire.updatedAt
                  )}
                </Typography>
              </CardActionArea>
              <Box sx={{ pr: 1 }}>
                <GrimoireMenu
                  grimoire={grimoire}
                  isActive={grimoire.id === activeId}
                />
              </Box>
            </Card>
          ))}
        </Stack>

        <Alert severity='warning' sx={{ mt: 3 }}>
          Grimórios ficam só neste navegador. Exporte para fazer backup ou levar
          para outro aparelho.
        </Alert>
      </Container>

      <GrimoireNameDialog
        open={creating}
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={() => setCreating(false)}
        onConfirm={(name) => {
          const action = dispatch(createGrimoire(name));
          setCreating(false);
          history.push(`/grimorio/${action.payload.id}`);
        }}
      />
      <ImportGrimoireDialog
        open={importing}
        onClose={() => setImporting(false)}
      />
    </>
  );
};

export default PocketGrimoireListPage;
```

- [ ] **Passo 4: implementar a página de consulta**

```tsx
// src/components/PocketGrimoire/PocketGrimoirePage.tsx
import React, { useMemo, useState } from 'react';
import { Link as RouterLink, useHistory, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Chip,
  Container,
  InputAdornment,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  removeItem,
  selectActiveId,
  selectGrimoireById,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  getFullEncyclopediaIndex,
  groupResolvedItems,
  itemTitle,
  matchesFilter,
  resolveItems,
} from '../../functions/pocketGrimoire/resolveItems';
import {
  filterOfId,
  GrimoireFilter,
} from '../../functions/pocketGrimoire/itemId';
import { searchEncyclopedia } from '../../functions/encyclopediaSearch';
import { normalizeSearch } from '../../functions/stringUtils';
import { SEO } from '../SEO';
import GrimoireItemCard from './cards/GrimoireItemCard';
import GrimoireMenu from './GrimoireMenu';
import AddToGrimoireButton from './AddToGrimoireButton';

/** Grimórios pequenos (uma one-shot) já abrem com tudo à vista. */
export const AUTO_OPEN_MAX_ITEMS = 5;
const SEARCH_RESULTS = 8;

const FILTERS: { value: GrimoireFilter; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'spells', label: 'Magias' },
  { value: 'powers', label: 'Poderes' },
  { value: 'abilities', label: 'Habilidades' },
  { value: 'others', label: 'Outros' },
];

const PocketGrimoirePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const grimoire = useAppSelector(selectGrimoireById(id));
  const activeId = useAppSelector(selectActiveId);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GrimoireFilter>('all');

  const itemIds = grimoire?.itemIds;
  const resolved = useMemo(() => resolveItems(itemIds ?? []), [itemIds]);

  const presentFilters = useMemo(() => {
    const present = new Set<GrimoireFilter | null>(
      resolved.map((item) => filterOfId(item.id))
    );
    return FILTERS.filter(
      (option) => option.value === 'all' || present.has(option.value)
    );
  }, [resolved]);

  const normalizedQuery = normalizeSearch(query).trim();
  const groups = useMemo(
    () =>
      groupResolvedItems(
        resolved.filter(
          (item) =>
            matchesFilter(item, filter) &&
            normalizeSearch(itemTitle(item)).includes(normalizedQuery)
        )
      ),
    [resolved, filter, normalizedQuery]
  );

  const searchResults = useMemo(
    () =>
      normalizedQuery.length >= 2
        ? searchEncyclopedia(getFullEncyclopediaIndex(), query, SEARCH_RESULTS)
        : [],
    [normalizedQuery, query]
  );

  if (!grimoire) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='info'>
          <Typography sx={{ fontWeight: 600 }}>
            Grimório não encontrado
          </Typography>
          <Link component={RouterLink} to='/grimorio'>
            Ver meus grimórios
          </Link>
        </Alert>
      </Container>
    );
  }

  const defaultOpen = grimoire.itemIds.length <= AUTO_OPEN_MAX_ITEMS;
  const handleRemove = (itemId: string) =>
    dispatch(removeItem(grimoire.id, itemId));

  return (
    <>
      <SEO title={`${grimoire.name} · Grimório de bolso`} url='/grimorio' />
      <Container maxWidth='md' sx={{ py: 3 }}>
        <Link
          component={RouterLink}
          to='/grimorio'
          underline='hover'
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 1 }}
        >
          <ArrowBackIcon fontSize='small' />
          Meus grimórios
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography
            variant='h4'
            sx={{ fontFamily: 'Tfont, serif', flex: 1, minWidth: 0 }}
          >
            {grimoire.name}
          </Typography>
          {grimoire.id === activeId && (
            <Chip label='ativo' size='small' color='primary' />
          )}
          <GrimoireMenu
            grimoire={grimoire}
            isActive={grimoire.id === activeId}
            onDeleted={() => history.push('/grimorio')}
          />
        </Box>

        <TextField
          fullWidth
          size='small'
          label='Buscar no grimório ou adicionar'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon fontSize='small' />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        {searchResults.length > 0 && (
          <Paper variant='outlined' sx={{ mb: 2 }}>
            <Typography
              variant='overline'
              sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary' }}
            >
              Adicionar da enciclopédia
            </Typography>
            <List dense disablePadding>
              {searchResults.map(({ entry }) => (
                <ListItem
                  key={entry.id}
                  secondaryAction={
                    <AddToGrimoireButton
                      itemId={entry.id}
                      itemName={entry.title}
                      grimoireId={grimoire.id}
                    />
                  }
                >
                  <ListItemText
                    primary={entry.title}
                    secondary={`${entry.categoryLabel}${
                      entry.subtitle ? ` · ${entry.subtitle}` : ''
                    }`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {presentFilters.length > 2 && (
          <Stack direction='row' spacing={1} sx={{ mb: 2 }} flexWrap='wrap'>
            {presentFilters.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                clickable
                color={filter === option.value ? 'primary' : 'default'}
                onClick={() => setFilter(option.value)}
              />
            ))}
          </Stack>
        )}

        {grimoire.itemIds.length === 0 && (
          <Alert severity='info'>
            Este grimório está vazio. Busque acima ou use o marcador nos cards
            da{' '}
            <Link component={RouterLink} to='/database'>
              Enciclopédia
            </Link>
            .
          </Alert>
        )}

        {groups.map((group) => (
          <Box key={group.key} sx={{ mb: 2 }}>
            <Typography
              variant='overline'
              sx={{ color: 'primary.main', fontWeight: 700 }}
            >
              {group.label}
            </Typography>
            {group.items.map((item) => (
              <GrimoireItemCard
                key={item.id}
                item={item}
                defaultOpen={defaultOpen}
                onRemove={handleRemove}
              />
            ))}
          </Box>
        ))}
      </Container>
    </>
  );
};

export default PocketGrimoirePage;
```

> Filtros: `presentFilters.length > 2` quer dizer "Tudo" e mais pelo menos duas categorias. Com uma categoria só, os chips não filtram nada e ficam escondidos. Isso estende a regra da spec, "um filtro sem itens fica escondido".

- [ ] **Passo 5: rodar e ver passar**

Rodar: `npx vitest run src/components/PocketGrimoire`
Esperado: PASS em todos.

- [ ] **Passo 6: rotas e menu lateral**

`src/App.tsx`: depois de `const Database = lazyScreen(...)`:

```tsx
const PocketGrimoireListPage = lazyScreen(
  () => import('./components/PocketGrimoire/PocketGrimoireListPage')
);
const PocketGrimoirePage = lazyScreen(
  () => import('./components/PocketGrimoire/PocketGrimoirePage')
);
```

Logo depois da `<Route path='/database'>…</Route>`:

```tsx
                                      <Route exact path='/grimorio'>
                                        <PocketGrimoireListPage />
                                      </Route>
                                      <Route path='/grimorio/:id'>
                                        <PocketGrimoirePage />
                                      </Route>
```

`src/components/SidebarV2/SidebarV2.tsx`: depois do import de `StorageIcon`:

```tsx
import MenuBookIcon from '@mui/icons-material/MenuBook';
```

Logo depois do `StyledMenuItem` da "Enciclopédia de Tanah-Toh":

```tsx
<StyledMenuItem onClick={() => navigateTo('/grimorio')}>
  <ListItemIcon>
    <MenuBookIcon />
  </ListItemIcon>
  <Typography variant='inherit'>Grimório de bolso</Typography>
</StyledMenuItem>
```

- [ ] **Passo 7: lint, formatação e commit**

```bash
npx prettier --write src/components/PocketGrimoire src/App.tsx src/components/SidebarV2/SidebarV2.tsx
npx eslint --max-warnings=0 src/components/PocketGrimoire src/App.tsx src/components/SidebarV2/SidebarV2.tsx
git add src/components/PocketGrimoire src/App.tsx src/components/SidebarV2/SidebarV2.tsx
git commit -m "feat(grimorio): páginas do grimório, rotas e item no menu"
```

---

### Tarefa 10: verificação final

**Arquivos:** nenhum novo. Só correções, se a verificação encontrar problemas.

- [ ] **Passo 1: suíte inteira**

Rodar: `npx vitest run 2>&1 | grep -E "Test Files|Tests |FAIL" | sort -u`
Esperado: as únicas falhas são as 15 de `unarmedDamage.spec.ts`. O total de testes que passam é 2036 somado aos testes novos.

- [ ] **Passo 2: tipos**

Rodar: `npx tsc --noEmit 2>&1 | grep -E "PocketGrimoire|pocketGrimoire|store/index|App.tsx|SidebarV2|Database.tsx|UnifiedSpellsTable|PowersTable|EncyclopediaSearch"`
Esperado: nenhuma linha. Os erros restantes do `tsc` são os de módulo premium ausente, que já existiam.

- [ ] **Passo 3: lint e formatação de tudo que mudou**

```bash
git diff --name-only main...HEAD -- 'src/**' | xargs npx prettier --check
git diff --name-only main...HEAD -- 'src/**' | xargs npx eslint --max-warnings=0
```

Esperado: sem problemas.

- [ ] **Passo 4: navegador, desktop (1366×900) e celular (390×844)**

Com `npm start`, dirija o app pelo Chromium headless:

1. `/database/magias`: clicar no marcador da "Bola de Fogo" deixa o ícone verde e o contador do botão flutuante em 1.
2. Abrir o balão, ver "Bola de Fogo", criar "Teste" pelo "+ Novo grimório" e confirmar que ele virou o ativo com contador 0.
3. Adicionar um poder em `/database/poderes` e abrir "Abrir completo" → `/grimorio/<id>`, onde o card deve estar aberto (≤ 5 itens).
4. Menu ⋮ → Exportar → copiar o JSON, excluir o grimório, voltar a `/grimorio`, Importar → colar e confirmar que o grimório voltou com os mesmos itens.
5. Recarregar a página e confirmar que os grimórios continuam lá.
6. Nenhum `pageerror` além do conhecido "Recurso premium indisponível".

Screenshots de cada etapa no scratchpad.

- [ ] **Passo 5: antes e depois**

Capture de novo `/database/magias` e `/database/poderes` e compare com as imagens da Tarefa 7, Passo 1. A única diferença aceitável é o ícone de marcador nas linhas e o botão flutuante.

- [ ] **Passo 6: commit final, se houver correções**

```bash
git add -A src
git commit -m "fix(grimorio): ajustes da verificação final"
```

---

## Desvios registrados durante a execução

- **Tarefa 7, `powerItemId`:** o teste de ids da tabela de poderes encontrou um dado inconsistente no projeto original. "Magia Acelerada" (`src/data/systems/tormenta20/powers/spellPowers.ts`) está na lista de poderes de Magia, mas tem `type: GeneralPowerType.DESTINO`. Montar o id com `power.type` geraria `power:DESTINO:Magia Acelerada`, que não existe no índice. A solução foi `powerItemId(power)` em `resolveItems.ts`, que busca o id pelo nome (os nomes de poderes gerais são únicos). A `PowersTable` usa `itemId={powerItemId(power)}` e também importa `powerItemId`. O dado não foi corrigido: ele alimenta o gerador de fichas e está fora do escopo.
- **Tarefa 5:** `HelpOutline` não existe no MUI v9; o ícone usado é `HelpOutlined`. No teste "magia fechada…", o botão de expandir é encontrado por `{ expanded: false }`, porque `/Bola de Fogo/` também casava com o botão de remover.
- **Tarefa 2:** `prepare` de `createGrimoire` usa `itemIds: [] as string[]` para o tipo do payload bater.
- **Tarefa 8:** a lista resumida usa `Link` do router (`to={encyclopediaPath(...)}`) em vez de `Link component='button'` com `history.push`, que o ESLint (`jsx-a11y/anchor-is-valid`) rejeita. Ganha também "abrir em nova aba". A prop passou de `onNavigate(path)` para `onItemClick()`, que fecha a folha no celular. O `Fab` usa estado `anchorEl` com ref de callback desde o início.
- **Tarefa 10, tipos:** o `tsc` filtrado encontrou 9 erros que o Vitest e o ESLint não pegam. No MUI v9, `TextField` usa `slotProps={{ input, htmlInput }}` e `SwipeableDrawer` usa `slotProps={{ paper }}`; `Stack` não aceita `flexWrap` como prop (vai em `sx`). No notistack, o `App.tsx` estende `VariantOverrides`, então toda chamada precisa de `variant` explícito, e `GRIMOIRE_SNACKBAR` deixou de ser `OptionsObject`. Depois disso, o `tsc` voltou a 426 erros, a linha de base, todos do premium ausente.
- **Tarefa 10, navegador:** a primeira execução mostrou "Invalid hook call". A causa foi o dev server do Vite reotimizando dependências novas (os ícones) no meio da navegação, o que duplica o React; isso só acontece em dev. Na segunda execução: zero erros, todo o fluxo ok no desktop e no celular, e sem rolagem horizontal no celular. Antes/depois: na aba Magias, a coluna Nome ficou ~25px mais larga por causa do ícone nas linhas; fora isso, só o botão flutuante mudou.

## Desvios depois da tarefa 10

Mudanças feitas depois do plano, a pedido, durante a revisão do resultado no navegador. Cada uma tem seu commit.

- **Botões em todos os itens da enciclopédia** (94d14a45). A decisão 4 da spec limitava os botões aos cards de magia, aos de poder geral e à busca unificada. Agora eles aparecem também em classes e suas habilidades e poderes, raças e habilidades de raça e de herança, origens e poderes de origem, divindades e poderes concedidos, e na gaveta da árvore de poderes. Nas linhas expandidas, o botão usa `variant='labeled'`.
- **Ids do índice numa fonte única** (02359804). O `encyclopediaSearch.ts` passou a montar os ids por `encyclopediaIds`. Isso corrigiu uma colisão nas habilidades de herança (o "Mordida" do Moreau), que antes descartava entradas. O índice completo foi de 3042 para 3050 itens, e a busca da enciclopédia original passa a mostrar essas habilidades. Isso muda o comportamento do projeto original e deve ser citado na descrição do PR.
- **Entradas na home e no rodapé** (adc02047): `ToolsSidebar` e `JamboFooter`, além do menu lateral previsto.
- **Apresentação compartilhada** (56edc3a5). Os cards `GrimoireSpellCard`, `GrimoirePowerCard`, `GrimoireGenericCard` e `GrimoireSummaryCard` viraram uma função pura, `presentItem` (`cards/itemPresentation.ts`), e dois componentes, `GrimoireItemCard` (lista) e `GrimoireItemDetails` (corpo). O `GrimoireMissingCard` continua.
- **Modo Cartas** (63920d38, 63c6cfe8, 61e7a32d). Alterna com a lista e a escolha fica lembrada em `localStorage` (`fdn-grimoire-view`). Traz cartas no estilo do Baralho de Magias (`GrimoireCollectibleCard`), carta ampliada navegável por setas, teclado e deslize (`GrimoireCardViewer`) e uma legenda com os tipos presentes (`GrimoireCardLegend`).
- **Resumo das entidades e dicas dos termos** (816f353f). `entitySummary.ts` monta fatos de classes, raças, origens e divindades a partir dos dados. `spellGlossary.ts` traz explicações escritas à mão dos termos de regra, que aparecem como dica (`TermInfo`).
- **Cores por tipo** (da05972c, 61e7a32d): chips da lista e marcas do balão na cor do tipo (`accentColor.ts`).
- **Pelo menos um grimório** (4f4b7c0b). O "Padrão" deixou de ser fixo: pode ser renomeado e excluído, desde que sobre outro. A spec foi atualizada nesse commit.
- **Importar substituindo e importar ao criar** (c05539d7). A spec dizia que importar sempre cria um grimório novo. Agora o menu ⋮ tem "Importar e substituir" (ação `replaceItems`, com confirmação e Desfazer), e o diálogo de novo grimório oferece importar em vez de criar vazio.
- **Linha inteira do resultado da busca adiciona** (f6255208). Espelha o marcador: um segundo clique remove.
- **Grimórios de exemplo** (86e96169): `docs/grimorios-exemplo/*.json`, para testar a importação.

### Ajustes da revisão de código

- O filtro de categoria volta para "Tudo" quando a categoria escolhida some, e a página avisa "Nenhum item deste grimório corresponde." quando o filtro ou a busca não deixam nada.
- A importação por arquivo checa o tamanho antes de ler o conteúdo, trata falha de leitura e permite escolher o mesmo arquivo de novo.
- Os cards só usam `defaultOpen` como estado inicial. Antes, passar de 5 para 6 itens fechava todos os cards abertos, como a spec já dizia ("começam").
- O breakpoint de celular do balão e da carta ampliada foi de 720px para 768px, o padrão do projeto.
- A URL do download é revogada no próximo tique, porque alguns navegadores cancelavam o download.
- A chave dos aprimoramentos usa o texto inteiro. Os 30 primeiros caracteres colidiam em Servo Morto-Vivo e Libertação.
- `pocketGrimoirePersistConfig` ganhou `version: 1`, para o `migrate` poder ramificar quando o formato guardado mudar (notas por item).
- A escolha de filtro que deixou de existir é zerada, para não se reativar sozinha quando a categoria volta (8a481602).
- Remover um item (lixeira, carta ampliada, balão) avisa com snackbar e "Desfazer", como adicionar já fazia. O snackbar foi para `useGrimoireUndo.tsx`, compartilhado com `useAddToGrimoire`.
