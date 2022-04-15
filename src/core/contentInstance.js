import Config from 'config';

let contentInstance = [];

for(let i=0; i<Config.upload.length; i++) {
    contentInstance[i] = {}
    contentInstance[i].containerName = Config.upload[i].name;
    contentInstance[i].content = '';
}

exports.getContentInstance = (name) => {
    if(name) {
        for(let i=0; i<contentInstance.length; i++) {
            if(contentInstance[i].containerName===name) {
                return contentInstance[i];
            }
        }
    } else {
        return contentInstance;
    }
};

exports.setContentInstance = (name, content) => {
    for(let i=0; i<contentInstance.length; i++) {
        if(contentInstance[i].containerName===name) {
            contentInstance[i].content = content;
        }
    }
};