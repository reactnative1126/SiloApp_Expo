import { PublicKey } from "@solana/web3.js";
import fs from "fs";
import * as Papa from "papaparse";

const crypto = require("crypto");

export function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function takeFirstN(array, n) {
  if (array.length <= n) {
    return array;
  } else {
    return array.slice(0, n);
  }
}

export function readCsvSync(filePath: string): any[] {
  const fileContent = fs.readFileSync(filePath, "utf8");

  let data: any[] = [];
  Papa.parse(fileContent, {
    header: true,
    step: (result) => {
      data.push(result.data);
    },
    complete: () => {
    },
    error: (error) => {
      throw error;
    }
  });

  return data;
}

export function chunkArray(myArray: any[], chunkSize: number) {
  var results = [];
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize));
  }
  return results;
}

// given a string, returns true if any of the given subsrings are a substring in the first string
export function hasSubstring(str: string, substrings: string[]): boolean {
  if (!str) {
    return false;
  }
  for (let i = 0; i < substrings.length; i++) {
    if (str.includes(substrings[i])) {
      return true;
    }
  }
  return false;
}

// given an array, selects the "best" string
export function selectString(strings: string[]) {
  for (let i = 0; i < strings.length; i++) {
    if (strings[i] && strings[i].length > 0) {
      return strings[i];
    }
  }
  return null;
}

// tests if an object has a key
export function hasKey(key: string, object: object | unknown): object is { [key: string]: unknown } {
  // @ts-ignore
  return key in object;
}

// tests whether 2 numbers are within a certain threshold of each other. percentThreshold: 0.005 = 0.5%
export function isWithinPercentThreshold(num1, num2, percentThreshold) {
  const difference = Math.abs(num1 - num2);
  const average = (num1 + num2) / 2;
  const percentDifference = difference / average;
  return percentDifference <= percentThreshold;
}

export function getEmailDomain(email: string) {
  return email.substring(email.lastIndexOf("@") + 1);
}

export function createRandomToken(str: string) {
  var seed = crypto.randomBytes(20);
  return crypto.createHash("sha256").update(seed + str).digest("hex");
}

export function createRandomNumericString(length: number) {
  var seed = crypto.randomBytes(length);
  return crypto.createHash('sha256').update(seed).digest('hex').substring(0, length);
}

export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

export function isSolanaAddress(address: string): boolean {
  if (address.length >= 32 && address.length <= 44) {
    try {
      const pk = new PublicKey(address);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}
