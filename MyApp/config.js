const configs = {};
//development environgment
configs.development = {
    "name": "development",
    "port": 3000
};
configs.production = {
    "name": "production",
    "port": 8080
};
//get the name from the process env
const envName = typeof ( process.env.NODE_ENV ) == "string" ? process.env.NODE_ENV : "";
//exproted env
const exportedEnv = typeof ( configs[ envName ] ) == "object" ? configs[ envName ] : configs.development;

module.exports = exportedEnv;