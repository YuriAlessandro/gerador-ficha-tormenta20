import { Folder } from '../services/folders.service';

const normalize = (parentId: string | null | undefined): string | null =>
  parentId ?? null;

export const getRootFolders = (folders: Folder[]): Folder[] =>
  folders.filter((f) => normalize(f.parentId) === null);

export const getChildren = (
  folders: Folder[],
  parentId: string | null
): Folder[] => folders.filter((f) => normalize(f.parentId) === parentId);

export const getFolderPath = (
  folders: Folder[],
  id: string | null
): Folder[] => {
  if (!id) return [];
  const byId = new Map(folders.map((f) => [f.id, f]));
  const path: Folder[] = [];
  const visited = new Set<string>();
  let cursor: Folder | undefined = byId.get(id);
  while (cursor && !visited.has(cursor.id)) {
    visited.add(cursor.id);
    path.unshift(cursor);
    const parent = cursor.parentId;
    cursor = parent ? byId.get(parent) : undefined;
  }
  return path;
};

export const folderExists = (folders: Folder[], id: string | null): boolean => {
  if (!id) return true;
  return folders.some((f) => f.id === id);
};

export const getDescendantIds = (
  folders: Folder[],
  id: string
): Set<string> => {
  const descendants = new Set<string>();
  const stack: string[] = [id];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    folders.forEach((f) => {
      if (normalize(f.parentId) === current && !descendants.has(f.id)) {
        descendants.add(f.id);
        stack.push(f.id);
      }
    });
  }
  return descendants;
};

export const wouldCreateCycle = (
  folders: Folder[],
  folderId: string,
  newParentId: string | null
): boolean => {
  if (!newParentId) return false;
  if (newParentId === folderId) return true;
  return getDescendantIds(folders, folderId).has(newParentId);
};

export const formatFolderPath = (
  folders: Folder[],
  id: string | null,
  separator = ' › '
): string =>
  getFolderPath(folders, id)
    .map((f) => f.name)
    .join(separator);
