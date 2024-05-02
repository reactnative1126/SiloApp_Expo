import { useContext } from "react";
import {useUserActions} from "../user/user.actions";
import {useRequestWrapper} from "../../_util/request-wrapper";
import {UserState} from "../user/user.types";

export function useActionsActions() {
  const {populateUser, getTransactions} = useUserActions();
  const requestWrapper = useRequestWrapper();
  // const {notify} = useContext(SnackbarContext);

  const confirmAction = async (actionId: number) => {
    // update user balance
    try {
      const data = ((await requestWrapper.put(`/action/${actionId}/confirm`)) as {user: UserState}).user as UserState;
      setTimeout(getTransactions, 15 * 1000);
      populateUser(data, undefined, true);
    }
    catch (e) {
      // notify(NotifyType.error, (e as Error).message);
    }

  }

  return {
    confirmAction
  }

}
