import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as Joi from 'joi';

dotenvExpand(dotenv.config());

export const AbstractConfigServiceSchema = Joi.object()
  .keys({
    externalServiceUrl: Joi.string().uri().required(),

    internalTokenSecret: Joi.string().required(),

    apiDocs: Joi.object()
      .required()
      .keys({
        route: Joi.string().regex(/^\/[\w-_/]+[^/]$/),
        enabled: Joi.boolean().required(),
        auth: Joi.object().required().keys({
          enabled: Joi.boolean().required(),
        }),
      })
      .required(),
  })
  .required();

export class AbstractConfigService {
  // Overwritten in extending classes
  externalServiceUrl = '';

  internalTokenSecret = process.env.AUTH_INTERNAL_JWT_SECRET as string;

  apiDocs = {
    route: '/docs',
    // Disable in production environments
    // Everywhere else, disable if and only if APP_APIDOCS_DISABLED is truthy
    enabled:
      process.env.NODE_ENV === 'production'
        ? false
        : process.env.APP_APIDOCS_DISABLED
        ? [1, '1', true, 'true'].includes(process.env.APP_APIDOCS_DISABLED)
          ? false
          : true
        : true,
    auth: {
      // During developement, enable
      // Everywhere else, enable if and only if APP_APIDOCS_AUTH_DISABLED is truthy
      enabled:
        process.env.NODE_ENV === 'development'
          ? false
          : process.env.APP_APIDOCS_AUTH_DISABLED
          ? [1, '1', true, 'true'].includes(process.env.APP_APIDOCS_AUTH_DISABLED)
            ? false
            : true
          : true,
    },
  };
}

// This line ensures the configuration object matches the defined schema
Joi.assert(
  new AbstractConfigService(),
  AbstractConfigServiceSchema.keys({
    // We allow externalUrl to be an empty string for THIS VALIDATION ONLY
    // because the actual value is defined in the actual services.
    // This does NOT modifiy the schema itself, it only creates a temporary
    // schema for this validation call, where we actuall expect an empty string.
    // Each service will extend AbstractConfigServiceSchema and run validation
    // with it, at which point empty string will be caught.
    externalServiceUrl: Joi.string().allow(''),
    internalTokenSecret: Joi.string().required(),
  }),
  'Invalid abstract configuration',
);
