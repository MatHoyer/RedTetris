export type TCell = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z' | 'Empty';

export const Block = {
  I: 'I',
  J: 'J',
  L: 'L',
  O: 'O',
  S: 'S',
  T: 'T',
  Z: 'Z',
} as Record<string, TCell>;

export const EmptyCell = 'Empty' as TCell;
