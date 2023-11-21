import { Platform } from 'react-native';

export class Tokens {
  static authToken = null;
}

export const navOptionHandler = () => ({
  headerShown: false
});

export const isEmpty = (data) => {
  return !data || data == undefined || data == null ||
    (typeof data === 'string' && data == '') ||
    (typeof data === 'array' && data.length == 0);
};

export const isPrice = (amount, currency) => {
  return `${(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: currency
  })}`
};

export const isEmail = (email) => {
  let email_ = email.trim();
  var expression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return expression.test(String(email_).toLowerCase());
};

export const isLength = (value, length) => {
  if (value.length >= length) {
    return true;
  }
  return false;
}

export const isShort = (data, length) => {
  return data?.length > length ? `${data.substring(0, length)}...` : data
};

export const isLog = (type, message) => {
  if (type === 1) {
    console.log(`\x1b[31mError: `, `\x1b[37m${message}`);
  } else if (type === 2) {
    console.log(`\x1b[32mSuccess: `, `\x1b[37m${message}`);
  } else if (type === 3) {
    console.log(`\x1b[33mInfo: `, `\x1b[37m${message}`);
  } else if (type === 4) {
    console.log(`\x1b[35mMessage: `, `\x1b[37m${message}`);
  } else if (type === 5) {
    console.log(`\x1b[36mQueen: `, `\x1b[37m${message}`);
  }
};

export const toURL = ({ url, id, query }) => {
  let newURL = id ? `${url}/${id}${query ? '?' : ''}` : url + '?';
  let keys = Object.keys(query || {});
  keys.map((key) => {
    let value = query[key];
    if (value != undefined || value != null) {
      if (typeof value === 'object' && value.length) {
        for (let i = 0; i < value.length; i++) {
          newURL += `${key}=${value[i]}&`;
        }
      } else {
        newURL += `${key}=${value}&`;
      }
    }
  });

  if (newURL.includes('&')) {
    let lastIndex = newURL.lastIndexOf('&');
    newURL = newURL.substring(0, lastIndex);
  }
  return newURL;
};

export function getRequestHeader(token) {
  return !token ? {
    headers: {
      'Content-Type': 'application/json',
    },
    // for cookies
    withCredentials: true
  } :
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // for cookies
      withCredentials: true
    };
}

export const getDataFromResponse = (resp) => {
  const data = resp?.data;
  if (resp.status === 200 || resp.status === 201) {
    if (data?.success) {
      return data.data;
    } else {
      if (data?.message) {
        throw new Error(data.message);
      } else {
        throw new Error('Unknown server error');
      }
    }
  } else {
    isLog(1, `error from request: ${resp}`);
    if (data?.message) {
      throw new Error(data.message);
    } else {
      throw new Error('Unknown server error');
    }
  }
}

// export const iOSDevice = () => {
//   return Platform.OS === 'ios' && (
//     DeviceInfo.getModel() === 'iPhone X' ||
//     DeviceInfo.getModel() === 'iPhone XS' ||
//     DeviceInfo.getModel() === 'iPhone XS Max' ||
//     DeviceInfo.getModel() === 'iPhone XR' ||
//     DeviceInfo.getModel() === 'iPhone 11' ||
//     DeviceInfo.getModel() === 'iPhone 11 Pro' ||
//     DeviceInfo.getModel() === 'iPhone 11 Pro Max' ||
//     DeviceInfo.getModel() === 'iPhone 12 mini' ||
//     DeviceInfo.getModel() === 'iPhone 12' ||
//     DeviceInfo.getModel() === 'iPhone 12 Pro' ||
//     DeviceInfo.getModel() === 'iPhone 12 Pro Max' ||
//     DeviceInfo.getModel() === 'iPhone 13 mini' ||
//     DeviceInfo.getModel() === 'iPhone 13' ||
//     DeviceInfo.getModel() === 'iPhone 13 Pro' ||
//     DeviceInfo.getModel() === 'iPhone 13 Pro Max'
//   )
// };