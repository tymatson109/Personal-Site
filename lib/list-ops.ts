// Immutable list edits the editor uses for its blocks and facts

export function insertAt<T>(list: readonly T[], index: number, ...items: T[]): T[] {
  return [...list.slice(0, index), ...items, ...list.slice(index)];
}

export function removeAt<T>(list: readonly T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

export function replaceAt<T>(list: readonly T[], index: number, item: T): T[] {
  return list.map((current, i) => (i === index ? item : current));
}

/** Moves one item to a new position; an out-of-range move leaves the list as it was. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return [...list];
  const next = removeAt(list, from);
  return insertAt(next, to, list[from]);
}
