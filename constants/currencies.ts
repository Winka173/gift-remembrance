export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$',  name: 'US Dollar',          flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',  name: 'Euro',               flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',  name: 'British Pound',      flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',       flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',       flag: '🇨🇳' },
  { code: 'VND', symbol: '₫',  name: 'Vietnamese Dong',    flag: '🇻🇳' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',  flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',    flag: '🇨🇦' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',        flag: '🇨🇭' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar',  flag: '🇭🇰' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',   flag: '🇸🇬' },
  { code: 'KRW', symbol: '₩',  name: 'South Korean Won',  flag: '🇰🇷' },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee',       flag: '🇮🇳' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah',  flag: '🇮🇩' },
  { code: 'THB', symbol: '฿',  name: 'Thai Baht',          flag: '🇹🇭' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit',  flag: '🇲🇾' },
  { code: 'PHP', symbol: '₱',  name: 'Philippine Peso',    flag: '🇵🇭' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso',      flag: '🇲🇽' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real',     flag: '🇧🇷' },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand', flag: '🇿🇦' },
];

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const DEFAULT_CURRENCY = 'USD';
