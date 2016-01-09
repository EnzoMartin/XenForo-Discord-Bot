const Moment = require('moment');

/**
 * Invoke console method
 * @param method
 * @param type
 * @param module
 * @param message
 * @param data
 */
function sendLog(method,type,module,message,data){
    if(data){
        console[method](type.toUpperCase() + ' - ' + module + ' - ' + Moment.utc().toDate() + ' - ' + message + ' | ',data);
    } else {
        console[method](type.toUpperCase() + ' - ' + module + ' - ' + Moment.utc().toDate() + ' - ' + message);
    }
}

module.exports = {
    /**
     * Console.log function
     * @param type string system|socket|access
     * @param module string
     * @param message string
     * @param [data] Object|string Additional data to include
     */
    info: function(type,module,message,data){
        sendLog('log',type,module,message,data);
    },

    /**
     * Console.debug function, outputs nothing when not in development environment
     * @param type string system|socket|access
     * @param module string
     * @param message string
     * @param [data] Object|string Additional data to include
     */
    debug: function(type,module,message,data){
        sendLog('log',type,module,message,data);
    },

    /**
     * Console.warn function
     * @param type string system|socket|access
     * @param module string
     * @param message string
     * @param [data] Object|string Additional data to include
     */
    warn: function(type,module,message,data){
        sendLog('warn',type,module,message,data);
    },

    /**
     * Console.error function
     * @param type string system|socket|access
     * @param module string
     * @param message string
     * @param [data] Object|string Additional data to include
     */
    error: function(type,module,message,data){
        sendLog('error',type,module,message,data);
    },

    /**
     * Console.error and throw an exception
     * @param type string system|socket|access
     * @param module string
     * @param message string
     * @param [data] Object|string Additional data to include
     */
    die: function(type,module,message,data){
        sendLog('error',type,module,message,data);
        throw new Error(message);
    }
};

if(process.env.NODE_ENV !== 'development'){
    module.exports.debug = function(){};
}