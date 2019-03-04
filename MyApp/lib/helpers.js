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

helpers.randomString = function (length){
  var characters = "abcdefghigklmnopqrst1234567890";
  var random = "";
  for (var i = 0; i < length; i++) {
    var index = Math.floor(Math.random()*length);
    random+=characters[index];
  }
  return random.length>0?random:null;
};

module.exports = helpers;
