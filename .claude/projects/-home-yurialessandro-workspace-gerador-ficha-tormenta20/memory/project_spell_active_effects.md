---
name: project_spell_active_effects
description: Integração de efeitos ativos com magias — revisão por círculo, fatia atual e arquitetura
metadata:
  type: project
---

Integração do sistema de efeitos ativos (antes só poderes) com magias. Revisão **controlada por círculo/escola**, magia a magia, decidindo com o usuário quais entram (só magias com bônus numérico rastreável na ficha; dano/invocação/controle/debuff/detecção ficam de fora).

**Fatia 1 (maio/2026): Magias Arcanas de 1º círculo** — `arcaneSpellsCircle1.ts`, 9 magias: Armadura Arcana, Resistência a Energia, Arma Mágica, Primor Atlético, Imagem Espelhada, Disfarce Ilusório, Ossos de Adamante (Heróis), Punho de Mitral (Heróis), Percepção Rubra (Deuses/universal). Limítrofes (Vitalidade Fantasma, Maaais Klunc, Concentração de Combate, Aviso) descartadas pelo usuário.

**Fatia 2 (maio/2026): Magias Arcanas de 2º círculo** — `arcaneSpellsCircle2.ts`, 4 magias: Campo de Força (PV temp 30/50/70), Aparência Perfeita (Carisma+2, +5 Diplo/Eng), Metamorfose (+20 Enganação), Piscar (+2 ataque, Heróis). Limítrofes (Invisibilidade, Alterar Tamanho, Máquina de Combate) descartadas pelo usuário — padrão "apenas claramente candidatas".

**Fatia 3 (maio/2026): Magias Arcanas de 3º círculo** — `arcaneSpellsCircle3.ts`, 2 magias: Pele de Pedra (RD 5/10), Transformação de Guerra (+6/+7/+8 Defesa+ataque+dano cc, 30/40/50 PV temp). Voo/Contato Extraplanar/Coração Imortal fora por limitação do motor (sem alvo de voo/pool de dados/fortificação%).

**Fatia 4 (maio/2026): Magias Arcanas de 4º círculo** — `arcaneSpellsCircle4.ts`, 1 magia: Transformação em Dragão (Ameaças), modelo parcial = +5 Defesa + RD 30 por elemento (ácido/eletric./fogo/frio). Atributos +2 fora (RAW não dá derivados; mesmo motivo do Maaais Klunc), sopro/voo fora. Core c4 sem candidatos (dano/controle/invocação/antimagia/incorpóreo). Visão da Verdade (aprimoramento +10 Percepção/Intuição) oferecida como limítrofe e recusada.

**Fatia 5 (maio/2026): Magias Arcanas de 5º círculo** — ZERO magias. Tudo é dano massivo, controle de inimigo, imunidade a condições (Invulnerabilidade — sem alvo numérico), reação one-shot (Alterar Destino) ou narrativo/permanente (Desejo, Controlar o Tempo). Sem suplementos c5. Nenhuma alteração de código. (Aura Divina, +10 Defesa/resistências, é divina — fica para a revisão divina.)

**Revisão ARCANA completa (1º-5º)**: 16 magias no total (9+4+2+1+0). Arquivos `arcaneSpellsCircle1..4.ts` (não há circle5).

**Fase DIVINA — Fatia 1 (maio/2026): Divinas de 1º círculo** — `divineSpellsCircle1.ts`, 9 magias: Escudo da Fé (+2/+3 Def), Proteção Divina (+2/+3 resist.), Bênção (+1/+2 atk/dano), Caminhos da Natureza (+3/+6 desloc.), Armamento da Natureza (dano +passo/+atk), Arma de Jade (+1/+2 atk/dano), Paixão de Marah (+2 perícias Carisma), Proteção de Tauron (+2/+4 Def aliado), Voz da Razão (+5/+10 Conhec./Diplo./Intim.). Resistência a Energia e Arma Mágica são divinas também mas já cobertas (busca por nome). Limítrofes (Arma Espiritual, Abençoar Alimentos, Arsenal de Allihanna, Euforia de Valkaria, Instante Estoico, Toque de Megalokk) recusadas.

**Fase DIVINA — Fatia 2 (maio/2026): Divinas de 2º círculo** — `divineSpellsCircle2.ts`, 3 magias: Vestimenta da Fé (+2/+3 Def), Oração (+2/+3 todas perícias + dano, helper `allSkillsBonus` igual ao Bardo), Couraça de Allihanna (+2/+3 Def, Deuses). Limítrofes recusadas: Mente Divina / Físico Divino (Atributo +2 sem PV/PM/perícias — motor recalcularia derivados, contra RAW; mesmo motivo Maaais Klunc), Controlar Madeira (objeto madeira multi-modo).

**Fase DIVINA — Fatia 3 (maio/2026): Divinas de 3º círculo** — `divineSpellsCircle3.ts`, 4 magias: Heroísmo (40 PV temp), Dispersar as Trevas (+4/+5 resist. + RD trevas 10, aliados), Anular a Luz (+4/+5 Def, aliados), Potência Divina (Força +4/+5 + RD 10/15). Sem suplementos c3. Pele de Pedra (divina 3º) já coberta por nome. Limítrofe recusada: Proteção contra Magia (+5 resist. *contra magias* — condicional).

**Fase DIVINA — Fatia 4 (maio/2026): Divinas de 4º círculo** — ZERO magias. Tudo é imunidade/estado (Libertação, Cúpula de Repulsão), rerrolagem (Premonição), cura/regeneração (Círculo da Restauração, Guardião Divino, Manto do Cruzado), dano/área (Cólera de Azgher, Terremoto, Ligação Sombria, Muralha de Ossos) ou narrativo (Viagem Planar, Conceder Milagre, Controlar o Clima). Visão da Verdade (aprimoramento-only) já recusada no 4º arcano. Sem suplementos c4. Nenhuma alteração de código.

**Fase DIVINA — Fatia 5 (maio/2026): Divinas de 5º círculo** — `divineSpellsCircle5.ts`, 1 magia: Aura Divina (+5/+6/+10/+11 Defesa e resistências, aliados). Sem suplementos c5. Demais 11 fora (imunidade/debuff/área/cura/narrativo).

**REVISÃO DE MAGIAS COMPLETA** (arcanas 1º-5º + divinas 1º-5º). Total: arcanas 16 (9+4+2+1+0), divinas 17 (9+3+4+0+1) = **33 magias** com efeito ativo. Arquivos: `arcaneSpellsCircle1..4.ts`, `divineSpellsCircle1..3.ts`, `divineSpellsCircle5.ts` (não há arcaneCircle5/divineCircle4). Sem círculos pendentes. Eventuais novos suplementos exigiriam nova revisão pontual.

Arquitetura:
- Dados em `src/premium/data/activePowers/arcaneSpellsCircle1.ts` (helper `spell()`); registry separado `ACTIVE_SPELLS` + `getActiveEffectForSpell(spellName)` no `activePowers/index.ts` (separado de `ACTIVE_POWERS` p/ nome de magia não casar com poder).
- Todas as opções usam `pmCost: 0` (PM já pago no `SpellCastDialog`).
- Gatilho: `SpellCastDialog.onCast` passa `(pmSpent, spell)` → propagado por `Spells.tsx`/`SpellRow.tsx`/`ParodySpellPickerDialog.tsx` → `Result.handleSpellCast` abre `ActivePowerUseDialog` (estado `spellEffectDef`) → `handleActiveEffectActivate` (reusa recalc + socket de mesa). Recepção na mesa reaproveita `PowerEffectOfferModal` (genérico).

Relacionado: efeitos ativos de poderes em [[MEMORY]] (registry `activePowers/`).
