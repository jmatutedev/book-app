import { CustomList } from '../models/custom-list/custom-list.model';

const MAX_LISTS = 3;
const MAX_NAME_LENGTH = 50;
const VALID_NAME_REGEX = /^[A-Za-zÀ-ÿ0-9 _\-.,'()!?]+$/;

export function validateListName(
  rawName: string,
  existingLists: CustomList[],
  editingListId?: string,
): string | null {
  const name = (rawName ?? '').trim();

  if (!name) return 'El nombre no puede estar vacío.';
  if (name.length > MAX_NAME_LENGTH) {
    return `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres.`;
  }
  if (!VALID_NAME_REGEX.test(name)) {
    return 'El nombre contiene caracteres no permitidos.';
  }

  const duplicate = existingLists.some(
    (list) =>
      list.id !== editingListId &&
      list.name.trim().toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) return 'Ya existe una lista con ese nombre.';

  return null;
}

export function canCreateMoreLists(existingLists: CustomList[]): boolean {
  return existingLists.length < MAX_LISTS;
}

export function getMaxLists(): number {
  return MAX_LISTS;
}

