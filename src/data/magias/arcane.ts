import {
  spellsCircle1 as c1,
  spellsCircle2 as c2,
  spellsCircle3 as c3,
  spellsCircle4 as c4,
  spellsCircle5 as c5,
} from './generalSpells';

import { SpellCircle, Spell } from '../../interfaces/Spells';

export const arcaneSpellsCircle1: SpellCircle = {
  Abjur: [
    c1.alarme,
    c1.armaduraArcana,
    c1.resistenciaAEnergia,
    c1.trancaArcana
  ],
  Adiv: [
    c1.aviso,
    c1.compreensao,
    c1.concentracaoDeCombate,
    c1.visaoMistica,
    c1.percepcaoRubra,
    c1.farejarFortuna,
    c1.pontoFraco
  ],
  Conv: [
    c1.areaEscorregadia,
    c1.conjurarMonstro,
    c1.nevoa,
    c1.teia,
    c1.acoiteFlamejante,
    c1.nuvemTempestuosa,
    c1.assobioPerigoso,
    c1.espiritoBalistico
  ],
  Encan: [
    c1.adagaMental,
    c1.enfeiticar,
    c1.hipnotismo,
    c1.sono,
    c1.desafioCorajoso,
    c1.discricao
  ],
  Evoc: [
    c1.explosaoDeChamas,
    c1.luz,
    c1.setaInfalivelDeTalude,
    c1.toqueChocante,
    c1.dardoGelido,
    c1.jatoCorrosivo,
    c1.detonacaoCongelante,
    c1.disparoGelido,
    c1.geiserCaustico,
    c1.flechaDeLuz,
    c1.armaduraArdente,
    c1.emularMagia
  ],
  Ilusão: [
    c1.criarIlusao,
    c1.disfarceIlusorio,
    c1.imagemEspelhada,
    c1.lequeCromatico,
    c1.distracaoFugaz
  ],
  Necro: [
    c1.amedrontar,
    c1.escuridao,
    c1.raioDoEnfraquecimento,
    c1.vitalidadeFantasma
  ],
  Trans: [
    c1.armaMagica,
    c1.primorAtletico,
    c1.quedaSuave,
    c1.transmutarObjetos,
    c1.conjurarArmadilha,
    c1.maaaisKlunc,
    c1.ossosDeAdamante,
    c1.punhoDeMitral,
    c1.toqueDoHorizonte
  ],
};

export const arcaneSpellsCircle2: SpellCircle = {
  Abjur: [
    c2.campoDeForca,
    c2.dissiparMagia,
    c2.refugio,
    c2.runaDeProtecao,
    c2.traicaoMagica,
    c2.desfazerEngenhoca
  ],
  Adiv: [
    c2.ligacaoTelepatica,
    c2.localizacao,
    c2.mapear,
    c2.viagemOnirica
  ],
  Conv: [
    c2.amarrasEtereas,
    c2.montariaArcana,
    c2.saltoDimensional,
    c2.servosInvisiveis,
    c2.invocarFagulhaElemental,
    c2.momentoDeTormenta,
    c2.preparacaoDeBatalha,
    c2.evacuacao,
    c2.transposicao
  ],
  Encan: [
    c2.desesperoEsmagador,
    c2.marcaDaObediencia,
    c2.sussurrosInsanos
  ],
  Evoc: [
    c2.bolaDeFogo,
    c2.flechaAcida,
    c2.relampago,
    c2.soproDasUivantes
  ],
  Ilusão: [
    c2.aparenciaPerfeita,
    c2.camuflagemIlusoria,
    c2.esculpirSons,
    c2.invisibilidade
  ],
  Necro: [
    c2.conjurarMortosVivos,
    c2.cranioVoadorDeVladislav,
    c2.toqueVampirico
  ],
  Trans: [
    c2.alterarTamanho,
    c2.metamorfose,
    c2.velocidade,
    c2.maquinaDeCombate,
    c2.pocaoExplosiva,
    c2.piscar
  ],
};

export const arcaneSpellsCircle3: SpellCircle = {
  Abjur: [
    c3.ancoraDimensional,
    c3.dificultarDeteccao,
    c3.globoDeInvulnerabilidade
  ],
  Adiv: [
    c3.contatoExtraplanar,
    c3.lendasEHistorias,
    c3.videncia
  ],
  Conv: [
    c3.convInstantanea,
    c3.enxameRubroDeIchabod,
    c3.teletransporte
  ],
  Encan: [
    c3.imobilizar,
    c3.seloDeMana
  ],
  Evoc: [
    c3.erupcaoGlacial,
    c3.lancaIgneaDeAleph,
    c3.muralhaElemental,
    c3.halitoPeconhento,
    c3.impactoFulminante,
    c3.toqueAlgido
  ],
  Ilusão: [
    c3.ilusaoLacerante,
    c3.mantoDeSombras,
    c3.miragem
  ],
  Necro: [
    c3.ferverSangue,
    c3.servoMortoVivo,
    c3.tentaculosDeTrevas
  ],
  Trans: [
    c3.peleDePedra,
    c3.telecinesia,
    c3.transformacaoDeGuerra,
    c3.voo
  ],
};

export const arcaneSpellsCircle4: SpellCircle = {
  Abjur: [
    c4.campoAntimagia,
    c4.libertacao
  ],
  Adiv: [
    c4.sonho,
    c4.visaoDaVerdade
  ],
  Conv: [
    c4.conjurarElemental,
    c4.maoPoderosaDeTalude,
    c4.viagemPlanar
  ],
  Encan: [
    c4.alterarMemoria,
    c4.marionete
  ],
  Evoc: [
    c4.raioPolar,
    c4.relampagoFlamejanteDeReynard,
    c4.talhoInvisivelDeEdauros,
    c4.raioDePlasma
  ],
  Ilusão: [
    c4.duplicataIlusoria,
    c4.explosaoCaleidoscopica
  ],
  Necro: [
    c4.assassinoFantasmagorico,
    c4.muralhaDeOssos
  ],
  Trans: [
    c4.animarObjetos,
    c4.controlarAGravidade,
    c4.desintegrar,
    c4.formaEterea,
    c4.transformacaoEmDragao,
    c4.bencaoDaDragoaRainha,
    c4.pantanoVitriolico,
    c4.velocidadeDoRelampago
  ],
};

export const arcaneSpellsCircle5: SpellCircle = {
  Abjur: [
    c5.alterarDestino,
    c5.aprisionamento,
    c5.buracoNegro,
    c5.invulnerabilidade
  ],
  Adiv: [

  ],
  Conv: [
    c5.chuvaDeMeteoros,
    c5.semiplano
  ],
  Encan: [
    c5.legiao,
    c5.palavraPrimordial,
    c5.possessao
  ],
  Evoc: [
    c5.barragemElementalDeVectorius,
    c5.deflagracaoDeMana,
    c5.mataDragao
  ],
  Ilusão: [
    c5.requiem,
    c5.sombraAssassina
  ],
  Necro: [
    c5.toqueDaMorte
  ],
  Trans: [
    c5.controlarOTempo,
    c5.desejo
  ],
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

export const allArcaneSpellsCircle4: Spell[] = Object.values(
  arcaneSpellsCircle4
).reduce((acc, current) => [...acc, ...current]);

export const allArcaneSpellsCircle5: Spell[] = Object.values(
  arcaneSpellsCircle5
).reduce((acc, current) => [...acc, ...current]);

export function getArcaneSpellsOfCircle(circle: number): Spell[] {
  if (circle === 1) {
    return Object.values(allArcaneSpellsCircle1);
  }
  if (circle === 2) {
    return Object.values(allArcaneSpellsCircle2);
  }
  if (circle === 3) {
    return Object.values(allArcaneSpellsCircle3);
  }
  if (circle === 4) {
    return Object.values(allArcaneSpellsCircle4);
  }
  if (circle === 5) {
    return Object.values(allArcaneSpellsCircle5);
  }
  return [];
}

export function allArcaneSpellsUpToCircle(circle: number): Spell[] {
  if (circle === 1) {
    return allArcaneSpellsCircle1;
  }
  if (circle === 2) {
    return [...allArcaneSpellsCircle1, ...allArcaneSpellsCircle2];
  }
  if (circle === 3) {
    return [
      ...allArcaneSpellsCircle1,
      ...allArcaneSpellsCircle2,
      ...allArcaneSpellsCircle3,
    ];
  }
  if (circle === 4) {
    return [
      ...allArcaneSpellsCircle1,
      ...allArcaneSpellsCircle2,
      ...allArcaneSpellsCircle3,
      ...allArcaneSpellsCircle4,
    ];
  }
  if (circle === 5) {
    return [
      ...allArcaneSpellsCircle1,
      ...allArcaneSpellsCircle2,
      ...allArcaneSpellsCircle3,
      ...allArcaneSpellsCircle4,
      ...allArcaneSpellsCircle5,
    ];
  }
  return [];
}
