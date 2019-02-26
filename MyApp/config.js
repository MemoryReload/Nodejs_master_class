const configs = {};
//development environgment
configs.development = {
    "name": "development",
    "httpPort": 3000,
    "httpsPort": 8000,
};
configs.production = {
    "name": "production",
    "httpPort": 80,
    "httpsPort": 443,
};
//get the name from the process env
const envName = typeof ( process.env.NODE_ENV ) == "string" ? process.env.NODE_ENV : "";
//exproted env
const exportedEnv = typeof ( configs[ envName ] ) == "object" ? configs[ envName ] : configs.development;

module.exports = exportedEnv;