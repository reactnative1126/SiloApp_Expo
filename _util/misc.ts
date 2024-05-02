import { API_URL } from "../config";
import { defaultLanguageTag } from "../translations";

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
  return x.slice(0, num - 3) + "...";
}

export const formatBalance = (x: number, token: string = "$", decimal: number = 2) => {
  const num = Math.abs(x).toFixed(decimal);
  const sign = x >= 0 ? "" : "-";
  return sign + token + num;
}

export const getApiUrl = (path: string) => {
  return API_URL + path;
}

export function formatNumber(number: number | string | undefined) {
  return new Intl.NumberFormat(defaultLanguageTag, {}).format(Number(number));
}