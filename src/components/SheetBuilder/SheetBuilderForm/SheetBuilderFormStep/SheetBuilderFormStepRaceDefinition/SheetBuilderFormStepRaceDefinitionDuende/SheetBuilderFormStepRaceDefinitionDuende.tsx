import React, { useState, useEffect } from 'react';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';
import { Attributes, SkillName, Translator } from 't20-sheet-builder';
import { Atributo } from '../../../../../../data/atributos';
import AttributeCheckbox from '../AttributeCheckbox';
import AttributePreviewItem from '../AttributePreviewItem';
import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
import { SheetBuilderFormError } from '@/components/SheetBuilder/common/SheetBuilderFormError';
import { useDispatch } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { submitRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';

const naturezas = [
  { name: 'Animal', abilities: 'Recebe +1 em um atributo à sua escolha.' },
  { name: 'Vegetal', abilities: 'Imune a atordoamento e metamorfose. Pode usar Florescer Feérico.' },
  { name: 'Mineral', abilities: 'Imunidade a efeitos de metabolismo, RD 5 (corte, fogo, perfuração).' },
];

const tamanhos = [
    { name: 'Minúsculo', modifiers: '+5 em Furtividade, -5 em manobras', displacement: '6m', penalty: '-1 em Força' },
    { name: 'Pequeno', modifiers: '+2 em Furtividade, -2 em manobras', displacement: '6m', penalty: 'Nenhuma' },
    { name: 'Médio', modifiers: 'Nenhum', displacement: '9m', penalty: 'Nenhuma' },
    { name: 'Grande', modifiers: '-2 em Furtividade, +2 em manobras', displacement: '9m', penalty: '-1 em Destreza' },
];

const allAttributes = Object.values(Atributo);

const presentes = [
    'Afinidade Elemental', 'Encantar Objetos', 'Enfeitiçar', 'Invisibilidade',
    'Língua da Natureza', 'Maldição', 'Mais Lá do que Aqui', 'Metamorfose Animal',
    'Sonhos Proféticos', 'Velocidade do Pensamento', 'Visão Feérica', 'Voo'
];

const tabuSkills: SkillName[] = [SkillName.diplomacy, SkillName.initiative, SkillName.fight, SkillName.perception];

const SheetBuilderFormStepRaceDefinitionDuende: React.FC<RaceComponentProps> = ({
  attributesPreview,
  setAttributeModifiers,
}) => {
  const dispatch = useDispatch();
  const [selectedNature, setSelectedNature] = useState<string | undefined>();
  const [selectedTamanho, setSelectedTamanho] = useState<string | undefined>();
  const [naturezaAnimalAttr, setNaturezaAnimalAttr] = useState<Atributo | undefined>();
  const [donsAttrs, setDonsAttrs] = useState<Atributo[]>([]);
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [selectedTabu, setSelectedTabu] = useState<SkillName | undefined>();

  useEffect(() => {
    const totalModifiers: Partial<Attributes> = {};
    if (selectedTamanho === 'Minúsculo') totalModifiers[Atributo.FORCA] = -1;
    if (selectedTamanho === 'Grande') totalModifiers[Atributo.DESTREZA] = -1;
    if (selectedNature === 'Animal' && naturezaAnimalAttr) {
      totalModifiers[naturezaAnimalAttr] = (totalModifiers[naturezaAnimalAttr] || 0) + 1;
    }
    donsAttrs.forEach(attr => {
      totalModifiers[attr] = (totalModifiers[attr] || 0) + 1;
    });
    setAttributeModifiers(totalModifiers);
  }, [selectedTamanho, selectedNature, naturezaAnimalAttr, donsAttrs, setAttributeModifiers]);

  const handleSelectDons = (attribute: Atributo) => {
    const currentIndex = donsAttrs.indexOf(attribute);
    const newDons = [...donsAttrs];
    if (currentIndex === -1) {
        if(newDons.length < 2) newDons.push(attribute);
    } else {
      newDons.splice(currentIndex, 1);
    }
    setDonsAttrs(newDons);
  };

  const handleSelectNaturezaAnimalAttr = (attribute: Atributo) => {
    if (donsAttrs.includes(attribute)) {
        const newDons = donsAttrs.filter(attr => attr !== attribute);
        setDonsAttrs(newDons);
    }
    setNaturezaAnimalAttr(attribute);
  }

  const handleSelectPower = (power: string) => {
    const currentIndex = selectedPowers.indexOf(power);
    const newPowers = [...selectedPowers];
    if (currentIndex === -1) {
        if(newPowers.length < 3) newPowers.push(power);
    } else {
      newPowers.splice(currentIndex, 1);
    }
    setSelectedPowers(newPowers);
  };

  const handleConfirm = () => {
    if (!selectedNature) throw new SheetBuilderFormError('Selecione uma Natureza.');
    if (!selectedTamanho) throw new SheetBuilderFormError('Selecione um Tamanho.');
    if (selectedNature === 'Animal' && !naturezaAnimalAttr) throw new SheetBuilderFormError('Selecione o atributo da Natureza Animal.');
    if (donsAttrs.length < 2) throw new SheetBuilderFormError('Selecione 2 atributos para os Dons.');
    if (selectedPowers.length < 3) throw new SheetBuilderFormError('Selecione 3 Presentes.');
    if (!selectedTabu) throw new SheetBuilderFormError('Selecione a perícia do seu Tabu.');

    const payload = {
        name: 'Duende',
        choices: {
            nature: selectedNature,
            tamanho: selectedTamanho,
            naturezaAnimalAttr: naturezaAnimalAttr,
            donsAttrs: donsAttrs,
            powers: selectedPowers,
            tabu: selectedTabu,
        }
    };

    dispatch(submitRace(payload as any));
    dispatch(setOptionReady({ key: 'isRaceReady', value: 'confirmed' }));
  }

  return (
    <div>
      <h2 className="text-2xl mb-4 font-bold">Opções da Raça Duende</h2>

      <div className="mb-6">
        <h3 className="text-xl mb-2 font-semibold">Passo 1: Natureza</h3>
        {naturezas.map((n) => ( <div key={n.name} className="mb-2"> <label className="flex items-center space-x-2"> <input type="radio" name="natureza" value={n.name} checked={selectedNature === n.name} onChange={(e) => setSelectedNature(e.target.value)} /> <span>{n.name}</span> </label> {selectedNature === n.name && ( <div className="pl-6 mt-2 text-sm text-gray-600 border-l-2 border-gray-200 ml-2"> <p><strong>Habilidades:</strong> {n.abilities}</p> </div> )} </div> ))}
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2 font-semibold">Passo 2: Tamanho</h3>
        {tamanhos.map((t) => ( <div key={t.name} className="mb-2"> <label className="flex items-center space-x-2"> <input type="radio" name="tamanho" value={t.name} checked={selectedTamanho === t.name} onChange={(e) => setSelectedTamanho(e.target.value)} /> <span>{t.name}</span> </label> {selectedTamanho === t.name && ( <div className="pl-6 mt-2 text-sm text-gray-600 border-l-2 border-gray-200 ml-2"> <p><strong>Modificadores:</strong> {t.modifiers}</p> <p><strong>Deslocamento:</strong> {t.displacement}</p> <p><strong>Penalidade:</strong> {t.penalty}</p> </div> )} </div> ))}
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2 font-semibold">Passo 3: Dons</h3>
        <p className="mb-4">Recebe +1 em dois atributos diferentes.</p>
        {selectedNature === 'Animal' && <p className="mb-4 text-blue-600"><strong>Regra Especial:</strong> Você recebe +1 em um atributo adicional. Este pode ser em um dos atributos dos Dons, totalizando +2.</p>}
        {selectedNature === 'Animal' && ( <div className="mb-4"> <h4 className="font-semibold">Bônus da Natureza (+1)</h4> <div className="flex gap-2 flex-wrap mt-2"> {allAttributes.map(attr => ( <AttributeCheckbox key={attr} toggle={() => handleSelectNaturezaAnimalAttr(attr)} attributePreviewItem={<AttributePreviewItem attribute={attr} value={0} modifier={naturezaAnimalAttr === attr ? 1 : 0} />} /> ))} </div> </div> )}
        <div> <h4 className="font-semibold">Bônus dos Dons (+1 em dois)</h4> <div className="flex gap-2 flex-wrap mt-2"> {allAttributes.map(attr => ( <AttributeCheckbox key={attr} toggle={() => handleSelectDons(attr)} attributePreviewItem={<AttributePreviewItem attribute={attr} value={0} modifier={donsAttrs.includes(attr) ? 1 : 0} />} /> ))} </div> </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2 font-semibold">Passo 4: Presentes de Magia e de Caos</h3>
        <p className="mb-4">Escolha três poderes da lista a seguir.</p>
        <div className="grid grid-cols-2 gap-2">
          {presentes.map((power) => ( <div key={power}> <label className="flex items-center space-x-2"> <input type="checkbox" value={power} checked={selectedPowers.includes(power)} onChange={() => handleSelectPower(power)} disabled={selectedPowers.length >= 3 && !selectedPowers.includes(power)} /> <span>{power}</span> </label> </div> ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2 font-semibold">Passo 5: Limitações</h3>
        <div className="p-4 bg-gray-100 rounded-md">
            <p className="font-semibold mt-2">Tabu:</p>
            <p className="text-sm mb-2">Escolha uma perícia abaixo para sofrer -5 de penalidade.</p>
            <div className="space-y-1">
                {tabuSkills.map(skill => ( <label key={skill} className="flex items-center space-x-2"> <input type="radio" name="tabu" value={skill} checked={selectedTabu === skill} onChange={(e) => setSelectedTabu(e.target.value as SkillName)} /> <span>{Translator.getSkillTranslation(skill)}</span> </label> ))}
            </div>
        </div>
      </div>

      <ConfirmButton confirm={handleConfirm} />
    </div>
  );
}

export default SheetBuilderFormStepRaceDefinitionDuende;
