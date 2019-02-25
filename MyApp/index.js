const http = require( "http" );
const url = require( "url" );
const {
    StringDecoder
} = require( "string_decoder" );
const config = require( "./config" );

const server = http.createServer( function ( req, res ) {
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
        } )
    } );
} );
server.listen( config.port, () => {
    console.log( "Server started at port: " + config.port + " in " + config.name + "mode." );
} );

//handlers
const Handlers = {};
Handlers.notFoundHandler = function ( data, callback ) {
    callback( 404 );
};
Handlers.testHandler = function ( data, callback ) {
    callback( 200, {
        "data": "Hello world! This is a test!"
    } );
};
//router
const Router = {
    "test": Handlers.testHandler,
};