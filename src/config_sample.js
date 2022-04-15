let config = {};
let thing = {};
let upload = [];
let download = [];

// build thing
thing.parentHost = 'localhost';
thing.parentPort = '3105';
thing.host = 'xxx.xxx.xxx.xxx';
thing.port = 'xxxx';

// build upload
let numIllum = 10;
for(let i=0; i<numIllum; i++) {
    upload[i] = {};
    upload[i].id = `illum#${i+1}`;
    upload[i].name = `container_illum_${i+1}`;
}

let numCurr = 10;
for(let i=0; i<numCurr; i++) {
    upload[numIllum+i] = {};
    upload[numIllum+i].id = `curr#${i+1}`;
    upload[numIllum+i].name = `container_curr_${i+1}`;
}

// let numLed = 30;
// for(let i=0; i<numLed; i++) {
//     upload[numIllum+numCurr+i] = {};
//     upload[numIllum+numCurr+i].id = `led#${i+1}`;
//     upload[numIllum+numCurr+i].name = `container_led_${i+1}`;
// }

// build download
for(let i=0; i<numLed; i++) {
    download[i] = {};
    download[i].id = upload[numIllum+numCurr+i].id;
    download[i].name = upload[numIllum+numCurr+i].name;
}

config.thing = thing;
config.upload = upload;
config.download = download;

module.exports = config;