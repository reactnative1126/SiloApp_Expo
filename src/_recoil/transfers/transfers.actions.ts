import { useRecoilState } from 'recoil';

import { payTargetAtom } from './transfers.state';
import { GetPayTargetResponse, SendPaymentResponse } from './transfers.types';
import { userAtom } from '../user/user.state';

import {
  getApiResponse,
  getApiErrorResponse,
  ApiResponse
} from '../../utils/requests';
import { useRequestWrapper } from '../../utils/request-wrapper';

export function useTransfersActions() {
  const requestWrapper = useRequestWrapper();
  const [, setPayTarget] = useRecoilState(payTargetAtom);
  const [, setUser] = useRecoilState(userAtom);

  const getPayTarget = async (targetType: string, targetId: string | number, defaultErrorMsg: string): Promise<ApiResponse<GetPayTargetResponse>> => {
    try {
      const resp = await requestWrapper.post(`/transfers/pay-target`, { targetType, targetId });
      const apiResponse = getApiResponse<GetPayTargetResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const { payTarget } = apiResponse.data;
        setPayTarget(payTarget);
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, 'Couldn\'t fetch pay target.');
    }
  }

  const sendPayment = async (targetType: string, targetId: string | number, amount: number, currency: string | undefined, defaultErrorMsg: string): Promise<ApiResponse<SendPaymentResponse>> => {
    try {
      const resp = await requestWrapper.post(`/transfers/pay`, { targetType, targetId, amount, currency });
      const apiResponse = getApiResponse<SendPaymentResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const { user } = apiResponse.data;
        setUser(user);
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, 'Couldn\'t pay.');
    }
  }

  return {
    getPayTarget,
    sendPayment
  }
}