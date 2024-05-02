import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import en from "./en/index.js";
import es from "./es/index.js";

const translations = {
    en,
    es
};
const i18n = new I18n(translations);

// When a value is missing from a language it'll fall back to another language with the key present.
i18n.enableFallback = true;

// Set the locale once at the beginning of your app.
export const DEFAULT_LOCALE = 'en';
export const DEFAULT_LOCALE_LANG_TAG = 'en-US';

export const defaultLanguage = Localization.getLocales()[0].languageCode || DEFAULT_LOCALE;
export const defaultLanguageTag = Localization.getLocales()[0].languageTag || DEFAULT_LOCALE_LANG_TAG;

i18n.locale = defaultLanguage;

export default i18n;