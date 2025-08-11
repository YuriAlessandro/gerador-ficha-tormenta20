# Especificação Técnica: Gerador de Ameaças

## Visão Geral
O **Gerador de Ameaças** é uma funcionalidade para criar inimigos e NPCs seguindo as diretrizes do livro Tormenta 20. O sistema permite a criação de ameaças personalizadas através de 8 etapas sequenciais.

## 1. Etapas de Geração

### Etapa 1: Tipo, Tamanho, Papel e Deslocamento

#### Tipos de Criatura (6 opções):
- **Animal**
- **Construto**
- **Espírito**
- **Humanoide**
- **Monstro**
- **Morto-vivo**

#### Tamanhos (6 opções):
- **Minúsculo**
- **Pequeno**
- **Médio**
- **Grande**
- **Enorme**
- **Colossal**

#### Papéis (3 opções):
- **Solo** - Inimigo único poderoso
- **Lacaio** - Inimigos mais fracos para combate em grupo
- **Especial** - Inimigos únicos ou chefes

#### Deslocamento:
- Campo de texto livre (placeholder por enquanto)

---

### Etapa 2: Nível de Desafio (ND)

#### Opções de ND:
- **Fracionários**: 1/4, 1/3, 1/2
- **Inteiros**: 1 até 20
- **Épicos**: S, S+

---

### Etapa 3: Estatísticas de Combate

Baseadas em tabelas específicas para cada papel:

#### Solo - Tabela de Estatísticas

| ND  | Valor de Ataque | Dano Médio | Defesa | Resistência Forte (80%) | Resistência Média (50%) | Resistência Fraca (20%) | PV   | Efeito Padrão (CD) |
|-----|------------------|------------|--------|--------------------------|--------------------------|--------------------------|------|---------------------|
| 1/4 | 6                | 4          | 10     | 2                        | 4                        | 6                        | 8    | 13                  |
| 1/2 | 7                | 6          | 11     | 4                        | 6                        | 8                        | 15   | 13                  |
| 1   | 8                | 10         | 14     | 6                        | 8                        | 10                       | 30   | 13                  |
| 2   | 10               | 14         | 16     | 8                        | 10                       | 12                       | 45   | 13                  |
| 3   | 11               | 20         | 17     | 10                       | 12                       | 14                       | 60   | 13                  |
| 4   | 12               | 26         | 18     | 12                       | 14                       | 16                       | 90   | 13                  |
| 5   | 14               | 32         | 20     | 14                       | 16                       | 18                       | 120  | 15                  |
| 6   | 15               | 38         | 21     | 16                       | 18                       | 20                       | 150  | 15                  |
| 7   | 16               | 44         | 22     | 18                       | 20                       | 22                       | 200  | 15                  |
| 8   | 18               | 50         | 23     | 20                       | 22                       | 24                       | 250  | 15                  |
| 9   | 19               | 56         | 24     | 22                       | 24                       | 26                       | 300  | 15                  |
| 10  | 20               | 62         | 25     | 24                       | 26                       | 28                       | 400  | 17                  |
| 11  | 22               | 68         | 26     | 26                       | 28                       | 30                       | 500  | 17                  |
| 12  | 23               | 74         | 27     | 28                       | 30                       | 32                       | 600  | 17                  |
| 13  | 24               | 80         | 28     | 30                       | 32                       | 34                       | 700  | 17                  |
| 14  | 26               | 86         | 29     | 32                       | 34                       | 36                       | 850  | 17                  |
| 15  | 27               | 92         | 30     | 34                       | 36                       | 38                       | 1000 | 19                  |
| 16  | 28               | 98         | 31     | 36                       | 38                       | 40                       | 1200 | 19                  |
| 17  | 30               | 104        | 32     | 38                       | 40                       | 42                       | 1400 | 19                  |
| 18  | 31               | 110        | 33     | 40                       | 42                       | 44                       | 1600 | 19                  |
| 19  | 32               | 116        | 34     | 42                       | 44                       | 46                       | 1800 | 19                  |
| 20  | 34               | 122        | 35     | 44                       | 46                       | 48                       | 2000 | 21                  |
| S   | 50               | 300        | 36     | 30                       | 20                       | 10                       | 2500 | 23                  |
| S+  | 65               | 500        | 40     | 38                       | 25                       | 12                       | 4000 | 25                  |

#### Lacaio - Tabela de Estatísticas

| ND  | Valor de Ataque | Dano Médio | Defesa | Resistência Forte (80%) | Resistência Média (50%) | Resistência Fraca (20%) | PV   | Efeito Padrão (CD) |
|-----|------------------|------------|--------|--------------------------|--------------------------|--------------------------|------|---------------------|
| 1/4 | 6                | 4          | 9      | 1                        | 3                        | 5                        | 6    | 12                  |
| 1/2 | 7                | 6          | 10     | 3                        | 5                        | 7                        | 12   | 12                  |
| 1   | 8                | 10         | 13     | 5                        | 7                        | 9                        | 24   | 12                  |
| 2   | 10               | 14         | 15     | 7                        | 9                        | 11                       | 36   | 12                  |
| 3   | 11               | 20         | 16     | 9                        | 11                       | 13                       | 48   | 12                  |
| 4   | 12               | 26         | 17     | 11                       | 13                       | 15                       | 72   | 12                  |
| 5   | 14               | 32         | 19     | 13                       | 15                       | 17                       | 96   | 14                  |
| 6   | 15               | 38         | 20     | 15                       | 17                       | 19                       | 120  | 14                  |
| 7   | 16               | 44         | 21     | 17                       | 19                       | 21                       | 160  | 14                  |
| 8   | 18               | 50         | 22     | 19                       | 21                       | 23                       | 200  | 14                  |
| 9   | 19               | 56         | 23     | 21                       | 23                       | 25                       | 240  | 14                  |
| 10  | 20               | 62         | 24     | 23                       | 25                       | 27                       | 320  | 16                  |
| 11  | 22               | 68         | 25     | 25                       | 27                       | 29                       | 400  | 16                  |
| 12  | 23               | 74         | 26     | 27                       | 29                       | 31                       | 480  | 16                  |
| 13  | 24               | 80         | 27     | 29                       | 31                       | 33                       | 560  | 16                  |
| 14  | 26               | 86         | 28     | 31                       | 33                       | 35                       | 680  | 16                  |
| 15  | 27               | 92         | 29     | 33                       | 35                       | 37                       | 800  | 18                  |
| 16  | 28               | 98         | 30     | 35                       | 37                       | 39                       | 960  | 18                  |
| 17  | 30               | 104        | 31     | 37                       | 39                       | 41                       | 1120 | 18                  |
| 18  | 31               | 110        | 32     | 39                       | 41                       | 43                       | 1280 | 18                  |
| 19  | 32               | 116        | 33     | 41                       | 43                       | 45                       | 1440 | 18                  |
| 20  | 34               | 122        | 34     | 43                       | 45                       | 47                       | 1600 | 20                  |
| S   | 50               | 300        | 35     | 29                       | 19                       | 9                        | 2000 | 22                  |
| S+  | 67               | 540        | 38     | 37                       | 26                       | 15                       | 3200 | 55                  |

#### Especial - Tabela de Estatísticas

| ND  | Valor de Ataque | Dano Médio | Defesa | Resistência Forte (80%) | Resistência Média (50%) | Resistência Fraca (20%) | PV   | Efeito Padrão (CD) |
|-----|------------------|------------|--------|--------------------------|--------------------------|--------------------------|------|---------------------|
| 1/4 | 8                | 4          | 11     | 3                        | 5                        | 7                        | 8    | 14                  |
| 1/2 | 9                | 6          | 12     | 5                        | 7                        | 9                        | 16   | 14                  |
| 1   | 10               | 10         | 15     | 7                        | 9                        | 11                       | 32   | 14                  |
| 2   | 12               | 14         | 17     | 9                        | 11                       | 13                       | 48   | 14                  |
| 3   | 13               | 20         | 18     | 11                       | 13                       | 15                       | 64   | 14                  |
| 4   | 14               | 26         | 19     | 13                       | 15                       | 17                       | 96   | 14                  |
| 5   | 16               | 32         | 21     | 15                       | 17                       | 19                       | 128  | 16                  |
| 6   | 17               | 38         | 22     | 17                       | 19                       | 21                       | 160  | 16                  |
| 7   | 18               | 44         | 23     | 19                       | 21                       | 23                       | 200  | 16                  |
| 8   | 20               | 50         | 24     | 21                       | 23                       | 25                       | 250  | 16                  |
| 9   | 21               | 56         | 25     | 23                       | 25                       | 27                       | 300  | 16                  |
| 10  | 22               | 62         | 26     | 25                       | 27                       | 29                       | 400  | 18                  |
| 11  | 24               | 68         | 27     | 27                       | 29                       | 31                       | 500  | 18                  |
| 12  | 25               | 74         | 28     | 29                       | 31                       | 33                       | 600  | 18                  |
| 13  | 26               | 80         | 29     | 31                       | 33                       | 35                       | 700  | 18                  |
| 14  | 28               | 86         | 30     | 33                       | 35                       | 37                       | 850  | 18                  |
| 15  | 29               | 92         | 31     | 35                       | 37                       | 39                       | 1000 | 20                  |
| 16  | 30               | 98         | 32     | 37                       | 39                       | 41                       | 1200 | 20                  |
| 17  | 32               | 104        | 33     | 39                       | 41                       | 43                       | 1400 | 20                  |
| 18  | 33               | 110        | 34     | 41                       | 43                       | 45                       | 1600 | 20                  |
| 19  | 34               | 116        | 35     | 43                       | 45                       | 47                       | 1800 | 20                  |
| 20  | 36               | 122        | 36     | 45                       | 47                       | 49                       | 2000 | 22                  |
| S   | 55               | 300        | 37     | 33                       | 22                       | 11                       | 2500 | 24                  |
| S+  | 60               | 500        | 40     | 38                       | 25                       | 12                       | 4000 | 55                  |

#### Pontos de Mana (PM) - Opcional
- **Pergunta booleana**: "A criatura possui pontos de mana?"
- **Cálculo se Sim**: PM = **3 × ND**
  - ND 1/4 = 1 PM (arredonda 0,75 para cima)
  - ND 1/3 = 1 PM
  - ND 1/2 = 2 PM (arredonda 1,5 para cima)
  - ND 1 = 3 PM
  - ND 2 = 6 PM
  - ND 20 = 60 PM
  - ND S = 60 PM (assume ND 20 como base)
  - ND S+ = 63 PM (assume ND 21 como base)

---

### Etapa 4: Ataques

#### Sistema de Ataques:
- **Nome Customizável**: Usuário define o nome (ex: "Garras", "Mordida", "Espada Longa")
- **Múltiplos Ataques**: Pode adicionar quantos ataques desejar
- **Distribuição de Dano**: O "Dano Médio" da tabela pode ser:
  - Usado para um único ataque
  - Distribuído entre múltiplos ataques conforme preferência do usuário
- **Bônus Adicionais**: Usuário pode adicionar bônus extras de dano
- **Modificador de Ataque**: Usa o "Valor de Ataque" da tabela

#### Exemplos:
Para ND 5 Solo (32 dano médio):
- **Opção 1**: Ataque único "Machado Grande" (32 dano)
- **Opção 2**: Dois ataques "Garras" (20) + "Mordida" (12)
- **Opção 3**: Três ataques "Espada" (15) + "Espada" (15) + "Cabeçada" (2)

---

### Etapa 5: Habilidades

#### Sistema de Habilidades:
- **Lista Pré-definida**: Habilidades do livro oficial
- **Seleção Livre**: Usuário pode escolher quantas quiser
- **Texto de Orientação**: 
  > "Como regra geral, uma ameaça solo ou lacaio pode ter de uma a duas habilidades por patamar de desafio, enquanto uma especial terá de duas a três habilidades por patamar."

#### Patamares de Desafio:
- **Iniciante**: ND 1/4 a 4
- **Veterano**: ND 5 a 10
- **Campeão**: ND 11 a 16
- **Lenda**: ND 17 a 20
- **L+**: ND S e S+

#### Recomendações por Papel:
- **Solo/Lacaio**: 1-2 habilidades por patamar
  - Iniciante: 1-2 habilidades
  - Veterano: 2-4 habilidades total
  - Campeão: 3-6 habilidades total
  - Lenda: 4-8 habilidades total
  - L+: 5-10 habilidades total

- **Especial**: 2-3 habilidades por patamar
  - Iniciante: 2-3 habilidades
  - Veterano: 4-6 habilidades total
  - Campeão: 6-9 habilidades total
  - Lenda: 8-12 habilidades total
  - L+: 10-15 habilidades total

#### Interface:
Mostrar recomendação baseada no ND e papel:
- Exemplo: "Recomendado: 2-4 habilidades (Veterano)" para ND 7 Solo

---

### Etapa 6: Estatísticas Secundárias

#### Atributos:
- **Valores Livres**: Usuário define todos os 6 atributos:
  - Força
  - Destreza
  - Constituição
  - Inteligência
  - Sabedoria
  - Carisma

#### Perícias:
- **Cálculo Base**: Mesmo sistema das fichas de personagem:
  - **Base** = (ND ÷ 2) + Modificador do Atributo
  - **Treinamento**: Criatura pode ser treinada em perícias
  - **Bônus Customizados**: Usuário pode adicionar bônus extras
- **Fórmula Final**: 
  - Total da Perícia = (ND÷2) + Mod Atributo + Treinamento + Bônus Customizado

#### Exemplo:
ND 10 com Destreza 16 (+3):
- Acrobacia Base = 5 (metade do ND) + 3 (mod Destreza) = 8
- Se treinado: +2 = 10
- Se bônus customizado +3: = 13

---

### Etapa 7: Equipamentos e Tesouro

#### Equipamentos:
- **Campo de Texto Livre**: Usuário digita qualquer equipamento
- Exemplos: "Espada longa, armadura de couro, poção de cura"

#### Tesouro:
- **Dropdown com 4 opções**:
  - **"Nenhum"**: Sem tesouro
  - **"Padrão"**: Tesouro normal para o ND
  - **"Metade"**: Metade do tesouro padrão
  - **"Dobro"**: Dobro do tesouro padrão

---

### Etapa 8: Nome

#### Nome da Criatura:
- **Campo de Texto Simples**: Usuário digita qualquer nome
- Exemplos: "Goblin Guerreiro", "Dragão Ancião", "Zumbi Putrefato"

---

## 2. Arquitetura de Implementação

### 2.1 Estrutura de Arquivos

```
src/
├── components/
│   └── ThreatGenerator/
│       ├── ThreatGeneratorScreen.tsx      # Tela principal
│       ├── steps/                         # Componentes das etapas
│       │   ├── StepOne.tsx               # Tipo, Tamanho, Papel
│       │   ├── StepTwo.tsx               # Nível de Desafio
│       │   ├── StepThree.tsx             # Estatísticas de Combate
│       │   ├── StepFour.tsx              # Ataques
│       │   ├── StepFive.tsx              # Habilidades
│       │   ├── StepSix.tsx               # Estatísticas Secundárias
│       │   ├── StepSeven.tsx             # Equipamentos e Tesouro
│       │   └── StepEight.tsx             # Nome
│       └── ThreatResult.tsx               # Visualização da Ameaça
├── data/
│   └── threats/
│       ├── combatTables.ts                # Tabelas de estatísticas
│       ├── threatAbilities.ts             # Habilidades pré-definidas
│       └── threatTypes.ts                 # Tipos, tamanhos, papéis
├── functions/
│   └── threatGenerator.ts                 # Lógica de geração
├── interfaces/
│   └── ThreatSheet.ts                     # Interface da ameaça
└── store/
    └── threatBuilderSlice.ts              # Estado Redux
```

### 2.2 Interfaces TypeScript

```typescript
// src/interfaces/ThreatSheet.ts

export enum ThreatType {
  ANIMAL = 'Animal',
  CONSTRUTO = 'Construto',
  ESPIRITO = 'Espírito',
  HUMANOIDE = 'Humanoide',
  MONSTRO = 'Monstro',
  MORTO_VIVO = 'Morto-vivo',
}

export enum ThreatSize {
  MINUSCULO = 'Minúsculo',
  PEQUENO = 'Pequeno',
  MEDIO = 'Médio',
  GRANDE = 'Grande',
  ENORME = 'Enorme',
  COLOSSAL = 'Colossal',
}

export enum ThreatRole {
  SOLO = 'Solo',
  LACAIO = 'Lacaio',
  ESPECIAL = 'Especial',
}

export enum ChallengeLevel {
  QUARTER = '1/4',
  THIRD = '1/3',
  HALF = '1/2',
  ONE = '1',
  TWO = '2',
  // ... até 20
  TWENTY = '20',
  S = 'S',
  S_PLUS = 'S+',
}

export enum TreasureLevel {
  NONE = 'Nenhum',
  STANDARD = 'Padrão',
  HALF = 'Metade',
  DOUBLE = 'Dobro',
}

export interface ThreatAttack {
  name: string;
  damage: number;
  bonusDamage: number;
}

export interface ThreatAbility {
  id: string;
  name: string;
  description: string;
  category?: string;
}

export interface ThreatAttributes {
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
}

export interface ThreatSkill {
  name: string;
  trained: boolean;
  customBonus: number;
  total: number; // Calculado
}

export interface ThreatCombatStats {
  attackValue: number;
  averageDamage: number;
  defense: number;
  strongSave: number; // Resistência Forte (80%)
  mediumSave: number; // Resistência Média (50%)
  weakSave: number;   // Resistência Fraca (20%)
  hitPoints: number;
  standardEffectDC: number;
  manaPoints?: number; // Opcional
}

export interface ThreatSheet {
  id: string;
  name: string;
  type: ThreatType;
  size: ThreatSize;
  role: ThreatRole;
  challengeLevel: ChallengeLevel;
  displacement: string;
  
  // Estatísticas de combate (auto-calculadas)
  combatStats: ThreatCombatStats;
  
  // Ataques definidos pelo usuário
  attacks: ThreatAttack[];
  
  // Habilidades selecionadas
  abilities: ThreatAbility[];
  
  // Atributos e perícias
  attributes: ThreatAttributes;
  skills: ThreatSkill[];
  
  // Equipamentos e tesouro
  equipment: string;
  treasureLevel: TreasureLevel;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3 Tabelas de Dados

```typescript
// src/data/threats/combatTables.ts

export interface CombatStatsEntry {
  nd: string; // '1/4', '1/2', '1', '2', etc.
  attackValue: number;
  averageDamage: number;
  defense: number;
  strongSave: number;
  mediumSave: number;
  weakSave: number;
  hitPoints: number;
  standardEffectDC: number;
}

export const SOLO_COMBAT_TABLE: CombatStatsEntry[] = [
  {
    nd: '1/4',
    attackValue: 6,
    averageDamage: 4,
    defense: 10,
    strongSave: 2,
    mediumSave: 4,
    weakSave: 6,
    hitPoints: 8,
    standardEffectDC: 13,
  },
  // ... todas as entradas da tabela Solo
];

export const LACAIO_COMBAT_TABLE: CombatStatsEntry[] = [
  // ... entradas da tabela Lacaio
];

export const ESPECIAL_COMBAT_TABLE: CombatStatsEntry[] = [
  // ... entradas da tabela Especial
];

export const COMBAT_TABLES = {
  [ThreatRole.SOLO]: SOLO_COMBAT_TABLE,
  [ThreatRole.LACAIO]: LACAIO_COMBAT_TABLE,
  [ThreatRole.ESPECIAL]: ESPECIAL_COMBAT_TABLE,
};
```

### 2.4 Funções de Cálculo

```typescript
// src/functions/threatGenerator.ts

export function calculateCombatStats(
  role: ThreatRole,
  challengeLevel: ChallengeLevel
): ThreatCombatStats {
  const table = COMBAT_TABLES[role];
  const entry = table.find(e => e.nd === challengeLevel);
  
  if (!entry) {
    throw new Error(`Stats not found for role ${role} and ND ${challengeLevel}`);
  }
  
  return {
    attackValue: entry.attackValue,
    averageDamage: entry.averageDamage,
    defense: entry.defense,
    strongSave: entry.strongSave,
    mediumSave: entry.mediumSave,
    weakSave: entry.weakSave,
    hitPoints: entry.hitPoints,
    standardEffectDC: entry.standardEffectDC,
  };
}

export function calculateManaPoints(challengeLevel: ChallengeLevel): number {
  const ndValue = parseNDValue(challengeLevel);
  return Math.ceil(ndValue * 3);
}

export function parseNDValue(challengeLevel: ChallengeLevel): number {
  switch (challengeLevel) {
    case ChallengeLevel.QUARTER: return 0.25;
    case ChallengeLevel.THIRD: return 0.33;
    case ChallengeLevel.HALF: return 0.5;
    case ChallengeLevel.S: return 20; // Assume ND 20
    case ChallengeLevel.S_PLUS: return 21; // Assume ND 21
    default: return parseInt(challengeLevel);
  }
}

export function calculateSkillValue(
  challengeLevel: ChallengeLevel,
  attributeModifier: number,
  trained: boolean,
  customBonus: number
): number {
  const ndValue = parseNDValue(challengeLevel);
  const halfND = Math.floor(ndValue / 2);
  const trainingBonus = trained ? 2 : 0;
  
  return halfND + attributeModifier + trainingBonus + customBonus;
}

export function getRecommendedAbilityCount(
  role: ThreatRole,
  challengeLevel: ChallengeLevel
): { min: number; max: number } {
  const tier = getTierByChallengeLevel(challengeLevel);
  
  const tierMultipliers = {
    'Iniciante': 1,
    'Veterano': 2,
    'Campeão': 3,
    'Lenda': 4,
    'L+': 5,
  };
  
  const multiplier = tierMultipliers[tier];
  
  if (role === ThreatRole.ESPECIAL) {
    return { min: multiplier * 2, max: multiplier * 3 };
  } else {
    return { min: multiplier * 1, max: multiplier * 2 };
  }
}

function getTierByChallengeLevel(challengeLevel: ChallengeLevel): string {
  const ndValue = parseNDValue(challengeLevel);
  
  if (ndValue >= 0.25 && ndValue <= 4) return 'Iniciante';
  if (ndValue >= 5 && ndValue <= 10) return 'Veterano';
  if (ndValue >= 11 && ndValue <= 16) return 'Campeão';
  if (ndValue >= 17 && ndValue <= 20) return 'Lenda';
  return 'L+'; // S e S+
}
```

## 3. Interface do Usuário

### 3.1 Fluxo de Navegação
1. **Tela Principal** com botão "Gerador de Ameaças"
2. **Wizard de 8 Etapas** com navegação sequencial
3. **Tela de Resultado** mostrando a ameaça gerada
4. **Histórico de Ameaças** para visualizar/editar ameaças criadas

### 3.2 Componentes da UI

#### ThreatGeneratorScreen.tsx
- Stepper do Material-UI mostrando progresso
- Navegação entre etapas
- Validação de campos obrigatórios
- Botões "Anterior", "Próximo", "Finalizar"

#### Etapas Específicas:

**StepOne.tsx**: 
- 3 Select dropdowns (Tipo, Tamanho, Papel)
- Campo de texto para Deslocamento

**StepTwo.tsx**: 
- Select dropdown com todos os NDs
- Opções agrupadas: Fracionários, Inteiros, Épicos

**StepThree.tsx**: 
- Display das estatísticas calculadas (readonly)
- Checkbox "Possui PM" com cálculo automático
- Cards mostrando cada estatística

**StepFour.tsx**: 
- Lista dinâmica de ataques
- Campos: Nome, Dano, Bônus
- Botão "Adicionar Ataque"
- Indicador do dano total vs. dano recomendado da tabela

**StepFive.tsx**: 
- Lista de habilidades disponíveis com checkboxes
- Busca/filtro por nome ou categoria
- Contador mostrando recomendação vs. selecionadas
- Texto orientativo sobre quantidade

**StepSix.tsx**: 
- 6 campos numéricos para atributos
- Tabela de perícias com:
  - Checkbox "Treinada"
  - Campo de bônus customizado
  - Valor final calculado (readonly)

**StepSeven.tsx**: 
- Campo de texto livre para equipamentos
- Select dropdown para nível de tesouro

**StepEight.tsx**: 
- Campo de texto para nome
- Preview das informações principais

### 3.3 ThreatResult.tsx
- Layout similar ao Result.tsx das fichas de personagem
- Cards organizados mostrando todas as informações
- Botões de ação: Editar, Exportar PDF, Exportar Foundry
- Histórico de modificações

## 4. Estado Redux

```typescript
// src/store/threatBuilderSlice.ts

interface ThreatBuilderState {
  currentThreat: Partial<ThreatSheet>;
  currentStep: number;
  isGenerating: boolean;
  generatedThreats: ThreatSheet[];
  selectedThreatId: string | null;
  
  // Cache para otimização
  availableAbilities: ThreatAbility[];
  combatStatsCache: Record<string, ThreatCombatStats>;
}

const threatBuilderSlice = createSlice({
  name: 'threatBuilder',
  initialState: initialState,
  reducers: {
    updateThreatField: (state, action) => {
      // Atualiza campo específico da ameaça atual
    },
    calculateCombatStats: (state) => {
      // Recalcula estatísticas baseadas no papel e ND
    },
    addAttack: (state, action) => {
      // Adiciona novo ataque
    },
    removeAttack: (state, action) => {
      // Remove ataque
    },
    toggleAbility: (state, action) => {
      // Adiciona/remove habilidade selecionada
    },
    updateSkill: (state, action) => {
      // Atualiza perícia específica
    },
    nextStep: (state) => {
      // Avança para próxima etapa
    },
    previousStep: (state) => {
      // Volta etapa anterior
    },
    finalizeThreat: (state) => {
      // Finaliza e salva ameaça
    },
    loadThreat: (state, action) => {
      // Carrega ameaça existente para edição
    },
    resetBuilder: (state) => {
      // Reseta builder para nova ameaça
    },
  },
});
```

## 5. Integração com Sistema Existente

### 5.1 Roteamento
- **URL**: `/gerador-ameacas`
- **Breadcrumb**: Home > Gerador de Ameaças

### 5.2 Navegação
- **LandingPage**: Novo card "Gerador de Ameaças"
- **Sidebar**: Item "Ameaças" no menu
- **Ícone**: Usar ícone de monstro ou dragão

### 5.3 Persistência
- **localStorage**: Histórico de ameaças geradas
- **Chave**: `fdnThreats` (similar a `fdnHistoric`)
- **Limite**: 50 ameaças no histórico

### 5.4 Exportação
- **PDF**: Template específico para ameaças
- **Foundry**: Formato de NPC para Foundry VTT
- **JSON**: Export/import de ameaças

## 6. Considerações Técnicas

### 6.1 Performance
- Lazy loading dos componentes das etapas
- Memoização dos cálculos de estatísticas
- Debounce nos campos de entrada numérica

### 6.2 Responsividade
- Layout otimizado para mobile
- Steppers adaptáveis para telas pequenas
- Cards responsivos

### 6.3 Acessibilidade
- Labels adequados para todos os campos
- Navegação por teclado
- Cores com contraste adequado
- Screen reader friendly

### 6.4 Validação
- Campos obrigatórios marcados
- Validação em tempo real
- Mensagens de erro claras em português
- Prevenção de valores inválidos

## 7. Testes

### 7.1 Testes Unitários
- Funções de cálculo de estatísticas
- Parsing de NDs fracionários
- Cálculos de perícias e PM
- Validações de formulário

### 7.2 Testes de Integração
- Fluxo completo de criação de ameaça
- Redux state management
- Persistência no localStorage

### 7.3 Casos de Teste
```typescript
describe('ThreatGenerator', () => {
  test('calcula estatísticas corretamente para Solo ND 5', () => {
    const stats = calculateCombatStats(ThreatRole.SOLO, ChallengeLevel.FIVE);
    expect(stats.attackValue).toBe(14);
    expect(stats.hitPoints).toBe(120);
  });
  
  test('calcula PM corretamente para ND fracionário', () => {
    const pm = calculateManaPoints(ChallengeLevel.HALF);
    expect(pm).toBe(2); // 0.5 * 3 = 1.5, arredondado para 2
  });
  
  test('recomenda quantidade correta de habilidades', () => {
    const rec = getRecommendedAbilityCount(ThreatRole.ESPECIAL, ChallengeLevel.TEN);
    expect(rec.min).toBe(4); // Veterano = 2 patamares, Especial = 2-3 por patamar
    expect(rec.max).toBe(6);
  });
});
```

## 8. Roadmap de Implementação

### Fase 1: Estrutura Base
- [ ] Criar interfaces TypeScript
- [ ] Implementar tabelas de dados
- [ ] Configurar roteamento
- [ ] Criar componente principal

### Fase 2: Etapas Básicas
- [ ] StepOne: Tipo, Tamanho, Papel
- [ ] StepTwo: Nível de Desafio
- [ ] StepThree: Estatísticas de Combate
- [ ] Navegação entre etapas

### Fase 3: Funcionalidades Avançadas
- [ ] StepFour: Sistema de Ataques
- [ ] StepFive: Seleção de Habilidades
- [ ] StepSix: Atributos e Perícias

### Fase 4: Finalização
- [ ] StepSeven: Equipamentos/Tesouro
- [ ] StepEight: Nome
- [ ] ThreatResult: Visualização

### Fase 5: Persistência e Export
- [ ] Redux state management
- [ ] localStorage persistence
- [ ] Histórico de ameaças
- [ ] Exportação PDF/Foundry

### Fase 6: Polimento
- [ ] Testes unitários
- [ ] Otimizações de performance
- [ ] Melhorias de UX
- [ ] Documentação

## 9. Considerações Finais

Este documento serve como especificação técnica completa para implementar o Gerador de Ameaças. Todas as funcionalidades seguem as regras oficiais do Tormenta 20 e mantêm consistência com o sistema existente de geração de personagens.

A implementação deve ser feita incrementalmente, seguindo o roadmap proposto, sempre mantendo a qualidade do código e a experiência do usuário em primeiro lugar.