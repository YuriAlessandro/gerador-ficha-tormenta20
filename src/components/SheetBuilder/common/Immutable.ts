export const updateItemByIndex = <Type>(
  prevArray: Type[],
  updatedItem: Type,
  indexToUpdate: number
) => {
  const updatedGroups = prevArray.map((group, index) => {
    if (index === indexToUpdate) {
      return updatedItem;
    }
    return group;
  });
  return updatedGroups;
};
