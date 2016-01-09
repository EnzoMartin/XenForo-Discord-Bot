const Stats = require('./datadog');
const NanoTimer = require('nanotimer');
const pid = process.pid;

/**
 * Report a timer to datadog
 * @param name String
 * @param timer {*}
 * @param [tags] [*]
 */
function reportTime(name,timer,tags){
    tags = tags || [];
    var elapsed = process.hrtime(timer);
    var time = elapsed[0] * 1000 + elapsed[1] / 1000000;
    Stats.timing(name, time,tags);
}

var reportSessions = function(){};

/**
 * Change the reportSession function to report the socket sessions once it's ready
 */
var startReportingSockets = function(){
    reportSessions = function(){

    }
};

/**
 * Reports the CPU and memory consumption of the application
 */
var reportResources = function(){
    try {
        var usage = require('usage');
        usage.lookup(pid, {keepHistory:false}, function(err, result) {
            var memory = process.memoryUsage();
            Stats.gauge('cec.heapused_mb', Math.floor(memory.heapUsed / 1048576));
            Stats.gauge('cec.heaptotal_mb', Math.floor(memory.heapTotal / 1048576));
            Stats.gauge('cec.cpu', result.cpu);
            Stats.gauge('cec.memory_used', Math.floor(result.memory / 1048576));
        });
    } catch (e){
        reportResources = function(){};
    }
};

/**
 * Start the timer loop that runs every 1 second to report stats to datadog
 */
function startReporting(){
    var timer = new NanoTimer();

    timer.setInterval(function(){
        reportResources();
        reportSessions();
    }, '', '1s');
}

// Enhance datadog with reportTime
Stats.reportTime = reportTime;

module.exports = {
    reportResources,
    startReporting,
    startReportingSockets,
    reportSessions,
    reportTime
};