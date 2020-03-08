const _data = require("./data");
const helpers = require("./helpers");
const config = require("./config");

const handlers = {};

handlers.notFound = function (data, callback) {
  callback(404);
};

handlers.ping = function (data, callback) {
  callback(200);
};

handlers.users = function (data, callback) {
  var availableMethods = ["GET", "POST", "PUT", "DELETE"];
  if (availableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};

handlers._users.POST = function (data, callback) {
  var payload = data.payload;
  var phone = typeof (data.payload.phone) == "string" && data.payload.phone.trim()
    .length == 11 ? data.payload.phone : false;
  var password = typeof (data.payload.password) == "string" && data.payload.password.trim()
    .length >= 8 ? data.payload.password : false;
  var firstName = typeof (data.payload.firstName) == "string" && data.payload.firstName.trim()
    .length > 0 ? data.payload.firstName : false;
  var lastName = typeof (data.payload.lastName) == "string" && data.payload.lastName.trim()
    .length > 0 ? data.payload.lastName : false;
  var tosAgreement = typeof (data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement;
  if (phone && password && firstName && lastName && tosAgreement) {
    _data.read("users", phone, (error, data) => {
      if (error) {
        var hashedPassword = helpers.hashStr(password);
        var dataToSave = {
          "phone": phone,
          "password": hashedPassword,
          "firstName": firstName,
          "lastName": lastName,
          "tosAgreement": tosAgreement
        };
        _data.create(dataToSave, "users", phone, (erro) => {
          if (!erro) {
            callback(200);
          } else {
            callback(500, {
              "Error": "Could not create the user!"
            });
          }
        });
      } else {
        callback(400, {
          "Error": "A user with this phone number may already exist!"
        });
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required fields!"
    });
  }
};

handlers._users.GET = function ( data, callback ) {
  var phone = typeof(data.query.phone) == "string" && data.query.phone.length == 11 ? data.query.phone :false;
  var token = typeof(data.headers.token) == "string" && data.headers.token.length == 20? data.headers.token:false;
  if (phone && token) {
    handlers._tokens.verify(token, phone, (isTokenValid) => {
      if (isTokenValid) {
        _data.read("users", phone, (error, data) => {
          if (!error) {
            //remove the password, do not show them to the user.
            delete data.password;
            callback(200, data);
          } else {
            callback(404, {
              "Error": "The specified user not found!"
            });
          }
        });
      } else {
        callback(403, {
          "Error": "Token authentication failed!"
        });
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required fields!"
    });
  }
};

handlers._users.PUT = function (data, callback) {
  var phone = typeof (data.payload.phone) == "string" && data.payload.phone.trim()
    .length == 11 ? data.payload.phone : false;
  var password = typeof (data.payload.password) == "string" && data.payload.password.trim()
    .length >= 8 ? data.payload.password : false;
  var firstName = typeof (data.payload.firstName) == "string" && data.payload.firstName.trim()
    .length > 0 ? data.payload.firstName : false;
  var lastName = typeof (data.payload.lastName) == "string" && data.payload.lastName.trim()
    .length > 0 ? data.payload.lastName : false;
  var token = typeof (data.headers.token) == "string" && data.headers.token.length == 20 ? data.headers.token : false;
  if (phone && token && (password || firstName || lastName)) {
    handlers._tokens.verify(token, phone, (isTokenValid) => {
      if (isTokenValid) {
        _data.read("users", phone, (error, data) => {
          if (!error) {
            var newUser = data;
            if (password) {
              newUser.password = helpers.hashStr(password);
            }
            if (firstName) {
              newUser.firstName = firstName;
            }
            if (lastName) {
              newUser.lastName = lastName;
            }
            _data.update(newUser, "users", phone, (error) => {
              if (!error) {
                callback(200);
              } else {
                callback(500, {
                  "Error": "Could not update the user!"
                });
              }
            });
          } else {
            callback(400, {
              "Error": "The specified user not found!"
            });
          }
        });
      } else {
        callback(403, {
          "Error": "Token authentication failed!"
        });
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required filed!"
    });
  }
};

handlers._users.DELETE = function ( data, callback ) {
  var phone = typeof(data.query.phone) == "string" && data.query.phone.length == 11 ? data.query.phone :false;
  var token = typeof(data.headers.token) == "string" && data.headers.token.length == 20? data.headers.token:false;
  if (phone && token) {
    handlers._tokens.verify(token, phone, (isTokenValid) => {
      if (isTokenValid) {
        _data.read("users", phone, (erro, userData) => {
          if (!erro) {
            _data.delete("users", phone, (erro) => {
              if (!erro) {
                //delete the user's checks
                var userChecks = typeof (userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
                var checksToDelete = userChecks.length;
                if (checksToDelete>0) {
                  var checkDeleted = 0;
                  var deletionErrors = false;
                  userChecks.forEach(checkId => {
                    _data.delete("checks",checkId,function (error) {
                      if (error) {
                        deletionErrors = true;
                      }
                      checkDeleted++;
                      if (checkDeleted == checksToDelete) {
                        if (deletionErrors) {
                          callback(500,{"Error":"Errors encoutered while attempting to delete user's checks"});
                        } else {
                          callback(200);
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(500, {
                  "Error": "Could not delete the user!"
                });
              }
            });
          } else {
            callback(400, {
              "Error": "The specified user not found!"
            });
          }
        });
      } else {
        callback(403, {
          "Error": "Token authentication failed!"
        });
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required fields!"
    });
  }
};

handlers.tokens = function (data, callback) {
  var availableMethods = ["GET", "POST", "PUT", "DELETE"];
  if (availableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

handlers._tokens.POST = function (data, callback) {
  var payload = data.payload;
  var phone = typeof (data.payload.phone) == "string" && data.payload.phone.trim()
    .length == 11 ? data.payload.phone : false;
  var password = typeof (data.payload.password) == "string" && data.payload.password.trim()
    .length >= 8 ? data.payload.password : false;
  if (phone && password) {
    _data.read("users", phone, (error, data) => {
      if (!error) {
        if (data.password == helpers.hashStr(password)) {
          var token = {
            "id": helpers.randomString(20),
            "phone": phone,
            "expires": Date.now() + 60 * 60 * 1000,
          };
          _data.create(token, "tokens", token.id, (error) => {
            if (!error) {
              callback(200, token);
            } else {
              callback(501, {
                "Error": "Could not create token for specified user"
              });
            }
          });
        } else {
          callback(403, {
            "Error": "Password not correct"
          });
        }
      } else {
        callback(404, {
          "Error": "The specified user not found!"
        });
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required filed!"
    });
  }
};

handlers._tokens.GET = function (data, callback) {
  var tokenId = typeof (data.query.id) == "string" && data.query.id.trim()
    .length == 20 ? data.query.id : false;
  if (tokenId) {
    _data.read("tokens", tokenId, (error, tokenData) => {
      if (!error) {
        callback(200, tokenData);
      } else {
        callback(404, {
          "Error": "the specified token not found!"
        });
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required filed!"
    });
  }
};

handlers._tokens.PUT = function (data, callback) {
  var tokenId = typeof (data.payload.id) == "string" && data.payload.id.trim()
    .length == 20 ? data.payload.id : false;
  var extend = typeof (data.payload.extend) == "boolean" ? data.payload.extend : false;
  if (tokenId && extend) {
    _data.read("tokens", tokenId, (error, tokenData) => {
      if (!error) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 60 * 60 * 1000;
          _data.update(tokenData, "tokens", tokenId, (error) => {
            if (!error) {
              callback(200);
            } else {
              callback(501, {
                "Error": "Could not extend the specified token!"
              });
            }
          });
        } else {
          callback(400, {
            "Error": "The token has expired, could not extend it!"
          });
        }
      } else {
        callback(404, {
          "Error": "the specified token not found!"
        });
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required filed!"
    });
  }
};

handlers._tokens.DELETE = function (data, callback) {
  var tokenId = typeof (data.query.id) == "string" && data.query.id.trim()
    .length == 20 ? data.query.id : false;
  if (tokenId) {
    _data.read("tokens", tokenId, (error) => {
      if (!error) {
        _data.delete("tokens", tokenId, (error) => {
          if (!error) {
            callback(200);
          } else {
            callback(500, {
              "Error": "Could not delete the specified token!"
            });
          }
        });
      } else {
        callback(404, {
          "Error": "The specified token not found!"
        });
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required filed!"
    });
  }
};

handlers._tokens.verify = function (tokenId, phone, callback) {
  _data.read("tokens", tokenId, (error, tokenData) => {
    if (!error && tokenData) {
      if (phone == tokenData.phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};


handlers.checks = function (data, callback) {
  var availableMethods = ["GET", "POST", "PUT", "DELETE"];
  if (availableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._checks = {};

//Required data: protocol, url, method, successCodes, timeoutSeconds
//Optional data: none
handlers._checks.POST = function (data, callback) {
  //valid inputs
  var protocol = typeof (data.payload.protocol) == "string" && ["http", "https"].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  var url = typeof (data.payload.url) == "string" && data.payload.url.trim().length > 0 ? data.payload.url : false;
  var method = typeof (data.payload.method) == "string" && ["GET", "POST", "PUT", "DELETE"].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  var successCodes = typeof (data.payload.successCodes) == "object" && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  var timeoutSeconds = typeof (data.payload.timeoutSeconds) == "number" && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
  if (protocol && url && method && successCodes && timeoutSeconds) {
    //Get the token from the headers
    var token = typeof (data.headers.token) == "string" ? data.headers.token : false;
    //lookup the user by reading the token
    _data.read("tokens", token, function (erro, tokenData) {
      if (!erro && tokenData) {
        var userPhone = tokenData.phone;
        // lookup the ueser data
        _data.read("users", userPhone, function (erro, userData) {
          if (!erro && userData) {
            var userChecks = typeof (userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
            //verfify
            if (userChecks.length < config.maxChecks) {
              //create id for check
              var checkId = helpers.randomString(20);
              //create the check object, and include the user's phone
              var checkObject = {
                "id": checkId,
                "userPhone": userPhone,
                "protocol": protocol,
                "url": url,
                "method": method,
                "successCodes": successCodes,
                "timeoutSeconds": timeoutSeconds
              };
              //save the object
              _data.create(checkObject, "checks", checkId, function (erro) {
                if (!erro) {
                  //Add checkId to the user's checks 
                  userData.checks = userChecks;
                  userData.checks.push(checkId);
                  //Update user data
                  _data.update(userData, "users", userPhone, function (erro) {
                    if (!erro) {
                      callback(200, checkObject);
                    } else {
                      callback(500, {
                        "Error": "Could not update the user with the new check"
                      });
                    }
                  });
                } else {
                  callback(500, {
                    "Error": "Could not create the new check"
                  });
                }
              });
            } else {
              callback(403, {
                "Error": "The user alreadyahs the maximum number of checks(" + config.maxChecks + ")"
              });
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required inputs, or inputs are invalid"
    });
  }
};

//Required data: id
//Optional data:none
handlers._checks.GET = function (data, callback) {
  var id = typeof (data.query.id) == "string" && data.query.id.length == 20 ? data.query.id : false;
  var token = typeof (data.headers.token) == "string" && data.headers.token.length == 20 ? data.headers.token : false;
  if (id && token) {
    _data.read("checks", id, function (erro, checkData) {
      if (!erro && checkData) {
        handlers._tokens.verify(token, checkData.userPhone, (isTokenValid) => {
          if (isTokenValid) {
            callback(200, checkData);
          } else {
            callback(403, {
              "Error": "Token authentication failed!"
            });
          }
        });
      } else {
        callback(404, {
          "Error": "Check not found!"
        });
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required fields!"
    });
  }
};

//Required data: id
//Optional data: protocol, url, method, successCodes, timeoutSeconds

handlers._checks.PUT = function (data, callback) {
  var id = typeof (data.payload.id) == "string" && data.payload.id.trim()
    .length == 20 ? data.payload.id : false;
  var token = typeof (data.headers.token) == "string" && data.headers.token.length == 20 ? data.headers.token : false;
  //valid inputs
  var protocol = typeof (data.payload.protocol) == "string" && ["http", "https"].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  var url = typeof (data.payload.url) == "string" && data.payload.url.trim().length > 0 ? data.payload.url : false;
  var method = typeof (data.payload.method) == "string" && ["GET", "POST", "PUT", "DELETE"].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  var successCodes = typeof (data.payload.successCodes) == "object" && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  var timeoutSeconds = typeof (data.payload.timeoutSeconds) == "number" && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      _data.read("checks",id,function (error,checkData){
        if (!error && checkData) {
          handlers._tokens.verify(token, checkData.userPhone, (isTokenValid) => {
            if (isTokenValid) {
              //Update the check where necessary
              if (protocol) {
                checkData.protocol = protocol;
              }
              if (url) {
                checkData.url = url;
              }
              if (method) {
                checkData.method = method;
              }
              if (successCodes) {
                checkData.successCodes = successCodes;
              }
              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds;
              }
              _data.update(checkData,"checks",id,function (erorr) {
                if (!error) {
                  callback(200);
                } else {
                  callback(500,{"Error":"could not udpate the check"});
                }
              });
            } else {
              callback(403, {
                "Error": "Token authentication failed!"
              });
            }
          });
        } else {
          callback(400,{"Error":"check Id did not exist"});
        }
      });
    }else{
      callback(400,{"Error":"Missing fields to update"});
    }
  } else {
    callback(400, {
      "Error": "Missing required filed!"
    });
  }
};

//Required data: id
//Optional data: none
handlers._checks.DELETE = function (data,callback) {
  var id = typeof (data.query.id) == "string" && data.query.id.length == 20 ? data.query.id : false;
  var token = typeof (data.headers.token) == "string" && data.headers.token.length == 20 ? data.headers.token : false;
  if (id) {
    _data.read("checks",id,function (error,checkData) {
      if (!error && checkData) {
        handlers._tokens.verify(token, checkData.userPhone, (isTokenValid) => {
          if (isTokenValid) {
                _data.delete("checks", id, (erro) => {
                  if (!erro) {
                    _data.read("users",checkData.userPhone,function (error, userData) {
                      if (!error && userData) {
                        var userChecks = typeof (userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
                        var checkPosition = userChecks.indexOf(id);
                        if (checkPosition>-1) {
                          userChecks.splice(checkPosition,1);
                          _data.update(userData,"users",checkData.userPhone,function (error) {
                            if (!error) {
                              callback(200);
                            } else {
                              callback(500,{"Error": "Could not remove the check on the specified user"});
                            }
                          });
                        } else {
                          callback(500,{"Error":"Could not find the check on the specified user"});
                        }
                      } else {
                        callback(404, {
                          "Error": "Could not find the user who created the check!"
                        });
                      }
                    });
                  } else {
                    callback(500, {
                      "Error": "Could not delete the check!"
                    });
                  }
                });
          } else {
            callback(403, {
              "Error": "Token authentication failed!"
            });
          }
        });
      } else {
        callback(400,{'Error':"The specified check ID does not exist"});
      }
    });
  } else {
    callback(400, {
      "Error": "Missing required filed!"
    });
  }
};

module.exports = handlers;