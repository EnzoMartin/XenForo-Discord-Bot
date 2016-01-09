const Log = require('../server-src/modules/logging');
const Models = require('./models');

// Environment specific configs
var configs = {
    development:{
        env: 'development',
        port: 3000,
        isDev: true,
        isProd: false,
        databaseConfig: {
            user: 'root',
            password: 'root',
            database: 'xenforo_criticaledge'
        },
        prettyHTML: true
    },
    test:{
        env: 'test',
        isDev: false,
        isProd: false,
        prettyHTML: true,
        port: process.env.PORT || 8000
    },
    staging:{
        env: 'staging',
        isDev: false,
        isProd: true
    },
    production:{
        env: 'production',
        isDev: false,
        isProd: true,
        port: process.env.PORT || 80,
        datadogMock: false,
        expressLogLevel: 'ACCESS - Routes - :date[web] :remote-addr :method :url :res[Content-Length] :status :response-time'
    }
};

/**
 * Traverse local config file
 * @param config {*}
 * @param localConfig {*}
 */
function configTraverse(config,localConfig){
    var keys = Object.keys(localConfig);
    keys.forEach(function(key){
        var value = localConfig[key];
        if(typeof value !== 'object'){
            config[key] = value;
        } else {
            if(typeof config[key] === 'undefined'){
                config[key] = {};
            }
            configTraverse(config[key],value);
        }
    });
}

// Always load the development config by default
module.exports = new Models.Configuration(configs.development);

/**
 * Load up config for specified environment
 * @param environment String
 * @returns {Object}
 */
module.exports.initialize = function(environment){
    Log.info('system','Config','Setting config');
    var isDev = environment === 'development';
    var config = configs[environment];

    if(!config) {
        Log.die('system','Config','No "' + environment + '" environment configuration exists');
    }

    if(isDev){
        // Load the config overrides for development environment
        var localConfig = false;
        try {
            localConfig = require('./local');
        } catch (err){
            // Ignore
        }

        if(localConfig){
            configTraverse(config,localConfig);
        }
    }

    var configuration = new Models.Configuration(config);

    module.exports = configuration;
    return configuration;
};
