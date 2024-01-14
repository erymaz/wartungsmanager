import urlJoin from 'url-join';

export const environment = {
  production: true,
  dfAppsSessionCookieName: '__sfapps_session',
  baseFrontendUrl: `${location.origin}`,
  assetServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_ASSET || window.location.origin + '/api/asset-manager',
    '/',
  ),
  fileServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_FILE || window.location.origin + '/api/file',
    '/v1/',
  ),
  hubServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_HUB || window.location.origin + '/api/hub',
    '/',
  ),
  userServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_USER || window.location.origin + '/api/user',
    '/',
  ),
  tenantServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_TENANT || window.location.origin + '/api/tenant',
    '/',
  ),
};
