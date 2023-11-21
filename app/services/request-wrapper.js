
import axios from 'axios';
import { useRecoilValue } from 'recoil';

import { authAtom } from '@stores/auth/auth.state';

import { isLog, getRequestHeader, getDataFromResponse } from '@services/functions';

export function useRequestWrapper() {
  const auth = useRecoilValue(authAtom);

  async function post(url, body = {}) {
    const requestConfig = auth.token ? getRequestHeader(auth.token) : getRequestHeader();
    const resp = await axios.post(url, body, requestConfig);
    return getDataFromResponse(resp);
  }

  async function put(url, body = {}) {
    const requestConfig = auth.token ? getRequestHeader(auth.token) : getRequestHeader();
    const resp = await axios.put(url, body, requestConfig);
    return getDataFromResponse(resp);
  }

  async function get(url, params = {}, token) {
    isLog(3, `auth token: ${token}`);
    const requestConfig = (token ?? auth.token) ? getRequestHeader(auth.token) : getRequestHeader();
    const pr = Object.keys(params).length ? '?' + Object.values(params).map(x => `${x[0]}=${x[1]}`).join('&') : '';
    const resp = await axios.get(url + pr, requestConfig);
    return getDataFromResponse(resp);
  }

  async function del(url) {
    const requestConfig = auth.token ? getRequestHeader(auth.token) : getRequestHeader();
    const resp = await axios.delete(url, requestConfig);
    return getDataFromResponse(resp);
  }

  return {
    post,
    get,
    del,
    put
  };
}
