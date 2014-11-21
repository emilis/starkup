/// requirements ---------------------------------------------------------------

var child_process =     require( "child_process" );
var fs =                require( "fs" );
var mpc =               require( "mpc" );

var parser =            require( "./lib/parser" );
var htmlCompiler =      require( "./lib/compilers/html" );

/// main -----------------------------------------------------------------------

mpc.parseAll( process.argv.slice( 2 )).forEach( testComponent );

/// functions ------------------------------------------------------------------

function testFile( fileName ){
    
    return testComponent( mpc.parseFile( fileName )[0] );
}///


function testComponent( component ){

    try {
        var supCode =       mpc.getPartContent( component, "sup" );
        var htmlCode =      mpc.getPartContent( component, "html" );

        var nodeTree =      parser.parse( supCode );
        var tplFn =         htmlCompiler( nodeTree );

        sameHtml(
            htmlCode,
            tplFn( {} ),
            onCompare
        );

    } catch( e ){
        console.error( component.name, "ERROR", e.message, 'At', e.line+':'+e.column );
    }

    function onCompare( err, result ){

        if ( err || !result ){
            console.error( component.name, "ERROR", err, "\n", JSON.stringify( nodeTree ));
        } else {
            console.log( component.name, "OK" );
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
