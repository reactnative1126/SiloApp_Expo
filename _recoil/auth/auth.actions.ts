import { useRecoilState } from 'recoil';
import axios from "axios";
import { authAtom } from "./auth.state";
import { useAnalyticsActions } from "../analytics/analytics.actions";
import { useUserActions } from "../user/user.actions";
import { getApiUrl } from "../../_util/misc";
import { getAuthedRequestConfig, getRequestConfig, getDataFromResponse } from "../../_util/requests";
import { AuthResponse } from "./auth.types";
import { log } from "../../_util/debug";
import { AnalyticsEvents } from "../analytics/analytics.types";
import { UserState } from "../user/user.types";
import Userfront from "@userfront/core";
import Toast from 'react-native-toast-message';
import { userAtom } from '../user/user.state';
import { useSession } from '../../context/ctx';


function useAuthActions() {
  const [auth, setAuth] = useRecoilState(authAtom);
  const [user, setUser] = useRecoilState(userAtom);
  const { signIn, signOut } = useSession();

  const analyticsActions = useAnalyticsActions();
  const userActions = useUserActions();

  // register w/userfront jwt token
  async function register(username: string, email: string, password: string, localCurrency: object): Promise<any> {
    try {
      const resp = await axios.post(getApiUrl("/auth/register"),
        {
          username,
          email,
          password,
          localCurrency
        },
        getRequestConfig());
      const data = getDataFromResponse(resp) as AuthResponse;

      // Set the access token - not available in web
      // await SecureStore.setItemAsync(SECURE_STORAGE_ACCESS_TOKEN, res.tokens.access.value);

      // To read the access token (in the future)
      // await SecureStore.getItemAsync(`access_demo1234`);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'signup success'
      });

      const userDto = data.user;

      setAuth({ token: data.authToken, authed: true });
      setUser(userDto);

      // populate user on login
      // userActions.populateUser(userDto);
      await analyticsActions.identify(data.user.id.toString());
      analyticsActions.trackEvent(AnalyticsEvents.Registered);
      // return userDto.message;
      return data;

    } catch (err) {
      // check if it's an AxiosError
      let message = "Error registering user";
      if (axios.isAxiosError(err)) {
        log(`error registering user: `, err.response?.data?.message);

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err.response?.data?.message
        });

        return err.response?.data;
      } else {
        log(`error registering user: `, err);

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err as string
        });
      }
      return message;
    }
  }

  async function login(username: string, password: string) {
    try {
      const resp = await axios.post(getApiUrl("/auth/login"), { username, password }, getRequestConfig());
      const data: any = getDataFromResponse(resp);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'login success'
      });

      const user = data['user'] as UserState;

      setAuth({ token: data.authToken, authed: true });
      setUser(user);
      signIn(JSON.stringify({
        auth: { token: data.authToken, authed: true },
        user
      }));

      // userActions.populateUser(data, authToken);
      await analyticsActions.identify(user.id.toString());
      analyticsActions.trackEvent(AnalyticsEvents.LoggedIn);
      return data;
    } catch (err) {
      log(`error logging in user: `, err);
      if (axios.isAxiosError(err)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err.response?.data?.message
        });
        log(`error registering user: `, err.response?.data?.message);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err as string
        });
        log(`error registering user: `, err);
      }
    }
  }

  async function logout() {
    // todo: clean up local storage if we need to, call backend to destroy session
    log("LOGOUT");
    try {
      await axios.post(getApiUrl("/auth/logout"), {}, getAuthedRequestConfig(auth.token || ''));
    } catch (error) {
      log('logout err', error);
    }

    signOut();
    setTimeout(() => {
      setAuth({ token: null, authed: false });
      userActions.removeUser();
    }, 1000);

    analyticsActions.trackEvent(AnalyticsEvents.LoggedOut);
  }

  async function requestPhoneVerification(phoneNumber: string) {
    try {
      const resp = await axios.post(getApiUrl("/auth/phone-verification-request"), { phone: phoneNumber }, getRequestConfig());
      const data: any = getDataFromResponse(resp);

      setAuth({ ...auth, phoneVerfication: { requestId: data.requestId } });
      return data;
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err as string
      });
      log(`error requesting-phone-verification: `, err);
    }
  }

  async function verifyPhone(requestId: string | undefined, code: string) {
    try {
      if (requestId && code) {
        const resp = await axios.post(getApiUrl("/auth/phone-verification"), { requestId, code }, getRequestConfig());

        const data: any = getDataFromResponse(resp);

        setAuth({ ...auth, phoneVerfication: { isVerified: true, requestId } });

        await analyticsActions.identify(code.toString());
        analyticsActions.trackEvent(AnalyticsEvents.PhoneVerified);
        return true;
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err as string
      });
      log(`error verify-phone: `, err);
    }
  }


  // function logout() {
  //     remove user from local storage, set auth state to null and redirect to login page
  // localStorage.removeItem('user');
  // setAuth(null);
  // history.push('/login');
  // }


  return {
    login,
    register,
    logout,
    requestPhoneVerification,
    verifyPhone
  }

}

export { useAuthActions };
