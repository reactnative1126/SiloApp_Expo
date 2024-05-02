import {LOGGING_ENABLED} from "../config";

// note: this file intentionally .js so we don't get ts errors w/this function

export function log() {
  if (LOGGING_ENABLED) {
    // eslint-disable-next-line prefer-rest-params
    const args = [...arguments];
    for (let i = 0; i < args.length; i += 1) {
      // eslint-disable-next-line no-console
      console.log(args[i]);
    }
  }
}
