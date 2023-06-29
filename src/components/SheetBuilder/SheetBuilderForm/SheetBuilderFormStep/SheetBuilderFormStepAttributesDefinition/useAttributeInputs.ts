import { Dispatch, SetStateAction, useState } from 'react';
import { Attribute } from 't20-sheet-builder';

type AttributesSetStates = Record<Attribute, Dispatch<SetStateAction<number>>>;

export const useAttributesInputs = () => {
  const [strength, setStrength] = useState(0);
  const [dexterity, setDexterity] = useState(0);
  const [constitution, setConstitution] = useState(0);
  const [intelligence, setIntelligence] = useState(0);
  const [wisdom, setWisdom] = useState(0);
  const [charisma, setCharisma] = useState(0);

  const attributesSetStates: AttributesSetStates = {
    strength: setStrength,
    dexterity: setDexterity,
    constitution: setConstitution,
    intelligence: setIntelligence,
    wisdom: setWisdom,
    charisma: setCharisma,
  };

  const increment = (attribute: Attribute) => {
    const setState = attributesSetStates[attribute];
    setState((state) => state + 1);
  };

  const decrement = (attribute: Attribute) => {
    const setState = attributesSetStates[attribute];
    setState((state) => state - 1);
  };

  return {
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
    increment,
    decrement,
  };
};
