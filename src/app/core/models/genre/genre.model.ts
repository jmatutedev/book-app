export interface Genre {
  id: string;
  label: string;
}

export const GENRES: Genre[] = [
  { id: 'fantasy', label: 'Fantasía' },
  { id: 'mystery', label: 'Misterio' },
  { id: 'romance', label: 'Romance' },
  { id: 'science_fiction', label: 'Ciencia ficción' },
];
