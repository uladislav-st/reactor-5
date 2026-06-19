export enum SymbolType {
  Symbol1 = 1,
  Symbol2 = 2,
  Symbol3 = 3,
  Symbol4 = 4,
  Symbol5 = 5,
  Symbol6 = 6,
  Symbol7 = 7,
  Symbol8 = 8,
  Symbol9 = 9,
  Symbol10 = 10,
  Scatter = 11,
}

export function isSymbolType(value: number): value is SymbolType {
  return value >= SymbolType.Symbol1 && value <= SymbolType.Scatter;
}

export function isScatterSymbol(value: number): boolean {
  return value === SymbolType.Scatter;
}
