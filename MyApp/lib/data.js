let fs = require( "fs" );
const path = require( "path" );

const lib = {};
lib.baseDir = path.join( __dirname, "./../.data/" );
lib.create = function ( data, dir, name, callback ) {
    fs.open( lib.baseDir + dir + "/" + name + ".json", "wx", ( error, fd ) => {
        if ( !error ) {
            fs.writeFile( fd, JSON.stringify( data ), ( error ) => {
                if ( !error ) {
                    fs.close( fd, ( error ) => {
                        if ( !error ) {
                            callback( null );
                        } else {
                            callback( "Error closing new file!" );
                        }
                    } );
                } else {
                    callback( "Error writing to new file!" );
                }
            } );
        } else {
            callback( "Could not create a new file, it may already exsit!" );
        }
    } );
};

lib.read = function ( dir, name, callback ) {
    fs.readFile( lib.baseDir + dir + "/" + name + ".json", "utf-8", ( error, data ) => {
        callback( error, data );
    } );
};

lib.update = function ( data, dir, name, callback ) {
    fs.open( lib.baseDir + dir + "/" + name + ".json", "r+", ( error, fd ) => {
        if ( !error ) {
            fs.ftruncate( fd, ( error ) => {
                if ( !error ) {
                    fs.writeFile( fd, JSON.stringify( data ), ( error ) => {
                        if ( !error ) {
                            fs.close( fd, ( error ) => {
                                if ( !error ) {
                                    callback( null );
                                } else {
                                    callback( "Error closing an existing file!" );
                                }
                            } );
                        } else {
                            callback( "Error writing an existing file!" );
                        }
                    } );
                } else {
                    callback( "Error truncating an exist file!" );
                }
            } );
        } else {
            callback( "Could not update file, it may not exist yet!" );
        }
    } );
};

lib.delete = function ( dir, name, callback ) {
    fs.unlink( lib.baseDir + dir + "/" + name + ".json", ( error ) => {
        callback( error );
    } );
};

module.exports = lib;