import {
  OriginPowerName,
  SerializedAnimalsFriend,
  SerializedSpecialFriend,
} from 't20-sheet-builder';
import React, { useEffect } from 'react';
import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
import { selectSheetOrigin } from '@/store/slices/sheetBuilder/sheetBuilderSliceOriginDefinition';
import { useSelector } from 'react-redux';
import { OriginComponentType } from '../SheetBuilderFormStepOriginDefinition';
import AnimalEquipmentSelect from './AnimalEquipmentSelect';
import SheetBuilderFormStepOriginDefinitionAnimalsFriendSpecialFriend from './SheetBuilderFormStepOriginDefinitionAnimalsFriendSpecialFriend';
import { useAnimalsFriendForm } from './useAnimalsFriendForm';

const SheetBuilderFormStepOriginDefinitionAnimalsFriend: OriginComponentType =
  ({ benefitsSelect, confirmOrigin, selectedBenefits }) => {
    const storedOrigin = useSelector(selectSheetOrigin) as {
      origin: SerializedAnimalsFriend;
    };

    const {
      selectedAnimal,
      selectedSpecialFriendSkill,
      confirmAnimalsFriend,
      setSelectedAnimal,
      setSelectedSpecialFriendSkill,
    } = useAnimalsFriendForm(selectedBenefits, confirmOrigin);

    const isSpecialFriendSelected = selectedBenefits.some(
      (benefit) => benefit.name === OriginPowerName.specialFriend
    );

    useEffect(() => {
      if (storedOrigin) {
        setSelectedAnimal(storedOrigin.origin.chosenAnimal);
        const specialFriend = storedOrigin.origin.chosenBenefits.find(
          (benefit) => benefit.name === OriginPowerName.specialFriend
        ) as SerializedSpecialFriend;
        if (specialFriend) setSelectedSpecialFriendSkill(specialFriend.skill);
      }
    }, [storedOrigin]);

    return (
      <div>
        <AnimalEquipmentSelect
          selectAnimal={setSelectedAnimal}
          selectedAnimal={selectedAnimal}
        />
        {benefitsSelect}
        {isSpecialFriendSelected && (
          <SheetBuilderFormStepOriginDefinitionAnimalsFriendSpecialFriend
            selectSkill={setSelectedSpecialFriendSkill}
            selectedSpecialFriendSkill={selectedSpecialFriendSkill}
          />
        )}
        <ConfirmButton confirm={confirmAnimalsFriend} />
      </div>
    );
  };

export default SheetBuilderFormStepOriginDefinitionAnimalsFriend;
