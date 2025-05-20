import { cloneDeep } from 'lodash';
import { pickFromArray } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { Spell, spellsCircles } from '../../interfaces/Spells';
import { Atributo } from '../atributos';

export const manaExpenseByCircle: Record<spellsCircles, number> = {
  [spellsCircles.c1]: 1,
  [spellsCircles.c2]: 3,
  [spellsCircles.c3]: 6,
  [spellsCircles.c4]: 10,
  [spellsCircles.c5]: 15,
};

export enum spellsCircle1Names {
  abencoarAlimentos = 'abencoarAlimentos',
  acalmarAnimal = 'acalmarAnimal',
  armaduraArcana = 'armaduraArcana',
  adagaMental = 'adagaMental',
  alarme = 'alarme',
  amedrontar = 'amedrontar',
  areaEscorregadia = 'areaEscorregadia',
  armaEspiritual = 'armaEspiritual',
  armaMagica = 'armaMagica',
  armamentoDaNatureza = 'armamentoDaNatureza',
  aviso = 'aviso',
  bencao = 'bencao',
  caminhosDaNatureza = 'caminhosDaNatureza',
  comando = 'comando',
  compreensao = 'compreensao',
  concentracaoDeCombate = 'concentracaoDeCombate',
  conjurarMonstro = 'conjurarMonstro',
  consagrar = 'consagrar',
  controlarPlantas = 'controlarPlantas',
  criarElementos = 'criarElementos',
  criarIlusao = 'criarIlusao',
  curarFerimentos = 'curarFerimentos',
  despedacar = 'despedacar',
  detectarAmeacas = 'detectarAmeacas',
  disfarceIlusorio = 'disfarceIlusorio',
  enfeiticar = 'enfeiticar',
  escudoDaFe = 'escudoDaFe',
  escuridao = 'escuridao',
  explosaoDeChamas = 'explosaoDeChamas',
  hipnotismo = 'hipnotismo',
  imagemEspelhada = 'imagemEspelhada',
  infligirFerimentos = 'infligirFerimentos',
  lequeCromatico = 'lequeCromatico',
  luz = 'luz',
  nevoa = 'nevoa',
  orientacao = 'orientacao',
  perdicao = 'perdicao',
  primorAtletico = 'primorAtletico',
  profanar = 'profanar',
  protecaoDivina = 'protecaoDivina',
  quedaSuave = 'quedaSuave',
  raioDoEnfraquecimento = 'raioDoEnfraquecimento',
  resistenciaAEnergia = 'resistenciaAEnergia',
  santuario = 'santuario',
  setaInfalivelDeTalude = 'setaInfalivelDeTalude',
  sono = 'sono',
  suporteAmbiental = 'suporteAmbiental',
  teia = 'teia',
  toqueChocante = 'toqueChocante',
  trancaArcana = 'trancaArcana',
  tranquilidade = 'tranquilidade',
  transmutarObjetos = 'transmutarObjetos',
  visaoMistica = 'visaoMistica',
  vitalidadeFantasma = 'vitalidadeFantasma',
}

export enum spellsCircle2Names {
  campoDeForca = 'campoDeForca',
  dissiparMagia = 'dissiparMagia',
  refugio = 'refugio',
  runaDeProtecao = 'runaDeProtecao',
  ligacaoTelepatica = 'ligacaoTelepatica',
  localizacao = 'localizacao',
  mapear = 'mapear',
  amarrasEtereas = 'amarrasEtereas',
  montariaArcana = 'montariaArcana',
  saltoDimensional = 'saltoDimensional',
  servosInvisiveis = 'servosInvisiveis',
  desesperoEsmagador = 'desesperoEsmagador',
  marcaDaObediencia = 'marcaDaObediencia',
  bolaDeFogo = 'bolaDeFogo',
  flechaAcida = 'flechaAcida',
  relampago = 'relampago',
  soproDasUivantes = 'soproDasUivantes',
  aparenciaPerfeita = 'aparenciaPerfeita',
  camuflagemIlusoria = 'camuflagemIlusoria',
  esculpirSons = 'esculpirSons',
  invisibilidade = 'invisibilidade',
  conjurarMortosVivos = 'conjurarMortosVivos',
  cranioVoadorDeVladislav = 'cranioVoadorDeVladislav',
  toqueVampirico = 'toqueVampirico',
  alterarTamanho = 'alterarTamanho',
  metamorfose = 'metamorfose',
  velocidade = 'velocidade',
  sussurosInsanos = 'sussurosInsanos',
  augurio = 'augurio',
  circuloDaJustica = 'circuloDaJustica',
  vestimentaDaFe = 'vestimentaDaFe',
  condicao = 'condicao',
  globoDaVerdadeDeGwen = 'globoDaVerdadeDeGwen',
  menteDivina = 'menteDivina',
  vozDivina = 'vozDivina',
  socoDeArsenal = 'socoDeArsenal',
  aliadoAnimal = 'aliadoAnimal',
  oracao = 'oracao',
  controlarFogo = 'controlarFogo',
  purificacao = 'purificacao',
  raioSolar = 'raioSolar',
  tempestadaDivina = 'tempestadaDivina',
  silencio = 'silencio',
  miasmaMefitico = 'miasmaMefitico',
  rogarMaldicao = 'rogarMaldicao',
  controlarMadeira = 'controlarMadeira',
  fisicoDivino = 'fisicoDivino',
  enxameDePestes = 'exameDePestes',
}

export enum spellsCircle3Names {
  ancoraDimensional = 'ancoraDimensional',
  dificultarDeteccao = 'dificultarDeteccao',
  globoDeInvulnerabilidade = 'globoDeInvulnerabilidade',
  contatoExtraplanar = 'contatoExtraplanar',
  lendasEHistorias = 'lendasEHistorias',
  videncia = 'videncia',
  convocacaoInstantenea = 'convocacaoInstatanea',
  enxameRubroDeIchabod = 'enxameRubroDeIchabod',
  teletransporte = 'teletransporte',
  imobilizar = 'imobilizar',
  seloDeMana = 'seloDeMana',
  erupcaoGlacial = 'erupcaoGlacial',
  lancaIgneaDeAleph = 'lancaIgneaDeAleph',
  muralhaElemental = 'muralhaElemental',
  ilusaoLacerante = 'ilusaoLacerante',
  miragem = 'miragem',
  ferverSangue = 'ferverSangue',
  servoMortoVivo = 'servoMortoVivo',
  tentaculosDeTrevas = 'tentaculoDeTrevas',
  peleDePedra = 'peleDePedra',
  telecinesia = 'telecinesia',
  transformacaoDeGuerra = 'transformacaoDeGuerra',
  voo = 'voo',
  banimento = 'banimento',
  protecaoContraMagia = 'protecaoContraMagia',
  comunhaoComANatureza = 'comunhaoComANatureza',
  servoDivino = 'servoDivino',
  viagemArborea = 'viagemArborea',
  despertarConsciencia = 'despertarConsciencia',
  heroismo = 'heroismo',
  missaoDivina = 'missaoDivina',
  colunaDeChamas = 'colunaDeChamas',
  dispersarAsTrevas = 'dispersarAsTrevas',
  soproDaSalvacao = 'soproDaSalvacao',
  mantoDeSombras = 'mantoDeSombras',
  anularALuz = 'anularALuz',
  poeiraDaPodridao = 'poeiraDaPodridao',
  controlarAgua = 'controlarAgua',
  controlarTerra = 'controlarTerra',
  potenciaDivina = 'potenciaDivina',
}

export enum spellsCircle4Names {
  cupulaDeRepulsao = 'cupulaDeRepulsao',
  libertacao = 'libertacao',
  premonicao = 'premonicao',
  visaoDaVerdade = 'visaoDaVerdade',
  guardiaoDivino = 'guardiaoDivino',
  viagemPlanar = 'viagemPlanar',
  concederMilagre = 'concederMilagre',
  circuloDaRestauracao = 'circuloDaRestauracao',
  coleraDeAzguer = 'coleraDeAzguer',
  mantoDoCruzado = 'mantoDoCruzado',
  terremoto = 'terremoto',
  ligacaoSombria = 'ligacaoSombria',
  muralhaDeOssos = 'muralhaDeOssos',
  controlarOClima = 'controlarOClima',
  campoAntimagia = 'campoAntimagia',
  sonho = 'sonho',
  conjurarElemental = 'conjurarElemental',
  maoPoderosaDeTalude = 'maoPoderosaDeTalude',
  alterarMemoria = 'alterarMemoria',
  marionete = 'marionete',
  raioPolar = 'raioPolar',
  relampagoFlamejanteDeReynard = 'relampagoFlamejanteDeReynard',
  talhoInvisivelDeEdauros = 'talhoInvisivelDeEdauros',
  duplicataIlusoria = 'duplicataIlusoria',
  explosaoCaleidospica = 'explosaoCaleidospica',
  assassinoFantasmagorico = 'assassinoFantasmagorico',
  animarObjetos = 'animarObjetos',
  controlarAGravidade = 'controlarAGravidade',
  desintegrar = 'desintegrar',
  formaEterea = 'formaEterea',
}

export enum spellsCircle5Names {
  aprisionamento = 'aprisionamento',
  engenhoDeMana = 'engenhoDeMana',
  invulnerabilidade = 'invulnerabilidade',
  alterarDestino = 'alterarDestino',
  projetarCosciencia = 'projetarConsciencia',
  buracoNegro = 'buracoNegro',
  chuvaDeMeteoros = 'chuvaDeMeteoros',
  semiplano = 'semiplano',
  legiao = 'legiao',
  palavraPrimordial = 'palavraPrimordial',
  possessao = 'possessao',
  barragemElementalDeVectorius = 'barragemElementalDeVectorius',
  deflagracaoDeMana = 'deflagracaoDeMana',
  mataDragao = 'mataDragao',
  requiem = 'requiem',
  sombraAssassina = 'sombraAssassina',
  roubarAAlma = 'roubarAAlma',
  toqueDaMorte = 'toqueDaMorte',
  controlarOTempo = 'controlarOTempo',
  desejo = 'desejo',
  auraDivina = 'auraDivina',
  lagrimasDeWynna = 'lagrimasDeWynna',
  intervencaoDivina = 'intervencaoDivina',
  furiaDoPanteao = 'furiaDoPanteao',
  segundaChance = 'segundaChance',
  reanimacaoImpura = 'reanimacaoImpura',
}

export const spellsCircle1: Record<spellsCircle1Names, Spell> = {
  [spellsCircle1Names.abencoarAlimentos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Abençoar Alimentos',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Alimento para 1 criatura',
    duracao: 'Cena',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'o alimento é purificado (não causa nenhum efeito nocivo se estava estragado ou envenenado), mas não oferece bônus ao ser consumido.',
      },
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 1,
        text: 'muda a duração para permanente, o alvo para 1 frasco com água e adiciona componente material (pó de prata no valor de T$ 5). Em vez do normal, cria um frasco de água benta..',
      },
    ],
  },
  [spellsCircle1Names.acalmarAnimal]: {
    spellCircle: spellsCircles.c1,
    nome: 'Acalmar Animal',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para médio.',
      },
      {
        addPm: 1,
        text: 'muda o alvo para 1 monstro ou espírito com Inteligência 1 ou 2.',
      },
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para 1 monstro ou espírito. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.adagaMental]: {
    spellCircle: spellsCircles.c1,
    nome: 'Adaga Mental',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Vontade parcial',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'você lança a magia sem gesticular ou pronunciar palavras (o que permite lançar essa magia de armadura) e a adaga se torna invisível. Se o alvo falhar no teste de resistência, não percebe que você lançou uma magia contra ele.',
      },
      {
        addPm: 2,
        text: 'muda a duração para 1 dia. Além do normal, você “finca” a adaga na mente do alvo. Enquanto a magia durar, você sabe a direção e localização do alvo, desde que ele esteja no mesmo mundo.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +1d6.',
      },
    ],
  },
  [spellsCircle1Names.alarme]: {
    spellCircle: spellsCircles.c1,
    nome: 'Alarme',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Esfera de 9m de raio',
    duracao: '1 dia',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para pessoal. A área é emanada a partir de você.',
      },
      {
        addPm: 5,
        text: 'além do normal, você também percebe qualquer efeito de adivinhação que seja usado dentro da área ou atravesse a área. Você pode fazer um teste oposto de Misticismo contra quem usou o efeito; se passar, tem um vislumbre de seu rosto e uma ideia aproximada de sua localização (“três dias de viagem ao norte”, por exemplo).',
      },
      {
        addPm: 5,
        text: 'muda a duração para 1 dia ou até ser descarregada e a resistência para Vontade anula. Quando um intruso entra na área, você pode descarregar a magia como uma reação. Se o intruso falhar na resistência, ficará paralisado por 1d4 rodadas. Além disso, pelas próximas 24 horas você e as criaturas escolhidas ganham +10 em testes de Sobrevivência para rastrear o intruso.',
      },
    ],
  },
  [spellsCircle1Names.amedrontar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Amedrontar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide de ND 2 ou menor',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'alvos que falhem na resistência ficam apavorados por 1d4+1 rodadas, em vez de apenas 1.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para criatura.',
      },
      {
        addPm: 5,
        text: 'afeta todos os alvos válidos a sua escolha dentro do alcance.',
      },
    ],
  },
  [spellsCircle1Names.areaEscorregadia]: {
    spellCircle: spellsCircles.c1,
    nome: 'Área Escorregadia',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Quadrado de 3m ou 1 objeto',
    duracao: 'Cena',
    resistencia: 'Reflexos',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta a área em +1 quadrado de 1,5m.',
      },
      {
        addPm: 2,
        text: 'muda a CD dos testes de Acrobacia para 15.',
      },
      {
        addPm: 5,
        text: 'muda a CD dos testes de Acrobacia para 20.',
      },
    ],
  },
  [spellsCircle1Names.armaEspiritual]: {
    spellCircle: spellsCircles.c1,
    nome: 'Arma Espiritual',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, a arma também o protege, oferecendo +1 na Defesa.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus na Defesa em +1.',
      },
      {
        addPm: 2,
        text: 'muda a duração para sustentada. Além do normal, uma vez por rodada, você pode gastar uma ação livre para fazer a arma acertar automaticamente um alvo em alcance curto. Se a arma atacar, não poderá contra-atacar até seu próximo turno. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'muda o tipo do dano para essência. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'invoca duas armas, permitindo que você contra-ataque (ou ataque, se usar o aprimoramento acima) duas vezes por rodada. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.armaMagica]: {
    spellCircle: spellsCircles.c1,
    nome: 'Arma Mágica',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma',
    duracao: 'Cena',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus em +1, limitado pelo círculo máximo de magia que você pode lançar.',
      },
      {
        addPm: 2,
        text: 'arma passa a causar +1d6 de dano de ácido, eletricidade, fogo ou frio, escolhido no momento em que a magia é lançada.',
      },
    ],
  },
  [spellsCircle1Names.armaduraArcana]: {
    spellCircle: spellsCircles.c1,
    nome: 'Armadura Arcana',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    school: 'Abjur',
  },
  [spellsCircle1Names.armamentoDaNatureza]: {
    spellCircle: spellsCircles.c1,
    nome: 'Armamento da Natureza',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma',
    duracao: 'Cena',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'fornece +1 nos testes de ataque com a arma.',
      },
      {
        addPm: 2,
        text: 'muda a execução para ação de movimento.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus nos testes de ataque em +1.',
      },
      {
        addPm: 5,
        text: 'aumenta o dano da arma em mais um passo.',
      },
    ],
  },
  [spellsCircle1Names.aviso]: {
    spellCircle: spellsCircles.c1,
    nome: 'Aviso',
    execucao: 'Movimento',
    alcance: 'Longo',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o alcance em um fator de 10 (90m para 900m, 900m para 9km e assim por diante).',
      },
      {
        addPm: 1,
        text: 'se escolher mensagem, o alvo pode enviar uma resposta de até 25 palavras para você até o fim de seu próximo turno.',
      },
      {
        addPm: 2,
        text: 'se escolher localização, muda a duração para cena. O alvo sabe onde você está mesmo que você mude de posição.',
      },
      {
        addPm: 3,
        text: 'aumenta o número de alvos em +1.>',
      },
    ],
  },
  [spellsCircle1Names.bencao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Bênção',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas',
    duracao: 'Cena',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para 1 cadáver e a duração para 1 semana. O cadáver não se decompõe nem pode ser transformado em morto-vivo pela duração da magia.',
      },
      {
        addPm: 2,
        text: 'aumenta os bônus em +1, limitado pelo círculo máximo de magia que você pode lançar.',
      },
    ],
  },
  [spellsCircle1Names.caminhosDaNatureza]: {
    spellCircle: spellsCircles.c1,
    nome: 'Caminhos da Natureza',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 arma',
    duracao: 'Cena',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alcance para pessoal e o alvo para você. Em vez do normal, você sabe onde fica o norte e recebe +5 em testes de Sobrevivência para se orientar.',
      },
      {
        addPm: 1,
        text: 'além do normal, a CD para rastrear os alvos em terreno natural aumenta em +10.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus de deslocamento em +3m.',
      },
    ],
  },
  [spellsCircle1Names.comando]: {
    spellCircle: spellsCircles.c1,
    nome: 'Comando',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: '1 rodada',
    resistencia: 'Vontade anula',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para 1 criatura.',
      },
      {
        addPm: 2,
        text: 'aumenta a quantidade de alvos em +1.',
      },
    ],
  },
  [spellsCircle1Names.compreensao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Compreensão',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura ou texto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para curto.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas. Você pode entender todas as criaturas afetadas, mas só pode ouvir os pensamentos de uma por vez.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para 1 criatura. Em vez do normal, pode vasculhar os pensamentos do alvo para extrair informações. O alvo tem direito a um teste de Vontade para anular este efeito. O mestre decide se a criatura sabe ou não a informação que você procura. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para pessoal e o alvo para você. Em vez do normal, você pode falar, entender e escrever qualquer idioma. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.concentracaoDeCombate]: {
    spellCircle: spellsCircles.c1,
    nome: 'Concentração de Combate',
    execucao: 'Livre',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 rodada',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda a execução para padrão e a duração para cena. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'além do normal, ao atacar você, um inimigo deve rolar dois dados e usar o pior resultado. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'muda a execução para padrão, o alcance para curto, o alvo para criaturas escolhidas e a duração para cena. Requer 4º círculo.',
      },
      {
        addPm: 14,
        text: 'muda a execução para padrão e a duração para 1 dia. Além do normal, você recebe um sexto sentido que o avisa de qualquer perigo ou ameaça. Você fica imune às condições surpreendido e desprevenido e recebe +10 em Defesa e Reflexos. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle1Names.conjurarMonstro]: {
    spellCircle: spellsCircles.c1,
    nome: 'Conjurar Monstro',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: '1 criatura conjurada',
    duracao: 'Sustentada',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'o monstro ganha deslocamento de escalada ou natação igual ao seu deslocamento terrestre.',
      },
      {
        addPm: 1,
        text: 'aumenta o deslocamento do monstro em +3m.',
      },
      {
        addPm: 1,
        text: 'muda o tipo de dano do ataque do monstro para ácido, fogo, frio ou eletricidade.',
      },
      {
        addPm: 2,
        text: 'o monstro ganha percepção às cegas.',
      },
      {
        addPm: 2,
        text: 'aumenta os PV do monstro em +10 para cada categoria de tamanho a partir de Pequeno (+10 PV para Pequeno, +20 PV para Médio etc.).',
      },
      {
        addPm: 2,
        text: 'aumenta o tamanho do monstro para Médio. Ele tem For 18, Des 16, 45 PV, deslocamento 12m e seu ataque causa 2d6+4 pontos de dano.',
      },
      {
        addPm: 2,
        text: 'o monstro ganha resistência 5 contra dois tipos de dano (por exemplo, corte e frio).',
      },
      {
        addPm: 4,
        text: 'o monstro ganha uma nova ordem: Arma de Sopro. O monstro causa o dobro de seu dano de ataque em um cone de 6m a partir de si (Reflexos reduz à metade).',
      },
      {
        addPm: 5,
        text: 'aumenta o tamanho do monstro para Grande. Ele tem For 24, Des 14, 75 PV, deslocamento 12m e seu ataque causa 3d6+7 pontos de dano com 3m de alcance.  Requer 2º círculo.',
      },
      {
        addPm: 9,
        text: 'o monstro ganha deslocamento de voo igual ao dobro do deslocamento.',
      },
      {
        addPm: 9,
        text: 'o monstro ganha imunidade contra dois tipos de dano.',
      },
      {
        addPm: 9,
        text: 'aumenta o tamanho do monstro para Enorme. Ele tem For 32, Des 12, 110 PV, deslocamento 15m e seu ataque causa 4d6+11 pontos de dano com 4,5m de alcance. Requer 4º círculo.',
      },
      {
        addPm: 14,
        text: 'aumenta o tamanho do monstro para Colossal. Ele tem For 41, Des 10, 180 PV, deslocamento 15m e seu ataque causa 6d6+15 de dano com 9m de alcance. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle1Names.consagrar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Consagrar',
    execucao: 'Padrão',
    alcance: 'Longo',
    area: 'Esfera com 9m de raio',
    duracao: '1 dia',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, mortos-vivos na área sofrem –2 em testes e Defesa.',
      },
      {
        addPm: 2,
        text: 'aumenta as penalidades para mortos-vivos em –1..',
      },
      {
        addPm: 9,
        text: 'muda a execução para 1 hora, a duração para permanente e adiciona componente material (incenso e óleos no valor de T$ 1.000). Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle1Names.controlarPlantas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Controlar Plantas',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'quadrado com 9m de lado',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda a área para alvo de 1 planta e a resistência para nenhuma. Em vez do normal, você pode fazer a planta se mover como se fosse animada. Ela não pode causar dano ou atrapalhar a concentração de um conjurador.',
      },
      {
        addPm: 1,
        text: 'muda a duração para instantânea. Em vez do normal, as plantas na área diminuem, como se tivessem sido podadas. Terreno difícil muda para terreno normal e não oferece camuflagem. Esse efeito dissipa o uso normal de Controlar Plantas.',
      },
      {
        addPm: 1,
        text: 'além do normal, criaturas que falhem na resistência também ficam imóveis.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para pessoal, a área para alvo (você) e a resistência para nenhuma. Em vez do normal, você consegue se comunicar com plantas, que começam com atitude prestativa em relação a você. Além disso, você pode fazer testes de Diplomacia com plantas. Em geral, plantas têm uma percepção limitada de seus arredores e normalmente fornecem respostas simplórias.',
      },
    ],
  },
  [spellsCircle1Names.criarElementos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Criar Elementos',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Elemento escolhido',
    duracao: 'Instantânea',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta a quantidade do elemento em um passo (uma categoria de tamanho para água ou terra, +1 quadrado de 1,5m para ar e fogo).',
      },
      {
        addPm: 1,
        text: 'muda o efeito para alvo 1 criatura ou objeto e a resistência para Reflexos reduz à metade. Se escolher água ou terra, você arremessa o cubo ou objeto criado no alvo, causando 2d4 pontos de dano de impacto. Para cada categoria de tamanho acima de Minúsculo, o dano aumenta em um passo. O cubo se desfaz em seguida.',
      },
      {
        addPm: 2,
        text: 'se escolheu fogo, aumenta o dano inicial de cada chama em +1d6.',
      },
    ],
  },
  [spellsCircle1Names.criarIlusao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Criar Ilusão',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Ilusão que se estende a até 4 cubos de 1,5m',
    duracao: 'Cena',
    resistencia: 'Vontade desacredita',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a duração para sustentada. A cada rodada você pode usar uma ação livre para mover a imagem ou alterar levemente o som, como aumentar o volume ou fazer com que pareça se afastar ou se aproximar, ainda dentro dos limites do efeito. Você pode, por exemplo, criar a ilusão de um fantasma que anda pela sala, controlando seus movimentos. Quando você para de sustentar a magia, a imagem ou som persistem por mais uma rodada antes de a magia se dissipar.',
      },
      {
        addPm: 1,
        text: 'aumenta o efeito da ilusão em +1 cubo de 1,5m.',
      },
      {
        addPm: 1,
        text: 'também pode criar ilusões de imagem e sons combinados.',
      },
      {
        addPm: 1,
        text: 'também pode criar sons complexos com volume máximo equivalente ao que cinco pessoas podem produzir para cada cubo de 1,5m no efeito. Com uma ação livre, você pode alterar o volume do som ou fazê-lo se aproximar ou se afastar dentro do alcance.',
      },
      {
        addPm: 2,
        text: 'também pode criar odores e sensações térmicas, que são percebidos a uma distância igual ao dobro do tamanho máximo do efeito. Por exemplo, uma miragem de uma fogueira com 4 cubos de 1,5m poderia emanar calor e cheiro de queimado a até 12m.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para longo e o efeito para esfera de 30m de raio. Em vez do normal, você cria um som muito alto, equivalente a uma multidão. Criaturas na área lançam magias como se estivessem em uma condição ruim e a CD de testes de Percepção para ouvir aumenta em +10. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'também pode criar sensações táteis, como texturas; objetos ainda atravessam a ilusão, mas criaturas não conseguem atravessá-la sem passar em um teste de Vontade. A ilusão ainda é incapaz de causar ou sofrer dano. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda a duração para sustentada. Além do normal, você pode gastar uma ação livre para modificar livremente a ilusão (mas não pode acrescentar novos aprimoramentos após lançá-la). Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.curarFerimentos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Curar Ferimentos',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'em vez do normal, estabiliza uma criatura.',
      },
      {
        addPm: 0,
        text: 'muda o alvo para 1 morto- vivo. Em vez do normal, causa 1d8 pontos de dano de luz (Vontade reduz à metade).',
      },
      {
        addPm: 1,
        text: 'aumenta a cura em +1d8+1.',
      },
      {
        addPm: 2,
        text: 'também remove uma condição de fadiga do alvo.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para curto.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas.',
      },
    ],
  },
  [spellsCircle1Names.despedacar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Despedaçar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 critura ou objeto mundano pequeno',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial ou Reflexos anula',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +1d8+2.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para objeto mundano Médio. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para objeto mundano Grande. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'muda o alvo para objeto mundano Enorme. Requer 4º círculo.',
      },
      {
        addPm: 14,
        text: 'muda o alvo para objeto mundano Colossal. Requer 5º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para pessoal e a área para explosão de 6m de raio. Todas as criaturas e objetos na área são afetados.',
      },
    ],
  },
  [spellsCircle1Names.detectarAmeacas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Detectar Ameaças',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Esfera de 9m de raio',
    duracao: 'Instantânea',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 0,
        text: ' em vez de criaturas, você percebe a presença e localização de venenos.',
      },
      {
        addPm: 1,
        text: 'muda a execução para ação completa. Você descobre também a raça ou espécie e o poder das criaturas (determinado pela aura delas). Criaturas de 1º a 6º nível geram uma aura tênue, criaturas de 7º a 12º nível geram uma aura moderada e criaturas de 13º ao 20º nível geram uma aura poderosa. Criaturas acima do 20º nível geram uma aura avassaladora.',
      },
      {
        addPm: 2,
        text: 'em vez de criaturas, você percebe a presença e localização de armadilhas.',
      },
      {
        addPm: 5,
        text: 'muda a área para esfera de 30m de raio. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.disfarceIlusorio]: {
    spellCircle: spellsCircles.c1,
    nome: 'Disfarce Ilusório',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Vontade desacredita',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alcance para toque, o alvo para 1 criatura e a duração para 1 semana. Em vez do normal, você faz uma pequena alteração na aparência do alvo, como deixar o nariz vermelho ou fazer brotar um gerânio no alto da cabeça. A mudança é inofensiva, mas persistente — se a flor for arrancada, por exemplo, outra nascerá no local.',
      },
      {
        addPm: 1,
        text: 'muda o alcance para curto e o alvo para 1 objeto. Você pode, por exemplo, transformar pedaços de ferro em moedas de ouro. Você recebe +10 em testes de Enganação para falsificação.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para curto e o alvo para 1 criatura. Uma criatura involuntária pode anular o efeito com um teste de Vontade.',
      },
      {
        addPm: 2,
        text: 'a ilusão inclui odores e sensações. Isso muda o bônus em testes de Enganação para disfarce para +20.',
      },
      {
        addPm: 3,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas. Cada criatura pode ter uma aparência diferente. Criaturas involuntárias podem anular o efeito com um teste de Vontade. Requer 2º círculo.',
      },
    ],
  },
  [spellsCircle1Names.enfeiticar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Enfeitiçar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'em vez do normal, você sugere uma ação para o alvo e ele obedece. A sugestão deve ser feita de modo que pareça aceitável, a critério do mestre. Pedir ao alvo que pule de um precipício, por exemplo, dissipa a magia. Já sugerir a um guarda que descanse um pouco, de modo que você e seus aliados passem por ele, é aceitável. Quando o alvo executa a ação, a magia termina. Você pode determinar uma condição específica para a sugestão: por exemplo, que um rico mercador doe suas moedas para o primeiro mendigo que encontrar.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para 1 espírito ou monstro. Requer 3º círculo.',
      },
      {
        addPm: 5,
        text: 'afeta todos os alvos dentro do alcance.',
      },
    ],
  },
  [spellsCircle1Names.escudoDaFe]: {
    spellCircle: spellsCircles.c1,
    nome: 'Escudo da Fé',
    execucao: 'Reação',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: '1 turno',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a execução para ação padrão, o alcance para toque e a duração para cena.',
      },
      {
        addPm: 1,
        text: 'também fornece ao alvo camuflagem contra ataques à distância.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus na Defesa em +1.',
      },
      {
        addPm: 2,
        text: 'muda a execução para ação padrão, o alcance para toque e a duração para cena. A magia cria uma conexão mística entre você e o alvo. Além do efeito normal, o alvo sofre apenas metade do dano por ataques e efeitos; a outra metade do dano é transferida a você. Se a qualquer momento o alvo sair de alcance curto de você, a magia é dissipada. Requer 2º círculo.',
      },
      {
        addPm: 3,
        text: 'muda a duração para 1 dia. Requer 2º círculo.',
      },
    ],
  },
  [spellsCircle1Names.escuridao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Escuridão',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta a área da escuridão em +1,5m de raio.',
      },
      {
        addPm: 2,
        text: 'muda o efeito para fornecer camuflagem total por escuridão.',
      },
      {
        addPm: 2,
        text: 'muda a duração para 1 dia.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para 1 criatura e a resistência para Fortitude parcial. Você lança a magia nos olhos do alvo, que fica cego pela cena. Se passar na resistência, fica cego por 1 rodada. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para pessoal e o alvo para você. Em vez do normal, você é coberto por sombras, recebendo +10 em testes de Furtividade e camuflagem por escuridão. Requer 2º círculo.',
      },
    ],
  },
  [spellsCircle1Names.explosaoDeChamas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Explosão de Chamas',
    execucao: 'Padrão',
    alcance: '6m',
    area: 'Cone',
    duracao: 'Instantânea',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alcance para curto, a área para alvo de 1 objeto e a resistência para Reflexos anula. Você gera uma pequena explosão que não causa dano mas pode acender uma vela, tocha ou fogueira. Também pode fazer um objeto inflamável com RD 0 (como uma corda ou pergaminho) ficar em chamas. Uma criatura em posse de um objeto pode evitar esse efeito se passar no teste de resistência.',
      },
      {
        addPm: 1,
        text: 'aumenta o dano em +1d6.',
      },
      {
        addPm: 1,
        text: 'muda a resistência para Reflexos parcial. Se passar, a criatura reduz o dano à metade; se falhar, fica em chamas (veja Condições, no Apêndice).',
      },
    ],
  },
  [spellsCircle1Names.hipnotismo]: {
    spellCircle: spellsCircles.c1,
    nome: 'Hipnotismo',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas de ND 2 ou menor',
    duracao: '1d4 rodadas',
    resistencia: 'Vontade anula',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alvo para 1 criatura e a duração para 1 rodada. Em vez de fascinado, o alvo fica pasmo. Uma criatura só pode ser afetada por este truque uma vez por cena.',
      },
      {
        addPm: 1,
        text: 'como o normal, mas se passarem na resistência os alvos não saberão que foram alvos de uma magia.',
      },
      {
        addPm: 2,
        text: 'muda a duração para cena.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para médio.',
      },
      {
        addPm: 2,
        text: 'afeta alvos de ND 5 ou menor. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'afeta alvos de ND 10 ou menor. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'afeta alvos de ND 15 ou menor. Requer 4º círculo.',
      },
      {
        addPm: 14,
        text: 'afeta alvos de qualquer ND. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle1Names.imagemEspelhada]: {
    spellCircle: spellsCircles.c1,
    nome: 'Imagem Espelhada',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de cópias em +1 (e o bônus na Defesa em +2).',
      },
      {
        addPm: 2,
        text: 'além do normal, toda vez que uma cópia é destruída, emite um clarão de luz. A criatura que destruiu a cópia fica ofuscada por uma rodada. Requer 2º círculo.',
      },
    ],
  },
  [spellsCircle1Names.infligirFerimentos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Infligir Ferimentos',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, se falhar na resistência, o alvo fica fraco pela cena',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em 1d8+1.',
      },
      {
        addPm: 2,
        text: 'como parte da execução da magia, você pode fazer um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e o efeito da magia.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas.',
      },
    ],
  },
  [spellsCircle1Names.lequeCromatico]: {
    spellCircle: spellsCircles.c1,
    nome: 'Leque Cromático',
    execucao: 'Padrão',
    alcance: '4,5m',
    area: 'Cone',
    duracao: 'Instantânea',
    resistencia: 'Vontade anula',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta a duração do efeito em +1 rodada.',
      },
      {
        addPm: 2,
        text: 'afeta alvos de ND 5 ou menor. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'afeta alvos de ND 10 ou menor. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'afeta alvos de ND 15 ou menor. Requer 4º círculo.',
      },
      {
        addPm: 14,
        text: 'afeta alvos de qualquer ND. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle1Names.luz]: {
    spellCircle: spellsCircles.c1,
    nome: 'Luz',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta a área iluminada em +3m de raio.',
      },
      {
        addPm: 2,
        text: 'muda a duração para 1 dia.',
      },
      {
        addPm: 2,
        text: 'muda a duração para permanente e adiciona componente material (pó de rubi no valor de T$ 50). Requer 2º círculo.',
      },
      {
        addPm: 0,
        text: 'muda o alvo para 1 criatura. Você lança a magia nos olhos do alvo, que fica ofuscado pela cena. Não afeta criaturas cegas.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para longo e o efeito para 4 esferas brilhantes. Cria esferas flutuantes de pura luz com 10cm de diâmetro, que você pode posicionar onde quiser dentro do alcance. Você pode enviar uma esfera à frente, outra para trás, outra para cima e manter uma perto de você, por exemplo. Uma vez por rodada, você pode mover as esferas com uma ação livre. Cada esfera ilumina como uma tocha, mas não produz calor. Se uma esfera ocupar o espaço de uma criatura, ela fica ofuscada e sua silhueta pode ser vista claramente (ela não recebe camuflagem por escuridão ou invisibilidade). Requer 2º círculo.',
      },
    ],
  },
  [spellsCircle1Names.nevoa]: {
    spellCircle: spellsCircles.c1,
    nome: 'Névoa',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Nuvem com 6m de raio e altura',
    duracao: 'Cena',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'a magia também funciona sob a água, criando uma nuvem de tinta.',
      },
      {
        addPm: 2,
        text: 'você pode escolher criaturas no alcance ao lançar a magia; elas enxergam através do efeito. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'além do normal, a nuvem tem um cheiro horrível. No início de seus turnos, qualquer criatura dentro dela, ou qualquer criatura com faro em alcance curto da nuvem, deve fazer um teste de Fortitude. Se falhar, fica enjoada por uma rodada.',
      },
      {
        addPm: 2,
        text: 'além do normal, a nuvem tem um tom esverdeado e se torna cáustica. No início de seus turnos, criaturas dentro dela sofrem 2d4 pontos de dano de ácido.',
      },
      {
        addPm: 3,
        text: 'aumenta o dano de ácido em +2d4.',
      },
      {
        addPm: 5,
        text: 'além do normal, a nuvem fica espessa, quase sólida. Qualquer criatura dentro dela tem seu deslocamento reduzido para 3m (independentemente de seu deslocamento normal) e sofre –2 em testes de ataque e rolagens de dano.',
      },
    ],
  },
  [spellsCircle1Names.orientacao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Orientação',
    execucao: 'Movimentação',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda a execução para ação padrão e a duração para 1 rodada. O bônus vale para um único teste. Uma criatura só pode ser afetada por esse truque uma vez por dia.',
      },
      {
        addPm: 5,
        text: 'em vez de um atributo, escolha entre atributos físicos (Força, Destreza e Constituição) ou mentais (Inteligência, Sabedoria e Carisma). Requer 3º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para criaturas escolhidas. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.perdicao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Perdição',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta as penalidades em –1, limitado pelo círculo máximo de magia que você pode lançar.',
      },
    ],
  },
  [spellsCircle1Names.primorAtletico]: {
    spellCircle: spellsCircles.c1,
    nome: 'Primor Atlético',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, o alvo recebe um bônus adicional de +20 em testes de Atletismo para saltar (para um bônus total de +30).',
      },
      {
        addPm: 1,
        text: 'além do normal, o alvo pode escalar paredes e tetos sem precisar fazer testes de Atletismo. Para isso, precisa estar com as mãos livres, mas pode usar uma única mão se ficar parado no lugar. O alvo não fica desprevenido enquanto escala.',
      },
      {
        addPm: 1,
        text: 'muda a execução para ação de movimento, o alcance para pessoal, o alvo para você e a duração para instantânea. Você salta muito alto e pousa em alcance corpo a corpo de uma criatura em alcance curto. Se fizer um ataque corpo a corpo contra essa criatura nesta rodada, recebe os benefícios e penalidades de uma investida e sua arma tem o dano aumentado em um dado do mesmo tipo durante este ataque..',
      },
      {
        addPm: 3,
        text: 'além do normal, ao fazer testes de perícias baseadas em Força, Destreza ou Constituição, o alvo pode rolar dois dados e escolher o melhor. Não afeta testes de ataque ou resistência. Requer 2º círculo.',
      },
    ],
  },
  [spellsCircle1Names.profanar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Profanar',
    execucao: 'Padrão',
    alcance: 'Longo',
    area: 'Esfera com 9m de raio',
    duracao: '1 dia',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, mortos-vivos na área recebem +2 na Defesa e +2 em todos os testes.',
      },
      {
        addPm: 2,
        text: 'aumenta os bônus para mortos-vivos em +1.',
      },
      {
        addPm: 9,
        text: 'muda a execução para 1 hora, a duração para permanente e adiciona componente material (incenso e óleos no valor de T$ 1.000). Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle1Names.protecaoDivina]: {
    spellCircle: spellsCircles.c1,
    nome: 'Proteção Divina',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus concedido em +1.',
      },
      {
        addPm: 2,
        text: 'muda a execução para reação, o alcance para curto e a duração para 1 rodada.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para área de círculo com 3m de raio. Todos os aliados dentro do círculo recebem o bônus da magia. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'também torna o alvo imune a efeitos de encantamento. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.quedaSuave]: {
    spellCircle: spellsCircles.c1,
    nome: 'Queda Suave',
    execucao: 'Reação',
    alcance: 'Curto',
    alvo: '1 criatura ou objeto com até 200kg',
    duracao: 'Até chegar ao solo ou cena, o que vier primeiro',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alvo para objeto com até 5kg. Em vez do normal, você pode gastar uma ação de movimento para levitar o alvo até 4,5m em qualquer direção.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para até 10 criaturas ou objetos.',
      },
    ],
  },
  [spellsCircle1Names.raioDoEnfraquecimento]: {
    spellCircle: spellsCircles.c1,
    nome: 'Raio do Enfraquecimento',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Fortitude parcial',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alcance para toque e a resistência para Fortitude anula. Em vez do normal, ao tocar o alvo, sua mão emana um brilho púrpura. O alvo fica fatigado. Note que, como efeitos de magia não acumulam, lançar este truque duas vezes contra o mesmo alvo não irá deixá-lo exausto.',
      },
      {
        addPm: 2,
        text: 'em vez do normal, se falhar na resistência o alvo fica exausto. Se passar, fica fatigado. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'em vez do normal, se falhar na resistência o alvo fica inconsciente. Se passar, fica exausto. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.resistenciaAEnergia]: {
    spellCircle: spellsCircles.c1,
    nome: 'Resistência a Energia',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta a resistência em +5.',
      },
      {
        addPm: 2,
        text: 'muda a duração para 1 dia. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas. Requer 3º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o efeito para resistência a dano de todos os tipos de energia. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'muda o efeito para imunidade a um tipo de dano de energia. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle1Names.santuario]: {
    spellCircle: spellsCircles.c1,
    nome: 'Santuário',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, escolha um tipo de criatura entre animal, construto ou morto-vivo. Você não pode ser percebido por criaturas do tipo escolhido, não importando o sentido usado. +9 PM: também protege o alvo',
      },
      {
        addPm: 9,
        text: 'também protege o alvo contra efeitos de área. Uma criatura que tente atacar uma área que inclua o alvo deve fazer o teste de Vontade; se falhar, não consegue e perde a ação. Ela só pode tentar novamente se o alvo sair da área.>',
      },
    ],
  },
  [spellsCircle1Names.setaInfalivelDeTalude]: {
    spellCircle: spellsCircles.c1,
    nome: 'Seta Infalível de Talude',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Até 2 criaturas',
    duracao: 'Instantânea',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda as setas para lanças de energia que surgem e caem do céu. Cada lança causa 1d8+1 pontos de dano de essência. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'muda o número de setas/lanças para três.',
      },
      {
        addPm: 4,
        text: 'muda o número de setas/lanças para cinco. Requer 2º círculo.',
      },
      {
        addPm: 9,
        text: 'muda o número de setas/lanças para dez. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle1Names.sono]: {
    spellCircle: spellsCircles.c1,
    nome: 'Sono',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura de ND 2 ou menor',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alvo para área de quadrado com 3m de lado. Todas as criaturas na área dentro do limite de ND são afetadas.',
      },
      {
        addPm: 2,
        text: 'afeta alvos de ND 5 ou menor. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'afeta alvos de ND 10 ou menor. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'afeta alvos de ND 15 ou menor. Requer 4º círculo.',
      },
      {
        addPm: 14,
        text: 'afeta alvos de qualquer ND. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle1Names.suporteAmbiental]: {
    spellCircle: spellsCircles.c1,
    nome: 'Suporte Ambiental',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: '1 dia',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas.',
      },
    ],
  },
  [spellsCircle1Names.teia]: {
    spellCircle: spellsCircles.c1,
    nome: 'Teia',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Cubo com 6m de lado',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, criaturas que falhem na resistência também ficam imóveis.',
      },
      {
        addPm: 2,
        text: 'além do normal, no início de seus turnos a magia afeta novamente qualquer criatura na área, exigindo um novo teste de Reflexos. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'aumenta a área em +1 cubo de 1,5m.',
      },
    ],
  },
  [spellsCircle1Names.toqueChocante]: {
    spellCircle: spellsCircles.c1,
    nome: 'Toque Chocante',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em 1d8+1.',
      },
      {
        addPm: 2,
        text: 'como parte da execução da magia, você faz um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e da magia.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para pessoal e o alvo para área: explosão com 6m de raio. Você dispara raios pelas pontas dos dedos que afetam todas as criaturas na área.',
      },
    ],
  },
  [spellsCircle1Names.trancaArcana]: {
    spellCircle: spellsCircles.c1,
    nome: 'Tranca Arcana',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 objeto Grande ou menor',
    duracao: 'Permanente',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alcance para curto. Em vez do normal, pode abrir ou fechar um objeto de tamanho Médio ou menor, como uma porta ou baú. Não afeta objetos trancados.',
      },
      {
        addPm: 1,
        text: 'muda o alcance para curto e a duração para instantânea. Em vez do normal, a magia abre portas, baús e janelas trancadas, presas, barradas ou protegidas por Tranca Arcana (o efeito é dissipado) a sua escolha. Ela também afrouxa grilhões e solta correntes.',
      },
      {
        addPm: 5,
        text: 'aumenta a CD para abrir o alvo em +5.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para 1 objeto de qualquer tamanho, podendo afetar até mesmo os portões de um castelo. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.tranquilidade]: {
    spellCircle: spellsCircles.c1,
    nome: 'Tranquilidade',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para 1 criatura..',
      },
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 2,
        text: 'aumenta a penalidade em –1.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para médio e o alvo para criaturas escolhidas. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.transmutarObjetos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Transmutar Objetos',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: 'Matéria-prima, como madeeira, rochas, ossos',
    duracao: 'Cena',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alvo para 1 objeto mundano e a duração para instantânea. Em vez do normal, você pode alterar as propriedades físicas do objeto, como colorir, limpar ou sujar itens pequenos (incluindo peças de roupa), aquecer, esfriar e/ou temperar (mas não produzir) até 0,5kg de material inanimado (incluindo comida), ou curar 1 PV do objeto, consertando pequenas falhas como colar um frasco de cerâmica quebrado, unir os elos de uma corrente ou costurar uma roupa rasgada. Um objeto só pode ser afetado por este truque uma vez por dia.',
      },
      {
        addPm: 2,
        text: 'aumenta o limite de tamanho do objeto em uma categoria.',
      },
      {
        addPm: 1,
        text: 'aumenta o preço máximo do objeto criado em + T$ 25.',
      },
      {
        addPm: 1,
        text: 'muda o alcance para toque, o alvo para 1 construto e a duração para instantânea. Em vez do normal, cura 2d8 PV do alvo. Você pode gastar 2 PM adicionais para aumentar a cura em +1d8.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para 1 objeto mundano e a duração para instantânea. Em vez do normal, você cura todos os PV do alvo, restaurando o objeto totalmente. Este aprimoramento está sujeito aos limites de tamanho e preço do objeto conforme a magia original e não funciona se o objeto tiver sido completamente destruído (queimado até virar cinzas ou desintegrado, por exemplo). Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'como o aprimoramento anterior, mas passa a afetar itens mágicos.',
      },
    ],
  },
  [spellsCircle1Names.visaoMistica]: {
    spellCircle: spellsCircles.c1,
    nome: 'Visão Mística',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: 'Você',
    duracao: 'Cena',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'recebe visão no escuro.',
      },
      {
        addPm: 2,
        text: 'muda a duração para 1 dia.',
      },
      {
        addPm: 2,
        text: 'também pode enxergar objetos e criaturas invisíveis. Eles aparecem como formas translúcidas.',
      },
    ],
  },
  [spellsCircle1Names.vitalidadeFantasma]: {
    spellCircle: spellsCircles.c1,
    nome: 'Vitalidade Fantasma',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta os PV temporários recebidos em +1d8.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para área: esfera com 6m de raio centrada em você e a resistência para Fortitude reduz à metade. Em vez do normal, você suga energia das criaturas vivas na área, causando 1d8 pontos de dano de trevas e recebendo PV temporários iguais ao dano total causado. Os PV temporários desaparecem ao final da cena. Requer 2º círculo.',
      },
    ],
  },
};

export const spellsCircle2: Record<spellsCircle2Names, Spell> = {
  [spellsCircle2Names.augurio]: {
    spellCircle: spellsCircles.c2,
    nome: 'Augúrio',
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda a execução para 1 minuto. Em vez do normal, você pode consultar uma divindade, fazendo uma pergunta sobre um evento que acontecerá até um dia no futuro. O mestre rola a chance de falha; com um resultado de 2 a 6, você recebe uma resposta, desde uma simples frase até uma profecia ou enigma. Em geral, este uso sempre oferece pistas, indicando um caminho a tomar para descobrir a resposta que se procura. Numa falha você não recebe resposta alguma. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda a execução para 10 minutos e a duração para 1 minuto. Em vez do normal, você consulta uma divindade, podendo fazer uma pergunta por rodada, desde que ela possa ser respondida com “sim”, “não” ou “não sei” (embora poderosos, os deuses não são oniscientes). O mestre rola a chance de falha para cada pergunta. Em caso de falha, a resposta também é “não sei”. Requer 4º círculo.',
      },
      {
        addPm: 7,
        text: 'o mestre rola 1d12; a magia só falha em um resultado 1.',
      },
      {
        addPm: 12,
        text: 'o mestre rola 1d20; a magia só falha em um resultado 1.',
      },
    ],
  },
  [spellsCircle2Names.sussurosInsanos]: {
    spellCircle: spellsCircles.c2,
    nome: 'Sussuros Insanos',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Encan',
  },
  [spellsCircle2Names.campoDeForca]: {
    spellCircle: spellsCircles.c2,
    nome: 'Campo de Força',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a execução para reação e a duração para instantânea. Em vez do normal, você recebe resistência 30 contra o próximo dano que sofrer até o fim do turno atual.',
      },
      {
        addPm: 1,
        text: 'aumenta os PV temporários em +5 ou a resistência a dano em +10.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para curto e o alvo para 1 criatura ou objeto Enorme ou menor. Em vez do normal, cria uma esfera imóvel e tremeluzente com o tamanho do alvo e centrada nele. Nenhuma criatura, objeto ou efeito de dano pode passar pela esfera, embora criaturas possam respirar normalmente. Criaturas na área podem fazer um teste de Reflexos para evitar serem aprisionadas. Requer 4º círculo.',
      },
      {
        addPm: 9,
        text: 'como o aprimoramento acima, mas também muda a duração para sustentada. Tudo dentro da esfera fica praticamente sem peso. Uma vez por rodada, você pode gastar uma ação livre para flutuar a esfera e seu conteúdo para qualquer local dentro de alcance longo. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.dissiparMagia]: {
    spellCircle: spellsCircles.c2,
    nome: 'Dissipar Magia',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura ou 1 objeto mágico ou esfera com 3m de raio',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 12,
        text: 'muda a área para esfera com 9m de raio. Em vez do normal, cria um efeito de disjunção. Todas as magias na área são automaticamente dissipadas e todos os itens mágicos na área, exceto aqueles que você estiver carregando, viram itens mundanos (com direito a um teste de resistência para evitar esse efeito). Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle2Names.refugio]: {
    spellCircle: spellsCircles.c2,
    nome: 'Refúgio',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: 'Domo com 6m de raio',
    duracao: '1 dia',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, os limites do domo são envoltos por uma fumaça escura e espessa, que impede criaturas do lado de fora de enxergar ou ouvir o que está dentro. Criaturas do lado de dentro enxergam e ouvem normalmente o que está do lado de fora. A fumaça também bloqueia magias de adivinhação.',
      },
      {
        addPm: 3,
        text: 'em vez do normal, cria uma cabana que comporta até 10 criaturas Médias. Descansar nesse espaço concede  recuperação confortável (recupera PV e PM igual ao dobro do nível). Para todos os efeitos é uma cabana normal, com paredes de madeira, telhado, uma porta, duas janelas e alguma mobília (camas, uma mesa com bancos e uma lareira). A porta e as janelas têm 15 PV, RD 5 e são protegidas por um efeito idêntico à magia Tranca Arcana. As paredes têm 200 PV e RD 5.',
      },
      {
        addPm: 3,
        text: 'em vez do normal, cria um espaço extradimensional, similar a uma caverna vazia e escura, que comporta até 10 criaturas Médias. A entrada para o espaço precisa estar desenhada em um objeto fixo como uma grande pedra ou árvore. Qualquer criatura que atravesse a entrada consegue entrar no espaço. Nenhum efeito a partir do mundo real afeta o espaço e vice-versa, mas aqueles que estiverem dentro podem observar o mundo real como se uma janela de 1m estivesse centrada na entrada. Qualquer coisa que esteja no espaço extradimensional surge no mundo real na área vazia mais próxima da entrada quando a duração da magia acaba. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'em vez do normal, cria uma mansão extradimensional que comporta até 100 criaturas Médias, com quartos luxuosos, comida e bebida e dez servos fantasmagóricos (como na magia Servos Invisíveis). Descansar na mansão concede recuperação luxuosa (recupera PV e PM igual ao triplo do nível). A mansão tem uma única entrada, uma porta feita de luz. Você pode deixá-la visível ou invisível como uma ação livre e apenas criaturas escolhidas por você podem passar. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.runaDeProtecao]: {
    spellCircle: spellsCircles.c2,
    nome: 'Runa de Proteção',
    execucao: 'Completa',
    alcance: 'Toque',
    alvo: '1 objeto ou passagem de até 6m de largura',
    duracao: 'Permanente ou até descarregar',
    resistencia: 'Veja o texto',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em +2d6',
      },
      {
        addPm: 1,
        text: 'muda o alvo para 1 objeto que possa ser lido, como um livro, pergaminho ou mapa. A runa explode quando o objeto é lido. O objeto também sofre o dano (possivelmente sendo destruído).',
      },
      {
        addPm: 1,
        text: 'este aprimoramento exige que você lance uma magia de até 2º círculo como parte da execução da Runa de Proteção. Quando a runa é ativada, em vez do efeito normal, lança esta magia sobre a criatura que o ativou (se for uma magia de área, a área é centrada na criatura).',
      },
      {
        addPm: 3,
        text: 'como o aprimoramento acima, mas além de lançar a magia, a runa também causa o dano do efeito normal. Você define a ordem que os efeitos acontecem.',
      },
    ],
  },
  [spellsCircle2Names.ligacaoTelepatica]: {
    spellCircle: spellsCircles.c2,
    nome: 'Ligação Telepática',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '2 criaturas voluntárias',
    duracao: '1 dia',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 3,
        text: 'muda o alvo para 1 criatura. Em vez do normal, você cria um elo mental que permite que você veja e ouça pelos sentidos da criatura, se gastar uma ação de movimento. Uma criatura involuntária pode fazer um teste de Vontade para suprimir a magia por uma hora. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.localizacao]: {
    spellCircle: spellsCircles.c2,
    nome: 'Localização',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Círculo com 90m de raio',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda a área para alvo você. Em vez do normal, você sabe onde fica o norte e recebe +5 em testes de Sobrevivência para se orientar.',
      },
      {
        addPm: 5,
        text: 'aumenta a área em um fator de 10 (90m para 900m, 900m para 9km e assim por diante).',
      },
    ],
  },
  [spellsCircle2Names.mapear]: {
    spellCircle: spellsCircles.c2,
    nome: 'Mapear',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: 'Superfície ou objeto plano',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda o alvo para 1 criatura e a duração para 1 hora. Em vez do normal, a criatura tocada descobre o caminho mais direto para entrar ou sair de um lugar. Assim, a magia pode ser usada para descobrir a rota até o relicário de uma catedral ou a saída mais próxima de uma masmorra (mas não para encontrar a localização de uma criatura ou objeto; a magia funciona apenas em relação a lugares). Caso a criatura demore mais de uma hora para percorrer o caminho, o conhecimento se perde.',
      },
    ],
  },
  [spellsCircle2Names.amarrasEtereas]: {
    spellCircle: spellsCircles.c2,
    nome: 'Amarras Etéreas',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 2,
        text: '<aumenta o número de alvos em +1.',
      },
      {
        addPm: 2,
        text: 'aumenta o número de laços em um alvo a sua escolha em +1.',
      },
      {
        addPm: 3,
        text: 'em vez do normal, cada laço é destruído automaticamente com um único ataque bem-sucedido; porém, cada laço destruído libera um choque de energia que causa 1d6+1 pontos de dano de essência na criatura amarrada. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.montariaArcana]: {
    spellCircle: spellsCircles.c2,
    nome: 'Montaria Arcana',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '',
    duracao: '1 dia',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, criaturas do tipo animal em alcance curto da montaria devem fazer um teste de Vontade. Se passarem, ficam abaladas pela cena; se falharem, ficam apavoradas por 1d4 rodadas, depois abaladas pela cena.',
      },
      {
        addPm: 3,
        text: 'muda a duração para permanente e adiciona sacrifício de 1 PM.',
      },
      {
        addPm: 3,
        text: 'aumenta o tamanho da montaria em uma categoria. Isso também aumenta o número de criaturas que ela pode carregar — duas para uma criatura Enorme, seis para Colossal. Uma única criatura controla a montaria; as outras apenas são deslocadas.',
      },
      {
        addPm: 3,
        text: 'muda a criatura para um aliado montaria mestre. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.saltoDimensional]: {
    spellCircle: spellsCircles.c2,
    nome: 'Salto Dimensional',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Você',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para médio.',
      },
      {
        addPm: 1,
        text: 'muda o alvo para você e uma criatura voluntária. Você pode escolher este aprimoramento mais vezes para aumentar o número de alvos adicionais em +1, mas deve estar tocando todos os alvos.',
      },
      {
        addPm: 2,
        text: 'muda a execução para reação. Em vez do normal, você salta para um espaço adjacente (1,5m), recebendo +5 na Defesa e em testes de Reflexos contra um ataque ou efeito que esteja prestes a atingi-lo.',
      },
      {
        addPm: 3,
        text: 'muda o alcance para longo.',
      },
    ],
  },
  [spellsCircle2Names.servosInvisiveis]: {
    spellCircle: spellsCircles.c2,
    nome: 'Servos Invisíveis',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: 'Criaturas Conjuradas',
    duracao: '1 cena',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de servos conjurados em 1.',
      },
      {
        addPm: 3,
        text: 'você pode comandar os servos para realizar uma única tarefa no seu lugar. Em termos de jogo, eles passam automaticamente em um teste de perícia com CD máxima igual ao seu nível, +2 para cada servo conjurado. O tempo necessário para realizar a tarefa é o tempo do uso da perícia em questão. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.desesperoEsmagador]: {
    spellCircle: spellsCircles.c2,
    nome: 'Desespero Esmagador',
    execucao: 'Padrão',
    alcance: '6m',
    alvo: 'Cone',
    duracao: 'Cena',
    resistencia: 'Vontade Parcial',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'em vez do normal, as condições adquiridas são debilitado e esmorecido.',
      },
      {
        addPm: 3,
        text: 'em vez do normal, afeta qualquer tipo de criatura.',
      },
      {
        addPm: 3,
        text: 'além do normal, criaturas que falhem na resistência ficam aos prantos (em termos de jogo, adquirem a condição pasmo) por 1 rodada. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.marcaDaObediencia]: {
    spellCircle: spellsCircles.c2,
    nome: 'Marca da Obediência',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade Anula',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda a duração para 1 dia. Se não estiver em combate, a criatura só pode fazer o teste de Vontade a cada hora. Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: 'sempre que o alvo fizer o teste de Vontade e falhar, a marca causa 3d6 pontos de dano mental. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.bolaDeFogo]: {
    spellCircle: spellsCircles.c2,
    nome: 'Bola de Fogo',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Esfera com 6m de raio',
    duracao: 'Instantânea',
    resistencia: 'Reflexos reduz à metade',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +2d6.',
      },
      {
        addPm: 2,
        text: 'muda a área para efeito de esfera flamejante com tamanho Médio e a duração para cena. Em vez do normal, cria uma esfera flamejante com 1,5m de diâmetro que causa 3d6 pontos de dano a qualquer criatura no mesmo espaço. Você pode gastar uma ação de movimento para fazer a esfera voar 9m em qualquer direção. Ela é imune a dano, mas pode ser apagada com água. Uma criatura só pode sofrer dano da esfera uma vez por rodada.',
      },
      {
        addPm: 3,
        text: 'muda a duração para 1 dia ou até ser descarregada. Em vez do normal, você cria uma pequena pedra flamejante, que pode detonar como uma reação, descarregando a magia. A pedra pode ser usada como uma arma de arremesso com alcance curto. Uma vez detonada, causa o dano da magia numa área de esfera de 6m de raio.',
      },
    ],
  },
  [spellsCircle2Names.flechaAcida]: {
    spellCircle: spellsCircles.c2,
    nome: 'Flecha Ácida',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura ou objeto',
    duracao: 'Instantânea',
    resistencia: 'Reflexos Parcial',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, se o alvo coberto pelo muco ácido estiver usando armadura ou escudo, o item é corroído. Isso reduz o bônus na Defesa do item em 1 ponto permanentemente. O item pode ser consertado, restaurando seu bônus (veja a perícia Ofício, na página 121).',
      },
      {
        addPm: 2,
        text: 'aumenta a redução na Defesa em +1.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano inicial e o dano por rodada em +1d6.',
      },
    ],
  },
  [spellsCircle2Names.relampago]: {
    spellCircle: spellsCircles.c2,
    nome: 'Relâmpago',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Linha',
    duracao: 'Instantânea',
    resistencia: 'Reflexos reduz à metade',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em +2d6.',
      },
      {
        addPm: 3,
        text: 'muda a área para alvo (criaturas escolhidas). Em vez do normal, você dispara vários relâmpagos, um para cada alvo escolhido, causando 6d6 pontos de dano de eletricidade. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.soproDasUivantes]: {
    spellCircle: spellsCircles.c2,
    nome: 'Sopro das Uivantes',
    execucao: 'Padrão',
    alcance: '6m',
    alvo: 'Cone',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano de frio em +2d6.',
      },
      {
        addPm: 2,
        text: 'além do normal, criaturas que falhem no teste de Fortitude ficam caídas.',
      },
      {
        addPm: 3,
        text: 'aumenta o tamanho máximo das criaturas afetadas em uma categoria. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.aparenciaPerfeita]: {
    spellCircle: spellsCircles.c2,
    nome: 'Aparência Perfeita',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +2d6. O aumento pode ser de um novo tipo de dano, desde que explicado pela ilusão.',
      },
      {
        addPm: 3,
        text: 'aumenta o número de alvos em +1.',
      },
    ],
  },
  [spellsCircle2Names.camuflagemIlusoria]: {
    spellCircle: spellsCircles.c2,
    nome: 'Camuflagem Ilusória',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: '',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'a imagem do alvo fica mais distorcida, oferecendo camuflagem total.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.esculpirSons]: {
    spellCircle: spellsCircles.c2,
    nome: 'Esculpir Sons',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura ou objeto',
    duracao: 'Cena',
    resistencia: 'Vontade Anula',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1. Todas as criaturas e objetos devem ser afetadas da mesma forma.',
      },
    ],
  },
  [spellsCircle2Names.invisibilidade]: {
    spellCircle: spellsCircles.c2,
    nome: 'Invisibilidade',
    execucao: '',
    alcance: '',
    alvo: '',
    duracao: '',
    resistencia: '',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a execução para ação padrão, o alcance para toque e o alvo para 1 criatura ou 1 objeto.',
      },
      {
        addPm: 3,
        text: 'muda a duração para cena. Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: 'muda a duração para sustentada. Em vez do normal, o alvo gera uma esfera de invisibilidade. O alvo e todas as criaturas a até 3m dele se tornam invisíveis, como no efeito normal da magia (ainda ficam visíveis caso façam uma ação hostial). A esfera se move juntamente com o alvo; qualquer coisa que saia da esfera fica visível. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda a execução para ação padrão, o alcance para toque e o alvo para 1 criatura. A magia não é dissipada caso o alvo faça um ataque ou use uma habilidade ofensiva. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.conjurarMortosVivos]: {
    spellCircle: spellsCircles.c2,
    nome: 'Conjurar Mortos-Vivos',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: '6 mortos-vivos',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de mortos-vivos conjurados em +1.',
      },
      {
        addPm: 3,
        text: 'em vez de esqueletos, conjura carniçais. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'em vez de esqueletos, conjura sombras. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.cranioVoadorDeVladislav]: {
    spellCircle: spellsCircles.c2,
    nome: 'Crânio Voador de Vladislav',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em +1d8+1.',
      },
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1.',
      },
    ],
  },
  [spellsCircle2Names.toqueVampirico]: {
    spellCircle: spellsCircles.c2,
    nome: 'Toque Vampírico',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a resistência para nenhum. Como parte da execução da magia, você pode fazer um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e da magia, e recupera pontos de vida iguais à metade do dano da magia.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +2d6.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para pessoal, o alvo para você e a duração para cena. Em vez do normal, a cada rodada você pode gastar uma ação padrão para tocar 1 criatura e causar 3d6 pontos de dano. Você recupera pontos de vida iguais à metade do dano causado. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.alterarTamanho]: {
    spellCircle: spellsCircles.c2,
    nome: 'Alterar Tamanho',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: '1 dia',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura. Em vez do normal, o alvo aumenta de tamanho em uma categoria e seu equipamento para o adequado ao seu novo tamanho. O alvo também recebe Força +4. Um alvo involuntário pode fazer um teste de Fortitude para negar o efeito.',
      },
      {
        addPm: 3,
        text: 'muda o alcance para toque e o alvo para 1 criatura. Em vez do normal, o alvo diminui de tamanho em uma categoria e seu equipamento para o adequado ao seu novo tamanho. O alvo também recebe Destreza +4. Um alvo involuntário pode fazer um teste de Fortitude para negar o efeito. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para toque, o alvo para 1 criatura, a duração para permanente e a resistência para Fortitude anula. Em vez do normal, se falhar na resistência o alvo e seu equipamento têm seu tamanho mudado para Minúsculo. O alvo também tem seu valor de Força reduzido a 1 e suas formas de deslocamento reduzidas a 3m. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.metamorfose]: {
    spellCircle: spellsCircles.c2,
    nome: 'Metamorfose',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'a forma escolhida recebe uma habilidade de sentidos entre faro, visão na penumbra e visão no escuro.',
      },
      {
        addPm: 3,
        text: 'a forma escolhida recebe percepção às cegas. Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: 'muda o alcance para toque, o alvo para 1 criatura e adiciona resistência (Vontade anula).',
      },
      {
        addPm: 3,
        text: 'muda o alcance para médio, o alvo para 1 criatura e a resistência para Vontade anula. Em vez do normal, transforma o alvo em uma criatura ou objeto inofensivo (ovelha, sapo, galinha, pudim de ameixa etc.). A criatura não pode atacar, falar e lançar magias; seu deslocamento vira 3m e sua Defesa vira 10. Suas outras características não mudam. No início de seus turnos, o alvo pode fazer um teste de Vontade; se passar, retorna à sua forma normal e a magia termina. Requer 3º círculo.',
      },
      {
        addPm: 5,
        text: 'se mudar para formas não humanoides, pode escolher uma Forma Selvagem Aprimorada. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'se mudar para formas não humanoides, pode escolher uma Forma Selvagem Superior. Requer 4º círculo.',
      },
      {
        addPm: 12,
        text: 'além do normal, no início de seus turnos o alvo pode mudar de forma novamente, como uma ação livre, fazendo novas escolhas. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle2Names.velocidade]: {
    spellCircle: spellsCircles.c2,
    nome: 'Velocidade',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 7,
        text: 'muda o alvo para criaturas escolhidas no alcance. Requer 4º círculo.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para pessoal e o alvo para você. Você acelera sua mente, além de seu corpo. A ação adicional pode ser usada para lançar magias e ativar engenhocas. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.circuloDaJustica]: {
    spellCircle: spellsCircles.c2,
    nome: 'Círculo da Justiça',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: 'Cubo com 9m de lado',
    duracao: '1 dia',
    resistencia: 'Vontade Parcial',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a execução para ação padrão, o alcance para pessoal, o alvo para você, a duração para cena e a resistência para nenhuma. Em vez do normal, qualquer criatura ou objeto invisível em alcance curto se torna visível. Isso não dissipa o efeito mágico; se sair do seu alcance, a criatura ou objeto voltam a ficar invisíveis.',
      },
      {
        addPm: 3,
        text: 'muda a penalidade nas perícias para –10 (se passar na resistência) e –20 (se falhar). Requer 4º círculo.',
      },
      {
        addPm: 7,
        text: 'muda a duração para permanente e adiciona componente material (balança de prata no valor de T$ 5.000).',
      },
    ],
  },
  [spellsCircle2Names.vestimentaDaFe]: {
    spellCircle: spellsCircles.c2,
    nome: 'Vestimenta da Fé',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 traje, armadura ou escudo',
    duracao: '1 dia',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'o objeto também oferece o mesmo bônus em testes de resistência. Requer 3º círculo..',
      },
      {
        addPm: 4,
        text: 'aumenta o bônus em +1.',
      },
      {
        addPm: 7,
        text: 'o objeto também oferece resistência a dano 5. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.condicao]: {
    spellCircle: spellsCircles.c2,
    nome: 'Condição',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Até 5 criaturas',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 1,
        text: 'aumenta a duração para 1 dia.',
      },
    ],
  },
  [spellsCircle2Names.globoDaVerdadeDeGwen]: {
    spellCircle: spellsCircles.c2,
    nome: 'Globo da Verdade de Gwen',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'o globo mostra uma cena vista até um mês atrás.',
      },
      {
        addPm: 2,
        text: 'como acima, até um ano atrás.',
      },
      {
        addPm: 2,
        text: 'ao lançar a magia, você pode tocar um cadáver. O globo mostra a última cena vista por essa criatura.',
      },
      {
        addPm: 4,
        text: 'muda o alcance para longo e o efeito para 10 globos. Todos mostram a mesma cena.',
      },
    ],
  },
  [spellsCircle2Names.menteDivina]: {
    spellCircle: spellsCircles.c2,
    nome: 'Mente Divina',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'em vez do normal, o alvo recebe +4 nos três atributos mentais. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas.',
      },
      {
        addPm: 7,
        text: 'aumenta o bônus em +2. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.vozDivina]: {
    spellCircle: spellsCircles.c2,
    nome: 'Voz Divina',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'você concede um pouco de vida a um cadáver, suficiente para que ele responda a suas perguntas. O conhecimento do corpo é limitado ao que ele tinha enquanto vivo e suas respostas são curtas e enigmáticas. Um corpo só pode ser alvo desta magia uma vez. Ela também não funciona em um corpo cuja cabeça tenha sido destruída.',
      },
      {
        addPm: 1,
        text: 'você pode falar com plantas (normais ou monstruosas) e rochas. Plantas e rochas têm percepção limitada de seus arredores e normalmente fornecem respostas simplórias.',
      },
    ],
  },
  [spellsCircle2Names.enxameDePestes]: {
    spellCircle: spellsCircles.c2,
    nome: 'Enxame de Pestes',
    execucao: 'Completa',
    alcance: 'Médio',
    alvo: '1 enxame Médio (quadrado de 1,5m)',
    duracao: 'Sustentada',
    resistencia: 'Fortitude Reduz à Metade',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +1d12.',
      },
      {
        addPm: 3,
        text: 'muda a resistência para Reflexos reduz à metade e o enxame para criaturas maiores, como gatos, guaxinins, compsognatos ou kobolds. Ele causa 3d12 pontos de dano (a sua escolha entre corte, impacto ou perfuração). O resto da magia segue normal.',
      },
      {
        addPm: 5,
        text: 'aumenta o número de enxames em +1. Eles não podem ocupar o mesmo espaço. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda a resistência para Reflexos reduz à metade e o enxame para criaturas elementais. Ele causa 5d12 pontos do dano (a sua escolha entre ácido, eletricidade, fogo ou frio). O resto da magia segue normal. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.socoDeArsenal]: {
    spellCircle: spellsCircles.c2,
    nome: 'Soco de Arsenal',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para pessoal, o alvo para você, a duração para cena e a resistência para nenhuma. Em vez do normal, seus ataques corpo a corpo passam a acertar inimigos distantes. Seu alcance natural aumenta em 3m; uma criatura Média pode atacar adversários a até 4,5m, por exemplo.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +1d6.',
      },
      {
        addPm: 4,
        text: 'aumenta a distância do efeito de empurrar em +3m.',
      },
      {
        addPm: 5,
        text: 'muda o tipo do dano para essência.',
      },
    ],
  },
  [spellsCircle2Names.aliadoAnimal]: {
    spellCircle: spellsCircles.c2,
    nome: 'Aliado Animal',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal prestativo',
    duracao: '1 dia',
    resistencia: '',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para 1 animal Minúsculo e a duração para 1 semana. Em vez do normal, o animal se desloca no melhor de suas capacidades até um local designado por você — em geral, para levar um item, carta ou similar. Quando o animal chega ao destino, fica esperando até o fim da magia, permitindo apenas que uma ou mais criaturas escolhidas por você se aproximem e peguem o que ele estiver carregando.',
      },
      {
        addPm: 7,
        text: 'muda o aliado para mestre. Requer 3º círculo.',
      },
      {
        addPm: 12,
        text: 'muda o alvo para 2 animais prestativos. Cada animal funciona como um aliado de um tipo diferente, e você pode receber a ajuda de ambos (mas ainda precisa seguir o limite de aliados de acordo com o seu nível de personagem). Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.oracao]: {
    spellCircle: spellsCircles.c2,
    nome: 'Oração',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Todas as criaturas (veja texto)',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta os bônus em +1, limitado pelo círculo máximo de magia que você pode lançar.',
      },
      {
        addPm: 2,
        text: 'aumenta as penalidades em –1, limitado pelo círculo máximo de magia que você pode lançar.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para médio. Requer 3º círculo.',
      },
      {
        addPm: 12,
        text: 'muda a duração para cena.Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.controlarFogo]: {
    spellCircle: spellsCircles.c2,
    nome: 'Controlar Fogo',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Ver texto',
    duracao: 'Cena',
    resistencia: '',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a duração para sustentada e a resistência para Reflexos reduz à metade. Em vez do normal, você deve escolher o seguinte efeito. Labaredas: a cada rodada, você pode gastar uma ação de movimento para projetar uma labareda, acertando um alvo em alcance curto a partir da chama. O alvo sofre 4d6 pontos de dano de fogo (Reflexos reduz à metade).',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +1d6.',
      },
      {
        addPm: 3,
        text: 'muda o alvo para 1 criatura composta principalmente por fogo, lava ou magma (como um elemental do fogo) e a resistência para Fortitude parcial. Em vez do normal, se a criatura falhar no teste de resistência, é reduzida a 0 PV. Se passar, sofre 5d6 pontos de dano.',
      },
    ],
  },
  [spellsCircle2Names.purificacao]: {
    spellCircle: spellsCircles.c2,
    nome: 'Purificação',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'também cura todo o dano causado por venenos.',
      },
      {
        addPm: 2,
        text: 'em vez de uma, remove todas as condições listadas.',
      },
      {
        addPm: 3,
        text: 'também permite que o alvo solte qualquer item amaldiçoado que esteja segurando (mas não remove a maldição do item em si).',
      },
      {
        addPm: 7,
        text: 'também dissipa magias e efeitos prejudiciais de encantamento, necromancia e transmutação afetando o alvo. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle2Names.raioSolar]: {
    spellCircle: spellsCircles.c2,
    nome: 'Raio Solar',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Linha',
    duracao: 'Instantânea',
    resistencia: 'Reflexos (veja o texto)',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda a duração para cena e a resistência para nenhuma. Em vez do normal, cria um facho de luz que ilumina a área da magia. Uma vez por rodada, você pode mudar a direção do facho como uma ação livre.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano ou cura em +1d8 (ou +1d12 em mortos-vivos).',
      },
      {
        addPm: 3,
        text: 'em vez do normal, criaturas vivas a sua escolha na área curam 4d8 pontos de vida; o restante sofre o dano normalmente.',
      },
      {
        addPm: 3,
        text: 'criaturas que falhem na resistência ficam cegas por 1d4 rodadas.',
      },
    ],
  },
  [spellsCircle2Names.tempestadaDivina]: {
    spellCircle: spellsCircles.c2,
    nome: 'Tempestade Divina',
    execucao: 'Completa',
    alcance: 'Longo',
    alvo: 'Cilindro com 9m de raio',
    duracao: 'Cena',
    resistencia: '',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a duração para sustentada. Além do normal, uma vez por rodada, como uma ação padrão, você pode fazer um relâmpago cair sobre um alvo na área, causando 3d8 pontos de dano de eletricidade (Reflexos reduz à metade).',
      },
      {
        addPm: 1,
        text: 'se escolheu causar granizo, muda o dano para 1d6.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +1 dado do mesmo tipo.',
      },
      {
        addPm: 3,
        text: 'se escolheu causar chuva, ela revela criaturas e objetos invisíveis na área.',
      },
      {
        addPm: 7,
        text: 'se escolheu causar neve, criaturas na área sofrem 2d6 pontos de dano de frio no início de seus turnos.',
      },
    ],
  },
  [spellsCircle2Names.silencio]: {
    spellCircle: spellsCircles.c2,
    nome: 'Silêncio',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Esfera com 6m de raio',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +2d6. O aumento pode ser de um novo tipo de dano, desde que explicado pela ilusão.',
      },
      {
        addPm: 3,
        text: 'aumenta o número de alvos em +1.',
      },
    ],
  },
  [spellsCircle2Names.miasmaMefitico]: {
    spellCircle: spellsCircles.c2,
    nome: 'Miasma Mefítico',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Nuvem com 6m de raio',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alcance para toque, a área para alvo (1 criatura com 0 PV ou menos), a duração para instantânea e a resistência para Fortitude anula. Em vez do normal, você canaliza o Miasma contra uma vítima. Se falhar na resistência, ela morre e você recebe +2 na CD de suas magias por 1 dia. Se passar, fica imune a este truque por um dia.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +1d6.',
      },
      {
        addPm: 3,
        text: 'muda o tipo do dano para trevas.',
      },
    ],
  },
  [spellsCircle2Names.rogarMaldicao]: {
    spellCircle: spellsCircles.c2,
    nome: 'Rogar Maldição',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Sustentada',
    resistencia: 'Fortitude anula',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o número de efeitos que você pode escolher em +1. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda a duração para permanente e resistência para Fortitude parcial. Se passar, a criatura ainda sofre os efeitos da maldição, mas por 1 rodada. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.controlarMadeira]: {
    spellCircle: spellsCircles.c2,
    nome: 'Controlar Madeira',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 objeto de madeira grande ou menor',
    duracao: 'Cena',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para pessoal, o alvo para você e a duração para 1 dia. Você e seu equipamento se transformam em uma árvore de tamanho Grande. Nessa forma, você não pode falar ou fazer ações físicas, mas consegue perceber seus arredores normalmente. Se for atacado nessa forma, a magia é dissipada. Um teste de Sobrevivência (CD 30) revela que você não é uma árvore verdadeira.',
      },
      {
        addPm: 3,
        text: 'muda o alvo para área de quadrado com 9m de lado e a duração para cena. Em vez do normal, qualquer vegetação na área fica rígida e afiada. A área é considerada terreno difícil e criaturas que andem nela sofrem 1d6 pontos de dano de corte para cada 1,5m que avancem.',
      },
      {
        addPm: 7,
        text: 'muda o alvo para objeto de madeira Enorme ou menor. Requer 3º círculo.',
      },
      {
        addPm: 12,
        text: 'muda o alvo para objeto de madeira Colossal ou menor. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.fisicoDivino]: {
    spellCircle: spellsCircles.c2,
    nome: 'Físico Divino',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'em vez do normal, o alvo recebe +4 nos três atributos físicos. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas.',
      },
      {
        addPm: 7,
        text: 'aumenta o bônus em +2. Requer 4º círculo.',
      },
    ],
  },
};

export const spellsCircle3: Record<spellsCircle3Names, Spell> = {
  [spellsCircle3Names.ancoraDimensional]: {
    spellCircle: spellsCircles.c3,
    nome: 'Âncora Dimensional',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura ou objeto',
    duracao: 'Cena',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para médio, a área para círculo de 3m de raio e o alvo para criaturas escolhidas.',
      },
      {
        addPm: 2,
        text: 'muda o efeito para criar um fio de energia cor de esmeralda que prende o alvo a um ponto no espaço dentro do alcance. O ponto precisa ser fixo, mas não precisa de nenhum apoio ou superfície (pode simplesmente flutuar no ar). O alvo não pode se afastar mais de 3m do ponto, nem fisicamente, nem com movimento planar. O fio possui 20 PV e resistência a dano 20 (mas pode ser dissipado por efeitos que libertam criaturas, como o Julgamento Divino: Libertação do paladino).',
      },
      {
        addPm: 4,
        text: 'como acima, mas em vez de um fio, cria uma corrente de energia, com 20 PV e resistência a dano 40.',
      },
      {
        addPm: 4,
        text: 'muda o alvo para área de cubo de 9m, a duração para permanente e adiciona componente material (chave de esmeralda no valor de T$ 2.000). Em vez do normal, nenhum tipo de movimento planar pode ser feito para entrar ou sair da área.',
      },
      {
        addPm: 9,
        text: 'muda o alcance para médio, a área para círculo de 3m de raio e o alvo para criaturas escolhidas. Cria um fio de energia (veja acima) que prende todos os alvos ao centro da área.',
      },
    ],
  },
  [spellsCircle3Names.dificultarDeteccao]: {
    spellCircle: spellsCircles.c3,
    nome: 'Dificultar Detecção',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura ou objeto',
    duracao: '1 dia',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda o alvo para área de cubo de 9m. Qualquer criatura ou objeto na área recebe o efeito da magia enquanto estiver dentro dela.',
      },
      {
        addPm: 4,
        text: 'muda a duração para 1 semana',
      },
    ],
  },
  [spellsCircle3Names.globoDeInvulnerabilidade]: {
    spellCircle: spellsCircles.c3,
    nome: 'Globo de Invulnerabilidade',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda o efeito para afetar magias de até 3º círculo. Requer 4º círculo.',
      },
      {
        addPm: 9,
        text: 'muda o efeito para afetar magias de até 4º círculo. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle3Names.contatoExtraplanar]: {
    spellCircle: spellsCircles.c3,
    nome: 'Contato Extraplanar',
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 dia',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de dados de auxílio em +1.',
      },
      {
        addPm: 8,
        text: 'Muda os dados de auxílio para d12. Sempre que rolar um resultado 12 num desses d12, a entidade “suga” 2 PM de você. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle3Names.lendasEHistorias]: {
    spellCircle: spellsCircles.c3,
    nome: 'Lendas e Histórias',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura, objeto ou local',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda a execução para 1 dia, o alcance para ilimitado e adiciona componente material (cuba de ouro cheia d’água e ingredientes mágicos, no valor de T$ 1.000). Você ainda precisa ter alguma informação sobre o alvo, como um nome, descrição ou localização.',
      },
    ],
  },
  [spellsCircle3Names.videncia]: {
    spellCircle: spellsCircles.c3,
    nome: 'Vidência',
    execucao: 'Completa',
    alcance: 'Ilimitado',
    alvo: '1 criatura',
    duracao: 'Sustentada',
    resistencia: 'Vontade anula',
    school: 'Adiv',
  },
  [spellsCircle3Names.convocacaoInstantenea]: {
    spellCircle: spellsCircles.c3,
    nome: 'Convocação Instantânea',
    execucao: 'Padrão',
    alcance: 'Ilimitado',
    alvo: '1 objeto de até 5kg',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, até 1 hora após ter lançado a magia, você pode gastar uma ação de movimento para enviar o objeto de volta para o local em que ele estava antes.',
      },
      {
        addPm: 1,
        text: 'muda o alvo para um baú Médio, a duração para permanente e adiciona sacrifício de 1 PM. Em vez do normal, você esconde o baú alvo no Etéreo, com até 250kg de equipamento. A magia faz com que qualquer objeto caiba no baú, independentemente do seu tamanho. Uma vez escondido, você pode convocar o baú para um espaço livre adjacente, ou de volta para o Etéreo, como uma ação padrão. Componente material: baú construído com matéria- prima da melhor qualidade (T$ 1.000). Você deve ter em mãos uma miniatura do baú, no valor de T$ 100, para invocar o baú verdadeiro.',
      },
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 2,
        text: 'aumenta o peso limite do alvo em um fator de 10, até 500 kg. Um objeto muito grande ou pesado para aparecer em suas mãos é teletransportado para um espaço adjacente a sua escolha.',
      },
    ],
  },
  [spellsCircle3Names.enxameRubroDeIchabod]: {
    spellCircle: spellsCircles.c3,
    nome: 'Enxame Rubro de Ichabod',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Quadrado de 3m',
    duracao: 'Sustentada',
    resistencia: 'Reflexos reduz à metade',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, uma criatura que falhe no teste de Reflexos fica agarrada (o enxame escala e cobre o corpo dela). A criatura pode gastar uma ação padrão e fazer um teste de Acrobacia ou Atletismo para escapar. Se você mover o enxame, a criatura fica livre.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +1d12.',
      },
      {
        addPm: 2,
        text: 'muda o dano para trevas.',
      },
      {
        addPm: 3,
        text: 'o enxame vira Enorme (quadrado de 6m de lado).',
      },
      {
        addPm: 3,
        text: 'o enxame ganha deslocamento de voo 18m e passa a ocupar um cubo ao invés de um quadrado.',
      },
      {
        addPm: 4,
        text: 'o enxame inclui parasitas inchados que explodem e criam novos enxames. No início de cada um de seus turnos, role 1d6. Em um resultado 5 ou 6, um novo enxame surge adjacente a um já existente à sua escolha. Você pode mover todos os enxames com uma única ação de movimento, mas eles não podem ocupar o mesmo espaço. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle3Names.teletransporte]: {
    spellCircle: spellsCircles.c3,
    nome: 'Teletransporte',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: 'Até 5 criaturas voluntárias',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +5.',
      },
      {
        addPm: 2,
        text: 'em vez do normal, a magia teletransporta os alvos para seu santuário — um local familiar e previamente preparado. A magia pode ser usada sem limite de distância ou necessidade de testes, mas apenas dentro do mesmo plano. Preparar um local como seu santuário exige um ritual de um dia e o gasto de T$ 1.000. Você só pode ter um santuário por vez.',
      },
      {
        addPm: 9,
        text: 'muda a execução para ação completa, a duração para cena e adiciona sacrifício de 1 PM. Em vez do normal, você cria um círculo de 1,5m de diâmetro no chão, que transporta qualquer criatura que pisar nele. O destino é escolhido quando a magia é lançada e pode ser qualquer lugar, em qualquer mundo, sem a necessidade de testes, desde que seja conhecido por você. O círculo é tênue e praticamente invisível. Você pode marcá-lo de alguma forma (por exemplo, lançando-o sobre uma plataforma elevada). Se não fizer isso, alguém pode pisar nele por acidente. Junte isso a um destino hostil e você terá uma armadilha bastante eficaz! Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle3Names.imobilizar]: {
    spellCircle: spellsCircles.c3,
    nome: 'Imobilizar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide ou animal',
    duracao: 'Cena',
    resistencia: 'Vontade Parcial',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para 1 espírito.',
      },
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 3,
        text: 'muda o alvo para 1 criatura. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle3Names.seloDeMana]: {
    spellCircle: spellsCircles.c3,
    nome: 'Selo de Mana',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade Parcial',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas dentro do alcance. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle3Names.erupcaoGlacial]: {
    spellCircle: spellsCircles.c3,
    nome: 'Erupção Glacial',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Quadrado de 6m de lado',
    duracao: 'Instantânea',
    resistencia: 'Reflexos parcial',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o dano de frio em +2d6 e o dano de corte em +2d6.',
      },
      {
        addPm: 4,
        text: 'muda a área para cilindro com 6m de raio e 6m de altura e a duração para sustentada. Em vez do normal, a magia cria uma tempestade de granizo que causa 3d6 pontos de dano de impacto e 3d6 pontos de dano de frio em todas as criaturas na área (sem teste de resistência). A tempestade fornece camuflagem a todas as criaturas dentro dela e deixa o piso escorregadio. Piso escorregadio conta como terreno difícil e obriga criaturas na área a fazer testes de Acrobacia para equilíbrio (veja o Capítulo 2). Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle3Names.lancaIgneaDeAleph]: {
    spellCircle: spellsCircles.c3,
    nome: 'Lança Ígnea de Aleph',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Reflexos Parcial',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o dano inicial em +2d6 e o dano do efeito em chamas em +1d6.',
      },
      {
        addPm: 4,
        text: 'muda a duração para cena ou até ser descarregada. Em vez do efeito normal, a magia cria quatro dardos de lava que flutuam ao lado do conjurador. Uma vez por rodada, como uma ação livre, você pode disparar um dos dardos em uma criatura, causando o efeito normal da magia. Requer 4º Círculo.',
      },
    ],
  },
  [spellsCircle3Names.muralhaElemental]: {
    spellCircle: spellsCircles.c3,
    nome: 'Muralha Elemental',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '',
    duracao: 'Cena',
    resistencia: 'Veja o texto',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o comprimento em +15m e altura em +3m, até 60m de comprimento e 9m de altura.',
      },
      {
        addPm: 4,
        text: 'muda a duração para sustentada e adiciona uma nova escolha, Essência. A muralha é invisível e indestrutível — imune a qualquer forma de dano e não afetada por nenhuma magia. Ela não pode ser atravessada nem mesmo por criaturas incorpóreas. No entanto, magias que teletransportam criaturas, como Salto Dimensional, podem atravessá-la. Magias e efeitos de dano, como Bola de Fogo e o sopro de um dragão, não vencem a muralha, mas magias lançadas diretamente sobre uma criatura ou área, como Sono, podem ser lançadas contra alvos que estejam no outro lado como se tivessem linha de efeito. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle3Names.ilusaoLacerante]: {
    spellCircle: spellsCircles.c3,
    nome: 'Ilusão Lacerante',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade Anula',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +2d6. O aumento pode ser de um novo tipo de dano, desde que explicado pela ilusão.',
      },
      {
        addPm: 3,
        text: 'aumenta o número de alvos em +1.',
      },
    ],
  },
  [spellsCircle3Names.mantoDeSombras]: {
    spellCircle: spellsCircles.c3,
    nome: 'Manto de Sombras',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda o alcance para toque e o alvo para 1 criatura. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle3Names.miragem]: {
    spellCircle: spellsCircles.c3,
    nome: 'Miragem',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: 'Cubo de até 90m de lado',
    duracao: '1 dia',
    resistencia: '',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'além do normal, pode alterar a aparência de criaturas escolhidas na área, como se usando Disfarce Ilusório.',
      },
      {
        addPm: 9,
        text: 'muda a duração para permanente e adiciona componente material (pó de diamante no valor de T$ 1.000). Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle3Names.ferverSangue]: {
    spellCircle: spellsCircles.c3,
    nome: 'Ferver Sangue',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Sustentada',
    resistencia: 'Fortitude reduz à metade',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +1d6.',
      },
      {
        addPm: 9,
        text: 'muda alvo para criaturas escolhidas. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle3Names.tentaculosDeTrevas]: {
    spellCircle: spellsCircles.c3,
    nome: 'Tentáculos de Trevas',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Círculo com 6m de raio',
    duracao: 'Cena',
    resistencia: '',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'umenta o raio da área em +3m.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano dos tentáculos em +2d6.',
      },
    ],
  },
  [spellsCircle3Names.peleDePedra]: {
    spellCircle: spellsCircles.c3,
    nome: 'Pele de Pedra',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para toque e o alvo para 1 criatura.',
      },
      {
        addPm: 4,
        text: 'muda a duração para 1 dia.',
      },
      {
        addPm: 4,
        text: 'sua pele ganha aspecto e dureza de aço. Você recebe resistência a dano 10. Requer 4º círculo.',
      },
      {
        addPm: 4,
        text: 'muda o alcance para toque, o alvo para 1 criatura, a duração para 1d4 rodadas e adiciona Resistência: Fortitude anula. Em vez do efeito normal, a magia transforma o alvo e seu equipamento em uma estátua inerte e sem consciência. A estátua possui os mesmos PV da criatura e resistência a dano 8; se for quebrada, a criatura morrerá. Requer 4º círculo.',
      },
      {
        addPm: 9,
        text: 'como acima, mas com duração permanente. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle3Names.telecinesia]: {
    spellCircle: spellsCircles.c3,
    nome: 'Telecinesia',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Veja o texto',
    duracao: 'Sustentada ou Intantânea',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o limite de peso em 100kg.',
      },
    ],
  },
  [spellsCircle3Names.transformacaoDeGuerra]: {
    spellCircle: spellsCircles.c3,
    nome: 'Transformação de Guerra',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta os bônus na Defesa, testes de ataque e rolagens de dano corpo a corpo em +1, e os PV temporários em +10.',
      },
      {
        addPm: 2,
        text: 'adiciona componente material (uma barra de adamante no valor de T$ 100). Sua forma de combate ganha um aspecto metálico e sem expressões. Além do normal, você recebe resistência a dano 10 e imunidade a atordoamento, doenças, encantamento, fadiga, paralisia, necromancia, sangramento, sono e veneno, e não precisa respirar.',
      },
    ],
  },
  [spellsCircle3Names.voo]: {
    spellCircle: spellsCircles.c3,
    nome: 'Voo',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para toque e o alvo para 1 criatura.',
      },
      {
        addPm: 4,
        text: 'muda a duração para 1 dia. Requer 4º círculo.',
      },
      {
        addPm: 4,
        text: 'muda o alcance para curto e o alvo para até 10 criaturas. Requer 4° círculo.',
      },
    ],
  },
  [spellsCircle3Names.banimento]: {
    spellCircle: spellsCircles.c3,
    nome: 'Banimento',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Vontade Parcial',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1.',
      },
    ],
  },
  [spellsCircle3Names.protecaoContraMagia]: {
    spellCircle: spellsCircles.c3,
    nome: 'Proteção contra Magia',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda o bônus para +10. Requer 4º círculo.',
      },
      {
        addPm: 4,
        text: 'em vez do normal, o alvo fica imune a uma escola de magia a sua escolha. Requer 4º Círculo.',
      },
      {
        addPm: 9,
        text: 'em vez do normal, o alvo fica imune a duas escolas de magia a sua escolha. Requer 5º Círculo.',
      },
    ],
  },
  [spellsCircle3Names.comunhaoComANatureza]: {
    spellCircle: spellsCircles.c3,
    nome: 'Comunhão com a Natureza',
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 dia',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a execução para 1 minuto e a duração para instantânea. Em vez do normal, você descobre 1d4+1 informações sobre os seguintes temas: terreno, animais, vegetais, minerais, cursos d’água e presença de criaturas antinaturais numa região natural em que você esteja. Você pode, por exemplo, descobrir a quantidade de cavernas (terreno), se uma planta rara existe (vegetais) e se há mortos-vivos (criaturas antinaturais) na região.',
      },
      {
        addPm: 3,
        text: 'aumenta o número de dados de auxílio em +2.',
      },
      {
        addPm: 4,
        text: 'muda o tipo dos dados de auxílio para d6.',
      },
      {
        addPm: 8,
        text: 'muda o tipo dos dados de auxílio para d8.',
      },
    ],
  },
  [spellsCircle3Names.servoDivino]: {
    spellCircle: spellsCircles.c3,
    nome: 'Servo Divino',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '',
    duracao: 'Cena ou até descarregar',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda a duração para 1 dia ou até ser descarregada. O espírito realiza uma tarefa a sua escolha que exija até um dia. O custo do pagamento aumenta para T$ 500. O resto segue normal.',
      },
      {
        addPm: 9,
        text: 'muda a duração para 1 semana ou até ser descarregada. O espírito realiza uma tarefa que exija até uma semana. O custo do pagamento aumenta para T$ 1.000. O resto segue normal.',
      },
    ],
  },
  [spellsCircle3Names.viagemArborea]: {
    spellCircle: spellsCircles.c3,
    nome: 'Viagem Arbórea',
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para toque, o alvo para até cinco criaturas e a duração para instantânea. Os alvos entram em uma planta (de tamanho Médio ou maior) e saem em outra planta do mesmo tamanho a até 100km de distância, especificada em direção e distância aproximadas (como “50km ao norte”).',
      },
    ],
  },
  [spellsCircle3Names.despertarConsciencia]: {
    spellCircle: spellsCircles.c3,
    nome: 'Despertar Consciência',
    execucao: 'Completa',
    alcance: 'Toque',
    alvo: '1 animal ou planta',
    duracao: '1 dia',
    resistencia: '',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda o alvo para 1 escultura mundana inanimada. Além do normal, o alvo tem as mesmas características de um construto.',
      },
      {
        addPm: 4,
        text: 'muda a duração para permanente e adiciona sacrifício de 1 PM.',
      },
    ],
  },
  [spellsCircle3Names.heroismo]: {
    spellCircle: spellsCircles.c3,
    nome: 'Heroísmo',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: '',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda o bônus para +6.',
      },
    ],
  },
  [spellsCircle3Names.missaoDivina]: {
    spellCircle: spellsCircles.c3,
    nome: 'Missão Divina',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: '1 semana ou até descarregar',
    resistencia: 'Vontade anula (veja texto)',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para toque, a duração para permanente e adiciona penalidade de –1 PM. Em vez do normal, você inscreve uma marca (como uma tatuagem) na pele do alvo e escolhe um tipo de ação que ativará a marca. Normalmente, será cometer um crime (roubar, matar...) ou outra coisa contrária às Obrigações & Restrições de sua divindade. Sempre que a marca é ativada, o alvo recebe uma penalidade cumulativa de –2 em todos os testes. Muitas vezes, portar essa marca é um estigma por si só, já que esta magia normalmente é lançada em criminosos ou traidores. Dissipar Magia suprime a marca e suas penalidades por um dia; elas só podem ser totalmente removidas pelo conjurador original ou pela magia Purificação.',
      },
      {
        addPm: 4,
        text: 'aumenta a duração para 1 ano ou até ser descarregada.',
      },
    ],
  },
  [spellsCircle3Names.colunaDeChamas]: {
    spellCircle: spellsCircles.c3,
    nome: 'Coluna de Chamas',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: 'Cilindo com 3m de raio e 30km de altura',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano de fogo em +1d6.',
      },
      {
        addPm: 1,
        text: 'aumenta o dano de luz em +1d6.',
      },
    ],
  },
  [spellsCircle3Names.dispersarAsTrevas]: {
    spellCircle: spellsCircles.c3,
    nome: 'Dispersar as Trevas',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Esfera de 6m de raio',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus nas resistências em +1.',
      },
      {
        addPm: 4,
        text: 'muda o alcance para curto, a área para alvo 1 criatura e a duração para cena. O alvo fica imune a efeitos de necromancia e trevas.',
      },
      {
        addPm: 4,
        text: 'muda o círculo máximo de magias dissipadas para 4º. Requer 4º círculo.',
      },
      {
        addPm: 9,
        text: 'muda o círculo máximo de magias dissipadas para 5º. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle3Names.soproDaSalvacao]: {
    spellCircle: spellsCircles.c3,
    nome: 'Sopro da Salvação',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Cone de 9m',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta a quantidade de cura em 1d8+2.',
      },
      {
        addPm: 4,
        text: 'além do normal, se um aliado estiver com PV negativos, seus PV são levados a 0 e então a cura é aplicada.',
      },
      {
        addPm: 4,
        text: 'remove todas as condições listadas, em vez de apenas uma.',
      },
    ],
  },
  [spellsCircle3Names.anularALuz]: {
    spellCircle: spellsCircles.c3,
    nome: 'Anular a Luz',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Área de 6m de raio',
    duracao: 'Ver texto',
    resistencia: '',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus na Defesa em +1.',
      },
      {
        addPm: 4,
        text: 'muda o círculo máximo de magias dissipadas para 4º.',
      },
      {
        addPm: 9,
        text: 'muda o círculo máximo de magias dissipadas para 5º.',
      },
    ],
  },
  [spellsCircle3Names.poeiraDaPodridao]: {
    spellCircle: spellsCircles.c3,
    nome: 'Poeira da Podridão',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Nuvem com 6m de raio',
    duracao: 'Cena',
    resistencia: 'Fortitude',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em 1d8+4.',
      },
    ],
  },
  [spellsCircle3Names.servoMortoVivo]: {
    spellCircle: spellsCircles.c3,
    nome: 'Servo Morto-Vivo',
    execucao: 'Completa',
    alcance: 'Toque',
    alvo: '1 cadáver',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda o componente material para pó de ônix negro (T$ 500). Em vez de um zumbi ou esqueleto, cria um carniçal. Ele pode funcionar como um aliado veterano, escolhido entre ajudante, atirador, combatente, fortão ou guardião. O resto segue normal.',
      },
      {
        addPm: 3,
        text: 'muda o componente material para pó de ônix negro (T$ 500). Em vez de um zumbi ou esqueleto, cria uma sombra. Ela pode funcionar como um aliado veterano, escolhido entre assassino, combatente ou perseguidor. O restante da magia segue normal.',
      },
      {
        addPm: 7,
        text: 'muda o componente material para ferramentas de embalsamar (T$ 1.000). Em vez de um zumbi ou esqueleto, cria uma múmia. Ela pode funcionar como um aliado mestre, escolhido entre ajudante, destruidor, guardião ou médico. O restante da magia segue normal. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle3Names.controlarAgua]: {
    spellCircle: spellsCircles.c3,
    nome: 'Controlar Água',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: 'Esfera com 30m de raio',
    duracao: 'Cena',
    resistencia: 'Ver texto',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +2d8.',
      },
    ],
  },
  [spellsCircle3Names.controlarTerra]: {
    spellCircle: spellsCircles.c3,
    nome: 'Controlar Terra',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: '9 cubos com 1,5 metros de lado',
    duracao: 'Instantânea',
    resistencia: 'Ver texto',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o número de cubos de 1,5m em +2.',
      },
      {
        addPm: 1,
        text: 'muda o alcance para pessoal, o alvo para você e a duração para 1 dia. Você e seu equipamento fundem-se a uma superfície ou objeto adjacente feito de pedra, terra, argila ou areia que possa acomodá-lo. Você pode voltar ao espaço adjacente como uma ação livre, dissipando a magia. Enquanto mesclado, você não pode falar ou fazer ações físicas, mas consegue perceber seus arredores normalmente. Pequenos danos não o afetam, mas se o objeto (ou o trecho onde você está imerso) for destruído, a magia é dissipada, você volta a um espaço livre adjacente e sofre 10d6 pontos de dano de impacto.',
      },
    ],
  },
  [spellsCircle3Names.potenciaDivina]: {
    spellCircle: spellsCircles.c3,
    nome: 'Potência Divina',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus de Força em +2.',
      },
      {
        addPm: 2,
        text: 'aumenta a resistência a dano em +2.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura. A magia falha se o alvo não seguir a mesma divindade que você.',
      },
    ],
  },
};

export const spellsCircle4: Record<spellsCircle4Names, Spell> = {
  [spellsCircle4Names.campoAntimagia]: {
    spellCircle: spellsCircles.c4,
    nome: 'Campo Antimagia',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Abjur',
  },
  [spellsCircle4Names.libertacao]: {
    spellCircle: spellsCircles.c4,
    nome: 'Libertação',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'além do normal, o alvo pode caminhar sobre a água ou outros líquidos com seu deslocamento normal. Entretanto, isso não protege contra qualquer efeito que o líquido possa causar (o alvo pode andar sobre lava, mas ainda vai sofrer dano).',
      },
      {
        addPm: 2,
        text: 'além do normal, o alvo pode escolher 20 em todos os testes de Atletismo.',
      },
      {
        addPm: 2,
        text: 'além do normal, o alvo pode escolher 20 em todos os testes de Acrobacia e pode fazer todas as manobras desta perícia mesmo sem treinamento.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para curto e o alvo para até 5 criaturas.',
      },
      {
        addPm: 5,
        text: 'pode dissipar Aprisionamento.',
      },
    ],
  },
  [spellsCircle4Names.sonho]: {
    spellCircle: spellsCircles.c4,
    nome: 'Sonho',
    execucao: '10 minutos',
    alcance: 'Ilimitado',
    alvo: '1 criatura viva',
    duracao: 'Veja o texto',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'transforma o sonho do alvo em um pesadelo. A vítima deve fazer um teste de Vontade. Se falhar, não recupera PV ou PM pela noite, sofre 1d10 pontos de dano de trevas e acorda fatigada. A vítima recebe bônus ou penalidades em seu teste de resistência, dependendo do conhecimento que você tiver dela. Use os mesmos modificadores da magia Vidência.',
      },
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1. Todos os alvos compartilham um mesmo sonho (ou pesadelo) entre si e com você.',
      },
    ],
  },
  [spellsCircle4Names.visaoDaVerdade]: {
    spellCircle: spellsCircles.c4,
    nome: 'Visão da Verdade',
    execucao: 'Movimento',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para toque e o alvo para 1 criatura.',
      },
      {
        addPm: 1,
        text: 'além do normal, o alvo fica com sentidos apurados; ele recebe +10 em todos os testes de Percepção.',
      },
      {
        addPm: 2,
        text: 'além do normal, o alvo escuta falsidades; ele recebe +10 em todos os testes de Intuição.',
      },
      {
        addPm: 4,
        text: 'além do normal, o alvo enxerga através de paredes e barreiras com 30cm de espessura ou menos (as paredes e barreiras parecem translúcidas).',
      },
    ],
  },
  [spellsCircle4Names.conjurarElemental]: {
    spellCircle: spellsCircles.c4,
    nome: 'Conjurar Elemental',
    execucao: 'Completa',
    alcance: 'Médio',
    alvo: '',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'o elemental muda para Enorme e recebe dois tipos de aliado indicados no seu elemento.',
      },
      {
        addPm: 5,
        text: 'você convoca um elemental de cada tipo. Você pode ordenar que cada elemental auxilie você ou seus aliados. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle4Names.maoPoderosaDeTalude]: {
    spellCircle: spellsCircles.c4,
    nome: 'Mão Poderosa de Talude',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o bônus dos testes em +5 e o dano de impacto em +1d6+6.',
      },
    ],
  },
  [spellsCircle4Names.viagemPlanar]: {
    spellCircle: spellsCircles.c4,
    nome: 'Viagem Planar',
    execucao: 'Completa',
    alcance: 'Toque',
    alvo: 'Pessoal',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alvo para até cinco criaturas voluntárias que você esteja tocando.',
      },
    ],
  },
  [spellsCircle4Names.alterarMemoria]: {
    spellCircle: spellsCircles.c4,
    nome: 'Alterar Memória',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Vontade anula',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para cone de 4,5m e o alvo para criaturas na área.',
      },
      {
        addPm: 5,
        text: 'você pode alterar ou apagar as memórias das últimas 24 horas.',
      },
    ],
  },
  [spellsCircle4Names.marionete]: {
    spellCircle: spellsCircles.c4,
    nome: 'Marionete',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura',
    duracao: 'Sustentada',
    resistencia: 'Fortitude Anula',
    school: 'Encan',
  },
  [spellsCircle4Names.raioPolar]: {
    spellCircle: spellsCircles.c4,
    nome: 'Raio Polar',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude Parcial',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o dano em +2d8.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para área de explosão de 6m de raio. Em vez de um raio, você dispara uma esfera de gelo que explode, causando o efeito da magia em todas as criaturas na área.',
      },
    ],
  },
  [spellsCircle4Names.relampagoFlamejanteDeReynard]: {
    spellCircle: spellsCircles.c4,
    nome: 'Relâmpago Flamejante de Reynard',
    execucao: 'Duas rodadas',
    alcance: 'Médio',
    alvo: '',
    duracao: 'Sustentada',
    resistencia: 'Reflexos reduz à metade',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'aumenta o dano das rajadas em +1d6 e o dano da rajada mista em +2d12.',
      },
    ],
  },
  [spellsCircle4Names.talhoInvisivelDeEdauros]: {
    spellCircle: spellsCircles.c4,
    nome: 'Talho Invisível de Edauros',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Cone',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +2d8.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para você e a duração para sustentada. Uma vez por rodada, como uma ação padrão, você pode disparar uma lâmina de ar contra um alvo em alcance médio, causando 6d8 pontos de dano de corte (Fortitude reduz à metade).',
      },
    ],
  },
  [spellsCircle4Names.duplicataIlusoria]: {
    spellCircle: spellsCircles.c4,
    nome: 'Duplicata Ilusória',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '',
    duracao: 'Cena',
    resistencia: '',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'cria uma cópia adicional.',
      },
    ],
  },
  [spellsCircle4Names.explosaoCaleidospica]: {
    spellCircle: spellsCircles.c4,
    nome: 'Explosão Caleidoscópica',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Esfera de 6m',
    duracao: 'Instantânea',
    resistencia: 'Fortitude Parcial',
    school: 'Ilusão',
  },
  [spellsCircle4Names.assassinoFantasmagorico]: {
    spellCircle: spellsCircles.c4,
    nome: 'Assassino Fantasmagórico',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: '1 criatura',
    duracao: 'Cena, até ser descarregada',
    resistencia: 'Vontade parcial, Fortitude Parcial',
    school: 'Necro',
  },
  [spellsCircle4Names.muralhaDeOssos]: {
    spellCircle: spellsCircles.c4,
    nome: 'Muralha de Ossos',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '',
    duracao: 'Cena',
    resistencia: '',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o comprimento em +15m e altura em +3m (máximo de 60m de comprimento e 9m de altura).',
      },
      {
        addPm: 5,
        text: 'o muro é feito de uma massa de esqueletos animados. Quando você lança a magia e no início de cada um de seus turnos, todos os inimigos adjacentes à muralha sofrem 4d8 pontos de dano de corte e devem fazer um teste de Reflexos. Se falharem, são agarrados pela muralha. Uma criatura agarrada pode gastar uma ação padrão para fazer um teste de Acrobacia ou Atletismo para se soltar.',
      },
    ],
  },
  [spellsCircle4Names.animarObjetos]: {
    spellCircle: spellsCircles.c4,
    nome: 'Animar Objetos',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Até 8 objetos Minúsculos ou Pequenos, 4 objetos Médios, 2 objetos Grandes ou 1 objeto Enorme',
    duracao: 'Cena',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'muda a duração para permanente e adiciona componente material (prataria no valor de T$ 1.000). Você pode ter um máximo de objetos animados igual à metade do seu nível.',
      },
    ],
  },
  [spellsCircle4Names.controlarAGravidade]: {
    spellCircle: spellsCircles.c4,
    nome: 'Controlar a Gravidade',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Cubo de 12m de lado',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Trans',
  },
  [spellsCircle4Names.desintegrar]: {
    spellCircle: spellsCircles.c4,
    nome: 'Desintegrar',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura ou objeto',
    duracao: 'Instantânea',
    resistencia: 'Fortitude Parcial',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'aumenta o dano total em +2d12 e o dano mínimo em +1d12.',
      },
    ],
  },
  [spellsCircle4Names.formaEterea]: {
    spellCircle: spellsCircles.c4,
    nome: 'Forma Etérea',
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'muda o alcance para toque e o alvo para até 5 criaturas voluntárias que estejam de mãos dadas. Depois que a magia é lançada, as criaturas podem soltar as mãos. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle4Names.cupulaDeRepulsao]: {
    spellCircle: spellsCircles.c4,
    nome: 'Cúpula de Repulsão',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'você pode se aproximar sem romper a cúpula.',
      },
      {
        addPm: 4,
        text: 'como normal, mas você pode escolher um tipo de criaturas sem limitação (todos os animais, todos os monstros etc.).',
      },
      {
        addPm: 9,
        text: 'muda a duração para sustentada. Além do normal, qualquer ataque, magia ou habilidade de uma criatura afetada é desviado pelo efeito e não o atinge. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle4Names.premonicao]: {
    spellCircle: spellsCircles.c4,
    nome: 'Premonição',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda a execução para reação, o alcance para curto, o alvo para 1 criatura e a duração para instantânea. Esta magia só pode ser usada em uma criatura que tenha acabado de fazer um teste. Obriga a criatura a fazer uma nova rolagem de dados e aceitar o novo resultado, seja ele um sucesso ou falha. Criaturas involuntárias têm direito a um teste de Vontade para negar o efeito.',
      },
      {
        addPm: 5,
        text: 'muda a duração para 1 dia.',
      },
    ],
  },
  [spellsCircle4Names.guardiaoDivino]: {
    spellCircle: spellsCircles.c4,
    nome: 'Guardião Divino',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '',
    duracao: 'Cena ou até ser descarregado',
    resistencia: '',
    school: 'Conv',
  },
  [spellsCircle4Names.concederMilagre]: {
    spellCircle: spellsCircles.c4,
    nome: 'Conceder Milagre',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Até ser descarregada',
    resistencia: '',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda o círculo da magia concedida para 3º e a penalidade de PM para –6.',
      },
    ],
  },
  [spellsCircle4Names.circuloDaRestauracao]: {
    spellCircle: spellsCircles.c4,
    nome: 'Círculo da Restauração',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Círculo de 3m de raio',
    duracao: '5 rodadas',
    resistencia: '',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta a regeneração de PV em 1d8+1.',
      },
    ],
  },
  [spellsCircle4Names.coleraDeAzguer]: {
    spellCircle: spellsCircles.c4,
    nome: 'Cólera de Azgher',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Esfera com 6m de raio',
    duracao: 'Instantânea',
    resistencia: 'Reflexos Parcial',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +2d6 (+2d8 contra mortos-vivos).',
      },
      {
        addPm: 2,
        text: 'aumenta a área em +6m de raio.',
      },
      {
        addPm: 5,
        text: 'a luz purificadora do Deus-Sol dissipa todas as magias de necromancia ativas na área. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle4Names.mantoDoCruzado]: {
    spellCircle: spellsCircles.c4,
    nome: 'Manto do Cruzado',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Evoc',
  },
  [spellsCircle4Names.terremoto]: {
    spellCircle: spellsCircles.c4,
    nome: 'Terremoto',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: 'Dispersão com 30m de raio',
    duracao: '1 rodada',
    resistencia: 'Veja o texto',
    school: 'Evoc',
  },
  [spellsCircle4Names.ligacaoSombria]: {
    spellCircle: spellsCircles.c4,
    nome: 'Ligação Sombria',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: '1 criatura',
    duracao: '1 dia',
    resistencia: 'Fortitude Anula',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'além do normal, o alvo também pode morrer por perda de PV ou se você morrer (um teste de Fortitude anula a morte).',
      },
    ],
  },
  [spellsCircle4Names.controlarOClima]: {
    spellCircle: spellsCircles.c4,
    nome: 'Controlar o Clima',
    execucao: 'Completa',
    alcance: '2km',
    alvo: 'Círculo com 2km de raio',
    duracao: '4d12 horas',
    resistencia: '',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: '(APENAS DRUIDAS) muda o raio da área para 3km e duração para 1d4 dias.',
      },
    ],
  },
};

export const spellsCircle5: Record<spellsCircle5Names, Spell> = {
  [spellsCircle5Names.auraDivina]: {
    spellCircle: spellsCircles.c5,
    nome: 'Aura Divina',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Emanação de 9m de raio',
    duracao: 'Cena',
    resistencia: 'Vontade Parcial',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta os bônus na Defesa e em testes de resistência em +1.',
      },
    ],
  },
  [spellsCircle5Names.invulnerabilidade]: {
    spellCircle: spellsCircles.c5,
    nome: 'Invulnerabilidade',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'muda o alcance para curto e o alvo para 1 criatura.',
      },
    ],
  },
  [spellsCircle5Names.lagrimasDeWynna]: {
    spellCircle: spellsCircles.c5,
    nome: 'Lágrimas de Wynna',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Vontade Parcial',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda a área para círculo de 6m de raio e o alvo para criaturas escolhidas.',
      },
      {
        addPm: 5,
        text: 'muda a execução para 1 dia e adiciona custo adicional (sacrifício de 1 PM). O alvo da magia precisa ser mantido em alcance curto do conjurador durante toda a execução. Ao término, faz um teste de Vontade. Se falhar, perde a habilidade de lançar magias arcanas permanentemente. Se passar, resiste, mas ainda pode ser alvo da magia no dia seguinte. Nenhum poder mortal é capaz de reverter essa perda. Os clérigos de Wynna dizem que a deusa chora cada vez que este ritual é realizado.',
      },
    ],
  },
  [spellsCircle5Names.projetarCosciencia]: {
    spellCircle: spellsCircles.c5,
    nome: 'Projetar Consciência',
    execucao: 'Padrão',
    alcance: 'Ilimitado (veja o texto)',
    alvo: 'Local ou criatura conhecidos',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Adiv',
    aprimoramentos: [
      {
        addPm: 10,
        text: 'além do normal, sua projeção é capaz de lançar magias que não precisem de componentes materiais e tenham duração diferente de sustentada. Sua forma fantasmagórica funciona como na magia Forma Etérea, sendo afetada por magias de abjuração e essência, mas as magias que ela lança podem afetar criaturas corpóreas.',
      },
    ],
  },
  [spellsCircle5Names.buracoNegro]: {
    spellCircle: spellsCircles.c5,
    nome: 'Buraco Negro',
    execucao: 'Completa',
    alcance: 'Longo',
    alvo: '',
    duracao: '3 rodadas',
    resistencia: 'Fortitude Parcial',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'muda o efeito para que você não seja afetado.',
      },
      {
        addPm: 10,
        text: 'muda o efeito para que criaturas escolhidas dentro do alcance não sejam afetadas.',
      },
    ],
  },
  [spellsCircle5Names.intervencaoDivina]: {
    spellCircle: spellsCircles.c5,
    nome: 'Intervenção Divina',
    execucao: 'Completa',
    alcance: 'Veja o texto',
    alvo: 'Veja o texto',
    duracao: 'Veja o texto',
    resistencia: 'Veja o texto',
    school: 'Conv',
  },
  [spellsCircle5Names.palavraPrimordial]: {
    spellCircle: spellsCircles.c5,
    nome: 'Palavra Primordial',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura com menos níveis do que você',
    duracao: 'Instantânea',
    resistencia: 'Vontade Parcial',
    school: 'Encan',
  },
  [spellsCircle5Names.furiaDoPanteao]: {
    spellCircle: spellsCircles.c5,
    nome: 'Fúria do Panteão',
    execucao: 'Completa',
    alcance: 'Longo',
    alvo: 'Nuvem de tempestade com 90m de lado',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Evoc',
  },
  [spellsCircle5Names.segundaChance]: {
    spellCircle: spellsCircles.c5,
    nome: 'Segunda Chance',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta a cura em +20 PV.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para curto e o alvo para até 5 criaturas.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para uma criatura que tenha morrido há até uma rodada. Esta magia pode curá-la',
      },
    ],
  },
  [spellsCircle5Names.reanimacaoImpura]: {
    spellCircle: spellsCircles.c5,
    nome: 'Reanimação Impura',
    execucao: 'Completa',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: '',
    school: 'Necro',
  },
  [spellsCircle5Names.roubarAAlma]: {
    spellCircle: spellsCircles.c5,
    nome: 'Roubar a Alma',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Permanente',
    resistencia: 'Vontade Parcial',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'o objeto que abriga a alma detém os mesmos PM totais que o alvo. Se estiver empunhando o objeto, você pode usar esses PM para lançar magias no lugar dos seus. O objeto recupera PM por dia como se o personagem estivesse em descanso normal.',
      },
      {
        addPm: 10,
        text: 'como uma reação ao lançar esta magia, você possui o corpo sem alma do alvo, como na magia Possessão (mesmo que não conheça a magia).',
      },
    ],
  },
  [spellsCircle5Names.toqueDaMorte]: {
    spellCircle: spellsCircles.c5,
    nome: 'Toque da Morte',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude Parcial',
    school: 'Necro',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para curto. Em vez de tocar no alvo, você dispara um raio púrpura da ponta de seu dedo indicador.',
      },
      {
        addPm: 10,
        text: 'muda o alcance para curto e o alvo para inimigos no alcance. Em vez de tocar no alvo, você dispara raios púrpuras da ponta de seus dedos.',
      },
    ],
  },
  [spellsCircle5Names.aprisionamento]: {
    spellCircle: spellsCircles.c5,
    nome: 'Aprisionamento',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Permanente',
    resistencia: 'Vontade anula',
    school: 'Abjur',
  },
  [spellsCircle5Names.engenhoDeMana]: {
    spellCircle: spellsCircles.c5,
    nome: 'Engenho de Mana',
    execucao: 'padrão',
    alcance: 'Médio',
    alvo: 'Disco de Energia com 1,5m',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Abjur',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'em vez de flutuar no ponto em que foi conjurado, o disco flutua atrás de você, mantendo-se sempre adjacente.',
      },
      {
        addPm: 4,
        text: 'muda a duração para 1 dia.',
      },
    ],
  },
  [spellsCircle5Names.alterarDestino]: {
    spellCircle: spellsCircles.c5,
    nome: 'Alterar Destino',
    execucao: 'Reação',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Adiv',
  },
  [spellsCircle5Names.chuvaDeMeteoros]: {
    spellCircle: spellsCircles.c5,
    nome: 'Chuva de Meteoros',
    execucao: 'Completa',
    alcance: 'Longo',
    alvo: 'Explosão com 9m de raio',
    duracao: 'Instantânea',
    resistencia: 'Reflexos reduz à metade',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'criaturas que falhem no teste de resistência ficam caídas e presas sob os escombros (agarradas). Uma criatura agarrada pode escapar gastando uma ação padrão e passando em um teste de Atletismo. Toda a área afetada fica coberta de escombros, sendo considerada terreno difícil.',
      },
      {
        addPm: 10,
        text: 'aumenta o número de meteoros em +1. Os meteoros podem cair na mesma área, para acumular o dano (uma criatura atingida por dois meteoros, por exemplo, sofre 40d6 pontos de dano) ou em uma área diferente (mas ainda dentro do alcance) para afetar mais alvos.',
      },
    ],
  },
  [spellsCircle5Names.semiplano]: {
    spellCircle: spellsCircles.c5,
    nome: 'Semiplano',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: '',
    duracao: '1 dia',
    resistencia: '',
    school: 'Conv',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'adiciona alvo (1 criatura). Você cria uma semiplano labiríntico e expulsa o alvo para ele. A cada rodada, a vítima tem direito a um teste de Inteligência (CD 30), com bônus cumulativo de +1 para cada teste já realizado, para escapar do labirinto. Quando o alvo escapa, a magia termina e o alvo reaparece no plano material no mesmo local onde estava quando a magia foi lançada. Magias como Salto Dimensional e Teletransporte não ajudam a escapar do labirinto, mas Viagem Planar, sim.',
      },
      {
        addPm: 5,
        text: 'muda a duração para permanente e adiciona componente material (diorama do semiplano feito de materiais preciosos no valor de T$ 5.000). Você pode lançar a magia diversas vezes para aumentar as dimensões do semiplano em +30m de lado a cada vez.',
      },
    ],
  },
  [spellsCircle5Names.legiao]: {
    spellCircle: spellsCircles.c5,
    nome: 'Legião',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Até 10 criaturas na área',
    duracao: 'Sustentada',
    resistencia: 'Vontade Parcial',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1.',
      },
    ],
  },
  [spellsCircle5Names.possessao]: {
    spellCircle: spellsCircles.c5,
    nome: 'Possessão',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: '1 criatura',
    duracao: '1 dia',
    resistencia: 'Vontade anula',
    school: 'Encan',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'você ganha acesso às habilidades de raça e classe da criatura.',
      },
      {
        addPm: 5,
        text: 'enquanto a magia durar e você estiver dentro do alcance do seu corpo original, pode “saltar” de uma criatura possuída para outra. O novo alvo tem direito a um teste de Vontade. Se falhar, você assume o controle do corpo dele e o alvo anterior recobra a consciência.',
      },
      {
        addPm: 5,
        text: 'muda a duração para permanente, mas destrói seu corpo original no processo. Uma criatura possuída pode fazer um teste de Vontade no começo do dia para retomar seu corpo. Se passar, recobra a consciência (e a sua própria consciência fica inerte). O teste se repete no início de cada dia. Se o corpo de uma criatura possuída morrer e houver outra criatura em alcance curto, você pode tentar possuí-la como uma reação. Enquanto houver novos corpos para possuir, você é imortal!',
      },
    ],
  },
  [spellsCircle5Names.barragemElementalDeVectorius]: {
    spellCircle: spellsCircles.c5,
    nome: 'Barragem Elemental de Vectorius',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: '4 esferas elementais',
    duracao: 'Instantânea',
    resistencia: 'Reflexos parcial',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'aumenta o dano de cada esfera em +2d6.',
      },
      {
        addPm: 5,
        text: 'muda o tipo de dano de todas as esferas para essência (mas elas ainda causam os outros efeitos como se seu tipo de dano não mudasse).',
      },
    ],
  },
  [spellsCircle5Names.deflagracaoDeMana]: {
    spellCircle: spellsCircles.c5,
    nome: 'Deflagração de Mana',
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Explosão de 15m de raio',
    duracao: '',
    resistencia: 'Fortitude Parcial',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em 10',
      },
      {
        addPm: 5,
        text: 'afeta apenas criaturas a sua escolha.',
      },
    ],
  },
  [spellsCircle5Names.mataDragao]: {
    spellCircle: spellsCircles.c5,
    nome: 'Mata-Dragão',
    execucao: 'Duas rodadas',
    alcance: 'Pessoal',
    alvo: 'Cone de 30m',
    duracao: 'Instantânea',
    resistencia: 'Reflexos reduz à metade',
    school: 'Evoc',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em 1d12.',
      },
    ],
  },
  [spellsCircle5Names.requiem]: {
    spellCircle: spellsCircles.c5,
    nome: 'Réquiem',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas',
    duracao: 'Sustentada',
    resistencia: 'Vontade Anula',
    school: 'Ilusão',
  },
  [spellsCircle5Names.sombraAssassina]: {
    spellCircle: spellsCircles.c5,
    nome: 'Sombra Assassina',
    execucao: 'Padrãp',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade Parcial',
    school: 'Ilusão',
    aprimoramentos: [
      {
        addPm: 10,
        text: 'muda o alvo para criaturas escolhidas na área.',
      },
    ],
  },
  [spellsCircle5Names.controlarOTempo]: {
    spellCircle: spellsCircles.c5,
    nome: 'Controlar o Tempo',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Veja o texto',
    duracao: 'Veja o texto',
    resistencia: '',
    school: 'Trans',
  },
  [spellsCircle5Names.desejo]: {
    spellCircle: spellsCircles.c5,
    nome: 'Desejo',
    execucao: 'Completa',
    alcance: 'Veja o texto',
    alvo: 'Veja o texto',
    duracao: 'Veja o texto',
    resistencia: 'Veja o texto',
    school: 'Trans',
  },
};

function cheapenSpell(
  spells: Spell[],
  index: number,
  manaReduction = 1
): {
  spells: Spell[];
  stepValue?: string;
} {
  const spellsToChange = spells;
  const { manaReduction: actualManaReduction = 0 } = spells[index];

  if (actualManaReduction < manaReduction) {
    spellsToChange[index] = {
      ...spells[index],
      manaReduction,
    };

    return {
      spells: spellsToChange,
      stepValue: `Redução de mana -${manaReduction} (${spellsToChange[index].nome})`,
    };
  }

  return {
    spells,
  };
}

export function addOrCheapenSpell(
  sheet: CharacterSheet,
  spell: Spell,
  customKeyAttr?: Atributo
): {
  spells: Spell[];
  stepValue?: string;
} {
  const index = sheet.spells.findIndex(
    (sheetSpell) => spell.nome === sheetSpell.nome
  );

  const spellClone = cloneDeep(spell);

  const spellToAdd = customKeyAttr
    ? { ...spellClone, customKeyAttr }
    : spellClone;

  if (index < 0) {
    return {
      spells: [...sheet.spells, spellToAdd],
      stepValue: `Adicionou magia ${spellToAdd.nome}`,
    };
  }

  return cheapenSpell(sheet.spells, index);
}

function getRandomSpells(allowedSpells: Spell[], qtd: number) {
  return pickFromArray(allowedSpells, qtd);
}

export function addOrCheapenRandomSpells(
  sheet: CharacterSheet,
  substeps: SubStep[],
  allowedSpells: Spell[],
  stepName: string,
  customKeyAttr: Atributo,
  qtd = 2
): void {
  const sheetToChange = sheet;
  const randomSpells = getRandomSpells(allowedSpells, qtd);

  randomSpells.forEach((randomSpell) => {
    const { spells, stepValue } = addOrCheapenSpell(
      sheet,
      randomSpell,
      customKeyAttr
    );

    sheetToChange.spells = spells;

    if (stepValue) {
      substeps.push({
        name: stepName,
        value: stepValue,
      });
    }
  });
}

export function getSpellsOfCircle(circle: number): Spell[] {
  if (circle === 1) {
    return Object.values(spellsCircle1);
  }
  if (circle === 2) {
    return Object.values(spellsCircle2);
  }
  if (circle === 3) {
    return Object.values(spellsCircle3);
  }
  if (circle === 4) {
    return Object.values(spellsCircle4);
  }
  if (circle === 5) {
    return Object.values(spellsCircle5);
  }
  return [];
}

export function allSpellsUpToCircle(circle: number): Spell[] {
  if (circle === 1) {
    return Object.values(spellsCircle1);
  }
  if (circle === 2) {
    return [...Object.values(spellsCircle1), ...Object.values(spellsCircle2)];
  }
  if (circle === 3) {
    return [
      ...Object.values(spellsCircle1),
      ...Object.values(spellsCircle2),
      ...Object.values(spellsCircle3),
    ];
  }
  if (circle === 4) {
    return [
      ...Object.values(spellsCircle1),
      ...Object.values(spellsCircle2),
      ...Object.values(spellsCircle3),
      ...Object.values(spellsCircle4),
    ];
  }
  if (circle === 5) {
    return [
      ...Object.values(spellsCircle1),
      ...Object.values(spellsCircle2),
      ...Object.values(spellsCircle3),
      ...Object.values(spellsCircle4),
      ...Object.values(spellsCircle5),
    ];
  }
  return [];
}
