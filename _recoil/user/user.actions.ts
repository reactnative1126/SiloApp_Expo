import { useRecoilState } from "recoil";
import { transactionsAtom, userAtom, contactAtom } from "./user.state";
import { useRequestWrapper } from "../../_util/request-wrapper";
import { log } from "../../_util/debug";
import { UserState, Wallet, Contact } from "./user.types";
import Toast from 'react-native-toast-message';
import moment from "moment";


export function useUserActions() {

  const [user, setUser] = useRecoilState(userAtom);
  const [, setTransactions] = useRecoilState(transactionsAtom);
  const [, setContacts] = useRecoilState(contactAtom);
  const requestWrapper = useRequestWrapper();

  async function getTransactions(token?: string) {
    const data = (await (requestWrapper.get("/account/transactions/USDC", {}, token)) as { account: Wallet }).account as Wallet;
    data.transactions.sort((a, b) => (moment(a.createdAt).isAfter(moment(b.createdAt))) ? -1 : 1);

    setTransactions(data);
    return data;
  }

  function changeBalance(delta: number) {
    if (!user) throw ("You should be logged in.");
    setUser({
      ...user,
      credits: user.credits + delta
    })
  }

  function populateUser(user: UserState | null, token?: string, noTransactions = false) {
    // store user details in localstorage ..?
    // localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    if (!noTransactions) getTransactions(token);
  }

  function removeUser() {
    setUser(null);
  }

  // Contact actions
  const addContact = async (name: string, email: string, walletAddress: string) => {
    try {
      const data = await requestWrapper.post(`/contacts/contact`, { name, email, walletAddress }) as { contacts: Contact[] };
      setContacts(data.contacts);
      Toast.show({
        type: 'success',
        text1: 'Successfuly created.'
      });
      return data;
    }
    catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sorry, failed to create.'
      });

      if (error.response && error.response.data) {
        const errorObject = error.response.data;

        // Use the error object as needed
        return errorObject;
      } else {
        // Handle other types of errors
        log('An error occurred:', error.message);
      }
    }
  }

  const getContacts = async () => {
    try {
      const data = await requestWrapper.get(`/contacts`) as { contacts: Contact[] };
      setContacts(data.contacts);
      return data;
    } catch (error) {
      log('getContacts error', error);
    }
  }

  const delContact = async (contactId: number) => {
    try {
      const data = await requestWrapper.del(`/contacts/contact/${contactId}`) as { contacts: Contact[] };
      if (data) {
        setContacts(data.contacts);
        Toast.show({
          type: 'success',
          text1: 'Successfuly deleted.'
        });
      }
      return data;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Deletion Failed',
        text2: 'Sorry there was a problem with your request.'
      });
      log('delContacts error', error);
    }
  }

  const searchContacts = async (query: string) => {
    try {
      const data = await requestWrapper.post(`/contacts/search`, { query }) as any;
      // log('searchContacts data', data);
      return data;
    } catch (error) {
      log('searchContacts error', error);
    }
  }

  return {
    populateUser,
    removeUser,
    changeBalance,
    getTransactions,
    searchContacts,
    addContact,
    getContacts,
    delContact
  }

}
