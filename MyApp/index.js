const http = require( "http" );
const https = require( "https" );
const fs = require( "fs" );
const url = require( "url" );
const {
    StringDecoder
} = require( "string_decoder" );
const config = require( "./config" );
const _data = require( "./lib/data" );


const httpSever = http.createServer( function ( req, res ) {
    serverLogic( req, res );
} );
httpSever.listen( config.httpPort, () => {
    console.log( "HTTP server started at port: " + config.httpPort + " in " + config.name + " mode." );
} );

var httpsOptions = {
    "key": fs.readFileSync( "./https/key.pem" ),
    "cert": fs.readFileSync( "./https/cert.pem" ),
};
const httpsSever = https.createServer( httpsOptions, function ( req, res ) {
    serverLogic( req, res );
} );
httpsSever.listen( config.httpsPort, () => {
    console.log( "HTTPS server started at port: " + config.httpsPort + " in " + config.name + " mode." );
} );

const serverLogic = function ( req, res ) {
    var parsedUrl = url.parse( req.url, true );
    // console.log(parsedUrl);
    //method
    var method = req.method.toUpperCase();
    //headers
    var headers = req.headers;
    //path
    var path = parsedUrl.pathname;
    path = path.replace( /^\/+|/g, "" );
    //queries
    var query = req.query;
    //body data
    var data = "";
    const decoder = new StringDecoder( "utf-8" );
    req.on( "data", ( chunk ) => {
        data += decoder.write( chunk );
    } );
    req.on( "end", function () {
        data += decoder.end();
        //build the data object
        var requestData = {
            "method": method,
            "headers": headers,
            "path": path,
            "query": query,
            "data": data,
        };
        //get the handler from Router
        var handler = typeof ( Router[ path ] ) == "undefined" ? Handlers.notFoundHandler : Router[ path ];
        handler( requestData, ( statusCode, payload ) => {
            statusCode = typeof ( statusCode ) == "number" ? statusCode : 500;
            payload = typeof ( payload ) == "object" ? payload : {};
            var data = JSON.stringify( payload );
            res.setHeader( "Content-Type", [ "application/json", "text/json" ] );
            res.setHeader( "Content-Length", Buffer.byteLength( data, "utf-8" ) );
            res.writeHead( statusCode );
            res.end( data );
        } );
    } );
};

//handlers
const Handlers = {};
Handlers.notFoundHandler = function ( data, callback ) {
    callback( 404 );
};
Handlers.pingHandler = function ( data, callback ) {
    callback( 200 );
};
//router
const Router = {
    "ping": Handlers.pingHandler,
};