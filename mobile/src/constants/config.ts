import { Platform } from 'react-native';

// iOS Simulator uses localhost. 
// Android Emulator requires 10.0.2.2 to point to your computer's localhost.
const BASE_URL = 'http://172.20.10.2:5000/api';

export const config = {
  API_URL: BASE_URL,
};