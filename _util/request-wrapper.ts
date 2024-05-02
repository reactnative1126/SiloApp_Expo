import {useRecoilValue} from 'recoil';
import axios from "axios";
import {getApiUrl} from "./misc";
import {getAuthedRequestConfig, getDataFromResponse, getRequestConfig} from "./requests";
import {authAtom} from "../_recoil/auth/auth.state";
import {log} from "./debug";

interface GetParams {
  [key: string]: string,
}

export function useRequestWrapper() {
  const auth = useRecoilValue(authAtom);

  async function post(url: string, body: unknown = {}): Promise<unknown> {
    const requestConfig = auth.token ? getAuthedRequestConfig(auth.token) : getRequestConfig();
    const resp = await axios.post(getApiUrl(url), body, requestConfig);
    return getDataFromResponse(resp) || resp.data;
  }

  async function put(url: string, body: unknown = {}): Promise<unknown> {
    const requestConfig = auth.token ? getAuthedRequestConfig(auth.token) : getRequestConfig();
    const resp = await axios.put(getApiUrl(url), body, requestConfig);
    return getDataFromResponse(resp) || resp.data;
  }

  async function get (url: string, params: GetParams = {}, token?: string): Promise<unknown> {    
    const requestConfig = (token ?? auth.token) ? getAuthedRequestConfig((token ?? auth.token)!) : getRequestConfig();
    const pr = Object.keys(params).length ? "?" + Object.values(params).map(x => `${x[0]}=${x[1]}`).join("&") : "";
    const resp = await axios.get(getApiUrl(url) + pr, requestConfig);
    return getDataFromResponse(resp);
  }

  async function del (url: string): Promise <unknown> {
    const requestConfig = auth.token ? getAuthedRequestConfig(auth.token) : getRequestConfig();
    const resp = await axios.delete(getApiUrl(url), requestConfig);
    return getDataFromResponse(resp);
  }

  return {
    post,
    get,
    del,
    put
  };

}
