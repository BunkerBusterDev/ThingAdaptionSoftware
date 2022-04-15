import Net from 'net';

import Config from 'config';
import App from 'app';

import ContentInstance from 'core/contentInstance';

let aeSocket = null;
let downloadCount = 0;

const onReceive = (data) => {
    let dataArray = data.toString().split('<EOF>');

    if(dataArray.length >= 2) {
        for(let i = 0; i < dataArray.length - 1; i++) {
            let line = dataArray[i];
            let lineToJson = JSON.parse(line.toString());

            if(lineToJson.containerName===undefined || lineToJson.content===undefined) {
                console.log('Received: data format mismatch');
            }
            else {
                if(lineToJson.content==='hello') {
                    console.log(`Received: ${line}`);
                    downloadCount++;
                }
                else {
                    for(let j = 0; j < config.upload.length; j++) {
                        if(config.upload[j].name===lineToJson.containerName) {
                            console.log(`ACK : ${line} <----`);
                            break;
                        }
                    }

                    for(let j = 0; j < config.download.length; j++) {
                        if(config.download[j].name===lineToJson.containerName) {
                            let strjson = JSON.stringify({id: config.download[i].id, content: lineToJson.content});
                            console.log(`${strjson} <----`);
                            break;
                        }
                    }
                }
            }
        }
    }
}

exports.uploadCin = (name) => {
    let cin = null;
    let existData = true;
    if(name !== null && name.includes('container')) {
        cin = ContentInstance.getContentInstance(name);
        if(cin.content === '') {
            existData = false;
        }
    } else {
        const allData = ContentInstance.getContentInstance();
        cin = {containerName: 'all', content: allData};

        for(let i=0; i<cin.content.length; i++) {
            if(cin.content[i].content === '') {
                existData = false;
            }
        }
    }
    console.log(cin);
    if(existData) {
        aeSocket.write(JSON.stringify(cin) + '<EOF>');
    }
}

exports.start = () => {
    return new Promise((resolve, reject) => {
        try {
            aeSocket.connect(Config.thing.parentPort, Config.thing.parentHost, () => {
                console.log('[AEClient] : AE Connect ok');

                downloadCount = 0;
                for(let i = 0; i < Config.download.length; i++) {
                    console.log(`download Connected - ${Config.download[i].name} hello`);
                    let contentInstance = {containerName: Config.download[i].name, content: 'hello'};
                    aeSocket.write(JSON.stringify(contentInstance) + '<EOF>');
                }

                if(downloadCount >= Config.download.length) {
                    resolve('start_thingConnector');
                }
            });
        } catch (error) {
            reject(`[AEClient] : ${error}`);
        }
    });
}

exports.restart = () => {
    return new Promise((resolve, reject) => {
        try {
            if(aeSocket !== null) {
                aeSocket.destroy();
                aeSocket = null;
            }
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

exports.initialize = () => {
    return new Promise((resolve, reject) => {
        aeSocket = new Net.Socket();

        aeSocket.on('data', onReceive);
        aeSocket.on('error', (error) => {
            reject(`[AEClient] : ${error}`)
        });
        aeSocket.on('close', () => {
            reject('[AEClient] : socket close');
            App.restart();
        });

        if(aeSocket) {
            console.log('[AEClient] : init ok');
            resolve('init_thingConnector');
        } else {
            console.log();
            reject('[AEClient] : tas init failed');
        }
    });
}