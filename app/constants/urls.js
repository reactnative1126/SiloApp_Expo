const baseUrl = process.env.EXPO_PUBLIC_API_URL;

export default Urls = {
  BASE_URL: baseUrl,
  SIGNUP: baseUrl + '/auth/register',
  SIGNIN: baseUrl + '/auth/login',
  PHONE_VERIFICATION_REQUEST: baseUrl + '/auth/phone-verification-request',
  PHONE_VERIFICATION: baseUrl + '/auth/phone-verification',
};