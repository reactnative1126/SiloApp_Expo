import axios from 'axios';
import { getApiUrl } from '../../utils/functions';

export const getCurrencyList = () => {
    return axios.get(getApiUrl('/system/currencies'));
}