## elunic Monorepo Starter

**NOTE**

Most examples in the subfolders are **partial examples** of the **changes** required
(in most cases) to `typescript-starter` and `angular-starter` to make the monorepo
structure proposed here work. **They do not represent the full file**.

**Intelligent merging** is still required, simply copying the files will most
likely cause issues or overwrite examples, leaving you to wonder why things aren't
working.

One possibility is to clone the monorepo, delete `.git`, re-init Git (`git init`),
commit to your new repo, then copy over fresh copies of `typescript-starter`/`angular-starter` to
the `backend1-service` folder (for example), then use Git to see the changes and
merge intelligently.

**Table of contents**

- [Services/Frontends Integration Instructions](#servicesfrontends-integration-instructions)
  - [Dockershell](#dockershell)
  - [Configuration merging (`package.json`, `tsconfig.json`, etc.)](#configuration-merging-packagejson-tsconfigjson-etc)
    - [Adjust ENV variables](#adjust-env-variables)
      - [`typescript-starter`](#typescript-starter)
      - [`angular-starter`](#angular-starter)
  - [Common packages](#common-packages)
  - [Common types, classes, functions etc.](#common-types-classes-functions-etc)
  - [GitLab CI config](#gitlab-ci-config)
  - [Delete unnecessary files](#delete-unnecessary-files)
  - [Multiple databases](#multiple-databases)
- [Quickstart](#quickstart)
- [Docker shell](#docker-shell)

# Services/Frontends Integration Instructions

**Note** this section should be removed after services have been integrated,
since it probably shouldn't be visible to the customer.

Services and Frontends should each be placed in a separate subfolder. Examples
for this have been provided as

- `backend1-service`
- `backend2-service`
- `frontend`

It is absolutely possible to have more than one frontend.

This structure is mainly meant to integrate `typescript-starter` and
`angular-starter` in sub-folders, but it's not limited to it.

## Dockershell

Only **one** Dockershell should be used: the one in the project root. Running
one Dockershell per subfolder/-service is not practical (exceptions may apply in
special cases.)

**Important** the notes on ENV variables below:

It is **highly** recommended to use the Dockershell ENVs to set such variables as
`APP_PORT_*` and `APP_SERVICE_URL_*` in a central place, so as not to
have to set them in every service and keep them in sync (imagine having to configure
a service port multiple times in 6 other services, for example).

See the examples in `docker-compose.shell.yml` concerning this.

## Configuration merging (`package.json`, `tsconfig.json`, etc.)

The examples provided for `package.json`, `tsconfig.json` etc. in the example subfolders
are **PARTIAL EXAMPLES**. They showcase the bits that have to be added to make
available:

- `@lib/` functionality
- functional `Dockerfiles` that use the `_lib/` folder
- `dependencies` and `devDependencies` that have to be included in the specific
  service's or frontend's `package.json` **even if** they are present in the
  root `package.json`, such as `module-alias` or `typescript`.

Merging **must** be done intelligently while and after copying over the files
from (for example) `typescript-starter` or `angular-starter`.

It is **highly** recommended to follow the "single source of truth" pattern: all
configuration "setting", meaning reading settings from ENV and switching based
on environments, should be done in one file only, then made available as an object/service
to other consumers/services.

### Adjust ENV variables

#### `typescript-starter`

In `typescript-starter`, adjust the `config.service.ts` so that potentially conflicting
configuration options can be adjusted per-service, especially for the Dockershell:

- the `APP_PORT_` configuration
- the `APP_DB_` configuration (note: this it not always required, mostly if one
  or more services require their own database)
- the `APP_SERVICE_URL_` configuration

See `backend1-service/src/config/config.service.ts` and `backend2-service/src/config/config.service.ts`
for an example, as well as the port-overriding examples in `docker-compose.shell.yml`.

#### `angular-starter`

For `angular-starter`, the main concern is making the `APP_SERVICE_URL_*` ENVs
available. This is done in the files:

- `frontend/src/assets/env.template.js`
- `frontend/src/environments/environment.*.ts`
- `frontend/custom-webpack.config.js`

## Common packages

`npm` packages used by multiple services/frontends **must** be placed
in the **root** `package.json` and **removed** from the services' and frontends'
`package.json`.

Otherwise, problems will almost certainly arise if some method used in `_lib/` makes
use of those packages and different versions are available for the `npm` module
resolution mechanism. `joi` is a very good example because it checks for the schema
versions, but expect to run into trouble with `instanceof` checks if you don't
adhere to this rule.

## Common types, classes, functions etc.

Any common elements should be placed in the apropriate folder in `_lib/`.

Be careful about chosing the correct folder to make sure that (for example) frontends
don't include backend-only `node_modules` and vice-versa.

_This directly affects the size of frontend bundles and backend images._

So:

- `_lib/common/` is for elements such as interfaces and functions that don't depend
  on anything else (or only on modules that SHOULD be included in both, such as `lodash`)
- `_lib/backend/` is for backend-only shared code
- `_lib/frontend/` is for frontend-only shared code (if you have more than one frontend)
- `_lib/nestjs/` is for NestJS-specific backend-only shared code (if you have multiple
  backends and only some of them are NestJS-based)
- Etc. (add your own if required)

## GitLab CI config

`.gitlab-ci.yml` (root) must be adjusted to encompass all services that you want tested/
built/pushed/deployed.

## Delete unnecessary files

Depending on which (if any) "starter" was copied into the subfolders, unnecessary files
may have to be deleted if they cover functionality now handled on the root level.

This example assumes `typescript-starter` or `angular-starter` was used:

- `backend1-service/`
  - ~~`/_fixtures/dockershell/`~~
  - ~~`.commitlintrc.json`~~
  - ~~`.gitlab-ci.yml`~~
  - ~~`.huskyrc.json`~~
  - ~~`docker-compose.shell.yml`~~
- `frontend/`
  - ~~`/_fixtures/dockershell/`~~
  - ~~`.commitlintrc.json`~~
  - ~~`.gitlab-ci.yml`~~
  - ~~`.huskyrc.json`~~
  - ~~`docker-compose.shell.yml`~~

## Multiple databases

If some services require a separate database, follow the examples in `docker-compose.shell.yml`
and set the appropriate ENV variables. This assumes you followed the best practices
for ENVs and centralized configuration laid out above.

# Quickstart

- `npm run shell`
  - Drop into the Dockershell
- `npm run ia`
  - Run `npm i` in the root (libs) and all services
- `npm run dev`
  - Run `dev` mode for all services

# Docker shell

All development should take place inside this Docker-based shell
to ensure dependencies and versions are the same everywhere.

```shell
$ npm run shell
```

You can join an existing shell by running:

```shell
$ npm run shell:join
```
