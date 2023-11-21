import { Mixpanel } from 'mixpanel-react-native';
import Userfront from '@userfront/core';

// import { log } from './app/services/functions';

export enum Env {
  DEV = 'development',
  PROD = 'production',
}

export const ENV = process.env.EXPO_PUBLIC_ENV === 'prod' || process.env.EXPO_PUBLIC_ENV === 'production' ? Env.PROD : Env.DEV;

export const API_URL: string | undefined = process.env.EXPO_PUBLIC_API_URL;
export const USERFRONT_ID: string | undefined = process.env.EXPO_PUBLIC_USERFRONT_ID;
export const LOGGING_ENABLED: boolean = process.env.EXPO_PUBLIC_ENABLE_LOGGING === 'true' ?? false;
export const BUGSNAG_ENABLED: boolean = process.env.EXPO_PUBLIC_ENABLE_BUGSNAG === 'true' ?? false;
export const BUGSNAG_APIKEY: string | undefined = process.env.EXPO_PUBLIC_BUGSNAG_APIKEY;

export function isDev() {
  return ENV == Env.DEV;
}

Userfront.init(USERFRONT_ID as string);

// @ts-ignore
export let mixpanel: Mixpanel = null;

export function analyticsEnabled() {
  return process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true';
}

async function getMixpanel() {
  // log('getMixpanel: ', mixpanel);
  /*
  if (process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true' && !mixpanel) {
    const tracAutomaticEvents = true;
    mixpanel = new Mixpanel(process.env.EXPO_PUBLIC_MIXPANEL_PROJECT_TOKEN as string, tracAutomaticEvents);
    await mixpanel.init(undefined, undefined, process.env.EXPO_PUBLIC_MIXPANEL_URL as string);
    return mixpanel;
  } else {
    throw new Error('Mixpanel not enabled');
  }

   */
}

// todo: later when we put in bug tracking
// if (ENABLE_BUGSNAG) {
//   Bugsnag.start({
//     apiKey: BUGSNAG_APIKEY,
//     plugins: [new BugsnagPluginReact()]
//   });
// }
