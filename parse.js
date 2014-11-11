/// requirements ---------------------------------------------------------------

var _ =             require( "lodash" );
var fs =            require( "fs" );
var PEG =           require( "pegjs" );
var YAML =          require( "yamljs" );

/// main -----------------------------------------------------------------------

var argv =          process.argv;
var parser =        PEG.buildParser( fs.readFileSync( argv[2], "utf8" ));

try {
    var ast =           parser.parse( fs.readFileSync( argv[3], "utf8" ));
    console.log( YAML.stringify( ast[0] ));
} catch( e ){
    console.error( e.message, 'At', e.line+':'+e.column );
}
