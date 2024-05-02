import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { formatCurrency } from 'react-native-format-currency';

import { API_URL } from '../../config';
import { defaultLanguageTag } from './tanslations';
import { LOGGING_ENABLED } from '../../config';

// export function log() {
//   if (LOGGING_ENABLED) {
//     // eslint-disable-next-line prefer-rest-params
//     const args = [...arguments];
//     for (let i = 0; i < args.length; i += 1) {
//       // eslint-disable-next-line no-console
//       console.log(args[i]);
//     }
//   }
// };

export const log = (message: string, type?: string) => {
  if (LOGGING_ENABLED) {
    if (type === 'info') {
      console.log(`\x1b[33mInfo: `, `\x1b[37m${message}`);
    } else if (type === 'success') {
      console.log(`\x1b[32mSuccess: `, `\x1b[37m${message}`);
    } else {
      console.log(`\x1b[31mError: `, `\x1b[37m${message}`);
    }
  }
}

export const navOptionHandler = () => ({
  headerShown: false
});

// Return Less String with ...
export const isShort = (str: string, length: number) => {
  return str?.length > length ? `${str.substring(0, length)} ...` : str
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const isPublicKey = (x: unknown): x is number => {
  return (typeof x == 'object');
}

export const formatAddress = (address: string) => {
  if (!address) return '';
  return address.length > 10
    ? `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`
    : address;
};

export const truncateString = (x: string, num: number) => {
  if (x.length <= num) return x;
  return x.slice(0, num - 3) + '...';
}

export const formatBalance = (x: number, token: string = '$', decimal: number = 2) => {
  const num = Math.abs(x).toFixed(decimal);
  const sign = x >= 0 ? '' : '-';
  return sign + token + num;
}

export const getApiUrl = (path: string) => {
  return API_URL + path;
}

export function formatNumber(number: number | string | undefined) {
  return new Intl.NumberFormat(defaultLanguageTag, {}).format(Number(number));
}

export function formattedCurrency(amount: number | string | undefined, code: string | undefined, type?: string) {
  if (type === 'amount') {
    return formatCurrency({ amount: Number(amount || 0), code: code || 'USD' })[1];
  } else {
    return formatCurrency({ amount: Number(amount || 0), code: code || 'USD' })[0];
  }
}

// export function formatCurrency(text: string) {
//   // Remove all non-numeric characters except for the dot
//   let cleaned = text.replace(/[^0-9.]/g, '');

//   // Check if the text has a decimal point
//   if (cleaned.includes('.')) {
//     // Split the string into whole and decimal parts
//     const [integer, decimal] = cleaned.split('.');

//     // Format the integer part with commas
//     const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

//     // Combine integer and decimal parts
//     return `${formattedInteger}.${decimal}`;
//   } else {
//     // Format the whole number part with commas
//     return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
//   }
// };

export const iOSDevice = () => {
  return Platform.OS === 'ios' && (
    Device.deviceName === 'iPhone X' ||
    Device.deviceName === 'iPhone XS' ||
    Device.deviceName === 'iPhone XS Max' ||
    Device.deviceName === 'iPhone XR' ||
    Device.deviceName === 'iPhone 11' ||
    Device.deviceName === 'iPhone 11 Pro' ||
    Device.deviceName === 'iPhone 11 Pro Max' ||
    Device.deviceName === 'iPhone 12 mini' ||
    Device.deviceName === 'iPhone 12' ||
    Device.deviceName === 'iPhone 12 Pro' ||
    Device.deviceName === 'iPhone 12 Pro Max' ||
    Device.deviceName === 'iPhone 13 mini' ||
    Device.deviceName === 'iPhone 13' ||
    Device.deviceName === 'iPhone 13 Pro' ||
    Device.deviceName === 'iPhone 13 Pro Max' ||
    Device.deviceName === 'iPhone 14' ||
    Device.deviceName === 'iPhone 14 Plus' ||
    Device.deviceName === 'iPhone 14 Pro' ||
    Device.deviceName === 'iPhone 14 Pro Max' ||
    Device.deviceName === 'iPhone 15' ||
    Device.deviceName === 'iPhone 15 Plus' ||
    Device.deviceName === 'iPhone 15 Pro' ||
    Device.deviceName === 'iPhone 15 Pro Max'
  )
};