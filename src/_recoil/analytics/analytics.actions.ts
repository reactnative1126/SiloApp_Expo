import { AnalyticsEvents } from './analytics.types';

import { analyticsEnabled, mixpanel } from '../../../config';
import { log } from '../../utils/functions';

function useAnalyticsActions() { // It doesn't really use state, but it can still sit here ig
  const enabled = analyticsEnabled();

  const DEFAULT_PROPS = {
    System: 'app-fi',
  };

  async function identify(uid: string) {
    if (enabled) {
      log(`###### identify: ${uid}`, 'info');
      await mixpanel.identify(uid);
    }
  }

  // add another identifier for this player
  function alias(aliasId: string, originalId: string) {
    if (enabled) {
      mixpanel.alias(aliasId, originalId);
    }
  }

  function trackEvent(eventName: string, properties = {}) {
    if (enabled) {
      // mixpanel.track(`app:${object}_${action}`);
      mixpanel.track(eventName, { ...DEFAULT_PROPS, ...properties });
    }
  }

  function trackScreen(page: string, properties = {}) {
    if (enabled) {
      // mixpanel.track(`app:page_${page}`);
      mixpanel.track(AnalyticsEvents.ScreenView, {
        ...DEFAULT_PROPS,
        Page: page,
        ...properties,
      });
    }
  }

  function trackClick(name: string, properties = {}) {
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
