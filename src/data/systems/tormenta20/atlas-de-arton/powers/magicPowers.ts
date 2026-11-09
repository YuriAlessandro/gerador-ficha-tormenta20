import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';

const magicPowers: Record<string, GeneralPower> = {
  PRESENTE_DE_WYNLLA: {
    name: 'Presente de Wynlla',
    description:
      'Escolha uma magia arcana de 1º círculo que você saiba lançar. Quando lança esta magia, o custo total de seus aprimoramentos é reduzido em –1 PM. Quanto está em Wynlla, em vez disso o custo em PM total dos aprimoramentos de suas magias arcanas é reduzido em um valor igual ao seu atributo-chave para magias arcanas. Estes efeitos são cumulativos com reduções no custo básico da magia.',
    type: GeneralPowerType.MAGIA,
    // A versão "em Wynlla" (todas as arcanas) é situacional e fica no texto.
    spellChoice: {
      count: { type: 'fixed', value: 1 },
      eligible: { tradition: 'arcane', circles: [1] },
    },
    spellModifiers: [
      {
        filter: { chosen: true },
        effect: { type: 'AprimoramentoPm', value: 1 },
      },
    ],
    requirements: [
      [{ type: RequirementType.TEXT, text: 'Lançar magia arcana' }],
    ],
  },
};

export default magicPowers;
