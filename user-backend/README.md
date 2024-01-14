# user-backend
Based on https://gitlab.elunic.software/dev/typescript-starter @2.2.1

# Quickstart

##init
* `npm run shell:build` - required for first start
* `npm run shell` - jump into the docker shell
* `npm i`
* `npm run migration:run` - init db schema
* `npm run seed:dev` - create user admin // admin

_Note_: admin/admin is login/password that can be changed in .env file:
<ul>
  <li>SEED_ADMIN_USERNAME=admin</li>
  <li>SEED_ADMIN_EMAIL=admin@admin.com</li>
  <li>SEED_ADMIN_PASSWORD=admin</li>
</ul>

* `npm run seed:prod` - create user admin // (random password that needs to be changed!!!)

_Note_: only login is able to be changed in .env file:
<ul>
  <li>SEED_ADMIN_USERNAME=admin</li>
  <li>SEED_ADMIN_EMAIL=admin@admin.com</li>
</ul>


##start
* `npm run shell` - jump into the docker shell
* `npm run dev`
* [http://localhost:4070/swagger](http://localhost:4070/swagger)
* login with `admin // admin`

# Help

## Development
* `npm run shell:join`: join the shell with a separate console window
* `npm run migration:run`: update db schema
* `npm run fix`: run linting and formatting checks and fix errors automatically, where possible
* `npm run test`: run tests in watch mode
* `.env` The configuration mechanism will use a `.env` file placed in the project root,
         if it exists.
* phpMyAdmin: [http://localhost:8079](http://localhost:8079)
* `npm run generate:internal-keys:dev`: run generating keys for internal auth


_Note_: To use superadmin, developer needs to enable this feature, and then provide login/password using  .env file:
<ul>
  <li>AUTH_SUPERADMIN_ENABLED=true</li>
  <li>AUTH_SUPERADMIN_USERNAME=superadmin@admin.com</li>
  <li>AUTH_SUPERADMIN_PASSWORD=superadmin</li>
</ul>


## known issues
* Docker missing permissions: https://www.digitalocean.com/community/questions/how-to-fix-docker-got-permission-denied-while-trying-to-connect-to-the-docker-daemon-socket
