import { spellsCircle1 as c1 } from './generalSpells';
import { SpellCircle, Spell } from '../../interfaces/Spells';

export const arcaneSpellsCircle1: SpellCircle = {
  Abjur: [
    c1.alarme,
    c1.armaduraArcana,
    c1.resistenciaAEnergia,
    c1.trancaArcana,
  ],
  Adiv: [c1.aviso, c1.compreensao, c1.concentracaoDeCombate, c1.visaoMistica],
  Conv: [c1.areaEscorregadia, c1.conjurarMonstro, c1.nevoa, c1.teia],
  Encan: [c1.adagaMental, c1.enfeiticar, c1.hipnotismo, c1.sono],
  Evoc: [
    c1.explosaoDeChamas,
    c1.luz,
    c1.setaInfalivelDeTalude,
    c1.toqueChocante,
  ],
  Ilusão: [
    c1.criarIlusao,
    c1.disfarceIlusorio,
    c1.imagemEspelhada,
    c1.lequeCromatico,
  ],
  Necro: [
    c1.amedrontar,
    c1.escuridao,
    c1.raioDoEnfraquecimento,
    c1.vitalidadeFantasma,
  ],
  Trans: [
    c1.armaMagica,
    c1.primorAtletico,
    c1.quedaSuave,
    c1.transmutarObjetos,
  ],
};

export const allArcaneSpellsCircle1: Spell[] = Object.values(
  arcaneSpellsCircle1
).reduce((acc, current) => [...acc, ...current]);
