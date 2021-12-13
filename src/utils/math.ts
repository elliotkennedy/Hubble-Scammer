export const roundUp = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export const roundDown = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.ceil(value * factor) / factor;
}
