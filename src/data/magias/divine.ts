import {
  spellsCircle1 as c1,
  spellsCircle2 as c2,
  spellsCircle3 as c3,
} from './generalSpells';
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

export const divineSpellsCircle2: SpellCircle = {
  Abjur: [
    c2.circuloDaJustica,
    c2.dissiparMagia,
    c2.runaDeProtecao,
    c2.vestimentaDaFe,
  ],
  Adiv: [
    c2.augurio,
    c2.condicao,
    c2.globoDaVerdadeDeGwen,
    c2.menteDivina,
    c2.vozDivina,
  ],
  Conv: [c2.exameDePestes, c2.socoDeArsenal],
  Encan: [c2.aliadoAnimal, c2.marcaDaObediencia, c2.oracao],
  Evoc: [c2.controlarFogo, c2.purificacao, c2.raioSolar, c2.tempestadaDivina],
  Ilusão: [c2.silencio],
  Necro: [c2.conjurarMortosVivos, c2.miasmaMefitico, c2.rogarMaldicao],
  Trans: [c2.controlarMadeira, c2.fisicoDivino],
};

export const divineSpellsCircle3: SpellCircle = {
  Abjur: [c3.banimento, c3.protecaoContraMagia],
  Adiv: [c3.comunhaoComANatureza, c3.lendasEHistorias, c3.videncia],
  Conv: [c3.servoDivino, c3.viagemArborea],
  Encan: [
    c3.despertarConsciencia,
    c3.heroismo,
    c3.imobilizar,
    c3.missaoDivina,
    c3.seloDeMana,
  ],
  Evoc: [c3.colunaDeChamas, c3.dispersarAsTrevas, c3.soproDaSalvacao],
  Ilusão: [c3.mantoDeSombras],
  Necro: [c3.anularALuz, c3.poeiraDaPodridao, c3.servoMortoVivo],
  Trans: [
    c3.controlarAgua,
    c3.controlarTerra,
    c3.peleDePedra,
    c3.potenciaDivina,
  ],
};

export const allDivineSpellsCircle1: Spell[] = Object.values(
  divineSpellsCircle1
).reduce((acc, current) => [...acc, ...current]);

export const allDivineSpellsCircle2: Spell[] = Object.values(
  divineSpellsCircle2
).reduce((acc, current) => [...acc, ...current]);

export const allDivineSpellsCircle3: Spell[] = Object.values(
  divineSpellsCircle3
).reduce((acc, current) => [...acc, ...current]);
