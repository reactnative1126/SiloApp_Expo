import axios from 'axios';
import { useRecoilState } from 'recoil';

import { authAtom } from './auth.state';
import { AuthResponse } from './auth.types';
import { useAnalyticsActions } from '../analytics/analytics.actions';
import { AnalyticsEvents } from '../analytics/analytics.types';
import { useUserActions } from '../user/user.actions';
import { userAtom } from '../user/user.state';

import { log, getApiUrl } from '../../utils/functions';
import { useSession } from '../../utils/context/ctx';
import {
  getRequestConfig,
  getApiResponse,
  getApiErrorResponse,
  ApiResponse
} from '../../utils/requests';

function useAuthActions() {
  const userActions = useUserActions();
  const analyticsActions = useAnalyticsActions();
  const [auth, setAuth] = useRecoilState(authAtom);
  const [user, setUser] = useRecoilState(userAtom);
  const { signIn, signOut } = useSession();

  async function register(firstName: string, lastName: string, username: string, email: string, password: string, localCurrency: object, defaultErrorMsg: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const resp = await axios.post(getApiUrl('/auth/register'), { firstName, lastName, username, email, password, localCurrency }, getRequestConfig(''));
      const apiResponse = getApiResponse<AuthResponse>(resp, defaultErrorMsg);

      // Set the access token - not available in web
      // await SecureStore.setItemAsync(SECURE_STORAGE_ACCESS_TOKEN, res.tokens.access.value);

      // To read the access token (in the future)
      // await SecureStore.getItemAsync(`access_demo1234`);

      if (apiResponse.success) {
        const data = apiResponse.data;
        const userDto = data.user;
        setAuth({ token: data.authToken, authed: true });
        setUser(userDto);

        // populate user on login
        await analyticsActions.identify(userDto.id.toString());
        analyticsActions.trackEvent(AnalyticsEvents.Registered);
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, defaultErrorMsg);
    }
  }

  async function login(username: string, password: string, defaultErrorMsg: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const resp = await axios.post(getApiUrl('/auth/login'), { username, password }, getRequestConfig(''));
      const apiResponse = getApiResponse<AuthResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const data = apiResponse.data;
        const userDto = data.user;
        setAuth({ token: data.authToken, authed: true });
        setUser(userDto);
        signIn(JSON.stringify({
          auth: { token: data.authToken, authed: true },
          user: userDto
        }));

        await analyticsActions.identify(userDto.id.toString());
        analyticsActions.trackEvent(AnalyticsEvents.LoggedIn);
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, defaultErrorMsg);
    }
  }

  async function logout() {
    // todo: clean up local storage if we need to, call backend to destroy session
    try {
      await axios.post(getApiUrl('/auth/logout'), {}, getRequestConfig(auth.token || ''));
      analyticsActions.trackEvent(AnalyticsEvents.LoggedOut);
      log('Logout', 'success');
    } catch (error) {
      log(`Logout error: ${error}`);
    } finally {
      signOut();
      setAuth({ token: null, authed: false });
      userActions.removeUser();
    }
  }

  async function requestPhoneVerification(phoneNumber: string, defaultErrorMsg: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const resp = await axios.post(getApiUrl('/auth/phone-verification-request'), { phone: phoneNumber }, getRequestConfig(''));
      const apiResponse = getApiResponse<AuthResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const data = apiResponse.data;
        setAuth({ ...auth, phoneVerfication: { requestId: data.requestId } });
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, defaultErrorMsg);
    }
  }

  async function verifyPhone(requestId: string | undefined, code: string, defaultErrorMsg: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const resp = await axios.post(getApiUrl('/auth/phone-verification'), { requestId, code }, getRequestConfig(''));
      const apiResponse = getApiResponse<AuthResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        // const data = apiResponse.data;
        setAuth({ ...auth, phoneVerfication: { isVerified: true, requestId } });

        await analyticsActions.identify(code.toString());
        analyticsActions.trackEvent(AnalyticsEvents.PhoneVerified);
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, defaultErrorMsg);
    }
  }

  async function verifyPIN(code: string, defaultErrorMsg: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const resp = await axios.post(getApiUrl('/auth/verify-pin'), { pin: code }, getRequestConfig(auth.token || ''));
      const apiResponse = getApiResponse<AuthResponse>(resp, defaultErrorMsg);

      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, defaultErrorMsg);
    }
  }

  async function changePIN(code: string, defaultErrorMsg: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const resp = await axios.post(getApiUrl('/auth/change-pin'), { pin: code }, getRequestConfig(auth.token || ''));
      const apiResponse = getApiResponse<AuthResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        // const data = apiResponse.data;
        setAuth({ ...auth, phoneVerfication: { ...auth.phoneVerfication, code: code } });
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, defaultErrorMsg);
    }
  }

  return {
    login,
    register,
    logout,
    requestPhoneVerification,
    verifyPhone,
    verifyPIN,
    changePIN
  }
}

export { useAuthActions };
