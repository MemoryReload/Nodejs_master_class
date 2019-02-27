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

handlers._users.GET = function ( data, callback ) {

};

handlers._users.PUT = function ( data, callback ) {

};
handlers._users.DELETE = function ( data, callback ) {

};


module.exports = handlers;