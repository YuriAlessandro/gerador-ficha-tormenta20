import { nomes, nameGenerators } from '@/data/systems/tormenta20/nomes';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';

/**
 * Retorna sugestões de nomes baseadas na raça e gênero do personagem.
 * Para raças com geradores especiais (Lefou, Osteon, etc.), gera uma amostra de nomes.
 * Para as demais, retorna a lista estática de nomes.
 * Faz fallback para nomes de Humano caso a raça não tenha nomes específicos.
 */
const getNameSuggestions = (
  raceName: string,
  gender: string,
  supplements: SupplementId[]
): string[] => {
  const genderKey = gender === 'Masculino' ? 'Homem' : 'Mulher';

  if (nomes[raceName] && nomes[raceName][genderKey]) {
    return nomes[raceName][genderKey];
  }

  const race = dataRegistry.getRaceByName(raceName, supplements);
  if (race && nameGenerators[raceName]) {
    const sampleNames: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      try {
        const name = nameGenerators[raceName](race, genderKey);
        if (name && !sampleNames.includes(name)) {
          sampleNames.push(name);
        }
      } catch (error) {
        break;
      }
    }
    return sampleNames;
  }

  return nomes.Humano[genderKey] || [];
};

export default getNameSuggestions;
