import {
  spellsCircle1 as c1,
  spellsCircle2 as c2,
  spellsCircle3 as c3,
} from './generalSpells';

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

export const arcaneSpellsCircle2: SpellCircle = {
  Abjur: [c2.campoDeForca, c2.dissiparMagia, c2.refugio, c2.runaDeProtecao],
  Adiv: [c2.ligacaoTelepatica, c2.localizacao, c2.mapear],
  Conv: [
    c2.amarrasEtereas,
    c2.montariaArcana,
    c2.saltoDimensional,
    c2.servosInvisiveis,
  ],
  Encan: [c2.desesperoEsmagador, c2.marcaDaObediencia, c2.sussurosInsanos],
  Evoc: [c2.bolaDeFogo, c2.flechaAcida, c2.relampago, c2.soproDasUivantes],
  Ilusão: [
    c2.aparenciaPerfeita,
    c2.camuflagemIlusoria,
    c2.esculpirSons,
    c2.invisibilidade,
  ],
  Necro: [
    c2.conjurarMortosVivos,
    c2.cranioVoadorDeVladislav,
    c2.toqueVampirico,
  ],
  Trans: [c2.alterarTamanho, c2.metamorfose, c2.velocidade],
};

export const arcaneSpellsCircle3: SpellCircle = {
  Abjur: [
    c3.ancoraDimensional,
    c3.dificultarDeteccao,
    c3.globoDeInvulnerabilidade,
  ],
  Adiv: [c3.contatoExtraplanar, c3.lendasEHistorias, c3.videncia],
  Conv: [c3.convocacaoInstatanea, c3.enxameRubroDeIchabod, c3.teletransporte],
  Encan: [c3.imobilizar, c3.seloDeMana],
  Evoc: [c3.erupcaoGlacial, c3.lancaIgneaDeAleph, c3.muralhaElemental],
  Ilusão: [c3.ilusaoLacerante, c3.mantoDeSombras, c3.miragem],
  Necro: [c3.ferverSangue, c3.servoMortoVivo, c3.tentaculoDeTrevas],
  Trans: [c3.peleDePedra, c3.telecinesia, c3.transformacaoDeGuerra, c3.voo],
};

export const allArcaneSpellsCircle1: Spell[] = Object.values(
  arcaneSpellsCircle1
).reduce((acc, current) => [...acc, ...current]);

export const allArcaneSpellsCircle2: Spell[] = Object.values(
  arcaneSpellsCircle2
).reduce((acc, current) => [...acc, ...current]);

export const allArcaneSpellsCircle3: Spell[] = Object.values(
  arcaneSpellsCircle3
).reduce((acc, current) => [...acc, ...current]);
