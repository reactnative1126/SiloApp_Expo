import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

const Mixpanel = require('mixpanel');

const DEFAULT_PROPS = {
  System: 'Stache BE',
};

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  private enabled: boolean;
  private mixpanel;

  constructor(private configService: ConfigService) {
    this.enabled = JSON.parse(configService.get('ENABLE_ANALYTICS'));
    if (this.enabled) {
      const mixPanelProjectToken = configService.get<string>('MIXPANEL_PROJECT_TOKEN');
      this.mixpanel = Mixpanel.init(mixPanelProjectToken);
    }
  }

  public trackEvent(event: string, distinctId: string | number, props = {}) {
    if (this.enabled) {
      let data = {...DEFAULT_PROPS, distinct_id: distinctId};
      if (props) {
        data = {...data, ...props};
      }
      // todo: figure out time thing ..?
      // if (time) {
      //   data['time'] = time.toISOString();
      // }
      this.mixpanel.track(event, data);
    }
  }
}
