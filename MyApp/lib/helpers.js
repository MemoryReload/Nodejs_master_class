const crypto = require("crypto");
const config = require("./config");
const https = require("https");
const querystring = require('querystring');
const {
  StringDecoder
} = require("string_decoder");

const helpers = {};

helpers.parseJsonObject = function (json) {
  try {
    var jsonObject = JSON.parse(json);
    return jsonObject;
  } catch (e) {
    return false;
  }
};

helpers.hashStr = function (origin) {
  var hmac = crypto.createHmac("sha256", config.shaSecret);
  return hmac.update(origin)
    .digest("base64");
};

helpers.randomString = function (length) {
  var characters = "abcdefghigklmnopqrst1234567890";
  var random = "";
  for (var i = 0; i < length; i++) {
    var index = Math.floor(Math.random() * length);
    random += characters[index];
  }
  return random.length > 0 ? random : null;
};

helpers.sendMessage = function (phone, message, callback) {
  phone = typeof (phone) == "string" && phone.trim().length == 10 ? phone : false;
  message = typeof (message) == "string" && message.trim().length > 0 ? message : false;
  if (phone && message) {
    var body = {
      "Body": message,
      "To": "+1" + phone,
      "From": config.twillio.from,
      "ForceDelivery": true
    };
    var bodyStr = querystring.stringify(body);
    var req = https.request({
      "auth": config.twillio.sID + ":" + config.twillio.token,
      "host": "api.twilio.com",
      "path": "/2010-04-01/Accounts/" + config.twillio.sID + "/Messages.json",
      "method": 'POST',
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(bodyStr),
      }
    }, (res) => {
      var data = "";
      var decoder = new StringDecoder();
      res.on('data', (chunk) => {
        data += decoder.write(chunk);
      });
      res.on('end', () => {
        data += decoder.end();
        var resObj = JSON.parse(data);
        if (res.statusCode == 200 || res.statusCode == 201) {
          callback(false);
        } else {
          callback(resObj.message);
        }
      });
    });

    req.on('error', (e) => {
      callback(e);
    });
    req.write(bodyStr);
    req.end();
  } else {
    callback("Miss required parameters");
  }
};

module.exports = helpers;