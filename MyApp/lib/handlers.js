const _data = require( "./data" );
const helpers = require( "./helpers" );

const handlers = {};

handlers.notFound = function ( data, callback ) {
    callback( 404 );
};

handlers.ping = function ( data, callback ) {
    callback( 200 );
};

handlers.users = function ( data, callback ) {
    var availableMethods = [ "GET", "POST", "PUT", "DELETE" ];
    if ( availableMethods.indexOf( data.method ) > -1 ) {
        handlers._users[ data.method ]( data, callback );
    } else {
        callback( 405 );
    }
};

handlers._users = {};

handlers._users.POST = function ( data, callback ) {
    var payload = data.payload;
    var phone = typeof ( data.payload.phone ) == "string" && data.payload.phone.trim()
        .length == 11 ? data.payload.phone : false;
    var password = typeof ( data.payload.password ) == "string" && data.payload.password.trim()
        .length >= 8 ? data.payload.password : false;
    var firstName = typeof ( data.payload.firstName ) == "string" && data.payload.firstName.trim()
        .length > 0 ? data.payload.firstName : false;
    var lastName = typeof ( data.payload.lastName ) == "string" && data.payload.lastName.trim()
        .length > 0 ? data.payload.lastName : false;
    var tosAgreement = typeof ( data.payload.tosAgreement ) == "boolean" && data.payload.tosAgreement;
    if ( phone && password && firstName && lastName && tosAgreement ) {
        _data.read( "users", phone, ( error, data ) => {
            if ( error ) {
                var hashedPassword = helpers.hashStr( password );
                var dataToSave = {
                    "phone": phone,
                    "password": hashedPassword,
                    "firstName": firstName,
                    "lastName": lastName,
                    "tosAgreement": tosAgreement
                };
                _data.create( dataToSave, "users", phone, ( erro ) => {
                    if ( !erro ) {
                        callback( 200 );
                    } else {
                        callback( 500, {
                            "Error": "Could not create the user!"
                        } );
                    }
                } );
            } else {
                callback( 400, {
                    "Error": "A user with this phone number may already exist!"
                } );
            }
        } );
    } else {
        callback( 200, {
            "Error": "Missing required fields!"
        } );
    }
};

//TODO: authentication
handlers._users.GET = function ( data, callback ) {
  var phone = typeof(data.query.phone) == "string" && data.query.phone.length == 11 ? data.query.phone :false;
  if (phone) {
    _data.read("users",phone,(error, data) =>{
      if (!error) {
        //remove the password, do not show them to the user.
        delete data.password;
        callback(200, data);
      } else {
        callback(404, {"Error":"The specified user not found!"});
      }
    });
  } else {
    callback(200,{"Error":"Missing required fields!"});
  }
};

//TODO: authentication
handlers._users.PUT = function ( data, callback ) {
  var payload = data.payload;
  var phone = typeof ( data.payload.phone ) == "string" && data.payload.phone.trim()
      .length == 11 ? data.payload.phone : false;
  var password = typeof ( data.payload.password ) == "string" && data.payload.password.trim()
      .length >= 8 ? data.payload.password : false;
  var firstName = typeof ( data.payload.firstName ) == "string" && data.payload.firstName.trim()
      .length > 0 ? data.payload.firstName : false;
  var lastName = typeof ( data.payload.lastName ) == "string" && data.payload.lastName.trim()
      .length > 0 ? data.payload.lastName : false;
      if (phone) {
        _data.read("users",phone,(error,data)=>{
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
            _data.update(newUser,"users",phone,(error)=>{
              if (!error) {
                callback(200);
              } else {
                callback(500,{"Error":"Could not update the user!"});
              }
            });
          } else {
            callback(200,{"Error":"The specified user not found!"});
          }
        });
      } else {
        callback(200,{"Error":"Missing required filed!"});
      }
};

//TODO: authentication
handlers._users.DELETE = function ( data, callback ) {
  var phone = typeof(data.query.phone) == "string" && data.query.phone.length == 11 ? data.query.phone :false;
  if (phone) {
    _data.read("users",data,(erro,data)=>{
      if (!erro) {
        _data.delete("users",phone,(erro)=>{
          if (!erro) {
            callback(200);
          } else {
            callback(500,{"Error":"Could not delete the user!"});
          }
        });
      } else {
        callback(200,{"Error":"The specified user not found!"});
      }
    });
  } else {
    callback(200,{"Error":"Missing required fields!"});
  }
};


module.exports = handlers;
