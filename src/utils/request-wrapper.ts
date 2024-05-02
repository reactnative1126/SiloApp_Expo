
import axios, { AxiosResponse } from 'axios';
import { useRecoilValue } from 'recoil';

import { authAtom } from '../_recoil/auth/auth.state';

import { getApiUrl } from './functions';
import { getRequestConfig } from './requests';

interface GetParams {
  [key: string]: string,
}

export function useRequestWrapper() {
  const auth = useRecoilValue(authAtom);

  async function post(url: string, body: unknown = {}): Promise<AxiosResponse<any, any>> {
    const requestConfig = auth.token ? getRequestConfig(auth.token) : getRequestConfig('');
    const resp = await axios.post(getApiUrl(url), body, requestConfig);
    return resp;
  }

  async function put(url: string, body: unknown = {}): Promise<AxiosResponse<any, any>> {
    const requestConfig = auth.token ? getRequestConfig(auth.token) : getRequestConfig('');
    const resp = await axios.put(getApiUrl(url), body, requestConfig);
    return resp;
  }

  async function get(url: string, params: GetParams = {}, token?: string): Promise<AxiosResponse<any, any>> {
    const requestConfig = (token ?? auth.token) ? getRequestConfig((token ?? auth.token)!) : getRequestConfig('');
    const pr = Object.keys(params).length ? '?' + Object.values(params).map(x => `${x[0]}=${x[1]}`).join('&') : '';
    const resp = await axios.get(getApiUrl(url) + pr, requestConfig);
    return resp;
  }

  async function del(url: string): Promise<AxiosResponse<any, any>> {
    const requestConfig = auth.token ? getRequestConfig(auth.token) : getRequestConfig('');
    const resp = await axios.delete(getApiUrl(url), requestConfig);
    return resp;
  }

  return {
    post,
    get,
    del,
    put
  };
}
