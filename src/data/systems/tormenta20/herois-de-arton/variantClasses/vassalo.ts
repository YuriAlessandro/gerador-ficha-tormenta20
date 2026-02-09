import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import PROFICIENCIAS from '../../proficiencias';
import CAVALEIRO from '../../classes/cavaleiro';

const codigoDeHonra = CAVALEIRO.abilities.find(
  (a) => a.name === 'Código de Honra'
)!;
const baluarte = CAVALEIRO.abilities.find((a) => a.name === 'Baluarte')!;

const VASSALO: VariantClassOverrides = {
  name: 'Vassalo',
  isVariant: true,
  baseClassName: 'Cavaleiro',
  proficiencias: [PROFICIENCIAS.MARCIAIS, PROFICIENCIAS.ESCUDOS],
  excludeAllBasePowers: true,
  abilities: [
    codigoDeHonra,
    baluarte,
    {
      name: 'Jovem Pajem',
      text: 'Você inicia sua carreira como um pajem, servindo a um sir ou dame mais experiente. Você se torna treinado em Adestramento ou Ofício (armeiro). Se já for treinado, recebe +2 na perícia.',
      nivel: 1,
      sheetActions: [
        {
          source: { type: 'power', name: 'Jovem Pajem' },
          action: {
            type: 'trainSkillOrBonus',
            skills: [Skill.ADESTRAMENTO, Skill.OFICIO],
          },
        },
      ],
    },
    {
      name: 'Suserano',
      text: 'Escolha um membro da nobreza aprovado pelo mestre. Você serve a esse nobre, sendo oficialmente reconhecido como parte de sua corte. Como regra geral, você recebe +5 em testes de Diplomacia e Intimidação ao lidar com vassalos de seu suserano de nível inferior ao seu e, nas terras dele, pode obter alojamento e alimentação sem custo. Se deixar de servir a seu suserano por qualquer motivo, você perde todos os seus PM e só pode recuperá-los após ser aceito por outro suserano.',
      nivel: 1,
    },
    {
      name: 'Valete',
      text: 'A partir do 2º nível, você já acompanha seu senhor na corte e nos salões nobres. Você se torna treinado em Diplomacia ou Nobreza (se já for treinado, recebe +2) e recebe um poder de cavaleiro a sua escolha.',
      nivel: 2,
      sheetActions: [
        {
          source: { type: 'power', name: 'Valete' },
          action: {
            type: 'trainSkillOrBonus',
            skills: [Skill.DIPLOMACIA, Skill.NOBREZA],
          },
        },
      ],
    },
    {
      name: 'Escudeiro Aprendiz',
      text: 'A partir do 3º nível, você ajuda seu senhor na batalha. Você se torna treinado em Cavalgar (se já for treinado, recebe +2) e recebe proficiência com armaduras pesadas. Se já tiver proficiência com armaduras pesadas, recebe +2 na Defesa enquanto usa uma armadura pesada.',
      nivel: 3,
      sheetActions: [
        {
          source: { type: 'power', name: 'Escudeiro Aprendiz' },
          action: {
            type: 'trainSkillOrBonus',
            skills: [Skill.CAVALGAR],
          },
        },
      ],
    },
    {
      name: 'Guarda do Castelo',
      text: 'No 4º nível, você já patrulha as muralhas do castelo sozinho. Você se torna treinado em Intuição (se já for treinado, recebe +2) e recebe um poder de cavaleiro a sua escolha.',
      nivel: 4,
      sheetActions: [
        {
          source: { type: 'power', name: 'Guarda do Castelo' },
          action: {
            type: 'trainSkillOrBonus',
            skills: [Skill.INTUICAO],
          },
        },
      ],
    },
    {
      name: 'Vigilante de Estradas',
      text: 'A partir do 5º nível, você expande suas responsabilidades para além do castelo. Você recebe a habilidade Montaria (como Caminho do Cavaleiro) e se torna treinado em Percepção (se já for treinado, recebe +2).',
      nivel: 5,
      sheetActions: [
        {
          source: { type: 'power', name: 'Vigilante de Estradas' },
          action: {
            type: 'trainSkillOrBonus',
            skills: [Skill.PERCEPCAO],
          },
        },
      ],
    },
    {
      name: 'Cavaleiro do Reino',
      text: 'No 6º nível, você recebe o título de sir ou dame e atinge o grau mais baixo da nobreza. Você recebe uma arma, armadura ou escudo superior com duas melhorias a sua escolha e recebe um poder de cavaleiro a sua escolha.',
      nivel: 6,
    },
    {
      name: 'Sargento do Reino',
      text: 'No 7º nível, você adquire uma posição no exército do reino. Você recebe um poder de cavaleiro ou de guerreiro a sua escolha (como um guerreiro de nível igual ao seu para propósitos de pré-requisitos).',
      nivel: 7,
    },
    {
      name: 'Capitão do Reino',
      text: 'No 8º nível, você se torna um oficial no exército, respeitado e prestigiado por militares, nobres e plebeus. Você recebe o poder Escudeiro e a habilidade Golpe Divino, como um paladino de nível igual ao seu. Esta não é uma habilidade mágica e provém de seu senso de justiça e determinação em combate.',
      nivel: 8,
    },
    {
      name: 'Lorde',
      text: 'No 9º nível você ascende dentro da nobreza, recebendo um feudo — e muitas responsabilidades. Você recebe o poder Autoridade Feudal. Se já possui esse poder, as pessoas convocadas passam a contar como um parceiro veterano. Além disso, escolha um dos caminhos: Caminho do Soldado (recebe um poder de guerreiro a sua escolha) ou Caminho do Governante (recebe um poder de nobre a sua escolha).',
      nivel: 9,
    },
    {
      name: 'Barão',
      text: 'No 10º nível, você ascende dentro da nobreza e passa a receber impostos de seus plebeus. Você recebe o poder Título e um domínio de nível 1. Se já tiver um domínio, em vez disso ele recebe uma construção gratuita (cujos pré-requisitos seu domínio cumpra).',
      nivel: 10,
    },
    {
      name: 'Visconde',
      text: 'No 11º nível, você adquire um título mais alto. Se escolheu o Caminho do Soldado, recebe +1 PV por nível de vassalo. Se escolheu o Caminho do Governante, recebe +1 em Inteligência.',
      nivel: 11,
    },
    {
      name: 'Conde',
      text: 'A partir do 12º nível, você é um alto nobre e tem acesso a equipamentos poderosos. No início de cada aventura, você recebe um "orçamento" de T$ 30.000 que pode gastar em itens mágicos. Esses itens devem ser devolvidos ou reembolsados no fim da aventura. Além disso, recebe um poder de cavaleiro ou geral a sua escolha.',
      nivel: 12,
    },
    {
      name: 'Marquês',
      text: 'No 13º nível, seus feitos alçam-no a um título ainda mais alto. Se escolheu o Caminho do Soldado, você recebe redução de dano 5 e +2 na Defesa. Se escolheu o Caminho do Governante, você passa a somar seu Carisma em seus testes de resistência.',
      nivel: 13,
    },
    {
      name: 'Duque',
      text: 'No 14º nível, você se tornou um dos mais altos nobres do reino. Quando você usa Autoridade Feudal, o nível do parceiro convocado aumenta em um passo. Além disso, você recebe um poder de cavaleiro a sua escolha.',
      nivel: 14,
    },
    {
      name: 'Arquiduque',
      text: 'No 15º nível você atinge o mais alto grau da nobreza, possuindo uma aura que o distingue das pessoas normais e o torna quase intocável. Uma vez por rodada, quando uma criatura inteligente lhe causar dano, você pode gastar 5 PM para reduzir esse dano a 0.',
      nivel: 15,
    },
    {
      name: 'Conselheiro Real',
      text: 'A partir do 16º nível, você se torna um dos conselheiros do rei e passa a partilhar do poder de Sua Majestade. Você recebe um poder de cavaleiro a sua escolha e aprende e pode lançar uma magia divina de até 4º círculo a sua escolha (atributo-chave Carisma).',
      nivel: 16,
    },
    {
      name: 'Rei Mercenário',
      text: 'No 17º nível, você dá seus primeiros passos rumo à majestade, e a terra responde às suas aspirações. Se escolheu o Caminho do Soldado, você recebe 3 pontos de atributo para distribuir como quiser em Força, Destreza e Constituição. Se escolheu o Caminho do Governante, recebe 3 pontos de atributo para distribuir como quiser em Inteligência, Sabedoria e Carisma.',
      nivel: 17,
    },
    {
      name: 'Rei',
      text: 'No 18º nível, seu reino já não precisa mais do apoio de seu antigo lorde — mas vocês ainda são aliados. Você recebe +1 em Carisma e um poder de cavaleiro a sua escolha.',
      nivel: 18,
    },
    {
      name: 'Alto Rei',
      text: 'No 19º nível, você se torna um alto rei, senhor de seu reino e do antigo reino de seu lorde. Tem a sua disposição seguidores e riquezas sem fim — seu "orçamento" de itens mágicos aumenta para T$ 100.000 e seu limite de parceiros aumenta em 2.',
      nivel: 19,
    },
    {
      name: 'Imperador',
      text: 'No 20º nível, você chegou ao ápice político de Arton. Você agora é um grande imperador, respeitado e temido por todos. Você recebe +1 em dois atributos diferentes a sua escolha e aprende e pode lançar uma magia divina de até 5º círculo a sua escolha (atributo-chave Carisma).',
      nivel: 20,
    },
  ],
};

export default VASSALO;
