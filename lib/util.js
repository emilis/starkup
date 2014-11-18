/// requirements ---------------------------------------------------------------

var _ =                 require( "lodash" );

/// exports --------------------------------------------------------------------

module.exports = {
    str:                str,
};

/// functions ------------------------------------------------------------------

function str( val ){

    if ( val instanceof Array ){
        return _.flatten( val ).join( "" );
    } else if ( typeof( val ) === "string" ){
        return val;
    } else {
        return val && val.toString() || "";
    }
}///

