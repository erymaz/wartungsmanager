// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import urlJoin from 'url-join';

export const environment = {
  production: false,
  dfAppsSessionCookieName: '__sfapps_session',
  baseFrontendUrl: 'http://localhost:8087',
  assetServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_ASSET ||
      window.location.protocol + '//' + window.location.hostname + ':8080',
  ),
  fileServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_FILE ||
      window.location.protocol + '//' + window.location.hostname + ':8081',
    '/v1',
  ),
  hubServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_HUB ||
      window.location.protocol + '//' + window.location.hostname + ':8082',
  ),
  userServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_USER ||
      window.location.protocol + '//' + window.location.hostname + ':8083',
    '/',
  ),
  tenantServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_TENANT ||
      window.location.protocol + '//' + window.location.hostname + ':8084',
    '/',
  ),
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
