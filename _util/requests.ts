import {AxiosRequestConfig, AxiosResponse} from "axios";
import {log} from "./debug";

export function getAuthedRequestConfig(token: string): AxiosRequestConfig {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // for cookies
    withCredentials: true
  };
}

export function getRequestConfig(): AxiosRequestConfig {
  return {
    headers: {
      "Content-Type": "application/json",
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
    log('error from request: ', resp);
    if (data?.message) {
      throw new Error(data.message);
    } else {
      throw new Error('Unknown server error');
    }
  }
}
