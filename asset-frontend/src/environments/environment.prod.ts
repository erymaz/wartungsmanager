import urlJoin from 'url-join';

export const environment = {
  production: true,

  assetServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_ASSET || window.location.origin + '/services/asset-manager',
    '/',
  ),
  fileServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_FILE || window.location.origin + '/services/file',
    '/',
  ),
  hubServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_HUB || window.location.origin + '/services/hub',
    '/',
  ),
  userServiceUrl: urlJoin(
    window.env.APP_SERVICE_URL_USER || window.location.origin + '/services/user',
    '/',
  ),
};
