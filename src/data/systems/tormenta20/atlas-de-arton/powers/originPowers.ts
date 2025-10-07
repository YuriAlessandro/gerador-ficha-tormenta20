import { OriginPower } from '../../../../../interfaces/Poderes';

export const ORIGIN_POWER_TYPE = 'ORIGEM';

const atlasOriginPowers: Record<string, OriginPower> = {
  AGRICULTOR_SAMBUR: {
    name: 'Agricultor Sambur',
    description:
      'Você é treinado em Adestramento e Sobrevivência e, uma vez por cena, pode gastar 1 PM para receber +1d6 em um teste de perícia.',
    type: ORIGIN_POWER_TYPE,
  },
  AMAZONA_DE_HIPPION: {
    name: 'Amazona de Hippion',
    description:
      'Você é treinada em Cavalgar e, se não estiver usando armadura pesada, soma seu Carisma nos PM, limitado pelo seu nível (apenas após um dia).',
    type: ORIGIN_POWER_TYPE,
  },
  AMOQUE_PURPURA: {
    name: 'Amoque Púrpura',
    description:
      'Você é treinado em Intimidação e, quando está sob efeito de Fúria, Fúria Divina ou Poder Oculto, recebe +2 em rolagens de dano.',
    type: ORIGIN_POWER_TYPE,
  },
  ANAO_DE_ARMAS: {
    name: 'Anão de Armas',
    description:
      'Você é treinado em Ofício (armeiro) e recebe +2 em rolagens de dano com armas tradicionais anãs (machados, martelos, marretas e picaretas).',
    type: ORIGIN_POWER_TYPE,
  },
  ANDARILHO_UBANERI: {
    name: 'Andarilho Ubaneri',
    description:
      'Você recebe um alikunhá, um parceiro iniciante que não conta em seu limite de parceiros, e proficiência com escudos. Caso já tenha essa proficiência, o bônus na Defesa que seu escudo fornece aumenta em +1.',
    type: ORIGIN_POWER_TYPE,
  },
  APRENDIZ_DE_DRAGOEIRO: {
    name: 'Aprendiz de Dragoeiro',
    description:
      'Você recebe +2 na Defesa contra criaturas maiores que você e +2 em Reflexos. Além disso, se passar em um teste de Reflexos, seus ataques contra a fonte do efeito causam +1d8 pontos de dano até o final da cena.',
    type: ORIGIN_POWER_TYPE,
  },
  APRENDIZ_DE_DROGADORA: {
    name: 'Aprendiz de Drogadora',
    description:
      'Você é treinada em Cura e Ofício (alquimista). Como usa partes de seu corpo para fabricar preparados alquímicos e poções, você gasta apenas 1/4 do preço dos itens em matérias-primas.',
    type: ORIGIN_POWER_TYPE,
  },
  ARISTOCRATA_DAIZENSHI: {
    name: "Aristocrata Dai'zenshi",
    description:
      'Você é treinado em Ofício (armeiro) e pode fabricar armas com uma melhoria. Se aprender a fabricar armas superiores por outra habilidade, gasta apenas 1/4 do preço das melhorias que aplica em armas.',
    type: ORIGIN_POWER_TYPE,
  },
  ASPIRANTE_A_HEROI: {
    name: 'Aspirante a Herói',
    description: 'Você recebe +1 em um atributo à sua escolha.',
    type: ORIGIN_POWER_TYPE,
  },
};

export default atlasOriginPowers;
