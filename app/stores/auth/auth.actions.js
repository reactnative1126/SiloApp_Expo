import axios from 'axios';

import { useRecoilState } from 'recoil';
import Userfront from '@userfront/core';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog, getRequestHeader, getDataFromResponse } from '@services/functions';
import { authAtom, phoneAtom } from '@stores/auth/auth.state';
import { loadingAtom } from '@stores/normal/normal.state';

import { useAnalyticsActions } from '@stores/analytics/analytics.actions';
import { AnalyticsEvents } from '@stores/analytics/analytics.types';
import { useUserActions } from '@stores/user/user.actions';

function useAuthActions() {
    const [auth, setAuth] = useRecoilState(authAtom);
    const [phone, setPhone] = useRecoilState(phoneAtom);
    const [loading, setLoading] = useRecoilState(loadingAtom);

    const analyticsActions = useAnalyticsActions();
    const userActions = useUserActions();

    // get phone verification code
    async function phoneRequest(navigation, number) {

        try {
            setLoading(true);
            const resp = await axios.post(Urls.PHONE_VERIFICATION_REQUEST, {
                phone: number
            }, getRequestHeader());

            const data = getDataFromResponse(resp);

            isLog(4, `phone(${number}) verification response data: ${JSON.stringify(data)}`);

            setPhone({ requestId: data['requestId'], success: false });
            navigation.navigate('PhoneVerify', { params: number });

        } catch (error) {
            isLog(1, `error phone verification: ${error}`);
            if (axios.isAxiosError(error)) {
                isLog(1, `error phone verification: ${error.response?.data?.message}`);
            } else {
                isLog(1, `error phone verification: ${error}`);
            }
        } finally {
            setLoading(false);
        }
    }

    // send phone verification code
    async function phoneVerify(navigation, number) {

        try {
            setLoading(true);
            const resp = await axios.post(Urls.PHONE_VERIFICATION, {
                requestId: phone.requestId,
                code: number
            }, getRequestHeader());

            const data = getDataFromResponse(resp);

            isLog(4, `code(${number}) verification response data: ${JSON.stringify(data)}`);

            setPhone({ requestId: phone.requestId, success: data.success === 'true' ? true : false });
            navigation.navigate('Main');

        } catch (error) {
            isLog(1, `error verification code: ${error}`);
            if (axios.isAxiosError(error)) {
                isLog(1, `error verification code: ${error.response?.data?.message}`);
            } else {
                isLog(1, `error verification code: ${error}`);
            }
        } finally {
            setLoading(false);
        }
    }

    // register w/userfront jwt token
    async function register(username, email, password) {
        const res = await Userfront.signup({
            method: 'password',
            email,
            password,
            username,
            redirect: false,
        });

        isLog(3, `userfront register response: ${res}`);
        const authToken = res.tokens?.access.value;

        try {
            const resp = await axios.post(Urls.SIGNUP, {}, getRequestHeader(authToken));
            isLog(3, `chainfi register response: ${resp}`);
            const data = getDataFromResponse(resp);

            // Set the access token - not available in web
            // await SecureStore.setItemAsync(SECURE_STORAGE_ACCESS_TOKEN, res.tokens.access.value);

            // To read the access token (in the future)
            // await SecureStore.getItemAsync(`access_demo1234`);

            setAuth({ token: authToken, authed: true });
            const userDto = data.user;

            // populate user on login
            // userActions.populateUser(userDto);
            await analyticsActions.identify(data.user.id.toString());
            analyticsActions.trackEvent(AnalyticsEvents.Registered);
            return userDto.message;
        } catch (error) {
            // check if it's an AxiosError
            let message = 'Error registering user';
            if (axios.isAxiosError(error)) {
                isLog(1, `error registering user: ${error.response?.data?.message}`);
                message = error.response?.data?.message ?? message;
            } else {
                isLog(1, `error registering user: ${error}`);
            }
            return message;
        }
    }


    async function login(username, password) {
        const userfrontRes = await Userfront.login({
            method: 'password',
            username,
            password,
            redirect: false,
        });

        isLog(3, `userfront login response: ${userfrontRes}`);
        const authToken = userfrontRes.tokens?.access.value;

        try {
            const resp = await axios.post(Urls.SIGNIN, {}, getRequestHeader(authToken));
            const data = getDataFromResponse(resp);

            isLog(3, `chainfi login response data: ${data}`);
            const user = data['user'];

            setAuth({ token: authToken, authed: true });
            // userActions.populateUser(data, authToken);

            await analyticsActions.identify(user.id.toString());
            analyticsActions.trackEvent(AnalyticsEvents.LoggedIn);
        } catch (error) {
            isLog(1, `error logging in user: ${error}`);
            if (axios.isAxiosError(error)) {
                isLog(1, `error registering user: ${error.response?.data?.message}`);
            } else {
                isLog(1, `error registering user: ${error}`);
            }
        }
    }

    async function logout() {
        // todo: clean up local storage if we need to, call backend to destroy session
        isLog(4, 'LOGOUT');
        await Userfront.logout({ redirect: false });
        setAuth({ token: null, authed: false });
        userActions.removeUser();
        analyticsActions.trackEvent(AnalyticsEvents.LoggedOut);
    }

    return {
        phoneRequest,
        phoneVerify,
        login,
        register,
        logout,
    }
}

export { useAuthActions };
