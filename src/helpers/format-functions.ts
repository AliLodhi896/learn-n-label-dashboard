export const currencyFormat = (amount: number, options: Intl.NumberFormatOptions = {}) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'usd',
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
    useGrouping: true,
    notation: 'standard',
    ...options,
  }).format(amount);
};

export const numberFormat = (amount: number, options: Intl.NumberFormatOptions = {}) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    useGrouping: true,
    notation: 'standard',
    ...options,
  }).format(amount);
};