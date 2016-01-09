const config = require('./config');

/**
 * @module Express Router
 * @memberOf App
 * @param app {*}
 */
module.exports = function(app){
    /**
     * API ENDPOINTS
     */

    /**
     * FALLBACK
     */
    if(config.env === 'development'){
        // Pass through to the webpack dev server
        app.use(function(req,res,next){
            console.log('UNCAUGHT API', req.originalUrl);
            next();
        });
    }
};