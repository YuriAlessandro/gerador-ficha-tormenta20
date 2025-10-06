import { cloneDeep } from 'lodash';
import { pickFromArray } from '../../../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../../../interfaces/CharacterSheet';
import { Spell, spellsCircles } from '../../../../interfaces/Spells';
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
    description:
      'Você purifica e abençoa uma porção de comida ou dose de bebida. Isso torna um alimento sujo, estragado ou envenenado próprio para consumo. Além disso, se for consumido até o final da duração, o alimento oferece 5 PV temporários ou 1 PM temporário (além de quaisquer bônus que já oferecesse). Bônus de alimentação duram um dia e cada personagem só pode receber um bônus de alimentação por dia.',

    aprimoramentos: [
      {
        addPm: 0,
        text: 'o alimento é purificado (não causa nenhum efeito nocivo se estava estragado ou envenenado), mas não fornece bônus ao ser consumido.',
      },
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 1,
        text: 'muda a duração para permanente, o alvo para 1 frasco com água e adiciona componente material (pó de prata no valor de T$ 5). Em vez do normal, cria um frasco de água benta.',
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
    description:
      'O animal fica prestativo em relação a você. Ele não fica sob seu controle, mas percebe suas palavras e ações da maneira mais favorável possível. Você recebe +10 nos testes de Adestramento e Diplomacia que fizer contra o animal. Um alvo hostil ou que esteja envolvido em um combate recebe +5 em seu teste de resistência. Se você ou seus aliados tomarem qualquer ação hostil contra o alvo, a magia é dissipada e ele retorna à atitude que tinha antes (ou piorada, de acordo com o mestre). Se tratar bem o alvo, a atitude pode permanecer mesmo após o término da magia.',
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
    description:
      'Você manifesta e dispara uma adaga imaterial contra a mente do alvo, que sofre 2d6 pontos de dano psíquico e fica atordoado por uma rodada. Se passar no teste de resistência, sofre apenas metade do dano e evita a condição. Uma criatura só pode ficar atordoada por esta magia uma vez por cena.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'você lança a magia sem gesticular ou pronunciar palavras (o que permite lançar esta magia de armadura) e a adaga se torna invisível. Se o alvo falhar no teste de resistência, não percebe que você lançou uma magia contra ele.',
      },
      {
        addPm: 2,
        text: 'muda a duração para um dia. Além do normal, você “finca” a adaga na mente do alvo. Enquanto a magia durar, você sabe a direção e localização do alvo, desde que ele esteja no mesmo mundo.',
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
    description:
      'Você cria uma barreira protetora invisível que detecta qualquer criatura que tocar ou entrar na área protegida. Ao lançar a magia, você pode escolher quais criaturas podem entrar na área sem ativar seus efeitos. Alarme pode emitir um aviso telepático ou sonoro, decidido quando a magia é lançada. Um aviso telepático alerta apenas você, inclusive acordando-o se estiver dormindo, mas apenas se estiver a até 1km da área protegida. Um aviso sonoro alerta todas as criaturas em alcance longo.',
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
        addPm: 9,
        text: 'muda a duração para um dia ou até ser descarregada e a resistência para Vontade anula. Quando um intruso entra na área, você pode descarregar a magia. Se o intruso falhar na resistência, ficará paralisado por 1d4 rodadas. Além disso, pelas próximas 24 horas você e as criaturas escolhidas ganham +10 em testes de Sobrevivência para rastrear o intruso.',
      },
    ],
  },
  [spellsCircle1Names.amedrontar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Amedrontar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    school: 'Necro',
    description:
      'O alvo é envolvido por energias sombrias e assustadoras. Se falhar na resistência, fica apavorado por 1 rodada, depois abalado. Se passar, fica abalado por 1d4 rodadas.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'alvos que falhem na resistência ficam apavorados por 1d4+1 rodadas, em vez de apenas 1.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para 1 criatura.',
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
    area: 'Quadrado de 3m',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Reflexos (veja texto)',
    school: 'Conv',
    description:
      'Esta magia recobre uma superfície com uma substância gordurosa e escorregadia. Criaturas na área devem passar na resistência para não cair. Nas rodadas seguintes, criaturas que tentem movimentar-se pela área devem fazer testes de Acrobacia para equilíbrio (CD 10). Área Escorregadia pode tornar um escorregadio. Uma criatura segurando um objeto afetado deve passar na resistência para não deixar o cair cada vez que usá-lo.',
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
    description:
      'Você invoca a arma preferida de sua divindade (caso sua divindade possua uma), que surge flutuando a seu lado. Uma vez por rodada, quando você sofre um ataque corpo a corpo, pode usar uma reação para que a arma cause automaticamente 2d6 pontos de dano do tipo da arma — por exemplo, uma espada longa causa dano de corte — no oponente que fez o ataque. Esta magia se dissipa se você morrer.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, a arma o protege. Você recebe +1 na Defesa.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus na Defesa em +1.',
      },
      {
        addPm: 2,
        text: 'muda a duração para sustentada. Além do normal, uma vez por rodada, você pode gastar uma ação livre para fazer a arma acertar automaticamente um alvo adjacente. Se a arma atacar, não poderá contra-atacar até seu próximo turno. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'muda o tipo do dano para essência. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano causado pela arma em +1d6 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
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
    alvo: '1 arma empunhada',
    duracao: 'Cena',
    school: 'Trans',
    description:
      'A arma é considerada mágica e fornece +1 nos testes de ataque e rolagens de dano (isso conta como um bônus de encanto). Caso você esteja empunhando a arma, pode usar seu atributo-chave de magias em vez do atributo original nos testes de ataque (não cumulativo com efeitos que somam este atributo).',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: 'a arma causa +1d6 de dano de ácido, eletricidade, fogo ou frio, escolhido quando a magia é lançada. Este aprimoramento só pode ser usado uma vez.',
      },
      {
        addPm: 3,
        text: 'muda o bônus de dano do aprimoramento acima para +2d6.',
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
    description:
      'Esta magia cria uma película protetora invisível, mas tangível, fornecendo +5 na Defesa. Esse bônus é cumulativo com outras magias, mas não com bônus fornecido por armaduras.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a execução para reação. Em vez do normal, você cria um escudo mágico que fornece +5 na Defesa contra o próximo ataque que sofrer (cumulativo com o bônus fornecido pelo efeito básico desta magia e armaduras).',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus na Defesa em +1.',
      },
      {
        addPm: 2,
        text: 'muda a duração para um dia.',
      },
    ],
  },
  [spellsCircle1Names.armamentoDaNatureza]: {
    spellCircle: spellsCircles.c1,
    nome: 'Armamento da Natureza',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma  (veja texto)',
    duracao: 'Cena',
    school: 'Trans',
    description:
      'Você fortalece uma arma mundana primitiva (sem custo em T$, como bordão, clava, funda ou tacape), uma arma natural ou um ataque desarmado. O dano da arma aumenta em um passo e ela é considerada mágica. Ao lançar a magia, você pode mudar o tipo de dano da arma (escolhendo entre corte, impacto ou perfuração).',
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
        addPm: 3,
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
    description:
      'Envia um aviso telepático para uma criatura, mesmo que não possa vê-la nem tenha linha de efeito. Escolha um na pág. 182.',
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
        text: 'aumenta o número de alvos em +1.',
      },
    ],
  },
  [spellsCircle1Names.bencao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Bênção',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Aliados',
    duracao: 'Cena',
    school: 'Encan',
    description:
      'Abençoa seus aliados, que recebem +1 em testes de ataque e rolagens de dano. Bênção anula Perdição.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para 1 cadáver e a duração para 1 semana. O cadáver não se decompõe nem pode ser transformado em morto-vivo.',
      },
      {
        addPm: 2,
        text: 'aumenta os bônus em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
    ],
  },
  [spellsCircle1Names.caminhosDaNatureza]: {
    spellCircle: spellsCircles.c1,
    nome: 'Caminhos da Natureza',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhida',
    duracao: '1 dia',
    school: 'Conv',
    description:
      'Você invoca espíritos da natureza, pedindo que eles abram seu caminho. As criaturas afetadas recebem deslocamento +3m e ignoram penalidades por terreno difícil em terrenos naturais.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alcance para pessoal e o alvo para você. Em vez do normal, você recebe +5 em testes de Sobrevivência para se orientar.',
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
    description:
      'Você dá uma ordem irresistível, que o alvo deve ser capaz de ouvir (mas não precisa entender). Se falhar na resistência, ele deve obedecer ao comando em seu próprio turno da melhor maneira possível. Escolha um dos efeitos na página 184.',
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
    resistencia: 'Vontade anula (veja descrição)',
    school: 'Adiv',
    description:
      'Essa magia lhe confere compreensão sobrenatural. Você pode tocar um texto e entender as palavras mesmo que não conheça o idioma. Se tocar numa criatura inteligente, pode se comunicar com ela mesmo que não tenham um idioma em comum. Se tocar uma criatura não inteligente, como um animal, pode perceber seus sentimentos. Você também pode gastar uma ação de movimento para ouvir os pensamentos de uma criatura tocada (você “ouve” o que o alvo está pensando), mas um alvo involuntário tem direito a um teste de Vontade para proteger seus pensamentos e evitar este efeito.',
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
    description:
      'Você amplia sua percepção, antecipando movimentos dos inimigos e achando brechas em sua defesa. Quando faz um teste de ataque, você rola dois dados e usa o melhor resultado.',
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
        text: 'muda a execução para padrão e a duração para um dia. Além do normal, você recebe um sexto sentido que o avisa de qualquer perigo ou ameaça. Você fica imune às condições surpreendido e desprevenido e recebe +10 na Defesa e Reflexos. Requer 5º círculo.',
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
    description:
      'Você conjura um monstro Pequeno que ataca seus inimigos. Você escolhe a aparência do monstro e o tipo de dano que ele pode causar, entre corte, impacto e perfuração. No entanto, ele não é uma criatura real, e sim um construto feito de energia. Se for destruído, ou quando a magia acaba, desaparece com um brilho, sem deixar nada para trás. Você só pode ter um monstro conjurado por esta magia por vez. O monstro surge em um espaço desocupado a sua escolha dentro do alcance e age no início de cada um de seus turnos, a partir da próxima rodada. O monstro tem deslocamento 9m e pode fazer uma ação de movimento por rodada. Você pode gastar uma ação padrão para dar uma das ordens da página 185 a ele.',
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
        text: 'aumenta os PV do monstro em +10 para cada categoria de tamanho a partir de Pequeno (+10 PV para Pequeno, +20 PV para Médio etc.).',
      },
      {
        addPm: 2,
        text: 'aumenta o tamanho do monstro para Médio. Ele tem For 4, Des 3, 45 PV, deslocamento 12m e seu ataque causa 2d6+6 pontos de dano.',
      },
      {
        addPm: 2,
        text: 'o monstro ganha resistência 5 contra dois tipos de dano (por exemplo, corte e frio).',
      },
      {
        addPm: 4,
        text: 'o monstro ganha uma nova ordem: Arma de Sopro. Para dar essa ordem você gasta 1 PM, e faz o monstro causar o dobro de seu dano de ataque em um cone de 6m a partir de si (Reflexos reduz à metade). ',
      },
      {
        addPm: 5,
        text: 'aumenta o tamanho do monstro para Grande. Ele tem For 7, Des 2, 75 PV, deslocamento 12m e seu ataque causa 4d6+10 pontos de dano com 3m de alcance. Requer 2º círculo.',
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
        text: 'aumenta o tamanho do monstro para Enorme. Ele tem For 11, Des 1, 110 PV, deslocamento 15m e seu ataque causa 4d8+15 pontos de dano com 4,5m de alcance. Requer 4º círculo',
      },
      {
        addPm: 14,
        text: 'aumenta o tamanho do monstro para Colossal. Ele tem For 15, Des 0, 180 PV, deslocamento 15m e seu ataque causa 4d12+20 pontos de dano com 9m de alcance. Requer 5º círculo.',
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
    description:
      'Você enche a área com energia positiva. Pontos de vida curados por efeitos de luz são maximizados dentro da área. Isso também afeta dano causado em mortos-vivos por esses efeitos. Por exemplo, Curar Ferimentos cura automaticamente 18 PV. Esta magia não pode ser lançada em uma área contendo um símbolo visível dedicado a uma divindade que não a sua. Consagrar anula Profanar.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, mortos-vivos na área sofrem –2 em testes e Defesa.',
      },
      {
        addPm: 2,
        text: 'aumenta as penalidades para mortos-vivos em –1.',
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
    description:
      'Esta magia só pode ser lançada em uma área com vegetação. As plantas se enroscam nas criaturas da área. Aquelas que falharem na resistência ficam enredadas. Uma vítima pode se libertar com uma ação padrão e um teste de Acrobacia ou Atletismo. Além disso, a área é considerada terreno difícil. No início de seus turnos, a vegetação tenta enredar novamente qualquer criatura na área, exigindo um novo teste de Reflexos.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda a área para alvo de 1 planta e a resistência para nenhuma. Em vez do normal, você pode fazer a planta se mover como se fosse animada. Ela não pode causar dano ou atrapalhar a concentração de um conjurador.',
      },
      {
        addPm: 1,
        text: 'muda a duração para instantânea. Em vez do normal, as plantas na área diminuem, como se tivessem sido podadas. Terreno difícil muda para terreno normal e não fornece camuflagem. Esse efeito dissipa o uso normal de Controlar Plantas.',
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
    description:
      'Você cria uma pequena porção de um elemento, a sua escolha. Os elementos criados são reais, não mágicos. Elementos físicos devem surgir em uma superfície. Em vez de um cubo, pode- -se criar objetos simples (sem partes móveis) feitos de gelo, terra ou pedra.',
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
        addPm: 1,
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
    description:
      'Esta magia cria uma ilusão visual (uma criatura, uma parede...) ou sonora (um grito de socorro, um uivo assustador...). A magia cria apenas imagens ou sons simples, com volume equivalente ao tom de voz normal para cada cubo de 1,5m no efeito. Não é possível criar cheiros, texturas ou temperaturas, nem sons complexos, como uma música ou diálogo. Criaturas e objetos atravessam uma ilusão sem sofrer dano, mas a magia pode, por exemplo, esconder uma armadilha ou inimigo. A magia é dissipada se você sair do alcance.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a duração para sustentada. A cada rodada você pode gastar uma ação livre para mover a imagem ou alterar levemente o som, como aumentar o volume ou fazer com que pareça se afastar ou se aproximar, ainda dentro dos limites do efeito. Você pode, por exemplo, criar a ilusão de um fantasma que anda pela sala, controlando seus movimentos. Quando você para de sustentar a magia, a imagem ou som persistem por mais uma rodada antes de a magia se dissipar.',
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
        text: 'muda o alcance para longo e o efeito para esfera com 30m de raio. Em vez do normal, você cria um som muito alto, equivalente a uma multidão. Criaturas na área lançam magias como se estivessem em uma condição ruim e a CD de testes de Percepção para ouvir aumenta em +10. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'também criar sensações táteis, como texturas; criaturas que não saibam que é uma ilusão não conseguem atravessá-la sem passar em um teste de Vontade (objetos ainda a atravessam). A ilusão ainda é incapaz de causar ou sofrer dano. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda a duração para sustentada. Além do normal, você pode gastar uma ação livre para modificar livremente a ilusão (mas não pode acrescentar novos aprimoramentos após lançá-la). Requer 3º círculo',
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
    description:
      'Você canaliza luz que recupera 2d8+2 pontos de vida na criatura tocada.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alvo para 1 morto-vivo. Em vez do normal, causa 1d8 pontos de dano de luz (Vontade reduz à metade).',
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
    alvo: '1 critura ou objeto mundano Pequeno',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    school: 'Evoc',
    description:
      'Esta magia emite um som alto e agudo. O alvo sofre 1d8+2 pontos de dano de impacto (ou o dobro disso e ignora RD se for um construto ou objeto mundano) e fica atordoado por uma rodada (apenas uma vez por cena). Um teste de Fortitude reduz o dano à metade e evita o atordoamento.',
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
        text: 'muda o alcance para pessoal e a área para esfera com 6m de raio. Todas as criaturas e objetos mundanos na área são afetados.',
      },
    ],
  },
  [spellsCircle1Names.detectarAmeacas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Detectar Ameaças',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    area: 'Esfera de 9m de raio',
    duracao: 'Instantânea',
    school: 'Adiv',
    description:
      'Você recebe uma intuição aguçada sobre perigos ao seu redor. Quando uma criatura hostil ou armadilha entra na área do efeito, você faz um teste de Percepção (CD determinada pelo mestre de acordo com a situação). Se passar, sabe a origem (criatura ou armadilha), direção e distância do perigo. Se falhar, sabe apenas que o perigo existe.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'você descobre também a raça ou espécie e o poder da criatura detectada (determinado pela aura dela). Criaturas de 1º a 6º nível ou ND geram aura tênue, criaturas de 7º a 12º nível ou ND geram aura moderada e criaturas de 13º ao 20º nível ou ND geram aura poderosa. Criaturas acima do 20º nível ou ND geram aura avassaladora.',
      },
      {
        addPm: 2,
        text: 'além do normal, você não fica surpreso desprevenido contra perigos detectados com sucesso e recebe +5 em testes de resistência contra armadilhas. Requer 2º círculo.',
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
    description:
      'Você muda a aparência do alvo, incluindo seu equipamento. Isso inclui altura, peso, tom de pele, cor de cabelo, timbre de voz etc. O alvo recebe +10 em testes de Enganação para disfarce. O alvo não recebe novas habilidades (você pode ficar parecido com outra raça, mas não ganhará as habilidades dela), nem modifica o equipamento (uma espada longa disfarçada de bordão continua funcionando e causando dano como uma espada).',
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
    description:
      'O alvo fica enfeitiçado (veja a página 394). Um alvo hostil ou que esteja envolvido em um combate recebe +5 em seu teste de resistência. Se você ou seus aliados tomarem qualquer ação hostil contra o alvo, a magia é dissipada e o alvo retorna à atitude que tinha antes (ou piorada, de acordo com o mestre).',
    aprimoramentos: [
      {
        addPm: 2,
        text: ' em vez do normal, você sugere uma ação para o alvo e ele obedece. A sugestão deve ser feita de modo que pareça aceitável, a critério do mestre. Pedir ao alvo que pule de um precipício, por exemplo, dissipa a magia. Já sugerir a um guarda que descanse um pouco, de modo que você e seus aliados passem por ele, é aceitável. Quando o alvo executa a ação, a magia termina. Você pode determinar uma condição específica para a sugestão: por exemplo, que um rico mercador doe suas moedas para o primeiro mendigo que encontrar.',
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
    description:
      'Um escudo místico se manifesta momentaneamente para bloquear um golpe. O alvo recebe +2 na Defesa.',
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
        text: 'muda a execução para ação padrão, o alcance para toque e a duração para cena. A magia cria uma conexão mística entre você e o alvo. Além do efeito normal, o alvo sofre metade do dano por ataques e efeitos; a outra metade do dano é transferida a você. Se o alvo sair de alcance curto de você, a magia é dissipada. Requer 2º círculo.',
      },
      {
        addPm: 3,
        text: 'muda a duração para um dia. Requer 2º círculo.',
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
    description:
      'O alvo emana sombras em uma área com 6m de raio. Criaturas dentro da área recebem camuflagem leve por escuridão leve. As sombras não podem ser iluminadas por nenhuma fonte de luz natural. O objeto pode ser guardado (em um bolso, por exemplo) para interromper a escuridão, que voltará a funcionar caso o objeto seja revelado. Se lançar a magia num objeto de uma criatura involuntária, ela tem direito a um teste de Vontade para anulá-la. Escuridão anula Luz.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta a área da escuridão em +1,5m de raio.',
      },
      {
        addPm: 2,
        text: 'muda o efeito para fornecer camuflagem total por escuridão total. As sombras bloqueiam a visão na área e através dela.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para 1 criatura e a resistência para Fortitude parcial. Você lança a magia nos olhos do alvo, que fica cego pela cena. Se passar na resistência, fica cego por 1 rodada. Requer 2º círculo.',
      },
      {
        addPm: 3,
        text: 'muda a duração para 1 dia.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para pessoal e o alvo para você. Em vez do normal, você é coberto por sombras, recebendo +10 em testes de Furtividade e camuflagem leve. Requer 2º círculo.',
      },
    ],
  },
  [spellsCircle1Names.explosaoDeChamas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Explosão de Chamas',
    execucao: 'Padrão',
    alcance: '6m',
    area: 'Cone de 6m',
    duracao: 'Instantânea',
    school: 'Evoc',
    description:
      'Um leque de chamas irrompe de suas mãos, causando 2d6 pontos de dano de fogo às criaturas na área.',
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
        text: 'muda a resistência para Reflexos parcial. Se passar, a criatura reduz o dano à metade; se falhar, fica em chamas (veja Condições, na página 394).',
      },
    ],
  },
  [spellsCircle1Names.hipnotismo]: {
    spellCircle: spellsCircles.c1,
    nome: 'Hipnotismo',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide',
    duracao: '1d4 rodadas',
    resistencia: 'Vontade anula',
    school: 'Encan',
    description:
      'Suas palavras e movimentos ritmados deixam o alvo fascinado. Esta magia só afeta criaturas que possam perceber você. Se usar esta magia em combate, o alvo recebe +5 em seu teste de resistência. Se a criatura passar, fica imune a este efeito por um dia.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda a duração para 1 rodada. Em vez de fascinado, o alvo fica pasmo (apenas uma vez por cena).',
      },
      {
        addPm: 1,
        text: 'como o normal, mas alvos que passem na resistência não sabem que foram vítimas de uma magia.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para animais ou humanoides escolhidos.',
      },
      {
        addPm: 2,
        text: 'muda a duração para sustentada.',
      },
      {
        addPm: 2,
        text: 'também afeta espíritos e monstros na área. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'também afeta construtos, espíritos, monstros e mortos-vivos na área. Requer 3º círculo.',
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
    description:
      'Três cópias ilusórias suas aparecem. As duplicatas ficam ao seu redor e imitam suas ações, tornando difícil para um inimigo saber quem atacar. Você recebe +6 na Defesa. Cada vez que um ataque contra você erra, uma das imagens desaparece e o bônus na Defesa diminui em 2. Um oponente deve ver as cópias para ser confundido. Se você estiver invisível, ou o atacante fechar os olhos, você não recebe o bônus (mas o atacante ainda sofre penalidades normais por não enxergar).',
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
    description:
      'Você canaliza energia negativa contra um alvo, causando 2d8+2 pontos de dano de trevas (ou curando 2d8+2 PV, se for um morto-vivo). Infligir Ferimentos anula Curar Ferimentos',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, se falhar na resistência, o alvo fica fraco pela cena.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em 1d8+1.',
      },
      {
        addPm: 2,
        text: 'muda a resistência para nenhum. Como parte da execução da magia, você pode fazer um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e o efeito da magia.',
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
    resistencia: 'Vontade parcial',
    school: 'Ilusão',
    description:
      'Um cone de luzes brilhantes surge das suas mãos, deixando os animais e humanoides na área atordoados por 1 rodada (apenas uma vez por cena, Vontade anula) e ofuscados pela cena.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'além do normal, as criaturas afetadas ficam vulneráveis pela cena.',
      },
      {
        addPm: 2,
        text: 'também afeta espíritos e monstros na área. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: ' também afeta construtos, espíritos, monstros e mortos-vivos na área. Requer 3º círculo.',
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
    description:
      'O alvo emite luz (mas não produz calor) em uma área com 6m de raio. O objeto pode ser guardado (em um bolso, por exemplo) para interromper a luz, que voltará a funcionar caso o objeto seja revelado. Se lançar a magia num objeto de uma criatura involuntária, ela tem direito a um teste de Vontade para anulá-la. Luz anula Escuridão.',
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
        text: 'muda a duração para permanente e adiciona componente material (pó de rubi no valor de T$ 50). Não pode ser usado em conjunto com outros aprimoramentos. Requer 2º círculo.',
      },
    ],
  },
  [spellsCircle1Names.nevoa]: {
    spellCircle: spellsCircles.c1,
    nome: 'Névoa',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Nuvem com 6m de raio e 6m de altura',
    duracao: 'Cena',
    school: 'Conv',
    description:
      'Uma névoa espessa eleva-se de um ponto a sua escolha, obscurecendo toda a visão — criaturas a até 1,5m têm camuflagem leve e criaturas a partir de 3m têm camuflagem total. Um vento forte dispersa a névoa em 4 rodadas e um vendaval a dispersa em 1 rodada. Esta magia não funciona sob a água.',
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
        text: 'a nuvem tem um cheiro horrível. No início de seus turnos, qualquer criatura dentro dela, ou qualquer criatura com faro em alcance curto da nuvem, deve fazer um teste de Fortitude. Se falhar, fica enjoada por uma rodada.',
      },
      {
        addPm: 2,
        text: 'a nuvem tem um tom esverdeado e se torna cáustica. No início de seus turnos, criaturas dentro dela sofrem 2d4 pontos de dano de ácido.',
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
    description:
      'Em seu próximo teste de perícia, o alvo pode rolar dois dados e ficar com o melhor resultado.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda a duração para cena. Em vez do normal, escolha um atributo. Sempre que o alvo fizer um teste de perícia baseado no atributo escolhido, pode rolar dois dados e ficar com o melhor resultado. Não se aplica a testes de ataque ou resistência. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'como acima, mas, em vez de um atributo, escolha entre atributos físicos (Força, Destreza e Constituição) ou mentais (Inteligência, Sabedoria e Carisma). Requer 3º círculo.',
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
    description:
      'Amaldiçoa os alvos, que recebem –1 em testes de ataque e rolagens de dano. Perdição anula Bênção.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta as penalidades em –1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
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
    description:
      'Você modifica os limites físicos do alvo, que recebe deslocamento +9m e +10 em testes de Atletismo.',
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
        text: 'muda a execução para ação de movimento, o alcance para pessoal, o alvo para você e a duração para instantânea. Você salta muito alto e pousa em alcance corpo a corpo de uma criatura em alcance curto. Se fizer um ataque corpo a corpo contra essa criatura neste turno, recebe os benefícios e penalidades de uma investida e sua arma causa um dado extra de dano do mesmo tipo durante este ataque.',
      },
      {
        addPm: 3,
        text: ' além do normal, ao fazer testes de perícias baseadas em Força, Destreza ou Constituição, o alvo pode rolar dois dados e escolher o melhor. Não afeta testes de ataque ou resistência. Requer 2º círculo.',
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
    description:
      'Você enche a área com energia negativa. Dano causado por efeitos de trevas é maximizado dentro da área. Isso também afeta PV curados em mortos-vivos por esses efeitos. Esta magia não pode ser lançada em uma área contendo um símbolo visível dedicado a uma divindade que não a sua. Profanar anula Consagrar.',
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
    description:
      'Esta magia cria uma barreira mística invisível que fornece ao alvo +2 em testes de resistência.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus concedido em +1.',
      },
      {
        addPm: 2,
        text: 'muda a execução para reação, o alcance para curto e a duração para 1 rodada. Em vez do normal, o alvo recebe +5 no próximo teste de resistência que fizer (cumulativo com o efeito básico desta magia).',
      },
      {
        addPm: 2,
        text: 'muda o alvo para área de esfera com 3m de raio. Todos os aliados dentro do círculo recebem o bônus da magia. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'torna o alvo imune a efeitos mentais e de medo. Requer 3º círculo.',
      },
    ],
  },
  [spellsCircle1Names.quedaSuave]: {
    spellCircle: spellsCircles.c1,
    nome: 'Queda Suave',
    execucao: 'Reação',
    alcance: 'Curto',
    alvo: '1 criatura ou objeto Grande ou menor',
    duracao: 'Até chegar ao solo ou cena, o que vier primeiro',
    school: 'Trans',
    description:
      'O alvo cai lentamente. A velocidade da queda é reduzida para 18m por rodada — o suficiente para não causar dano. Como lançar esta magia é uma reação, você pode lançá-la rápido o bastante para salvar a si ou um aliado de quedas inesperadas. Lançada sobre um projétil — como uma flecha ou uma rocha largada do alto de um penhasco —, a magia faz com que ele cause metade do dano normal, devido à lentidão. Queda Suave só funciona em criaturas e objetos em queda livre; a magia não vai frear um golpe de espada ou o mergulho rasante de um atacante voador.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alvo para objeto Minúsculo. Em vez do normal, você pode gastar uma ação de movimento para levitar o alvo até 4,5m em qualquer direção.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para até 10 criaturas ou objetos adequados.',
      },
      {
        addPm: 2,
        text: 'aumenta a categoria de tamanho do alvo em uma.',
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
    description:
      'Você dispara um raio púrpura que drena as forças do alvo. Se falhar na resistência, o alvo fica fatigado. Se passar, fica vulnerável. Note que, como efeitos de magia não acumulam, lançar esta magia duas vezes contra o mesmo alvo não irá deixá-lo exausto.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alcance para toque e a resistência para Fortitude anula. Em vez do normal, sua mão emana um brilho púrpura e, ao tocar o alvo, ele fica fatigado.',
      },
      {
        addPm: 2,
        text: 'em vez do normal, se falhar na resistência o alvo fica exausto. Se passar, fica fatigado. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'como acima, mas muda o alvo para criaturas escolhidas. Requer 3º círculo.',
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
    description:
      'Ao lançar esta magia, escolha entre ácido, eletricidade, fogo, frio, luz ou trevas. O alvo recebe redução de dano 10 contra o tipo de dano escolhido.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta a redução de dano em +5. ',
      },
      {
        addPm: 2,
        text: 'muda a duração para um dia. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas. Requer 3º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o efeito para redução de dano contra todos os tipos listados na magia. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: 'muda o efeito para imunidade a um tipo listado na magia. Requer 4º círculo.',
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
    description:
      'Qualquer criatura que tente fazer uma ação hostil contra o alvo deve fazer um teste de Vontade. Se falhar, não consegue, perde a ação e não pode tentar novamente até o fim da cena. Santuário não protege o alvo de efeitos de área. Além disso, o próprio alvo também não pode fazer ações hostis (incluindo forçar outras criaturas a atacá-lo), ou a magia é dissipada — mas pode usar habilidades e magias de cura e suporte, como Curar Ferimentos e Bênção.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, escolha um tipo de criatura entre animal, construto ou morto-vivo. Você não pode ser percebido por criaturas não inteligentes (Int –4 ou menor) do tipo escolhido.',
      },
      {
        addPm: 9,
        text: 'também protege o alvo contra efeitos de área. Uma criatura que tente atacar uma área que inclua o alvo deve fazer o teste de Vontade; se falhar, não consegue e perde a ação. Ela só pode tentar novamente se o alvo sair da área.',
      },
    ],
  },
  [spellsCircle1Names.setaInfalivelDeTalude]: {
    spellCircle: spellsCircles.c1,
    nome: 'Seta Infalível de Talude',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Criaturas escolhidas',
    duracao: 'Instantânea',
    school: 'Evoc',
    description:
      'Favorita entre arcanistas iniciantes, esta magia lança duas setas de energia que causam 1d4+1 pontos de dano de essência cada. Você pode lançar as setas em alvos diferentes ou concentrá-las num mesmo alvo. Caso você possua um bônus no dano de magias, como pelo poder Arcano de Batalha, ele é aplicado em apenas uma seta (o bônus vale para a magia, não cada alvo).',
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
    alvo: '1 humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    school: 'Encan',
    description:
      'Um cansaço místico recai sobre o alvo. Se falhar na resistência, ele fica inconsciente e caído ou, se estiver envolvido em combate ou outra situação perigosa, fica exausto por 1 rodada, depois fatigado. Em ambos os casos, se passar, o alvo fica fatigado por 1d4 rodadas.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'alvos que falhem na resistência ficam exaustos por 1d4+1 rodadas, em vez de apenas 1.',
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
  [spellsCircle1Names.suporteAmbiental]: {
    spellCircle: spellsCircles.c1,
    nome: 'Suporte Ambiental',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: '1 dia',
    school: 'Abjur',
    description:
      'Esta magia facilita a sobrevivência em ambientes hostis. O alvo fica imune aos efeitos de calor e frio extremos, pode respirar na água se respirar ar (ou vice-versa) e não sufoca em fumaça densa.',
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
    description:
      'Teia cria várias camadas de fibras entrelaçadas e pegajosas na área. Qualquer criatura na área que falhar na resistência fica enredada. Uma vítima pode se libertar com uma ação padrão e um teste de Acrobacia ou Atletismo. A área ocupada por Teia é terreno difícil. A Teia é inflamável. Qualquer ataque que cause dano de fogo destrói as teias por onde passar, libertando as criaturas enredadas mas deixando-as em chamas.',
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
    description:
      'Arcos elétricos envolvem sua mão, causando 2d8+2 pontos de dano de eletricidade. Se o alvo usa armadura de metal (ou carrega muito metal, a critério do mestre), sofre uma penalidade de –5 no teste de resistência.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em 1d8+1.',
      },
      {
        addPm: 2,
        text: 'muda a resistências para nenhum. Como parte da execução da magia, você faz um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e da magia.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para pessoal e o alvo para área: esfera com 6m de raio. Você dispara raios pelas pontas dos dedos que afetam todas as criaturas na área.',
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
    description:
      'Esta magia tranca uma porta ou outro que possa ser aberto ou fechado (como um baú, caixa etc.), aumentando a CD de testes de Força ou Ladinagem para abri-lo em +10. Você pode abrir livremente sua própria tranca sem problemas.',
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
    description:
      'Você emana ondas de serenidade. Se falhar na resistência, o alvo tem sua atitude mudada para indiferente (veja a página 259) e não pode atacar ou realizar qualquer ação agressiva. Se passar, sofre –2 em testes de ataque. Qualquer ação hostil contra o alvo ou seus aliados dissipa a magia e faz ele retornar à atitude que tinha antes (ou pior, de acordo com o mestre).',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para 1 criatura.',
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
    description:
      'A magia transforma matéria bruta para moldar um novo objeto. Você pode usar matéria-prima mundana para criar um objeto de tamanho Pequeno ou menor e preço máximo de T$ 25, como um balde ou uma espada. O objeto reverte à matéria-prima no final da cena, ou se for tocado por um objeto feito de chumbo. Esta magia não pode ser usada para criar objetos consumíveis, como alimentos ou itens alquímicos, nem objetos com mecanismos complexos, como bestas ou armas de fogo. Transmutar Objetos anula Despedaçar.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alvo para 1 objeto mundano Mínusculo (ou material em quantidade equivalente) e a duração para instantânea. Em vez do normal, você pode alterar as propriedades físicas do alvo, como colorir, limpar ou sujar itens pequenos (incluindo peças de roupa), aquecer, esfriar e/ou temperar (mas não produzir) ou curar 1 PV do objeto, consertando pequenas falhas como colar um frasco de cerâmica quebrado, unir os elos de uma corrente ou costurar uma roupa rasgada. Um objeto só pode ser afetado por este truque uma vez por dia.',
      },
      {
        addPm: 1,
        text: 'muda o alcance para toque, o alvo para 1 construto e a duração para instantânea. Em vez do normal, cura 2d8 PV do alvo. Você pode gastar 2 PM adicionais para aumentar a cura em +1d8.',
      },
      {
        addPm: 2,
        text: 'aumenta o limite de tamanho do objeto em uma categoria.',
      },
      {
        addPm: 3,
        text: 'aumenta o preço máximo do objeto criado em um fator de x10 (+3 PM por T$ 250 de preço, +6 PM por T$ 2.500 de preço e assim por diante)',
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
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    school: 'Adiv',
    description:
      'Seus olhos brilham com uma luz azul e passam a enxergar auras mágicas. Este efeito é similar ao uso de Misticismo para detectar magia, mas você detecta todas as auras mágicas em alcance médio e recebe todas as informações sobre elas sem gastar ações. Além disso, você pode gastar uma ação de movimento para descobrir se uma criatura que possa perceber em alcance médio é capaz de lançar magias e qual a aura gerada pelas magias de círculo mais alto que ela pode lançar.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'recebe visão no escuro.',
      },
      {
        addPm: 2,
        text: 'muda a duração para um dia.',
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
    description:
      'Você suga energia vital da terra, recebendo 2d10 pontos de vida temporários. Os PV temporários desaparecem ao final da cena.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta os PV temporários recebidos em +1d10. Caso a magia cause dano, em vez disso aumenta o dano causado em +1d10.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para área: esfera com 6m de raio centrada em você e a resistência para Fortitude reduz à metade. Em vez do normal, você suga energia das criaturas vivas na área, causando 1d10 pontos de dano de trevas e recebendo PV temporários iguais ao dano total causado. Os PV temporários desaparecem ao final da cena. Requer 2º círculo.',
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
    description:
      'Esta magia diz se uma ação que você tomará em breve — no máximo uma hora no futuro — trará resultados bons ou ruins. O mestre rola 1d6 em segredo; com um resultado de 2 a 6, a magia funciona e você recebe uma das seguintes respostas: “felicidade” (a ação trará bons resultados); “miséria” (a ação trará maus resultados); “felicidade e miséria” (para ambos) ou “nada” (para ações que não trarão resultados bons ou ruins). Com um resultado 1, a magia falha e oferece o resultado “nada”. Não há como saber se esse resultado foi dado porque a magia falhou ou não. Lançar esta magia múltiplas vezes sobre o mesmo assunto gera sempre o primeiro resultado. Por exemplo, se o grupo está prestes a entrar em uma câmara, o augúrio dirá “felicidade” se a câmara contém um tesouro desprotegido, “miséria” se contém um monstro, “felicidade e miséria” se houver um tesouro e um monstro ou “nada” se a câmara estiver vazia.',
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
    description:
      'Você murmura palavras desconexas que afetam a mente do alvo. O alvo fica confuso.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 3,
        text: 'muda o alvo para 1 criatura.',
      },
      {
        addPm: 12,
        text: 'muda o alvo para criaturas escolhidas. Requer 5º círculo.',
      },
    ],
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
    description:
      'Esta magia cria uma película protetora sobre você. Você recebe 30 pontos de vida temporários.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a execução para reação e a duração para instantânea. Em vez do normal, você recebe RD 30 contra o próximo dano que sofrer',
      },
      {
        addPm: 3,
        text: 'muda os PV temporários ou a RD para 50. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda os PV temporários ou a RD para 70. Requer 4º círculo.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para curto, o alvo para outra criatura ou objeto Enorme ou menor e a duração para sustentada. Em vez do normal, cria uma esfera imóvel e tremeluzente ao redor do alvo. Nenhuma criatura, objeto ou efeito de dano pode passar pela esfera, embora criaturas possam respirar normalmente. Criaturas na área podem fazer um teste de Reflexos para evitar serem aprisionadas e sempre que você se concentrar. Requer 4º círculo.',
      },
      {
        addPm: 9,
        text: 'como o aprimoramento acima, mas tudo dentro da esfera fica praticamente sem peso. Uma vez por rodada, você pode gastar uma ação livre para flutuar a esfera e seu conteúdo 9m em uma direção. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.dissiparMagia]: {
    spellCircle: spellsCircles.c2,
    nome: 'Dissipar Magia',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura ou 1 objeto mágico',
    area: 'Esfera com 3m de raio',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Abjur',
    description:
      'Você dissipa outras magias que estejam ativas, como se sua duração tivesse acabado. Note que efeitos de magias instantâneas não podem ser dissipados (não se pode dissipar uma Bola de Fogo ou Relâmpago depois que já causaram dano...). Se lançar essa magia em uma criatura ou área, faça um teste de Misticismo; você dissipa as magias com CD igual ou menor que o resultado do teste. Se lançada contra um mágico, o transforma em um mundano por 1d6 rodadas (Vontade anula).',
    aprimoramentos: [
      {
        addPm: 12,
        text: 'muda a área para esfera com 9m de raio. Em vez do normal, cria um efeito de disjunção. Todas as magias na área são automaticamente dissipadas e todos os itens mágicos na área, exceto aqueles que você estiver carregando, viram itens mundanos por uma cena (com direito a um teste de Vontade para evitar esse efeito). Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle2Names.refugio]: {
    spellCircle: spellsCircles.c2,
    nome: 'Refúgio',
    execucao: 'Completa',
    alcance: 'Curto',
    area: 'Domo com 6m de raio',
    duracao: '1 dia',
    resistencia: '',
    school: 'Abjur',
    description:
      'Esta magia cria um domo imóvel e quase opaco por fora, mas transparente pelo lado de dentro. Ele protege contra calor, frio e forças pequenas, mas não contra qualquer coisa capaz de causar dano. Assim, o domo protege contra neve e vento comuns, mas não contra uma flecha ou Bola de Fogo. Porém, como o domo é quase opaco, qualquer criatura dentro dele tem camuflagem total contra ataques vindos de fora. Criaturas podem entrar e sair do domo livremente. Descansar dentro do Refúgio concede recuperação normal de PV e PM.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, os limites do domo são envoltos por uma fumaça escura e espessa, que impede criaturas do lado de fora de enxergar ou ouvir o que está dentro. Criaturas do lado de dentro enxergam e ouvem normalmente o que está do lado de fora. A fumaça também bloqueia magias de adivinhação.',
      },
      {
        addPm: 3,
        text: 'em vez do normal, cria uma cabana que comporta até 10 criaturas Médias. Descansar nesse espaço concede recuperação confortável (recupera PV e PM igual ao dobro do nível). Para todos os efeitos é uma cabana normal, com paredes de madeira, telhado, uma porta, duas janelas e alguma mobília (camas, uma mesa com bancos e uma lareira). A porta e as janelas têm 15 PV, RD 5 e são protegidas por um efeito idêntico à magia Tranca Arcana. As paredes têm 200 PV e RD 5.',
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
    execucao: '1 hora',
    alcance: 'Toque',
    alvo: 'Uma área de 6m de raio',
    duracao: 'Permanente ou até descarregar',
    resistencia: 'Veja o texto',
    school: 'Abjur',
    description:
      'Você escreve uma runa pessoal em uma superfície fixa, como uma parede ou o chão, que protege uma pequena área ao redor. Quando uma criatura entra na área afetada a runa explode, causando 6d6 pontos de dano em todos os alvos a até 6m. A criatura que ativa a runa não tem direito a teste de resistência; outras criaturas na área têm direito a um teste de Reflexos para reduzir o dano à metade. Quando lança a magia, você escolhe o tipo de dano, entre ácido, eletricidade, fogo, frio, luz ou trevas. Você pode determinar que a runa se ative apenas em condições específicas — por exemplo, apenas por goblins ou apenas por mortos-vivos. Você também pode criar uma palavra mágica que impeça a runa de se ativar. Um personagem pode encontrar a runa com um teste de Investigação e desarmá-la com um teste de Ladinagem.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em +2d6',
      },
      {
        addPm: 1,
        text: 'muda o alvo para “você” e o alcance para “pessoal”. Ao invés do normal, escolha uma magia de 1º círculo que você conhece e pode lançar, com tempo de execução de uma ação padrão ou menor. Você escreve a runa em seu corpo e especifica uma condição de ativação como, por exemplo, “quando eu for alvo de um ataque” ou “quando for alvo de uma magia”. Quando a condição for cumprida, você pode ativar a runa e lançar a magia escolhida como uma reação. Você só pode escrever uma runa em seu corpo ao mesmo tempo.',
      },
      {
        addPm: 3,
        text: ' como o aprimoramento anterior, mas você pode escolher magias de 2º círculo. Requer 3º círculo.',
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
    description:
      'Você cria um elo mental entre duas criaturas com Inteligência 3 ou maior (você pode ser uma delas). As criaturas podem se comunicar independente de idioma ou distância, mas não em mundos diferentes.',
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
    area: 'Esfera com 90m de raio',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    description:
      'Esta magia pode encontrar uma criatura ou objeto a sua escolha. Você pode pensar em termos gerais (“um elfo”, “algo de metal”) ou específicos (“Gwen, a elfa”, “uma espada longa”). A magia indica a direção e distância da criatura ou objeto mais próximo desse tipo, caso esteja ao alcance. Você pode movimentar-se para continuar procurando. Procurar algo muito específico (“a espada longa encantada do Barão Rulyn”) exige que você tenha em mente uma imagem precisa do objeto; caso a imagem não seja muito próxima da verdade, a magia falha, mas você gasta os PM mesmo assim. Esta magia pode ser bloqueada por uma fina camada de chumbo.',
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
    alvo: 'superfície ou objeto plano, como uma mesa ou papel',
    duracao: 'Cena',
    resistencia: '',
    school: 'Adiv',
    description:
      'Uma fagulha percorre a superfície afetada, queimando-a enquanto esboça um mapa da região onde o conjurador está. Se você conhece o lugar, o mapa será completo. Caso contrário, apresentará apenas um esboço geral, além de um ponto de referência (para possibilitar localização) e um lugar de interesse, ambos definidos pelo mestre. A região representada no mapa tem tamanho máximo de um quadrado de 10km de lado. Caso você esteja dentro de uma construção, o mapa mostrará o andar no qual você se encontra.',
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
    description:
      'Três laços de energia surgem e se enroscam no alvo, deixando-o agarrado. A vítima pode tentar se livrar, gastando uma ação padrão para fazer um teste de Atletismo. Se passar, destrói um laço, mais um laço adicional para cada 5 pontos pelos quais superou a CD. Os laços também podem ser atacados e destruídos: cada um tem Defesa 10, 10 PV, RD 5 e imunidade a dano mágico. Se todos os laços forem destruídos, a magia é dissipada. Por serem feitos de energia, os laços afetam criaturas incorpóreas.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 2,
        text: 'aumenta o número de laços em um alvo a sua escolha em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 3,
        text: 'em vez do normal, cada laço é destruído automaticamente com um único ataque bem-sucedido; porém, cada laço destruído libera um choque de energia que causa 1d8+1 pontos de dano de essência na criatura amarrada. Requer 3º círculo.',
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
    description:
      'Esta magia convoca um parceiro cavalo (ou pônei) de guerra veterano. Sua aparência é de um animal negro com crina e cauda cinzentas e cascos feitos de fumaça, mas você pode mudá-la se quiser. Além dos benefícios normais, a Montaria Arcana pode atravessar terreno difícil sem redução em seu deslocamento. Você pode usar Misticismo no lugar de Cavalgar para efeitos desta montaria (incluindo ser considerado treinado).',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, criaturas do tipo animal em alcance curto da montaria devem fazer um teste de Vontade. Se passarem, ficam abaladas pela cena; se falharem, ficam apavoradas por 1d4 rodadas, depois abaladas pela cena.',
      },
      {
        addPm: 3,
        text: 'muda a duração para permanente e adiciona penalidade de –3 PM.',
      },
      {
        addPm: 3,
        text: 'aumenta o tamanho da montaria em uma categoria. Isso também aumenta o número de criaturas que ela pode carregar — duas para uma criatura Enorme, seis para Colossal. Uma única criatura controla a montaria; as outras apenas são deslocadas.',
      },
      {
        addPm: 3,
        text: 'muda o nível do parceiro para mestre. Requer 3º círculo.',
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
    description:
      'Esta magia transporta você para outro lugar dentro do alcance. Você não precisa perceber nem ter linha de efeito ao seu destino, podendo simplesmente imaginá-lo. Por exemplo, pode se transportar 3m adiante para ultrapassar uma porta fechada. Uma vez transportadas, criaturas não podem agir até a rodada seguinte. Esta magia não permite que você apareça dentro de um corpo sólido; se o ponto de chegada não tem espaço livre, você ressurge na área vazia mais próxima.',
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
        text: 'muda a execução para reação. Em vez do normal, você recebe +5 na Defesa e em testes de Reflexos contra um ataque ou efeito que esteja prestes a atingi-lo. Após a resolução do efeito, salta para um espaço adjacente (1,5m).',
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
    description:
      'Você cria até três servos invisíveis e silenciosos, capazes de realizar tarefas simples como apanhar lenha, colher frutos, varrer o chão ou alimentar um cavalo. Os servos podem ser usados para manter arrumada e organizada uma mansão ou pequena torre ou para preparar um acampamento nos ermos para você e seus aliados (veja a perícia Sobrevivência, na página 123). Eles também podem ajudá-lo em tarefas mais complexas, como fazer uma pesquisa ou preparar uma poção, mas isso consome sua energia mágica. Você pode “gastar” um servo para receber um bônus não cumulativo de +2 em um teste de perícia (exceto testes de ataque e resistência). Os servos não são criaturas reais; não podem lutar, nem resistir a qualquer dano ou efeito que exija um teste de resistência ou teste oposto — falharão automaticamente no teste e serão destruídos.',
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
    area: 'Cone de 6m',
    duracao: 'Cena',
    resistencia: 'Vontade Parcial',
    school: 'Encan',
    description:
      'Humanoides na área são acometidos de grande tristeza, adquirindo as condições fraco e frustrado. Se passarem na resistência, adquirem essas condições por uma rodada.',
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
        text: 'além do normal, criaturas que falhem na resistência ficam aos prantos (pasmos) por 1 rodada (apenas uma vez por cena). Requer 3º círculo.',
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
    description:
      'Você toca uma criatura, gravando uma marca mística no corpo dela enquanto profere uma ordem, como “não ataque a mim ou meus aliados”, “siga-me” ou “não saia desta sala”. A criatura deve seguir essa ordem, gastando todas as ações de seu turno para isso. A ordem não pode ser genérica demais (como “ajude-me”, por exemplo), nem forçar o alvo a atos suicidas. A cada rodada, o alvo pode fazer um teste de Vontade. Se passar, a magia é dissipada.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda a duração para um dia. Se não estiver em combate, a criatura só pode fazer o teste de Vontade a cada hora. Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: 'sempre que o alvo fizer o teste de Vontade e falhar, a marca causa 3d6 pontos de dano psíquico. Requer 3º círculo.',
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
    description:
      'Esta famosa magia de ataque cria uma poderosa explosão, causando 6d6 pontos de dano de fogo em todas as criaturas e objetos livres na área.',
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
        text: 'muda a duração para um dia ou até ser descarregada. Em vez do normal, você cria uma pequena pedra flamejante, que pode detonar como uma reação, descarregando a magia. A pedra pode ser usada como uma arma de arremesso com alcance curto. Uma vez detonada, causa o dano da magia numa área de esfera com 6m de raio.',
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
    description:
      'Você dispara um projétil que causa 4d6 pontos de dano de ácido. Se falhar no teste de resistência, o alvo fica coberto por um muco corrosivo, sofrendo mais 2d6 de dano de ácido no início de seus dois próximos turnos. Se lançada contra um objeto que não esteja em posse de uma criatura a magia causa dano dobrado e ignora a RD do objeto.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, se o alvo coberto pelo muco ácido estiver usando armadura ou escudo, o é corroído. Isso reduz o bônus na Defesa do em 1 ponto permanentemente. O pode ser consertado, restaurando seu bônus (veja Ofício, na página 121).',
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
    area: 'Linha',
    duracao: 'Instantânea',
    resistencia: 'Reflexos reduz à metade',
    school: 'Evoc',
    description:
      'Você dispara um poderoso raio que causa 6d6 pontos de dano de eletricidade em todas as criaturas e objetos livres na área. ',
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
    alcance: '9m',
    area: 'Cone',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    school: 'Evoc',
    description:
      'Você sopra ar gélido que causa 4d6 pontos de dano de frio (Fortitude reduz à metade). Criaturas de tamanho Médio ou menor que falhem na resistência ficam caídas e são empurradas 6m na direção oposta. Se houver uma parede ou outro objeto sólido (mas não uma criatura) no caminho, a criatura para de se mover, mas sofre +2d6 pontos de dano de impacto.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano de frio em +2d6.',
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
    description:
      'Esta magia lhe concede um rosto idealizado, porte físico garboso, voz melodiosa e olhar sedutor. Caso seu Carisma seja 5 ou mais, você recebe +2 neste atributo. Do contrário, ele se torna 5 (isso conta como um bônus). Além disso, você recebe +5 em Diplomacia e Enganação. Quando a magia acaba, quaisquer observadores percebem a mudança e tendem a suspeitar de você. Da mesma maneira, pessoas que o viram sob o efeito da magia sentirão que “algo está errado” ao vê-lo em condições normais. Quando a cena acabar, você pode gastar os PM da magia novamente como uma ação livre para mantê-la ativa. Este efeito não fornece PV ou PM adicionais.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para toque e o alvo para 1 humanoide.',
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
    description:
      'O alvo fica com sua imagem nublada, como se vista através de um líquido, recebendo os efeitos de camuflagem leve.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda a duração para sustentada. A imagem do alvo fica mais distorcida, aumentando a chance de falha da camuflagem leve para 50%.',
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
    description:
      'Esta magia altera os sons emitidos pelo alvo. Ela não é capaz de criar sons, mas pode omiti-los (como fazer uma carroça ficar silenciosa) ou transformá-los (como fazer uma pessoa ficar com voz de passarinho). Você não pode criar sons que não conhece (não pode fazer uma criatura falar num idioma que não conheça). Uma vez que escolha a alteração, ela não pode ser mudada. Um conjurador que tenha a voz modificada drasticamente não poderá lançar magias.',
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
    execucao: 'Livre',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 Rodada',
    resistencia: '',
    school: 'Ilusão',
    description:
      'O alvo fica invisível (incluindo seu equipamento). Um personagem invisível recebe camuflagem total, +10 em testes de Furtividade contra ouvir e criaturas que não possam vê-lo ficam desprevenidas contra seus ataques. A magia termina se o alvo faz uma ação hostil contra uma criatura. Ações contra objetos livres não dissipam a Invisibilidade (você pode tocar ou apanhar objetos que não estejam sendo segurados por outras criaturas). Causar dano indiretamente — por exemplo, acendendo o pavio de um barril de pólvora que vai detonar mais tarde — não é considerado um ataque. Objetos soltos pelo alvo voltam a ser visíveis e objetos apanhados por ele ficam invisíveis. Qualquer parte de um carregado que se estenda além de seu alcance corpo a corpo natural se torna visível. Uma luz nunca fica invisível (mesmo que sua fonte seja).',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a execução para ação padrão, o alcance para toque e o alvo para 1 criatura ou 1 objeto Grande ou menor.',
      },
      {
        addPm: 3,
        text: 'muda a duração para cena. Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: 'muda a duração para sustentada. Em vez do normal, o alvo gera uma esfera de invisibilidade. Não pode ser usado em conjunto com outros aprimoramentos. O alvo e todas as criaturas a até 3m dele se tornam invisíveis, como no efeito normal da magia (ainda ficam visíveis caso façam uma ação hostial). A esfera se move juntamente com o alvo; qualquer coisa que saia da esfera fica visível. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda a execução para ação padrão, o alcance para toque e o alvo para 1 criatura. A magia não é dissipada caso o alvo faça uma ação hostil. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle2Names.conjurarMortosVivos]: {
    spellCircle: spellsCircles.c2,
    nome: 'Conjurar Mortos-Vivos',
    execucao: 'Completa',
    alcance: 'Curto',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Necro',
    description:
      'Você conjura seis esqueletos capangas de tamanho Médio feitos de energia negativa em espaços desocupados dentro do alcance. Você pode gastar uma ação de movimento para fazer os mortos-vivos andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6+2 pontos de dano de trevas cada). Os esqueletos têm For 2, Des 2, Defesa 18 e todos os outros atributos nulos; eles têm 1 PV e falham automaticamente em qualquer teste de resistência ou oposto, mas são imunes a atordoamento, dano não letal, doença, encantamento, fadiga, frio, ilusão, paralisia, sono e veneno. Eles desaparecem quando são reduzidos a 0 PV ou no fim da cena. Os mortos- -vivos não agem sem receber uma ordem. Usos criativos para capangas fora de combate ficam a critério do mestre.',
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
    resistencia: 'Fortitude parcial',
    school: 'Necro',
    description:
      'Esta magia cria um crânio envolto em energia negativa. Quando atinge o alvo, ele causa 4d8+4 pontos de dano de trevas e se desfaz emitindo um som horrendo, deixando abalado o alvo e todos os inimigos num raio de 3m dele (criaturas já abaladas ficam apavoradas por 1d4 rodadas). Passar no teste de resistência diminui o dano à metade e evita a condição (as demais criaturas na área também tem direito ao teste de resistência, para evitar a condição).',
    aprimoramentos: [
      {
        addPm: 2,
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
    description:
      'Sua mão brilha com energia sombria, causando 6d6 pontos de dano de trevas. Você recupera pontos de vida iguais à metade do dano causado (se causou algum dano).',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda a resistências para nenhum como parte da execução da magia, você pode fazer um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e da magia, e recupera pontos de vida iguais à metade do dano da magia.',
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
    description:
      'Esta magia aumenta ou diminui o tamanho de um mundano em até três categorias (um objeto Enorme vira Pequeno, por exemplo). Você também pode mudar a consistência do item, deixando-o rígido como pedra ou flexível como seda (isso não altera sua RD ou PV, apenas suas propriedades físicas). Se lançar a magia num objeto de uma criatura involuntária, ela pode fazer um teste de Vontade para anulá-la.',
    school: 'Trans',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura. Em vez do normal, o alvo aumenta uma categoria de tamanho (seu equipamento se ajusta ao novo tamanho). O alvo também recebe Força +2. Um alvo involuntário pode fazer um teste de Fortitude para negar o efeito.',
      },
      {
        addPm: 3,
        text: 'muda o alcance para toque e o alvo para 1 criatura. Em vez do normal, o alvo diminui uma categoria de tamanho (seu equipamento se ajusta ao novo tamanho). O alvo também recebe Destreza +2. Um alvo involuntário pode fazer um teste de Fortitude para negar o efeito. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para toque, o alvo para 1 criatura, a duração para permanente e a resistência para Fortitude anula. Em vez do normal, se falhar na resistência o alvo e seu equipamento têm seu tamanho mudado para Minúsculo. O alvo tem seu valor de Força reduzido a –5 e seus deslocamentos reduzidos a 3m. Requer 4º círculo.',
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
    description:
      'Você muda sua aparência e forma — incluindo seu equipamento — para qualquer outra criatura, existente ou imaginada. Independentemente da forma escolhida, você recebe +20 em testes de Enganação para disfarce. Características não mencionadas não mudam. Se mudar para uma forma humanoide, pode mudar o tipo de dano (entre corte, impacto e perfuração) de suas armas (se usa uma maça e transformá-la em espada longa, ela pode causar dano de corte, por exemplo). Se quiser, pode assumir uma forma humanoide com uma categoria de tamanho acima ou abaixo da sua; nesse caso aplique os modificadores em Furtividade e testes de manobra. Se mudar para outras formas, você pode escolher uma Forma Selvagem do druida (veja no Capítulo 1). Nesse caso você não pode atacar com suas armas, falar ou lançar magias até voltar ao normal, mas recebe uma ou mais armas naturais e os bônus da forma selvagem escolhida.',
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
    description:
      'O alvo pode realizar uma ação padrão ou de movimento adicional por turno. Esta ação não pode ser usada para lançar magias e ativar engenhocas.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda a duração para cena. A ação adicional que você pode fazer é apenas de movimento. Uma criatura só pode receber uma ação adicional por turno como efeito de Velocidade.',
      },
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
    area: 'Esfera com 9m de lado',
    duracao: '1 dia',
    resistencia: 'Vontade parcial',
    school: 'Abjur',
    description:
      'Também conhecida como Lágrimas de Hyninn, esta magia é usada em tribunais e para proteger áreas sensíveis. Criaturas na área sofrem –10 em testes de Acrobacia, Enganação, Furtividade e Ladinagem e não podem mentir deliberadamente — mas podem tentar evitar perguntas que normalmente responderiam com uma mentira (sendo evasivas ou cometendo omissões, por exemplo). Uma criatura que passe na resistência tem as penalidades reduzidas para –5 e pode mentir.',
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
    alvo: '1 armadura, escudo ou vestuário',
    duracao: '1 dia',
    resistencia: '',
    school: 'Abjur',
    description:
      'Você fortalece um item, aumentando o bônus de Defesa de uma armadura ou escudo em +2. No caso de um vestuário, ele passa a oferecer +2 na Defesa (não cumulativo com armadura). Os efeitos desta magia contam como um bônus de encanto.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'o objeto oferece o mesmo bônus em testes de resistência. Requer 3º círculo.',
      },
      {
        addPm: 4,
        text: 'aumenta o bônus em +1.',
      },
      {
        addPm: 7,
        text: 'o objeto também oferece redução de dano 5. Requer 4º círculo.',
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
    description:
      'Pela duração da magia, você sabe a posição e status (PV atuais, se estão com uma condição ou sob efeito de magia...) dos alvos. Depois de lançada, a distância dos alvos não importa — a magia só deixa de detectar um alvo se ele morrer ou for para outro plano.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 1,
        text: 'aumenta a duração para um dia.',
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
    description:
      'Cria um globo flutuante e intangível, com 50cm de diâmetro. O globo mostra uma cena vista até uma semana atrás por você ou por uma criatura que você toque ao lançar a magia (mediante uma pergunta; a criatura pode fazer um teste de Vontade para anular o efeito), permitindo que outras pessoas a vejam.',
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
    description:
      'Você fortalece a mente do alvo. Ele recebe +2 em Inteligência, Sabedoria ou Carisma, a sua escolha. Esse aumento não oferece PV, PM ou perícias adicionais.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas.',
      },
      {
        addPm: 3,
        text: 'em vez do normal, o alvo recebe +2 nos três atributos mentais. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'em vez do normal, o alvo recebe +4 no atributo escolhido. Requer 4º círculo.',
      },
      {
        addPm: 12,
        text: 'em vez do normal, o alvo recebe +4 nos três atributos mentais. Requer 5º círculo.',
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
    description:
      'Você pode conversar com criaturas de qualquer raça e tipo: animal, construto, espírito, humanoide, monstro ou morto-vivo. Pode fazer perguntas e entende suas respostas, mesmo sem um idioma em comum ou se a criatura não for capaz de falar, mas respeitando os limites da Inteligência dela. A atitude dessas criaturas não é alterada, mas você pode usar a perícia Diplomacia para tentar mudar sua atitude.',
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
    description:
      'Você conjura um enxame de criaturas a sua escolha, como besouros, gafanhotos, ratos, morcegos ou serpentes. O enxame pode passar pelo espaço de outras criaturas e não impede que outras criaturas entrem no espaço dele. No final de seus turnos, o enxame causa 2d12 pontos de dano de corte a qualquer criatura em seu espaço (Fortitude reduz à metade). Você pode gastar uma ação de movimento para mover o enxame 12m.',
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
    resistencia: 'Fortitude parcial',
    school: 'Conv',
    description:
      'Ninguém sabe se Mestre Arsenal foi realmente o criador desta magia — mas ele foi o primeiro a utilizá-la. Você fecha o punho e gesticula como se estivesse golpeando o alvo, causando dano de impacto igual a 4d6 + sua Força. A vítima é empurrada 3m na direção oposta à sua. Passar no teste de resistência reduz o dano à metade e evita o empurrão.',
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
        text: 'aumenta o empurrão em +3m.',
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
    description:
      'Você cria um vínculo mental com um animal prestativo em relação a você. O Aliado Animal obedece a você no melhor de suas capacidades, mesmo que isso arrisque a vida dele. Ele funciona como um parceiro veterano, de um tipo a sua escolha entre ajudante, combatente, fortão, guardião, montaria ou perseguidor.',
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
        text: 'muda o alvo para 2 animais prestativos. Cada animal funciona como um parceiro de um tipo diferente, e você pode receber a ajuda de ambos (mas ainda precisa seguir o limite de parceiros de acordo com o seu nível de personagem). Requer 4º círculo.',
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
    description:
      'Você e os seus aliados no alcance recebem +2 em testes de perícia e rolagens de dano, e todos os seus inimigos no alcance sofrem –2 em testes de perícia e rolagens de dano. Esse efeito é cumulativo com outras magias. Componente material: T$ 25 por PM gasto em incensos ou outras oferendas.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta os bônus em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: 'aumenta as penalidades em –1 (penalidade máxima limitada pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 7,
        text: 'muda o alcance para médio. Requer 3º círculo.',
      },
      {
        addPm: 12,
        text: 'muda a duração para cena. Requer 4º círculo.',
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
    description:
      'Você pode criar, moldar, mover ou extinguir chamas e emanações de calor. Ao lançar a magia, escolha um dos efeitos na página 187.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a duração para sustentada e a resistência para Reflexos reduz à metade. Em vez do normal, você deve escolher o seguinte efeito. Labaredas: a cada rodada, você pode gastar uma ação de movimento para projetar uma labareda, acertando um alvo em alcance curto a partir da chama. O alvo sofre 4d6 pontos de dano de fogo (Reflexos reduz à metade).',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +1d6 (exceto do efeito chamejar).',
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
    description:
      'Você purifica a criatura tocada, removendo uma condição dela entre abalado, apavorado, alquebrado, atordoado, cego, confuso, debilitado, enjoado, envenenado, esmorecido, exausto, fascinado, fatigado, fraco, frustrado, lento, ofuscado, paralisado, pasmo ou surdo.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'também recupera todos os PV perdidos por veneno.',
      },
      {
        addPm: 2,
        text: 'em vez de uma, remove todas as condições listadas.',
      },
      {
        addPm: 3,
        text: 'também permite que o alvo solte qualquer amaldiçoado que esteja segurando (mas não remove a maldição do em si).',
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
    area: 'Linha',
    duracao: 'Instantânea',
    resistencia: 'Reflexos (veja o texto)',
    school: 'Evoc',
    description:
      'Você canaliza uma poderosa rajada de energia positiva que ilumina o campo de batalha. Criaturas na área sofrem 4d8 pontos de dano de luz (ou 4d12, se forem mortos-vivos) e ficam ofuscadas por uma rodada. Se passarem na resistência, sofrem metade do dano e não ficam ofuscadas.',
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
    area: 'Cilindro com 15m de raio e 15m de altura',
    duracao: 'Cena',
    resistencia: '',
    school: 'Evoc',
    description:
      'Esta magia só pode ser usada em ambientes abertos. A área fica sujeita a um vendaval — ataques à distância sofrem penalidade de –5, chamas são apagadas e névoas são dissipadas. Você também pode gerar chuva (–5 em testes de Percepção), neve (como chuva, e a área se torna terreno difícil) ou granizo (como chuva, mais 1 ponto de dano de impacto por rodada, no início de seus turnos).',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, uma vez por rodada você pode gastar uma ação padrão para fazer um raio cair sobre um alvo na área, causando 3d8 pontos de dano de eletricidade (Reflexos reduz à metade).',
      },
      {
        addPm: 2,
        text: 'aumenta o dano de raios (veja acima) em +1d8.',
      },
      {
        addPm: 3,
        text: 'se escolheu causar chuva, ela se torna mais grossa, revelando a silhueta de criaturas invisíveis na área. Criaturas Médias ou menores ficam lentas e criaturas voadoras precisam passar num teste de Atletismo por rodada ou caem ao solo (mas podem fazer testes de Acrobacia para reduzir o dano de queda, como o normal).',
      },
      {
        addPm: 3,
        text: 'se escolheu causar granizo, muda o dano para 2d6 por rodada.',
      },
      {
        addPm: 3,
        text: 'se escolheu causar neve, criaturas na área sofrem 2d6 pontos de dano de frio no início de seus turnos.',
      },
      {
        addPm: 3,
        text: 'muda a área para cilindro com 90m de raio e 90m de altura.',
      },
    ],
  },
  [spellsCircle2Names.silencio]: {
    spellCircle: spellsCircles.c2,
    nome: 'Silêncio',
    execucao: 'Padrão',
    alcance: 'Médio',
    area: 'Esfera com 6m de raio',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Ilusão',
    description:
      'Um silêncio sepulcral recai sobre a área e nenhum som é produzido nela. Enquanto estiverem na área, todas as criaturas ficam surdas. Além disso, como lançar magias exige palavras mágicas, normalmente nenhuma magia pode ser lançada dentro da área.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a área para alvo de 1 objeto. Em vez do normal, o alvo emana uma área de silêncio com 3m de raio. Se lançar a magia num objeto de uma criatura involuntária, ela tem direito a um teste de Vontade para anulá-la.',
      },
      {
        addPm: 2,
        text: 'muda a duração para cena. Em vez do normal, nenhum som pode deixar a área, mas criaturas dentro da área podem falar, ouvir e lançar magias com palavras mágicas normalmente.',
      },
    ],
  },
  [spellsCircle2Names.miasmaMefitico]: {
    spellCircle: spellsCircles.c2,
    nome: 'Miasma Mefítico',
    execucao: 'Padrão',
    alcance: 'Médio',
    area: 'Nuvem com 6m de raio',
    duracao: 'Instantânea',
    resistencia: 'Fortitude (veja texto)',
    school: 'Necro',
    description:
      'A área é coberta por emanações letais. Criaturas na área sofrem 5d6 pontos de dano de ácido e ficam enjoadas por 1 rodada. Se passarem na resistência, sofrem metade do dano e não ficam enjoadas.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda o alcance para toque, a área para alvo (1 criatura com 0 PV ou menos), a duração para instantânea, a resistência para Fortitude anula e adiciona componente material (pó de ônix no valor de T$ 10). Em vez do normal, você canaliza o Miasma contra uma vítima. Se falhar na resistência, ela morre e você recebe +2 na CD de suas magias por um dia. Se passar, fica imune a este truque por um dia.',
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
    description:
      'Você entoa cânticos maléficos que amaldiçoam uma vítima, criando efeitos variados. Ao lançar a magia, escolha entre um dos efeitos na página 204.',
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
    alvo: '1 objeto de madeira Grande ou menor',
    duracao: 'Cena',
    resistencia: '',
    school: 'Trans',
    description:
      'Você molda, retorce, altera ou repele madeira. Se lançar esta magia num objeto de uma criatura involuntária, ela tem direito a um teste de Vontade para anulá-la. Ao lançar a magia, escolha um dos efeitos na página 187.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para pessoal, o alvo para você e a duração para um dia. Você e seu equipamento se transformam em uma árvore de tamanho Grande. Nessa forma, você não pode falar ou fazer ações físicas, mas consegue perceber seus arredores normalmente. Se for atacado nessa forma, a magia é dissipada. Um teste de Sobrevivência (CD 30) revela que você não é uma árvore verdadeira.',
      },
      {
        addPm: 3,
        text: 'muda o alvo para área de quadrado com 9m de lado e a duração para cena. Em vez do normal, qualquer vegetação na área fica rígida e afiada. A área é considerada terreno difícil e criaturas que andem nela sofrem 1d6 pontos de dano de corte para cada 1,5m que avancem.',
      },
      {
        addPm: 7,
        text: 'muda o tamanho do alvo para Enorme ou menor. Requer 3º círculo.',
      },
      {
        addPm: 12,
        text: 'muda o tamanho do alvo para Colossal ou menor. Requer 4º círculo.',
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
    description:
      'Você fortalece o corpo do alvo. Ele recebe +2 em Força, Destreza ou Constituição, a sua escolha. Esse aumento não oferece PV ou PM adicionais.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda o alcance para curto e o alvo para criaturas escolhidas.',
      },
      {
        addPm: 3,
        text: 'em vez do normal, o alvo recebe +2 nos três atributos físicos. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'em vez do normal, o alvo recebe +4 no atributo escolhido. Requer 4º círculo.',
      },
      {
        addPm: 12,
        text: 'em vez do normal, o alvo recebe +4 nos três atributos físicos. Requer 5º círculo.',
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
    description:
      'O alvo é envolvido por um campo de força cor de esmeralda que impede qualquer movimento planar. Isso inclui magias de convocação (como Salto Dimensional e Teletransporte), viagens astrais e a habilidade incorpóreo.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para médio, a área para esfera com 3m de raio e o alvo para criaturas escolhidas.',
      },
      {
        addPm: 2,
        text: 'muda o efeito para criar um fio de energia cor de esmeralda que prende o alvo a um ponto no espaço dentro do alcance. O ponto precisa ser fixo, mas não precisa de nenhum apoio ou superfície (pode simplesmente flutuar no ar). O alvo não pode se afastar mais de 3m do ponto, nem fisicamente, nem com movimento planar. O fio possui 20 PV e redução de dano 20 (mas pode ser dissipado por efeitos que libertam criaturas, como o Julgamento Divino: Libertação do paladino).',
      },
      {
        addPm: 4,
        text: 'como acima, mas em vez de um fio, cria uma corrente de energia, com 20 PV e redução de dano 40.',
      },
      {
        addPm: 4,
        text: 'muda o alvo para área de cubo de 9m, a duração para permanente e adiciona componente material (chave de esmeralda no valor de T$ 2.000). Em vez do normal, nenhum tipo de movimento planar pode ser feito para entrar ou sair da área.',
      },
      {
        addPm: 9,
        text: 'muda o alcance para médio, a área para esfera com 3m de raio e o alvo para criaturas escolhidas. Cria um fio de energia (veja acima) que prende todos os alvos ao centro da área.',
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
    description:
      'Esta magia oculta a presença do alvo contra qualquer meio mágico de detecção, inclusive detectar magia. Um conjurador que lance uma magia de adivinhação para detectar a presença ou localização do alvo deve fazer um teste de Vontade. Se falhar, a magia não funciona, mas os PM são gastos mesmo assim. Se for lançada sobre uma criatura, Dificultar Detecção protege tanto a criatura quanto seu equipamento.',
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
    description:
      'Você é envolto por uma esfera mágica brilhante com 3m de raio, que detém qualquer magia de 2º círculo ou menor. Nenhuma magia pode ser lançada contra um alvo dentro do globo e magias de área não o penetram. No entanto, magias ainda podem ser lançadas de dentro para fora. Uma magia que dissipe outras magias só dissipa o globo se for usada diretamente sobre você, não o afetando se usada em área. Efeitos mágicos não são dissipados quando entram na esfera, apenas suprimidos (voltam a funcionar fora do globo, caso sua duração não tenha acabado). O globo é imóvel e não tem efeito sobre criaturas ou objetos. Após lançá-lo, você pode entrar ou sair livremente.',
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
    description:
      'Sua mente viaja até outro plano de existência, onde entra em contato com seres extraplanares como gênios e demônios. Você firma um contrato com uma dessas entidades para que o auxilie durante o dia, em troca de se alimentar de seu mana. Quando a magia é lançada, você recebe 6d6 dados de auxílio. Enquanto a magia durar, sempre que for realizar um teste de perícia, você pode gastar 1d6 (mais 1d6 para cada círculo de magias acima do 3º que puder lançar) e adicionar o resultado como bônus no teste. No entanto, sempre que rolar um “6” num desses dados, a entidade “suga” 1 PM de você. A magia termina se você gastar todos os dados, ficar sem PM ou no fim do dia (o que acontecer primeiro).',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de dados de auxílio em +1.',
      },
      {
        addPm: 8,
        text: 'Muda os dados de auxílio para d12. Sempre que rolar um resultado 12 num desses dados, a entidade “suga” 2 PM de você. Requer 4º círculo.',
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
    description:
      'Você descobre informações sobre uma criatura, objeto ou local que esteja tocando. O que exatamente você descobre depende do mestre: talvez você não descubra tudo que há para saber, mas ganhe pistas para continuar a investigação.',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda a execução para um dia, o alcance para ilimitado e adiciona componente material (cuba de ouro cheia d’água e ingredientes mágicos, no valor de T$ 1.000). Você ainda precisa ter alguma informação sobre o alvo, como um nome, descrição ou localização.',
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
    description:
      'Através de uma superfície reflexiva (bacia de água benta para clérigos, lago para druidas, bola de cristal para magos, espelho para feiticeiros etc.) você pode ver e ouvir uma criatura escolhida e seus arredores (cerca de 6m em qualquer direção), mesmo que ela se mova. O alvo pode estar a qualquer distância, mas se passar em um teste de Vontade, a magia falha. A vítima recebe bônus ou penalidades em seu teste de resistência, dependendo do conhecimento que você tiver dela.',
  },
  [spellsCircle3Names.convocacaoInstantenea]: {
    spellCircle: spellsCircles.c3,
    nome: 'Convocação Instantânea',
    execucao: 'Padrão',
    alcance: 'Ilimitado',
    alvo: '1 objeto de até 2 espaços',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Conv',
    description:
      'Você invoca um objeto de qualquer lugar para sua mão. O deve ter sido previamente preparado com uma runa pessoal sua (ao custo de T$ 5). A magia não funciona se o objeto estiver com outra criatura, mas você saberá onde ele está e quem o está carregando (ou sua descrição física, caso não conheça a criatura).',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, até 1 hora após ter lançado a magia, você pode gastar uma ação de movimento para enviar o objeto de volta para o local em que ele estava antes.',
      },
      {
        addPm: 1,
        text: 'muda o alvo para um baú Médio, a duração para permanente e adiciona sacrifício de 1 PM. Em vez do normal, você esconde o baú no Éter Entre Mundos, com até 20 espaços de equipamento. A magia faz com que qualquer objeto caiba no baú, independentemente do seu tamanho. Uma vez escondido, você pode convocar o baú para um espaço livre adjacente, ou de volta para o Éter, com uma ação padrão. Componente material: baú construído com matéria- -prima da melhor qualidade (T$ 1.000). Você deve ter em mãos uma miniatura do baú, no valor de T$ 100, para invocar o baú verdadeiro.',
      },
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para 1 objeto de até 10 espaços. Um objeto muito grande ou pesado para aparecer em suas mãos surge em um espaço adjacente a sua escolha.',
      },
    ],
  },
  [spellsCircle3Names.enxameRubroDeIchabod]: {
    spellCircle: spellsCircles.c3,
    nome: 'Enxame Rubro de Ichabod',
    execucao: 'Padrão',
    alcance: 'Médio',
    duracao: 'Sustentada',
    resistencia: 'Reflexos reduz à metade',
    school: 'Conv',
    description:
      'Você conjura um enxame de pequenas criaturas da Tormenta. O enxame pode passar pelo espaço de outras criaturas e não impede que outras criaturas entrem no espaço dele. No final de cada um de seus turnos, o enxame causa 4d12 pontos de dano de ácido a qualquer criatura em seu espaço (Reflexos reduz à metade). Você pode gastar uma ação de movimento para mover o enxame com deslocamento de 12m.',
    aprimoramentos: [
      {
        addPm: 1,
        text: ' além do normal, uma criatura que falhe no teste de Reflexos fica agarrada (o enxame escala e cobre o corpo dela). A criatura pode gastar uma ação padrão e fazer um teste de Acrobacia ou Atletismo para escapar. Se você mover o enxame, a criatura fica livre.',
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
        text: 'o enxame inclui parasitas que explodem e criam novos enxames. No início de cada um de seus turnos, role 1d6. Em um resultado 5 ou 6, um novo enxame surge adjacente a um já existente à sua escolha. Você pode mover todos os enxames com uma única ação de movimento, mas eles não podem ocupar o mesmo espaço. Requer 4º círculo.',
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
    description:
      'Esta magia transporta os alvos para um lugar a sua escolha a até 1.000km. Você precisa fazer um teste de Misticismo, com dificuldade que depende de seu conhecimento sobre o local de destino. Você não pode se teletransportar para um lugar que nunca visitou sem a descrição de alguém. Ou seja, não pode se transportar para a “sala de tesouro do rei” se nunca esteve nela nem falou com alguém que esteve. Se passar no teste, os alvos chegam ao lugar desejado. Se falhar, os alvos surgem 1d10 x 10km afastados em qualquer direção (se o destino é uma cidade costeira, você pode surgir em alto-mar). Se falhar por 5 ou mais, você chega em um lugar parecido, mas errado. E se você rolar 1 natural no teste a magia falha (mas você gasta os PM) e fica atordoado por 1d4 rodadas.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +5. ',
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
    description:
      'O alvo fica paralisado; se passar na resistência, em vez disso fica lento. A cada rodada, pode gastar uma ação completa para fazer um novo teste de Vontade. Se passar, se liberta do efeito.',
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
    description:
      'Seu toque manifesta um selo mágico na pele do alvo, que atrapalha o fluxo de mana. Pela duração da magia, sempre que o alvo realizar qualquer ação que gaste PM, deve fazer um teste de Vontade; se passar, faz a ação normalmente. Se falhar, a ação não tem efeito (mas os PM são gastos mesmo assim).',
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
    area: 'Quadrado de 6m de lado',
    duracao: 'Instantânea',
    resistencia: 'Reflexos parcial',
    school: 'Evoc',
    description:
      'Estacas de gelo irrompem do chão. Criaturas na área sofrem 4d6 de dano de corte, 4d6 de dano de frio e ficam caídas. Passar no teste de Reflexos evita o dano de corte e a queda. As estacas duram pela cena, o que torna a área afetada terreno difícil, e concedem cobertura leve para criaturas dentro da área ou atrás dela. As estacas são destruídas caso sofram qualquer quantidade de dano por fogo mágico.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o dano de frio em +2d6 e o dano de corte em +2d6.',
      },
      {
        addPm: 4,
        text: 'muda a área para cilindro com 6m de raio e 6m de altura e a duração para sustentada. Em vez do normal, a magia cria uma tempestade de granizo que causa 3d6 pontos de dano de impacto e 3d6 pontos de dano de frio em todas as criaturas na área (sem teste de resistência). A tempestade fornece camuflagem leve às criaturas dentro dela e deixa o piso escorregadio. Piso escorregadio conta como terreno difícil e obriga criaturas na área a fazer testes de Acrobacia para equilíbrio (veja o Capítulo 2). Requer 4º círculo.',
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
    description:
      'Esta magia foi desenvolvida pelo mago imortal Aleph Olhos Vermelhos, um entusiasta dos estudos vulcânicos. Ela dispara um projétil de magma contra o alvo, que sofre 4d6 pontos de dano de fogo e 4d6 pontos de dano de perfuração e fica em chamas. As chamas causam 2d6 pontos de dano por rodada, em vez do dano normal. Se passar no teste de resistência, o alvo sofre metade do dano e não fica em chamas. Respingos de rocha incandescente se espalham com a explosão, atingindo todas as criaturas adjacentes ao alvo, que devem fazer um teste de Reflexos. Se falharem, ficam em chamas, como descrito acima.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o dano inicial em +2d6 e o dano do efeito em chamas em +1d6.',
      },
      {
        addPm: 4,
        text: 'muda a duração para cena ou até ser descarregada. Em vez do efeito normal, a magia cria quatro dardos de lava que flutuam ao lado do conjurador. Uma vez por rodada, como uma ação livre, você pode disparar um dos dardos em uma criatura, causando o efeito normal da magia. Requer 4º círculo.',
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
    description:
      'Uma muralha de um elemento a sua escolha se eleva da terra. Ela pode ser um muro de até 30m de comprimento e 3m de altura (ou o contrário) ou uma cúpula de 3m de raio. Os efeitos variam conforme o elemento escolhido.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano por atravessar a muralha em +2d6.',
      },
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
    area: 'Cubo de 9m',
    duracao: 'Cena',
    resistencia: 'Vontade Anula',
    school: 'Ilusão',
    description:
      'Você cria uma ilusão de algum perigo mortal. Quando a magia é lançada, criaturas na área devem fazer um teste de Vontade; uma falha significa que a criatura acredita que a ilusão é real e sofre 3d6 pontos de dano psíquico não letal. Sempre que uma criatura iniciar seu turno dentro da área, deve repetir o teste de Vontade. Se falhar, sofre o dano novamente. Somente criaturas que falham veem a ilusão, e racionalizam o efeito sempre que falham no teste (por exemplo, acredita que o mesmo teto pode cair sobre ela várias vezes).',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o dano em +2d6.',
      },
      {
        addPm: 4,
        text: 'muda a área para um cubo de 90m. Requer 4º círculo.',
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
    description:
      'Você fica coberto por um manto de energia sombria. Nesta forma, torna-se incorpóreo (inclui seu equipamento): só pode ser afetado por armas e habilidades mágicas, ou por outras criaturas incorpóreas, e pode atravessar objetos sólidos, mas não manipulá-los. Também não pode atacar criaturas normais (mas ainda pode lançar magias nelas). Além disso, se torna vulnerável à luz direta: se exposto a uma fonte de luz, sofre 1 ponto de dano por rodada. Você pode gastar uma ação de movimento e 1 PM para “entrar” em uma sombra do seu tamanho ou maior e se teletransportar para outra sombra, também do seu tamanho ou maior, em alcance médio.',
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
    area: 'Cubo de até 90m de lado',
    duracao: '1 dia',
    resistencia: 'Vontade desacredita',
    school: 'Ilusão',
    description:
      'Você faz um terreno parecer outro, incluindo sons e cheiros. Uma planície pode parecer um pântano, uma floresta pode parecer uma montanha etc. Esta magia pode ser usada para criar armadilhas: areia movediça pode parecer terra firme ou um precipício pode parecer um lago. Você pode alterar, incluir e esconder estruturas dentro da área, mas não criaturas (embora elas possam se esconder nas estruturas ilusórias).',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'além do normal, pode alterar a aparência de criaturas escolhidas na área, como se usando Disfarce Ilusório.',
      },
      {
        addPm: 9,
        text: 'muda a duração para permanente e adiciona componente material (pó de diamante no valor de T$ 1.000). Requer 4º círculo.',
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
    description: '',
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
    area: 'Esfera com 6m de raio',
    duracao: 'Cena',
    resistencia: '',
    school: 'Necro',
    description:
      'Um círculo de energias sombrias se abre no chão, de onde surgem tentáculos feitos de treva viscosa. Ao lançar a magia e no início de cada um de seus turnos, você faz um teste da manobra agarrar (usando seu bônus de Misticismo) contra cada criatura na área. Se você passar, a criatura é agarrada; se a vítima já está agarrada, é esmagada, sofrendo 4d6 pontos de dano de trevas. A área conta como terreno difícil. Os tentáculos são imunes a dano.',
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
    description:
      'Sua pele ganha aspecto e dureza de rocha. Você recebe redução de dano 5.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para toque e o alvo para 1 criatura.',
      },
      {
        addPm: 4,
        text: 'muda a duração para um dia.',
      },
      {
        addPm: 4,
        text: 'sua pele ganha aspecto e dureza de aço. Você recebe redução de dano 10. Requer 4º círculo.',
      },
      {
        addPm: 4,
        text: 'muda o alcance para toque, o alvo para 1 criatura, a duração para 1d4 rodadas e adiciona Resistência: Fortitude anula. Em vez do efeito normal, a magia transforma o alvo e seu equipamento em uma estátua inerte e sem consciência. A estátua possui os mesmos PV da criatura e redução de dano 8; se for quebrada, a criatura morrerá. Requer 4º círculo.',
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
    description:
      'Você move objetos ou criaturas se concentrando. Ao lançar a magia, escolha uma das opções da página 208.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o tamanho máximo da criatura em uma categoria (para Grande, Enorme e Colossal) ou dobra a quantidade de espaços do objeto.',
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
    description:
      'Você se torna uma máquina de combate, ficando mais forte, rápido e resistente. Você recebe +6 na Defesa, testes de ataque e rolagens de dano corpo a corpo, e 30 PV temporários. Durante a Transformação de Guerra você não pode lançar magias, mas se torna proficiente em todas as armas.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta os bônus na Defesa, testes de ataque e rolagens de dano corpo a corpo em +1, e os PV temporários em +10.',
      },
      {
        addPm: 2,
        text: 'adiciona componente material (barra de adamante no valor de T$ 100). Sua forma de combate ganha um aspecto metálico e sem expressões. Além do normal, você recebe redução de dano 10 e imunidade a atordoamento e efeitos de cansaço, encantamento, metabolismo, trevas e veneno, e não precisa respirar.',
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
    description:
      'Você recebe deslocamento de voo 12m. Voar por meio desta magia é simples como andar — você pode atacar e lançar magias normalmente enquanto voa. Quando a magia termina, você desce lentamente até o chão, como se estivesse sob efeito de Queda Suave.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para toque e o alvo para 1 criatura.',
      },
      {
        addPm: 4,
        text: 'muda a duração para um dia. Requer 4º círculo.',
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
    execucao: '1d3+1 rodadas',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Vontade Parcial',
    school: 'Abjur',
    description:
      'Você expulsa uma criatura não nativa de Arton. Um alvo nativo de outro mundo (como muitos espíritos), é teletransportado de volta para um lugar aleatório de seu mundo de origem. Já um alvo morto-vivo tem sua conexão com as energias negativas rompidas, sendo reduzido a 0 PV. Se passar na resistência, em vez dos efeitos acima, o alvo fica enjoado por 1d4 rodadas. Se você tiver um ou mais itens que se oponham ao alvo de alguma maneira, a CD do teste de resistência aumenta em +2 por item. Por exemplo, se lançar a magia contra demônios do frio (vulneráveis a água benta e que odeiam luz e calor) enquanto segura um frasco de água benta e uma tocha acesa, a CD aumenta em +4. O mestre decide se determinado é forte o bastante contra a criatura para isso.',
    aprimoramentos: [
      {
        addPm: 0,
        text: 'muda a resistência para nenhum. Em vez do normal, devolve automaticamente uma criatura conjurada (como por uma magia de convocação) para seu plano de origem.',
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
    description:
      'Você protege o alvo contra efeitos mágicos nocivos. O alvo recebe +5 em testes de resistência contra magias.',
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
    description:
      'Após uma breve união com a natureza local, você obtém informações e intuições sobre a região em que está, numa distância equivalente a um dia de viagem. Você recebe 6d4 dados de auxílio. Enquanto a magia durar, sempre que for realizar um teste de perícia em áreas naturais, você pode gastar 2d4 (mais 2d4 para cada círculo de magias acima do 3º que puder lançar) e adicionar o resultado rolado como bônus no teste. A magia termina se você ficar sem dados.',
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
    description:
      'Você pede a sua divindade que envie um espírito para ajudá-lo. Esse espírito realiza uma tarefa a sua escolha que possa ser cumprida em até uma hora — desde algo simples como “use suas asas para nos levar até o topo da montanha” até algo complexo como “escolte esses camponeses até o castelo”. A magia é descarregada quando a criatura cumpre a tarefa, retornando a seu plano natal. O tipo de criatura é escolhido pelo mestre, de acordo com as necessidades da tarefa.',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda a duração para um dia ou até ser descarregada. O espírito realiza uma tarefa a sua escolha que exija até um dia. O custo do pagamento aumenta para T$ 500. O resto segue normal.',
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
    description:
      'Como parte da execução, você entra em uma árvore adjacente que seja maior do que você. Você pode permanecer dentro da árvore, percebendo os arredores de forma normal (mas sem poder fazer ações). Você pode gastar uma ação de movimento para sair dessa árvore, ou de qualquer outra dentro de 1km. Se estiver dentro de uma árvore que seja destruída, a magia termina e você sofre 10d6 pontos de dano de impacto. Enquanto a magia durar você pode gastar uma ação de movimento e 1 PM para entrar em outras árvores.',
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
    description:
      'Você desperta a consciência de um animal ou planta. O alvo se torna um parceiro veterano de um tipo a sua escolha entre ajudante, combatente, fortão, guardião, médico, perseguidor ou vigilante. Se usar esta magia em um parceiro que já possua, o nível de poder de um de seus tipos aumenta em um passo (iniciante para veterano, veterano para mestre). Se já for um parceiro mestre, recebe o bônus de outro tipo de parceiro iniciante (entre as escolhas acima). O alvo se torna uma criatura racional, com Inteligência –1, e pode falar.',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda o alvo para 1 escultura mundana inanimada. Além do normal, o alvo tem as mesmas características de um construto.',
      },
      {
        addPm: 4,
        text: 'muda a duração para permanente e adiciona penalidade de –3 PM.',
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
    description:
      'Esta magia imbui uma criatura com coragem e valentia. O alvo fica imune a medo e recebe 40 PV temporários e +4 em testes de ataque e rolagens de dano contra o inimigo de maior ND na cena.',
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
    description:
      'Esta magia obriga o alvo a cumprir uma tarefa a sua escolha. Ela dura uma semana ou até o alvo cumprir a tarefa, o que vier primeiro. O alvo pode recusar a missão — mas, no fim de cada dia em que não se esforçar para cumprir a tarefa, deve fazer um teste de Vontade; se falhar, sofre uma penalidade cumulativa de –2 em todos os testes e rolagens. A Missão Divina não pode forçar um ato suicida, nem uma missão impossível (como matar um ser que não existe).',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para toque, a duração para permanente e adiciona penalidade de –1 PM. Em vez do normal, você inscreve uma marca (como uma tatuagem) na pele do alvo e escolhe um tipo de ação que ativará a marca. Normalmente, será cometer um crime (roubar, matar...) ou outra coisa contrária às Obrigações & Restrições de sua divindade. Sempre que a marca é ativada, o alvo recebe uma penalidade cumulativa de –2 em todos os testes. Muitas vezes, portar essa marca é um estigma por si só, já que esta magia normalmente é lançada em criminosos ou traidores. Uma magia que dissipe outras suprime a marca e suas penalidades por um dia; elas só podem ser totalmente removidas pelo conjurador original ou pela magia Purificação.',
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
    area: 'cilindro com 3m de raio e 30m de altura.',
    duracao: 'Instantânea',
    resistencia: 'Reflexos reduz à metade',
    school: 'Evoc',
    description:
      'Um pilar de fogo sagrado desce dos céus, causando 6d6 pontos de dano de fogo mais 6d6 pontos de dano de luz nas criaturas e objetos livres na área.',
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
    area: 'Esfera com 6m de raio',
    duracao: 'Veja o texto',
    resistencia: '',
    school: 'Evoc',
    description:
      'Esta magia cria um forte brilho (multicolorido ou de uma cor que remeta a sua divindade) que causa diversos efeitos. Todas as magias de 3º círculo ou menor ativas na área são dissipadas se você passar num teste de Religião contra a CD de cada magia. Seus aliados na área recebem +4 em testes de resistência e redução de trevas 10 até o fim da cena, protegidos por uma aura sutil da mesma cor. Inimigos na área ficam cegos por 1d4 rodadas (apenas uma vez por cena). Dispersar as Trevas anula Anular a Luz (este efeito tem duração instantânea).',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus nas resistências em +1.',
      },
      {
        addPm: 4,
        text: 'muda o alcance para curto, a área para alvo 1 criatura e a duração para cena. O alvo fica imune a efeitos de trevas.',
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
    area: 'Cone de 9m',
    duracao: 'Instantânea',
    resistencia: '',
    school: 'Evoc',
    description:
      'Você enche seus pulmões de luz e energia positiva e sopra um cone de poeira reluzente. O sopro afeta apenas seus aliados na área, curando 2d8+4 pontos de vida e removendo uma das seguintes condições de todos os alvos: abalado, atordoado, apavorado, alquebrado, cego, confuso, debilitado, enfeitiçado, enjoado, esmorecido, exausto, fascinado, fatigado, fraco, frustrado, lento, paralisado, pasmo e surdo.',
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
    description:
      'Esta magia cria uma onda de escuridão que causa diversos efeitos. Magias de até 3º círculo na área são dissipadas se você passar num teste de Religião contra a CD de cada uma. Seus aliados na área são protegidos por uma aura sombria e recebem +4 na Defesa até o fim da cena. Inimigos na área ficam enjoados por 1d4 rodadas (apenas uma vez por cena). Anular a Luz anula Dispersar as Trevas (este efeito tem duração instantânea).',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus na Defesa em +1.',
      },
      {
        addPm: 4,
        text: 'muda as magias dissipadas para até 4º círculo. Requer 4º círculo.',
      },
      {
        addPm: 9,
        text: 'muda as magias dissipadas para até 5º círculo. Requer 5º círculo.',
      },
    ],
  },
  [spellsCircle3Names.poeiraDaPodridao]: {
    spellCircle: spellsCircles.c3,
    nome: 'Poeira da Podridão',
    execucao: 'Padrão',
    alcance: 'Médio',
    area: 'Nuvem com 6m de raio',
    duracao: 'Cena',
    resistencia: 'Fortitude',
    school: 'Necro',
    description:
      'Você manifesta uma nuvem de poeira carregada de energia negativa, que apodrece lentamente as criaturas na área. Ao lançar a magia, e no início de seus turnos, criaturas na área sofrem 2d8+8 pontos de dano de trevas (Fortitude reduz à metade). Alvos que falharem no teste não podem recuperar PV por uma rodada.',
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
    description:
      'Esta magia transforma o cadáver de um humanoide, animal ou monstro em um esqueleto ou zumbi (conforme o estado de conservação do corpo). O morto-vivo então obedece a todos os seus comandos, mesmo suicidas. Se quiser que o morto-vivo o acompanhe, ele funciona como um parceiro iniciante, de um tipo a sua escolha entre ajudante, atirador, combatente, fortão, guardião ou montaria. Uma vez por rodada, quando sofre dano, você pode sacrificar um servo morto-vivo e evitar esse dano. O servo é destruído no processo e não pode ser reanimado.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda o componente material para pó de ônix negro (T$ 500). Em vez de um zumbi ou esqueleto, cria um carniçal. Ele pode funcionar como um parceiro veterano, escolhido entre ajudante, atirador, combatente, fortão ou guardião. O resto segue normal.',
      },
      {
        addPm: 3,
        text: 'muda o componente material para pó de ônix negro (T$ 500). Em vez de um zumbi ou esqueleto, cria uma sombra. Ela pode funcionar como um parceiro veterano, escolhido entre assassino, combatente ou perseguidor. O restante da magia segue normal.',
      },
      {
        addPm: 7,
        text: 'muda o componente material para ferramentas de embalsamar (T$ 1.000). Em vez de um zumbi ou esqueleto, cria uma múmia. Ela pode funcionar como um parceiro mestre, escolhido entre ajudante, destruidor, guardião ou médico. O restante da magia segue normal. Requer 4º círculo.',
      },
    ],
  },
  [spellsCircle3Names.controlarAgua]: {
    spellCircle: spellsCircles.c3,
    nome: 'Controlar Água',
    execucao: 'Padrão',
    alcance: 'Longo',
    area: 'Esfera com 30m de raio',
    duracao: 'Cena',
    resistencia: 'Ver texto',
    school: 'Trans',
    description:
      'Você controlar os movimentos e comportamentos da água. Ao lançar a magia, escolha um dos efeitos na página 186.',
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
    area: '9 cubos com 1,5 metros de lado',
    duracao: 'Instantânea',
    resistencia: 'Ver texto',
    school: 'Trans',
    description:
      'Você manipula a densidade e a forma de toda terra, pedra, lama, argila ou areia na área. Ao lançar a magia, escolha um dos efeitos na página 188.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o número de cubos de 1,5m em +2.',
      },
      {
        addPm: 1,
        text: 'muda o alcance para pessoal, o alvo para você e a duração para um dia. Você e seu equipamento fundem-se a uma superfície ou objeto adjacente feito de pedra, terra, argila ou areia que possa acomodá-lo. Você pode voltar ao espaço adjacente como uma ação livre, dissipando a magia. Enquanto mesclado, você não pode falar ou fazer ações físicas, mas consegue perceber seus arredores normalmente. Pequenos danos não o afetam, mas se o objeto (ou o trecho onde você está imerso) for destruído, a magia é dissipada, você volta a um espaço livre adjacente e sofre 10d6 pontos de dano de impacto.',
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
    description:
      'Você canaliza o poder de sua divindade. Você aumenta uma categoria de tamanho (seu equipamento muda de acordo) e recebe Força +4 e RD 10. Você não pode lançar magias enquanto estiver sob efeito de Potência Divina.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus de Força em +1.',
      },
      {
        addPm: 5,
        text: 'aumenta a RD em +5.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura. A magia falha se você e o alvo não forem devotos da mesma divindade.',
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
    description:
      'Você é cercado por uma barreira invisível com 3m de raio que o acompanha. Qualquer habilidade mágica ou mágico que entre na área da barreira é suprimida enquanto estiver lá. Criaturas convocadas que entrem em um Campo Antimagia desaparecem. Elas reaparecem na mesma posição quando a duração do Campo termina — supondo que a duração da magia que as convocou ainda não tenha terminado. Criaturas mágicas ou imbuídas com magia durante sua criação não são diretamente afetadas pelo Campo Antimagia. Entretanto, como qualquer criatura, não poderão usar magias ou habilidades mágicas dentro dele. Uma magia que dissipa outras não dissipa um Campo Antimagia, e dois Campos na mesma área não se neutralizam. Artefatos e deuses maiores não são afetados por um Campo Antimagia.',
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
    description:
      'O alvo fica imune a efeitos de movimento e ignora qualquer efeito que impeça ou restrinja seu deslocamento. Por fim, pode usar habilidades que exigem liberdade de movimentos mesmo se estiver usando armadura ou escudo.',
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
    description:
      'Você entra nos sonhos de uma criatura. Uma vez lá, pode conversar com ela até que ela acorde. Se o alvo não estiver dormindo quando você lançar a magia, você pode permanecer em transe até que ele adormeça. Durante o transe, você fica indefeso e sem consciência dos arredores. Você pode sair do transe quando quiser, mas a magia termina.',
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
    description:
      'Você enxerga a forma real das coisas. Você pode ver através de camuflagem e escuridão (normais e mágicas), assim como efeitos de ilusão e transmutação (enxergando a verdade como formas translúcidas ou sobrepostas).',
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
    description:
      'Esta magia transforma uma porção de um elemento inerte em uma criatura elemental Grande do tipo do elemento alvo. Por exemplo, lançar esta magia numa fogueira ou tocha cria um elemental do fogo. Você pode criar elementais do ar, água, fogo e terra com essa magia. O elemental obedece a todos os seus comandos e pode funcionar como um parceiro do tipo destruidor (cuja habilidade custa apenas 2 PM para ser usada) e mais um tipo entre os indicados na lista (pág. 185), ambos mestres. O elemental auxilia apenas você e não conta em seu limite de parceiros.',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'o elemental muda para Enorme e recebe dois tipos de parceiro indicados no seu elemento.',
      },
      {
        addPm: 5,
        text: 'você convoca um elemental de cada tipo. Quando lança a magia, você pode escolher se cada elemental vai auxiliar você ou um aliado no alcance. Requer 5º círculo.',
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
    description:
      'Esta magia cria uma mão flutuante Grande que sempre se posiciona entre você e um oponente a sua escolha. A mão fornece cobertura leve (+5 na Defesa) contra esse oponente. Nada é capaz de enganar a mão — coisas como escuridão, invisibilidade, metamorfose e disfarces mundanos não a impedem de protegê-lo. A mão tem Defesa 20 e PV e resistências iguais aos seus. Com uma ação de movimento, você pode comandar a mão para que o proteja de outro oponente ou para que realize uma das ações da página 198.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +1d6+5.',
      },
      {
        addPm: 5,
        text: 'muda o bônus adicional em Misticismo para +20. Requer 5º círculo.',
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
    description:
      'Você viaja instantaneamente para outro plano da Criação. Lá, você chega de 10 a 1.000km do destino pretendido (role 1d100 e multiplique por 10km). Componente material: um bastão de metal precioso em forma de forquilha (no valor de T$ 1.000). O tipo de metal determina para qual plano de existência você será enviado. Os metais que levam a dimensões específicas podem ser difíceis de encontrar, de acordo com o mestre.',
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
    description:
      'Você invade a mente do alvo e altera ou apaga suas memórias da última hora.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para pessoal e o alvo para área cone de 4,5m.',
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
    description:
      'Esta magia manipula o sistema nervoso do alvo. Ao sofrer a magia, e no início de cada um de seus turnos, a vítima faz um teste de Fortitude. Se passar, a magia é anulada. Se falhar, todas as suas ações físicas naquele turno estarão sob controle do conjurador. A vítima ainda tem consciência de tudo que acontece à sua volta, podendo ver, ouvir e até falar com certo esforço (mas não para lançar magias). Contudo, seu corpo realiza apenas os movimentos que o conjurador deseja. A vítima pode ser manipulada para se movimentar, lutar, usar habilidades de combate... Enfim, qualquer coisa de que seja fisicamente capaz. Você precisa de linha de efeito para controlar a vítima. Se perder o contato, não poderá controlá-la — mas ela estará paralisada até que o conjurador recupere o controle ou a magia termine.',
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
    description:
      'Você dispara um raio azul esbranquiçado de gelo e ar congelante. O alvo sofre 10d8 pontos de dano de frio e fica preso em um bloco de gelo (paralisado). Se passar no teste de resistência, sofre metade do dano e, em vez de paralisado, fica lento por uma rodada. É possível quebrar o gelo para libertar uma criatura presa: o bloco tem 20 PV, RD 10 e é vulnerável a fogo. Uma criatura presa pode gastar uma ação completa para fazer um teste de Atletismo e se libertar do gelo; cada vez que passar no teste causa 10 pontos de dano ao bloco, ignorando a RD.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o dano em +2d8.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para área de esfera com 6m de raio. Em vez de um raio, você dispara uma bola de gelo que explode, causando o efeito da magia em todas as criaturas na área.',
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
    description:
      'Esta é uma magia poderosa, desenvolvida pelo metódico e impassível arquimago Reynard. Você invoca as energias elementais do fogo e do relâmpago, fazendo com que uma de suas mãos fique em chamas e a outra mão eletrificada. Pela duração da magia, você pode gastar uma ação de movimento para disparar uma bola de fogo (10d6 pontos de dano de fogo numa esfera com 6m de raio) ou um relâmpago (10d6 pontos de dano de eletricidade numa linha). Você também pode, como uma ação padrão, usar as duas mãos num ataque de energia mista (20d12 pontos de dano, metade de fogo e metade de eletricidade, numa esfera com 9m de raio). Você precisa estar com as duas mãos livres para invocar o efeito misto e isso consome toda a energia da magia, terminando-a imediatamente. Por se tratar de um ritual complexo, o tempo de execução dessa magia não pode ser reduzido.',
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
    alcance: 'Pessoal',
    area: 'Cone de 9m',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    school: 'Evoc',
    description:
      'Esta magia cruel foi desenvolvida pelo mago de combate Edauros, quando ainda era um bípede. Você faz um gesto rápido e dispara uma lâmina de ar em alta velocidade. Criaturas na área sofrem 10d8 pontos de dano de corte e ficam sangrando. Alvos que passem no teste de resistência sofrem metade do dano e não ficam sangrando.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em +2d8.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para você, a duração para sustentada e o efeito para uma vez por rodada, como uma ação de movimento, você pode disparar uma lâmina de ar contra um alvo em alcance médio, causando 6d8 pontos de dano de corte (Fortitude reduz à metade).',
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
    description:
      'Você cria uma cópia ilusória semirreal de... você mesmo! Ela é idêntica em aparência, som e cheiro, mas é intangível. A cada turno, você escolhe se verá e ouvirá através da duplicata ou de seu corpo original. A cópia reproduz todas as suas ações, incluindo fala. Qualquer magia com alcance de toque ou maior que você lançar pode se originar da duplicata, em vez do seu corpo original. As magias afetam outros alvos normalmente, com a única diferença de se originarem da cópia, em vez de você. Se quiser que a duplicata faça algo diferente de você, você deve gastar uma ação de movimento. Qualquer criatura que interagir com a cópia tem direito a um teste de Vontade para perceber que é uma ilusão. As magias que se originam dela, no entanto, são reais. A cópia desaparece se sair do alcance.',
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
    area: 'Esfera de 6m',
    duracao: 'Instantânea',
    resistencia: 'Fortitude Parcial',
    school: 'Ilusão',
    description:
      'Esta magia cria uma forte explosão de luzes estroboscópicas e sons cacofônicos que desorientam as criaturas atingidas. O efeito que cada criatura sofre depende do nível ou ND dela (ver página 193).',
  },
  [spellsCircle4Names.assassinoFantasmagorico]: {
    spellCircle: spellsCircles.c4,
    nome: 'Assassino Fantasmagórico',
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: '1 criatura',
    duracao: 'Cena, até ser descarregada',
    resistencia: 'Vontade anula, Fortitude Parcial',
    school: 'Necro',
    description:
      'Usando os medos subconscientes do alvo, você cria uma imagem daquilo que ele mais teme. Apenas a própria vítima pode ver o Assassino Fantasmagórico com nitidez; outras criaturas presentes (incluindo o conjurador) enxergam apenas um espectro sombrio. Quando você lança a magia, o espectro surge adjacente a você e a vítima faz um teste de Vontade. Se ela passar, percebe que o espectro é uma ilusão e a magia é dissipada. Se falhar, acredita na existência do espectro, que então flutua 18m por rodada em direção à vítima, sempre no fim do seu turno. Ele é incorpóreo e imune a magias (exceto magias que dissipam outras). Se o espectro terminar seu turno adjacente à vítima, ela deve fazer um teste de Fortitude. Se passar, sofre 6d6 pontos de dano de trevas (este dano não pode reduzir o alvo a menos de 0 PV e não o deixa sangrando). Se falhar, sofre um colapso, ficando imediatamente com –1 PV e sangrando. O espectro persegue o alvo implacavelmente. Ele desaparece se o alvo ficar inconsciente ou se afastar além de alcance longo dele, ou se for dissipado.',
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
    description:
      'Uma parede de ossos se eleva da terra. A parede tem 15m de comprimento, 9m de altura e 1,5m de espessura. Ela pode ter qualquer forma — não precisa ser uma linha reta —, mas sua base precisa estar sempre tocando o solo. Quando a parede surge, criaturas na área ocupada ou adjacentes sofrem 4d8 pontos de dano de corte e precisam fazer um teste de Reflexos para não ficarem presas no emaranhado de ossos. Uma criatura presa dessa maneira fica agarrada, e pode gastar uma ação padrão para fazer um teste de Atletismo para se soltar. Se passar no teste, sai da muralha para um dos lados adjacentes. Se falhar, sofre 4d8 pontos de dano de corte. É possível destruir o muro para atravessá-lo ou libertar uma criatura agarrada. Cada trecho de 3m do muro tem Defesa 8, 40 PV e redução de corte, frio e perfuração 10. Também é possível escalar a parede. Isso exige um teste de Atletismo e causa 4d8 pontos de dano de corte para cada 3m escalados.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o comprimento em +15m e a altura em +3m.',
      },
      {
        addPm: 5,
        text: 'o muro é feito de uma massa de esqueletos animados. Sempre que uma criatura iniciar seu turno adjacente ou escalando a muralha, deve fazer um teste de Reflexos. Se falhar fica agarrada, sofrendo os efeitos normais de estar agarrada pela magia.',
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
    description:
      'Você concede vida a objetos inanimados. Cada objeto se torna um parceiro sob seu controle. O tipo dele é escolhido da lista de tamanho e ele não conta em seu limite de parceiros. Com uma ação de movimento, você pode comandar mentalmente qualquer objeto animado dentro do alcance para que auxilie você ou outra criatura. Outros usos criativos para os objetos ficam a cargo do mestre. Objetos animados são construtos com valores de Força, Destreza e PV de acordo com seu tamanho. Todos os outros atributos são nulos, eles não têm valor de Defesa ou testes de resistência e falham automaticamente em qualquer teste oposto. Diferente de parceiros comuns, um objeto pode ser alvo de um ataque direto. Esta magia não afeta itens mágicos, nem objetos que estejam sendo carregados por outra criatura.',
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
    area: 'Cubo de 12m de lado',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Trans',
    description:
      'Você controla os efeitos da gravidade dentro da área. Ao lançar a magia, escolha um dos efeitos na página 186. Enquanto a magia durar, você pode gastar uma ação padrão para mudar o efeito.',
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
    description:
      'Você dispara um raio fino e esverdeado que causa 10d12 pontos de dano de essência. Se o alvo passar no teste de resistência, em vez disso sofre 2d12 pontos de dano. Independentemente do resultado do teste de Fortitude, se os PV do alvo forem reduzidos a 0 ou menos, ele será completamente desintegrado, restando apenas pó.',
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
    description:
      'Você e todo o equipamento que está com você são transportados para o plano etéreo, que existe paralelamente ao plano material (o mundo físico). Na prática, é como ser transformado em um fantasma (mas você ainda é considerado uma criatura viva). Uma criatura etérea é invisível (pode alterar entre visível e invisível como ação livre), incorpórea e capaz de se mover em qualquer direção, inclusive para cima e para baixo. Ela enxerga o plano material, mas tudo parece cinza e insubstancial, reduzindo o alcance da visão e audição para 18m. Magias de abjuração e essência afetam criaturas etéreas, mas outras magias, não. Da mesma forma, uma criatura etérea não pode atacar nem lançar magias contra criaturas no plano material. Duas criaturas etéreas podem se afetar normalmente. Uma criatura afetada pode se materializar como uma ação de movimento, encerrando a magia. Uma criatura etérea que se materialize em um espaço ocupado é jogada para o espaço não ocupado mais próximo e sofre 1d6 pontos de dano de impacto para cada 1,5m de deslocamento.',
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
    resistencia: 'Vontade anula',
    school: 'Abjur',
    description:
      'Uma cúpula de energia invisível o cerca, impedindo a aproximação de certas criaturas. Escolha um tipo de criatura  (animais, espíritos, monstros...) ou uma raça de humanoides (elfos, goblins, minotauros..). Criaturas do grupo escolhido que tentem se aproximar a menos de 3m de você (ou seja, que tentem ficar adjacentes a você) devem fazer um teste de Vontade. Se falharem, não conseguem, gastam a ação e só podem tentar novamente na rodada seguinte. Isso impede ataques corpo a corpo, mas não ataques ou outros efeitos à distância. Se você tentar se aproximar além do limite de 3m, rompe a cúpula e a magia é dissipada.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'a cúpula impede criaturas de se aproximarem a menos de 4,5m de você (ou seja, deve haver dois quadrados entre você e as criaturas).',
      },
      {
        addPm: 5,
        text: 'além do normal, criaturas afetadas também precisam fazer o teste de resistência se fizerem um ataque ou efeito à distância você. Se falharem, o efeito é desviado pela cúpula. Requer 5º círculo.',
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
    description:
      'Vislumbres do futuro permitem que você reavalie suas ações. Uma vez por rodada, você pode rolar novamente um teste recém realizado, mas deve aceitar o resultado da nova rolagem.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda a execução para reação, o alcance para curto, o alvo para 1 criatura e a duração para instantânea. Esta magia só pode ser usada em uma criatura que tenha acabado de fazer um teste. Obriga a criatura a fazer uma nova rolagem de dados e aceitar o novo resultado, seja ele um sucesso ou falha. Criaturas involuntárias têm direito a um teste de Vontade para negar o efeito.',
      },
      {
        addPm: 5,
        text: 'muda a duração para um dia.',
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
    description:
      'A magia invoca um elemental Pequeno, com a forma de um orbe feito de luz divina. A criatura é incorpórea, imune a dano e ilumina como uma tocha. O elemental tem 100 pontos de luz. Uma vez por rodada, durante o seu turno, o elemental pode se movimentar (deslocamento de voo 18m) e gastar quantos pontos de luz quiser para curar dano ou condições de criaturas em alcance curto, à taxa de 1 PV por 1 ponto de luz ou uma condição por 3 pontos de luz (entre abalado, apavorado, alquebrado, atordoado, cego, confuso, debilitado, enjoado, esmorecido, exausto, fascinado, fatigado, fraco, frustrado, ofuscado, pasmo, sangrando, surdo ou vulnerável). A magia é encerrada quando o elemental fica sem pontos de luz.',
  },
  [spellsCircle4Names.concederMilagre]: {
    spellCircle: spellsCircles.c4,
    nome: 'Conceder Milagre',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Permanente até ser descarregada.',
    resistencia: '',
    school: 'Encan',
    description:
      'Você transfere um pouco de seu poder divino a outra criatura. Escolha uma magia de até 2º círculo que você conheça; o alvo pode lançar essa magia uma vez, sem pagar o custo dela em PM (aprimoramentos podem ser usados, mas o alvo deve gastar seus próprios PM). Você sofre uma penalidade de –3 PM até que o alvo lance a magia.',
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
    area: 'Esfera com 3m de raio',
    duracao: '5 rodadas',
    resistencia: '',
    school: 'Evoc',
    description:
      'Você evoca um círculo de luz que emana uma energia poderosa. Qualquer criatura viva que termine o turno dentro do círculo recupera 3d8+3 PV e 1 PM. Mortos-vivos e criaturas que sofrem dano por luz perdem PV e PM na mesma quantidade. Uma criatura pode recuperar no máximo 5 PM por dia com esta magia.',
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
    area: 'Esfera com 6m de raio',
    duracao: 'Instantânea',
    resistencia: 'Reflexos Parcial',
    school: 'Evoc',
    description:
      'Você cria um fulgor dourado e intenso. Criaturas na área ficam cegas por 1d4 rodadas e em chamas, e sofrem 10d6 pontos de dano de fogo (mortos-vivos sofrem 10d8 pontos de dano). Uma criatura que passe no teste de resistência não fica cega nem em chamas e sofre metade do dano.',
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
    description:
      'Você invoca o poder de sua divindade na forma de um manto de energia que reveste seu corpo. Esta magia tem duas versões. Você escolhe qual versão pode lançar quando aprende esta magia. Ela não pode ser mudada.',
  },
  [spellsCircle4Names.terremoto]: {
    spellCircle: spellsCircles.c4,
    nome: 'Terremoto',
    execucao: 'Padrão',
    alcance: 'Longo',
    area: 'Esfera com 30m de raio',
    duracao: '1 rodada',
    resistencia: 'Veja o texto',
    school: 'Evoc',
    description:
      'Esta magia cria um tremor de terra que rasga o solo. O terremoto dura uma rodada, durante a qual criaturas sobre o solo ficam atordoadas (apenas uma vez por cena). Barreiras físicas não interrompem a área de Terremoto.',
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
    description:
      'Cria uma conexão entre seu corpo e o da criatura alvo, deixando uma marca idêntica na pele de ambos. Enquanto a magia durar, sempre que você sofrer qualquer dano ou condição, o alvo desta magia deve fazer um teste de Fortitude; se falhar, sofre o mesmo dano que você ou adquire a mesma condição. A magia termina se o alvo chegar a 0 pontos de vida.',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'a magia não termina se o alvo chegar a 0 PV (o que significa que dano causado por essa magia pode matá-lo).',
      },
    ],
  },
  [spellsCircle4Names.controlarOClima]: {
    spellCircle: spellsCircles.c4,
    nome: 'Controlar o Clima',
    execucao: 'Completa',
    alcance: '2km',
    area: 'Esfera com 2km de raio',
    duracao: '4d12 horas',
    resistencia: '',
    school: 'Trans',
    description:
      'Você muda o clima da área onde se encontra, podendo criar qualquer condição climática: chuva, neve, ventos, névoas... Veja o Capítulo 6: O Mestre para os efeitos do clima.',
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
    description:
      'Você se torna um conduíte da energia de sua divindade, emanando uma aura brilhante. Você e aliados devotos da mesma divindade ficam imunes a encantamento e recebem +10 na Defesa e em testes de resistência. Aliados não devotos da mesma divindade recebem +5 na Defesa e em testes de resistência. Além disso, inimigos que entrem na área devem fazer um teste de Vontade; em caso de falha, recebem uma condição a sua escolha entre esmorecido, debilitado ou lento até o fim da cena. O teste deve ser refeito cada vez que a criatura entrar novamente na área.',
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
    description:
      'Esta magia cria uma barreira mágica impenetrável que protege você contra efeitos nocivos mentais ou físicos, a sua escolha.',
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
    description:
      'Se falhar no teste de resistência, o alvo perde a habilidade de lançar magias arcanas até o fim da cena. Se passar, perde a habilidade por uma rodada.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda a área para esfera com 6m de raio e o alvo para criaturas escolhidas.',
      },
      {
        addPm: 5,
        text: 'muda a execução para um dia e adiciona custo adicional (sacrifício de 1 PM). O alvo da magia precisa ser mantido em alcance curto do conjurador durante toda a execução. Ao término, faz um teste de Vontade. Se falhar, perde a habilidade de lançar magias arcanas permanentemente. Se passar, resiste, mas ainda pode ser alvo da magia no dia seguinte. Nenhum poder mortal é capaz de reverter essa perda. Os clérigos de Wynna dizem que a deusa chora cada vez que este ritual é realizado.',
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
    description:
      'Esta magia faz com que sua consciência deixe seu corpo e se transporte instantaneamente para um local ou para perto de uma criatura alvo. Se escolher um local, ele precisa ser conhecido por você. Se escolher uma criatura, você transporta sua consciência até onde a criatura estiver, contanto que estejam no mesmo plano. Você adquire uma forma fantasmagórica invisível, mas pode se mostrar usando uma ação de movimento. Pode se mover em qualquer direção com deslocamento de voo 18m e, por ser incorpóreo, é capaz de atravessar objetos sólidos, mas fica limitado a se mover dentro dos limites do local, ou dentro de alcance curto da criatura alvo. Você pode ver e ouvir como se estivesse presente no local e pode falar mentalmente com qualquer criatura que possa ver, contanto que tenham um idioma em comum.',
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
    description:
      'Esta magia cria um vácuo capaz de sugar tudo nas proximidades. Escolha um espaço desocupado para o buraco negro. No início de cada um de seus três turnos seguintes, todas as criaturas a até alcance longo do buraco negro, incluindo você, devem fazer um teste de Fortitude. Em caso de falha, ficam caídas e são puxadas 30m na direção do buraco. Objetos soltos também são puxados. Criaturas podem gastar uma ação de movimento para se segurar em algum objeto fixo, recebendo +2 em seus testes de resistência. Criaturas e objetos que iniciem seu turno no espaço do buraco negro devem gastar uma ação de movimento e fazer um teste de Fortitude. Se passarem, podem escapar se arrastando (deslocamento de 1,5m) para longe dele. Se falharem, perdem a ação (mas podem gastar outra para tentar novamente). Se terminarem seu turno no espaço do buraco negro, são sugadas, desaparecendo para sempre. Não se conhece o destino das coisas sugadas pelo buraco negro. Alguns estudiosos sugerem que são enviadas para outros mundos — provavelmente Sombria, reino da deusa Tenebra',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'muda o efeito para que você não seja afetado.',
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
    description: 'Você pede a sua divindade para interceder diretamente.',
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
    description:
      'Você pronuncia uma palavra do idioma primordial da Criação, que causa um dos efeitos da página 200, a sua escolha.',
  },
  [spellsCircle5Names.furiaDoPanteao]: {
    spellCircle: spellsCircles.c5,
    nome: 'Fúria do Panteão',
    execucao: 'Completa',
    alcance: 'Longo',
    area: 'Cubo de 90m',
    duracao: 'Sustentada',
    resistencia: 'Veja texto',
    school: 'Evoc',
    description:
      'Você cria uma nuvem de tempestade violenta. Os ventos tornam ataques à distância impossíveis e fazem a área contar como condição terrível para lançar magia. Além disso, inimigos na área têm a visibilidade reduzida (como a magia Névoa). Uma vez por turno, você pode gastar uma ação de movimento para gerar um dos efeitos da página 194.',
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
    description:
      'Um brilho de luz, na forma de asas de fênix, emana do alvo. Ele recupera 200 pontos de vida e se cura de qualquer das seguintes condições: abalado, apavorado, alquebrado, atordoado, cego, confuso, debilitado, enjoado, envenenado, esmorecido, exausto, fascinado, fatigado, fraco, frustrado, lento, ofuscado, paralisado, pasmo ou surdo.',
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
        text: 'muda o alvo para uma criatura que tenha morrido há até uma rodada. Esta magia pode curá-la.',
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
    description:
      'Você reanima uma criatura morta recentemente (dentro da mesma cena), trazendo sua alma de volta ao corpo de forma forçada. O tipo da criatura muda para morto-vivo, mas ela retém suas memórias e habilidades de quando estava viva, podendo inclusive lançar magias. A criatura pode pensar e falar livremente, mas obedece cegamente a seus comandos. Quando a cena termina, a criatura volta a ficar morta, mas muitos clérigos malignos usam meios para guardar e preservar o corpo de criaturas poderosas para serem reanimadas dessa forma quando necessário. Se for destruída, a criatura não pode ser reanimada novamente com esta magia.',
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
    description:
      'Você rouba a alma da vítima, armazenando-a em um objeto. Se o alvo passar no teste de resistência, sente o impacto de sua alma ser puxada para fora do corpo e fica abalado por 1 rodada. Se falhar, seu corpo fica caído, inconsciente e inerte, enquanto sua alma é transportada para dentro do objeto. O corpo não envelhece nem se decompõe, permanecendo em estase. Ele pode ser atacado e destruído normalmente. O objeto escolhido deve custar T$ 1.000 por nível ou ND da criatura e não possuir uma alma presa ou se quebrará quando a magia for lançada (embora personagens não conheçam o conceito de “nível” dentro do mundo de jogo, podem ter noção do poder geral de uma criatura, estimando assim o valor do objeto). Se o objeto for destruído, a magia se esvai. Se o corpo ainda estiver disponível, a alma retorna para ele. Caso contrário, escapa para os Mundos dos Deuses. Custo adicional: sacrifício de 1 PM.',
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
    description:
      'Sua mão exala energias letais. A criatura sofre 10d8+10 pontos de dano de trevas. Se estiver com menos da metade de seus PV, em vez disso deve fazer um teste de Fortitude. Se passar, sofre o dano normal. Se falhar, seus PV são reduzidos a –10.',
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
    description:
      'Você cria uma prisão mágica para aprisionar uma criatura. Se falhar no teste de resistência, o alvo sofre o efeito da magia; se passar, fica imune a esta magia por uma semana. Enquanto estiver aprisionada, a criatura não precisa respirar e alimentar-se, e não envelhece. Magias de adivinhação não conseguem localizar ou perceber o alvo. Ao lançar a magia, você escolhe uma das formas de prisão (pág. 180). O componente material varia, mas todos custam T$ 1.000.',
  },
  [spellsCircle5Names.engenhoDeMana]: {
    spellCircle: spellsCircles.c5,
    nome: 'Engenho de Mana',
    execucao: 'padrão',
    alcance: 'Médio',
    area: 'Disco de Energia com 1,5m de diâmetro',
    duracao: 'Sustentada',
    resistencia: '',
    school: 'Abjur',
    description:
      'Você cria um disco de energia que lembra uma roda de engenho e flutua no ponto em que foi conjurado. O disco é imune a dano, não pode ser movido e faz uma contramágica automática contra qualquer magia lançada em alcance médio dele (exceto as suas), usando seu teste de Misticismo. Caso vença o teste, o engenho não só anula a magia como absorve os PM usados para lançá-la, acumulando PM temporários. No seu turno, se estiver ao alcance do disco, você pode gastar PM nele para lançar magias.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'em vez de flutuar no ponto em que foi conjurado, o disco flutua atrás de você, mantendo-se sempre adjacente.',
      },
      {
        addPm: 4,
        text: 'muda a duração para um dia.',
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
    description:
      'Sua mente visualiza todas as possibilidades de um evento, permitindo a você escolher o melhor curso de ação. Você pode rolar novamente um teste de resistência com um bônus de +10 ou um inimigo deve rolar novamente um ataque contra você com uma penalidade de –10.',
  },
  [spellsCircle5Names.chuvaDeMeteoros]: {
    spellCircle: spellsCircles.c5,
    nome: 'Chuva de Meteoros',
    execucao: 'Completa',
    alcance: 'Longo',
    area: 'Quadrado com 18m de lado',
    duracao: 'Instantânea',
    resistencia: 'Reflexos parcial',
    school: 'Conv',
    description:
      'Meteoros caem dos céus, devastando a área afetada. Criaturas na área sofrem 15d6 pontos de dano de impacto, 15d6 pontos de dano de fogo e ficam caídas e presas sob os escombros (agarradas). Uma criatura que passe no teste de resistência sofre metade do dano total e não fica caída e agarrada. Uma criatura agarrada pode escapar gastando uma ação padrão e passando em um teste de Atletismo. Toda a área afetada fica coberta de escombros, sendo considerada terreno difícil, e imersa numa nuvem de poeira (camuflagem leve). Esta magia só pode ser utilizada a céu aberto.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de meteoros que atingem a área, o que aumenta o dano em +2d6 de impacto e +2d6 de fogo.',
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
    description:
      'Você cria uma dimensão particular. Você pode entrar no semiplano gastando uma ação padrão e 10 PM, desaparecendo do plano material como se tivesse se teletransportado. Você pode levar criaturas voluntárias que esteja tocando, ao custo de 1 PM por criatura extra. Você também pode levar objetos que esteja tocando, ao custo de 1 PM por objeto Médio ou menor, 2 PM por objeto Grande, 5 PM por Enorme e 10 PM por Colossal. Uma vez no semiplano, pode gastar uma ação completa para voltar ao plano material, no mesmo local onde estava. Caso conheça a magia Viagem Planar, pode lançá-la para voltar ao plano material em outro local. Você escolhe a forma e a aparência do semiplano — uma caverna, um asteroide que singra o éter, um palacete de cristal etc. Ele contém ar, luz e calor, mas além disso é vazio. Entretanto, você pode levar itens (mobília, ferramentas etc.) a cada viagem.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'adiciona alvo (1 criatura). Você cria uma semiplano labiríntico e expulsa o alvo para ele. A cada rodada, a vítima tem direito a um teste de Investigação ou Sobrevivência, com bônus cumulativo de +1 para cada teste já realizado, para escapar do labirinto. Quando o alvo escapa, a magia termina e o alvo reaparece no plano material no mesmo local onde estava quando a magia foi lançada. Magias como Salto Dimensional e Teletransporte não ajudam a escapar do labirinto, mas Viagem Planar, sim.',
      },
      {
        addPm: 5,
        text: 'muda a duração para permanente e adiciona componente material (maquete do semiplano feita de materiais preciosos no valor de T$ 5.000). Você pode lançar a magia diversas vezes para aumentar as dimensões do semiplano em +30m de lado a cada vez.',
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
    description:
      'Você domina a mente dos alvos. Os alvos obedecem cegamente a seus comandos, exceto ordens claramente suicidas. Um alvo tem direito a um teste no final de cada um de seus turnos para se livrar do efeito. Alvos que passarem no teste ficam abalados por 1 rodada enquanto recuperam a consciência',
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
    description:
      'Você projeta sua consciência no corpo do alvo. Enquanto possuir uma criatura, você assume o controle total do corpo dela. O seu próprio corpo fica inconsciente e a consciência do alvo fica inerte. Em termos de jogo, você continua usando a sua ficha, mas com os atributos físicos e deslocamento da criatura. Se o alvo passar no teste de resistência, sabe que você tentou possuí-lo e fica imune a esta magia por um dia. Caso o corpo da criatura morra enquanto você a possui, a criatura morre e você deve fazer um teste de Vontade contra a CD da sua própria magia. Se passar, sua consciência retorna para o seu corpo (contanto que esteja dentro do alcance). Do contrário, você também morre. Retornar para o seu corpo voluntariamente é uma ação livre.',
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
        text: 'muda a duração para permanente, mas destrói seu corpo original no processo. Uma criatura possuída pode fazer um teste de Vontade no começo do dia para retomar seu corpo. Se passar, recobra a consciência (e a sua própria consciência fica inerte). O teste se repete no início de cada dia. Se o corpo de uma criatura possuída morrer e houver outra criatura em alcance curto, você pode tentar possuí-la. Enquanto houver novos corpos para possuir, você é imortal!',
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
    description:
      'Criada pelo arquimago Vectorius, esta magia produz quatro esferas, de ácido, eletricidade, fogo e frio, que voam até um ponto a sua escolha. Quando atingem o ponto escolhido, explodem causando 6d6 pontos de dano de seu respectivo tipo numa área com 12m de raio. Um teste de Reflexos reduz o dano à metade. Você pode mirar cada esfera em uma criatura ou ponto diferente. Uma criatura ao alcance da explosão de mais de uma esfera deve fazer um teste de resistência para cada uma. Além disso, as esferas causam efeitos (pág. 182) em criaturas que falharem em seus testes de resistência.',
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
    area: 'Esfera com 15m de raio',
    duracao: '',
    resistencia: 'Fortitude Parcial',
    school: 'Evoc',
    description:
      'Após concentrar seu mana, você emana energia, como uma estrela em plena terra. Todas as criaturas na área sofrem 150 pontos de dano de essência e todos os itens mágicos (exceto artefatos) tornam-se mundanos. Você não é afetado pela magia. Alvos que passem no teste de Fortitude sofrem metade do dano e seus itens mágicos voltam a funcionar após um dia.',
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
    area: 'Cone de 30m',
    duracao: 'Instantânea',
    resistencia: 'Reflexos reduz à metade',
    school: 'Evoc',
    description:
      'Esta é uma das mais poderosas magias de destruição existentes. Após entoar longos cânticos, o conjurador dispara uma carga de energia que varre uma enorme área à sua frente, causando 20d12 pontos de dano de essência em todas as criaturas, construções e objetos livres atingidos. Sempre que rola um resultado 12 em um dado de dano, a magia causa +1d12 pontos de dano. Apesar de seu poder destrutivo, esta magia é lenta, tornando seu uso difícil em combate.',
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
    description:
      'Esta magia cria uma ilusão particular para cada uma das criaturas que atingir. Enquanto a magia durar, no início de cada um de seus turnos, cada criatura afetada deve fazer um teste de Vontade; se falhar, acha que não tomou as ações que realmente fez no turno anterior e é obrigada a repetir as mesmas ações neste turno, com uma penalidade cumulativa de –5 em todos os testes para cada vez que se repetir (a penalidade não se aplica ao teste de Vontade contra esta magia). Por exemplo, se a criatura se aproximou de um alvo e o atacou, precisa se aproximar desse mesmo alvo e atacar novamente. A ação repetida consome PM e recursos normalmente e, caso exija um teste de resistência, qualquer alvo faz esse teste com um bônus igual ao da penalidade desta magia.',
  },
  [spellsCircle5Names.sombraAssassina]: {
    spellCircle: spellsCircles.c5,
    nome: 'Sombra Assassina',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade Parcial',
    school: 'Ilusão',
    description:
      'Esta magia cria uma duplicata ilusória do alvo na forma de uma silhueta, ligada a ele como se fosse uma manifestação sólida de sua própria sombra. A duplicata de sombras segue automaticamente o alvo. Sempre que o alvo faz uma ação hostil — fazer um ataque, usar uma habilidade, lançar uma magia — a sombra imediatamente realiza a mesma ação contra o alvo, usando as mesmas estatísticas e rolagens. A sombra pode ser atacada, tem as mesmas estatísticas do alvo e é destruída quando chega a 0 PV. Se o alvo passar no teste de resistência, a sombra desaparece no final do turno do alvo, depois de copiar sua ação dessa rodada.',
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
    description:
      'Aquele que controla o tempo controla o mundo. Escolha um dos efeitos na página 187.',
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
    description:
      'Esta é a mais poderosa das magias arcanas, permitindo alterar a realidade a seu bel-prazer. Consulte página 190 para mais informações.',
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
): Spell[] {
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

  return randomSpells;
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
