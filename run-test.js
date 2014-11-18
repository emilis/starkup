/// requirements ---------------------------------------------------------------

var _ =                 require( "lodash" );
var compressor =        require( "easy-compressor" );
var mpc =               require( "mpc" );

var parser =            require( "./lib/parser" );
var htmlCompiler =      require( "./lib/compilers/html" );

/// main -----------------------------------------------------------------------

var argv =              process.argv;
var testFile =          argv[2];

try {
    var component =     mpc.parseFile( testFile )[0];
    var supCode =       mpc.getPartContent( component, "sup" );
    var htmlCode =      mpc.getPartContent( component, "html" );

    sameHtml(
        htmlCode,
        htmlCompiler( parser.parse( supCode )),
        onCompare.bind( this, testFile )
    );

} catch( e ){
    console.error( e.message, 'At', e.line+':'+e.column );
}


/// functions ------------------------------------------------------------------

function onCompare( testFile, err, result ){

    if ( err || !result ){
        console.error( testFile, "ERROR" );
    } else {
        console.log( testFile, "OK" );
    }
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
                /// console.log( out.join( "\n---\n" ));
                cb( null, out[0] === out[1] );
            }
        }
    }///
}///
