import React, { useContext } from 'react';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { useRequestWrapper } from '@services/request-wrapper';
import { useUserActions } from '@stores/user/user.actions';

export function useActionsActions() {
    const { populateUser, getTransactions } = useUserActions();
    const requestWrapper = useRequestWrapper();

    const confirmAction = async (actionId) => {
        // update user balance
        try {
            const data = ((await requestWrapper.put(`${Urls.BASE_URL}/action/${actionId}/confirm`))).user;
            setTimeout(getTransactions, 15 * 1000);
            populateUser(data, undefined, true);
        }
        catch (error) {
            // notify(NotifyType.error, (e as Error).message);
        }
    }

    return {
        confirmAction
    }

}
