import axios from 'axios';
import { WS_URL } from './constant';

const api = axios.create({
  baseURL: WS_URL,
});

export default api; 