import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { log } from './functions';

export function getRequestConfig(token: string): AxiosRequestConfig {
  return token !== '' ? {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    // for cookies
    withCredentials: true
  } : {
    headers: {
      'Content-Type': 'application/json',
    },
    // for cookies
    withCredentials: true
  };
}

// retrieves the data object from an api response or throws an error
// successful api server responses have the form:
// { success: true, data: [payload]}
// unsuccessful api server responses have the form:
// { success: false, message: [error message]}

export function getDataFromResponse(resp: AxiosResponse): unknown {
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
    log(`from request: ${resp}`, 'info');
    if (data?.message) {
      throw new Error(data.message);
    } else {
      throw new Error('Unknown server error');
    }
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;            // if success = false, there should be no data
  message?: string;   // if success = false, there should be a message
}

export function getApiResponse<T>(resp: AxiosResponse, defaultErrorMessage: string): ApiResponse<T> {
  const data = resp?.data;
  if (data) {
    if (data.success) {
      return {
        success: true,
        data: data.data
      }
    } else {
      // @ts-ignore
      return {
        success: false,
        message: data.message ?? defaultErrorMessage
      };
    }
  } else {
    // @ts-ignore
    return {
      success: false,
      message: defaultErrorMessage
    };
  }
}

export function getApiErrorResponse<T>(err: any, defaultErrorMessage: string): ApiResponse<T> {
  return {
    success: false,
    data: err.response?.data?.data,
    message: err.response?.data?.message ?? defaultErrorMessage
  };
}
