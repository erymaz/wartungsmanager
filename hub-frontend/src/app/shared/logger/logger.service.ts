import { Injectable, InjectionToken } from '@angular/core';
import * as createLogger from '@elunic/debug-levels';

export const TMP_TOKEN = new InjectionToken<LogService>('foobar');

// Enable our namespace by default, if nothing else has been specified.
// If something has already been specified, we assume the user knows what they're doing.
// The debugLevel will be set to "info" be default.
if (!window.localStorage.getItem('debug')) {
  window.localStorage.setItem('debug', 'app:*');
}

export interface Logger {
  createLogger: (namespace: string) => Logger;

  trace: (...msgs: unknown[]) => void;
  debug: (...msgs: unknown[]) => void;
  info: (...msgs: unknown[]) => void;
  warn: (...msgs: unknown[]) => void;
  error: (...msgs: unknown[]) => void;
  fatal: (...msgs: unknown[]) => void;
}

@Injectable()
export class LogService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger('app');
  }

  createLogger(namespace: string): Logger {
    return this.logger.createLogger(namespace);
  }

  trace(...msgs: unknown[]): void {
    return this.logger.trace(...msgs);
  }
  debug(...msgs: unknown[]): void {
    return this.logger.debug(...msgs);
  }
  info(...msgs: unknown[]): void {
    return this.logger.info(...msgs);
  }
  warn(...msgs: unknown[]): void {
    return this.logger.warn(...msgs);
  }
  error(...msgs: unknown[]): void {
    return this.logger.error(...msgs);
  }
  fatal(...msgs: unknown[]): void {
    return this.logger.fatal(...msgs);
  }
}
