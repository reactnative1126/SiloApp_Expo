import moment from 'moment';
import { useRecoilState } from 'recoil';

import { transactionsAtom, userAtom } from './user.state';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog } from '@services/functions';
import { useRequestWrapper } from '@services/request-wrapper';


export function useUserActions() {
  const requestWrapper = useRequestWrapper();
  const [user, setUser] = useRecoilState(userAtom);
  const [, setTransactions] = useRecoilState(transactionsAtom);

  // isLog(2, `user info: ${user}`);

  async function getTransactions(token) {
    const data = (await (requestWrapper.get(`${Urls.BASE_URL}/account/transactions/USDC`, {}, token))).account;
    data.transactions.sort((a, b) => (moment(a.createdAt).isAfter(moment(b.createdAt))) ? -1 : 1);
    setTransactions(data);
    return data;
  }

  function changeBalance(delta) {
    if (!user) throw ('You should be logged in.');
    setUser({
      ...user,
      credits: user.credits + delta
    })
  }

  function populateUser(user, token, noTransactions = false) {
    // store user details in localstorage ..?
    // localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    if (!noTransactions) getTransactions(token);
  }

  function removeUser() {
    setUser(null);
  }

  return {
    populateUser,
    removeUser,
    changeBalance,
    getTransactions
  }

}
