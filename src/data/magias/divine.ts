import { spellsCircle1 as c1 } from './generalSpells';
import { SpellCircle, Spell } from '../../interfaces/Spells';

export const divineSpellsCircle1: SpellCircle = {
  Abjur: [
    c1.escudoDaFe,
    c1.protecaoDivina,
    c1.resistenciaAEnergia,
    c1.santuario,
    c1.suporteAmbiental,
  ],
  Adiv: [
    c1.aviso,
    c1.compreensao,
    c1.detectarAmeacas,
    c1.orientacao,
    c1.visaoMistica,
  ],
  Conv: [c1.armaEspiritual, c1.caminhosDaNatureza, c1.criarElementos, c1.nevoa],
  Encan: [c1.acalmarAnimal, c1.bencao, c1.comando, c1.tranquilidade],
  Evoc: [c1.consagrar, c1.curarFerimentos, c1.despedacar, c1.luz],
  Ilusão: [],
  Necro: [c1.escuridao, c1.infligirFerimentos, c1.perdicao, c1.profanar],
  Trans: [
    c1.abencoarAlimentos,
    c1.armaMagica,
    c1.armamentoDaNatureza,
    c1.controlarPlantas,
  ],
};

export const allDivineSpellsCircle1: Spell[] = Object.values(
  divineSpellsCircle1
).reduce((acc, current) => [...acc, ...current]);
