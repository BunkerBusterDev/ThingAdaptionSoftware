import Dgram from 'dgram';

import Config from 'config';
import Sleep from 'lib/sleep';
import WatchdogTimer from 'lib/watchdogTimer';

import AEClient from 'core/aeClient';
import ContentInstance from 'core/contentInstance';

let state = '';
let udpSocket = null;

let responseData = '';
let joinData = '';

const onMessage = (message) => {
    if(state === 'wait' || state==='connected') {
        responseData = message.toString();
        responseData = responseData.replace('data', '"data"')
        responseData = responseData.replace(/\t/gi, '')
        responseData = responseData.replace(/\r\n/gi, '');

        if(responseData.includes('data')) {
            responseData = responseData.substring(responseData.indexOf('data')-2, responseData.length);
            joinData = responseData;
        } else {
            joinData += responseData;
    
            if(responseData.includes('}]}')) {
                joinData = JSON.parse(joinData.substring(0, joinData.length)).data;
                
                if(state==='connected') {
                    for(let i=0; i<joinData.length; i++) {
                        let name = '';
                        let content = '';
                        if(joinData[i].type === 'illum') {
                            name = `container_illum_${i+1}`;
                            content = joinData[i].illum;
                        } else if(joinData[i].type === 'curr') {
                            name = `container_curr_${i-10+1}`;
                            content = joinData[i].curr;
                        }
                        ContentInstance.setContentInstance(name, content);
                        // AEClient.uploadCin(name);
                    }
                }
            }
        }
    }
}

const Sensing = () => {
    if(state === 'wait' || state==='connected') {
        const message = new Buffer.from('AT+PRINT=SENSOR_DATA\r\n');
        udpSocket.send(message, 0, message.length, Config.thing.port, Config.thing.host, (error) => {
            if(error) {
                state = '';
                console.log(`[thingConnector] : ${error}`);
            }
        });
    }
}

exports.start = () => {
    return new Promise((resolve, reject) => {
        console.log('[thingConnector] : start Sensing');
        WatchdogTimer.setWatchdogTimer('core/thingConnector', 5, Sensing);
        resolve('ready');
    });
}

exports.restart = () => {
    return new Promise((resolve, reject) => {
        try {
            if(udpSocket !== null) {
                udpSocket.close();
                udpSocket = null;
            }
            state = '';
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

exports.initialize = () => {
    return new Promise((resolve, reject) => {
        if(state != 'wait') {
            state = 'wait';
            udpSocket = Dgram.createSocket('udp4');
            udpSocket.on('message', onMessage);
    
            try {
                udpSocket.bind(Config.thing.port);
                Sensing();
    
                Sleep(1000).then(() => {
                    if(responseData!=='') {
                        responseData = '';
    
                        console.log('[thingConnector] : init ok');
                        state = 'connected';
                        resolve('start_aeClient');
                    } else {
                        reject('[thingConnector] : thingConnector init fail');
                        udpSocket.close();
                        state = '';
                    }
                });
            } catch (error) {
                reject(`[thingConnector] : ${error}`)
            }
        }
    });
}