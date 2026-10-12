import { SheetAction } from '../../../../../interfaces/CharacterSheet';
import { Spell } from '../../../../../interfaces/Spells';
import { createAlwaysActiveSpell } from '../../../../../functions/spells/spellVariants';
import { Atributo } from '../../atributos';
import { spellsCircle1, spellsCircle2 } from '../../magias/generalSpells';

/**
 * Magias concedidas pelos Presentes de Magia e de Caos do Duende.
 *
 * Num arquivo à parte porque cada presente existe em DUAS cópias — habilidade
 * de raça (`duende-config.ts`, os três da criação) e poder geral
 * (`duendePresentes.ts`, os pegos ao subir de nível) — e as duas precisam
 * conceder exatamente a mesma coisa.
 *
 * "No caso de habilidades que permitam teste de resistência, a CD é Car":
 * todas usam Carisma como atributo-chave.
 */

/**
 * Visão Feérica: "permanentemente sob efeito da magia Visão Mística com o
 * aprimoramento de enxergar criaturas e objetos invisíveis". A variante sempre
 * ativa não tem aprimoramentos, então o que está embutido vai na descrição.
 */
const visaoMisticaSempreAtiva = createAlwaysActiveSpell(
  spellsCircle1.visaoMistica
);
export const VISAO_MISTICA_FEERICA: Spell = {
  ...visaoMisticaSempreAtiva,
  duracao: 'Permanente',
  description: `${visaoMisticaSempreAtiva.description} Efeito permanente da Visão Feérica, sem custo em PM. Você também enxerga objetos e criaturas invisíveis, que aparecem como formas translúcidas.`,
};

const learnSpells = (
  powerName: string,
  spells: Spell[],
  skipIfKnown: boolean
): SheetAction => ({
  source: { type: 'power', name: powerName },
  action: {
    type: 'learnSpell',
    availableSpells: spells,
    pick: spells.length,
    customAttribute: Atributo.CARISMA,
    // Só a Afinidade Elemental diz "caso aprenda novamente qualquer uma
    // delas, seu custo diminui em –1 PM"; nos demais, já conhecer a magia não
    // muda nada.
    ...(skipIfKnown ? { skipIfKnown: true } : {}),
  },
});

/**
 * Ação de magia de cada presente, indexada pelo NOME do presente. Uma única
 * ação `learnSpell` por presente: a idempotência é por nome + tipo de mudança,
 * então uma segunda ação do mesmo tipo seria pulada.
 */
export const DUENDE_PRESENTE_SPELL_ACTIONS: Record<string, SheetAction> = {
  'Afinidade Elemental (Água)': learnSpells(
    'Afinidade Elemental (Água)',
    [spellsCircle1.criarElementos, spellsCircle1.nevoa],
    false
  ),
  'Afinidade Elemental (Fogo)': learnSpells(
    'Afinidade Elemental (Fogo)',
    [spellsCircle1.criarElementos, spellsCircle1.explosaoDeChamas],
    false
  ),
  'Afinidade Elemental (Vegetação)': learnSpells(
    'Afinidade Elemental (Vegetação)',
    [spellsCircle1.armamentoDaNatureza, spellsCircle1.controlarPlantas],
    false
  ),
  Enfeitiçar: learnSpells('Enfeitiçar', [spellsCircle1.enfeiticar], true),
  Invisibilidade: learnSpells(
    'Invisibilidade',
    [spellsCircle2.invisibilidade],
    true
  ),
  'Visão Feérica': learnSpells('Visão Feérica', [VISAO_MISTICA_FEERICA], true),
};

/**
 * Acrescenta a ação de magia do presente (se houver) às ações que ele já
 * tinha. Usado pelas duas cópias dos presentes.
 */
export function withDuendePresenteSpells<
  T extends { name: string; sheetActions?: SheetAction[] }
>(presente: T): T {
  const spellAction = DUENDE_PRESENTE_SPELL_ACTIONS[presente.name];
  if (!spellAction) return presente;
  return {
    ...presente,
    sheetActions: [...(presente.sheetActions ?? []), spellAction],
  };
}
