const crypto = require( "crypto" );
const config = require( "./config" );

const helpers = {};

helpers.parseJsonObject = function ( json ) {
    try {
        var jsonObject = JSON.parse( json );
        return jsonObject;
    } catch ( e ) {
        return false;
    }
};

helpers.hashStr = function ( origin ) {
    var hmac = crypto.createHmac( "sha256", config.shaSecret );
    return hmac.update( origin )
        .digest( "base64" );
};

module.exports = helpers;