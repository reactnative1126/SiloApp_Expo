import { useSetRecoilState } from 'recoil';

import { systemInfoAtom } from './system.state';
import { GetSystemInfoResponse } from './system.types';

import {
  getApiResponse,
  getApiErrorResponse,
  ApiResponse
} from '../../utils/requests';
import { useRequestWrapper } from '../../utils/request-wrapper';

export function useSystemActions() {
  const requestWrapper = useRequestWrapper();
  const setSystemInfo = useSetRecoilState(systemInfoAtom);

  const getSystemInfo = async (defaultErrorMsg: string): Promise<ApiResponse<GetSystemInfoResponse>> => {
    try {
      const resp = await requestWrapper.get('/system/info');
      const apiResponse = getApiResponse<GetSystemInfoResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const data = apiResponse.data;
        setSystemInfo(data);
      }
      return apiResponse; // data;
    } catch (error) {
      return getApiErrorResponse(error, 'Couldn\'t get Information.');
    }
  }

  const submitFeedback = async (rating: number, comment: string, defaultErrorMsg: string): Promise<ApiResponse<unknown>> => {
    try {
      const resp = await requestWrapper.post(`/system/feedback`, { rating: rating.toString(), comment });
      const apiResponse = getApiResponse<unknown>(resp, defaultErrorMsg);

      return apiResponse; // data;
    } catch (error) {
      return getApiErrorResponse(error, 'Couldn\'t submit feedback.');
    }
  }

  return {
    getSystemInfo,
    submitFeedback
  }
}