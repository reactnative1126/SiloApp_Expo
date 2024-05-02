import { useRecoilState } from 'recoil';
import moment from 'moment';

import {
  defaultUser,
  userAtom,
  contactAtom,
  transactionsAtom,
  notificationsAtom,
  notificationSettingsAtom
} from './user.state';

import {
  UserState,
  Notification,
  GetTransactionResponse,
  GetNotificationsResponse,
  NotificationSettingsResponse,
  ContactsResponse,
  SearchContactsResponse
} from './user.types';

import {
  getApiResponse,
  getApiErrorResponse,
  ApiResponse
} from '../../utils/requests';

import { useRequestWrapper } from '../../utils/request-wrapper';

export function useUserActions() {
  const requestWrapper = useRequestWrapper();
  const [user, setUser] = useRecoilState(userAtom);
  const [, setTransactions] = useRecoilState(transactionsAtom);
  const [, setNotifications] = useRecoilState(notificationsAtom);
  const [, setContacts] = useRecoilState(contactAtom);
  const [, setNotificationSettings] = useRecoilState(notificationSettingsAtom);

  async function getTransactions(token?: string): Promise<ApiResponse<GetTransactionResponse>> {
    try {
      const resp = await requestWrapper.get('/account/transactions/USDC', {}, token);
      const apiResponse = getApiResponse<GetTransactionResponse>(resp, 'There was problem getting transactions.');

      if (apiResponse.success) {
        const { account } = apiResponse.data;
        account.transactions.sort((a, b) => (moment(a.createdAt).isAfter(moment(b.createdAt))) ? -1 : 1);
        setTransactions(account);
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, 'Couldn\'t fetch your transactions.');
    }
  }

  const getNotifications = async (defaultErrorMsg: string): Promise<ApiResponse<GetNotificationsResponse>> => {
    const groups: { [x: string]: Notification[]; } = {};
    try {
      const resp = await requestWrapper.get('/user/notifications');
      const apiResponse = getApiResponse<GetNotificationsResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const { notifications } = apiResponse.data;
        notifications.sort((a, b) => (moment(a.createdAt).isAfter(moment(b.createdAt))) ? -1 : 1);
        notifications.forEach((item: Notification) => {
          const date = new Date(item.createdAt).toISOString().split('T')[0];
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(item);
        });
        setNotifications(groups);
      }
      return apiResponse; // groups;
    } catch (error: any) {
      return getApiErrorResponse(error, 'Couldn\'t fetch your notifications.');
    }
  }

  const getNotificationSettings = async (defaultErrorMsg: string): Promise<ApiResponse<NotificationSettingsResponse>> => {
    try {
      const resp = await requestWrapper.get(`/user/notification-settings`);
      const apiResponse = getApiResponse<NotificationSettingsResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const { settings } = apiResponse.data;
        setNotificationSettings(settings);
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, 'Couldn\'t fetch notification settings.');
    }
  }

  const changeNotificationSettings = async (email: boolean, push: boolean, defaultErrorMsg: string): Promise<ApiResponse<NotificationSettingsResponse>> => {
    try {
      const resp = await requestWrapper.put(`/user/notification-settings`, { email, push });
      const apiResponse = getApiResponse<NotificationSettingsResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const { settings } = apiResponse.data;
        setNotificationSettings(settings);
      }
      return apiResponse;
    } catch (error: any) {
      return getApiErrorResponse(error, 'Couldn\'t set notification settings.');
    }
  }

  // Contact actions
  const addContact = async (name: string, email: string, walletAddress: string, defaultErrorMsg: string): Promise<ApiResponse<ContactsResponse>> => {
    try {
      const resp = await requestWrapper.post(`/contacts/contact`, { name, email, walletAddress });
      const apiResponse = getApiResponse<ContactsResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const { contacts } = apiResponse.data;
        setContacts(contacts);
      }
      return apiResponse;
    } catch (error: any) {
      return getApiErrorResponse(error, 'Couldn\'t add contact.');
    }
  }

  const getContacts = async (defaultErrorMsg: string): Promise<ApiResponse<ContactsResponse>> => {
    try {
      const resp = await requestWrapper.get(`/contacts`);
      const apiResponse = getApiResponse<ContactsResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const { contacts } = apiResponse.data;
        setContacts(contacts);
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, 'Couldn\'t fetch contacts.');
    }
  }

  const delContact = async (contactId: number, defaultErrorMsg: string): Promise<ApiResponse<ContactsResponse>> => {
    try {
      const resp = await requestWrapper.del(`/contacts/contact/${contactId}`);
      const apiResponse = getApiResponse<ContactsResponse>(resp, defaultErrorMsg);

      if (apiResponse.success) {
        const { contacts } = apiResponse.data;
        setContacts(contacts);
      }
      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, 'Couldn\'t fetch contacts.');
    }
  }

  const searchContacts = async (query: string, defaultErrorMsg: string): Promise<ApiResponse<SearchContactsResponse>> => {
    try {
      const resp = await requestWrapper.post(`/contacts/search`, { query });
      const apiResponse = getApiResponse<SearchContactsResponse>(resp, defaultErrorMsg);

      return apiResponse;
    } catch (error) {
      return getApiErrorResponse(error, 'Couldn\'t search contacts.');
    }
  }

  function changeBalance(delta: number) {
    if (!user) throw ('You should be logged in.');
    setUser({ ...user, credits: user.credits + delta });
  }

  function populateUser(user: UserState, token?: string, noTransactions = false) {
    setUser(user);
    if (!noTransactions) getTransactions(token);
  }

  function removeUser() {
    setUser(defaultUser);
  }

  return {
    getTransactions,
    getNotifications,
    getNotificationSettings,
    changeNotificationSettings,
    addContact,
    getContacts,
    delContact,
    searchContacts,
    populateUser,
    removeUser,
    changeBalance,
  }
}