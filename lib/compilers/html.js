/// requirements ---------------------------------------------------------------

var nodes =             require( "../nodes" );

/// exports --------------------------------------------------------------------

module.exports =        nodesToHtml;

/// functions ------------------------------------------------------------------

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
