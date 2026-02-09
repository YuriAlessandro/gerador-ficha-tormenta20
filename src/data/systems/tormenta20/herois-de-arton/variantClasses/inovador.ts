import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';

const INOVADOR: VariantClassOverrides = {
  name: 'Inovador',
  isVariant: true,
  baseClassName: 'Guerreiro',
  periciasbasicas: [
    {
      type: 'or',
      list: [Skill.LUTA, Skill.PONTARIA],
    },
    {
      type: 'and',
      list: [Skill.ACROBACIA],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CONHECIMENTO,
      Skill.FORTITUDE,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INVESTIGACAO,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PONTARIA,
      Skill.REFLEXOS,
    ],
  },
  abilities: [
    {
      name: 'Do Bom e do Melhor',
      text: 'Você começa o jogo com uma arma, armadura ou escudo superior a sua escolha, de até T$ 500. Entretanto, você é considerado não proficiente em qualquer arma, armadura ou escudo que não seja superior ou mágico.',
      nivel: 1,
    },
    {
      name: 'Sequência Especial',
      text: 'Você pode gastar 2 PM para iniciar uma sequência de movimentos inovadores. Quando faz isso, a cada vez que ataca com uma arma que ainda não tenha usado nessa sequência, você recebe um bônus de +1 em testes de ataque e rolagens de dano (cumulativo até +2). A cada 4 níveis, você pode gastar +1 PM para aumentar o limite desses bônus em +2. A sequência termina ao fim da cena ou se você ficar 1 rodada sem trocar pelo menos uma arma.',
      nivel: 1,
    },
    {
      name: 'Bombardeio Sequencial',
      text: 'No 2º nível, você pode usar sua Sequência Especial ao usar itens alquímicos ou poções (nesse caso, aplica o bônus de ataque acumulado à CD para resistir ao item).',
      nivel: 2,
    },
    {
      name: 'Acrobacia Defensiva',
      text: 'A partir do 3º nível, quando sofre dano, você pode gastar 2 PM para executar uma pirueta defensiva. Você faz um teste de Acrobacia e subtrai o resultado desse teste do dano sofrido.',
      nivel: 3,
    },
    {
      name: 'Domínio Excêntrico',
      text: 'A partir do 4º nível, sempre que passar pelo menos uma semana carregando uma arma exótica ou de fogo superior ou mágica, você recebe proficiência nela.',
      nivel: 4,
    },
    {
      name: 'Técnica Revolucionária',
      text: 'A partir do 7º nível, você pode gastar 2 PM para, até o fim do combate, usar armas que esteja empunhando como se elas tivessem uma das seguintes habilidades de arma, a sua escolha: adaptável, ágil, alongada, dupla (use as estatísticas da arma em ambas as pontas) ou versátil (para uma manobra escolhida ao usar esta habilidade). Esse efeito termina se você ativar sua Técnica Revolucionária novamente.',
      nivel: 7,
    },
    {
      name: 'Estilo Único',
      text: 'No 20º nível, você consolida seu próprio estilo de combate. Escolha dois poderes de guerreiro ou de combate que possua. Para esses poderes, você ignora todos os requisitos e restrições relacionados a armas, incluindo propósito, empunhadura, características e habilidades das armas.',
      nivel: 20,
    },
  ],
};

export default INOVADOR;
