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
  abencoarAlimentos = "Abençoar Alimentos",
  acalmarAnimal = "Acalmar Animal",
  adagaMental = "Adaga Mental",
  alarme = "Alarme",
  amedrontar = "Amedrontar",
  areaEscorregadia = "Área Escorregadia",
  armaEspiritual = "Arma Espiritual",
  armaMagica = "Arma Mágica",
  armaduraArcana = "Armadura Arcana",
  armamentoDaNatureza = "Armamento da Natureza",
  aviso = "Aviso",
  bencao = "Bênção",
  caminhosDaNatureza = "Caminhos da Natureza",
  comando = "Comando",
  compreensao = "Compreensão",
  concentracaoDeCombate = "Concentração de Combate",
  conjurarMonstro = "Conjurar Monstro",
  consagrar = "Consagrar",
  controlarPlantas = "Controlar Plantas",
  criarElementos = "Criar Elementos",
  criarIlusao = "Criar Ilusão",
  curarFerimentos = "Curar Ferimentos",
  despedacar = "Despedaçar",
  detectarAmeacas = "Detectar Ameaças",
  disfarceIlusorio = "Disfarce Ilusório",
  enfeiticar = "Enfeitiçar",
  escudoDaFe = "Escudo da Fé",
  escuridao = "Escuridão",
  explosaoDeChamas = "Explosão de Chamas",
  hipnotismo = "Hipnotismo",
  imagemEspelhada = "Imagem Espelhada",
  infligirFerimentos = "Infligir Ferimentos",
  lequeCromatico = "Leque Cromático",
  luz = "Luz",
  nevoa = "Névoa",
  orientacao = "Orientação",
  perdicao = "Perdição",
  primorAtletico = "Primor Atlético",
  profanar = "Profanar",
  protecaoDivina = "Proteção Divina",
  quedaSuave = "Queda Suave",
  raioDoEnfraquecimento = "Raio do Enfraquecimento",
  resistenciaAEnergia = "Resistência à Energia",
  santuario = "Santuário",
  setaInfalivelDeTalude = "Seta Infalível de Talude",
  sono = "Sono",
  suporteAmbiental = "Suporte Ambiental",
  teia = "Teia",
  toqueChocante = "Toque Chocante",
  trancaArcana = "Tranca Arcana",
  tranquilidade = "Tranquilidade",
  transmutarObjetos = "Transmutar Objetos",
  visaoMistica = "Visão Mística",
  vitalidadeFantasma = "Vitalidade Fantasma",
  acoiteFlamejante = "Açoite Flamejante",
  dardoGelido = "Dardo Gélido",
  jatoCorrosivo = "Jato Corrosivo",
  detonacaoCongelante = "Detonação Congelante",
  disparoGelido = "Disparo Gélido",
  geiserCaustico = "Geiser Cáustico",
  nuvemTempestuosa = "Nuvem Tempestuosa",
  armaDeJade = "Arma de Jade",
  arsenalDeAllihanna = "Arsenal de Allihanna",
  bofetadaDeNimb = "Bofetada de Nimb",
  escapatoriaDeHyninn = "Escapatória de Hyninn",
  euforiaDeValkaria = "Euforia de Valkaria",
  execucaoDeThwor = "Execução de Thwor",
  flechaDeLuz = "Flecha de Luz",
  frescorDeLena = "Frescor de Lena",
  furiaDosAntepassados = "Fúria dos Antepassados",
  futuroMelhor = "Futuro Melhor",
  infortunioDeSszzaas = "Infortúnio de Sszzaas",
  instanteEstoico = "Instante Estoico",
  magiaDadivosa = "Magia Dadivosa",
  orbeDoOceano = "Orbe do Oceano",
  paixaoDeMarah = "Paixão de Marah",
  percepcaoRubra = "Percepção Rubra",
  perturbacaoSombria = "Perturbação Sombria",
  poderDeKallyadranoch = "Poder de Kallyadranoch",
  posseDeArsenal = "Posse de Arsenal",
  protecaoDeTauron = "Proteção de Tauron",
  sigiloDeSszzaas = "Sigilo de Sszzaas",
  sirocoDeAzgher = "Siroco de Azgher",
  sorrisoDaFortuna = "Sorriso da Fortuna",
  toqueDeMegalokk = "Toque de Megalokk",
  vozDaRazao = "Voz da Razão",
  armaduraArdente = "Armadura Ardente",
  assobioPerigoso = "Assobio Perigoso",
  conjurarArmadilha = "Conjurar Armadilha",
  desafioCorajoso = "Desafio Corajoso",
  discricao = "Discrição",
  distracaoFugaz = "Distração Fugaz",
  emularMagia = "Emular Magia",
  espiritoBalistico = "Espírito Balístico",
  farejarFortuna = "Farejar Fortuna",
  maaaisKlunc = "Maaais Klunc",
  ossosDeAdamante = "Ossos de Adamante",
  pontoFraco = "Ponto Fraco",
  punhoDeMitral = "Punho de Mitral",
  toqueDoHorizonte = "Toque do Horizonte",
}

export enum spellsCircle2Names {
  aliadoAnimal = "Aliado Animal",
  alterarTamanho = "Alterar Tamanho",
  amarrasEtereas = "Amarras Etéreas",
  aparenciaPerfeita = "Aparência Perfeita",
  augurio = "Augúrio",
  bolaDeFogo = "Bola de Fogo",
  campoDeForca = "Campo de Força",
  camuflagemIlusoria = "Camuflagem Ilusória",
  circuloDaJustica = "Círculo da Justiça",
  condicao = "Condição",
  conjurarMortosVivos = "Conjurar Mortos-Vivos",
  controlarFogo = "Controlar Fogo",
  controlarMadeira = "Controlar Madeira",
  cranioVoadorDeVladislav = "Crânio Voador de Vladislav",
  desesperoEsmagador = "Desespero Esmagador",
  dissiparMagia = "Dissipar Magia",
  enxameDePestes = "Enxame de Pestes",
  esculpirSons = "Esculpir Sons",
  fisicoDivino = "Físico Divino",
  flechaAcida = "Flecha Ácida",
  globoDaVerdadeDeGwen = "Globo da Verdade de Gwen",
  invisibilidade = "Invisibilidade",
  ligacaoTelepatica = "Ligação Telepática",
  localizacao = "Localização",
  mapear = "Mapear",
  marcaDaObediencia = "Marca da Obediência",
  menteDivina = "Mente Divina",
  metamorfose = "Metamorfose",
  miasmaMefitico = "Miasma Mefítico",
  montariaArcana = "Montaria Arcana",
  oracao = "Oração",
  purificacao = "Purificação",
  raioSolar = "Raio Solar",
  refugio = "Refúgio",
  relampago = "Relâmpago",
  rogarMaldicao = "Rogar Maldição",
  runaDeProtecao = "Runa de Proteção",
  saltoDimensional = "Salto Dimensional",
  servosInvisiveis = "Servos Invisíveis",
  silencio = "Silêncio",
  socoDeArsenal = "Soco de Arsenal",
  soproDasUivantes = "Sopro das Uivantes",
  sussurrosInsanos = "Sussurros Insanos",
  tempestadeDivina = "Tempestade Divina",
  toqueVampirico = "Toque Vampírico",
  velocidade = "Velocidade",
  vestimentaDaFe = "Vestimenta da Fé",
  vozDivina = "Voz Divina",
  invocarFagulhaElemental = "Invocar Fagulha Elemental",
  momentoDeTormenta = "Momento de Tormenta",
  preparacaoDeBatalha = "Preparação de Batalha",
  controlarAr = "Controlar Ar",
  couracaDeAllihanna = "Couraça de Allihanna",
  punicaoDoProfano = "Punição do Profano",
  traicaoDaLamina = "Traição da Lâmina",
  traicaoMagica = "Traição Mágica",
  desfazerEngenhoca = "Desfazer Engenhoca",
  evacuacao = "Evacuação",
  maquinaDeCombate = "Máquina de Combate",
  pocaoExplosiva = "Poção Explosiva",
  piscar = "Piscar",
  transposicao = "Transposição",
  viagemOnirica = "Viagem Onírica",
}

export enum spellsCircle3Names {
  ancoraDimensional = "Âncora Dimensional",
  anularALuz = "Anular a Luz",
  banimento = "Banimento",
  colunaDeChamas = "Coluna de Chamas",
  comunhaoComANatureza = "Comunhão com a Natureza",
  contatoExtraplanar = "Contato Extraplanar",
  controlarAgua = "Controlar Água",
  controlarTerra = "Controlar Terra",
  convInstantanea = "Conv Instantânea",
  despertarConsciencia = "Despertar Consciência",
  dificultarDeteccao = "Dificultar Detecção",
  dispersarAsTrevas = "Dispersar as Trevas",
  enxameRubroDeIchabod = "Enxame Rubro de Ichabod",
  erupcaoGlacial = "Erupção Glacial",
  ferverSangue = "Ferver Sangue",
  globoDeInvulnerabilidade = "Globo de Invulnerabilidade",
  heroismo = "Heroísmo",
  ilusaoLacerante = "Ilusão Lacerante",
  imobilizar = "Imobilizar",
  lancaIgneaDeAleph = "Lança Ígnea de Aleph",
  lendasEHistorias = "Lendas e Histórias",
  mantoDeSombras = "Manto de Sombras",
  miragem = "Miragem",
  missaoDivina = "Missão Divina",
  muralhaElemental = "Muralha Elemental",
  peleDePedra = "Pele de Pedra",
  poeiraDaPodridao = "Poeira da Podridão",
  potenciaDivina = "Potência Divina",
  protecaoContraMagia = "Proteção Contra Magia",
  seloDeMana = "Selo de Mana",
  servoDivino = "Servo Divino",
  servoMortoVivo = "Servo Morto-Vivo",
  soproDaSalvacao = "Sopro da Salvação",
  telecinesia = "Telecinésia",
  teletransporte = "Teletransporte",
  tentaculosDeTrevas = "Tentáculos de Trevas",
  transformacaoDeGuerra = "Transformação de Guerra",
  viagemArborea = "Viagem Arbórea",
  videncia = "Vidência",
  voo = "Voo",
  halitoPeconhento = "Hálito Peçonhento",
  impactoFulminante = "Impacto Fulminante",
  toqueAlgido = "Toque Álgido",
}

export enum spellsCircle4Names {
  alterarMemoria = "Alterar Memória",
  animarObjetos = "Animar Objetos",
  assassinoFantasmagorico = "Assassino Fantasmagórico",
  campoAntimagia = "Campo Antimagia",
  circuloDaRestauracao = "Círculo da Restauração",
  coleraDeAzgher = "Cólera de Azgher",
  concederMilagre = "Conceder Milagre",
  conjurarElemental = "Conjurar Elemental",
  controlarAGravidade = "Controlar a Gravidade",
  controlarOClima = "Controlar o Clima",
  cupulaDeRepulsao = "Cúpula de Repulsão",
  desintegrar = "Desintegrar",
  duplicataIlusoria = "Duplicata Ilusória",
  explosaoCaleidoscopica = "Explosão Caleidoscópica",
  formaEterea = "Forma Etérea",
  guardiaoDivino = "Guardião Divino",
  libertacao = "Libertação",
  ligacaoSombria = "Ligação Sombria",
  mantoDoCruzado = "Manto do Cruzado",
  maoPoderosaDeTalude = "Mão Poderosa de Talude",
  marionete = "Marionete",
  muralhaDeOssos = "Muralha de Ossos",
  premonicao = "Premonição",
  raioPolar = "Raio Polar",
  relampagoFlamejanteDeReynard = "Relâmpago Flamejante de Reynard",
  sonho = "Sonho",
  talhoInvisivelDeEdauros = "Talho Invisível de Edauros",
  terremoto = "Terremoto",
  viagemPlanar = "Viagem Planar",
  visaoDaVerdade = "Visão da Verdade",
  transformacaoEmDragao = "Transformação em Dragão",
  bencaoDaDragoaRainha = "Bênção da Dragoa Rainha",
  pantanoVitriolico = "Pântano Vitriólico",
  raioDePlasma = "Raio de Plasma",
  velocidadeDoRelampago = "Velocidade do Relâmpago",
}

export enum spellsCircle5Names {
  alterarDestino = "Alterar Destino",
  aprisionamento = "Aprisionamento",
  auraDivina = "Aura Divina",
  barragemElementalDeVectorius = "Barragem elemental de Vectorius",
  buracoNegro = "Buraco Negro",
  chuvaDeMeteoros = "Chuva de Meteoros",
  controlarOTempo = "Controlar o Tempo",
  deflagracaoDeMana = "Deflagração de Mana",
  desejo = "Desejo",
  engenhoDeMana = "Engenho de Mana",
  furiaDoPanteao = "Fúria do Panteão",
  intervencaoDivina = "Intervenção Divina",
  invulnerabilidade = "Invulnerabilidade",
  lagrimasDeWynna = "Lágrimas de Wynna",
  legiao = "Legião",
  mataDragao = "Mata-Dragão",
  palavraPrimordial = "Palavra Primordial",
  possessao = "Possessão",
  projetarConsciencia = "Projetar Consciência",
  reanimacaoImpura = "Reanimação Impura",
  requiem = "Réquiem",
  roubarAAlma = "Roubar a Alma",
  segundaChance = "Segunda Chance",
  semiplano = "Semiplano",
  sombraAssassina = "Sombra Assassina",
  toqueDaMorte = "Toque da Morte",
  katanaCelestial = "Katana Celestial",
}

export const spellsCircle1: Record<spellsCircle1Names, Spell> = {
  [spellsCircle1Names.abencoarAlimentos]: {
    nome: "Abençoar Alimentos",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Alimento para criatura",
    duracao: "Cena",
    school: "Trans",
    description:
      `Você purifica e abençoa uma porção de comida ou dose de bebida. Isso torna um alimento sujo, estragado ou envenenado próprio para consumo. Além disso, se for consumido até o final da duração, o alimento oferece 5 PV temporários ou 1 PM temporário (além de quaisquer bônus que já oferecesse). Bônus de alimentação duram um dia e cada personagem só pode receber um bônus de alimentação por dia.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `o alimento é purificado (não causa nenhum efeito nocivo se estava estragado ou envenenado), mas não oferece bônus ao ser consumido.`
      }, 
      {
        addPM: 1,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 1,
        text: `muda a duração para permanente, o alvo para 1 frasco com água e adiciona componente material (pó de prata no valor de T$ 5). Em vez do normal, cria um frasco de água benta.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.acalmarAnimal]: {
    nome: "Acalmar Animal",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 animal",
    duracao: "Cena",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `O animal fica prestativo em relação a você. Ele não fica sob seu controle, mas percebe suas palavras e ações da maneira mais favorável possível. Você recebe +10 nos testes de Adestramento e Diplomacia que fizer contra o animal.<br>Um alvo hostil ou que esteja envolvido em um combate recebe +5 em seu teste de resistência. Se você ou seus aliados tomarem qualquer ação hostil contra o alvo, a magia é dissipada e ele retorna à atitude que tinha antes (ou piorada, de acordo com o mestre). Se tratar bem o alvo, a atitude pode permanecer mesmo após o término da magia.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para médio.`
      }, 
      {
        addPM: 1,
        text: `muda o alvo para 1 monstro ou espírito com Inteligência 1 ou 2.`
      }, 
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para 1 monstro ou espírito. Requer 3o círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.adagaMental]: {
    nome: "Adaga Mental",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Vontade parcial",
    school: "Encan",
    description:
      `Você manifesta e dispara uma adaga imaterial contra a mente do alvo, que sofre 2d6 pontos de dano psíquico e fica Atordoado por uma rodada. Se passar no teste de resistência, sofre apenas metade do dano e evita a condição. Uma criatura só pode ficar atordoada por esta magia uma vez por cena.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `você lança a magia sem gesticular ou pronunciar palavras (o que permite lançar essa magia de armadura) e a adaga se torna invisível. Se o alvo falhar no teste de resistência, não percebe que você lançou uma magia<br>contra ele.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para 1 dia. Além do normal, você “finca” a adaga na mente do alvo. Enquanto a magia durar, você sabe a direção e localização do alvo, desde que ele esteja no mesmo mundo.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +1d6.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.alarme]: {
    nome: "Alarme",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    area: "Esfera de 9m de raio",
    duracao: "1 dia",
    school: "Abjur",
    description:
      `Você cria uma barreira protetora invisível que detecta qualquer criatura que tocar ou entrar na área protegida. Ao lançar a magia, você pode escolher quais criaturas podem entrar na área sem ativar seus efeitos. Alarme pode emitir um aviso telepático ou sonoro, decidido quando a magia é lançada. Um aviso telepático alerta apenas você, inclusive acordando-o se estiver dormindo, mas apenas se estiver a até 1km da área protegida. Um aviso sonoro alerta todas as criaturas em alcance longo.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para pessoal. A área é emanada a partir de você.`
      }, 
      {
        addPM: 5,
        text: `além do normal, você também percebe qualquer efeito de Adiv que seja usado dentro da área ou atravesse a área. Você pode fazer um teste oposto de Misticismo contra quem usou o efeito; se passar, tem um vislumbre de seu rosto e uma ideia aproximada de sua localização (“três dias de viagem ao norte”, por exemplo).`
      }, 
      {
        addPM: 9,
        text: `muda a duração para 1 dia ou até ser descarregada e a resistência para Vontade anula. Quando um intruso entra na área, você pode descarregar a magia. Se o intruso falhar na resistência, ficará paralisado por 1d4 rodadas. Além disso, pelas próximas 24 horas você e as criaturas escolhidas ganham +10 em testes de Sobrevivência para rastrear o intruso.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.amedrontar]: {
    nome: "Amedrontar",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 animal ou humanóide",
    duracao: "Cena",
    resistencia: "Vontade parcial",
    school: "Necro",
    description:
      `O alvo é envolvido por energias sombrias e assustadoras. Se falhar na resistência, fica Apavorado por 1 rodada, depois Abalado. Se passar, fica abalado por 1d4 rodadas.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `alvos que falhem na resistência ficam apavorados por 1d4+1 rodadas, em vez de apenas 1.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para 1 criatura.`
      }, 
      {
        addPM: 5,
        text: `afeta todos os alvos válidos a sua escolha dentro do alcance.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.areaEscorregadia]: {
    nome: "Área Escorregadia",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    area: "Quadrado de 3m de lado ou 1 objeto",
    duracao: "Cena",
    resistencia: "Reflexos (veja texto)",
    school: "Conv",
    description:
      `Esta magia recobre uma superfície com uma substância gordurosa e escorregadia. Criaturas na área devem passar na resistência para não cair. Nas rodadas seguintes, criaturas que tentem movimentar-se pela área devem fazer testes de Acrobacia para equilíbrio (CD 10).<br>Área Escorregadia pode tornar um item escorregadio. Uma criatura segurando um objeto afetado deve passar na resistência para não deixar o item cair cada vez que usá-lo.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta a área em +1 quadrado de 1,5m.`
      }, 
      {
        addPM: 2,
        text: `muda a CD dos testes de Acrobacia para 15.`
      }, 
      {
        addPM: 5,
        text: `muda a CD dos testes de Acrobacia para 20.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.armaEspiritual]: {
    nome: "Arma Espiritual",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Conv",
    description:
      `Você invoca a arma preferida de sua divindade (se tiver uma), que surge flutuando a seu lado. Uma vez por rodada, quando você sofre um ataque corpo a corpo, pode usar uma reação para que a arma cause automaticamente 2d6 pontos de dano do tipo da arma — por exemplo, uma espada longa causa dano de corte — no oponente que fez o ataque. Esta magia se dissipa se você morrer.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, a arma o protege. Você recebe +1 na Defesa.`
      }, 
      {
        addPM: 2,
        text: `aumenta o bônus na Defesa em +1.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para sustentada. Além do normal, uma vez por rodada, você pode gastar uma ação livre para fazer a arma acertar automaticamente um alvo adjacente. Se a arma atacar, não poderá contra-atacar até seu próximo turno. Requer 2o círculo.`
      }, 
      {
        addPM: 2,
        text: `muda o tipo do dano para essência. Requer 2o círculo.`
      }, 
      {
        addPM: 5,
        text: `invoca duas armas, permitindo que você contra-ataque (ou ataque, se usar o aprimoramento acima) duas vezes por rodada. Requer 3o círculo.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano causado pela arma em +1d6, limitado pelo círculo máximo de magia que você pode lançar.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.armaMagica]: {
    nome: "Arma Mágica",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 arma empunhada",
    duracao: "Cena",
    school: "Trans",
    description:
      `A arma fornece um bônus de +1 nos testes de ataque e rolagens de dano e é considerada mágica (não cumulativo com bônus de encantos). Caso você esteja empunhando a arma, pode usar seu atributo-chave de magias em vez do atributo original nos testes de ataque (não cumulativo com efeitos que somam este atributo).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o bônus em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).`
      }, 
      {
        addPM: 2,
        text: `a arma passa a causar +1d6 de dano de ácido, eletricidade, fogo ou frio, escolhido no momento em que a magia é lançada. Este aprimoramento só pode ser usado uma vez.`
      }, 
      {
        addPM: 3,
        text: `muda o bônus de dano do aprimoramento elemental para +2d6.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.armaduraArcana]: {
    nome: "Armadura Arcana",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Abjur",
    description:
      `Esta magia cria uma película protetora invisível, mas tangível, fornecendo +5 na Defesa. Esse bônus é cumulativo com outras magias, mas não com bônus fornecido por armaduras.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a execução para reação. Em vez do normal, você cria um escudo mágico que fornece +5 na Defesa contra o próximo ataque que sofrer (cumulativo com o bônus fornecido pelo efeito básico desta magia e armaduras).`
      }, 
      {
        addPM: 2,
        text: `aumenta o bônus na Defesa em +1.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para 1 dia.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.armamentoDaNatureza]: {
    nome: "Armamento da Natureza",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 arma (veja texto)",
    duracao: "Cena",
    school: "Trans",
    description:
      `Você fortalece uma arma mundana primitiva (sem custo em T$, como bordão, clava, funda ou tacape), uma arma natural ou um ataque desarmado. O dano da arma aumenta em um passo e ela é considerada mágica. Ao lançar a magia, você pode mudar o tipo de dano da arma (escolhendo entre corte, impacto ou perfuração).`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `fornece +1 nos testes de ataque com a arma.`
      }, 
      {
        addPM: 2,
        text: `muda a execução para ação de movimento.`
      }, 
      {
        addPM: 3,
        text: `aumenta o bônus nos testes de ataque em +1.`
      }, 
      {
        addPM: 5,
        text: `aumenta o dano da arma em mais um passo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.aviso]: {
    nome: "Aviso",
    execucao: "Movimento",
    alcance: "Longo (90m 60q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    school: "Adiv",
    description:
      `Envia um aviso telepático para uma criatura, mesmo que não possa vê-la nem tenha linha de efeito. Escolha um:<br><i>Alerta:</i> o alvo recebe +5 em seu próximo teste de Iniciativa e de Percepção dentro da cena.<br><i>Mensagem:</i> o alvo recebe uma mensagem sua de até 25 palavras. Vocês devem ter um idioma em comum para o alvo poder entendê-lo.<br><i>Localização:</i> o alvo sabe onde você está naquele momento. Se você mudar de posição, ele não saberá.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o alcance em um fator de 10 (90m para 900m, 900m para 9km e assim por diante).`
      }, 
      {
        addPM: 1,
        text: `se escolher mensagem, o alvo pode enviar uma resposta de até 25 palavras para você até o fim de seu próximo turno.`
      }, 
      {
        addPM: 2,
        text: `se escolher localização, muda a duração para cena. O alvo sabe onde você está mesmo que você mude de posição.`
      }, 
      {
        addPM: 3,
        text: `aumenta o número de alvos em +1.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.bencao]: {
    nome: "Bênção",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Aliados",
    duracao: "Cena",
    school: "Encan",
    description:
      `Abençoa seus aliados, que recebem +1 em testes de ataque e rolagens de dano. Bênção anula Perdição.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alvo para 1 cadáver e a duração para 1 semana. O cadáver não se decompõe nem pode ser transformado em morto-vivo.`
      }, 
      {
        addPM: 2,
        text: `aumenta os bônus em +1, limitado pelo círculo máximo de magia que você pode lançar.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.caminhosDaNatureza]: {
    nome: "Caminhos da Natureza",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Criaturas escolhidas",
    duracao: "1 dia",
    school: "Conv",
    description:
      `Você invoca espíritos da natureza, pedindo que eles abram seu caminho. As criaturas afetadas recebem deslocamento +3m e ignoram penalidades por terreno difícil em terrenos naturais.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda o alcance para pessoal e o alvo para você. Em vez do normal, você sabe onde fica o norte e recebe +5 em testes de Sobrevivência para se orientar.`
      }, 
      {
        addPM: 1,
        text: `além do normal, a CD para rastrear os alvos em terreno natural aumenta em +10.`
      }, 
      {
        addPM: 2,
        text: `aumenta o bônus de deslocamento em +3m.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.comando]: {
    nome: "Comando",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 humanóide",
    duracao: "1 rodada",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `Você dá uma ordem irresistível, que o alvo deve ser capaz de ouvir (mas não precisa entender). Se falhar na resistência, ele deve obedecer ao comando em seu próprio turno da melhor maneira possível. Escolha um dos efeitos a seguir:<br><i>Fuja:</i> o alvo gasta seu turno se afastando de você (usando todas as suas ações).<br><i>Largue:</i> o alvo solta quaisquer itens que esteja segurando e não pode pegá-los novamente até o início de seu próximo turno. Como esta é uma ação livre, ele ainda pode executar outras ações (exceto pegar aquilo que largou).<br><i>Pare:</i> o alvo fica pasmo (uma vez por cena).<br><i>Senta:</i> com uma ação livre, o alvo senta no chão (se estava pendurado ou voando, desce até o chão). Ele pode fazer outras ações, mas não se levantar até o início de seu próximo turno.<br><i>Venha:</i> o alvo gasta seu turno se aproximando de você (usando todas as suas ações).`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alvo para 1 criatura.`
      }, 
      {
        addPM: 2,
        text: `aumenta a quantidade de alvos em +1`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.compreensao]: {
    nome: "Compreensão",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura ou texto",
    duracao: "Cena",
    resistencia: "Vontade anula (veja texto)",
    school: "Adiv",
    description:
      `Essa magia lhe confere compreensão sobrenatural. Você pode tocar um texto e entender as palavras mesmo que não conheça o idioma. Se tocar numa criatura inteligente, pode se comunicar com ela mesmo que não tenham um idioma em comum. Se tocar uma criatura não inteligente, como um animal, pode perceber seus sentimentos.<br>Você também pode gastar uma ação de movimento para ouvir os pensamentos de uma criatura tocada (você “ouve” o que o alvo está pensando), mas um alvo involuntário tem direito a um teste de Vontade para proteger seus pensamentos e evitar este efeito.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para curto.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas. Você pode entender todas as criaturas afetadas, mas só pode ouvir os pensamentos de uma por vez.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para 1 criatura. Em vez do normal, pode vasculhar os pensamentos do alvo para extrair informações. O alvo tem direito a um teste de Vontade para anular este efeito. O mestre decide se a criatura sabe ou não a informação que você procura. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para pessoal e o alvo para você. Em vez do normal, você pode falar, entender e escrever qualquer idioma. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.concentracaoDeCombate]: {
    nome: "Concentração de Combate",
    execucao: "Livre",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "1 rodada",
    school: "Adiv",
    description:
      `Você amplia sua percepção, antecipando movimentos dos inimigos e achando brechas em sua defesa. Quando faz um teste de ataque, você rola dois dados e usa o melhor resultado`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda a execução para padrão e a duração para cena. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `além do normal, ao atacar você, um inimigo deve rolar dois dados e usar o pior resultado. Requer 3º círculo.`
      }, 
      {
        addPM: 9,
        text: `muda a execução para padrão, o alcance para curto, o alvo para criaturas escolhidas e a duração para cena. Requer 4º círculo.`
      }, 
      {
        addPM: 14,
        text: `muda a execução para padrão e a duração para 1 dia. Além do normal, você recebe um sexto sentido que o avisa de qualquer perigo ou ameaça. Você fica imune às condições surpreendido e desprevenido e recebe +10 em Defesa e Reflexos. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.conjurarMonstro]: {
    nome: "Conjurar Monstro",
    execucao: "Completa",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura conjurada",
    duracao: "Sustentada",
    school: "Conv",
    description:
      `Você conjura um monstro Pequeno que ataca seus inimigos. Você escolhe a aparência do monstro e o tipo de dano que ele pode causar, entre corte, impacto e perfuração. No entanto, ele não é uma criatura real, e sim um construto feito de energia. Se for destruído, ou quando a magia acaba, desaparece com um brilho, sem deixar nada para trás. Você só pode ter um monstro conjurado por esta magia por vez.<br>O monstro surge em um espaço desocupado a sua escolha dentro do alcance e age no início de cada um de seus turnos, a partir da próxima rodada. O monstro tem deslocamento 9m e pode fazer uma ação de movimento por rodada. Você pode gastar uma ação padrão para dar uma das seguintes ordens a ele.<br><i>Mover:</i> o monstro se movimenta o dobro do deslocamento nessa rodada.<br><i>Atacar:</i> o monstro causa 2d4+2 pontos de dano a uma criatura adjacente.<br><i>Lançar Magia:</i> o monstro pode servir como ponto de origem para uma magia lançada por você com execução de uma ação padrão ou menor. Ele pode descarregar um <i>Toque Chocante</i> em um inimigo distante, ou mesmo “cuspir” uma Bola de Fogo! Você gasta PM normalmente para lançar a magia.<br>Outros usos criativos para monstros conjurados ficam a critério do mestre. O monstro não age sem receber uma ordem.<br>Para efeitos de jogo, o monstro conjurado tem For 2, Des 3 e todos os outros atributos nulos. Ele tem Defesa igual a sua, 20 pontos de vid e usa o seu bônus para teste de Reflexos. Ele é imune a efeitos que pedem um teste de Fortitude ou Vontade.<br>`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `o monstro ganha deslocamento de escalada ou natação igual ao seu deslocamento terrestre.`
      }, 
      {
        addPM: 1,
        text: `aumenta o deslocamento do monstro em +3m.`
      }, 
      {
        addPM: 1,
        text: `muda o tipo de dano do ataque do monstro para ácido, fogo, frio ou eletricidade.`
      }, 
      {
        addPM: 2,
        text: `o monstro ganha percepção às cegas (alcance curto).`
      }, 
      {
        addPM: 2,
        text: `aumenta os PV do monstro em +10 para cada categoria de tamanho a partir de Pequeno (+10 PV para Pequeno, +20 PV para Médio etc.).`
      }, 
      {
        addPM: 2,
        text: `aumenta o tamanho do monstro para Médio. Ele tem For 4, Des 3, 45 PV, deslocamento 12m e seu ataque causa 2d6+6 pontos de dano.`
      }, 
      {
        addPM: 2,
        text: `o monstro ganha resistência 5 contra dois tipos de dano (por exemplo, corte e frio).`
      }, 
      {
        addPM: 4,
        text: `o monstro ganha uma nova ordem: Arma de Sopro. Para dar essa ordem você gasta 1 PM, e faz o monstro causar o dobro de seu dano de ataque em um cone de 6m a partir de si (Reflexos reduz à metade).`
      }, 
      {
        addPM: 5,
        text: `aumenta o tamanho do monstro para Grande. Ele tem For 7, Des 2, 75 PV, deslocamento 12m e seu ataque causa 4d6+10 pontos de dano com 3m de alcance. Requer 2º círculo.`
      }, 
      {
        addPM: 9,
        text: `o monstro ganha deslocamento de voo igual ao dobro do deslocamento.`
      }, 
      {
        addPM: 9,
        text: `o monstro ganha imunidade contra dois tipos de dano.`
      }, 
      {
        addPM: 9,
        text: `aumenta o tamanho do monstro para Enorme. Ele tem For 11, Des 1, 110 PV, deslocamento 15m e seu ataque causa 4d8+15 pontos de dano com 4,5m de alcance. Requer 4º círculo.`
      }, 
      {
        addPM: 14,
        text: `aumenta o tamanho do monstro para Colossal. Ele tem For 15, Des 0, 180 PV, deslocamento 15m e seu ataque causa 4d12+20 pontos de dano com 9m de alcance. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.consagrar]: {
    nome: "Consagrar",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    area: "Esfera de 9m de raio",
    duracao: "1 dia",
    school: "Evoc",
    description:
      `Você enche a área com energia positiva. Pontos de vida curados por efeitos de luz são maximizados dentro da área. Isso também afeta dano causado em mortos-vivos por esses efeitos.<br>Por exemplo, Curar Ferimentos cura automaticamente 18 PV. Esta magia não pode ser lançada em uma área contendo um símbolo visível dedicado a uma divindade que não a sua. Consagrar anula Profanar.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, mortos-vivos na área sofrem –2 em testes e Defesa.`
      }, 
      {
        addPM: 2,
        text: `aumenta as penalidades para mortos-vivos em –1.`
      }, 
      {
        addPM: 9,
        text: `muda a execução para 1 hora, a duração para permanente e adiciona componente material (incenso e óleos no valor de T$ 1.000). Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.controlarPlantas]: {
    nome: "Controlar Plantas",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    area: "Quadrado de 9m de lado",
    duracao: "Cena",
    resistencia: "Reflexos anula",
    school: "Trans",
    description:
      `Esta magia só pode ser lançada em uma área com vegetação. As plantas se enroscam nas criaturas da área. Aquelas que falharem na resistência ficam Enredado. Uma vítima pode se libertar com uma ação padrão e um teste de Acrobacia ou Atletismo. Além disso, a área é considerada terreno difícil. No início de seus turnos, a vegetação tenta enredar novamente qualquer criatura na área, exigindo um novo teste de Reflexos.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda a área para alvo de 1 planta e a resistência para nenhuma. Em vez do normal, você pode fazer a planta se mover como se fosse animada. Ela não pode causar dano ou atrapalhar a concentração de um conjurador.`
      }, 
      {
        addPM: 1,
        text: `muda a duração para instantânea. Em vez do normal, as plantas na área diminuem, como se tivessem sido podadas. Terreno difícil muda para terreno normal e não oferece camuflagem. Esse efeito dissipa o uso normal de Controlar Plantas.`
      }, 
      {
        addPM: 1,
        text: `além do normal, criaturas que falhem na resistência também ficam imóveis.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para pessoal, a área para alvo (você) e a resistência para nenhuma. Em vez do normal, você consegue se comunicar com plantas, que começam com atitude prestativa em relação a você. Além disso, você pode fazer testes de Diplomacia com plantas. Em geral, plantas têm uma percepção limitada de seus arredores e normalmente fornecem respostas simplórias.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.criarElementos]: {
    nome: "Criar Elementos",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Elemento escolhido",
    duracao: "Instantânea",
    school: "Conv",
    description:
      `Você cria uma pequena porção de um elemento, a sua escolha. Os elementos criados são reais, não mágicos. Elementos físicos devem surgir em uma superfície. Em vez de um cubo, pode-se criar objetos simples (sem partes móveis) feitos de gelo, terra ou pedra.<br><i>Água:</i> enche um recipiente de tamanho Minúsculo (como um odre) com água potável ou cria um cubo de gelo de tamanho Minúsculo.<br><i>Ar:</i> cria um vento fraco em um quadrado de 1,5m. Isso purifica a área de qualquer gás ou fumaça, ou remove névoa por uma rodada.<br><i>Fogo:</i> cria uma chama que ilumina como uma tocha. Você pode segurá-la na palma de sua mão sem se queimar, ou fazê-la surgir em um quadrado de 1,5m. Se uma criatura ou objeto estiver no quadrado, sofre 1d6 pontos de dano de fogo; se falhar num teste de Reflexos, pega fogo.<br><i>Terra:</i> cria um cubo de tamanho Minúsculo feito de terra, argila ou pedra.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta a quantidade do elemento em um passo (uma categoria de tamanho para água ou terra, +1 quadrado de 1,5m para ar e fogo).`
      }, 
      {
        addPM: 1,
        text: `muda o efeito para alvo 1 criatura ou objeto e a resistência para Reflexos reduz à metade. Se escolher água ou terra, você arremessa o cubo ou objeto criado no alvo, causando 2d4 pontos de dano de impacto. Para cada categoria de tamanho acima de Minúsculo, o dano aumenta em um passo. O cubo se desfaz em seguida.`
      }, 
      {
        addPM: 1,
        text: `se escolheu fogo, aumenta o dano inicial de cada chama em +1d6.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.criarIlusao]: {
    nome: "Criar Ilusão",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Ilusão que se estende a até 4 cubos de 5m",
    duracao: "Cena",
    resistencia: "Vontade desacredita",
    school: "Ilusão",
    description:
      `Esta magia cria uma ilusão visual (uma criatura, uma parede...) ou sonora (um grito de socorro, um uivo assustador...). A magia cria apenas imagens ou sons simples, com volume equivalente ao tom de voz normal para cada cubo de 1,5m no efeito. Não é possível criar cheiros, texturas ou temperaturas, nem sons complexos, como uma música ou diálogo. Criaturas e objetos atravessam uma ilusão sem sofrer dano, mas a magia pode, por exemplo, esconder uma armadilha ou inimigo. A magia é dissipada se você sair do alcance.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a duração para sustentada. A cada rodada você pode gastar uma ação livre para mover a imagem ou alterar levemente o som, como aumentar o volume ou fazer com que pareça se afastar ou se aproximar, ainda dentro dos limites do efeito. Você pode, por exemplo, criar a ilusão de um fantasma que anda pela sala, controlando seus movimentos. Quando você para de sustentar a magia, a imagem ou som persistem por mais uma rodada antes de a magia se dissipar.`
      }, 
      {
        addPM: 1,
        text: `aumenta o efeito da ilusão em +1 cubo de 1,5m.`
      }, 
      {
        addPM: 1,
        text: `também pode criar ilusões de imagem e sons combinados.`
      }, 
      {
        addPM: 1,
        text: `também pode criar sons complexos com volume máximo equivalente ao que cinco pessoas podem produzir para cada cubo de 1,5m no efeito. Com uma ação livre, você pode alterar o volume do som ou fazê-lo se aproximar ou se afastar dentro do alcance.`
      }, 
      {
        addPM: 2,
        text: `também pode criar odores e sensações térmicas, que são percebidos a uma distância igual ao dobro do tamanho máximo do efeito. Por exemplo, uma miragem de uma fogueira com 4 cubos de 1,5m poderia emanar calor e cheiro de queimado a até 12m.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para longo e o efeito para esfera de 30m de raio. Em vez do normal, você cria um som muito alto, equivalente a uma multidão. Criaturas na área lançam magias como se estivessem em uma condição ruim e a CD de testes de Percepção para ouvir aumenta em +10. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `também criar sensações táteis, como texturas; criaturas que não saibam que é uma ilusão não conseguem atravessá-la sem passar em um teste de Vontade (objetos ainda a atravessam). A ilusão ainda é incapaz de causar ou sofrer dano. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda a duração para sustentada. Além do normal, você pode gastar uma ação livre para modificar livremente a ilusão (mas não pode acrescentar novos aprimoramentos após lançá-la). Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.curarFerimentos]: {
    nome: "Curar Ferimentos",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Instantânea",
    school: "Evoc",
    description:
      `Você canaliza energia positiva que recupera 2d8+2 pontos de vida na criatura tocada.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda o alvo para 1 morto-vivo. Em vez do normal, causa 1d8 pontos de dano de luz (Vontade reduz à metade).`
      }, 
      {
        addPM: 1,
        text: `aumenta a cura em +1d8+1.`
      }, 
      {
        addPM: 2,
        text: `também remove uma condição de fadiga do alvo.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para curto.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.despedacar]: {
    nome: "Despedaçar",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura ou objeto mundano pequeno",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Evoc",
    description:
      `Esta magia emite um som alto e agudo. O alvo sofre 1d8+2 pontos de dano de impacto (ou o dobro disso e ignora RD se for um construto ou objeto mundano) e fica Atordoado por uma rodada (apenas uma vez por cena). Um teste de Fortitude reduz o dano à metade e evita o atordoamento.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +1d8+2.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para objeto mundano Médio. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para objeto mundano Grande. Requer 3º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para pessoal e a área para esfera de 6m de raio. Todas as criaturas e objetos na área são afetados.`
      }, 
      {
        addPM: 9,
        text: `muda o alvo para objeto mundano Enorme. Requer 4º círculo.`
      }, 
      {
        addPM: 14,
        text: `muda o alvo para objeto mundano Colossal. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.detectarAmeacas]: {
    nome: "Detectar Ameaças",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Esfera de 8m de raio",
    duracao: "Cena até ser descarregada",
    school: "Adiv",
    description:
      `Você recebe uma intuição aguçada sobre perigos ao seu redor. Quando uma criatura hostil ou armadilha entra na área do efeito, você faz um teste de Percepção (CD determinada pelo mestre de acordo com a situação). Se passar, sabe a origem (criatura ou armadilha), direção e distância do perigo. Se falhar, sabe apenas que o perigo existe.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `você descobre também a raça ou espécie e o poder da criatura detectada (determinado pela aura dela). Criaturas de 1º a 6º nível geram aura tênue, criaturas de 7º a 12º nível geram aura moderada e criaturas de 13º ao 20º nível geram aura poderosa. Criaturas acima do 20º nível geram aura avassaladora.`
      }, 
      {
        addPM: 2,
        text: `além do normal, você não fica surpreso e desprevenido contra perigos detectados com sucesso e recebe +5 em testes de resistência contra armadilhas. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.disfarceIlusorio]: {
    nome: "Disfarce Ilusório",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    resistencia: "Vontade desacredita",
    school: "Ilusão",
    description:
      `Você muda a aparência do alvo, incluindo seu equipamento. Isso inclui altura, peso, tom de pele, cor de cabelo, timbre de voz etc. O alvo recebe +10 em testes de Enganação para disfarce. O alvo não recebe novas habilidades (você pode ficar parecido com outra raça, mas não ganhará as habilidades dela), nem modifica o equipamento (uma espada longa disfarçada de bordão continua funcionando e causando dano como uma espada).`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda o alcance para toque, o alvo para 1 criatura e a duração para 1 semana. Em vez do normal, você faz uma pequena alteração na aparência do alvo, como deixar o nariz vermelho ou fazer brotar um gerânio no alto da cabeça. A mudança é inofensiva, mas persistente — se a flor for arrancada, por exemplo, outra nascerá no local.`
      }, 
      {
        addPM: 1,
        text: `muda o alcance para curto e o alvo para 1 objeto. Você pode, por exemplo, transformar pedaços de ferro em moedas de ouro. Você recebe +10 em testes de Enganação para falsificação.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para curto e o alvo para 1 criatura. Uma criatura involuntária pode anular o efeito com um teste de Vontade.`
      }, 
      {
        addPM: 2,
        text: `a ilusão inclui odores e sensações. Isso muda o bônus em testes de Enganação para disfarce para +20.`
      }, 
      {
        addPM: 3,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas. Cada criatura pode ter uma aparência diferente. Criaturas involuntárias podem anular o efeito com um teste de Vontade. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.enfeiticar]: {
    nome: "Enfeitiçar",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 humanóide",
    duracao: "Cena",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `O alvo fica enfeitiçado (veja a página 394). Um alvo hostil ou que esteja envolvido em um combate recebe +5 em seu teste de resistência. Se você ou seus aliados tomarem qualquer ação hostil contra o alvo, a magia é dissipada e o alvo retorna à atitude que tinha antes (ou piorada, de acordo com o mestre).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `em vez do normal, você sugere uma ação para o alvo e ele obedece. A sugestão deve ser feita de modo que pareça aceitável, a critério do mestre. Pedir ao alvo que pule de um precipício, por exemplo, dissipa a magia. Já sugerir a um guarda que descanse um pouco, de modo que você e seus aliados passem por ele, é aceitável. Quando o alvo executa a ação, a magia termina. Você pode determinar uma condição específica para a sugestão: por exemplo, que um rico mercador doe suas moedas para o primeiro mendigo que encontrar.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para 1 espírito ou monstro. Requer 3º círculo.`
      }, 
      {
        addPM: 5,
        text: `afeta todos os alvos dentro do alcance.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.escudoDaFe]: {
    nome: "Escudo da Fé",
    execucao: "Reação",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "1 turno",
    school: "Abjur",
    description:
      `Um escudo místico se manifesta momentaneamente para bloquear um golpe. O alvo recebe +2 na Defesa.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a execução para ação padrão, o alcance para toque e a duração para cena.`
      }, 
      {
        addPM: 1,
        text: `também fornece ao alvo camuflagem leve contra ataques à distância.`
      }, 
      {
        addPM: 2,
        text: `aumenta o bônus na Defesa em +1.`
      }, 
      {
        addPM: 2,
        text: `muda a execução para ação padrão, o alcance para toque e a duração para cena. A magia cria uma conexão mística entre você e o alvo. Além do efeito normal, o alvo sofre metade do dano por ataques e efeitos; a outra metade do dano é transferida a você. Se o alvo sair de alcance curto de você, a magia é dissipada. Requer 2º círculo.`
      }, 
      {
        addPM: 3,
        text: `muda a duração para 1 dia. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.escuridao]: {
    nome: "Escuridão",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 objeto",
    duracao: "Cena",
    resistencia: "Vontade anula (veja texto)",
    school: "Necro",
    description:
      `O alvo emana sombras em uma área com 6m de raio. Criaturas dentro da área recebem camuflagem leve por escuridão leve. As sombras não podem ser iluminadas por nenhuma fonte de luz natural. O objeto pode ser guardado (em um bolso, por exemplo) para interromper a escuridão, que voltará a funcionar caso o objeto seja revelado. Se lançar a magia num objeto de uma criatura involuntária, ela tem direito a um teste de Vontade para anulá-la. Escuridão anula Luz.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta a área da escuridão em +1,5m de raio.`
      }, 
      {
        addPM: 2,
        text: `muda o efeito para fornecer camuflagem total por escuridão total. As sombras bloqueiam a visão na área e através dela.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para 1 criatura e a resistência para Fortitude parcial. Você lança a magia nos olhos do alvo, que fica cego pela cena. Se passar na resistência, fica cego por 1 rodada. Requer 2º círculo.`
      }, 
      {
        addPM: 3,
        text: `muda a duração para 1 dia.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para pessoal e o alvo para você. Em vez do normal, você é coberto por sombras, recebendo +10 em testes de Furtividade e camuflagem leve. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.explosaoDeChamas]: {
    nome: "Explosão de Chamas",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Cone de 6m",
    duracao: "Instantânea",
    resistencia: "Reflexos reduz à metade",
    school: "Evoc",
    description:
      `Um leque de chamas irrompe de suas mãos, causando 2d6 pontos de dano de fogo às criaturas na área.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda o alcance para curto, a área para alvo de 1 objeto e a resistência para Reflexos anula. Você gera uma pequena explosão que não causa dano mas pode acender uma vela, tocha ou fogueira. Também pode fazer um objeto inflamável com RD 0 (como uma corda ou pergaminho) ficar em chamas. Uma criatura em posse de um objeto pode evitar esse efeito se passar no teste de resistência.`
      }, 
      {
        addPM: 1,
        text: `aumenta o dano em +1d6.`
      }, 
      {
        addPM: 1,
        text: `muda a resistência para Reflexos parcial. Se passar, a criatura reduz o dano à metade; se falhar, fica em chamas (veja Condições, no Apêndice).`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.hipnotismo]: {
    nome: "Hipnotismo",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 animal ou humanóide",
    duracao: "1d4 rodadas",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `Suas palavras e movimentos ritmados deixam o alvo fascinado. Esta magia só afeta criaturas que possam perceber você. Se usar esta magia em combate, o alvo recebe +5 em seu teste de resistência. Se a criatura passar, fica imune a este efeito por um dia.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda a duração para 1 rodada. Em vez de fascinado, o alvo fica pasmo. (apenas uma vez por cena)`
      }, 
      {
        addPM: 1,
        text: `como o normal, mas alvos que passarem na resistência não sabem que foram vítimas de uma magia.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para animais ou humanoides escolhidos.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para sustentada.`
      }, 
      {
        addPM: 2,
        text: `também afeta espíritos e monstros na área. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `também afeta construtos, espíritos, monstros e mortos-vivos na área. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.imagemEspelhada]: {
    nome: "Imagem Espelhada",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Ilusão",
    description:
      `Três cópias ilusórias suas aparecem. As duplicatas ficam ao seu redor e imitam suas ações, tornando difícil para um inimigo saber quem atacar. Você recebe +6 na Defesa. Cada vez que um ataque contra você erra, uma das imagens desaparece e o bônus na Defesa diminui em 2. Um oponente deve ver as cópias para ser confundido. Se você estiver invisível, ou o atacante fechar os olhos, você não recebe o bônus (mas o atacante ainda sofre penalidades normais por não enxergar).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de cópias em +1 (e o bônus na Defesa em +2).`
      }, 
      {
        addPM: 2,
        text: `além do normal, toda vez que uma cópia é destruída, emite um clarão de luz. A criatura que destruiu a cópia fica ofuscada por uma rodada. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.infligirFerimentos]: {
    nome: "Infligir Ferimentos",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude reduz à metade",
    school: "Necro",
    description:
      `Você canaliza energia negativa contra um alvo, causando 2d8+2 pontos de dano de trevas (ou curando 2d8+2 PV, se for um morto-vivo). Infligir Ferimentos anula Curar Ferimentos.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, se falhar na resistência, o alvo fica fraco pela cena.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em 1d8+1.`
      }, 
      {
        addPM: 2,
        text: `muda a resistência para nenhum. Como parte da execução da magia, você pode fazer um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e o efeito da magia.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.lequeCromatico]: {
    nome: "Leque Cromático",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Cone de 4,5m",
    duracao: "Instantânea",
    resistencia: "Vontade parcial",
    school: "Ilusão",
    description:
      `Um cone de luzes brilhantes surge das suas mãos, deixando os animais e humanoides na área atordoados por 1 rodada (apenas uma vez por cena, Vontade anula) e ofuscados pela cena.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `além do normal, as criaturas afetadas ficam vulneráveis pela cena.`
      }, 
      {
        addPM: 2,
        text: `também afeta espíritos e monstros na área. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `também afeta construtos, espíritos, monstros e mortos-vivos na área. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.luz]: {
    nome: "Luz",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 objeto",
    duracao: "Cena",
    resistencia: "Vontade anula (veja texto)",
    school: "Evoc",
    description:
      `O alvo emite luz (mas não produz calor) em uma área com 6m de raio. O objeto pode ser guardado (em um bolso, por exemplo) para interromper a luz, que voltará a funcionar caso o objeto seja revelado. Se lançar a magia num objeto de uma criatura involuntária, ela tem direito a um teste de Vontade para anulá-la. Luz anula Escuridão.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta a área iluminada em +3m de raio.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para 1 dia.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para permanente e adiciona componente material (pó de rubi no valor de T$ 50). Não pode ser usado em conjunto com outros aprimoramentos. Requer 2º círculo.`
      }, 
      {
        addPM: 0,
        text: `(Apenas Arcanos): muda o alvo para 1 criatura. Você lança a magia nos olhos do alvo, que fica ofuscado pela cena. Não afeta criaturas cegas.`
      }, 
      {
        addPM: 2,
        text: `(Apenas Arcanos): muda o alcance para longo e o efeito para cria 4 pequenos globos flutuantes de pura luz. Você pode posicionar os globos onde quiser dentro do alcance. Você pode enviar um à frente, outra para trás, outra para cima e manter um perto de você, por exemplo. Uma vez por rodada, você pode mover os globos com uma ação livre. Cada um ilumina como uma tocha, mas não produz calor. Se um globo ocupar o espaço de uma criatura, ela fica ofuscada e sua silhueta pode ser vista claramente (ela não recebe camuflagem por escuridão ou invisibilidade). Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `(Apenas Divinos): a luz é cálida como a do sol. Criaturas que sofrem penalidades e dano pela luz solar sofrem seus efeitos como se estivessem expostos à luz solar real. Seus aliados na área estabilizam automaticamente e ficam imunes à condição sangrando, e seus inimigos ficam ofuscados. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `(Apenas Divinos): muda o alcance para toque e o alvo para 1 criatura. Em vez do normal, o alvo é envolto por um halo de luz, recebendo +10 em testes de Diplomacia e resistência a trevas 10. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.nevoa]: {
    nome: "Névoa",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Nuvem com 6m de raio e 6m de altura",
    duracao: "Cena",
    school: "Conv",
    description:
      `Uma névoa espessa eleva-se de um ponto a sua escolha, obscurecendo toda a visão — criaturas a até 1,5m têm camuflagem e criaturas a partir de 3m têm camuflagem total. Um vento forte dispersa a névoa em 4 rodadas e um vendaval a dispersa em 1 rodada. Esta magia não funciona sob a água.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `a magia também funciona sob a água, criando uma nuvem de tinta.`
      }, 
      {
        addPM: 2,
        text: `você pode escolher criaturas no alcance ao lançar a magia; elas enxergam através do efeito. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `a nuvem tem um cheiro horrível. No início de seus turnos, qualquer criatura dentro dela, ou qualquer criatura com faro em alcance curto da nuvem, deve fazer um teste de Fortitude. Se falhar, fica enjoada por uma rodada.`
      }, 
      {
        addPM: 2,
        text: `a nuvem tem um tom esverdeado e se torna cáustica. No início de seus turnos, criaturas dentro dela sofrem 2d4 pontos de dano de ácido.`
      }, 
      {
        addPM: 3,
        text: `aumenta o dano de ácido em +2d4.`
      }, 
      {
        addPM: 5,
        text: `além do normal, a nuvem fica espessa, quase sólida. Qualquer criatura dentro dela tem seu deslocamento reduzido para 3m (independentemente de seu deslocamento normal) e sofre –2 em testes de ataque e rolagens de dano.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.orientacao]: {
    nome: "Orientação",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "1 rodada",
    school: "Adiv",
    description:
      `Em seu próximo teste de perícia, o alvo pode rolar dois dados e ficar com o melhor resultado`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda a duração para cena. Em vez do normal, escolha um atributo. Sempre que o alvo fizer um teste de perícia baseado no atributo escolhido, pode rolar dois dados e ficar com o melhor resultado. Não se aplica a testes de ataque ou resistência. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda a duração para cena. Escolha entre atributos físicos (Força, Destreza e Constituição) ou mentais (Inteligência, Sabedoria e Carisma). Sempre que o alvo fizer um teste de perícia, pode rolar dois dados e ficar com o melhor resultado. Não se aplica a testes de ataque ou resistência. Requer 3º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para criaturas escolhidas. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.perdicao]: {
    nome: "Perdição",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Criaturas escolhidas",
    duracao: "Cena",
    resistencia: "Nenhuma",
    school: "Necro",
    description:
      `Amaldiçoa os alvos, que recebem –1 em testes de ataque e rolagens de dano. Perdição anula Bênção.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta as penalidades em –1, limitado pelo círculo máximo de magia que você pode lançar.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.primorAtletico]: {
    nome: "Primor Atlético",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Trans",
    description:
      `Você modifica os limites físicos do alvo, que recebe deslocamento +9m e +10 em testes de Atletismo.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, o alvo recebe um bônus adicional de +20 em testes de Atletismo para saltar (para um bônus total de +30).`
      }, 
      {
        addPM: 1,
        text: `além do normal, o alvo pode escalar paredes e tetos sem precisar fazer testes de Atletismo. Para isso, precisa estar com as mãos livres, mas pode usar uma única mão se ficar parado no lugar. O alvo não fica desprevenido enquanto escala.`
      }, 
      {
        addPM: 1,
        text: `muda a execução para ação de movimento, o alcance para pessoal, o alvo para você e a duração para instantânea. Você salta muito alto e pousa em alcance corpo a corpo de uma criatura em alcance curto. Se fizer um ataque corpo a corpo contra essa criatura neste turno, recebe os benefícios e penalidades de uma investida e sua arma causa um dado extra de dano do mesmo tipo durante este ataque.`
      }, 
      {
        addPM: 3,
        text: `além do normal, ao fazer testes de perícias baseadas em Força, Destreza ou Constituição, o alvo pode rolar dois dados e escolher o melhor. Não afeta testes de ataque ou resistência. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.profanar]: {
    nome: "Profanar",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    area: "Esfera de 9m de raio",
    duracao: "1 dia",
    school: "Necro",
    description:
      `Você enche a área com energia negativa. Dano causado por efeitos de trevas é maximizado dentro da área. Isso também afeta PV curados em mortos-vivos por esses efeitos. Esta magia não pode ser lançada em uma área contendo um símbolo visível dedicado a uma divindade que não a sua. Profanar anula Consagrar.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, mortos-vivos na área recebem +2 na Defesa e +2 em todos os testes.`
      }, 
      {
        addPM: 2,
        text: `aumenta os bônus para mortos-vivos em +1.`
      }, 
      {
        addPM: 9,
        text: `muda a execução para 1 hora, a duração para permanente e adiciona componente material (incenso e óleos no valor de T$ 1.000). Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.protecaoDivina]: {
    nome: "Proteção Divina",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Abjur",
    description:
      `Esta magia cria uma barreira mística invisível que fornece ao alvo +2 em testes de resistência.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o bônus concedido em +1.`
      }, 
      {
        addPM: 2,
        text: `muda a execução para reação, o alcance para curto e a duração para 1 rodada. Em vez do normal, o alvo recebe +5 no próximo teste de resistência que fizer (cumulativo com o efeito básico desta magia).`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para área de esfera com 3m de raio. Todos os aliados dentro da esfera recebem o bônus da magia. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `também torna o alvo imune a efeitos mentais e de medo. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.quedaSuave]: {
    nome: "Queda Suave",
    execucao: "Reação",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura ou objeto grande ou menor",
    duracao: "Até chegar ao solo ou cena o que vier primeiro",
    school: "Trans",
    description:
      `O alvo cai lentamente. A velocidade da queda é reduzida para 18m por rodada — o suficiente para não causar dano.<br>Como lançar esta magia é uma reação, você pode lançá-la rápido o bastante para salvar a si ou um aliado de quedas inesperadas.<br>Lançada sobre um projétil — como uma flecha ou uma rocha largada do alto de um penhasco —, a magia faz com que ele cause metade do dano normal, devido à lentidão.<br>Queda Suave só funciona em criaturas e objetos em queda livre ou similar; a magia não vai frear um golpe de espada ou o mergulho rasante de um atacante voador.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda o alvo para objeto Minúsculo. Em vez do normal, você pode gastar uma ação de movimento para levitar o alvo até 4,5m em qualquer direção.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para até 10 criaturas ou objetos.`
      }, 
      {
        addPM: 2,
        text: `aumenta a categoria de tamanho do alvo em uma`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.raioDoEnfraquecimento]: {
    nome: "Raio do Enfraquecimento",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Cena",
    resistencia: "Fortitude parcial",
    school: "Necro",
    description:
      `Você dispara um raio púrpura que drena as forças do alvo. Se falhar na resistência, o alvo fica Fatigado Se passar, fica Vulnerável.<br>Note que, como efeitos de magia não acumulam, lançar esta magia duas vezes contra o mesmo alvo não irá deixá-lo exausto.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda o alcance para toque e a resistência para Fortitude anula. Em vez do normal, sua mão emana um brilho púrpura e, ao tocar o alvo ele fica fatigado.`
      }, 
      {
        addPM: 2,
        text: `em vez do normal, se falhar na resistência o alvo fica exausto. Se passar, fica fatigado. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `como acima, mas muda o alvo para criaturas escolhidas. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.resistenciaAEnergia]: {
    nome: "Resistência à Energia",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Abjur",
    description:
      `Ao lançar esta magia, escolha entre ácido, eletricidade, fogo, frio, luz ou trevas. O alvo recebe redução de dano 10 contra o tipo de dano escolhido.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta a redução de dano em +5.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para 1 dia. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas. Requer 3º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o efeito para redução de dano contra todos os tipos listados na magia. Requer 3º círculo.`
      }, 
      {
        addPM: 9,
        text: `muda o efeito para imunidade a um tipo listado na magia. Requer 4º círculo`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.santuario]: {
    nome: "Santuário",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    resistencia: "Vontade anula",
    school: "Abjur",
    description:
      `Qualquer criatura que tente fazer uma ação hostil contra o alvo deve fazer um teste de Vontade. Se falhar, não consegue, perde a ação e não pode tentar novamente até o fim da cena. Santuário não protege o alvo de efeitos de área. Além disso, o próprio alvo também não pode fazer ações hostis (incluindo forçar outras criaturas a atacá-lo), ou a magia é dissipada — mas pode usar  habilidades e magias de cura e suporte como Curar Ferimentos e Bênção.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, escolha um tipo de criatura entre animal, construto ou morto-vivo. Você não pode ser percebido por criaturas não inteligentes (Int –4 ou menor) do tipo escolhido.`
      }, 
      {
        addPM: 9,
        text: `também protege o alvo contra efeitos de área. Uma criatura que tente atacar uma área que inclua o alvo deve fazer o teste de Vontade; se falhar, não consegue e perde a ação. Ela só pode tentar novamente se o alvo sair da área.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.setaInfalivelDeTalude]: {
    nome: "Seta Infalível de Talude",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Criaturas escolhidas",
    duracao: "Instantânea",
    school: "Evoc",
    description:
      `Favorita entre arcanistas iniciantes, esta magia lança duas setas de energia que causam 1d4+1 pontos de dano de essência cada. Você pode lançar as setas em alvos diferentes ou concentrá-las num mesmo alvo. Caso você possua um bônus no dano de magias, como pelo poder Arcano de Batalha, ele é aplicado em apenas uma seta (o bônus vale para a magia, não cada alvo).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda as setas para lanças de energia que surgem e caem do céu. Cada lança causa 1d8+1 pontos de dano de essência. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `muda o número de setas/lanças para três.`
      }, 
      {
        addPM: 4,
        text: `muda o número de setas/lanças para cinco. Requer 2º círculo.`
      }, 
      {
        addPM: 9,
        text: `muda o número de setas/lanças para dez. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.sono]: {
    nome: "Sono",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 humanoide",
    duracao: "Cena",
    resistencia: "Vontade parcial",
    school: "Encan",
    description:
      `Um cansaço místico recai sobre o alvo. Se falhar na resistência, ele fica inconsciente e caído ou, se estiver envolvido em combate ou outra situação perigosa, fica Exausto por 1 rodada, depois fatigado. Em ambos os casos, se passar, o alvo fica Fatigado por 1d4 rodadas.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `alvos que falhem na resistência ficam exaustos por 1d4+1 rodadas, em vez de apenas 1.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para criatura.`
      }, 
      {
        addPM: 5,
        text: `afeta todos os alvos válidos a sua escolha dentro do alcance.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.suporteAmbiental]: {
    nome: "Suporte Ambiental",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "1 dia",
    school: "Abjur",
    description:
      `Esta magia garante a sobrevivência em ambientes hostis. O alvo fica imune aos efeitos de calor e frio extremos, pode respirar na água se respirar ar (ou vice-versa) e não sufoca em fumaça densa.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.teia]: {
    nome: "Teia",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    area: "Cubo de 6m de lado",
    duracao: "Cena",
    resistencia: "Reflexos anula",
    school: "Conv",
    description:
      `Teia cria várias camadas de fibras entrelaçadas e pegajosas na área. Qualquer criatura na área que falhar na resistência fica Enredado. Uma vítima pode se libertar com uma ação padrão e um teste de Acrobacia ou Atletismo. A área ocupada por Teia é terreno difícil.<br>A Teia é inflamável. Qualquer ataque que cause dano de fogo destrói as teias por onde passar, libertando as criaturas enredadas mas deixando-as em chamas.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, criaturas que falhem na resistência também ficam imóveis.`
      }, 
      {
        addPM: 2,
        text: `além do normal, no início de seus turnos a magia afeta novamente qualquer criatura na área, exigindo um novo teste de Reflexos. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `aumenta a área em +1 cubo de 1,5m.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.toqueChocante]: {
    nome: "Toque Chocante",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude reduz à metade",
    school: "Evoc",
    description:
      `Arcos elétricos envolvem sua mão, causando 2d8+2 pontos de dano de eletricidade. Se o alvo usa armadura de metal (ou carrega muito metal, a critério do mestre), sofre uma penalidade de –5 no teste de resistência.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em 1d8+1.`
      }, 
      {
        addPM: 2,
        text: `muda a resistências para nenhum. Como parte da execução da magia, você faz um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e da magia.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para pessoal e o alvo para área: esfera com 6m de raio. Você dispara raios pelas pontas dos dedos que afetam todas as criaturas na área.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.trancaArcana]: {
    nome: "Tranca Arcana",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 objeto grande ou menor",
    duracao: "Permanente",
    school: "Abjur",
    description:
      `Esta magia tranca uma porta ou outro item que possa ser aberto ou fechado (como um baú, caixa etc.), aumentando a CD de testes de Força ou Ladinagem para abri-lo em +10. Você pode abrir livremente sua própria tranca sem problemas.<br><i>Componente material:</i> chave de bronze no valor de T$ 25.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda o alcance para curto. Em vez do normal, pode abrir ou fechar um objeto de tamanho Médio ou menor, como uma porta ou baú. Não afeta objetos trancados.`
      }, 
      {
        addPM: 1,
        text: `muda o alcance para curto e a duração para instantânea. Em vez do normal, a magia abre portas, baús e janelas trancadas, presas, barradas ou protegidas por Tranca Arcana (o efeito é dissipado) a sua escolha. Ela também afrouxa grilhões e solta correntes.`
      }, 
      {
        addPM: 5,
        text: `aumenta a CD para abrir o alvo em +5.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para 1 objeto de qualquer tamanho, podendo afetar até mesmo os portões de um castelo. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.tranquilidade]: {
    nome: "Tranquilidade",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 animal ou humanóide",
    duracao: "Cena",
    resistencia: "Vontade parcial",
    school: "Encan",
    description:
      `Você emana ondas de serenidade. Se falhar na resistência, o alvo tem sua atitude mudada para indiferente (veja a página 259) e não pode atacar ou realizar qualquer ação agressiva. Se passar, sofre –2 em testes de ataque. Qualquer ação hostil contra o alvo ou seus aliados dissipa a magia e faz ele retornar à atitude que tinha antes (ou pior, de acordo com o mestre).`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alvo para 1 criatura.`
      }, 
      {
        addPM: 1,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para médio e o alvo para criaturas escolhidas. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.transmutarObjetos]: {
    nome: "Transmutar Objetos",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "Matéria-prima como madeira rochas ossos",
    duracao: "Cena",
    school: "Trans",
    description:
      `A magia transforma matéria bruta para moldar um novo objeto. Você pode usar matéria-prima mundana para criar um objeto de tamanho Pequeno ou menor e preço máximo de T$ 25, como um balde ou uma espada. O objeto reverte à matéria-prima no final da cena, ou se for tocado por um objeto feito de chumbo. Esta magia não pode ser usada para criar objetos consumíveis, como alimentos ou itens alquímicos, nem objetos com mecanismos complexos, como bestas ou armas de fogo.<br>Transmutar Objetos anula Despedaçar.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda o alvo para 1 objeto mundano Mínusculo (ou material em quantidade equivalente) e a duração para instantânea. Em vez do normal, você pode alterar as propriedades físicas do alvo, como colorir, limpar ou sujar itens pequenos (incluindo peças de roupa), aquecer, esfriar e/ou temperar (mas não produzir) ou curar 1 PV do objeto, consertando pequenas falhas como colar um frasco de cerâmica quebrado, unir os elos de uma corrente ou costurar uma roupa rasgada. Um objeto só pode ser afetado por este truque uma vez por dia.`
      }, 
      {
        addPM: 1,
        text: `muda o alcance para toque, o alvo para 1 construto e a duração para instantânea. Em vez do normal, cura 2d8 PV do alvo. Você pode gastar 2 PM adicionais para aumentar a cura em +1d8.`
      }, 
      {
        addPM: 2,
        text: `aumenta o limite de tamanho do objeto em uma categoria.`
      }, 
      {
        addPM: 3,
        text: `aumenta o preço máximo do objeto criado em um fator de x10 (+3 PM por T$ 250 de preço, +6 PM por T$ 2.500 de preço, e assim por diante).`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para 1 objeto mundano e a duração para instantânea. Em vez do normal, você cura todos os PV do alvo, restaurando o objeto totalmente. Este aprimoramento está sujeito aos limites de tamanho e preço do objeto conforme a magia original e não funciona se o objeto tiver sido completamente destruído (queimado até virar cinzas ou desintegrado, por exemplo). Requer 3º círculo.`
      }, 
      {
        addPM: 9,
        text: `como o aprimoramento anterior, mas passa a afetar itens mágicos.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.visaoMistica]: {
    nome: "Visão Mística",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Seus olhos brilham com uma luz azul e passam a enxergar auras mágicas. Este efeito é similar ao uso de Misticismo para detectar magia, mas você detecta todas as auras mágicas em alcance médio e recebe todas as informações sobre elas sem gastar ações. Além disso, você pode gastar uma ação de movimento para descobrir se uma criatura que possa perceber em alcance médio é capaz de lançar magias e qual a aura gerada pelas magias de círculo mais alto que ela pode lançar.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `recebe visão no escuro.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para 1 dia.`
      }, 
      {
        addPM: 2,
        text: `também pode enxergar objetos e criaturas invisíveis. Eles aparecem como formas translúcidas.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.vitalidadeFantasma]: {
    nome: "Vitalidade Fantasma",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Instantânea",
    school: "Necro",
    description:
      `Você suga energia vital da terra, recebendo 2d10 pontos de vida temporários. Os PV temporários desaparecem ao final da cena.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta os PV temporários recebidos em +1d10. Caso a magia cause dano, em vez disso aumenta o dano causado em +1d10.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para área: esfera com 6m de raio centrada em você e a resistência para Fortitude reduz à metade. Em vez do normal, você suga energia das criaturas vivas na área, causando 1d10 pontos de dano de trevas e recebendo PV temporários iguais ao dano total causado. Os PV temporários desaparecem ao final da cena. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle1Names.acoiteFlamejante]: {
    nome: "Açoite Flamejante",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Açoite de chamas criado em sua mão (veja texto)",
    duracao: "Sustentada",
    resistencia: "Reflexos reduz à metade",
    school: "Conv",
    description:
      `Um açoite de fogo surge em uma de suas mãos com a qual possa empunhar uma arma (essa mão fica ocupada pela duração da magia).<br>Você pode usar uma ação padrão para causar 2d6 pontos de dano de fogo com o açoite em uma criatura em alcance curto.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, se a criatura falhar no teste de Reflexos fica em chamas.`
      }, 
      {
        addPM: 2,
        text: `muda o dano para 4d6. Requer 2° círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o dano para 6d6. Requer 3° círculo.`
      }, 
    ],
    publicacao: `Ameaças de Arton 1.0`,
  },
  [spellsCircle1Names.dardoGelido]: {
    nome: "Dardo Gélido",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude reduz à metade",
    school: "Evoc",
    description:
      `Você dispara um dardo de gelo contra o alvo, que sofre 2d6 pontos de dano de frio.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em +1d6.`
      }, 
      {
        addPM: 1,
        text: `muda a resistência para Fortitude parcial. Se passar, a criatura reduz o dano à metade; se falhar, fica lenta até o final da cena.`
      }, 
    ],
    publicacao: `Ameaças de Arton 1.0`,
  },
  [spellsCircle1Names.jatoCorrosivo]: {
    nome: "Jato Corrosivo",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Linha de 9m",
    duracao: "Instantânea",
    resistencia: "Fortitude reduz à metade",
    school: "Evoc",
    description:
      `Você dispara um jato, que causa 2d6 pontos de dano de ácido às criaturas na área. Contra construtos e objetos soltos, a magia causa +1 ponto de dano por dado.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em +1d6.`
      }, 
      {
        addPM: 1,
        text: `muda a resistência para Fortitude parcial. Se passar, a criatura reduz o dano à metade; se falhar, fica vulnerável.`
      }, 
    ],
    publicacao: `Ameaças de Arton 1.0`,
  },
  [spellsCircle1Names.detonacaoCongelante]: {
    nome: "Detonação Congelante",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Esfera de 6m de raio",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Evoc",
    description:
      `Você emite uma onda de frio extremo que cobre a área de gelo. Criaturas na área sofrem 2d6 pontos de dano de frio e ficam enredadas e imóveis por 1d4 rodadas. Passar no teste de resistência reduz o dano pela metade e deixa a criatura enredada por uma rodada. Uma criatura voadora que fica imóvel começa a cair no início do seu turno.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em +1d6.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para sustentada. Ao invés do normal, você emite uma aura de frio constante em alcance curto. Uma criatura que entre na área ou inicie seu turno dentro dela sofre 2d6 pontos de dano de frio e fica enredada e imóvel por uma rodada. Passar no teste de resistência reduz o dano pela metade, evita a condição imóvel e faz com que a criatura não possa mais ficar imóvel por esta magia nesta cena. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle1Names.disparoGelido]: {
    nome: "Disparo Gélido",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude reduz à metade",
    school: "Evoc",
    description:
      `Você dispara um dardo de neve e gelo contra o alvo, que causa 2d8+2 pontos de dano de frio.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em +1d8+1.`
      }, 
      {
        addPM: 1,
        text: `muda a resistência para Fortitude parcial. Se passar, a criatura reduz o dano à metade; se falhar, fica lenta até o final da cena.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle1Names.geiserCaustico]: {
    nome: "Geiser Cáustico",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Cilindro de 3m de diâmetro e 3m de altura",
    duracao: "Instantânea",
    resistencia: "Fortitude reduz à metade",
    school: "Evoc",
    description:
      `O solo explode em ácido corrosivo, causando 2d6 pontos de dano de ácido em todas as criaturas e objetos livres na área.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em +1d6.`
      }, 
      {
        addPM: 2,
        text: `além do normal, o solo continua borbulhando em ácido venenoso até o final da cena, tornando-se terreno difícil. Qualquer criatura que entre na área ou comece o turno dentro dela sofre 2d6 pontos de dano de ácido (sem direito a teste de resistência).`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle1Names.nuvemTempestuosa]: {
    nome: "Nuvem Tempestuosa",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    area: "Nuvem com 6m de raio",
    duracao: "Sustentada",
    resistencia: "Fortitude reduz à metade",
    school: "Conv",
    description:
      `Você cria uma nuvem espessa carregada com eletricidade que causa 2d8 pontos de dano elétrico a qualquer criatura no mesmo espaço. Você pode gastar uma ação de movimento para fazer a nuvem voar 6m em qualquer direção. Uma criatura só pode sofrer dano da nuvem uma vez por rodada. A nuvem é imune a dano e conta como uma criatura Pequena para qualquer efeito de vento.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em +1d8.`
      }, 
      {
        addPM: 2,
        text: `a nuvem também retumba com trovões. Além do normal, uma criatura que falhar no teste de Fortitude fica atordoada por 1 rodada. Se passar no teste, não pode mais ser atordoada por essa magia até o final da cena.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle1Names.armaDeJade]: {
    nome: "Arma de Jade",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 arma",
    duracao: "Cena",
    school: "Trans",
    description:
      `Esta magia ofertada por Lin-Wu trasnfere temporariamente para uma arma as qualdades místicas do jade, um raro material de Tamu-ra. A arma é considerada mágica, pode ser sacada e guardada como ação livre e fornece +1 nos testes de ataque e rolagens de dano (isso conta como um bônus de encanto). Contra espíritos, os bônus fornecidos pela magia são dobrados.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `a arma causa +1d4 de dano de eletricidade.`
      }, 
      {
        addPM: 2,
        text: `aumenta o bônus de ataque e dano em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).`
      }, 
      {
        addPM: 2,
        text: `muda o bônus de dano do aprimoramento acima para +2d4. <i>Apenas Devotos de LinWu.</i>.`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.arsenalDeAllihanna]: {
    nome: "Arsenal de Allihanna",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Arma criada em sua mão",
    duracao: "Cena",
    school: "Conv",
    description:
      `Outrora chamada <i>Armamento de Allihanna</i>, esta magia recentemente recebeu um novo nome — com implicações curiosas. Utilizada pela primeira vez por Lisandra de Galrasia, diz-se que a verdadeira origem da magia estaria relacionada a seu pai, Arsenal, então mortal.<br>Você invoca uma arma a sua escolha, em uma versão de madeira mágica que fornece +1 nos testes de ataque e rolagens de dano (isso conta como um bônus de encanto) e conta como uma arma primitiva para efeitos como a magia <i>Armamento da Natureza</i>. Se for uma arma de disparo, ela produz sua própria munição (mas você pode usar munição normal, se quiser). <i>Arsenal de Allihanna</i> não cria armas complexas (como bestas ou armas de fogo) e seus efeitos só funcionam em suas mãos.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o bônus em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).`
      }, 
      {
        addPM: 2,
        text: `a arma, ou sua munição, é recoberta de espinhos. Ela causa +1d6 pontos de dano e o alvo do ataque fica sangrando.`
      }, 
      {
        addPM: 3,
        text: `muda o alvo para uma planta. A planta manifesta uma arma corpo a corpo simples de madeira de Tollon e uma armadura de couro batido reforçada. Alternativamente, se tiver o suplemento <i>Ameaças de Arton</i>, ela manifesta uma Espada Espinhenta ou um Fruto da Espada-Mãe (p. 245). Em ambos os casos, os itens permanecem pela duração da magia. Requer 2º círculo. <i>Apenas Devotos de Allihanna ou Dahllan.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.bofetadaDeNimb]: {
    nome: "Bofetada de Nimb",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 humanoide",
    duracao: "Instantânea",
    resistencia: "Vontade parcial",
    school: "Evoc",
    description:
      `Uma mão mágica surge diante do alvo e o esbofeteia na face, ou em outra parte vulnerável, desaparecendo em seguida. O golpe não causa dano, mas é bastante humilhante. Se o alvo falhar na resistência, fica desprevenido por uma rodada e vulnerável; se passar, fica apenas vulnerável por uma rodada.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `alvos que falhem na resistência ficam vulneráveis pela cena.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para 1 criatura.`
      }, 
      {
        addPM: 2,
        text: `em vez do normal, a mão dá leves tapinhas que acalmam os alvos e anulam uma condição entre abalado, alquebrado, apavorado e frustrado. Requer 2° círculo.`
      }, 
      {
        addPM: 3,
        text: `alvos que falhem na resistência ficam desprevenidos por 1d4+1 rodadas, em vez de apenas 1.`
      }, 
      {
        addPM: 5,
        text: `afeta todos os alvos válidos à sua escolha dentro do alcance. <i>Apenas Devotos de Nimb.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.escapatoriaDeHyninn]: {
    nome: "Escapatória de Hyninn",
    execucao: "Reação",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Instantânea",
    school: "Abjur",
    description:
      `Por um breve instante, você adquire uma agilidade espantosa para se esquivar de algum perigo súbito. Você recebe +5 em Reflexos e em testes de Ladinagem para desarmar armadilhas.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda a execução para padrão e a duração para cena. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `além do normal, o alvo pode usar a habilidade Evasão (Tormenta20, p. 73). <i>Apenas Devotos de Hyninn.</i>`
      }, 
      {
        addPM: 4,
        text: `como acima, mas o alvo pode usar Evasão Aprimorada (Tormenta20, p. 75). Requer 4° círculo. <i>Apenas Devotos de Hyninn.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.euforiaDeValkaria]: {
    nome: "Euforia de Valkaria",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Encan",
    description:
      `Esta magia enche o alvo de disposição, apagando o medo (e bom senso) em seu coração e impedindo-o de ser intimidado por desafios difíceis.<br>O alvo se torna imune a medo e recebe +1 em testes de ataque quando luta em desvantagem (um encontro contra o dobro de inimigos que seu grupo, ou com ND maior que o do grupo).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o bônus em testes de ataque em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).`
      }, 
      {
        addPM: 2,
        text: `muda a execução para reação e a duração para instantânea. Em vez do normal, você recebe imunidade a medo e +2 em Vontade até o início do seu próximo turno. Requer 2° círculo.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para área de esfera com 3m de raio. Você e todos os aliados na área são afetados pela magia. Requer 2º círculo.`
      }, 
      {
        addPM: 1,
        text: `muda o alcance para toque e o alvo para 1 criatura. <i>Apenas Devotos de Valkaria.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.execucaoDeThwor]: {
    nome: "Execução de Thwor",
    execucao: "Movimento",
    alcance: "Curto (9m 6q)",
    alvo: "1 humanoide",
    duracao: "1 rodada",
    resistencia: "Vontade anula",
    school: "Necro",
    description:
      `Esta magia afeta apenas criaturas sob um efeito de medo. O próximo ataque que acertar cada um dos alvos se transforma em um acerto crítico. Se o ataque for um acerto crítico naturalmente, seu multiplicador aumenta em +1.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alvo para 1 criatura. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `em vez do normal, afeta alvos sob qualquer condição mental. Requer 3º círculo.`
      }, 
      {
        addPM: 6,
        text: `em vez de acerto crítico, o ataque é considerado um golpe de misericórdia. Requer 5º círculo. <i>Apenas Devotos de Thwor</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.flechaDeLuz]: {
    nome: "Flecha de Luz",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Reflexos parcial",
    school: "Evoc",
    description:
      `Esta magia lança uma flecha luminosa contra o alvo, que sofre 2d8+2 pontos de dano de luz e fica ofuscado por 1 rodada. Passar no teste de resistência reduz o dano à metade e evita a condição.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alvo para uma criatura que tenha causado dano a você ou a seus aliados na última rodada. Cada dado de dano (incluindo de aprimoramentos) muda para d10.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +1d8+1.`
      }, 
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1 (número de alvos adicionais limitado pelo círculo máximo de magia que você pode lançar).`
      }, 
      {
        addPM: 2,
        text: `alvos que falhem na resistência ficam cegos por 1 rodada e então ofuscados. <i>Apenas Arcanos.</i>`
      }, 
      {
        addPM: 3,
        text: `muda o alvo para seu arco arcano, a duração para sustentada e a resistência para nenhuma. Em vez do normal, transforma o alvo em uma arma luminosa que causa +2d8+2 pontos de dano de luz. Criaturas que sofram dano do arco ficam ofuscadas (veja Heróis de Arton, p. @@). <i>Apenas Arqueiros de Lenórienn.</i>`
      }, 
      {
        addPM: 1,
        text: `muda o alvo para 1 duyshidakk, devoto de Aharadak ou devoto de Thwor. Muda os dados de dano para d10. <i>Apenas Devotos de Glórienn ou Elfos.</i>`
      }, 
      {
        addPM: 2,
        text: `além do normal, para cada alvo que falhar na resistência, o próximo aliado que causar dano a ele recebe uma quantidade de PV temporários igual à metade do dano causado pela magia. <i>Apenas Divinos.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.frescorDeLena]: {
    nome: "Frescor de Lena",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Raio de 9m",
    duracao: "Instantânea",
    school: "Abjur",
    description:
      `Você emana uma aura luminosa e refrescante, que envolve você e aliados ao seu redor. A aura purifica completamente o ar ao redor, eliminando todo tipo de fumaça, poeira, gás nocivo, nuvem ácida ou veneno respiratório, mundano ou mágico. Quaisquer destes efeitos que exijam um teste de Fortitude com CD 20 ou menor são dissipados.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta a CD dos efeitos dissipados em +5.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para toque, o alvo para 1 criatura e a duração para cena. Em vez do normal, remove uma doença do alvo. Requer 2° círculo.`
      }, 
      {
        addPM: 3,
        text: `como acima, mas o alvo rola dois dados para o teste de Fortitude e usa o melhor resultado. Requer 3° círculo. <i>Apenas Devotos de Lena.</i>`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para toque e o alvo para 1 criatura. O alvo recupera 1 ponto de atributo perdido por uma doença. Requer 5° círculo. <i>Apenas Devotos de Lena.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.furiaDosAntepassados]: {
    nome: "Fúria dos Antepassados",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 humanoide",
    duracao: "Instantânea",
    resistencia: "Vontade reduz à metade",
    school: "Evoc",
    description:
      `Para aqueles devotados a Lin-Wu, respeito aos ancestrais é algo levado muito a sério — pois no além-vida, eles podem julgar suas ações e trazer fortuna ou desgraça. Esta magia invoca a alma e um antepassado da vítima para acusá-la de erros passados e trazer punição. O alvo sofre 1d6 pontos de dano psíquico e 1d6 pontos de dano de luz.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `além do normal, alvos que falhem na resistência ficam alquebrados.`
      }, 
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1. Requer 2° círculo.`
      }, 
      {
        addPM: 3,
        text: `aumenta o dano psíquico e de luz em +1d6 cada.`
      }, 
      {
        addPM: 1,
        text: `muda o alvo para 1 criatura inteligente (Int –3 ou maior). <i>Apenas Devotos de Lin-Wu.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.futuroMelhor]: {
    nome: "Futuro Melhor",
    execucao: "Reação",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "1 rodada",
    school: "Adiv",
    description:
      `Esta magia permite enxergar todas as possibilidades e consequências de um evento muito recente, ainda a tempo de escolher o melhor caminho. O alvo recebe +2 em um teste de perícia que recém tenha rolado, mas cujo resultado o mestre ainda não tenha declarado.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para curto e o alvo para uma criatura. Requer 2º círculo.`
      }, 
      {
        addPM: 1,
        text: `como acima, mas o bônus se torna 1d4+2. <i>Apenas Devotos de Thyatis.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.infortunioDeSszzaas]: {
    nome: "Infortúnio de Sszzaas",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Cena",
    resistencia: "Vontade anula",
    school: "Necro",
    description:
      `Esta maldição menor reduz a resiliência de seus inimigos, tornando-os mais frágeis e suscetíveis a efeitos nocivos. O alvo sofre –2 em testes de sua resistência com menor valor.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, criaturas afetadas perdem imunidade a venenos por uma rodada. Requer 2° círculo.`
      }, 
      {
        addPM: 2,
        text: `aumenta a penalidade em –1 (penalidade máxima limitada pelo círculo máximo de magia que você pode lançar).`
      }, 
      {
        addPM: 3,
        text: `além do normal, quando o alvo morre, deixa para trás um pequeno cristal com memórias e segredos profundos. Uma vez por busca (Tormenta20, p. 278), você pode quebrar um desses cristais para receber +2 em um teste de perícia. Requer 3° círculo. <i>Apenas Devotos de Sszzaas.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.instanteEstoico]: {
    nome: "Instante Estoico",
    execucao: "Reação",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Instantânea",
    school: "Abjur",
    description:
      `Invocando a proteção de Khalmyr, você resiste a agressões potencialmente perigosas. Quando sofre dano não mágico, você recebe RD 10 contra esse dano.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a RD para 20. Requer 2° círculo.`
      }, 
      {
        addPM: 2,
        text: `além do normal, para cada 10 pontos de dano que a magia reduzir em um turno, sua próxima rolagem de dano feita até a próxima rodada causa +1d6 pontos de dano de essência.`
      }, 
      {
        addPM: 1,
        text: `muda a execução para padrão e a duração para cena, até ser descarregada. Em vez do normal, quando sofre dano não mágico, você pode receber RD 10 contra esse dano. A magia é descarregada após você usar este efeito pela terceira vez. Requer 3º círculo. <i>Apenas Devotos de Khalmyr.</i>`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura. <i>Apenas Devotos de Khalmyr.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.magiaDadivosa]: {
    nome: "Magia Dadivosa",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Conv",
    description:
      `Não é comum descrever uma divindade maior do Panteão como “maluquinha”. Contudo, há ocasiões em que Wynna faz por merecer. Como quando oferece estas dádivas caóticas. Pela duração da magia, a cada 1d8 rodadas, você recebe 1 PM temporário que só pode ser gasto em aprimoramentos de magias. A magia termina quando você recebe um total de 8 PM temporários.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para curto e o alvo para 1 criatura. Requer 3° círculo.`
      }, 
      {
        addPM: 0,
        text: `em vez do normal, você recebe 1 PM temporário a cada 1d6 rodadas. <i>Apenas Devotos de Wynna.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.orbeDoOceano]: {
    nome: "Orbe do Oceano",
    execucao: "Reação",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "1 turno",
    school: "Abjur",
    description:
      `O suposto desaparecimento do Oceano mostra-se particularmente misterioso pelo fato de que seus devotos ainda podem lançar magias. Quando sofre um efeito hostil, você cria um globo de água salgada que o protege como se você estivesse submerso. Você recebe camuflagem leve e cobertura leve e armas de corte e perfuração que não sejam naturais lhe causam metade do dano. Além disso, ataques contra ele sofrem os efeitos de combate debaixo d'água.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a duração para sustentada.`
      }, 
      {
        addPM: 3,
        text: `muda a duração para cena. Requer 3° círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para curto, o alvo para uma criatura, a duração para sustentada e adiciona resistência (Reflexos evita). Em vez do normal, o alvo fica aprisionado dentro de um globo de água salgada; ele é considerado submerso e não pode respirar (a menos que possa respirar dentro d'água). Nenhuma criatura, objeto ou efeito de dano pode passar pelo globo. O alvo pode repetir o teste de Reflexos sempre que você se concentrar na magia. Requer 3º círculo. <i>Apenas Devotos de Oceano.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.paixaoDeMarah]: {
    nome: "Paixão de Marah",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Encan",
    description:
      `Você é cercado por uma aura de magnetismo pessoal que o torna mais interessante e atraente aos olhos dos demais. O alvo recebe +2 em Atuação e Diplomacia.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para curto e o alvo para 1 criatura.`
      }, 
      {
        addPM: 1,
        text: `além do normal, o alvo recebe +1 em Carisma. Esse aumento não oferece PV, PM ou perícias adicionais. <i>Apenas Devotos de Marah.</i>`
      }, 
      {
        addPM: 3,
        text: `muda a duração para 1 dia. Requer 2º círculo. <i>Apenas Devotos de Marah.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.percepcaoRubra]: {
    nome: "Percepção Rubra",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Esta magia concedida por Aharadak faz o conjurador adquirir, por algum tempo, a estranha percepção de tempo dos lefeu — que permite ver alguns momentos no futuro. O alvo recebe +1 em testes de ataque, Reflexos e na Defesa.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para curto e o alvo para 1 criatura.`
      }, 
      {
        addPM: 2,
        text: `aumenta o bônus em +1 (bônus máximo limitado por sua Sabedoria). <i>Apenas Devotos de Aharadak.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.perturbacaoSombria]: {
    nome: "Perturbação Sombria",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Raio de 6m",
    duracao: "Cena",
    school: "Ilusão",
    description:
      `Invocando a proteção de Tenebra, você emana uma aura de sombras assustadora. A área é tomada por sombras que se movem de formas estranhas, rangidos e gemidos sem explicação, vultos fugidios nas janelas, faces macabras urrando para sumir no instante seguinte. Todas as demais criaturas na área sofrem –5 em testes de Percepção. Medo.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o efeito para aura de 9m.`
      }, 
      {
        addPM: 2,
        text: `adiciona resistência (Vontade parcial). Além do normal, criaturas que começam seu turno dentro da área ficam abaladas. Passar no teste de resistência evita a condição e impede que a criatura seja abalada por esta magia até o fim da cena. Requer 2° círculo.`
      }, 
      {
        addPM: 2,
        text: `além do normal, criaturas na área sofrem –2 em Vontade. Requer 3° círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para toque e o alvo para 1 criatura ou objeto.`
      }, 
      {
        addPM: 5,
        text: `você pode escolher quais criaturas são afetadas pela aura. Requer 2º círculo.`
      }, 
      {
        addPM: 9,
        text: `muda o alvo para área (esfera de 6m de raio), a execução para 1 hora, a duração para permanente e adiciona componente material (incenso e óleos no valor de T$ 1.000). Requer 5° círculo.`
      }, 
      {
        addPM: 4,
        text: `além do normal, a aura é tomada por escuridão que concede camuflagem leve a todos dentro dela. Mortos-vivos e devotos de Tenebra recebem +2 em testes de perícia dentro da área. <i>Apenas Devotos de Tenebra.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.poderDeKallyadranoch]: {
    nome: "Poder de Kallyadranoch",
    execucao: "Movimento",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "1 minuto",
    school: "Evoc",
    description:
      `Por um breve momento, você manifesta uma pequena parte da força e majestade das grandes feras dracônicas: a capacidade de criar elementos em sua forma mais pura. Até o fim do seu turno, a CD para resistir às suas habilidades mágicas que causam dano de ácido, eletricidade, fogo ou frio aumenta em +2.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta a CD em +1, limitada pelo círculo máximo de magias que você pode lançar. Requer 3° círculo.`
      }, 
      {
        addPM: 1,
        text: `além do normal, criaturas que falhem nos testes de resistência contra suas habilidades mágicas sofrem uma condição baseada no tipo de dano.<br><i>Ácido:</i> vulnerável até o fim da cena.<br><i>Eletricidade:</i> atordoado por 1 rodada (apenas uma vez por cena).<br><i>Fogo:</i> em chamas e vulnerável enquanto estiver em chamas.<br><i>Frio:</i> lento até o fim da cena.<br>Requer 2° círculo. <i>Apenas Devotos de Kallyadranoch.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.posseDeArsenal]: {
    nome: "Posse de Arsenal",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "1 item empunhado",
    duracao: "1 dia",
    school: "Conv",
    description:
      `Esta magia cria um vínculo poderoso entre você e seus pertences, dificultando sua perda ou roubo. Você recebe +5 em testes opostos contra tentativas de desarmá-lo ou de quebrar o alvo, e recebe +5 em testes de Percepção contra testes de Ladinagem para roubar o item. Além disso, se o item estiver em alcance curto, você pode invocá-lo de volta às suas mãos como uma ação livre. Esta magia não afeta itens descartados ou entregues de forma voluntária (incluindo armas arremessadas).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `afeta armas arremessadas. Após o ataque, se a arma estiver livre, ela volta voando para você; pegá-la é uma reação. <i>Apenas Devotos de Arsenal.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.protecaoDeTauron]: {
    nome: "Proteção de Tauron",
    execucao: "Movimento",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Abjur",
    description:
      `Esta antiga magia ofertada pelo Deus da Força ainda pode ser lançada mesmo após sua morte, preservada por divindades simpatizantes em honra a seu aspecto como protetor dos fracos. Quando a magia é lançada, luz sagrada envolve o alvo, que se torna um "protegido”; ele recebe +2 na Defesa e, quando se move em sua direção, o deslocamento dele é dobrado. Além disso, você sabe a direção e distância do alvo, e também se ele está ferido ou afetado por qualquer condição, independentemente da distância.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `além do normal, você pode usar habilidades mágicas com alcance de toque no alvo como se elas tivessem alcance curto.`
      }, 
      {
        addPM: 2,
        text: `aumenta o bônus na Defesa em +2 (bônus máximo limitado ao dobro do círculo máximo de magia que você pode lançar). Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `além do normal, uma vez por rodada, quando uma criatura faz uma ação hostil contra o protegido, você pode fazer um ataque corpo a corpo contra ela, desde que ela esteja em seu alcance pessoal. <i>Apenas Minotauros ou Devotos de Tauron.<i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.sigiloDeSszzaas]: {
    nome: "Sigilo de Sszzaas",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "1 dia",
    school: "Abjur",
    description:
      `Ofertada pelo sombrio Deus dos Segredos, esta magia é utilizada por todos que buscam preservar a própria privacidade. Pela duração da magia, quaisquer criaturas que fizerem testes de perícia para obter alguma informação a seu respeito sofrem –5 nestes testes. Isso inclui testes de Percepção para notá-lo, Conhecimento e Investigação para descobrir algo sobre você, Intuição para discernir suas mentiras e disfarces, e assim por diante.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `adiciona resistência (Vontade parcial). Além do normal, criaturas que usem habilidades mágicas de detecção, como a magia Vidência, devem fazer um teste de Vontade. Se falharem, a habilidade não funciona e, pela duração da magia, novas tentativas de usar a mesma habilidade feitas pela mesma criatura falham automaticamente. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `muda a penalidade para –10. <i>Apenas Devotos de Sszzaas.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.sirocoDeAzgher]: {
    nome: "Siroco de Azgher",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Reflexos reduz à metade",
    school: "Evoc",
    description:
      `Invocando a fúria do Deus-Sol, você cria uma breve e focada tempestade de areia, capaz de esfolar a carne dos ossos! Cada alvo sofre dano de corte conforme seu grau de proteção: 3d6 para alvos sem armadura, 2d6 para alvos com armadura leve e 1d6 para alvos com armadura pesada.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em +1d6.`
      }, 
      {
        addPM: 2,
        text: `muda o tipo de dano para luz.`
      }, 
      {
        addPM: 3,
        text: `muda o alcance para pessoal e o alvo para área (cone de 6m). Requer 2° círculo.`
      }, 
      {
        addPM: 1,
        text: `além do normal, criaturas que falhem na resistência ficam em chamas e sangrando. <i>Apenas Devotos de Azgher.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.sorrisoDaFortuna]: {
    nome: "Sorriso da Fortuna",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "1 dia até ser descarregada",
    school: "Evoc",
    description:
      `Variantes desta magia, com diferentes nomes, são concedidas por Nimb, Hyninn, Sszzaas, Valkaria e até Thyatis. O objetivo, contudo, é sempre o mesmo: trapacear em jogos.<br><i>Sorriso da Fortuna</i> permite manipular os resultados de um jogo de azar — como aqueles com dados, cartas ou roleta. Quando fizer um teste de Jogatina (ou relacionado a algum jogo, a critério do mestre) você pode rolar dois dados e usar o melhor resultado. A magia é descarregada após você usar esse efeito três vezes.<br>Esta magia afeta apenas jogos e itens mundanos, não mágicos. Embora funcione bem em pequenas tavernas ou festejos, grandes cassinos empregam vigilantes atentos ao uso desta magia e suas variações.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta em +1 o total deusos antes da magia ser descarregada.`
      }, 
      {
        addPM: 2,
        text: `muda a execução para reação, o alcance para curto e o alvo para 1 criatura. Em vez do normal, a magia confunde um dos jogadores presentes, que rola seu teste de Jogatina com dois dados e usa o pior resultado.`
      }, 
      {
        addPM: 3,
        text: `além do normal, você pode escolher um “número da sorte”. Se o número da sorte for rolado em qualquer um dos dados, o resultado conta como um 20 natural. Requer 2° círculo.`
      }, 
      {
        addPM: 1,
        text: `muda a execução para reação e a duração para instantânea. Em vez do normal, quando faz seu primeiro teste de uma perícia em uma cena, você pode rolar dois dados e usar o melhor resultado. <i>Apenas Devotos de Hyninn.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.toqueDeMegalokk]: {
    nome: "Toque de Megalokk",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Trans",
    description:
      `Criaturas naturais de Allihanna seguem leis naturais. Monstros existem apenas para violar essas leis. Após deformações horrendas, você se transforma em uma criatura do tipo monstro. Nesta forma, você recebe +5 em Intimidação, mas sofre –5 nas demais perícias baseadas em Carisma. Além disso, recebe uma arma natural de um tipo a sua escolha entre chifre, ferrão e mordida (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com esta arma natural.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `a margem de ameaça de suas armas naturais aumenta em +1.`
      }, 
      {
        addPM: 2,
        text: `o dano de todas as suas armas naturais aumenta em um passo. Requer 3° círculo.`
      }, 
      {
        addPM: 5,
        text: `além do normal, você recebe redução de dano 5. Requer 2º círculo. <i>Apenas Devotos de Megalokk.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.vozDaRazao]: {
    nome: "Voz da Razão",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Encan",
    description:
      `Iluminada por Tanna-Toh, sua mente transborda de argumentos e informações. Você recebe +5 em Conhecimento, Diplomacia e Intimidação.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o bônus para +10. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `além do normal, você recebe +5 em Intuição e em testes de Investigação para interrogar. <i>Apenas Devotos de Tanna-Toh.</i>`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle1Names.armaduraArdente]: {
    nome: "Armadura Ardente",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Evoc",
    description:
      `Escolha um tipo de energia entre ácido, eletricidade, fogo ou frio. Uma aura faiscante dessa energia emana de seu corpo — sempre que uma criatura adjacente acertar um ataque corpo a corpo em você, ela sofre 2d6 pontos de dano do tipo escolhido.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +1d6 (total de dados limitado pelo círculo máximo de magia que você pode lançar). Requer 3º círculo.`
      }, 
      {
        addPM: 3,
        text: `muda a energia para essência. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.assobioPerigoso]: {
    nome: "Assobio Perigoso",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Grupo de criaturas conjuradas",
    duracao: "Veja texto",
    school: "Conv",
    description:
      `Esta estranha magia conjura um grupo de criaturas agressivas que imediatamente ataca o conjurador e seus aliados. Sim, você leu direito.<br>As criaturas conjuradas são seres feitos de energia e representam um encontro, preparado pelo mestre, de ND igual ao nível do conjurador.<br>Elas surgem adjacentes aos personagens, atacando assim que invocadas. Lutam até a morte ou até que se passem 24 horas. Quando morrem, não deixam corpos nem tesouro.<br>A função original da magia é incerta. Estudiosos acreditam ser fruto de um experimento falho, ou uma tentativa de conjurar alguma criatura específica. De qualquer forma, nos dias de hoje é bastante utilizada para treinar novos aventureiros, ou causar distrações em situações muito específicas.<br>Quando utilizada em meio a um combate, as criaturas podem atacar aleatoriamente qualquer dos envolvidos.`,
    aprimoramentos: [
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.conjurarArmadilha]: {
    nome: "Conjurar Armadilha",
    execucao: "Completa",
    alcance: "Curto (9m 6q)",
    alvo: "1 armadilha conjurada",
    duracao: "Permanente",
    school: "Trans",
    description:
      `Esta magia modifica o terreno e/ou a arquitetura de um ponto no alcance, transformando-o em uma armadilha do caçador (Tormenta20, p. 50) à sua escolha. A armadilha criada segue as mesmas regras de armadilhas, exceto que a CD dos testes para encontrá-la e resistir à ela são a da magia.<br>Embora seja produzida por magia, a armadilha ainda pode ser superada por meios mundanos normais. Depois de ativada, seja bem-sucedida ou não, a armadilha não volta a reativar: fica inerte e inofensiva, devendo ser conjurada outra vez.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `reduz o tempo de execução para movimento.`
      }, 
      {
        addPM: 1,
        text: `seus poderes que afetam armadilhas também afetam a armadilha criada pela magia.`
      }, 
      {
        addPM: 3,
        text: `quando lança a magia, você pode escolher qualquer número de criaturas no alcance para não serem afetadas pela armadilha. Requer 2° círculo.`
      }, 
      {
        addPM: 5,
        text: `muda a execução para padrão. A armadilha pode ser conjurada diretamente em uma área ocupada por uma criatura, o que a aciona imediatamente. Requer 3º círculo.`
      }, 
      {
        addPM: 4,
        text: `em vez do normal, você pode conjurar uma das suas armadilhas de armadilheiro mestre. <i>Apenas Armadilheiro Mestres.</i>`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.desafioCorajoso]: {
    nome: "Desafio Corajoso",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura voluntária",
    duracao: "Sustentada",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `Esta magia cria uma aura de influência de em ao redor do alvo. Outras criaturas que iniciarem seus turnos dentro da aura devem fazer um teste de Vontade. Se falharem, suas ações hostis deste turno devem ser feitas contra o alvo.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda a aura para 18m. Requer 2° círculo.`
      }, 
      {
        addPM: 3,
        text: `muda o alvo para criatura ou objeto. O alvo tem direito a um teste de Vontade para impedir a criação da aura. Requer 3° círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.discricao]: {
    nome: "Discrição",
    execucao: "Padrão",
    alcance: "Pessoal ou toque",
    alvo: "Você ou 1 objeto",
    duracao: "Cena",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `Esta magia torna a aparência do alvo desinteressante, como se este fosse parte da paisagem, algo perdido na bagunça, ou mais um na multidão. O alvo não se torna invisível, ainda é percebido como uma criatura ou objeto; o Encan apenas desvia a atenção dos observadores para outras pessoas ou elementos ao redor. Testes de Investigação e Percepção em relação ao alvo sofrem uma penalidade de –10.<br>Em combate, enquanto Discrição estiver ativa, todos os inimigos que iniciarem seus turnos em até 9m do alvo da magia devem fazer um teste de Vontade. Se falharem, qualquer ação hostil que realizarem ignora a criatura. Essa magia se dissipa se você causar dano a qualquer criatura.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alvo para 1 criatura. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `aumenta a penalidade em testes para –15. Requer 2º círculo.`
      }, 
      {
        addPM: 3,
        text: `além do normal, o alvo não pode ser detectado por magias de Adiv. Requer 4° círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.distracaoFugaz]: {
    nome: "Distração Fugaz",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 humanóide",
    duracao: "Instantânea",
    resistencia: "Vontade anula",
    school: "Ilusão",
    description:
      `Esta magia busca algo de grande interesse pessoal (seja uma pessoa, item, lembrança...) no coração do alvo e produz uma breve ilusão de acordo.<br>Não é necessário que você conheça esse objeto de apreço, a própria magia faz essa revelação. A magia, entretanto, não  capaz de revelar detalhes minuciosos (como o nome de uma pessoa ou item desejado), produzindo uma versão “genérica” do objeto de interesse.<br>Por exemplo, um bucaneiro ganancioso enxerga tibares de ouro caindo à sua frente. Um guerreiro se espanta ao notar o oponente usando uma arma muito cobiçada. Um bárbaro comilão fareja um delicioso sanduíche de presunto. Um gladiador libertino encanta-se com o surgimento súbito de uma ninfa deslumbrante, e assim por diante.<br>Não importando a natureza da distração, se falhar em seu teste de Vontade, o alvo fica desprevenido durante 1 rodada.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, se falhar no teste de Vontade o alvo também sofre –5 em testes de Diplomacia e Intimidação até o fim da cena.`
      }, 
      {
        addPM: 1,
        text: `muda o alvo para 1 criatura. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `em vez de desprevenido, o alvo fica atordoado (apenas uma vez por cena).`
      }, 
      {
        addPM: 2,
        text: `afeta todos os alvos válidos a sua escolha dentro do alcance. Requer 2º círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.emularMagia]: {
    nome: "Emular Magia",
    execucao: "Movimento",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Evoc",
    description:
      `Pela duração da magia, você pode lançar uma magia que tenha visto ser lançada em alcance curto desde a última rodada. A magia deve ser de um tipo (arcana ou divina) e de um círculo a que você tenha acesso.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `a magia emulada pode ser de qualquer tipo, arcana ou divina.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.espiritoBalistico]: {
    nome: "Espírito Balístico",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura conjurada",
    duracao: "Sustentada",
    school: "Conv",
    description:
      `Esta magia invoca uma criatura pequena, similar a <i>Conjurar Monstro</i>, mas limitada a uma única função. O espírito é fixo, permanecendo no lugar onde foi invocado, incapaz de se mover ou esquivar. Em cada um dos turnos do conjurador, o espírito dispara um projétil mágico contra o inimigo mais próximo em alcance médio, causando 1d6 pontos de dano de perfuração. O espírito não realiza outras ações, e ataca a cada rodada até que a magia termine, não existam mais inimigos no alcance, ou o espírito seja destruído.<br>O espírito tem tem For 2, Des 3 e todos os outros atributos nulos. Ele tem Defesa igual a sua, 20 pontos de vida e usa o seu bônus para teste de Reflexos. Ele é imune a efeitos que pedem um teste de Fortitude ou Vontade.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o número de espíritos para dois.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em um dado do mesmo tipo (total de dados limitado pelo círculo máximo de magia que você pode lançar). Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o número de espíritos para três. Requer 2º círculo.`
      }, 
      {
        addPM: 3,
        text: `muda o dado de dano para d8 e o tipo de dano para o seu tipo de energia. <i>Apenas Golem elementa, Qareen ou Kallyanach.</i>`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.farejarFortuna]: {
    nome: "Farejar Fortuna",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Ao lançar esta magia, você sabe se existe algum tesouro em alcance longo. Para este efeito, é considerado  “tesouro” qualquer acúmulo de itens valiosos (acima do dinheiro inicial de um personagem de mesmo nível) que não estejam sendo vestidos por uma criatura inteligente.<br>Você sabe se há tesouros na área, mas não recebe nenhuma outra informação a respeito, como a direção do tesouro, valor exato do mesmo, obstáculos no caminho... nada disso é informado pela magia.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `você recebe +5 em testes de perícia para localizar o tesouro.`
      }, 
      {
        addPM: 2,
        text: `em vez do normal, quando você rola qualquer dado para definir um tesouro, pode rolar dois dados e escolher qual resultado usar.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para um item recém-encontrado e a duração para instantânea. Você identifica todas as propriedades daquele item e seu histórico, se houver. Requer 3° círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.maaaisKlunc]: {
    nome: "Maaais Klunc",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Trans",
    description:
      `Esta magia surgiu com o objetivo de invocar a força estupenda e estapafúrdia de certo bárbaro lendário, capaz de alcançar dimensões colossais. Infelizmente (ou talvez felizmente) seus efeitos reais são muito mais brandos, pouco se aproximando do poder descomunal e descabido do bruto em questão. Melhor assim. Ao conjurar a magia você adquire uma fantástica Força +10. Um relevante efeito colateral, contudo, é que sua Inteligência cai para acachapantes –2. Não, não uma penalidade de –2; um ATRIBUTO –2!<br>Pela duração de Maaais Klunc, você não poderá lançar magias, nem será capaz de interromper esta magia de forma voluntária — quem dirá soletrar essa palavra. O mestre pode (vai) exigir testes de Inteligência mesmo para as tarefas mentais mais simplórias, como achar a saída de um aposento vazio, diferenciar aliado de inimigo, ou determinar qual extremidade da arma vai na direção do adversário.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura voluntária (por que alguém seria voluntário?). Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para curto e o alvo para 1 criatura involuntária (Vontade evita). Requer 3º círculo. Espera, o quê?!`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.ossosDeAdamante]: {
    nome: "Ossos de Adamante",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Trans",
    description:
      `Esta magia confere resistência extraordinária ao esqueleto, evitando ataques que causam fraturas graves. O alvo recebe redução de impacto 5 e fortificação 25%.<br>Devido à rigidez do esqueleto, o corpo do alvo se torna incapaz de mudar de forma (como a magia Metamorfose ou a habilidade Forma Selvagem). Se sofrer um efeito de metamorfose, em vez de mudar de forma, o alvo perde 8d6 pontos de vida e fica debilitado. Nem a perda de vida nem a condição podem ser curados enquanto Ossos de Adamante estiver em efeito. Esta magia só pode ser lançada sobre criaturas vivas e não afeta construtos.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `como o normal, mas a magia pode ser lançada sobre um osteon. O alvo recebe redução de dano 5 e fortificação 50%. Requer 2º círculo.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura viva (exceto construtos).`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.pontoFraco]: {
    nome: "Ponto Fraco",
    execucao: "Movimento",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Vontade evita",
    school: "Adiv",
    description:
      `Você analisa uma criatura em busca de pontos fracos e outras características. Como parte do efeito da magia, você faz um teste de Misticismo para identificar criatura contra o alvo (independentemente do tipo dele) com um bônus de +10.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o bônus no teste em +5.`
      }, 
      {
        addPM: 2,
        text: `além do normal, você recebe +2 em testes contra a criatura até o fim da cena. Requer 2° círculo.`
      }, 
      {
        addPM: 2,
        text: `além do normal, sua próxima rolagem de dano contra a criatura nesta cena ignora a redução de dano dela. Requer 2° círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.punhoDeMitral]: {
    nome: "Punho de Mitral",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Trans",
    description:
      `Esta magia transforma uma de suas mãos em mitral, tornando-a prateada como esse metal. A mão continua capaz de realizar movimentos normais e segurar objetos — mas também poderá golpear ou esmagar. Se não estiver segurando nada com essa mão, você recebe +1 em testes de ataque e na margem de ameaça com ataques desarmados, e pode causar dano letal ou não letal com eles. Por fim, você pode manipular venenos com essa mão sem chance de se envenenar acidentalmente.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o bônus em teste de ataque e na margem de ameaça para 2.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura. Requer 2º círculo.`
      }, 
      {
        addPM: 5,
        text: `além do normal, se estiver empunhando um item estérico com essa mão, ele recebe os benefícios da melhoria mitral (mesmo que já possua outro material especial). Requer 2° círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle1Names.toqueDoHorizonte]: {
    nome: "Toque do Horizonte",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 arma de ataque à distância",
    duracao: "Cena",
    school: "Trans",
    description:
      `A magia melhora a acurácia da arma, aumentando seu alcance em um passo (de curto para médio, e de médio para longo). Se o alcance da arma já é longo, ele é dobrado. Este efeito conta como um bônus de encanto.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `a arma ignora camuflagem leve ou penalidades por cobertura.`
      }, 
      {
        addPM: 2,
        text: `além do normal, a arma fornece +1 em testes de ataque e rolagens de dano feitos dentro do seu alcance original (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).`
      }, 
      {
        addPM: 2,
        text: `a margem de ameaça da arma aumenta em 1. Requer 2° círculo.`
      }, 
      {
        addPM: 4,
        text: `muda o alvo para uma arma de arremesso e a duração para sustentada. Em vez do normal, a arma recebe o benefício do encanto dançarina. Requer 3° círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
};

export const spellsCircle2: Record<spellsCircle2Names, Spell> = {
  [spellsCircle2Names.aliadoAnimal]: {
    nome: "Aliado Animal",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 animal prestativo",
    duracao: "1 dia",
    school: "Encan",
    description:
      `Você cria um vínculo mental com um animal prestativo em relação a você. O Aliado Animal obedece a você no melhor de suas capacidades, mesmo que isso arrisque a vida dele. Ele funciona como um parceiro veterano, de um tipo a sua escolha entre ajudante, combatente, fortão, guardião, montaria ou perseguidor.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alvo para 1 animal Minúsculo e a duração para 1 semana. Em vez do normal, o animal se desloca no melhor de suas capacidades até um local designado por você — em geral, para levar um item, carta ou similar. Quando o animal chega ao destino, fica esperando até o fim da magia, permitindo apenas que uma ou mais criaturas escolhidas por você se aproximem e peguem o que ele estiver carregando.`
      }, 
      {
        addPM: 7,
        text: `muda o parceiro para mestre. Requer 3º círculo.`
      }, 
      {
        addPM: 12,
        text: `muda o alvo para 2 animais prestativos. Cada animal funciona como um parceiro de um tipo diferente, e você pode receber a ajuda de ambos (mas ainda precisa seguir o limite de parceiros de acordo com o seu nível de personagem). Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.alterarTamanho]: {
    nome: "Alterar Tamanho",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 objeto",
    duracao: "1 dia",
    school: "Trans",
    description:
      `Esta magia aumenta ou diminui o tamanho de um item mundano em até três categorias (um objeto Enorme vira Pequeno, por exemplo). Você também pode mudar a consistência do item, deixando-o rígido como pedra ou flexível como seda (isso não altera sua RD ou PV, apenas suas propriedades físicas). Se lançar a magia num objeto de uma criatura involuntária, ela pode fazer um teste de Vontade para anulá-la.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura. Em vez do normal, o alvo aumenta uma categoria de tamanho (seu equipamento se ajusta ao novo tamanho). O alvo também recebe Força +2. Um alvo involuntário pode fazer um teste de Fortitude para negar o efeito.`
      }, 
      {
        addPM: 3,
        text: `muda o alcance para toque e o alvo para 1 criatura. Em vez do normal, o alvo diminui uma categoria de tamanho (seu equipamento se ajusta ao novo tamanho). O alvo também recebe Destreza +2. Um alvo involuntário pode fazer um teste de Fortitude para negar o efeito. Requer 3º círculo.`
      }, 
      {
        addPM: 7,
        text: `muda o alcance para toque, o alvo para 1 criatura, a duração para permanente e a resistência para Fortitude anula. Em vez do normal, se falhar na resistência o alvo e seu equipamento têm seu tamanho mudado para Minúsculo. O alvo também tem seu valor de Força reduzido a 1 e suas formas de deslocamento reduzidas a 3m. Requer 4o círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.amarrasEtereas]: {
    nome: "Amarras Etéreas",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura",
    duracao: "Cena",
    resistencia: "Reflexos anula",
    school: "Conv",
    description:
      `Três laços de energia surgem e se enroscam no alvo, deixando-o agarrado. A vítima pode tentar se livrar, gastando uma ação padrão para fazer um teste de Atletismo (CD igual à da magia). Se passar, destrói um laço, mais um laço adicional para cada 5 pontos pelos quais superou a CD. Os laços também podem ser atacados e destruídos: cada um tem Defesa 10, 10 PV, RD 5 e imunidade a dano mágico. Se todos os laços forem destruídos, a magia é dissipada. Por serem feitos de energia, os laços afetam criaturas incorpóreas.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 2,
        text: `aumenta o número de laços em um alvo a sua escolha em +1. (bônus máximo limitado pelo círculo máximo de magia que você pode lançar)`
      }, 
      {
        addPM: 3,
        text: `em vez do normal, cada laço é destruído automaticamente com um único ataque bem-sucedido; porém, cada laço destruído libera um choque de energia que causa 1d8+1 pontos de dano de essência na criatura amarrada. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.aparenciaPerfeita]: {
    nome: "Aparência Perfeita",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Ilusão",
    description:
      `Esta magia lhe concede um rosto idealizado, porte físico garboso, voz melodiosa e olhar sedutor. Enquanto a magia estiver ativa, seu Carisma torna-se 5 (ou recebe um bônus de +2, caso seja 5 ou maior) e você recebe +5 nos testes de Diplomacia e Enganação. Quando a magia acaba, quaisquer observadores percebem a mudança e tendem a suspeitar de você. Da mesma maneira, pessoas que o viram sob o efeito da magia sentirão que “algo está errado” ao vê-lo em condições normais. Quando a cena acabar, você pode gastar os PM da magia novamente como uma ação livre para mantê-la ativa. Este efeito não fornece PV ou PM adicionais.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para toque e o alvo para 1 humanoide`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.augurio]: {
    nome: "Augúrio",
    execucao: "Completa",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Instantânea",
    school: "Adiv",
    description:
      `Esta magia diz se uma ação que você tomará em breve — no máximo uma hora no futuro — trará resultados bons ou ruins. O mestre rola 1d6 em segredo; com um resultado de 2 a 6, a magia funciona e você recebe uma das seguintes respostas: “felicidade” (a ação trará bons resultados);“miséria” (a ação trará maus resultados);“felicidade e miséria” (para ambos) ou “nada” (para ações que não trarão resultados bons ou ruins).<br>Com um resultado 1, a magia falha e oferece o resultado “nada”. Não há como saber se esse resultado foi dado porque a magia falhou ou não. Lançar esta magia múltiplas vezes sobre o mesmo assunto gera sempre o primeiro resultado.<br>Por exemplo, se o grupo está prestes a entrar em uma câmara, o augúrio dirá “felicidade” se a câmara contém um tesouro desprotegido, “miséria” se contém um monstro, “felicidade e miséria” se houver um tesouro e um monstro ou “nada” se a câmara estiver vazia.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `muda a execução para 1 minuto. Em vez do normal, você pode consultar uma divindade, fazendo uma pergunta sobre um evento que acontecerá até um dia no futuro. O mestre rola a chance de falha; com um resultado de 2 a 6, você recebe uma resposta, desde uma simples frase até uma profecia ou enigma. Em geral, este uso sempre oferece pistas, indicando um caminho a tomar para descobrir a resposta que se procura. Numa falha você não recebe resposta alguma. Requer 3º círculo.`
      }, 
      {
        addPM: 7,
        text: `muda a execução para 10 minutos e a duração para 1 minuto. Em vez do normal, você consulta uma divindade, podendo fazer uma pergunta por rodada, desde que ela possa ser respondida com “sim”, “não” ou “não sei” (embora poderosos, os deuses não são oniscientes). O mestre rola a chance de falha para cada pergunta. Em caso de falha, a resposta também é “não sei”. Requer 4º círculo.`
      }, 
      {
        addPM: 7,
        text: `o mestre rola 1d12; a magia só falha em um resultado 1.`
      }, 
      {
        addPM: 12,
        text: `o mestre rola 1d20; a magia só falha em um resultado 1.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.bolaDeFogo]: {
    nome: "Bola de Fogo",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Esfera de 6m de raio",
    duracao: "Instantânea",
    resistencia: "Reflexos reduz à metade",
    school: "Evoc",
    description:
      `Esta famosa magia de ataque cria uma poderosa explosão, causando 6d6 pontos de dano de fogo em todas as criaturas e objetos livres na área.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +2d6.`
      }, 
      {
        addPM: 2,
        text: `muda a área para efeito de esfera flamejante com tamanho Médio e a duração para cena. Em vez do normal, cria uma esfera flamejante com 1,5m de diâmetro que causa 3d6 pontos de dano a qualquer criatura no mesmo espaço. Você pode gastar uma ação de movimento para fazer a esfera voar 9m em qualquer direção. Ela é imune a dano, mas pode ser apagada com água. Uma criatura só pode sofrer dano da esfera uma vez por rodada.`
      }, 
      {
        addPM: 3,
        text: `muda a duração para 1 dia ou até ser descarregada. Em vez do normal, você cria uma pequena pedra flamejante, que pode detonar como uma reação, descarregando a magia. A pedra pode ser usada como uma arma de arremesso com alcance curto. Uma vez detonada, causa o dano da magia numa área de esfera de 6m com raio.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.campoDeForca]: {
    nome: "Campo de Força",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Abjur",
    description:
      `Esta magia cria uma película protetora sobre você. Você recebe 30 pontos de vida temporários.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a execução para reação e a duração para instantânea. Em vez do normal, você recebe redução 30 contra o próximo dano que sofrer.`
      }, 
      {
        addPM: 3,
        text: `muda os PV temporários ou a RD para 50. Requer 3º círculo.`
      }, 
      {
        addPM: 7,
        text: `muda o alcance para curto, o alvo para outra criatura ou objeto Enorme ou menor e a duração para sustentada. Em vez do normal, cria uma esfera imóvel e tremeluzente ao redor do alvo. Nenhuma criatura, objeto ou efeito de dano pode passar pela esfera, embora criaturas possam respirar normalmente. Criaturas na área podem fazer um teste de Reflexos para evitar serem aprisionadas e sempre que você se concentrar. Requer 4º círculo.`
      }, 
      {
        addPM: 7,
        text: `muda os PV temporários ou a RD para 70. Requer 4º círculo.`
      }, 
      {
        addPM: 9,
        text: `como o aprimoramento acima, mas tudo dentro da esfera fica praticamente sem peso. Uma vez por rodada, você pode gastar uma ação livre para flutuar a esfera e seu conteúdo 9m em uma direção. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.camuflagemIlusoria]: {
    nome: "Camuflagem Ilusória",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Ilusão",
    description:
      `O alvo fica com sua imagem nublada, como se vista através de um líquido, recebendo os efeitos de camuflagem leve.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `muda a duração para sustentada. A imagem do alvo fica mais distorcida, aumentando a chance de falha da camuflagem leve para 50%.`
      }, 
      {
        addPM: 7,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.circuloDaJustica]: {
    nome: "Círculo da Justiça",
    execucao: "Completa",
    alcance: "Curto (9m 6q)",
    area: "Esfera de 9m de raio",
    duracao: "1 dia",
    resistencia: "Vontade parcial",
    school: "Abjur",
    description:
      `Também conhecida como Lágrimas do Deus da Trapaça, esta magia é usada em tribunais e para proteger áreas sensíveis. Criaturas na área sofrem –10 em testes de Acrobacia, Enganação, Furtividade e Ladinagem e não podem mentir deliberadamente — mas podem tentar evitar perguntas que normalmente responderiam com uma mentira (sendo evasivas ou cometendo omissões, por exemplo). Uma criatura que passe na resistência tem as penalidades reduzidas para –5 e pode mentir.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a execução para ação padrão, o alcance para pessoal, o alvo para você, a duração para cena e a resistência para nenhuma. Em vez do normal, qualquer criatura ou objeto invisível em alcance curto se torna visível. Isso não dissipa o efeito mágico; se sair do seu alcance, a criatura ou objeto voltam a ficar invisíveis.`
      }, 
      {
        addPM: 3,
        text: `muda a penalidade nas perícias para –10 (se passar na resistência) e –20 (se falhar). Requer 4º círculo.`
      }, 
      {
        addPM: 7,
        text: `muda a duração para permanente e adiciona componente material (balança de prata no valor de T$ 5.000).`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.condicao]: {
    nome: "Condição",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Até 5 criaturas",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Pela duração da magia, você sabe a posição e status (PV atuais, se estão sob efeito de magia...) dos alvos. Depois de lançada, a distância entre você e os alvos não importa — a magia só deixa de detectar um alvo se ele morrer ou for para outro plano.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 1,
        text: `aumenta a duração para 1 dia.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.conjurarMortosVivos]: {
    nome: "Conjurar Mortos-Vivos",
    execucao: "Completa",
    alcance: "Curto (9m 6q)",
    alvo: "6 mortos-vivos",
    duracao: "Sustentada",
    school: "Necro",
    description:
      `Você conjura seis esqueletos capangas de tamanho Médio feitos de energia negativa em espaços desocupados dentro do alcance. Você pode gastar uma ação de movimento para fazer os mortos-vivos andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6+2 pontos de dano de trevas cada). Os esqueletos têm For 2, Des 2, Defesa 18 e todos os outros atributos nulos; eles têm 1 PV e falham automaticamente em qualquer teste de resistência ou oposto, mas são imunes a atordoamento, dano não letal, doença, Encan, fadiga, frio, ilusão, paralisia, sono e veneno. Eles desaparecem quando são reduzidos a 0 PV ou no fim da cena. Os mortos-vivos não agem sem receber uma ordem. Usos criativos para capangas fora de combate ficam a critério do mestre.<br><i>Carniçal:</i> como esqueletos, mas têm For 3, Des 3, Defesa 27 e causam 1d8+3 pontos de dano de trevas mais perda de 1d8 PV por veneno. Além disso, criaturas atingidas por um carniçal devem passar num teste de Fortitude ou ficam Paralisado por 1 rodada. Uma criatura que passe no teste de resistência fica imune à paralisia dos carniçais por um dia.<br><i>Sombra:</i> como esqueletos, mas têm Des 4, Defesa 35, a habilidade incorpóreo e causam 2d10 pontos de dano de trevas. Além disso, criaturas vivas atingidas por uma sombra devem passar num teste de Fortitude ou perdem 1d4 PM. Sombras perdem a habilidade incorpóreo quando expostas à luz do sol.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de mortos-vivos conjurados em +1.`
      }, 
      {
        addPM: 3,
        text: `em vez de esqueletos, conjura carniçais. Requer 3º círculo.`
      }, 
      {
        addPM: 7,
        text: `em vez de esqueletos, conjura sombras. Requer 4º círculo.`
      }, 
      {
        addPM: 2,
        text: `em vez de esqueletos, conjura soterrados. Requer 3° círculo, apenas arcanos.<br><i>Soterrado:</i> como esqueletos, mas causam dano de frio. Além disso, criaturas atingidas por um soterrado devem passar num teste de Fortitude ou ficam enredadas por uma rodada.`
      }, 
      {
        addPM: 3,
        text: `em vez de esqueletos, conjura fúrias de Tauron. Requer 3º círculo.<br><i>Fúria de Tauron:</i> como esqueletos, mas têm tamanho Pequeno, deslocamento de voo 12m, a habilidade incorpóreo, Des 5, Defesa 18 e causam 1d6 pontos de dano de trevas mais 1d6 pontos de dano de fogo. Além disso, criaturas vivas atingidas ficam desprevenidas por uma rodada e em chamas (Fort CD igual a da magia evita).`
      }, 
      {
        addPM: 3,
        text: `em vez de esqueletos, conjura guerreiros perpétuos. Requer 3º círculo. Apenas devotos de Arsenal.<br><i>Guerreiro Perpétuo:</i> como esqueletos, mas têm For 5, Des 4, Defesa 33, a habilidade incorpóreo e causam 3d6 pontos de dano de impacto duas vezes por rodada.`
      }, 
      {
        addPM: 3,
        text: `em vez de esqueletos, conjura zumbis peçonhas. Requer 3º círculo. Apenas devotos de Sszzaas.<br><i>Zumbi Peçonha:</i> como esqueletos, mas têm For 3, Des 1, Defesa 25 e causam 1d8+1 pontos de dano de trevas mais perda de 2d6 PV por veneno. Além disso, criaturas atingidas por um zumbi peçonha devem passar num teste de Fortitude ou ficam atordoadas por 1 rodada e depois fracas. Uma criatura que passe no teste de resistência fica fraca por 1 rodada e imune ao atordoamento dos zumbis peçonha até o fim da cena.`
      }, 
    ],
    publicacao: `Jogo do Ano, Ameaças de Arton 1.0`,
  },
  [spellsCircle2Names.controlarFogo]: {
    nome: "Controlar Fogo",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Veja texto",
    duracao: "Cena",
    school: "Evoc",
    description:
      `Você pode criar, moldar, mover ou extinguir chamas e emanações de calor. Ao lançar a magia, escolha um dos efeitos.<br><i>Chamejar:</i> o alvo é armas escolhidas. Elas causam +1d6 de dano de fogo. Também afeta armas naturais e ataques desarmados.<br><i>Esquentar:</i> o alvo é 1 objeto, que começa a esquentar. Ele sofre 1d6 pontos de dano de fogo por rodada e causa o mesmo dano a qualquer criatura que o esteja segurando ou vestindo. A critério do mestre, o objeto ou a criatura vestindo-o também podem fica em chamas. Uma criatura pode gastar uma ação completa para resfriar o objeto (jogando areia ou se jogando numa fonte de água próxima, por exemplo) e cancelar o efeito da magia.<br><i>Extinguir:</i> o alvo é 1 chama de tamanho Grande ou menor, que é apagada. Isso cria uma nuvem de fumaça que ocupa uma esfera de 3m de raio centrada onde estava a chama. Dentro da fumaça, criaturas têm camuflagem leve.<br><i>Modelar:</i> o alvo é 1 chama de tamanho Grande ou menor. A cada rodada, você pode gastar uma ação livre para movimentá-la 9m em qualquer direção. Se atravessar o espaço ocupado por uma criatura, causa 2d6 pontos de dano de fogo. Uma criatura só pode receber dano dessa maneira uma vez por rodada.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a duração para sustentada e a resistência para Reflexos reduz à metade. Em vez do normal, você deve escolher o seguinte efeito. Labaredas: a cada rodada, você pode gastar uma ação de movimento para projetar uma labareda, acertando um alvo em alcance curto a partir da chama. O alvo sofre 4d6 pontos de dano de fogo (Reflexos reduz à metade).`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +1d6 (exceto Chamejar).`
      }, 
      {
        addPM: 3,
        text: `muda o alvo para 1 criatura composta principalmente por fogo, lava ou magma (como um elemental do fogo) e a resistência para Fortitude parcial. Em vez do normal, se a criatura falhar no teste de resistência, é reduzida a 0 PV. Se passar, sofre 5d6 pontos de dano.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.controlarMadeira]: {
    nome: "Controlar Madeira",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 objeto de madeira grande ou menor",
    duracao: "Cena",
    school: "Trans",
    description:
      `Você molda, retorce, altera ou repele madeira. Se lançar esta magia num objeto de uma criatura involuntária, ela tem direito a um teste de Vontade para anulá-la. Ao lançar a magia, escolha.<br><i>Fortalecer:</i> deixa o alvo mais resistente. Armas têm seu dano aumentado em um passo. Escudos têm seu bônus de Defesa aumentado em +2 (isso é uma melhoria no item, portanto é cumulativa com outras magias). Esses e outros itens de madeira recebem +5 na RD e dobram seus PV.<br><i>Modelar:</i> muda a forma do alvo. Pode transformar um galho em espada, criar uma porta onde antes havia apenas uma parede, transformar um tronco em uma caixa... Mas não pode criar mecanismos complexos (como uma besta) ou itens consumíveis.<br><i>Repelir:</i> o alvo é repelido por você. Se for uma arma, ataques feitos com ela contra você falham automaticamente. Se for uma porta ou outro objeto que possa ser aberto, ele vai se abrir quando você se aproximar, mesmo que esteja trancado. Um objeto que vá atingi-lo, como uma carroça, tronco ou barril, vai desviar ou parar adjacente a você, sem lhe causar dano. Os efeitos de regras em outros objetos de madeira ficam a cargo do mestre.<br><i>Retorcer:</i> estraga o alvo. Uma porta retorcida emperra (exigindo um teste de Força contra CD 25 para ser aberta). Armas e itens retorcidos impõem –5 em testes de perícia. Escudos retorcidos deixam de oferecer bônus (mas ainda impõem penalidades). Um barco retorcido começa a afundar e naufraga ao final da cena. Os efeitos de regras em outros objetos de madeira ficam a cargo do mestre.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para pessoal, o alvo para você e a duração para 1 dia. Você e seu equipamento se transformam em uma árvore de tamanho Grande. Nessa forma, você não pode falar ou fazer ações físicas, mas consegue perceber seus arredores normalmente. Se for atacado nessa forma, a magia é dissipada. Um teste de Sobrevivência (CD 30) revela que você não é uma árvore verdadeira.`
      }, 
      {
        addPM: 3,
        text: `muda o alvo para área de quadrado com 9m de lado e a duração para cena. Em vez do normal, qualquer vegetação na área fica rígida e afiada. A área é considerada terreno difícil e criaturas que andem nela sofrem 1d6 pontos de dano de corte para cada 1,5m que avancem.`
      }, 
      {
        addPM: 7,
        text: `muda o alvo para Enorme ou menor. Requer 3º círculo.`
      }, 
      {
        addPM: 12,
        text: `muda o alvo para Colossal ou menor. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.cranioVoadorDeVladislav]: {
    nome: "Crânio Voador de Vladislav",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Necro",
    description:
      `Esta magia cria um crânio envolto em energia negativa. Quando atinge o alvo, causa 4d8+4 pontos de dano de trevas e se desfaz emitindo um som horrendo, deixando abalado o alvo e todos os inimigos num raio de 3m dele (criaturas já abaladas ficam apavoradas por 1d4 rodadas). Passar no teste de resistência diminui o dano à metade e evita a condição (as demais criaturas na área também tem direito ao teste de resistência, para evitar a condição).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +1d8+1.`
      }, 
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.desesperoEsmagador]: {
    nome: "Desespero Esmagador",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Cone de 6m",
    duracao: "Cena",
    resistencia: "Vontade parcial",
    school: "Encan",
    description:
      `Humanoides na área são acometidos de grande tristeza, adquirindo as condições Fraco e Frustrado. Se passarem na resistência, adquirem essas condições por uma rodada.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `em vez do normal, as condições adquiridas são debilitado e esmorecido.`
      }, 
      {
        addPM: 3,
        text: `em vez do normal, afeta qualquer tipo de criatura.`
      }, 
      {
        addPM: 3,
        text: `além do normal, criaturas que falhem na resistência ficam aos prantos (em termos de jogo, adquirem a condição pasmo) por 1 rodada (apenas uma vez por cena). Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.dissiparMagia]: {
    nome: "Dissipar Magia",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura ou 1 objeto mágico ou esfera com 3m de raio",
    duracao: "Instantânea",
    school: "Abjur",
    description:
      `Você dissipa outras magias que estejam ativas, como se sua duração tivesse acabado. Note que efeitos de magias instantâneas não podem ser dissipados (não se pode dissipar uma Bola de Fogo ou Relâmpago depois que já causaram dano...). Se lançar essa magia em uma criatura ou área, faça um teste de Misticismo; você dissipa as magias com CD igual ou menor que o resultado do teste. Se lançada contra um item mágico, o transforma em um item mundano por 1d6 rodadas (Vontade anula).`,
    aprimoramentos: [
      {
        addPM: 12,
        text: `muda a área para esfera com 9m de raio. Em vez do normal, cria um efeito de disjunção. Todas as magias na área são automaticamente dissipadas e todos os itens mágicos na área, exceto aqueles que você estiver carregando, viram itens mundanos por uma cena (com direito a um teste de resistência para evitar esse efeito). Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.enxameDePestes]: {
    nome: "Enxame de Pestes",
    execucao: "Completa",
    alcance: "Médio (30m 20q)",
    alvo: "1 enxame médio (quadrado de 1,5m)",
    duracao: "Sustentada",
    resistencia: "Fortitude reduz à metade",
    school: "Conv",
    description:
      `Você conjura um enxame de criaturas a sua escolha, como besouros, gafanhotos, ratos, morcegos ou serpentes. O enxame pode passar pelo espaço de outras criaturas e não impede que outras criaturas entrem no espaço dele. No final de seus turnos, o enxame causa 2d12 pontos de dano de corte a qualquer criatura em seu espaço (Fortitude reduz à metade). Você pode gastar uma ação de movimento para mover o enxame 12m.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +1d12.`
      }, 
      {
        addPM: 3,
        text: `muda a resistência para Reflexos reduz à metade e o enxame para criaturas maiores, como gatos, guaxinins, compsognatos ou kobolds. Ele causa 3d12 pontos de dano (a sua escolha entre corte, impacto ou perfuração). O resto da magia segue normal.`
      }, 
      {
        addPM: 5,
        text: `aumenta o número de enxames em +1. Eles não podem ocupar o mesmo espaço. Requer 3º círculo.`
      }, 
      {
        addPM: 7,
        text: `muda a resistência para Reflexos reduz à metade e o enxame para criaturas elementais. Ele causa 5d12 pontos do dano (a sua escolha entre ácido, eletricidade, fogo ou frio). O resto da magia segue normal. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.esculpirSons]: {
    nome: "Esculpir Sons",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura ou objeto",
    duracao: "Cena",
    resistencia: "Vontade anula",
    school: "Ilusão",
    description:
      `Esta magia altera os sons emitidos pelo alvo. Ela não é capaz de criar sons, mas pode omiti-los (como fazer uma carroça ficar silenciosa) ou transformá-los (como fazer uma pessoa ficar com voz de passarinho). Você não pode criar sons que não conhece (não pode fazer uma criatura falar num idioma que não conheça). Uma vez que escolha a alteração, ela não pode ser mudada. Um conjurador que tenha a voz modificada drasticamente não poderá lançar magias.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1. Todas as criaturas e objetos devem ser afetadas da mesma forma.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.fisicoDivino]: {
    nome: "Físico Divino",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Trans",
    description:
      `Você fortalece o corpo do alvo. Ele recebe +2 em Força, Destreza ou Constituição, a sua escolha. Esse aumento não oferece PV ou PM adicionais.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas.`
      }, 
      {
        addPM: 3,
        text: `em vez do normal, o alvo recebe +2 nos três atributos físicos. Requer 3º círculo.`
      }, 
      {
        addPM: 7,
        text: `em vez do normal, o alvo recebe +4 no atributo escolhido. Requer 4º círculo.`
      }, 
      {
        addPM: 12,
        text: `em vez do normal, o alvo recebe +4 nos três atributos físicos. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.flechaAcida]: {
    nome: "Flecha Ácida",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura ou objeto",
    duracao: "Instantânea",
    resistencia: "Reflexos parcial",
    school: "Evoc",
    description:
      `Você dispara um projétil que causa 4d6 pontos de dano de ácido. Se falhar no teste de resistência, o alvo também fica coberto por um muco corrosivo, sofrendo mais 2d6 de dano de ácido no início de seus dois próximos turnos. Se lançada contra um objeto que não esteja em posse de uma criatura a magia causa dano dobrado e ignora a RD do objeto.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, se o alvo coberto pelo muco ácido estiver usando armadura ou escudo, o item é corroído. Isso reduz o bônus na Defesa do item em 1 ponto permanentemente. O item pode ser consertado, restaurando seu bônus (veja Ofício, na página 121).`
      }, 
      {
        addPM: 2,
        text: `aumenta a redução na Defesa em +1.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano inicial e o dano por rodada em +1d6.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.globoDaVerdadeDeGwen]: {
    nome: "Globo da Verdade de Gwen",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 globo",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Cria um globo flutuante e intangível, com 50cm de diâmetro. O globo mostra uma cena vista até uma semana atrás por você ou por uma criatura que você toque ao lançar a magia (mediante uma pergunta; a criatura pode fazer um teste de Vontade para anular o efeito), permitindo que outras pessoas a vejam.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `o globo mostra uma cena vista até um mês atrás.`
      }, 
      {
        addPM: 2,
        text: `o globo mostra uma cena vista até um ano atrás.`
      }, 
      {
        addPM: 2,
        text: `ao lançar a magia, você pode tocar um cadáver. O globo mostra a última cena vista por essa criatura.`
      }, 
      {
        addPM: 4,
        text: `muda o alcance para longo e o efeito para 10 globos. Todos mostram a mesma cena.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.invisibilidade]: {
    nome: "Invisibilidade",
    execucao: "Livre",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "1 rodada",
    school: "Ilusão",
    description:
      `O alvo fica invisível (incluindo seu equipamento). Um personagem invisível recebe camuflagem total, +10 em testes de Furtividade contra ouvir e criaturas que não possam vê-lo ficam desprevenidas contra seus ataques.<br>A magia termina se o alvo faz uma ação hostil contra uma criatura. Ações contra objetos livres não dissipam a Invisibilidade (você pode tocar ou apanhar objetos que não estejam sendo segurados por outras criaturas). Causar dano indiretamente — por exemplo, acendendo o pavio de um barril de pólvora que vai detonar mais tarde — não é considerado um ataque.<br>Objetos soltos pelo alvo voltam a ser visíveis e objetos apanhados por ele ficam invisíveis. Qualquer parte de um item carregado que se estenda além de seu alcance corpo a corpo natural se torna visível. Uma luz nunca fica invisível (mesmo que sua fonte seja). `,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a execução para ação padrão, o alcance para toque e o alvo para 1 criatura ou um objeto Grande ou menor.`
      }, 
      {
        addPM: 3,
        text: `muda a duração para cena. Requer 3º círculo.`
      }, 
      {
        addPM: 3,
        text: `muda a duração para sustentada. Em vez do normal, o alvo gera uma esfera de invisibilidade. Não pode ser usado em conjunto com outros aprimoramentos. O alvo e todas as criaturas a até 3m dele se tornam invisíveis, como no efeito normal da magia (ainda ficam visíveis caso façam uma ação hostil). A esfera se move juntamente com o alvo; qualquer coisa que saia da esfera fica visível. Requer 3º círculo.`
      }, 
      {
        addPM: 7,
        text: `muda a execução para ação padrão, o alcance para toque e o alvo para 1 criatura. A magia não é dissipada caso o alvo faça um ação hostil. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.ligacaoTelepatica]: {
    nome: "Ligação Telepática",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "2 criaturas voluntárias",
    duracao: "1 dia",
    school: "Adiv",
    description:
      `Você cria um elo mental entre duas criaturas com Inteligência -3 ou maior (você pode ser uma delas). As criaturas podem se comunicar independente de idioma ou distância, mas não em mundos diferentes.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 3,
        text: `muda o alvo para 1 criatura. Em vez do normal, você cria um elo mental que permite que você veja e ouça pelos sentidos da criatura, se gastar uma ação de movimento. Uma criatura involuntária pode fazer um teste de Vontade para suprimir a magia por uma hora. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.localizacao]: {
    nome: "Localização",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Esfera de 90m de raio",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Esta magia pode encontrar uma criatura ou objeto a sua escolha. Você pode pensar em termos gerais (“um elfo”, “algo de metal”) ou específicos (“Gwen, a elfa”, “uma espada longa”). A magia indica a direção e distância da criatura ou objeto mais próximo desse tipo, caso esteja ao alcance. Você pode movimentar-se para continuar procurando. Procurar algo muito específico (“a espada longa encantada do Barão Rulyn”) exige que você tenha em mente uma imagem precisa do objeto; caso a imagem não seja muito próxima da verdade, a magia falha, mas você gasta os PM mesmo assim. Esta magia pode ser bloqueada por uma fina camada de chumbo.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda a área para alvo você. Em vez do normal, você sabe onde fica o norte e recebe +5 em testes de Sobrevivência para se orientar.`
      }, 
      {
        addPM: 5,
        text: `aumenta a área em um fator de 10 (90m para 900m, 900m para 9km e assim por diante).`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.mapear]: {
    nome: "Mapear",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "Superfície ou objeto plano como uma mesa ou pergaminho",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Uma fagulha percorre a superfície afetada, queimando-a enquanto esboça um mapa da região onde o conjurador está. Se você conhece o lugar, o mapa será completo. Caso contrário, apresentará apenas um esboço geral, além de um ponto de referência (para possibilitar localização) e um lugar de interesse, ambos definidos pelo mestre. A região representada no mapa tem tamanho máximo de um quadrado de 10km de lado. Caso você esteja dentro de uma construção, o mapa mostrará o andar no qual você se encontra.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `muda o alvo para 1 criatura e a duração para 1 hora. Em vez do normal, a criatura tocada descobre o caminho mais direto para entrar ou sair de um lugar. Assim, a magia pode ser usada para descobrir a rota até o relicário de uma catedral ou a saída mais próxima de uma masmorra (mas não para encontrar a localização de uma criatura ou objeto; a magia funciona apenas em relação a lugares). Caso a criatura demore mais de uma hora para percorrer o caminho, o conhecimento se perde.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.marcaDaObediencia]: {
    nome: "Marca da Obediência",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `Você toca uma criatura, gravando uma marca mística no corpo dela enquanto profere uma ordem, como “não ataque a mim ou meus aliados”, “siga-me” ou “não saia desta sala”. A criatura deve seguir essa ordem, gastando todas as ações de seu turno para isso. A ordem não pode ser genérica demais (como “ajude-me”, por exemplo), nem forçar o alvo a atos suicidas. A cada rodada, o alvo pode fazer um teste de Vontade. Se passar, a magia é dissipada.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `muda a duração para 1 dia. Se não estiver em combate, a criatura só pode fazer o teste de Vontade a cada hora. Requer 3º círculo.`
      }, 
      {
        addPM: 3,
        text: `sempre que o alvo fizer o teste de Vontade e falhar, a marca causa 3d6 pontos de dano psíquico. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.menteDivina]: {
    nome: "Mente Divina",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Você fortalece a mente do alvo. Ele recebe +2 em Inteligência, Sabedoria ou Carisma, a sua escolha. Esse aumento não oferece PV, PM ou perícias adicionais.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `em vez do normal, o alvo recebe +2 nos três atributos mentais. Requer 3º círculo.`
      }, 
      {
        addPM: 3,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas.`
      }, 
      {
        addPM: 7,
        text: `em vez do normal, o alvo recebe +4 no atributo escolhido. Requer 4º círculo.`
      }, 
      {
        addPM: 12,
        text: `em vez do normal, o alvo recebe +4 nos três atributos mentais. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.metamorfose]: {
    nome: "Metamorfose",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Trans",
    description:
      `Você muda sua aparência e forma — incluindo seu equipamento — para qualquer outra criatura, existente ou imaginada. Independentemente da forma escolhida, você recebe +20 em testes de Enganação para disfarce. Características não mencionadas não mudam.<br>Se mudar para uma forma humanoide, pode mudar o tipo de dano (entre corte, impacto e perfuração) de suas armas (se usa uma maça e transformá- la em espada longa, ela pode causar dano de corte, por exemplo). Se quiser, pode assumir uma forma humanoide com uma categoria de tamanho acima ou abaixo da sua; nesse caso aplique os modificadores em Furtividade e testes de manobra.<br>Se mudar para outras formas, você pode escolher uma Forma Selvagem do druida (veja no Capítulo 1). Nesse caso você não pode atacar com suas armas, falar ou lançar magias até voltar ao normal, mas recebe uma ou mais armas naturais e os bônus da forma selvagem escolhida.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `a forma escolhida recebe uma habilidade de sentidos entre faro, visão na penumbra e visão no escuro.`
      }, 
      {
        addPM: 3,
        text: `a forma escolhida recebe percepção às cegas. Requer 3º círculo.`
      }, 
      {
        addPM: 3,
        text: `muda o alcance para toque, o alvo para 1 criatura e adiciona resistência (Vontade anula).`
      }, 
      {
        addPM: 3,
        text: `muda o alcance para médio, o alvo para 1 criatura e a resistência para Vontade anula. Em vez do normal, transforma o alvo em uma criatura ou objeto inofensivo (ovelha, sapo, galinha, pudim de ameixa etc.). A criatura não pode atacar, falar e lançar magias; seu deslocamento vira 3m e sua Defesa vira 10. Suas outras características não mudam. No início de seus turnos, o alvo pode fazer um teste de Vontade; se passar, retorna à sua forma normal e a magia termina. Requer 3º círculo.`
      }, 
      {
        addPM: 5,
        text: `se mudar para formas não humanoides, pode escolher uma Forma Selvagem Aprimorada. Requer 3º círculo.`
      }, 
      {
        addPM: 9,
        text: `se mudar para formas não humanoides, pode escolher uma Forma Selvagem Superior. Requer 4º círculo.`
      }, 
      {
        addPM: 12,
        text: `além do normal, no início de seus turnos o alvo pode mudar de forma novamente, como uma ação livre, fazendo novas escolhas. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.miasmaMefitico]: {
    nome: "Miasma Mefítico",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Nuvem com 6m de raio",
    duracao: "Instantânea",
    resistencia: "Fortitude (veja texto)",
    school: "Necro",
    description:
      `A área é coberta por emanações letais. Criaturas na área sofrem 5d6 pontos de dano de ácido e ficam Enjoado por 1 rodada. Se passarem na resistência, sofrem metade do dano e não ficam enjoadas.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda o alcance para toque, a área para alvo (1 criatura com 0 PV ou menos), a duração para instantânea e a resistência para Fortitude anula. e adiciona componente material (pó de ônix no valor de T$ 10). Em vez do normal, você canaliza o Miasma contra uma vítima. Se falhar na resistência, ela morre e você recebe +2 na CD de suas magias por 1 dia. Se passar, fica imune a este truque por um dia.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +1d6.`
      }, 
      {
        addPM: 3,
        text: `muda o tipo do dano para trevas.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.montariaArcana]: {
    nome: "Montaria Arcana",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Criatura conjurada",
    duracao: "1 dia",
    school: "Conv",
    description:
      `Esta magia convoca um parceiro cavalo (ou pônei) de guerra veterano. Sua aparência é de um animal negro com crina e cauda cinzentas e cascos feitos de fumaça, mas você pode mudá-la se quiser. Além dos benefícios normais, a Montaria Arcana pode atravessar terreno difícil sem redução em seu deslocamento. Você pode usar Misticismo no lugar de Cavalgar para efeitos desta montaria (incluindo ser considerado treinado).`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, criaturas do tipo animal em alcance curto da montaria devem fazer um teste de Vontade. Se passarem, ficam abaladas pela cena; se falharem, ficam apavoradas por 1d4 rodadas, depois abaladas pela cena.`
      }, 
      {
        addPM: 3,
        text: `muda a duração para permanente e adiciona penalidade de -3 PM.`
      }, 
      {
        addPM: 3,
        text: `aumenta o tamanho da montaria em uma categoria. Isso também aumenta o número de criaturas que ela pode carregar — duas para uma criatura Enorme, seis para Colossal. Uma única criatura controla a montaria; as outras apenas são deslocadas.`
      }, 
      {
        addPM: 3,
        text: `muda o nível do aliado para mestre. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.oracao]: {
    nome: "Oração",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Todas as criaturas (veja texto)",
    duracao: "Sustentada",
    school: "Encan",
    description:
      `Você e todos os seus aliados no alcance recebem +2 em testes de perícia e rolagens de dano, e todos os seus inimigos no alcance sofrem –2 em testes de perícia e rolagens de dano. Esse efeito é cumulativo com outras magias.<br><i>Componente material:</i> T$ 25 por PM gastos em incensos ou outras oferendas.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta os bônus em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).`
      }, 
      {
        addPM: 2,
        text: `aumenta as penalidades em –1, limitado pelo círculo máximo de magia que você pode lançar.`
      }, 
      {
        addPM: 7,
        text: `muda o alcance para médio. Requer 3º círculo.`
      }, 
      {
        addPM: 12,
        text: `muda a duração para cena. Requer 4º círculo`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.purificacao]: {
    nome: "Purificação",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Instantânea",
    school: "Evoc",
    description:
      `Você purifica a criatura tocada, removendo uma condição dela entre abalado, Apavorado, Alquebrado, Atordoado, Cego, Confuso, Debilitado}, Surdo.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `também cura todos os PV perdidos por veneno.`
      }, 
      {
        addPM: 2,
        text: `em vez de uma, remove todas as condições listadas.`
      }, 
      {
        addPM: 3,
        text: `também permite que o alvo solte qualquer item amaldiçoado que esteja segurando (mas não remove a maldição do item em si).`
      }, 
      {
        addPM: 7,
        text: `também dissipa magias e efeitos prejudiciais de Encan, Necro e Trans afetando o alvo. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.raioSolar]: {
    nome: "Raio Solar",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Linha",
    duracao: "Instantânea",
    resistencia: "Reflexos (veja texto)",
    school: "Evoc",
    description:
      `Você canaliza uma poderosa rajada de energia positiva que ilumina o campo de batalha. Criaturas na área sofrem 4d8 pontos de dano de luz (ou 4d12, se forem mortos-vivos) e ficam Ofuscado por uma rodada. Se passarem na resistência, sofrem metade do dano e não ficam ofuscadas.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda a duração para cena e a resistência para nenhuma. Em vez do normal, cria um facho de luz que ilumina a área da magia. Uma vez por rodada, você pode mudar a direção do facho como uma ação livre.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano ou cura em +1d8 (ou +1d12 em mortos-vivos).`
      }, 
      {
        addPM: 3,
        text: `em vez do normal, criaturas vivas a sua escolha na área curam 4d8 pontos de vida; o restante sofre o dano normalmente.`
      }, 
      {
        addPM: 3,
        text: `criaturas que falhem na resistência ficam cegas por 1d4 rodadas.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.refugio]: {
    nome: "Refúgio",
    execucao: "Completa",
    alcance: "Curto (9m 6q)",
    alvo: "Domo com 6m de raio",
    duracao: "1 dia",
    school: "Abjur",
    description:
      `Esta magia cria um domo imóvel e quase opaco por fora, mas transparente pelo lado de dentro. Ele protege contra calor, frio e forças pequenas, mas não contra qualquer coisa capaz de causar dano. Assim, o domo protege contra neve e vento comuns, mas não contra uma flecha ou Bola de Fogo. Porém, como o domo é quase opaco, qualquer criatura dentro dele tem camuflagem total contra ataques vindos de fora. Criaturas podem entrar e sair do domo livremente. Descansar dentro do Refúgio concede recuperação normal de PV e PM.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, os limites do domo são envoltos por uma fumaça escura e espessa, que impede criaturas do lado de fora de enxergar ou ouvir o que está dentro. Criaturas do lado de dentro enxergam e ouvem normalmente o que está do lado de fora. A fumaça também bloqueia magias de Adiv.`
      }, 
      {
        addPM: 3,
        text: `em vez do normal, cria uma cabana que comporta até 10 criaturas Médias. Descansar nesse espaço concede recuperação confortável (recupera PV e PM igual ao dobro do nível). Para todos os efeitos é uma cabana normal, com paredes de madeira, telhado, uma porta, duas janelas e alguma mobília (camas, uma mesa com bancos e uma lareira). A porta e as janelas têm 15 PV, RD 5 e são protegidas por um efeito idêntico à magia Tranca Arcana. As paredes têm 200 PV e RD 5.`
      }, 
      {
        addPM: 3,
        text: `em vez do normal, cria um espaço extradimensional, similar a uma caverna vazia e escura, que comporta até 10 criaturas Médias. A entrada para o espaço precisa estar desenhada em um objeto fixo como uma grande pedra ou árvore. Qualquer criatura que atravesse a entrada consegue entrar no espaço. Nenhum efeito a partir do mundo real afeta o espaço e vice-versa, mas aqueles que estiverem dentro podem observar o mundo real como se uma janela de 1m estivesse centrada na entrada. Qualquer coisa que esteja no espaço extradimensional surge no mundo real na área vazia mais próxima da entrada quando a duração da magia acaba. Requer 3º círculo.`
      }, 
      {
        addPM: 9,
        text: `em vez do normal, cria uma mansão extradimensional que comporta até 100 criaturas Médias, com quartos luxuosos, comida e bebida e dez servos fantasmagóricos (como na magia Servos Invisíveis). Descansar na mansão concede recuperação luxuosa (recupera PV e PM igual ao triplo do nível). A mansão tem uma única entrada, uma porta feita de luz. Você pode deixá-la visível ou invisível como uma ação livre e apenas criaturas escolhidas por você podem passar. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.relampago]: {
    nome: "Relâmpago",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Linha",
    duracao: "Instantânea",
    resistencia: "Reflexos reduz à metade",
    school: "Evoc",
    description:
      `Você dispara um poderoso raio que causa 6d6 pontos de dano de eletricidade em todas as criaturas e objetos livres na área.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +2d6.`
      }, 
      {
        addPM: 3,
        text: `muda a área para alvo (criaturas escolhidas). Em vez do normal, você dispara vários relâmpagos, um para cada alvo escolhido, causando 6d6 pontos de dano de eletricidade. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.rogarMaldicao]: {
    nome: "Rogar Maldição",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Sustentada",
    resistencia: "Fortitude anula",
    school: "Necro",
    description:
      `Você entoa cânticos maléficos que amaldiçoam uma vítima, criando efeitos variados. Ao lançar a magia, escolha entre os seguintes.<br><i>Debilidade:</i> o alvo fica Esmorecido e não pode se comunicar ou lançar magias. Ainda reconhece seus aliados e pode segui-los e ajudá-los, mas sempre de maneira simplória.<br><i>Doença:</i> muda a duração para instantânea. O alvo contrai uma doença a sua escolha, que o afeta imediatamente (sem período de incubação).<br><i>Fraqueza:</i> o alvo fica Debilitadoe Lento.<br><i>Isolamento:</i> o alvo perde o uso de um de seus cinco sentidos a sua escolha. Se perder a visão, fica Cego. Se perder a audição, fica Caído e não pode se levantar.<br>Você também pode inventar sua própria maldição, usando esses exemplos como sugestões, mas o mestre tem a palavra final sobre o efeito.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o número de efeitos que você pode escolher em +1. Requer 3º círculo.`
      }, 
      {
        addPM: 7,
        text: `muda a duração para permanente e resistência para Fortitude parcial. Se passar, a criatura ainda sofre os efeitos da maldição, mas por 1 rodada. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.runaDeProtecao]: {
    nome: "Runa de Proteção",
    execucao: "1 hora",
    alcance: "Toque",
    alvo: "Uma área com 6m de raio",
    duracao: "Permanente até ser descarregada",
    resistencia: "Veja texto",
    school: "Abjur",
    description:
      `Você escreve uma runa pessoal em uma superfície fixa, como uma parede ou o chão, que protege uma pequena área ao redor. Quando uma criatura entra na área afetada a runa explode, causando 6d6 pontos de dano em todos os alvos a até 6m. A criatura que ativa a runa não tem direito a teste de resistência; outras criaturas na área têm direito a um teste de Reflexos para reduzir o dano à metade. Quando lança a magia, você escolhe o tipo de dano, entre ácido, eletricidade, fogo, frio, luz ou trevas.<br>Você pode determinar que a runa se ative apenas em condições específicas — por exemplo, apenas por goblins ou apenas por mortos-vivos. Você também pode criar uma palavra mágica que impeça a runa de se ativar.<br>Um personagem pode encontrar a runa com um teste de Investigação e desarmá-la com um teste de Ladinagem (CD da magia).<br><i>Componente material:</i> pó de diamante no valor de T$ 200, com o qual o conjurador desenha a runa, que brilha por alguns instantes e depois se torna praticamente invisível.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em +2d6.`
      }, 
      {
        addPM: 1,
        text: `muda o alvo para “você” e o alcance para “pessoal”. Ao invés do normal, escolha uma magia de 1º círculo que você conhece e pode lançar, com tempo de execução de uma ação padrão ou menor. Você escreve a runa em seu corpo e especifica uma condição de ativação como, por exemplo, “quando eu for alvo de um ataque” ou “quando for alvo de uma magia”. Quando a condição for cumprida, você pode ativar a runa e lançar a magia escolhida como uma reação. Você só pode escrever uma runa em seu corpo ao mesmo tempo.`
      }, 
      {
        addPM: 3,
        text: `como o aprimoramento anterior, mas você pode escolher magias de 2º  círculo. Requer 3º<br>círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.saltoDimensional]: {
    nome: "Salto Dimensional",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Você",
    duracao: "Instantânea",
    school: "Conv",
    description:
      `Esta magia transporta você para outro lugar dentro do alcance. Você não precisa perceber nem ter linha de efeito ao seu destino, podendo simplesmente imaginá-lo. Por exemplo, pode se transportar 3m adiante para ultrapassar uma porta fechada. Uma vez transportadas, criaturas não podem agir até a rodada seguinte. Esta magia não permite que você apareça dentro de um corpo sólido; se o ponto de chegada não tem espaço livre, você ressurge na área vazia mais próxima.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para médio.`
      }, 
      {
        addPM: 1,
        text: `muda o alvo para você e uma criatura voluntária. Você pode escolher este aprimoramento mais vezes para aumentar o número de alvos adicionais em +1, mas deve estar tocando todos os alvos.`
      }, 
      {
        addPM: 2,
        text: `muda a execução para reação. Em vez do normal, você recebe +5 na Defesa e em testes de Reflexos contra um ataque ou efeito que esteja prestes a atingi-lo. Após a resolução do efeito, salta para um espaço adjacente (1,5m).`
      }, 
      {
        addPM: 3,
        text: `muda o alcance para longo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.servosInvisiveis]: {
    nome: "Servos Invisíveis",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    alvo: "Criaturas conjuradas",
    duracao: "Cena",
    school: "Conv",
    description:
      `Você cria até três servos invisíveis e silenciosos, capazes de realizar tarefas simples como apanhar lenha, colher frutos, varrer o chão ou alimentar um cavalo. Os servos podem ser usados para manter arrumada e organizada uma mansão ou pequena torre ou para preparar um acampamento nos ermos para você e seus aliados (veja a perícia Sobrevivência, na página 123).<br>Eles também podem ajudá-lo em tarefas mais complexas, como fazer uma pesquisa ou preparar uma poção, mas isso consome sua energia mágica. Você pode “gastar” um servo para receber um bônus não cumulativo de +2 em um teste de perícia (exceto testes de ataque e resistência). Os servos não são criaturas reais; não podem lutar, nem resistir a qualquer dano ou efeito que exija um teste de resistência ou teste oposto — falharão automaticamente no teste e serão destruídos.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de servos conjurados em 1.`
      }, 
      {
        addPM: 3,
        text: `você pode comandar os servos para realizar uma única tarefa no seu lugar. Em termos de jogo, eles passam automaticamente em um teste de perícia com CD máxima igual ao seu nível, +2 para cada servo conjurado. O tempo necessário para realizar a tarefa é o tempo do uso da perícia em questão. Requer 3º círculo`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.silencio]: {
    nome: "Silêncio",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Esfera de 6m de raio",
    duracao: "Sustentada",
    school: "Ilusão",
    description:
      `Um silêncio sepulcral recai sobre a área e nenhum som é produzido nela. Enquanto estiverem na área, todas as criaturas ficam Surdo. Além disso, como lançar magias exige palavras mágicas, normalmente nenhuma magia pode ser lançada dentro da área.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a área para alvo de 1 objeto. Em vez do normal, o alvo emana uma área de silêncio com 3m de raio. Se lançar a magia num objeto de uma criatura involuntária, ela tem direito a um teste de Vontade para anulá-la.`
      }, 
      {
        addPM: 2,
        text: `muda a duração para cena. Em vez do normal, nenhum som pode deixar a área, mas criaturas dentro da área podem falar, ouvir e lançar magias com palavras mágicas normalmente.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.socoDeArsenal]: {
    nome: "Soco de Arsenal",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Conv",
    description:
      `Ninguém sabe se Mestre Arsenal foi realmente o criador desta magia — mas ele foi o primeiro a utilizá-la. Você fecha o punho e gesticula como se estivesse golpeando o alvo, causando dano de impacto igual a 4d6 + sua Força. A vítima é empurrada 3m na direção oposta à sua. Passar no teste de resistência reduz o dano à metade e evita o empurrão.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para pessoal, o alvo para você, a duração para cena e a resistência para nenhuma. Em vez do normal, seus ataques corpo a corpo passam a acertar inimigos distantes. Seu alcance natural aumenta em 3m; uma criatura Média pode atacar adversários a até 4,5m, por exemplo.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +1d6.`
      }, 
      {
        addPM: 4,
        text: `aumenta o empurrão em +3m.`
      }, 
      {
        addPM: 5,
        text: `muda o tipo do dano para essência.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.soproDasUivantes]: {
    nome: "Sopro das Uivantes",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Cone de 9m",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Evoc",
    description:
      `Você sopra ar gélido que causa 4d6 pontos de dano de frio (Fortitude reduz à metade). Criaturas de tamanho Médio ou menor que falhem na resistência ficam caídas e são empurradas 6m na direção oposta. Se houver uma parede ou outro objeto sólido (mas não uma criatura) no caminho, a criatura para de se mover, mas sofre +2d6 pontos de dano de impacto.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano de frio em +2d6.`
      }, 
      {
        addPM: 3,
        text: `aumenta o tamanho máximo das criaturas afetadas em uma categoria. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.sussurrosInsanos]: {
    nome: "Sussurros Insanos",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 humanoide",
    duracao: "Cena",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `Você murmura palavras desconexas que afetam a mente do alvo. O alvo fica Confuso.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 3,
        text: `muda o alvo para 1 criatura.`
      }, 
      {
        addPM: 12,
        text: `muda o alvo para criaturas escolhidas. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.tempestadeDivina]: {
    nome: "Tempestade Divina",
    execucao: "Completa",
    alcance: "Longo (90m 60q)",
    area: "Cilindro com 15m de raio e 15m de altura",
    duracao: "Sustentada",
    school: "Evoc",
    description:
      `Esta magia só pode ser usada em ambientes abertos. A área fica sujeita a um vendaval — ataques à distância sofrem penalidade de –5, chamas são apagadas e névoas são dissipadas. Você também pode gerar chuva (–5 em testes de Percepção), neve (como chuva, e a área se torna terreno difícil) ou granizo (como chuva, mais 1 ponto de dano de impacto por rodada, no início de seus turnos).`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, uma vez por rodada você pode gastar uma ação padrão para fazer um raio cair sobre um alvo na área, causando 3d8 pontos de dano de eletricidade (Reflexos reduz à metade).`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano de raios (veja acima) em +1d8.`
      }, 
      {
        addPM: 3,
        text: `se escolheu causar chuva, ela se torna mais grossa, revelando a silhueta de criaturas invisíveis na área. Criaturas Médias ou menores ficam lentas e criaturas voadoras precisam passar num teste de Atletismo (CD da magia) por rodada ou caem ao solo (mas podem fazer testes de Acrobacia para reduzir o dano de queda, como o normal).`
      }, 
      {
        addPM: 3,
        text: `se escolheu causar granizo, muda o dano para 2d6 por rodada.`
      }, 
      {
        addPM: 3,
        text: `se escolheu causar neve, criaturas na área sofrem 2d6 pontos de dano de frio no início de seus turnos.`
      }, 
      {
        addPM: 3,
        text: `muda a área para cilindro com 90m de raio e 90m de altura.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.toqueVampirico]: {
    nome: "Toque Vampírico",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude reduz à metade",
    school: "Necro",
    description:
      `Sua mão brilha com energia sombria, causando 6d6 pontos de dano de trevas. Você recupera pontos de vida iguais à metade do dano causado (se causou algum dano).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda a resistência para nenhum. Como parte da execução da magia, você pode fazer um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e da magia, e recupera pontos de vida iguais à metade do dano da magia.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +2d6.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para pessoal, o alvo para você e a duração para cena. Em vez do normal, a cada rodada você pode gastar uma ação padrão para tocar 1 criatura e causar 3d6 pontos de dano. Você recupera pontos de vida iguais à metade do dano causado. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.velocidade]: {
    nome: "Velocidade",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Sustentada",
    school: "Trans",
    description:
      `O alvo pode realizar uma ação padrão ou de movimento adicional por turno. Esta ação não pode ser usada para lançar magias e ativar engenhocas.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda a duração para cena. A ação adicional que você pode fazer é apenas de movimento. Uma criatura só pode receber uma ação adicional por turno como efeito de Velocidade.`
      }, 
      {
        addPM: 7,
        text: `muda o alvo para criaturas escolhidas no alcance. Requer 4º círculo.`
      }, 
      {
        addPM: 7,
        text: `muda o alcance para pessoal e o alvo para você. Você acelera sua mente, além de seu corpo. A ação adicional pode ser usada para lançar magias e ativar engenhocas. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.vestimentaDaFe]: {
    nome: "Vestimenta da Fé",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 armadura escudo ou vestimenta",
    duracao: "1 dia",
    school: "Abjur",
    description:
      `Você fortalece um item, aumentando o bônus de Defesa de uma armadura ou escudo em +2. No caso de um vestuário, ele passa a oferecer +2 na Defesa (não cumulativo com armadura). Os efeitos desta magia contam como um bônus de encanto.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `o objeto oferece o mesmo bônus em testes de resistência. Requer 3º círculo.`
      }, 
      {
        addPM: 4,
        text: `aumenta o bônus em +1.`
      }, 
      {
        addPM: 7,
        text: `o objeto também oferece resistência a dano 5. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.vozDivina]: {
    nome: "Voz Divina",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Você pode conversar com criaturas de qualquer raça e tipo: animal, construto, espírito, humanoide, monstro ou morto-vivo. Pode fazer perguntas e entende suas respostas, mesmo sem um idioma em comum ou se a criatura não for capaz de falar, mas respeitando os limites da Inteligência dela. A atitude dessas criaturas não é alterada, mas você pode usar a perícia Diplomacia para tentar mudar sua atitude.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `você concede um pouco de vida a um cadáver, suficiente para que ele responda a suas perguntas. O conhecimento do corpo é limitado ao que ele tinha enquanto vivo e suas respostas são curtas e enigmáticas. Um corpo só pode ser alvo desta magia uma vez. Ela também não funciona em um corpo cuja cabeça tenha sido destruída.`
      }, 
      {
        addPM: 1,
        text: `você pode falar com plantas (normais ou monstruosas) e rochas. Plantas e rochas têm percepção limitada de seus arredores e normalmente fornecem respostas simplórias.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle2Names.invocarFagulhaElemental]: {
    nome: "Invocar Fagulha Elemental",
    execucao: "Completa",
    alcance: "Curto (9m 6q)",
    alvo: "Familiar elemental",
    duracao: "Sustentada",
    school: "Conv",
    description:
      `Você transforma uma porção de um elemento inerte em uma criatura elemental Pequena do tipo do elemento alvo. Por exemplo, lançar esta magia em um copo de água cria um elemental da água. Você pode criar elementais do ar, água, fogo e terra com essa magia. O elemental obedece a todos os seus comandos e funciona como um familiar comum (veja Familiares, em Tormenta20, p. 38) ou elemental (veja Elementais). O elemental auxilia apenas você e não conta em seu limite de parceiros.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, o elemental fornece redução 10 contra o dano correspondente ao seu tipo.`
      }, 
      {
        addPM: 2,
        text: `em vez do normal, o elemental recebe a habilidade de dois familiares, um comum e um elemental.`
      }, 
    ],
    publicacao: `Ameaças de Arton 1.0`,
  },
  [spellsCircle2Names.momentoDeTormenta]: {
    nome: "Momento de Tormenta",
    execucao: "Completa",
    alcance: "Pessoal",
    area: "Cubo de 30m de lado",
    duracao: "Sustentada",
    resistencia: "Veja texto",
    school: "Conv",
    description:
      `Uma nuvem rubra surge acima do conjurador. Uma vez por turno, você pode gastar uma ação de movimento para fazer a nuvem manifestar um dos fenômenos a seguir.<br><i>Chuva ácida:</i> gotas corrosivas causam 6d4 pontos de dano de ácido em todas as criaturas na área.<br><i>Neblina venenosa:</i> uma neblina faz com que todas as criaturas na área percam 2d12 PV por veneno (Fortitude evita).<br><i>Raios escarlates:</i> Até 6 inimigos aleatórios na área sofrem 6d8 pontos de dano de eletricidade (Reflexos reduz à metade).<br><i>Pesadelos reais:</i> Cada criatura na área sofre 4d6 pontos de dano psíquico e perde 1d4 PM (Vontade reduz o dano à metade e evita a perda de PM).<br>Esta magia só pode ser aprendida e lançada por conjuradores que tenham observado uma área de Tormenta pelo menos uma vez. Sua divulgação é proibida e seu uso é permitido apenas em áreas controladas na Academia Arcana e outros lugares restritos, para estudar o fenômeno da Tormenta. Usar esta magia em qualquer outro ponto do Reinado é crime punido com a morte!`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o dano em +1 dado do mesmo tipo.`
      }, 
      {
        addPM: 5,
        text: `além do normal, criaturas na área ficam alquebradas enquanto permanecerem na área.`
      }, 
      {
        addPM: 5,
        text: `muda a área para círculo de 1km de raio. <i>Requisito:</i> devotos de Aharadak.`
      }, 
    ],
    publicacao: `Ameaças de Arton 1.0`,
  },
  [spellsCircle2Names.preparacaoDeBatalha]: {
    nome: "Preparação de Batalha",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "Dois itens, entre arma e armadura",
    duracao: "Permanente",
    school: "Conv",
    description:
      `Essa magia é muito utilizada por clérigos e bardos que não precisam (ou não podem) estar o tempo todo trajando suas armaduras e carregando armas. A magia é lançada sobre uma armadura e uma arma, que se tornam vinculadas à você. A partir daí, em qualquer momento, você pode usar uma ação completa para convocar a armadura e a arma, que aparecem magicamente sobre seu corpo e em suas mãos, cobrindo qualquer roupa que esteja vestindo no momento. O efeito é bastante espalhafatoso, sendo praticamente impossível utilizá-lo sem chamar atenção. A magia funciona independente da distância ou situação do equipamento invocado, contanto que ele esteja no mesmo plano.<br><i>Custo Adicional:</i> sacrifício de 1 PM.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o número de alvos em dois e o custo adicional em 1 PM`
      }, 
    ],
    publicacao: `Guia de NPCs`,
  },
  [spellsCircle2Names.controlarAr]: {
    nome: "Controlar Ar",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Varia",
    duracao: "Cena",
    resistencia: "Veja texto",
    school: "Trans",
    description:
      `Você pode controlar os movimentos e comportamentos de massas de ar. Ao lançar a magia, escolha um dos efeitos abaixo.<br><i>Ascender:</i> cria uma corrente de ar ascendente capaz de erguer do chão uma criatura ou objeto médio, fazendo o alvo ﬂutuar para cima e para baixo conforme sua vontade. Você pode gastar uma ação de movimento para subir ou descer o alvo até 6m por rodada, até um máximo de 30m de altura. Você não pode mover o alvo horizontalmente — mas o alvo pode, por exemplo, escalar uma colina ou se apoiar no teto para mover-se lateralmente (com metade de seu deslocamento normal). Uma criatura levitando fica vulnerável e sofre –2 nas jogadas de ataque. Alvos involuntários tem direito a um teste de Fortitude no início de seu turno para negar o efeito. Derrubar um alvo flutuando (simplesmente parando a corrente de ar) causa o dano normal de queda, mas um alvo que passe no teste pode “nadar” para o chão contra a corrente. Você pode usar essa opção para fazer uma manobra derrubar contra uma criatura voadora dentro do alcance, usando seu atributo-chave no lugar de Força.<br><i>Sopro:</i> cria uma lufada de vento a partir de suas mãos, que empurra qualquer criatura Média ou menor em um cone de 4,5m — faça uma manobra empurrar usando seu atributo-chave ao invés de força, usando o mesmo resultado de sua rolagem para todos os alvos. A lufada de vento também faz qualquer coisa que um vento forte e súbito faria, como levantar pó, dispersar vapores, apagar chamas, espalhar papéis ou mover uma embarcação. Manter o sopro ativo exige uma ação padrão.<br><i>Vento:</i> cria uma área de vento forte (Tormenta20 página 253) dentro do alcance da magia. Se lançada numa área que já esteja com algum efeito de vento, aumenta esse efeito em um passo. Manter o vento ativo requer uma ação de movimento. Você também pode usar essa opção para reduzir os efeitos de vento em uma área.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o limite de tamanho de criaturas e objetos afetados em um passo.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle2Names.couracaDeAllihanna]: {
    nome: "Couraça de Allihanna",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 armadura ou vestuário",
    duracao: "Cena",
    school: "Abjur",
    description:
      `Lisandra de Galrasia foi a primeira a manifestar uma armadura fibrosa, mas hoje outros podem fazer o mesmo. Esta magia transforma o alvo em uma couraça arbórea. Se for uma armadura, seu bônus na Defesa aumenta em +2 e se for um vestuário, ele passa a fornecer +2 na Defesa (não cumulativo com armadura). Os efeitos dessa magia contam como um bônus de encanto e ela só pode ser lançada em terrenos naturais. Dahllan recebem 1 PM para usar em aprimoramentos ao lançá-la.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta a Defesa em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).`
      }, 
      {
        addPM: 2,
        text: `além do normal, suas magias de Evoc e Trans custam –1 PM.`
      }, 
      {
        addPM: 2,
        text: `o alvo é recoberto por folhas e galhos. Você recebe +5 em testes de furtividade e pode se esconder mesmo sem camuflagem ou cobertura disponível.`
      }, 
      {
        addPM: 2,
        text: `além do normal, o alvo fornece o mesmo bônus em testes de resistência. Requer 3° círculo.`
      }, 
      {
        addPM: 3,
        text: `além do normal, o alvo é recoberto esporos de cogumelo. Quando uma criatura faz um ataque corpo a corpo contra você, ela deve fazer um teste de Fortitude (CD da magia). Se falhar, fica paralisada por 1 rodada (apenas uma vez por cena) e lenta. Se passar, fica lenta por 1 rodada. Requer 3° círculo.`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle2Names.punicaoDoProfano]: {
    nome: "Punição do Profano",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 humanoide",
    duracao: "Instantânea",
    resistencia: "Vontade reduz à metade",
    school: "Evoc",
    description:
      `Por meio de um brado poderoso, entoando um dogma de sua religião, você inflige dano a devotos de divindades adversárias.<br>Esta magia causa 6d8 pontos de dano de impacto a devotos de deuses que canalizam energia oposta a seu deus. Assim, se sua divindade canaliza energia positiva, a magia afeta devotos de deuses que canalizem energia negativa, e vice-versa. Devotos de deuses que canalizam qualquer energia ou criaturas que não sejam devotas sofrem apenas metade do dano.<br>A magia afeta celestiais e abissais como se fossem devotos, respectivamente, de deuses de energia positiva e negativa, enquanto suraggel são afetados conforme sua herança. Nesses casos, a natureza planar se sobrepõe à devoção (um aggelus devoto de Tenebra ainda é considerado de energia positiva).`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alvo para 1 espírito ou morto-vivo.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +2d8.`
      }, 
      {
        addPM: 3,
        text: `muda o alvo para 1 criatura.`
      }, 
      {
        addPM: 5,
        text: `afeta todos os alvos dentro do alcance. Requer 3° círculo.`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle2Names.traicaoDaLamina]: {
    nome: "Traição da Lâmina",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 arma em posse de uma criatura",
    duracao: "Cena até ser descarregada",
    resistencia: "Vontade (veja texto)",
    school: "Abjur",
    description:
      `Provavelmente ofertada por Sszzaas (ou assim querem que você acredite), esta magia amaldiçoa uma arma contra seu usuário. Quando faz um ataque com a arma, o usuário deve passar em um teste de Vontade. Se falhar, a arma se retorce como uma serpente, ou muda sua trajetória em pleno voo; o agressor se torna o alvo do próprio ataque! Após este ataque, bem-sucedido ou não, a magia descarrega e a arma volta ao normal.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `em vez do usuário, a arma se volta para outra criatura em alcance curto, à sua escolha.`
      }, 
      {
        addPM: 1,
        text: `muda o alvo para 1 arma e a duração para 1 dia, até ser descarregada. Requer 3° círculo.`
      }, 
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 2,
        text: `adiciona componente material (uma dose de veneno). Além do normal, o ataque envenena o usuário com o veneno utilizado como componente (a CD desse veneno é a CD da própria magia).`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle2Names.traicaoMagica]: {
    nome: "Traição Mágica",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Vontade reduz à metade",
    school: "Abjur",
    description:
      `Esta magia desestabiliza outras magias ativas no alvo, fazendo com que elas causem uma súbita descarga de energia mística. Para cada círculo das magias afetando o alvo, ele sofre 1d8 pontos de dano de essência. Um alvo sob efeito de Velocidade e Voo, (2º e 3º círculos), sofre 5d8 pontos de dano.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `muda o alvo para criaturas escolhidas. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Deuses de Arton v0.8`,
  },
  [spellsCircle2Names.desfazerEngenhoca]: {
    nome: "Desfazer Engenhoca",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura ou 1 engenhaca ou esfera com 3 me de raio",
    duracao: "Instantânea",
    school: "Abjur",
    description:
      `Você desfaz os efeitos ativos de engenhocas, como se sua duração tivesse acabado (efeitos instantâneos não podem ser dissipados). Quando lançar essa magia em uma criatura ou área, faça um teste de Misticismo; você dissipa todas as engenhocas com a criatura ou na área com CD igual ou menor que o resultado do teste. Lançada diretamente contra uma engenhoca, faz com que ela enguice (veja Ativação, em Tormenta20, p. 71) sem teste de resistência. Lançada contra um construto, o teste é oposto à Vontade do alvo. Se você vencer, o construto fica fraco e vulnerável. A critério do mestre, esta magia pode afetar outras habilidades similares a engenhocas.<br>Dizem que <i>Desfazer Engenhoca</i> foi ofertada aos mortais pela própria Wynna, ressentida em relação a inventos mundanos que imitam seus milagres mágicos. Por outro lado, alguns isentam a deusa, atribuindo sua criação a algum arcanista extremamente incomodado com esses inventores do diacho!`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `além do padrão, você recebe +5 no seu teste de Misticismo para dissipar uma engenhoca específica para cada vez que ela foi usada na cena.`
      }, 
      {
        addPM: 5,
        text: `além do padrão, a magia ignora qualquer efeito ativo gerado por engenhocas (como por exemplo, um Campo Antimagia).`
      }, 
      {
        addPM: 12,
        text: `muda a área para esfera com 9m de raio. Em vez do normal, cria um efeito de disjunção. Todos os efeitos de engenhocas na área são automaticamente dissipados e todas as engenhocas na área, exceto aquelas que você estiver carregando, enguiçam por uma cena (Vontade evita). Requer 5º círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle2Names.evacuacao]: {
    nome: "Evacuação",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Aliados voluntários",
    duracao: "Instantânea",
    school: "Conv",
    description:
      `Esta magia de teletransporte restrito funciona apenas no interior de masmorras, cavernas ou ruínas. Quando utilizada, transporta você e seus aliados de volta para um ponto seguro fora da estrutura.<br>Evacuação funciona apenas quando o caminho até a saída está livre e desimpedido — tipicamente quando a exploração até aquele ponto já foi concluída. Não pode ser utilizada para escapar de prisões, castelos e outros lugares trancados. Sua função é apenas encurtar o caminho para sair de uma masmorra que o conjurador esteja explorando.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `permite escapar de lugares fechados, mas a cada obstáculo, você deve fazer um teste de Misticismo (CD igual a do obstáculo). Por exemplo, se for uma porta trancada, precisa passar num teste de Misticismo com CD equivalente a Ladinagem para destrancar aquela porta. Se falhar em qualquer um desses testes, ou se um obstáculo não tiver uma CD para ser superado, a magia falha, mas os PM são gastos da mesma forma. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle2Names.maquinaDeCombate]: {
    nome: "Máquina de Combate",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 construto",
    duracao: "Cena",
    school: "Trans",
    description:
      `Esta magia energiza a fonte de energia de um golem ou outro construto, sobrecarregando-a temporariamente. O alvo recebe +5 em Atletismo, Iniciativa e Luta, mas perde 1d4 pontos de vida ao final de cada turno em que executar uma ação padrão.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `além do normal, os ataques corpo a corpo do alvo causam +1d6 pontos de dano.`
      }, 
      {
        addPM: 2,
        text: `além do normal, o alvo recebe +2 na Defesa.`
      }, 
      {
        addPM: 2,
        text: `aumenta o bônus na Defesa em +1.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle2Names.pocaoExplosiva]: {
    nome: "Poção Explosiva",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 poção",
    duracao: "Cena",
    school: "Trans",
    description:
      `Esta magia transforma o conteúdo de uma poção em uma substância volátil e altamente explosiva. Quando usada, em vez de seu efeito normal, a poção causa 2d6 pontos de dano de essência por círculo da magia que ela continha. Poção Explosiva afeta apenas o efeito da poção; suas outras características se mantêm; se a magia permitia algum teste de resistência, ele é aplicado ao dano causado.<br>Se conjurada sobre uma poção carregada por uma criatura involuntária, a criatura tem direito a um teste de Reflexos (CD da magia) para evitar o efeito. Reconhecer uma poção adulterada desta forma exige um teste de Misticismo ou Ofício (alquimista) com CD 20. Se ingerida por uma criatura, a poção causa dano máximo a esta criatura, sem direito a teste de resistência.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `você pode determinar uma palavra-chave que, se pronunciada por qualquer pessoa em alcance curto, faz a poção explodir. Requer 3° círculo.`
      }, 
      {
        addPM: 7,
        text: `muda o alvo para todas as poções no alcance. Requer 4° círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle2Names.piscar]: {
    nome: "Piscar",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Trans",
    description:
      `Pela duração da magia, você fica “piscando” entre o plano material e o etéreo. Para quem o observa, é como se você ficasse visível e invisível várias vezes por segundo.<br>Quaisquer ataques e habilidades (incluindo efeitos benéficos) de outras criaturas têm 50% de chance de não afetá-lo. Você recebe +2 em testes de ataque, pois é difícil ver de onde você está atacando. Contudo, seus próprios ataques e habilidades têm 25% de chance de não afetar outras criaturas, pois você não tem controle total sobre quando está em qual plano. Você pode interagir com criaturas etéreas, com as mesmas chances de falha.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura voluntária. Requer 3º círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle2Names.transposicao]: {
    nome: "Transposição",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "2 criaturas voluntárias",
    duracao: "Instantânea",
    school: "Conv",
    description:
      `Esta magia teletransporta duas criaturas, incluindo seu equipamento, fazendo com que troquem imediatamente de lugar.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de alvos em 2. Você determina com quais criaturas cada alvo troca de lugar.`
      }, 
      {
        addPM: 5,
        text: `a troca não exige linha de efeito, mas os alvos ainda devem estar dentro do alcance. Requer 3º círculo.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para 2 criaturas lacaio involuntárias e a resistência para Vontade anula. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
  [spellsCircle2Names.viagemOnirica]: {
    nome: "Viagem Onírica",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Conjurar esta magia faz você adormecer e abandonar seu corpo físico. Você se torna um espírito incorpóreo com deslocamento de voo 18m. Você pode ver e ouvir, mas não falar ou emitir qualquer som — nem realizar ataques, lançar magias ou interagir de qualquer forma com criaturas e objetos materiais. Você ainda pode ser visto, em forma translúcida, e pode ser afetado por qualquer coisa que afete criaturas incorpóreas.<br>Quando a magia é encerrada, você retorna imediatamente para seu corpo e desperta. A magia também é cancelada caso seu corpo físico seja perturbado de qualquer forma. Você sofre uma penalidade de –10 em testes de Percepção para notar ruídos próximos de seu corpo adormecido.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `você pode falar em sua forma incorpórea. Requer 3º círculo.`
      }, 
      {
        addPM: 5,
        text: `você pode conjurar magias em sua forma incorpórea. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Heróis de Arton v0.8`,
  },
};

export const spellsCircle3: Record<spellsCircle3Names, Spell> = {
  [spellsCircle3Names.ancoraDimensional]: {
    nome: "Âncora Dimensional",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura ou objeto",
    duracao: "Cena",
    school: "Abjur",
    description:
      `O alvo é envolvido por um campo de força cor de esmeralda que impede qualquer movimento planar. Isso inclui magias de Conv (como Salto Dimensional e Teletransporte), viagens astrais e a habilidade incorpóreo.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para médio, a área para esfera com 3m de raio e o alvo para criaturas escolhidas.`
      }, 
      {
        addPM: 2,
        text: `muda o efeito para criar um fio de energia cor de esmeralda que prende o alvo a um ponto no espaço dentro do alcance. O ponto precisa ser fixo, mas não precisa de nenhum apoio ou superfície (pode simplesmente flutuar no ar). O alvo não pode se afastar mais de 3m do ponto, nem fisicamente, nem com movimento planar. O fio possui 20 PV e resistência a dano 20 (mas pode ser dissipado por efeitos que libertam criaturas, como o Julgamento Divino: Libertação do paladino).`
      }, 
      {
        addPM: 4,
        text: `muda o efeito para criar um fio de energia cor de esmeralda que prende o alvo a um ponto no espaço dentro do alcance. O ponto precisa ser fixo, mas não precisa de nenhum apoio ou superfície (pode simplesmente flutuar no ar). O alvo não pode se afastar mais de 3m do ponto, nem fisicamente, nem com movimento planar. O fio possui 20 PV e redução de dano 40 (mas pode ser dissipado por efeitos que libertam criaturas, como o Julgamento Divino: Libertação do paladino).`
      }, 
      {
        addPM: 4,
        text: `muda o alvo para área de cubo de 9m, a duração para permanente e adiciona componente material (chave de esmeralda no valor de T$ 2.000). Em vez do normal, nenhum tipo de movimento planar pode ser feito para entrar ou sair da área.`
      }, 
      {
        addPM: 9,
        text: `muda o alcance para médio, a área para esfera de 3m de raio e o alvo para criaturas escolhidas. Cria um fio de energia (veja acima) que prende todos os alvos ao centro da área.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.anularALuz]: {
    nome: "Anular a Luz",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Esfera de 6m de raio",
    duracao: "Cena",
    school: "Necro",
    description:
      `Esta magia cria uma onda de escuridão que causa diversos efeitos. Todas as magias de 3º círculo ou menor ativas na área são dissipadas se você passar num teste de Religião contra a CD de cada magia. Seus aliados na área são protegidos por uma aura sombria e recebem +4 na Defesa até o fim da cena. Inimigos na área ficam Enjoado por 1d4 rodadas (apenas uma vez por cena). Anular a Luz anula Dispersar as Trevas (este efeito tem duração instantânea).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o bônus na Defesa em +1.`
      }, 
      {
        addPM: 4,
        text: `muda o círculo máximo de magias dissipadas para 4º. Requer 4º Círculo.`
      }, 
      {
        addPM: 9,
        text: `muda o círculo máximo de magias dissipadas para 5º. Requer 5º Círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.banimento]: {
    nome: "Banimento",
    execucao: "1d3+1 rodadas",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Vontade parcial",
    school: "Abjur",
    description:
      `Você expulsa uma criatura não nativa de Arton. Um alvo nativo de outro mundo (como muitos espíritos), é teletransportado de volta para um lugar aleatório de seu mundo de origem. Já um alvo morto-vivo tem sua conexão com as energias negativas rompidas, sendo reduzido a 0 PV. Se passar na resistência, em vez dos efeitos acima, o alvo fica enjoado por 1d4 rodadas.<br>Se você tiver um ou mais itens que se oponham ao alvo de alguma maneira, a CD do teste de resistência aumenta em +2 por item. Por exemplo, se lançar a magia contra demônios do frio (vulneráveis a água benta e que odeiam luz e calor) enquanto segura um frasco de água benta e uma tocha acesa, a CD  aumenta em +4. O mestre decide se determinado item é forte o bastante contra a criatura para isso.`,
    aprimoramentos: [
      {
        addPM: 0,
        text: `muda a resistência para nenhum. Em vez do normal, devolve automaticamente uma criatura conjurada (como por uma magia de Conv) para seu plano de origem.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.colunaDeChamas]: {
    nome: "Coluna de Chamas",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    area: "Cilindro com 3m de raio e 30m de altura",
    duracao: "Instantânea",
    resistencia: "Reflexos reduz à metade",
    school: "Evoc",
    description:
      `Um pilar de fogo sagrado desce dos céus, causando 6d6 pontos de dano de fogo mais 6d6 pontos de dano de luz nas criaturas e objetos livres na área.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano de fogo em +1d6.`
      }, 
      {
        addPM: 1,
        text: `aumenta o dano de luz em +1d6.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.comunhaoComANatureza]: {
    nome: "Comunhão com a Natureza",
    execucao: "Completa",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "1 dia",
    school: "Adiv",
    description:
      `Após uma breve união com a natureza local, você obtém informações e intuições sobre a região em que está, numa distância equivalente a um dia de viagem. Você recebe 6d4 dados de auxílio. <br>Enquanto a magia durar, sempre que for realizar um teste de perícia em áreas naturais, você pode gastar 2d4 (mais 2d4 para cada círculo de magias acima do 3º que puder lançar) e adicionar o resultado rolado como bônus no teste. A magia termina se você ficar sem dados.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda a execução para 1 minuto e a duração para instantânea. Em vez do normal, você descobre 1d4+1 informações sobre os seguintes temas: terreno, animais, vegetais, minerais, cursos d’água e presença de criaturas antinaturais numa região natural em que você esteja. Você pode, por exemplo, descobrir a quantidade de cavernas (terreno), se uma planta rara existe (vegetais) e se há mortos-vivos (criaturas antinaturais) na região.`
      }, 
      {
        addPM: 3,
        text: `aumenta o número de dados de auxílio em +2.`
      }, 
      {
        addPM: 4,
        text: `muda o tipo dos dados de auxílio para d6.`
      }, 
      {
        addPM: 8,
        text: `muda o tipo dos dados de auxílio para d8.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.contatoExtraplanar]: {
    nome: "Contato Extraplanar",
    execucao: "Completa",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "1 dia",
    school: "Adiv",
    description:
      `Sua mente viaja até outro plano de existência, onde entra em contato com seres extraplanares como gênios e demônios. Você firma um contrato com uma dessas entidades para que o auxilie durante o dia, em troca de se alimentar de seu mana. Quando a magia é lançada, você recebe 6d6 dados de auxílio. Enquanto a magia durar, sempre que for realizar um teste de perícia, você pode gastar 1d6 (mais 1d6 para cada círculo de magias acima do 3º que puder lançar) e adicionar o resultado como bônus no teste. No entanto, sempre que rolar um “6” num desses dados, a entidade “suga” 1 PM de você. A magia termina se você gastar todos os dados, ficar sem PM ou no fim do dia (o que acontecer primeiro).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de dados de auxílio em +1.`
      }, 
      {
        addPM: 8,
        text: `Muda os dados de auxílio para d12. Sempre que rolar um resultado 12 num desses d12, a entidade “suga” 2 PM de você. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.controlarAgua]: {
    nome: "Controlar Água",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    area: "Esfera de 30m de raio",
    duracao: "Cena",
    resistencia: "Veja texto",
    school: "Trans",
    description:
      `Você controla os movimentos e comportamentos da água. Ao lançar a magia, escolha um dos efeitos abaixo.<br><i>Congelar:</i> toda a água mundana na área é congelada. Criaturas nadando na área ficam imóveis; escapar exige gastar uma ação padrão e passar num teste de Atletismo ou Acrobacia.<br><i>Derreter:</i> gelo mundano na área vira água e a magia termina. A critério do mestre, isso pode criar terreno difícil.<br><i>Enchente:</i> eleva o nível da água mundana na área em até 4,5m. A sua escolha, muda área para alvo: uma embarcação. O alvo recebe +3m em seu deslocamento pela duração do efeito.<br><i>Evaporar:</i> toda a água e gelo mundano na área evaporam instantaneamente e a magia termina. Elementais da água, plantas monstruosas e criaturas com imunidade a frio na área sofrem 10d8 pontos de dano de fogo; outras criaturas vivas recebem metade desse dano (Fortitude reduz à metade).<br><i>Partir:</i> diminui o nível de toda água mundana na área em até 4,5m. Em um corpo d’água raso, isso abre um caminho seco, que pode ser atravessado a pé. Em um corpo d’água profundo, cria um redemoinho que pode prender barcos (um teste de Pilotagem com CD igual à da magia permite ao piloto livrar a embarcação). Elementais da água na área ficam lentos.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +2d8.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.controlarTerra]: {
    nome: "Controlar Terra",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    area: "9 cubos com 1,5m de lado",
    resistencia: "Veja texto",
    school: "Trans",
    description:
      `Você manipula a densidade e a forma de toda terra, pedra, lama, argila ou areia na área. Ao lançar a magia, escolha.<br><i>Amolecer:</i> se afetar o teto, uma coluna ou suporte, provoca um desabamento que causa 10d6 pontos de dano de impacto às criaturas na área (Reflexos reduz à metade). Se afetar um piso de terra ou pedra, cria terreno difícil de areia ou argila, respectivamente.<br><i>Modelar:</i> pode usar pedra ou argila para criar um ou mais objetos simples de tamanho Enorme ou menor (sem mecanismos ou partes móveis). Por exemplo, pode transformar um tijolo em uma maça, criar uma passagem onde antes havia apenas uma parede ou levantar uma ou mais paredes que oferecem cobertura total (RD 8 e 50 PV para cada 3m).<br><i>Solidificar:</i> transforma lama ou areia em terra ou pedra. Criaturas com os pés na superfície ficam agarradas. Elas podem se soltar com uma ação padrão e um teste de Acrobacia ou Atletismo.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o número de cubos de 1,5m em +2.`
      }, 
      {
        addPM: 1,
        text: `muda o alcance para pessoal, o alvo para você e a duração para 1 dia. Você e seu equipamento fundem-se a uma superfície ou objeto adjacente feito de pedra, terra, argila ou areia que possa acomodá-lo. Você pode voltar ao espaço adjacente como uma ação livre, dissipando a magia. Enquanto mesclado, você não pode falar ou fazer ações físicas, mas consegue perceber seus arredores normalmente. Pequenos danos não o afetam, mas se o objeto (ou o trecho onde você está imerso) for destruído, a magia é dissipada, você volta a um espaço livre adjacente e sofre 10d6 pontos de dano de impacto.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.convInstantanea]: {
    nome: "Conv Instantânea",
    execucao: "Padrão",
    alcance: "Ilimitado (veja texto)",
    alvo: "1 objeto de 2 espaços",
    duracao: "Instantânea",
    school: "Conv",
    description:
      `Você invoca um objeto de qualquer lugar para sua mão. O item deve ter sido previamente preparado com uma runa ou marca pessoal sua (ao custo de T$ 5). A magia não funciona se o objeto estiver com outra criatura, mas você saberá onde ele está e quem o está carregando (ou sua descrição física, caso não conheça a criatura).`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, até 1 hora após ter lançado a magia, você pode gastar uma ação de movimento para enviar o objeto de volta para o local em que ele estava antes.`
      }, 
      {
        addPM: 1,
        text: `muda o alvo para um baú Médio, a duração para permanente e adiciona sacrifício de 1 PM. Em vez do normal, você esconde o baú alvo no Etér Entre Mundos, com até 20 espaços de equipamento. A magia faz com que qualquer objeto caiba no baú, independentemente do seu tamanho. Uma vez escondido, você pode convocar o baú para um espaço livre adjacente, ou de volta para o Etér, com uma ação padrão. <i>Componente material:</i> baú construído com matéria-prima da melhor qualidade (T$ 1.000). Você deve ter em mãos uma miniatura do baú, no valor de T$ 100, para invocar o baú verdadeiro.`
      }, 
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para 1 objeto de até 10 espaços. Um objeto muito grande ou pesado para aparecer em suas mãos surge em um espaço adjacente a sua escolha.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.despertarConsciencia]: {
    nome: "Despertar Consciência",
    execucao: "Completa",
    alcance: "Toque",
    alvo: "1 animal ou planta",
    duracao: "1 dia",
    school: "Encan",
    description:
      `Você desperta a consciência de um animal ou planta. O alvo se torna um parceiro veterano de um tipo a sua escolha entre ajudante, combatente, fortão, guardião, médico, perseguidor ou vigilante. Se usar esta magia em um parceiro que já possua, o nível de poder de um de seus tipos aumenta em um passo (iniciante para veterano, veterano para mestre). Se já for um parceiro mestre, recebe o bônus de outro tipo de parceiro iniciante (entre as escolhas acima). O alvo se torna uma criatura racional, com Inteligência –1, e pode falar`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `muda o alvo para 1 escultura mundana inanimada. Além do normal, o alvo tem as mesmas características de um construto.`
      }, 
      {
        addPM: 4,
        text: `muda a duração para permanente e adiciona penalidade de -3 PM.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.dificultarDeteccao]: {
    nome: "Dificultar Detecção",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura ou objeto",
    duracao: "1 dia",
    school: "Abjur",
    description:
      `Esta magia oculta a presença do alvo contra qualquer meio mágico de detecção, inclusive detectar magia. Um conjurador que lance uma magia de Adiv para detectar a presença ou localização do alvo deve fazer um teste de Vontade. Se falhar, a magia não funciona, mas os PM são gastos mesmo assim. Se for lançada sobre uma criatura, Dificultar Detecção protege tanto a criatura quanto seu equipamento.`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `muda o alvo para área de cubo de 9m. Qualquer criatura ou objeto na área recebe o efeito da magia enquanto estiver dentro dela.`
      }, 
      {
        addPM: 4,
        text: `muda a duração para 1 semana.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.dispersarAsTrevas]: {
    nome: "Dispersar as Trevas",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Esfera de 6m de raio",
    duracao: "Veja texto",
    school: "Evoc",
    description:
      `Esta magia cria um forte brilho (multicolorido ou de uma cor que remeta a sua divindade) que causa diversos efeitos. Todas as magias de 3º círculo ou menor ativas na área são dissipadas se você passar num teste de Religião contra a CD de cada magia. Seus aliados na área recebem +4 em testes de resistência e redução de trevas 10 até o fim da cena, protegidos por uma aura sutil da mesma cor. Inimigos na área ficam Cego por 1d4 rodadas (apenas uma vez pela magia). Dispersar as Trevas anula Anular a Luz (este efeito tem duração instantânea).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o bônus nas resistências em +1.`
      }, 
      {
        addPM: 4,
        text: `muda o alcance para curto, a área para alvo 1 criatura e a duração para cena. O alvo fica imune a efeitos de Necro e trevas.`
      }, 
      {
        addPM: 4,
        text: `muda o círculo máximo de magias dissipadas para 4º. Requer 4º círculo.`
      }, 
      {
        addPM: 9,
        text: `muda o círculo máximo de magias dissipadas para 5º. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.enxameRubroDeIchabod]: {
    nome: "Enxame Rubro de Ichabod",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 enxame grande (quadrado de 3m);",
    duracao: "Sustentada",
    resistencia: "Reflexos reduz à metade",
    school: "Conv",
    description:
      `Você conjura um enxame de pequenas criaturas da Tormenta. O enxame pode passar pelo espaço de outras criaturas e não impede que outras criaturas entrem no espaço dele. No final de cada um de seus turnos, o enxame causa 4d12 pontos de dano de ácido a qualquer criatura em seu espaço (Reflexos reduz à metade). Você pode gastar uma ação de movimento para mover o enxame com deslocamento de 12m.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `além do normal, uma criatura que falhe no teste de Reflexos fica agarrada (o enxame escala e cobre o corpo dela). A criatura pode gastar uma ação padrão e fazer um teste de Acrobacia ou Atletismo para escapar. Se você mover o enxame, a criatura fica livre.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +1d12.`
      }, 
      {
        addPM: 2,
        text: `muda o dano para trevas.`
      }, 
      {
        addPM: 3,
        text: `o enxame vira Enorme (quadrado de 6m de lado).`
      }, 
      {
        addPM: 3,
        text: `o enxame ganha deslocamento de voo 18m e passa a ocupar um cubo ao invés de um quadrado.`
      }, 
      {
        addPM: 4,
        text: `o enxame inclui parasitas inchados que explodem e criam novos enxames. No início de cada um de seus turnos, role 1d6. Em um resultado 5 ou 6, um novo enxame surge adjacente a um já existente à sua escolha. Você pode mover todos os enxames com uma única ação de movimento, mas eles não podem ocupar o mesmo espaço. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.erupcaoGlacial]: {
    nome: "Erupção Glacial",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Quadrado de 6m de lado",
    duracao: "Instantânea",
    resistencia: "Reflexos parcial",
    school: "Evoc",
    description:
      `Estacas de gelo irrompem do chão. Criaturas na área sofrem 4d6 de dano de corte, 4d6 de dano de frio e ficam caídas. Passar no teste de Reflexos evita o dano de corte e a queda. As estacas duram pela cena, o que torna a área afetada terreno difícil, e concedem cobertura leve para criaturas dentro da área ou atrás dela. As estacas são destruídas caso sofram qualquer quantidade de dano por fogo mágico.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o dano de frio em +2d6 e o dano de corte em +2d6.`
      }, 
      {
        addPM: 4,
        text: `muda a área para cilindro com 6m de raio e 6m de altura e a duração para sustentada. Em vez do normal, a magia cria uma tempestade de granizo que causa 3d6 pontos de dano de impacto e 3d6 pontos de dano de frio em todas as criaturas na área (sem teste de resistência). A tempestade fornece camuflagem leve as criaturas dentro dela e deixa o piso escorregadio. Piso escorregadio conta como terreno difícil e obriga criaturas na área a fazer testes de Acrobacia para equilíbrio (veja o Capítulo 2). Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.ferverSangue]: {
    nome: "Ferver Sangue",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Sustentada",
    resistencia: "Fortitude parcial",
    school: "Necro",
    description:
      `O sangue do alvo aquece rapidamente até entrar em ebulição. Quando a magia é lançada, e no início de cada um de seus turnos, o alvo sofre 4d8 pontos de dano de fogo e fica Enjoado por uma rodada (Fortitude reduz o dano à metade e evita a condição). Se o alvo passar em dois testes de Fortitude seguidos, dissipa a magia. Se o alvo for reduzido a 0 PV pelo dano desta magia, seu corpo explode, matando-o e causando 6d6 pontos de dano de fogo em todas as criaturas a até 3m (Reflexos reduz à metade). Essa magia não afeta criaturas sem sangue, como construtos ou mortos-vivos.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +1d8.`
      }, 
      {
        addPM: 9,
        text: `muda alvo para criaturas escolhidas. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.globoDeInvulnerabilidade]: {
    nome: "Globo de Invulnerabilidade",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    school: "Abjur",
    description:
      `Você é envolto por uma esfera mágica brilhante com 3m de raio, que detém qualquer magia de 2º círculo ou menor. Nenhuma magia pode ser lançada contra um alvo dentro do globo e magias de área não o penetram. No entanto, magias ainda podem ser lançadas de dentro para fora.<br>Uma magia que dissipa outras magias só dissipa o globo se for usada diretamente sobre você, não o afetando se usada em área. Efeitos mágicos não são dissipados quando entram na esfera, apenas suprimidos (voltam a funcionar fora do globo, caso sua duração não tenha acabado). O globo é imóvel e não tem efeito sobre criaturas ou objetos. Após lançá-lo, você pode entrar ou sair livremente.`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `muda o efeito para afetar magias de até 3º círculo. Requer 4º círculo.`
      }, 
      {
        addPM: 9,
        text: `muda o efeito para afetar magias de até 4º círculo. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.heroismo]: {
    nome: "Heroísmo",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Encan",
    description:
      `Esta magia imbui uma criatura com coragem e valentia. O alvo fica imune a medo e recebe 40 PV temporários e +4 em testes de ataque e rolagens de dano contra o inimigo de maior ND na cena.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o bônus para +6.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.ilusaoLacerante]: {
    nome: "Ilusão Lacerante",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Cubo de 9m de lado",
    duracao: "Sustentada",
    resistencia: "Vontade anula",
    school: "Ilusão",
    description:
      `Você cria uma ilusão de algum perigo mortal. Quando a magia é lançada, criaturas na área devem fazer um teste de Vontade; uma falha significa que a criatura acredita que a ilusão é real e sofre 3d6 pontos de dano psíquico não letal. Sempre que uma criatura iniciar seu turno dentro da área, deve repetir o teste de Vontade. Se falhar, sofre o dano novamente. Somente criaturas que falham veem a ilusão, e racionalizam o efeito sempre que falham no teste (por exemplo, acredita que o mesmo teto pode cair sobre ela várias vezes).`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o dano em +2d6.`
      }, 
      {
        addPM: 4,
        text: `muda a área para um cubo de 90m. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.imobilizar]: {
    nome: "Imobilizar",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 animal ou humanóide",
    duracao: "Cena",
    resistencia: "Vontade parcial",
    school: "Encan",
    description:
      `O alvo fica Paralisado; se passar na resistência, em vez disso fica Lento. A cada rodada, pode gastar uma ação completa para fazer um novo teste de Vontade. Se passar, se liberta do efeito.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alvo para 1 espírito.`
      }, 
      {
        addPM: 2,
        text: `aumenta o número de alvos em +1.`
      }, 
      {
        addPM: 3,
        text: `muda o alvo para 1 criatura. Requer 4º círculo`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.lancaIgneaDeAleph]: {
    nome: "Lança Ígnea de Aleph",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Reflexos parcial",
    school: "Evoc",
    description:
      `Esta magia foi desenvolvida pelo mago imortal Aleph Olhos Vermelhos, um entusiasta dos estudos vulcânicos. Ela dispara um projétil de magma contra o alvo, que sofre 4d6 pontos de dano de fogo e 4d6 pontos de dano de perfuração e fica em chamas. As chamas causam 2d6 pontos de dano por rodada, em vez do dano normal. Se passar no teste de resistência, o alvo sofre metade do dano e não fica em chamas.<br>Respingos de rocha incandescente se espalham com a explosão, atingindo todas as criaturas adjacentes ao alvo, que devem fazer um teste de Reflexos. Se falharem, ficam em chamas, como descrito acima.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o dano inicial em +2d6 e o dano do efeito em chamas em +1d6.`
      }, 
      {
        addPM: 4,
        text: `muda a duração para cena ou até ser descarregada. Em vez do efeito normal, a magia cria quatro dardos de lava que flutuam ao lado do conjurador. Uma vez por rodada, como uma ação livre, você pode disparar um dos dardos em uma criatura, causando o efeito normal da magia. Requer 4º Círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.lendasEHistorias]: {
    nome: "Lendas e Histórias",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura objeto ou local",
    duracao: "Sustentada",
    school: "Adiv",
    description:
      `Você descobre informações sobre uma criatura, objeto ou local que esteja tocando. O que exatamente você descobre depende do mestre: talvez você não descubra tudo que há para saber, mas ganhe pistas para continuar a investigação. A cada rodada que mantiver a magia, você descobre:<br>Todas as informações sobre o alvo, como se tivesse passado em todos os testes de Conhecimento para tal.<br>Todas as habilidades do alvo. Se for uma criatura, você sabe suas estatísticas de jogo como raça, classe, nível, atributos, magias, resistências e fraquezas. Se for um item mágico, aprende seu efeito e funcionamento.<br>Se o alvo está sob influência de alguma magia e todas as informações sobre as magias ativas, se houver alguma.`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `muda a execução para 1 dia, o alcance para ilimitado e adiciona componente material (cuba de ouro cheia d’água e ingredientes mágicos, no valor de T$ 1.000). Você ainda precisa ter alguma informação sobre o alvo, como um nome, descrição ou localização.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.mantoDeSombras]: {
    nome: "Manto de Sombras",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    school: "Ilusão",
    description:
      `Você fica coberto por um manto de energia sombria. Nesta forma, torna-se incorpóreo (inclui seu equipamento): só pode ser afetado por armas mágicas,  ou por outras criaturas incorpóreas e pode atravessar objetos sólidos, mas não manipulá-los. Também não pode atacar criaturas normais (mas ainda pode lançar magias nelas). Além disso, se torna vulnerável à luz direta: se exposto a uma fonte de luz, sofre 1 ponto de dano por rodada.<br>Você pode gastar uma ação de movimento e 1 PM para “entrar” em uma sombra do seu tamanho ou maior e se teletransportar para outra sombra, também do seu tamanho ou maior, em alcance médio.`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `muda o alcance para toque e o alvo para 1 criatura. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.miragem]: {
    nome: "Miragem",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    area: "Cubo de até 90m de lado",
    duracao: "1 dia",
    resistencia: "Vontade desacredita",
    school: "Ilusão",
    description:
      `Você faz um terreno parecer outro, incluindo sons e cheiros. Uma planície pode parecer um pântano, uma floresta pode parecer uma montanha etc. Esta magia pode ser usada para criar armadilhas: areia movediça pode parecer terra firme ou um precipício pode parecer um lago. Você pode alterar, incluir e esconder estruturas dentro da área, mas não criaturas (embora elas possam se esconder nas estruturas ilusórias).`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `além do normal, pode alterar a aparência de criaturas escolhidas na área, como se usando Disfarce Ilusório.`
      }, 
      {
        addPM: 9,
        text: `muda a duração para permanente e adiciona componente material (pó de diamante no valor de T$ 1.000). Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.missaoDivina]: {
    nome: "Missão Divina",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "1 semana ou até ser descarregada",
    resistencia: "Vontade anula (veja texto)",
    school: "Encan",
    description:
      `Esta magia obriga o alvo a cumprir uma tarefa a sua escolha. Ela dura uma semana ou até o alvo cumprir a tarefa, o que vier primeiro. O alvo pode recusar a missão — mas, no fim de cada dia em que não se esforçar para cumprir a tarefa, deve fazer um teste de Vontade; se falhar, sofre uma penalidade cumulativa de –2 em todos os testes e rolagens.<br>A Missão Divina não pode forçar uma criatura a um ato suicida, nem designar uma missão impossível (como matar uma criatura que não existe).`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para toque, a duração para permanente e adiciona penalidade de –1 PM. Em vez do normal, você inscreve uma marca (como uma tatuagem) na pele do alvo e escolhe um tipo de ação que ativará a marca. Normalmente, será cometer um crime (roubar, matar...) ou outra coisa contrária às Obrigações & Restrições de sua divindade. Sempre que a marca é ativada, o alvo recebe uma penalidade cumulativa de –2 em todos os testes. Muitas vezes, portar essa marca é um estigma por si só, já que esta magia normalmente é lançada em criminosos ou traidores. Uma magia que dissipe outras suprime a marca e suas penalidades por um dia; elas só podem ser totalmente removidas pelo conjurador original ou pela magia Purificação.`
      }, 
      {
        addPM: 4,
        text: `aumenta a duração para 1 ano ou até ser descarregada.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.muralhaElemental]: {
    nome: "Muralha Elemental",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Muralha de energia",
    duracao: "Cena",
    resistencia: "Veja texto",
    school: "Evoc",
    description:
      `Cria uma muralha de um elemento a sua escolha. A muralha pode ser um muro de até 30m de comprimento e 3m de altura (ou o contrário) ou uma cúpula de 3m de raio. Os efeitos variam conforme o elemento escolhido.<br><i>Fogo:</i> Faz surgir uma violenta cortina de chamas. Um lado da muralha (a sua escolha) emite ondas de calor, que causam 2d6 pontos de dano de fogo em criaturas a até 6m quando você lança a magia e no início de seus turnos. Atravessar a muralha causa 8d6 pontos de dano de fogo. Caso seja criada em  uma área onde existem criaturas, elas sofrem dano como se estivessem atravessando a muralha, mas podem fazer um teste de Reflexos para reduzir o dano à metade (a criatura escolhe para qual lado quer escapar, mas se escapar para o lado quente sofrerá mais 2d6 pontos de dano).<br><i>Gelo:</i> Evoca uma parede grossa de gelo denso com 15cm de espessura. Na forma de cúpula, pode prender uma ou mais criaturas, mas elas têm direito a um teste de Reflexos para escapar antes que a cúpula se forme. Cada trecho de 3m da muralha tem Defesa 8, 40 PV e RD 5. Um trecho da muralha que atinja 0 PV será rompido. Qualquer efeito de fogo causa dano dobrado à muralha. Uma criatura que atravesse um trecho rompido da muralha sofre 4d6 pontos de dano de frio.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano por atravessar a muralha em +2d6.`
      }, 
      {
        addPM: 2,
        text: `aumenta o comprimento em +15m e altura em +3m, até 60m de comprimento e 9m de altura.`
      }, 
      {
        addPM: 4,
        text: `muda a duração para sustentada e adiciona uma nova escolha, Essência. A muralha é invisível e indestrutível — imune a qualquer forma de dano e não afetada por nenhuma magia. Ela não pode ser atravessada nem mesmo por criaturas incorpóreas. No entanto, magias que teletransportam criaturas, como Salto Dimensional, podem atravessá-la. Magias e efeitos de dano, como Bola de Fogo e o sopro de um dragão, não vencem a muralha, mas magias lançadas diretamente sobre uma criatura ou área, como Sono, podem ser lançadas contra alvos que estejam no outro lado como se tivessem linha de efeito. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.peleDePedra]: {
    nome: "Pele de Pedra",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Trans",
    description:
      `Sua pele ganha aspecto e dureza de rocha. Você recebe redução de dano 5.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para toque e o alvo para 1 criatura.`
      }, 
      {
        addPM: 4,
        text: `muda a duração para 1 dia.`
      }, 
      {
        addPM: 4,
        text: `sua pele ganha aspecto e dureza de aço. Você recebe resistência a dano 10. Requer 4º círculo.`
      }, 
      {
        addPM: 4,
        text: `muda o alcance para toque, o alvo para 1 criatura, a duração para 1d4 rodadas e adiciona Resistência: Fortitude anula. Em vez do efeito normal, a magia transforma o alvo e seu equipamento em uma estátua inerte e sem consciência. A estátua possui os mesmos PV da criatura e resistência a dano 8; se for quebrada, a criatura morrerá. Requer 4º círculo.`
      }, 
      {
        addPM: 9,
        text: `como acima, mas com duração permanente. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.poeiraDaPodridao]: {
    nome: "Poeira da Podridão",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Nuvem com 6m de raio",
    duracao: "Cena",
    resistencia: "Fortitude (veja texto)",
    school: "Necro",
    description:
      `Você manifesta uma nuvem de poeira carregada de energia negativa, que apodrece lentamente as criaturas na área. Ao lançar a magia, e no início de seus turnos, criaturas na área sofrem 2d8+8 pontos de dano de trevas (Fortitude reduz à metade). Alvos que falharem no teste não podem recuperar PV por uma rodada.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em 1d8+4.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.potenciaDivina]: {
    nome: "Potência Divina",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    school: "Trans",
    description:
      `Você canaliza o poder de sua divindade. Você aumenta uma categoria de tamanho (seu equipamento muda de acordo) e recebe Força +4 e RD 10. Você não pode lançar magias enquanto estiver sob efeito de Potência Divina.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o bônus de Força em +1.`
      }, 
      {
        addPM: 5,
        text: `aumenta a resistência a dano em +5.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para toque e o alvo para 1 criatura. A magia falha se você e o alvo não forem devotos da mesma divindade.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.protecaoContraMagia]: {
    nome: "Proteção Contra Magia",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Abjur",
    description:
      `Você protege o alvo contra efeitos mágicos nocivos. O alvo recebe +5 em testes de resistência contra magias.`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `muda o bônus para +10. Requer 4º círculo.`
      }, 
      {
        addPM: 4,
        text: `em vez do normal, o alvo fica imune a uma escola de magia a sua escolha. Requer 4º Círculo.`
      }, 
      {
        addPM: 9,
        text: `em vez do normal, o alvo fica imune a duas escolas de magia a sua escolha. Requer 5º Círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.seloDeMana]: {
    nome: "Selo de Mana",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    resistencia: "Vontade parcial",
    school: "Encan",
    description:
      `Seu toque manifesta um selo mágico na pele do alvo, que atrapalha o fluxo de mana. Pela duração da magia, sempre que o alvo realizar qualquer ação que gaste PM, deve fazer um teste de Vontade; se passar, faz a ação normalmente. Se falhar, a ação não tem efeito (mas os PM são gastos mesmo assim).`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `muda o alcance para curto e o alvo para criaturas escolhidas dentro do alcance. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.servoDivino]: {
    nome: "Servo Divino",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Criatura conjurada",
    duracao: "Cena até ser descarregada",
    school: "Conv",
    description:
      `Você pede a sua divindade que envie um espírito para ajudá-lo. Esse espírito realiza uma tarefa a sua escolha que possa ser cumprida em até uma hora — desde algo simples como “use suas asas para nos levar até o topo da montanha” até algo complexo como “escolte esses camponeses até o castelo”. A magia é descarregada quando a criatura cumpre a tarefa, retornando a seu plano natal. O tipo de criatura é escolhido pelo mestre, de acordo com as necessidades da tarefa.<br><i>Componente material:</i> um pagamento de T$ 100 ao espírito. A forma de pagamento varia — doações a um templo, um item mágico ou mesmo dinheiro.`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `muda a duração para 1 dia ou até ser descarregada. O espírito realiza uma tarefa a sua escolha que exija até um dia. O custo do pagamento aumenta para T$ 500. O resto segue normal.`
      }, 
      {
        addPM: 9,
        text: `muda a duração para 1 semana ou até ser descarregada. O espírito realiza uma tarefa que exija até uma semana. O custo do pagamento aumenta para T$ 1.000. O resto segue normal.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.servoMortoVivo]: {
    nome: "Servo Morto-Vivo",
    execucao: "Completa",
    alcance: "Toque",
    alvo: "1 cadáver",
    duracao: "Instantânea",
    school: "Necro",
    description:
      `Esta magia transforma o cadáver de um humanoide, animal ou monstro em um esqueleto ou zumbi (conforme o estado de conservação do corpo). O morto-vivo então obedece a todos os seus comandos, mesmo suicidas. Se quiser que o morto-vivo o acompanhe, ele funciona como um aliado iniciante, de um tipo a sua escolha entre ajudante, atirador, combatente, fortão, guardião ou montaria.<br>Uma vez por rodada, quando sofre dano, você pode sacrificar um servo morto-vivo e evitar esse dano. O servo é destruído no processo e não pode ser reanimado.<br><i>Componente material:</i> um ônix negro (T$ 100), inserido na boca ou olho do cadáver.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `muda o componente material para pó de ônix negro (T$ 500). Em vez de um zumbi ou esqueleto, cria um carniçal. Ele pode funcionar como um aliado veterano, escolhido entre ajudante, atirador, combatente, fortão ou guardião. O resto segue normal.`
      }, 
      {
        addPM: 3,
        text: `muda o componente material para pó de ônix negro (T$ 500). Em vez de um zumbi ou esqueleto, cria uma sombra. Ela pode funcionar como um aliado veterano, escolhido entre assassino, combatente ou perseguidor. O restante da magia segue normal.`
      }, 
      {
        addPM: 7,
        text: `muda o componente material para ferramentas de embalsamar (T$ 1.000). Em vez de um zumbi ou esqueleto, cria uma múmia. Ela pode funcionar como um aliado mestre, escolhido entre ajudante, destruidor, guardião ou médico. O restante da magia segue normal. Requer 4º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.soproDaSalvacao]: {
    nome: "Sopro da Salvação",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Cone de 9m",
    duracao: "Instantânea",
    school: "Evoc",
    description:
      `Você enche seus pulmões de luz e energia positiva e sopra um cone de poeira reluzente. O sopro afeta apenas seus aliados na área, curando 2d8+4 pontos de vida e removendo uma das seguintes condições de todos os alvos: abalado, atordoado, apavorado, alquebrado, cego, confuso, debilitado, enfeitiçado, enjoado, esmorecido, exausto, fascinado, fatigado, fraco, frustrado, lento, paralisado, pasmo e surdo.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta a quantidade de cura em 1d8+2.`
      }, 
      {
        addPM: 4,
        text: `além do normal, se um aliado estiver com PV negativos, seus PV são levados a 0 e então a cura é aplicada.`
      }, 
      {
        addPM: 4,
        text: `remove todas as condições listadas, em vez de apenas uma.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.telecinesia]: {
    nome: "Telecinésia",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Veja texto",
    duracao: "Sustentada ou instantânea (veja texto)",
    school: "Trans",
    description:
      `Você move objetos ou criaturas se concentrando. Ao lançar a magia, escolha uma das opções a seguir.<br><i>Força Contínua:</i> você move uma criatura Média ou menor, ou objeto de até 10 espaços, a até 6m por rodada. Uma criatura pode anular o efeito sobre ela, ou sobre um objeto que possua, passando num teste de Vontade. O alvo pode ser movido em qualquer direção dentro do alcance. Ele cai no chão se sair do alcance ou a magia terminar. Duração sustentada.<br><i>Empurrão Violento:</i> nesta versão a energia mágica é expelida de uma única vez e arremessa até 10 objetos (no máximo 10 espaços). Os objetos devem estar a até 3m uns dos outros e podem ser arremessados até o alcance da magia.Objetos arremessados podem atingir criaturas em seu caminho, causando de 1 ponto de dano de impacto por espaço (objetos macios, sem pontas ou sem fio) até 1d6 pontos de dano por espaço (objetos duros, pontudos ou afiados). Criaturas atingidas têm direito a um teste de Reflexos para reduzir o dano à metade.Criaturas médias ou menores podem ser arremessadas, mas têm direito a um teste de Vontade para evitar o efeito (em si mesmas ou em objetos que estejam segurando). Uma criatura arremessada contra uma superfície sólida sofre 1d6 pontos de dano de impacto para cada 3m que “voou” no deslocamento (incluindo outras criaturas; nesse caso, ambas sofrem o dano). Duração instantânea.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o tamanho máximo da criatura em uma categoria (para Grande, Enorme e Colossal) ou dobra a quantidade de espaços do objeto.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.teletransporte]: {
    nome: "Teletransporte",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "Até 5 criaturas voluntárias",
    duracao: "Instantânea",
    school: "Conv",
    description:
      `Esta magia transporta os alvos para um lugar a sua escolha a até 1.000km. Você precisa fazer um teste de Misticismo, com dificuldade que depende de seu conhecimento sobre o local de destino (veja tabela a seguir).<table><tr><th>CD</th><th>Um lugar...</th></tr><tr><td>20</td><td>Familiar que você visita com frequência</td></tr><tr><td>30</td><td>Conhecido que você já visitou pelo menos uma vez</td></tr><tr><td>40</td><td>Desconhecido que você nunca visitou e só conhece a partir da descrição de outra pessoa que esteve lá</td></tr></table><p class="nowrap ms">Você não pode se teletransportar para um lugar que nunca visitou sem a descrição de alguém. Ou seja, não pode se transportar para a “sala de tesouro do rei” se nunca esteve nela nem falou com alguém que esteve.<br>Se passar no teste, os alvos chegam ao lugar desejado. Se falhar, os alvos surgem 1d10 x 10km afastados em qualquer direção (se o destino é uma cidade costeira, você pode surgir em alto-mar). Se falhar por 5 ou mais, você chega em um lugar parecido, mas errado. E se você rolar 1 natural no teste a magia falha (mas você gasta os PM) e fica atordoado por 1d4 rodadas.</p>`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de alvos em +5.`
      }, 
      {
        addPM: 2,
        text: `em vez do normal, a magia teletransporta os alvos para seu santuário — um local familiar e previamente preparado. A magia pode ser usada sem limite de distância ou necessidade de testes, mas apenas dentro do mesmo plano. Preparar um local como seu santuário exige um ritual de um dia e o gasto de T$ 1.000. Você só pode ter um santuário por vez.`
      }, 
      {
        addPM: 9,
        text: `muda a execução para ação completa, a duração para cena e adiciona sacrifício de 1 PM. Em vez do normal, você cria um círculo de 1,5m de diâmetro no chão, que transporta qualquer criatura que pisar nele. O destino é escolhido quando a magia é lançada e pode ser qualquer lugar, em qualquer mundo, sem a necessidade de testes, desde que seja conhecido por você. O círculo é tênue e praticamente invisível. Você pode marcá-lo de alguma forma (por exemplo, lançando-o sobre uma plataforma elevada). Se não fizer isso, alguém pode pisar nele por acidente. Junte isso a um destino hostil e você terá uma armadilha bastante eficaz! Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.tentaculosDeTrevas]: {
    nome: "Tentáculos de Trevas",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Esfera de 6m de raio",
    duracao: "Cena",
    school: "Necro",
    description:
      `Um círculo de energias sombrias se abre no chão, de onde surgem tentáculos feitos de treva viscosa. Ao lançar a magia e no início de cada um de seus turnos, você faz um teste da manobra agarrar (usando seu bônus de Misticismo) contra cada criatura na área. Se você passar, a criatura é agarrada; se a vítima já está agarrada, é esmagada, sofrendo 4d6 pontos de dano de trevas. A área conta como terreno difícil. Os tentáculos são imunes a dano.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o raio da área em +3m.`
      }, 
      {
        addPM: 3,
        text: `aumenta o dano dos tentáculos em +2d6.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.transformacaoDeGuerra]: {
    nome: "Transformação de Guerra",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    school: "Trans",
    description:
      `Você se torna uma máquina de combate, ficando mais forte, rápido e resistente. Você recebe +6 na Defesa, testes de ataque e rolagens de dano corpo a corpo, e 30 PV temporários. Durante a Transformação de Guerra você não pode lançar magias, mas se torna proficiente em todas as armas.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta os bônus na Defesa, testes de ataque e rolagens de dano corpo a corpo em +1, e os PV temporários em +10.`
      }, 
      {
        addPM: 2,
        text: `adiciona componente material (uma barra de adamante no valor de T$ 100). Sua forma de combate ganha um aspecto metálico e sem expressões. Além do normal, você recebe resistência a dano 10 e imunidade a atordoamento e efeitos de cansaço, Encan, metabolismo, trevas e veneno, e não precisa respirar.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.viagemArborea]: {
    nome: "Viagem Arbórea",
    execucao: "Completa",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Conv",
    description:
      `Como parte da execução, você entra em uma árvore adjacente que seja maior do que você. Você pode permanecer dentro da árvore, percebendo os arredores de forma normal (mas sem poder fazer ações). Você pode gastar uma ação de movimento para sair da mesma árvore, ou de qualquer outra dentro de 1km. Se estiver dentro de uma árvore que seja destruída, a magia termina e você sofre 10d6 pontos de dano de impacto. Enquanto a magia durar você pode gastar uma ação de movimento e 1 PM para entrar em outras árvores.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para toque, o alvo para até cinco criaturas e a duração para instantânea. Os alvos entram em uma planta (de tamanho Médio ou maior) e saem em outra planta do mesmo tamanho a até 100km de distância, especificada em direção e distância aproximadas (como “50km ao norte”).`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.videncia]: {
    nome: "Vidência",
    execucao: "Completa",
    alcance: "Ilimitado (veja texto)",
    alvo: "1 criatura",
    duracao: "Sustentada",
    resistencia: "Vontade anula",
    school: "Adiv",
    description:
      `Através de uma superfície reflexiva (bacia de água benta para clérigos, lago para druidas, bola de cristal para magos, espelho para feiticeiros etc.) você pode ver e ouvir uma criatura escolhida e seus arredores (cerca de 6m em qualquer direção), mesmo que ela se mova. O alvo pode estar a qualquer distância, mas se passar em um teste de Vontade, a magia falha. A vítima recebe bônus ou penalidades em seu teste de resistência, dependendo do conhecimento que você tiver dela (veja tabela abaixo).<table><tr><th>Conhecimento do alvo</th><th>Modif.</th></tr><tr><td>Não conhece</td><td>+10</td></tr><tr><td>Ouviu falar</td><td>+5</td></tr><tr><td>O alvo está em outro plano ou mundo</td><td>+5</td></tr><tr><td>Já encontrou o alvo pessoalmente</td><td>+0</td></tr><tr><td>Tem uma pintura, escultura ou outra representação</td><td>-2</td></tr><tr><td>Conhece bem o alvo</td><td>-5</td></tr><tr><td>Tem um pertence pessoal ou peça de roupa do alvo</td><td>-5</td></tr><tr><td>Tem uma parte do corpo do alvo (unhas, cabelos...)</td><td>-10</td></tr></table>`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.voo]: {
    nome: "Voo",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Trans",
    description:
      `Você recebe deslocamento de voo 12m. Voar por meio desta magia é simples como andar — você pode atacar e lançar magias normalmente enquanto voa. Quando a magia termina, você desce lentamente até o chão, como se estivesse sob efeito de Queda Suave.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para toque e o alvo para 1 criatura.`
      }, 
      {
        addPM: 4,
        text: `muda a duração para 1 dia. Requer 4º círculo.`
      }, 
      {
        addPM: 4,
        text: `muda o alcance para curto e o alvo para até 10 criaturas. Requer 4° círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle3Names.halitoPeconhento]: {
    nome: "Hálito Peçonhento",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Cone de 9m",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Evoc",
    description:
      `Você sopra uma fumaça densa esverdeada de toxinas corrosivas que queima a pele e os olhos dos alvos. Criaturas na área sofrem 4d8 pontos de dano de ácido mais 4d8 pontos de dano de veneno e ficam cegas por 1d4+1 rodadas. Passar num teste de Fortitude reduz o dano pela metade e evita a cegueira.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano de ácido em +1d8 e o dano de veneno em +1d8.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle3Names.impactoFulminante]: {
    nome: "Impacto Fulminante",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Evoc",
    description:
      `Você evoca um poderoso relâmpago dos céus que acerta o alvo com um clarão estrondoso. O alvo sofre 4d6 pontos de dano elétrico mais 4d6 pontos de dano de impacto e fica caído e atordoado por uma rodada. Se passar no teste de resistência, o alvo sofre metade do dano, evita as condições e não pode mais ser atordoado por essa magia até o fim da cena.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano de eletricidade em +1d6 e o dano de impacto em +1d6.`
      }, 
      {
        addPM: 4,
        text: `muda o alvo para “criaturas escolhidas”. Requer 4º Círculo.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle3Names.toqueAlgido]: {
    nome: "Toque Álgido",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Evoc",
    description:
      `Sua mão emite uma energia congelante que causa 6d8 pontos de dano de frio e recobre o alvo com uma camada de gelo, deixando-o paralisado por 1d4 rodadas. O alvo pode refazer o teste de Fortitude no final de seus turnos para quebrar o gelo e se livrar da condição. Passar no teste de resistência reduz o dano pela metade e deixa o alvo enredado por uma rodada.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `como parte da execução da magia, você pode fazer um ataque corpo a corpo contra o alvo. Se acertar, causa o dano do ataque e da magia.`
      }, 
      {
        addPM: 2,
        text: `aumenta o dano em +2d8.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
};

export const spellsCircle4: Record<spellsCircle4Names, Spell> = {
  [spellsCircle4Names.alterarMemoria]: {
    nome: "Alterar Memória",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `Você invade a mente do alvo e altera ou apaga suas memórias da última hora.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para pessoal e o alvo para área cone de 4,5m.`
      }, 
      {
        addPM: 5,
        text: `você pode alterar ou apagar as memórias das últimas 24 horas.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.animarObjetos]: {
    nome: "Animar Objetos",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Até 8 objetos minúsculos ou pequenos, 4 objetos médios, 2 objetos grandes ou 1 objeto enorme",
    duracao: "Cena",
    school: "Trans",
    description:
      `Você concede vida a objetos inanimados. Cada objeto se torna um parceiro sob seu controle. O tipo dele é escolhido da lista de tamanho e ele não conta em seu limite de parceiros. Com uma ação de movimento, você pode comandar mentalmente qualquer objeto animado dentro do alcance para que auxilie você ou outra criatura. Outros usos criativos para os objetos ficam a cargo do mestre. Objetos animados são construtos com valores de Força, Destreza e  PV de acordo com seu tamanho. Todos os outros atributos nulos, eles não têm valor de Defesa ou testes de resistência e falham automaticamente em qualquer teste oposto. Diferente de parceiros comuns, um objeto pode ser alvo de um ataque direto. Esta magia não afeta itens mágicos, nem objetos que estejam sendo carregados por outra criatura.<br>Esta magia não afeta itens mágicos, nem objetos que estejam sendo carregados por outra criatura.<br><b>Estatísticas de objetos animados:</b><br><i>Minúsculo:</i> For -3, Des 4, 5 PV; Assassino ou Combatente Iniciante.<br><i>Pequeno:</i> For -2, Des 2, 10 PV; Combatente ou Guardião Iniciante.<br><i>Médio:</i> For 0, Des 1, 20 PV; Combatente ou Guardião Veterano.<br><i>Grande:</i> For 2, Des 0, 40 PV; Fortão, Guardião ou Montaria (cavalo) Veterano.<br><i>Enorme:</i> For 4, Des -2, 60 PV; Fortão, Guardião ou Montaria (cavalo) Mestre.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `muda a duração para permanente e adiciona componente material (prataria no valor de T$ 1.000). Você pode ter um máximo de objetos animados igual à metade do seu nível.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.assassinoFantasmagorico]: {
    nome: "Assassino Fantasmagórico",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    alvo: "1 criatura",
    duracao: "Cena até ser descarregada",
    resistencia: "Vontade anula, fortitude parcial",
    school: "Necro",
    description:
      `Usando os medos subconscientes do alvo, você cria uma imagem daquilo que ele mais teme. Apenas a própria vítima pode ver o Assassino Fantasmagórico com nitidez; outras criaturas presentes (incluindo o conjurador) enxergam apenas um espectro sombrio.<br>Quando você lança a magia, o espectro surge adjacente a você e a vítima faz um teste de Vontade. Se ela passar, percebe que o espectro é uma ilusão e a magia é dissipada. Se falhar, acredita na existência do espectro, que então flutua 18m por rodada em direção à vítima, sempre no fim do seu turno. Ele é incorpóreo e imune a magias (exceto magias que dissipam outras).<br>Se o espectro terminar seu turno adjacente à vítima, ela deve fazer um teste de Fortitude. Se passar, sofre 6d6 pontos de dano de trevas (este dano não pode reduzir o alvo a menos de 0 PV e não o deixa sangrando). Se falhar, sofre um colapso, ficando imediatamente com –1 PV e sangrando.<br>O espectro persegue o alvo implacavelmente. Ele desaparece se o alvo ficar inconsciente ou se afastar além de alcance longo dele, ou se for dissipado.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.campoAntimagia]: {
    nome: "Campo Antimagia",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    school: "Abjur",
    description:
      `Você é cercado por uma barreira invisível com 3m de raio que o acompanha. Qualquer habilidade mágica ou item mágico que entre na área da barreira é suprimida enquanto estiver lá.<br>Criaturas convocadas que entrem em um Campo Antimagia desaparecem. Elas reaparecem na mesma posição quando a duração do Campo termina — supondo que a duração da magia que as convocou ainda não tenha terminado.<br>Criaturas mágicas ou imbuídas com magia durante sua criação não são diretamente afetadas pelo Campo Antimagia. Entretanto, como qualquer criatura, não poderão usar magias ou habilidades mágicas dentro dele.<br>Uma magia que dissipa outras não dissipa um Campo Antimagia, e dois Campos na mesma área não se neutralizam. Artefatos e deuses maiores não são afetados por um Campo Antimagia.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.circuloDaRestauracao]: {
    nome: "Círculo da Restauração",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    area: "Esfera de 3m de raio",
    duracao: "5 rodadas",
    school: "Evoc",
    description:
      `Você evoca um círculo de luz que emana uma energia poderosa. Qualquer criatura viva que termine o turno dentro do círculo recupera 3d8+3 PV e 1 PM. Mortos-vivos e criaturas que sofrem dano por luz perdem PV e PM na mesma quantidade. Uma criatura pode recuperar no máximo 5 PM por dia com esta magia.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta a regeneração de PV em 1d8+1.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.coleraDeAzgher]: {
    nome: "Cólera de Azgher",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Esfera de 6m de raio",
    duracao: "Instantânea",
    resistencia: "Reflexos parcial",
    school: "Evoc",
    description:
      `Você cria um fulgor dourado e intenso. Criaturas na área ficam cegas por 1d4 rodadas e em chamas, e sofrem 10d6 pontos de dano de fogo (mortos-vivos sofrem 10d8 pontos de dano). Uma criatura que passe no teste de resistência não fica cega nem em chamas e sofre metade do dano.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +2d6 (+2d8 contra mortos-vivos).`
      }, 
      {
        addPM: 2,
        text: `aumenta a área em +6m de raio.`
      }, 
      {
        addPM: 5,
        text: `a luz purificadora do Deus-Sol dissipa todas as magias de Necro ativas na área. Requer 5º círculo`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.concederMilagre]: {
    nome: "Conceder Milagre",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Permanente até ser descarregada",
    school: "Encan",
    description:
      `Você transfere um pouco de seu poder divino a outra criatura. Escolha uma magia de até 2º círculo que você conheça; o alvo pode lançar essa magia uma vez, sem pagar o custo base dela em PM (aprimoramentos podem ser usados, mas o alvo deve gastar seus próprios PM). Você sofre uma penalidade de –3 PM até que o alvo lance a magia.`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `muda o círculo da magia concedida para 3º e a penalidade de PM para –6.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.conjurarElemental]: {
    nome: "Conjurar Elemental",
    execucao: "Completa",
    alcance: "Médio (30m 20q)",
    alvo: "Parceiro elemental",
    duracao: "Sustentada",
    school: "Conv",
    description:
      `Esta magia transforma uma porção de um elemento inerte em uma criatura elemental Grande do tipo do elemento alvo. Por exemplo, lançar esta magia numa fogueira ou tocha cria um elemental do fogo. Você pode criar elementais do ar, água, fogo e terra com essa magia. O elemental obedece a todos os seus comandos e pode funcionar como um parceiro mestre do tipo destruidor (cuja habilidade custa apenas 2 PM para ser usada) e mais um tipo entre os indicados na lista abaixo. O elemental auxilia apenas você e não conta em seu limite de parceiros.<br>Ar: assassino, perseguidor ou vigilante. Dano de eletricidade.<br>Água: ajudante, guardião ou médico. Dano de frio.<br>Fogo: atirador, combatente ou fortão. Dano de fogo.<br>Terra: combatente, guardião ou montaria. Dano de impacto.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `o elemental muda para Enorme e recebe dois tipos de aliado indicados no seu elemento.`
      }, 
      {
        addPM: 5,
        text: `você convoca um elemental de cada tipo. Quando lança a magia, você pode escolher se cada elemental vai auxiliar você ou um aliado no alcance. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.controlarAGravidade]: {
    nome: "Controlar a Gravidade",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Cubo de 12m de lado",
    duracao: "Sustentada",
    school: "Trans",
    description:
      `Você controla os efeitos da gravidade dentro da área. Ao lançar a magia, escolha um dos efeitos abaixo. Enquanto a magia durar, você pode gastar uma ação padrão para mudar o efeito.<br><i>Aumentar:</i> no início de seus turnos, cada criatura na área deve fazer um teste de Atletismo. Se passar, fica fatigada. Se falhar, fica  Fatigado e Caído.<br><i>Inverter:</i> inverte a gravidade da área, fazendo com que criaturas e objetos “caiam” para cima, atingindo o topo (12m) em uma rodada. Se um obstáculo (como um teto) impedir o movimento das criaturas, elas sofrem 1d6 pontos de dano de impacto para cada 1,5m de “queda”. Elas podem então se levantar e caminhar no obstáculo, de cabeça para baixo. Se não houver obstáculo, as criaturas e objetos ficam flutuando no topo da área afetada, sem poder sair do lugar. Criaturas voadoras podem se movimentar normalmente. Alguém adjacente a algo que possa agarrar tem direito a um teste de Reflexos para evitar a “queda”. A criatura deve permanecer presa pela duração da magia; caso contrário “cairá”.<br><i>Reduzir:</i> criaturas ou objetos livres Médios ou menores flutuam para cima e para baixo conforme sua vontade, com deslocamento de voo 6m. Criaturas na área recebem +20 em testes de Atletismo para escalar e saltar. Uma criatura levitando fica instável, sofrendo –2 em testes de ataque.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.controlarOClima]: {
    nome: "Controlar o Clima",
    execucao: "Completa",
    alcance: "2km",
    area: "Esfera de 2km de raio",
    duracao: "4d12 horas",
    school: "Trans",
    description:
      `Você muda o clima da área onde se encontra, podendo criar qualquer condição climática desejada, por exemplo: chuva, neve, ventos, névoas. Veja o Capítulo 6: O Mestre para os efeitos em jogo do clima.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o raio da área para 3km e duração para 1d4 dias. <i>Apenas Druidas.</i>`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.cupulaDeRepulsao]: {
    nome: "Cúpula de Repulsão",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    resistencia: "Vontade anula",
    school: "Abjur",
    description:
      `Uma cúpula de energia invisível o cerca, impedindo a aproximação de certas criaturas. Escolha um tipo de criatura (animais, espíritos, monstros...) ou uma raça de humanoides (elfos, goblins, minotauros..). Criaturas do grupo escolhido que tentem se aproximar a menos de 3m de você (ou seja, que tentem ficar adjacentes a você) devem fazer um teste de Vontade. Se falharem, não conseguem, gastam a ação e só podem tentar novamente na rodada seguinte. Isso impede ataques corpo a corpo, mas não ataques ou outros efeitos à distância. Se você tentar se aproximar além do limite de 3m, rompe a cúpula e a magia é dissipada.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `a cúpula impede criaturas de se aproximarem a menos de 4,5m de você (ou seja, deve haver dois quadrados entre você e as criaturas).`
      }, 
      {
        addPM: 5,
        text: `além do normal, criaturas afetadas também precisam fazer o teste de resistência se fizerem um ataque ou efeito à distância você. Se falharem, o efeito é desviado pela cúpula. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.desintegrar]: {
    nome: "Desintegrar",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura ou objeto",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Trans",
    description:
      `Você dispara um raio fino e esverdeado que causa 10d12 pontos de dano de essência. Se o alvo passar no teste de resistência, em vez disso sofre 2d12 pontos de dano.<br>Independentemente do resultado do teste de Fortitude, se os PV do alvo forem reduzidos a 0 ou menos, ele será completamente desintegrado, restando apenas pó.`,
    aprimoramentos: [
      {
        addPM: 4,
        text: `aumenta o dano total em +2d12 e o dano mínimo em +1d12.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.duplicataIlusoria]: {
    nome: "Duplicata Ilusória",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Cópia ilusória",
    duracao: "Cena",
    school: "Ilusão",
    description:
      `Você cria uma cópia ilusória semirreal de... você mesmo! Ela é idêntica em aparência, som e cheiro, mas é intangível. A cada turno, você escolhe se verá e ouvirá através da duplicata ou de seu corpo original. A cópia reproduz todas as suas ações, incluindo fala. Qualquer magia com alcance de toque ou maior que você lançar pode se originar da duplicata, em vez do seu corpo original. As magias afetam outros alvos normalmente, com a única diferença de se originarem da cópia, em vez de você. Se quiser que a duplicata faça algo diferente de você, você deve gastar uma ação de movimento. Qualquer criatura que interagir com a cópia tem direito a um teste de Vontade para perceber que é uma ilusão. As magias que se originam dela, no entanto, são reais. A cópia desaparece se sair do alcance.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `cria uma cópia adicional.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.explosaoCaleidoscopica]: {
    nome: "Explosão Caleidoscópica",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    area: "Esfera de 6m de raio",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Ilusão",
    description:
      `Esta magia cria uma forte explosão de luzes estroboscópicas e sons cacofônicos que desorientam as criaturas atingidas. O efeito que cada criatura sofre depende do ND dela.<br><i>ND 4 ou menor:</i> se falhar no teste de resistência, fica inconsciente. Se passar, fica atordoada por 1d4 rodadas e enjoada pelo resto da cena.<br><i>ND entre 5 e 9:</i> se falhar no teste de resistência, fica atordoada por 1d4 rodadas e enjoada pelo resto da cena. Se passar, fica atordoada por 1 rodada e enjoada por 1d4 rodadas.<br><i>ND 10 ou maior:</i> se falhar no teste de resistência, fica atordoada por 1 rodada e enjoada por 1d4 rodadas. Se passar, fica desprevenida e enjoada por 1 rodada.<br>Uma criatura só pode ser atordoada por esta magia uma vez por cena.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.formaEterea]: {
    nome: "Forma Etérea",
    execucao: "Completa",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    school: "Trans",
    description:
      `Você e todo o equipamento que está com você são transportados para o plano etéreo, que existe paralelamente ao plano material (o mundo físico). Na prática, é como ser transformado em um fantasma (mas você ainda é considerado uma criatura viva). Uma criatura etérea é invisível (pode alterar entre visível e invisível como ação livre), incorpórea e capaz de se mover em qualquer direção, inclusive para cima e para baixo. Ela enxerga o plano material, mas tudo parece cinza e insubstancial, reduzindo o alcance da visão e audição para 18m. Magias de Abjur e essência afetam criaturas etéreas, mas outras magias, não. Da mesma forma, uma criatura etérea não pode atacar nem lançar magias contra criaturas no plano material. Duas criaturas etéreas podem se afetar normalmente. Uma criatura afetada pode se materializar como uma ação de movimento, encerrando a magia. Uma criatura etérea que se materialize em um espaço ocupado é jogada para o espaço não ocupado mais próximo e sofre 1d6 pontos de dano de impacto para cada 1,5m de deslocamento.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `muda o alcance para toque e o alvo para até 5 criaturas voluntárias que estejam de mãos dadas. Depois que a magia é lançada, as criaturas podem soltar as mãos. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.guardiaoDivino]: {
    nome: "Guardião Divino",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Elemental de luz invocado",
    duracao: "Cena até ser descarregada",
    school: "Conv",
    description:
      `A magia invoca um elemental Pequeno, com a forma de um orbe feito de luz divina. A criatura é incorpórea, imune a dano e ilumina como uma tocha. O elemental tem 100 pontos de luz.Uma vez por rodada, durante o seu turno, o elemental pode se movimentar (deslocamento de voo 18m) e gastar quantos pontos de luz quiser para curar dano ou condições de criaturas em alcance curto, à taxa de 1 PV por 1 ponto de luz ou uma condição por 3 pontos de luz (entre abalado, apavorado, alquebrado, atordoado, cego, confuso, debilitado, enjoado, esmorecido, exausto, fascinado, fatigado, fraco, frustrado, ofuscado, pasmo, sangrando, surdo ou vulnerável). A magia é encerrada quando o elemental fica sem pontos de luz.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.libertacao]: {
    nome: "Libertação",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Abjur",
    description:
      `O alvo fica imune a efeitos de movimento e ignora qualquer efeito que impeça ou restrinja seu deslocamento. Por fim, pode usar habilidades que exigem liberdade de movimentos mesmo se estiver usando armadura ou escudo.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `além do normal, o alvo pode caminhar sobre a água ou outros líquidos com seu deslocamento normal. Entretanto, isso não protege contra qualquer efeito que o líquido possa causar (o alvo pode andar sobre lava, mas ainda vai sofrer dano).`
      }, 
      {
        addPM: 2,
        text: `além do normal, o alvo pode escolher 20 em todos os testes de Atletismo.`
      }, 
      {
        addPM: 2,
        text: `além do normal, o alvo pode escolher 20 em todos os testes de Acrobacia e pode fazer todas as manobras desta perícia mesmo sem treinamento.`
      }, 
      {
        addPM: 5,
        text: `muda o alcance para curto e o alvo para até 5 criaturas.`
      }, 
      {
        addPM: 5,
        text: `pode dissipar Aprisionamento.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.ligacaoSombria]: {
    nome: "Ligação Sombria",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    alvo: "1 criatura",
    duracao: "1 dia",
    resistencia: "Fortitude anula",
    school: "Necro",
    description:
      `Cria uma conexão entre seu corpo e o da criatura alvo, deixando uma marca idêntica na pele de ambos. Enquanto a magia durar, sempre que você sofrer qualquer dano ou condição, o alvo desta magia deve fazer um teste de Fortitude; se falhar, sofre o mesmo dano que você ou adquire a mesma condição. A magia termina se o alvo chegar a 0 pontos de vida.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `a magia não termina se o alvo chegar a 0 PV (o que significa que dano causado por essa magia pode matá-lo).`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.mantoDoCruzado]: {
    nome: "Manto do Cruzado",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    school: "Evoc",
    description:
      `Você invoca o poder de sua divindade na forma de um manto de energia que reveste seu corpo. Esta magia tem duas versões. Você escolhe qual versão pode lançar quando aprende esta magia. Ela não pode ser mudada.<br><i>Manto de Luz:</i> um manto dourado e luminoso. No início de cada um de seus turnos, você e todos os seus aliados em alcance curto recuperam 2d8 PV. Você recebe imunidade a dano de trevas e seus ataques corpo a corpo causam +2d8 pontos de dano de luz.<br><i>Manto de Trevas:</i> um manto negro como a noite. No início de cada um de seus turnos, todos os inimigos em alcance curto sofrem 4d8 pontos de dano de trevas. Você cura metade de todo o dano causado pela magia.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.maoPoderosaDeTalude]: {
    nome: "Mão Poderosa de Talude",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Mão gigante de energia",
    duracao: "Sustentada",
    school: "Conv",
    description:
      `Esta magia cria uma mão flutuante de tamanho Grande que sempre se posiciona entre você e um oponente a sua escolha. A mão fornece cobertura leve (+5 na Defesa) contra esse oponente. Nada é capaz de enganar a mão — coisas como escuridão, invisibilidade, metamorfose e disfarces mundanos não a impedem de protegê-lo. A mão tem Defesa 20 e PV e resistências iguais aos seus. Com uma ação de movimento, você pode comandar a mão para que o proteja de outro oponente ou para que realize uma das ações a seguir.<br><i>Agarrar:</i> a mão usa uma manobra agarrar contra o oponente, usando o seu Misticismo com um bônus adicional de +10. A mão mantém o oponente agarrado, mas não causa dano.<br><i>Esmagar:</i> a mão esmaga um oponente agarrado, causando 2d6+10 pontos de dano de impacto.<br><i>Empurrar:</i> a mão afasta o oponente (manobra empurrar usando o seu Misticismo com um bônus adicional de +10). A mão acompanha o oponente para empurrá-lo o máximo que conseguir, dentro do alcance da magia.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o dano de impacto em +1d6+5.`
      }, 
      {
        addPM: 5,
        text: `muda o bônus adicional em Misticismo para +20. Requer 5º círculo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.marionete]: {
    nome: "Marionete",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura",
    duracao: "Sustentada",
    resistencia: "Fortitude anula",
    school: "Encan",
    description:
      `Esta magia manipula o sistema nervoso do alvo. Ao sofrer a magia, e no início de cada um de seus turnos, a vítima faz um teste de Fortitude. Se passar, a magia é anulada. Se falhar, todas as suas ações físicas naquele turno estarão sob controle do conjurador. A vítima ainda tem consciência de tudo que acontece à sua volta, podendo ver, ouvir e até falar com certo esforço (mas não para lançar magias). Contudo, seu corpo realiza apenas os movimentos que o conjurador deseja. A vítima pode ser manipulada para se movimentar, lutar, usar habilidades de combate... Enfim, qualquer coisa de que seja fisicamente capaz.<br>Você precisa de linha de efeito para controlar a vítima. Se perder o contato, não poderá controlá-la — mas ela estará paralisada até que o conjurador recupere o controle ou a magia termine.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.muralhaDeOssos]: {
    nome: "Muralha de Ossos",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Muro de ossos",
    duracao: "Cena",
    school: "Necro",
    description:
      `Uma parede de ossos se eleva da terra. A parede tem 15m de comprimento, 9m de altura e 1,5m de espessura. Ela pode ter qualquer forma — não precisa ser uma linha reta —, mas sua base precisa estar sempre tocando o solo. Quando a parede surge, criaturas na área ocupada ou adjacentes sofrem 4d8 pontos de dano de corte e precisam fazer um teste de Reflexos para não ficarem presas no emaranhado de ossos. Uma criatura presa dessa maneira fica Agarrado, e pode usar uma ação padrão para fazer um teste de Atletismo (CD da magia) para se soltar. Se passar no teste, sai da muralha para um dos lados adjacentes. Se falhar, sofre 4d8 pontos de dano de corte.<br>É possível destruir o muro para atravessá-lo ou libertar uma criatura agarrada. Cada trecho de 3m do muro tem Defesa 8, 40 PV e redução de corte, frio e perfuração 10. Também é possível escalar a parede. Isso exige um teste de Atletismo (CD da magia) e causa 4d8 pontos de dano de corte para cada 3m escalados.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o comprimento em +15m e altura em +3m.`
      }, 
      {
        addPM: 5,
        text: `o muro é feito de uma massa de esqueletos animados. Sempre que uma criatura iniciar seu turno adjacente ou escalando a muralha, deve fazer um teste de Reflexos. Se falhar fica agarrada, sofrendo os feitos normais de estar agarrada pela magia.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.premonicao]: {
    nome: "Premonição",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Vislumbres do futuro permitem que você reavalie suas ações. Uma vez por rodada, você pode rolar novamente um teste recém realizado, mas deve aceitar o resultado da nova rolagem.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `muda a execução para reação, o alcance para curto, o alvo para 1 criatura e a duração para instantânea. Esta magia só pode ser usada em uma criatura que tenha acabado de fazer um teste. Obriga a criatura a fazer uma nova rolagem de dados e aceitar o novo resultado, seja ele um sucesso ou falha. Criaturas involuntárias têm direito a um teste de Vontade para negar o efeito.`
      }, 
      {
        addPM: 10,
        text: `muda a duração para 1 dia.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.raioPolar]: {
    nome: "Raio Polar",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Evoc",
    description:
      `Você dispara um raio azul esbranquiçado de gelo e ar congelante. O alvo sofre 10d8 pontos de dano de frio e fica preso em um bloco de gelo (Paralisado). Se passar no teste de resistência, sofre metade do dano e, em vez de paralisado, fica Lento por uma rodada.<br>É possível quebrar o gelo para libertar uma criatura presa: o bloco tem 20 PV, resistência a dano 10 e é vulnerável a fogo. Uma criatura presa pode usar uma ação completa para fazer um teste de Atletismo (com a mesma CD para resistir à magia) e tentar se libertar do gelo; cada vez que passar no teste causa 10 pontos de dano ao bloco, ignorando a RD.`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o dano em +2d8.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para área de esfera de 6m de raio. Em vez de um raio, você dispara uma esfera de gelo que explode, causando o efeito da magia em todas as criaturas na área.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.relampagoFlamejanteDeReynard]: {
    nome: "Relâmpago Flamejante de Reynard",
    execucao: "2 rodadas",
    alcance: "Médio (30m 20q)",
    alvo: "Bolas de fogo e relâmpagos",
    duracao: "Sustentada",
    resistencia: "Reflexos reduz à metade",
    school: "Evoc",
    description:
      `Esta é uma magia poderosa, desenvolvida pelo metódico e impassível arquimago Reynard. Você invoca as energias elementais do fogo e do relâmpago, fazendo com que uma de suas mãos fique em chamas e a outra mão eletrificada. Pela duração da magia, você pode gastar uma ação de movimento para disparar uma bola de fogo (10d6 pontos de dano de fogo numa esfera com 6m de raio) ou um relâmpago (10d6 pontos de dano de eletricidade numa linha). Você também pode, como uma ação padrão, usar as duas mãos num ataque de energia mista (20d12 pontos de dano, metade de fogo e metade de eletricidade, numa esfera com 9m de raio). Você precisa estar com as duas mãos livres para invocar o efeito misto e isso consome toda a energia da magia, terminando-a imediatamente. Por se tratar de um ritual complexo, o tempo de execução dessa magia não pode ser reduzido.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano das rajadas em +1d6 e o dano da rajada mista em +2d12.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.sonho]: {
    nome: "Sonho",
    execucao: "10 minutos",
    alcance: "Ilimitado (veja texto)",
    alvo: "1 criatura viva",
    duracao: "Veja texto",
    school: "Adiv",
    description:
      `Você entra nos sonhos de uma criatura. Uma vez lá, pode conversar com ela até que ela acorde. Se o alvo não estiver dormindo quando você lançar a magia, você pode permanecer em transe até que ele adormeça. Durante o transe, você fica Indefeso e sem consciência dos arredores. Você pode sair do transe quando quiser, mas a magia termina.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `transforma o sonho do alvo em um pesadelo. A vítima deve fazer um teste de Vontade. Se falhar, não recupera PV ou PM pela noite, sofre 1d10 pontos de dano de trevas e acorda fatigada. A vítima recebe bônus ou penalidades em seu teste de resistência, dependendo do conhecimento que você tiver dela. Use os mesmos modificadores da magia Vidência.`
      }, 
      {
        addPM: 1,
        text: `aumenta o número de alvos em +1. Todos os alvos compartilham um mesmo sonho (ou pesadelo) entre si e com você.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.talhoInvisivelDeEdauros]: {
    nome: "Talho Invisível de Edauros",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Cone de 9m",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Evoc",
    description:
      `Esta magia cruel foi desenvolvida pelo mago de combate Edauros, quando ainda era um bípede. Você faz um gesto rápido e dispara uma lâmina de ar em alta velocidade. Criaturas na área sofrem 10d8 pontos de dano de corte e ficam sangrando. Alvos que passem no teste de resistência sofrem metade do dano e não ficam sangrando.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +2d8.`
      }, 
      {
        addPM: 2,
        text: `muda o alvo para você, a duração para sustentada e o efeito para uma vez por rodada, como uma ação de movimento, você pode disparar uma lâmina de ar contra um alvo em alcance médio, causando 6d8 pontos de dano de corte (Fortitude reduz à metade).`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.terremoto]: {
    nome: "Terremoto",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    area: "Esfera de 30m de raio",
    duracao: "1 rodada",
    resistencia: "Veja texto",
    school: "Evoc",
    description:
      `Esta magia cria um tremor de terra que rasga o solo. O terremoto dura uma rodada, durante a qual criaturas sobre o solo ficam atordoadas. Barreiras físicas não interrompem a área de Terremoto. O efeito exato depende do terreno (veja a seguir). <br><i>Caverna ou subterrâneo:</i> a magia derruba o teto, causando 12d6 pontos de dano de impacto e agarrando (Agarrado) todas as criaturas na área. Um teste de Reflexos reduz o dano à metade e evita a condição. <i><br>Construção:</i> todas as estruturas na área sofrem 200 pontos de dano de impacto, o suficiente para derrubar construções de madeira ou alvenaria simples, mas não de alvenaria reforçada. Criaturas em uma construção que desmorone sofrem o mesmo efeito de criaturas em uma caverna (veja acima).<i><br>Espaço aberto:</i> fendas se abrem no chão. Cada criatura na área precisa rolar um dado; em um resultado ímpar, uma fenda se abre sob ela e ela precisa fazer um teste de Reflexos; se falhar, cai na fenda. A criatura pode escapar gastando uma ação completa e passando em um teste de Atletismo (CD igual à da magia). No início do seu próximo turno as fendas se fecham, matando todos que estejam dentro delas.<br><i>Penhascos:</i> o penhasco racha, criando um desmoronamento que percorre uma distância horizontal igual à distância da queda. Por exemplo, um penhasco com 30m de altura desmorona em uma área de 30m de comprimento além da base. Qualquer criatura no caminho sofre 12d6 pontos de dano de impacto e fica agarrada. Um teste de Reflexos reduz o dano à metade e evita ficar agarrado.<br><i>Rio, lago ou pântano:</i> fissuras se abrem sob a água, drenando-a e formando um lamaçal. Criaturas na área precisam fazer um teste de Reflexos para não afundarem na lama e ficarem agarradas. No início do seu próximo turno as fissuras se fecham, possivelmente afogando as criaturas que ficaram agarradas.<br>Criaturas agarradas (efeito possível decaverna, construção, penhasco e rio, lago ou pântano) sofrem 1d6 pontos de dano por rodada até serem libertadas, o que exige uma ação completa e um teste de Atletismo (por parte da própria criatura ou de um aliado adjacente).`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.viagemPlanar]: {
    nome: "Viagem Planar",
    execucao: "Completa",
    alcance: "Toque",
    alvo: "Pessoal",
    duracao: "Instantânea",
    school: "Conv",
    description:
      `Você viaja instantaneamente para outro plano da Criação. Lá, você chega de 10 a 1.000km do destino pretendido (role 1d100 e multiplique por 10km).<br><i>Componente material:</i> um bastão de metal precioso em forma de forquilha (no valor de T$ 1.000). O tipo de metal determina para qual plano de existência você será enviado. Os metais que levam a dimensões específicas podem ser difíceis de encontrar, de acordo com o mestre.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alvo para até cinco criaturas voluntárias que você esteja tocando.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.visaoDaVerdade]: {
    nome: "Visão da Verdade",
    execucao: "Movimento",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Adiv",
    description:
      `Você enxerga a forma real das coisas. Você pode ver através de camuflagem e escuridão (normais e mágicas), assim como efeitos de ilusão e Trans (enxergando a verdade como formas translúcidas ou sobrepostas).`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `muda o alcance para toque e o alvo para 1 criatura.`
      }, 
      {
        addPM: 1,
        text: `além do normal, o alvo fica com sentidos apurados; ele recebe +10 em todos os testes de Percepção.`
      }, 
      {
        addPM: 2,
        text: `além do normal, o alvo escuta falsidades; ele recebe +10 em todos os testes de Intuição.`
      }, 
      {
        addPM: 4,
        text: `além do normal, o alvo enxerga através de paredes e barreiras com 30cm de espessura ou menos (as paredes e barreiras parecem translúcidas).`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle4Names.transformacaoEmDragao]: {
    nome: "Transformação em Dragão",
    execucao: "Completa",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    school: "Trans",
    description:
      `Essa magia invoca o poder de um dragão, causando mutações no conjurador que o tornam semelhante a uma criatura dracônica. Você recebe +2 em Força, Constituição, Inteligência e Carisma (esse aumento não oferece PV, PM ou perícias adicionais), +5 na Defesa, e redução 30 contra o elemento do sopro do dragão do qual você utilizou o componente material. Uma vez por rodada, você pode gastar uma ação padrão para exalar um sopro que causa 8d6+8 pontos de dano do elemento correspondente em um cone de 9m (Reflexos reduz à metade).<br><i>Componente Material:</i> uma peça de couro de dragão ou uma escama de dragão no valor de T$ 1000.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano do sopro em +1d6+1.`
      }, 
      {
        addPM: 2,
        text: `aumenta o bônus na Defesa em +1.`
      }, 
      {
        addPM: 6,
        text: `além do normal, asas de couro brotam de suas costas. Você recebe deslocamento de voo 18m.`
      }, 
      {
        addPM: 3,
        text: `você recebe uma arma natural de mordida (1d6, crítico x2, corte). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida. Se já possuir uma mordida, em vez disso seu dano aumenta em dois passos.`
      }, 
      {
        addPM: 3,
        text: `o bônus em atributos se torna +4.`
      }, 
    ],
    publicacao: `Ameaças de Arton 1.0`,
  },
  [spellsCircle4Names.bencaoDaDragoaRainha]: {
    nome: "Bênção da Dragoa Rainha",
    execucao: "Completa",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    school: "Trans",
    description:
      `Sua pele se torna branca como a neve e você manifesta um par de asas e uma coroa feitas de gelo cristalino que flutuam rentes ao seu corpo. Você recebe deslocamento de voo 18m, imunidade a fogo e frio e resistência a dano não mágico 15. Suas magias que causam dano de frio têm seu dano maximizado, mas você fica impedido de lançar magias que causam dano de fogo.`,
    aprimoramentos: [
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle4Names.pantanoVitriolico]: {
    nome: "Pântano Vitriólico",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Círculo de 15m de raio",
    duracao: "Cena",
    resistencia: "Reflexos reduz à metade",
    school: "Trans",
    description:
      `Você transforma o solo da área em um lodo viscoso ácido e pegajoso. Criaturas na área quando a magia é lançada sofrem 5d8 pontos de dano de ácido e ficam enredadas; passar no teste de resistência reduz o dano pela metade e evita a condição. Uma vítima presa pode usar uma ação padrão para fazer um teste de Atletismo (CD igual à da magia). Se passar, se liberta. Uma criatura sofre esse efeito novamente quando termina seu turno dentro da área afetada. O espaço ocupado pelo pântano é considerado terreno difícil e deslocar-se dentro da área causa 1d8 pontos de dano de ácido para cada 1,5m percorridos.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano inicial e o dano do deslocamento em +1d8`
      }, 
      {
        addPM: 5,
        text: `além do normal, o pântano exala gases com efeitos alucinógenos. Criaturas que falham no teste de Fortitude ficam confusas por uma rodada.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle4Names.raioDePlasma]: {
    nome: "Raio de Plasma",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    area: "Linha",
    duracao: "Instantânea",
    resistencia: "Fortitude reduz à metade",
    school: "Evoc",
    description:
      `Você dispara uma rajada luminosa superaquecida que causa 10d8 pontos de dano de fogo em todas as criaturas e objetos livres na área. O raio é capaz de derreter qualquer barreira física, seja de madeira, pedra ou metal, atingindo mesmo alvos fora de sua linha de visão.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +2d8.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para pessoal, a área para “Efeito: espada de plasma”, a duração para sustentada e a resistência para “Reflexos reduz à metade”. Ao invés do normal, você condensa a rajada na forma de uma espada de plasma que emite luz (alcance curto) e calor intensos. Você pode usar uma ação padrão para atingir um alvo adjacente com a espada, que causa 10d8 pontos de dano de fogo e ignora a resistência a dano de objetos. Sua mão que “empunha” a espada é considerada ocupada.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
  [spellsCircle4Names.velocidadeDoRelampago]: {
    nome: "Velocidade do Relâmpago",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Sustentada",
    resistencia: "Reflexos reduz à metade",
    school: "Trans",
    description:
      `Seus olhos passam a emanar luz branca e minúsculos raios de eletricidade. Enquanto esta magia durar, você pode usar uma ação de movimento para se teletransportar até 12m em linha reta para qualquer direção, deixando um “rastro” de eletricidade no caminho. Criaturas que você atravessar sofrem 6d8 pontos de dano de eletricidade.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o dano em +2d8.`
      }, 
      {
        addPM: 5,
        text: `muda o deslocamento do teletransporte para 15m e você pode fazer curvas durante o movimento. Entretanto, você não pode passar duas vezes pelo mesmo espaço em cada ação de movimento.`
      }, 
    ],
    publicacao: `Dragão Brasil`,
  },
};

export const spellsCircle5: Record<spellsCircle5Names, Spell> = {
  [spellsCircle5Names.alterarDestino]: {
    nome: "Alterar Destino",
    execucao: "Reação",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Instantânea",
    school: "Abjur",
    description:
      `Sua mente visualiza todas as possibilidades de um evento, permitindo a você escolher o melhor curso de ação. Você pode rolar novamente um teste de resistência com um bônus de +10 ou um inimigo deve rolar novamente um ataque contra você com uma penalidade de –10`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.aprisionamento]: {
    nome: "Aprisionamento",
    execucao: "Completa",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Permanente",
    resistencia: "Vontade anula",
    school: "Abjur",
    description:
      `Você cria uma prisão mágica para aprisionar uma criatura. Se falhar no testede resistência, o alvo sofre o efeito da magia; se passar, fica imune a esta magia por uma semana. Enquanto estiver aprisionada, a criatura não precisa respirar e alimentar-se, e não envelhece. Magias de Adiv não conseguem localizar ou perceber o alvo. Ao lançar a magia, você escolhe uma das seguintes formas de prisão. O componente material varia, mas todos custam T$ 1.000.<br><i>Acorrentamento:</i> o alvo é preso por correntes firmemente enraizadas no chão, que o mantém no lugar. O alvo fica paralisado e não pode se mover ou ser movido por qualquer meio. <i>Componente material:</i> uma fina corrente de mitral.<br><i>Contenção Mínima:</i> o alvo diminui para 2 cm de altura e é preso dentro de uma pedra preciosa ou objeto semelhante. Luz passa através da pedra, permitindo que o alvo veja o lado de fora e seja visto, mas nada mais pode passar, nem por meio de teletransporte ou viagem planar. A pedra não pode ser quebrada enquanto o alvo estiver dentro. <i>Componente material:</i> uma pedra preciosa, como um diamante ou rubi.<br><i>Prisão Dimensional:</i> o alvo é transportado para um semiplano protegido contra teletransporte e viagens planares. Pode ser um labirinto, uma gaiola, uma torre ou qualquer estrutura ou área confinada e pequena a sua escolha. <i>Componente material:</i> uma representação em miniatura da prisão, feita de jade.<br><i>Sepultamento:</i> o alvo é sepultado nas profundezas da terra, em uma esfera mágica. Nada pode destruir ou atravessar a esfera, nem mesmo teletransporte ou viagens planares. <i>Componente material:</i> um pequeno orbe de adamante.<br><i>Sono Eterno:</i> o alvo adormece e não pode ser acordado. <i>Componente material:</i> fruta preparada com ervas soníferas raras.<br>Quando a magia é lançada, você deve especificar uma condição que fará com que ela termine e solte o alvo. A condição pode ser tão específica ou elaborada quanto você quiser, mas deve ser possível de acontecer. As condições podem se basear no nome, identidade ou divindade padroeira de uma criatura, ou em ações ou qualidades observáveis, mas nunca em estatísticas intangíveis, como nível, classe ou pontos de vida. O mestre tem a palavra final sobre se uma condição é válida ou não.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.auraDivina]: {
    nome: "Aura Divina",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Esfera de 9m de raio",
    duracao: "Cena",
    resistencia: "Vontade parcial",
    school: "Abjur",
    description:
      `Você se torna um conduíte da energia de sua divindade, emanando uma aura brilhante. Você e aliados devotos da mesma divindade ficam imunes a Encan e recebem +10 na Defesa e em testes de resistência. Aliados não devotos da mesma divindade recebem +5 na Defesa e em testes de resistência.<br>Além disso, inimigos que entrem na área afetada devem fazer um teste de Vontade; em caso de falha, recebem uma condição a sua escolha entre Esmorecido, Debilitado ou Lento até o fim da cena. O teste deve ser refeito cada vez que a criatura entrar novamente na área.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta os bônus na Defesa e em testes de resistência em +1.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.barragemElementalDeVectorius]: {
    nome: "Barragem elemental de Vectorius",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    alvo: "4 esferas elementais",
    duracao: "Instantânea",
    resistencia: "Reflexos parcial",
    school: "Evoc",
    description:
      `Criada pelo arquimago Vectorius, esta magia produz quatro esferas, de ácido, eletricidade, fogo e frio, que voam até um ponto a sua escolha. Quando atingem o ponto escolhido, explodem causando 6d6 pontos de dano de seu respectivo tipo numa área com 12m de raio. Um teste de Reflexos reduz o dano à metade. Você pode mirar cada esfera em uma criatura ou ponto dife- rente. Uma criatura ao alcance da explosão de mais de uma esfera deve fazer um teste de resistência para cada uma. Além disso, as esferas causam os seguintes efeitos em criaturas que falharem em seus testes de resistência:<br>• <i>Ácido:</i> Vulnerável até o fim da cena.<br>• <i>Elétrica:</i> Atordoado por uma rodada. (apenas uma vez por cena).<br>• <i>Fogo:</i> Em Chamas.<br>• <i>Frio:</i> Lentoaté o fim da cena.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `aumenta o dano de cada esfera em +2d6.`
      }, 
      {
        addPM: 5,
        text: `muda o tipo de dano de todas as esferas para essência (mas elas ainda causam os outros efeitos como se seu tipo de dano não mudasse).`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.buracoNegro]: {
    nome: "Buraco Negro",
    execucao: "Completa",
    alcance: "Longo (90m 60q)",
    alvo: "Buraco negro",
    duracao: "3 rodadas",
    resistencia: "Fortitude parcial",
    school: "Abjur",
    description:
      `Esta magia cria um vácuo capaz de sugar tudo nas proximidades. Escolha um espaço desocupado para o buraco negro. No início de cada um de seus três turnos seguintes, todas as criaturas a até alcance longo do buraco negro, incluindo você, devem fazer um teste de Fortitude. Em caso de falha, ficam caídas e são puxadas 30m na direção do buraco. Objetos soltos também são puxados. Criaturas podem gastar uma ação de movimento para se segurar em algum objeto fixo, recebendo +2 em seus testes de resistência.<br>Criaturas e objetos que iniciem seu turno no espaço do buraco negro devem gastar uma ação de movimento e fazer um teste de Fortitude. Se passarem, podem escapar se arrastando (deslocamento de 1,5m) para longe dele. Se falharem, perdem a ação (mas podem gastar outra para tentar novamente). Se terminarem seu turno no espaço do buraco negro, são sugadas, desaparecendo para sempre.<br>Não se conhece o destino das coisas sugadas pelo buraco negro. Alguns estudiosos sugerem que são enviadas para outros mundos — provavelmente o reino da deusa das Trevas.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `muda o efeito para que você não seja afetado.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.chuvaDeMeteoros]: {
    nome: "Chuva de Meteoros",
    execucao: "Completa",
    alcance: "Longo (90m 60q)",
    area: "Quadrado de 18m de lado",
    duracao: "Instantânea",
    resistencia: "Reflexos parcial",
    school: "Conv",
    description:
      `Meteoros caem dos céus, devastando a área afetada. Criaturas na área sofrem 15d6 pontos de dano de impacto, 15d6 pontos de dano de fogo e ficam Caído e presas sob os escombros (Agarrado).<br>Uma criatura que passe no teste de resistência sofre metade do dano total e não fica caída e agarrada. Uma criatura agarrada pode escapar gastando uma ação padrão e passando em um teste de Atletismo (CD da magia). Toda a área afetada fica coberta de escombros, sendo considerada terreno difícil, e imersa numa nuvem de poeira (camuflagem leve). Esta magia só pode ser utilizada a céu aberto.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `aumenta o número de meteoros que atingem a área, o que aumenta o dano em +2d6 de impacto e +2d6 de fogo.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.controlarOTempo]: {
    nome: "Controlar o Tempo",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "Veja texto",
    duracao: "Veja texto",
    school: "Trans",
    description:
      `Aquele que controla o tempo controla o mundo. Escolha um dos efeitos a seguir.<br><i>Congelar o tempo:</i> você gera uma bolha do seu tamanho na qual o tempo passa mais lentamente. Para outras criaturas, a bolha surge e desaparece instantaneamente, mas, para você, ela dura 3 rodadas, durante as quais você pode agir e não é afetado por efeitos contínuos (como chamas). Porém, durante essas 3 rodadas, você e quaisquer efeitos que você gerar não podem sair da área que você ocupava quando lançou esta magia. Efeitos de área com duração maior que a da bolha voltam a agir normalmente quando ela termina.<br><i>Saltar no tempo:</i> você e até 5 criaturas voluntárias são transportadas de 1 a 24 horas para o futuro, desaparecendo com um brilho. Vocês ressurgem no mesmo lugar, com a mesma velocidade e orientação; do seu ponto de vista, nenhum tempo se passou. Se um objeto sólido agora ocupa o espaço de uma criatura, ela ressurge na área vazia mais próxima.<br><i>Voltar no tempo:</i> você revive os últimos segundos. Todas as ações da rodada anterior são desfeitas (incluindo perda de PV e PM — exceto os gastos nesta magia). Tudo retorna à posição em que estava no início do seu turno na última rodada e você é o único que sabe o que acontecerá. Outros personagens devem repetir as mesmas ações — exceto se você fizer algo a respeito (como avisar seus aliados sobre o que vai acontecer). Você só pode reviver uma mesma rodada uma vez.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.deflagracaoDeMana]: {
    nome: "Deflagração de Mana",
    execucao: "Completa",
    alcance: "Pessoal",
    area: "Esfera de 15m de raio",
    duracao: "Instantânea",
    resistencia: "Fortitude parcial",
    school: "Evoc",
    description:
      `Após concentrar seu mana, você emana energia, como uma estrela em plena terra. Todas as criaturas na área sofrem 150 pontos de dano de essência e todos os itens mágicos (exceto artefatos) tornam-se mundanos. Você não é afetado pela magia. Alvos que passem no teste de Fortitude sofrem metade do dano e seus itens mágicos voltam a funcionar após um dia.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em 10.`
      }, 
      {
        addPM: 5,
        text: `afeta apenas criaturas a sua escolha.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.desejo]: {
    nome: "Desejo",
    execucao: "Completa",
    alcance: "Veja texto",
    alvo: "Veja texto",
    duracao: "Veja texto",
    resistencia: "Veja texto",
    school: "Trans",
    description:
      `Esta é a mais poderosa das magias arcanas, permitindo alterar a realidade a seu bel-prazer. Você pode:<br>• Dissipar os efeitos de qualquer magia de 4º círculo ou menor.<br>• Transportar até 10 criaturas voluntárias em alcance longo para qualquer outro local, em qualquer plano.<br>• Desfazer um acontecimento recente. A magia permite que um teste realizado por uma criatura em alcance longo na última rodada seja realizado novamente. Por exemplo, se um aliado morreu na última rodada devido ao ataque de um inimigo, você pode obrigar o inimigo a refazer esse ataque.<br>Você pode desejar por algo ainda mais poderoso. Nesse caso, a magia requer o sacrifício de 2 PM e pode fazer coisas como:<br>• Criar um item mundano de até T$ 30.000.<br>• Duplicar os efeitos de qualquer magia de até 4º círculo. Caso a magia precise de um componente material para ser lançada, ainda é necessário providenciar o componente.<br>• Aumentar um atributo de uma criatura em +1. Cada atributo só pode ser aumentado uma vez com Desejo.<br>Desejo pode gerar efeitos ainda mais poderosos, mas cuidado! Desejar a fortuna de um rei pode transportá-lo para a sala de tesouro real, onde você poderá ser preso ou morto; desejar ser imortal pode transformá-lo em morto-vivo, e assim por diante. Qualquer efeito que não se encaixe na lista acima deve ser decidido pelo mestre.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.engenhoDeMana]: {
    nome: "Engenho de Mana",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Disco de energia com 1,5m de diâmetro",
    duracao: "Sustentada",
    school: "Abjur",
    description:
      `Você cria um disco de energia que lembra uma roda de engenho e flutua no ponto em que foi conjurado. O disco é imune a dano, não pode ser movido e faz uma contramágica automática contra qualquer magia lançada em alcance médio dele (exceto as suas), usando seu teste de Misticismo. Caso vença o teste, o engenho não só anula a magia como absorve os PM usados para lançá-la, acumulando PM temporários. No seu turno, se estiver ao alcance do disco, você pode gastar PM nele para lançar magias.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `em vez de flutuar no ponto em que foi conjurado, o disco flutua atrás de você, mantendo-se sempre adjacente.`
      }, 
      {
        addPM: 4,
        text: `muda a duração para 1 dia.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.furiaDoPanteao]: {
    nome: "Fúria do Panteão",
    execucao: "Completa",
    alcance: "Longo (90m 60q)",
    area: "Cubo de 90m de lado",
    duracao: "Sustentada",
    resistencia: "Veja texto",
    school: "Evoc",
    description:
      `Você cria uma nuvem de tempestade violenta. Os ventos tornam ataques à distância impossíveis e fazem a área contar como condição terrível para lançar magia. Além disso, inimigos na área têm a visibilidade reduzida (como a magia Névoa). Uma vez por turno, você pode gastar uma ação de movimento para gerar um dos efeitos a seguir.<br><i>Nevasca:</i> inimigos na área sofrem 10d6 pontos de dano de frio (Fortitude reduz à metade). A área fica coberta de neve, virando terreno difícil até o fim da cena ou até você usar siroco.<br><i>Raios:</i> até 6 inimigos a sua escolha na área sofrem 10d8 pontos de dano de  eletricidade (Reflexos reduz à metade).<br><i>Siroco:</i> transforma a chuva em uma tempestade de areia escaldante. Inimigos na área sofrem 10d6 pontos de dano (metade corte, metade fogo) e ficam Sangrando (Fortitude reduz o dano à metade e evita a condição).<br><i>Trovões:</i> inimigos sofrem 10d6 pontos de dano de impacto e ficam Desprevenido por uma rodada (Fortitude reduz o dano à metade e evita a condição).`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.intervencaoDivina]: {
    nome: "Intervenção Divina",
    execucao: "Completa",
    alcance: "Veja texto",
    alvo: "Veja texto",
    resistencia: "Veja texto",
    school: "Conv",
    description:
      `Você pede a sua divindade para interceder diretamente. Você pode:<br>• Curar todos os PV e condições de até 10 criaturas em alcance longo (este efeito cura mortos-vivos, em vez de causar dano).<br>• Dissipar os efeitos de qualquer magia de 4º círculo ou menor. <br>Você pode implorar por algo ainda mais poderoso. Nesse caso, a magia requer o sacrifício de 2 PM e pode fazer coisas como:<br>• Criar um item mundano de até T$ 30.000.<br>• Duplicar os efeitos de qualquer magia de até 4º círculo. Caso a magia precise de um componente material para ser lançada, ainda é necessário providenciar o componente.<br>• Proteger uma cidade de um desastre, como uma erupção vulcânica, enchente ou terremoto.<br>• Ressuscitar uma criatura em alcance longo que tenha morrido há até uma rodada. A criatura acorda com 1 PV.<br>• Qualquer outra coisa que o mestre autorize, conforme os desejos e objetivos da divindade do conjurador.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.invulnerabilidade]: {
    nome: "Invulnerabilidade",
    execucao: "Padrão",
    alcance: "Pessoal",
    alvo: "Você",
    duracao: "Cena",
    school: "Abjur",
    description:
      `Esta magia cria uma barreira mágica impenetrável que protege você contra efeitos nocivos mentais ou físicos, a sua escolha.Proteção mental: você fica imune às condições abalado, alquebrado, apavorado, atordoado, confuso, esmorecido, fascinado, frustrado e pasmo, além de efeitos de Encan e ilusão.Proteção física: você fica imune às condições atordoado, cego, debilitado, enjoado, envenenado, exausto, fatigado, fraco, lento, ofuscado e paralisado, além de acertos críticos, ataques furtivos e doenças.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `muda o alcance para curto e o alvo para 1 criatura.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.lagrimasDeWynna]: {
    nome: "Lágrimas de Wynna",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Vontade parcial",
    school: "Abjur",
    description:
      `Se falhar no teste de resistência, o alvo perde a habilidade de lançar magias arcanas até o fim da cena. Se passar, perde a habilidade por uma rodada.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda a área para esfera de 6m de raio e o alvo para criaturas escolhidas.`
      }, 
      {
        addPM: 5,
        text: `muda a execução para 1 dia e adiciona custo adicional (sacrifício de 1 PM). O alvo da magia precisa ser mantido em alcance curto do conjurador durante toda a execução. Ao término, faz um teste de Vontade. Se falhar, perde a habilidade de lançar magias arcanas permanentemente. Se passar, resiste, mas ainda pode ser alvo da magia no dia seguinte. Nenhum poder mortal é capaz de reverter essa perda. Os clérigos da deusa da Magia dizem que a deusa chora cada vez que este ritual é realizado.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.legiao]: {
    nome: "Legião",
    execucao: "Padrão",
    alcance: "Médio (30m 20q)",
    alvo: "Até 10 criaturas na área",
    duracao: "Sustentada",
    resistencia: "Vontade parcial",
    school: "Encan",
    description:
      `Você domina a mente dos alvos. Os alvos obedecem cegamente a seus comandos, exceto ordens claramente suicidas. Um alvo tem direito a um teste no final de cada um de seus turnos para se livrar do efeito. Alvos que passarem no teste ficam Abalado por 1 rodada enquanto recuperam a consciência.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o número de alvos em +1.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.mataDragao]: {
    nome: "Mata-Dragão",
    execucao: "2 rodadas",
    alcance: "Pessoal",
    area: "Cone de 30m",
    duracao: "Instantânea",
    resistencia: "Reflexos reduz à metade",
    school: "Evoc",
    description:
      `Esta é uma das mais poderosas magias de destruição existentes. Após entoar longos cânticos, o conjurador dispara uma carga de energia que varre uma enorme área à sua frente, causando 20d12 pontos de dano de essência em todas as criaturas, construções e objetos livres atingidos.  Sempre que rola um resultado 12 em um dado de dano, a magia causa +1d12 pontos de dano. Apesar de seu poder destrutivo, esta magia é lenta, tornando seu uso difícil em combate.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta o dano em 1d12.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.palavraPrimordial]: {
    nome: "Palavra Primordial",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura com menos níveis que você",
    duracao: "Instantânea ou veja texto",
    resistencia: "Vontade parcial",
    school: "Encan",
    description:
      `Você pronuncia uma palavra do idioma primordial da Criação, que causa um dos efeitos abaixo, a sua escolha.Atordoar: a criatura fica atordoada por 1d4+1 rodadas (apenas uma vez por cena). Se passar no teste de resistência, ou se já foi atordoada por esta magia, fica desprevenida por 1d4 rodadas.Cegar: a criatura fica Cego. Se passar no teste de resistência, fica Sangrando.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.possessao]: {
    nome: "Possessão",
    execucao: "Padrão",
    alcance: "Longo (90m 60q)",
    alvo: "1 criatura",
    duracao: "1 dia",
    resistencia: "Vontade anula",
    school: "Encan",
    description:
      `Você projeta sua consciência no corpo do alvo. Enquanto possuir uma criatura, você assume o controle total do corpo dela. O seu próprio corpo fica inconsciente e a consciência do alvo fica inerte. Em termos de jogo, você continua usando a sua ficha, mas com os atributos físicos e deslocamento da criatura. Se o alvo passar no teste de resistência, sabe que você tentou possuí-lo e fica imune a esta magia por um dia. Caso o corpo da criatura morra enquanto você a possui, a criatura morre e você deve fazer um teste de Vontade contra a CD da sua própria magia. Se passar, sua consciência retorna para o seu corpo (contanto que esteja dentro do alcance). Do contrário, você também morre. Retornar para o seu corpo voluntariamente é uma ação livre.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `você ganha acesso às habilidades de raça e classe da criatura.`
      }, 
      {
        addPM: 5,
        text: `enquanto a magia durar e você estiver dentro do alcance do seu corpo original, pode “saltar” de uma criatura possuída para outra. O novo alvo tem direito a um teste de Vontade. Se falhar, você assume o controle do corpo dele e o alvo anterior recobra a consciência.`
      }, 
      {
        addPM: 5,
        text: `muda a duração para permanente, mas destrói seu corpo original no processo. Uma criatura possuída pode fazer um teste de Vontade no começo do dia para retomar seu corpo. Se passar, recobra a consciência (e a sua própria consciência fica inerte). O teste se repete no início de cada dia. Se o corpo de uma criatura possuída morrer e houver outra criatura em alcance curto, você pode tentar possuí-la como uma reação. Enquanto houver novos corpos para possuir, você é imortal!`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.projetarConsciencia]: {
    nome: "Projetar Consciência",
    execucao: "Padrão",
    alcance: "Ilimitado (veja texto)",
    alvo: "Local ou criatura conhecidos",
    duracao: "Sustentada",
    school: "Adiv",
    description:
      `Esta magia faz com que sua consciência deixe seu corpo e se transporte instantaneamente para um local ou para perto de uma criatura alvo. Se escolher um local, ele precisa ser conhecido por você. Se escolher uma criatura, você transporta sua consciência até onde a criatura estiver, contanto que estejam no mesmo plano.<br>Você adquire uma forma fantasmagórica invisível, mas pode se mostrar  sando uma ação de movimento. Pode se mover em qualquer direção com deslocamento de voo 18m e, por ser incorpóreo, é capaz de atravessar objetos sólidos, mas fica limitado a se mover dentro dos limites do local, ou dentro de alcance curto da criatura alvo. Você pode ver e ouvir como se estivesse presente no local e pode falar mentalmente com qualquer criatura que possa ver, contanto que tenham um idioma em comum.`,
    aprimoramentos: [
      {
        addPM: 10,
        text: `além do normal, sua projeção é capaz de lançar magias que não precisem de componentes materiais e tenham duração diferente de sustentada. Sua forma fantasmagórica funciona como na magia Forma Etérea, sendo afetada por magias de Abjur e essência, mas as magias que ela lança podem afetar criaturas corpóreas.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.reanimacaoImpura]: {
    nome: "Reanimação Impura",
    execucao: "Completa",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Cena",
    school: "Necro",
    description:
      `Você reanima uma criatura morta recentemente (dentro da mesma cena), trazendo sua alma de volta ao corpo de forma forçada. O tipo da criatura muda para morto-vivo, mas ela retém suas memórias e habilidades de quando estava viva, podendo inclusive lançar magias. A criatura pode pensar e falar livremente, mas obedece cegamente a seus comandos. Quando a cena termina, a criatura volta a ficar morta, mas muitos clérigos malignos usam meios para guardar e preservar o corpo de criaturas poderosas para serem reanimadas dessa forma quando necessário. Se for destruída, a criatura não pode ser reanimada novamente com esta magia.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.requiem]: {
    nome: "Réquiem",
    execucao: "Completa",
    alcance: "Curto (9m 6q)",
    alvo: "Criaturas escolhidas",
    duracao: "Sustentada",
    resistencia: "Vontade anula",
    school: "Ilusão",
    description:
      `Esta magia cria uma ilusão particular para cada uma das criaturas que atingir. Enquanto a magia durar, no início de cada um de seus turnos, cada criatura afetada deve fazer um teste de Vontade; se falhar, acha que não tomou as ações que realmente fez no turno anterior e é obrigada a repetir as mesmas ações neste turno, com uma penalidade cumulativa de –5 em todos os testes para cada vez que se repetir (a penalidade não se aplica ao teste de Vontade contra esta magia). Por exemplo, se a criatura se aproximou de um alvo e o atacou, precisa se aproximar desse mesmo alvo e atacar novamente. A ação repetida consome PM e recursos normalmente e, caso exija um teste de resistência, qualquer alvo faz esse teste com um bônus igual ao da penalidade desta magia.`,
    aprimoramentos: [
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.roubarAAlma]: {
    nome: "Roubar a Alma",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Permanente",
    resistencia: "Vontade parcial",
    school: "Necro",
    description:
      `Você rouba a alma da vítima, armazenando-a em um objeto. Se o alvo passar no teste de resistência, sente o impacto de sua alma ser puxada para fora do corpo e fica Abaladopor 1 rodada. Se falhar, seu corpo fica caído, Inconscientee inerte, enquanto sua alma é transportada para dentro do objeto. O corpo não envelhece nem se decompõe, permanecendo em estase. Ele pode ser atacado e destruído normalmente. O objeto escolhido deve custar T$ 1.000 por nível ou ND da criatura e não possuir uma alma presa ou se quebrará quando a magia for lançada (embora personagens não conheçam o conceito de “nível” dentro do mundo de jogo, podem ter noção do poder geral de uma criatura, estimando assim o valor do objeto). Se o objeto for destruído, a magia se esvai. Se o corpo ainda estiver disponível, a alma retorna para ele. Caso contrário, escapa para os Mundos dos Deuses.<br>Custo adicional: sacrifício de 1 PM.`,
    aprimoramentos: [
      {
        addPM: 5,
        text: `o objeto que abriga a alma detém os mesmos PM totais que o alvo. Se estiver empunhando o objeto, você pode usar esses PM para lançar magias no lugar dos seus. O objeto recupera PM por dia como se o personagem estivesse em descanso normal.`
      }, 
      {
        addPM: 10,
        text: `como uma reação ao lançar esta magia, você possui o corpo sem alma do alvo, como na magia Possessão (mesmo que não conheça a magia).`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.segundaChance]: {
    nome: "Segunda Chance",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Instantânea",
    school: "Evoc",
    description:
      `Um brilho alaranjado, na forma de asas de fênix, emana do alvo. Ele recupera 200 pontos de vida e se cura de qualquer das seguintes condições: abalado, apavorado, alquebrado, atordoado, cego, confuso, debilitado, enjoado, envenenado, esmorecido, exausto, fascinado, fatigado, fraco, frustrado, lento, ofuscado, paralisado, pasmo ou surdo.`,
    aprimoramentos: [
      {
        addPM: 1,
        text: `aumenta a cura em +20 PV.`
      }, 
      {
        addPM: 2,
        text: `muda o alcance para curto e o alvo para até 5 criaturas.`
      }, 
      {
        addPM: 5,
        text: `muda o alvo para uma criatura que tenha morrido há até uma rodada. Esta magia pode curá-la.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.semiplano]: {
    nome: "Semiplano",
    execucao: "Completa",
    alcance: "Curto (9m 6q)",
    alvo: "Semiplano com 30m de lado",
    duracao: "1 dia",
    school: "Conv",
    description:
      `Você cria uma dimensão particular. Você pode entrar no semiplano gastando uma ação padrão e 10 PM, desaparecendo do plano material como se tivesse se teletransportado. Você pode levar criaturas voluntárias que esteja tocando, ao custo de 1 PM por criatura extra. Você também pode levar objetos que esteja tocando, ao custo de 1 PM por objeto Médio ou menor, 2 PM por objeto Grande, 5 PM por Enorme e 10 PM por Colossal. Uma vez no semiplano, pode gastar uma ação completa para voltar ao plano material, no mesmo local onde estava. Caso conheça a magia Viagem Planar, pode lançá-la para voltar ao plano material em outro local.<br>Você escolhe a forma e a aparência do semiplano — uma caverna, um asteroide que singra o éter, um palacete de cristal etc. Ele contém ar, luz e calor, mas além disso é vazio. Entretanto, você pode levar itens (mobília,  ferramentas etc.) a cada viagem.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `adiciona alvo (1 criatura). Você cria uma semiplano labiríntico e expulsa o alvo para ele. A cada rodada, a vítima tem direito a um teste de Investigação ou Sobrevivência (CD da magia), com bônus cumulativo de +1 para cada teste já realizado, para escapar do labirinto. Quando o alvo escapa, a magia termina e o alvo reaparece no plano material no mesmo local onde estava quando a magia foi lançada. Magias como Salto Dimensional e Teletransporte não ajudam a escapar do labirinto, mas Viagem Planar, sim.`
      }, 
      {
        addPM: 5,
        text: `muda a duração para permanente e adiciona componente material (maquete do semiplano feito de materiais preciosos no valor de T$ 5.000). Você pode lançar a magia diversas vezes para aumentar as dimensões do semiplano em +30m de lado a cada vez.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.sombraAssassina]: {
    nome: "Sombra Assassina",
    execucao: "Padrão",
    alcance: "Curto (9m 6q)",
    alvo: "1 criatura",
    duracao: "Cena",
    resistencia: "Vontade parcial",
    school: "Ilusão",
    description:
      `Esta magia cria uma duplicata ilusória do alvo na forma de uma silhueta, ligada a ele como se fosse uma manifestação sólida de sua própria sombra. A duplicata de sombras segue automaticamente o alvo. Sempre que o alvo faz uma ação hostil — fazer um ataque, usar uma habilidade, lançar uma magia — a sombra imediatamente realiza a mesma ação contra o alvo, usando as mesmas estatísticas e rolagens. A sombra pode ser atacada, tem as mesmas estatísticas do alvo e é destruída quando chega a 0 PV. Se o alvo passar no teste de resistência, a sombra desaparece no final do turno do alvo, depois de copiar sua ação dessa rodada.`,
    aprimoramentos: [
      {
        addPM: 10,
        text: `muda o alvo para criaturas escolhidas na área.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.toqueDaMorte]: {
    nome: "Toque da Morte",
    execucao: "Padrão",
    alcance: "Toque",
    alvo: "1 criatura",
    duracao: "Instantânea",
    resistencia: "Veja texto",
    school: "Necro",
    description:
      `Sua mão exala energias letais. A criatura sofre 10d8+10 pontos de dano de trevas. Se estiver com menos da metade de seus PV, em vez disso deve fazer um teste de Fortitude. Se passar, sofre o dano normal. Se falhar, seus PV são reduzidos a –10.`,
    aprimoramentos: [
      {
        addPM: 2,
        text: `muda o alcance para curto. Em vez de tocar no alvo, você dispara um raio púrpura da ponta de seu dedo indicador.`
      }, 
      {
        addPM: 10,
        text: `muda o alcance para curto e o alvo para inimigos no alcance. Em vez de tocar no alvo, você dispara raios púrpuras da ponta de seus dedos.`
      }, 
    ],
    publicacao: `Jogo do Ano`,
  },
  [spellsCircle5Names.katanaCelestial]: {
    nome: "Katana Celestial",
    execucao: "Padrão",
    alcance: "Pessoal",
    area: "Linha de 60m ou duas linhas de 30m",
    duracao: "Instantânea",
    resistencia: "Reflexos parcial",
    school: "Evoc",
    description:
      `Um golpe vindo dos céus risca o campo de batalha. Se escolher duas linhas, cada uma deve seguir em uma direção diferente, criando um corte em “V”. Criaturas na área sofrem 12d8 pontos de dano de luz (ou 12d12, se forem mortos-vivos) e ficam cegas e surdas até o fim da cena (Reflexos reduz à metade e evita as condições).`,
    aprimoramentos: [
      {
        addPM: 3,
        text: `aumenta o dano em +2d8 (ou +2d12 em mortos-vivos).`
      }, 
      {
        addPM: 6,
        text: `muda a área para uma linha de 120m ou quatro linhas de 30m em direções opostas, formando um “X”.`
      }, 
    ],
    publicacao: `Ameaças de Arton 1.0`,
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
