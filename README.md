[![Dependency status][david-dm-image]][david-dm-url] [![devDependency status][david-dm-dev-image]][david-dm-dev-url] [![optionalDependency Status][david-dm-optional-image]][david-dm-optional-url] 

* [First time install for Development](#first-time-install-for-development)
* [Production Setup](#production-setup)
* [Editing the configuration options](#editing-the-configuration-options)
    * [Development](#development)
    * [Others](#others)
* [Environment Variables](#environment-variables)


# First time install for Development

* Download and install [NodeJS][nodejs] version `5.x` or higher
* Download and install [Python 2.7.3][python] and ensure it's available in the command line
* Download and install [Redis] - [Windows installer][redis-windows]
* Download and install [MySQL]
* Clone the repo
* Follow the [Node Gyp setup guide]
* Run `npm install grunt-cli babel-cli mocha node-gyp -g` from an elevated command runner
* Run `npm install` from the repo base directory
* Run `node start.js` to start the application

# Production Setup
Ensure that when installing OS packages you're getting the latest version from the package's maintainer and not the version as part of the OS's default package repository

* Linux OS
* Download and install [NodeJS][nodejs] version `5.x` or higher
* Download and install the latest [Redis]
* Download and install the latest [MySQL]
    * Create a database and user for the application, make sure to set the appropriate `environment variables`
* Set up a [DataDog] agent on the server
    * Hook up MySQL, and Redis [integrations] if the server is not already hooked up
* Set up a process to start/restart `start.js` found in the application root with the `environment variables` mentioned below
    * Application should start on system boot-up after MySQL and Redis are running
    * Application should be restarted if the process exits unexpectedly
    * Log the application output to a file in the application directory

## Unique server ID
Each server instance needs to have a unique ID for the server it's running on. By default this is a generated GUID, however, you can specify an ID for it to use instead of the generated one by creating a `serverid.txt` file in the root of the application directory containing the ID you'd like it to use to identify itself with. This ID is used in a `server:<id>` tag in all the datadog metrics


# Editing the configuration options

### Development
All development configuration options are controlled from the [config.js] file, which can be overriden locally by copying and renaming the [local] file in `/config` to `local.js`. All environment variables can be ignored.

### Others
Critical non-development configurations such as the database are controlled through the system environment variables and **must be set** otherwise the application will **not** start

**Required variables:**

* NODE_ENV **EXTREMELY IMPORTANT**
* SERVER_ENV
* DB_USER
* DB_PASSWORD
* DB_DATABASE

# Environment Variables
| Name  | Description |
| ------------- | ------------- |
| NODE_ENV | Defaults to `development` for local environment, otherwise set to `production` |
| SERVER_ENV | Configuration to load, defaults to `development` (set to `production` if not a local development environment) |
| PORT | Port to start the application on, defaults to `3000` for `development` or `80` otherwise ***optional*** |
| DB_HOST | Set the HOST for the database to connect to ex: `127.0.0.1` ***optional*** |
| DB_USER | Set the USERNAME for the database ex: `user` |
| DB_PASSWORD | Set the PASSWORD for the database user |
| DB_PORT | Set the PORT for the database, defaults to `3306` ***optional*** |
| DB_DATABASE | Set the DATABASE NAME to connect to ex: `database-name` |
| MOCHA_REPORTER | Used to set the test reporter ***(ONLY USED FOR UNIT TESTS)*** |
| MOCHA_URL | Used to configure the URL to test on ***(ONLY USED FOR UNIT TESTS)*** |
| REDIS_HOST | Redis host, defaults to `localhost` ***optional*** |
| REDIS_PORT | Redis host port, defaults to `6379` ***optional*** |
| NODE_PATH | Path of folder that contains NodeJS install, defaults to `/usr/local/bin/node` ***optional*** |

[nodejs]: http://nodejs.org/
[python]: http://www.python.org/download/releases/2.7.3#download
[config.js]:config/config.js
[local]:config/example.local.js
[Redis]:http://redis.io/
[redis-windows]:https://github.com/MSOpenTech/redis/releases
[DataDog]:https://app.datadoghq.com/
[integrations]:https://app.datadoghq.com/account/settings
[MySQL]:http://www.mysql.com/
[Node Gyp setup guide]:https://github.com/TooTallNate/node-gyp#installation
[david-dm-url]:https://david-dm.org/EnzoMartin/XenForo-Discord-Bot
[david-dm-image]:https://david-dm.org/EnzoMartin/XenForo-Discord-Bot.svg?style=flat-square
[david-dm-dev-url]:https://david-dm.org/EnzoMartin/XenForo-Discord-Bot#info=devDependencies
[david-dm-dev-image]:https://david-dm.org/EnzoMartin/XenForo-Discord-Bot/dev-status.svg?style=flat-square
[david-dm-optional-url]:https://david-dm.org/EnzoMartin/XenForo-Discord-Bot#info=optionalDependencies
[david-dm-optional-image]:https://david-dm.org/EnzoMartin/XenForo-Discord-Bot/optional-status.svg?style=flat-square