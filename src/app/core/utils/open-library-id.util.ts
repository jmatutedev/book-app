const WORKS_PREFIX = '/works/';

export function toWorkKey(id: string): string {
  const value = (id ?? '').trim();
  if (!value) return value;

  if (value.startsWith(WORKS_PREFIX)) return value;
  if (value.startsWith('works/')) return `/${value}`;
  return `${WORKS_PREFIX}${value}`;
}

export function toWorkSlug(id: string): string {
  const key = toWorkKey(id);
  return key.startsWith(WORKS_PREFIX) ? key.slice(WORKS_PREFIX.length) : key;
}

