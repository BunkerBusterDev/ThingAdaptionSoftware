import events from 'events';
let watchdogTimer = new events.EventEmitter();

let watchdogTimerValueQueue = {};
let watchdogTickQueue = {};
let watchdogCallbackQueue = {};
let watchdogParam1Queue = {};
let watchdogParam2Queue = {};
let watchdogParam3Queue = {};

setInterval(() =>  {
    watchdogTimer.emit('watchdog');
}, 1000);

watchdogTimer.on('watchdog', () => {
    for(let id in watchdogTimerValueQueue) {
        // eslint-disable-next-line
        if(watchdogTimerValueQueue.hasOwnProperty(id)) {
            ++watchdogTickQueue[id];
            if((watchdogTickQueue[id] % watchdogTimerValueQueue[id]) === 0) {
                watchdogTickQueue[id] = 0;
                if(watchdogCallbackQueue[id]) {
                    watchdogCallbackQueue[id](id, watchdogParam1Queue[id], watchdogParam2Queue[id], watchdogParam3Queue[id]);
                }
            }
        }
    }
});

exports.setWatchdogTimer = (id, sec, callbackFunc, param1, param2, param3) => {
    watchdogTimerValueQueue[id] = sec;
    watchdogTickQueue[id] = 0;
    watchdogCallbackQueue[id] = callbackFunc;
    watchdogParam1Queue[id] = param1;
    watchdogParam2Queue[id] = param2;
    watchdogParam3Queue[id] = param3;
};

exports.getWatchdogTimerCallback = (id) => {
    return watchdogCallbackQueue[id];
};

exports.getWatchdogTimerValue = (id) => {
    return watchdogTimerValueQueue[id];
};

exports.deleteWatchdogTimer = (id) => {
    delete watchdogTimerValueQueue[id];
    delete watchdogTickQueue[id];
    delete watchdogCallbackQueue[id];
};