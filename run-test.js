/// requirements ---------------------------------------------------------------

var _ =                 require( "lodash" );
var compressor =        require( "easy-compressor" );
var mpc =               require( "mpc" );

var parser =            require( "./lib/parser" );
var htmlCompiler =      require( "./lib/compilers/html" );

/// main -----------------------------------------------------------------------

process.argv.slice( 2 ).forEach( testFile );

/// functions ------------------------------------------------------------------

function testFile( fileName ){

    try {
        var component =     mpc.parseFile( fileName )[0];
        var supCode =       mpc.getPartContent( component, "sup" );
        var htmlCode =      mpc.getPartContent( component, "html" );

        sameHtml(
            htmlCode,
            htmlCompiler( parser.parse( supCode )),
            onCompare
        );

    } catch( e ){
        console.error( fileName, "ERROR", e.message, 'At', e.line+':'+e.column );
    }

    function onCompare( err, result ){

        if ( err || !result ){
            console.error( fileName, "ERROR", err );
        } else {
            console.log( fileName, "OK" );
        }
    }///
}///


function sameHtml( str1, str2, cb ){

    var out =           [];
    var options = {
        fromString:     true,
        type:           "html",
        "remove-intertag-spaces":   true,
    };

    compressor( str1, _.extend( {}, options ), onCompress );
    compressor( str2, _.extend( {}, options ), onCompress );

    function onCompress( err, result ){

        if( err ){
            out =       [];
            cb( err, null );
        } else {
            out.push( result );
            if( out.length === 2 ){
                console.log( out.join( "\n---\n" ));
                if( out[0] === out[1] ){
                    cb( null, out[0] === out[1] );
                } else {
                    cb( out.join( "\n---\n" ), false );
                }
            }
        }
    }///
}///
