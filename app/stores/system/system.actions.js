import axios from 'axios';

import { useSetRecoilState } from 'recoil';

import { systemInfoAtom } from './system.state';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog, getDataFromResponse } from '@services/functions';

export function useSystemActions() {
  const setSystemInfo = useSetRecoilState(systemInfoAtom);

  const getSystemInfo = async () => {
    try {
      const resp = await axios.get(`${Urls.BASE_URL}/system/info`);
      isLog(3, `get SystemInfo response: ${resp.data}`);

      const systemInfoData = getDataFromResponse(resp);
      setSystemInfo(systemInfoData);
    } catch (error) {
      isLog(1, `getInfo error: ${error}`);
    }
  }

  return {
    getSystemInfo
  }
}
