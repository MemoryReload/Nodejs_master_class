const configs = {};
//development environgment
configs.development = {
    "name": "development",
    "httpPort": 3000,
    "httpsPort": 8000,
    "shaSecret": "This is a Test!",
    "maxChecks": 5,
    "twillio":{
        "sID":"AC993d1be3feca33d12a8cad6d1aaee2e2",
        "token":"01444ff454c64e1644ab6d227cf27e58",
        "from":"+19522605999",
    },
};
configs.production = {
    "name": "production",
    "httpPort": 80,
    "httpsPort": 443,
    "shaSecret": "This is a Test!",
    "maxChecks": 5,
    "twillio":{
        "sID":"AC993d1be3feca33d12a8cad6d1aaee2e2",
        "token":"01444ff454c64e1644ab6d227cf27e58",
        "from":"+19522605999",
    },
};
//get the name from the process env
const envName = typeof ( process.env.NODE_ENV ) == "string" ? process.env.NODE_ENV : "";
//exproted env
const exportedEnv = typeof ( configs[ envName ] ) == "object" ? configs[ envName ] : configs.development;

module.exports = exportedEnv;