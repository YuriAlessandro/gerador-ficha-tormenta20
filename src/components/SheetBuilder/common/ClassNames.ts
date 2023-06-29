export const generateClassNames = (classes: Record<string, boolean>) =>
  Object.entries(classes)
    .filter(([_className, condition]) => condition)
    .map(([className]) => className)
    .join(' ');
