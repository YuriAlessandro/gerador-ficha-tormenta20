---
name: build-tormenta20
description: Generate a detailed, optimized Tormenta 20 character build (levels 1-20) from a user-provided concept. Reads actual class/origin/spell/power data from this repo to ground every recommendation in real game content. Produces a structured per-level progression with brief why/how for each choice, a turn-of-combat combo, and item recommendations. Use when the user asks for a build, "conceito de personagem", "build de X focado em Y", or anything similar.
---

# build-tormenta20

Generate an optimized, fully-referenced Tormenta 20 character build from a single-sentence concept. Output is a per-level progression (1-20) with the *why* behind every choice.

## Trigger

User describes a character concept. Examples:
- "Bardo focado em porrada com testes de atuação"
- "Clérigo de Marah que cura à distância"
- "Ladino arcano híbrido com Lutador"
- "Build de Cavaleiro Bastião tanque"

Concept may include: class, theme, key mechanic, optional multiclass, deity, race preference. If any of these are missing, **make the best call** and call it out in the output — don't ask round-trip questions unless the concept is genuinely ambiguous.

## Hard rules — read these every time

**NEVER invent game content.** This is the failure mode that costs the most iterations. Before writing any spell name, power name, origin power, or class feature into the output, you MUST have read it from the actual repo files. If you catch yourself thinking "I'm pretty sure X exists in T20" — stop and grep first.

The first three times you build, the user *will* test you by asking about specific spells/powers. Wrong names destroy trust in the whole build.

## Source files (always read these)

1. **Classes**: `src/data/systems/tormenta20/classes/<class>.ts`
   - `abilities`: automatic features by level (don't count as power picks)
   - `powers`: pool of class powers + requirements
   - `attrPriority`: hint for attribute priorities
   - `periciasbasicas` / `periciasrestantes`: training rules
   - `setup`: if caster — gives `spellPath` (circles per level, key attribute, spell type)

2. **Origins**: `src/data/systems/tormenta20/origins.ts`
   - `pericias`: 2 perícias granted (if class already trained, player chooses another)
   - `poderes`: pool of origin powers — player picks **1**
   - `getItems`: starting items

3. **General powers**:
   - `src/data/systems/tormenta20/powers/combatPowers.ts`
   - `src/data/systems/tormenta20/powers/spellPowers.ts`
   - `src/data/systems/tormenta20/powers/destinyPowers.ts`
   - `src/data/systems/tormenta20/powers/originPowers.ts`
   - Read `requirements` carefully — many combat powers require Luta, an attribute, or a previous power.

4. **Spells** (if caster):
   - Index files: `src/data/systems/tormenta20/magias/arcane.ts` and `divine.ts` — show which spells exist per circle and per school
   - Definitions: `src/data/systems/tormenta20/magias/generalSpells.ts` — actual text, execução, alcance, **aprimoramentos** (these are often where the build's best combos hide)
   - Use `grep -n "\.<spellName>\]:" generalSpells.ts` to jump to a spell's definition

5. **Races**: search `src/data/systems/tormenta20/racas/` (or similar) — only if the concept hinges on race-specific abilities.

6. **Supplements**: if the user names one (e.g. "Herois de Arton", "Atlas de Arton"), also read `src/data/systems/tormenta20/<supplement>/` for variant classes/powers.

## Game rules — verified against this codebase

These rules are easy to misremember. Trust this list over your prior assumptions.

- **1 poder por nível** (class OR general), 20 total. Class automatic features at specific levels (e.g. Bardo's Inspiração at N1, Eclético at N2, Artista Completo at N20) are **bonus** and don't consume the power slot.
- **Aumento de Atributo**: 1 per patamar per attribute. Patamares: **1-5, 6-10, 11-15, 16-20**. So Carisma can be raised at most 4 times across a 1-20 career.
- **Em T20, o valor do atributo É o modificador.** Não tem mod separado. Cha 4 = +4 em ataques baseados em Carisma.
- **Origem dá 1 poder de origem** (escolhido entre os listados) — separado do poder de nível. Não esquecer.
- **Perícia duplicada da origem**: jogador escolhe outra perícia. Confirma com o mestre se a substituição vem da lista da classe ou geral.
- **Magias**: cada classe caster define em `setup.spellPath` quantas magias começa com, quantas aprende por nível, e em que nível destrava cada círculo. Bardo, por exemplo: 2 iniciais, +1 a cada nível par, círculos 1/2/3/4 nos níveis 1/6/10/14.
- **Esgrima Mágica do Bardo** especifica "armas corpo a corpo leves ou de uma mão" — ataque desarmado *provavelmente* não conta (interpretação do mestre); declare isso quando relevante.
- **Patamares de magia**: limite de PM por magia é igual ao círculo máximo * 2 + 1 (ish — verificar). O poder `Magia Ilimitada` soma o atributo-chave nesse limite.

## Process

1. **Restate the concept** internally. Pick a working name for the build (e.g. "Esgrimista Lírico", "Sentinela do Coral").

2. **Read the class file.** Note:
   - Auto abilities at level 1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 20 (varies by class)
   - The full power list with requirements
   - The 20th-level capstone (often a big combo enabler)
   - Multiclass abilities? Some classes have variants in supplements

3. **Read the origins file** and shortlist 2-3 thematic fits. Compare their **power pools**, not just perícias. The origin power is frequently the most impactful single choice — e.g. Dom Artístico (+2 Atuação) is permanent +2 ataque for a Bardo using Esgrima Mágica.

4. **Pick attribute priority** based on:
   - Class `attrPriority` field
   - The build's key mechanic (e.g. Esgrima Mágica → Carisma, not Força)
   - CaC builds want Con > 1; back-line casters can dump Con

5. **Identify the core class power chain.** Walk the class's power list and pick the 3-5 powers that define the build's mechanic. Note requirements — often a chain like A → B → C with prerequisite powers and level gates.

6. **If caster — pick spell schools.** Bardo picks 3 permanent schools at N1. Druid, Cleric, etc. have different rules. Read the spell index files to see what each school offers per circle, then choose based on the build's actual needs:
   - Trans usually wins for self-buff melee
   - Abjur for survivability
   - Evoc for damage backup
   - Encan for control
   - Don't pick a school the build won't actually use

7. **For each circle the class will reach, read the actual spell texts.** Focus on:
   - Magias com **aprimoramento que vira ataque CaC** (e.g. Toque Chocante's +2 PM aprim) — gold for melee casters
   - Magias **sustentadas** que dão ação extra (Velocidade)
   - Magias de **defesa cena** (Armadura Arcana, Pele de Pedra)
   - Magias de **transformação** com trade-offs (Transformação de Guerra trava magia)

8. **Search general powers for synergies.** Common high-value general picks:
   - Foco em Arma (cumulative +2 ataque, escolhe arma)
   - Estilo de Uma Arma + Ataque Preciso (florete/rapieira 18-20/x2 → **16-20/x3**)
   - Vitalidade (+1 PV/nível retroativo)
   - Saque Rápido (+2 Iniciativa)
   - Foco em Magia (-1 PM em uma magia específica)
   - Magia Ilimitada (soma atributo-chave no limite de PM por magia)
   - Magia Acelerada (+4 PM vira ação livre — combina com capstones)
   - Esquiva (+2 Defesa e Reflexos)

9. **Build the 20-level table.** Every level must have 1 power pick (class OR general). Distribute Aumento de Atributo across patamares, respecting the "1 por patamar por atributo" rule. Front-load core chain powers; backload Aumento de Atributo and capstone enablers.

10. **Evaluate multiclass honestly if user asks.** Most multiclasses are a trap. Read the candidate class's powers and check if they actually combine with the build's core mechanic. If they don't, **say so directly** and suggest 1-2 alternative multiclasses that do — or recommend going pure. Don't force synergy.

11. **Write the output** following the structure below.

## Output structure

````markdown
# <Build name> — <Class> 1-20

**Conceito:** <1-2 sentences capturing the build's identity and core mechanic>

## Configuração inicial

- **Raça:** <name> — <why, 1 line>
- **Origem:** <name>
  - Perícias: <list> *(if a perícia duplicates class training, explain the swap)*
  - **Poder de origem:** <power name> — <what it does and why it matters>
  - Itens: <list>
- **Atributos (prioridade):**
  1. <Atributo X> — <why>
  2. <Atributo Y> — <why>
  3. ...
- **Perícias treinadas:** <full final list>
- **Escolas de magia** *(if caster, permanent choice)*: <3 schools> — <one-line justification>
- **Equipamento inicial-chave:** <weapon, armor, focus>

## Progressão nível a nível

### Patamar Iniciante (1-5) — *<theme>*

**Nível 1**
- **[H]** <auto feature> *(if any)*
- **[P]** **<Power name>** *(bardo/geral combate/geral magia)* — <1-2 sentences: what it does AND how it fits the build>
- **[M]** **<Spell name>** — <when/how to use it> *(only on levels that grant spells)*
- **Itens:** <if a specific item enables a combo>

**Nível 2**
- (repeat structure)

...continue through Nível 5...

### Patamar Veterano (6-10) — *<theme>*
...

### Patamar Campeão (11-15) — *<theme>*
...

### Patamar Lendário (16-20) — *<theme>*
...

## Combo de turno (referência rápida, N<X>+)

**Pré-combate:** <buffs to cast at scene start>
**Turno 1:** <opener>
**Turnos seguintes:**
1. ...
2. ...
3. ...

**Saldo de PM por rodada:** <gasto vs recuperação — confirm sustainability>

## Itens-chave por patamar

| Quando | Item | Por quê |
|--------|------|---------|
| Iniciante | ... | ... |
| Veterano | ... | ... |
| Campeão | ... | ... |
| Lendário | ... | ... |

## Notas de regra e interpretação

- <Any rule that hinges on master's call — e.g. "Toque Chocante aprim como ação padrão dispara Dança das Lâminas? Confirmar com mestre.">
- <Any item the build depends on the master granting>
- <Any honest weakness — e.g. "vulnerable to antimagic", "Carisma dumpvuln to Vontade saves">

## Sobre multiclasse *(if user mentioned one OR asked)*

<Honest evaluation. If the synergy doesn't exist, say so and suggest alternatives.>
````

## Anti-patterns — things that already burned us

These are the specific failure modes from past sessions. Read this list before writing the output.

1. **Inventando magias.** I wrote "Pressa", "Lâmina Mágica", "Aumentar Pessoa" — none exist in this codebase. The real equivalents were "Velocidade", "Arma Mágica", "Alterar Tamanho aprim". **Always grep `generalSpells.ts` before writing a spell name.**

2. **Tratando origem como só perícias.** Origins are perícias + items + 1 power chosen from a list. The power is often the most impactful single decision in the whole build (Dom Artístico = +2 ataque permanente).

3. **Esquecer que perícia duplicada vira outra à escolha.** If Artista's Atuação overlaps with Bardo's automatic Atuação, the player swaps for another perícia. This is real value — don't skip the origin because of the duplicate.

4. **Esquecer que cada nível dá 1 poder.** Defaulting to "poder em níveis ímpares" is wrong — that's the D&D-ASI pattern. T20 gives 20 power picks total. Fill every level.

5. **Forçando multiclasse temático.** If the user wants Bardo + Lutador and Lutador's power chain is locked to ataques desarmados (which don't trigger Esgrima Mágica), be honest. Suggest Guerreiro 2 / Bardo 18 or pure Bardo with a Lutador-themed flavor.

6. **Inventando bônus.** T20 atributo = modificador. Cha 4 = +4. Não há mod separado tipo D&D 5e.

7. **Acreditar em memória ao invés de grep.** Memory drift between sessions is real. The codebase is authoritative.

## Final report to user

End with 2-3 sentences:
1. Build summary (class, key mechanic, single biggest power spike level).
2. Offer to generate the actual ficha in the app (PDF) if the build is final.
3. If the user gave an ambiguous concept (e.g. no race specified), note what calls you made.

## Optional follow-up flows

- **"E se eu trocar X por Y?"** — re-read just the affected files and produce a diff of the build, not a full re-write.
- **"Faz uma variante mais defensiva/ofensiva."** — swap general powers and 2-3 magia picks; keep core class power chain.
- **"Quero a ficha no PDF."** — direct the user to use the app's wizard with the concrete attribute/skill/power picks from the build. The skill itself does not generate the PDF.
