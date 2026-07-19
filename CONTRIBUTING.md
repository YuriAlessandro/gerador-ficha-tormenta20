# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o Gerador de Fichas de Tormenta 20!
Este guia ajudará você a entender como o projeto está organizado e como contribuir efetivamente.

## 📋 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura de Dados](#estrutura-de-dados)
5. [Como Desenvolver](#como-desenvolver)
6. [Padrões de Código](#padrões-de-código)
7. [Testes](#testes)
8. [Pull Requests](#pull-requests)

## 🚀 Primeiros Passos

### Requisitos

- [Node.js](https://nodejs.org/en/) versão 16 ou superior
- npm ou yarn
- Git

### Configuração do Ambiente

```bash
# 1. Fork o repositório no GitHub
# 2. Clone seu fork
git clone https://github.com/SEU_USERNAME/gerador-ficha-tormenta20.git

# 3. Entre no diretório
cd gerador-ficha-tormenta20

# 4. Instale as dependências
npm install

# 5. Inicie o servidor de desenvolvimento
npm start

# 6. Acesse http://localhost:5173
```

### Rodando sem o módulo premium

Parte do projeto vive em submódulos privados (`src/premium` e `backend`). Você
**não precisa de acesso a eles** para contribuir: ao clonar sem os submódulos, o
Vite redireciona automaticamente todo import de `src/premium` para
`src/premium-stub/`, um substituto público com implementações inertes.

Nesse modo funcionam o gerador de fichas (aleatório e passo a passo), o gerador
de ameaças, a exportação em PDF, as tabelas de dados e a enciclopédia — ou seja,
praticamente todo o núcleo aberto do projeto. As funcionalidades pagas (nuvem,
mesas virtuais, condições, efeitos ativos, homebrews) não aparecem, já que sem o
backend não há como verificar assinatura.

Duas limitações conhecidas:

- **O type-check não funciona** sem o submódulo — o `vite-plugin-checker` fica
  desligado nesse modo. O app roda, mas o editor vai acusar imports não
  resolvidos em arquivos que tocam o premium.
- **Os testes que importam o premium falham** (`src/functions/__tests__/homebrew*.spec.ts`,
  `complications.spec.ts`, `activeEffectsBugfixes.spec.ts`). Os demais passam.

Se você **tem** acesso ao submódulo e quer conferir se o build público continua
de pé depois de uma mudança:

```bash
VITE_NO_PREMIUM=1 npm start
```

Ao adicionar no código público um import novo vindo do premium, regenere o stub:

```bash
node scripts/generate-premium-stub.mjs
npx prettier --write "src/premium-stub/**/*.tsx"
```

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura modular e orientada a funcionalidades:

```
src/
├── components/          # Componentes React organizados por funcionalidade
│   ├── SheetResult/     # Visualização e edição de fichas
│   ├── DatabaseTables/  # Tabelas de consulta (magias, poderes, etc)
│   ├── screens/         # Telas principais da aplicação
│   └── ...
├── data/               # Dados do T20 (raças, classes, magias, etc)
├── functions/          # Lógica de negócio e utilitários
├── interfaces/         # Definições de tipos TypeScript
├── store/             # Redux Toolkit (estado global)
└── ...
```

### Padrões Arquiteturais

- **Feature-based**: Componentes organizados por funcionalidade
- **Redux Toolkit**: Gerenciamento de estado com slices
- **TypeScript-first**: Tipagem completa em todas as interfaces
- **Data-driven**: Todo conteúdo do jogo em arquivos TypeScript

## 🛠️ Tecnologias Utilizadas

- **React 17** + **TypeScript** - Framework e tipagem
- **Vite** - Build tool moderna e rápida
- **Material-UI v5** - Componentes de interface
- **Tailwind CSS** - Estilização utilitária
- **Redux Toolkit** - Gerenciamento de estado
- **pdf-lib** - Geração de PDFs
- **Vitest** - Framework de testes
- **ESLint** + **Prettier** - Qualidade de código

## 📊 Estrutura de Dados

Todos os dados do T20 estão na pasta [`src/data`](src/data). Se você deseja validar, verificar ou corrigir algum dado, veja como estão organizados:

### Principais Categorias

1. [Atributos](#atributos) - Força, Destreza, etc.
2. [Classes](#classes) - Guerreiro, Arcanista, etc.
3. [Raças](#raças) - Humano, Elfo, etc.
4. [Divindades](#divindades) - Deuses e poderes concedidos
5. [Origens](#origens) - Background dos personagens
6. [Equipamentos](#equipamentos) - Armas, armaduras, itens
7. [Magias](#magias) - Arcanas e divinas
8. [Poderes](#poderes) - Gerais, combate, destino, etc.
9. [Perícias](#perícias) - Sistema de habilidades

## Atributos

Os atributos são definidos no arquivo [src/data/atributos.ts](src/data/atributos.ts) como um enum TypeScript:

```typescript
export enum Atributo {
  FORÇA = 'Força',
  DESTREZA = 'Destreza',
  CONSTITUIÇÃO = 'Constituição',
  INTELIGENCIA = 'Inteligência',
  SABEDORIA = 'Sabedoria',
  CARISMA = 'Carisma',
}
```

Cada atributo é usado em várias partes do sistema para definir modificadores, requisitos de poderes, atributos-chave de magias, etc.

## Classes

Todas as classes estão definidas em [src/data/classes](src/data/classes). Cada arquivo neste diretório corresponde a uma classe específica.

Uma vez definida, a classe deve ser exportada no array principal em [src/data/classes.ts](src/data/classes.ts). Uma classe exportada automaticamente aparece nos filtros e pode ser selecionada aleatoriamente.

### Interface ClassDescription

Uma classe deve implementar a interface [ClassDescription](src/interfaces/Class.ts):

```typescript
interface ClassDescription {
  name: string; // Nome da classe
  subname?: string; // Subtipo (ex: Mago, Bruxo, Feiticeiro para Arcanista)
  pv: number; // Pontos de vida iniciais
  addpv: number; // PV adicional por nível
  pm: number; // Pontos de mana iniciais
  addpm: number; // PM adicional por nível
  periciasbasicas: BasicExpertise[]; // Perícias garantidas da classe
  periciasrestantes: RemainingExpertise; // Perícias opcionais
  proficiencias: string[]; // Proficiências com equipamentos
  abilities: ClassAbility[]; // Habilidades de classe por nível
  powers: ClassPower[]; // Poderes específicos da classe
  probDevoto: number; // Probabilidade de ser devoto (0-1)
  qtdPoderesConcedidos?: string | number; // Quantidade de poderes concedidos
  faithProbability?: FaithProbability; // Probabilidades por divindade
  attrPriority: Atributo[]; // Prioridade de atributos para distribuição
  spellPath?: SpellPath; // Caminho de magias (se conjurador)
  setup?: (classe: ClassDescription) => ClassDescription; // Função de setup personalizada
  originalAbilities?: ClassAbility[]; // Campo interno para preservar habilidades originais
}
```

### Interfaces Auxiliares

#### BasicExpertise

Define perícias que a classe ganha automaticamente:

```typescript
interface BasicExpertise {
  type: 'or' | 'and'; // 'or' = escolha uma, 'and' = ganha todas
  list: Skill[]; // Lista de perícias disponíveis
}
```

**Exemplos:**

```typescript
// Escolher entre Diplomacia ou Intimidação
{ type: 'or', list: [Skill.DIPLOMACIA, Skill.INTIMIDACAO] }

// Ganhar Vontade automaticamente
{ type: 'and', list: [Skill.VONTADE] }
```

#### RemainingExpertise

Define perícias opcionais que o jogador pode escolher:

```typescript
interface RemainingExpertise {
  qtd: number; // Quantidade de perícias a escolher
  list: Skill[]; // Lista de perícias disponíveis
}
```

#### ClassAbility

Habilidades de classe ganhas por nível:

```typescript
type ClassAbility = {
  name: string; // Nome da habilidade
  text: string; // Descrição da habilidade
  nivel: number; // Nível mínimo para ganhar
  sheetActions?: SheetAction[]; // Ações aplicadas na ficha
  sheetBonuses?: SheetBonus[]; // Bônus aplicados na ficha
};
```

#### ClassPower

Poderes específicos da classe (diferentes de habilidades):

```typescript
type ClassPower = {
  name: string; // Nome do poder
  text: string; // Descrição do poder
  requirements?: Requirement[][]; // Pré-requisitos
  sheetActions?: SheetAction[]; // Ações na ficha
  sheetBonuses?: SheetBonus[]; // Bônus na ficha
  canRepeat?: boolean; // Se pode ser escolhido múltiplas vezes
};
```

#### SpellPath

Caminho mágico para classes conjuradoras:

```typescript
interface SpellPath {
  initialSpells: number; // Magias iniciais
  spellType: 'Arcane' | 'Divine'; // Tipo de magia
  schools?: SpellSchool[]; // Escolas permitidas
  qtySpellsLearnAtLevel: (level: number) => number; // Magias por nível
  spellCircleAvailableAtLevel: (level: number) => number; // Círculo máximo por nível
  keyAttribute: Atributo; // Atributo-chave
}
```

### Campos Importantes

- **attrPriority**: Define a ordem de prioridade para distribuição automática de pontos de atributo
- **powers**: Poderes específicos da classe (diferente de habilidades gerais)
- **originalAbilities**: Campo interno usado para preservar habilidades durante mudanças de nível
- **setup**: Função opcional para configurações especiais da classe (ex: magias iniciais do Arcanista)

### **probDevoto**

Probabilidade dessa classe ser devoto ou não.

### **qtdPoderesConcedidos**

Não é obrigatório. Diz se um devoto deve receber todas as habilidades concedidas pela divindade - neste caso, assumindo o valor `all`.

Se não for definida, é intuído que será escolhido apenas um poder concedido.

### **faithProbability**

Probabilidade de essa classe ser devoto de uma divindade específica. Assume o valor `1` se pode ser devoto dessa divindidade e `0` se não pode.

```TypeScript
faithProbability: {
  AHARADAK: 1,
  OCEANO: 1,
  TENEBRA: 0,
}
```

### **spellPath**

É o caminho de magias que um personagem pode aprender. É definido pela interface [SpellPath](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/interfaces/Class.ts):

```TypeScript
interface SpellPath {
  initialSpells: number;
  spellType: 'Arcane' | 'Divine';
  schools?: SpellSchool[];
  qtySpellsLearnAtLevel: (level: number) => number;
  spellCircleAvailableAtLevel: (level: number) => number;
  keyAttribute: Atributo;
}
```

onde _`initialSpells`_ é a quantidade de magias inicias, _`spellType`_ é o tipo das magias (só pode assumer os valores `Arcane` e `Divine`), _`schools`_ são as escolas de magias (abjuração, convocação, etc), _`qtySpellsLearnAtLevel`_ é uma função lambda que recebe o _`level`_ do jogador
e retorna quantas magias ele aprenderá naquele nível, e _`keyAttribute`_ é o atributo chave das magias.

As escolas de magias são definidas em [Spells.ts](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/interfaces/Spells.ts).

```TypeScript
type SpellSchool =
  | 'Abjur'
  | 'Adiv'
  | 'Conv'
  | 'Encan'
  | 'Evoc'
  | 'Ilusão'
  | 'Necro'
  | 'Trans';
```

### **setup**

Não é obrigatório. É utilizado quando a classe precisa de algo aleatório. Ela é uma função _lambda_ que recebe a classe e retorna ela modificada (por exemplo, com as magias inicias).

## Raças

Todas as raças estão definidas em [src/data/races](src/data/races). Cada arquivo corresponde a uma raça específica.

Uma vez definida, a raça deve ser exportada no array principal em [src/data/racas.ts](src/data/racas.ts). Uma raça exportada automaticamente aparece nos filtros e pode ser selecionada aleatoriamente.

### Interface Race

Uma raça deve implementar a interface [Race](src/interfaces/Race.ts):

```typescript
interface Race {
  name: RaceNames; // Nome da raça
  attributes: {
    // Modificadores de atributos
    attrs: RaceAttributeAbility[];
  };
  abilities: RaceAbility[]; // Habilidades raciais
  oldRace?: Race; // Raça anterior (para Osteon)
  setup?: (race: Race, allRaces: Race[]) => Race; // Função de setup personalizada
  getSize?: (race: Race) => RaceSize; // Função para determinar tamanho
  getDisplacement?: (race: Race) => number; // Função para calcular deslocamento
  faithProbability?: FaithProbability; // Probabilidades de devoção
  size?: RaceSize; // Tamanho fixo da raça
}
```

### Interfaces Auxiliares de Raça

#### RaceAttributeAbility

Define modificadores de atributos raciais:

```typescript
interface RaceAttributeAbility {
  attr: Atributo | 'any'; // Atributo específico ou 'any' para escolha
  mod: number; // Modificador (+1, +2, etc)
}
```

#### RaceAbility

Habilidades raciais:

```typescript
type RaceAbility = {
  name: string; // Nome da habilidade
  description: string; // Descrição da habilidade
  sheetActions?: SheetAction[]; // Ações aplicadas na ficha
  sheetBonuses?: SheetBonus[]; // Bônus aplicados na ficha
};
```

#### RaceSize

Tamanho da raça e seus modificadores:

```typescript
interface RaceSize {
  naturalRange: number; // Alcance natural
  modifiers: {
    stealth: number; // Modificador em Furtividade
    maneuver: number; // Modificador em manobras
  };
  name: string; // Nome do tamanho ('Médio', 'Pequeno', etc)
}
```

### Exemplos de Uso

```typescript
// Modificador fixo em um atributo
{ attr: Atributo.FORÇA, mod: 2 }

// Jogador escolhe qual atributo recebe o modificador
{ attr: 'any', mod: 1 }

// Múltiplos modificadores
attrs: [
  { attr: Atributo.DESTREZA, mod: 2 },
  { attr: Atributo.CONSTITUIÇÃO, mod: -1 }
]
```

## Poderes

Os poderes estão organizados em [src/data/powers](src/data/powers) por tipo:

- **combatPowers.ts**: Poderes de combate
- **destinyPowers.ts**: Poderes de destino
- **grantedPowers.ts**: Poderes concedidos por divindades
- **originPowers.ts**: Poderes de origem
- **spellPowers.ts**: Poderes relacionados a magias
- **tormentaPowers.ts**: Poderes de tormenta

### Interface GeneralPower

```typescript
interface GeneralPower {
  type: GeneralPowerType; // Tipo do poder (COMBATE, DESTINO, etc)
  description: string; // Descrição do poder
  name: string; // Nome do poder
  requirements: Requirement[][]; // Pré-requisitos organizados em grupos
  allowSeveralPicks?: boolean; // Permite múltiplas seleções internas
  canRepeat?: boolean; // Pode ser escolhido múltiplas vezes
  sheetActions?: SheetAction[]; // Ações aplicadas na ficha
  sheetBonuses?: SheetBonus[]; // Bônus aplicados na ficha
}
```

### Sistema de Requisitos

Os requisitos são organizados em grupos (arrays de arrays), onde:

- Dentro de cada grupo, TODOS os requisitos devem ser atendidos (AND)
- Entre grupos diferentes, apenas UM grupo precisa ser atendido (OR)

```typescript
// Exemplo: (Força 15 E Nível 3) OU (Destreza 15 E Acrobacia)
requirements: [
  [
    { type: RequirementType.ATRIBUTO, name: Atributo.FORÇA, value: 15 },
    { type: RequirementType.NIVEL, value: 3 },
  ],
  [
    { type: RequirementType.ATRIBUTO, name: Atributo.DESTREZA, value: 15 },
    { type: RequirementType.PERICIA, name: 'Acrobacia' },
  ],
];
```

### Sistema SheetActions e SheetBonuses

Poderes aplicam efeitos na ficha através de:

#### SheetActions

Modificações permanentes na ficha (adicionar perícias, magias, etc.):

```typescript
type SheetAction = {
  type:
    | 'learnSkill'
    | 'addProficiency'
    | 'getGeneralPower'
    | 'learnSpell'
    | 'increaseAttribute';
  // Dados específicos dependendo do tipo
};
```

#### SheetBonuses

Bônus numéricos aplicados em características:

```typescript
type SheetBonus = {
  target: BonusTarget; // Onde aplicar (PV, PM, Defesa, etc)
  modifier: BonusModifier; // Como calcular o valor
  source?: BonusSource; // Origem do bônus
};
```

## Divindades

O arquivo [divindades.ts](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/data/divindades.ts) exporta a lista de Divindades definidas na pasta [/divindades](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/tree/main/src/data/divindades).

Cada divindade é definida pela interface [Divindade](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/interfaces/Divindade.ts):

```TypeScript
interface Divindade {
  name: string;
  poderes: GeneralPower[];
}
```

Onde _`name`_ é o nome da divindade e _`poderes`_ é uma lista de [poderes](#poderes) que essa divindade pode dar.

## Equipamentos

Definição dos equipamentos. O arquivo [equipamentos.ts](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/data/equipamentos.ts) exporta os equipamentos. Note que cada equipamento está sendo exportado em uma lista própria: Armas, Armaduras, Escudos, etc.

Cada equipamento é definido pela interface [Equipment](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/interfaces/Equipment.ts):

```TypeScript
interface Equipment {
  nome: string;
  dano?: string;
  critico?: string;
  peso?: number;
  tipo?: string;
  alcance?: string;
  group: equipGroup;
}
```

Onde _`group`_ é o grupo da arma, definido pelo tipo _`equipGroup`_:

```TypeScript
type equipGroup =
  | 'Arma'
  | 'Armadura'
  | 'Escudo'
  | 'Item Geral'
  | 'Alquimía'
  | 'Vestuário'
  | 'Hospedagem'
  | 'Alimentação'
  | 'Animal'
  | 'Veículo'
  | 'Serviço'
```

## Nomes

Geração de nomes dependendo da raça. Cada raça recebe duas listas de string: _`Homem`_ para a lista de nomes masculinos e _`Mulher`_ para a lista de nomes femininos.

O nome do objeto deve ser necessariametne o nome da raça (da mesma forma como está escrito no campo _`name`_ das [raças](#raças)).

## Origens

Definição das origens. O arquivo [origins.ts](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/data/origins.ts) define e exporta a lista de origens.

Cada origem é definida pela interface [Origin](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/interfaces/Origin.ts):

```TypeScript
interface Origin {
  name: string;
  pericias: Skill[];
  poderes: (OriginPower | GeneralPower)[];
  getPowersAndSkills?: (usedSkills: Skill[], origin: Origin) => OriginBenefits;
  getItems: () => Items[];
}
```

### **name**

É o nome da origem

### **pericias**

Lista de [perícias](#perícias) adicionais que uma origem oferece.

### **poderes**

Lista de [poderes](#poderes) que a origem oferece.

### **getPowersAndSkills**

É a função que seleciona os poderes e perícias da origem, de acordo com a regra do livro (ou seja, duas opções entre a lista de perícias e poderes combinadas).

Essa função recebe os parâmetros _`usedSkills`_, que é a lista de perícias já selecionadas pelo personagem, e _`origin`_, que é a própria origem em si e retorna um objeto _`OriginBenefits`_, definido como:

```TypeScript
interface OriginBenefits {
  powers: {
    origin: OriginPower[];
    general: PowerGetter[];
  };
  skills: Skill[];
}
```

### **getItems**

É a função que retorna os [itens](#equipamentos) que a origem dá ao personagem.

## Perícias

A lista te perícias está exportada em [Skills.ts](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/interfaces/Skills.ts).

Cada perícia é definida apenas pelo nome.

## Poderes

Definição dos poderes.

## Raças

A lista de raças está exportada no arquivo [racas.ts](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/blob/main/src/data/racas.ts). Cada raça é definida pela interface `Race`:

```TypeScript
interface Race {
  name: string;
  attributes: {
    attrs: RaceAttributeAbility[];
  };
  abilities: RaceAbility[];
  oldRace?: Race;
  setup?: (race: Race, allRaces: Race[]) => Race;
  getSize?: (race: Race) => RaceSize;
  getDisplacement?: (race: Race) => number;
  faithProbability?: FaithProbability;
  size?: RaceSize;
}
```

### **name**

Nome da raça.

### **attributes**

Atributos da raça.

### **abilities**

Lista de habilidades da raça.

### **oldRace**

Uma espécie de raça "anterior". É primordialmente utilizado para o Osteon, então define o que ele era antes de morrer.

### **setup**

Função de setup da raça.

### **getSize**

Função que retorna o tamanho da raça.

### **getDisplacement**

Função que retorna o deslocamento da raça.

### **faithProbability**

Probabilidade de ser devoto de uma divindade específica.

### **size**

Tamanho da raça.

## 💻 Como Desenvolver

### Comandos Essenciais

```bash
# Desenvolvimento
npm start              # Inicia servidor de desenvolvimento
npm run build         # Build para produção
npm run deploy        # Deploy para GitHub Pages

# Qualidade de Código
npx tsc --noEmit      # Verificação TypeScript
npx eslint src/       # Linting
npx prettier --write src/  # Formatação

# Testes
npm test              # Executa testes
npm run testWatch     # Testes em modo watch
```

### Fluxo de Desenvolvimento

1. **Crie uma branch** para sua funcionalidade:

   ```bash
   git checkout -b feature/nome-da-funcionalidade
   ```

2. **Desenvolva seguindo os padrões**:

   - Use TypeScript com tipagem estrita
   - Siga convenções de nomenclatura existentes
   - Mantenha componentes pequenos e focados
   - Adicione testes para novas funcionalidades

3. **Teste sua implementação**:

   - Execute os testes automatizados
   - Teste manualmente no navegador
   - Verifique responsividade mobile

4. **Qualidade de código**:
   ```bash
   # Execute antes de commitar
   npx prettier --write src/
   npx eslint src/ --fix
   npx tsc --noEmit
   ```

## 📝 Padrões de Código

### TypeScript

- **Tipagem estrita**: Sempre use tipos explícitos
- **Interfaces**: Prefira interfaces a types quando possível
- **Enums**: Use para constantes relacionadas
- **Null safety**: Trate casos undefined/null adequadamente

### React

- **Componentes funcionais**: Use hooks em vez de classes
- **Props tipadas**: Sempre defina interfaces para props
- **Estado local**: Use useState para estado componente
- **Estado global**: Use Redux apenas quando necessário

### Estilização

- **Material-UI**: Componentes principais da interface
- **Tailwind**: Classes utilitárias para ajustes
- **Responsividade**: Mobile-first design
- **Tema**: Suporte a modo claro/escuro

### Convenções de Nome

- **Arquivos**: camelCase para funções, PascalCase para componentes
- **Variáveis**: camelCase descritivo
- **Constantes**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase com descrição clara

## 🧪 Testes

### Executando Testes

```bash
npm test           # Executa todos os testes
npm run testWatch  # Modo watch para desenvolvimento
```

### Tipos de Testes

- **Unit tests**: Funções utilitárias e lógica de negócio
- **Component tests**: Componentes React isolados
- **Integration tests**: Fluxos completos de funcionalidades

### Escrevendo Testes

- Use Vitest como framework principal
- Teste casos de sucesso e erro
- Mock dependências externas quando necessário
- Mantenha testes simples e focados

## 🔄 Pull Requests

### Antes de Submeter

1. **Certifique-se que tudo funciona**:

   ```bash
   npm test
   npx tsc --noEmit
   npx eslint src/
   npm run build
   ```

2. **Descreva suas mudanças**:

   - Use título claro e descritivo
   - Explique o problema que resolve
   - Liste mudanças principais
   - Inclua screenshots se relevante

3. **Mantenha commits organizados**:
   - Commits pequenos e focados
   - Mensagens descritivas em português
   - Histórico linear limpo

### Template de PR

```markdown
## 📋 Descrição

[Descreva o que foi implementado/corrigido]

## 🎯 Tipo de Mudança

- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Melhoria de código
- [ ] Documentação

## 🧪 Testes

- [ ] Testes passando
- [ ] Novos testes adicionados
- [ ] Testado manualmente

## 📱 Screenshots

[Se aplicável, inclua imagens das mudanças]
```

## 🤝 Comunidade

- **Discussões**: Use [GitHub Discussions](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions) para perguntas
- **Issues**: Reporte bugs e sugira funcionalidades
- **Discord**: [Link do servidor] (se houver)
- **Email**: contato@fichasdenimb.com.br

## 📚 Recursos Úteis

- [Documentação Tormenta 20](https://jamboeditora.com.br/tormenta20/)
- [Material-UI Docs](https://mui.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Obrigado por contribuir! 🚀**

Sua ajuda torna este projeto melhor para toda a comunidade T20.
