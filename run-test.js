/// requirements ---------------------------------------------------------------

var _ =                 require( "lodash" );
var compressor =        require( "easy-compressor" );
var fs =                require( "fs" );
/// var htmlKompressor =    require( "htmlKompressor" );
var mpc =               require( "mpc" );

var nodes =             require( "./nodes" );
var parser =            require( "./parser" );

/// main -----------------------------------------------------------------------

var argv =              process.argv;
var testFile =          argv[2];

try {
    var component =     mpc.parseFile( testFile )[0];
    var supCode =       mpc.getPartContent( component, "sup" );
    var htmlCode =      mpc.getPartContent( component, "html" );

    sameHtml(
        htmlCode,
        makeHtml( parser.parse( supCode )),
        onCompare );

} catch( e ){
    console.error( e.message, 'At', e.line+':'+e.column );
}

function onCompare( err, result ){

    if ( err || !result ){
        console.error( testFile, "ERROR" );
    } else {
        console.log( testFile, "OK" );
    }
}///

/// functions ------------------------------------------------------------------

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

function compressHtml( html ){

    return htmlKompressor( html ).trim();
}///

function makeHtml( snt ){

    return nodesToHtml( snt ); ///getNodeTree( snt ));
}///

/// nodes to html --------------------------------------------------------------

function nodesToHtml( node ){

    if( !node ){
        return "";
    } else if ( typeof( node ) === "string" || node instanceof String ){
        return node;
    } else if ( node instanceof Array ){
        return node.map( nodesToHtml ).join( "" );
    } else if ( node.nodeType === nodes.Element ){
        return getOpenTag( node ) + nodesToHtml( node.children ) + getCloseTag( node );
    } else {
        return node.children.map( nodesToHtml ).join( "" );
    }
}///

function getOpenTag( node ){

    return '<' + node.tagName + '>';
}///

function getCloseTag( node ){

    return '</' + node.tagName + '>';
}///
