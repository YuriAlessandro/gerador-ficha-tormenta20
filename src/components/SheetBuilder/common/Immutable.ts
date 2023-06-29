export const updateItemByIndex = <Type>(
  prevArray: Type[],
  updatedItem: Type,
  indexToUpdate: number
) =>
  prevArray.map((item, index) =>
    index === indexToUpdate ? updatedItem : item
  );
