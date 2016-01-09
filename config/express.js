const express = require('express');
const config = require('../config/config');
const compress = require('compression');
const logger = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('node-uuid');

const httpsOnly = config.env !== 'development' && config.env !== 'test';
const source = httpsOnly? ' https:' : '';
const localSources =  httpsOnly? '' : ' http://' + config.ip + ':8080 http://localhost:*';

const securityPolicies = [
    "default-src" + source + " 'self'",
    "frame-src 'self'",
    "media-src 'self'",
    "object-src 'self'",
    "script-src" + source + localSources + " 'self' 'unsafe-inline' 'unsafe-eval'",
    "connect-src" + source + (source != ''? " 'self' wss:" : " ws:" + localSources) + " 'self'",
    "font-src" + source + " 'self'",
    "img-src" + source + " 'self' data:",
    "style-src" + source + localSources + " 'self' 'unsafe-inline'"
].join('; ');

/**
 * @module Express App
 * @param app {*}
 * @param passport {*}
 * @param sessionStore {*}
 */
module.exports = function(app,passport,sessionStore){
	app.set('showStackError',config.stackError);
	app.use(compress({
        filter: function(req,res){
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Set the log level
	if(config.expressLog){
        app.use(logger(config.expressLogLevel));
    }

    app.set('trust proxy', 'loopback');
    app.set('x-powered-by', false);

    app.use(bodyParser.json({limit: '5mb'}));

    // Set whether to prettify HTML
    app.locals.pretty = config.prettyHTML;

    // Set our content policies
    app.use(function(req,res,next){
        res.set({
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': httpsOnly,
            'X-Content-Type-Options': 'nosniff',
            'x-frame-options': 'sameorigin',
            'content-security-policy':  securityPolicies,
            'X-Frame-Options': 'deny'
        });
        next();
    });
};