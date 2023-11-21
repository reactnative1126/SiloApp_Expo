
import { analyticsEnabled, mixpanel } from '../../../config';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog } from '@services/functions';

import { AnalyticsEvents } from './analytics.types';

function useAnalyticsActions() { // It doesn't really use state, but it can still sit here ig
    const enabled = analyticsEnabled();

    const DEFAULT_PROPS = {
        System: 'app-fi',
    };

    async function identify(uid) {
        if (enabled) {
            isLog(3, `identify: ${uid}`);
            await mixpanel.identify(uid);
        }
    }

    // add another identifier for this player
    function alias(aliasId, originalId) {
        if (enabled) {
            mixpanel.alias(aliasId, originalId);
        }
    }

    function trackEvent(eventName, properties = {}) {
        if (enabled) {
            // mixpanel.track(`app:${object}_${action}`);
            mixpanel.track(eventName, { ...DEFAULT_PROPS, ...properties });
        }
    }

    function trackScreen(page, properties = {}) {
        if (enabled) {
            // mixpanel.track(`app:page_${page}`);
            mixpanel.track(AnalyticsEvents.ScreenView, {
                ...DEFAULT_PROPS,
                Page: page,
                ...properties,
            });
        }
    }

    function trackClick(name, properties = {}) {
        if (enabled) {
            trackEvent(AnalyticsEvents.Click, {
                name,
                ...properties,
            });
        }
    }

    return {
        identify,
        alias,
        trackEvent,
        trackScreen,
        trackClick,
    };
}

export { useAnalyticsActions };
