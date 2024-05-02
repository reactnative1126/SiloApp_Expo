import axios from "axios";
import { useSetRecoilState } from "recoil";
import { systemInfoAtom } from "./system.state";
import { getApiUrl } from "../../_util/misc";
import { log } from "../../_util/debug";
import { getDataFromResponse } from "../../_util/requests";
import { SystemInfo } from "./system.types";
import { useRequestWrapper } from "../../_util/request-wrapper";
import Toast from 'react-native-toast-message';

export function useSystemActions() {
  const setSystemInfo = useSetRecoilState(systemInfoAtom);
  const requestWrapper = useRequestWrapper();

  const getSystemInfo = async () => {
    try {
      const resp = await axios.get(getApiUrl("/system/info"));

      const systemInfoData = getDataFromResponse(resp) as SystemInfo;
      setSystemInfo(systemInfoData);
    } catch (e) {
      log(`getInfo error: `, e);
    }
  }

  const submitFeedback = async (rating: number, comment: string) => {
    try {
      const data = await requestWrapper.post(`/system/feedback`, { rating, comment }) as { statusCode: number, success: boolean };
      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Feedback Submitted',
          text2: 'Thanks for your feedback!',
          visibilityTime: 3000
        });
      }
      return data;
    } catch (e) {
      log('submit feedback error', e);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: 'Sorry there was a problem with your feedback',
        visibilityTime: 3000
      });
    }
  }

  return {
    getSystemInfo,
    submitFeedback
  }

}
