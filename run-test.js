/// requirements ---------------------------------------------------------------

var child_process =     require( "child_process" );
var fs =                require( "fs" );
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

        var nodeTree =    parser.parse( supCode );

        sameHtml(
            htmlCode,
            htmlCompiler( nodeTree ),
            onCompare
        );

    } catch( e ){
        console.error( fileName, "ERROR", e.message, 'At', e.line+':'+e.column );
    }

    function onCompare( err, result ){

        if ( err || !result ){
            console.error( fileName, "ERROR", err, "\n", JSON.stringify( nodeTree ));
        } else {
            console.log( fileName, "OK" );
        }
    }///
}///


function sameHtml( str1, str2, cb ){

    var out =           [];

    compressHtml( str1, onCompress );
    compressHtml( str2, onCompress );

    function onCompress( err, result ){

        if( err ){
            out =       [];
            cb( err, null );
        } else {
            out.push( result );
            if( out.length === 2 ){
                /// console.log( out.join( "\n---\n" ));
                if( out[0] === out[1] ){
                    cb( null, out[0] === out[1] );
                } else {
                    cb( "\n" + out.join( "\n---\n" ), false );
                }
            }
        }
    }///
}///


function compressHtml( html, cb ){

    var cmd =   child_process.exec(
        "java -jar lib/htmlcompressor-1.5.3.jar --remove-intertag-spaces",
        { cwd: __dirname },
        onClose );

    cmd.stdin.write( html );
    cmd.stdin.end();

    function onClose( err, output, errOutput ){

        cb( err, output );
    }///
}///
