import WatchdogTimer from 'lib/watchdogTimer';

import AEClient from 'core/aeClient';
import ThingConnector from 'core/thingConnector';

let state = 'init_aeClient';

const initialize = async () => {
    try {
        if(state === 'init_aeClient') {
            state = await AEClient.initialize();
        } else if(state === 'init_thingConnector') {
            state = await ThingConnector.initialize();
        } else if(state === 'start_aeClient') {
            state = await AEClient.start();
        } else if(state === 'start_thingConnector') {
            state = await ThingConnector.start();
        } else if(state === 'ready') {
            console.log('[Thing Adaption Software] : is ready');
            WatchdogTimer.deleteWatchdogTimer('app');
            WatchdogTimer.setWatchdogTimer('aeClient/upload', 1, AEClient.uploadCin);
        }
    } catch (error) {
        console.log(error);
    }
}

exports.restart = async () => {
    console.log("[Thing Adaption Software] : restart");
    state = 'init_aeClient';
    
    await AEClient.restart();
    await ThingConnector.restart();

    if(WatchdogTimer.getWatchdogTimerValue('app')) {
        WatchdogTimer.deleteWatchdogTimer('app');
    }
    if(WatchdogTimer.getWatchdogTimerValue('aeClient/upload')) {
        WatchdogTimer.deleteWatchdogTimer('aeClient/upload');
    }
    WatchdogTimer.setWatchdogTimer('app', 1, initialize);
}

WatchdogTimer.setWatchdogTimer('app', 1, initialize);