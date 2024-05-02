export const formatAddress = (address: any) => {
  if (!address) return '';
  if (typeof address == 'object') {
    // assume this is a PublicKey
    address = address.toBase58();
  }
  return `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`;
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

export const formatCurrency = (currency: string, locale: string, decimals: number, amount: number): string => {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
    currencyFormatters.set(currency, formatter);
  }
  return formatter.format(amount);
}

export const formatUsd = (amount: number): string => {
  return formatCurrency('USD', 'en-US', 2, amount);
}
