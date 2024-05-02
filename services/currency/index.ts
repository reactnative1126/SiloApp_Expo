import { getApiUrl } from "../../_util/misc";
import axios from "axios";

export const getCurrencyList = () => {
    return axios.get(getApiUrl('/system/currencies'));
}